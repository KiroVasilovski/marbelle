# Task TASK-004B: Product Catalog Models

## State: Backlog  
## Story Points: 8
## Priority: High

## Dependencies
- None (foundational task)

**As a** developer  
**I want** to create product and category models for natural stone products
**So that** I can store and manage a unified product catalog accessible to all customers

**As a** Customer
**I want** to browse all available natural stone products with their details and images
**So that** I can see the full range of products and choose what I need regardless of my customer type.

## Acceptance Criteria  
- [ ] Category model with name and description fields
- [ ] Product model with essential fields (name, description, price, unit_of_measure, category)
- [ ] ProductImage model for multiple product images (separate from Product model)
- [ ] Basic inventory tracking (stock_quantity, is_active)
- [ ] Models include created_at/updated_at timestamps
- [ ] Database migrations created and applied
- [ ] Admin interface configured for all models
- [ ] Models include proper __str__ methods
- [ ] Basic field validation implemented

## Technical Requirements
- Use Django ORM with PostgreSQL
- Add proper field validation (positive price, positive stock)
- Include model relationships with proper CASCADE behavior
- Support for product image uploads with file organization
- Follow Django model best practices
- Ensure all customers can access all products

## Model Field Definitions

**Category:**
- name (CharField, max_length=100, unique)
- description (TextField, optional)
- is_active (BooleanField, default=True)
- created_at/updated_at (auto timestamps)

**Product:**
- name (CharField, max_length=200)
- description (TextField)
- price (DecimalField, max_digits=10, decimal_places=2)
- unit_of_measure (CharField, choices: sqft, piece, slab, linear_ft)
- category (ForeignKey to Category, on_delete=PROTECT)
- stock_quantity (PositiveIntegerField, default=0)
- is_active (BooleanField, default=True)
- sku (CharField, max_length=50, unique, optional)
- created_at/updated_at (auto timestamps)

**ProductImage:**
- product (ForeignKey to Product, on_delete=CASCADE)
- image (ImageField, upload_to='products/')
- alt_text (CharField, max_length=200, optional)
- is_primary (BooleanField, default=False)
- display_order (PositiveIntegerField, default=0)
- created_at (auto timestamp)

## Business Rules
- Each product must have at least one category
- Price must be positive (> 0)
- Stock quantity cannot be negative
- Only one primary image per product allowed
- SKU must be unique when provided
- All products visible to all customers regardless of customer type

## Sample Categories
- Slabs
- Tiles  
- Mosaics
- Decorative Items
- Tables
- Accessories

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Models tested with sample data covering different product types
- [ ] Admin interface functional with proper field display and filters
- [ ] Image upload functionality working
- [ ] Database migrations applied successfully
- [ ] No linting errors (ruff)
- [ ] Models documented with docstrings
- [ ] Field validations working (positive prices, stock validation)

## Notes
- Additional fields (dimensions, material origin, finish type) will be added in future iterations
- Focus on core product catalog functionality accessible to all customers
- Image storage handled by Django's ImageField initially