# ForumAI

> OUTDATED

[![CodeQL](https://github.com/ubclaunchpad/forum/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/ubclaunchpad/forum/actions/workflows/github-code-scanning/codeql) ![License](https://img.shields.io/github/license/ubclaunchpad/forum)
![Supabase](https://img.shields.io/badge/Supabase-connected-brightgreen)
![Deno Tests](https://img.shields.io/badge/Deno-Tests-passing?logo=deno&color=black)
[![Coverage](https://github.com/ubclaunchpad/forum/actions/workflows/coverage.yml/badge.svg?branch=dev)](https://github.com/ubclaunchpad/forum/actions/workflows/coverage.yml)

ForumAI is an online platform which enables AI assistance in structured academic forums, facilitating discussions between students and faculty.

## Features

- 24/7 AI assistance to help answer questions about course material, assignments and general logistics
- Discussions boards and Q&A forums for interaction between students, instructors and teaching assistants
- Anonymous posting and messaging for safe and inclusive discussions

## Prerequisites

- Node.js
- Yarn or npm
- Supabase CLI
- Deno (required for running tests)
- Docker (required for supabase start)

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

### Environment Variables For Frontend

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

#### 1. Install Supabase CLI

- Follow the instructions here to install the Supabase CLI: [Supabase CLI](https://supabase.io/docs/guides/cli)

#### 2. Start Supabase

Ensure Docker is installed and running before executing this command.

```bash
supabase start
```

#### 3. Apply Database Migrations

```bash
supabase db up
```

#### 4. Install Deno

- Follow the instructions here to install Deno: [Deno Installation](https://deno.land/manual/getting_started/installation)
- For VSCode users, you can also install the Deno extension: [Deno Extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)

#### 5. Running Tests using Deno

```bash
deno test --allow-all --coverage --env-file=./.env.local
```

If you do not have the [Deno extension installed](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno) in your IDE, you can run the tests using the following command:

```bash
deno test --allow-all --coverage --env-file=./.env.local --unstable --watch
```

### Environment Variables

Create a `.env` file with in the supabase folder with:

```txt
SUPABASE_URL="your_supabase_url"
SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
DATABASE_URL="your_database_url"

OPENAI_API_KEY=your_key_here
AUTH_MIDDLEWARE_ENABLED=true # or false
DEV_USER_EMAIL=your_email_here
DEV_USER_PASSWORD=your_password_here
DEV_LOGIN=true # or false

ENV=development # or production
```

<a name="envsetup"></a>
Where to find these?

- When you do `supabase start`, you will get an API URL, anon key, and service role key. Make sure you populate these in the `.env` file.
- For most cases you will need to have the `AUTH_MIDDLEWARE_ENABLED` set to `true` and the `DEV_USER_EMAIL` and `DEV_USER_PASSWORD` set to your email and password
  - On your Supabase project, go to the `Auth` section and create a new user (you can manually set the email and password); then use these credentials in the `.env` file
- Go on [OpenAI](https://platform.openai.com/) and create a new project (or use an existing one)
  - You do not need this unless you use the OpenAI API

### Development Resources

- Supabase CLI Documentation: [Supabase CLI](https://supabase.io/docs/guides/cli)
- Supabase Edge Functions: [Supabase Edge Functions](https://supabase.io/docs/guides/functions)
- Deno Documentation: [Deno Manual](https://deno.land/manual)
- Deno Setup for VSCode: [Deno Extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)

### Essential Commands for Local Development

#### Supabase Commands

- `supabase start` - Start the Supabase server
- `supabase stop` - Stop the Supabase server
- `supabase db up` - Apply database migrations
- `supabase db reset` - Reset the database

#### Supabase Edge Functions

- `supabase functions new function_name` - Create a new edge function
- `supabase functions deploy function_name` - Deploy an edge function

#### Deno Commands

- `deno test --allow-all --coverage=coverage` - Run tests with coverage
- `deno coverage --html` - Generate an HTML coverage report

## Contributing

Contributions are always welcome!

See `CONTRIBUTING.md` for ways to get started.

## License

[GNU](https://choosealicense.com/licenses/gpl-3.0/)
