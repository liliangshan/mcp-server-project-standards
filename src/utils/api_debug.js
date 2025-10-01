const { getAllowedMethods, loadApiConfig, saveApiConfig, detectContentType } = require('./api_common');

/**
 * API 调试工具 - 直接执行API请求
 * 
 * 支持的请求体格式：
 * 1. JSON对象: {"username": "admin", "password": "123456"}
 * 2. 表单数据: "username=admin&password=123456"
 * 3. 纯文本: "Hello World"
 * 4. XML: "<user><name>John</name><email>john@example.com</email></user>"
 * 5. HTML: "<html><body>Content</body></html>"
 * 
 * 自动内容类型检测：
 * - JSON对象 → application/json
 * - 表单数据 → application/x-www-form-urlencoded
 * - XML → application/xml
 * - HTML → text/html
 * - 纯文本 → text/plain
 * 
 * @param {Object} params - 参数
 * @param {string} params.url - 要执行的接口URL（必需）
 * @param {string} params.method - HTTP方法（可选，默认GET）
 * @param {Object} params.headers - 额外请求头（可选）
 * @param {Object} params.query - 查询参数（可选）
 * @param {*} params.body - 请求体（可选，支持多种格式）
 * @param {string} params.contentType - 内容类型（可选，会自动检测）
 * @param {Object} config - 服务器配置
 * @param {Function} saveConfig - 保存配置函数
 * @returns {Object} API调试结果
 */
async function api_debug(params, config, saveConfig) {
  const { url, method = 'GET', headers = {}, query, body, contentType } = params || {};
  
  if (!url) {
    return {
      contentType: "text",
      content: [
        {
          type: "text",
          text: "⚠️ IMPORTANT: URL parameter is required for API debugging!\n\n🔧 Step 1: Provide URL Parameter\n\nCall: api_debug with url parameter\n\nExample: {\"url\": \"/api/users\", \"method\": \"GET\"}\n\n⚠️ REMINDER: URL is required for API execution!"
        },
        {
          type: "text",
          text: "🔧 Step 2: Optional Parameters\n\nYou can also provide:\n- method: GET, POST, PUT, DELETE, PATCH\n- headers: Additional request headers\n- query: Query parameters\n- body: Request body\n- contentType: Content type override"
        },
        {
          type: "text",
          text: "🚨 REMINDER: URL is mandatory!\n\n- Use api_debug with url parameter\n- URL can be relative (/api/users) or absolute (https://api.example.com/users)"
        },
        {
          type: "text",
          text: "💡 IMPORTANT: Remember to provide URL!\n\n- First: api_debug with url parameter\n- Second: Add other optional parameters as needed"
        },
        {
          type: "text",
          text: "📋 Final Reminder: URL is required\n\n1. First: api_debug with url parameter\n2. Then: Add optional parameters\n\nThis is the ONLY way to execute API requests."
        },
        {
          type: "text",
          text: "⚠️ ESSENTIAL: URL parameter is required!\n\n- Use api_debug with url parameter\n- URL can be relative or absolute"
        }
      ]
    };
  }
  
  try {
    // 加载当前配置
    const apiDebugConfig = loadApiConfig();
    
    // 验证请求方法是否被允许
    const allowedMethods = getAllowedMethods();
    const requestMethod = method.toUpperCase();
    
    if (!allowedMethods.includes(requestMethod)) {
      throw new Error(`Method ${requestMethod} is not allowed. Allowed methods: ${allowedMethods.join(', ')}`);
    }
    
    // 构建完整 URL
    let fullUrl;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      fullUrl = url;
    } else {
      const baseUrl = apiDebugConfig.baseUrl || '';
      fullUrl = baseUrl + url;
    }
    
    // 合并请求头
    const finalHeaders = {
      ...apiDebugConfig.headers,
      ...headers
    };
    
    // 处理请求体
    let requestBody = null;
    if (body && (requestMethod === 'POST' || requestMethod === 'PUT' || requestMethod === 'PATCH')) {
      if (typeof body === 'string') {
        // 检查是否以 { 开头但无法解析为JSON对象
        if (body.trim().startsWith('{')) {
          try {
            JSON.parse(body);
            // 如果能解析成功，继续正常处理
          } catch (parseError) {
            // 无法解析为JSON，给出建议
            return {
              contentType: "text",
              content: [
                {
                  type: "text",
                  text: "⚠️ IMPORTANT: You MUST use addApi to add the API to the list first! Use api_config tool.\n\n🔧 Step 1: Add API to Configuration (REQUIRED)\n\nCall: api_config with action=\"addApi\" and api={\"url\":\"${url}\",\"method\":\"${requestMethod}\",\"body\":\"your corrected JSON here\"}\n\n⚠️ REMINDER: You MUST use api_config with addApi to add the API to the list!"
                },
                {
                  type: "text",
                  text: "🔧 Step 2: Execute API by Index\n\nAfter adding the API, call: api_execute with index=<returned index>\n\nThis will execute the pre-configured API with the correct format."
                },
                {
                  type: "text",
                  text: "🚨 REMINDER: You MUST use addApi first!\n\n- Use api_config with action=\"addApi\" to add the API to the list\n- Then use api_execute with the returned index to execute"
                },
                {
                  type: "text",
                  text: "💡 IMPORTANT: Remember to use addApi!\n\n- First: api_config with action=\"addApi\" to add the API\n- Second: api_execute with index to run the API"
                },
                {
                  type: "text",
                  text: "📋 Final Reminder: Use addApi → Then api_execute\n\n1. First: api_config with action=\"addApi\"\n2. Then: api_execute with index=<number>\n\nThis is the ONLY way to handle invalid JSON requests."
                },
                {
                  type: "text",
                  text: "⚠️ ESSENTIAL: You MUST use addApi!\n\n- First: api_config with action=\"addApi\" to add the API\n- Second: api_execute with index to run the API"
                }
              ]
            };
          }
        }
        
        // 检查是否指定了 Content-Type
        if (contentType) {
          finalHeaders['Content-Type'] = contentType;
          requestBody = body;
        } else {
          // 自动判断 Content-Type
          const detectedType = detectContentType(body);
          finalHeaders['Content-Type'] = detectedType;
          requestBody = body;
        }
      } else if (typeof body === 'object') {
        // 检查是否指定了 Content-Type
        if (contentType) {
          if (contentType === 'application/x-www-form-urlencoded') {
            // 转换为 URL 编码格式
            const formData = new URLSearchParams();
            Object.entries(body).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                formData.append(key, value);
              }
            });
            finalHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
            requestBody = formData.toString();
          } else {
            // 其他指定类型，直接序列化
            finalHeaders['Content-Type'] = contentType;
            requestBody = JSON.stringify(body);
          }
        } else {
          // 自动判断：对象默认使用 JSON 格式
          finalHeaders['Content-Type'] = 'application/json';
          requestBody = JSON.stringify(body);
        }
      }
    }
    
    // 处理查询参数
    let queryString = '';
    if (query && Object.keys(query).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      });
      queryString = queryParams.toString();
    }
    
    const finalRequestUrl = queryString ? `${fullUrl}?${queryString}` : fullUrl;
    
    let success = true;
    let response;
    let responseData;
    let error = null;
    
    try {
      // 执行请求
      response = await fetch(finalRequestUrl, {
        method: requestMethod,
        headers: finalHeaders,
        body: requestBody
      });
      
      // 获取响应数据
      const responseContentType = response.headers.get('content-type');
      
      if (responseContentType && responseContentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      
      // 判断请求是否成功（HTTP 状态码 200-299 为成功）
      const isHttpSuccess = response.status >= 200 && response.status < 300;
      success = isHttpSuccess;
      
    } catch (requestError) {
      error = requestError.message;
      success = false;
    }
    
    if (success && response) {
      return {
        success: true,
        message: `Successfully executed API: ${url}`,
        request: {
          url: finalRequestUrl,
          method: requestMethod,
          headers: finalHeaders,
          body: requestBody
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
        message: `Failed to execute API: ${url}`,
        request: {
          url: finalRequestUrl,
          method: requestMethod,
          headers: finalHeaders,
          body: requestBody
        },
        error: error || (response ? `HTTP ${response.status}: ${response.statusText}` : 'Request failed'),
        timestamp: new Date().toISOString()
      };
    }
  } catch (err) {
    throw new Error(`Failed to execute API: ${err.message}`);
  }
}

module.exports = api_debug;
