# ForumAI

Welcome to the ForumAI! This is a platform for structured academic community discussions and interactions with AI assistance.

## Features

- User registration and authentication
- Create and manage discussion threads
- Reply to existing discussions
- User profiles
- Search functionality

## Getting Started

### Prerequisites

- Node.js
- Supabase
- Python
- uv (Python packaging tool)
- npm or yarn

### Installation

Clone the repository

```bash
git clone https://github.com/yourusername/forum.git
```

#### Frontend

1. Install frontend dependencies

```bash
cd frontend/
npm install
```

2. Configure environment variables

```bash
touch .env
```
Paste these into your .env file
```bash
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
OPENAI_API_KEY=YOUR_OPEN_API_KEY
DATABASE_URL=YOUR_DATABASE_URL
NEXT_PUBLIC_API_BASE_URL=YOUR_API_URL

```

3. Start the application

```bash
npm run dev
```


#### Backend

1. Create a local Supabase project to use as your development environment

2. Install backend dependencies

```bash
cd backend/
uv sync
```

3. Configure environment variables

```bash
touch .env
```
Paste these into your .env file
```bash
OPENAI_API_KEY=YOUR_KEY_HERE
DATABASE_URL=YOUR_DATABASE_URL
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_KEY=YOUR_SUPABASE_KEY
AUTH_MIDDLEWARE_ENABLED=true # or false
DEV_USER_EMAIL=YOUR_EMAIL_HERE
DEV_USER_PASSWORD=YOUR_DEV_USER_PASSWORD
DEV_LOGIN=true # or false

ENV=development # or production

```

4. Sync the database

```bash
uv run --env-file .env alembic upgrade head
```

5. Start the application

```bash
uv run --env-file .env -m main
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.
