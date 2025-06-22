# Task TASK-001: Project Backend Foundation Setup

## TASK

## State: Backlog
## Story Points: 5
## Priority: High

**As a** developer  
**I want** to setup a Django project foundation
**So that** I have a solid base for building the e-commerce web app with optimal performance and developer experience

## Acceptance Criteria  
- [ ] Django 5.2 LTS project initialized under the `/marbelle/backend` directory.
- [ ] Project structure follows Django best practices:
  - Separate settings modules (base/dev/prod)
  - Environment variables via `.env` (using `python-dotenv`)
  - `.gitignore` excluding sensitive files and build artifacts
  - `requirements.txt` with core dependencies
- [ ] Initial Django apps created: `users`, `products`, `orders`, `core`
- [ ] Development server runs without errors on `python manage.py runserver`
- [ ] `Dockerfile` created for backend containerization
- [ ] `docker-compose.yml` created for development environment
- [ ] Docker containers build and run successfully
- [ ] Basic project documentation in `backend/README.md`


## Definition of Done
- [ ] All acceptance criteria met
- [ ] Code follows PEP 8 standards
- [ ] No linter errors (ruff with 120 char limit)
- [ ] Backend setup instructions documented in `backend/README.md`
- [ ] Ready for database integration task