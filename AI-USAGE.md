# AI Usage Report

## AI Tools Used

- **Claude (Anthropic)** — Primary development assistant for architecture planning, backend module implementation, and debugging
- **GitHub Copilot** — Inline code suggestions, encoding bug fixes, chat/history debugging

## What AI Generated

### Backend
- Entity definitions (User, Project, File, Review, AIProvider)
- AuthModule: JWT strategy, guards, bcrypt hashing
- ProjectsModule: CRUD service and controller
- FilesModule: ZIP extraction logic with UTF-16 encoding detection
- ReviewsModule: AI review engine, history retrieval, chat endpoint
- AIProviderModule: provider configuration endpoints
- System prompts for Security, Performance, and Code Quality review modes

### Frontend
- Login and Register pages
- Dashboard with project cards and create/delete modal
- Project workspace layout (file tree, preview panel, tabbed right panel)
- ReviewPanel, HistoryPanel, ChatPanel, FileTree components
- Axios API client with JWT interceptor
- Route protection middleware (proxy.ts)
- AI Provider settings page

## What Was Manually Written / Decided

- Overall architecture decisions (NestJS + PostgreSQL over FastAPI + MongoDB)
- Module structure and separation of concerns
- Decision to use dual token storage (localStorage + cookie) for middleware compatibility
- Decision to use JSONB column for review issues (flexible schema for AI output)
- CASCADE delete strategy across all relations
- ZIP filtering logic (node_modules, .git, dist exclusions)
- Debugging and integrating all modules together end to end

## Key Engineering Decisions

### Why NestJS over FastAPI?
NestJS enforces modular architecture out of the box with decorators, dependency injection, and guards — making the codebase more maintainable and closer to production standards.

### Why JSONB for issues?
AI responses have variable structure. JSONB allows storing the issues array without a rigid schema while still being queryable in PostgreSQL.

### Why OpenAI-compatible API format?
Using the standard `/chat/completions` format means the same backend code works with OpenAI, LM Studio, Ollama, and OpenRouter — zero code changes needed per provider.

### Why dual token storage?
Next.js edge middleware (proxy.ts) cannot read localStorage — it only has access to cookies. But client-side JS cannot read httpOnly cookies. Storing the token in both places solves this without requiring a full session management system.

## Prompts Used

Key prompts used during development:

- "Implement JWT authentication with NestJS Passport, bcrypt password hashing, and a JwtAuthGuard"
- "Build a ZIP upload endpoint using adm-zip that filters node_modules and saves file content to PostgreSQL"
- "Create an OpenAI-compatible review engine that takes a review mode (security/performance/quality) and returns structured JSON with summary, issues, and severity"
- "Build a Next.js project workspace with a file tree sidebar, code preview panel, and tabbed AI review/history/chat panel"