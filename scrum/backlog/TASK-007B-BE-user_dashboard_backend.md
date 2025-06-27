# Task TASK-007B-BE: User Dashboard & Profile Management - Backend

## State: Backlog
## Story Points: 2
## Priority: Medium
## Stack: Backend

## Parent Task
- **TASK-007B**: User Dashboard & Profile Management (parent task - will be completed when both BE and FE subtasks are done)

## Dependencies
- **TASK-007A-BE**: Core Authentication Backend (requires JWT authentication)

**As a** frontend developer  
**I want** user profile and address management API endpoints  
**So that** I can implement dashboard functionality for authenticated users

**As a** system  
**I want** secure profile and address management  
**So that** user data is protected and properly validated

## Acceptance Criteria  

### **User Profile API**
- [ ] GET /api/v1/auth/user/ endpoint to retrieve current user profile
- [ ] PUT /api/v1/auth/user/ endpoint to update user profile
- [ ] Profile validation for all user fields
- [ ] Email change handling with re-verification requirement
- [ ] Profile update logging for audit trail

### **Address Management API**
- [ ] GET /api/v1/auth/addresses/ endpoint to list user addresses
- [ ] POST /api/v1/auth/addresses/ endpoint to create new address
- [ ] PUT /api/v1/auth/addresses/{id}/ endpoint to update address
- [ ] DELETE /api/v1/auth/addresses/{id}/ endpoint to delete address
- [ ] PATCH /api/v1/auth/addresses/{id}/set-primary/ endpoint to set primary address

### **Password Change API**
- [ ] POST /api/v1/auth/change-password/ endpoint
- [ ] Current password verification requirement
- [ ] New password validation (strength requirements)
- [ ] Password change confirmation and logging

### **Account Settings API**
- [ ] GET /api/v1/auth/settings/ endpoint for user preferences
- [ ] PUT /api/v1/auth/settings/ endpoint to update preferences
- [ ] Email notification preferences management
- [ ] Privacy settings management

### **Order History Integration**
- [ ] GET /api/v1/auth/orders/ endpoint for user order history
- [ ] Order status tracking integration
- [ ] Order details endpoint integration
- [ ] Reorder functionality API support

## Technical Requirements

### **Database Models**
- Address model with proper relationships and validation
- User settings/preferences model
- Profile update audit logging
- Address usage tracking for deletion prevention

### **Address Model Implementation**
```python
class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=50)  # "Home", "Office", etc.
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    company = models.CharField(max_length=100, blank=True)
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### **API Authentication**
- JWT token authentication required for all endpoints
- User-specific data access controls
- Proper authorization checks for address ownership
- Rate limiting for profile update operations

### **Validation & Business Logic**
- Address validation (required fields, format validation)
- Primary address management (ensure only one primary)
- Address deletion rules (prevent deletion if used in recent orders)
- Maximum address limit per user (10 addresses)
- Email change re-verification workflow

## API Endpoints Specification

```
GET /api/v1/auth/user/
    Headers: {Authorization: Bearer <token>}
    Response: {success, data: {user_profile}}

PUT /api/v1/auth/user/
    Headers: {Authorization: Bearer <token>}
    Request: {first_name, last_name, email, phone, company_name}
    Response: {success, message, data: {user_profile}}

POST /api/v1/auth/change-password/
    Headers: {Authorization: Bearer <token>}
    Request: {current_password, new_password}
    Response: {success, message}

GET /api/v1/auth/addresses/
    Headers: {Authorization: Bearer <token>}
    Response: {success, data: {addresses: []}}

POST /api/v1/auth/addresses/
    Headers: {Authorization: Bearer <token>}
    Request: {address_data}
    Response: {success, message, data: {address}}

PUT /api/v1/auth/addresses/{id}/
    Headers: {Authorization: Bearer <token>}
    Request: {address_data}
    Response: {success, message, data: {address}}

DELETE /api/v1/auth/addresses/{id}/
    Headers: {Authorization: Bearer <token>}
    Response: {success, message}

PATCH /api/v1/auth/addresses/{id}/set-primary/
    Headers: {Authorization: Bearer <token>}
    Response: {success, message, data: {address}}

GET /api/v1/auth/orders/
    Headers: {Authorization: Bearer <token>}
    Query: {page, limit, status}
    Response: {success, data: {orders: [], pagination}}
```

## Business Rules Implementation

### **Profile Management Rules**
- Email changes require re-verification (account remains active)
- Company name changes affect business customer status
- Profile updates are logged for audit purposes
- Phone number validation (optional but format-checked)

### **Address Management Rules**
- Users can have maximum 10 addresses
- Only one address can be marked as primary
- Primary address automatically set for first address
- Address deletion prevented if used in recent orders (last 30 days)
- Address ownership verification for all operations

### **Security Rules**
- Password changes require current password confirmation
- All operations require valid JWT token
- User can only access/modify their own data
- Sensitive operations logged for security audit

## Data Validation

### **Profile Validation**
- Email format validation and uniqueness check
- Phone number format validation (international formats)
- Name fields: minimum 1 character, maximum 100 characters
- Company name: maximum 100 characters

### **Address Validation**
- Required fields: first_name, last_name, address_line_1, city, state, postal_code, country
- Label uniqueness per user
- Postal code format validation by country
- Phone number format validation

## Error Handling
- Proper HTTP status codes (400, 401, 403, 404, 409)
- Consistent error message format
- Validation error details
- Database constraint error handling
- Authorization error handling

## Performance Considerations
- Efficient database queries with proper indexing
- Pagination for address and order lists
- Optimized profile update operations
- Database query optimization for address management

## Testing Requirements
- Unit tests for all API endpoints
- Business rule validation tests
- Address management workflow tests
- Security and authorization tests
- Profile update audit logging tests

## Definition of Done
- [ ] All acceptance criteria met
- [ ] User profile API endpoints implemented and tested
- [ ] Address management CRUD operations functional
- [ ] Password change functionality complete
- [ ] Order history integration working
- [ ] All business rules implemented and enforced
- [ ] Database models created with proper migrations
- [ ] API authentication and authorization working
- [ ] Input validation and error handling complete
- [ ] Unit tests written and passing
- [ ] No linting errors (ruff)
- [ ] API documentation updated

## Notes
- Foundation for frontend dashboard implementation
- Builds on core authentication from TASK-007A-BE
- Clean API design for easy frontend integration
- Focus on security and data integrity