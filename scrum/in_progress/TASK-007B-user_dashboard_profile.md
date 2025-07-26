# Task TASK-007B: User Dashboard & Profile Management

## State: Backlog
## Story Points: 4
## Priority: Medium
## Stack: Backend + Frontend

## Dependencies
- **TASK-007A**: Core Authentication (requires login/JWT system)

**As a** authenticated customer  
**I want** to access my user dashboard  
**So that** I can view my account information and manage my profile

**As a** customer  
**I want** to edit my profile information  
**So that** I can keep my account details up to date

**As a** customer  
**I want** to manage my saved addresses  
**So that** I can have faster checkouts for future orders

## Acceptance Criteria  

### **User Dashboard Layout**
- [ ] Dashboard page with navigation and user overview
- [ ] User welcome message with name display
- [ ] Dashboard navigation menu (Profile, Addresses, Orders, Settings)
- [ ] Business customer indicator (if company name exists)
- [ ] Account status display (verified email, etc.)

### **Profile Management**
- [ ] View current profile information
- [ ] Edit profile form with all user fields
- [ ] Update first name, last name, email, phone, company name
- [ ] Profile update validation and error handling
- [ ] Success feedback for profile updates

### **Address Management**
- [ ] View list of saved addresses
- [ ] Add new address form with full address fields
- [ ] Edit existing addresses
- [ ] Delete addresses with confirmation
- [ ] Set primary/default address
- [ ] Address validation (required fields, format)

### **Account Settings**
- [ ] Change password functionality
- [ ] Email notification preferences
- [ ] Account deletion option (with confirmation)
- [ ] Privacy settings management

### **Order History Integration**
- [ ] Order history section in dashboard
- [ ] Link to individual order details
- [ ] Order status display
- [ ] Reorder functionality for previous orders

## Technical Requirements

### **Backend Implementation**
- User profile API endpoints (GET, PUT)
- Address management API endpoints (CRUD)
- Password change API endpoint
- Account settings API endpoints
- Profile validation and error handling
- Address model and database schema

### **Frontend Implementation**
- Protected dashboard routes
- Profile editing forms with validation
- Address management interface (CRUD)
- Password change form
- Success/error state management
- Mobile-responsive dashboard design

### **API Endpoints**
```
GET /api/v1/auth/user/ - Get current user profile
PUT /api/v1/auth/user/ - Update user profile
POST /api/v1/auth/change-password/ - Change password
GET /api/v1/auth/addresses/ - Get user addresses
POST /api/v1/auth/addresses/ - Add new address
PUT /api/v1/auth/addresses/{id}/ - Update address
DELETE /api/v1/auth/addresses/{id}/ - Delete address
PATCH /api/v1/auth/addresses/{id}/set-primary/ - Set primary address
```

## UI/UX Design Specifications

### **Dashboard Layout**
- Clean, minimal design consistent with Zara-inspired catalog
- All text in CAPITAL LETTERS following brand guidelines
- Sidebar navigation for desktop, hamburger menu for mobile
- Professional presentation suitable for business customers

### **Form Design**
- Single-column layout for mobile
- Two-column layout for desktop forms
- Clear field labels and validation messages
- Consistent styling with registration/login forms
- Auto-save indicators for profile updates

### **Address Management**
- Address cards with edit/delete actions
- Primary address clearly indicated
- Add new address prominent button
- Address form with smart field organization
- Confirmation dialogs for destructive actions

## Business Rules

### **Profile Management Rules**
- Email changes require re-verification
- Company name determines business customer status
- Phone number optional but recommended
- Profile updates logged for audit trail

### **Address Management Rules**
- Users can have multiple addresses
- One address must be marked as primary
- Address deletion prevented if it's the only address
- Address used in recent orders cannot be deleted
- Maximum 10 addresses per user

### **Security Rules**
- Password changes require current password confirmation
- Profile updates require authenticated session
- Sensitive operations logged for security
- Account deletion requires email confirmation

## Data Models

### **Address Model**
```python
class Address:
    user = ForeignKey(User)
    label = CharField(max_length=50)  # "Home", "Office", etc.
    first_name = CharField(max_length=100)
    last_name = CharField(max_length=100)
    company = CharField(max_length=100, blank=True)
    address_line_1 = CharField(max_length=255)
    address_line_2 = CharField(max_length=255, blank=True)
    city = CharField(max_length=100)
    state = CharField(max_length=100)
    postal_code = CharField(max_length=20)
    country = CharField(max_length=100)
    phone = CharField(max_length=20, blank=True)
    is_primary = BooleanField(default=False)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

## Performance Requirements
- Dashboard loads within 2 seconds
- Profile updates complete within 1 second
- Address operations complete within 1 second
- Mobile-optimized for slow connections
- Efficient API calls with minimal data transfer

## Definition of Done
- [ ] All acceptance criteria met
- [ ] User dashboard implemented with full navigation
- [ ] Profile management working with all user fields
- [ ] Address management (CRUD) fully functional
- [ ] Password change functionality tested
- [ ] Order history integration complete
- [ ] Account settings operational
- [ ] Mobile-responsive design matching brand guidelines
- [ ] All forms include proper validation
- [ ] Success/error feedback implemented
- [ ] API integration complete and error-handled
- [ ] Security requirements implemented
- [ ] No linting errors (backend: ruff, frontend: ESLint)
- [ ] Cross-browser compatibility verified
- [ ] Performance requirements met

## Notes
- Builds on core authentication from TASK-007A
- Foundation for order history and customer features
- Professional interface suitable for business customers
- Extensible design for future dashboard features