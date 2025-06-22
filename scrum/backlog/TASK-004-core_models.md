# Task TASK-004: Core Database Models

## State: Backlog
## Story Points: 8
## Priority: High

**As a** developer  
**I want** to create core database models for the application  
**So that** I can store and manage product, user, and order data effectively

## Acceptance Criteria  
- [ ] User model with authentication fields (extends Django User or custom)
- [ ] Product model with core fields (name, description, price, category, specifications)
- [ ] Category model for product organization (slabs, tiles, mosaics)
- [ ] Order model for tracking purchases
- [ ] OrderItem model for individual items in orders
- [ ] Product image model for multiple product photos
- [ ] Database migrations created and applied
- [ ] Models include proper field validation and constraints
- [ ] Admin interface configured for all models

## Technical Requirements
- Use Django ORM with PostgreSQL
- Include proper indexing for performance
- Add model __str__ methods for admin readability
- Include created_at/updated_at timestamps
- Follow Django model best practices

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Models tested with sample data
- [ ] Admin interface functional
- [ ] Database migrations applied successfully
- [ ] No linting errors (ruff)
- [ ] Models documented with docstrings