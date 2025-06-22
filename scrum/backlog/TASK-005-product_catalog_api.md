# Task TASK-005: Product Catalog API

## State: Backlog
## Story Points: 5
## Priority: High

**As a** frontend developer  
**I want** REST API endpoints for product catalog  
**So that** I can display products and categories in the React application

## Acceptance Criteria  
- [ ] GET /api/products/ - List all products with pagination
- [ ] GET /api/products/{id}/ - Get individual product details
- [ ] GET /api/categories/ - List all product categories
- [ ] GET /api/categories/{id}/products/ - Get products by category
- [ ] API includes product images, specifications, and pricing
- [ ] Implement filtering (price range, category, material type)
- [ ] Implement search functionality
- [ ] Include proper HTTP status codes and error handling
- [ ] API documentation (DRF browsable API)

## Technical Requirements
- Use Django REST Framework
- Include serializers for all models
- Add pagination (25 items per page)
- Implement CORS for frontend integration
- Add basic API authentication
- Include proper validation

## Definition of Done
- [ ] All acceptance criteria met
- [ ] API endpoints tested with Postman/curl
- [ ] Serializers return proper JSON structure
- [ ] Error handling implemented
- [ ] API documentation accessible
- [ ] No linting errors (ruff)