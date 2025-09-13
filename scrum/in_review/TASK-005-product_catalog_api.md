# Task TASK-005: Product Catalog API

## State: Sprint

## Story Points: 5

## Priority: High

## Stack: Backend

## Dependencies

-   **TASK-004A**: User Management Models (for data consistency)
-   **TASK-004B**: Product Catalog Models (requires Product, Category, ProductImage models)
-   **TASK-004C**: Order Management Models (for data consistency)

**As a** frontend developer  
**I want** REST API endpoints for product catalog  
**So that** I can display products and categories in the React application with filtering and search capabilities

**As a** customer (business or individual)
**I want** to browse and search the complete product catalog via API
**So that** the frontend can display all available natural stone products with their details and images

## Acceptance Criteria

-   [ ] GET /api/v1/products/ - Paginated product list with filtering and search
-   [ ] GET /api/v1/products/{id}/ - Individual product details with all images
-   [ ] GET /api/v1/categories/ - List all categories with product counts
-   [ ] GET /api/v1/categories/{id}/products/ - Products filtered by category
-   [ ] Filtering: ?category=1&min_price=100&max_price=500&in_stock=true
-   [ ] Search: ?search=marble (searches product name, description, and SKU)
-   [ ] Product images returned with full URLs for frontend consumption
-   [ ] Only active products and categories returned (is_active=True)
-   [ ] Stock availability as simple boolean (in_stock: true/false)
-   [ ] Include proper HTTP status codes and error handling

## Technical Requirements

-   Use Django REST Framework with ViewSets for consistent URL routing
-   Include serializers for Product, Category, and ProductImage models
-   Pagination: 20 items per page with next/previous links
-   Implement CORS for frontend integration (django-cors-headers)
-   Public read-only access (no authentication required)
-   Use django-filter for advanced filtering capabilities
-   API versioning: v1 prefix for all endpoints
-   Return 404 for inactive products/categories or non-existent resources

## API Response Structure

**Product List Response:**

```json
{
    "count": 150,
    "next": "http://localhost:8000/api/v1/products/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "name": "Carrara White Marble Slab",
            "description": "Premium Italian marble...",
            "price": "120.00",
            "unit_of_measure": "sqm",
            "category": 1,
            "stock_quantity": 25,
            "in_stock": true,
            "sku": "CWM-001",
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

**Category List Response:**

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

## Business Rules

-   Only return products and categories where is_active=True
-   Stock availability calculated as: stock_quantity > 0
-   Category product count includes only active products
-   Search is case-insensitive across name, description, and SKU fields
-   Price filtering accepts decimal values with 2 decimal places
-   Images sorted by display_order, then created_at

## URL Structure

-   `/api/v1/products/` - Product ViewSet
-   `/api/v1/categories/` - Category ViewSet
-   `/api/v1/categories/{id}/products/` - Custom action for category products

## Definition of Done

-   [ ] All acceptance criteria met
-   [ ] API endpoints tested with curl/Postman for all scenarios
-   [ ] Serializers return consistent JSON structure as specified
-   [ ] Filtering and search functionality working correctly
-   [ ] Error handling for 404, 400, and 500 status codes
-   [ ] CORS configured for frontend integration
-   [ ] Only active products/categories returned
-   [ ] No linting errors (ruff)
-   [ ] All endpoints return proper pagination metadata

## Notes

-   Write operations (POST/PUT/DELETE) excluded - admin panel handles product management
-   No authentication required - public catalog access for all customers
-   Foundation for future cart and order functionality
-   Images include full URLs for direct frontend consumption
