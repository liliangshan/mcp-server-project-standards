const fs = require('fs-extra');
const path = require('path');

/**
 * Database standards tool - get, set or delete database standards
 * @param {Object} params - Parameters
 * @param {string} params.action - Action to perform ('get', 'set', or 'delete')
 * @param {Array} params.standards - Array of database standards (required for 'set' action)
 * @param {boolean} params.forceOverwrite - Force overwrite array values when action is 'set' and value is array (default: false)
 * @param {string} params.standard - Standard content to delete when action is 'delete'
 * @param {Object} config - Server configuration
 * @param {Function} saveConfig - Function to save configuration (required for 'set' and 'delete' actions)
 * @returns {Array|Object} Database standards array or update result
 */
async function database_standards(params, config, saveConfig) {
  const { action, standards, forceOverwrite = false, standard } = params || {};
  
  if (!action) {
    throw new Error('Missing action parameter. Must be "get", "set", or "delete"');
  }
  
  if (action === 'get') {
    try {
      // Get standards from database_standards field in config file, use default if not present
      const databaseStandards = config?.database_standards || [
        'Use meaningful table names with descriptive prefixes',
        'Use snake_case for table and column names',
        'Use singular names for table names',
        'Use plural names for junction tables',
        'Include created_at and updated_at timestamps',
        'Use UUID for primary keys when appropriate',
        'Create indexes for frequently queried columns',
        'Use foreign key constraints for data integrity',
        'Normalize database structure to reduce redundancy',
        'Use appropriate data types for each column',
        'Set NOT NULL constraints where data is required',
        'Use CHECK constraints for data validation',
        'Create unique constraints for business rules',
        'Use database transactions for data consistency',
        'Implement soft deletes instead of hard deletes',
        'Use database views for complex queries',
        'Create stored procedures for complex business logic',
        'Use database triggers sparingly and document them',
        'Implement database backup and recovery procedures',
        'Monitor database performance and optimize queries',
        'Use connection pooling for better performance',
        'Implement database security best practices',
        'Use environment-specific database configurations',
        'Document database schema and relationships',
        'Version control database migrations',
        'Test database changes in development first',
        'Use database monitoring and alerting tools',
        'Implement database replication for high availability',
        'Use database partitioning for large tables',
        'Regularly analyze and optimize database performance'
      ];

      return databaseStandards;
    } catch (err) {
      throw new Error(`Failed to get database standards: ${err.message}`);
    }
  } else if (action === 'set') {
    if (!Array.isArray(standards)) {
      throw new Error('Standards must be an array for set action');
    }
    
    if (!saveConfig) {
      throw new Error('saveConfig function is required for set action');
    }
    
    try {
      // Update configuration
      if (!config.database_standards) {
        config.database_standards = [];
      }
      
      // Handle merging logic for array types
      if (!forceOverwrite) {
        // Merge array instead of overwrite if forceOverwrite is false
        const existingArray = config.database_standards;
        const newArray = [...new Set([...existingArray, ...standards])];
        config.database_standards = newArray;
      } else {
        // Overwrite directly
        config.database_standards = standards;
      }
      
      // Save configuration
      const saved = saveConfig(config);
      if (!saved) {
        throw new Error('Failed to save configuration');
      }
      
      return {
        success: true,
        message: 'Successfully updated database standards',
        updatedCount: config.database_standards.length,
        forceOverwrite: forceOverwrite,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      throw new Error(`Failed to update database standards: ${err.message}`);
    }
  } else if (action === 'delete') {
    if (!standard) {
      throw new Error('Missing standard parameter for delete action');
    }
    
    if (!saveConfig) {
      throw new Error('saveConfig function is required for delete action');
    }
    
    try {
      // Ensure config.database_standards exists
      if (!config.database_standards) {
        config.database_standards = [];
      }
      
      // Find and delete specified standard
      const standardIndex = config.database_standards.indexOf(standard);
      if (standardIndex !== -1) {
        config.database_standards.splice(standardIndex, 1);
        
        // Save configuration
        const saved = saveConfig(config);
        if (!saved) {
          throw new Error('Failed to save configuration');
        }
        
        return {
          success: true,
          message: `Successfully deleted standard: ${standard}`,
          deletedStandard: standard,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(`Standard '${standard}' not found`);
      }
    } catch (err) {
      throw new Error(`Failed to delete standard: ${err.message}`);
    }
  } else {
    throw new Error('Invalid action. Must be "get", "set", or "delete"');
  }
}

module.exports = database_standards;
