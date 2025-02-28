from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class SampleJobParams(BaseModel):
    """
    Parameters for sample_job

    Naming Convention:
    - Class name should be {JobName}Params where JobName is the same as the file name
      but in PascalCase (e.g., file: sample_job.py -> class: SampleJobParams)

    Best Practices:
    - Use type hints for all parameters
    - Provide default values when it makes sense
    - Use pydantic Field for additional validation
    - Add clear docstrings explaining each parameter
    - Use Optional[] for parameters that aren't required
    """

    # Required parameters (no defaults)
    input_text: str = Field(
        ...,  # ... means required
        description="Text to process in the job",
        min_length=1,
        max_length=1000,
    )

    # Optional parameters (with defaults)
    max_retries: int = Field(
        default=3, description="Maximum number of retries if job fails", ge=0, le=5
    )

    process_date: Optional[datetime] = Field(
        default=None,
        description="Date to process data for. Defaults to current date if not specified",
    )

    tags: List[str] = Field(
        default_factory=list,
        description="List of tags to categorize the job",
        max_items=10,
    )


def execute(params: SampleJobParams) -> dict:
    """
    Execute the sample job

    Function Requirements:
    1. Must be named 'execute'
    2. Must accept a single parameter of type {JobName}Params
    3. Should have type hints for parameters and return value
    4. Should include docstring with:
       - Description of what the job does
       - Args section describing parameters
       - Returns section describing return value
       - Raises section if applicable

    Args:
        params (SampleJobParams): Validated parameters for the job

    Returns:
        dict: Result of the job execution containing:
            - status: str indicating success/failure
            - processed_text: str of processed input
            - timestamp: datetime of processing

    Raises:
        ValueError: If text processing fails
    """
    print(f"Starting sample job with parameters: {params}")

    try:
        # Simulate some processing
        processed_text = params.input_text.upper()

        # Example of using optional parameters
        if params.process_date:
            print(f"Processing for date: {params.process_date}")

        # Example of handling job-specific logic
        for tag in params.tags:
            print(f"Processing tag: {tag}")

        # Return results
        # Note: Always return a value that can be JSON serialized
        return {
            "status": "success",
            "processed_text": processed_text,
            "timestamp": datetime.now().isoformat(),
            "retries_configured": params.max_retries,
        }

    except Exception as e:
        print(f"Error in sample job: {str(e)}")
        raise  # Re-raise the exception to be handled by job processor


# Example usage in Python:
"""
from core.jobs.job_handler import JobHandler, AddJobParams
from uuid import UUID

# Create a job
job_params = AddJobParams(
    specification_id=UUID("..."),  # Job spec ID from database
    params={
        "input_text": "hello world",
        "max_retries": 2,
        "tags": ["test", "example"]
    },
    priority="medium",
    recurring=True,
    recurring_interval=3600  # Run every hour
)

job_id = JobHandler.add_job(job_params)
"""
