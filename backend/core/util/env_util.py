"""Utility functions for working with environment variables."""

import os
from enum import Enum


class ENV(Enum):
    DEV = "development"
    PROD = "production"


def parse_bool_env(env_var: str, default: bool = True) -> bool:
    """
    Safely parse boolean environment variables.

    Args:
        env_var: Environment variable name
        default: Default value if env var is not set

    Returns:
        bool: Parsed boolean value

    Examples:
        >>> # .env file
        >>> # AUTH_MIDDLEWARE_ENABLED=false
        >>> parse_bool_env("AUTH_MIDDLEWARE_ENABLED", default=True)
        False

        >>> # AUTH_MIDDLEWARE_ENABLED not set
        >>> parse_bool_env("AUTH_MIDDLEWARE_ENABLED", default=True)
        True

        >>> # AUTH_MIDDLEWARE_ENABLED=1
        >>> parse_bool_env("AUTH_MIDDLEWARE_ENABLED", default=False)
        True
    """
    value = os.getenv(env_var)

    if value is None:
        return default

    try:
        return True if int(value) == 1 else False
    except (ValueError, AttributeError):
        return default
