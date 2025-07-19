# TASK-023: Production Server Setup (Backend)

## State: Backlog
## Story Points: 10
## Priority: Low
## Stack: Backend 

## Dependencies
- None

**As a** system administrator/devops engineer (or "backend developer with deployment responsibilities")  
**I want** to configure our Django backend to run on a production-ready WSGI/ASGI server within Docker  
**So that** the application is robust, performant, and secure for live traffic.

## Current Issue
Our current Django development server displays a critical warning, explicitly stating it's unsuitable for production use. Running python manage.py runserver in a production environment poses significant security risks and performance limitations.

## Acceptance Criteria  

### Must Have
- [ ] The Django application is served by Gunicorn (WSGI) in the production Docker environment.
- [ ] A dedicated Gunicorn configuration file (gunicorn_config.py or similar) is created with appropriate production settings (e.g., binding to 0.0.0.0:8000 or a Unix socket).
- [ ] The production Docker setup starts Gunicorn instead of the Django development server.
- [ ] The Django development server remains functional and the default for local development.
- [ ] Comprehensive documentation for running the application in both development and production modes is updated in README.md.
- [ ] Running the application in production mode no longer displays the development server warning.

### Should Have
- [ ] Configure Gunicorn with optimal worker settings for the application
- [ ] Add health check endpoint for monitoring
- [ ] Configure proper logging for production server
- [ ] Set up graceful shutdown handling

### Won't Have
- [ ] Explore Uvicorn/ASGI setup for future async capabilities
- [ ] Add server monitoring/metrics configuration
- [ ] Configure reverse proxy headers handling

## Technical Requirements

### Server Configuration
- Use Gunicorn as primary WSGI server
- Configure appropriate number of workers
- Set proper timeout values
- Enable access and error logging

### Docker Integration
- Separate Dockerfile.dev and Dockerfile for production
- Update docker-compose.yml with production service
- Maintain development server for local development

### Environment Variables
- `DJANGO_ENV` to distinguish dev/prod
- `GUNICORN_WORKERS` for worker count configuration
- `GUNICORN_TIMEOUT` for request timeout

## Dependencies
- None (can be implemented independently)

## Definition of Done
- [x] Task moved to sprint/ when ready for implementation
- [ ] Gunicorn successfully serves Django application
- [ ] No production server warnings in logs
- [ ] Documentation updated with production setup instructions
- [ ] Docker configuration supports both dev and prod modes
- [ ] Code reviewed and approved
- [ ] Task moved to done/ after completion

## Notes
- Keep development server available for local development
- Ensure production configuration doesn't break existing development workflow
- Consider future ASGI migration path when designing configuration