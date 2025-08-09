#!/usr/bin/env node

/**
 * Database Import Script
 * Imports JSON files into Neon PostgreSQL database
 *
 * Usage: node scripts/migrate/import-database.js
 */

require('dotenv').config({ path: '.env.local' });

const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const IMPORT_DIR = path.join(process.cwd(), 'coverage', 'database-export');
const TABLES = [
  { name: '_prisma_migrations', file: '03-prisma-migrations.json', sequence: null },
  { name: 'User', file: '02-user.json', sequence: 'User_id_seq' },
  { name: 'RichText', file: '01-richtext.json', sequence: 'RichText_id_seq' },
  { name: 'Novel', file: '04-novel.json', sequence: 'Novel_id_seq' },
  { name: 'Volume', file: '05-volume.json', sequence: 'Volume_id_seq' },
  { name: 'Chapter', file: '06-chapter.json', sequence: 'Chapter_id_seq' }
];

// Database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL
});

async function ensureImportDirectory() {
  try {
    await fs.access(IMPORT_DIR);
    console.log(`✅ Import directory found: ${IMPORT_DIR}`);
  } catch (error) {
    console.error(`❌ Import directory not found: ${IMPORT_DIR}`);
    console.error('   Please run the export script first');
    process.exit(1);
  }
}

async function loadJSONFile(fileName) {
  try {
    const filePath = path.join(IMPORT_DIR, fileName);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Failed to load ${fileName}:`, error.message);
    throw error;
  }
}

async function disableForeignKeyConstraints() {
  try {
    console.log('🔒 Disabling foreign key constraints...');
    await client.query('SET session_replication_role = replica');
    console.log('✅ Foreign key constraints disabled');
  } catch (error) {
    console.error('❌ Failed to disable foreign key constraints:', error.message);
    throw error;
  }
}

async function enableForeignKeyConstraints() {
  try {
    console.log('🔓 Enabling foreign key constraints...');
    await client.query('SET session_replication_role = DEFAULT');
    console.log('✅ Foreign key constraints enabled');
  } catch (error) {
    console.error('❌ Failed to enable foreign key constraints:', error.message);
    throw error;
  }
}

async function truncateTable(tableName) {
  try {
    console.log(`🗑️  Truncating ${tableName}...`);
    await client.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
    console.log(`   ✅ ${tableName} truncated`);
  } catch (error) {
    console.error(`❌ Failed to truncate ${tableName}:`, error.message);
    throw error;
  }
}

async function importTableFromJSON(tableName, fileName) {
  try {
    console.log(`📥 Importing ${tableName}...`);
    
    // Load JSON data
    const data = await loadJSONFile(fileName);
    
    if (!Array.isArray(data)) {
      throw new Error(`Invalid JSON format in ${fileName}: expected array`);
    }
    
    if (data.length === 0) {
      console.log(`   ⚠️  ${fileName} contains no data, skipping import`);
      return { tableName, rowCount: 0, status: 'skipped' };
    }
    
    // Truncate table before import
    await truncateTable(tableName);
    
    // Build column list from first row
    const columns = Object.keys(data[0]);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const insertQuery = `
      INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')})
      VALUES (${placeholders})
    `;
    
    // Import data in batches
    const batchSize = 1000;
    let importedCount = 0;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      await client.query('BEGIN');
      try {
        for (const row of batch) {
          const values = columns.map(col => row[col]);
          await client.query(insertQuery, values);
        }
        await client.query('COMMIT');
        importedCount += batch.length;
        console.log(`   📊 Imported ${importedCount}/${data.length} rows`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
    
    console.log(`   ✅ Imported ${importedCount} rows into ${tableName}`);
    return { tableName, rowCount: importedCount, status: 'success' };
  } catch (error) {
    console.error(`❌ Failed to import ${tableName}:`, error.message);
    throw error;
  }
}

async function updateSequence(sequenceName, tableName) {
  if (!sequenceName) return;
  
  try {
    console.log(`🔄 Updating sequence ${sequenceName}...`);
    
    const query = `
      SELECT setval('${sequenceName}', COALESCE((SELECT MAX(id) FROM "${tableName}"), 1), false)
    `;
    
    await client.query(query);
    console.log(`   ✅ Sequence ${sequenceName} updated`);
  } catch (error) {
    console.error(`❌ Failed to update sequence ${sequenceName}:`, error.message);
    throw error;
  }
}

async function validateEnvironment() {
  if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
    console.error('❌ DATABASE_URL or DIRECT_URL environment variable is required');
    console.error('   Please set the environment variable before running this script');
    process.exit(1);
  }
  
  console.log('✅ Environment variables validated');
}

async function verifyImport(results) {
  console.log('\n🔍 Verifying import...');
  
  for (const { name } of TABLES) {
    try {
      const result = await client.query(`SELECT COUNT(*) FROM "${name}"`);
      const count = parseInt(result.rows[0].count);
      console.log(`   ${name}: ${count} rows`);
    } catch (error) {
      console.error(`   ❌ Failed to verify ${name}:`, error.message);
    }
  }
}

async function createImportManifest(results) {
  const manifest = {
    importDate: new Date().toISOString(),
    databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not configured',
    tables: results,
    totalRows: results.reduce((sum, r) => sum + r.rowCount, 0)
  };
  
  await fs.writeFile(
    path.join(IMPORT_DIR, 'import-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log('📋 Import manifest created: import-manifest.json');
}

async function main() {
  console.log('🚀 Starting database import...\n');
  
  try {
    // Validate environment
    await validateEnvironment();
    
    // Ensure import directory exists
    await ensureImportDirectory();
    
    // Connect to database
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Database connection established');
    
    // Disable foreign key constraints
    await disableForeignKeyConstraints();
    
    // Import all tables
    const results = [];
    for (const { name, file, sequence } of TABLES) {
      const result = await importTableFromJSON(name, file);
      results.push(result);
      
      // Update sequence if needed
      if (result.status === 'success' && result.rowCount > 0) {
        await updateSequence(sequence, name);
      }
    }
    
    // Enable foreign key constraints
    await enableForeignKeyConstraints();
    
    // Verify import
    await verifyImport(results);
    
    // Create import manifest
    await createImportManifest(results);
    
    // Summary
    console.log('\n📊 Import Summary:');
    console.log('=================');
    results.forEach(result => {
      console.log(`${result.tableName}: ${result.rowCount} rows imported`);
    });
    console.log(`\nTotal rows imported: ${results.reduce((sum, r) => sum + r.rowCount, 0)}`);
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    
    // Attempt to re-enable constraints on failure
    try {
      await enableForeignKeyConstraints();
    } catch (rollbackError) {
      console.error('❌ Failed to re-enable constraints:', rollbackError.message);
    }
    
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

// Run the import
if (require.main === module) {
  main();
}

module.exports = { importTableFromJSON, disableForeignKeyConstraints, enableForeignKeyConstraints };