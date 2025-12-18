const fs = require('fs-extra');
const path = require('path');

/**
 * Generate rules content based on project standards
 * @param {Object} params - Parameters
 * @param {boolean} params.save - Whether to save to file (default: false)
 * @param {Object} config - Server configuration
 * @returns {Object} Content, savePath and status
 */
async function generate_cursorrules(params, config) {
  const { save = false } = params || {};
  const projectPath = process.env.PROJECT_PATH || (global.isCursor ? '.' : null);
  
  if (!projectPath) {
    throw new Error('Rules generation is disabled: PROJECT_PATH is not set and client is not Cursor.');
  }

  if (!config) {
    throw new Error('Configuration not found');
  }

  let rules = `---
alwaysApply: true
---

# Project Standards and Rules

## AI Assistant Guidelines
You are an expert AI developer assistant. Your primary goal is to maintain and evolve this project while strictly adhering to the standards defined below.

### Core Principles
1. **Always Discover**: Before making changes, use \`list_directory\` and \`project_structure\` to understand the current context.
2. **Follow Standards**: Consult \`api_standards\`, \`development_standards\`, and \`database_standards\` before implementing new logic.
3. **API Integrity**: Use \`api_debug\` to test APIs and ensure they match the \`api_standards\`.
4. **Consistency**: Match existing code patterns, naming conventions, and architectural styles.

### MCP Tool Usage Workflow
- **Information**: Use \`project_info\` to get/set high-level project metadata.
- **Navigation**: Use \`list_directory\` (with depth) to explore the file system.
- **Compliance**: Use \`api_standards\`, \`development_standards\`, and \`database_standards\` to get specific requirements.
- **Testing**: Use \`api_debug\` for direct testing and \`api_execute\` for regression testing of configured APIs.
- **Configuration**: Use \`api_config\` to manage the API list and base URLs.

## MCP-Driven Project Standards Enforcement Rule

### 1. Core Roles and Principles
- **Role Positioning**: You are a Chief Architect strictly governed by the \`mcp-server-project-standards\` specifications.
- **Supreme Principle**: **Tool Data > Documentation Content > Memory Hallucinations**. It is forbidden to assume project structure, API specifications, or development standards from memory without calling MCP tools.

### 2. Mandatory Tool Call (Tool-First Policy)
- **No Hard Reading of Long Documents**: When obtaining project specifications, architectural standards, or API definitions, **it is forbidden** to read full \`.md\` files in the \`docs/\` directory or long documents exceeding 100 lines.
- **Mandatory Initialization**: When a conversation starts or a task switches, tools provided by \`mcp-server-project-standards\` (e.g., \`project_info\`, \`project_structure\`, \`api_standards\`) must be prioritized.
- **Request on Demand**: Only apply to read specific file code snippets when the summary information returned by MCP tools is insufficient to support current code writing.

### 3. Context Anti-Forgetfulness and Alignment Mechanism (Context Maintenance)
- **Reread After Compression (Refresh Trigger)**: When you perceive that context is compressed (Summarized), conversations exceed 10 rounds, or project background becomes blurred, **you must proactively re-call** MCP tools to refresh the latest standard data.
- **Confirmation Before Action**: Before executing refactoring or generating new modules, please declare: "Aligning project specifications via MCP..." and operate based on the results returned by the tools.
- **Reject Deviation**: If the user's instructions violate the \`standards\` returned by MCP tools, be sure to point out the conflict points and provide correction plans that comply with the specifications.

### 4. Token Consumption and Cost Optimization (Gemini 3 Flash Optimized)
- **Cache-First Strategy**: Obtain short, structured results via MCP tools. This high-repetition short text can significantly trigger Gemini's Context Caching, reducing reading costs to $0.05/1M.
- **Incremental Output**: Full rewriting is strictly prohibited. You must only output the affected code Diff or minimized code blocks (Output cost is $3/1M, must be streamlined).
- **No Redundant Replies**: No need for polite language; directly output tool call results and code change suggestions.

### 5. Automated Documentation Synchronization
- **State Awareness**: After modifying core logic, you must ask whether to call MCP tools to synchronously update project standard descriptions or API snapshots, ensuring "code is the standard".

## Dynamic MCP Tool Call Logic
- **Project Identification**: Before executing any task, please first determine the current working sub-project path (e.g., \`./apps/user-service\`).
- **Parameter Binding**: When calling tools of \`mcp-server-project-standards\`, the \`path\` or \`project_name\` parameters **must** be automatically bound to the currently detected sub-project.
- **Tool Mapping Guidance**:
  - To understand architectural layering -> Call \`project_structure\`
  - To understand API interface standards -> Call \`api_standards\`
  - To perform compliance checks -> Call \`development_standards\`
- **Auto Alignment**: When the model finds that context is compressed or project background is lost, it must **force** a re-call of \`project_info\` and specify the current sub-project path to ensure that standards do not cross-project contaminate.

## Context Management and Anti-Forgetfulness Mechanism
- **Reread After Compression**: Whenever you (AI) perceive that context is compressed, conversation rounds are too many (e.g., more than 10), or "Context Drift" begins to appear, **you must proactively re-call** core tools of \`mcp-server-project-standards\` (e.g., \`project_info\`).
- **Synchronization Declaration**: Before executing the first code generation after compression, please briefly declare at the beginning of the reply: "Project specification tools re-aligned" to ensure logical consistency.
- **Mandatory Alignment**: Any time code is generated, if you are uncertain about the current API standards or structural standards due to context compression, you must first call tools to query; writing based on memory (hallucination) is strictly prohibited.

`;

  // Project Info
  if (config.project_info) {
    rules += `## Project Information\n`;
    if (config.project_info.projectName) rules += `- **Project Name**: ${config.project_info.projectName}\n`;
    if (config.project_info.developmentLanguage) rules += `- **Development Language**: ${config.project_info.developmentLanguage}\n`;
    if (config.project_info.basicInfo) rules += `- **Basic Info**: ${config.project_info.basicInfo}\n`;
    rules += `\n`;
  }

  // Project Structure
  if (config.project_structure && config.project_structure.length > 0) {
    rules += `## Project Structure\n`;
    config.project_structure.forEach(item => {
      rules += `- \`${item.path}\`: ${item.description}\n`;
    });
    rules += `\n`;
  }

  // API Standards
  if (config.api_standards) {
    rules += `## API Standards\n`;
    if (config.api_standards.interfaceType) rules += `- **Interface Type**: ${config.api_standards.interfaceType}\n`;
    if (config.api_standards.successStructure) rules += `- **Success Structure**: \`${config.api_standards.successStructure}\`\n`;
    if (config.api_standards.errorStructure) rules += `- **Error Structure**: \`${config.api_standards.errorStructure}\`\n`;
    
    if (config.api_standards.requirements && config.api_standards.requirements.length > 0) {
      rules += `### API Requirements\n`;
      config.api_standards.requirements.forEach(req => {
        rules += `- ${req}\n`;
      });
    }
    rules += `\n`;
  }

  // Development Standards
  if (config.development_standards && config.development_standards.length > 0) {
    rules += `## Development Standards\n`;
    config.development_standards.forEach(std => {
      rules += `- ${std}\n`;
    });
    rules += `\n`;
  }

  // Database Standards
  if (config.database_standards && config.database_standards.length > 0) {
    rules += `## Database Standards\n`;
    config.database_standards.forEach(std => {
      rules += `- ${std}\n`;
    });
    rules += `\n`;
  }

  // Determine file name and path
  const toolPrefix = process.env.TOOL_PREFIX || 'project';
  const fileName = global.isCursor ? path.join('.cursor', 'rules', toolPrefix, 'RULE.md') : 'PROJECT_RULES.md';
  const rulesPath = path.resolve(projectPath, fileName);

  // System Metadata
  rules += `## System Environment\n`;
  rules += `- **Project Path**: \`${projectPath}\`\n`;
  rules += `\n`;

  if (save) {
    try {
      // Ensure directory exists
      await fs.ensureDir(path.dirname(rulesPath));
      await fs.writeFile(rulesPath, rules, 'utf8');
      return {
        success: true,
        message: `${path.basename(rulesPath)} has been saved to ${rulesPath}`,
        content: rules,
        savePath: rulesPath
      };
    } catch (err) {
      throw new Error(`Failed to save ${path.basename(rulesPath)}: ${err.message}`);
    }
  }

  return {
    success: true,
    content: rules,
    savePath: rulesPath,
    suggestedFileName: fileName,
    message: `Rules generated. Please review the content. You can call this tool with { "save": true } to save it to ${rulesPath}`
  };
}

module.exports = generate_cursorrules;
