# TASK-003: PostgreSQL Database Configuration

## TASK

## State: Backlog
## Story Points: 5
## Priority: High

**As a** developer  
**I want to** configure PostgreSQL as the primary database for the Django backend
**So that** we have a robust and persistent database for managing Marbelle’s inventory and user data

## Acceptance Criteria
- [ ] A PostgreSQL database service is defined in the project root `docker-compose.yml`.
- [ ] The database service uses PostgreSQL 16+, with a named Docker volume to persist data across container restarts.
- [ ] A dedicated database and user are created using environment variables (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`) set in `docker-compose.yml`.
- [ ] `psycopg2-binary` dependency added to Django `requirements.txt`.
- [ ] Django’s `settings.py` is updated to use PostgreSQL as the database backend.
- [ ] Connection is tested and verified using the Django ORM and admin interface (e.g., running python manage.py migrate and logging into /admin).
- [ ] A `.env` file is used to securely manage secrets in development.
- [ ] The PostgreSQL container starts successfully with `docker-compose up` without errors.
- [ ] The PostgreSQL instance is accessible using a client (e.g., `psql` via `docker exec`, or GUI tools like `DBeaver` or `pgAdmin`) using the defined credentials.


## Definition of Done
- [ ] All acceptance criteria met and verified.
- [ ] PostgreSQL connection details documented in `backend/README.md`.
- [ ] Database service integrated into `docker-compose.yml` with other services.
- [ ] Django migrations run successfully without errors.
- [ ] Ready for Django model development.