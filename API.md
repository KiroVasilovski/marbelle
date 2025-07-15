# Marbelle API Documentation

## Overview

The Marbelle API is a RESTful web service that provides endpoints for managing natural stone e-commerce operations including user authentication, product catalog, and order management.

**Base URL**: `http://localhost:8000/api/v1/`  
**API Version**: v1  
**Content-Type**: `application/json`  
**Authentication**: JWT Bearer Token (where required)

## Table of Contents

- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication-endpoints)

---

## Authentication

The API uses JWT (JSON Web Token) authentication for protected endpoints. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

Tokens expire after 60 minutes and can be refreshed using the refresh token endpoint.

## Response Format

All API responses follow a consistent JSON format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    // Detailed error information
  }
}
```

## Error Handling

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Rate Limiting

Rate limits are applied to protect the API:

- **Authentication endpoints**: 5 requests per minute for registration/login
- **Password reset endpoints**: 3 requests per minute
- **Email verification**: 3 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when rate limit resets

---

## API Endpoints

### Authentication Endpoints

#### User Registration

**POST** `/auth/register/`

Register a new user account. Account will be created in inactive state until email verification.

**Request Body:**
```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "SecurePassword123",
  "password_confirm": "SecurePassword123",
  "company_name": "Optional Company Name",
  "phone": "+1234567890"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification instructions.",
  "data": {
    "user_id": 1
  }
}
```

**Rate Limit:** 5 requests per minute  
**Authentication:** Not required

---

#### User Login

**POST** `/auth/login/`

Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "company_name": "Company Name",
      "phone": "+1234567890",
      "is_business_customer": true
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Login failed.",
  "errors": {
    "non_field_errors": ["Account is not activated. Please check your email for verification instructions."]
  }
}
```

**Rate Limit:** 5 requests per minute  
**Authentication:** Not required

---

#### User Logout

**POST** `/auth/logout/`

Logout user and blacklist refresh token.

**Request Body:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful."
}
```

**Authentication:** Required (Bearer token)

---

#### Email Verification

**POST** `/auth/verify-email/`

Verify user email address using verification token.

**Request Body:**
```json
{
  "token": "verification_token_from_email"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verification successful. Your account is now active."
}
```

**Rate Limit:** 3 requests per minute  
**Authentication:** Not required

---

#### Resend Email Verification

**POST** `/auth/resend-verification/`

Resend email verification to inactive user.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Verification email sent."
}
```

**Rate Limit:** 3 requests per minute  
**Authentication:** Not required

---

#### Password Reset Request

**POST** `/auth/password-reset/`

Request password reset for user account.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "If this email is registered, you will receive password reset instructions."
}
```

**Rate Limit:** 3 requests per minute  
**Authentication:** Not required

---

#### Password Reset Confirmation

**POST** `/auth/password-reset-confirm/`

Confirm password reset with new password.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "NewSecurePassword123",
  "new_password_confirm": "NewSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password."
}
```

**Rate Limit:** 3 requests per minute  
**Authentication:** Not required

---

#### Token Verification

**GET** `/auth/verify-token/`

Verify JWT token validity and get current user information.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token is valid.",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "company_name": "Company Name",
    "phone": "+1234567890",
    "is_business_customer": true
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid",
  "messages": [
    {
      "token_class": "AccessToken",
      "token_type": "access",
      "message": "Token is invalid or expired"
    }
  ]
}
```

**Authentication:** Required (Bearer token)

---

#### Token Refresh

**POST** `/auth/refresh-token/`

Refresh expired access token using refresh token.

**Request Body:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Authentication:** Not required (uses refresh token)

---

## Examples

### Complete Authentication Flow

#### 1. Register New User
```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "password": "SecurePassword123",
    "password_confirm": "SecurePassword123",
    "company_name": "Acme Corp"
  }'
```

#### 2. Get Verification Token (from email or Django shell)
```bash
docker-compose exec backend python manage.py shell -c "
from users.models import EmailVerificationToken
token = EmailVerificationToken.objects.filter(user__email='john@example.com').last()
print('Token:', token.token if token else 'Not found')
"
```

#### 3. Verify Email
```bash
curl -X POST http://localhost:8000/api/v1/auth/verify-email/ \
  -H "Content-Type: application/json" \
  -d '{"token": "your_verification_token_here"}'
```

#### 4. Login User
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

#### 5. Use Protected Endpoint
```bash
curl -X GET http://localhost:8000/api/v1/auth/verify-token/ \
  -H "Authorization: Bearer your_jwt_token_here"
```

---

## Security Considerations

### Password Requirements
- Minimum 8 characters
- Must contain mixed case letters
- Must contain numbers
- Django's built-in password validators are enforced

### Token Security
- JWT access tokens expire after 60 minutes
- Refresh tokens expire after 7 days with rotation
- Tokens are automatically blacklisted on logout
- Email verification tokens expire after 24 hours
- Password reset tokens expire after 24 hours

### Rate Limiting
All authentication endpoints are rate-limited to prevent abuse:
- Registration/Login: 5 attempts per minute per IP
- Password reset: 3 attempts per minute per IP
- Email verification: 3 attempts per minute per IP

### CORS Configuration
CORS is configured to allow requests from:
- `http://localhost:3000` (React development server)
- `http://127.0.0.1:3000`

---

## Development & Testing

### Running Tests
```bash
# Run all authentication tests
docker-compose exec backend python manage.py test users

# Run specific test class
docker-compose exec backend python manage.py test users.tests.AuthenticationAPITest
```

### Database Management
```bash
# Apply migrations
docker-compose exec backend python manage.py migrate

# Access Django shell
docker-compose exec backend python manage.py shell
```

### Email Templates
Email templates are located in `/templates/users/`:
- `email_verification.html` - Email verification template
- `password_reset.html` - Password reset template

Both templates follow Marbelle's brand guidelines with professional styling and CAPITAL LETTERS typography.

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- Complete authentication system
- JWT token-based authentication
- Email verification and password reset
- Rate limiting and security features
- Professional email templates