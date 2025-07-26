# Marbelle API Documentation

**Base URL**: `http://localhost:8000/api/v1/`  
**Authentication**: JWT Bearer Token  
**Content-Type**: `application/json`

## Response Format

All responses follow this format:
```json
{
  "success": true|false,
  "message": "Description",
  "data": {...}  // Optional
}
```

## Rate Limits
- Authentication: 5/min
- Password reset: 3/min
- Email verification: 3/min

---

## Authentication Endpoints

### Register
```http
POST /auth/register/
```
```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "SecurePassword123",
  "password_confirm": "SecurePassword123",
  "company_name": "Acme Corp",
  "phone": "+1234567890"
}
```

### Login
```http
POST /auth/login/
```
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "access": "eyJhbGciOiJIUzI1NiIs...",
    "refresh": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "company_name": "Acme Corp",
      "phone": "+1234567890",
      "is_business_customer": true
    }
  }
}
```

### Other Auth Endpoints
```http
POST /auth/logout/                    # Logout user
POST /auth/verify-email/              # Verify email with token
POST /auth/resend-verification/       # Resend verification email
POST /auth/password-reset/            # Request password reset
POST /auth/password-reset-confirm/    # Confirm password reset
GET  /auth/verify-token/              # Verify JWT token
POST /auth/refresh-token/             # Refresh access token
```

---

## Dashboard Endpoints

All dashboard endpoints require JWT authentication: `Authorization: Bearer <token>`

### Profile Management
```http
GET  /auth/user/                      # Get user profile
PUT  /auth/user/                      # Update user profile
POST /auth/change-password/           # Change password
```

**Update Profile Example:**
```json
{
  "first_name": "John",
  "last_name": "Smith", 
  "email": "john@example.com",
  "phone": "+1234567890",
  "company_name": "New Company"
}
```

**Change Password Example:**
```json
{
  "current_password": "CurrentPassword123",
  "new_password": "NewPassword456",
  "new_password_confirm": "NewPassword456"
}
```

### Address Management
```http
GET    /auth/addresses/               # List addresses
POST   /auth/addresses/               # Create address
PUT    /auth/addresses/{id}/          # Update address
DELETE /auth/addresses/{id}/          # Delete address
PATCH  /auth/addresses/{id}/set-primary/  # Set primary address
```

**Address Example:**
```json
{
  "label": "Home",
  "first_name": "John",
  "last_name": "Doe",
  "company": "Acme Corp",
  "address_line_1": "123 Main St",
  "address_line_2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "USA",
  "phone": "+1234567890"
}
```

**Address Response:**
```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "id": 1,
        "label": "Home",
        "first_name": "John",
        "last_name": "Doe",
        "company": "Acme Corp",
        "address_line_1": "123 Main St",
        "address_line_2": "Apt 4B",
        "city": "New York",
        "state": "NY",
        "postal_code": "10001",
        "country": "USA",
        "phone": "+1234567890",
        "is_primary": true,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## Business Rules

### Authentication
- Account activation required via email verification
- JWT tokens expire in 60 minutes
- Refresh tokens expire in 7 days

### Profile Management
- Email changes silently ignored if duplicate (security feature)
- Company name determines business customer status
- All fields support partial updates

### Address Management
- Maximum 10 addresses per user
- First address automatically set as primary
- Only one primary address allowed
- Cannot delete last remaining address
- Address labels must be unique per user

---

## Quick Examples

### Complete Authentication Flow
```bash
# 1. Register
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","first_name":"John","last_name":"Doe","password":"Pass123","password_confirm":"Pass123"}'

# 2. Login
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123"}'

# 3. Access protected endpoint
curl -X GET http://localhost:8000/api/v1/auth/user/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Address Management Flow
```bash
# List addresses
curl -X GET http://localhost:8000/api/v1/auth/addresses/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create address
curl -X POST http://localhost:8000/api/v1/auth/addresses/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"label":"Home","first_name":"John","last_name":"Doe","address_line_1":"123 Main St","city":"NYC","state":"NY","postal_code":"10001","country":"USA"}'

# Set as primary
curl -X PATCH http://localhost:8000/api/v1/auth/addresses/1/set-primary/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 429  | Rate Limited |

## Security Notes

- **Email Enumeration Protection**: Duplicate email changes are silently ignored
- **Rate Limiting**: Applied to authentication endpoints
- **JWT Security**: Tokens blacklisted on logout
- **User Isolation**: Users can only access their own data