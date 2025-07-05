# Marbelle Frontend

React TypeScript frontend for the Marbelle e-commerce natural stone application.

## Technology Stack

- **React**: 19+ with TypeScript
- **Build Tool**: Vite 6.3+
- **Styling**: Tailwind CSS with Shadcn UI components
- **Routing**: React Router DOM
- **API Client**: Axios with interceptors
- **Authentication**: JWT with automatic token refresh
- **Storage**: Centralized LocalStorage/SessionStorage services
- **Code Quality**: ESLint with Airbnb preset, Prettier
- **Package Manager**: npm

## Project Structure

### Feature-Based Architecture

The project follows a **feature-based architecture** for better scalability and maintainability:

```
frontend/
├── src/
│   ├── features/                # Primary organization by business domain/feature
│   │   └── auth/               # Authentication feature
│   │       ├── login/
│   │       │   ├── LoginForm.tsx
│   │       │   └── LoginPage.tsx
│   │       ├── register/
│   │       │   ├── RegisterForm.tsx
│   │       │   ├── RegisterPage.tsx
│   │       │   ├── EmailVerification.tsx
│   │       │   └── EmailVerifyPage.tsx
│   │       ├── password-reset/
│   │       │   ├── PasswordResetRequest.tsx
│   │       │   ├── PasswordResetConfirm.tsx
│   │       │   └── PasswordResetPage.tsx
│   │       ├── hooks/           # Auth-specific hooks
│   │       ├── services/        # Auth-specific services/API calls
│   │       │   └── authService.ts
│   │       ├── types/           # Auth-specific types
│   │       │   └── auth.ts
│   │       └── AuthContext.tsx  # Auth-specific context
│   │
│   ├── shared/                  # Global, highly reusable elements across features
│   │   ├── api/                 # Central API client and configurations
│   │   │   ├── ApiClient.ts     # Central class for all API requests
│   │   │   ├── apiConfig.ts     # Base URL, default headers, timeouts, etc.
│   │   │   └── interceptors.ts  # Request/response interceptors
│   │   │
│   │   ├── storage/             # Central classes for local/session storage
│   │   │   ├── LocalStorageService.ts
│   │   │   └── SessionStorageService.ts
│   │   │
│   │   ├── components/
│   │   │   ├── ui/              # Generic UI components (Shadcn)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   └── label.tsx
│   │   │   ├── layout/          # Application-level layout components
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Layout.tsx
│   │   │   └── ProtectedRoute.tsx # Route protection component
│   │   ├── hooks/               # Generic, reusable hooks
│   │   │   └── useFormValidation.ts
│   │   ├── lib/                 # Generic utility functions
│   │   │   ├── utils.ts
│   │   │   └── validation.ts
│   │   └── types/               # Global, common types
│   │       └── common.ts
│   │
│   ├── pages/                   # Top-level page components
│   │   ├── Home.tsx
│   │   ├── Products.tsx
│   │   └── About.tsx
│   │
│   ├── App.tsx                  # Main application component, handles routing
│   ├── main.tsx                 # Application entry point
│   ├── index.css                # Global styles
│   └── vite-env.d.ts
│
├── .env                         # Environment variables
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies and scripts
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── .eslintrc.cjs               # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── Dockerfile                  # Docker container configuration
└── nginx.conf                  # Nginx configuration for production
```

### Architecture Benefits

- **🎯 Feature Isolation**: Each feature contains its own components, services, and types
- **📦 Shared Resources**: Common utilities and components are centralized in `/shared`
- **🔧 Easy Maintenance**: Related code is co-located, making changes easier
- **📈 Scalability**: Adding new features (products, orders) follows the same pattern
- **🧪 Testability**: Feature-based structure makes testing more focused

## Environment Configuration

### Environment Variables

Create a `.env` file in the frontend root directory:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Environment
VITE_APP_ENV=development

# Debug settings (optional)
VITE_DEBUG_API=true
VITE_DEBUG_AUTH=true
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

## Authentication System

### Features Implemented

- **✅ Complete Authentication Flow**: Registration, login, logout, email verification
- **✅ Password Reset**: Request and confirmation with secure tokens
- **✅ JWT Token Management**: Automatic refresh with request queuing
- **✅ Secure Storage**: LocalStorage/SessionStorage with "Remember Me" functionality
- **✅ Protected Routes**: Route-level authentication guards
- **✅ Form Validation**: Real-time validation with password strength indicators

### Authentication Components

```typescript
// Available authentication components
import { LoginForm } from './features/auth/login/LoginForm';
import { RegisterForm } from './features/auth/register/RegisterForm';
import { PasswordResetRequest } from './features/auth/password-reset/PasswordResetRequest';
import { EmailVerification } from './features/auth/register/EmailVerification';
import { ProtectedRoute } from './shared/components/ProtectedRoute';

// Authentication context
import { useAuth } from './features/auth/AuthContext';
```

### Using Authentication

```typescript
// In any component
import { useAuth } from './features/auth/AuthContext';

function MyComponent() {
    const { user, isAuthenticated, login, logout } = useAuth();
    
    // Component logic here
}
```

## API Client System

### Central API Client

The application uses a centralized API client with Axios:

```typescript
// Features
- ✅ Automatic token injection
- ✅ Token refresh with request queuing
- ✅ Request/Response interceptors
- ✅ Centralized error handling
- ✅ TypeScript support
- ✅ Environment-based configuration
```

### Using the API Client

```typescript
import { apiClient } from './shared/api/ApiClient';

// GET request
const response = await apiClient.get<UserData>('/users/profile');

// POST request
const response = await apiClient.post<LoginResponse>('/auth/login', {
    email: 'user@example.com',
    password: 'password'
});
```

### Storage Services

Centralized storage management:

```typescript
import { localStorageService } from './shared/storage/LocalStorageService';
import { sessionStorageService } from './shared/storage/SessionStorageService';

// Type-safe storage operations
localStorageService.setItem('userData', { name: 'John' });
const userData = localStorageService.getItem<UserData>('userData');
```

## Adding New Features

### 1. Create Feature Directory

```bash
mkdir -p src/features/products/{components,services,types,hooks}
```

### 2. Follow the Pattern

```
src/features/products/
├── components/
│   ├── ProductList.tsx
│   └── ProductCard.tsx
├── services/
│   └── productService.ts
├── types/
│   └── product.ts
├── hooks/
│   └── useProducts.ts
└── ProductsContext.tsx (if needed)
```

### 3. Export from Feature

```typescript
// src/features/products/index.ts
export { ProductList } from './components/ProductList';
export { productService } from './services/productService';
export type { Product } from './types/product';
```

## Integration with Backend

- **✅ Backend API**: Configured for `http://localhost:8000/api/v1`
- **✅ CORS Setup**: Frontend development server supported
- **✅ Authentication**: JWT-based authentication fully integrated
- **✅ API Documentation**: All endpoints documented in backend API.md

## Development Workflow

### Code Organization Rules

1. **Features**: Business domain-specific code goes in `/features`
2. **Shared**: Reusable utilities and components go in `/shared`
3. **Pages**: Top-level route components only
4. **Types**: Feature-specific types with features, common types in `/shared`

### Import Guidelines

```typescript
// ✅ Good - Relative imports within features
import { AuthService } from '../services/authService';

// ✅ Good - Shared utilities
import { apiClient } from '../../shared/api/ApiClient';

// ❌ Avoid - Cross-feature imports (use shared instead)
import { ProductService } from '../../products/services/productService';
```

## Next Steps

The foundation is complete! Ready for:

- ✅ **Authentication System**: Fully implemented and production-ready
- 🔄 **Product Catalog**: Ready to implement using the same architecture pattern  
- 🔄 **Shopping Cart**: Can be added as a new feature module
- 🔄 **Order Management**: Following the established patterns