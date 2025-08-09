#!/usr/bin/env node

/**
 * Complete Database Migration Runner
 * Coordinates the entire migration process from Supabase to Neon
 * 
 * Usage: node scripts/migrate/migrate.js [command]
 * 
 * Commands:
 *   export    - Export data from Supabase
 *   import    - Import data to Neon
 *   verify    - Verify data integrity
 *   full      - Run complete migration (export + import + verify)
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Configuration
const EXPORT_DIR = path.join(process.cwd(), 'coverage', 'database-export');
const LOG_FILE = path.join(EXPORT_DIR, 'migration.log');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Logging utility
class Logger {
  constructor() {
    this.ensureLogFile();
  }

  async ensureLogFile() {
    try {
      await fs.mkdir(EXPORT_DIR, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  async log(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    
    // Console output
    const color = {
      info: colors.cyan,
      success: colors.green,
      warning: colors.yellow,
      error: colors.red
    }[level] || colors.reset;
    
    console.log(`${color}${message}${colors.reset}`);
    
    // File output
    try {
      await fs.appendFile(LOG_FILE, logEntry);
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }

  info(message) { this.log('info', message); }
  success(message) { this.log('success', message); }
  warning(message) { this.log('warning', message); }
  error(message) { this.log('error', message); }
}

const logger = new Logger();

// Utility functions
async function runCommand(command, args = [], env = {}) {
  return new Promise((resolve, reject) => {
    const fullEnv = { ...process.env, ...env };
    
    logger.info(`Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: fullEnv,
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function checkEnvironment() {
  logger.info('🔍 Checking environment...');
  
  const requiredEnvVars = ['DATABASE_URL', 'DIRECT_URL'];
  const missing = requiredEnvVars.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    logger.error(`❌ Missing environment variables: ${missing.join(', ')}`);
    logger.error('   Please set these in your .env.local file');
    return false;
  }
  
  logger.success('✅ Environment variables configured');
  return true;
}

async function checkExportDirectory() {
  try {
    await fs.access(EXPORT_DIR);
    logger.success('✅ Export directory exists');
    return true;
  } catch (error) {
    logger.warning('⚠️  Export directory does not exist');
    return false;
  }
}

async function exportData() {
  logger.info('\n📤 Starting data export...');
  
  try {
    await runCommand('node', ['scripts/migrate/export-database.js']);
    logger.success('✅ Data export completed successfully');
    return true;
  } catch (error) {
    logger.error(`❌ Data export failed: ${error.message}`);
    return false;
  }
}

async function importData() {
  logger.info('\n📥 Starting data import...');
  
  try {
    await runCommand('node', ['scripts/migrate/import-database.js']);
    logger.success('✅ Data import completed successfully');
    return true;
  } catch (error) {
    logger.error(`❌ Data import failed: ${error.message}`);
    return false;
  }
}

async function verifyData() {
  logger.info('\n🔍 Starting data verification...');
  
  try {
    // Check if export directory exists
    const exportExists = await checkExportDirectory();
    if (!exportExists) {
      logger.error('❌ Export directory not found. Please run export first.');
      return false;
    }
    
    // Check manifest files
    const exportManifestPath = path.join(EXPORT_DIR, 'export-manifest.json');
    const importManifestPath = path.join(EXPORT_DIR, 'import-manifest.json');
    
    let exportManifest = null;
    let importManifest = null;
    
    try {
      const exportData = await fs.readFile(exportManifestPath, 'utf8');
      exportManifest = JSON.parse(exportData);
      logger.success('✅ Export manifest found');
    } catch (error) {
      logger.error('❌ Export manifest not found. Please run export first.');
      return false;
    }
    
    try {
      const importData = await fs.readFile(importManifestPath, 'utf8');
      importManifest = JSON.parse(importData);
      logger.success('✅ Import manifest found');
    } catch (error) {
      logger.warning('⚠️  Import manifest not found. Run import first.');
    }
    
    // Compare row counts
    if (exportManifest && importManifest) {
      logger.info('\n📊 Comparing row counts...');
      
      let allMatch = true;
      
      for (const exportTable of exportManifest.tables) {
        const importTable = importManifest.tables.find(t => t.tableName === exportTable.tableName);
        
        if (!importTable) {
          logger.error(`❌ ${exportTable.tableName}: Not found in import`);
          allMatch = false;
          continue;
        }
        
        if (exportTable.rowCount === importTable.rowCount) {
          logger.success(`✅ ${exportTable.tableName}: ${exportTable.rowCount} rows (match)`);
        } else {
          logger.error(`❌ ${exportTable.tableName}: Export ${exportTable.rowCount}, Import ${importTable.rowCount}`);
          allMatch = false;
        }
      }
      
      if (allMatch) {
        logger.success('\n🎉 All row counts match! Data integrity verified.');
      } else {
        logger.error('\n❌ Row count mismatch detected.');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    logger.error(`❌ Data verification failed: ${error.message}`);
    return false;
  }
}

async function runFullMigration() {
  logger.info('\n🚀 Starting full database migration...');
  
  const steps = [
    { name: 'Environment Check', fn: checkEnvironment },
    { name: 'Data Export', fn: exportData },
    { name: 'Data Import', fn: importData },
    { name: 'Data Verification', fn: verifyData }
  ];
  
  let success = true;
  
  for (const step of steps) {
    logger.info(`\n${colors.bright}${colors.cyan}=== ${step.name} ===${colors.reset}`);
    
    const result = await step.fn();
    if (!result) {
      logger.error(`❌ Migration failed at step: ${step.name}`);
      success = false;
      break;
    }
    
    logger.success(`✅ ${step.name} completed successfully`);
  }
  
  if (success) {
    logger.success('\n🎉 Full migration completed successfully!');
    logger.info(`📋 Check the log file: ${LOG_FILE}`);
  } else {
    logger.error('\n❌ Migration failed. Check the log file for details.');
  }
  
  return success;
}

async function showHelp() {
  console.log(`
${colors.bright}${colors.cyan}Database Migration Tool${colors.reset}

${colors.bright}Usage:${colors.reset}
  node scripts/migrate/migrate.js [command]

${colors.bright}Commands:${colors.reset}
  ${colors.green}export${colors.reset}    Export data from Supabase
  ${colors.green}import${colors.reset}    Import data to Neon
  ${colors.green}verify${colors.reset}    Verify data integrity
  ${colors.green}full${colors.reset}      Run complete migration

${colors.bright}Examples:${colors.reset}
  node scripts/migrate/migrate.js export
  node scripts/migrate/migrate.js import
  node scripts/migrate/migrate.js full

${colors.bright}Environment Variables:${colors.reset}
  DATABASE_URL    - Neon database connection string
  DIRECT_URL      - Supabase database connection string

${colors.bright}Log File:${colors.reset}
  ${LOG_FILE}
`);
}

// Main execution
async function main() {
  const command = process.argv[2] || 'help';
  
  switch (command) {
    case 'export':
      if (await checkEnvironment()) {
        await exportData();
      }
      break;
      
    case 'import':
      if (await checkEnvironment()) {
        await importData();
      }
      break;
      
    case 'verify':
      await verifyData();
      break;
      
    case 'full':
      if (await checkEnvironment()) {
        await runFullMigration();
      }
      break;
      
    case 'help':
    default:
      await showHelp();
      break;
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error(`❌ Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error(`❌ Unhandled rejection: ${error.message}`);
  process.exit(1);
});

// Run the migration tool
if (require.main === module) {
  main();
}

module.exports = { runCommand, checkEnvironment, exportData, importData, verifyData };