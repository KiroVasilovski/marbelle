# Marbelle E-commerce Development Environment

Full-stack e-commerce application for natural stone products, designed for architects, designers, contractors, and homeowners.

## Architecture

- **Backend**: Django 5.2 LTS with Python 3.12.11
- **Frontend**: React with TypeScript, built with Vite
- **Database**: PostgreSQL 16+
- **Infrastructure**: Docker Compose for development environment
- **UI Framework**: Tailwind CSS with Shadcn UI components

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.12+ (for local backend development)

### 1. Start Full Development Environment

```bash
# Clone and navigate to project
cd /path/to/marbelle

# Start all services (PostgreSQL + Django + React)
docker-compose up --build

# Wait for services to start, then access:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
# - Database: localhost:5432
```

### 2. Access Applications

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | React application |
| **Backend** | http://localhost:8000 | Django admin & API |
| **Database** | localhost:5432 | PostgreSQL (see credentials below) |

## Testing the Environment

### Full Stack Health Check

```bash
# 1. Check all containers are running
docker-compose ps

# 2. Test backend health
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/
# Expected: 200

# 3. Test frontend health  
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
# Expected: 200

# 4. Test database connection
docker-compose exec backend python manage.py check
# Expected: "System check identified no issues"
```

### Backend Testing

```bash
# Run Django system checks
docker-compose exec backend python manage.py check

# Run test suite
docker-compose exec backend python manage.py test

# Check database migrations
docker-compose exec backend python manage.py showmigrations

# Run code linting
docker-compose exec backend ruff check .

# Access Django admin
# Navigate to http://localhost:8000/admin/
```

### Frontend Testing

```bash
# Run ESLint
docker-compose exec frontend npm run lint

# Build production version
docker-compose exec frontend npm run build

# Check for TypeScript errors
docker-compose exec frontend npm run build
```

### Database Testing

```bash
# Connect to PostgreSQL directly
docker-compose exec postgres psql -U marbelle_user -d marbelle_db

# Check database tables
docker-compose exec backend python manage.py dbshell
```

## Development Workflow

### Starting Services Individually

```bash
# Start only database
docker-compose up -d postgres

# Start backend + database
docker-compose up -d postgres backend

# Start everything
docker-compose up -d
```

### Local Development (Alternative)

```bash
# Frontend (local development)
cd frontend
npm install
npm run dev
# Available at http://localhost:3000

# Backend (local development with Docker DB)
docker-compose up -d postgres
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py runserver
# Available at http://localhost:8000
```

### Environment Configuration

**Database Credentials:**
- Host: `postgres` (Docker) / `localhost` (local)
- Port: `5432`
- Database: `marbelle_db`
- Username: `marbelle_user`
- Password: `marbelle_password`

**Environment Files:**
- Backend: `backend/.env`
- Frontend: Environment variables handled by Vite

## Development Commands

### Backend Commands

```bash
# Django management commands
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py collectstatic

# Code quality
docker-compose exec backend ruff check .
docker-compose exec backend ruff check . --fix

# Database operations
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py dbshell
```

### Frontend Commands

```bash
# Development
docker-compose exec frontend npm run dev
docker-compose exec frontend npm run build
docker-compose exec frontend npm run preview

# Code quality
docker-compose exec frontend npm run lint
docker-compose exec frontend npm run lint --fix
```

### Database Commands

```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U marbelle_user -d marbelle_db

# Backup database
docker-compose exec postgres pg_dump -U marbelle_user marbelle_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U marbelle_user -d marbelle_db < backup.sql
```

## Troubleshooting

### Common Issues

**Backend can't connect to database:**
```bash
# Check if postgres container is running
docker-compose ps postgres

# Restart backend with fresh environment
docker-compose restart backend
```

**Frontend styling not loading:**
```bash
# Clear node_modules and reinstall
docker-compose exec frontend rm -rf node_modules package-lock.json
docker-compose exec frontend npm install
```

**Port conflicts:**
```bash
# Check what's using ports 3000, 8000, 5432
lsof -i :3000
lsof -i :8000
lsof -i :5432

# Stop conflicting services or change ports in docker-compose.yml
```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f backend
```

## Project Structure

```
marbelle/
    backend/                   # Django backend
        marbelle/              # Main Django project
            settings/          # Environment-specific settings
        users/                 # User management app
        products/              # Product catalog app
        orders/                # Orders and cart app
        core/                  # Shared utilities app
        requirements.txt       # Python dependencies
        .env                   # Environment variables
        Dockerfile             # Backend container config
    frontend/                  # React frontend
        src/
           components/         # React components
           pages/              # Page components
           lib/                # Utilities
        package.json           # Node.js dependencies
        Dockerfile             # Frontend container config
    docker-compose.yml         # Multi-service configuration
    README.md                  # This file
```

## Next Steps

1. **Review completed tasks** in `scrum/done/`
2. **Pick up new work** from `scrum/sprint/`
3. **Database development** with models and migrations
4. **API development** for frontend-backend communication
5. **Authentication system** implementation
6. **Product catalog** development

## Related Documentation

- [Backend Setup Guide](backend/README.md)
- [Frontend Setup Guide](frontend/README.md)
- [SCRUM Workflow](../CLAUDE.md)
- [Development History](../history.md)