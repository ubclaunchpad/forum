from core.jobs.job_handler import JobHandler, AddJobParams, ModifyJobParams, JobStatus, JobPriority
from datetime import datetime, timedelta
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_demo():
    try:
        # 1. First create a job
        logger.info("\n=== Creating a new job ===")
        job_params = AddJobParams(
            specification_id="7de2643a-26e3-4c2b-b555-a97c5935fbc3",  # This should be your print_hi job spec ID
            params={"name": "Demo User"},
            recurring=True,
            recurring_interval=300,  # Run every 5 minutes
            recurring_end_date=datetime.now() + timedelta(hours=1)  # Run for 1 hour
        )
        
        job_id = JobHandler.add_job(job_params)
        logger.info(f"Created job with ID: {job_id}")
        
        # 2. Check its status
        logger.info("\n=== Checking job status ===")
        status = JobHandler.check_status(job_id)
        logger.info(f"Job status: {status}")
        
        # 3. List all jobs
        logger.info("\n=== Listing all jobs ===")
        all_jobs = JobHandler.check_jobs()
        logger.info(f"Found {len(all_jobs)} jobs:")
        for job in all_jobs:
            logger.info(f"Job {job['id']}: {job['status']}")
            
        # 4. Modify the job
        logger.info("\n=== Modifying job ===")
        modify_params = ModifyJobParams(
            params={"name": "Modified User"},
            priority=JobPriority.HIGH
        )
        JobHandler.modify_job(job_id, modify_params)
        
        # 5. Check status again
        logger.info("\n=== Checking modified job status ===")
        updated_status = JobHandler.check_status(job_id)
        logger.info(f"Updated job status: {updated_status}")
        
        # 6. List only high priority jobs
        logger.info("\n=== Listing high priority jobs ===")
        high_priority_jobs = JobHandler.check_jobs(priority=JobPriority.HIGH)
        logger.info(f"Found {len(high_priority_jobs)} high priority jobs:")
        for job in high_priority_jobs:
            logger.info(f"Job {job['id']}: priority={job['priority']}")
            
        # 7. Remove the job
        logger.info("\n=== Removing job ===")
        JobHandler.remove_job(job_id)
        logger.info("Job removed successfully")
        
        # 8. Verify job is removed
        logger.info("\n=== Final job count ===")
        final_jobs = JobHandler.check_jobs()
        logger.info(f"Total jobs remaining: {len(final_jobs)}")
        
    except Exception as e:
        logger.error(f"Error in demo: {str(e)}")

if __name__ == "__main__":
    run_demo() 