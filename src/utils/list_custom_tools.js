/**
 * List all custom tools
 * @param {Object} params - Parameters
 * @param {Object} config - Server configuration
 * @returns {Object} List of custom tools
 */
async function list_custom_tools(params, config) {
  return {
    tools: config.customTools || [],
    count: (config.customTools || []).length,
    timestamp: new Date().toISOString()
  };
}

module.exports = list_custom_tools;
