"""
Email service functions for sending verification, password reset, and email change notifications.
"""

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from ..models import User


def send_verification_email(user: User, token: str) -> None:
    """
    Send email verification email.
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


def send_password_reset_email(user: User, token: str) -> None:
    """
    Send password reset email.
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


def send_email_change_verification(user: User, new_email: str, token: str) -> None:
    """
    Send email change verification to new email address.
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


def send_email_change_notification(user: User, old_email: str, new_email: str) -> None:
    """
    Send security notification to old email address about the change.
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
