# Repository Pattern Implementation Guide

## Overview

The Marbelle backend uses the **Repository Pattern** to centralize all data access logic. This ensures consistent database interactions, prevents N+1 query problems, and makes services testable and maintainable.

## Architecture

### Layers

```
Views/API Endpoints
        ↓
Services (Business Logic)
        ↓
Repositories (Data Access)
        ↓
Django ORM / Database
```

### Key Principle

**Repositories = Data Access Only**
- Query the database
- Return model instances or QuerySets
- Include query optimization (prefetch_related, select_related)
- NO business logic in repositories

**Services = Business Logic Only**
- Call repositories to fetch/save data
- Apply business rules and validation
- Orchestrate multiple repository calls
- Handle side effects (emails, notifications)

## Base Repository

Located: `core/repositories/base.py`

Provides generic CRUD operations for all repositories:

```python
class BaseRepository(Generic[T]):
    """Generic repository with common operations."""

    @classmethod
    def create(cls, **kwargs) -> T
    @classmethod
    def get(cls, **kwargs) -> Optional[T]
    @classmethod
    def filter(cls, **kwargs) -> QuerySet
    @classmethod
    def exists(cls, **kwargs) -> bool
    @classmethod
    def update(cls, filter_kwargs, update_data) -> int
    @classmethod
    def delete(cls, **kwargs) -> tuple
    @classmethod
    def count(cls, **kwargs) -> int
    @classmethod
    def all(cls) -> QuerySet
```

### Static Methods Only

All repository methods are **static methods** - repositories are stateless data access wrappers with no instance state.

## Existing Repositories

### Users App

#### UserRepository
**File**: `users/repositories/user.py`

Centralizes user queries:
```python
UserRepository.get_by_email(email)           # Get user by email
UserRepository.get_active_by_email(email)    # Get active user
UserRepository.get_by_id(user_id)            # Get by primary key
UserRepository.email_exists(email)           # Boolean check
UserRepository.create_user(...)              # Create with validation
```

**Eliminates**: 4+ duplicate email lookup patterns across services

#### TokenRepository
**File**: `users/repositories/token.py`

Handles all 3 token types (Email Verification, Password Reset, Email Change):
```python
TokenRepository.get_valid_token(token_str, token_model)     # Generic verification
TokenRepository.verify_email_token(token)                   # Email verification
TokenRepository.verify_password_reset_token(token)          # Password reset
TokenRepository.verify_email_change_token(token)            # Email change

TokenRepository.get_or_create_email_verification_token(user)
TokenRepository.create_password_reset_token(user)
TokenRepository.create_email_change_token(user, new_email)

TokenRepository.mark_token_used(token)                      # Mark as used
TokenRepository.cleanup_expired_tokens()                    # Maintenance
```

**Eliminates**: 3x identical token verification code → 1 generic method

#### AddressRepository
**File**: `users/repositories/address.py`

Handles address queries with proper security and optimization:
```python
AddressRepository.get_user_addresses(user)       # Ordered by primary + created
AddressRepository.get_primary_address(user)      # Get primary only
AddressRepository.get_user_address(id, user)     # With security check
AddressRepository.user_has_address_label(user, label)  # Boolean check
AddressRepository.count_user_addresses(user)     # Count

AddressRepository.create_address(user, **data)
AddressRepository.update_address(address, **data)
AddressRepository.set_primary_address(address)   # Handle uniqueness
AddressRepository.delete_address(address)
```

**Prevents**: N+1 in address operations with consistent optimization

### Products App

#### ProductRepository
**File**: `products/repositories/product.py`

Optimizes product queries with prefetch/select_related:
```python
ProductRepository.get_all_active()                      # All active products
ProductRepository.get_by_id(product_id)                 # Single product
ProductRepository.get_by_sku(sku)                       # By SKU
ProductRepository.get_active_in_category(category_id)   # Category products

ProductRepository.filter_products(                      # Advanced filtering
    search_query=...,
    category_id=...,
    min_price=...,
    max_price=...,
    in_stock=...
)

ProductRepository.product_exists(product_id)            # Boolean
ProductRepository.active_product_exists(product_id)     # Boolean

ProductRepository.get_category(category_id)
ProductRepository.get_all_active_categories()
```

**Ensures**: All product queries include images and category prefetch

### Orders App

#### CartRepository
**File**: `orders/repositories/cart.py`

Handles cart operations with N+1 prevention:
```python
CartRepository.get_user_cart(user)                # Get or create for user
CartRepository.get_guest_cart(session_key)        # Get or create for guest

CartRepository.get_cart_items(cart)               # Items with product prefetch
CartRepository.get_cart_item(item_id, cart)       # Single item

CartRepository.add_item(cart, product_id, qty)    # Add or update
CartRepository.update_item(item_id, cart, qty)    # Update quantity
CartRepository.remove_item(item_id, cart)         # Remove item

CartRepository.clear_cart(cart)                   # Clear all items
CartRepository.cart_item_exists(product_id, cart) # Boolean check
```

**Prevents**: N+1 when loading cart items + products

#### OrderRepository
**File**: `orders/repositories/order.py`

Handles order queries:
```python
OrderRepository.get_user_orders(user)              # All orders with prefetch
OrderRepository.get_order(order_id, user)          # Single order
OrderRepository.create_order(user, **data)         # Create new

OrderRepository.user_has_orders(user)              # Boolean
OrderRepository.count_user_orders(user)            # Count
OrderRepository.update_order(order, **data)        # Update fields
```

**Ensures**: Order items and products always prefetched

## Usage Examples

### In Services

```python
from users.repositories import UserRepository, AddressRepository

class AddressService:
    @staticmethod
    def get_user_addresses(user):
        # Repository handles optimization
        return list(AddressRepository.get_user_addresses(user))

    @staticmethod
    def create_address(user, address_data):
        # Repository method instead of direct model
        address = AddressRepository.create_address(user, **address_data)
        return address

    @staticmethod
    def validate_label_uniqueness(user, label):
        # Repository boolean check
        return not AddressRepository.user_has_address_label(user, label)
```

### In Views

```python
from rest_framework import viewsets
from products.repositories import ProductRepository

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    def get_queryset(self):
        # Views use repository for optimized queries
        return ProductRepository.get_all_active()
```

### Testing

```python
from unittest.mock import Mock, patch
from users.repositories import UserRepository

def test_get_user_by_email():
    # Easy to mock repository for service tests
    with patch('users.repositories.UserRepository.get_by_email') as mock_repo:
        mock_repo.return_value = Mock(id=1, email='test@example.com')
        user = mock_repo('test@example.com')
        assert user.email == 'test@example.com'
```

## Query Optimization Patterns

### Pattern 1: Select Related (One-to-One / Foreign Key)

```python
# ❌ N+1 Problem: 1 query + N queries for related category
products = Product.objects.all()
for product in products:
    print(product.category.name)  # Extra query per product!

# ✅ Optimized
products = Product.objects.select_related('category')
for product in products:
    print(product.category.name)  # Single query, all data loaded
```

**Used in repositories for**:
- Product → Category
- CartItem → Product
- OrderItem → Product

### Pattern 2: Prefetch Related (Reverse Foreign Key / Many-to-Many)

```python
# ❌ N+1 Problem
product = Product.objects.get(id=1)
for image in product.images.all():  # Extra query!
    print(image.url)

# ✅ Optimized
product = Product.objects.prefetch_related('images').get(id=1)
for image in product.images.all():  # Data already loaded
    print(image.url)
```

**Used in repositories for**:
- Product ← Images
- Order ← OrderItems

### Combining Both

```python
# Repositories combine for optimal queries
Product.objects.select_related('category').prefetch_related('images')
# Single query to products + category + images!
```

## Creating New Repositories

### Step 1: Create Repository File

```python
# app_name/repositories/model_name.py

from core.repositories import BaseRepository
from ..models import MyModel

class MyRepository(BaseRepository):
    model = MyModel

    @staticmethod
    def get_by_field(field_value):
        """Domain-specific method."""
        try:
            return MyModel.objects.select_related('...').get(field=field_value)
        except MyModel.DoesNotExist:
            return None
```

### Step 2: Add to __init__.py

```python
# app_name/repositories/__init__.py

from .model_name import MyRepository

__all__ = ["MyRepository"]
```

### Step 3: Use in Services

```python
from ..repositories import MyRepository

class MyService:
    @staticmethod
    def my_method():
        # Use repository instead of direct ORM
        obj = MyRepository.get_by_field('value')
        return obj
```

### Step 4: Test Repository

```python
# app_name/tests.py

class MyRepositoryTest(TestCase):
    def test_get_by_field(self):
        obj = MyRepository.get_by_field('value')
        self.assertIsNotNone(obj)
```

## Benefits

| Benefit | Details |
|---------|---------|
| **N+1 Prevention** | Optimization applied at retrieval, not scattered across service calls |
| **DRY Code** | Query logic in one place, not duplicated across services |
| **Testability** | Easy to mock repositories in service tests |
| **Maintainability** | Change query logic once, applies everywhere |
| **Security** | Consistent validation (e.g., user ownership checks) |
| **Performance** | Guaranteed optimal queries (prefetch/select_related) |
| **Consistency** | All queries follow same patterns and standards |

## Migration Path

Existing code has been refactored in phases:

**Phase 1 - Users App** ✅
- UserRepository (user lookups, creation)
- TokenRepository (all 3 token types)
- AddressRepository (address CRUD)
- Services refactored to use repositories
- 50+ comprehensive tests

**Phase 2 - Products & Orders** ✅ (Partial)
- ProductRepository (all product queries)
- CartRepository (cart operations)
- OrderRepository (order queries)
- ProductFilterService refactored

**Phase 3 - Complete Migration** (In Progress)
- Refactor remaining services to use repositories
- Add comprehensive test coverage
- Update views/serializers as needed

## Best Practices

### ✅ DO

- **Use repositories in services** - All data access via repositories
- **Keep repositories stateless** - Only static methods
- **Include optimization** - Always add prefetch/select_related
- **Add docstrings** - Document return types and parameters
- **Use type hints** - Return Optional[Model], QuerySet, list, etc.
- **Handle exceptions** - Return None for not found, don't raise
- **Test repositories** - Unit test all query methods

### ❌ DON'T

- **Business logic in repositories** - That's service layer's job
- **Partial optimization** - If one query prefetches, all should
- **Direct ORM in services** - Always call repository methods
- **Assume query optimization** - Always test with Django Debug Toolbar
- **Create instance repositories** - Only static methods
- **Mix concerns** - Keep data access separate from business logic

## Testing Query Performance

Use Django Debug Toolbar to verify query optimization:

```python
from django.test.utils import override_settings
from django.test import TestCase

@override_settings(DEBUG=True)
class PerformanceTest(TestCase):
    def test_no_n_plus_one(self):
        from django.db import connection
        from django.test.utils import CaptureQueriesContext

        with CaptureQueriesContext(connection) as ctx:
            products = list(ProductRepository.get_all_active())
            for product in products:
                print(product.images.all())  # Should not create new queries

        # Should be constant ~3 queries, not N+3
        assert len(ctx.captured_queries) < 10
```

## Future Enhancements

- [ ] Add async repository methods
- [ ] Implement repository caching
- [ ] Add bulk operations
- [ ] Generate custom managers from repositories
- [ ] Add filtering DSL for complex queries
- [ ] Implement soft deletes in repositories

---

**Last Updated**: October 2025
**Maintained by**: Claude Code
**Status**: Active Implementation
