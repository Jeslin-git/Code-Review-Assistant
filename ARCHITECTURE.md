# Architecture Documentation

## Overview

The application follows a standard client-server architecture with a clear separation between the frontend, backend, and database layers.


## Frontend Architecture

Built with Next.js 16 (App Router), TypeScript, and Tailwind CSS.

### Structure
src/

├── app/

│   ├── login/          # Login page

│   ├── register/       # Registration page

│   ├── dashboard/      # Project management

│   ├── project/[id]/   # Core workspace (file explorer + AI review)

│   └── settings/       # AI provider configuration

├── components/

│   ├── FileTree.tsx    # File tree sidebar

│   ├── ReviewPanel.tsx # AI review trigger + results

│   ├── HistoryPanel.tsx# Past reviews list

│   └── ChatPanel.tsx   # AI chat interface

└── lib/

├── api.ts          # Axios instance with auto JWT header

└── auth.ts         # Token helpers (localStorage + cookie)

### Key Decisions

- **App Router** used for file-based routing and server/client component separation
- **Axios interceptor** automatically attaches `Authorization: Bearer` header to every request
- **Dual token storage** (localStorage + cookie) — localStorage for client reads, cookie for edge middleware route protection
- **proxy.ts** (Next.js middleware) protects all routes server-side before page render

## Backend Architecture

Built with NestJS following a modular, feature-based structure.

### Modules

| Module | Responsibility |
|--------|---------------|
| `AuthModule` | Registration, login, JWT strategy, guards |
| `ProjectsModule` | CRUD for user project workspaces |
| `FilesModule` | ZIP upload, extraction, file storage |
| `ReviewsModule` | AI review engine, history, chat |
| `AIProviderModule` | User AI provider configuration |

### Request Flow
HTTP Request

↓

JwtAuthGuard (validates Bearer token)

↓

Controller (routes request)

↓

Service (business logic)

↓

TypeORM Repository (database)

↓

PostgreSQL

## Database Design

### Tables

**users**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| email | VARCHAR | Unique |
| password | VARCHAR | bcrypt hashed |
| name | VARCHAR | |

**projects**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | VARCHAR | |
| description | VARCHAR | Nullable |
| createdAt | TIMESTAMP | Auto |
| userId | UUID | FK → users |

**files**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | VARCHAR | Filename |
| path | VARCHAR | Relative path in ZIP |
| content | TEXT | Raw source code |
| projectId | UUID | FK → projects |

**reviews**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| templateMode | VARCHAR | security/performance/quality |
| summary | TEXT | AI summary |
| issues | JSONB | Array of issues with severity |
| createdAt | TIMESTAMP | Auto |
| projectId | UUID | FK → projects |

**ai_providers**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | VARCHAR | Provider label |
| baseUrl | VARCHAR | API endpoint |
| apiKey | VARCHAR | Nullable |
| modelName | VARCHAR | Model identifier |
| isActive | BOOLEAN | One active per user |
| userId | UUID | FK → users |

### Cascade Deletes

All foreign keys use `onDelete: CASCADE` — deleting a user removes all their projects, files, reviews, and provider configs automatically.

## AI Integration Flow
User clicks "Run AI Review"

↓

POST /reviews/trigger { projectId, mode }

↓

Fetch active AIProvider config for user (baseUrl, apiKey, modelName)

↓

Fetch all File records for project (raw source code)

↓

Build system prompt based on review mode:

security: hardcoded credentials, injection risks, auth issues
performance: slow operations, inefficient queries
quality: naming, structure, readability

↓

POST {baseUrl}/chat/completions (OpenAI-compatible format)

↓

Parse JSON response (summary + issues array)

↓

Save Review record to PostgreSQL

↓

Return structured result to frontend

↓

Display color-coded by severity (critical=red, high=orange, medium=yellow, low=green)
