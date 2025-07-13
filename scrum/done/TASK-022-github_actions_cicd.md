# TASK-022: GitHub Actions CI/CD Pipeline & Render Deployment Setup

**Stack**: DevOps  
**Type**: Infrastructure  
**Priority**: High  
**Estimation**: 8 story points  

## User Story

As a **development team**, I want a **comprehensive CI/CD pipeline using GitHub Actions** so that I can **automatically test, build, and deploy the Marbelle application** with confidence and consistency.

## Problem Statement

Currently, the Marbelle project lacks automated testing and deployment pipelines. Manual testing and deployment processes are error-prone, time-consuming, and don't scale well as the team grows. We need automated workflows to:

- Ensure code quality through automated testing and linting
- Catch issues early in the development process
- Automate deployment to production environments
- Maintain deployment consistency across environments

## Acceptance Criteria

### Backend CI/CD Pipeline
- [ ] **Automated Testing**: Run Django unit tests on every push and PR
- [ ] **Code Quality**: Run ruff linting and type checking
- [ ] **Database Tests**: Set up PostgreSQL service for test database
- [ ] **Security Scanning**: Basic dependency vulnerability checks
- [ ] **Python Version Matrix**: Test against Python 3.12
- [ ] **Coverage Reports**: Generate and report test coverage

### Frontend CI/CD Pipeline
- [ ] **Build Verification**: Ensure TypeScript compilation succeeds
- [ ] **Code Quality**: Run ESLint and type checking
- [ ] **Build Production**: Create optimized production build
- [ ] **Node Version Matrix**: Test against Node.js LTS versions
- [ ] **Bundle Analysis**: Report build size and performance metrics

### Deployment Pipeline
- [ ] **Docker Builds**: Build and tag Docker images for both backend and frontend
- [ ] **Registry Push**: Push successful builds to container registry
- [ ] **Environment Secrets**: Secure handling of environment variables and secrets
- [ ] **Deployment Automation**: Automated deployment to Render on main branch merges
- [ ] **Rollback Strategy**: Ability to rollback failed deployments

### Production Environment Setup
- [ ] **Render Configuration**: Set up Render services for backend, frontend, and database
- [ ] **Environment Variables**: Configure production environment variables
- [ ] **Domain Configuration**: Set up custom domain and SSL
- [ ] **Database Setup**: PostgreSQL database on Render
- [ ] **Static Files**: Proper handling of Django static files and React build assets

## Technical Requirements

### GitHub Actions Workflows

1. **Backend Workflow** (`.github/workflows/backend.yml`)
   - Trigger: Push to main, PRs to main, changes in `marbelle/backend/`
   - Services: PostgreSQL 16
   - Python: 3.12
   - Steps: Install deps → Run tests → Lint → Security scan

2. **Frontend Workflow** (`.github/workflows/frontend.yml`)
   - Trigger: Push to main, PRs to main, changes in `marbelle/frontend/`
   - Node.js: 18.x, 20.x LTS
   - Steps: Install deps → Lint → Type check → Build → Bundle analysis

3. **Deploy Workflow** (`.github/workflows/deploy.yml`)
   - Trigger: Push to main (after other workflows pass)
   - Build Docker images
   - Push to registry
   - Deploy to Render

### Render Services Configuration

1. **Backend Service** (Web Service)
   - Runtime: Docker
   - Auto-deploy: Yes
   - Health check: `/api/v1/health/`
   - Environment: Production Django settings

2. **Frontend Service** (Static Site)
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Redirects: SPA routing support

3. **Database Service**
   - PostgreSQL 16
   - Automatic backups
   - Connection via environment variables

## Dependencies

- **Prerequisite**: Current authentication system (TASK-007A)
- **Blocks**: Future feature deployments
- **Related**: API documentation should be updated with deployment URLs

## Definition of Done

- [ ] All GitHub Actions workflows are created and passing
- [ ] Backend tests run automatically on every PR
- [ ] Frontend builds and lints successfully on every PR
- [ ] Docker images are built and pushed to registry
- [ ] Render services are configured and deployed
- [ ] Production application is accessible and functional
- [ ] Environment variables are properly configured
- [ ] Documentation is updated with deployment information
- [ ] Rollback procedure is documented and tested

## Out of Scope

- Advanced monitoring and alerting (future task)
- Performance testing automation (future task)
- Multi-environment deployments (staging) (future task)
- Advanced security scanning beyond basic dependency checks

## Notes

- Use GitHub Actions secrets for sensitive data
- Ensure proper caching for Node.js and Python dependencies
- Consider cost implications of Render service tiers
- Plan for database migration handling in production
- Ensure proper error handling and notifications for failed deployments

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Render Documentation](https://render.com/docs)
- [Django Deployment Best Practices](https://docs.djangoproject.com/en/5.2/howto/deployment/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)