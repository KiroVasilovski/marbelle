# Marbelle Backend

Django REST API for the Marbelle e-commerce natural stone application.

## Technology Stack

-   **Django**: 5.2 LTS
-   **Python**: 3.12.11
-   **Database**: PostgreSQL 16+
-   **Authentication**: JWT with djangorestframework-simplejwt
-   **Code Quality**: ruff linting (120 char line limit)

## Django Apps

-   **users**: Authentication, user profiles, address management
-   **products**: Product catalog, categories, image management
-   **orders**: Shopping cart, orders, custom quotes
-   **core**: Shared utilities, standardized API responses, pagination

## App Structure

Each Django app follows a feature-based modular structure:

```
app_name/
├── models.py              # All models (unified)
├── admin.py               # Django admin
├── urls.py                # URL routing
├── tests.py               # Unit tests
├── serializers/           # DRF serializers (split by feature)
├── views/                 # API views (split by feature)
├── services/              # Business logic (static methods only)
└── repositories/          # Data access layer (ORM queries)
```

## Architecture Patterns

### Request Flow
```
HTTP Request → View → Serializer (validation) → Service (business logic) → Repository (data access) → Database
```

### Service Layer
- **All business logic in services** - Views only handle HTTP
- **Static methods only** - Stateless operations
- **Reusable** - One service, multiple endpoints

### Repository Layer
- **All database queries in repositories** - No direct ORM in services
- **Optimized queries** - Uses prefetch_related/select_related
- **Consistent patterns** - Standard CRUD operations

### Existing Services
- `AuthenticationService` - User registration, email verification, password reset
- `UserService` - Profile management, password changes
- `AddressService` - Address CRUD operations
- `CartService` - Shopping cart operations
- `SessionService` - Session management (cookie/header)
- `TokenService` - Token lifecycle management
- `EmailService` - Email sending
- `ProductImageService` - Product image handling
- `ProductFilterService` - Product search/filtering

### Existing Repositories
- `UserRepository` - User queries and creation
- `TokenRepository` - Email/password/change-email tokens
- `AddressRepository` - Address data access
- `ProductRepository` - Product catalog queries
- `CartRepository` - Cart and cart item queries
- `OrderRepository` - Order data access

## API Response Format

All endpoints use standardized responses via `ResponseHandler` (core/responses.py):

```python
# Success
return ResponseHandler.success(data=serializer.data, message="Created successfully.")

# Error
return ResponseHandler.error(message="Failed.", errors=serializer.errors)
```

**Response structure:**
```json
{"success": true, "message": "...", "data": {...}}
```

For paginated responses, use `Paginator` class (core/pagination.py).



## Key Features

### Session Management
- **Safari Compatible**: Hybrid cookie/header approach (`X-Session-ID` header fallback)
- **Guest Carts**: Session-based cart persistence for non-authenticated users
- **Authenticated Users**: JWT-based authentication with cart association

### Image Storage
- **Cloudinary Integration**: CDN delivery with automatic optimization
- **Local Fallback**: Works without Cloudinary configuration
- **SKU-Based Organization**: Images stored in `marbelle/products/{SKU}/` folders

## Development Guidelines

### Creating New Features

When adding new functionality, follow this pattern:

1. **Models** - Define data structure in `models.py`
2. **Repository** - Add data access methods in `repositories/`
3. **Service** - Implement business logic in `services/`
4. **Serializer** - Create validation/serialization in `serializers/`
5. **View** - Add HTTP handlers in `views/`
6. **URL** - Register endpoints in `urls.py`
7. **Tests** - Write unit tests in `tests.py`
8. **API Docs** - Update [API.md](../../API.md)

### Code Quality Standards

- **Type Annotations**: Required for all function signatures
- **Linting**: Code must pass `ruff check .` before commit
- **Line Length**: 120 characters maximum
- **Testing**: Unit tests required for business logic
- **Documentation**: Update API.md when adding/modifying endpoints

### Admin Panel

Access Django admin at http://localhost:8000/admin/

Default credentials:
- Email: `admin@marbelle.com`
- Password: `admin123`

The admin panel provides:
- User management and permissions
- Product catalog management (products, categories, images)
- Order and cart inspection
- Database browsing and editing

## Setup & Commands

For setup instructions and Docker commands, see the main [Development Guide](../README.md).

For complete API documentation, see [API.md](../../API.md).
