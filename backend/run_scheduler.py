# RUN JOB SCHEDULER
import os
import sys
import logging
from core.scheduler import init_scheduler
from core.util.env_util import ENV

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def main():
    environment = os.getenv("ENV")
    logger.info(f"Starting job scheduler service in {environment} environment")

    try:
        # Initialize and start the scheduler
        init_scheduler()

        # Keep the main thread alive
        logger.info("Scheduler service is running. Press Ctrl+C to exit.")
        while True:
            import time

            time.sleep(60)  # Sleep to prevent CPU usage

    except KeyboardInterrupt:
        logger.info("Shutting down scheduler service...")
    except Exception as e:
        logger.error(f"Error in scheduler service: {str(e)}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
