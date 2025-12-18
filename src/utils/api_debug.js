const { getAllowedMethods, loadApiConfig, saveApiConfig, detectContentType } = require('./api_common');
const https = require('https');

// Create an agent for HTTPS requests that skips certificate verification
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * API Debug Tool - Direct API request execution
 * 
 * Supported body formats:
 * 1. JSON object: {"username": "admin", "password": "123456"}
 * 2. Form data: "username=admin&password=123456"
 * 3. Plain text: "Hello World"
 * 4. XML: "<user><name>John</name><email>john@example.com</email></user>"
 * 5. HTML: "<html><body>Content</body></html>"
 * 
 * Auto content-type detection:
 * - JSON object → application/json
 * - Form data → application/x-www-form-urlencoded
 * - XML → application/xml
 * - HTML → text/html
 * - Plain text → text/plain
 * 
 * @param {Object} params - Parameters
 * @param {string} params.url - API URL to execute (required)
 * @param {string} params.method - HTTP method (optional, default GET)
 * @param {Object} params.headers - Additional request headers (optional)
 * @param {Object} params.query - Query parameters (optional)
 * @param {*} params.body - Request body (optional, supports multiple formats)
 * @param {string} params.contentType - Content-Type (optional, will be auto-detected)
 * @param {Object} config - Server configuration
 * @param {Function} saveConfig - Save configuration function
 * @returns {Object} API debug result
 */
async function api_debug(params, config, saveConfig) {
  const { url, method = 'GET', headers = {}, query, body, contentType } = params || {};
  
  // Resolve dynamic tool names based on prefix and project name
  const toolPrefix = process.env.TOOL_PREFIX || '';
  const projectName = process.env.PROJECT_NAME || '';
  const hasCustomTools = !!(toolPrefix && projectName);
  const configToolName = hasCustomTools ? `${toolPrefix}_api_config` : 'api_config';
  const executeToolName = hasCustomTools ? `${toolPrefix}_api_execute` : 'api_execute';
  
  if (!url) {
    return {
              contentType: "text",
              content: [
                {
                  type: "text",
                  text: `⚠️ IMPORTANT: You MUST use addApi to add the API to the list first! Use ${configToolName} tool.\n\n🔧 Step 1: Add API to Configuration (REQUIRED)\n\nCall: ${configToolName} with action="addApi" and api={"url":"<your url>","method":"<METHOD>","body":"your corrected JSON here"}\n\n⚠️ REMINDER: You MUST use ${configToolName} with addApi to add the API to the list!`
                },
                {
                  type: "text",
                  text: `🔧 Step 2: Execute API by Index\n\nAfter adding the API, call: ${executeToolName} with index=<returned index>\n\nThis will execute the pre-configured API with the correct format.`
                },
                {
                  type: "text",
                  text: `🚨 REMINDER: You MUST use addApi first!\n\n- Use ${configToolName} with action="addApi" to add the API to the list\n- Then use ${executeToolName} with the returned index to execute`
                },
                {
                  type: "text",
                  text: `💡 IMPORTANT: Remember to use addApi!\n\n- First: ${configToolName} with action="addApi" to add the API\n- Second: ${executeToolName} with index to run the API`
                },
                {
                  type: "text",
                  text: `📋 Final Reminder: Use addApi → Then ${executeToolName}\n\n1. First: ${configToolName} with action="addApi"\n2. Then: ${executeToolName} with index=<number>\n\nThis is the ONLY way to handle invalid JSON requests.`
                },
                {
                  type: "text",
                  text: `⚠️ ESSENTIAL: You MUST use addApi!\n\n- First: ${configToolName} with action="addApi" to add the API\n- Second: ${executeToolName} with index to run the API`
                }
              ]
            };
  }
  
  try {
    // Load current configuration
    const apiDebugConfig = loadApiConfig();
    
    // Verify if the request method is allowed
    const allowedMethods = getAllowedMethods();
    const requestMethod = method.toUpperCase();
    
    if (!allowedMethods.includes(requestMethod)) {
      throw new Error(`Method ${requestMethod} is not allowed. Allowed methods: ${allowedMethods.join(', ')}`);
    }
    
    // Build full URL
    let fullUrl;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      fullUrl = url;
    } else {
      const baseUrl = apiDebugConfig.baseUrl || '';
      fullUrl = baseUrl + url;
    }
    
    // Merge request headers
    const finalHeaders = {
      ...apiDebugConfig.headers,
      ...headers
    };
    
    // Process request body
    let requestBody = null;
    if (body && (requestMethod === 'POST' || requestMethod === 'PUT' || requestMethod === 'PATCH')) {
      if (typeof body === 'string') {
        // Check if it starts with { but cannot be parsed as a JSON object
        if (body.trim().startsWith('{')) {
          try {
            JSON.parse(body);
            // If can parse successfully, continue normal processing
          } catch (parseError) {
            // Cannot parse as JSON, give suggestions
            return {
              contentType: "text",
              content: [
                {
                  type: "text",
                  text: `⚠️ IMPORTANT: You MUST use addApi to add the API to the list first! Use ${configToolName} tool.\n\n🔧 Step 1: Add API to Configuration (REQUIRED)\n\nCall: ${configToolName} with action="addApi" and api={"url":"${url}","method":"${requestMethod}","body":"your corrected JSON here"}\n\n⚠️ REMINDER: You MUST use ${configToolName} with addApi to add the API to the list!`
                },
                {
                  type: "text",
                  text: `🔧 Step 2: Execute API by Index\n\nAfter adding the API, call: ${executeToolName} with index=<returned index>\n\nThis will execute the pre-configured API with the correct format.`
                },
                {
                  type: "text",
                  text: `🚨 REMINDER: You MUST use addApi first!\n\n- Use ${configToolName} with action="addApi" to add the API to the list\n- Then use ${executeToolName} with the returned index to execute`
                },
                {
                  type: "text",
                  text: `💡 IMPORTANT: Remember to use addApi!\n\n- First: ${configToolName} with action="addApi" to add the API\n- Second: ${executeToolName} with index to run the API`
                },
                {
                  type: "text",
                  text: `📋 Final Reminder: Use addApi → Then ${executeToolName}\n\n1. First: ${configToolName} with action="addApi"\n2. Then: ${executeToolName} with index=<number>\n\nThis is the ONLY way to handle invalid JSON requests.`
                },
                {
                  type: "text",
                  text: `⚠️ ESSENTIAL: You MUST use addApi!\n\n- First: ${configToolName} with action="addApi" to add the API\n- Second: ${executeToolName} with index to run the API`
                }
              ]
            };
          }
        }
        
        // Check if Content-Type is specified
        if (contentType) {
          finalHeaders['Content-Type'] = contentType;
          requestBody = body;
        } else {
          // Auto-detect Content-Type
          const detectedType = detectContentType(body);
          finalHeaders['Content-Type'] = detectedType;
          requestBody = body;
        }
      } else if (typeof body === 'object') {
        // Check if Content-Type is specified
        if (contentType) {
          if (contentType === 'application/x-www-form-urlencoded') {
            // Convert to URL encoded format
            const formData = new URLSearchParams();
            Object.entries(body).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                formData.append(key, value);
              }
            });
            finalHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
            requestBody = formData.toString();
          } else {
            // Other specified types, serialize directly
            finalHeaders['Content-Type'] = contentType;
            requestBody = JSON.stringify(body);
          }
        } else {
          // Auto-detect: objects default to JSON format
          finalHeaders['Content-Type'] = 'application/json';
          requestBody = JSON.stringify(body);
        }
      }
    }
    
    // Process query parameters
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
      // Execute request
      const fetchOptions = {
        method: requestMethod,
        headers: finalHeaders,
        body: requestBody
      };
      
      // Add agent to HTTPS requests to skip certificate verification
      if (finalRequestUrl.startsWith('https')) {
        fetchOptions.agent = httpsAgent;
      }
      
      response = await fetch(finalRequestUrl, fetchOptions);
      
      // Get response data
      const responseContentType = response.headers.get('content-type');
      
      if (responseContentType && responseContentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      
      // Determine if the request was successful (HTTP status code 200-299)
      const isHttpSuccess = response.status >= 200 && response.status < 300;
      success = isHttpSuccess;
      
    } catch (requestError) {
      error = requestError.message;
      success = false;
    }
    
    if (success && response) {
      // Automatically add interface to the configuration list
      try {
        const apiConfig = loadApiConfig();
        if (!apiConfig.list) {
          apiConfig.list = [];
        }
        
        // Check if the same interface already exists
        const existingApiIndex = apiConfig.list.findIndex(api => 
          api.url === url && api.method === requestMethod
        );
        
        if (existingApiIndex === -1) {
          // If it doesn't exist, add to the list
          const newApi = {
            url: url,
            method: requestMethod,
            description: `API added from api_debug: ${url}`,
            headers: headers,
            query: query,
            body: body,
            contentType: contentType
          };
          
          apiConfig.list.push(newApi);
          saveApiConfig(apiConfig);
          
          return {
            success: true,
            message: `Successfully executed API: ${url} (Added to list at index ${apiConfig.list.length - 1})`,
            apiIndex: apiConfig.list.length - 1,
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
          // If it already exists, update the interface information
          apiConfig.list[existingApiIndex] = {
            ...apiConfig.list[existingApiIndex],
            url: url,
            method: requestMethod,
            headers: headers,
            query: query,
            body: body,
            contentType: contentType
          };
          saveApiConfig(apiConfig);
          
          return {
            success: true,
            message: `Successfully executed API: ${url} (Updated existing API at index ${existingApiIndex})`,
            apiIndex: existingApiIndex,
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
        }
      } catch (saveError) {
        // If saving fails, still return a success response
        console.error('Failed to save API to list:', saveError.message);
        return {
          success: true,
          message: `Successfully executed API: ${url} (Failed to save to list)`,
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
      }
    } else {
      // Return response data even on failure
      return {
        success: false,
        message: `Failed to execute API: ${url}`,
        request: {
          url: finalRequestUrl,
          method: requestMethod,
          headers: finalHeaders,
          body: requestBody
        },
        response: response ? {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: responseData
        } : undefined,
        error: error || (response ? `HTTP ${response.status}: ${response.statusText}` : 'Request failed'),
        timestamp: new Date().toISOString()
      };
    }
  } catch (err) {
    throw new Error(`Failed to execute API: ${err.message}`);
  }
}

module.exports = api_debug;
