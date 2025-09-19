# MCP Project Standards Server

A MCP (Model Context Protocol) server for project standards management, designed for AI-assisted development to help teams maintain unified development standards and specifications across multiple machines.

## 📋 Version Updates

### v1.1.0 (2024-12-19)

#### 🆕 New Features
- **API Debug Tool Environment Variable Support**:
  - `API_DEBUG_ALLOWED_METHODS` - Control allowed request methods (default: GET)
  - `API_DEBUG_LOGIN_URL` - Set login API URL (default: /api/login)
  - `API_DEBUG_LOGIN_METHOD` - Set login request method (default: POST)
  - `API_DEBUG_LOGIN_BODY` - Set login request body (default: {"username":"","password":""})
  - `API_DEBUG_LOGIN_DESCRIPTION` - Set login API description (default: Save returned token to common headers in debug tool, field name Authorization, field value Bearer token)

#### 🔧 Feature Improvements
- **Smart Login API Recognition**:
  - Support for full URL and relative path matching
  - Automatic login API recognition using environment variable configuration
  - Non-login APIs strictly follow allowed method restrictions

- **Error Handling Optimization**:
  - Only request-related errors are saved to api.json
  - Method validation errors don't pollute execution records
  - More precise error classification and handling

- **Dynamic Tool Description**:
  - Display login authentication information based on environment variable configuration
  - Real-time display of allowed request methods and usage instructions

#### 🛡️ Security Enhancements
- **Request Method Restrictions**: Default only allows GET requests to prevent accidental operations
- **Login API Exception**: Login APIs can use methods configured in environment variables
- **Flexible Configuration**: Can open more request methods as needed

#### 📚 Documentation Updates
- Added environment variable configuration instructions
- Updated API debug tool usage guide
- Improved login authentication flow documentation

## 🚀 Core Advantages

### 🎯 Solving Multi-Machine Development Chaos
- **Unified Standards**: AI assistants on multiple machines use the same project standards, avoiding inconsistent development styles
- **Team Collaboration**: Eliminates code style differences caused by different developers using different AI configurations

### 🛡️ Enterprise-Grade Development Standards Management
- **Project Information Management**: Unified management of basic project information, tech stack, versions, etc.
- **API Standards Specification**: Define unified interface design standards to ensure API consistency
- **Development Standards**: Code style, naming conventions, architecture standards, etc.
- **Database Standards**: Table structure, naming conventions, indexing strategies, etc.

### 🔧 Simple Configuration Management
- **JSON Configuration**: Simple configuration storage based on JSON files
- **Environment Variables**: Support for specifying configuration file paths through environment variables
- **Auto-Creation**: Automatically creates default configuration files on first run

## ✨ Main Features

- ✅ **Project Information Management** - Unified management of project basic information and configuration
- ✅ **Project Structure Analysis** - Intelligent analysis of project directory structure and dependencies
- ✅ **API Interface Standards** - Define unified API design specifications and best practices
- ✅ **Development Standards** - Code style, naming conventions, architecture standards management
- ✅ **Database Standards** - Table structure design, naming conventions, indexing strategies standardization
- ✅ **API Debugging Tool** - Complete API interface testing and debugging functionality
- ✅ **Configuration Management** - JSON-based configuration storage and management
- ✅ **Auto-Restart** - Intelligent process management and fault recovery
- ✅ **Health Checks** - Real-time service status and performance monitoring

## 🎯 Application Scenarios

### Team Collaborative Development
- **Multi-Developer Environment**: Ensure each developer's AI assistant follows the same project standards
- **Code Review**: Unified code style and standards, reducing review time
- **New Team Member Training**: Quickly help new team members understand project standards and best practices

### Enterprise Projects
- **Large Projects**: Manage complex project structures and multi-module development
- **Microservices Architecture**: Unify API design and database standards across services
- **Multi-Environment Deployment**: Standard consistency across development, testing, and production environments

### AI-Assisted Development
- **Intelligent Code Generation**: AI generates code that conforms to project standards
- **Automatic Refactoring**: Automatically optimize and refactor code based on standards
- **Standards Checking**: Real-time checking of code compliance with project standards

## Installation

### Global Installation (Recommended)
```bash
npm install -g @liangshanli/mcp-server-project-standards
```

### Local Installation
```bash
npm install @liangshanli/mcp-server-project-standards
```

### From Source
```bash
git clone https://github.com/liliangshan/mcp-server-project-standards.git
cd mcp-server-project-standards
npm install
```

## ⚙️ Configuration Management

The server uses the `./.setting/` directory to store configuration files by default. You can specify a different directory using environment variables.

### Environment Variables

| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| CONFIG_DIR | ./.setting | Configuration file directory (contains config.json and api.json) | `export CONFIG_DIR="./config"` |
| API_DEBUG_ALLOWED_METHODS | GET | Control allowed request methods (supports: GET,POST,PUT,DELETE,PATCH, etc.) | `export API_DEBUG_ALLOWED_METHODS="GET,POST"` |
| API_DEBUG_LOGIN_URL | /api/login | Set login API URL | `export API_DEBUG_LOGIN_URL="/api/auth/login"` |
| API_DEBUG_LOGIN_METHOD | POST | Set login request method | `export API_DEBUG_LOGIN_METHOD="POST"` |
| API_DEBUG_LOGIN_BODY | {"username":"","password":""} | Set login request body | `export API_DEBUG_LOGIN_BODY='{"mobile":"","password":""}'` |
| API_DEBUG_LOGIN_DESCRIPTION | Save returned token to common headers in debug tool, field name Authorization, field value Bearer token | Set login API description | `export API_DEBUG_LOGIN_DESCRIPTION="User Login API"` |

### Configuration Files

The server uses two configuration files:
- `config.json` - Project standards configuration
- `api.json` - API debugging configuration

**config.json default values:**
```json
{
  "project_info": {},
  "project_structure": [],
  "api_standards": {},
  "development_standards": [],
  "database_standards": []
}
```

**api.json default values:**
```json
{
  "baseUrl": "",
  "headers": {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  "list": []
}
```

### Configuration Field Description

**config.json fields:**
- **project_info** - Project basic information (project name, development language, description, etc.)
- **project_structure** - Project structure definition (directory and file descriptions)
- **api_standards** - API interface standards (interface type, response structure, request headers, etc.)
- **development_standards** - Development standards (code style, naming conventions, etc.)
- **database_standards** - Database standards (table naming, field naming, etc.)

**api.json fields:**
- **baseUrl** - API base URL
- **headers** - Common request headers (authentication, Content-Type, etc.)
- **list** - API interface list (includes request parameters, response data, execution history, etc.)

## 🚀 Quick Start

### 1. Direct Run (Global Installation)
```bash
mcp-server-project-standards
```

### 2. Using npx (Recommended)
```bash
npx @liangshanli/mcp-server-project-standards
```

### 3. Direct Start (Source Installation)
```bash
npm start
```

### 4. Managed Start (Recommended for Production)
```bash
npm run start-managed
```

Managed start provides:
- Auto-restart (up to 10 times)
- Error recovery
- Process management
- Logging

### 5. Development Mode
```bash
npm run dev
```

## Editor Integration

### Cursor Editor Configuration

1. Create `.cursor/mcp.json` file in your project root:

```json
{
  "mcpServers": {
    "project-standards": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "CONFIG_DIR": "./.setting",
        "API_DEBUG_ALLOWED_METHODS": "GET,POST,PUT,DELETE",
        "API_DEBUG_LOGIN_URL": "/api/login",
        "API_DEBUG_LOGIN_METHOD": "POST",
        "API_DEBUG_LOGIN_BODY": "{\"username\":\"\",\"password\":\"\"}",
        "API_DEBUG_LOGIN_DESCRIPTION": "Save returned token to common headers in debug tool, field name Authorization, field value Bearer token"
      }
    }
  }
}
```

### VS Code Configuration

1. Install the MCP extension for VS Code
2. Create `.vscode/settings.json` file:

```json
{
  "mcp.servers": {
    "project-standards": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "CONFIG_DIR": "./.setting",
        "API_DEBUG_ALLOWED_METHODS": "GET,POST,PUT,DELETE",
        "API_DEBUG_LOGIN_URL": "/api/login",
        "API_DEBUG_LOGIN_METHOD": "POST",
        "API_DEBUG_LOGIN_BODY": "{\"username\":\"\",\"password\":\"\"}",
        "API_DEBUG_LOGIN_DESCRIPTION": "Save returned token to common headers in debug tool, field name Authorization, field value Bearer token"
      }
    }
  }
}
```

## 🛠️ Available Tools

### 1. Project Information Management (project_info)
Get and manage project basic information, including project name, development language, description, etc.

**Parameters:**
- `action` (required): Operation type - "get" to retrieve info, "set" to set info
- `key` (optional): Field to set - "projectName", "developmentLanguage", "basicInfo"
- `value` (optional): Value to set

**Example:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "project_info",
    "arguments": {
      "action": "set",
      "key": "projectName",
      "value": "My Project"
    }
  }
}
```

### 2. Project Structure Management (project_structure)
Get and manage project directory structure with depth control and hidden file inclusion.

**Parameters:**
- `action` (required): Operation type - "get" to retrieve structure, "set" to set structure, "delete" to delete structure item
- `structure` (optional): Structure item array (required for set action)
- `path` (optional): Path to delete (required for delete action)

**Example:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "project_structure",
    "arguments": {
      "action": "set",
      "structure": [
        {
          "path": "/src",
          "description": "Source code directory"
        }
      ]
    }
  }
}
```

### 3. API Standards Management (api_standards)
Get and manage API interface standards and best practices.

**Parameters:**
- `action` (required): Operation type - "get" to retrieve standards, "set" to set standards, "delete" to delete standards
- `key` (optional): Field to set - "interfaceType", "successStructure", "errorStructure", "basicHeaders", "requirements"
- `value` (optional): Value to set
- `forceOverwrite` (optional): Whether to force overwrite array values (default: false)

**Example:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "api_standards",
    "arguments": {
      "action": "set",
      "key": "requirements",
      "value": ["Unified response format", "Error code standards", "Parameter validation"],
      "forceOverwrite": true
    }
  }
}
```

### 4. Development Standards Management (development_standards)
Get and manage development standards, including code style, Git workflow, testing, and documentation.

**Parameters:**
- `action` (required): Operation type - "get" to retrieve standards, "set" to set standards, "delete" to delete standards
- `standards` (optional): Standards array (required for set action)
- `forceOverwrite` (optional): Whether to force overwrite array values (default: false)

**Example:**
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "development_standards",
    "arguments": {
      "action": "set",
      "standards": ["Use 2 spaces for indentation", "Use single quotes", "Use camelCase naming"],
      "forceOverwrite": false
    }
  }
}
```

### 5. Database Standards Management (database_standards)
Get and manage database standards, including table structure design, naming conventions, indexing strategies, etc.

**Parameters:**
- `action` (required): Operation type - "get" to retrieve standards, "set" to set standards, "delete" to delete standards
- `standards` (optional): Standards array (required for set action)
- `forceOverwrite` (optional): Whether to force overwrite array values (default: false)

**Example:**
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "database_standards",
    "arguments": {
      "action": "set",
      "standards": [
        "Use test_ prefix for all table names",
        "Use snake_case for table and field names",
        "Use singular form for table names"
      ],
      "forceOverwrite": true
    }
  }
}
```

### 6. API Debugging Tool (api_debug)
Complete API interface testing and debugging functionality, supporting multiple HTTP methods, authentication, parameter passing, etc.

**Parameters:**
- `action` (required): Operation type - "get" to retrieve config, "set" to update config, "delete" to delete API, "execute" to execute API, "updateBaseUrl" to update base URL, "updateHeaders" to update headers, "deleteHeader" to delete specific header, "search" to search APIs
- `config` (optional): API debug configuration (required for set action)
- `index` (optional): API index (required for execute/delete actions)
- `baseUrl` (optional): New base URL (required for updateBaseUrl action)
- `headers` (optional): New headers (required for updateHeaders action)
- `headerName` (optional): Header name to delete (required for deleteHeader action)
- `keyword` (optional): Search keyword (required for search action)

**Features:**
- **Smart Content-Type Detection**: Automatically detect request body type (JSON, XML, HTML, URL-encoded, etc.)
- **Authentication Management**: Support Bearer Token and other authentication methods
- **URL Deduplication**: Same URL only saves one copy of data, avoiding duplicates
- **Execution Recording**: Record execution history regardless of success or failure
- **Search Function**: Support searching APIs by URL or description
- **Parameter Management**: Support query parameters, request body, custom headers, etc.

**🔐 Special Note - Login Authentication Flow:**

The API debugging tool supports a complete login authentication flow, making it easy to manage API access permissions:

1. **Login API Configuration**:
   - First configure the login API (e.g., `/api/login`)
   - Set login request parameters (username, password, etc.)
   - Execute login request to obtain authentication information

2. **Automatic Token Management**:
   - After successful login, the tool automatically extracts returned `token` or `cookie`
   - Automatically writes authentication information to common request headers (e.g., `Authorization: Bearer token`)
   - All subsequent API requests automatically carry authentication information

3. **Authentication Expiration Handling**:
   - When API returns authentication expired error
   - Re-execute the original login API to get new token
   - Use `updateHeaders` operation to update common request headers
   - Continue debugging other APIs that require authentication

4. **Usage Flow Example**:
   ```bash
   # 1. Configure login API
   api_debug set config={login_api_config}
   
   # 2. Execute login to get token
   api_debug execute index=0
   
   # 3. Update common request headers (automatic)
   api_debug updateHeaders headers={Authorization: Bearer token}
   
   # 4. Debug other APIs that require authentication
   api_debug execute index=1
   
   # 5. If token expires, re-login
   api_debug execute index=0  # Re-execute login
   ```

This design eliminates the need for manual authentication state management, as the tool automatically handles login and token updates, greatly simplifying the API debugging process!

## 🔗 Related Tools for Collaborative Use

To provide a more complete development experience, we recommend using the following MCP tools in collaboration:

### 🗄️ Database Management Tools

**MySQL Database Support**
- **NPM Package**: [@liangshanli/mcp-server-mysql](https://www.npmjs.com/package/@liangshanli/mcp-server-mysql)
- **GitHub Repository**: [mcp-server-mysql](https://github.com/liliangshan/mcp-server-mysql)
- **Features**: DDL operations, permission control, operation logs, connection pool management
- **Highlights**: Supports DDL SQL logging for easy database structure synchronization

**SQL Server Database Support**
- **NPM Package**: [@liangshanli/mcp-server-mssqlserver](https://www.npmjs.com/package/@liangshanli/mcp-server-mssqlserver)
- **GitHub Repository**: [mcp-server-mssqlserver](https://github.com/liliangshan/mcp-server-mssqlserver)
- **Features**: SQL Server database operations, DDL support, permission management
- **Highlights**: Optimized specifically for SQL Server database operations

### 🎨 Icon Management Tools

**Icon Resource Management**
- **NPM Package**: [@liangshanli/mcp-server-icon](https://www.npmjs.com/package/@liangshanli/mcp-server-icon)
- **GitHub Repository**: [mcp-server-icon](https://github.com/liliangshan/mcp-server-icon)
- **Features**: Icon resource management, icon search, icon library integration
- **Highlights**: Supports multiple icon libraries for convenient UI development

### 🚀 Collaborative Development Benefits

**Complete Development Stack**:
- **Project Standards** + **Database Management** + **API Debugging** + **Icon Resources** = Full-stack development solution
- Unified MCP protocol for seamless integration of all tools
- Consistent configuration management and error handling mechanisms

**Team Collaboration**:
- All tools support unified standards across multi-machine environments
- Shared configuration files and logging systems
- Easy onboarding and collaboration for team members

**Development Efficiency**:
- One-stop solution from project standards to database operations to API debugging
- Reduced tool switching costs and improved development efficiency
- Unified error handling and logging

**Usage Example**:
```bash
# 1. Install project standards management tool
npm install -g @liangshanli/mcp-server-project-standards

# 2. Install database management tools (choose as needed)
npm install -g @liangshanli/mcp-server-mysql
# or
npm install -g @liangshanli/mcp-server-mssqlserver

# 3. Install icon management tool
npm install -g @liangshanli/mcp-server-icon

# 4. Configure multiple MCP servers in your editor
```

**Example:**

**Set API Configuration:**
```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "tools/call",
  "params": {
    "name": "api_debug",
    "arguments": {
      "action": "set",
      "config": {
        "baseUrl": "https://api.example.com",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Bearer your-token"
        },
        "list": [
          {
            "description": "User Login",
            "url": "/api/login",
            "method": "POST",
            "body": {
              "username": "user",
              "password": "pass"
            }
          }
        ]
      }
    }
  }
}
```

**Execute API Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": {
    "name": "api_debug",
    "arguments": {
      "action": "execute",
      "index": 0
    }
  }
}
```

**Search API:**
```json
{
  "jsonrpc": "2.0",
  "id": 8,
  "method": "tools/call",
  "params": {
    "name": "api_debug",
    "arguments": {
      "action": "search",
      "keyword": "login"
    }
  }
}
```

**Update Authentication Headers:**
```json
{
  "jsonrpc": "2.0",
  "id": 9,
  "method": "tools/call",
  "params": {
    "name": "api_debug",
    "arguments": {
      "action": "updateHeaders",
      "headers": {
        "Authorization": "Bearer new-token"
      }
    }
  }
}
```


## 🛡️ Error Handling

- Individual request errors don't affect the entire server
- Configuration errors are automatically recovered
- Process exceptions are automatically restarted (managed mode)

## 📁 Project Structure

```
mcp-server-project-standards/
├── src/
│   ├── server-final.js           # Main server file
│   └── utils/                    # Utility functions directory
│       ├── get_project_info.js   # Project information management
│       ├── get_project_structure.js # Project structure management
│       ├── get_api_standards.js  # API standards management
│       ├── get_development_standards.js # Development standards management
│       ├── database_standards.js # Database standards management
│       ├── api_debug.js          # API debugging tool
│       └── ...                   # Other tools
├── bin/
│   └── cli.js                    # CLI startup script
├── start-server.js               # Managed startup script
├── package.json
└── README.md
```

## 🧪 Testing

```bash
npm test
```

## 📄 License

MIT

## 🤝 Contributing

Welcome to submit Issues and Pull Requests to improve this project!

## 📞 Support

If you encounter problems during use, please:

1. Check the [Issues](https://github.com/liliangshan/mcp-server-project-standards/issues) page
2. Create a new Issue describing your problem
3. Provide detailed error information and reproduction steps

---

**Make AI-assisted development more standardized and efficient!** 🚀
