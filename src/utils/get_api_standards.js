const fs = require('fs-extra');
const path = require('path');

/**
 * API standards tool - get, set or delete API standards
 * @param {Object} params - Parameters
 * @param {string} params.action - Action to perform ('get', 'set', or 'delete')
 * @param {string} params.key - Key to update when action is 'set' (interfaceType|successStructure|errorStructure|basicHeaders|requirements)
 * @param {*} params.value - Value to set when action is 'set'
 * @param {boolean} params.forceOverwrite - Force overwrite array values when action is 'set' and value is array (default: false)
 * @param {string} params.headerName - Header name to delete when action is 'delete'
 * @param {string} params.requirement - Requirement content to delete when action is 'delete'
 * @param {Object} config - Server configuration
 * @param {Function} saveConfig - Function to save configuration (required for 'set' and 'delete' actions)
 * @returns {Object} API standards or update result
 */
async function api_standards(params, config, saveConfig) {
  const { action, key, value, forceOverwrite = false, headerName, requirement } = params || {};
  
  if (!action) {
    throw new Error('Missing action parameter. Must be "get", "set", or "delete"');
  }
  
  if (action === 'get') {
    try {
      // Get standards from api_standards field in config file, use default if not present
      const apiStandards = config?.api_standards || {
        interfaceType: 'restful',
        successStructure: {
          code: 'number',
          message: 'string',
          data: 'object|array',
          timestamp: 'string'
        },
        errorStructure: {
          code: 'number',
          message: 'string',
          error: 'string',
          timestamp: 'string'
        },
        basicHeaders: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer token',
          'X-Request-ID': 'string'
        },
        requirements: [
          'Unified response format',
          'Error code standards',
          'Parameter validation',
          'API documentation'
        ]
      };

      return apiStandards;
    } catch (err) {
      throw new Error(`Failed to get API standards: ${err.message}`);
    }
  } else if (action === 'set') {
    if (!key) {
      throw new Error('Missing key parameter for set action');
    }
    
    if (!['interfaceType', 'successStructure', 'errorStructure', 'basicHeaders', 'requirements'].includes(key)) {
      throw new Error('Invalid key. Must be one of: interfaceType, successStructure, errorStructure, basicHeaders, requirements');
    }
    
    if (typeof value !== 'string' && !Array.isArray(value)) {
      throw new Error('Value must be a string or array');
    }
    
    if (!saveConfig) {
      throw new Error('saveConfig function is required for set action');
    }
    
    try {
      // Ensure config.api_standards exists
      if (!config.api_standards) {
        config.api_standards = {};
      }
      
      // Handle merging logic for array types
      if (Array.isArray(value) && !forceOverwrite) {
        // Merge array instead of overwrite if forceOverwrite is false
        if (!config.api_standards[key]) {
          config.api_standards[key] = [];
        }
        
        // Ensure existing value is an array
        if (!Array.isArray(config.api_standards[key])) {
          config.api_standards[key] = [];
        }
        
        // Merge array and remove duplicates
        const existingArray = config.api_standards[key];
        const newArray = [...new Set([...existingArray, ...value])];
        config.api_standards[key] = newArray;
      } else {
        // Overwrite directly
        config.api_standards[key] = value;
      }
      
      // Save configuration
      const saved = saveConfig(config);
      if (!saved) {
        throw new Error('Failed to save configuration');
      }
      
      return {
        success: true,
        message: `Successfully updated ${key}`,
        updatedField: key,
        newValue: config.api_standards[key],
        forceOverwrite: forceOverwrite,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      throw new Error(`Failed to update API standards: ${err.message}`);
    }
  } else if (action === 'delete') {
    if (!headerName && !requirement) {
      throw new Error('Missing headerName or requirement parameter for delete action');
    }
    
    if (headerName && requirement) {
      throw new Error('Cannot delete both header and requirement at the same time. Please specify either headerName or requirement');
    }
    
    if (!saveConfig) {
      throw new Error('saveConfig function is required for delete action');
    }
    
    try {
      // Ensure config.api_standards exists
      if (!config.api_standards) {
        config.api_standards = {};
      }
      
      // Delete header
      if (headerName) {
        // Ensure basicHeaders exists
        if (!config.api_standards.basicHeaders) {
          config.api_standards.basicHeaders = {};
        }
        
        // Delete specified header
        if (config.api_standards.basicHeaders.hasOwnProperty(headerName)) {
          delete config.api_standards.basicHeaders[headerName];
          
          // Save configuration
          const saved = saveConfig(config);
          if (!saved) {
            throw new Error('Failed to save configuration');
          }
          
          return {
            success: true,
            message: `Successfully deleted header: ${headerName}`,
            deletedHeader: headerName,
            timestamp: new Date().toISOString()
          };
        } else {
          throw new Error(`Header '${headerName}' not found`);
        }
      }
      
      // Delete requirement
      if (requirement) {
        // Ensure requirements exists
        if (!config.api_standards.requirements) {
          config.api_standards.requirements = [];
        }
        
        // Find and delete specified requirement
        const requirementIndex = config.api_standards.requirements.indexOf(requirement);
        if (requirementIndex !== -1) {
          config.api_standards.requirements.splice(requirementIndex, 1);
          
          // Save configuration
          const saved = saveConfig(config);
          if (!saved) {
            throw new Error('Failed to save configuration');
          }
          
          return {
            success: true,
            message: `Successfully deleted requirement: ${requirement}`,
            deletedRequirement: requirement,
            timestamp: new Date().toISOString()
          };
        } else {
          throw new Error(`Requirement '${requirement}' not found`);
        }
      }
    } catch (err) {
      throw new Error(`Failed to delete: ${err.message}`);
    }
  } else {
    throw new Error('Invalid action. Must be "get", "set", or "delete"');
  }
}

module.exports = api_standards;
