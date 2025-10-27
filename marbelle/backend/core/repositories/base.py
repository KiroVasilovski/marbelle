"""Base repository class providing generic CRUD operations for all repositories."""

from typing import Any, Generic, Optional, Type, TypeVar

from django.db import models
from django.db.models import QuerySet

# TypeVar for generic model type
T = TypeVar("T", bound=models.Model)


class BaseRepository(Generic[T]):
    """
    Generic repository providing standardized CRUD operations.

    This base class provides common database operations that can be overridden
    or extended by specific repositories for each model.

    Type-safe operations using Python generics for better IDE support and type checking.
    """

    model: Type[T]

    @classmethod
    def create(cls, **kwargs: Any) -> T:
        """
        Create and save a new model instance.

        Args:
            **kwargs: Model field values

        Returns:
            Model instance that has been saved to the database
        """
        return cls.model.objects.create(**kwargs)

    @classmethod
    def get_by_id(cls, obj_id: Any) -> Optional[T]:
        """
        Retrieve a model instance by its primary key.

        Args:
            obj_id: Primary key value

        Returns:
            Model instance or None if not found
        """
        return cls.get(id=obj_id)

    @classmethod
    def get(cls, **kwargs: Any) -> Optional[T]:
        """
        Retrieve a single model instance by given filters.

        Returns the first matching object or None if not found.

        Args:
            **kwargs: Filter conditions

        Returns:
            Model instance or None if not found
        """
        try:
            return cls.model.objects.get(**kwargs)
        except cls.model.DoesNotExist:
            return None

    @classmethod
    def get_or_none(cls, **kwargs: Any) -> Optional[T]:
        """
        Alias for get() - retrieve a single model instance or None.

        Args:
            **kwargs: Filter conditions

        Returns:
            Model instance or None if not found
        """
        return cls.get(**kwargs)

    @classmethod
    def filter(cls, **kwargs: Any) -> QuerySet:
        """
        Retrieve multiple model instances matching given filters.

        Args:
            **kwargs: Filter conditions

        Returns:
            QuerySet of matching instances
        """
        return cls.model.objects.filter(**kwargs)

    @classmethod
    def all(cls) -> QuerySet:
        """
        Retrieve all model instances.

        Returns:
            QuerySet of all instances
        """
        return cls.model.objects.all()

    @classmethod
    def exists(cls, **kwargs: Any) -> bool:
        """
        Check if at least one model instance matches given filters.

        Args:
            **kwargs: Filter conditions

        Returns:
            True if matching instance exists, False otherwise
        """
        return cls.model.objects.filter(**kwargs).exists()

    @classmethod
    def count(cls, **kwargs: Any) -> int:
        """
        Count model instances matching given filters.

        Args:
            **kwargs: Filter conditions (optional; counts all if no filters)

        Returns:
            Number of matching instances
        """
        if kwargs:
            return cls.model.objects.filter(**kwargs).count()
        return cls.model.objects.count()

    @classmethod
    def update(cls, filter_kwargs: dict[str, Any], update_data: dict[str, Any]) -> int:
        """
        Update multiple model instances matching filters.

        Args:
            filter_kwargs: Filter conditions to find instances to update
            update_data: Dictionary of field values to update

        Returns:
            Number of instances updated
        """
        return cls.model.objects.filter(**filter_kwargs).update(**update_data)

    @classmethod
    def delete(cls, **kwargs: Any) -> tuple[int, dict[str, int]]:
        """
        Delete model instances matching given filters.

        Args:
            **kwargs: Filter conditions

        Returns:
            Tuple of (count_deleted, dict_of_deleted_by_type)
        """
        return cls.model.objects.filter(**kwargs).delete()

    @classmethod
    def save(cls, instance: T) -> T:
        """
        Save a model instance to database.

        Args:
            instance: Model instance to save

        Returns:
            Saved model instance
        """
        instance.save()
        return instance
