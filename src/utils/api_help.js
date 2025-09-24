/**
 * API Help Tool - Returns detailed documentation and examples for API debugging tools
 * @param {Object} params - Parameters
 * @param {string} params.tool - Tool name to view (optional, returns all tools by default)
 * @param {Object} config - Server configuration
 * @param {Function} saveConfig - Save configuration function
 * @returns {Object} Tool documentation and examples
 */
async function api_help(params, config, saveConfig) {
  const { tool } = params || {};
  
  const helpContent = {
    api_debug: {
      name: 'api_debug',
      description: 'API Debug Tool - Direct API request execution',
      usage: 'Directly pass URL and parameters to execute API requests without complex action parameters',
      supportedFormats: [
        'JSON Object: {"username": "admin", "password": "123456"}',
        'Form Data: "username=admin&password=123456"',
        'Plain Text: "Hello World"',
        'XML: "<user><name>John</name><email>john@example.com</email></user>"',
        'HTML: "<html><body>Content</body></html>"'
      ],
      autoContentTypeDetection: {
        'JSON Object': 'application/json',
        'Form Data': 'application/x-www-form-urlencoded',
        'XML': 'application/xml',
        'HTML': 'text/html',
        'Plain Text': 'text/plain'
      },
      examples: [
        {
          description: 'Simple GET request',
          request: {
            url: '/api/users',
            method: 'GET',
            query: { page: 1, limit: 10 }
          }
        },
        {
          description: 'POST request with JSON body',
          request: {
            url: '/api/login',
            method: 'POST',
            body: { username: 'admin', password: '123456' },
            headers: { 'Content-Type': 'application/json' }
          }
        },
        {
          description: 'PUT request with form data',
          request: {
            url: '/api/users/123',
            method: 'PUT',
            body: 'name=John&email=john@example.com',
            contentType: 'application/x-www-form-urlencoded'
          }
        },
        {
          description: 'DELETE request with authentication',
          request: {
            url: '/api/users/123',
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer token123' }
          }
        }
      ],
      bestPractices: [
        'Use relative URLs: /api/endpoint instead of full URLs',
        'Set baseUrl through api_config tool',
        'Let the tool auto-detect content type unless you have special needs',
        'Use query parameters for GET requests instead of body',
        'Set authentication information through headers parameter'
      ]
    },
    api_login: {
      name: 'api_login',
      description: 'API Login Tool - Authentication using environment variables',
      usage: 'No parameters required, directly gets login information from environment variables',
      environmentVariables: {
        'API_DEBUG_LOGIN_URL': 'Login API URL (default: /api/login)',
        'API_DEBUG_LOGIN_METHOD': 'Login request method (default: POST)',
        'API_DEBUG_LOGIN_BODY': 'Login request body template (supports JSON and string formats)',
        'API_DEBUG_LOGIN_DESCRIPTION': 'Login API description'
      },
      features: [
        'Automatically gets login configuration from environment variables',
        'Supports JSON and string formats for login body',
        'Automatically extracts token and updates Authorization header',
        'Supports custom baseUrl parameter'
      ],
      examples: [
        {
          description: 'Basic login (using environment variable configuration)',
          request: {}
        },
        {
          description: 'Login with specified baseUrl',
          request: {
            baseUrl: 'https://api.example.com'
          }
        }
      ]
    },
    api_config: {
      name: 'api_config',
      description: 'API Configuration Management Tool - Manage global API configuration',
      usage: 'Use action parameter to specify operation type',
      actions: {
        'get': 'Get current configuration',
        'set': 'Set complete configuration',
        'updateBaseUrl': 'Update base URL',
        'updateHeaders': 'Update request headers',
        'deleteHeader': 'Delete specified header',
        'addApi': 'Add API endpoint',
        'search': 'Search APIs',
        'list': 'List all APIs'
      },
      examples: [
        {
          description: 'Get configuration',
          request: { action: 'get' }
        },
        {
          description: 'Update base URL',
          request: { 
            action: 'updateBaseUrl', 
            baseUrl: 'https://api.example.com' 
          }
        },
        {
          description: 'Update request headers',
          request: { 
            action: 'updateHeaders', 
            headers: { 'Authorization': 'Bearer token123' } 
          }
        },
        {
          description: 'Search APIs',
          request: { 
            action: 'search', 
            keyword: 'user' 
          }
        },
        {
          description: 'Add API endpoint',
          request: { 
            action: 'addApi', 
            api: {
              url: '/api/users',
              method: 'GET',
              description: 'Get user list',
              query: { page: 1, limit: 10 }
            }
          }
        }
      ]
    },
    api_execute: {
      name: 'api_execute',
      description: 'API Execute Tool - Execute configured APIs by index',
      usage: 'Use index parameter to specify API index, optional overrides parameter to override configuration',
      parameters: {
        index: 'API index (required, non-negative integer)',
        overrides: 'Override parameters (optional object)'
      },
      overrides: {
        url: 'Override API URL',
        method: 'Override HTTP method',
        headers: 'Override or add request headers',
        query: 'Override query parameters',
        body: 'Override request body',
        contentType: 'Override content type'
      },
      examples: [
        {
          description: 'Execute API at index 0',
          request: { index: 0 }
        },
        {
          description: 'Execute API at index 1 with method override',
          request: { 
            index: 1, 
            overrides: { method: 'POST' }
          }
        },
        {
          description: 'Execute API with body and header overrides',
          request: { 
            index: 2, 
            overrides: { 
              method: 'PUT',
              body: { name: 'New Name' },
              headers: { 'Content-Type': 'application/json' }
            }
          }
        }
      ]
    }
  };
  
  if (tool && helpContent[tool]) {
    return {
      success: true,
      tool: helpContent[tool],
      timestamp: new Date().toISOString()
    };
  } else {
    return {
      success: true,
      message: 'API Debugging Tools Help Documentation',
      tools: helpContent,
      quickStart: {
        '1. Set Configuration': 'Use api_config tool to set baseUrl and headers',
        '2. Add APIs': 'Use api_config tool with addApi action to add API endpoints',
        '3. Login Authentication': 'Use api_login tool for authentication (if needed)',
        '4. Execute APIs': 'Use api_execute tool to execute APIs by index, or use api_debug tool for direct execution',
        '5. View Help': 'Use api_help tool to view detailed documentation'
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = api_help;
