"""Products repositories module providing data access for product-related models."""

from .category import CategoryRepository
from .product import ProductRepository

__all__ = ["CategoryRepository", "ProductRepository"]
