# ForumAI

> OUTDATED

[![CodeQL](https://github.com/ubclaunchpad/forum/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/ubclaunchpad/forum/actions/workflows/github-code-scanning/codeql) ![License](https://img.shields.io/github/license/ubclaunchpad/forum)

ForumAI is an online platform which enables AI assistance in structured academic forums, facillutating discussions between students and faculty.

## Features

- 24/7 AI assistance to help answer questions about course material, assigments and general logistics
- Discussions boards and Q&A forums for interaction between students, instructors and teaching assistants
- Anonoymous posting and messaging for safe and inclusive discussions

## Installation

Clone the project

```bash
git clone https://github.com/ubclaunchpad/forum.git
```

### Frontend

#### 1. Install Node.js

- Download and install the latest version of Node.js from [nodejs.org](https://nodejs.org/en)

#### 2. Go to the frontend directory

```bash
cd forum/frontend
```

#### 3. Install dependencies

```bash
yarn install # or npm install
```

### Environment Variables

Create a `.env` file with:

```txt
NEXT_PUBLIC_SUPABASE_URL=YOUR_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
DATABASE_URL=YOUR_DATABASE_URL
NEXT_PUBLIC_API_BASE_URL=YOUR_API_BASE_URL
```

Check [here](#envsetup) for details on how to find your environment variables

#### 4. Running the server

```bash
yarn dev # or npm run dev
```

### Backend

#### 1. Install Python

- Download and install Python from [python.org](https://www.python.org/downloads/)
- Ensure Python is added to your system's PATH

#### 2. Install uv

- Copy based on your OS: <https://docs.astral.sh/uv/getting-started/installation/>
  - e.g. macOS: `curl -LsSf https://astral.sh/uv/install.sh | sh`

#### 3. Go to the backend directory

```bash
cd forum/backend
```

#### 4. Install Dependencies (syncing dependencies)

```bash
uv sync
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

<a name="envsetup"></a>
Where to find these?

- Go on [Supabase](https://supabase.io/) and create a new project
- Go to the project settings:
  - In the API section, you will find the `SUPABASE_URL` and `SUPABASE_KEY`
  - In the Database section, you will find the `DATABASE_URL` (you want a connection string)
- For most cases you will need to have the `AUTH_MIDDLEWARE_ENABLED` set to `true` and the `DEV_USER_EMAIL` and `DEV_USER_PASSWORD` set to your email and password
  - On your Supabase project, go to the `Auth` section and create a new user (you can manually set the email and password); then use these credentials in the `.env` file
- Go on [OpenAI](https://platform.openai.com/) and create a new project (or use an existing one)
  - You do not need this unless you use the OpenAI API

#### 5. Syncing the Database

- Run the following command to create the database tables:

```bash
uv run --env-file .env alembic upgrade head
```

#### 6. Running the Server

- With the virtual environment activated, run the following command:

```bash
uv run --env-file .env -m main
```

For more details on managing migrations and dependencies, go to `/backend/README.md`

## Contributing

Contributions are always welcome!

See `CONTRIBUTING.md` for ways to get started.

## License

[GNU](https://choosealicense.com/licenses/gpl-3.0/)
