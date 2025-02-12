import logging
import time
from functools import wraps
from typing import Callable


def timer(func: Callable):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = await func(*args, **kwargs)
        end = time.perf_counter()
        duration = (end - start) * 1000  # Convert to milliseconds
        logging.info(f"{func.__name__} took {duration:.2f}ms to execute")
        return result

    return wrapper


# For sync functions
def sync_timer(func: Callable):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        duration = (end - start) * 1000  # Convert to milliseconds
        logging.info(f"{func.__name__} took {duration:.2f}ms to execute")
        return result

    return wrapper
