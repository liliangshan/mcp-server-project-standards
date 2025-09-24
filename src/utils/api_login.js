const { getLoginUrl, getLoginMethod, getLoginBody, loadApiConfig, saveApiConfig } = require('./api_common');

/**
 * API 登录工具 - 直接执行登录请求（从环境变量获取登录信息）
 * @param {Object} params - 参数
 * @param {string} params.baseUrl - 基础URL（可选，会覆盖配置中的baseUrl）
 * @param {Object} config - 服务器配置
 * @param {Function} saveConfig - 保存配置函数
 * @returns {Object} 登录结果
 */
async function api_login(params, config, saveConfig) {
  const { baseUrl } = params || {};

  try {
    // 加载当前配置
    const apiDebugConfig = loadApiConfig();
    
    // 使用传入的baseUrl或配置中的baseUrl
    const finalBaseUrl = baseUrl || apiDebugConfig.baseUrl || '';
    const loginUrl = getLoginUrl();
    const loginMethod = getLoginMethod();
    
    // 构建完整登录URL
    let fullLoginUrl;
    if (loginUrl.startsWith('http://') || loginUrl.startsWith('https://')) {
      fullLoginUrl = loginUrl;
    } else {
      fullLoginUrl = finalBaseUrl + loginUrl;
    }
    
    // 从环境变量获取登录请求体
    const loginBodyRaw = getLoginBody();
    let loginBody;
    
    // 处理不同格式的请求体
    if (typeof loginBodyRaw === 'string') {
      // 如果是字符串，直接使用
      loginBody = loginBodyRaw;
    } else if (typeof loginBodyRaw === 'object') {
      // 如果是对象，转换为JSON字符串
      loginBody = JSON.stringify(loginBodyRaw);
    } else {
      // 其他情况，使用默认格式
      loginBody = '{"username":"","password":""}';
    }

    // 准备请求头
    const headers = {
      ...apiDebugConfig.headers,
      'Content-Type': 'application/json'
    };

    // 执行登录请求
    let response;
    let responseData;
    let success = true;
    let error = null;

    try {
      response = await fetch(fullLoginUrl, {
        method: loginMethod,
        headers: headers,
        body: loginBody
      });

      // 获取响应数据
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // 判断登录是否成功
      const isHttpSuccess = response.status >= 200 && response.status < 300;
      success = isHttpSuccess;

      if (success) {
        // 登录成功，尝试提取token并更新公共请求头
        let token = null;

        // 尝试从响应中提取token
        if (responseData && typeof responseData === 'object') {
          // 常见的token字段名
          const tokenFields = ['token', 'access_token', 'accessToken', 'authToken', 'jwt'];
          for (const field of tokenFields) {
            if (responseData[field]) {
              token = responseData[field];
              break;
            }
          }
        }

        // 如果找到token，自动更新Authorization头
        if (token) {
          apiDebugConfig.headers = {
            ...apiDebugConfig.headers,
            'Authorization': `Bearer ${token}`
          };
          saveApiConfig(apiDebugConfig);
        }

        return {
          success: true,
          message: 'Login successful',
          request: {
            url: fullLoginUrl,
            method: loginMethod,
            headers: headers,
            body: loginBody
          },
          response: {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            data: responseData
          },
          token: token,
          autoUpdatedHeaders: !!token,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          message: `Login failed: HTTP ${response.status}: ${response.statusText}`,
          request: {
            url: fullLoginUrl,
            method: loginMethod,
            headers: headers,
            body: loginBody
          },
          response: {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            data: responseData
          },
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (fetchError) {
      error = fetchError.message;
      success = false;

      return {
        success: false,
        message: `Login request failed: ${error}`,
        request: {
          url: fullLoginUrl,
          method: loginMethod,
          headers: headers,
          body: loginBody
        },
        error: error,
        timestamp: new Date().toISOString()
      };
    }
  } catch (err) {
    throw new Error(`Failed to perform login: ${err.message}`);
  }
}

module.exports = api_login;
