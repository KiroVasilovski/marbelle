# Task TASK-008A-BE: Shopping Cart Backend API

## State: Sprint

## Story Points: 4

## Priority: High

## Stack: Backend

## Dependencies: TASK-005 (Product Catalog API), TASK-008A-SESSION (Django Session Management)

**As a** backend system
**I want** to provide cart management APIs
**So that** users can manage shopping carts via REST endpoints

## Acceptance Criteria

-   [ ] Cart model with user association and guest session support
-   [ ] CartItem model with product, quantity, and price tracking
-   [ ] POST `/cart/items/` - Add item to cart
-   [ ] GET `/cart/` - Retrieve current cart contents
-   [ ] PUT `/cart/items/{id}/` - Update item quantity
-   [ ] DELETE `/cart/items/{id}/` - Remove item from cart
-   [ ] DELETE `/cart/clear/` - Clear entire cart
-   [ ] Stock validation prevents adding unavailable items
-   [ ] Cart totals calculation (subtotal, tax, total)
-   [ ] Guest cart management using Django sessions

## Technical Requirements

### Database Models

-   **Cart**: user (nullable), session_key (Django session key), timestamps
-   **CartItem**: cart, product, quantity, unit_price, timestamps

### Authentication

-   **Authenticated Users**: JWT required, cart associated with user
-   **Guest Users**: Django session-based cart using session cookies

### Business Rules

-   Stock validation prevents overselling
-   Guest carts expire after 4 weeks
-   Unit price frozen at add time
-   Max 99 items per product per cart
-   9% tax rate on subtotal
-   One active cart per user

### API Response Format

Standard success/error format with cart data including items, totals, and counts

## Definition of Done

-   [ ] All API endpoints implemented with proper authentication
-   [ ] Stock validation working correctly
-   [ ] Guest and authenticated user cart management
-   [ ] Unit tests with 80%+ coverage
-   [ ] API documentation updated
-   [ ] Database migrations created
-   [ ] ruff linting passes
