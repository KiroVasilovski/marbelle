```
frontend/
├── src/
│   ├── features/                  # Primary organization by business domain/feature
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── LoginPage.tsx
│   │   │   ├── register/
│   │   │   │   ├── EmailVerifyPage.tsx
│   │   │   │   ├── EmailVerifyForm.tsx # Renamed for clarity: it's a form, not a page
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   ├── password-reset/
│   │   │   │   ├── PasswordResetConfirmForm.tsx
│   │   │   │   ├── PasswordResetRequestForm.tsx
│   │   │   │   └── PasswordResetPage.tsx
│   │   │   ├── hooks/             # Auth-specific hooks
│   │   │   │   └── useAuthService.ts
│   │   │   ├── services/          # Auth-specific services/API calls
│   │   │   │   └── authService.ts
│   │   │   ├── types/             # Auth-specific types
│   │   │   │   └── auth.ts
│   │   │   └── AuthContext.tsx    # Auth-specific context lives with its feature
│   │   │
│   │   ├── products/              # Example of another feature (if it grows)
│   │   │   ├──
│   │   │
│   │   └── marketing/             # Example of a marketing/info feature
│   │       ├──
│   │
│   ├── shared/                    # Global, highly reusable elements across features
│   │   ├── api/                    # NEW: Central API client and related configurations
│   │   │   ├── ApiClient.ts        # The central class for all API requests
│   │   │   ├── apiConfig.ts        # Base URL, default headers, timeouts, etc.
│   │   │   └── interceptors.ts     # (Optional) For request/response interceptors (e.g., Axios)
│   │   │
│   │   ├── storage/                # NEW: Central classes for local/session storage
│   │   │   ├── LocalStorageService.ts
│   │   │   └── SessionStorageService.ts
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                # Generic UI components (Shadcn)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   └── label.tsx
│   │   │   ├── layout/            # Application-level layout components
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Layout.tsx
│   │   │   └── ProtectedRoute.tsx # This is a routing concern, common to many parts of the app
│   │   ├── hooks/                 # Generic, reusable hooks
│   │   │   └── useFormValidation.ts
│   │   ├── lib/                   # Generic utility functions (e.g., formatters, validators)
│   │   │   └── utils.ts
│   │   │   └── validation.ts      # Moved from 'utils'
│   │   └── types/                 # Global, common types if any (e.g., API response types)
│   │       └── common.ts
│   │
│   ├── App.tsx                    # Main application component, handles routing
│   ├── assets/
│   │   └── react.svg
│   ├── index.css                  # Global styles
│   ├── main.tsx                   # Application entry point
│   └── vite-env.d.ts
```
