# Task TASK-004A: User Management Models

## State: Backlog
## Story Points: 3  
## Priority: High

## Dependencies
- None (foundational task)

**As a** Store Administrator  
**I want** to manage both business and individual customer accounts
**So that** I can control access to the system and track customer details for orders and communication.

**As a** Business Customer (architect, designer, contractor)  
**I want** to have an account with my business information  
**So that** I can place bulk orders for construction projects and receive professional communications.

**As an** Individual Customer  
**I want** to have a personal account  
**So that** I can purchase decorative marble products, tables, vases and other items for personal use.

## Acceptance Criteria  
- [ ] Custom User model extending AbstractUser with business fields
- [ ] Core authentication fields (username/email, password, first_name, last_name)
- [ ] Customer type fields (company_name, phone)
- [ ] User model configured as AUTH_USER_MODEL in settings
- [ ] Admin interface configured for user management
- [ ] Database migrations created and applied
- [ ] Models include proper __str__ methods
- [ ] Basic field validation implemented

## Technical Requirements
- Extend Django's AbstractUser (not built-in User model)
- Configure AUTH_USER_MODEL in Django settings
- Add proper field validation (email format, phone format)
- Follow Django authentication best practices
- Include created_at/updated_at through AbstractUser's date_joined and last_login

## User Model Field Definitions
**CustomUser (extends AbstractUser):**
- username (inherited, required)
- email (inherited, required, unique)
- first_name (inherited)
- last_name (inherited)
- company_name (CharField, optional, max_length=100)
- phone (CharField, optional, max_length=20)
- date_joined (inherited - acts as created_at)
- last_login (inherited - acts as updated_at)

## Business Rules
- Email must be unique and valid format
- Support both business customers (architects, designers, contractors) and individual customers
- Phone number is optional but recommended for order communication
- Username can be email address or separate identifier
- Business customer determined by presence of company_name (if filled = business customer)
- company_name is optional (only filled by business customers)

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Custom User model created and configured in settings
- [ ] User creation/editing tested via admin interface
- [ ] Admin interface functional with proper field display
- [ ] Database migrations applied successfully
- [ ] No linting errors (ruff)
- [ ] Model documented with docstrings
- [ ] Field validations working (email uniqueness, format validation)

## Notes
- This creates the foundation for user authentication across the app
- Address fields will be added later when shipping functionality is implemented
- Keep business-focused but minimal initially
- Future iterations may add user roles, permissions, or additional profile information