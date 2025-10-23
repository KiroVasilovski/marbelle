# Marbelle Project Guide for Claude Code

## Project Overview

Marbelle is a full-stack e-commerce platform for natural stone products (marble, tiles, mosaics).

**Stack**:
- **Backend**: Django 5.2 LTS + Python 3.12.11 + PostgreSQL 16+
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Shadcn UI
- **Infrastructure**: Docker Compose

**Monorepo Structure**:
- `marbelle/backend/` - Django REST API
- `marbelle/frontend/` - React SPA
- `scrum/` - User stories and task management

---

## On Startup: What to Read

When Claude Code starts a new session:

1. **Read** [CLAUDE.md](CLAUDE.md) - This file (project standards and workflow)
2. **Read** [history.md](history.md) - Recent development progress
3. **Check** `scrum/in_progress/` - Current tasks being worked on
4. **Ask user** what to work on today

**For detailed setup and commands**: See [marbelle/README.md](marbelle/README.md)

**For backend architecture**: See [marbelle/backend/README.md](marbelle/backend/README.md)

**For frontend structure**: See [marbelle/frontend/README.md](marbelle/frontend/README.md)

**For API reference**: See [API.md](API.md)

---

## Architecture Patterns

### Backend (Django)

**Request Flow**:
```
HTTP Request → View → Serializer → Service (business logic) → Repository (data access) → Database
```

**Key Rules**:
- **All business logic in Services** - Static methods only
- **All database queries in Repositories** - No direct ORM in services
- **Use `ResponseHandler`** from `core/` for all API responses
- **Type hints required** on all function signatures
- **Update API.md** when adding/modifying endpoints

**Details**: See [marbelle/backend/README.md](marbelle/backend/README.md)

### Frontend (React)

**Key Rules**:
- **NEVER hardcode text** - Always use `t()` from `react-i18next`
- **Add translations in all 3 languages** (English, German, Albanian)
- **Use TypeScript strictly** - No `any` types
- **Use Shadcn UI components**

**Details**: See [marbelle/frontend/README.md](marbelle/frontend/README.md)

---

## Development Workflow

### SCRUM Process

User stories are managed in `./scrum/` directory:

```
scrum/
├── backlog/       # New ideas (needs refinement)
├── sprint/        # Refined, ready to implement
├── in_progress/   # Currently being worked on
├── in_review/     # Completed, awaiting user review
├── done/          # Reviewed and approved
└── rejected/      # Will not be implemented
```

**Workflow**: Backlog → Sprint → In Progress → In Review → Done

### Session History

After each programming session:
- Document work completed in `history.md`
- Append to end of file (don't modify previous entries)
- Include session date
- Keep format consistent with existing entries

---

## Code Standards

### Python/Django
- **Linting**: `ruff check . --fix` (120 char line limit)
- **Testing**: Unit tests required for business logic
- **Indentation**: 4 spaces
- **Services**: Static methods only (stateless)
- **Repositories**: Optimized queries with `prefetch_related`/`select_related`

### TypeScript/React
- **Linting**: ESLint with Airbnb preset
- **Type Safety**: No `any` types, strict TypeScript
- **Indentation**: 4 spaces
- **i18n**: Always use `t()` for user-facing text
- **Components**: Functional components with hooks

### Documentation
- **API Changes**: Update `API.md` immediately when adding/modifying endpoints
- **Session Work**: Update `history.md` at end of each session
- **User Stories**: Keep files in correct `scrum/` folder

---

## Session Management (Important!)

Marbelle uses a **hybrid session approach** for Safari compatibility:

- **Chrome/Firefox/Edge**: HttpOnly cookies (`marbelle_sessionid`)
- **Safari/ITP**: `X-Session-ID` custom header fallback
- **Backend**: Checks header first, falls back to cookies
- **Frontend**: Automatically handles session persistence

---
