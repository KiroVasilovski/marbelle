"""Response payload builders for success and error responses."""

from typing import Any, Dict, Optional


def build_success_payload(data: Any = None, message: str = "Success") -> Dict[str, Any]:
    """
    Helper function to build a success response payload.

    Args:
        data: Response data (can be None, dict, list, or any serializable object)
        message: Human-readable success message

    Returns:
        Dictionary with success response structure
    """
    payload: Dict[str, Any] = {
        "success": True,
        "message": message,
    }
    if data is not None:
        payload["data"] = data
    return payload


def build_error_payload(message: str = "Error", errors: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Helper function to build an error response payload.

    Args:
        message: Human-readable error message
        errors: Optional error details (validation errors, field errors, etc.)

    Returns:
        Dictionary with error response structure
    """
    payload: Dict[str, Any] = {
        "success": False,
        "message": message,
    }
    if errors:
        payload["errors"] = errors
    return payload
