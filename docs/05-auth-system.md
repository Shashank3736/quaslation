# Authentication & Authorization System

## Overview

Quaslation implements a modern authentication system using Clerk for user management combined with a custom role-based authorization system. This approach provides enterprise-grade security while maintaining excellent developer experience and user experience.

## Authentication Architecture

### Clerk Integration

#### Why Clerk?
- **Modern Authentication**: Social logins, passwordless options, and traditional email/password
- **Security**: Built-in security features like bot detection, rate limiting, and breach monitoring
- **Developer Experience**: Excellent TypeScript support and React integration
- **Scalability**: Handles user management, session management, and security automatically
- **Compliance**: SOC 2 Type II certified with GDPR compliance

#### Configuration
```typescript
// src/lib/auth/config.ts
import { ClerkProvider } from '@clerk/nextjs';

export const clerkConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  secretKey: process.env.CLERK_SECRET_KEY!,
  signInUrl: '/auth/sign-in',
  signUpUrl: '/auth/sign-up',
  afterSignInUrl: '/',
  afterSignUpUrl: '/',
};
```

### Authentication Flow

#### User Registration
1. **Sign-Up Process**: User creates account via Clerk
2. **Webhook Trigger**: Clerk sends webhook to `/api/webhooks/clerk`
3. **Database Sync**: User record created in local database
4. **Role Assignment**: Default role (MEMBER) assigned
5. **Redirect**: User redirected to application

#### User Sign-In
1. **Authentication**: Clerk handles credential verification
2. **Session Creation**: Secure session established
3. **Token Generation**: JWT tokens for API access
4. **Role Loading**: User role loaded from database
5. **Authorization**: Access permissions determined

#### Session Management
```typescript
// Server-side session access
import { auth } from '@clerk/nextjs';

export async function getCurrentUser() {
  const { userId } = auth();
  if (!userId) return null;
  
  return await db.query.user.findFirst({
    where: eq(user.clerkId, userId),
  });
}
```

## Authorization System

### Role-Based Access Control (RBAC)

#### Role Hierarchy
```typescript
export enum UserRole {
  ADMIN = 'ADMIN',        // Full system access
  SUBSCRIBER = 'SUBSCRIBER', // Premium content access
  MEMBER = 'MEMBER'       // Basic access
}
```

#### Role Permissions

##### ADMIN Role
- **Content Management**: Create, edit, delete novels, volumes, and chapters
- **User Management**: View user data, manage user roles
- **System Administration**: Access admin dashboard and analytics
- **Premium Content**: Access all content regardless of premium status
- **Bulk Operations**: Import/export content, batch processing

##### SUBSCRIBER Role
- **Premium Content**: Access to premium chapters and exclusive content
- **Enhanced Features**: Advanced reading preferences, bookmarks
- **Community Features**: Enhanced commenting and interaction features
- **Early Access**: Access to new content before general release

##### MEMBER Role
- **Free Content**: Access to non-premium chapters and novels
- **Basic Features**: Standard reading interface and navigation
- **Community Participation**: Basic commenting and interaction
- **Account Management**: Profile management and preferences

### Permission Implementation

#### Server-Side Authorization
```typescript
// src/lib/auth/permissions.ts
export async function requireRole(requiredRole: UserRole) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  const roleHierarchy = {
    MEMBER: 0,
    SUBSCRIBER: 1,
    ADMIN: 2,
  };
  
  if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
    throw new Error('Insufficient permissions');
  }
  
  return user;
}

export async function canAccessPremiumContent(user: User | null): Promise<boolean> {
  if (!user) return false;
  return user.role === 'SUBSCRIBER' || user.role === 'ADMIN';
}
```

#### Client-Side Authorization
```typescript
// src/components/auth/role-guard.tsx
interface RoleGuardProps {
  requiredRole: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ requiredRole, children, fallback }: RoleGuardProps) {
  const { user } = useUser();
  const hasPermission = user && hasRole(user, requiredRole);
  
  if (!hasPermission) {
    return fallback || <div>Access denied</div>;
  }
  
  return <>{children}</>;
}
```

### Route Protection

#### Middleware Implementation
```typescript
// src/middleware.ts
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/novels',
    '/novels/(.*)',
    '/about',
    '/contact',
    '/api/webhooks/(.*)',
  ],
  ignoredRoutes: [
    '/api/webhooks/(.*)',
    '/_next/(.*)',
    '/favicon.ico',
  ],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

#### Page-Level Protection
```typescript
// src/app/admin/layout.tsx
import { requireRole } from '@/lib/auth/permissions';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireRole('ADMIN');
  } catch {
    redirect('/auth/sign-in');
  }
  
  return (
    <div className="admin-layout">
      <AdminNavigation />
      <main>{children}</main>
    </div>
  );
}
```

#### Server Action Protection
```typescript
// src/lib/actions/novel-actions.ts
'use server';

import { requireRole } from '@/lib/auth/permissions';
import { revalidatePath } from 'next/cache';

export async function createNovel(formData: FormData) {
  // Require admin role for novel creation
  await requireRole('ADMIN');
  
  const novelData = {
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    // ... other fields
  };
  
  // Validate input
  const validatedData = novelSchema.parse(novelData);
  
  // Create novel
  const novel = await db.insert(novels).values(validatedData);
  
  revalidatePath('/admin/novels');
  return novel;
}
```

## Content Access Control

### Premium Content Gating

#### Database-Level Control
```sql
-- Premium flag on chapters
SELECT * FROM Chapter 
WHERE novelId = $1 
  AND (premium = false OR $userRole IN ('SUBSCRIBER', 'ADMIN'))
ORDER BY serial;
```

#### Component-Level Gating
```typescript
// src/components/content/chapter-content.tsx
interface ChapterContentProps {
  chapter: Chapter;
  user: User | null;
}

export function ChapterContent({ chapter, user }: ChapterContentProps) {
  const canAccess = !chapter.premium || canAccessPremiumContent(user);
  
  if (!canAccess) {
    return <PremiumContentGate chapter={chapter} />;
  }
  
  return <RichTextRenderer content={chapter.richText} />;
}
```

#### Premium Content Gate
```typescript
// src/components/content/premium-content-gate.tsx
export function PremiumContentGate({ chapter }: { chapter: Chapter }) {
  return (
    <div className="premium-gate">
      <div className="premium-icon">🔒</div>
      <h3>Premium Content</h3>
      <p>This chapter is available to subscribers only.</p>
      <div className="premium-actions">
        <Button asChild>
          <Link href="/auth/sign-up">Subscribe Now</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/auth/sign-in">Sign In</Link>
        </Button>
      </div>
    </div>
  );
}
```

## User Management

### User Synchronization

#### Webhook Handler
```typescript
// src/app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }
  
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');
  
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', { status: 400 });
  }
  
  const payload = await req.json();
  const body = JSON.stringify(payload);
  
  const wh = new Webhook(WEBHOOK_SECRET);
  
  let evt;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', { status: 400 });
  }
  
  const { id } = evt.data;
  const eventType = evt.type;
  
  if (eventType === 'user.created') {
    await db.insert(user).values({
      clerkId: id,
      role: 'MEMBER',
    });
  }
  
  if (eventType === 'user.deleted') {
    await db.delete(user).where(eq(user.clerkId, id));
  }
  
  return new Response('', { status: 200 });
}
```

### User Profile Management

#### Profile Component
```typescript
// src/components/auth/user-profile.tsx
import { UserProfile as ClerkUserProfile } from '@clerk/nextjs';

export function UserProfile() {
  return (
    <div className="user-profile-container">
      <ClerkUserProfile
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-lg border-0',
          },
        }}
      />
    </div>
  );
}
```

## Security Features

### Input Validation
```typescript
// src/lib/validation/auth.ts
import { z } from 'zod';

export const roleUpdateSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['ADMIN', 'SUBSCRIBER', 'MEMBER']),
});

export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  fontSize: z.enum(['small', 'medium', 'large']),
  notifications: z.boolean(),
});
```

### Rate Limiting
```typescript
// src/lib/auth/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
  
  if (!success) {
    throw new Error('Rate limit exceeded');
  }
  
  return { limit, reset, remaining };
}
```

### CSRF Protection
- Built into Next.js Server Actions
- Automatic token generation and validation
- No additional configuration required

### Session Security
- Secure HTTP-only cookies
- Automatic session rotation
- Configurable session timeout
- Cross-site request forgery protection

## Testing Authentication

### Unit Tests
```typescript
// src/lib/auth/__tests__/permissions.test.ts
import { describe, it, expect } from 'vitest';
import { hasRole, canAccessPremiumContent } from '../permissions';

describe('Permission System', () => {
  it('should allow admin to access premium content', () => {
    const adminUser = { clerkId: '1', role: 'ADMIN' as const };
    expect(canAccessPremiumContent(adminUser)).toBe(true);
  });
  
  it('should deny member access to premium content', () => {
    const memberUser = { clerkId: '2', role: 'MEMBER' as const };
    expect(canAccessPremiumContent(memberUser)).toBe(false);
  });
});
```

### Integration Tests
```typescript
// src/app/admin/__tests__/admin-access.test.ts
import { render, screen } from '@testing-library/react';
import { ClerkProvider } from '@clerk/nextjs';
import AdminDashboard from '../page';

describe('Admin Dashboard', () => {
  it('should redirect non-admin users', async () => {
    // Mock non-admin user
    const mockUser = { role: 'MEMBER' };
    
    render(
      <ClerkProvider>
        <AdminDashboard />
      </ClerkProvider>
    );
    
    // Should not see admin content
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });
});
```

## Performance Considerations

### Caching Strategy
- User role cached in session
- Permission checks cached per request
- Database queries optimized with indexes

### Database Optimization
```sql
-- Index for efficient user lookups
CREATE INDEX idx_user_clerk_id ON "User" (clerkId);

-- Index for role-based queries
CREATE INDEX idx_user_role ON "User" (role);
```

### Client-Side Optimization
- Role information included in initial page load
- Conditional rendering to avoid layout shifts
- Optimistic UI updates where appropriate

## Monitoring & Analytics

### Authentication Metrics
- Sign-up conversion rates
- Login success/failure rates
- Session duration analytics
- Role distribution tracking

### Security Monitoring
- Failed authentication attempts
- Suspicious activity detection
- Rate limiting effectiveness
- Permission violation attempts

### User Experience Metrics
- Authentication flow completion rates
- Time to first successful login
- Premium conversion rates
- Feature usage by role

---

This authentication and authorization system provides a robust foundation for user management while maintaining security best practices and excellent user experience. The integration with Clerk handles the complex security aspects while the custom role system provides flexible content access control.