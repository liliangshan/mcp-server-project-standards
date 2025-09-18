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
      // 从配置文件的 project_info 字段中获取项目信息，如果没有则使用默认值
      const projectInfo = config?.project_info || '';
      const projectName = projectInfo.projectName || '';
      const developmentLanguage = projectInfo.developmentLanguage || '';
      const basicInfo = projectInfo.basicInfo || '';

      return {
        // 项目名称
        projectName: projectName,
        
        // 开发语言
        developmentLanguage: developmentLanguage,
        
        // 基本信息
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
      // 确保 config.project_info 存在
      if (!config.project_info) {
        config.project_info = {};
      }
      
      // 更新指定字段
      config.project_info[key] = value;
      
      // 保存配置
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