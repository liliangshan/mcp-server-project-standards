const fs = require('fs-extra');
const path = require('path');

/**
 * List directory structure
 * @param {Object} params - Parameters
 * @param {string} params.path - Subdirectory path to list (relative to PROJECT_PATH)
 * @param {number} params.depth - Max depth to traverse (default: 2)
 * @returns {Object} Directory structure
 */
async function list_directory(params) {
  const projectPath = process.env.PROJECT_PATH || (global.isCursor ? '.' : null);
  
  if (!projectPath) {
    throw new Error('Project structure tool is disabled: PROJECT_PATH is not set and client is not Cursor.');
  }

  const subPath = params?.path || '';
  const maxDepth = params?.depth || 2;
  
  const targetPath = path.resolve(projectPath, subPath);
  
  if (!targetPath.startsWith(path.resolve(projectPath))) {
    throw new Error('Access denied: Path is outside of project directory');
  }

  if (!fs.existsSync(targetPath)) {
    throw new Error(`Path does not exist: ${subPath}`);
  }

  const stats = fs.statSync(targetPath);
  if (!stats.isDirectory()) {
    return {
      name: path.basename(targetPath),
      type: 'file',
      path: subPath
    };
  }

  async function getTree(currentPath, currentRelativePath, currentDepth) {
    const name = path.basename(currentPath);
    const result = {
      name: name || '.',
      type: 'directory',
      path: currentRelativePath,
      children: []
    };

    if (currentDepth >= maxDepth) {
      return result;
    }

    try {
      const items = await fs.readdir(currentPath);
      for (const item of items) {
        // Skip hidden files/folders (starting with .)
        if (item.startsWith('.') && item !== '.setting') continue;
        if (item === 'node_modules') continue;

        const itemPath = path.join(currentPath, item);
        const itemRelativePath = path.join(currentRelativePath, item);
        const itemStats = await fs.stat(itemPath);

        if (itemStats.isDirectory()) {
          result.children.push(await getTree(itemPath, itemRelativePath, currentDepth + 1));
        } else {
          result.children.push({
            name: item,
            type: 'file',
            path: itemRelativePath
          });
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${currentPath}:`, err.message);
    }

    return result;
  }

  return await getTree(targetPath, subPath, 0);
}

module.exports = list_directory;

