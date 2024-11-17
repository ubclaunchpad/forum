# Python Backend

## Setup Instructions

### 1. Install Python

- Download and install Python from [python.org](https://www.python.org/downloads/)
- Ensure Python is added to your system's PATH

### 2. Set up a Virtual Environment

#### For macOS and Linux

1. Open a terminal
2. Navigate to the project directory
3. Create a virtual environment:

```bash
python3 -m venv venv
```

OR

```bash
python -m venv venv
```

4. Activate the virtual environment:

```bash
source venv/bin/activate
```

5. Your terminal prompt should now show "(venv)" at the beginning

#### For Windows

1. Open Command Prompt or PowerShell
2. Navigate to the project directory
3. Create a virtual environment:

```bash
python -m venv venv
```

4. Activate the virtual environment:

```bash
.\venv\Scripts\activate
```

5. Your command prompt should now show "(venv)" at the beginning

### 3. Managing Dependencies

The project uses a structured approach to manage dependencies using `manage_deps.py`.

#### Initial Setup

After activating your virtual environment:

```bash
# Install all dependencies (both production and development)
./setup_dev.sh
```

#### Adding New Packages

Use the dependency management script:

```bash
# Add a production dependency
python manage_deps.py add package_name

# Add a development dependency
python manage_deps.py add package_name --dev
```

Examples:

```bash
# Add production package
python manage_deps.py add requests

# Add development package
python manage_deps.py add pytest --dev
```

#### Syncing Dependencies

After pulling changes or switching branches:

```bash
python manage_deps.py sync
```

### 4. Experimenting with RAG (Retrieval Augmented Generation)

The project includes a RAG implementation with the following structure:

#### Directory Structure

```txt
  project_root/
├── core/
│   ├── crud/                  # Database CRUD operations
│   ├── database/              # Database configuration
│   │   ├── migrations/        # Database schema changes
│   │   │   ├── [timestamp].sql
│   │   │   └── ...
│   │   ├── init.py
│   │   ├── db.py             # Database connection
│   │   └── script.py         # Migration scripts
│   ├── examples/
│   │   ├── outputs/          # Generated RAG outputs
│   │   └── main.py           # Example RAG usage
│   ├── middleware/           # FastAPI middleware
│   │   ├── init.py
│   │   └── auth.py          # Authentication middleware
│   ├── parsers/             # Document parsing
│   ├── routers/             # API routes
│   │   ├── routes/
│   │   │   └── user_routes.py
│   │   └── init.py
│   └── templates/           # RAG response templates
├── tests/                   # Test files
├── venv/                    # Virtual environment
├── .dockerignore
├── .env
├── .gitignore
├── Dockerfile
├── manage_deps.py          # Dependency management
├── requirements.in         # Direct dependencies
└── requirements.txt        # Locked dependencies
```

### Environment Setup

Create a `.env` file with:

```txt
OPENAI_API_KEY=your_key_here
DATABASE_URL=your_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### Database Migrations

#### What are Migrations?

Migrations are version-controlled changes to your database schema. They allow you to:

- Track database changes in git
- Roll forward/backward database changes
- Share schema changes with team members
- Keep development/staging/production databases in sync

#### Migration File Naming

Files are named with timestamp prefix for ordering: `[YYYYMMDDHHmmss].sql`

#### Running Migrations

1. Run all pending migrations:

```bash
python -m database.script
```

### Formatting and Linting

Note: make sure you have activated your virtual environment before running these commands as well as in the `backend` directory.

- Check formatting: in your terminal run: `black --check ./`
- Apply formatting: in your terminal run: `black ./`


---

### Running the Example RAG

1. Ensure your virtual environment is activated
2. Run the example:

```bash
python -m core.example.main
```

This will:

- Load documents from `example/data.json`
- Process and generate embeddings
- Store in the database
- Execute sample queries
- Generate results in `outputs/` folder
- Include timing and performance metrics
- Clean up test data (can be disabled)

#### Customization

- Modify `data.json` to test different documents and queries
- Edit templates in the `templates` folder to change response formats
- Comment out the cleanup section in `main.py` to retain data between runs

#### Notes

- The `outputs` folder is git-ignored
- Testing data is automatically cleaned up unless disabled
- Templates use a simple format system with context and question placeholders
