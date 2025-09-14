# Technology Stack

## Core Framework & Runtime

### Next.js 15 with App Router
- **Why Chosen**: Latest features including React Server Components, improved performance, and better developer experience
- **Key Features Used**:
  - App Router for file-based routing
  - Server Components for performance optimization
  - Server Actions for type-safe server operations
  - Streaming and Suspense for progressive loading
  - Built-in SEO optimizations

### React 19
- **Why Chosen**: Cutting-edge React features and improved performance
- **Key Features Used**:
  - Server Components for reduced client-side JavaScript
  - Concurrent features for better user experience
  - Improved hydration and error boundaries
  - Enhanced TypeScript integration

### TypeScript
- **Why Chosen**: Type safety, better developer experience, and reduced runtime errors
- **Configuration**: Strict mode enabled with comprehensive type checking
- **Integration**: Full stack type safety from database to UI components

### Node.js 20.x
- **Why Chosen**: Latest LTS version with improved performance and security
- **Features Used**: ES modules, improved error handling, and better async performance

## Styling & UI Framework

### Tailwind CSS
- **Why Chosen**: Utility-first approach, excellent performance, and design consistency
- **Configuration**: Custom design system with CSS variables for theming
- **Features Used**:
  - Custom color palette and typography scale
  - Dark mode support with CSS variables
  - Responsive design utilities
  - Component variants and compound variants

### Radix UI Primitives
- **Why Chosen**: Unstyled, accessible components that work well with Tailwind
- **Components Used**: Dialog, Dropdown Menu, Select, Tabs, and more
- **Benefits**: Built-in accessibility, keyboard navigation, and focus management

### shadcn/ui Component Library
- **Why Chosen**: High-quality components built on Radix UI with Tailwind styling
- **Configuration**: Customized in `components.json` with project-specific settings
- **Components Used**: Button, Input, Card, Sheet, and many others
- **Customization**: Extended with project-specific variants and styles

### CSS Architecture
```css
/* CSS Variables for theming */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... more variables */
}

[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode overrides */
}
```

## Database & ORM

### PostgreSQL
- **Why Chosen**: Robust relational database with excellent performance and features
- **Features Used**:
  - JSONB for flexible content storage
  - Full-text search capabilities
  - Complex relationships and constraints
  - Excellent TypeScript integration via Drizzle

### Drizzle ORM
- **Why Chosen**: Type-safe, performant ORM with excellent TypeScript integration
- **Key Benefits**:
  - Zero-runtime overhead
  - SQL-like syntax that's familiar to developers
  - Automatic type inference from schema
  - Excellent migration system

### @vercel/postgres Driver
- **Why Chosen**: Optimized for Vercel deployment with connection pooling
- **Benefits**: Automatic connection management and optimized for serverless

### Database Architecture
```typescript
// Example schema definition
export const novels = pgTable('novels', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  thumbnail: varchar('thumbnail', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

## Authentication & Authorization

### Clerk
- **Why Chosen**: Modern authentication service with excellent developer experience
- **Features Used**:
  - Social login (Google, GitHub, etc.)
  - Email/password authentication
  - User management dashboard
  - Webhook integration for user sync
  - Role-based access control

### Role-Based Access Control
```typescript
export enum UserRole {
  ADMIN = 'ADMIN',
  SUBSCRIBER = 'SUBSCRIBER',
  MEMBER = 'MEMBER'
}
```

### Security Features
- **CSRF Protection**: Built into Next.js Server Actions
- **Input Validation**: Zod schemas for all user inputs
- **Rate Limiting**: Protection against abuse
- **Secure Headers**: Implemented via Next.js configuration

## Content & Translation

### MDX Support
- **Why Chosen**: Allows mixing Markdown with React components
- **Use Cases**: Static pages (About, Privacy Policy, Terms of Service)
- **Configuration**: Custom components for enhanced content rendering

### AI Translation Services

#### Gemini API
- **Why Chosen**: High-quality translation with context awareness
- **Implementation**: Custom CLI tools for batch translation
- **Features**: Concurrent processing, error handling, and progress tracking

#### Gradio API
- **Why Chosen**: Alternative translation service for redundancy
- **Use Case**: Backup translation service and comparison

### Web Scraping
- **Cheerio**: For parsing HTML from source websites (Kakuyomu)
- **Implementation**: Robust scraping with error handling and rate limiting

## Analytics & Integrations

### Vercel Analytics
- **Why Chosen**: Native integration with Vercel deployment
- **Metrics**: Core Web Vitals, page views, and performance data
- **Privacy**: GDPR compliant analytics

### Google Analytics 4
- **Why Chosen**: Comprehensive user behavior tracking
- **Implementation**: Custom events and conversion tracking
- **Privacy**: Cookie consent and data protection compliance

### Google AdSense
- **Why Chosen**: Monetization through contextual advertising
- **Implementation**: Strategic ad placement for optimal revenue
- **Performance**: Lazy loading to minimize impact on page speed

### Discord Integration
- **Why Chosen**: Community engagement and support notifications
- **Features**: Webhook notifications for new content and user actions
- **Implementation**: Server-side integration for security

## Development Tools

### ESLint
- **Configuration**: Next.js recommended rules with custom additions
- **Purpose**: Code quality, consistency, and error prevention
- **Integration**: Pre-commit hooks and CI/CD pipeline

### Drizzle Kit
- **Purpose**: Database migration management and schema generation
- **Features**: Type-safe migrations and database introspection
- **Workflow**: Schema-first development with automatic migration generation

### tsx
- **Purpose**: Running TypeScript scripts directly
- **Use Cases**: Database migrations, content import scripts, and utilities

## Build & Deployment

### Turbopack (Development)
- **Why Chosen**: Next.js's new bundler for faster development builds
- **Benefits**: Significantly faster hot reload and build times
- **Status**: Used in development mode for improved developer experience

### Webpack (Production)
- **Why Chosen**: Mature, stable bundler for production builds
- **Optimizations**: Code splitting, tree shaking, and asset optimization
- **Configuration**: Custom optimizations for performance

### Vercel Platform
- **Why Chosen**: Seamless integration with Next.js and excellent performance
- **Features**:
  - Automatic deployments from Git
  - Edge functions for global performance
  - Built-in analytics and monitoring
  - Automatic HTTPS and CDN

## Performance Optimizations

### Image Optimization
- **Next.js Image Component**: Automatic optimization and lazy loading
- **WebP/AVIF Support**: Modern image formats for better compression
- **Responsive Images**: Multiple sizes for different screen resolutions

### Code Splitting
- **Automatic**: Next.js handles route-based code splitting
- **Dynamic Imports**: Lazy loading of heavy components
- **Bundle Analysis**: Regular monitoring of bundle sizes

### Caching Strategy
- **Static Generation**: Pre-rendered pages for better performance
- **Incremental Static Regeneration**: Fresh content with static performance
- **API Caching**: Strategic caching of database queries

## Development Workflow

### Package Management
- **npm**: Standard package manager with lock file for consistency
- **Dependencies**: Carefully curated with regular updates
- **Scripts**: Comprehensive npm scripts for all development tasks

### Environment Management
- **Multiple Environments**: Development, staging, and production
- **Environment Variables**: Secure configuration management
- **Type Safety**: Environment variables validated with Zod

### Code Quality
- **TypeScript Strict Mode**: Maximum type safety
- **ESLint Rules**: Comprehensive linting for code quality
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for quality gates

## Monitoring & Observability

### Error Tracking
- **Next.js Error Boundaries**: Graceful error handling
- **Server-Side Logging**: Comprehensive error logging
- **User Experience**: Friendly error pages and fallbacks

### Performance Monitoring
- **Core Web Vitals**: Tracking key performance metrics
- **Real User Monitoring**: Understanding actual user experience
- **Synthetic Monitoring**: Automated performance testing

### Analytics Dashboard
- **User Behavior**: Understanding how users interact with the application
- **Content Performance**: Which content performs best
- **Technical Metrics**: Server performance and error rates

---

This technology stack represents a modern, production-ready approach to web development, emphasizing performance, developer experience, and maintainability. Each technology choice is deliberate and serves specific project requirements while demonstrating proficiency with current industry standards.