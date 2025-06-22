# Task TASK-002: Project Frontend Foundation Setup

## TASK

## State: Backlog
## Story Points: 5
## Priority: High

**As a** developer  
**I want** to setup a React TypeScript project foundation
**So that** we establish a robust, modern, and efficient development environment for building the e-commerce web application's user interface.


## Acceptance Criteria  
- [ ] React TypeScript project successfully initialized using Vite CLI in the `/marbelle/frontend` directory.
- [ ] Essential core dependencies installed: React, ReactDOM, TypeScript types, React Router DOM.
- [ ] **Tailwind CSS is installed and configured** according to official documentation, enabling utility-first styling.
- [ ] **Shadcn UI components are set up for installation/copying**, with at least one basic component (e.g., Button) copied and styled correctly.
- [ ] **ESLint configured with Airbnb preset** and Prettier integrated to enforce:
    - 4 spaces for indentation
    - Automatic formatting on save/commit
- [ ] **React Router setup** with basic routing structure (Home, Products, About pages as placeholders).
- [ ] **Basic component structure created**: Layout, Header, Footer components with Tailwind styling.
- [ ] Development server starts without errors on `npm run dev`.
- [ ] Production build process runs successfully, generating optimized static assets in `/dist`.
- [ ] `Dockerfile` created for frontend containerization.
- [ ] `docker-compose.yml` updated to include frontend service.
- [ ] Docker containers build and run successfully with frontend accessible.

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Code follows ESLint Airbnb standards with 4-space indentation
- [ ] No linting/TypeScript errors
- [ ] Frontend setup instructions documented in `frontend/README.md`
- [ ] Ready for UI component development