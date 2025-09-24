# Changelog

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
