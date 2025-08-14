# Deployment & DevOps

## Overview

Quaslation is designed for deployment on Vercel with PostgreSQL on Neon, featuring automated CI/CD pipelines, environment management, and monitoring. The deployment strategy emphasizes zero-downtime deployments, automatic scaling, and comprehensive error tracking.

## Build Configuration

### Next.js Configuration
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true, // Partial Prerendering
    reactCompiler: true, // React Compiler
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kakuyomu.jp',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.quaslation.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/rss',
        destination: '/rss.xml',
      },
    ]
  },
}

export default nextConfig
```

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Drizzle Configuration
```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DIRECT_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config
```

## Environment Management

### Environment Variables Structure
```bash
# .env.example
# Database
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/auth/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/auth/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# AI Services
GEMINI_API_KEY="your_gemini_api_key"
GRADIO_ENDPOINT="http://localhost:7860"

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="your_analytics_id"
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Monetization
NEXT_PUBLIC_ADSENSE_CLIENT_ID="ca-pub-xxxxxxxxxx"

# External Services
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
DISQUS_SHORTNAME="your_disqus_shortname"

# Application
NEXT_PUBLIC_APP_URL="https://quaslation.com"
NODE_ENV="production"
```

### Environment-Specific Configurations
```typescript
// src/lib/config.ts
const config = {
  app: {
    name: 'Quaslation',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    description: 'High-quality fan translations of Asian web novels',
  },
  database: {
    url: process.env.DATABASE_URL!,
    directUrl: process.env.DIRECT_URL!,
  },
  auth: {
    clerk: {
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
      secretKey: process.env.CLERK_SECRET_KEY!,
    },
  },
  ai: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY!,
    },
    gradio: {
      endpoint: process.env.GRADIO_ENDPOINT || 'http://localhost:7860',
    },
  },
  analytics: {
    vercel: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
    google: process.env.NEXT_PUBLIC_GA_ID,
  },
  monetization: {
    adsense: {
      clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
    },
  },
  external: {
    discord: {
      webhookUrl: process.env.DISCORD_WEBHOOK_URL,
    },
    disqus: {
      shortname: process.env.DISQUS_SHORTNAME,
    },
  },
}

export default config
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/nextjs-build.yml
name: Check NextJs build

on:
  push:
    branches: ["main"]
  pull_request:
    types: [opened, reopened]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [20.x]
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run type checking
        run: npx tsc --noEmit
        
      - name: Run linting
        run: npm run lint
        
      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}
          CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}
          
      - name: Run database migrations (dry run)
        run: npm run db:generate
        env:
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
```

### Deployment Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: ["main"]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          
      - name: Run database migrations
        run: |
          npm ci
          npm run db:migrate
        env:
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
          
      - name: Notify Discord
        if: success()
        run: |
          curl -X POST -H 'Content-type: application/json' \
            --data '{"content":"🚀 Quaslation deployed successfully to production!"}' \
            ${{ secrets.DISCORD_WEBHOOK_URL }}
```

## Database Deployment

### Migration Strategy
```typescript
// scripts/migrate/migrate.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

async function runMigrations() {
  const connectionString = process.env.DIRECT_URL!
  
  // Create connection for migrations
  const migrationClient = postgres(connectionString, { max: 1 })
  const db = drizzle(migrationClient)
  
  try {
    console.log('🔄 Running database migrations...')
    await migrate(db, { migrationsFolder: './src/lib/db' })
    console.log('✅ Migrations completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await migrationClient.end()
  }
}

runMigrations()
```

### Database Backup Strategy
```bash
#!/bin/bash
# scripts/backup-db.sh

# Set variables
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="quaslation_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump $DATABASE_URL > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

echo "✅ Database backup created: $BACKUP_DIR/${BACKUP_FILE}.gz"

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
```

## Vercel Configuration

### Vercel Project Settings
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, s-maxage=60, stale-while-revalidate=300"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/admin",
      "destination": "/admin/dashboard",
      "permanent": true
    }
  ]
}
```

### Environment Variables in Vercel
```bash
# Production environment variables
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add CLERK_SECRET_KEY production
vercel env add GEMINI_API_KEY production

# Preview environment variables
vercel env add DATABASE_URL preview
vercel env add DIRECT_URL preview
vercel env add CLERK_SECRET_KEY preview

# Development environment variables
vercel env pull .env.local
```

## Monitoring & Observability

### Error Tracking with Sentry
```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: false,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', /^https:\/\/quaslation\.com/],
    }),
  ],
})
```

### Performance Monitoring
```typescript
// src/lib/monitoring.ts
import { NextRequest, NextResponse } from 'next/server'

export function withMonitoring(handler: Function) {
  return async (request: NextRequest) => {
    const start = Date.now()
    
    try {
      const response = await handler(request)
      const duration = Date.now() - start
      
      // Log performance metrics
      console.log(`${request.method} ${request.url} - ${duration}ms`)
      
      return response
    } catch (error) {
      const duration = Date.now() - start
      
      // Log error with context
      console.error(`${request.method} ${request.url} - ${duration}ms - ERROR:`, error)
      
      throw error
    }
  }
}
```

### Health Check Endpoint
```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Check database connection
    await db.execute('SELECT 1')
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        server: 'running',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}
```

## Security Configuration

### Content Security Policy
```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googletagmanager.com *.google-analytics.com *.googlesyndication.com",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: blob: *.kakuyomu.jp *.googleusercontent.com *.googlesyndication.com",
      "connect-src 'self' *.vercel-analytics.com *.google-analytics.com",
      "frame-src 'self' *.googlesyndication.com disqus.com",
    ].join('; ')
  )
  
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### Rate Limiting
```typescript
// src/lib/rate-limit.ts
import { NextRequest } from 'next/server'

const rateLimitMap = new Map()

export function rateLimit(request: NextRequest, limit: number = 10, window: number = 60000) {
  const ip = request.ip || 'anonymous'
  const now = Date.now()
  const windowStart = now - window
  
  const requests = rateLimitMap.get(ip) || []
  const validRequests = requests.filter((time: number) => time > windowStart)
  
  if (validRequests.length >= limit) {
    return false
  }
  
  validRequests.push(now)
  rateLimitMap.set(ip, validRequests)
  
  return true
}
```

## Performance Optimization

### Build Optimization
```javascript
// next.config.mjs (additional optimizations)
const nextConfig = {
  // ... existing config
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all'
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      }
    }
    
    return config
  },
}
```

### Caching Strategy
```typescript
// src/lib/cache.ts
import { unstable_cache } from 'next/cache'

export const createCachedFunction = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyParts: string[],
  options: {
    revalidate?: number
    tags?: string[]
  } = {}
) => {
  return unstable_cache(fn, keyParts, {
    revalidate: options.revalidate || 3600, // 1 hour default
    tags: options.tags || [],
  })
}

// Usage example
export const getCachedNovels = createCachedFunction(
  getPublishedNovels,
  ['novels'],
  { revalidate: 1800, tags: ['novels'] }
)
```

## Backup & Recovery

### Automated Backup Script
```typescript
// scripts/backup/automated-backup.ts
import { exec } from 'child_process'
import { promisify } from 'util'
import { uploadToS3 } from './s3-upload'

const execAsync = promisify(exec)

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = `quaslation-backup-${timestamp}.sql`
  
  try {
    // Create database dump
    await execAsync(`pg_dump ${process.env.DATABASE_URL} > ${backupFile}`)
    
    // Compress backup
    await execAsync(`gzip ${backupFile}`)
    
    // Upload to cloud storage
    await uploadToS3(`${backupFile}.gz`)
    
    // Clean up local file
    await execAsync(`rm ${backupFile}.gz`)
    
    console.log(`✅ Backup completed: ${backupFile}.gz`)
  } catch (error) {
    console.error('❌ Backup failed:', error)
    throw error
  }
}

// Run backup
createBackup()
```

### Disaster Recovery Plan
```markdown
# Disaster Recovery Procedures

## Database Recovery
1. Identify latest backup from S3/cloud storage
2. Download backup file
3. Create new database instance
4. Restore from backup: `psql $DATABASE_URL < backup.sql`
5. Update environment variables
6. Redeploy application

## Application Recovery
1. Verify Vercel deployment status
2. Check environment variables
3. Validate database connectivity
4. Run health checks
5. Monitor error rates

## Rollback Procedures
1. Identify last known good deployment
2. Revert to previous Git commit
3. Redeploy via Vercel
4. Verify functionality
5. Communicate status to users
```

---

This deployment and DevOps setup provides a robust, scalable foundation for running Quaslation in production with proper monitoring, security, and recovery procedures.