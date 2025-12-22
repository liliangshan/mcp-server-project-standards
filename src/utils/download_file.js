const fs = require('fs-extra');
const path = require('path');
const https = require('https');

// Create an agent for HTTPS requests that skips certificate verification
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * Download file tool
 * 
 * @param {Object} params - Parameters
 * @param {string} params.url - URL of the file to download
 * @param {string} params.savePath - Path to save the file (relative to project path or absolute)
 * @returns {Object} Download result
 */
async function download_file(params) {
  const { url, savePath } = params || {};
  
  if (!url) {
    throw new Error('URL is required');
  }
  
  if (!savePath) {
    throw new Error('Save path is required');
  }

  // Resolve save path
  const projectPath = process.env.PROJECT_PATH || '.';
  let finalSavePath = savePath;
  if (!path.isAbsolute(savePath)) {
    finalSavePath = path.resolve(projectPath, savePath);
  }

  try {
    // Ensure directory exists
    await fs.ensureDir(path.dirname(finalSavePath));

    // Execute download
    const fetchOptions = {};
    if (url.startsWith('https')) {
      fetchOptions.agent = httpsAgent;
    }

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`Failed to download: \${response.status} \${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    await fs.writeFile(finalSavePath, Buffer.from(buffer));

    return {
      success: true,
      message: `Successfully downloaded file to \${finalSavePath}`,
      url: url,
      savePath: finalSavePath,
      size: buffer.byteLength,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    return {
      success: false,
      message: `Failed to download file: \${err.message}`,
      url: url,
      savePath: finalSavePath,
      error: err.message,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = download_file;

