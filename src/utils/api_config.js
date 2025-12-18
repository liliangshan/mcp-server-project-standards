const { loadApiConfig, saveApiConfig } = require('./api_common');

/**
 * API Configuration Tool - Handles API configuration management
 * @param {Object} params - Parameters
 * @param {string} params.action - Action type ('get', 'set', 'updateBaseUrl', 'updateHeaders', 'deleteHeader', 'addApi', 'search', 'list')
 * @param {Object} params.config - API configuration (required for 'set')
 * @param {string} params.baseUrl - Base URL (required for 'updateBaseUrl')
 * @param {Object} params.headers - Request headers (required for 'updateHeaders')
 * @param {string} params.headerName - Header name to delete (required for 'deleteHeader')
 * @param {Object} params.api - API configuration (required for 'addApi')
 * @param {string} params.keyword - Search keyword (required for 'search')
 * @param {Object} config - Server configuration
 * @param {Function} saveConfig - Save configuration function
 * @returns {Object} API configuration result
 */
async function api_config(params, config, saveConfig) {
  const { action, config: apiConfig, baseUrl, headers, headerName, api, keyword } = params || {};
  
  if (!action) {
    throw new Error('Missing action parameter. Must be "get", "set", "updateBaseUrl", "updateHeaders", "deleteHeader", "addApi", "search", or "list"');
  }
  
  if (action === 'get') {
    try {
      const apiDebugConfig = loadApiConfig();
      return {
        success: true,
        config: apiDebugConfig,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      throw new Error(`Failed to get API config: ${err.message}`);
    }
  } else if (action === 'set') {
    if (!apiConfig || typeof apiConfig !== 'object') {
      throw new Error('Missing or invalid config parameter for set action');
    }
    
    try {
      // Load existing configuration
      const existingConfig = loadApiConfig();
      
      // Merge configuration
      const mergedConfig = {
        baseUrl: apiConfig.baseUrl !== undefined ? apiConfig.baseUrl : existingConfig.baseUrl || '',
        headers: { ...existingConfig.headers, ...apiConfig.headers },
        list: []
      };
      
      // De-duplication: Keep only one entry for the same URL
      const urlMap = new Map();
      
      // Add items from the existing list first
      if (existingConfig.list && Array.isArray(existingConfig.list)) {
        existingConfig.list.forEach(item => {
          if (item.url) {
            urlMap.set(item.url, item);
          }
        });
      }
      
      // Then add items from the new configuration (overwriting items with the same URL)
      if (apiConfig.list && Array.isArray(apiConfig.list)) {
        apiConfig.list.forEach(item => {
          if (item.url) {
            urlMap.set(item.url, item);
          }
        });
      }
      
      // Convert to array
      mergedConfig.list = Array.from(urlMap.values());
      
      // Save configuration
      const saved = saveApiConfig(mergedConfig);
      if (!saved) {
        throw new Error('Failed to save API configuration');
      }
      
      return {
        success: true,
        message: `Successfully updated API config. Total APIs: ${mergedConfig.list.length}`,
        config: mergedConfig,
        totalApis: mergedConfig.list.length,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      throw new Error(`Failed to update API config: ${err.message}`);
    }
  } else if (action === 'updateBaseUrl') {
    if (!baseUrl) {
      throw new Error('Missing baseUrl parameter for updateBaseUrl action');
    }
    
    try {
      const apiDebugConfig = loadApiConfig();
      apiDebugConfig.baseUrl = baseUrl;
      const saved = saveApiConfig(apiDebugConfig);
      if (!saved) {
        throw new Error('Failed to save API configuration');
      }
      
      return {
        success: true,
        message: `Successfully updated base URL to: ${baseUrl}`,
        baseUrl: baseUrl,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      throw new Error(`Failed to update base URL: ${err.message}`);
    }
  } else if (action === 'updateHeaders') {
    if (!headers || typeof headers !== 'object') {
      throw new Error('Missing or invalid headers parameter for updateHeaders action');
    }
    
    try {
      const apiDebugConfig = loadApiConfig();
      apiDebugConfig.headers = { ...apiDebugConfig.headers, ...headers };
      const saved = saveApiConfig(apiDebugConfig);
      if (!saved) {
        throw new Error('Failed to save API configuration');
      }
      
      return {
        success: true,
        message: 'Successfully updated headers',
        headers: apiDebugConfig.headers,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      throw new Error(`Failed to update headers: ${err.message}`);
    }
  } else if (action === 'deleteHeader') {
    if (!headerName) {
      throw new Error('Missing headerName parameter for deleteHeader action');
    }
    
    try {
      const apiDebugConfig = loadApiConfig();
      if (apiDebugConfig.headers && apiDebugConfig.headers[headerName]) {
        delete apiDebugConfig.headers[headerName];
        const saved = saveApiConfig(apiDebugConfig);
        if (!saved) {
          throw new Error('Failed to save API configuration');
        }
        
        return {
          success: true,
          message: `Successfully deleted header: ${headerName}`,
          headers: apiDebugConfig.headers,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          message: `Header '${headerName}' not found`,
          headers: apiDebugConfig.headers,
          timestamp: new Date().toISOString()
        };
      }
    } catch (err) {
      throw new Error(`Failed to delete header: ${err.message}`);
    }
  } else if (action === 'addApi') {
    if (!api || !api.url) {
      throw new Error('Missing or invalid api parameter for addApi action. API must have url property');
    }
    
    try {
      const apiDebugConfig = loadApiConfig();
      
      if (!apiDebugConfig.list) {
        apiDebugConfig.list = [];
      }
      
      // Check if an API with the same URL already exists
      const existingIndex = apiDebugConfig.list.findIndex(item => item.url === api.url);
      
      if (existingIndex >= 0) {
        // Update existing API
        apiDebugConfig.list[existingIndex] = { ...apiDebugConfig.list[existingIndex], ...api };
        const saved = saveApiConfig(apiDebugConfig);
        if (!saved) {
          throw new Error('Failed to save API configuration');
        }
        
        return {
          success: true,
          message: `Successfully updated existing API: ${api.url}. You can now execute it using: api_execute with index ${existingIndex}`,
          index: existingIndex,
          api: apiDebugConfig.list[existingIndex],
          timestamp: new Date().toISOString()
        };
      } else {
        // Add new API
        apiDebugConfig.list.push(api);
        const saved = saveApiConfig(apiDebugConfig);
        if (!saved) {
          throw new Error('Failed to save API configuration');
        }
        
        return {
          success: true,
          message: `Successfully added new API: ${api.url}. You can now execute it using: api_execute with index ${apiDebugConfig.list.length - 1}`,
          index: apiDebugConfig.list.length - 1,
          api: api,
          timestamp: new Date().toISOString()
        };
      }
    } catch (err) {
      throw new Error(`Failed to add API: ${err.message}`);
    }
  } else if (action === 'search') {
    if (!keyword) {
      throw new Error('Missing keyword parameter for search action');
    }
    
    try {
      const apiDebugConfig = loadApiConfig();
      let searchResults = [];
      
      if (apiDebugConfig.list && Array.isArray(apiDebugConfig.list)) {
        searchResults = apiDebugConfig.list.map((item, index) => ({
          ...item,
          index: index
        })).filter((item) => {
          const urlMatch = item.url && item.url.toLowerCase().includes(keyword.toLowerCase());
          const descMatch = item.description && item.description.toLowerCase().includes(keyword.toLowerCase());
          return urlMatch || descMatch;
        });
      }
      
      return {
        success: true,
        message: `Found ${searchResults.length} matching API(s) for keyword: "${keyword}"`,
        keyword: keyword,
        results: searchResults,
        totalCount: searchResults.length,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      throw new Error(`Failed to search APIs: ${err.message}`);
    }
  } else if (action === 'list') {
    try {
      const apiDebugConfig = loadApiConfig();
      const apiList = apiDebugConfig.list || [];
      
      // Add index to each API
      const apisWithIndex = apiList.map((api, index) => ({
        ...api,
        index: index
      }));
      
      return {
        success: true,
        message: `Found ${apiList.length} configured API(s)`,
        apis: apisWithIndex,
        totalCount: apiList.length,
        config: {
          baseUrl: apiDebugConfig.baseUrl,
          headers: apiDebugConfig.headers
        },
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      throw new Error(`Failed to list APIs: ${err.message}`);
    }
  } else {
    throw new Error('Invalid action. Must be "get", "set", "updateBaseUrl", "updateHeaders", "deleteHeader", "addApi", "deleteApi", "search", or "list"');
  }
}

module.exports = api_config;
