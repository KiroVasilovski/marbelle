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