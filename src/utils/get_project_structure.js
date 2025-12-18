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
      // Get structure from project_structure field in config file, use default if not present
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
      // Get current structure
      let currentStructure = config?.project_structure || [];
      
      // Create new structure array
      const newStructure = [];
      
      // Loop through each new structure item
      for (const item of structure) {
        if (!item.path || !item.description) {
          throw new Error('Each structure item must have "path" and "description" properties');
        }
        
        // Check if path already exists
        const existingIndex = currentStructure.findIndex(existing => existing.path === item.path);
        
        if (existingIndex !== -1) {
          // Path exists, replace
          currentStructure[existingIndex] = {
            path: item.path,
            description: item.description
          };
        } else {
          // Path doesn't exist, add to new structure
          newStructure.push({
            path: item.path,
            description: item.description
          });
        }
      }
      
      // Append new structure to existing structure
      const updatedStructure = [...currentStructure, ...newStructure];
      
      // Update configuration
      if (!config.project_structure) {
        config.project_structure = [];
      }
      config.project_structure = updatedStructure;
      
      // Save configuration
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
      // Ensure config.project_structure exists
      if (!config.project_structure) {
        config.project_structure = [];
      }
      
      // Find and delete specified path
      const pathIndex = config.project_structure.findIndex(item => item.path === deletePath);
      if (pathIndex !== -1) {
        const deletedItem = config.project_structure.splice(pathIndex, 1)[0];
        
        // Save configuration
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
