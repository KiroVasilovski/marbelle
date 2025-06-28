# Task TASK-007D-BE: Business Customer Features - Backend

## State: Backlog
## Story Points: 1.5
## Priority: Low
## Stack: Backend

## Parent Task
- **TASK-007D**: Business Customer Features (parent task - will be completed when both BE and FE subtasks are done)

## Dependencies
- **TASK-007A-BE**: Core Authentication Backend (requires user registration/login)
- **TASK-007B-BE**: User Dashboard Backend (requires profile management)
- **TASK-011-BE**: Order Placement Backend (requires order system)

**As a** frontend developer  
**I want** business customer management API endpoints  
**So that** I can implement business-focused features and communications

**As a** system  
**I want** business customer identification and analytics  
**So that** I can provide appropriate business communications and features

## Acceptance Criteria  

### **Business Customer Identification**
- [ ] Automatic business customer detection based on company_name field
- [ ] `is_business_customer` property/method on User model
- [ ] Business customer filtering and analytics endpoints
- [ ] Business status tracking and reporting

### **Business Profile Management API**
- [ ] GET /api/v1/auth/business-profile/ endpoint for business details
- [ ] PUT /api/v1/auth/business-profile/ endpoint to update company info
- [ ] Business profile validation and formatting
- [ ] Company information extension beyond basic company_name

### **Business-Focused Email System**
- [ ] Business customer email template system
- [ ] Professional email template selection based on user type
- [ ] Company information integration in email templates
- [ ] Business-appropriate language and tone in communications

### **Business Order & Invoice Features**
- [ ] Company information inclusion in order processing
- [ ] Enhanced invoice generation for business customers
- [ ] VAT number handling in invoices (if provided)
- [ ] Professional invoice formatting with company details

### **Business Analytics API**
- [ ] GET /api/v1/business/analytics/ endpoint for business metrics
- [ ] Business customer statistics and reporting
- [ ] Company verification status tracking (future-ready)
- [ ] Business customer segmentation data

## Technical Requirements

### **Database Models**
```python
class BusinessProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='business_profile')
    industry = models.CharField(max_length=100, blank=True)
    company_size = models.CharField(max_length=50, blank=True, choices=COMPANY_SIZE_CHOICES)
    vat_number = models.CharField(max_length=50, blank=True)
    business_type = models.CharField(max_length=100, blank=True, choices=BUSINESS_TYPE_CHOICES)
    website = models.URLField(blank=True)
    business_phone = models.CharField(max_length=20, blank=True)
    is_verified = models.BooleanField(default=False)  # Future verification system
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'business_profiles'
```

### **User Model Extensions**
```python
# Add property/method to User model
@property
def is_business_customer(self):
    return bool(self.company_name and self.company_name.strip())

def get_business_profile(self):
    if hasattr(self, 'business_profile'):
        return self.business_profile
    return None
```

### **Email Template System**
- Business vs individual customer template selection
- Dynamic company information insertion
- Professional branding and formatting
- Template inheritance for consistent styling

### **Business Logic Services**
```python
class BusinessCustomerService:
    @staticmethod
    def identify_business_customers(queryset=None):
        # Return queryset of business customers
        
    @staticmethod
    def get_business_analytics():
        # Return business customer metrics
        
    @staticmethod
    def generate_business_invoice(order):
        # Generate professional invoice with company details
```

## API Endpoints Specification

```
GET /api/v1/auth/business-profile/
    Headers: {Authorization: Bearer <token>}
    Response: {success, data: {business_profile}}

PUT /api/v1/auth/business-profile/
    Headers: {Authorization: Bearer <token>}
    Request: {industry, company_size, vat_number, business_type, website, business_phone}
    Response: {success, message, data: {business_profile}}

GET /api/v1/business/analytics/
    Headers: {Authorization: Bearer <admin_token>}
    Response: {
        success, 
        data: {
            total_business_customers: number,
            business_orders_count: number,
            average_order_value: number,
            industry_breakdown: {},
            company_size_distribution: {}
        }
    }

POST /api/v1/business/verify-company/
    Headers: {Authorization: Bearer <token>}
    Request: {verification_documents}
    Response: {success, message, data: {verification_status}}
```

## Business Rules Implementation

### **Business Customer Identification**
- Users with non-empty company_name are business customers
- Business status affects all communications and features
- Business identification persists across platform
- Automatic business profile creation on first business detection

### **Company Information Management**
- Company name is primary business identifier
- VAT number optional but recommended for invoicing
- Industry and company size for analytics and future features
- Business contact preferences override individual preferences

### **Professional Communication Rules**
- Business customers receive professional email templates
- Company information included in all business communications
- Order confirmations include company letterhead-style formatting
- Professional language throughout platform interactions

### **Invoice and Order Enhancement**
- Company information prominently displayed on orders
- VAT number inclusion in invoices when provided
- Professional invoice formatting for business customers
- Business payment terms display (future-ready)

## Data Models & Choices

### **Company Size Choices**
```python
COMPANY_SIZE_CHOICES = [
    ('1-10', '1-10 employees'),
    ('11-50', '11-50 employees'),
    ('51-200', '51-200 employees'),
    ('201-1000', '201-1000 employees'),
    ('1000+', '1000+ employees'),
]
```

### **Business Type Choices**
```python
BUSINESS_TYPE_CHOICES = [
    ('contractor', 'General Contractor'),
    ('architect', 'Architecture Firm'),
    ('designer', 'Interior Designer'),
    ('retailer', 'Retailer/Distributor'),
    ('developer', 'Property Developer'),
    ('other', 'Other'),
]
```

## Email Template Implementation

### **Template Selection Logic**
```python
def get_email_template(template_name, user):
    if user.is_business_customer:
        return f"business/{template_name}.html"
    return f"individual/{template_name}.html"
```

### **Template Context Enhancement**
```python
def get_email_context(user, **kwargs):
    context = kwargs
    if user.is_business_customer:
        context.update({
            'company_name': user.company_name,
            'business_profile': user.get_business_profile(),
            'is_business': True,
        })
    return context
```

## Performance Considerations
- Efficient business customer identification queries
- Optimized analytics calculations with caching
- Business profile data caching for frequent access
- Efficient email template rendering

## Security & Validation
- Business profile data validation
- VAT number format validation by region
- Company information sanitization
- Business verification document security (future)

## Analytics & Reporting
- Business customer metrics and KPIs
- Industry and company size analytics
- Business order patterns and trends
- Revenue attribution to business customers

## Testing Requirements
- Unit tests for business customer identification
- Business profile CRUD operation tests
- Email template selection testing
- Business analytics calculation tests
- Invoice generation testing for business customers

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Business customer identification working automatically
- [ ] Business profile management API implemented
- [ ] Professional email templates for business customers
- [ ] Business analytics endpoints functional
- [ ] Company information in orders and invoices
- [ ] Database models created with proper migrations
- [ ] Business logic services implemented
- [ ] Email template system enhanced
- [ ] Unit tests written and passing
- [ ] No linting errors (ruff)
- [ ] API documentation updated

## Future Integration Points
- Business pricing tiers and volume discounts
- Workflow approvals and purchase orders
- Advanced business analytics dashboard
- ERP system integration capabilities
- Team/multi-user account management
- Company verification system

## Notes
- Enhances professional customer experience
- Foundation for advanced business features
- Maintains simple user model while adding business context
- Clean separation between individual and business features