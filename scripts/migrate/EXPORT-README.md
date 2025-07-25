# Supabase Database Export Guide

This guide provides instructions for exporting your PostgreSQL database from Supabase as JSON files.

## Overview

The export process involves:
1. **Exporting** all data from Supabase as JSON files
2. **Verifying** the integrity of exported data
3. **Storing** the exported files for backup or migration purposes

## Prerequisites

### Environment Variables
Create or update your `.env.local` file with the following variable:

```bash
# Supabase (source database)
DIRECT_URL="postgresql://username:password@host:port/database?sslmode=require"
```

### Required Packages
The export script uses the `pg` package for database connections:

```bash
npm install pg --legacy-peer-deps
```

## Export Scripts

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

### 2. Verification Script (`verify-export.js`)
Verifies the integrity of exported JSON files.

**Usage:**
```bash
npm run db:verify
# or
node scripts/migrate/verify-export.js
```

## Database Schema

The export handles the following tables in the correct dependency order:

1. **_prisma_migrations** - Prisma migration history
2. **User** - User accounts
3. **RichText** - Rich text content
4. **Novel** - Novel information
5. **Volume** - Novel volumes
6. **Chapter** - Chapter content

## Step-by-Step Export Process

### Step 1: Pre-Export Checklist
- [ ] Backup your Supabase database
- [ ] Set up environment variables
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

### Step 3: Verify Export
```bash
npm run db:verify
```

**What happens:**
1. Validates JSON file structure
2. Checks row counts and data integrity
3. Generates verification report
4. Reports any discrepancies

## Exported Files

The export process creates the following files in the `coverage/database-export/` directory:

- `01-richtext.json` - RichText table data
- `02-user.json` - User table data
- `03-prisma-migrations.json` - Prisma migration history
- `04-novel.json` - Novel table data
- `05-volume.json` - Volume table data
- `06-chapter.json` - Chapter table data
- `export-manifest.json` - Export metadata and row counts
- `verification-report.json` - Data integrity verification report (after running verification)

## Troubleshooting

### Common Issues

#### Connection Errors
```
Error: connection to server failed
```
**Solution:** Check your environment variables and ensure the database URL is correct.

#### Permission Errors
```
Error: permission denied for table
```
**Solution:** Ensure your database user has SELECT permissions for all tables.

### Log Files
All export activities are logged to:
- `coverage/database-export/export-manifest.json` - Export metadata
- `coverage/database-export/verification-report.json` - Verification results (after running verification)

## Performance Considerations

### Large Datasets
- Data is processed in batches of 1000 rows
- Progress is displayed during export
- Memory usage is optimized for large tables

### Network Connectivity
- Ensure stable internet connection during export
- Consider running export during low-traffic periods

## Security Notes

- Never commit database credentials to version control
- Use environment variables for sensitive information
- Store exported files securely
- Consider encrypting exported data if it contains sensitive information

## Support

If you encounter issues:
1. Check the log files for detailed error messages
2. Verify environment variables are correctly set
3. Ensure database connectivity
4. Review the troubleshooting section above