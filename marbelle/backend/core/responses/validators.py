"""Validators for response data JSON serialization."""

import json
from typing import Any


def validate_json_serializable(data: Any) -> None:
    """
    Validate that data is JSON serializable.

    Args:
        data: Data to validate

    Raises:
        TypeError: If data cannot be JSON serialized
    """
    try:
        json.dumps(data)
    except (TypeError, ValueError) as e:
        raise TypeError(f"Response data is not JSON serializable: {e}")
