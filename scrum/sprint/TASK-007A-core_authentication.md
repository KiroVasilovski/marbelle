# Task TASK-007A: Core Authentication

## State: Backlog
## Story Points: 4
## Priority: High
## Stack: Backend + Frontend

## Dependencies
- **TASK-004A**: User Management Models (requires User model)

**As a** customer  
**I want** to register and login to the platform  
**So that** I can access my account and make authenticated requests

**As a** customer  
**I want** to reset my password if I forget it  
**So that** I can regain access to my account

## Acceptance Criteria  

### **User Registration**
- [ ] Registration form with required fields (first name, last name, email, password)
- [ ] Optional company name field for business customers
- [ ] Password strength validation (8+ chars, mixed case, numbers)
- [ ] Email uniqueness validation
- [ ] Registration API endpoint with proper validation

### **Email Verification**
- [ ] Email verification required before account activation
- [ ] Verification email sent immediately upon registration
- [ ] Email verification API endpoint
- [ ] Resend verification email functionality
- [ ] Account remains inactive until email verified

### **Login/Logout System**
- [ ] Login form with email and password
- [ ] JWT token generation and return on successful login
- [ ] Logout functionality that invalidates tokens
- [ ] Login API endpoint with proper error handling
- [ ] Logout API endpoint

### **Password Reset**
- [ ] Password reset request form (email input)
- [ ] Password reset email with secure token
- [ ] Password reset confirmation form with new password
- [ ] Password reset API endpoints (request + confirm)
- [ ] Token expiration (24 hours)

### **JWT Authentication System**
- [ ] JWT token configuration and middleware
- [ ] Token expiration and refresh mechanism
- [ ] Protected API endpoint decorator/middleware
- [ ] Frontend JWT token storage and management
- [ ] Automatic logout after 60 minutes of inactivity

## Technical Requirements

### **Backend Implementation**
- Django REST Framework JWT authentication
- Custom JWT token configuration
- Email backend for verification and password reset
- Secure token generation for email verification and password reset
- Rate limiting for auth endpoints (5 attempts per minute)
- Input validation and sanitization

### **Frontend Implementation**
- Registration and login forms with validation
- JWT token storage in secure cookies/localStorage
- Authentication context/state management
- Protected route components and navigation guards
- Form validation with real-time feedback
- Error handling and user feedback

### **API Endpoints**
```
POST /api/v1/auth/register/ - User registration
POST /api/v1/auth/login/ - User login (returns JWT)
POST /api/v1/auth/logout/ - User logout
POST /api/v1/auth/verify-email/ - Email verification
POST /api/v1/auth/password-reset/ - Request password reset
POST /api/v1/auth/password-reset-confirm/ - Confirm password reset
GET /api/v1/auth/verify-token/ - Verify JWT token validity
```

## Security Requirements
- Strong password requirements (8+ chars, mixed case, numbers)
- Email verification before account activation
- JWT token expiration (60 minutes) and secure storage
- CSRF protection for all forms
- Rate limiting for auth endpoints
- Secure password reset token generation
- Input validation against XSS and injection attacks

## UI/UX Design Specifications
- Minimal, professional design consistent with brand
- All text in CAPITAL LETTERS following brand guidelines
- Clean, single-column forms on mobile
- Clear validation messages and error states
- Loading states for all auth operations
- Success feedback for registration and password reset

## Business Rules
- Users with company_name filled are identified as business customers
- Account remains inactive until email verification
- Password reset tokens expire after 24 hours
- JWT tokens expire after 60 minutes of inactivity
- Email addresses must be unique across the platform
- Failed login attempts are rate limited

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Registration, login, logout working end-to-end
- [ ] Email verification system functional
- [ ] Password reset functionality tested
- [ ] JWT authentication implemented with secure token handling
- [ ] All security requirements implemented and tested
- [ ] Forms include proper validation with professional UX
- [ ] Email sending functionality tested
- [ ] Rate limiting working for auth endpoints
- [ ] Frontend auth state management implemented
- [ ] Mobile-responsive forms matching brand guidelines
- [ ] No linting errors (backend: ruff, frontend: ESLint)
- [ ] Authentication flow tested for all user scenarios

## Notes
- Foundation for all other authentication features
- Must be completed before any other auth-related tasks
- Focus on security and reliability over features
- Clean, minimal implementation ready for extension