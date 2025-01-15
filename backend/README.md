# Forum Backend

## Setup Instructions

### 1. Install Python

- Download and install Python from [python.org](https://www.python.org/downloads/)
- Ensure Python is added to your system's PATH

### 2. Install UV

- Copy based on your OS: <https://docs.astral.sh/uv/getting-started/installation/>
  - e.g. macOS: `curl -LsSf https://astral.sh/uv/install.sh | sh`

### 3. Install Dependencies (syncing dependencies)

```bash
uv sync
```

### 4. Syncing the Database

- Run the following command to create the database tables:

```bash
uv run --env-file .env alembic upgrade head
```

### Environment Variables

Create a `.env` file with:

```txt
OPENAI_API_KEY=your_key_here
DATABASE_URL=your_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

AUTH_MIDDLEWARE_ENABLED=true # or false
DEV_USER_EMAIL=your_email_here
DEV_USER_PASSWORD=your_password_here
DEV_LOGIN=true # or false

ENV=development # or production
```

### 4. Running the Server

- With the virtual environment activated, run the following command:

```bash
   uv run --env-file .env -m main
```

## Managing Dependencies

- Install new packages using `uv add <package_name>`
- Remove packages using `uv remove <package_name>`

## Directory Structure (Partial)

```txt
forum/
├── backend/
│   ├── controllers/                        # Business logic
│   ├── core/                               # ML services
│   ├── migrations/                         # Database configuration
│   │   ├── versions/                       # Database schema changes
│   │   │   ├── [timestamp]_<comment>.py    # Auto generated migration files
│   │   │   └── ...
│   │   ├── env.py                          # Alembic environment
│   │   └── script.py.mako                  # Alembic script template
│   ├── models/
│   │   ├── schemas/                        # Pydantic models for request/response API
│   │   ├── *.py                            # Models for the Database
│   │   ├── db.py                           # Database connection
│   ├── routers/                            # API routes
│   │   ├── middleware/                     # FastAPI middleware
│   │   │   └── auth_middleware.py
│   │   ├── routes/                         # FastAPI routes
│   │   │   └── user_routes.py
│   │ .venv/                                # Where the virtual environment is stored
│   │ .env
│   │ .gitignore
│   │ alembic.ini                           # Alembic configuration
│   │ main.py                               # Main entry point
│   │ pyproject.toml                        # Python project configuration
│   │ uv.lock                               # Dependency lock file
```

Where to find these?

- Go on [Supabase](https://supabase.io/) and create a new project
- Go to the project settings:
  - In the API section, you will find the `SUPABASE_URL` and `SUPABASE_KEY`
  - In the Database section, you will find the `DATABASE_URL` (you want a connection string)
- For most cases you will need to have the `AUTH_MIDDLEWARE_ENABLED` set to `true` and the `DEV_USER_EMAIL` and `DEV_USER_PASSWORD` set to your email and password
  - On your Supabase project, go to the `Auth` section and create a new user (you can manually set the email and password); then use these credentials in the `.env` file
- Go on [OpenAI](https://platform.openai.com/) and create a new project (or use an existing one)
  - You do not need this unless you use the OpenAI API

### Database (Editing the Database)

We use SqlAlchemy and Alembic for database migrations. The database is hosted on Supabase.

1. Change the files in `models/` to reflect the changes you want to make to the database
2. Run the following command to generate a new migration:

```bash
uv run --env-file .env alembic revision --autogenerate -m "migration message"
```

This will create a new migration file in the `migrations/versions/` folder

3. Run the following command to apply the migration:

```bash
uv run --env-file .env alembic upgrade head
```

## Using the API (Endpoints)

- FastAPI provides a Swagger UI for the API
- Go to `{base_url}/docs#/` to see the API documentation

## Resources

- [FastAPI](https://fastapi.tiangolo.com/)
- [Supabase](https://supabase.io/)
- [OpenAI](https://platform.openai.com/)
- [Alembic](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [Pydantic](https://pydantic-docs.helpmanual.io/)
- [SQLAlchemy](https://docs.sqlalchemy.org/en/20/)
