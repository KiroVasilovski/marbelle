# Task TASK-006: Product Catalog UI

## State: Sprint
## Story Points: 8
## Priority: High
## Stack: Frontend

## Dependencies
- **TASK-005**: Product Catalog API (requires API endpoints for product data)

**As a** customer (architect, designer, contractor, homeowner)  
**I want** to browse products in a modern, visually appealing catalog inspired by Zara.com  
**So that** I can discover natural stone products through an immersive, magazine-like experience

## Acceptance Criteria  

### **Grid Layout & Visual Design**
- [ ] Zara.com-inspired minimal grid layout
- [ ] 4 products per row on desktop (≥769px), 2 products per row on mobile
- [ ] Extra large, high-quality product images as main focus
- [ ] Minimal, elegant typography (product name, price, subtle details)
- [ ] Clean white/neutral background with generous spacing

### **Floating Navigation Panel**
- [ ] Transparent/floating navigation panel at top
- [ ] Auto-hide on scroll down, reveal on scroll up (smooth animation)
- [ ] Minimalistic text-only filters in navigation row
- [ ] Burger menu for categories (Slabs, Tiles, Mosaics, etc.)
- [ ] Search functionality integrated in navigation

### **Advanced Scrolling Experience**
- [ ] Snap-to-row scrolling (user cannot stop between rows)
- [ ] Smooth row-by-row navigation with animation
- [ ] Infinite scroll loading (no pagination numbers)
- [ ] Buffer loading for seamless experience

### **Visual Breaks & Storytelling**
- [ ] Every 3-4 product rows, insert full-width hero image/video row
- [ ] 1vh height hero sections with stunning marble/stone visuals
- [ ] These breaks add visual rhythm and brand storytelling
- [ ] Smooth transitions between product rows and hero sections

### **Product Cards & Interaction**
- [ ] No hover effects
- [ ] Click to product detail page (no breadcrumbs)
- [ ] Price display with unit of measure (per sqm, per piece)
- [ ] Stock status indicator (In Stock/Out of Stock)
- [ ] SKU display for B2B customers

### **Mobile-First Responsive Design**
- [ ] Touch-optimized interactions
- [ ] Swipe gestures for category navigation
- [ ] Mobile burger menu implementation
- [ ] Optimized image loading for mobile networks

## UI/UX Design Specifications

### **Typography & Visual Hierarchy**
- Minimal, modern font stack (Inter, SF Pro, or similar).
- Use only capital letters in the whole application
- Product names: Clean, readable sans-serif
- Prices: Prominent but not overwhelming
- Filter text: Small, lightweight, professional

### **Color Palette**
- Primary: Neutral whites, light grays
- Accent: Natural stone inspired (warm beiges, cool grays)
- Text: High contrast for accessibility
- Interactive elements: Subtle hover states

### **Animation & Micro-interactions**
- Smooth scroll snap between rows
- Fade-in animations for loading products
- Hover effects on product cards
- Navigation panel slide animations
- Loading skeleton animations

### **Image Strategy**
- Hero images: Ultra high-resolution lifestyle shots
- Product images: Consistent aspect ratio, professional lighting
- Lazy loading with blur-to-sharp transitions
- Optimized formats (WebP with fallbacks)

## Technical Requirements

### **Frontend Architecture**
- React 18+ with TypeScript
- Tailwind CSS for styling with custom animations
- Framer Motion for smooth animations and scroll snap
- React Query for API state management and caching
- React Intersection Observer for infinite scroll

### **Performance Optimizations**
- Image lazy loading with progressive enhancement
- Virtual scrolling for large product lists
- Optimized bundle size with code splitting
- Preload critical above-the-fold content

### **Responsive Implementation**
```css
/* Grid breakpoints */
- Mobile: 2 columns (< 769px)
- Desktop: 4 columns (≥ 769px)
- Ultra-wide: 4 columns (≥ 1440px) The whole application will simply adapt on the new screen (get bigger and persist the whole ratio)
```

### **Component Structure**
```
ProductCatalog/
├── ProductGrid/
│   ├── ProductCard
│   ├── HeroSection
│   └── LoadingSkeletons
├── Navigation/
│   ├── FloatingNav
│   ├── CategoryBurger
│   └── FilterRow
└── InfiniteScroll/
    ├── ScrollSnapContainer
    └── BufferLoader
```

## API Integration Specifications
- Integrate with TASK-005 API endpoints
- Implement filtering: `?category=1&min_price=100&max_price=500&in_stock=true`
- Search functionality: `?search=marble`
- Infinite scroll pagination with API buffer loading
- Error handling for API failures with graceful fallbacks

## Business Features
- Category filtering via burger menu
- Price range filtering in navigation
- Stock availability filtering
- Search across product name, description, SKU
- Professional presentation for B2B customers

## Accessibility & SEO
- WCAG 2.1 AA compliance
- Semantic HTML structure
- Alt text for all images
- Keyboard navigation support
- SEO-friendly URLs and meta tags
- Focus management for interactive elements

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Zara.com-inspired visual design implemented
- [ ] Snap-to-row scrolling working smoothly
- [ ] Floating navigation with auto-hide/show
- [ ] Hero sections integrated every 3-4 rows
- [ ] 4/2 column responsive grid implemented
- [ ] Infinite scroll with buffer loading
- [ ] API integration complete and error-handled
- [ ] Mobile-first responsive design tested
- [ ] Performance optimized (Lighthouse score > 90)
- [ ] Accessibility tested and compliant
- [ ] No ESLint/TypeScript errors
- [ ] Cross-browser compatibility verified
- [ ] Loading states and animations polished

## Notes
- Inspiration: Zara.com's minimal, image-focused approach
- Focus on visual storytelling through hero sections
- Premium feel suitable for architecture/design industry
- Foundation for future cart and checkout integration
- Smooth, magazine-like browsing experience