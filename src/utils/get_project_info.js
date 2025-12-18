const path = require('path');
const fs = require('fs-extra');

/**
 * Project information tool - get or set project information
 * @param {Object} params - Parameters
 * @param {string} params.action - Action to perform ('get' or 'set')
 * @param {string} params.key - Key to update when action is 'set' (projectName|developmentLanguage|basicInfo)
 * @param {*} params.value - Value to set when action is 'set'
 * @param {Object} config - Server configuration
 * @param {Function} saveConfig - Function to save configuration (required for 'set' action)
 * @returns {Object} Project information or update result
 */
async function project_info(params, config, saveConfig) {
  const { action, key, value } = params || {};
  
  if (!action) {
    throw new Error('Missing action parameter. Must be "get" or "set"');
  }
  
  if (action === 'get') {
    try {
      // Get project info from project_info field in config file, use default if not present
      const projectInfo = config?.project_info || '';
      const projectName = projectInfo.projectName || '';
      const developmentLanguage = projectInfo.developmentLanguage || '';
      const basicInfo = projectInfo.basicInfo || '';

      return {
        // Project name
        projectName: projectName,
        
        // Development language
        developmentLanguage: developmentLanguage,
        
        // Basic info
        basicInfo: basicInfo,
        
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      throw new Error(`Failed to get project information: ${err.message}`);
    }
  } else if (action === 'set') {
    if (!key) {
      throw new Error('Missing key parameter for set action');
    }
    
    if (!['projectName', 'developmentLanguage', 'basicInfo'].includes(key)) {
      throw new Error('Invalid key. Must be one of: projectName, developmentLanguage, basicInfo');
    }
    
    if (!saveConfig) {
      throw new Error('saveConfig function is required for set action');
    }
    
    try {
      // Ensure config.project_info exists
      if (!config.project_info) {
        config.project_info = {};
      }
      
      // Update specified field
      config.project_info[key] = value;
      
      // Save configuration
      const saved = saveConfig(config);
      if (!saved) {
        throw new Error('Failed to save configuration');
      }
      
      return {
        success: true,
        message: `Successfully updated ${key}`,
        updatedField: key,
        newValue: value,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      throw new Error(`Failed to update project info: ${err.message}`);
    }
  } else {
    throw new Error('Invalid action. Must be "get" or "set"');
  }
}

module.exports = project_info;