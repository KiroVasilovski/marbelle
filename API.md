# Marbelle API Documentation

**Base URL**: `http://localhost:8000/api/v1/`
**Authentication**: JWT Bearer Token
**Content-Type**: `application/json`
**Session Management**: Automatic cookie-based sessions for guest users

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

-   Authentication: 5/min
-   Password reset: 3/min
-   Email verification: 3/min

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
POST /auth/request-email-change/      # Request email address change
POST /auth/confirm-email-change/      # Confirm email address change
```

---

## Email Change Endpoints

### Request Email Change

```http
POST /auth/request-email-change/
```

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
    "current_password": "CurrentPassword123",
    "new_email": "newemail@example.com"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Email change verification sent. Please check your new email to confirm the change."
}
```

**Security Features:**
- Requires current password re-authentication
- New email must be different from current email
- New email must not already exist in system
- Only one pending email change per user (new request overwrites old)
- Rate limited: 1000 requests per minute per user

### Confirm Email Change

```http
POST /auth/confirm-email-change/
```

**Request:**
```json
{
    "token": "email_change_token_here"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Email address changed successfully. You can now use your new email to login.",
    "data": {
        "id": 1,
        "email": "newemail@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "company_name": "Acme Corp",
        "phone": "+1234567890",
        "is_business_customer": true
    }
}
```

**Security Features:**
- No authentication required (uses secure token)
- Token expires in 24 hours
- Single-use token (becomes invalid after use)
- Old email receives security notification
- Username updated to match new email
- Rate limited: 1000 requests per minute per IP

### Email Change Workflow

The industry-standard email change process follows these steps:

1. **User Authentication**: User re-enters current password
2. **New Email Submission**: User provides new email address
3. **Verification Email**: Token sent to NEW email address
4. **Email Confirmation**: User clicks link/enters token → email actually changes
5. **Security Notification**: Old email gets notified of the change

**Business Rules:**
- Current email remains active until new one is verified
- Failed verification keeps original email unchanged
- User can have only one pending email change at a time
- New requests override previous pending changes

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
PATCH  /auth/addresses/{id}/set_primary/  # Set primary address
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

-   Account activation required via email verification
-   JWT tokens expire in 60 minutes
-   Refresh tokens expire in 7 days

### Profile Management

-   Email changes silently ignored if duplicate (security feature)
-   Company name determines business customer status
-   All fields support partial updates

### Address Management

-   Maximum 10 addresses per user
-   First address automatically set as primary
-   Only one primary address allowed
-   Cannot delete last remaining address
-   Address labels must be unique per user

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
curl -X PATCH http://localhost:8000/api/v1/auth/addresses/1/set_primary/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Email Change Flow

```bash
# 1. Request email change (requires current password)
curl -X POST http://localhost:8000/api/v1/auth/request-email-change/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"current_password":"CurrentPassword123","new_email":"newemail@example.com"}'

# 2. User receives email at newemail@example.com with verification link
# 3. Confirm email change using token from email
curl -X POST http://localhost:8000/api/v1/auth/confirm-email-change/ \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_FROM_EMAIL"}'

# 4. Old email receives security notification about the change
# 5. User can now login with newemail@example.com
```

---

## Error Codes

| Code | Description  |
| ---- | ------------ |
| 200  | Success      |
| 201  | Created      |
| 400  | Bad Request  |
| 401  | Unauthorized |
| 403  | Forbidden    |
| 404  | Not Found    |
| 429  | Rate Limited |

## Security Notes

-   **Email Enumeration Protection**: Duplicate email changes are silently ignored
-   **Rate Limiting**: Applied to authentication endpoints
-   **JWT Security**: Tokens blacklisted on logout
-   **User Isolation**: Users can only access their own data
-   **Session Security**: 4-week expiration, HttpOnly cookies, HTTPS-only in production

## Session Management

**Guest User Sessions:**
- Automatic session creation on first request
- Database-backed session storage (`django_session` table)
- 4-week session expiration
- Session cookies: `marbelle_sessionid`
- Used for: Shopping cart, temporary user data
- HTTPS-only cookies in production, HTTP allowed in development

**Session Cookie Configuration:**
- **Development**: `SESSION_COOKIE_SECURE = False` (HTTP allowed)
- **Production**: `SESSION_COOKIE_SECURE = True` (HTTPS required)
- **SameSite**: `Lax` for CORS compatibility
- **HttpOnly**: `True` for XSS protection

---

## Product Catalog Endpoints

**Public Access**: No authentication required for product catalog endpoints.

### Product List

```http
GET /products/
```

**Query Parameters:**
- `page` - Page number for pagination (default: 1)
- `search` - Search products by name, description, or SKU
- `category` - Filter by category ID
- `min_price` - Minimum price filter
- `max_price` - Maximum price filter  
- `in_stock` - Filter by stock availability (true/false)
- `ordering` - Sort by field (name, price, created_at, stock_quantity)

**Example Response:**

```json
{
    "count": 150,
    "next": "http://localhost:8000/api/v1/products/?page=2",
    "previous": null,
    "results": [
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
                    "image": "http://localhost:8000/media/products/carrara_white_1.jpg",
                    "alt_text": "Carrara White Marble close-up",
                    "is_primary": true,
                    "display_order": 0
                }
            ],
            "created_at": "2025-06-27T10:00:00Z",
            "updated_at": "2025-06-27T10:00:00Z"
        }
    ]
}
```

### Product Detail

```http
GET /products/{id}/
```

**Response:** Single product object with same structure as list.

### Category List

```http
GET /categories/
```

**Example Response:**

```json
{
    "count": 6,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "name": "Slabs",
            "description": "Large format natural stone slabs",
            "product_count": 45,
            "created_at": "2025-06-27T10:00:00Z"
        }
    ]
}
```

### Category Products

```http
GET /categories/{id}/products/
```

**Description:** Get all products in a specific category. Supports same filtering and search parameters as product list.

**Example Response:** Same structure as product list endpoint.

---

## Product Catalog Examples

### Search and Filter

```bash
# Search for marble products
curl "http://localhost:8000/api/v1/products/?search=marble"

# Filter by category and price range
curl "http://localhost:8000/api/v1/products/?category=1&min_price=50&max_price=100"

# Get only in-stock products
curl "http://localhost:8000/api/v1/products/?in_stock=true"

# Get products in category 1
curl "http://localhost:8000/api/v1/categories/1/products/"

# Sort by price descending
curl "http://localhost:8000/api/v1/products/?ordering=-price"
```

### Business Rules

- Only active products and categories are returned (is_active=True)
- Stock availability: in_stock = stock_quantity > 0
- Category product_count includes only active products
- Search is case-insensitive across name, description, and SKU
- Images sorted by display_order, then created_at
- Pagination: 20 items per page by default

---

## Shopping Cart Endpoints

**Authentication**: Optional (supports both authenticated users and guest sessions)
**Session Management**: Guest carts are automatically created and persisted using Django sessions
**Safari Compatibility**: Session IDs sent via `X-Session-ID` header for browsers blocking third-party cookies

### Get Cart

```http
GET /cart/
```

**Description**: Retrieve current cart contents with items and calculated totals.

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

```http
POST /cart/items/
```

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

```http
PUT /cart/items/{item_id}/
```

**Request:**

```json
{
    "quantity": 5
}
```

**Response:**

```json
{
    "success": true,
    "message": "Cart item updated successfully.",
    "data": {
        "item": {
            "id": 1,
            "product": {
                "id": 1,
                "name": "Carrara White Marble Slab",
                "sku": "CARR-WHITE-001",
                "image": "http://localhost:8000/media/products/carrara_white_1.jpg"
            },
            "quantity": 5,
            "unit_price": "85.50",
            "subtotal": "427.50"
        },
        "cart_totals": {
            "item_count": 5,
            "subtotal": "427.50",
            "tax_amount": "38.48",
            "total": "465.98"
        }
    }
}
```

### Remove Cart Item

```http
DELETE /cart/items/{item_id}/remove/
```

**Response:**

```json
{
    "success": true,
    "message": "Removed Carrara White Marble Slab from cart.",
    "data": {
        "cart_totals": {
            "item_count": 0,
            "subtotal": "0.00",
            "tax_amount": "0.00",
            "total": "0.00"
        }
    }
}
```

### Clear Cart

```http
DELETE /cart/clear/
```

**Response:**

```json
{
    "success": true,
    "message": "Cart cleared successfully.",
    "data": {
        "cart_totals": {
            "item_count": 0,
            "subtotal": "0.00",
            "tax_amount": "0.00",
            "total": "0.00"
        }
    }
}
```

---

## Shopping Cart Examples

### Complete Cart Flow

```bash
# 1. Get empty cart
curl "http://localhost:8000/api/v1/cart/"

# 2. Add item to cart
curl -X POST http://localhost:8000/api/v1/cart/items/ \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":2}'

# 3. Update item quantity
curl -X PUT http://localhost:8000/api/v1/cart/items/1/ \
  -H "Content-Type: application/json" \
  -d '{"quantity":5}'

# 4. Remove item from cart
curl -X DELETE http://localhost:8000/api/v1/cart/items/1/remove/

# 5. Clear entire cart
curl -X DELETE http://localhost:8000/api/v1/cart/clear/
```

### With Authentication

```bash
# Add JWT token for authenticated users
curl -X POST http://localhost:8000/api/v1/cart/items/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":2}'
```

### Safari / Header-Based Session

```bash
# 1. Get cart and capture session ID from response header
curl -v http://localhost:8000/api/v1/cart/ 2>&1 | grep -i "x-session-id"
# Response: X-Session-ID: abc123xyz456

# 2. Use session ID in subsequent requests
SESSION_ID="abc123xyz456"

curl -X POST http://localhost:8000/api/v1/cart/items/ \
  -H "X-Session-ID: $SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":2}'

# 3. All cart operations with session header
curl http://localhost:8000/api/v1/cart/ \
  -H "X-Session-ID: $SESSION_ID"

curl -X PUT http://localhost:8000/api/v1/cart/items/1/ \
  -H "X-Session-ID: $SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{"quantity":5}'

curl -X DELETE http://localhost:8000/api/v1/cart/items/1/remove/ \
  -H "X-Session-ID: $SESSION_ID"
```

**Note**: Frontend automatically handles session headers. Manual header management is only needed for API testing or non-browser clients.

### Business Rules

**Cart Management:**
- Guest carts persist for 4 weeks using Django sessions
- Authenticated users get one cart per account
- Unit prices are frozen at add time (price changes don't affect cart)
- Maximum 99 items per product per cart
- Stock validation prevents overselling

**Tax Calculation:**
- 9% tax rate applied to subtotal
- Tax amount rounded to 2 decimal places
- Total = Subtotal + Tax

**Session Handling:**
- Guest sessions automatically created on first cart action
- Session cookies: `marbelle_sessionid` with HttpOnly, SameSite=Lax (Chrome, Firefox)
- Header-based sessions: `X-Session-ID` header for Safari and cookie-blocked browsers
- Backend returns `X-Session-ID` in response headers for client-side storage
- Frontend sends `X-Session-ID` in request headers to maintain session
- Cart data synchronized when user logs in (guest cart merges with user cart)

**Error Handling:**
- Stock validation: Prevents adding more items than available
- Quantity limits: 1-99 items per product
- Access control: Users can only modify their own cart items
