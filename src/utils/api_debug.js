const fs = require('fs-extra');
const path = require('path');

// Get allowed methods from environment variable
const getAllowedMethods = () => {
  const allowedMethods = process.env.API_DEBUG_ALLOWED_METHODS || 'GET';
  return allowedMethods.split(',').map(method => method.trim().toUpperCase());
};

// Get login URL from environment variable
const getLoginUrl = () => {
  return process.env.API_DEBUG_LOGIN_URL || '/api/login';
};

// Get login method from environment variable
const getLoginMethod = () => {
  return (process.env.API_DEBUG_LOGIN_METHOD || 'POST').toUpperCase();
};

// Get login body from environment variable
const getLoginBody = () => {
  return process.env.API_DEBUG_LOGIN_BODY || '{"username":"","password":""}';
};

// Get login description from environment variable
const getLoginDescription = () => {
  return process.env.API_DEBUG_LOGIN_DESCRIPTION || 'Save returned token to common headers in debug tool, field name Authorization, field value Bearer token';
};

// Get API debug config file path
const getApiConfigPath = () => {
  const configDir = process.env.CONFIG_DIR || './.setting';
  return path.join(configDir, 'api.json');
};

// Load API debug config
const loadApiConfig = () => {
  const apiConfigPath = getApiConfigPath();
  try {
    if (fs.existsSync(apiConfigPath)) {
      const configData = fs.readFileSync(apiConfigPath, 'utf8');
      return JSON.parse(configData);
    }
  } catch (err) {
    console.error('Failed to read API config file:', err.message);
  }
  return {
    baseUrl: '',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    list: []
  };
};

// Save API debug config
const saveApiConfig = (apiConfig) => {
  const configDir = process.env.CONFIG_DIR || './.setting';
  const apiConfigPath = path.join(configDir, 'api.json');
  
  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(apiConfigPath, JSON.stringify(apiConfig, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to save API config file:', err.message);
    return false;
  }
};

// Detect content type based on body content
const detectContentType = (body) => {
  if (typeof body !== 'string') {
    return 'application/json';
  }
  
  const trimmedBody = body.trim();
  
  // Check for XML
  if (trimmedBody.startsWith('<') && trimmedBody.endsWith('>')) {
    return 'application/xml';
  }
  
  // Check for HTML
  if (trimmedBody.includes('<html') || trimmedBody.includes('<!DOCTYPE html')) {
    return 'text/html';
  }
  
  // Check for JSON
  try {
    JSON.parse(trimmedBody);
    return 'application/json';
  } catch {
    // Not JSON, continue checking
  }
  
  // Check for URL encoded format
  if (trimmedBody.includes('=') && trimmedBody.includes('&')) {
    return 'application/x-www-form-urlencoded';
  }
  
  // Check for plain text patterns
  if (trimmedBody.includes('\n') || trimmedBody.includes('\r')) {
    return 'text/plain';
  }
  
  // Default to text/plain
  return 'text/plain';
};

/**
 * API 调试工具 - 执行 API 请求和调试
 * @param {Object} params - 参数
 * @param {string} params.action - 操作类型 ('get', 'set', 'delete', 'execute', 'updateBaseUrl', 'updateHeaders', 'deleteHeader', 'search')
 * @param {Object} params.config - API 调试配置
 * @param {string} params.config.baseUrl - API 基础 URL
 * @param {Object} params.config.headers - 公共请求头
 * @param {Array} params.config.list - API 接口列表
 * @param {string} params.index - 要执行的接口索引（执行时必需）
 * @param {string} params.baseUrl - 新的基础 URL（updateBaseUrl 时必需）
 * @param {Object} params.headers - 新的公共请求头（updateHeaders 时必需）
 * @param {string} params.headerName - 要删除的请求头名称（deleteHeader 时必需）
 * @param {string} params.keyword - 搜索关键词（search 时必需）
 * @param {Object} config - 服务器配置
 * @param {Function} saveConfig - 保存配置函数
 * @returns {Object} API 调试结果
 */
async function api_debug(params, config, saveConfig) {
  const { action, config: apiConfig, index } = params || {};
  
  if (!action) {
    throw new Error('Missing action parameter. Must be "get", "set", "delete", "execute", "updateBaseUrl", "updateHeaders", "deleteHeader", or "search"');
  }
  
  if (action === 'get') {
    try {
      // 从 api.json 文件中获取配置
      const apiDebugConfig = loadApiConfig();
      return apiDebugConfig;
    } catch (err) {
      throw new Error(`Failed to get API debug config: ${err.message}`);
    }
  } else if (action === 'set') {
    if (!apiConfig) {
      throw new Error('Missing config parameter for set action');
    }
    
    try {
      // 加载现有配置
      const existingConfig = loadApiConfig();
      
      // 合并配置，保持 baseUrl 和 headers
      const mergedConfig = {
        baseUrl: apiConfig.baseUrl || existingConfig.baseUrl || '',
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
      
      // 保存到 api.json 文件
      const saved = saveApiConfig(mergedConfig);
      if (!saved) {
        throw new Error('Failed to save API configuration');
      }
      
      return {
        success: true,
        message: `Successfully updated API debug config. Total APIs: ${mergedConfig.list.length}`,
        totalApis: mergedConfig.list.length,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      throw new Error(`Failed to update API debug config: ${err.message}`);
    }
  } else if (action === 'delete') {
    if (!index && index !== 0) {
      throw new Error('Missing index parameter for delete action');
    }
    
    try {
      // 加载当前配置
      const apiDebugConfig = loadApiConfig();
      
      if (!apiDebugConfig.list) {
        apiDebugConfig.list = [];
      }
      
      // 删除指定索引的接口
      if (index >= 0 && index < apiDebugConfig.list.length) {
        const deletedItem = apiDebugConfig.list.splice(index, 1)[0];
        
        // 保存配置
        const saved = saveApiConfig(apiDebugConfig);
        if (!saved) {
          throw new Error('Failed to save API configuration');
        }
        
        return {
          success: true,
          message: `Successfully deleted API at index ${index}`,
          deletedItem: deletedItem,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(`Invalid index: ${index}. Must be between 0 and ${apiDebugConfig.list.length - 1}`);
      }
    } catch (err) {
      throw new Error(`Failed to delete API: ${err.message}`);
    }
  } else if (action === 'execute') {
    if (!index && index !== 0) {
      throw new Error('Missing index parameter for execute action');
    }
    
    try {
      // 加载当前配置
      const apiDebugConfig = loadApiConfig();
      
      if (!apiDebugConfig.list || !Array.isArray(apiDebugConfig.list)) {
        throw new Error('API list not found or invalid');
      }
      
      if (index < 0 || index >= apiDebugConfig.list.length) {
        throw new Error(`Invalid index: ${index}. Must be between 0 and ${apiDebugConfig.list.length - 1}`);
      }
      
      const apiItem = apiDebugConfig.list[index];
      const baseUrl = apiDebugConfig.baseUrl || '';
      const commonHeaders = apiDebugConfig.headers || {};
      
      // 验证请求方法是否被允许
      const allowedMethods = getAllowedMethods();
      const requestMethod = (apiItem.method || 'GET').toUpperCase();
      const loginUrl = getLoginUrl();
      
      // 判断是否为登录接口 - 支持完整 URL 和相对路径匹配
      const isLoginRequest = (() => {
        const apiUrl = apiItem.url;
        const loginUrlPattern = loginUrl;
        
        // 如果登录 URL 是完整 URL，提取路径部分进行匹配
        if (loginUrlPattern.startsWith('http://') || loginUrlPattern.startsWith('https://')) {
          try {
            const url = new URL(loginUrlPattern);
            const loginPath = url.pathname;
            // 匹配完整路径或去掉前导斜杠的路径
            return apiUrl === loginPath || apiUrl === loginPath.replace(/^\//, '') || apiUrl === loginUrlPattern;
          } catch (e) {
            // 如果 URL 解析失败，回退到字符串匹配
            return apiUrl === loginUrlPattern;
          }
        } else {
          // 相对路径匹配
          return apiUrl === loginUrlPattern || 
                 apiUrl === loginUrlPattern.replace(/^\//, '') || 
                 apiUrl.endsWith(loginUrlPattern) ||
                 apiUrl.endsWith(loginUrlPattern.replace(/^\//, ''));
        }
      })();
      
      if (!allowedMethods.includes(requestMethod)) {
        // 如果是登录接口，继续执行；否则返回错误
        if (!isLoginRequest) {
          throw new Error(`Method ${requestMethod} is not allowed. Allowed methods: ${allowedMethods.join(', ')}`);
        }
      }
      
      // 构建完整 URL
      const fullUrl = baseUrl + apiItem.url;
      
      // 合并请求头
      const headers = {
        ...commonHeaders,
        ...apiItem.header
      };
      
      // 处理请求体
      let body = null;
      if (apiItem.body && (apiItem.method === 'POST' || apiItem.method === 'PUT' || apiItem.method === 'PATCH')) {
        if (typeof apiItem.body === 'string') {
          // 检查是否指定了 Content-Type
          if (apiItem.contentType) {
            headers['Content-Type'] = apiItem.contentType;
            body = apiItem.body;
          } else {
            // 自动判断 Content-Type
            const detectedType = detectContentType(apiItem.body);
            headers['Content-Type'] = detectedType;
            body = apiItem.body;
          }
        } else if (typeof apiItem.body === 'object') {
          // 检查是否指定了 Content-Type
          if (apiItem.contentType) {
            if (apiItem.contentType === 'application/x-www-form-urlencoded') {
              // 转换为 URL 编码格式
              const formData = new URLSearchParams();
              Object.entries(apiItem.body).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                  formData.append(key, value);
                }
              });
              headers['Content-Type'] = 'application/x-www-form-urlencoded';
              body = formData.toString();
            } else {
              // 其他指定类型，直接序列化
              headers['Content-Type'] = apiItem.contentType;
              body = JSON.stringify(apiItem.body);
            }
          } else {
            // 自动判断：对象默认使用 JSON 格式
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(apiItem.body);
          }
        }
      }
      
      // 处理查询参数
      let queryString = '';
      if (apiItem.query && Object.keys(apiItem.query).length > 0) {
        const queryParams = new URLSearchParams();
        Object.entries(apiItem.query).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            queryParams.append(key, value);
          }
        });
        queryString = queryParams.toString();
      }
      
      const finalUrl = queryString ? `${fullUrl}?${queryString}` : fullUrl;
      
      let success = true;
      let response;
      let responseData;
      let error = null;
      
      // 请求处理部分 - 只有这部分出错才会保存到 api.json
      try {
        
        // 如果是登录接口且方法不被允许，使用环境变量中的登录配置
        if (isLoginRequest && !allowedMethods.includes(requestMethod)) {
          const loginMethod = getLoginMethod();
          const loginBody = getLoginBody();
          
          // 更新请求方法和请求体
          apiItem.method = loginMethod;
          if (loginBody) {
            apiItem.body = loginBody;
          }
          
          // 更新最终 URL 和方法
          const updatedFinalUrl = queryString ? `${fullUrl}?${queryString}` : fullUrl;
          
          try {
            response = await fetch(updatedFinalUrl, {
              method: loginMethod,
              headers: headers,
              body: loginBody
            });
          } catch (fetchError) {
            error = fetchError.message;
            success = false;
            response = null;
          }
        } else {
          try {
            // 执行请求
            response = await fetch(finalUrl, {
              method: apiItem.method || 'GET',
              headers: headers,
              body: body
            });
          } catch (fetchError) {
            error = fetchError.message;
            success = false;
            response = null;
          }
        }
        
        if (response) {
          // 获取响应数据
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
          } else {
            responseData = await response.text();
          }
          
          // 判断请求是否成功（HTTP 状态码 200-299 为成功）
          const isHttpSuccess = response.status >= 200 && response.status < 300;
          success = isHttpSuccess;
          
          // 记录响应信息
          apiDebugConfig.list[index].data = responseData;
          apiDebugConfig.list[index].status = response.status;
          apiDebugConfig.list[index].statusText = response.statusText;
          apiDebugConfig.list[index].responseHeaders = Object.fromEntries(response.headers.entries());
          apiDebugConfig.list[index].lastExecuted = new Date().toISOString();
          apiDebugConfig.list[index].success = isHttpSuccess;
          apiDebugConfig.list[index].error = isHttpSuccess ? null : `HTTP ${response.status}: ${response.statusText}`;
        } else {
          // 记录失败信息
          success = false;
          apiDebugConfig.list[index].data = null;
          apiDebugConfig.list[index].status = null;
          apiDebugConfig.list[index].statusText = null;
          apiDebugConfig.list[index].responseHeaders = null;
          apiDebugConfig.list[index].lastExecuted = new Date().toISOString();
          apiDebugConfig.list[index].success = false;
          apiDebugConfig.list[index].error = error;
        }
        
        // 去重处理：相同的 URL 只保留一份（保留最新的执行结果）
        const urlMap = new Map();
        apiDebugConfig.list.forEach(item => {
          if (item.url) {
            urlMap.set(item.url, item);
          }
        });
        apiDebugConfig.list = Array.from(urlMap.values());
        
        // 无论成功还是失败，都保存配置
        saveApiConfig(apiDebugConfig);
        
      } catch (requestError) {
        // 只有请求相关的错误才保存到 api.json
        try {
          apiDebugConfig.list[index].lastExecuted = new Date().toISOString();
          apiDebugConfig.list[index].success = false;
          apiDebugConfig.list[index].error = requestError.message;
          saveApiConfig(apiDebugConfig);
        } catch (saveErr) {
          console.error('Failed to save request error information:', saveErr.message);
        }
      }
      
      if (success && response) {
        return {
          success: true,
          message: `Successfully executed API: ${apiItem.description || apiItem.url}`,
          request: {
            url: finalUrl,
            method: apiItem.method || 'GET',
            headers: headers,
            body: body
          },
          response: {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            data: responseData
          },
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          message: `Failed to execute API: ${apiItem.description || apiItem.url}`,
          request: {
            url: finalUrl,
            method: apiItem.method || 'GET',
            headers: headers,
            body: body
          },
          error: error || (response ? `HTTP ${response.status}: ${response.statusText}` : 'Request failed'),
          timestamp: new Date().toISOString()
        };
      }
    } catch (err) {
      // 如果是在保存配置时出错，也要尝试记录错误信息
      try {
        const apiDebugConfig = loadApiConfig();
        if (apiDebugConfig.list && apiDebugConfig.list[index]) {
          apiDebugConfig.list[index].lastExecuted = new Date().toISOString();
          apiDebugConfig.list[index].success = false;
          apiDebugConfig.list[index].error = err.message;
          saveApiConfig(apiDebugConfig);
        }
      } catch (saveErr) {
        // 如果连保存都失败了，记录到控制台
        console.error('Failed to save error information:', saveErr.message);
      }
      
      throw new Error(`Failed to execute API: ${err.message}`);
    }
  } else if (action === 'updateBaseUrl') {
    const { baseUrl } = params;
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
    const { headers } = params;
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
    const { headerName } = params;
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
    const { keyword } = params;
    if (!keyword) {
      throw new Error('Missing keyword parameter for search action');
    }
    
    try {
      const apiDebugConfig = loadApiConfig();
      let searchResults = [];
      
      if (apiDebugConfig.list && Array.isArray(apiDebugConfig.list)) {
        searchResults = apiDebugConfig.list.filter((item) => {
          return item.url.toLowerCase().includes(keyword.toLowerCase()) || item.description.toLowerCase().includes(keyword.toLowerCase());
        });
      }
      
      return {
        success: true,
        message: `Found ${searchResults.length} matching API(s) for keyword: "${keyword}"`,
        keyword: keyword,
        results: searchResults,
        totalCount: searchResults.length,
        timestamp: new Date().toISOString()
           
         
      }
 
    } catch (err) {
      throw new Error(`Failed to search APIs: ${err.message}`);
    }
  } else {
    throw new Error('Invalid action. Must be "get", "set", "delete", "execute", "updateBaseUrl", "updateHeaders", "deleteHeader", or "search"');
  }
}


module.exports = api_debug;
