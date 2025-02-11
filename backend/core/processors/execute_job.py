import importlib
import sys
import os
from pathlib import Path
from models.db import get_db
from models.all import JobSpecification, Job
import json
from uuid import UUID
from pydantic import ValidationError
import signal
from datetime import datetime
from contextlib import contextmanager


class TimeoutError(Exception):
    pass


@contextmanager
def timeout(seconds):
    def timeout_handler(signum, frame):
        raise TimeoutError("Job execution timed out")

    # Set up the timeout
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(seconds)

    try:
        yield
    finally:
        # Disable the alarm
        signal.alarm(0)


def update_job_status(db, job_id: UUID, status: str, retry_count: int = None):
    """Update job status and retry count if provided"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if job:
        print(f"\n=== Updating job {job_id} ===")
        print(f"Previous status: {job.status}")
        print(f"New status: {status}")
        if retry_count is not None:
            print(f"New retry count: {retry_count}")

        job.status = status
        job.updated_at = datetime.now()
        if retry_count is not None:
            job.retry_count = retry_count
        db.commit()
        print("=== Database updated successfully ===\n")


def validate_job_spec(job_id: UUID) -> tuple[bool, JobSpecification | None, Job | None]:
    """
    Validates if a job specification exists and its corresponding file exists.
    Returns (is_valid, job_spec, job)
    """
    with get_db() as db:
        # First find the Job record
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            print(f"No job found for job_id {job_id}")
            return False, None, None

        # Then find the linked JobSpecification using specification_id
        job_spec = (
            db.query(JobSpecification)
            .filter(JobSpecification.id == job.specification_id)
            .first()
        )

        if not job_spec:
            print(
                f"No job specification found for specification_id {job.specification_id}"
            )
            return False, None, job

        # Check if job file exists
        core_dir = Path(__file__).parent.parent
        job_file_path = core_dir / "jobs" / f"{job_spec.action_name}.py"

        if not job_file_path.exists():
            print(f"Job file {job_spec.action_name}.py does not exist")
            return False, None, job

        return True, job_spec, job


def run_job(job_id: UUID, params: dict):
    """
    Dynamically loads & executes jobs based off job_id
    """
    print(f"\n{'=' * 50}")
    print(f"Starting job execution for job_id: {job_id}")
    print(f"Input parameters: {params}")
    print(f"{'=' * 50}\n")

    try:
        # Validate job specification and file existence
        print("Validating job specification...")
        is_valid, job_spec, job = validate_job_spec(job_id)
        if not is_valid:
            print("Job validation failed!")
            if job:
                with get_db() as db:
                    update_job_status(db, job_id, "failed")
            return None

        print(f"Job specification valid: {job_spec.action_name}")
        print(f"Timeout setting: {job_spec.timeout} seconds")
        print(f"Failure strategy: {job_spec.failure_strategy}")

        with get_db() as db:
            update_job_status(db, job_id, "running")

        # Set up Python path for job imports
        core_dir = str(Path(__file__).parent.parent)
        if core_dir not in sys.path:
            sys.path.insert(0, core_dir)
        os.chdir(core_dir)

        try:
            # Import the job module
            print(f"\nImporting job module: jobs.{job_spec.action_name}")
            job_module = importlib.import_module(f"jobs.{job_spec.action_name}")

            # Get the parameter schema class
            print("Validating parameters...")
            param_class = getattr(job_module, f"{job_spec.action_name.title()}Params")

            # Validate parameters
            try:
                validated_params = param_class(**params)
                print("Parameters validated successfully")
            except ValidationError as e:
                print(f"Parameter validation failed: {e}")
                with get_db() as db:
                    update_job_status(db, job_id, "failed")
                return None

            # Execute with validated parameters and timeout
            try:
                print(f"\nExecuting job with {job_spec.timeout} second timeout...")
                with timeout(job_spec.timeout):
                    result = job_module.execute(params=validated_params)
                    print(f"Job completed successfully with result: {result}")

                    with get_db() as db:
                        update_job_status(db, job_id, "success")
                    return result

            except TimeoutError:
                print(
                    f"\n!!! Job {job_spec.action_name} timed out after {job_spec.timeout} seconds !!!"
                )
                with get_db() as db:
                    if job_spec.failure_strategy == "retry" and job.retry_count < 3:
                        print(f"Scheduling retry {job.retry_count + 1}/3")
                        update_job_status(
                            db, job_id, "not started", job.retry_count + 1
                        )
                    else:
                        print(
                            "Max retries exceeded or retry not enabled. Marking as failed."
                        )
                        update_job_status(db, job_id, "failed")
                return None

        except ModuleNotFoundError as e:
            print(f"\n!!! Could not load job module: {e} !!!")
            with get_db() as db:
                update_job_status(db, job_id, "failed")
            return None
        except AttributeError as e:
            print(f"\n!!! Could not find parameter schema for job: {e} !!!")
            with get_db() as db:
                update_job_status(db, job_id, "failed")
            return None
        except Exception as e:
            print(f"\n!!! Job execution failed with error: {e} !!!")
            with get_db() as db:
                update_job_status(db, job_id, "failed")
            return None

    except Exception as e:
        print(f"\n!!! Error executing job {job_id}: {e} !!!")
        with get_db() as db:
            update_job_status(db, job_id, "failed")
        return None
    finally:
        print(f"\n{'=' * 50}")
        print("Job execution completed")
        print(f"{'=' * 50}\n")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python execute_job.py <job_id> <params>")
        sys.exit(1)

    job_id = UUID(sys.argv[1])
    job_params = json.loads(sys.argv[2])

    run_job(job_id, job_params)
