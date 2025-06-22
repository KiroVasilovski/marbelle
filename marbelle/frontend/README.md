# Marbelle Frontend

React TypeScript frontend for the Marbelle e-commerce natural stone application.

## Technology Stack

- **React**: 18+ with TypeScript
- **Build Tool**: Vite 6.3+
- **Styling**: Tailwind CSS with Shadcn UI components
- **Routing**: React Router DOM
- **Code Quality**: ESLint with Airbnb preset, Prettier
- **Package Manager**: npm

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                  # Shadcn UI components
│   │   │   └── button.tsx
│   │   └── layout/              # Layout components
│   │       ├── Layout.tsx
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── pages/                   # Page components
│   │   ├── Home.tsx
│   │   ├── Products.tsx
│   │   └── About.tsx
│   ├── lib/
│   │   └── utils.ts             # Utility functions
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styles with Tailwind directives
├── public/                      # Static assets
├── package.json                 # Dependencies and scripts
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── .eslintrc.cjs               # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── Dockerfile                  # Docker container configuration
└── nginx.conf                  # Nginx configuration for production
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Development Server

```bash
# Start development server
npm run dev

# The application will be available at http://localhost:5173
```

### 3. Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### 4. Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint --fix

# Format code with Prettier
npx prettier --write src/
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create optimized production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## Development Standards

### Code Style
- **Indentation**: 4 spaces for all files (TypeScript, HTML, CSS)
- **ESLint**: Airbnb preset with TypeScript support
- **Prettier**: Automatic code formatting on save/commit
- **File Naming**: PascalCase for components, camelCase for utilities

### Component Structure
- Use functional components with TypeScript
- Implement proper prop types and interfaces
- Follow React hooks best practices
- Use Tailwind CSS for styling
- Leverage Shadcn UI components when available

### Routing
- Nested routing structure with Layout component
- Home, Products, and About pages implemented
- Client-side routing handled by React Router DOM

## Docker Development

```bash
# From project root directory (marbelle/)
docker-compose up --build

# Frontend will be available at http://localhost:3000
# Backend API at http://localhost:8000
```

## Tailwind CSS & Shadcn UI

### Tailwind Configuration
- Custom color scheme with CSS variables for theming
- Dark mode support (class-based)
- Responsive breakpoints configured
- Animation support with tailwindcss-animate

### Shadcn UI Components
- Button component implemented as example
- Utility functions in `src/lib/utils.ts`
- Path alias `@/` configured for clean imports
- Ready for additional component installation

### Adding New Shadcn Components
```bash
# Example: Add a new component (when shadcn CLI is available)
npx shadcn-ui@latest add dialog
```

## Environment Configuration

### Development
- Vite dev server with hot reload
- Source maps enabled
- React DevTools support

### Production
- Optimized bundle with code splitting
- Asset optimization and compression
- Nginx configuration for SPA routing

## Integration with Backend

- Backend API available at `http://localhost:8000`
- Ready for API integration and authentication
- CORS will be configured in backend for frontend communication

## Next Steps

- API client setup for backend communication
- Authentication system integration
- Product catalog UI development
- Shopping cart implementation
- Form validation and error handling