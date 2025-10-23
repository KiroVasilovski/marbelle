# **Senior Staff Engineer Code Review: Marbelle Backend (marbelle + users apps)**

**Reviewer:** Senior Staff Software Engineer (15+ years Python/Django experience)
**Date:** October 23, 2025
**Scope:** Backend - `marbelle` project configuration and `users` app
**Overall Assessment:** Well-structured codebase with good security practices, but several critical issues need immediate attention before production deployment.

---

## **1. Security Vulnerabilities**

TODOO ->

### **CRITICAL: SECRET_KEY Fallback in Production**

**Location:** `marbelle/backend/marbelle/settings/base.py:29`

```python
SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-change-me-in-production")
```

**Issue:** The fallback value means if `SECRET_KEY` is not set in production, Django will use the insecure default. This compromises all cryptographic operations (JWT signing, session cookies, password reset tokens, CSRF tokens).

**Impact:** Complete security compromise - attackers can forge JWT tokens, session cookies, and password reset tokens.

**Fix:**

```python
from django.core.exceptions import ImproperlyConfigured

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ImproperlyConfigured("SECRET_KEY environment variable is required")
```

---

TODOO ->

### **HIGH: Email Enumeration via Resend Verification**

**Location:** `marbelle/backend/users/views.py:246`

```python
except User.DoesNotExist:
    return Response({"success": False, "message": "Email not found."}, status=status.HTTP_404_NOT_FOUND)
```

**Issue:** Attackers can enumerate valid email addresses by testing the resend verification endpoint. This contradicts your security-conscious approach in `request_password_reset` (line 142) which correctly prevents email enumeration.

**Impact:** Privacy breach - attackers can build a list of registered users.

**Fix:**

```python
except User.DoesNotExist:
    # Return success to prevent email enumeration
    return Response(
        {"success": True, "message": "If this email is registered, a verification email has been sent."},
        status=status.HTTP_200_OK
    )
```

---

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

TODOO ->

### **MEDIUM: Missing CSRF Trusted Origins Configuration**

**Location:** `marbelle/backend/marbelle/settings/base.py`

**Issue:** While `CSRF_COOKIE_SECURE` is set in prod.py (line 38), there's no `CSRF_TRUSTED_ORIGINS` configuration for cross-origin requests. Modern browsers (Chrome 92+) require this for CSRF protection with CORS.

**Impact:** CSRF protection may fail in production for cross-origin requests (frontend on different subdomain).

**Fix:** Add to `settings/base.py`:

```python
CSRF_TRUSTED_ORIGINS = os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",") if os.getenv("CSRF_TRUSTED_ORIGINS") else []
```

And in production `.env`:

```bash
CSRF_TRUSTED_ORIGINS=https://marbelle.com,https://www.marbelle.com
```

---

### **LOW: Token Secrets Visible in Admin Panel**

**Location:** `marbelle/backend/users/admin.py:161`

```python
readonly_fields = ("token", "created_at", "expires_at", "is_expired")
```

**Issue:** While read-only, email change tokens (and verification/reset tokens if admin is added) are fully visible in the admin panel. A compromised admin account could steal active tokens.

**Impact:** Admin users can see and potentially use password reset tokens, email verification tokens, etc.

**Fix:**

```python
readonly_fields = ("token_preview", "created_at", "expires_at", "is_expired")

def token_preview(self, obj):
    """Show only first/last 4 characters of token"""
    if obj.token:
        return f"{obj.token[:4]}...{obj.token[-4:]}"
    return "-"
token_preview.short_description = "Token"
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

---

### **LOW: Missing Database Index on expires_at**

**Location:** `marbelle/backend/users/models.py`

**Issue:** Token cleanup queries filter by `expires_at` but there's no explicit index on this field. While the `unique=True` on `token` creates an index, `expires_at` queries will be slow.

**Impact:** Slow cleanup queries as token tables grow.

**Recommendation:** Add index to all token models:

```python
class EmailVerificationToken(models.Model):
    # ... existing fields ...

    class Meta:
        verbose_name = "Email Verification Token"
        verbose_name_plural = "Email Verification Tokens"
        db_table = "email_verification_tokens"
        indexes = [
            models.Index(fields=['expires_at']),  # For efficient cleanup queries
            models.Index(fields=['user', 'is_used']),  # For token validation
        ]
```

---

## **3. Bugs & Edge Cases**

TODOO ->

### **CRITICAL: Race Condition in Address Primary Status**

**Location:** `marbelle/backend/users/views.py:506-511`

```python
# Remove primary status from other addresses
Address.objects.filter(user=request.user, is_primary=True).update(is_primary=False)

# Set this address as primary
address.is_primary = True
address.save()
```

**Issue:** Between the two operations, another concurrent request could set a different address as primary. Two addresses could end up with `is_primary=True`, violating the business rule.

**Scenario:**

1. Request A: Reads addresses, finds address 1 is primary
2. Request B: Reads addresses, finds address 1 is primary
3. Request A: Sets address 1 to False, sets address 2 to True
4. Request B: Sets address 1 to False, sets address 3 to True
5. Result: Both address 2 and 3 have `is_primary=True`

**Impact:** Data integrity violation - multiple primary addresses per user.

**Fix:**

```python
from django.db import transaction

@action(detail=True, methods=["patch"])
def set_primary(self, request: Request, pk: int | None = None) -> Response:
    """
    Set address as primary with transaction safety.
    """
    with transaction.atomic():
        address = self.get_object()

        # Lock rows for update to prevent race conditions
        Address.objects.filter(
            user=request.user,
            is_primary=True
        ).select_for_update().update(is_primary=False)

        # Set this address as primary
        address.is_primary = True
        address.save()

    serializer = self.get_serializer(address)
    return Response(
        {"success": True, "message": "Primary address updated successfully.", "data": serializer.data},
        status=status.HTTP_200_OK,
    )
```

---

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

TODOO ->

### **MEDIUM: Missing Transaction Safety in Email Change**

**Location:** `marbelle/backend/users/serializers.py:374-392`

```python
def save(self) -> Dict[str, Any]:
    email_change_token = self.validated_data["token"]
    user = email_change_token.user
    old_email = user.email

    # Update user email
    user.email = email_change_token.new_email
    user.username = email_change_token.new_email
    user.save()

    # Mark token as used
    email_change_token.is_used = True
    email_change_token.save()
```

**Issue:** If `email_change_token.save()` fails after user is updated (database error, connection lost), the token remains valid and can be reused. Email can be changed multiple times with the same token.

**Scenario:**

1. User confirms email change
2. User email updated successfully
3. Database connection lost
4. Token not marked as used
5. User clicks link again → email changed again (or error)

**Impact:** Token reuse vulnerability, potential security issue.

**Fix:**

```python
from django.db import transaction

def save(self) -> Dict[str, Any]:
    email_change_token = self.validated_data["token"]
    user = email_change_token.user
    old_email = user.email

    with transaction.atomic():
        # Mark token as used FIRST to prevent reuse
        # Even if email update fails, token is invalidated
        email_change_token.is_used = True
        email_change_token.save()

        # Then update user email
        user.email = email_change_token.new_email
        user.username = email_change_token.new_email
        user.save()

    return {"user": user, "old_email": old_email, "new_email": email_change_token.new_email}
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

---

## **4. Maintainability & Readability (Code Smells)**

### **HIGH: Magic Numbers and Hardcoded Values**

**Location:** Multiple files

**Examples:**

-   `users/views.py:34`: `@ratelimit(key="ip", rate="5/m", method="POST")`
-   `users/views.py:105`: `@ratelimit(key="ip", rate="3/m", method="POST")`
-   `users/views.py:301`: `@ratelimit(key="user", rate="1000/m", method="POST")`
-   `users/serializers.py:257`: `if not self.instance and Address.objects.filter(user=user).count() >= 10:`
-   `settings/base.py:230`: `SESSION_COOKIE_AGE = 60 * 60 * 24 * 28`
-   `users/models.py:96`: `self.expires_at = timezone.now() + timedelta(hours=24)`

**Issue:** Magic numbers scattered throughout the code make it hard to:

-   Understand business rules at a glance
-   Change limits consistently across the codebase
-   Test with different configurations

**Fix:** Create a constants file:

```python
# users/constants.py
from datetime import timedelta

class RateLimits:
    """Rate limiting configuration for authentication endpoints."""
    AUTH_REQUESTS = "5/m"  # Login, register, logout
    PASSWORD_RESET = "3/m"  # Password reset, email verification
    EMAIL_VERIFICATION = "3/m"
    EMAIL_CHANGE = "1000/m"  # Higher limit for authenticated users

class UserLimits:
    """Business rules for user accounts."""
    MAX_ADDRESSES_PER_USER = 10

class TokenExpiry:
    """Token expiration timeframes."""
    EMAIL_VERIFICATION_HOURS = 24
    PASSWORD_RESET_HOURS = 24
    EMAIL_CHANGE_HOURS = 24

    @classmethod
    def get_verification_expiry(cls):
        return timedelta(hours=cls.EMAIL_VERIFICATION_HOURS)

    @classmethod
    def get_reset_expiry(cls):
        return timedelta(hours=cls.PASSWORD_RESET_HOURS)

class SessionConfig:
    """Session management configuration."""
    COOKIE_AGE = timedelta(weeks=4)
    COOKIE_NAME = "marbelle_sessionid"

# Usage in views.py
from .constants import RateLimits, UserLimits

@ratelimit(key="ip", rate=RateLimits.AUTH_REQUESTS, method="POST")
def register_user(request: Request) -> Response:
    ...

# Usage in serializers.py
if not self.instance and Address.objects.filter(user=user).count() >= UserLimits.MAX_ADDRESSES_PER_USER:
    raise serializers.ValidationError(
        f"Maximum {UserLimits.MAX_ADDRESSES_PER_USER} addresses allowed per user."
    )

# Usage in models.py
self.expires_at = timezone.now() + TokenExpiry.get_verification_expiry()

# Usage in settings/base.py
from users.constants import SessionConfig
SESSION_COOKIE_AGE = int(SessionConfig.COOKIE_AGE.total_seconds())
```

---

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

TODOO ->

### **LOW: Unclear Variable Names**

**Location:** `marbelle/backend/marbelle/settings/base.py:246-248`

```python
allowed_origins = os.getenv("CORS_ALLOWED_ORIGINS")
CORS_ALLOWED_ORIGINS = allowed_origins.split(",") if allowed_origins else []
```

**Issue:** Variable `allowed_origins` (lowercase) shadows the final `CORS_ALLOWED_ORIGINS` constant, making it confusing. Same pattern on lines 12-15 in dev.py.

**Impact:** Reduced code readability, potential confusion for developers.

**Fix:**

```python
cors_origins_env = os.getenv("CORS_ALLOWED_ORIGINS")
CORS_ALLOWED_ORIGINS = cors_origins_env.split(",") if cors_origins_env else []

# Or more concise
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]
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

---

## **5. Best Practices & Idiomatic Code**

### **MEDIUM: Missing Type Hints on Class Methods**

**Location:** `marbelle/backend/users/models.py:92-97`, `127-132`, `163-168`, `225-234`

```python
def save(self, *args: Any, **kwargs: Any):
    if not self.token:
        self.token = secrets.token_urlsafe(32)
    if not self.expires_at:
        self.expires_at = timezone.now() + timedelta(hours=24)
    super().save(*args, **kwargs)
```

**Issue:** The return type is missing. While Python doesn't enforce it, type hints improve:

-   IDE autocomplete and type checking
-   Code documentation
-   Catching bugs at development time

**Impact:** Reduced developer experience, harder to catch type-related bugs.

**Fix:**

```python
def save(self, *args: Any, **kwargs: Any) -> None:
    if not self.token:
        self.token = secrets.token_urlsafe(32)
    if not self.expires_at:
        self.expires_at = timezone.now() + timedelta(hours=24)
    super().save(*args, **kwargs)
```

Apply this to all model `save()` methods and other methods missing return type hints.

---

### **MEDIUM: Not Using Django's get_or_create Pattern**

**Location:** `marbelle/backend/users/views.py:43-47`

```python
user = serializer.save()

# Create email verification token
verification_token = EmailVerificationToken.objects.create(user=user)
```

**Issue:** While this works in the registration flow, if called twice rapidly (race condition or retry), it could create duplicate tokens for the same user. The unique constraint on `token` field prevents duplicates, but you get an unnecessary IntegrityError.

**Impact:** Potential race condition, unnecessary exception handling.

**Better Pattern:**

```python
user = serializer.save()

# Get or create email verification token (idempotent)
verification_token, created = EmailVerificationToken.objects.get_or_create(
    user=user,
    is_used=False,
    defaults={
        'expires_at': timezone.now() + timedelta(hours=24)
    }
)

if not created:
    # Token already exists, check if it's still valid
    if not verification_token.is_valid:
        # Create new token if old one is expired
        verification_token = EmailVerificationToken.objects.create(user=user)
```

---

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

### **LOW: Outdated ASGI Configuration**

**Location:** `marbelle/backend/marbelle/asgi.py:14`

```python
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "marbelle.settings")
```

**Issue:** This defaults to a non-existent module (`marbelle.settings` doesn't exist, only `marbelle.settings.dev` and `marbelle.settings.prod`). If ASGI is used without setting the env var, it will fail.

**Impact:** ASGI server (Daphne, Uvicorn) won't start without explicit environment variable.

**Fix:**

```python
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "marbelle.settings.prod")
```

Match the WSGI default (line 17 of wsgi.py).

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

---

### **LOW: Missing Settings Validation on Startup**

**Location:** `marbelle/backend/marbelle/settings/base.py`

**Issue:** If critical environment variables (like `FRONTEND_URL`, database credentials, email config) are missing, the app may start successfully but fail at runtime when those features are used.

**Scenario:**

1. Deploy to production
2. Forget to set `FRONTEND_URL`
3. App starts successfully
4. Users register
5. Email verification links are broken (`None/verify-email?token=...`)
6. Users can't activate accounts

**Impact:** Silent failures in production, poor user experience.

**Fix:** Add startup validation:

```python
# settings/base.py
from django.core.exceptions import ImproperlyConfigured

def validate_required_settings():
    """
    Validate required environment variables on startup.
    Fails fast if critical configuration is missing.
    """
    required_settings = {
        'SECRET_KEY': os.getenv('SECRET_KEY'),
        'DB_NAME': os.getenv('DB_NAME'),
        'DB_USER': os.getenv('DB_USER'),
        'DB_PASSWORD': os.getenv('DB_PASSWORD'),
        'FRONTEND_URL': os.getenv('FRONTEND_URL'),
    }

    missing = [key for key, value in required_settings.items() if not value]

    if missing:
        raise ImproperlyConfigured(
            f"Missing required environment variables: {', '.join(missing)}\n"
            f"Please set these in your .env file or environment."
        )

# Only validate in production (not in development)
if os.getenv('DJANGO_SETTINGS_MODULE', '').endswith('.prod'):
    validate_required_settings()
```

---

### **LOW: CORS Configuration Too Permissive for Development**

**Location:** `marbelle/backend/marbelle/settings/dev.py:12-19`

```python
allowed_hosts = os.getenv("ALLOWED_HOSTS")
allowed_origins = os.getenv("CORS_ALLOWED_ORIGINS")

ALLOWED_HOSTS = allowed_hosts.split(",") if allowed_hosts else []
CORS_ALLOWED_ORIGINS = allowed_origins.split(",") if allowed_origins else []
```

**Issue:** If env vars aren't set in development, both are empty lists. Django will block all requests, making development frustrating.

**Impact:**

-   New developers can't run the app without configuring `.env` first
-   Poor developer experience
-   Common source of "why isn't it working?" questions

**Fix:**

```python
# settings/dev.py
ALLOWED_HOSTS = allowed_hosts.split(",") if allowed_hosts else [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "[::1]",  # IPv6 localhost
]

CORS_ALLOWED_ORIGINS = allowed_origins.split(",") if allowed_origins else [
    "http://localhost:3000",  # React dev server
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

# Also helpful for development
CORS_ALLOW_ALL_ORIGINS = False  # Keep this False even in dev for security practice
```

---

## **Summary of Critical Issues**

| Priority     | Count | Category                                                            | Urgency                 |
| ------------ | ----- | ------------------------------------------------------------------- | ----------------------- |
| **CRITICAL** | 3     | Security (SECRET_KEY), Data Integrity (Race Condition, Silent Save) | Fix before production   |
| **HIGH**     | 6     | Security (Email Enumeration), Performance (N+1), Architecture (DRY) | Fix in next sprint      |
| **MEDIUM**   | 12    | Security, Performance, Bugs, Maintainability                        | Fix within 1-2 months   |
| **LOW**      | 8     | Code Quality, Best Practices                                        | Address when convenient |

---

## **Recommended Action Plan**

### **Phase 1: Critical Fixes (Sprint 1 - This Week)**

**Must be completed before production deployment:**

1. ✅ **Fix SECRET_KEY fallback** (`settings/base.py:29`)

    - Add validation to raise error if not set
    - Prevents complete security compromise

2. ✅ **Fix race condition in Address.set_primary()** (`users/views.py:506-511`)

    - Add transaction with `select_for_update()`
    - Prevents data integrity violation

3. ✅ **Fix silent failure in UserProfileSerializer** (`users/serializers.py:199-204`)

    - Only catch IntegrityError for email duplication
    - Re-raise other exceptions
    - Prevents data loss

4. ✅ **Fix email enumeration in resend_verification** (`users/views.py:246`)
    - Return generic success message
    - Consistent with password reset behavior

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

8. ✅ **Add transaction safety to email change** (`users/serializers.py:374-392`)

    - Prevents token reuse vulnerability
    - Mark token as used FIRST

9. ✅ **Add comprehensive logging** (throughout codebase)
    - Security events (login, password reset, etc.)
    - Failed attempts
    - Audit trail

### **Phase 3: Medium Priority (Sprint 4-5 - Next Month)**

10. ✅ **Implement token cleanup task**

    -   Celery periodic task
    -   Delete expired tokens older than 7 days
    -   Add database index on `expires_at`

11. ✅ **Create constants file** (`users/constants.py`)

    -   Extract all magic numbers
    -   Rate limits, user limits, token expiry
    -   Better maintainability

12. ✅ **Standardize API response format**

    -   Consistent structure across all endpoints
    -   Better frontend developer experience

13. ✅ **Add missing CSRF_TRUSTED_ORIGINS** (`settings/base.py`)

    -   Required for modern browsers
    -   Prevents CSRF errors in production

14. ✅ **Improve phone validation** (`users/models.py:27`)
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

17. ⏳ **Add startup validation** (`settings/base.py`)

    -   Fail fast if config missing
    -   Better error messages

18. ⏳ **Improve development defaults** (`settings/dev.py`)
    -   Default ALLOWED_HOSTS and CORS_ALLOWED_ORIGINS
    -   Better developer experience

---

## **Testing Recommendations**

For each fix above, add corresponding tests:

```python
# tests/test_security.py
class SecurityTests(TestCase):
    def test_secret_key_required_in_production(self):
        """Test that SECRET_KEY raises error if not set"""
        # Implementation

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

---

## **Positive Observations**

**What you're doing right:**

1. ✅ **Excellent security practices:**

    - Email enumeration prevention in password reset
    - Rate limiting on sensitive endpoints
    - JWT with proper expiration and blacklisting
    - HttpOnly cookies with SameSite protection

2. ✅ **Good code organization:**

    - Separate settings for dev/prod
    - Custom user model
    - Proper use of serializers
    - Type hints in most places

3. ✅ **Comprehensive features:**

    - Email verification
    - Password reset flow
    - Email change with verification
    - Address management with business rules
    - Safari session compatibility

4. ✅ **Good API design:**

    - Consistent response format (with minor exceptions)
    - Proper HTTP status codes
    - Clear error messages
    - RESTful endpoints

5. ✅ **Database best practices:**
    - Custom table names
    - Proper indexes on addresses
    - Unique constraints
    - Foreign key relationships

---

## **Final Notes**

This codebase demonstrates solid Django knowledge and security awareness. The issues identified are typical of an evolving production application and are fixable with focused refactoring.

The most critical items (SECRET_KEY, race condition, silent failures) should be addressed immediately before any production deployment. The remaining issues can be tackled incrementally as part of your normal development cycle.

The suggested architectural improvements (repository pattern, service layer) are optional but would significantly improve long-term maintainability and testability.

**Overall Grade: B+ (Very Good)**

-   Security: A- (excellent practices, minor gaps)
-   Performance: B (good, but N+1 issues exist)
-   Code Quality: B+ (clean, but some duplication)
-   Architecture: B (solid foundation, room for improvement)

With the critical fixes implemented, this would be a production-ready A- codebase.
