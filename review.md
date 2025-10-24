# **Senior Staff Engineer Code Review: Marbelle Backend (marbelle + users apps)**

**Reviewer:** Senior Staff Software Engineer (15+ years Python/Django experience)
**Date:** October 23, 2025
**Scope:** Backend - `marbelle` project configuration and `users` app
**Overall Assessment:** Well-structured codebase with good security practices, but several critical issues need immediate attention before production deployment.

---

## **1. Security Vulnerabilities**

### **MEDIUM: Broad Exception Catching Masks Security Issues**

**Location:** `marbelle/backend/users/views.py:99`

```python
except Exception:
    return Response({"success": False, "message": "Logout failed."}, status=status.HTTP_400_BAD_REQUEST)
```

**Issue:** Catching all exceptions silently can hide JWT blacklist failures, database errors, or security issues. You won't know if token blacklisting is actually working.

**Impact:** Failed logout attempts (token not blacklisted) go unnoticed, allowing revoked tokens to remain valid.

**Fix:**

```python
import logging
logger = logging.getLogger(__name__)

except Exception as e:
    logger.error(f"Logout failed for user {request.user.id}: {str(e)}")
    return Response({"success": False, "message": "Logout failed."}, status=status.HTTP_400_BAD_REQUEST)
```

---

## **2. Performance Bottlenecks**

### **HIGH: N+1 Query Problem in Address Save**

**Location:** `marbelle/backend/users/models.py:225-234`

```python
def save(self, *args: Any, **kwargs: Any):
    # Ensure only one primary address per user
    if self.is_primary:
        Address.objects.filter(user=self.user, is_primary=True).update(is_primary=False)

    # If this is the user's first address, make it primary
    if not self.pk and not Address.objects.filter(user=self.user).exists():
        self.is_primary = True

    super().save(*args, **kwargs)
```

**Issue:** This creates 2-3 database queries on every save:

1. Query to update other primary addresses
2. Query to check if user has addresses
3. The actual save operation

For users with many addresses, this becomes increasingly inefficient.

**Impact:** Slower address operations, increased database load.

**Fix:**

```python
def save(self, *args: Any, **kwargs: Any):
    # Ensure only one primary address per user
    if self.is_primary:
        # Exclude current instance to avoid unnecessary updates
        Address.objects.filter(user=self.user, is_primary=True).exclude(pk=self.pk).update(is_primary=False)

    # If this is the user's first address, make it primary (only for new addresses)
    if not self.pk:
        # Use exists() which is more efficient than count()
        has_addresses = Address.objects.filter(user=self.user).exists()
        if not has_addresses:
            self.is_primary = True

    super().save(*args, **kwargs)
```

---

### **MEDIUM: Missing select_related in AddressViewSet**

**Location:** `marbelle/backend/users/views.py:481`

```python
return Address.objects.filter(user=self.request.user).order_by("-is_primary", "created_at")
```

**Issue:** Every address query will trigger an additional query to fetch the related user object when accessed in serialization or string representation.

**Impact:** N+1 query problem - if a user has 10 addresses, this generates 11 queries instead of 1.

**Fix:**

```python
def get_queryset(self):
    """
    Return addresses for current user only.
    Optimized with select_related to avoid N+1 queries.
    """
    return (
        Address.objects
        .filter(user=self.request.user)
        .select_related('user')  # Avoid N+1 on user data
        .order_by("-is_primary", "created_at")
    )
```

---

### **MEDIUM: Inefficient Token Cleanup Strategy**

**Location:** `marbelle/backend/users/serializers.py:346-347`

```python
# Delete any existing email change tokens for this user
EmailChangeToken.objects.filter(user=user).delete()
```

**Issue:** While this cleans up tokens for the current user, old expired tokens from all users accumulate indefinitely in the database. There's no cleanup mechanism for expired verification/reset/email change tokens.

**Impact:** Database bloat - after 1 year with 10,000 users, you could have 100,000+ expired tokens.

**Fix:** Create a Celery periodic task:

```python
# In users/tasks.py
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import EmailVerificationToken, PasswordResetToken, EmailChangeToken

@shared_task
def cleanup_expired_tokens():
    """Delete expired tokens older than 7 days"""
    cutoff = timezone.now() - timedelta(days=7)

    deleted_verification = EmailVerificationToken.objects.filter(expires_at__lt=cutoff).delete()
    deleted_reset = PasswordResetToken.objects.filter(expires_at__lt=cutoff).delete()
    deleted_email_change = EmailChangeToken.objects.filter(expires_at__lt=cutoff).delete()

    return {
        'verification_tokens': deleted_verification[0],
        'reset_tokens': deleted_reset[0],
        'email_change_tokens': deleted_email_change[0],
    }

# In celery.py or celerybeat schedule
from celery.schedules import crontab

app.conf.beat_schedule = {
    'cleanup-expired-tokens': {
        'task': 'users.tasks.cleanup_expired_tokens',
        'schedule': crontab(hour=2, minute=0),  # Run daily at 2 AM
    },
}
```

## **3. Bugs & Edge Cases**

### **HIGH: Silent Failure in UserProfileSerializer Update**

**Location:** `marbelle/backend/users/serializers.py:199-204`

```python
try:
    instance.save()
except Exception:
    # If there's still a database constraint error (edge case),
    # silently ignore it for security reasons
    pass

return instance
```

**Issue:** This is dangerous. If the save fails for legitimate reasons (database connection lost, disk full, validation error), the user thinks their profile updated but it didn't. This violates data integrity.

**Scenario:** Database connection drops between validation and save. User sees "Profile updated successfully" but their changes are lost.

**Impact:** Data loss, user confusion, potential security issues if critical updates (like email) fail silently.

**Fix:**

```python
from django.db import IntegrityError

try:
    instance.save()
except IntegrityError as e:
    # Only catch email duplication errors for security
    if 'email' in str(e).lower() or 'unique constraint' in str(e).lower():
        # Silently ignore duplicate email for security (prevent enumeration)
        logger.info(f"Duplicate email update attempt for user {instance.id}")
    else:
        # Re-raise other integrity errors
        logger.error(f"Profile update integrity error for user {instance.id}: {str(e)}")
        raise
except Exception as e:
    # Log and re-raise unexpected errors
    logger.error(f"Profile update failed for user {instance.id}: {str(e)}")
    raise

return instance
```

---

### **MEDIUM: Unhandled Edge Case in Token Validation**

**Location:** `marbelle/backend/users/serializers.py:104-111`

```python
def validate_token(self, value: str) -> EmailVerificationToken:
    try:
        verification_token = EmailVerificationToken.objects.get(token=value)
        if not verification_token.is_valid:
            raise serializers.ValidationError("Invalid or expired verification token.")
        return verification_token
    except EmailVerificationToken.DoesNotExist:
        raise serializers.ValidationError("Invalid verification token.")
```

**Issue:** If the user's account is deleted after token creation (CASCADE on foreign key), accessing `verification_token.user` in the view (line 113) will raise `RelatedObjectDoesNotExist` error, not caught by `DoesNotExist`.

**Scenario:**

1. User registers, receives verification email
2. Admin deletes user account from admin panel
3. User clicks verification link
4. Token exists but `token.user` raises `RelatedObjectDoesNotExist`

**Impact:** 500 Internal Server Error instead of graceful "Invalid token" message.

**Fix:**

```python
def validate_token(self, value: str) -> EmailVerificationToken:
    try:
        verification_token = EmailVerificationToken.objects.select_related('user').get(token=value)

        # Check if token is valid
        if not verification_token.is_valid:
            raise serializers.ValidationError("Invalid or expired verification token.")

        # Check if user still exists and is not already active
        if not hasattr(verification_token, 'user') or verification_token.user is None:
            raise serializers.ValidationError("Invalid verification token.")

        return verification_token
    except (EmailVerificationToken.DoesNotExist, User.DoesNotExist):
        raise serializers.ValidationError("Invalid verification token.")
```

---

### **LOW: Phone Validation Regex Too Permissive**

**Location:** `marbelle/backend/users/models.py:27-29`

```python
phone_regex = RegexValidator(
    regex=r"^\+?1?\d{9,15}$",
    message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.",
)
```

**Issue:** This accepts invalid phone numbers:

-   `+1111111111` (all 1s)
-   `+1234567890` (too short for real international numbers)
-   Only handles country code `1` (US/Canada), but message suggests it's international

**Impact:** Invalid phone numbers stored in database, failed contact attempts.

**Recommendation:** Use the `phonenumbers` library for proper international validation:

```python
# In requirements.txt
phonenumbers==8.13.27

# In models.py or validators.py
from phonenumbers import parse, is_valid_number, NumberParseException
from django.core.exceptions import ValidationError

def validate_phone_number(value):
    """Validate international phone numbers using phonenumbers library."""
    if not value:  # Allow blank if field allows it
        return

    try:
        phone_number = parse(value, None)  # Auto-detect country
        if not is_valid_number(phone_number):
            raise ValidationError("Invalid phone number for the specified country.")
    except NumberParseException:
        raise ValidationError(
            "Invalid phone number format. Please use international format (e.g., +1234567890)."
        )

# In models
phone = models.CharField(
    validators=[validate_phone_number],
    max_length=20,
    blank=True,
    null=True,
)
```

## **4. Maintainability & Readability (Code Smells)**

TODOO ->

### **MEDIUM: Inconsistent Response Format**

**Location:** `marbelle/backend/users/views.py`

**Issue:** Some endpoints return `{"success": True, "data": {"addresses": [...]}}` while others return `{"success": True, "data": serializer.data}`. The wrapping of data in an extra object is inconsistent.

**Examples:**

-   Line 526: `{"success": True, "data": {"addresses": serializer.data}}` ← Extra wrapper
-   Line 429: `{"success": True, "data": serializer.data}` ← Direct data
-   Line 77: `{"success": True, "message": "Login successful.", "data": token_data}` ← Direct data

**Impact:** Frontend developers must handle different response structures for similar endpoints.

**Fix:** Standardize on one format across all endpoints:

```python
# RECOMMENDED FORMAT
# For lists - data is a list directly
{
    "success": true,
    "message": "Addresses retrieved successfully.",
    "data": [
        {"id": 1, "label": "Home", ...},
        {"id": 2, "label": "Office", ...}
    ]
}

# For single objects - data is an object directly
{
    "success": true,
    "message": "Address created successfully.",
    "data": {"id": 1, "label": "Home", ...}
}

# Update AddressViewSet.list()
def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
    queryset = self.get_queryset()
    serializer = self.get_serializer(queryset, many=True)
    return Response(
        {
            "success": True,
            "message": "Addresses retrieved successfully.",
            "data": serializer.data  # Direct list, not wrapped
        },
        status=status.HTTP_200_OK,
    )
```

---

### **MEDIUM: Violation of Single Responsibility Principle**

**Location:** `marbelle/backend/users/views.py:250-410`

**Issue:** Four email helper functions (`send_verification_email`, `send_password_reset_email`, `send_email_change_verification`, `send_email_change_notification`) are mixed with view functions in the same file. This violates separation of concerns:

-   Views should handle HTTP requests/responses
-   Email logic should be separate
-   Makes testing harder (can't test email sending without importing views)

**Impact:**

-   Hard to test email sending in isolation
-   Views file is 582 lines (too long)
-   Violates Single Responsibility Principle

**Fix:** Create a dedicated email service:

```python
# users/services/email_service.py
from typing import Dict, Any
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """Service for sending user-related emails."""

    @staticmethod
    def send_verification_email(user: User, token: str) -> bool:
        """
        Send email verification email.

        Args:
            user: User instance
            token: Verification token

        Returns:
            bool: True if sent successfully, False otherwise
        """
        try:
            subject = "Verify your Marbelle account"
            verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

            html_message = render_to_string(
                "users/email_verification.html",
                {"user": user, "verification_url": verification_url},
            )
            plain_message = strip_tags(html_message)

            send_mail(
                subject=subject,
                message=plain_message,
                html_message=html_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

            logger.info(f"Verification email sent to {user.email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send verification email to {user.email}: {str(e)}")
            return False

    @staticmethod
    def send_password_reset_email(user: User, token: str) -> bool:
        """Send password reset email."""
        # Similar implementation
        ...

    @staticmethod
    def send_email_change_verification(user: User, new_email: str, token: str) -> bool:
        """Send email change verification to new email address."""
        ...

    @staticmethod
    def send_email_change_notification(user: User, old_email: str, new_email: str) -> bool:
        """Send security notification to old email address."""
        ...

# In views.py
from .services.email_service import EmailService

@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate="5/m", method="POST")
def register_user(request: Request) -> Response:
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        verification_token = EmailVerificationToken.objects.create(user=user)

        # Use service instead of local function
        EmailService.send_verification_email(user, verification_token.token)

        return Response(...)
```

---

### **LOW: Duplicated Phone Regex Definition**

**Location:** `marbelle/backend/users/models.py:27-36` and `207-216`

**Issue:** The exact same `phone_regex` validator is defined twice:

-   In `User` model (lines 27-36)
-   In `Address` model (lines 207-216)

This violates DRY principle.

**Impact:** If you need to change phone validation, you must update it in two places.

**Fix:**

```python
# users/validators.py
from django.core.validators import RegexValidator

PHONE_REGEX_VALIDATOR = RegexValidator(
    regex=r"^\+?1?\d{9,15}$",
    message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.",
)

# In models.py
from .validators import PHONE_REGEX_VALIDATOR

class User(AbstractUser):
    phone = models.CharField(
        validators=[PHONE_REGEX_VALIDATOR],
        max_length=20,
        blank=True,
        null=True,
    )

class Address(models.Model):
    phone = models.CharField(
        validators=[PHONE_REGEX_VALIDATOR],
        max_length=20,
        blank=True,
    )
```

## **5. Best Practices & Idiomatic Code**

### **MEDIUM: Missing Logging Throughout**

**Location:** Entire codebase

**Issue:** There's no logging for important security events:

-   Failed login attempts
-   Password reset requests
-   Email change requests
-   Token validation failures
-   Account activations
-   Suspicious activities (multiple failed attempts)

**Impact:**

-   No audit trail for security incidents
-   Difficult to debug production issues
-   Can't detect attack patterns

**Fix:** Add structured logging:

```python
import logging
logger = logging.getLogger(__name__)

# In login_user (views.py)
@api_view(["POST"])
@permission_classes([AllowAny])
@ratelimit(key="ip", rate="5/m", method="POST")
def login_user(request: Request) -> Response:
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data["user"]
        logger.info(
            f"Successful login: user_id={user.id}, email={user.email}, "
            f"ip={request.META.get('REMOTE_ADDR')}"
        )
        token_data = TokenSerializer.get_token_for_user(user)
        return Response(...)

    # Log failed login attempt
    email = request.data.get('email', 'unknown')
    logger.warning(
        f"Failed login attempt: email={email}, "
        f"ip={request.META.get('REMOTE_ADDR')}, "
        f"errors={serializer.errors}"
    )
    return Response(...)

# In verify_email
logger.info(f"Email verified: user_id={user.id}, email={user.email}")

# In request_password_reset
logger.warning(
    f"Password reset requested: email={email}, "
    f"ip={request.META.get('REMOTE_ADDR')}"
)

# In request_email_change
logger.info(
    f"Email change requested: user_id={user.id}, "
    f"old_email={user.email}, new_email={new_email}"
)

# Add to settings/prod.py for production logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s'
        }
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'maxBytes': 1024 * 1024 * 10,  # 10 MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'security': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'security.log',
            'maxBytes': 1024 * 1024 * 10,
            'backupCount': 10,
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'users': {  # Your app logger
            'handlers': ['file', 'security'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.security': {
            'handlers': ['security'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}
```

---

### **LOW: Missing **all** in Models**

**Location:** `marbelle/backend/users/models.py`

**Issue:** When importing from models (`from .models import User`), it's not clear which classes are public API vs internal implementation.

**Impact:** Reduced code clarity, potential import of internal classes.

**Recommendation:**

```python
# At the top of models.py after imports
__all__ = [
    'User',
    'EmailVerificationToken',
    'PasswordResetToken',
    'EmailChangeToken',
    'Address',
]
```

---

## **6. Architectural Alignment**

### **HIGH: Violation of DRY Principle in Token Models**

**Location:** `marbelle/backend/users/models.py:81-184`

**Issue:** `EmailVerificationToken`, `PasswordResetToken`, and `EmailChangeToken` have nearly identical code:

-   Same fields: `user`, `token`, `created_at`, `expires_at`, `is_used`
-   Same `save()` method: token generation, expiry setting
-   Same properties: `is_expired`, `is_valid`
-   Only difference: `EmailChangeToken` has extra `new_email` field

This is ~150 lines of duplicated code.

**Impact:**

-   Changes must be made in 3 places
-   Increased maintenance burden
-   Higher risk of bugs from inconsistent updates

**Fix:** Create an abstract base model:

```python
# users/models.py
import secrets
from datetime import timedelta
from typing import Any

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class AbstractToken(models.Model):
    """
    Abstract base class for all token models.

    Provides common functionality for email verification, password reset,
    and email change tokens.
    """

    user = models.ForeignKey(
        'User',  # Use string reference to avoid circular import
        on_delete=models.CASCADE,
        related_name='%(class)s_tokens',  # Dynamic related_name
    )
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['expires_at']),  # For cleanup queries
            models.Index(fields=['token']),  # For token lookup
            models.Index(fields=['user', 'is_used']),  # For validation
        ]

    def save(self, *args: Any, **kwargs: Any) -> None:
        """Generate token and set expiry if not already set."""
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    @property
    def is_expired(self) -> bool:
        """Check if token has expired."""
        return timezone.now() > self.expires_at

    @property
    def is_valid(self) -> bool:
        """Check if token is valid (not used and not expired)."""
        return not self.is_used and not self.is_expired


class EmailVerificationToken(AbstractToken):
    """Token for email verification during registration."""

    class Meta:
        db_table = "email_verification_tokens"
        verbose_name = "Email Verification Token"
        verbose_name_plural = "Email Verification Tokens"

    def __str__(self) -> str:
        return f"Email verification for {self.user.email}"


class PasswordResetToken(AbstractToken):
    """Token for password reset requests."""

    class Meta:
        db_table = "password_reset_tokens"
        verbose_name = "Password Reset Token"
        verbose_name_plural = "Password Reset Tokens"

    def __str__(self) -> str:
        return f"Password reset for {self.user.email}"


class EmailChangeToken(AbstractToken):
    """Token for email address change confirmation."""

    new_email = models.EmailField(help_text="The requested new email address")

    class Meta:
        db_table = "email_change_tokens"
        verbose_name = "Email Change Token"
        verbose_name_plural = "Email Change Tokens"

    def __str__(self) -> str:
        return f"Email change for {self.user.email} to {self.new_email}"
```

**Benefits:**

-   Reduces code from ~150 lines to ~60 lines
-   Single source of truth for token behavior
-   Changes to token logic only need to be made once
-   Easier to add new token types in the future
-   Better index organization (defined once)

**Migration Required:** Yes, but it's a refactoring that doesn't change the database schema.

---

### **MEDIUM: Mixed Concerns in Serializers**

**Location:** `marbelle/backend/users/serializers.py:182-206`

**Issue:** `UserProfileSerializer.update()` contains business logic (checking for duplicate emails, silently ignoring duplicates) that should be in a service layer, not in serialization.

**Why It Matters:**

-   Serializers should handle data validation and transformation
-   Business logic should be in services or models
-   Makes testing harder (must test through serializer)
-   Violates Single Responsibility Principle

**Better Architecture:**

```python
# users/services/user_service.py
import logging
from typing import Dict, Any
from django.db import IntegrityError
from ..models import User

logger = logging.getLogger(__name__)

class UserService:
    """Service for user-related business logic."""

    @staticmethod
    def update_profile(user: User, validated_data: Dict[str, Any]) -> User:
        """
        Update user profile with email duplication handling.

        Silently ignores email changes if the new email already exists
        to prevent email enumeration attacks.

        Args:
            user: User instance to update
            validated_data: Validated data from serializer

        Returns:
            Updated user instance
        """
        # Check if email is being changed and if it already exists
        if "email" in validated_data and user.email != validated_data["email"]:
            new_email = validated_data["email"]
            if User.objects.filter(email=new_email).exists():
                # Silently ignore the email change for security
                logger.info(
                    f"Duplicate email update attempt: user_id={user.id}, "
                    f"attempted_email={new_email}"
                )
                validated_data.pop("email")

        # Update user attributes
        for attr, value in validated_data.items():
            setattr(user, attr, value)

        try:
            user.save()
        except IntegrityError as e:
            # Edge case: race condition on email
            if 'email' in str(e).lower():
                logger.warning(
                    f"Email integrity error during profile update: "
                    f"user_id={user.id}, error={str(e)}"
                )
            else:
                raise

        return user

# In serializers.py
from .services.user_service import UserService

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile management."""

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "phone", "company_name"]
        extra_kwargs = {
            "email": {"validators": []},  # Remove built-in validators
        }

    def validate_email(self, value: str) -> str:
        """Basic email format validation."""
        return value.strip().lower()

    def update(self, instance: User, validated_data: Dict[str, Any]) -> User:
        """Update user profile using service layer."""
        return UserService.update_profile(instance, validated_data)
```

**Benefits:**

-   Clear separation of concerns
-   Easier to test business logic in isolation
-   Reusable logic across different endpoints
-   Better logging and error handling

---

### **MEDIUM: Missing Repository Pattern for Database Access**

**Location:** Throughout `marbelle/backend/users/views.py`

**Issue:** Database queries are scattered throughout views:

-   Line 156: `user = User.objects.get(email=email, is_active=True)`
-   Line 233: `user = User.objects.get(email=email)`
-   Line 60: `user = User.objects.get(email=email)`
-   Direct ORM access makes testing harder and couples views to Django ORM

**Why It Matters:**

-   Hard to mock database access in tests
-   Can't easily switch ORMs or databases
-   Business logic mixed with data access
-   Makes it harder to add caching layer

**Better Pattern:** Implement repository layer:

```python
# users/repositories/user_repository.py
from typing import Optional, List
from django.db.models import QuerySet
from ..models import User

class UserRepository:
    """Repository for User data access."""

    @staticmethod
    def get_by_email(email: str, active_only: bool = False) -> Optional[User]:
        """
        Get user by email address.

        Args:
            email: User email address
            active_only: Only return active users

        Returns:
            User instance or None if not found
        """
        try:
            query = User.objects
            if active_only:
                query = query.filter(is_active=True)
            return query.get(email=email.lower())
        except User.DoesNotExist:
            return None

    @staticmethod
    def get_by_id(user_id: int) -> Optional[User]:
        """Get user by ID."""
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @staticmethod
    def email_exists(email: str) -> bool:
        """Check if email is already registered."""
        return User.objects.filter(email__iexact=email).exists()

    @staticmethod
    def create_user(email: str, password: str, **kwargs) -> User:
        """Create a new user."""
        return User.objects.create_user(
            username=email,
            email=email,
            password=password,
            **kwargs
        )

# users/repositories/token_repository.py
from typing import Optional
from ..models import EmailVerificationToken, PasswordResetToken

class TokenRepository:
    """Repository for token data access."""

    @staticmethod
    def create_verification_token(user: User) -> EmailVerificationToken:
        """Create email verification token for user."""
        return EmailVerificationToken.objects.create(user=user)

    @staticmethod
    def get_verification_token(token: str) -> Optional[EmailVerificationToken]:
        """Get verification token by token string."""
        try:
            return EmailVerificationToken.objects.select_related('user').get(token=token)
        except EmailVerificationToken.DoesNotExist:
            return None

    @staticmethod
    def create_reset_token(user: User) -> PasswordResetToken:
        """Create password reset token for user."""
        return PasswordResetToken.objects.create(user=user)

# Usage in views.py
from .repositories.user_repository import UserRepository
from .repositories.token_repository import TokenRepository

@api_view(["POST"])
@permission_classes([AllowAny])
def request_password_reset(request: Request) -> Response:
    email = request.data.get("email", "").strip().lower()

    if not email or "@" not in email:
        return Response(...)

    # Use repository instead of direct ORM access
    user = UserRepository.get_by_email(email, active_only=True)

    if user:
        reset_token = TokenRepository.create_reset_token(user)
        EmailService.send_password_reset_email(user, reset_token.token)

    return Response(...)
```

**Benefits:**

-   Easier to test (mock repository instead of ORM)
-   Centralized data access logic
-   Can add caching layer without changing views
-   Better separation of concerns
-   Easier to optimize queries in one place

## **Recommended Action Plan**

### **Phase 1: Critical Fixes (Sprint 1 - This Week)**

**Must be completed before production deployment:**

3. ✅ **Fix silent failure in UserProfileSerializer** (`users/serializers.py:199-204`)

    - Only catch IntegrityError for email duplication
    - Re-raise other exceptions
    - Prevents data loss

### **Phase 2: High Priority (Sprint 2-3 - Next 2 Weeks)**

5. ✅ **Create AbstractToken base class** (`users/models.py`)

    - Reduces 150 lines of duplicated code
    - Single source of truth for token behavior
    - Generate migration after refactoring

6. ✅ **Add select_related to AddressViewSet** (`users/views.py:481`)

    - Prevents N+1 query problem
    - 10x performance improvement for address lists

7. ✅ **Extract email functions to EmailService** (`users/views.py:250-410`)

    - Better separation of concerns
    - Easier testing
    - Cleaner code organization

8. ✅ **Add comprehensive logging** (throughout codebase)
    - Security events (login, password reset, etc.)
    - Failed attempts
    - Audit trail

### **Phase 3: Medium Priority (Sprint 4-5 - Next Month)**

10. ✅ **Implement token cleanup task**

    -   Celery periodic task
    -   Delete expired tokens older than 7 days
    -   Add database index on `expires_at`

11. ✅ **Standardize API response format**

    -   Consistent structure across all endpoints
    -   Better frontend developer experience

12. ✅ **Improve phone validation** (`users/models.py:27`)
    -   Use `phonenumbers` library
    -   Support international numbers

### **Phase 4: Architecture Improvements (Future Sprints)**

15. ⏳ **Implement repository pattern**

    -   Centralized data access
    -   Easier testing
    -   Better separation of concerns

16. ⏳ **Extract business logic to services**

    -   UserService, TokenService
    -   Cleaner architecture
    -   Reusable logic

---

## **Testing Recommendations**

For each fix above, add corresponding tests:

```python
# tests/test_security.py
class SecurityTests(TestCase):
    def test_email_enumeration_prevented(self):
        """Test that invalid emails return generic message"""
        # Implementation

# tests/test_address_race_condition.py
class AddressRaceConditionTests(TestCase):
    def test_concurrent_primary_address_updates(self):
        """Test that only one address can be primary"""
        # Use threading to simulate concurrent requests
        # Implementation

# tests/test_performance.py
class PerformanceTests(TestCase):
    def test_address_list_query_count(self):
        """Test that address list uses single query"""
        with self.assertNumQueries(1):
            response = self.client.get('/api/v1/auth/addresses/')
```
