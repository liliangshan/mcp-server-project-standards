const fs = require('fs-extra');
const path = require('path');

// Import tool modules
const project_info = require('./utils/get_project_info');
const project_structure = require('./utils/get_project_structure');
const api_standards = require('./utils/get_api_standards');
const development_standards = require('./utils/get_development_standards');
const database_standards = require('./utils/database_standards');
const api_login = require('./utils/api_login');
const api_debug = require('./utils/api_debug');
const api_config = require('./utils/api_config');
const api_help = require('./utils/api_help');
const api_execute = require('./utils/api_execute');

// Get configuration from file or environment
const getConfig = () => {
  const configDir = process.env.CONFIG_DIR || './.setting';
  const configPath = path.join(configDir, 'config.json');

  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    }
  } catch (err) {
    console.error('Failed to read config file:', err.message);
  }

  // Return null if no config file exists - this will trigger the notification
  return null;
};

// Save configuration to file
const saveConfig = (config) => {
  const configDir = process.env.CONFIG_DIR || './.setting';
  const configPath = path.join(configDir, 'config.json');

  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to save config file:', err.message);
    return false;
  }
};

// 启动日志
console.error('=== MCP Project Standards Server Starting ===');
console.error(`Time: ${new Date().toISOString()}`);
console.error(`Config Dir: ${process.env.CONFIG_DIR || './.setting'}`);
console.error('==============================================');

// Final MCP Server
class ProjectStandardsMCPServer {
  constructor() {
    this.name = 'project-standards-mcp-server';
    this.version = '1.2.2';
    this.initialized = false;
    this.config = getConfig();
    this.needsProjectFolder = this.config === null;

    // 如果配置文件不存在，创建默认配置
    if (this.needsProjectFolder) {
      this.createDefaultConfig();
    }
  }

  // 创建默认配置文件
  createDefaultConfig() {
    const configDir = process.env.CONFIG_DIR || './.setting';
    const configPath = path.join(configDir, 'config.json');

    try {
      // 创建配置目录
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
        console.error(`Created config directory: ${configDir}`);
      }

      // 创建默认配置文件
      const defaultConfig = {
        project_info: {},
        project_structure: [],
        api_standards: {},
        development_standards: [],
        database_standards: []
      };

      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
      console.error(`Created default config file: ${configPath}`);

      // 更新配置和状态
      this.config = defaultConfig;
      this.needsProjectFolder = false;
    } catch (err) {
      console.error('Failed to create default config:', err.message);
      // 保持 needsProjectFolder = true 状态
    }
  }


  // Project information tool
  async project_info(params) {
    const result = await project_info(params, this.config, saveConfig);
    // Update local config if action was 'set'
    if (params?.action === 'set') {
      this.config = getConfig();
    }
    return result;
  }

  // Project structure tool
  async project_structure(params) {
    const result = await project_structure(params, this.config, saveConfig);
    // Update local config if action was 'set'
    if (params?.action === 'set') {
      this.config = getConfig();
    }
    return result;
  }

  // API standards tool
  async api_standards(params) {
    const result = await api_standards(params, this.config, saveConfig);
    // Update local config if action was 'set'
    if (params?.action === 'set') {
      this.config = getConfig();
    }
    return result;
  }

  // Development standards tool
  async development_standards(params) {
    const result = await development_standards(params, this.config, saveConfig);
    // Update local config if action was 'set'
    if (params?.action === 'set') {
      this.config = getConfig();
    }
    return result;
  }

  // Database standards tool
  async database_standards(params) {
    const result = await database_standards(params, this.config, saveConfig);
    // Update local config if action was 'set'
    if (params?.action === 'set') {
      this.config = getConfig();
    }
    return result;
  }

  // API debug tool (legacy)
  async api_debug(params) {
    const result = await api_debug(params, this.config, saveConfig);
    // Update local config if action was 'set'
    if (params?.action === 'set') {
      this.config = getConfig();
    }
    return result;
  }

  // API login tool
  async api_login(params) {
    const result = await api_login(params, this.config, saveConfig);
    return result;
  }

  // API debug tool
  async api_debug(params) {
    const result = await api_debug(params, this.config, saveConfig);
    return result;
  }

  // API config tool
  async api_config(params) {
    const result = await api_config(params, this.config, saveConfig);
    return result;
  }

  // API help tool
  async api_help(params) {
    const result = await api_help(params, this.config, saveConfig);
    return result;
  }

  // API execute tool
  async api_execute(params) {
    const result = await api_execute(params, this.config, saveConfig);
    return result;
  }




  // Handle JSON-RPC requests
  async handleRequest(request) {
    try {
      const { jsonrpc, id, method, params } = request;

      if (jsonrpc !== '2.0') {
        throw new Error('Unsupported JSON-RPC version');
      }

      let result = null;
      let error = null;

      try {
        if (method === 'initialize') {
          // If already initialized, return success but don't re-initialize
          if (!this.initialized) {
            this.initialized = true;
          }

          // Build server capabilities to match client capabilities
          const serverCapabilities = {
            tools: {
              listChanged: false
            }
          };

          // If client supports prompts, we also support it
          if (params?.capabilities?.prompts) {
            serverCapabilities.prompts = {
              listChanged: false
            };
          }

          // If client supports resources, we also support it
          if (params?.capabilities?.resources) {
            serverCapabilities.resources = {
              listChanged: false
            };
          }

          // If client supports logging, we also support it
          if (params?.capabilities?.logging) {
            serverCapabilities.logging = {
              listChanged: false
            };
          }

          // If client supports roots, we also support it
          if (params?.capabilities?.roots) {
            serverCapabilities.roots = {
              listChanged: false
            };
          }

          result = {
            protocolVersion: params?.protocolVersion || '2025-06-18',
            capabilities: serverCapabilities,
            serverInfo: {
              name: this.name,
              version: this.version
            }
          };
        } else if (method === 'tools/list') {
          const tools = [];

          // Add all tools since config is always available now
          tools.push({
            name: 'project_info',
            description: 'Get or set project information in configuration file',
            inputSchema: {
              type: 'object',
              properties: {
                action: {
                  type: 'string',
                  enum: ['get', 'set'],
                  description: 'Action to perform: "get" to retrieve info, "set" to update info'
                },
                key: {
                  type: 'string',
                  enum: ['projectName', 'developmentLanguage', 'basicInfo'],
                  description: 'Key to update when action is "set" (projectName|developmentLanguage|basicInfo)'
                },
                value: {
                  description: 'Value to set when action is "set"'
                }
              },
              required: ['action'],
              anyOf: [
                {
                  properties: {
                    action: { const: 'get' }
                  }
                },
                {
                  properties: {
                    action: { const: 'set' },
                    key: { type: 'string' },
                    value: {}
                  },
                  required: ['key', 'value']
                }
              ]
            }
          });

          tools.push({
            name: 'project_structure',
            description: 'Get, set or delete project structure in configuration',
            inputSchema: {
              type: 'object',
              properties: {
                action: {
                  type: 'string',
                  enum: ['get', 'set', 'delete'],
                  description: 'Action to perform: "get" to retrieve structure, "set" to update structure, "delete" to delete structure item'
                },
                structure: {
                  type: 'array',
                  description: 'Array of structure items with path and description (required for "set" action)',
                  items: {
                    type: 'object',
                    properties: {
                      path: {
                        type: 'string',
                        description: 'Path of the structure item'
                      },
                      description: {
                        type: 'string',
                        description: 'Description of the structure item'
                      }
                    },
                    required: ['path', 'description']
                  }
                },
                path: {
                  type: 'string',
                  description: 'Path to delete when action is "delete"'
                }
              },
              required: ['action'],
              anyOf: [
                {
                  properties: {
                    action: { const: 'get' }
                  }
                },
                {
                  properties: {
                    action: { const: 'set' },
                    structure: { type: 'array' }
                  },
                  required: ['structure']
                },
                {
                  properties: {
                    action: { const: 'delete' },
                    path: { type: 'string' }
                  },
                  required: ['path']
                }
              ]
            }
          });

          tools.push({
            name: 'api_standards',
            description: 'Get, set or delete API interface standards and best practices',
            inputSchema: {
              type: 'object',
              properties: {
                action: {
                  type: 'string',
                  enum: ['get', 'set', 'delete'],
                  description: 'Action to perform: "get" to retrieve standards, "set" to update standards, "delete" to delete header'
                },
                key: {
                  type: 'string',
                  enum: ['interfaceType', 'successStructure', 'errorStructure', 'basicHeaders', 'requirements'],
                  description: 'Key to update when action is "set" (interfaceType|successStructure|errorStructure|basicHeaders|requirements)'
                },
                value: {
                  oneOf: [
                    { type: 'string' },
                    { type: 'array' }
                  ],
                  description: 'Value to set when action is "set" (must be string or array)'
                },
                forceOverwrite: {
                  type: 'boolean',
                  description: 'Force overwrite array values when action is "set" and value is array (default: false)'
                },
                headerName: {
                  type: 'string',
                  description: 'Header name to delete when action is "delete"'
                },
                requirement: {
                  type: 'string',
                  description: 'Requirement content to delete when action is "delete"'
                }
              },
              required: ['action'],
              anyOf: [
                {
                  properties: {
                    action: { const: 'get' }
                  }
                },
                {
                  properties: {
                    action: { const: 'set' },
                    key: { type: 'string' },
                    value: {}
                  },
                  required: ['key', 'value']
                },
                {
                  properties: {
                    action: { const: 'delete' },
                    headerName: { type: 'string' }
                  },
                  required: ['headerName']
                },
                {
                  properties: {
                    action: { const: 'delete' },
                    requirement: { type: 'string' }
                  },
                  required: ['requirement']
                }
              ]
            }
          },
            {
              name: 'development_standards',
              description: 'Get, set or delete development standards',
              inputSchema: {
                type: 'object',
                properties: {
                  action: {
                    type: 'string',
                    enum: ['get', 'set', 'delete'],
                    description: 'Action to perform: "get" to retrieve standards, "set" to update standards, "delete" to delete standard'
                  },
                  standards: {
                    type: 'array',
                    description: 'Array of development standards (required for "set" action)',
                    items: {
                      type: 'string'
                    }
                  },
                  forceOverwrite: {
                    type: 'boolean',
                    description: 'Force overwrite array values when action is "set" and value is array (default: false)'
                  },
                  standard: {
                    type: 'string',
                    description: 'Standard content to delete when action is "delete"'
                  }
                },
                required: ['action'],
                anyOf: [
                  {
                    properties: {
                      action: { const: 'get' }
                    }
                  },
                  {
                    properties: {
                      action: { const: 'set' },
                      standards: { type: 'array' }
                    },
                    required: ['standards']
                  },
                  {
                    properties: {
                      action: { const: 'delete' },
                      standard: { type: 'string' }
                    },
                    required: ['standard']
                  }
                ]
              }
            },
            {
              name: 'database_standards',
              description: 'Get, set or delete database standards',
              inputSchema: {
                type: 'object',
                properties: {
                  action: {
                    type: 'string',
                    enum: ['get', 'set', 'delete'],
                    description: 'Action to perform: "get" to retrieve standards, "set" to update standards, "delete" to delete standard'
                  },
                  standards: {
                    type: 'array',
                    description: 'Array of database standards (required for "set" action)',
                    items: {
                      type: 'string'
                    }
                  },
                  forceOverwrite: {
                    type: 'boolean',
                    description: 'Force overwrite array values when action is "set" and value is array (default: false)'
                  },
                  standard: {
                    type: 'string',
                    description: 'Standard content to delete when action is "delete"'
                  }
                },
                required: ['action'],
                anyOf: [
                  {
                    properties: {
                      action: { const: 'get' }
                    }
                  },
                  {
                    properties: {
                      action: { const: 'set' },
                      standards: { type: 'array' }
                    },
                    required: ['standards']
                  },
                  {
                    properties: {
                      action: { const: 'delete' },
                      standard: { type: 'string' }
                    },
                    required: ['standard']
                  }
                ]
              }
            }
          );


          // API Login Tool
          tools.push({
            name: 'api_login',
            description: 'API login authentication tool that uses environment variables for login credentials. Automatically extracts token from response and updates Authorization headers. Example: Call with optional baseUrl parameter to override default base URL',
            inputSchema: {
              type: 'object',
              properties: {
                baseUrl: {
                  type: 'string',
                  description: 'Base URL for login request (optional, will override config baseUrl)'
                }
              }
            }
          });

          // API Debug Tool
          tools.push({
            name: 'api_debug',
            description: 'API debugging tool for directly executing API requests with automatic content-type detection and flexible body format support. Examples: GET /api/users with query params, POST /api/login with JSON body {"username":"admin","password":"123456"}, PUT /api/users/123 with form data "name=John&email=john@example.com"',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'API URL to execute (required)',
                  examples: ['/api/users', 'https://api.example.com/users', '/api/login']
                },
                method: {
                  type: 'string',
                  enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                  description: 'HTTP method (optional, defaults to GET)',
                  examples: ['GET', 'POST', 'PUT']
                },
                headers: {
                  type: 'object',
                  description: 'Additional headers for the request (optional)',
                  examples: [
                    {'Authorization': 'Bearer token123'},
                    {'Content-Type': 'application/json'},
                    {'X-API-Key': 'your-api-key'}
                  ]
                },
                query: {
                  type: 'object',
                  description: 'Query parameters (optional)',
                  examples: [
                    {'page': 1, 'limit': 10},
                    {'search': 'keyword', 'sort': 'name'},
                    {'id': 123, 'status': 'active'}
                  ]
                },
                body: {
                  description: 'Request body (optional) - Supports multiple formats: JSON object, form data, or plain text',
                  examples: [
                    'JSON Object: {"username": "admin", "password": "123456"}',
                    'Form Data: "username=admin&password=123456"',
                    'Plain Text: "Hello World"',
                    'XML: "<user><name>John</name><email>john@example.com</email></user>"'
                  ]
                },
                contentType: {
                  type: 'string',
                  description: 'Content-Type for request body (optional, will auto-detect if not specified)',
                  examples: [
                    'application/json',
                    'application/x-www-form-urlencoded',
                    'text/plain',
                    'application/xml',
                    'text/html'
                  ]
                }
              },
              required: ['url'],
              examples: [
                {
                  description: 'Simple GET request',
                  url: '/api/users',
                  method: 'GET',
                  query: {'page': 1, 'limit': 10}
                },
                {
                  description: 'POST request with JSON body',
                  url: '/api/login',
                  method: 'POST',
                  body: {'username': 'admin', 'password': '123456'},
                  headers: {'Content-Type': 'application/json'}
                },
                {
                  description: 'PUT request with form data',
                  url: '/api/users/123',
                  method: 'PUT',
                  body: 'name=John&email=john@example.com',
                  contentType: 'application/x-www-form-urlencoded'
                },
                {
                  description: 'POST request with XML body',
                  url: '/api/data',
                  method: 'POST',
                  body: '<data><item>value</item></data>',
                  contentType: 'application/xml'
                }
              ]
            }
          });

        // API Help Tool
        tools.push({
          name: 'api_help',
          description: 'API help tool that provides detailed documentation and examples for all API debugging tools. Use this to understand how to use api_debug, api_login, and api_config tools effectively',
          inputSchema: {
            type: 'object',
            properties: {
              tool: {
                type: 'string',
                description: 'Specific tool name to get help for (optional: api_debug, api_login, api_config)',
                examples: ['api_debug', 'api_login', 'api_config']
              }
            }
          }
        });

        // API Execute Tool
        tools.push({
          name: 'api_execute',
          description: 'Execute API requests by index from configured API list. Examples: execute API at index 0, execute with overrides {"method":"POST","body":{"key":"value"}}',
          inputSchema: {
            type: 'object',
            properties: {
              index: {
                type: 'number',
                description: 'Index of the API to execute from the configured list (required)',
                minimum: 0
              },
              overrides: {
                type: 'object',
                description: 'Optional parameters to override the configured API settings',
                properties: {
                  url: {
                    type: 'string',
                    description: 'Override the API URL'
                  },
                  method: {
                    type: 'string',
                    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                    description: 'Override the HTTP method'
                  },
                  headers: {
                    type: 'object',
                    description: 'Override or add request headers'
                  },
                  query: {
                    type: 'object',
                    description: 'Override query parameters'
                  },
                  body: {
                    description: 'Override request body'
                  },
                  contentType: {
                    type: 'string',
                    description: 'Override content type'
                  }
                }
              }
            },
            required: ['index']
          }
        });

          // API Config Tool
          tools.push({
            name: 'api_config',
            description: 'API configuration management tool for managing API settings, endpoints, and configurations. Examples: get config, set baseUrl to "https://api.example.com", updateHeaders with {"Authorization":"Bearer token"}, search APIs by keyword, list all configured APIs',
            inputSchema: {
              type: 'object',
              properties: {
                action: {
                  type: 'string',
                  enum: ['get', 'set', 'updateBaseUrl', 'updateHeaders', 'deleteHeader', 'addApi', 'search', 'list'],
                  description: 'Action to perform: "get" to retrieve config, "set" to update config, "updateBaseUrl" to update base URL, "updateHeaders" to update headers, "deleteHeader" to delete header, "addApi" to add API endpoint, "search" to search APIs, "list" to list all APIs'
                },
                config: {
                  type: 'object',
                  description: 'API configuration (required for "set" action)',
                  properties: {
                    baseUrl: {
                      type: 'string',
                      description: 'Base URL for API requests'
                    },
                    headers: {
                      type: 'object',
                      description: 'Common headers for all requests'
                    },
                    list: {
                      type: 'array',
                      description: 'List of API endpoints',
                      items: {
                        type: 'object',
                        properties: {
                          description: {
                            type: 'string',
                            description: 'API description'
                          },
                          url: {
                            type: 'string',
                            description: 'API endpoint URL'
                          },
                          method: {
                            type: 'string',
                            enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                            description: 'HTTP method'
                          },
                          query: {
                            type: 'object',
                            description: 'Query parameters'
                          },
                          body: {
                            description: 'Request body'
                          },
                          contentType: {
                            type: 'string',
                            description: 'Content-Type for request body'
                          },
                          header: {
                            type: 'object',
                            description: 'Additional headers for this specific request'
                          }
                        },
                        required: ['url']
                      }
                    }
                  }
                },
                baseUrl: {
                  type: 'string',
                  description: 'New base URL (required for "updateBaseUrl" action)'
                },
                headers: {
                  type: 'object',
                  description: 'New headers to add or update (required for "updateHeaders" action)'
                },
                headerName: {
                  type: 'string',
                  description: 'Name of header to delete (required for "deleteHeader" action)'
                },
                api: {
                  type: 'object',
                  description: 'API configuration (required for "addApi" action)',
                  properties: {
                    url: {
                      type: 'string',
                      description: 'API endpoint URL'
                    },
                    method: {
                      type: 'string',
                      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                      description: 'HTTP method'
                    },
                    description: {
                      type: 'string',
                      description: 'API description'
                    },
                    query: {
                      type: 'object',
                      description: 'Query parameters'
                    },
                    body: {
                      description: 'Request body'
                    },
                    contentType: {
                      type: 'string',
                      description: 'Content-Type for request body'
                    },
                    header: {
                      type: 'object',
                      description: 'Additional headers for this specific request'
                    }
                  },
                  required: ['url']
                },
                keyword: {
                  type: 'string',
                  description: 'Search keyword (required for "search" action)'
                }
              },
              required: ['action'],
              anyOf: [
                {
                  properties: {
                    action: { const: 'get' }
                  }
                },
                {
                  properties: {
                    action: { const: 'list' }
                  }
                },
                {
                  properties: {
                    action: { const: 'set' },
                    config: { type: 'object' }
                  },
                  required: ['config']
                },
                {
                  properties: {
                    action: { const: 'updateBaseUrl' },
                    baseUrl: { type: 'string' }
                  },
                  required: ['baseUrl']
                },
                {
                  properties: {
                    action: { const: 'updateHeaders' },
                    headers: { type: 'object' }
                  },
                  required: ['headers']
                },
                {
                  properties: {
                    action: { const: 'deleteHeader' },
                    headerName: { type: 'string' }
                  },
                  required: ['headerName']
                },
                {
                  properties: {
                    action: { const: 'addApi' },
                    api: { type: 'object' }
                  },
                  required: ['api']
                },
                {
                  properties: {
                    action: { const: 'search' },
                    keyword: { type: 'string' }
                  },
                  required: ['keyword']
                }
              ]
            }
          });


          result = {
            tools: tools,
            environment: {
              CONFIG_DIR: process.env.CONFIG_DIR || './.setting',
              serverInfo: {
                name: this.name,
                version: this.version
              }
            }
          };
        } else if (method === 'prompts/list') {
          result = {
            prompts: []
          };
        } else if (method === 'prompts/call') {
          result = {
            messages: [
              {
                role: 'assistant',
                content: [
                  {
                    type: 'text',
                    text: 'Unsupported prompts call'
                  }
                ]
              }
            ]
          };
        } else if (method === 'resources/list') {
          result = {
            resources: []
          };
        } else if (method === 'resources/read') {
          result = {
            contents: [
              {
                uri: 'error://unsupported',
                text: 'Unsupported resources read'
              }
            ]
          };
        } else if (method === 'logging/list') {
          result = {
            logs: []
          };
        } else if (method === 'logging/read') {
          result = {
            contents: [
              {
                uri: 'error://unsupported',
                text: 'Unsupported logging read'
              }
            ]
          };
        } else if (method === 'roots/list') {
          result = {
            roots: []
          };
        } else if (method === 'roots/read') {
          result = {
            contents: [
              {
                uri: 'error://unsupported',
                text: 'Unsupported roots read'
              }
            ]
          };
        } else if (method === 'tools/call') {
          const { name, arguments: args } = params || {};

          if (!name) {
            throw new Error('Missing tool name');
          }

          // Check if method exists
          if (!this[name]) {
            throw new Error(`Unknown tool: ${name}`);
          }

          result = await this[name](args || {});

          // Check if result has contentType (special format)
          if (result && result.contentType === "text") {
            // Return the result as-is for special text format
            return {
              jsonrpc: '2.0',
              id,
              result
            };
          }

          // Tool call results need to be wrapped in content
          result = {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } else if (method === 'ping') {
          result = { pong: true };
        } else if (method === 'shutdown') {
          result = null;
          setTimeout(() => {
            process.exit(0);
          }, 100);
        } else if (method === 'notifications/initialized') {
          // Load configuration on initialization
          this.config = getConfig();
          console.error('Project Standards MCP server initialized');
        } else if (method === 'notifications/exit') {
          result = null;
          process.exit(0);
        } else {
          throw new Error(`Unknown method: ${method}`);
        }
      } catch (err) {
        error = err.message;
        throw err;
      } finally {
        // No logging
      }

      // For notification methods, no response is needed
      if (method === 'notifications/initialized' || method === 'notifications/exit') {
        return null;
      }

      // shutdown method needs to return response
      if (method === 'shutdown') {
        return {
          jsonrpc: '2.0',
          id,
          result: null
        };
      }

      return {
        jsonrpc: '2.0',
        id,
        result
      };
    } catch (error) {
      // Use standard MCP error codes
      let errorCode = -32603; // Internal error
      let errorMessage = error.message;

      if (error.message.includes('Server not initialized')) {
        errorCode = -32002; // Server not initialized
      } else if (error.message.includes('Unknown method')) {
        errorCode = -32601; // Method not found
      } else if (error.message.includes('Unsupported JSON-RPC version')) {
        errorCode = -32600; // Invalid Request
      }
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: errorCode,
          message: errorMessage
        }
      };
    }
  }

  // Start server
  async start() {
    console.error('MCP Project Standards server started');

    // Listen to stdin
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', async (data) => {
      try {
        const lines = data.toString().trim().split('\n');

        for (const line of lines) {
          if (line.trim()) {
            try {
              const request = JSON.parse(line);
              const response = await this.handleRequest(request);
              if (response) {
                console.log(JSON.stringify(response));
              }
            } catch (requestError) {
              console.error('Error processing individual request:', requestError.message);
              const errorResponse = {
                jsonrpc: '2.0',
                id: null,
                error: {
                  code: -32603,
                  message: `Internal error: ${requestError.message}`
                }
              };
              console.log(JSON.stringify(errorResponse));
            }
          }
        }
      } catch (error) {
        console.error('Error processing data:', error.message);
      }
    });

    // Handle process signals
    process.on('SIGTERM', async () => {
      console.error('Received SIGTERM signal, shutting down server...');
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.error('Received SIGINT signal, shutting down server...');
      process.exit(0);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Promise rejection:', reason);
      process.exit(1);
    });
  }
}

// Start server
async function main() {
  console.error('Starting MCP Project Standards server...');
  const server = new ProjectStandardsMCPServer();
  await server.start();
  console.error('MCP Project Standards server started successfully');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
