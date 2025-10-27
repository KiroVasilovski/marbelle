"""Session management service for hybrid cookie/header authentication."""

from typing import Optional

from rest_framework.request import Request


class SessionService:
    """
    Manages user sessions with hybrid authentication support.

    Supports both cookie-based sessions (Chrome, Firefox, Edge) and header-based
    sessions (Safari with Intelligent Tracking Prevention).

    This service provides a centralized way to handle session creation and retrieval
    for both authenticated users and guest users.
    """

    @staticmethod
    def get_session_id(request: Request) -> Optional[str]:
        """
        Extract session ID from request.

        For authenticated users, returns None (user ID is used instead).
        For guest users, returns session ID from either header (X-Session-ID) or cookies.

        Args:
            request: Django REST Framework request object

        Returns:
            Session ID string for guests, None for authenticated users
        """
        if request.user.is_authenticated:
            return None

        # PRIORITY 1: Check if client sent session ID via header (Safari or returning user)
        # This allows Safari and other cookie-blocked browsers to maintain sessions
        session_id = request.headers.get("X-Session-ID")

        # PRIORITY 2: If no header, try cookie-based session (Chrome, Firefox, Edge)
        # This is more secure (HttpOnly) and happens automatically for first-time visitors
        if not session_id:
            if not request.session.session_key:
                request.session.create()
            session_id = request.session.session_key

            # If session_key is still None, it means session creation failed
            if not session_id:
                # Force session save and get key
                request.session.save()
                session_id = request.session.session_key

        return session_id

    @staticmethod
    def is_authenticated(request: Request) -> bool:
        """
        Check if request is from authenticated user.

        Args:
            request: Django REST Framework request object

        Returns:
            True if user is authenticated, False otherwise
        """
        return request.user.is_authenticated
