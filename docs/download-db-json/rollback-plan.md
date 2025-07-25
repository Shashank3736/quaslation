# Database Migration Rollback Plan

This document provides a comprehensive rollback strategy for the database migration from Supabase to Neon PostgreSQL.

## Rollback Triggers

### Immediate Rollback Triggers
- **Data corruption detected** during import process
- **Foreign key constraint violations** that cannot be resolved
- **Application connectivity failures** after migration
- **Performance degradation** exceeding acceptable thresholds
- **Data loss** or **incomplete data transfer**

### Delayed Rollback Triggers
- **User-reported issues** within 24-48 hours post-migration
- **System instability** or **unexpected errors**
- **Third-party integration failures**

## Rollback Strategy Options

### Option 1: Immediate Rollback (Hot Rollback)
**Use when**: Critical issues detected during migration
**Process**:
1. **Stop application** immediately
2. **Revert database configuration** to Supabase
3. **Resume application** with original database
4. **Investigate issues** offline

### Option 2: Staged Rollback (Cold Rollback)
**Use when**: Issues discovered post-migration
**Process**:
1. **Schedule maintenance window**
2. **Create backup** of current Neon state
3. **Revert database configuration** to Supabase
4. **Test application** thoroughly
5. **Resume service**

### Option 3: Partial Rollback (Selective Rollback)
**Use when**: Specific tables have issues
**Process**:
1. **Identify problematic tables**
2. **Re-export specific tables** from Supabase
3. **Re-import specific tables** to Neon
4. **Verify data integrity**

## Pre-Migration Backup Strategy

### 1. Supabase Backup
```bash
# Create full database backup
pg_dump "postgresql://postres_url_string" \
  --format=custom \
  --file=supabase-backup-$(date +%Y%m%d-%H%M%S).dump \
  --verbose \
  --no-owner \
  --no-privileges
```

### 2. Application State Backup
```bash
# Backup current configuration
cp .env.local .env.local.backup.$(date +%Y%m%d-%H%M%S)

# Backup application code
git tag pre-migration-$(date +%Y%m%d-%H%M%S)
git push origin pre-migration-$(date +%Y%m%d-%H%M%S)
```

### 3. Configuration Backup
Create backup of:
- [ ] Environment variables
- [ ] Database connection strings
- [ ] Application configuration files
- [ ] SSL certificates
- [ ] API keys and secrets

## Rollback Procedures

### Phase 1: Pre-Rollback Assessment
1. **Assess severity** of the issue
2. **Determine rollback scope** (full/partial)
3. **Estimate downtime** required
4. **Notify stakeholders**
5. **Prepare rollback team**

### Phase 2: Rollback Execution

#### For Immediate Rollback:
```bash
# 1. Stop application
pm2 stop quaslation-app

# 2. Revert database configuration
cp .env.local.backup.$(date +%Y%m%d-%H%M%S) .env.local

# 3. Restart application
pm2 start quaslation-app

# 4. Verify connectivity
curl -f http://localhost:3000/api/health
```

#### For Staged Rollback:
```bash
# 1. Create current state backup
pg_dump "postgresql://neondb_owner:password@ep-cool-darkness-123456.us-east-1.aws.neon.tech/neondb" \
  --format=custom \
  --file=neon-backup-$(date +%Y%m%d-%H%M%S).dump

# 2. Restore Supabase backup
pg_restore "postgresql://postgres.ayplstxuxzdnzxgkvlwc:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres" \
  --clean \
  --no-owner \
  --no-privileges \
  supabase-backup-$(date +%Y%m%d-%H%M%S).dump

# 3. Update application configuration
# 4. Test application
# 5. Resume service
```

### Phase 3: Post-Rollback Verification

#### Data Integrity Checks
```sql
-- Verify row counts match pre-migration
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
-- (Run the same validation queries as in import process)
```

#### Application Testing
- [ ] User authentication works
- [ ] Novel creation/editing works
- [ ] Chapter management works
- [ ] Rich text content displays correctly
- [ ] Search functionality works
- [ ] API endpoints respond correctly

## Rollback Decision Matrix

| Issue Type | Severity | Rollback Type | Downtime | Stakeholder Approval |
|------------|----------|---------------|----------|---------------------|
| Data Loss | Critical | Immediate | 5-15 min | Not required |
| Security Breach | Critical | Immediate | 5-15 min | Not required |
| Performance | High | Staged | 30-60 min | Required |
| Feature Bugs | Medium | Staged | 30-60 min | Required |
| Minor Issues | Low | Partial | 15-30 min | Required |

## Communication Plan

### Rollback Notification Timeline

#### Immediate Rollback
- **T+0**: Issue detected
- **T+1**: Technical team notified
- **T+2**: Decision made to rollback
- **T+3**: Rollback executed
- **T+5**: Service restored
- **T+10**: Stakeholders notified

#### Staged Rollback
- **T+0**: Issue discovered
- **T+30**: Impact assessment complete
- **T+60**: Stakeholder approval obtained
- **T+90**: Maintenance window scheduled
- **T+120**: Rollback executed
- **T+150**: Service restored

### Communication Channels
- **Internal**: Slack #incidents channel
- **External**: Status page update
- **Email**: Stakeholder notification
- **Phone**: Critical stakeholder escalation

## Rollback Testing

### Pre-Migration Testing
1. **Test rollback procedures** on staging environment
2. **Verify backup integrity** and restoration process
3. **Measure rollback time** for different scenarios
4. **Document lessons learned**

### Post-Migration Testing
1. **Schedule rollback drills** monthly for first 3 months
2. **Update rollback procedures** based on findings
3. **Train team** on rollback procedures

## Rollback Tools and Scripts

### Automated Rollback Script
```bash
#!/bin/bash
# rollback.sh - Automated rollback script

BACKUP_DATE=$1
ROLLBACK_TYPE=$2

case $ROLLBACK_TYPE in
  "immediate")
    echo "Executing immediate rollback..."
    # Immediate rollback logic
    ;;
  "staged")
    echo "Executing staged rollback..."
    # Staged rollback logic
    ;;
  "partial")
    echo "Executing partial rollback..."
    # Partial rollback logic
    ;;
esac
```

### Rollback Checklist
- [ ] Backup current state
- [ ] Stop application
- [ ] Restore database
- [ ] Update configuration
- [ ] Test application
- [ ] Resume service
- [ ] Notify stakeholders
- [ ] Document incident

## Rollback Success Criteria

### Technical Criteria
- [ ] All data restored successfully
- [ ] Application functionality verified
- [ ] Performance metrics within acceptable range
- [ ] No data corruption detected

### Business Criteria
- [ ] Service restored within SLA
- [ ] User impact minimized
- [ ] Stakeholder communication completed
- [ ] Post-incident review scheduled

## Rollback Timeline

| Phase | Duration | Activities |
|-------|----------|------------|
| Assessment | 5-15 min | Issue identification and impact assessment |
| Decision | 2-5 min | Rollback decision and approval |
| Execution | 10-30 min | Actual rollback process |
| Verification | 10-15 min | Testing and validation |
| Communication | 5-10 min | Stakeholder notification |
| **Total** | **30-75 min** | **Complete rollback process** |