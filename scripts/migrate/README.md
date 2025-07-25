# Database Migration Guide: Supabase to Neon PostgreSQL

This guide provides step-by-step instructions for migrating your PostgreSQL database from Supabase to Neon using the provided migration scripts.

## Overview

The migration process involves:
1. **Exporting** all data from Supabase as JSON files
2. **Importing** the data into Neon PostgreSQL
3. **Verifying** data integrity after migration
4. **Updating** application configuration to use the new database

## Prerequisites

### Environment Variables
Create or update your `.env.local` file with the following variables:

```bash
# Supabase (source database)
DIRECT_URL="postgresql://username:password@host:port/database?sslmode=require"

# Neon (target database)
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

### Required Packages
The migration scripts use the `pg` package for database connections. It should be installed automatically, but if needed:

```bash
npm install pg --legacy-peer-deps
```

## Migration Scripts

### 1. Export Script (`export-database.js`)
Exports all database tables to JSON files in the `coverage/database-export/` directory.

**Usage:**
```bash
npm run db:export
# or
node scripts/migrate/export-database.js
```

**Output:**
- `coverage/database-export/` directory with JSON files for each table
- `export-manifest.json` with row counts and metadata
- Console logs with progress information

### 2. Import Script (`import-database.js`)
Imports JSON files into the Neon PostgreSQL database.

**Usage:**
```bash
npm run db:import
# or
node scripts/migrate/import-database.js
```

**Features:**
- Automatic foreign key constraint handling
- Batch processing for large datasets
- Sequence value updates
- Data integrity verification

### 3. Migration Runner (`migrate.js`)
Coordinates the entire migration process with logging and error handling.

**Usage:**
```bash
# Run complete migration
npm run db:migrate:full

# Run individual steps
npm run db:migrate:export
npm run db:migrate:import
npm run db:migrate:verify
```

**Commands:**
- `export` - Export data from Supabase
- `import` - Import data to Neon
- `verify` - Verify data integrity
- `full` - Run complete migration
- `help` - Show help information

## Step-by-Step Migration Process

### Step 1: Pre-Migration Checklist
- [ ] Backup your Supabase database
- [ ] Set up Neon PostgreSQL database
- [ ] Configure environment variables
- [ ] Install required packages

### Step 2: Export Data
```bash
npm run db:export
```

**What happens:**
1. Connects to Supabase using DIRECT_URL
2. Exports all tables in dependency order
3. Creates JSON files for each table
4. Generates export manifest with row counts

### Step 3: Import Data
```bash
npm run db:import
```

**What happens:**
1. Connects to Neon using DATABASE_URL
2. Disables foreign key constraints
3. Truncates existing tables
4. Imports data from JSON files
5. Updates sequence values
6. Re-enables foreign key constraints
7. Generates import manifest

### Step 4: Verify Migration
```bash
npm run db:migrate:verify
```

**What happens:**
1. Compares row counts between export and import
2. Validates data integrity
3. Reports any discrepancies

### Step 5: Update Application Configuration
1. Update your application's database connection string
2. Test all functionality
3. Monitor for any issues

## Database Schema

The migration handles the following tables in the correct dependency order:

1. **_prisma_migrations** - Prisma migration history
2. **User** - User accounts
3. **RichText** - Rich text content
4. **Novel** - Novel information
5. **Volume** - Novel volumes
6. **Chapter** - Chapter content

## Troubleshooting

### Common Issues

#### Connection Errors
```
Error: connection to server failed
```
**Solution:** Check your environment variables and ensure the database URLs are correct.

#### Permission Errors
```
Error: permission denied for table
```
**Solution:** Ensure your database user has appropriate permissions for all tables.

#### Foreign Key Constraint Errors
```
Error: insert or update on table violates foreign key constraint
```
**Solution:** The import script automatically handles foreign key constraints. If issues persist, check data integrity.

### Rollback Process
If migration fails, you can:

1. **Restore from backup** (recommended)
2. **Re-run the migration** after fixing issues
3. **Manual intervention** for specific problems

### Log Files
All migration activities are logged to:
- `coverage/database-export/migration.log` - Main migration log
- `coverage/database-export/export-manifest.json` - Export metadata
- `coverage/database-export/import-manifest.json` - Import metadata

## Performance Considerations

### Large Datasets
- Data is processed in batches of 1000 rows
- Progress is displayed during import
- Memory usage is optimized for large tables

### Network Connectivity
- Ensure stable internet connection during migration
- Consider running migration during low-traffic periods

## Security Notes

- Never commit database credentials to version control
- Use environment variables for sensitive information
- Rotate database passwords after migration
- Review database permissions for the new Neon instance

## Support

If you encounter issues:
1. Check the log files for detailed error messages
2. Verify environment variables are correctly set
3. Ensure database connectivity
4. Review the troubleshooting section above

For additional help, consult the migration documentation in the `docs/download-db-json/` directory.