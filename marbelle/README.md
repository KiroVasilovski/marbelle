# Marbelle Development Environment

Full-stack e-commerce application for natural stone products.

## Stack

- **Backend**: Django 5.2 LTS + Python 3.12.11 + PostgreSQL 16+
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Shadcn UI
- **Infrastructure**: Docker Compose

## Quick Start

```bash
# From project root (marbelle/)
docker-compose up --build

# In a new terminal - run migrations
docker-compose exec backend python manage.py migrate

# Create admin user
docker-compose exec backend python manage.py createsuperuser
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1/
- Admin Panel: http://localhost:8000/admin/

## Health Check

```bash
# Check all containers running
docker-compose ps

# Test services
curl http://localhost:8000/health/  # Backend
curl http://localhost:3000/         # Frontend

# Verify database connection
docker-compose exec backend python manage.py check

# Test application
docker-compose exec backend python manage.py test
```

## Common Commands

All commands run from the project root (`marbelle/`).

```bash
# Start/Stop services
docker-compose up                    # Start all services (foreground)
docker-compose up -d                 # Start all services (background)
docker-compose up --build            # Rebuild and start
docker-compose down                  # Stop all services
docker-compose down -v               # Stop and remove volumes (clears database)

# Backend
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py test
docker-compose exec backend ruff check . --fix

# Frontend
docker-compose exec frontend npm run lint
docker-compose exec frontend npm run build

# Database
docker-compose exec postgres psql -U marbelle_user -d marbelle_db
docker-compose exec postgres pg_dump -U marbelle_user marbelle_db > backup.sql

# Logs
docker-compose logs -f backend       # Follow backend logs
docker-compose logs -f frontend      # Follow frontend logs
```

## Troubleshooting

```bash
# Check containers status
docker-compose ps

# Restart a service
docker-compose restart backend

# View logs
docker-compose logs backend

# Port conflicts - stop conflicting services
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # Database
```

## Documentation

- [Backend Guide](backend/README.md) - Django API setup and architecture
- [Frontend Guide](frontend/README.md) - React app setup and components
- [Project Guidelines](../CLAUDE.md) - SCRUM workflow and standards
- [API Documentation](../API.md) - Complete API endpoint reference