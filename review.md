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

**Fix:** Create a Celery periodic task.

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

**Recommendation:** Use the `phonenumbers` library for proper international validation.

### **LOW: Duplicated Phone Regex Definition**

**Location:** `marbelle/backend/users/models.py:27-36` and `207-216`

**Issue:** The exact same `phone_regex` validator is defined twice:

-   In `User` model (lines 27-36)
-   In `Address` model (lines 207-216)

This violates DRY principle.

**Impact:** If you need to change phone validation, you must update it in two places.

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

**Fix:** Add structured logging.

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

**Fix:** Create an abstract base model.

**Benefits:**

-   Reduces code from ~150 lines to ~60 lines
-   Single source of truth for token behavior
-   Changes to token logic only need to be made once
-   Easier to add new token types in the future
-   Better index organization (defined once)

**Migration Required:** Yes, but it's a refactoring that doesn't change the database schema.

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

**Better Pattern:** Implement repository layer.

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

7. ✅ **Add comprehensive logging** (throughout codebase)
    - Security events (login, password reset, etc.)
    - Failed attempts
    - Audit trail

### **Phase 3: Medium Priority (Sprint 4-5 - Next Month)**

10. ✅ **Implement token cleanup task**

    -   Celery periodic task
    -   Delete expired tokens older than 7 days
    -   Add database index on `expires_at`

11. ✅ **Improve phone validation** (`users/models.py:27`)
    -   Use `phonenumbers` library
    -   Support international numbers

### **Phase 4: Architecture Improvements (Future Sprints)**

15. ⏳ **Implement repository pattern**

    -   Centralized data access
    -   Easier testing
    -   Better separation of concerns

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
