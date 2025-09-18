const fs = require('fs-extra');
const path = require('path');

/**
 * Execute a custom tool
 * @param {Object} params - Parameters
 * @param {string} params.toolName - Name of the custom tool to execute
 * @param {Object} params.arguments - Arguments to pass to the custom tool
 * @param {Object} config - Server configuration
 * @returns {Object} Result of tool execution
 */
async function execute_custom_tool(params, config) {
  const { toolName, arguments: args } = params || {};
  
  if (!toolName) {
    throw new Error('Missing toolName parameter');
  }

  const tool = (config.customTools || []).find(t => t.name === toolName);
  if (!tool) {
    throw new Error(`Custom tool '${toolName}' not found`);
  }

  try {
    // Create a safe execution context
    const context = {
      args: args || {},
      config: config,
      fs: fs,
      path: path,
      console: console,
      Date: Date,
      JSON: JSON
    };

    // Execute the handler code
    const handler = new Function('context', tool.handlerCode);
    const result = handler(context);

    return {
      success: true,
      result: result,
      toolName: toolName,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    throw new Error(`Failed to execute custom tool '${toolName}': ${err.message}`);
  }
}

module.exports = execute_custom_tool;
