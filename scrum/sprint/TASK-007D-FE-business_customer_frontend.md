# Task TASK-007D-FE: Business Customer Features - Frontend

## State: Backlog
## Story Points: 1.5
## Priority: Low
## Stack: Frontend

## Parent Task
- **TASK-007D**: Business Customer Features (parent task - will be completed when both BE and FE subtasks are done)

## Dependencies
- **TASK-007A-FE**: Core Authentication Frontend (requires user registration/login)
- **TASK-007B-FE**: User Dashboard Frontend (requires dashboard components)
- **TASK-007D-BE**: Business Customer Backend (requires business APIs)

**As a** business customer  
**I want** to manage my company information  
**So that** I can receive proper business communications and invoicing

**As a** business customer  
**I want** to see professional features in my dashboard  
**So that** I can manage my business orders and account efficiently

## Acceptance Criteria  

### **Business Customer Identification UI**
- [ ] Automatic business customer badge/indicator in dashboard
- [ ] Business status display in user profile section
- [ ] Professional business customer welcome messaging
- [ ] Business-focused navigation and terminology

### **Company Information Management Interface**
- [ ] Company information section in user dashboard
- [ ] Business details form (industry, company size, VAT number, business type)
- [ ] Company contact information management
- [ ] Business profile validation with real-time feedback
- [ ] Success feedback for company information updates

### **Business-Focused Dashboard Design**
- [ ] Professional, corporate-appropriate interface design
- [ ] Enhanced business terminology throughout platform
- [ ] Business account overview with company details prominence
- [ ] Professional color scheme and typography choices

### **Company Information Display**
- [ ] Company details prominently displayed in profile
- [ ] Business contact preferences interface
- [ ] VAT number formatting and validation
- [ ] Industry selection with professional dropdown
- [ ] Company size indicator with employee count ranges

### **Professional Communication Indicators**
- [ ] Business email preferences management
- [ ] Professional communication tone indicators
- [ ] Company branding integration opportunities
- [ ] Business invoice formatting preferences

## Technical Requirements

### **Component Structure**
```
src/components/business/
├── BusinessCustomerBadge.tsx
├── CompanyInformationSection.tsx
├── CompanyDetailsForm.tsx
├── BusinessProfileEditor.tsx
├── IndustrySelector.tsx
└── BusinessPreferences.tsx

src/hooks/
├── useBusinessProfile.ts
├── useCompanyInformation.ts
└── useBusinessIdentification.ts
```

### **Business Profile Management**
```typescript
interface BusinessProfile {
    industry: string;
    companySize: string;
    vatNumber: string;
    businessType: string;
    website: string;
    businessPhone: string;
    isVerified: boolean;
}

const businessService = {
    getBusinessProfile: () => Promise<BusinessProfile>,
    updateBusinessProfile: (data: BusinessProfile) => Promise<BusinessProfile>,
    getBusinessAnalytics: () => Promise<BusinessAnalytics>
}
```

### **State Management**
- Business customer identification state
- Company information management state
- Business profile edit state with validation
- Professional UI theme state for business customers

### **Form Management**
- Company information form with comprehensive validation
- Industry and business type selection
- VAT number formatting and validation
- Business contact information management

## UI/UX Design Specifications

### **Business Customer Identification**
- Subtle business customer badge in dashboard header
- Professional "BUSINESS ACCOUNT" indicator
- Corporate-appropriate color scheme and styling
- Enhanced professional typography

### **Company Information Interface**
- Professional form design for business details
- Clear field labels for business information
- Industry selection with searchable dropdown
- Company size selection with employee ranges
- VAT number formatting with country-specific validation

### **Dashboard Enhancements**
- Business-focused language and terminology
- Professional welcome message with company name
- Corporate account overview section
- Enhanced business order management interface

### **Professional Design Elements**
- Clean, efficient design suitable for business use
- Professional color palette (blues, grays, whites)
- Corporate-appropriate icons and imagery
- Enhanced typography for business communications

## Component Specifications

### **BusinessCustomerBadge Component**
```typescript
interface BusinessCustomerBadgeProps {
    companyName: string;
    isVerified?: boolean;
    size?: 'small' | 'medium' | 'large';
}
```

### **CompanyDetailsForm Component**
```typescript
interface CompanyDetailsFormProps {
    initialData?: BusinessProfile;
    onSubmit: (data: BusinessProfile) => Promise<void>;
    isLoading: boolean;
    onCancel?: () => void;
}
```

### **IndustrySelector Component**
```typescript
interface IndustrySelectorProps {
    value: string;
    onChange: (industry: string) => void;
    placeholder?: string;
    required?: boolean;
}
```

## Business Profile Form Fields

### **Core Business Information**
- Industry selection (architecture, construction, design, retail, etc.)
- Company size dropdown (1-10, 11-50, 51-200, 201-1000, 1000+ employees)
- Business type (contractor, architect, designer, retailer, developer, other)
- VAT number with country-specific formatting
- Business website URL validation
- Business phone number with international format

### **Form Validation**
- Industry selection required for business customers
- VAT number format validation by region
- Website URL format validation
- Business phone number format validation
- Company size selection from predefined options

## Professional UI Enhancements

### **Dashboard Modifications**
- Business account overview section
- Company name prominently displayed
- Professional welcome messaging
- Enhanced navigation for business features

### **Typography & Styling**
- Professional font choices for business interface
- Corporate color scheme implementation
- Clean, efficient layout design
- Professional icons and visual elements

### **Business Communication Indicators**
- Email preference indicators for business communications
- Professional template selection interface
- Business invoice format preferences
- Company branding integration options

## Error Handling & Validation

### **Form Validation**
- Real-time validation for all business profile fields
- VAT number validation with country-specific rules
- Industry and business type validation
- Website URL format validation
- Professional error messaging

### **API Integration**
- Graceful handling of business profile API errors
- Network error handling with retry options
- Success feedback for business profile updates
- Loading states for business operations

## Responsive Design
- Mobile-optimized business profile forms
- Professional tablet interface for business customers
- Desktop-first approach for business features
- Touch-friendly business profile management

## Performance Considerations
- Optimized business profile form components
- Efficient state management for business features
- Minimal bundle size impact for business enhancements
- Fast business profile updates

## Accessibility
- ARIA labels for business profile elements
- Keyboard navigation for business forms
- Screen reader compatibility for business features
- Professional focus management

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Business customer identification working automatically
- [ ] Company information management interface functional
- [ ] Professional dashboard enhancements complete
- [ ] Business profile form with comprehensive validation
- [ ] Professional UI design matching business requirements
- [ ] Mobile-responsive business features
- [ ] API integration complete with error handling
- [ ] Success and loading states implemented
- [ ] Cross-browser compatibility verified
- [ ] Accessibility requirements met
- [ ] No linting errors (ESLint)
- [ ] Professional design review completed

## Future Enhancement Points
- Company branding integration (logos, colors)
- Advanced business analytics dashboard
- Team/multi-user account management interface
- Business pricing tier indicators
- Workflow approval interfaces
- ERP system integration UI

## Notes
- Enhances professional customer experience without complexity
- Foundation for advanced business features
- Professional presentation suitable for B2B relationships
- Maintains clean design while adding business context