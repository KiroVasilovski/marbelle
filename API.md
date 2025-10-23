# Marbelle API Documentation

**Base URL**: `http://localhost:8000/api/v1/`
**Authentication**: JWT Bearer Token (where required)
**Content-Type**: `application/json`

## Table of Contents

- [Response Format](#response-format)
- [Authentication](#authentication)
- [User Management](#user-management)
- [Product Catalog](#product-catalog)
- [Shopping Cart](#shopping-cart)
- [Business Rules](#business-rules)
- [Error Codes](#error-codes)

---

## Response Format

All endpoints return a standardized JSON response:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful.",
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description.",
  "errors": {
    "field": ["Error message"]
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Results retrieved successfully.",
  "data": [...],
  "pagination": {
    "count": 100,
    "next": "http://localhost:8000/api/v1/products/?page=2",
    "previous": null
  }
}
```

---

## Authentication

### Register User

**Endpoint**: `POST /auth/register/`
**Authentication**: None
**Rate Limit**: 5 requests/min

**Request:**
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

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification instructions.",
  "data": {
    "user_id": 1
  }
}
```

### Login

**Endpoint**: `POST /auth/login/`
**Authentication**: None
**Rate Limit**: 5 requests/min

**Request:**
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

### Logout

**Endpoint**: `POST /auth/logout/`
**Authentication**: Required

**Request:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Verify Email

**Endpoint**: `POST /auth/verify-email/`
**Authentication**: None
**Rate Limit**: 3 requests/min

**Request:**
```json
{
  "token": "verification_token_here"
}
```

### Resend Verification Email

**Endpoint**: `POST /auth/resend-verification/`
**Authentication**: None
**Rate Limit**: 3 requests/min

**Request:**
```json
{
  "email": "user@example.com"
}
```

### Password Reset

**Endpoint**: `POST /auth/password-reset/`
**Authentication**: None
**Rate Limit**: 3 requests/min

**Request:**
```json
{
  "email": "user@example.com"
}
```

### Password Reset Confirm

**Endpoint**: `POST /auth/password-reset-confirm/`
**Authentication**: None

**Request:**
```json
{
  "token": "reset_token_here",
  "password": "NewPassword123",
  "password_confirm": "NewPassword123"
}
```

### Verify Token

**Endpoint**: `GET /auth/verify-token/`
**Authentication**: Required

Verifies that the provided JWT token is valid and returns user data.

### Refresh Token

**Endpoint**: `POST /auth/refresh-token/`
**Authentication**: None

**Request:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "access": "new_access_token..."
}
```

---

## User Management

All user management endpoints require authentication: `Authorization: Bearer <token>`

### Get User Profile

**Endpoint**: `GET /auth/user/`
**Authentication**: Required

Returns the authenticated user's profile information.

### Update User Profile

**Endpoint**: `PUT /auth/user/`
**Authentication**: Required

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company_name": "New Company"
}
```

**Note**: All fields are optional. Email changes are silently ignored if duplicate (security feature).

### Change Password

**Endpoint**: `POST /auth/change-password/`
**Authentication**: Required

**Request:**
```json
{
  "current_password": "CurrentPassword123",
  "new_password": "NewPassword456",
  "new_password_confirm": "NewPassword456"
}
```

### Request Email Change

**Endpoint**: `POST /auth/request-email-change/`
**Authentication**: Required

**Request:**
```json
{
  "current_password": "CurrentPassword123",
  "new_email": "newemail@example.com"
}
```

**Workflow**:
1. User provides current password and new email
2. Verification email sent to **new email** (not current one)
3. User clicks link in email to confirm change
4. Email is updated, old email gets security notification

### Confirm Email Change

**Endpoint**: `POST /auth/confirm-email-change/`
**Authentication**: None (uses token)

**Request:**
```json
{
  "token": "email_change_token_here"
}
```

### List Addresses

**Endpoint**: `GET /auth/addresses/`
**Authentication**: Required

Returns all addresses for the authenticated user.

### Create Address

**Endpoint**: `POST /auth/addresses/`
**Authentication**: Required

**Request:**
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

**Note**: First address is automatically set as primary.

### Update Address

**Endpoint**: `PUT /auth/addresses/{id}/`
**Authentication**: Required

Same request body as create address.

### Delete Address

**Endpoint**: `DELETE /auth/addresses/{id}/`
**Authentication**: Required

**Note**: Cannot delete the last remaining address.

### Set Primary Address

**Endpoint**: `PATCH /auth/addresses/{id}/set_primary/`
**Authentication**: Required

Sets the specified address as the primary shipping/billing address.

---

## Product Catalog

All product catalog endpoints are **public** (no authentication required).

### List Products

**Endpoint**: `GET /products/`
**Authentication**: None

**Query Parameters:**
- `page` - Page number (default: 1)
- `search` - Search by name, description, or SKU
- `category` - Filter by category ID
- `min_price` - Minimum price
- `max_price` - Maximum price
- `in_stock` - Filter by availability (true/false)
- `ordering` - Sort by field: `name`, `price`, `created_at`, `stock_quantity` (prefix with `-` for descending)

**Example Request:**
```bash
GET /products/?search=marble&category=1&min_price=50&max_price=100&ordering=-price
```

**Response:**
```json
{
  "success": true,
  "message": "Results retrieved successfully.",
  "data": [
    {
      "id": 1,
      "name": "Carrara White Marble Slab",
      "description": "Premium Italian Carrara white marble slab...",
      "price": "85.50",
      "unit_of_measure": "sqft",
      "category": 1,
      "stock_quantity": 25,
      "in_stock": true,
      "sku": "CARR-WHITE-001",
      "images": [
        {
          "id": 1,
          "image": "https://res.cloudinary.com/.../carrara_white_1.jpg",
          "alt_text": "Carrara White Marble close-up",
          "is_primary": true,
          "display_order": 0
        }
      ],
      "created_at": "2025-06-27T10:00:00Z",
      "updated_at": "2025-06-27T10:00:00Z"
    }
  ],
  "pagination": {
    "count": 150,
    "next": "http://localhost:8000/api/v1/products/?page=2",
    "previous": null
  }
}
```

### Get Product Detail

**Endpoint**: `GET /products/{id}/`
**Authentication**: None

Returns a single product with the same structure as the list endpoint.

### List Categories

**Endpoint**: `GET /categories/`
**Authentication**: None

**Response:**
```json
{
  "success": true,
  "message": "Results retrieved successfully.",
  "data": [
    {
      "id": 1,
      "name": "Slabs",
      "description": "Large format natural stone slabs",
      "product_count": 45,
      "created_at": "2025-06-27T10:00:00Z"
    }
  ],
  "pagination": {
    "count": 6,
    "next": null,
    "previous": null
  }
}
```

### Get Category Products

**Endpoint**: `GET /categories/{id}/products/`
**Authentication**: None

Returns all products in a specific category. Supports same query parameters as product list.

---

## Shopping Cart

Cart endpoints support both authenticated users and guest sessions.

**Session Management**:
- **Authenticated users**: Cart associated with JWT token
- **Guest users**: Cart persisted via session cookie (`marbelle_sessionid`)
- **Safari/ITP**: Uses `X-Session-ID` header for cookie-blocked browsers

### Get Cart

**Endpoint**: `GET /cart/`
**Authentication**: Optional

**Response:**
```json
{
  "success": true,
  "message": "Cart retrieved successfully.",
  "data": {
    "id": 1,
    "item_count": 3,
    "subtotal": "109.97",
    "tax_amount": "9.90",
    "total": "119.87",
    "items": [
      {
        "id": 1,
        "product": {
          "id": 1,
          "name": "Carrara White Marble Slab",
          "sku": "CARR-WHITE-001",
          "stock_quantity": 25,
          "in_stock": true,
          "image": "http://localhost:8000/media/products/carrara_white_1.jpg"
        },
        "quantity": 2,
        "unit_price": "85.50",
        "subtotal": "171.00",
        "created_at": "2025-09-14T10:30:00Z"
      }
    ]
  }
}
```

### Add to Cart

**Endpoint**: `POST /cart/items/`
**Authentication**: Optional

**Request:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Added 2 x Carrara White Marble Slab to cart.",
  "data": {
    "item": {
      "id": 1,
      "product": {
        "id": 1,
        "name": "Carrara White Marble Slab",
        "sku": "CARR-WHITE-001",
        "image": "http://localhost:8000/media/products/carrara_white_1.jpg"
      },
      "quantity": 2,
      "unit_price": "85.50",
      "subtotal": "171.00"
    },
    "cart_totals": {
      "item_count": 2,
      "subtotal": "171.00",
      "tax_amount": "15.39",
      "total": "186.39"
    }
  }
}
```

### Update Cart Item

**Endpoint**: `PUT /cart/items/{item_id}/`
**Authentication**: Optional

**Request:**
```json
{
  "quantity": 5
}
```

**Note**: Set quantity to 0 is not allowed - use delete endpoint instead.

### Remove Cart Item

**Endpoint**: `DELETE /cart/items/{item_id}/remove/`
**Authentication**: Optional

Removes a specific item from the cart.

### Clear Cart

**Endpoint**: `DELETE /cart/clear/`
**Authentication**: Optional

Removes all items from the cart.

---

## Business Rules

### Authentication
- Account activation required via email verification
- JWT access tokens expire in **60 minutes**
- Refresh tokens expire in **7 days**
- Tokens are blacklisted on logout

### User Profile
- Email changes are silently ignored if duplicate (prevents enumeration attacks)
- Company name presence determines `is_business_customer` status
- All profile fields support partial updates (send only changed fields)

### Addresses
- Maximum **10 addresses** per user
- First address automatically set as primary
- Only **one primary address** allowed per user
- Cannot delete the last remaining address
- Address labels must be unique per user

### Products
- Only active products returned (`is_active=True`)
- Stock availability: `in_stock = stock_quantity > 0`
- Images sorted by `display_order`, then `created_at`
- Default pagination: **20 items** per page
- Search is case-insensitive across name, description, and SKU

### Shopping Cart
- Guest carts persist for **4 weeks** via Django sessions
- Authenticated users: **one cart** per account
- Unit prices frozen at add time (price changes don't affect existing cart items)
- Quantity limits: **1-99 items** per product
- Stock validation prevents overselling
- **Tax rate**: 9% applied to subtotal
- Cart merges when guest user logs in

### Session Management
- Guest sessions automatically created on first cart action
- Session cookies: `marbelle_sessionid` with HttpOnly, SameSite=Lax
- Safari/ITP: Uses `X-Session-ID` header fallback
- Session expiration: **4 weeks**
- HTTPS-only in production, HTTP allowed in development

---

## Error Codes

| Code | Description       | Usage                                      |
|------|-------------------|--------------------------------------------|
| 200  | OK                | Successful GET, PUT, PATCH                 |
| 201  | Created           | Successful POST (resource created)         |
| 204  | No Content        | Successful DELETE                          |
| 400  | Bad Request       | Validation error, malformed request        |
| 401  | Unauthorized      | Missing or invalid authentication          |
| 403  | Forbidden         | Authenticated but not authorized           |
| 404  | Not Found         | Resource doesn't exist                     |
| 429  | Too Many Requests | Rate limit exceeded                        |
| 500  | Server Error      | Internal server error                      |

---

## Quick Examples

### Complete Authentication Flow
```bash
# 1. Register
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","first_name":"John","last_name":"Doe","password":"Pass123","password_confirm":"Pass123"}'

# 2. Verify email (check email for token)
curl -X POST http://localhost:8000/api/v1/auth/verify-email/ \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_FROM_EMAIL"}'

# 3. Login
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123"}'

# 4. Access protected endpoint
curl http://localhost:8000/api/v1/auth/user/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Shopping as Guest User
```bash
# 1. Browse products (no auth needed)
curl "http://localhost:8000/api/v1/products/?search=marble"

# 2. Add to cart (session auto-created)
curl -X POST http://localhost:8000/api/v1/cart/items/ \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":2}'

# 3. View cart
curl "http://localhost:8000/api/v1/cart/"
```

### Safari Session Management
```bash
# 1. Get cart and capture session ID
curl -v http://localhost:8000/api/v1/cart/ 2>&1 | grep -i "x-session-id"

# 2. Use session ID in subsequent requests
curl -X POST http://localhost:8000/api/v1/cart/items/ \
  -H "X-Session-ID: abc123xyz456" \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":2}'
```

---

## Security Features

- **JWT Authentication**: Secure token-based authentication with blacklisting
- **Email Enumeration Protection**: Duplicate emails handled silently
- **Rate Limiting**: Applied to authentication and sensitive endpoints
- **User Isolation**: Users can only access their own data
- **Session Security**: HttpOnly cookies, HTTPS-only in production
- **CORS**: Configured for frontend domain
- **XSS Protection**: HttpOnly cookies prevent JavaScript access
- **SQL Injection**: Protected via Django ORM parameterized queries

---

## Image Storage

**Production**: Cloudinary CDN with automatic optimization
- URLs: `https://res.cloudinary.com/your-cloud-name/image/upload/marbelle/products/{SKU}/image.jpg`
- Automatic WebP conversion for modern browsers
- Quality optimization: `auto:best`
- Global CDN delivery

**Development**: Local storage fallback
- URLs: `http://localhost:8000/media/products/{SKU}/image.jpg`

The API automatically returns the correct URL format based on configuration.