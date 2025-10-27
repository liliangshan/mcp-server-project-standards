const { loadApiConfig, getAllowedMethods } = require('./api_common');

// 设置全局环境变量以跳过证书验证
if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

/**
 * API 执行工具 - 通过索引执行已配置的API
 * @param {Object} params - 参数
 * @param {number} params.index - API索引（必需）
 * @param {Object} params.overrides - 覆盖参数（可选）
 * @param {string} params.overrides.url - 覆盖URL
 * @param {string} params.overrides.method - 覆盖HTTP方法
 * @param {Object} params.overrides.headers - 覆盖请求头
 * @param {Object} params.overrides.query - 覆盖查询参数
 * @param {*} params.overrides.body - 覆盖请求体
 * @param {string} params.overrides.contentType - 覆盖内容类型
 * @param {Object} config - 服务器配置
 * @param {Function} saveConfig - 保存配置函数
 * @returns {Object} API执行结果
 */
async function api_execute(params, config, saveConfig) {
  const { index, overrides = {} } = params || {};
  
  if (typeof index !== 'number' || index < 0) {
    throw new Error('Invalid index parameter. Must be a non-negative number');
  }
  
  try {
    // 加载API配置
    const apiDebugConfig = loadApiConfig();
    
    if (!apiDebugConfig.list || !Array.isArray(apiDebugConfig.list)) {
      throw new Error('No API list found in configuration');
    }
    
    if (index >= apiDebugConfig.list.length) {
      throw new Error(`API index ${index} is out of range. Available APIs: 0-${apiDebugConfig.list.length - 1}`);
    }
    
    // 获取API配置
    const apiConfig = apiDebugConfig.list[index];
    
    // 合并配置和覆盖参数
    const finalConfig = {
      url: overrides.url || apiConfig.url,
      method: overrides.method || apiConfig.method || 'GET',
      headers: { ...apiDebugConfig.headers, ...apiConfig.header, ...overrides.headers },
      query: overrides.query || apiConfig.query,
      body: overrides.body || apiConfig.body,
      contentType: overrides.contentType || apiConfig.contentType
    };
    
    // 验证HTTP方法
    const allowedMethods = getAllowedMethods();
    if (!allowedMethods.includes(finalConfig.method.toUpperCase())) {
      throw new Error(`HTTP method '${finalConfig.method}' is not allowed. Allowed methods: ${allowedMethods.join(', ')}`);
    }
    
    // 构建完整URL
    let fullUrl;
    if (finalConfig.url.startsWith('http://') || finalConfig.url.startsWith('https://')) {
      fullUrl = finalConfig.url;
    } else {
      fullUrl = apiDebugConfig.baseUrl + finalConfig.url;
    }
    
    // 添加查询参数
    if (finalConfig.query && Object.keys(finalConfig.query).length > 0) {
      const queryString = new URLSearchParams(finalConfig.query).toString();
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
    }
    
    // 准备请求选项
    const requestOptions = {
      method: finalConfig.method.toUpperCase(),
      headers: finalConfig.headers
    };
    
    // 处理请求体
    if (finalConfig.body && ['POST', 'PUT', 'PATCH'].includes(finalConfig.method.toUpperCase())) {
      if (typeof finalConfig.body === 'object') {
        requestOptions.body = JSON.stringify(finalConfig.body);
        if (!finalConfig.headers['Content-Type']) {
          requestOptions.headers['Content-Type'] = 'application/json';
        }
      } else {
        requestOptions.body = finalConfig.body;
        if (finalConfig.contentType && !finalConfig.headers['Content-Type']) {
          requestOptions.headers['Content-Type'] = finalConfig.contentType;
        }
      }
    }
    
    // 执行请求
    const startTime = Date.now();
    const response = await fetch(fullUrl, requestOptions);
    const endTime = Date.now();
    
    // 处理响应
    let responseData;
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    return {
      success: true,
      index: index,
      api: {
        url: apiConfig.url,
        method: apiConfig.method || 'GET',
        description: apiConfig.description
      },
      request: {
        url: fullUrl,
        method: finalConfig.method,
        headers: finalConfig.headers,
        body: finalConfig.body,
        query: finalConfig.query
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      },
      timing: {
        duration: endTime - startTime,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (err) {
    console.error(err);
    throw new Error(`Failed to execute API at index ${index}: ${err.message}`);
  }
}

module.exports = api_execute;
