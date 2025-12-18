const { loadApiConfig, getAllowedMethods } = require('./api_common');
const https = require('https');

// Create an agent for HTTPS requests that skips certificate verification
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * API Execute Tool - Execute configured APIs by index
 * @param {Object} params - Parameters
 * @param {number} params.index - API index (required)
 * @param {Object} params.overrides - Override parameters (optional)
 * @param {string} params.overrides.url - Override URL
 * @param {string} params.overrides.method - Override HTTP method
 * @param {Object} params.overrides.headers - Override request headers
 * @param {Object} params.overrides.query - Override query parameters
 * @param {*} params.overrides.body - Override request body
 * @param {string} params.overrides.contentType - Override content type
 * @param {Object} config - Server configuration
 * @param {Function} saveConfig - Save configuration function
 * @returns {Object} API execution result
 */
async function api_execute(params, config, saveConfig) {
  const { index, overrides = {} } = params || {};
  
  if (typeof index !== 'number' || index < 0) {
    throw new Error('Invalid index parameter. Must be a non-negative number');
  }
  
  try {
    // Load API configuration
    const apiDebugConfig = loadApiConfig();
    
    if (!apiDebugConfig.list || !Array.isArray(apiDebugConfig.list)) {
      throw new Error('No API list found in configuration');
    }
    
    if (index >= apiDebugConfig.list.length) {
      throw new Error(`API index ${index} is out of range. Available APIs: 0-${apiDebugConfig.list.length - 1}`);
    }
    
    // Get API configuration
    const apiConfig = apiDebugConfig.list[index];
    
    // Merge configuration and override parameters
    const finalConfig = {
      url: overrides.url || apiConfig.url,
      method: overrides.method || apiConfig.method || 'GET',
      headers: { ...apiDebugConfig.headers, ...apiConfig.header, ...overrides.headers },
      query: overrides.query || apiConfig.query,
      body: overrides.body || apiConfig.body,
      contentType: overrides.contentType || apiConfig.contentType
    };
    
    // Verify HTTP method
    const allowedMethods = getAllowedMethods();
    if (!allowedMethods.includes(finalConfig.method.toUpperCase())) {
      throw new Error(`HTTP method '${finalConfig.method}' is not allowed. Allowed methods: ${allowedMethods.join(', ')}`);
    }
    
    // Build full URL
    let fullUrl;
    if (finalConfig.url.startsWith('http://') || finalConfig.url.startsWith('https://')) {
      fullUrl = finalConfig.url;
    } else {
      fullUrl = apiDebugConfig.baseUrl + finalConfig.url;
    }
    
    // Add query parameters
    if (finalConfig.query && Object.keys(finalConfig.query).length > 0) {
      const queryString = new URLSearchParams(finalConfig.query).toString();
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
    }
    
    // Prepare request options
    const requestOptions = {
      method: finalConfig.method.toUpperCase(),
      headers: finalConfig.headers
    };
    
    // Process request body
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
    
    // Execute request
    const startTime = Date.now();
    let response;
    let responseData;
    let error = null;
    
    try {
      // Add agent to HTTPS requests to skip certificate verification
      if (fullUrl.startsWith('https')) {
        requestOptions.agent = httpsAgent;
      }
      
      response = await fetch(fullUrl, requestOptions);
      
      // Process response
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
    } catch (fetchError) {
      error = fetchError.message;
      throw new Error(`Failed to execute API request: ${error}`);
    }
    
    const endTime = Date.now();
    
    // Determine if the request was successful (HTTP status code 200-299)
    const isHttpSuccess = response.status >= 200 && response.status < 300;
    const success = isHttpSuccess;
    
    return {
      success: success,
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
      error: success ? undefined : (error || `HTTP ${response.status}: ${response.statusText}`),
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
