#!/usr/bin/env node

/**
 * Database Export Script
 * Exports all tables from Supabase PostgreSQL to JSON files
 *
 * Usage: node scripts/migrate/export-database.js
 */

const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Configuration
const EXPORT_DIR = path.join(process.cwd(), 'coverage', 'database-export');
const TABLES = [
  { name: 'RichText', file: '01-richtext.json' },
  { name: 'User', file: '02-user.json' },
  { name: '_prisma_migrations', file: '03-prisma-migrations.json' },
  { name: 'Novel', file: '04-novel.json' },
  { name: 'Volume', file: '05-volume.json' },
  { name: 'Chapter', file: '06-chapter.json' }
];

// Database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL
});

async function ensureExportDirectory() {
  try {
    await fs.mkdir(EXPORT_DIR, { recursive: true });
    console.log(`✅ Export directory created: ${EXPORT_DIR}`);
  } catch (error) {
    console.error('❌ Failed to create export directory:', error.message);
    throw error;
  }
}

async function getTableRowCount(tableName) {
  try {
    const result = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error(`❌ Failed to get row count for ${tableName}:`, error.message);
    throw error;
  }
}

async function exportTableToJSON(tableName, fileName) {
  try {
    console.log(`📊 Exporting ${tableName}...`);
    
    // Get row count
    const rowCount = await getTableRowCount(tableName);
    console.log(`   Found ${rowCount} rows in ${tableName}`);
    
    if (rowCount === 0) {
      console.log(`   ⚠️  ${tableName} is empty, creating empty JSON file`);
      await fs.writeFile(
        path.join(EXPORT_DIR, fileName),
        JSON.stringify([], null, 2)
      );
      return { tableName, rowCount, fileName, status: 'empty' };
    }
    
    // Export data as JSON
    const query = `SELECT row_to_json(t) FROM "${tableName}" t`;
    const result = await client.query(query);
    
    const data = result.rows.map(row => row.row_to_json);
    
    // Write to file
    const filePath = path.join(EXPORT_DIR, fileName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    console.log(`   ✅ Exported ${data.length} rows to ${fileName}`);
    
    return { tableName, rowCount: data.length, fileName, status: 'success' };
  } catch (error) {
    console.error(`❌ Failed to export ${tableName}:`, error.message);
    throw error;
  }
}

async function createExportManifest(results) {
  const manifest = {
    exportDate: new Date().toISOString(),
    databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not configured',
    tables: results,
    totalRows: results.reduce((sum, r) => sum + r.rowCount, 0)
  };
  
  await fs.writeFile(
    path.join(EXPORT_DIR, 'export-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log('📋 Export manifest created: export-manifest.json');
}

async function validateEnvironment() {
  if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
    console.error('❌ DATABASE_URL or DIRECT_URL environment variable is required');
    console.error('   Please set the environment variable before running this script');
    process.exit(1);
  }
  
  console.log('✅ Environment variables validated');
}

async function main() {
  console.log('🚀 Starting database export...\n');
  
  try {
    // Validate environment
    await validateEnvironment();
    
    // Ensure export directory exists
    await ensureExportDirectory();
    
    // Connect to database
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Database connection established');
    
    // Export all tables
    const results = [];
    for (const { name, file } of TABLES) {
      const result = await exportTableToJSON(name, file);
      results.push(result);
    }
    
    // Create export manifest
    await createExportManifest(results);
    
    // Summary
    console.log('\n📊 Export Summary:');
    console.log('=================');
    results.forEach(result => {
      console.log(`${result.tableName}: ${result.rowCount} rows → ${result.fileName}`);
    });
    console.log(`\nTotal rows exported: ${results.reduce((sum, r) => sum + r.rowCount, 0)}`);
    console.log(`Export location: ${EXPORT_DIR}`);
    
  } catch (error) {
    console.error('\n❌ Export failed:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    if (client) {
      await client.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

// Run the export
if (require.main === module) {
  main();
}

module.exports = { exportTableToJSON, ensureExportDirectory };