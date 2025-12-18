const { getLoginUrl, getLoginMethod, getLoginBody, loadApiConfig, saveApiConfig } = require('./api_common');
const https = require('https');

// Create an agent for HTTPS requests that skips certificate verification
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * API Login Tool - Execute login request directly (Get login info from environment variables)
 * @param {Object} params - Parameters
 * @param {string} params.baseUrl - Base URL (optional, overrides baseUrl in configuration)
 * @param {Object} config - Server configuration
 * @param {Function} saveConfig - Save configuration function
 * @returns {Object} Login result
 */
async function api_login(params, config, saveConfig) {
  const { baseUrl } = params || {};

  try {
    // Load current configuration
    const apiDebugConfig = loadApiConfig();
    
    // Use passed baseUrl or baseUrl from configuration
    const finalBaseUrl = baseUrl || apiDebugConfig.baseUrl || '';
    const loginUrl = getLoginUrl();
    const loginMethod = getLoginMethod();
    
    // Build full login URL
    let fullLoginUrl;
    if (loginUrl.startsWith('http://') || loginUrl.startsWith('https://')) {
      fullLoginUrl = loginUrl;
    } else {
      fullLoginUrl = finalBaseUrl + loginUrl;
    }
    
    // Get login request body from environment variables
    const loginBodyRaw = getLoginBody();
    let loginBody;
    
    // Process request body in different formats
    if (typeof loginBodyRaw === 'string') {
      // If it's a string, use it directly
      loginBody = loginBodyRaw;
    } else if (typeof loginBodyRaw === 'object') {
      // If it's an object, convert to JSON string
      loginBody = JSON.stringify(loginBodyRaw);
    } else {
      // Otherwise, use default format
      loginBody = '{"username":"","password":""}';
    }

    // Prepare request headers
    const headers = {
      ...apiDebugConfig.headers,
      'Content-Type': 'application/json'
    };

    // Execute login request
    let response;
    let responseData;
    let success = true;
    let error = null;

    try {
      const fetchOptions = {
        method: loginMethod,
        headers: headers,
        body: loginBody
      };
      
      // Add agent to HTTPS requests to skip certificate verification
      if (fullLoginUrl.startsWith('https')) {
        fetchOptions.agent = httpsAgent;
      }
      
      response = await fetch(fullLoginUrl, fetchOptions);

      // Get response data
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Determine if login was successful
      const isHttpSuccess = response.status >= 200 && response.status < 300;
      success = isHttpSuccess;

      if (success) {
        // Login successful, try to extract token and update common headers
        let token = null;

        // Try to extract token from response
        if (responseData && typeof responseData === 'object') {
          // Common token field names
          const tokenFields = ['token', 'access_token', 'accessToken', 'authToken', 'jwt'];
          for (const field of tokenFields) {
            if (responseData[field]) {
              token = responseData[field];
              break;
            }
          }
        }

        // If token is found, automatically update Authorization header
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
