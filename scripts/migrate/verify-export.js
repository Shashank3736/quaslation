#!/usr/bin/env node

/**
 * Export Verification Script
 * Verifies the integrity of exported JSON files from Supabase
 *
 * Usage: node scripts/migrate/verify-export.js
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs').promises;
const path = require('path');

// Configuration
const EXPORT_DIR = path.join(process.cwd(), 'database-export');
const EXPECTED_TABLES = [
  '_prisma_migrations',
  'User',
  'RichText',
  'Novel',
  'Volume',
  'Chapter'
];

class ExportVerifier {
  constructor() {
    this.results = {
      totalFiles: 0,
      validFiles: 0,
      invalidFiles: 0,
      totalRows: 0,
      errors: []
    };
  }

  async verifyExport() {
    console.log('🔍 Starting export verification...\n');

    try {
      // Check if export directory exists
      await this.checkExportDirectory();
      
      // Verify manifest file
      await this.verifyManifest();
      
      // Verify all JSON files
      await this.verifyAllFiles();
      
      // Generate verification report
      await this.generateReport();
      
      // Display summary
      this.displaySummary();
      
    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      process.exit(1);
    }
  }

  async checkExportDirectory() {
    try {
      await fs.access(EXPORT_DIR);
      console.log('✅ Export directory found');
    } catch (error) {
      throw new Error(`Export directory not found: ${EXPORT_DIR}`);
    }
  }

  async verifyManifest() {
    const manifestPath = path.join(EXPORT_DIR, 'export-manifest.json');
    
    try {
      const manifestData = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestData);
      
      console.log('✅ Export manifest found');
      console.log(`📊 Export date: ${manifest.exportDate}`);
      console.log(`📊 Total rows: ${manifest.totalRows}`);
      
      // Verify all expected tables are present
      const exportedTables = manifest.tables.map(t => t.tableName);
      const missingTables = EXPECTED_TABLES.filter(table => !exportedTables.includes(table));
      
      if (missingTables.length > 0) {
        this.results.errors.push(`Missing tables in manifest: ${missingTables.join(', ')}`);
      }
      
    } catch (error) {
      this.results.errors.push(`Manifest verification failed: ${error.message}`);
    }
  }

  async verifyAllFiles() {
    console.log('\n📁 Verifying JSON files...\n');
    
    for (const tableName of EXPECTED_TABLES) {
      await this.verifyFile(tableName);
    }
  }

  async verifyFile(tableName) {
    const fileName = this.getFileName(tableName);
    const filePath = path.join(EXPORT_DIR, fileName);
    
    try {
      // Check file exists
      await fs.access(filePath);
      
      // Read and parse JSON
      const fileContent = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      // Validate structure
      if (!Array.isArray(data)) {
        throw new Error('File content is not an array');
      }
      
      // Validate each row
      const validationErrors = this.validateRows(data, tableName);
      
      if (validationErrors.length > 0) {
        this.results.errors.push(`Table ${tableName}: ${validationErrors.join(', ')}`);
        this.results.invalidFiles++;
      } else {
        console.log(`✅ ${tableName}: ${data.length} rows - Valid`);
        this.results.validFiles++;
        this.results.totalRows += data.length;
      }
      
      this.results.totalFiles++;
      
    } catch (error) {
      this.results.errors.push(`Table ${tableName}: ${error.message}`);
      this.results.invalidFiles++;
      this.results.totalFiles++;
    }
  }

  validateRows(data, tableName) {
    const errors = [];
    
    if (data.length === 0) {
      return errors; // Empty files are valid
    }
    
    // Get expected columns from first row
    const expectedColumns = Object.keys(data[0]);
    
    // Check for consistent structure
    for (let i = 1; i < data.length; i++) {
      const rowColumns = Object.keys(data[i]);
      if (rowColumns.length !== expectedColumns.length) {
        errors.push(`Row ${i} has inconsistent column count`);
        break;
      }
    }
    
    // Validate specific table requirements
    switch (tableName) {
      case 'User':
        errors.push(...this.validateUserTable(data));
        break;
      case 'Novel':
        errors.push(...this.validateNovelTable(data));
        break;
      case 'Chapter':
        errors.push(...this.validateChapterTable(data));
        break;
      // Add more table-specific validations as needed
    }
    
    return errors;
  }

  validateUserTable(data) {
    const errors = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      if (!row.id || typeof row.id !== 'string') {
        errors.push(`Row ${i}: Invalid or missing id`);
      }
      if (!row.clerkId || typeof row.clerkId !== 'string') {
        errors.push(`Row ${i}: Invalid or missing clerkId`);
      }
    }
    
    return errors;
  }

  validateNovelTable(data) {
    const errors = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      if (!row.id || typeof row.id !== 'number') {
        errors.push(`Row ${i}: Invalid or missing id`);
      }
      if (!row.title || typeof row.title !== 'string') {
        errors.push(`Row ${i}: Invalid or missing title`);
      }
    }
    
    return errors;
  }

  validateChapterTable(data) {
    const errors = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      if (!row.id || typeof row.id !== 'number') {
        errors.push(`Row ${i}: Invalid or missing id`);
      }
      if (!row.title || typeof row.title !== 'string') {
        errors.push(`Row ${i}: Invalid or missing title`);
      }
      if (row.volumeId === undefined || row.volumeId === null) {
        errors.push(`Row ${i}: Missing volumeId`);
      }
    }
    
    return errors;
  }

  getFileName(tableName) {
    const fileMap = {
      '_prisma_migrations': '03-prisma-migrations.json',
      'User': '02-user.json',
      'RichText': '01-richtext.json',
      'Novel': '04-novel.json',
      'Volume': '05-volume.json',
      'Chapter': '06-chapter.json'
    };
    
    return fileMap[tableName] || `${tableName.toLowerCase()}.json`;
  }

  async generateReport() {
    const report = {
      verificationDate: new Date().toISOString(),
      summary: {
        totalFiles: this.results.totalFiles,
        validFiles: this.results.validFiles,
        invalidFiles: this.results.invalidFiles,
        totalRows: this.results.totalRows,
        successRate: this.results.totalFiles > 0 ? 
          ((this.results.validFiles / this.results.totalFiles) * 100).toFixed(1) + '%' : '0%'
      },
      errors: this.results.errors
    };
    
    const reportPath = path.join(EXPORT_DIR, 'verification-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📋 Verification report saved: ${reportPath}`);
  }

  displaySummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 EXPORT VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total files: ${this.results.totalFiles}`);
    console.log(`Valid files: ${this.results.validFiles}`);
    console.log(`Invalid files: ${this.results.invalidFiles}`);
    console.log(`Total rows: ${this.results.totalRows}`);
    console.log(`Success rate: ${this.results.totalFiles > 0 ? 
      ((this.results.validFiles / this.results.totalFiles) * 100).toFixed(1) + '%' : '0%'}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.results.errors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('\n✅ All files are valid!');
    }
    
    console.log('='.repeat(50));
  }
}

// Main execution
async function main() {
  const verifier = new ExportVerifier();
  await verifier.verifyExport();
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error.message);
  process.exit(1);
});

// Run verification
if (require.main === module) {
  main();
}

module.exports = { ExportVerifier };