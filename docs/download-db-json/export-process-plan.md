# Database Export Process Plan

This document outlines the step-by-step process for exporting the entire database from Supabase to JSON format.

## Export Order Strategy

Due to foreign key constraints, tables must be exported in the following order to maintain referential integrity:

### Phase 1: Independent Tables (No Dependencies)
1. **RichText** - Contains text content in multiple formats
2. **User** - User authentication data from Clerk
3. **PrismaMigrations** - Migration history (optional for data migration)

### Phase 2: Dependent Tables
4. **Novel** - Depends on RichText
5. **Volume** - Depends on Novel
6. **Chapter** - Depends on Novel, Volume, and RichText

## Export Method Options

### Option A: Using SQL Queries (Recommended)
Execute SQL queries to export each table as JSON:

```sql
-- Export RichText table
SELECT json_agg(to_jsonb(r)) FROM "RichText" r;

-- Export User table
SELECT json_agg(to_jsonb(u)) FROM "User" u;

-- Export Novel table
SELECT json_agg(to_jsonb(n)) FROM "Novel" n;

-- Export Volume table
SELECT json_agg(to_jsonb(v)) FROM "Volume" v;

-- Export Chapter table
SELECT json_agg(to_jsonb(c)) FROM "Chapter" c;

-- Export PrismaMigrations table
SELECT json_agg(to_jsonb(pm)) FROM "_prisma_migrations" pm;
```

### Option B: Using pg_dump with JSON format
```bash
pg_dump --host=location.supabase.com \
        --port=5432 \
        --username=postgres.username \
        --dbname=postgres \
        --table=RichText \
        --data-only \
        --format=plain \
        --file=richtext.json
```

### Option C: Using Drizzle ORM Query
Create a Node.js script using Drizzle ORM to query and export data.

## Data Type Handling

### PostgreSQL to JSON Type Mapping
| PostgreSQL Type | JSON Type | Notes |
|----------------|-----------|--------|
| serial | number | Auto-incrementing integer |
| text | string | Text content |
| varchar | string | Variable-length string |
| boolean | boolean | True/false values |
| timestamp | string | ISO 8601 formatted datetime |
| double precision | number | Floating-point numbers |
| integer | number | Whole numbers |

### Special Considerations
- **Timestamps**: Will be exported as ISO 8601 strings
- **Enums**: Will be exported as string values
- **NULL values**: Will be represented as `null` in JSON
- **Arrays**: Not used in current schema

## Export File Structure

Each table will be exported to a separate JSON file:

```
database-export/
├── 01-richtext.json
├── 02-user.json
├── 03-prisma-migrations.json
├── 04-novel.json
├── 05-volume.json
└── 06-chapter.json
```

## Export Validation Checklist

Before proceeding with the export, verify:
- [ ] All database connections are working
- [ ] Sufficient disk space is available
- [ ] Export scripts have proper error handling
- [ ] Data integrity checks are in place
- [ ] Export logs are being captured

## Pre-Export Steps

1. **Create backup directory**
   ```bash
   mkdir -p database-export
   ```

2. **Verify database connectivity**
   ```bash
   psql "postgresql://username:password@location.pooler.supabase.com:5432/postgres" -c "SELECT version();"
   ```

3. **Check table row counts**
   ```sql
   SELECT 'RichText' as table_name, COUNT(*) as row_count FROM "RichText"
   UNION ALL
   SELECT 'User' as table_name, COUNT(*) as row_count FROM "User"
   UNION ALL
   SELECT 'Novel' as table_name, COUNT(*) as row_count FROM "Novel"
   UNION ALL
   SELECT 'Volume' as table_name, COUNT(*) as row_count FROM "Volume"
   UNION ALL
   SELECT 'Chapter' as table_name, COUNT(*) as row_count FROM "Chapter"
   UNION ALL
   SELECT '_prisma_migrations' as table_name, COUNT(*) as row_count FROM "_prisma_migrations";
   ```

## Post-Export Validation

After export, verify:
- [ ] All JSON files are valid JSON
- [ ] Row counts match between database and exported files
- [ ] Foreign key relationships are preserved
- [ ] Data types are correctly represented
- [ ] No data corruption occurred during export