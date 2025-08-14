# Database Design

## Overview

The Quaslation database is built on PostgreSQL with Drizzle ORM, designed to handle complex relationships between users, novels, volumes, chapters, and rich content. The schema emphasizes data integrity, performance, and flexibility while maintaining type safety throughout the application.

## Database Architecture

### Technology Stack
- **Database**: PostgreSQL 15+ with JSONB support
- **ORM**: Drizzle ORM for type-safe database operations
- **Driver**: @vercel/postgres for optimized serverless connections
- **Migrations**: Drizzle Kit for schema versioning and migrations

### Design Principles
- **Referential Integrity**: Foreign key constraints ensure data consistency
- **Performance**: Strategic indexing for common query patterns
- **Flexibility**: Rich text storage in multiple formats
- **Scalability**: Designed to handle large amounts of content
- **Type Safety**: Full TypeScript integration with automatic type inference

## Core Entities

### User Entity
```typescript
export const user = pgTable("User", {
  clerkId: text("clerkId").primaryKey().notNull(),
  role: role("role").default('MEMBER').notNull(),
});

export const role = pgEnum("Role", ['ADMIN', 'SUBSCRIBER', 'MEMBER']);
```

**Purpose**: Manages user authentication and authorization
**Key Features**:
- Integration with Clerk authentication service
- Role-based access control with three tiers
- Minimal user data storage (privacy-focused)
- Primary key uses Clerk's external ID for seamless integration

**Roles Explained**:
- **ADMIN**: Full access to content management and user administration
- **SUBSCRIBER**: Access to premium content and enhanced features
- **MEMBER**: Basic access to free content

### Novel Entity
```typescript
export const novel = pgTable("Novel", {
  id: serial("id").primaryKey().notNull(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  thumbnail: text("thumbnail"),
  createdAt: timestamp("createdAt", { precision: 3 }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  publishedAt: timestamp("publishedAt", { precision: 3 }),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
  richTextId: integer("richTextId").notNull(),
});
```

**Purpose**: Represents a complete novel series
**Key Features**:
- URL-friendly slug for SEO optimization
- Unique title constraint prevents duplicates
- Optional thumbnail for visual representation
- Publishing workflow with draft/published states
- Rich text description via foreign key relationship

**Constraints**:
- Unique slug for URL routing
- Unique title to prevent duplicate novels
- Required rich text description

### Volume Entity
```typescript
export const volume = pgTable("Volume", {
  id: serial("id").primaryKey().notNull(),
  createdAt: timestamp("createdAt", { precision: 3 }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  publishedAt: timestamp("publishedAt", { precision: 3 }),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
  number: doublePrecision("number").notNull(),
  title: text("title"),
  novelId: integer("novelId").notNull(),
});
```

**Purpose**: Groups chapters within a novel (e.g., Volume 1, Volume 2)
**Key Features**:
- Flexible numbering system (supports decimals for special volumes)
- Optional title for named volumes
- Publishing workflow independent of chapters
- Unique volume numbers within each novel

**Constraints**:
- Unique (novelId, number) combination
- Foreign key relationship to novel

### Chapter Entity
```typescript
export const chapter = pgTable("Chapter", {
  id: serial("id").primaryKey().notNull(),
  premium: boolean("premium").default(true).notNull(),
  slug: text("slug").notNull(),
  novelId: integer("novelId").notNull(),
  volumeId: integer("volumeId").notNull(),
  serial: integer("serial").notNull(),
  number: doublePrecision("number").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("createdAt", { precision: 3 }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  publishedAt: timestamp("publishedAt", { precision: 3 }),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
  richTextId: integer("richTextId").notNull(),
});
```

**Purpose**: Individual chapter content within volumes
**Key Features**:
- Premium content gating for monetization
- Dual numbering system (serial for global order, number for volume order)
- URL-friendly slug for direct chapter access
- Rich text content storage
- Publishing workflow with draft states

**Constraints**:
- Unique slug for URL routing
- Unique (novelId, serial) for global chapter ordering
- Unique (volumeId, number) for volume-specific ordering
- Foreign key relationships to novel, volume, and rich text

**Indexing Strategy**:
- Premium index for efficient premium content queries
- Composite indexes for common query patterns

### RichText Entity
```typescript
export const richText = pgTable("RichText", {
  id: serial("id").primaryKey().notNull(),
  text: text("text").notNull(),
  html: text("html").notNull(),
  markdown: text("markdown").notNull(),
});
```

**Purpose**: Stores content in multiple formats for flexibility
**Key Features**:
- Plain text for search and processing
- HTML for direct web rendering
- Markdown for editing and version control
- Single source of truth with multiple representations

**Use Cases**:
- Novel descriptions
- Chapter content
- Future content types (author notes, announcements)

## Relationships

### Entity Relationship Diagram
```
User (1) ←→ (0..*) [Future: UserNovelProgress]
                    ↓
Novel (1) ←→ (1..*) Volume (1) ←→ (1..*) Chapter
  ↓                                        ↓
RichText (1) ←→ (1) Novel          RichText (1) ←→ (1) Chapter
```

### Relationship Details

#### Novel → Volume (One-to-Many)
```sql
-- Foreign key constraint
CONSTRAINT "Volume_novelId_fkey" 
FOREIGN KEY (novelId) REFERENCES Novel(id) 
ON UPDATE CASCADE ON DELETE RESTRICT
```
- One novel can have multiple volumes
- Volumes cannot exist without a parent novel
- Cascade updates, restrict deletes (data protection)

#### Volume → Chapter (One-to-Many)
```sql
-- Foreign key constraint
CONSTRAINT "Chapter_volumeId_fkey" 
FOREIGN KEY (volumeId) REFERENCES Volume(id) 
ON UPDATE CASCADE ON DELETE RESTRICT
```
- One volume can have multiple chapters
- Chapters must belong to a volume
- Maintains referential integrity

#### Novel → Chapter (One-to-Many)
```sql
-- Direct relationship for efficient queries
CONSTRAINT "Chapter_novelId_fkey" 
FOREIGN KEY (novelId) REFERENCES Novel(id) 
ON UPDATE CASCADE ON DELETE RESTRICT
```
- Direct relationship for performance
- Enables efficient novel-wide queries
- Redundant but necessary for query optimization

#### Content → RichText (One-to-One)
```sql
-- Unique constraint ensures one-to-one relationship
CONSTRAINT "Novel_richTextId_key" UNIQUE (richTextId)
CONSTRAINT "Chapter_richTextId_key" UNIQUE (richTextId)
```
- Each novel/chapter has exactly one rich text record
- Rich text records are not shared between entities
- Enables flexible content storage

## Indexing Strategy

### Primary Indexes
- All tables have serial primary keys for performance
- Primary keys are automatically indexed

### Unique Indexes
```sql
-- Novel indexes
CREATE UNIQUE INDEX "Novel_slug_key" ON "Novel" (slug);
CREATE UNIQUE INDEX "Novel_title_key" ON "Novel" (title);
CREATE UNIQUE INDEX "Novel_richTextId_key" ON "Novel" (richTextId);

-- Volume indexes
CREATE UNIQUE INDEX "Volume_novelId_number_key" ON "Volume" (novelId, number);

-- Chapter indexes
CREATE UNIQUE INDEX "Chapter_slug_key" ON "Chapter" (slug);
CREATE UNIQUE INDEX "Chapter_novelId_serial_key" ON "Chapter" (novelId, serial);
CREATE UNIQUE INDEX "Chapter_volumeId_number_key" ON "Chapter" (volumeId, number);
CREATE UNIQUE INDEX "Chapter_richTextId_key" ON "Chapter" (richTextId);
```

### Performance Indexes
```sql
-- Premium content filtering
CREATE INDEX "Chapter_premium_idx" ON "Chapter" (premium);
```

### Query Optimization

#### Common Query Patterns
1. **Novel Listing**: `SELECT * FROM Novel WHERE publishedAt IS NOT NULL`
2. **Chapter Navigation**: `SELECT * FROM Chapter WHERE novelId = ? ORDER BY serial`
3. **Volume Contents**: `SELECT * FROM Chapter WHERE volumeId = ? ORDER BY number`
4. **Premium Filtering**: `SELECT * FROM Chapter WHERE premium = false OR user_role = 'SUBSCRIBER'`

#### Index Usage
- Slug-based lookups use unique indexes for O(log n) performance
- Serial ordering uses composite indexes for efficient sorting
- Premium filtering uses dedicated index for fast content gating

## Data Integrity

### Constraints

#### Foreign Key Constraints
- **CASCADE on UPDATE**: Automatically update references when primary keys change
- **RESTRICT on DELETE**: Prevent deletion of referenced records
- Ensures referential integrity across all relationships

#### Unique Constraints
- Prevent duplicate slugs, titles, and content relationships
- Ensure data consistency and prevent conflicts
- Enable efficient lookups and prevent race conditions

#### Check Constraints (Future Enhancement)
```sql
-- Potential future constraints
ALTER TABLE Chapter ADD CONSTRAINT chapter_number_positive 
CHECK (number > 0);

ALTER TABLE Volume ADD CONSTRAINT volume_number_positive 
CHECK (number > 0);
```

### Data Validation

#### Application-Level Validation
```typescript
// Zod schemas for runtime validation
const novelSchema = z.object({
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(255),
  thumbnail: z.string().url().optional(),
});
```

#### Database-Level Validation
- NOT NULL constraints for required fields
- Unique constraints for business rules
- Foreign key constraints for relationships

## Performance Considerations

### Query Performance
- Strategic indexing for common access patterns
- Composite indexes for multi-column queries
- Unique indexes double as performance indexes

### Storage Optimization
- Text fields for variable-length content
- Timestamp precision appropriate for use case
- Serial IDs for efficient joins and sorting

### Scalability Features
- Partitioning potential for large chapter tables
- Index-only scans for common queries
- Connection pooling via @vercel/postgres

## Migration Strategy

### Schema Versioning
```typescript
// drizzle.config.ts
export default {
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
};
```

### Migration Workflow
1. **Schema Changes**: Modify schema.ts with new definitions
2. **Generate Migration**: `npm run db:generate` creates SQL migration
3. **Review Migration**: Manual review of generated SQL
4. **Apply Migration**: `npm run db:migrate` applies to database
5. **Version Control**: Commit both schema and migration files

### Rollback Strategy
- Each migration includes rollback SQL
- Database backups before major migrations
- Staged deployment with rollback capability

## Security Considerations

### Access Control
- Role-based access through application layer
- Database user with minimal required permissions
- Connection string security via environment variables

### Data Protection
- No sensitive user data stored (delegated to Clerk)
- Content access controlled by premium flags
- Audit trail through timestamp fields

### SQL Injection Prevention
- Parameterized queries via Drizzle ORM
- Input validation at application layer
- Type safety prevents many injection vectors

## Future Enhancements

### Planned Schema Extensions
1. **User Progress Tracking**
   ```typescript
   export const userProgress = pgTable("UserProgress", {
     userId: text("userId").notNull(),
     chapterId: integer("chapterId").notNull(),
     readAt: timestamp("readAt").notNull(),
     // ... additional fields
   });
   ```

2. **Content Categories/Tags**
   ```typescript
   export const category = pgTable("Category", {
     id: serial("id").primaryKey(),
     name: text("name").notNull(),
     slug: text("slug").notNull(),
   });
   
   export const novelCategory = pgTable("NovelCategory", {
     novelId: integer("novelId").notNull(),
     categoryId: integer("categoryId").notNull(),
   });
   ```

3. **Content Analytics**
   ```typescript
   export const chapterView = pgTable("ChapterView", {
     id: serial("id").primaryKey(),
     chapterId: integer("chapterId").notNull(),
     viewedAt: timestamp("viewedAt").notNull(),
     // ... analytics fields
   });
   ```

### Performance Optimizations
- Read replicas for query scaling
- Caching layer for frequently accessed content
- Full-text search integration for content discovery

---

This database design provides a solid foundation for the Quaslation platform, balancing flexibility, performance, and maintainability while ensuring data integrity and supporting future growth.