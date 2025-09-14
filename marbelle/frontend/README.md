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
│   │   ├── auth/               # Authentication feature
│   │   │   ├── login/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── LoginPage.tsx
│   │   │   ├── register/
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   ├── RegisterPage.tsx
│   │   │   │   ├── EmailVerification.tsx
│   │   │   │   └── EmailVerifyPage.tsx
│   │   │   ├── password-reset/
│   │   │   │   ├── PasswordResetRequest.tsx
│   │   │   │   ├── PasswordResetConfirm.tsx
│   │   │   │   └── PasswordResetPage.tsx
│   │   │   ├── services/        # Auth-specific services/API calls
│   │   │   │   └── authService.ts
│   │   │   ├── types/           # Auth-specific types
│   │   │   │   └── auth.ts
│   │   │   ├── ui/              # Auth-specific UI components
│   │   │   │   └── auth-window.tsx
│   │   │   └── AuthContext.tsx  # Auth-specific context
│   │   │
│   │   ├── dashboard/          # User dashboard feature
│   │   │   ├── components/
│   │   │   │   ├── addresses/  # Address management components
│   │   │   │   │   ├── AddressCard.tsx
│   │   │   │   │   ├── AddressesPage.tsx
│   │   │   │   │   └── AddressForm.tsx
│   │   │   │   ├── email-change/ # Email change components
│   │   │   │   │   ├── EmailChangeForm.tsx
│   │   │   │   │   ├── EmailChangePage.tsx
│   │   │   │   │   └── EmailConfirmPage.tsx
│   │   │   │   ├── orders/     # Order history components
│   │   │   │   │   └── OrdersPage.tsx
│   │   │   │   ├── password/   # Password change components
│   │   │   │   │   └── PasswordPage.tsx
│   │   │   │   ├── profile/    # Profile management components
│   │   │   │   │   ├── ProfileForm.tsx
│   │   │   │   │   └── ProfilePage.tsx
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   └── DashboardPage.tsx
│   │   │   ├── services/       # Dashboard API services
│   │   │   │   └── dashboardService.ts
│   │   │   ├── types/          # Dashboard type definitions
│   │   │   │   └── dashboard.ts
│   │   │   ├── ui/             # Dashboard-specific UI components (directory exists)
│   │   │   ├── DashboardContext.tsx
│   │   │   └── index.ts        # Dashboard feature exports
│   │   │
│   │   └── products/           # Product catalog feature
│   │       ├── components/     # Product-specific components
│   │       │   ├── ProductCard.tsx
│   │       │   ├── ProductCatalog.tsx
│   │       │   ├── ProductDetailPage.tsx
│   │       │   ├── ProductGrid.tsx
│   │       │   ├── ProductImageGallery.tsx
│   │       │   └── ProductInfo.tsx
│   │       ├── hooks/          # Product-specific hooks
│   │       │   ├── useProductDetail.ts
│   │       │   └── useProducts.ts
│   │       ├── services/       # Product API services
│   │       │   └── productService.ts
│   │       ├── types/          # Product type definitions
│   │       │   └── product.ts
│   │       └── index.ts        # Product feature exports
│   │
│   ├── shared/                  # Global, highly reusable elements across features
│   │   ├── api/                 # Central API client and configurations
│   │   │   ├── ApiClient.ts     # Central class for all API requests
│   │   │   ├── apiConfig.ts     # Base URL, default headers, timeouts, etc.
│   │   │   ├── ApiError.ts      # API error handling
│   │   │   └── interceptors.ts  # Request/response interceptors
│   │   │
│   │   ├── storage/             # Central classes for local/session storage
│   │   │   ├── LocalStorageService.ts
│   │   │   ├── SessionStorageService.ts
│   │   │   └── StorageService.ts
│   │   │
│   │   ├── components/
│   │   │   ├── ui/              # Generic UI components
│   │   │   │   ├── check-mark.tsx
│   │   │   │   ├── cross-mark.tsx
│   │   │   │   ├── DeleteConfirmModal.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── loading-spinner.tsx
│   │   │   │   ├── password-strength-indicator.tsx
│   │   │   │   └── Select.tsx   # Custom Select wrapper
│   │   │   ├── shadcn/          # Shadcn UI primitives
│   │   │   │   ├── button.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── drawer.tsx
│   │   │   │   └── select.tsx
│   │   │   ├── layout/          # Application-level layout components
│   │   │   │   ├── AuthHeader.tsx
│   │   │   │   ├── AuthLayout.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── ShippingLanguageDialog.tsx
│   │   │   │   └── ShippingLanguageDrawer.tsx
│   │   │   ├── ProtectedRoute.tsx # Route protection component
│   │   │   └── ScrollToTop.tsx  # Scroll restoration component
│   │   ├── hooks/               # Generic, reusable hooks
│   │   │   ├── useFormValidation.ts
│   │   │   └── usePasswordValidation.ts
│   │   ├── lib/                 # Generic utility functions
│   │   │   ├── utils.ts
│   │   │   └── validation.ts
│   │   └── types/               # Global, common types
│   │       └── common.ts
│   │
│   ├── i18n/                    # Internationalization
│   │   ├── locales/
│   │   │   ├── en.json          # English translations (source of truth)
│   │   │   ├── de.json          # German translations
│   │   │   └── sq.json          # Albanian translations
│   │   ├── index.ts             # i18n configuration and setup
│   │   └── types.ts             # i18n type definitions
│   │
│   ├── pages/                   # Top-level page components
│   │   ├── About.tsx
│   │   ├── Home.tsx
│   │   └── Products.tsx
│   │
│   ├── App.tsx                  # Main application component, handles routing
│   ├── index.css                # Global styles and Tailwind imports
│   ├── main.tsx                 # Application entry point
│   └── vite-env.d.ts            # Vite type definitions
│
├── .env                         # Environment variables (not in git)
├── .env.example                 # Environment variables template
├── .eslintrc.cjs               # Legacy ESLint configuration
├── .prettierrc                 # Prettier configuration
├── components.json              # Shadcn UI configuration
├── Dockerfile                  # Docker container configuration
├── eslint.config.js            # Modern ESLint flat config
├── index.html                  # HTML template
├── nginx.conf                  # Nginx configuration for production
├── package.json                # Dependencies and scripts
├── package-lock.json           # Locked dependency versions
├── postcss.config.js           # PostCSS configuration
├── README.md                   # This documentation file
├── structure.md                # Additional project structure documentation
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.app.json           # TypeScript config for app code
├── tsconfig.json               # Main TypeScript configuration
├── tsconfig.node.json          # TypeScript config for build tools
└── vite.config.ts              # Vite build tool configuration
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

# The application will be available at http://localhost:3000
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
    password: 'password',
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

## Form Validation System

The application uses a unified form validation system for consistent behavior across all forms.

### **Form Development Guidelines**

**For all forms:**

- **ALWAYS use `useFormValidation` hook** - Provides smart button states (`canSubmit`, `canReset`) and declarative validation
- **Use validation rules from `validationRules`** - Available rules: `required`, `email`, `phone`, `password`, `minLength`, `maxLength`, `optional`, `matchesField`, `differentFromField`
- **Follow the established pattern** - See existing forms like `ProfileForm`, `AddressForm`, `RegisterForm` for implementation examples

**For password fields:**

- **ALWAYS use `useCompletePasswordValidation` hook** - Provides professional password strength validation and matching
- **Use `PasswordStrengthIndicator` component** - Professional progress bar with detailed feedback
- **Use `PasswordMatchIndicator` component** - Consistent password confirmation feedback

**Benefits:**

- **Smart button enablement** - Buttons enable/disable intelligently based on form state and validation
- **Consistent UX** - All forms behave the same way across the application
- **Clean components** - No complex validation logic in components
- **Type-safe** - Full TypeScript support with proper error handling

### **Development Standards**

- **Never write custom validation logic in components** - Use the unified hooks
- **Always use smart button states** - `canSubmit` and `canReset` from the validation hook
- **Follow the feature-based architecture** - Keep form validation consistent with established patterns
- **Professional password validation** - Use the enhanced password components for all password fields

## Next Steps

The foundation is complete! Ready for:

- ✅ **Authentication System**: Fully implemented and production-ready
- ✅ **Form Validation System**: Unified validation with smart button states and professional UX
- 🔄 **Product Catalog**: Ready to implement using the same architecture pattern
- 🔄 **Shopping Cart**: Can be added as a new feature module
- 🔄 **Order Management**: Following the established patterns
