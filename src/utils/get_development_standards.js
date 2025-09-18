const fs = require('fs-extra');
const path = require('path');

/**
 * Development standards tool - get, set or delete development standards
 * @param {Object} params - Parameters
 * @param {string} params.action - Action to perform ('get', 'set', or 'delete')
 * @param {Array} params.standards - Array of development standards (required for 'set' action)
 * @param {boolean} params.forceOverwrite - Force overwrite array values when action is 'set' and value is array (default: false)
 * @param {string} params.standard - Standard content to delete when action is 'delete'
 * @param {Object} config - Server configuration
 * @param {Function} saveConfig - Function to save configuration (required for 'set' and 'delete' actions)
 * @returns {Array|Object} Development standards array or update result
 */
async function development_standards(params, config, saveConfig) {
  const { action, standards, forceOverwrite = false, standard } = params || {};
  
  if (!action) {
    throw new Error('Missing action parameter. Must be "get", "set", or "delete"');
  }
  
  if (action === 'get') {
    try {
      // 从配置文件的 development_standards 字段中获取标准，如果没有则使用默认值
      const developmentStandards = config?.development_standards || [
        'Use 2 spaces for indentation',
        'Use single quotes instead of double quotes',
        'Use camelCase for functions and variables',
        'Use PascalCase for class names',
        'Use UPPER_SNAKE_CASE for constants',
        'Use kebab-case for file names',
        'Keep lines under 100 characters',
        'Keep functions under 50 lines',
        'Keep files under 300 lines',
        'Use JSDoc format for code comments',
        'Use OpenAPI/Swagger for API documentation',
        'Include README.md in project root',
        'Include CHANGELOG.md in project root',
        'Separate production and development dependencies',
        'Use environment variables for sensitive information',
        'Validate input and output data',
        'Prevent XSS attacks',
        'Enable CORS for cross-origin support',
        'Use Redis or memory cache',
        'Enable Gzip or Brotli compression',
        'Monitor application metrics',
        'Use structured logging'
      ];

      return developmentStandards;
    } catch (err) {
      throw new Error(`Failed to get development standards: ${err.message}`);
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
      if (!config.development_standards) {
        config.development_standards = [];
      }
      
      // 处理数组类型的合并逻辑
      if (!forceOverwrite) {
        // 如果 forceOverwrite 为 false，则合并数组而不是覆盖
        const existingArray = config.development_standards;
        const newArray = [...new Set([...existingArray, ...standards])];
        config.development_standards = newArray;
      } else {
        // 直接覆盖
        config.development_standards = standards;
      }
      
      // 保存配置
      const saved = saveConfig(config);
      if (!saved) {
        throw new Error('Failed to save configuration');
      }
      
      return {
        success: true,
        message: 'Successfully updated development standards',
        updatedCount: config.development_standards.length,
        forceOverwrite: forceOverwrite,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      throw new Error(`Failed to update development standards: ${err.message}`);
    }
  } else if (action === 'delete') {
    if (!standard) {
      throw new Error('Missing standard parameter for delete action');
    }
    
    if (!saveConfig) {
      throw new Error('saveConfig function is required for delete action');
    }
    
    try {
      // 确保 config.development_standards 存在
      if (!config.development_standards) {
        config.development_standards = [];
      }
      
      // 查找并删除指定的 standard
      const standardIndex = config.development_standards.indexOf(standard);
      if (standardIndex !== -1) {
        config.development_standards.splice(standardIndex, 1);
        
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

module.exports = development_standards;
