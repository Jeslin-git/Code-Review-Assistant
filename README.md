# AI-Powered Code Review Assistant

A full-stack web application that enables developers to upload source code projects and receive structured, AI-generated code reviews powered by any OpenAI-compatible API.

## Features

- **Authentication** — Secure registration and login with JWT
- **Project Management** — Create, view, and delete code review workspaces
- **ZIP Upload** — Upload project source code as a ZIP archive
- **Code Explorer** — Browse uploaded files in a tree view with file preview
- **AI Review Engine** — Run Security, Performance, or Code Quality reviews
- **Review History** — View all past AI reviews for a project
- **AI Chat** — Ask questions about your uploaded codebase
- **Configurable AI Providers** — Supports OpenAI, LM Studio, Ollama, OpenRouter

## Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS
- **Backend:** NestJS, TypeORM, PostgreSQL
- **Auth:** JWT + Passport + bcrypt
- **AI:** OpenAI-compatible REST API

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL
- An OpenAI API key or local model (LM Studio / Ollama)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Code-Review-Assistant
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=code_reviewer
JWT_SECRET=your_jwt_secret
PORT=3001
```

Create the database:

```bash
psql -U postgres -c "CREATE DATABASE code_reviewer;"
```

Start the backend:

```bash
npm run start:dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the frontend:

```bash
npm run dev
```

### 4. Configure AI Provider

1. Register and log in
2. Go to `/settings`
3. Enter your AI provider details:
   - **OpenAI:** `https://api.openai.com/v1`, your API key, `gpt-4o`
   - **LM Studio:** `http://localhost:1234/v1`, no key, your loaded model name
   - **Ollama:** `http://localhost:11434/v1`, no key, `llama3`
4. Click Save

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_HOST` | PostgreSQL host |
| `DATABASE_PORT` | PostgreSQL port |
| `DATABASE_USER` | PostgreSQL username |
| `DATABASE_PASSWORD` | PostgreSQL password |
| `DATABASE_NAME` | Database name |
| `JWT_SECRET` | Secret key for JWT signing |
| `PORT` | Backend port (default 3001) |
| `NEXT_PUBLIC_API_URL` | Backend URL for frontend |

## Project Structure

```
frontend/     # Next.js application
backend/      # NestJS application
README.md
ARCHITECTURE.md
AI_USAGE.md
```