const { loadApiConfig, saveApiConfig } = require('./api_common');

/**
 * API 配置工具 - 专门处理API配置管理
 * @param {Object} params - 参数
 * @param {string} params.action - 操作类型 ('get', 'set', 'updateBaseUrl', 'updateHeaders', 'deleteHeader', 'search', 'list')
 * @param {Object} params.config - API配置（set 时必需）
 * @param {string} params.baseUrl - 基础URL（updateBaseUrl 时必需）
 * @param {Object} params.headers - 请求头（updateHeaders 时必需）
 * @param {string} params.headerName - 要删除的请求头名称（deleteHeader 时必需）
 * @param {string} params.keyword - 搜索关键词（search 时必需）
 * @param {Object} config - 服务器配置
 * @param {Function} saveConfig - 保存配置函数
 * @returns {Object} API配置结果
 */
async function api_config(params, config, saveConfig) {
  const { action, config: apiConfig, baseUrl, headers, headerName, keyword } = params || {};
  
  if (!action) {
    throw new Error('Missing action parameter. Must be "get", "set", "updateBaseUrl", "updateHeaders", "deleteHeader", "search", or "list"');
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
      // 加载现有配置
      const existingConfig = loadApiConfig();
      
      // 合并配置
      const mergedConfig = {
        baseUrl: apiConfig.baseUrl !== undefined ? apiConfig.baseUrl : existingConfig.baseUrl || '',
        headers: { ...existingConfig.headers, ...apiConfig.headers },
        list: []
      };
      
      // 去重处理：相同的 URL 只保留一份
      const urlMap = new Map();
      
      // 先添加现有列表中的项目
      if (existingConfig.list && Array.isArray(existingConfig.list)) {
        existingConfig.list.forEach(item => {
          if (item.url) {
            urlMap.set(item.url, item);
          }
        });
      }
      
      // 再添加新配置中的项目（会覆盖相同 URL 的项目）
      if (apiConfig.list && Array.isArray(apiConfig.list)) {
        apiConfig.list.forEach(item => {
          if (item.url) {
            urlMap.set(item.url, item);
          }
        });
      }
      
      // 转换为数组
      mergedConfig.list = Array.from(urlMap.values());
      
      // 保存配置
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
  } else if (action === 'search') {
    if (!keyword) {
      throw new Error('Missing keyword parameter for search action');
    }
    
    try {
      const apiDebugConfig = loadApiConfig();
      let searchResults = [];
      
      if (apiDebugConfig.list && Array.isArray(apiDebugConfig.list)) {
        searchResults = apiDebugConfig.list.filter((item) => {
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
      
      return {
        success: true,
        message: `Found ${apiList.length} configured API(s)`,
        apis: apiList,
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
