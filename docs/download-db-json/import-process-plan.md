# Database Import Process Plan

This document outlines the step-by-step process for importing the exported JSON data into Neon PostgreSQL.

## Import Order Strategy

Due to foreign key constraints, tables must be imported in the **reverse order** of export to maintain referential integrity:

### Phase 1: Create Schema Structure
1. **Create database schema** - All tables with proper constraints
2. **Disable foreign key constraints** - Temporarily for data import

### Phase 2: Import Data in Dependency Order
3. **PrismaMigrations** - Migration history (optional)
4. **User** - User authentication data
5. **RichText** - Text content in multiple formats
6. **Novel** - Depends on RichText
7. **Volume** - Depends on Novel
8. **Chapter** - Depends on Novel, Volume, and RichText

### Phase 3: Final Validation
9. **Re-enable foreign key constraints**
10. **Verify data integrity**
11. **Update sequences for auto-incrementing IDs**

## Neon PostgreSQL Setup

### 1. Create Neon Project
```bash
# Via Neon CLI or Web Interface
neonctl projects create --name quaslation-migration
```

### 2. Get Connection String
```bash
# Format: postgresql://username:password@host:port/database
# Example: postgresql://neondb_owner:password@ep-cool-darkness-123456.us-east-1.aws.neon.tech/neondb
```

### 3. Create Database Schema
```sql
-- Run the schema creation script from your project
-- This should match your current Drizzle schema
```

## Import Method Options

### Option A: Using psql COPY (Recommended)
```bash
# Import each JSON file
psql "postgresql://neondb_owner:password@ep-cool-darkness-123456.us-east-1.aws.neon.tech/neondb" -c "\i import-script.sql"
```

### Option B: Using Node.js Script with Drizzle
Create a Node.js script that:
1. Reads JSON files
2. Maps data to correct types
3. Inserts data with proper ID handling
4. Handles foreign key relationships

### Option C: Using SQL INSERT statements
Generate SQL INSERT statements from JSON data.

## Data Type Mapping (JSON to PostgreSQL)

| JSON Type | PostgreSQL Type | Notes |
|-----------|----------------|--------|
| string | text/varchar | Direct mapping |
| number | integer/serial | Handle auto-increment |
| boolean | boolean | Direct mapping |
| string (ISO 8601) | timestamp | Parse datetime strings |
| null | NULL | Direct mapping |

## Import Script Structure

### 1. Schema Creation Script
```sql
-- Create all tables with proper constraints
-- This should match your Drizzle schema exactly
```

### 2. Data Import Script
```sql
-- Disable constraints temporarily
SET session_replication_role = replica;

-- Import data in correct order
\i 01-prisma-migrations.sql
\i 02-user.sql
\i 03-richtext.sql
\i 04-novel.sql
\i 05-volume.sql
\i 06-chapter.sql

-- Re-enable constraints
SET session_replication_role = DEFAULT;

-- Update sequences for auto-incrementing IDs
SELECT setval('"RichText_id_seq"', (SELECT MAX(id) FROM "RichText"));
SELECT setval('"User_id_seq"', (SELECT MAX(id) FROM "User"));
SELECT setval('"Novel_id_seq"', (SELECT MAX(id) FROM "Novel"));
SELECT setval('"Volume_id_seq"', (SELECT MAX(id) FROM "Volume"));
SELECT setval('"Chapter_id_seq"', (SELECT MAX(id) FROM "Chapter"));
```

## ID Handling Strategy

### Auto-incrementing IDs
- **RichText**: id (serial)
- **User**: id (serial)
- **Novel**: id (serial)
- **Volume**: id (serial)
- **Chapter**: id (serial)

### Foreign Key Relationships
- **Novel.richTextId** → **RichText.id**
- **Novel.authorId** → **User.id**
- **Volume.novelId** → **Novel.id**
- **Chapter.novelId** → **Novel.id**
- **Chapter.volumeId** → **Volume.id**
- **Chapter.richTextId** → **RichText.id**

## Import Validation Checklist

### Pre-Import
- [ ] Neon PostgreSQL database is created and accessible
- [ ] Database schema is created with proper constraints
- [ ] All JSON files are validated and accessible
- [ ] Import scripts are tested on a staging environment
- [ ] Backup of target database is created

### During Import
- [ ] Foreign key constraints are temporarily disabled
- [ ] Data is imported in correct dependency order
- [ ] Import progress is logged
- [ ] Errors are captured and handled
- [ ] Row counts are verified after each table import

### Post-Import
- [ ] Foreign key constraints are re-enabled
- [ ] All sequences are updated to correct values
- [ ] Row counts match between source and target
- [ ] Sample data queries return expected results
- [ ] Application connectivity is tested

## Error Handling

### Common Issues
1. **Foreign key violations**: Ensure import order is correct
2. **Duplicate IDs**: Handle auto-increment sequences properly
3. **Data type mismatches**: Verify JSON to PostgreSQL type mapping
4. **Connection timeouts**: Use connection pooling for large datasets

### Recovery Procedures
1. **Rollback plan**: Restore from backup if import fails
2. **Partial import**: Resume from failed table
3. **Data validation**: Compare row counts and sample data

## Performance Optimization

### Batch Processing
- Import data in batches of 1000-5000 rows
- Use transactions for each batch
- Monitor memory usage during import

### Connection Management
- Use connection pooling
- Set appropriate connection timeouts
- Monitor connection limits on Neon

## Testing Strategy

### 1. Staging Environment
- Test import process on a staging Neon database
- Verify data integrity with sample queries
- Test application functionality

### 2. Data Validation Queries
```sql
-- Verify row counts
SELECT 'RichText' as table_name, COUNT(*) as row_count FROM "RichText"
UNION ALL
SELECT 'User' as table_name, COUNT(*) as row_count FROM "User"
UNION ALL
SELECT 'Novel' as table_name, COUNT(*) as row_count FROM "Novel"
UNION ALL
SELECT 'Volume' as table_name, COUNT(*) as row_count FROM "Volume"
UNION ALL
SELECT 'Chapter' as table_name, COUNT(*) as row_count FROM "Chapter";

-- Verify foreign key relationships
SELECT COUNT(*) FROM "Novel" WHERE "richTextId" NOT IN (SELECT id FROM "RichText");
SELECT COUNT(*) FROM "Novel" WHERE "authorId" NOT IN (SELECT id FROM "User");
SELECT COUNT(*) FROM "Volume" WHERE "novelId" NOT IN (SELECT id FROM "Novel");
SELECT COUNT(*) FROM "Chapter" WHERE "novelId" NOT IN (SELECT id FROM "Novel");
SELECT COUNT(*) FROM "Chapter" WHERE "volumeId" NOT IN (SELECT id FROM "Volume");
SELECT COUNT(*) FROM "Chapter" WHERE "richTextId" NOT IN (SELECT id FROM "RichText");