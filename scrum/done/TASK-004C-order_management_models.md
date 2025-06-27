# Task TASK-004C: Order Management Models

## State: Backlog
## Story Points: 3
## Priority: Medium

## Dependencies
- **TASK-004A**: User Management Models (requires User model)
- **TASK-004B**: Product Catalog Models (requires Product model)

**As a** developer  
**I want** to create order tracking models  
**So that** I can manage customer orders and order items

**As a** Store Administrator, 
**I want** to track customer purchases 
**So that** I can see what has been ordered and start the fulfillment process.

## Acceptance Criteria  
- [ ] Order model exists with core fields (user, total amount, created/updated timestamps, order status)
- [ ] OrderItem model for individual line items
- [ ] Order status tracking with simplified, universal status choices
- [ ] Relationship between Order and User (ForeignKey)
- [ ] Relationship between OrderItem and Product (ForeignKey)
- [ ] Total amount stored as field with calculation method for updates
- [ ] Database migrations created and applied
- [ ] Admin interface configured for both models
- [ ] Models include proper __str__ methods
- [ ] Basic field validation implemented

## Technical Requirements
- Use Django ORM with PostgreSQL
- Add proper foreign key relationships with CASCADE behavior
- Include basic field validation (positive quantities, valid decimal amounts)
- Follow Django model best practices
- Store total_amount as field for efficient database operations
- Provide method to recalculate total from order items

## Minimal Field Definitions
**Order:**
- user (ForeignKey to User, on_delete=CASCADE)
- status (CharField with choices: pending, processing, shipped, delivered, cancelled, refunded)
- total_amount (DecimalField, stored value calculated from order items)
- created_at/updated_at (auto timestamps)

**OrderItem:**
- order (ForeignKey to Order, on_delete=CASCADE)
- product (ForeignKey to Product, on_delete=PROTECT)
- quantity (PositiveIntegerField, min_value=1)
- unit_price (DecimalField, price at time of order, max_digits=10, decimal_places=2)
- created_at/updated_at (auto timestamps)

## Business Rules
- Order total_amount is calculated as sum of (quantity × unit_price) for all order items
- unit_price captures product price at time of order (prevents price changes affecting historical orders)
- Minimum quantity per order item is 1
- Order status defaults to 'pending'
- Deleting a product should not delete historical order items (PROTECT)

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Models tested with sample data via admin
- [ ] Admin interface functional with proper display of related fields
- [ ] Order total calculation method implemented and tested
- [ ] Database migrations applied successfully
- [ ] No linting errors (ruff)
- [ ] Models documented with docstrings
- [ ] Field validations working (positive quantities, valid amounts)

## Notes
- Additional fields (shipping address, payment info, etc.) will be added in future iterations
- Focus on core order tracking functionality
- Status choices simplified for universal applicability - more granular statuses can be added later if needed