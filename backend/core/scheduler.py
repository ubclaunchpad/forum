from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
import atexit
from models.db import get_db
from models.all import Job, JobSpecification
from core.processors.execute_job import run_job
import json
import logging
from uuid import uuid4

logger = logging.getLogger(__name__)

class JobScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        
    def create_next_job(self, db, job: Job) -> None:
        """Create the next instance of a recurring job"""
        # Check if we should create next job based on end_date
        if job.recurring_end_date and datetime.now() >= job.recurring_end_date:
            logger.info(f"Recurring job {job.id} has reached end date, not creating next instance")
            return
            
        # Create new job instance
        next_job = Job(
            specification_id=job.specification_id,
            params=job.params,
            status="not started",
            retry_count=0,
            priority=job.priority,
            recurring=job.recurring,
            recurring_interval=job.recurring_interval,
            recurring_end_date=job.recurring_end_date
        )
        db.add(next_job)
        db.commit()
        logger.info(f"Created next instance of recurring job: {next_job.id}")
        
    def check_and_execute_jobs(self):
        """
        Check for jobs that need to be executed and run them.
        This runs every X minutes via the scheduler.
        """
        logger.info("Checking for jobs to execute...")
        with get_db() as db:
            # Get all not started jobs
            pending_jobs = db.query(Job).filter(
                Job.status == "not started"
            ).all()
            
            logger.info(f"Found {len(pending_jobs)} pending jobs")
            
            if not pending_jobs:
                logger.info("No jobs to execute")
                return
                
            for job in pending_jobs:
                try:
                    # Execute job
                    logger.info(f"Executing job {job.id} (specification_id: {job.specification_id})")
                    logger.info(f"Job details: priority={job.priority}, recurring={job.recurring}, params={job.params}")
                    
                    params = job.params if job.params else {}
                    result = run_job(str(job.id), params)
                    
                    # If job was successful and it's recurring, create next instance
                    if result is not None and job.recurring:
                        logger.info(f"Job {job.id} completed successfully, creating next instance")
                        self.create_next_job(db, job)
                    elif result is not None:
                        logger.info(f"Job {job.id} completed successfully")
                    else:
                        logger.warning(f"Job {job.id} returned None result")
                        
                except Exception as e:
                    logger.error(f"Failed to execute job {job.id}: {str(e)}", exc_info=True)
                    continue
    
    def start(self):
        """Start the scheduler to periodically check for jobs"""
        if not self.scheduler.running:
            # Add job to check every 10 minutes
            self.scheduler.add_job(
                self.check_and_execute_jobs,
                'interval',
                minutes=10,
                id='job_checker',
                next_run_time=datetime.now() 
            )
            self.scheduler.start()
            logger.info("Job scheduler started")
            atexit.register(self.shutdown)
            
    def shutdown(self):
        """Shutdown the scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("Job scheduler shutdown")
            
scheduler = JobScheduler()

def init_scheduler():
    """Initialize and start the scheduler"""
    scheduler.start() 