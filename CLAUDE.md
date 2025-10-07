# Project Overview: Marbelle E-commerce Web App
Marbelle is a full-stack e-commerce application designed for architects, designers, contractors, and homeowners to browse and order natural stone products online.

- **Backend**: Python with Django, utilizing a PostgreSQL database.
- **Frontend**: React with TypeScript.
- **Architecture**: Monorepo structure, with the backend code located in the `./marbelle/backend` directory and the frontend code in the `./marbelle/frontend` directory.

### Key Features:
- **Product Catalog**: Users can explore categorized catalogs (slabs, tiles, mosaics) with high-resolution images and detailed specifications (dimensions, finish, origin).
- **Interactive Area Calculator**: Helps users calculate material needs.
- **Shopping Cart**: Users can add items to a cart with Safari-compatible session management (hybrid cookie/header approach).
- **Custom Quotes**: Users can request custom quotes, including options for edge profiles or polishing.
- **Payment Gateway**: Integrated payment processing.
- **User Accounts & Order Management**: Modular Django monolith handles user accounts, inventory, batch tracking, and order workflows.
- **Asynchronous Tasks**: Celery tasks manage PDF quote generation, email notifications, and low-stock alerts.

## Development Workflow: SCRUM and User Stories
We will follow a SCRUM-inspired workflow, using user stories to progressively build the application.

- **Scrum Folder Structure**: All user stories and tasks are managed within the `./scrum` directory, which contains the following subdirectories:
  - `./scrum/backlog`: Initial place for new user stories (Markdown files).
  - `./scrum/sprint`: Refined user stories ready for implementation.
  - `./scrum/in_progress`: User stories currently being worked on.
  - `./scrum/in_review`: Completed work awaiting my review.
  - `./scrum/done`: Fully reviewed and completed user stories.
  - `./scrum/rejected`: User stories that will not be pursued.

### Workflow Steps:
1. **Backlog & Refinement**: New user stories are initially placed in `./scrum/backlog`. Before moving a ticket to `./scrum/sprint`, we will conduct refinement sessions. During these sessions, Claude and I will discuss all details of the ticket to ensure it's clearly defined and ready for implementation.
2. **Sprint**: Once refined, user stories are moved to `./scrum/sprint`. These tickets are considered well-defined and ready to be picked up.
3. **In Progress**: When work begins on a ticket, it is moved from `./scrum/sprint` to `./scrum/in_progress`.
4. **In Review**: Upon completion and successful testing (where applicable), the ticket is moved to `./scrum/in_review`. I will then perform a self-review of the work.
5. **Done**: If I am satisfied with the work in `./scrum/in_review`, the ticket is moved to `./scrum/done`.
6. **Rejected**: Any tickets that will not be worked on for any reason will be moved to `./scrum/rejected`.

**Note**: Each user story is represented by a single Markdown file (.md) within these folders.

## Testing Strategy
- **Backend (Django/Python)**:
  - **Test-Driven Development (TDD) is encouraged.**
  - **Unit tests are required** for core functionalities and critical code parts. We aim for focused unit tests, avoiding excessive or unnecessary testing.
  - **Integration tests** may be added on demand for specific complex interactions.

- **Frontend (React/TypeScript)**:
  - Initially, **no automated frontend tests** will be set up.
  - Cypress may be introduced for frontend testing at a later stage, if deemed necessary.

## Development Standards

### Technical Stack
- **Backend**: Django 5.2 LTS with Python 3.12.11
- **Database**: PostgreSQL 16+ (PostGIS may be added later for spatial features)
- **Frontend**: React with TypeScript, built with Vite
- **UI Framework**: Tailwind CSS with Shadcn UI components
- **Routing**: React Router DOM
- **Containerization**: Docker with Docker Compose for development environment

### Django Project Structure
- **Initial Apps**: `users`, `products`, `orders`, `core`
- **Settings**: Separate modules (base/dev/prod) in `settings/` directory
- **Environment Variables**: Managed via `.env` files using `python-dotenv`
- **Dependencies**: Managed in `requirements.txt`

### Code Standards
- **Python Linting**: ruff with 120 character line limit
- **JavaScript/TypeScript**: ESLint with Airbnb preset
- **Indentation**: 4 spaces for all code (Python, TypeScript, HTML, CSS)
- **Formatting**: Prettier with automatic formatting on save/commit

### Testing Strategy
- **Backend**: Test-Driven Development (TDD) encouraged, unit tests required for core functionality
- **Frontend**: Minimal automated testing initially, may add Cypress later
- **Database**: Separate test database configurations when needed

### Development Workflow
- **Containerization**: All services run via Docker Compose
- **Environment**: Development environment fully containerized
- **Database Client**: DBeaver for PostgreSQL management (no pgAdmin needed)

### API Documentation
- **API Documentation**: All API endpoints are documented in `API.md` file at the project root
- **Documentation Standards**: Follow REST API documentation best practices with request/response examples
- **Format**: Markdown format with consistent structure for endpoints, authentication, and examples
- **Maintenance**: API documentation must be updated whenever new endpoints are added or existing ones are modified

### Session Management & Safari Compatibility
- **Cookie-Based Sessions**: Chrome, Firefox, and Edge use secure HttpOnly cookies (`marbelle_sessionid`)
- **Header-Based Sessions**: Safari and cookie-blocked browsers use `X-Session-ID` custom header
- **Hybrid Approach**: Backend checks header first, then falls back to cookies
- **Frontend Automatic**: Frontend automatically handles session persistence (cookies or localStorage)
- **Security**: Prioritizes HttpOnly cookies when available; header fallback only when cookies fail
- **Documentation**: See `SAFARI_SESSION_FIX.md` for deployment and troubleshooting

## Session History
To keep Claude informed and updated on our progress, a file named `history.md` exists at the root of the project.

- After each programming session, we will collaboratively document the work completed during that session in `history.md`.
- Each session's documentation must be appended to the end of the file and clearly separated from previous entries.
- Every entry must include the date of the session.

## Frontend Internationalization System
The frontend uses a professional internationalization (i18n) system built with `react-i18next` to support multiple languages and maintain consistency across all user-facing text.

### Current Language Support
- **English (en)** - Primary language and source of truth
- **German (de)** - Complete translations for German market
- **Albanian (sq)** - Complete translations for Albanian market

### Usage Instructions
**For all new frontend components, ALWAYS use translations instead of hardcoded text:**

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
    const { t } = useTranslation();
    
    return (
        <div>
            <h1>{t('section.title')}</h1>
            <p>{t('section.welcome', { firstName: user.firstName })}</p>
        </div>
    );
};
```

### Adding New Translations
1. **Add to English**: Update `src/i18n/locales/en.json` with new translation keys
2. **Update Other Languages**: Add corresponding translations to `de.json` and `sq.json`
3. **TypeScript Support**: The system automatically provides type-safe translation keys
4. **Use in Components**: Replace hardcoded text with `t()` calls

### Translation Key Structure
- `common.*` - Common UI elements (buttons, loading states)
- `auth.*` - Authentication flows (login, register, password reset)
- `header.*` - Navigation and header elements
- `footer.*` - Footer content and links
- `pages.*` - Page-specific content (home, about, products)
- `validation.*` - Form validation messages
- `dashboard.*` - User dashboard features (profile, addresses, orders)
- `shipping.*` - Shipping and language selection

### Examples
```typescript
// Simple translation
const title = t('auth.login.title');

// Translation with variables
const welcome = t('header.welcome', { firstName: user.firstName });

// Form validation
const validation = {
    email: [{
        validator: validationRules.required,
        message: t('validation.emailRequired')
    }]
};
```

### Language Management
```typescript
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    
    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng); // Automatically saves to localStorage
    };
};
```

### Important Rules
- **NEVER use hardcoded text** in JSX or component logic
- **ALWAYS use the `t()` function** for user-facing text
- **English is the source of truth** - all new keys must be added to `en.json` first
- **Maintain consistency** across all language files
- **Use descriptive key names** that clearly indicate the text purpose
- **Support variable interpolation** with `{{variableName}}` syntax
- **Follow the established key structure** for organization
