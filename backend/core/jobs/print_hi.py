from pydantic import BaseModel

class Print_HiParams(BaseModel):
    """Parameters for print_hi job"""
    name: str | None = None
    test_error: bool = False  # Add this to test error handling
    test_timeout: bool = False  # Add this to test timeout handling

def execute(params: Print_HiParams) -> str:
    """
    Execute the print_hi job
    Args:
        params (Print_HiParams): Validated parameters for the job
    Returns:
        str: Greeting message
    """
    print(f"Starting print_hi job with parameters: {params}")
    
    if params.test_error:
        print("Triggering test error...")
        raise ValueError("This is a test error")
        
    if params.test_timeout:
        print("Simulating long-running task...")
        import time
        time.sleep(70)  # Sleep for longer than the typical timeout
        
    message = f"Hi {params.name}!" if params.name else "Hi!"
    print(f"Job executing with message: {message}")
    return message