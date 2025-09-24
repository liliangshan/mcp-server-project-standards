# Changelog

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
