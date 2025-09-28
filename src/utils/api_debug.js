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
    throw new Error('Missing url parameter');
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
                  text: "❌ JSON Parse Error Detected\n\nThe request body starts with { but cannot be parsed as a valid JSON object."
                },
                {
                  type: "text",
                  text: "⚠️ IMPORTANT: You MUST use addApi to add the API to the list first!\n\nDirect execution is not possible with invalid JSON. You must follow these steps:"
                },
                {
                  type: "text",
                  text: "🔧 Step 1: Add API to Configuration (REQUIRED)\n\nCall: api_config with action=\"addApi\" and api={\"url\":\"${url}\",\"method\":\"${requestMethod}\",\"body\":\"your corrected JSON here\"}\n\nThis will store the API configuration for future use."
                },
                {
                  type: "text",
                  text: "🔧 Step 2: Execute API by Index\n\nAfter adding the API, call: api_execute with index=<returned index>\n\nThis will execute the pre-configured API with the correct format."
                },
                {
                  type: "text",
                  text: "🚨 REMINDER: You MUST use addApi first!\n\n- Cannot execute API directly with invalid JSON\n- Must add to configuration list using api_config tool\n- Then use api_execute with the returned index"
                },
                {
                  type: "text",
                  text: "💡 Why This Approach is Required:\n- Invalid JSON cannot be processed directly\n- addApi allows you to fix the JSON format\n- Configuration is saved for reuse\n- Better error handling and debugging"
                },
                {
                  type: "text",
                  text: "📋 Final Reminder: Use addApi → Then api_execute\n\n1. First: api_config with action=\"addApi\"\n2. Then: api_execute with index=<number>\n\nThis is the ONLY way to handle invalid JSON requests."
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
