# Database Migration Checklist

This comprehensive checklist ensures all steps are completed for a successful database migration from Supabase to Neon PostgreSQL.

## Pre-Migration Phase

### 1. Environment Setup
- [ ] **Neon account created** with appropriate permissions
- [ ] **Neon project provisioned** for quaslation database
- [ ] **Connection strings obtained** for Neon database
- [ ] **Local development environment** configured for testing
- [ ] **Staging environment** set up for testing migration

### 2. Backup Creation
- [ ] **Full Supabase backup** created using pg_dump
- [ ] **Application configuration backup** created
- [ ] **Environment variables backup** created
- [ ] **Git repository tagged** with pre-migration state
- [ ] **Backup integrity verified** with test restore

### 3. Documentation Review
- [ ] **Database schema documentation** reviewed and updated
- [ ] **Export process plan** reviewed and approved
- [ ] **Import process plan** reviewed and approved
- [ ] **Rollback plan** reviewed and tested
- [ ] **Team briefed** on migration process

### 4. Testing Environment
- [ ] **Staging Neon database** created
- [ ] **Test data populated** in staging environment
- [ ] **Migration scripts tested** on staging data
- [ ] **Application tested** with staging Neon database
- [ ] **Performance benchmarks** established

## Export Phase

### 5. Data Export Preparation
- [ ] **Export directory created** with proper permissions
- [ ] **Export scripts prepared** and tested
- [ ] **Database connectivity verified** to Supabase
- [ ] **Row counts documented** for each table
- [ ] **Export logs configured** for monitoring

### 6. Table Export Execution
Export tables in the following order:

#### Phase 1: Independent Tables
- [ ] **RichText table exported** to `01-richtext.json`
- [ ] **User table exported** to `02-user.json`
- [ ] **PrismaMigrations table exported** to `03-prisma-migrations.json`

#### Phase 2: Dependent Tables
- [ ] **Novel table exported** to `04-novel.json`
- [ ] **Volume table exported** to `05-volume.json`
- [ ] **Chapter table exported** to `06-chapter.json`

### 7. Export Validation
- [ ] **JSON file integrity verified** for all exports
- [ ] **Row counts match** between database and JSON files
- [ ] **Data format validation** completed
- [ ] **Foreign key relationships preserved** in export
- [ ] **Export logs reviewed** for errors

## Import Phase

### 8. Neon Database Setup
- [ ] **Neon database created** with appropriate sizing
- [ ] **Database schema created** matching Supabase structure
- [ ] **User permissions configured** for application access
- [ ] **Connection pooling enabled** for performance
- [ ] **SSL certificates configured** for secure connections

### 9. Data Import Execution
Import tables in the following order:

#### Phase 1: Schema and Setup
- [ ] **Foreign key constraints disabled** temporarily
- [ ] **Sequences reset** to appropriate starting values

#### Phase 2: Data Import
- [ ] **PrismaMigrations imported** from `03-prisma-migrations.json`
- [ ] **User table imported** from `02-user.json`
- [ ] **RichText table imported** from `01-richtext.json`
- [ ] **Novel table imported** from `04-novel.json`
- [ ] **Volume table imported** from `05-volume.json`
- [ ] **Chapter table imported** from `06-chapter.json`

#### Phase 3: Final Setup
- [ ] **Foreign key constraints re-enabled**
- [ ] **Sequences updated** to correct values
- [ ] **Indexes rebuilt** for optimal performance

### 10. Import Validation
- [ ] **Row counts verified** for all tables
- [ ] **Foreign key relationships validated**
- [ ] **Data integrity checks** completed
- [ ] **Sample queries executed** to verify data
- [ ] **Performance testing** conducted

## Application Migration

### 11. Configuration Update
- [ ] **Environment variables updated** for Neon connection
- [ ] **Database connection strings** updated
- [ ] **SSL configuration verified** for Neon
- [ ] **Connection pooling settings** updated
- [ ] **Application configuration tested**

### 12. Application Testing
- [ ] **Unit tests executed** and passing
- [ ] **Integration tests executed** and passing
- [ ] **End-to-end tests executed** and passing
- [ ] **Performance tests executed** and acceptable
- [ ] **User acceptance testing** completed

### 13. Production Deployment
- [ ] **Maintenance window scheduled** and communicated
- [ ] **Production deployment executed** during window
- [ ] **Smoke tests executed** post-deployment
- [ ] **Monitoring alerts configured** for new database
- [ ] **Rollback plan activated** if issues detected

## Post-Migration Phase

### 14. Monitoring and Validation
- [ ] **Application performance monitored** for 24-48 hours
- [ ] **Database performance monitored** for 24-48 hours
- [ ] **Error rates monitored** for anomalies
- [ ] **User feedback collected** and reviewed
- [ ] **System logs reviewed** for issues

### 15. Cleanup and Optimization
- [ ] **Old Supabase database** marked for retention period
- [ ] **Backup files archived** with appropriate retention
- [ ] **Migration scripts archived** for future reference
- [ ] **Documentation updated** with lessons learned
- [ ] **Team retrospective** conducted

## Validation Queries

### Row Count Validation
```sql
-- Verify row counts match between source and target
SELECT 'RichText' as table_name, COUNT(*) as row_count FROM "RichText"
UNION ALL
SELECT 'User' as table_name, COUNT(*) as row_count FROM "User"
UNION ALL
SELECT 'Novel' as table_name, COUNT(*) as row_count FROM "Novel"
UNION ALL
SELECT 'Volume' as table_name, COUNT(*) as row_count FROM "Volume"
UNION ALL
SELECT 'Chapter' as table_name, COUNT(*) as row_count FROM "Chapter";
```

### Foreign Key Validation
```sql
-- Verify all foreign key relationships
SELECT COUNT(*) as orphaned_novels 
FROM "Novel" WHERE "richTextId" NOT IN (SELECT id FROM "RichText");

SELECT COUNT(*) as orphaned_volumes 
FROM "Volume" WHERE "novelId" NOT IN (SELECT id FROM "Novel");

SELECT COUNT(*) as orphaned_chapters 
FROM "Chapter" WHERE "novelId" NOT IN (SELECT id FROM "Novel");
```

### Data Integrity Validation
```sql
-- Verify sample data
SELECT COUNT(*) FROM "Novel" WHERE title IS NOT NULL;
SELECT COUNT(*) FROM "Chapter" WHERE title IS NOT NULL;
SELECT COUNT(*) FROM "User" WHERE "clerkId" IS NOT NULL;
```

## Emergency Contacts

### Technical Team
- **Database Administrator**: [Contact Info]
- **Lead Developer**: [Contact Info]
- **DevOps Engineer**: [Contact Info]
- **On-call Engineer**: [Contact Info]

### Service Providers
- **Neon Support**: support@neon.tech
- **Supabase Support**: support@supabase.io
- **Cloud Provider Support**: [Contact Info]

## Success Criteria

### Technical Success
- [ ] **Zero data loss** during migration
- [ ] **All foreign key relationships** preserved
- [ ] **Application performance** meets or exceeds previous levels
- [ ] **Database uptime** maintained throughout migration
- [ ] **Rollback capability** tested and verified

### Business Success
- [ ] **User experience** maintained or improved
- [ ] **No customer complaints** related to migration
- [ ] **Performance improvements** realized
- [ ] **Cost optimization** achieved with Neon
- [ ] **Team confidence** in new infrastructure

## Timeline

| Phase | Duration | Activities |
|-------|----------|------------|
| Pre-Migration | 2-4 hours | Setup, backup, testing |
| Export | 1-2 hours | Data extraction |
| Import | 2-4 hours | Data loading, validation |
| Application Migration | 1-2 hours | Configuration, testing |
| Post-Migration | 24-48 hours | Monitoring, optimization |
| **Total** | **30-60 hours** | **Complete migration** |

## Risk Mitigation

### High-Risk Items
- **Data corruption**: Multiple backups and validation steps
- **Extended downtime**: Staged migration with rollback capability
- **Performance issues**: Comprehensive testing and monitoring
- **Integration failures**: Staging environment validation

### Contingency Plans
- **Rollback within 30 minutes** if critical issues
- **Parallel systems** during transition period
- **Expert consultation** available if needed
- **Emergency support** from service providers