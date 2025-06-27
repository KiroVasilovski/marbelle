# Task TASK-007C-BE: Guest Checkout Integration - Backend

## State: Backlog
## Story Points: 2
## Priority: High
## Stack: Backend

## Parent Task
- **TASK-007C**: Guest Checkout Integration (parent task - will be completed when both BE and FE subtasks are done)

## Dependencies
- **TASK-007A-BE**: Core Authentication Backend (requires user registration/login system)
- **TASK-008-BE**: Shopping Cart Backend (requires cart functionality)

**As a** frontend developer  
**I want** guest checkout and cart management API endpoints  
**So that** I can implement guest checkout flow and cart persistence

**As a** system  
**I want** secure guest session management  
**So that** guest customers can shop and convert to registered users safely

## Acceptance Criteria  

### **Guest Cart Management API**
- [ ] POST /api/v1/cart/guest/ endpoint to create/update guest cart
- [ ] GET /api/v1/cart/guest/{session_id}/ endpoint to retrieve guest cart
- [ ] Guest session ID generation and management
- [ ] Cart item validation against product availability
- [ ] Guest cart cleanup mechanism

### **Cart Merge API**
- [ ] POST /api/v1/cart/merge/ endpoint to merge guest cart with user cart
- [ ] Duplicate product handling during merge
- [ ] Quantity combination logic with stock limit validation
- [ ] Cart merge operation logging

### **Guest Order Management API**
- [ ] POST /api/v1/orders/guest/ endpoint to create guest orders
- [ ] Guest order validation and processing
- [ ] Guest customer information storage
- [ ] Guest order confirmation and email notifications

### **Guest Order Lookup API**
- [ ] GET /api/v1/orders/guest-lookup/ endpoint for order tracking
- [ ] Secure guest order lookup (email + order number required)
- [ ] Rate limiting for lookup attempts
- [ ] Guest order status tracking

### **Guest-to-User Conversion API**
- [ ] POST /api/v1/auth/convert-guest/ endpoint for account creation
- [ ] Guest order linking to new user account
- [ ] Pre-filled registration data from guest order
- [ ] Email verification for converted accounts

## Technical Requirements

### **Guest Session Management**
- Secure guest session ID generation (UUID4)
- Guest session storage and cleanup
- Session expiration handling (30 days)
- Guest data isolation and security

### **Database Models**
```python
class GuestSession(models.Model):
    session_id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
class GuestCart(models.Model):
    session = models.OneToOneField(GuestSession, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class GuestCartItem(models.Model):
    cart = models.ForeignKey(GuestCart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    added_at = models.DateTimeField(auto_now_add=True)

class GuestOrder(models.Model):
    order_number = models.CharField(max_length=50, unique=True)
    email = models.EmailField()
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    # ... other order fields
    session = models.ForeignKey(GuestSession, on_delete=models.SET_NULL, null=True)
    converted_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
```

### **Cart Merge Logic**
- Identify duplicate products between guest and user carts
- Combine quantities respecting stock limits
- Preserve most recent cart modifications
- Handle product availability changes
- Log merge operations for audit

### **Guest Order Processing**
- Generate unique order numbers for guest orders
- Store complete guest customer information
- Process payment using same system as user orders
- Send order confirmation emails
- Create order tracking capabilities

## API Endpoints Specification

```
POST /api/v1/cart/guest/
    Request: {session_id?, items: [{product_id, quantity}]}
    Response: {success, data: {session_id, cart}}

GET /api/v1/cart/guest/{session_id}/
    Response: {success, data: {cart, items: []}}

POST /api/v1/cart/merge/
    Headers: {Authorization: Bearer <token>}
    Request: {guest_session_id}
    Response: {success, data: {merged_cart, merge_report}}

POST /api/v1/orders/guest/
    Request: {session_id, customer_info, shipping_address, payment_info}
    Response: {success, data: {order, confirmation_details}}

GET /api/v1/orders/guest-lookup/
    Request: {email, order_number}
    Response: {success, data: {order, tracking_info}}

POST /api/v1/auth/convert-guest/
    Request: {email, password, guest_order_id?, guest_session_id?}
    Response: {success, data: {user, token, linked_orders}}
```

## Business Rules Implementation

### **Guest Cart Management**
- Guest carts expire after 30 days of inactivity
- Cart items validated against current product availability
- Maximum cart size limits apply to guest carts
- Guest session IDs are cryptographically secure

### **Cart Merge Rules**
- Guest cart takes precedence for newer modifications
- Duplicate products: combine quantities up to stock limits
- Out-of-stock items removed with notification
- Merge operation creates audit log entry

### **Guest Order Conversion**
- Guest orders can be claimed during account creation
- Email must match between guest order and new account
- All guest orders linked to new user account
- Guest order tracking remains accessible

### **Security Rules**
- Guest order lookup requires email + order number
- Rate limiting: 5 lookup attempts per minute per IP
- Guest session data properly isolated
- No sensitive information in guest sessions

## Security Considerations
- Secure guest session ID generation (UUID4)
- Guest order lookup protection against enumeration
- Rate limiting for all guest endpoints
- Guest data cleanup and privacy compliance
- Input validation and sanitization

### **Rate Limiting**
- Guest cart operations: 20 requests per minute
- Guest order lookup: 5 requests per minute
- Guest order creation: 3 requests per minute
- Cart merge operations: 10 requests per minute

## Performance Requirements
- Guest cart operations complete within 500ms
- Cart merge completes within 2 seconds
- Guest order creation within 3 seconds
- Guest order lookup within 1 second
- Efficient database queries with proper indexing

## Error Handling
- Proper HTTP status codes for all scenarios
- Consistent error message format
- Guest session expiration handling
- Product availability error handling
- Payment processing error handling

## Data Cleanup & Maintenance
- Automated cleanup of expired guest sessions
- Guest cart cleanup after successful order creation
- Orphaned guest data cleanup processes
- Guest session statistics and monitoring

## Testing Requirements
- Unit tests for all guest cart operations
- Cart merge logic testing with various scenarios
- Guest order creation and lookup testing
- Security testing for guest endpoints
- Performance testing for cart operations

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Guest cart management API implemented
- [ ] Cart merge functionality working
- [ ] Guest order creation and lookup functional
- [ ] Guest-to-user conversion API complete
- [ ] Database models created with proper migrations
- [ ] Security requirements implemented
- [ ] Rate limiting configured and tested
- [ ] Error handling implemented
- [ ] Performance requirements met
- [ ] Data cleanup processes implemented
- [ ] Unit tests written and passing
- [ ] No linting errors (ruff)
- [ ] API documentation updated

## Notes
- Critical for reducing checkout friction
- Foundation for guest-to-user conversion
- Secure guest data handling essential
- Performance optimization for cart operations