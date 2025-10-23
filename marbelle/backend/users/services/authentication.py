"""Authentication service for user registration, email verification, and account security workflows."""

from typing import Any, Dict, Optional

from django.contrib.auth import authenticate
from django.db import transaction
from django.utils import timezone

from ..models import EmailChangeToken, EmailVerificationToken, PasswordResetToken, User
from ..repositories import UserRepository
from .email import EmailService
from .token import TokenService


class AuthenticationService:
    """
    Service for managing authentication workflows.

    Handles:
    - User registration with email verification
    - Email verification workflow
    - Verification email resending
    - Password reset workflow
    - Email change workflow
    """

    # ====== REGISTRATION ======

    @staticmethod
    def register_user(
        email: str,
        first_name: str,
        last_name: str,
        password: str,
        phone: Optional[str] = None,
        company_name: Optional[str] = None,
    ) -> tuple[User, EmailVerificationToken]:
        """
        Register new user and send verification email.

        Args:
            email: User email
            first_name: User first name
            last_name: User last name
            password: User password
            phone: Optional phone number
            company_name: Optional company name (for business customers)

        Returns:
            tuple: (user, verification_token)
        """

        user = UserRepository.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            phone=phone,
            company_name=company_name,
            is_active=False,  # User is not active until email is verified
        )

        verification_token = TokenService.get_or_create_email_verification_token(user)

        EmailService.send_verification_email(user, verification_token.token)

        return user, verification_token

    # ====== LOGIN ======

    @staticmethod
    def authenticate_user(email: str, password: str) -> Optional[User]:
        """
        Authenticate user credentials and update last_login timestamp.

        Args:
            email: User email
            password: User password

        Returns:
            User: Authenticated user or None if credentials invalid or user not active

        Raises:
            ValueError: If user account is not activated
        """

        user = authenticate(username=email, password=password)

        if not user:
            return None

        if not user.is_active:
            raise ValueError("Account is not activated. Please check your email for verification instructions.")

        # Update last_login timestamp
        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])

        return user

    # ====== EMAIL VERIFICATION ======

    @staticmethod
    def verify_user_email(token: str) -> Optional[User]:
        """
        Verify email and activate user account.

        Args:
            token: Email verification token

        Returns:
            User: Activated user, or None if token invalid
        """

        verification_token = TokenService.verify_email_token(token)

        if not verification_token:
            return None

        user = verification_token.user

        with transaction.atomic():
            user.is_active = True
            user.save()

            TokenService.mark_email_verification_used(verification_token)

        return user

    @staticmethod
    def resend_verification_email(email: str) -> bool:
        """
        Resend verification email for inactive users.

        Returns success regardless of whether user exists (email enumeration protection).

        Args:
            email: User email

        Returns:
            bool: True if email sent, False if user already active
        """

        user = UserRepository.get_by_email(email)
        if not user:
            # Return success to prevent email enumeration
            return True

        if user.is_active:
            return False

        verification_token = EmailVerificationToken.objects.create(user=user)

        EmailService.send_verification_email(user, verification_token.token)

        return True

    # ====== PASSWORD RESET ======

    @staticmethod
    def request_password_reset(email: str) -> Optional[PasswordResetToken]:
        """
        Create password reset token and send email.

        Returns None regardless of whether user exists (email enumeration protection).

        Args:
            email: User email

        Returns:
            PasswordResetToken: Created token, or None if user not found
        """

        user = UserRepository.get_active_by_email(email)

        if not user:
            # Return None to prevent email enumeration
            return None

        reset_token = TokenService.create_password_reset_token(user)

        EmailService.send_password_reset_email(user, reset_token.token)

        return reset_token

    @staticmethod
    def confirm_password_reset(token: str, new_password: str) -> Optional[User]:
        """
        Confirm password reset with token and update password.

        Args:
            token: Password reset token
            new_password: New password to set

        Returns:
            User: User with reset password, or None if token invalid
        """

        reset_token = TokenService.verify_password_reset_token(token)
        if not reset_token:
            return None

        user = reset_token.user

        with transaction.atomic():
            user.set_password(new_password)
            user.save()

            TokenService.mark_password_reset_used(reset_token)

        return user

    # ====== EMAIL CHANGE ======

    @staticmethod
    def request_email_change(user: User, current_password: str, new_email: str) -> EmailChangeToken:
        """
        Request email change with password re-authentication.

        Validates:
        - Current password correct
        - New email different from current
        - New email not already in use

        Args:
            user: User requesting email change
            current_password: Current password for verification
            new_email: New email address

        Returns:
            EmailChangeToken: Created token

        Raises:
            ValueError: If password incorrect or email already in use
        """

        if not user.check_password(current_password):
            raise ValueError("Current password is incorrect.")

        if user.email == new_email:
            raise ValueError("New email must be different from current email.")

        if UserRepository.email_exists(new_email):
            raise ValueError("This email address is already registered.")

        email_change_token = TokenService.create_email_change_token(user, new_email)

        EmailService.send_email_change_verification(user, new_email, email_change_token.token)

        return email_change_token

    @staticmethod
    def confirm_email_change(token: str) -> Optional[Dict[str, Any]]:
        """
        Confirm email change with token and update user email.

        Performs atomic transaction:
        1. Validate token
        2. Update user email
        3. Update username to match new email
        4. Mark token as used
        5. Send notification to old email

        Args:
            token: Email change confirmation token

        Returns:
            dict: {'user': User, 'old_email': str, 'new_email': str}

        Raises:
            ValueError: If token is invalid or expired
        """

        email_change_token = TokenService.verify_email_change_token(token)

        if not email_change_token:
            raise ValueError("Invalid or expired email change token.")

        user = email_change_token.user
        old_email = user.email
        new_email = email_change_token.new_email

        with transaction.atomic():
            user.email = new_email
            user.username = new_email
            user.save()

            TokenService.mark_email_change_used(email_change_token)

        try:
            EmailService.send_email_change_notification(user, old_email, new_email)
        except Exception:
            # Don't fail the whole operation if notification email fails
            pass

        return {
            "user": user,
            "old_email": old_email,
            "new_email": new_email,
        }
