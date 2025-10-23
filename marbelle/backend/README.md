# Marbelle Backend

Django backend for the Marbelle e-commerce natural stone application.

## Technology Stack

- **Django**: 5.2 LTS
- **Python**: 3.12.11
- **Database**: PostgreSQL 16+ with psycopg2-binary
- **Environment Management**: python-dotenv
- **Code Quality**: ruff linting

## Project Structure

```
backend/
├── marbelle/
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py          # Common settings
│   │   ├── dev.py           # Development settings
│   │   └── prod.py          # Production settings
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── users/                   # User management app
├── products/                # Product catalog app
├── orders/                  # Orders and cart app
├── core/                    # Shared utilities app
├── static/                  # Static files
├── templates/               # Django templates
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables
├── Dockerfile              # Docker container config
└── manage.py               # Django management script
```

## Setup Instructions

### 1. Virtual Environment Setup

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

**Environment Management:** The project uses a centralized singleton (`marbelle/env_config.py`) to load and validate all environment variables once at startup. All settings files access env vars through `env_config.SECRET_KEY` instead of direct `os.getenv()` calls.

Copy the `.env` file and configure your environment variables:

```bash
# Django settings
SECRET_KEY=your-secret-key-here
DJANGO_SETTINGS_MODULE=marbelle.settings.dev

# Database settings (for PostgreSQL setup)
DB_NAME=marbelle_db
DB_USER=marbelle_user
DB_PASSWORD=marbelle_password
DB_HOST=localhost
DB_PORT=5432
```

### 3. Development Server

```bash
# Activate virtual environment
source venv/bin/activate

# Run development server
python manage.py runserver

# Or specify settings explicitly
python manage.py runserver --settings=marbelle.settings.dev
```

The development server will be available at `http://localhost:8000`

### 4. Database Setup (PostgreSQL)

The project is configured to use PostgreSQL. You can run it via Docker:

```bash
# From project root directory (marbelle/)
docker-compose up -d postgres

# Run migrations
source backend/venv/bin/activate
cd backend
python manage.py migrate --settings=marbelle.settings.dev

# Create superuser
python manage.py createsuperuser --settings=marbelle.settings.dev
```

**Database Connection Details:**
- Host: localhost
- Port: 5432
- Database: marbelle_db
- User: marbelle_user
- Password: marbelle_password

### 5. Docker Development

```bash
# From project root directory (marbelle/)
docker-compose up --build
```

This will start both the Django backend and PostgreSQL database.

## Django Apps

- **users**: User authentication, profiles, and account management
- **products**: Product catalog, categories, and specifications
- **orders**: Shopping cart, orders, and custom quotes
- **core**: Shared utilities, base models, and common functionality

## Code Quality

This project uses `ruff` for Python linting with a 120-character line limit:

```bash
# Run linting
ruff check .

# Run linting with auto-fix
ruff check . --fix
```

## Database

Configured to use PostgreSQL 16+ for all environments:
- **Development**: PostgreSQL via Docker Compose
- **Production**: PostgreSQL with environment variables

**Admin Access:**
- Username: admin
- Email: admin@marbelle.com  
- Password: admin123
- URL: http://localhost:8000/admin/

## Database Migrations

Django migrations track database schema changes. Here are the essential commands:

### Basic Migration Commands

```bash
# Create migrations for changes to models
docker-compose exec backend python manage.py makemigrations

# Apply migrations to database
docker-compose exec backend python manage.py migrate

# Check migration status
docker-compose exec backend python manage.py showmigrations

# Create migrations for specific app
docker-compose exec backend python manage.py makemigrations users
```

### Development Best Practices

**During Development (before production):**
```bash
# If you need to rollback and redo migrations cleanly
docker-compose exec backend python manage.py migrate users zero  # Rollback to initial state
rm backend/users/migrations/0001_initial.py                      # Remove migration files
docker-compose exec backend python manage.py makemigrations users # Create fresh migration
docker-compose exec backend python manage.py migrate              # Apply clean migration
```

**For table name changes in development:**
Instead of creating a separate migration for table renames, modify the model's `Meta.db_table` 
before creating the initial migration to avoid unnecessary rename operations.

**Database Reset (Development Only):**
```bash
# Complete database reset
docker-compose exec postgres psql -U marbelle_user -d marbelle_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker-compose exec backend python manage.py migrate
```

### Migration Troubleshooting

**Inconsistent Migration History:**
If you see migration dependency errors, you may need to reset the database:
```bash
# Check which migrations Django thinks are applied
docker-compose exec backend python manage.py showmigrations

# Reset database and reapply all migrations
docker-compose exec postgres psql -U marbelle_user -d marbelle_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker-compose exec backend python manage.py migrate
```

**Custom Table Names:**
All models use custom table names via `db_table` in their Meta class:
- `users.CustomUser` → `users` table
- `products.Category` → `categories` table
- `products.Product` → `products` table
- `products.ProductImage` → `product_images` table
- `orders.Order` → `orders` table
- `orders.OrderItem` → `order_items` table

## Production Deployment

### Production Server with Gunicorn

The project includes production-ready server configuration using Gunicorn WSGI server.

#### Docker Production Build
```bash
# Build production Docker image
docker build -f backend/Dockerfile -t marbelle-backend-prod backend/

# Run production container
docker run -p 8000:8000 --env-file backend/.env marbelle-backend-prod
```

#### Local Production WSGI Server

**Method 1: Custom Management Command**
```bash
# Set production environment
export DJANGO_SETTINGS_MODULE=marbelle.settings.prod

# Run with Gunicorn using production settings
python manage.py rungunicorn

# With custom configuration
python manage.py rungunicorn --workers 4 --port 8000
```

**Method 2: Direct Gunicorn Command**
```bash
# Set production environment and run Gunicorn
export DJANGO_SETTINGS_MODULE=marbelle.settings.prod
gunicorn --config gunicorn_config.py marbelle.wsgi:application

# Or with inline parameters
export DJANGO_SETTINGS_MODULE=marbelle.settings.prod
gunicorn --bind 0.0.0.0:8000 --workers 4 --timeout 30 marbelle.wsgi:application
```

**Method 3: Environment Variable in .env**
```bash
# Update .env file
echo "DJANGO_SETTINGS_MODULE=marbelle.settings.prod" >> .env

# Run Gunicorn (will use production settings)
gunicorn --config gunicorn_config.py marbelle.wsgi:application
```

#### Production Configuration
- **Dockerfile**: Production-ready with Gunicorn server
- **Dockerfile.dev**: Development version with Django dev server
- **gunicorn_config.py**: Optimized Gunicorn settings for production
- **Environment Variables**: GUNICORN_WORKERS and GUNICORN_TIMEOUT configurable

#### Key Differences from Development
- Uses Gunicorn instead of Django development server
- Production security settings (HTTPS, secure cookies, etc.)
- Error logging to files instead of console
- No DEBUG mode

#### Available Endpoints
- **API Root**: `http://localhost:8000/` - API information and endpoints
- **Health Check**: `http://localhost:8000/health/` - Server health status
- **Admin Panel**: `http://localhost:8000/admin/` - Django administration
- **Product API**: `http://localhost:8000/api/v1/products/` - Product catalog endpoints

## Product Catalog API

### Admin Panel Management
Access: http://localhost:8000/admin/ (admin@marbelle.com / admin123)

**Add Products:**
1. Go to Products > Products > Add Product
2. Fill in name, description, price, category, SKU, stock
3. Add images via inline forms (set primary image)

**Update Products:**
- Edit any product field, update stock, change images
- Set `is_active=False` to hide products from API

**Categories:**
- Create/edit categories under Products > Categories
- Product counts update automatically

### API Usage

**List Products:**
```bash
curl "http://localhost:8000/api/v1/products/"
```

**Search & Filter:**
```bash
# Search products
curl "http://localhost:8000/api/v1/products/?search=marble"

# Filter by category and price
curl "http://localhost:8000/api/v1/products/?category=1&min_price=50&max_price=100"

# In-stock products only
curl "http://localhost:8000/api/v1/products/?in_stock=true"

# Sort by price (descending)
curl "http://localhost:8000/api/v1/products/?ordering=-price"
```

**Categories:**
```bash
# List categories
curl "http://localhost:8000/api/v1/categories/"

# Products in category
curl "http://localhost:8000/api/v1/categories/1/products/"
```

## Shopping Cart API

### Session Management

The shopping cart supports both authenticated users and guest sessions with **Safari-compatible session handling**:

- **Authenticated Users**: Cart associated with user account via JWT authentication
- **Guest Users (Chrome/Firefox/Edge)**: Cart persisted via secure HttpOnly session cookies (`marbelle_sessionid`)
- **Guest Users (Safari)**: Cart persisted via `X-Session-ID` custom header (fallback for cookie-blocked browsers)

### Safari Compatibility

Safari's Intelligent Tracking Prevention (ITP) blocks third-party cookies. The cart API automatically handles this:

**How It Works:**
1. Backend always returns `X-Session-ID` in response headers for guest users
2. Frontend stores session ID in localStorage only if cookies are blocked
3. Future requests send `X-Session-ID` header to maintain session
4. Backend checks header first, then falls back to cookies

**Result:**
- Chrome/Firefox/Edge users get secure HttpOnly cookies (preferred)
- Safari users automatically use header-based sessions (fallback)
- No manual configuration required

### Environment Variables for Production

When deploying with frontend/backend on different subdomains:

```bash
# Enable cross-site cookie support
ENABLE_CROSS_SITE_COOKIES=true

# CORS configuration
CORS_ALLOWED_ORIGINS=https://your-frontend.com
ALLOWED_HOSTS=your-backend.com
```

### API Endpoints

```bash
# Get cart
curl "http://localhost:8000/api/v1/cart/"

# Add item to cart
curl -X POST "http://localhost:8000/api/v1/cart/items/" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'

# Update cart item
curl -X PUT "http://localhost:8000/api/v1/cart/items/1/" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'

# Remove cart item
curl -X DELETE "http://localhost:8000/api/v1/cart/items/1/remove/"

# Clear cart
curl -X DELETE "http://localhost:8000/api/v1/cart/clear/"

# With session header (Safari)
curl "http://localhost:8000/api/v1/cart/" \
  -H "X-Session-ID: your-session-id"
```

For detailed API documentation, see [API.md](../../API.md) at the project root.

For Safari session troubleshooting, see [SAFARI_SESSION_FIX.md](../../SAFARI_SESSION_FIX.md).

## Cloudinary Image Storage

The application uses **Cloudinary** for production image storage with automatic CDN delivery and image optimization.

### Setup Instructions

1. **Create a Cloudinary Account**:
   - Sign up at [cloudinary.com](https://cloudinary.com)
   - Navigate to Dashboard → Settings → API Keys

2. **Configure Environment Variables**:

   Add to your `.env` file:
   ```bash
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=your-api-secret
   ```

3. **Development vs Production**:
   - **Without Cloudinary credentials**: Images stored locally in `media/products/`
   - **With Cloudinary credentials**: Images automatically uploaded to Cloudinary with CDN URLs

### Features

- **Automatic Optimization**: Images optimized with `quality: auto:best` and `fetch_format: auto`
- **CDN Delivery**: All images served via Cloudinary's global CDN
- **SKU-Based Organization**: Product images stored in `marbelle/products/{sku}/` folders on Cloudinary
- **Seamless Fallback**: Works with local storage when Cloudinary credentials are not configured
- **Easy Management**: All images for a product in one folder for bulk operations

### Admin Panel Usage

Upload images via Django admin panel (`/admin/products/product/`) - the system automatically:
- Uploads to Cloudinary (if configured) or local storage
- Generates optimized CDN URLs
- Maintains existing admin interface (no changes needed)

### Image URLs

- **Local Storage**: `http://localhost:8000/media/products/CARR-WHITE-001/image.jpg`
- **Cloudinary**: `https://res.cloudinary.com/your-cloud-name/image/upload/marbelle/products/CARR-WHITE-001/image.jpg`

Images are organized in folders by product SKU for easy management. The API automatically returns the correct URL format based on your configuration.