const fs = require('fs-extra');
const path = require('path');

// Import tool modules
const project_info = require('./utils/get_project_info');
const project_structure = require('./utils/get_project_structure');
const api_standards = require('./utils/get_api_standards');
const development_standards = require('./utils/get_development_standards');
const database_standards = require('./utils/database_standards');
const api_debug = require('./utils/api_debug');

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
    this.version = '1.0.0';
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

  // API debug tool
  async api_debug(params) {
    const result = await api_debug(params, this.config, saveConfig);
    // Update local config if action was 'set'
    if (params?.action === 'set') {
      this.config = getConfig();
    }
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
          
          tools.push(              {
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
          
          tools.push(              {
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
          
          // 构建 API 调试工具描述
          let apiDebugDescription = 'API debugging tool for testing and executing API requests';
          
          // 检查是否设置了登录接口环境变量
          const loginUrl = process.env.API_DEBUG_LOGIN_URL;
          const loginMethod = process.env.API_DEBUG_LOGIN_METHOD;
          const loginDescription = process.env.API_DEBUG_LOGIN_DESCRIPTION;
          const allowedMethods = process.env.API_DEBUG_ALLOWED_METHODS;
          
          if (loginUrl || loginMethod || allowedMethods) {
            apiDebugDescription += '\n\n🔐 Login Authentication Configuration:';
            
            if (loginUrl) {
              apiDebugDescription += `\n- Login URL: ${loginUrl}`;
            }
            if (loginMethod) {
              apiDebugDescription += `\n- Login Method: ${loginMethod}`;
            }
            if (loginDescription) {
              apiDebugDescription += `\n- Login Description: ${loginDescription}`;
            }
            if (allowedMethods) {
              apiDebugDescription += `\n- Allowed Methods: ${allowedMethods}`;
            }
            
            apiDebugDescription += '\n\n💡 Usage Instructions:';
            apiDebugDescription += '\n- Login API automatically uses environment variable configuration';
            apiDebugDescription += '\n- Non-login APIs must use allowed methods only';
            apiDebugDescription += '\n- Common request headers are automatically updated after successful login';
          }
          
          tools.push({
            name: 'api_debug',
            description: apiDebugDescription,
            inputSchema: {
              type: 'object',
              properties: {
            action: {
              type: 'string',
              enum: ['get', 'set', 'delete', 'execute', 'updateBaseUrl', 'updateHeaders', 'deleteHeader', 'search'],
              description: 'Action to perform: "get" to retrieve config, "set" to update config, "delete" to delete API, "execute" to execute API, "updateBaseUrl" to update base URL, "updateHeaders" to update headers, "deleteHeader" to delete specific header, "search" to search APIs by URL or description'
            },
                config: {
                  type: 'object',
                  description: 'API debug configuration (required for "set" action)',
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
                      description: 'List of API endpoints to test',
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
                            description: 'Query parameters for GET requests'
                          },
                          body: {
                            description: 'Request body for POST/PUT requests'
                          },
                          contentType: {
                            type: 'string',
                            description: 'Content-Type for request body (optional, will auto-detect if not specified)'
                          },
                          header: {
                            type: 'object',
                            description: 'Additional headers for this specific request'
                          }
                        },
                        required: ['url', 'method']
                      }
                    }
                  }
                },
            index: {
              type: 'number',
              description: 'Index of API to delete or execute (required for "delete" and "execute" actions)'
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
            keyword: {
              type: 'string',
              description: 'Search keyword to match against URL or description (required for "search" action)'
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
                    config: { type: 'object' }
                  },
                  required: ['config']
                },
                {
                  properties: {
                    action: { const: 'delete' },
                    index: { type: 'number' }
                  },
                  required: ['index']
                },
                {
                  properties: {
                    action: { const: 'execute' },
                    index: { type: 'number' }
                  },
                  required: ['index']
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
      } else       if (error.message.includes('Unsupported JSON-RPC version')) {
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
