"""Email service for sending verification, password reset, and email change notifications."""

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from ..models import User


class EmailService:
    """
    Service for sending emails related to authentication and user account changes.

    Handles:
    - Email verification during registration
    - Password reset requests
    - Email change verification
    - Email change security notifications
    """

    @staticmethod
    def send_verification_email(user: User, token: str) -> None:
        """
        Send email verification email for new registrations.

        Args:
            user: User object
            token: Email verification token
        """
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

    @staticmethod
    def send_password_reset_email(user: User, token: str) -> None:
        """
        Send password reset email.

        Args:
            user: User object
            token: Password reset token
        """
        subject = "Reset your Marbelle password"
        reset_url = f"{settings.FRONTEND_URL}/password-reset?token={token}"

        html_message = render_to_string(
            "users/password_reset.html",
            {"user": user, "reset_url": reset_url},
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

    @staticmethod
    def send_email_change_verification(user: User, new_email: str, token: str) -> None:
        """
        Send email change verification to new email address.

        Args:
            user: User object
            new_email: New email address to verify
            token: Email change verification token
        """
        subject = "Verify your new Marbelle email address"
        verification_url = f"{settings.FRONTEND_URL}/confirm-email-change?token={token}"

        html_message = render_to_string(
            "users/email_change_verification.html",
            {
                "user": user,
                "new_email": new_email,
                "verification_url": verification_url,
            },
        )
        plain_message = strip_tags(html_message)

        send_mail(
            subject=subject,
            message=plain_message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[new_email],
            fail_silently=False,
        )

    @staticmethod
    def send_email_change_notification(user: User, old_email: str, new_email: str) -> None:
        """
        Send security notification to old email address about the change.

        Args:
            user: User object
            old_email: Previous email address
            new_email: New email address
        """
        subject = "Marbelle email address changed"

        html_message = render_to_string(
            "users/email_change_notification.html",
            {
                "user": user,
                "old_email": old_email,
                "new_email": new_email,
            },
        )
        plain_message = strip_tags(html_message)

        send_mail(
            subject=subject,
            message=plain_message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[old_email],
            fail_silently=False,
        )
