# Project Structure

## Root Directory Organization

### Configuration Files
```
├── next.config.mjs         # Next.js configuration with custom settings
├── tailwind.config.ts      # Tailwind CSS configuration with custom theme
├── tsconfig.json          # TypeScript configuration with strict settings
├── drizzle.config.ts      # Drizzle ORM configuration for database operations
├── components.json        # shadcn/ui configuration for component generation
├── postcss.config.mjs     # PostCSS configuration for CSS processing
└── .eslintrc.json         # ESLint configuration for code quality
```

### Package Management
```
├── package.json           # Dependencies and scripts
├── package-lock.json      # Locked dependency versions
└── node_modules/          # Installed dependencies (gitignored)
```

### Environment & Documentation
```
├── .env.example           # Template for environment variables
├── .env.local            # Local environment variables (gitignored)
├── README.md             # Project overview and setup instructions
├── CHANGELOG.md          # Version history and changes
└── docs/                 # Comprehensive developer documentation
```

## Source Code Organization (`src/`)

### App Router Structure (`src/app/`)

The application uses Next.js 15 App Router with a carefully organized route structure:

```
src/app/
├── layout.tsx              # Root layout with providers and global setup
├── error.tsx               # Global error boundary for unhandled errors
├── not-found.tsx           # Custom 404 page
├── sitemap.ts              # Dynamic sitemap generation for SEO
├── robots.ts               # Dynamic robots.txt generation
├── _components/            # App-level shared components
│   ├── providers.tsx       # Context providers (Clerk, theme, etc.)
│   ├── analytics.tsx       # Analytics components (GA, Vercel)
│   └── error-boundary.tsx  # Error handling components
├── _css/                   # Global styles and CSS imports
│   ├── globals.css         # Global CSS with Tailwind imports
│   └── components.css      # Component-specific global styles
```

#### Main Site Routes (`(main)/`)
```
├── (main)/                 # Route group for main site
│   ├── layout.tsx          # Main layout with navigation and ads
│   ├── page.tsx            # Homepage with featured content
│   ├── novels/             # Novel browsing and reading
│   │   ├── page.tsx        # Novel listing page
│   │   ├── [slug]/         # Individual novel pages
│   │   │   ├── page.tsx    # Novel overview and chapter list
│   │   │   └── [volume]/   # Volume-specific pages
│   │   │       ├── page.tsx        # Volume overview
│   │   │       └── [chapter]/      # Chapter reading pages
│   │   │           └── page.tsx    # Chapter content
│   │   └── _components/    # Novel-specific components
│   │       ├── novel-card.tsx      # Novel preview cards
│   │       ├── chapter-list.tsx    # Chapter navigation
│   │       ├── reading-interface.tsx # Reading UI
│   │       └── volume-selector.tsx  # Volume navigation
│   ├── contact/            # Contact form and support
│   │   ├── page.tsx        # Contact form page
│   │   └── _components/    # Contact-specific components
│   └── (mdx)/              # Static MDX pages
│       ├── about/          # About page
│       ├── privacy/        # Privacy policy
│       ├── terms/          # Terms of service
│       └── _components/    # MDX-specific components
```

#### Admin Interface (`admin/`)
```
├── admin/                  # Admin interface (protected routes)
│   ├── layout.tsx          # Admin layout with navigation
│   ├── page.tsx            # Admin dashboard with metrics
│   ├── novels/             # Novel management
│   │   ├── page.tsx        # Novel listing and creation
│   │   ├── [id]/           # Individual novel management
│   │   │   ├── page.tsx    # Novel editing
│   │   │   ├── volumes/    # Volume management
│   │   │   └── chapters/   # Chapter management
│   │   └── _components/    # Novel management components
│   ├── chapters/           # Chapter management
│   │   ├── page.tsx        # Chapter listing and bulk operations
│   │   ├── [id]/           # Individual chapter editing
│   │   └── _components/    # Chapter management components
│   ├── users/              # User management (admin only)
│   └── _components/        # Admin-specific components
│       ├── admin-nav.tsx   # Admin navigation
│       ├── metrics-card.tsx # Dashboard metrics
│       └── data-table.tsx  # Reusable data tables
```

#### Authentication & API Routes
```
├── auth/                   # Authentication pages (Clerk integration)
│   ├── sign-in/           # Custom sign-in page
│   ├── sign-up/           # Custom sign-up page
│   └── callback/          # OAuth callback handling
├── api/                   # API routes (minimal, prefer Server Actions)
│   ├── webhooks/          # External service webhooks
│   │   ├── clerk/         # Clerk user sync webhooks
│   │   └── discord/       # Discord integration webhooks
│   └── rss/               # RSS feed generation
└── rss.xml/               # RSS feed route
```

### Component Architecture (`src/components/`)

```
src/components/
├── ui/                     # shadcn/ui base components
│   ├── button.tsx          # Button component with variants
│   ├── input.tsx           # Form input components
│   ├── card.tsx            # Card layout components
│   ├── dialog.tsx          # Modal and dialog components
│   ├── sheet.tsx           # Slide-out panels
│   ├── select.tsx          # Dropdown selection components
│   ├── tabs.tsx            # Tab navigation components
│   └── ...                 # Other UI primitives
├── shared/                 # Reusable business components
│   ├── navigation/         # Navigation components
│   │   ├── main-nav.tsx    # Main site navigation
│   │   ├── mobile-nav.tsx  # Mobile navigation menu
│   │   └── breadcrumbs.tsx # Breadcrumb navigation
│   ├── content/            # Content display components
│   │   ├── rich-text.tsx   # Rich text rendering
│   │   ├── content-card.tsx # Content preview cards
│   │   └── pagination.tsx  # Pagination controls
│   ├── forms/              # Form components
│   │   ├── contact-form.tsx # Contact form
│   │   ├── search-form.tsx  # Search functionality
│   │   └── form-fields.tsx  # Reusable form fields
│   └── layout/             # Layout components
│       ├── header.tsx      # Site header
│       ├── footer.tsx      # Site footer
│       └── sidebar.tsx     # Sidebar navigation
├── system/                 # System-level components
│   ├── ads/                # Advertisement components
│   │   ├── ad-banner.tsx   # Banner advertisements
│   │   ├── ad-sidebar.tsx  # Sidebar advertisements
│   │   └── ad-inline.tsx   # Inline content ads
│   ├── analytics/          # Analytics components
│   │   ├── google-analytics.tsx # GA4 integration
│   │   └── vercel-analytics.tsx # Vercel analytics
│   └── seo/                # SEO components
│       ├── meta-tags.tsx   # Dynamic meta tags
│       └── structured-data.tsx # JSON-LD structured data
├── typography/             # Text rendering components
│   ├── heading.tsx         # Heading components with variants
│   ├── paragraph.tsx       # Paragraph text with styling
│   └── code.tsx            # Code block rendering
└── icons/                  # Icon components
    ├── logo.tsx            # Site logo component
    └── social-icons.tsx    # Social media icons
```

### Library Code (`src/lib/`)

```
src/lib/
├── db/                     # Database layer
│   ├── index.ts            # Database connection and client
│   ├── schema.ts           # Drizzle schema definitions
│   ├── relations.ts        # Database relationships
│   ├── query.ts            # Reusable query functions
│   ├── migrations/         # Database migration files
│   └── seed.ts             # Database seeding scripts
├── auth/                   # Authentication utilities
│   ├── config.ts           # Clerk configuration
│   ├── middleware.ts       # Auth middleware helpers
│   └── permissions.ts      # Role-based access control
├── utils/                  # Utility functions
│   ├── cn.ts               # Class name utility (clsx + tailwind-merge)
│   ├── format.ts           # Date and text formatting
│   ├── validation.ts       # Zod schemas for validation
│   └── constants.ts        # Application constants
├── hooks/                  # Custom React hooks
│   ├── use-local-storage.ts # Local storage hook
│   ├── use-debounce.ts     # Debouncing hook
│   └── use-media-query.ts  # Responsive design hook
├── actions/                # Server Actions
│   ├── novel-actions.ts    # Novel-related server actions
│   ├── chapter-actions.ts  # Chapter-related server actions
│   └── user-actions.ts     # User-related server actions
└── config.ts               # Application configuration
```

### Scripts Directory

```
scripts/
├── gemini/                 # Gemini API translation tools
│   ├── main.ts             # Main translation script
│   ├── upload.ts           # Content upload script
│   ├── config.ts           # Gemini API configuration
│   └── utils.ts            # Translation utilities
├── translation/            # Alternative translation tools
│   ├── translate.ts        # Gradio API translation
│   ├── kakuyomu-fetcher.ts # Web scraping for content
│   └── batch-process.ts    # Batch processing utilities
└── migrate/                # Database migration utilities
    ├── backup.ts           # Database backup scripts
    ├── restore.ts          # Database restore scripts
    └── cleanup.ts          # Data cleanup utilities
```

### Public Assets

```
public/
├── icon.jpg                # Site favicon and app icon
├── logo/                   # Brand logos in various formats
│   ├── logo.svg            # Vector logo
│   ├── logo-dark.svg       # Dark mode logo
│   └── logo-text.svg       # Logo with text
├── pattern/                # Background patterns and textures
├── dummy/                  # Placeholder images for development
├── ads.txt                 # Google AdSense verification
└── robots.txt              # Search engine directives
```

## Architectural Patterns

### Route Organization Patterns

#### Route Groups
- **`(main)`**: Groups main site routes without affecting URL structure
- **`(mdx)`**: Groups static MDX pages for better organization
- **`admin`**: Separate admin interface with its own layout

#### Dynamic Routes
- **`[slug]`**: Novel identification by URL-friendly slug
- **`[volume]`**: Volume navigation within novels
- **`[chapter]`**: Chapter identification within volumes

#### Nested Layouts
```typescript
// Root layout (app/layout.tsx)
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

// Main site layout (app/(main)/layout.tsx)
export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

### Component Organization Patterns

#### Atomic Design Principles
- **Atoms**: Basic UI components (`ui/` directory)
- **Molecules**: Composed components (`shared/` directory)
- **Organisms**: Complex components with business logic
- **Templates**: Page layouts and structures

#### Co-location Strategy
- Components used by specific routes are co-located in `_components/` directories
- Shared components are organized by function in the main `components/` directory
- System-level components are separated for clear boundaries

### File Naming Conventions

#### React Components
- **PascalCase**: `NovelCard.tsx`, `ChapterList.tsx`
- **kebab-case for files**: `novel-card.tsx`, `chapter-list.tsx`
- **Descriptive names**: Clear indication of component purpose

#### Utility Files
- **camelCase**: `formatDate.ts`, `validateInput.ts`
- **Descriptive names**: Function purpose clear from filename

#### Route Files
- **Next.js conventions**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- **Dynamic routes**: `[slug]`, `[...params]` for catch-all routes

### Import Path Strategy

#### Path Aliases
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/app/*": ["./src/app/*"]
    }
  }
}
```

#### Import Organization
```typescript
// External imports first
import React from 'react';
import { NextPage } from 'next';

// Internal imports with absolute paths
import { Button } from '@/components/ui/button';
import { NovelCard } from '@/components/shared/content/novel-card';
import { getNovelsByCategory } from '@/lib/db/query';

// Relative imports for same-directory files
import './styles.css';
```

### Database Schema Organization

#### Schema Structure
```typescript
// Single source of truth in schema.ts
export const novels = pgTable('novels', {
  // Column definitions
});

export const chapters = pgTable('chapters', {
  // Column definitions
});

// Relations defined separately
export const novelRelations = relations(novels, ({ many }) => ({
  chapters: many(chapters),
}));
```

#### Migration Strategy
- **Schema-first**: Define schema in TypeScript, generate SQL migrations
- **Version control**: All migrations tracked in Git
- **Rollback support**: Each migration includes down migration

---

This project structure demonstrates modern Next.js application organization with clear separation of concerns, scalable architecture, and maintainable code patterns. The structure supports both current functionality and future growth while maintaining developer productivity and code quality.