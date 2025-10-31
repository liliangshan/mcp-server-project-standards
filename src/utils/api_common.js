const fs = require('fs-extra');
const path = require('path');

// Get config directory based on CONFIG_DIR and TOOL_PREFIX
const getConfigDir = () => {
  let configDir = process.env.CONFIG_DIR;
  if (!configDir) {
    const toolPrefix = process.env.TOOL_PREFIX || '';
    if (toolPrefix) {
      configDir = `./.setting.${toolPrefix}`;
    } else {
      configDir = './.setting';
    }
  }
  return configDir;
};

// Get API debug config file path
const getApiConfigPath = () => {
  const configDir = getConfigDir();
  return path.join(configDir, 'api.json');
};

// Load API debug config
const loadApiConfig = () => {
  const apiConfigPath = getApiConfigPath();
  try {
    if (fs.existsSync(apiConfigPath)) {
      const configData = fs.readFileSync(apiConfigPath, 'utf8');
      return JSON.parse(configData);
    }
  } catch (err) {
    console.error('Failed to read API config file:', err.message);
  }
  return {
    baseUrl: '',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    list: []
  };
};

// Save API debug config
const saveApiConfig = (apiConfig) => {
  const configDir = getConfigDir();
  const apiConfigPath = path.join(configDir, 'api.json');
  
  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(apiConfigPath, JSON.stringify(apiConfig, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to save API config file:', err.message);
    return false;
  }
};

// Get allowed methods from environment variable
const getAllowedMethods = () => {
  const allowedMethods = process.env.API_DEBUG_ALLOWED_METHODS || 'GET';
  return allowedMethods.split(',').map(method => method.trim().toUpperCase());
};

// Get login URL from environment variable
const getLoginUrl = () => {
  return process.env.API_DEBUG_LOGIN_URL || '/api/login';
};

// Get login method from environment variable
const getLoginMethod = () => {
  return (process.env.API_DEBUG_LOGIN_METHOD || 'POST').toUpperCase();
};

// Get login body from environment variable
const getLoginBody = () => {
  const envBody = process.env.API_DEBUG_LOGIN_BODY || '{"username":"","password":""}';
  
  // 如果是字符串格式，直接返回
  if (typeof envBody === 'string' && !envBody.startsWith('{')) {
    return envBody;
  }
  
  // 如果是JSON格式，解析后返回
  try {
    return JSON.parse(envBody);
  } catch {
    // 如果解析失败，返回原始字符串
    return envBody;
  }
};

// Get login description from environment variable
const getLoginDescription = () => {
  return process.env.API_DEBUG_LOGIN_DESCRIPTION || 'Save returned token to common headers in debug tool, field name Authorization, field value Bearer token';
};

// Detect content type based on body content
const detectContentType = (body) => {
  if (typeof body !== 'string') {
    return 'application/json';
  }
  
  const trimmedBody = body.trim();
  
  // Check for XML
  if (trimmedBody.startsWith('<') && trimmedBody.endsWith('>')) {
    return 'application/xml';
  }
  
  // Check for HTML
  if (trimmedBody.includes('<html') || trimmedBody.includes('<!DOCTYPE html')) {
    return 'text/html';
  }
  
  // Check for JSON
  try {
    JSON.parse(trimmedBody);
    return 'application/json';
  } catch {
    // Not JSON, continue checking
  }
  
  // Check for URL encoded format
  if (trimmedBody.includes('=') && trimmedBody.includes('&')) {
    return 'application/x-www-form-urlencoded';
  }
  
  // Check for plain text patterns
  if (trimmedBody.includes('\n') || trimmedBody.includes('\r')) {
    return 'text/plain';
  }
  
  // Default to text/plain
  return 'text/plain';
};

module.exports = {
  getConfigDir,
  getApiConfigPath,
  loadApiConfig,
  saveApiConfig,
  getAllowedMethods,
  getLoginUrl,
  getLoginMethod,
  getLoginBody,
  getLoginDescription,
  detectContentType
};
