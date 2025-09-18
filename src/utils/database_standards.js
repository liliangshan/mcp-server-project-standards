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
      // 从配置文件的 database_standards 字段中获取标准，如果没有则使用默认值
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
      // 更新配置
      if (!config.database_standards) {
        config.database_standards = [];
      }
      
      // 处理数组类型的合并逻辑
      if (!forceOverwrite) {
        // 如果 forceOverwrite 为 false，则合并数组而不是覆盖
        const existingArray = config.database_standards;
        const newArray = [...new Set([...existingArray, ...standards])];
        config.database_standards = newArray;
      } else {
        // 直接覆盖
        config.database_standards = standards;
      }
      
      // 保存配置
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
      // 确保 config.database_standards 存在
      if (!config.database_standards) {
        config.database_standards = [];
      }
      
      // 查找并删除指定的 standard
      const standardIndex = config.database_standards.indexOf(standard);
      if (standardIndex !== -1) {
        config.database_standards.splice(standardIndex, 1);
        
        // 保存配置
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
