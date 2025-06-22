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

## Next Steps

- Django model development for each app
- API endpoint development  
- Authentication system implementation
- Frontend integration