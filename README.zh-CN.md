# MCP 项目标准管理服务器

一个基于 MCP（Model Context Protocol）协议的项目标准管理工具，专为 AI 辅助开发而设计，帮助团队在多台机器上保持统一的开发标准和规范。

## 🚀 核心优势

### 🎯 解决多机器开发混乱问题
- **统一标准**：多台机器上的 AI 助手使用相同的项目标准，避免开发风格不一致
- **团队协作**：消除因不同开发者使用不同 AI 配置导致的代码风格差异

### 🛡️ 企业级开发规范管理
- **项目信息管理**：统一管理项目基本信息、技术栈、版本等
- **API 标准规范**：定义统一的接口设计标准，确保 API 一致性
- **开发标准制定**：代码风格、命名规范、架构标准等统一管理
- **数据库规范**：表结构、命名约定、索引策略等标准化

### 🔧 简单的配置管理
- **JSON 配置**：基于 JSON 文件的简单配置存储
- **环境变量**：支持通过环境变量指定配置文件路径
- **自动创建**：首次运行时自动创建默认配置文件

## ✨ 主要功能

- ✅ **项目信息管理** - 统一管理项目基本信息和配置
- ✅ **项目结构分析** - 智能分析项目目录结构和依赖关系
- ✅ **API 接口标准** - 定义统一的 API 设计规范和最佳实践
- ✅ **开发标准制定** - 代码风格、命名规范、架构标准管理
- ✅ **数据库规范** - 表结构设计、命名约定、索引策略标准化
- ✅ **API 调试工具** - 完整的 API 接口测试和调试功能
- ✅ **配置管理** - 基于 JSON 文件的配置存储和管理
- ✅ **自动重启** - 智能的进程管理和故障恢复
- ✅ **健康检查** - 实时监控服务状态和性能

## 🎯 应用场景

### 团队协作开发
- **多开发者环境**：确保每个开发者的 AI 助手都遵循相同的项目标准
- **代码审查**：统一的代码风格和规范，减少审查时间
- **新人培训**：快速让新团队成员了解项目规范和最佳实践

### 企业级项目
- **大型项目**：管理复杂的项目结构和多模块开发
- **微服务架构**：统一各个服务的 API 设计和数据库规范
- **多环境部署**：开发、测试、生产环境的标准一致性

### AI 辅助开发
- **智能代码生成**：AI 根据项目标准生成符合规范的代码
- **自动重构**：基于标准自动优化和重构代码
- **规范检查**：实时检查代码是否符合项目标准

## 📦 安装部署

### 全局安装（推荐）
```bash
npm install -g @liangshanli/mcp-server-project-standards
```

### 本地安装
```bash
npm install @liangshanli/mcp-server-project-standards
```

### 源码安装
```bash
git clone https://github.com/liliangshan/mcp-server-project-standards.git
cd mcp-server-project-standards
npm install
```

## ⚙️ 配置管理

服务器默认使用 `./.setting/` 目录存储配置文件，您可以通过环境变量指定不同的目录。

### 环境变量

| 变量名 | 默认值 | 描述 |
|--------|--------|------|
| CONFIG_DIR | ./.setting | 配置文件目录（包含 config.json 和 api.json） |

### 配置文件

服务器使用两个配置文件：
- `config.json` - 项目标准配置
- `api.json` - API 调试配置

**config.json 默认值：**
```json
{
  "project_info": {},
  "project_structure": [],
  "api_standards": {},
  "development_standards": [],
  "database_standards": []
}
```

**api.json 默认值：**
```json
{
  "baseUrl": "",
  "headers": {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  "list": []
}
```

### 配置字段说明

**config.json 字段：**
- **project_info** - 项目基本信息（项目名称、开发语言、描述等）
- **project_structure** - 项目结构定义（目录和文件描述）
- **api_standards** - API 接口标准（接口类型、响应结构、请求头等）
- **development_standards** - 开发标准（代码风格、命名规范等）
- **database_standards** - 数据库规范（表命名、字段命名等）

**api.json 字段：**
- **baseUrl** - API 基础 URL
- **headers** - 公共请求头（认证、Content-Type 等）
- **list** - API 接口列表（包含请求参数、响应数据、执行历史等）

## 🚀 快速开始

### 1. 直接运行（全局安装）
```bash
mcp-server-project-standards
```

### 2. 使用 npx（推荐）
```bash
npx @liangshanli/mcp-server-project-standards
```

### 3. 源码启动
```bash
npm start
```

### 4. 托管启动（生产环境推荐）
```bash
npm run start-managed
```

托管启动提供：
- 自动重启（最多10次）
- 错误恢复
- 进程管理
- 日志记录

### 5. 开发模式
```bash
npm run dev
```

## 🔧 编辑器集成

### Cursor 编辑器配置

1. 在项目根目录创建 `.cursor/mcp.json` 文件：

```json
{
  "mcpServers": {
    "project-standards": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "CONFIG_DIR": "./.setting"
      }
    }
  }
}
```

### VS Code 配置

1. 安装 VS Code 的 MCP 扩展
2. 创建 `.vscode/settings.json` 文件：

```json
{
  "mcp.servers": {
    "project-standards": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "CONFIG_DIR": "./.setting"
      }
    }
  }
}
```

## 🛠️ 可用工具

### 1. 项目信息管理 (project_info)
获取和管理项目基本信息，包括项目名称、开发语言、描述等。

**参数：**
- `action` (必需): 操作类型 - "get" 获取信息，"set" 设置信息
- `key` (可选): 要设置的字段 - "projectName", "developmentLanguage", "basicInfo"
- `value` (可选): 要设置的值

**使用示例：**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "project_info",
    "arguments": {
      "action": "set",
      "key": "projectName",
      "value": "我的项目"
    }
  }
}
```

### 2. 项目结构管理 (project_structure)
获取和管理项目目录结构，支持深度控制和隐藏文件包含。

**参数：**
- `action` (必需): 操作类型 - "get" 获取结构，"set" 设置结构，"delete" 删除结构项
- `structure` (可选): 结构项数组（设置时必需）
- `path` (可选): 要删除的路径（删除时必需）

**使用示例：**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "project_structure",
    "arguments": {
      "action": "set",
      "structure": [
        {
          "path": "/src",
          "description": "源代码目录"
        }
      ]
    }
  }
}
```

### 3. API 标准管理 (api_standards)
获取和管理 API 接口标准和最佳实践。

**参数：**
- `action` (必需): 操作类型 - "get" 获取标准，"set" 设置标准，"delete" 删除标准
- `key` (可选): 要设置的字段 - "interfaceType", "successStructure", "errorStructure", "basicHeaders", "requirements"
- `value` (可选): 要设置的值
- `forceOverwrite` (可选): 是否强制覆盖数组值（默认: false）

**使用示例：**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "api_standards",
    "arguments": {
      "action": "set",
      "key": "requirements",
      "value": ["统一响应格式", "错误码标准", "参数验证"],
      "forceOverwrite": true
    }
  }
}
```

### 4. 开发标准管理 (development_standards)
获取和管理开发标准，包括代码风格、Git 工作流、测试和文档规范。

**参数：**
- `action` (必需): 操作类型 - "get" 获取标准，"set" 设置标准，"delete" 删除标准
- `standards` (可选): 标准数组（设置时必需）
- `forceOverwrite` (可选): 是否强制覆盖数组值（默认: false）

**使用示例：**
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "development_standards",
    "arguments": {
      "action": "set",
      "standards": ["使用2个空格缩进", "使用单引号", "使用驼峰命名"],
      "forceOverwrite": false
    }
  }
}
```

### 5. 数据库标准管理 (database_standards)
获取和管理数据库规范，包括表结构设计、命名约定、索引策略等。

**参数：**
- `action` (必需): 操作类型 - "get" 获取标准，"set" 设置标准，"delete" 删除标准
- `standards` (可选): 标准数组（设置时必需）
- `forceOverwrite` (可选): 是否强制覆盖数组值（默认: false）

**使用示例：**
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "database_standards",
    "arguments": {
      "action": "set",
      "standards": [
        "使用 test_ 前缀命名所有表",
        "使用 snake_case 命名表和字段",
        "使用单数形式命名表名"
      ],
      "forceOverwrite": true
    }
  }
}
```

### 6. API 调试工具 (api_debug)
完整的 API 接口测试和调试功能，支持多种 HTTP 方法、认证、参数传递等。

**参数：**
- `action` (必需): 操作类型 - "get" 获取配置，"set" 设置配置，"delete" 删除 API，"execute" 执行 API，"updateBaseUrl" 更新基础 URL，"updateHeaders" 更新请求头，"deleteHeader" 删除请求头，"search" 搜索 API
- `config` (可选): API 调试配置（设置时必需）
- `index` (可选): API 索引（执行/删除时必需）
- `baseUrl` (可选): 新的基础 URL（更新基础 URL 时必需）
- `headers` (可选): 新的请求头（更新请求头时必需）
- `headerName` (可选): 要删除的请求头名称（删除请求头时必需）
- `keyword` (可选): 搜索关键词（搜索时必需）

**功能特点：**
- **智能 Content-Type 检测**：自动判断请求体类型（JSON、XML、HTML、URL编码等）
- **认证管理**：支持 Bearer Token 等认证方式
- **URL 去重**：相同 URL 只保存一份数据，避免重复
- **执行记录**：无论成功失败都记录执行历史
- **搜索功能**：支持按 URL 或描述搜索 API
- **参数管理**：支持查询参数、请求体、自定义请求头等

**🔐 特别说明 - 登录认证流程：**

API 调试工具支持完整的登录认证流程，让您轻松管理 API 访问权限：

1. **登录接口配置**：
   - 首先配置登录 API（如 `/api/login`）
   - 设置登录请求参数（用户名、密码等）
   - 执行登录请求获取认证信息

2. **自动 Token 管理**：
   - 登录成功后，工具会自动提取返回的 `token` 或 `cookie`
   - 自动将认证信息写入公共请求头（如 `Authorization: Bearer token`）
   - 后续所有 API 请求都会自动携带认证信息

3. **认证过期处理**：
   - 当 API 返回认证过期错误时
   - 可以重新执行原始登录接口获取新的 token
   - 使用 `updateHeaders` 操作更新公共请求头
   - 继续调试其他需要认证的 API

4. **使用流程示例**：
   ```bash
   # 1. 配置登录 API
   api_debug set config={login_api_config}
   
   # 2. 执行登录获取 token
   api_debug execute index=0
   
   # 3. 更新公共请求头（自动完成）
   api_debug updateHeaders headers={Authorization: Bearer token}
   
   # 4. 调试其他需要认证的 API
   api_debug execute index=1
   
   # 5. 如果 token 过期，重新登录
   api_debug execute index=0  # 重新执行登录
   ```

这样设计让您无需手动管理认证状态，工具会自动处理登录和 token 更新，大大简化了 API 调试流程！

## 🔗 相关工具协同使用

为了提供更完整的开发体验，推荐与以下 MCP 工具协同使用：

### 🗄️ 数据库管理工具

**MySQL 数据库支持**
- **NPM 包**: [@liangshanli/mcp-server-mysql](https://www.npmjs.com/package/@liangshanli/mcp-server-mysql)
- **GitHub 仓库**: [mcp-server-mysql](https://github.com/liliangshan/mcp-server-mysql)
- **功能**: DDL 操作、权限控制、操作日志、连接池管理
- **特色**: 支持 DDL SQL 日志记录，便于数据库结构同步

**SQL Server 数据库支持**
- **NPM 包**: [@liangshanli/mcp-server-mssqlserver](https://www.npmjs.com/package/@liangshanli/mcp-server-mssqlserver)
- **GitHub 仓库**: [mcp-server-mssqlserver](https://github.com/liliangshan/mcp-server-mssqlserver)
- **功能**: SQL Server 数据库操作、DDL 支持、权限管理
- **特色**: 专为 SQL Server 优化的数据库操作工具

### 🎨 图标管理工具

**图标资源管理**
- **NPM 包**: [@liangshanli/mcp-server-icon](https://www.npmjs.com/package/@liangshanli/mcp-server-icon)
- **GitHub 仓库**: [mcp-server-icon](https://github.com/liliangshan/mcp-server-icon)
- **功能**: 图标资源管理、图标搜索、图标库集成
- **特色**: 支持多种图标库，便于 UI 开发

### 🚀 协同开发优势

**完整开发栈**：
- **项目标准** + **数据库管理** + **API 调试** + **图标资源** = 全栈开发解决方案
- 统一的 MCP 协议，无缝集成各个工具
- 一致的配置管理和错误处理机制

**团队协作**：
- 所有工具都支持多机器环境下的标准统一
- 共享的配置文件和日志系统
- 便于团队成员的快速上手和协作

**开发效率**：
- 从项目规范到数据库操作，再到 API 调试，一站式解决
- 减少工具切换成本，提高开发效率
- 统一的错误处理和日志记录

**使用示例**：
```bash
# 1. 安装项目标准管理工具
npm install -g @liangshanli/mcp-server-project-standards

# 2. 安装数据库管理工具（根据需要选择）
npm install -g @liangshanli/mcp-server-mysql
# 或
npm install -g @liangshanli/mcp-server-mssqlserver

# 3. 安装图标管理工具
npm install -g @liangshanli/mcp-server-icon

# 4. 在编辑器中配置多个 MCP 服务器
```

**使用示例：**

**设置 API 配置：**
```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "tools/call",
  "params": {
    "name": "api_debug",
    "arguments": {
      "action": "set",
      "config": {
        "baseUrl": "https://api.example.com",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Bearer your-token"
        },
        "list": [
          {
            "description": "用户登录",
            "url": "/api/login",
            "method": "POST",
            "body": {
              "username": "user",
              "password": "pass"
            }
          }
        ]
      }
    }
  }
}
```

**执行 API 请求：**
```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": {
    "name": "api_debug",
    "arguments": {
      "action": "execute",
      "index": 0
    }
  }
}
```

**搜索 API：**
```json
{
  "jsonrpc": "2.0",
  "id": 8,
  "method": "tools/call",
  "params": {
    "name": "api_debug",
    "arguments": {
      "action": "search",
      "keyword": "login"
    }
  }
}
```

**更新认证头：**
```json
{
  "jsonrpc": "2.0",
  "id": 9,
  "method": "tools/call",
  "params": {
    "name": "api_debug",
    "arguments": {
      "action": "updateHeaders",
      "headers": {
        "Authorization": "Bearer new-token"
      }
    }
  }
}
```




## 🛡️ 错误处理

- 单个请求错误不会影响整个服务器
- 配置错误会自动恢复
- 进程异常会自动重启（托管模式）

## 🚀 快速开始

### 1. 安装包
```bash
npm install -g @liangshanli/mcp-server-project-standards
```

### 2. 配置环境变量（可选）
```bash
export CONFIG_DIR="./.setting"
```

### 3. 运行服务器
```bash
mcp-server-project-standards
```

## 📁 项目结构

```
mcp-server-project-standards/
├── src/
│   ├── server-final.js           # 主服务器文件
│   └── utils/                    # 工具函数目录
│       ├── get_project_info.js   # 项目信息管理
│       ├── get_project_structure.js # 项目结构管理
│       ├── get_api_standards.js  # API 标准管理
│       ├── get_development_standards.js # 开发标准管理
│       ├── database_standards.js # 数据库标准管理
│       ├── api_debug.js          # API 调试工具
│       └── ...                   # 其他工具
├── bin/
│   └── cli.js                    # CLI 启动脚本
├── start-server.js               # 托管启动脚本
├── package.json
└── README.md
```

## 🧪 测试

```bash
npm test
```

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📞 支持

如果您在使用过程中遇到问题，请：

1. 查看 [Issues](https://github.com/liliangshan/mcp-server-project-standards/issues) 页面
2. 创建新的 Issue 描述您的问题
3. 提供详细的错误信息和复现步骤

---

**让 AI 辅助开发更加标准化和高效！** 🚀
