const fs = require('fs-extra');
const path = require('path');

/**
 * Create a custom tool with custom handler code
 * @param {Object} params - Parameters
 * @param {string} params.toolName - Name of the custom tool
 * @param {string} params.description - Description of the custom tool
 * @param {Object} params.inputSchema - JSON schema for input parameters
 * @param {string} params.handlerCode - JavaScript code for the tool handler
 * @param {Object} config - Server configuration
 * @param {Function} saveConfig - Function to save configuration
 * @returns {Object} Result of tool creation
 */
async function create_custom_tool(params, config, saveConfig) {
  const { toolName, description, inputSchema, handlerCode } = params || {};
  
  if (!toolName || !description || !inputSchema || !handlerCode) {
    throw new Error('Missing required parameters: toolName, description, inputSchema, handlerCode');
  }

  try {
    const customTool = {
      name: toolName,
      description: description,
      inputSchema: inputSchema,
      handlerCode: handlerCode,
      createdAt: new Date().toISOString(),
      id: Date.now().toString()
    };

    // Add to config
    if (!config.customTools) {
      config.customTools = [];
    }
    config.customTools.push(customTool);

    // Save config
    const saved = saveConfig(config);
    if (!saved) {
      throw new Error('Failed to save configuration');
    }

    return {
      success: true,
      tool: customTool,
      message: `Custom tool '${toolName}' created successfully`
    };
  } catch (err) {
    throw new Error(`Failed to create custom tool: ${err.message}`);
  }
}

module.exports = create_custom_tool;
