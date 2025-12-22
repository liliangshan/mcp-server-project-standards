# Changelog

## [5.1.0] - 2025-12-22

### Added
- New `download_file` tool to download files from URLs and save them to the project directory.
- Updated server and package versions to 5.1.0.

## [5.0.0] - 2025-12-19

### 🚀 Major Release - Project Path & AI Guidance

#### ✨ New Features
- **Project Path Support**: Introduced `PROJECT_PATH` environment variable. All configurations and tools now resolve paths relative to the specified project root.
- **Cursor Client Detection**: Added automatic identification of Cursor IDE during initialization, enabling `global.isCursor` for environment-specific tool behavior.
- **Directory Structure Tool**: Added `list_directory` for recursive file system exploration with depth control.
- **Automated Rules Generation**: Added `generate_cursorrules` (for Cursor) and `generate_rules` (for other clients) to create standardized project guidance files (`.cursorrules` or `PROJECT_RULES.md`).
- **Dynamic Tool Discovery**: Tools related to project structure are now hidden if `PROJECT_PATH` is not set in non-Cursor environments.

#### 🛡️ AI Behavior & Enforcement
- **Standardized Enforcement Rules**: Integrated comprehensive AI guidelines into rule generation, including Tool-First policy, context maintenance triggers, and cost optimization strategies.
- **Two-Step Workflow**: Rule generation tools now return content and save paths for user review before writing to disk (via `save: true`).
- **Auto-Alignment Logic**: Explicit instructions for AI to bind project paths automatically and re-align standards when context is compressed.

#### 💰 Cost Optimization
- **Token Usage Reduction**: Optimized AI interaction patterns to maximize Context Caching, reducing input token costs by up to 90% (e.g., ~$0.05/1M tokens).
- **Incremental Diff Enforcement**: Explicit rules for AI to generate minimal code changes, significantly reducing expensive output token consumption.

#### 🌐 Improvements
- **Language Unification**: Converted all source code comments and rule templates to English.
- **Enhanced Logging**: Server startup logs now display the resolved Project Path and Client type.
- **Path Security**: Added validation to ensure directory listing remains within the project boundaries.

## [3.0.2] - 2025-01-20

### 🐛 Bug Fixes
- **API 错误响应处理优化**：
  - 修复 `api_execute` 工具：现在会根据 HTTP 状态码正确判断成功/失败（200-299 为成功），失败时会返回 `success: false` 和 `error` 字段
  - 修复 `api_debug` 工具：失败时（如 500 错误）现在也会返回完整的 `response` 对象，包含响应体中的错误信息
  - 确保所有工具（`api_execute`、`api_debug`、`api_login`）在返回错误状态码时都能完整返回服务器响应内容，便于调试
  - 为 `api_execute` 添加 HTTPS agent 支持，与其他工具保持一致

### 📝 改进说明
- 当 API 返回 500 或其他错误状态码时，现在可以完整获取服务器返回的错误响应内容
- 所有 API 工具的错误响应格式统一，包含：`success`、`error`、`response`（包含 status、statusText、headers、data）

## [3.0.0] - 2025-10-31

### 🚀 Breaking Changes
- Config directory resolution now depends on both `CONFIG_DIR` and `TOOL_PREFIX`:
  - If `CONFIG_DIR` is set, it is used as-is
  - If `CONFIG_DIR` is not set and `TOOL_PREFIX` is set, use `./.setting.<TOOL_PREFIX>`
  - Otherwise default to `./.setting`
- `tools/call` now strips the `TOOL_PREFIX` from tool names before method dispatch. If you call `xxx_api_debug` (with `TOOL_PREFIX=xxx`), the server will route the call to `api_debug` internally.

### ✨ New/Improved
- Unified config path logic via `getConfigDir()` in `src/utils/api_common.js` and `src/server-final.js`
- Server startup logs and `tools/list` environment now reflect the resolved `CONFIG_DIR`
- Reduced confusion when using prefixed tool names: automatic prefix removal on call
- Documentation: Editor integration now includes both single-project and multi-project examples (Cursor/VS Code)

### 🧩 Editor Integration Examples

Cursor (single-project):
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
        "API_DEBUG_LOGIN_BODY": "{\"username\":\"\",\"password\":\"\"}"
      }
    }
  }
}
```

Cursor (multi-project):
```json
{
  "mcpServers": {
    "project-standards-A": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "TOOL_PREFIX": "projA",
        "PROJECT_NAME": "Project A",
        "API_DEBUG_ALLOWED_METHODS": "GET,POST,PUT,DELETE",
        "API_DEBUG_LOGIN_URL": "/api/login",
        "API_DEBUG_LOGIN_METHOD": "POST",
        "API_DEBUG_LOGIN_BODY": "{\"username\":\"\",\"password\":\"\"}"
      }
    },
    "project-standards-B": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "TOOL_PREFIX": "projB",
        "PROJECT_NAME": "Project B",
        "API_DEBUG_ALLOWED_METHODS": "GET,POST,PUT,DELETE",
        "API_DEBUG_LOGIN_URL": "/api/auth/login",
        "API_DEBUG_LOGIN_METHOD": "POST",
        "API_DEBUG_LOGIN_BODY": "{\"mobile\":\"\",\"password\":\"\"}"
      }
    }
  }
}
```

VS Code (single-project):
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
        "API_DEBUG_LOGIN_BODY": "{\"username\":\"\",\"password\":\"\"}"
      }
    }
  }
}
```

VS Code (multi-project):
```json
{
  "mcp.servers": {
    "project-standards-A": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "TOOL_PREFIX": "projA",
        "PROJECT_NAME": "Project A",
        "API_DEBUG_ALLOWED_METHODS": "GET,POST,PUT,DELETE",
        "API_DEBUG_LOGIN_URL": "/api/login",
        "API_DEBUG_LOGIN_METHOD": "POST",
        "API_DEBUG_LOGIN_BODY": "{\"username\":\"\",\"password\":\"\"}"
      }
    },
    "project-standards-B": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "TOOL_PREFIX": "projB",
        "PROJECT_NAME": "Project B",
        "API_DEBUG_ALLOWED_METHODS": "GET,POST,PUT,DELETE",
        "API_DEBUG_LOGIN_URL": "/api/auth/login",
        "API_DEBUG_LOGIN_METHOD": "POST",
        "API_DEBUG_LOGIN_BODY": "{\"mobile\":\"\",\"password\":\"\"}"
      }
    }
  }
}
```

### 🧹 Cleanup
- Removed duplicate legacy `api_debug` method definition in `src/server-final.js`

### 📝 Files Changed
- `src/server-final.js`: add `getConfigDir()`, use it in read/write, log, tools/list env; strip tool prefix in `tools/call`; remove duplicate `api_debug`
- `src/utils/api_common.js`: add `getConfigDir()`, use for api.json read/write
- `bin/cli.js`: ensure env propagation of `TOOL_PREFIX` and `CONFIG_DIR` behavior per above

---

## [2.1.9] - 2024-12-19

### 🔧 Bug Fixes & Improvements
- **Skip Certificate Verification**: Added support to skip SSL/TLS certificate verification in API requests
- **Enhanced HTTPS Support**: All API tools now use HTTPS agent to skip certificate validation for testing environments
- **Certificate Error Resolution**: Fixed certificate verification errors when connecting to self-signed or invalid certificates
- **Non-global Approach**: Uses per-request HTTPS agent instead of global environment variables

### 📝 Changes
- Modified `api_debug.js` to use HTTPS agent for skipping certificate verification
- Modified `api_execute.js` to use HTTPS agent for skipping certificate verification
- Modified `api_login.js` to use HTTPS agent for skipping certificate verification
- Added HTTPS agent configuration that only affects specific HTTPS requests without global side effects

---

## [2.1.8] - 2024-12-19

### 🔧 Bug Fixes & Improvements
- **Version Update**: Updated package version for npmjs publication
- **Code Quality**: Minor improvements and optimizations

---

## [2.1.7] - 2024-12-19

### 🔧 Bug Fixes & Improvements
- **Version Update**: Updated package version for npmjs publication
- **Code Quality**: Minor improvements and optimizations

---

## [2.1.6] - 2024-12-19

### 🔧 Bug Fixes & Improvements
- **Enhanced JSON Parse Error Messages**: Improved error message structure with multiple content blocks
- **Strengthened addApi Reminders**: Added multiple reminder blocks with different wording to emphasize addApi usage
- **Simplified Error Flow**: Removed explanatory text, focused on actionable solutions
- **Better User Experience**: Clear step-by-step guidance with varied visual indicators and repeated emphasis

### 📝 Changes
- Modified `api_debug.js` to use multiple reminder blocks with different wording
- Added strong emphasis on using addApi tool with varied expressions (IMPORTANT, REMINDER, ESSENTIAL, etc.)
- Removed explanatory text about why direct execution is not possible
- Enhanced visual indicators with different emojis and formatting
- Added multiple reminder blocks to ensure users follow the correct workflow with varied language

---

## [2.1.5] - 2024-12-19

### 🔧 Bug Fixes & Improvements
- **Enhanced JSON Parse Error Handling**: Improved error messages with multiple content blocks for better readability
- **Strengthened API Configuration Guidance**: Added multiple reminders to use addApi before api_execute
- **Simplified Error Flow**: Removed technical error details, focused on actionable solutions
- **Better User Experience**: Clear step-by-step guidance with visual indicators and repeated emphasis
- **Cursor JSON Generation Fix**: Resolved issues with Cursor AI generating invalid JSON in API requests

### 📝 Changes
- Modified `api_debug.js` to return multiple content blocks instead of single large text
- Added strong emphasis on using addApi tool before api_execute
- Removed parse error details from user-facing messages
- Enhanced visual indicators with emojis and formatting
- Added multiple reminder blocks to ensure users follow the correct workflow
- **Fixed Cursor AI JSON Generation Issues**: When Cursor generates invalid JSON, the system now provides clear guidance to use addApi tool instead of attempting direct execution

---

## [2.1.4] - 2024-12-19

### 🔧 Bug Fixes & Improvements
- **Enhanced API Debug Error Handling**: Improved JSON parsing error handling in `api_debug` tool
- **MCP Embedded Prompt Support**: Added support for MCP embedded prompt format when JSON parsing fails
- **Better Error Messages**: Enhanced error messages with English language support and clearer suggestions
- **Server Response Optimization**: Updated server to properly handle MCP embedded prompt responses

### 📝 Changes
- Modified `api_debug.js` to return MCP embedded prompt format for JSON parsing errors
- Updated `server-final.js` to detect and handle `contentType: "application/vnd.x-mcp-embedded-prompt"`
- Improved error handling flow for better user experience
- Enhanced tool response processing for MCP compatibility

---

## [2.0.3] - 2024-12-19

### 🔧 Bug Fixes & Improvements
- **Restored addApi Functionality**: Re-added `addApi` action to `api_config` tool for managing API endpoints
- **Enhanced API Management**: Users can now add, update, and manage API endpoints through the configuration tool
- **Improved Tool Documentation**: Updated help system to include `addApi` examples and usage

### 📝 Changes
- Added `addApi` action back to `api_config` tool
- Updated tool schema to support API endpoint management
- Enhanced help documentation with `addApi` examples
- Improved API configuration management capabilities

---

## [2.0.2] - 2024-12-19

### 🆕 New Features
- **API Help Tool** (`api_help`): New comprehensive help tool that provides detailed documentation and examples for all API debugging tools
- **Enhanced Tool Descriptions**: Added practical examples directly in tool descriptions for better AI guidance
- **Interactive Documentation**: AI can now query specific tool help or get complete documentation

### 🔧 Improvements
- **Better AI Guidance**: Tool descriptions now include real-world usage examples
- **Comprehensive Help System**: New `api_help` tool provides detailed documentation for all API tools
- **Flexible Help Queries**: Support for viewing all tools or specific tool documentation
- **Quick Start Guide**: Built-in 4-step workflow for using API debugging tools

### 📝 New Tool Features
- **api_help**: Provides detailed documentation, examples, and best practices
- **Tool-specific Help**: Query help for specific tools (api_debug, api_login, api_config)
- **Usage Examples**: Real-world examples for each tool
- **Best Practices**: Built-in recommendations for optimal usage

---

## [2.0.1] - 2024-12-19

### 🔧 Bug Fixes & Improvements
- **Simplified API Debug Tool**: Removed JSON string format support to encourage AI to use JSON objects directly
- **Enhanced Tool Descriptions**: Updated tool descriptions with better examples and clearer format specifications
- **Improved Documentation**: Updated API_DEBUG_EXAMPLES.md with simplified format examples
- **Better AI Guidance**: AI now receives clearer instructions to use JSON objects instead of JSON strings

### 📝 Changes
- Removed JSON string format from `api_debug` tool examples
- Updated tool descriptions to focus on JSON objects, form data, and plain text
- Simplified automatic content-type detection logic
- Enhanced documentation with clearer format specifications

---

## [2.0.0] - 2024-12-19

### 🚀 Major Features Added
- **API Login Tool** (`api_login`): Direct login authentication using environment variables
- **API Debug Tool** (`api_debug`): Simplified API request execution without complex action parameters
- **API Config Tool** (`api_config`): Comprehensive API configuration management

### ✨ New Capabilities
- **Environment Variable Support**: Login credentials managed through environment variables
- **Flexible Login Body**: Support for both JSON and string format login bodies
- **Automatic Token Management**: Auto-extract and update Authorization headers after login
- **Streamlined API Execution**: Direct API calls without pre-configuration
- **Enhanced Configuration Management**: Global API settings, headers, and base URL management

### 🔧 Technical Improvements
- **Code Refactoring**: Eliminated duplicate code by creating shared `api_common.js` module
- **Reduced File Size**: Each tool file reduced from ~250 lines to ~50 lines
- **Better Error Handling**: Unified error handling across all tools
- **Improved Maintainability**: Centralized configuration and utility functions

### 🛠️ Tool Breakdown
1. **`api_login`**: Handles user authentication with environment variable credentials
2. **`api_debug`**: Executes API requests with automatic content-type detection
3. **`api_config`**: Manages global API configuration, headers, and settings

### 📦 Environment Variables
- `API_DEBUG_LOGIN_URL`: Login endpoint URL
- `API_DEBUG_LOGIN_METHOD`: HTTP method for login
- `API_DEBUG_LOGIN_BODY`: Login request body (JSON or string format)
- `API_DEBUG_LOGIN_DESCRIPTION`: Login description
- `API_DEBUG_ALLOWED_METHODS`: Allowed HTTP methods for API calls

### 🔄 Breaking Changes
- Removed `addApi` and `deleteApi` methods from `api_config` tool
- Simplified `api_debug` tool - no longer requires action parameters
- Removed complex action-based workflows in favor of direct execution

### 📈 Performance Improvements
- Reduced code duplication by ~70%
- Faster module loading with shared utilities
- Optimized configuration management

---

## [1.2.2] - Previous Version
- Legacy API debugging functionality
- Basic project standards management
- Initial MCP server implementation
