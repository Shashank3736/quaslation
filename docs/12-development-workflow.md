# Development Workflow

## Overview

This document outlines the development workflow, local setup procedures, testing strategies, and contribution guidelines for the Quaslation project. The workflow emphasizes code quality, automated testing, and collaborative development practices.

## Local Development Setup

### Prerequisites
```bash
# Required software versions
Node.js: 20.x or higher
npm: 10.x or higher
PostgreSQL: 14.x or higher (local) or Neon (cloud)
Git: 2.30 or higher
```

### Initial Setup
```bash
# 1. Clone the repository
git clone https://github.com/your-org/quaslation.git
cd quaslation

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Configure database connection
# Edit .env.local with your database credentials
DATABASE_URL="postgresql://username:password@localhost:5432/quaslation"
DIRECT_URL="postgresql://username:password@localhost:5432/quaslation"

# 5. Set up Clerk authentication
# Add your Clerk keys to .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# 6. Run database migrations
npm run db:migrate

# 7. Start development server
npm run dev
```

### Development Scripts
```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx scripts/seed.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui"
  }
}
```

## Code Quality Standards

### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx'],
      env: {
        jest: true,
      },
    },
  ],
}
```

### Prettier Configuration
```json
// .prettierrc
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### TypeScript Standards
```typescript
// src/lib/types/common.ts
// Use strict typing
export interface User {
  id: number
  clerkId: string
  email: string
  firstName: string | null
  lastName: string | null
  role: 'ADMIN' | 'SUBSCRIBER' | 'MEMBER'
  createdAt: Date
  updatedAt: Date
}

// Use utility types
export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateUserData = Partial<Pick<User, 'firstName' | 'lastName' | 'role'>>

// Use branded types for IDs
export type UserId = number & { readonly brand: unique symbol }
export type NovelId = number & { readonly brand: unique symbol }
```

## Testing Strategy

### Unit Testing with Jest
```typescript
// src/lib/utils/__tests__/slug.test.ts
import { generateSlug, validateSlug } from '../slug'

describe('Slug utilities', () => {
  describe('generateSlug', () => {
    it('should convert title to lowercase slug', () => {
      expect(generateSlug('My Novel Title')).toBe('my-novel-title')
    })

    it('should handle special characters', () => {
      expect(generateSlug('Title with "quotes" & symbols!')).toBe('title-with-quotes-symbols')
    })

    it('should handle Japanese characters', () => {
      expect(generateSlug('タイトル')).toBe('タイトル')
    })
  })

  describe('validateSlug', () => {
    it('should validate correct slugs', () => {
      expect(validateSlug('valid-slug')).toBe(true)
      expect(validateSlug('valid-slug-123')).toBe(true)
    })

    it('should reject invalid slugs', () => {
      expect(validateSlug('Invalid Slug')).toBe(false)
      expect(validateSlug('invalid_slug')).toBe(false)
      expect(validateSlug('')).toBe(false)
    })
  })
})
```

### Component Testing
```typescript
// src/components/__tests__/novel-card.test.tsx
import { render, screen } from '@testing-library/react'
import { NovelCard } from '../novel-card'

const mockNovel = {
  id: 1,
  title: 'Test Novel',
  slug: 'test-novel',
  thumbnail: '/test-image.jpg',
  richText: {
    text: 'Test description',
    html: '<p>Test description</p>',
    markdown: 'Test description',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  publishedAt: new Date(),
}

describe('NovelCard', () => {
  it('renders novel information correctly', () => {
    render(<NovelCard novel={mockNovel} />)
    
    expect(screen.getByText('Test Novel')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Test Novel')
  })

  it('links to novel page', () => {
    render(<NovelCard novel={mockNovel} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/novels/test-novel')
  })
})
```

### Integration Testing
```typescript
// src/lib/db/__tests__/queries.test.ts
import { db } from '../index'
import { getNovelBySlug, getPublishedNovels } from '../query'
import { createTestNovel, cleanupTestData } from '../../test-utils'

describe('Database queries', () => {
  beforeEach(async () => {
    await cleanupTestData()
  })

  afterEach(async () => {
    await cleanupTestData()
  })

  describe('getNovelBySlug', () => {
    it('should return novel with correct slug', async () => {
      const testNovel = await createTestNovel({
        title: 'Test Novel',
        slug: 'test-novel',
      })

      const result = await getNovelBySlug('test-novel')
      
      expect(result).toBeDefined()
      expect(result?.title).toBe('Test Novel')
      expect(result?.slug).toBe('test-novel')
    })

    it('should return null for non-existent slug', async () => {
      const result = await getNovelBySlug('non-existent')
      expect(result).toBeNull()
    })
  })
})
```

### End-to-End Testing with Playwright
```typescript
// tests/e2e/novel-reading.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Novel Reading Flow', () => {
  test('should allow user to read a chapter', async ({ page }) => {
    // Navigate to novel page
    await page.goto('/novels/test-novel')
    
    // Verify novel information is displayed
    await expect(page.locator('h1')).toContainText('Test Novel')
    
    // Click on first chapter
    await page.click('[data-testid="chapter-link"]:first-child')
    
    // Verify chapter content is loaded
    await expect(page.locator('[data-testid="chapter-content"]')).toBeVisible()
    
    // Test chapter navigation
    await page.click('[data-testid="next-chapter"]')
    await expect(page.url()).toContain('/chapter-2')
  })

  test('should handle premium content correctly', async ({ page }) => {
    // Test without authentication
    await page.goto('/novels/test-novel/premium-chapter')
    await expect(page.locator('[data-testid="premium-gate"]')).toBeVisible()
    
    // Test with authentication
    await page.goto('/auth/sign-in')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('[type="submit"]')
    
    await page.goto('/novels/test-novel/premium-chapter')
    await expect(page.locator('[data-testid="chapter-content"]')).toBeVisible()
  })
})
```

## Git Workflow

### Branch Strategy
```bash
# Main branches
main          # Production-ready code
develop       # Integration branch for features

# Feature branches
feature/novel-management
feature/translation-pipeline
feature/user-authentication

# Release branches
release/v2.14.0

# Hotfix branches
hotfix/critical-bug-fix
```

### Commit Convention
```bash
# Commit message format
<type>(<scope>): <description>

# Types
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation changes
style:    # Code style changes (formatting, etc.)
refactor: # Code refactoring
test:     # Adding or updating tests
chore:    # Maintenance tasks

# Examples
feat(novels): add novel creation form
fix(auth): resolve login redirect issue
docs(api): update API documentation
test(components): add novel card tests
```

### Pull Request Process
```markdown
## Pull Request Template

### Description
Brief description of changes made.

### Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

### Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] No console.log statements left in code
```

## Database Development

### Migration Workflow
```bash
# 1. Make schema changes
# Edit src/lib/db/schema.ts

# 2. Generate migration
npm run db:generate

# 3. Review generated SQL
# Check src/lib/db/[timestamp]_migration.sql

# 4. Apply migration to development
npm run db:migrate

# 5. Test migration
npm run db:studio

# 6. Commit migration files
git add src/lib/db/
git commit -m "feat(db): add user preferences table"
```

### Database Seeding
```typescript
// scripts/seed.ts
import { db } from '../src/lib/db'
import { novels, richText, users } from '../src/lib/db/schema'

async function seed() {
  console.log('🌱 Seeding database...')

  // Create test user
  const [testUser] = await db.insert(users).values({
    clerkId: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning()

  // Create sample rich text
  const [sampleRichText] = await db.insert(richText).values({
    text: 'This is a sample novel description.',
    html: '<p>This is a sample novel description.</p>',
    markdown: 'This is a sample novel description.',
  }).returning()

  // Create sample novel
  await db.insert(novels).values({
    title: 'Sample Novel',
    slug: 'sample-novel',
    thumbnail: '/sample-thumbnail.jpg',
    richTextId: sampleRichText.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
  })

  console.log('✅ Database seeded successfully')
}

seed().catch(console.error)
```

## Code Review Guidelines

### Review Checklist
```markdown
## Code Review Checklist

### Functionality
- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] Performance considerations addressed

### Code Quality
- [ ] Code is readable and well-structured
- [ ] Functions are focused and single-purpose
- [ ] Variable and function names are descriptive
- [ ] Comments explain complex logic

### Security
- [ ] Input validation is present
- [ ] SQL injection prevention
- [ ] XSS prevention measures
- [ ] Authentication/authorization checks

### Testing
- [ ] Unit tests cover new functionality
- [ ] Integration tests updated if needed
- [ ] E2E tests cover user flows
- [ ] Test coverage is adequate

### Documentation
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Code comments are helpful
- [ ] Breaking changes documented
```

### Review Process
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push branch
git push origin feature/new-feature

# 4. Create pull request
# Use GitHub/GitLab interface

# 5. Address review feedback
git add .
git commit -m "fix: address review feedback"
git push origin feature/new-feature

# 6. Merge after approval
# Use squash and merge for clean history
```

## Deployment Process

### Pre-deployment Checklist
```markdown
## Pre-deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] Code review completed
- [ ] No console.log statements
- [ ] Environment variables updated

### Database
- [ ] Migrations tested
- [ ] Backup created
- [ ] Rollback plan prepared

### Performance
- [ ] Bundle size checked
- [ ] Core Web Vitals tested
- [ ] Caching strategy verified

### Security
- [ ] Dependencies updated
- [ ] Security headers configured
- [ ] API endpoints secured
```

### Deployment Steps
```bash
# 1. Merge to main branch
git checkout main
git merge develop

# 2. Tag release
git tag -a v2.14.0 -m "Release v2.14.0"
git push origin v2.14.0

# 3. Deploy to staging
vercel --target staging

# 4. Run smoke tests
npm run test:e2e:staging

# 5. Deploy to production
vercel --prod

# 6. Monitor deployment
# Check logs and metrics
```

## Troubleshooting Guide

### Common Issues
```markdown
## Common Development Issues

### Database Connection Issues
- Check DATABASE_URL format
- Verify database is running
- Check firewall settings
- Validate credentials

### Build Failures
- Clear .next directory
- Delete node_modules and reinstall
- Check TypeScript errors
- Verify environment variables

### Authentication Issues
- Check Clerk configuration
- Verify API keys
- Check redirect URLs
- Clear browser cache

### Performance Issues
- Check bundle analyzer
- Review database queries
- Verify caching strategy
- Monitor Core Web Vitals
```

---

This development workflow ensures consistent, high-quality code delivery while maintaining project standards and facilitating team collaboration.