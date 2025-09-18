const fs = require('fs-extra');
const path = require('path');

/**
 * Project structure tool - get, set or delete project structure
 * @param {Object} params - Parameters
 * @param {string} params.action - Action to perform ('get', 'set', or 'delete')
 * @param {Array} params.structure - Array of structure items with path and description (required for 'set' action)
 * @param {string} params.path - Path to delete when action is 'delete'
 * @param {Object} config - Server configuration
 * @param {Function} saveConfig - Function to save configuration (required for 'set' and 'delete' actions)
 * @returns {Array|Object} Project structure array or update result
 */
async function project_structure(params, config, saveConfig) {
  const { action, structure, path: deletePath } = params || {};
  
  if (!action) {
    throw new Error('Missing action parameter. Must be "get", "set", or "delete"');
  }
  
  if (action === 'get') {
    try {
      // 从配置文件的 project_structure 字段中获取结构，如果没有则使用默认值
      const projectStructure = config?.project_structure || [];

      return projectStructure;
    } catch (err) {
      throw new Error(`Failed to get project structure: ${err.message}`);
    }
  } else if (action === 'set') {
    if (!Array.isArray(structure)) {
      throw new Error('Structure must be an array for set action');
    }
    
    if (!saveConfig) {
      throw new Error('saveConfig function is required for set action');
    }
    
    try {
      // 获取当前结构
      let currentStructure = config?.project_structure || [];
      
      // 创建新结构数组
      const newStructure = [];
      
      // 循环处理每个新结构项
      for (const item of structure) {
        if (!item.path || !item.description) {
          throw new Error('Each structure item must have "path" and "description" properties');
        }
        
        // 检查路径是否已存在
        const existingIndex = currentStructure.findIndex(existing => existing.path === item.path);
        
        if (existingIndex !== -1) {
          // 路径存在，替换
          currentStructure[existingIndex] = {
            path: item.path,
            description: item.description
          };
        } else {
          // 路径不存在，添加到新结构
          newStructure.push({
            path: item.path,
            description: item.description
          });
        }
      }
      
      // 将新结构附加到现有结构
      const updatedStructure = [...currentStructure, ...newStructure];
      
      // 更新配置
      if (!config.project_structure) {
        config.project_structure = [];
      }
      config.project_structure = updatedStructure;
      
      // 保存配置
      const saved = saveConfig(config);
      if (!saved) {
        throw new Error('Failed to save configuration');
      }
      
      return {
        success: true,
        message: `Successfully updated project structure`,
        updatedCount: structure.length,
        newItemsCount: newStructure.length,
        totalItems: updatedStructure.length,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      throw new Error(`Failed to update project structure: ${err.message}`);
    }
  } else if (action === 'delete') {
    if (!deletePath) {
      throw new Error('Missing path parameter for delete action');
    }
    
    if (!saveConfig) {
      throw new Error('saveConfig function is required for delete action');
    }
    
    try {
      // 确保 config.project_structure 存在
      if (!config.project_structure) {
        config.project_structure = [];
      }
      
      // 查找并删除指定的路径
      const pathIndex = config.project_structure.findIndex(item => item.path === deletePath);
      if (pathIndex !== -1) {
        const deletedItem = config.project_structure.splice(pathIndex, 1)[0];
        
        // 保存配置
        const saved = saveConfig(config);
        if (!saved) {
          throw new Error('Failed to save configuration');
        }
        
        return {
          success: true,
          message: `Successfully deleted structure item: ${deletePath}`,
          deletedItem: deletedItem,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(`Path '${deletePath}' not found`);
      }
    } catch (err) {
      throw new Error(`Failed to delete structure item: ${err.message}`);
    }
  } else {
    throw new Error('Invalid action. Must be "get", "set", or "delete"');
  }
}

module.exports = project_structure;
