from typing import Dict, List, Optional, Union
from datetime import datetime
from uuid import UUID
from models.db import get_db
from models.all import Job, JobSpecification
from pydantic import BaseModel, Field
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class JobPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class JobStatus(str, Enum):
    NOT_STARTED = "not started"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"

class FailureStrategy(str, Enum):
    RETRY = "retry"
    ABORT = "abort"

class AddJobParams(BaseModel):
    """Parameters for adding a new job"""
    specification_id: UUID
    params: Dict = Field(default_factory=dict)
    priority: JobPriority = JobPriority.MEDIUM
    recurring: bool = False
    recurring_interval: Optional[int] = None  # in seconds
    recurring_end_date: Optional[datetime] = None

class ModifyJobParams(BaseModel):
    """Parameters for modifying an existing job"""
    params: Optional[Dict] = None
    priority: Optional[JobPriority] = None
    recurring: Optional[bool] = None
    recurring_interval: Optional[int] = None
    recurring_end_date: Optional[datetime] = None
    status: Optional[JobStatus] = None

class JobHandler:
    @staticmethod
    def add_job(params: AddJobParams) -> UUID:
        """
        Add a new job to the system
        Returns: UUID of the created job
        """
        with get_db() as db:
            # Validate job specification exists
            job_spec = db.query(JobSpecification).filter(
                JobSpecification.id == params.specification_id
            ).first()
            
            if not job_spec:
                raise ValueError(f"Job specification {params.specification_id} not found")
                
            # Validate recurring job parameters
            if params.recurring:
                if not params.recurring_interval:
                    raise ValueError("Recurring interval must be specified for recurring jobs")
                if params.recurring_interval < 60:  # minimum 1 minute
                    raise ValueError("Recurring interval must be at least 60 seconds")
                    
            # Create job
            job = Job(
                specification_id=params.specification_id,
                params=params.params,
                status=JobStatus.NOT_STARTED,
                retry_count=0,
                priority=params.priority,
                recurring=params.recurring,
                recurring_interval=params.recurring_interval,
                recurring_end_date=params.recurring_end_date
            )
            
            db.add(job)
            db.commit()
            logger.info(f"Created new job {job.id}")
            return job.id
            
    @staticmethod
    def check_status(job_id: UUID) -> Dict:
        """
        Check the status of a job
        Returns: Dict containing job status and details
        """
        with get_db() as db:
            job = db.query(Job).filter(Job.id == job_id).first()
            if not job:
                raise ValueError(f"Job {job_id} not found")
                
            return {
                "id": job.id,
                "status": job.status,
                "retry_count": job.retry_count,
                "specification_id": job.specification_id,
                "created_at": job.created_at,
                "updated_at": job.updated_at,
                "recurring": job.recurring,
                "priority": job.priority
            }
            
    @staticmethod
    def remove_job(job_id: UUID) -> None:
        """Remove a job from the system"""
        with get_db() as db:
            job = db.query(Job).filter(Job.id == job_id).first()
            if not job:
                raise ValueError(f"Job {job_id} not found")
                
            if job.status == JobStatus.RUNNING:
                raise ValueError(f"Cannot remove job {job_id} while it is running")
                
            db.delete(job)
            db.commit()
            logger.info(f"Removed job {job_id}")
            
    @staticmethod
    def modify_job(job_id: UUID, params: ModifyJobParams) -> None:
        """Modify an existing job's parameters"""
        with get_db() as db:
            job = db.query(Job).filter(Job.id == job_id).first()
            if not job:
                raise ValueError(f"Job {job_id} not found")
                
            if job.status == JobStatus.RUNNING:
                raise ValueError(f"Cannot modify job {job_id} while it is running")
                
            # Update only provided fields
            update_data = params.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(job, key, value)
                
            db.commit()
            logger.info(f"Modified job {job_id}")
            
    @staticmethod
    def check_jobs(
        status: Optional[JobStatus] = None,
        priority: Optional[JobPriority] = None,
        specification_id: Optional[UUID] = None
    ) -> List[Dict]:
        """
        Get a list of jobs matching the specified criteria
        Returns: List of job details
        """
        with get_db() as db:
            query = db.query(Job)
            
            if status:
                query = query.filter(Job.status == status)
            if priority:
                query = query.filter(Job.priority == priority)
            if specification_id:
                query = query.filter(Job.specification_id == specification_id)
                
            jobs = query.all()
            return [
                {
                    "id": job.id,
                    "status": job.status,
                    "specification_id": job.specification_id,
                    "priority": job.priority,
                    "recurring": job.recurring,
                    "created_at": job.created_at,
                    "updated_at": job.updated_at
                }
                for job in jobs
            ] 