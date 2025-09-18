/**
 * Update server configuration
 * @param {Object} params - Parameters
 * @param {Object} params.config - Configuration object to update
 * @param {Object} currentConfig - Current server configuration
 * @param {Function} saveConfig - Function to save configuration
 * @returns {Object} Result of configuration update
 */
async function update_config(params, currentConfig, saveConfig) {
  const { config } = params || {};
  
  if (!config || typeof config !== 'object') {
    throw new Error('Invalid config parameter');
  }

  try {
    // Merge with existing config
    const updatedConfig = { ...currentConfig, ...config };
    
    // Save to file
    const saved = saveConfig(updatedConfig);
    if (!saved) {
      throw new Error('Failed to save configuration');
    }

    return {
      success: true,
      config: updatedConfig,
      message: 'Configuration updated successfully'
    };
  } catch (err) {
    throw new Error(`Failed to update configuration: ${err.message}`);
  }
}

module.exports = update_config;
