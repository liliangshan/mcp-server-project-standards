### MCP 项目标准服务器 v3.0.0：多项目统一开发的“标准化中枢”

GitHub：`https://github.com/liliangshan/mcp-server-project-standards`

NPM：`https://www.npmjs.com/package/@liangshanli/mcp-server-project-standards`

安装（全局）：
```bash
npm install -g @liangshanli/mcp-server-project-standards
```

在同一个项目中，往往会拆分为后端服务、前端界面、用户管理中心、管理员管理中心等多个子域。借助本工具，团队可以在同一开发项目内，为不同模块定义、承载并执行各自的接口与规范：登录/鉴权流程、通用请求头、错误结构、调试与执行策略均可按模块独立配置，同时又在统一的标准框架下协同运转，实现“统一治理、按域隔离、就近复用”的工程最佳实践。

在日益复杂的团队协作与多项目并行开发背景下，如何让不同项目在不同机器、不同 AI 工具之间保持一致的“标准感知”和“执行体验”，成为提升工程效率与质量的关键。本次 v3.0.0 重大发布，围绕“多项目配置隔离”“工具前缀体系”“一致的路径解析与自动路由”三个维度进行了系统优化，目标是让团队在多项目同时推进时，也能获得稳定、统一、可治理的开发标准体验。

### 核心变化一：多项目配置隔离，天然适配复杂场景
我们引入了统一的配置目录解析函数 `getConfigDir()`，将配置目录的决策逻辑标准化：
- 若设置 `CONFIG_DIR`，优先使用；
- 若未设置 `CONFIG_DIR` 且存在 `TOOL_PREFIX`，使用 `./.setting.<TOOL_PREFIX>`；
- 否则使用默认 `./.setting`。

这一改动看似简单，却带来显著收益：不同项目只需通过环境变量配置不同前缀，即可得到独立的配置空间（`config.json` / `api.json`），彻底避免相互污染，使配置管理从“手工兜底”变为“机制保障”。这对多团队并行、微服务多仓库、多环境联调等场景尤为友好。

### 核心变化二：工具前缀与项目名，显示与调用双一致
当同时设置 `TOOL_PREFIX` 与 `PROJECT_NAME` 时：
- `tools/list` 中展示的工具名自动加前缀（如 `xxx_api_debug`），工具描述自动加项目名前缀，带来更强的“所见即所用”的项目识别度；
- 在实际调用 `tools/call` 时，服务器会自动剥离前缀，将 `xxx_api_debug` 智能路由到真实方法 `api_debug`，无须额外适配客户端逻辑，消除因前缀导致的调用摩擦。

这意味着：运维负责人可以对工具“命名空间化”，而开发者、AI 助手的调用体验不变，显示识别与调用路由实现了“前台区分、后台统一”。

### 核心变化三：路径与行为统一，降低维护成本
`server-final.js` 与 `api_common.js` 一致采用 `getConfigDir()`，读写配置路径与日志展示完全对齐，避免“同名不同实现”的陷阱。同时我们清理了重复的 `api_debug` 方法定义，减少歧义，提升可维护性。总体上，代码结构更清晰、行为更可预测，为后续扩展新能力打下良好基础。

### 带来的核心价值
- 多项目并行开发时的“强隔离、弱耦合”：通过 `TOOL_PREFIX` 即可实现每个项目独立的配置空间，不需改代码，也不需改调用习惯。
- 团队协作的“可治理与可识别”：工具名加前缀、描述加项目名，统一而不混乱；前台可区分，后台可复用。
- AI 协作的“低心智负担”：AI 工具可直接调用带前缀名，服务端自动路由，减少适配成本和误用概率。
- 运维与研发的“配置即策略”：仅靠环境变量即可切换项目上下文、统一工具命名、隔离配置目录，部署与迁移更从容。

### 与既有生态的良好协作
v3.0.0 延续了对 `api_login`、`api_debug`、`api_config`、`api_execute`、`api_help` 工具的清晰职责划分与文档化输出；结合 `API_DEBUG_EXAMPLES.md` 的丰富示例，依然保持易用的 API 调试体验。同时对 HTTPS 场景、Content-Type 自动识别、登录与 Token 管理等能力保持兼容与增强，确保工程效率持续稳定。

### 典型落地方式
- 多服务/多环境：为每个服务或环境设置不同 `TOOL_PREFIX`，独立配置互不干扰；
- 多团队/多客户：以项目名为维度隔离配置，并在工具描述中显式标注 `PROJECT_NAME`；
- 渐进式升级：对现有调用几乎零侵入，直接设置前缀即可获得新能力。

### 写在最后
本次版本的核心，是将“标准”从静态文件与文档，转化为“可执行、可隔离、可治理”的工程化能力。期待 v3.0.0 能在你的团队中，成为连接人、规范与工具的稳定中枢，让多项目统一开发真正落地。



### 编辑器集成示例

Cursor（单项目示例）：
```json
{
  "mcpServers": {
    "project-standards": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "CONFIG_DIR": "./.setting",
        "API_DEBUG_ALLOWED_METHODS": "GET,POST,PUT,DELETE",
        "API_DEBUG_LOGIN_URL": "/api/login",
        "API_DEBUG_LOGIN_METHOD": "POST",
        "API_DEBUG_LOGIN_BODY": "{\"username\":\"\",\"password\":\"\"}"
      }
    }
  }
}
```


Cursor（多项目示例）：
```json
{
  "mcpServers": {
    "project-standards-A": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "TOOL_PREFIX": "projA",
        "PROJECT_NAME": "项目A",
        "API_DEBUG_ALLOWED_METHODS": "GET,POST,PUT,DELETE",
        "API_DEBUG_LOGIN_URL": "/api/login",
        "API_DEBUG_LOGIN_METHOD": "POST",
        "API_DEBUG_LOGIN_BODY": "{\"username\":\"\",\"password\":\"\"}"
      }
    },
    "project-standards-B": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "TOOL_PREFIX": "projB",
        "PROJECT_NAME": "项目B",
        "API_DEBUG_ALLOWED_METHODS": "GET,POST,PUT,DELETE",
        "API_DEBUG_LOGIN_URL": "/api/auth/login",
        "API_DEBUG_LOGIN_METHOD": "POST",
        "API_DEBUG_LOGIN_BODY": "{\"mobile\":\"\",\"password\":\"\"}"
      }
    }
  }
}
```

VS Code（单项目示例）：
```json
{
  "mcp.servers": {
    "project-standards": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "CONFIG_DIR": "./.setting",
        "API_DEBUG_ALLOWED_METHODS": "GET,POST,PUT,DELETE",
        "API_DEBUG_LOGIN_URL": "/api/login",
        "API_DEBUG_LOGIN_METHOD": "POST",
        "API_DEBUG_LOGIN_BODY": "{\"username\":\"\",\"password\":\"\"}"
      }
    }
  }
}
```

VS Code（多项目示例）：
```json
{
  "mcp.servers": {
    "project-standards-A": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "TOOL_PREFIX": "projA",
        "PROJECT_NAME": "项目A",
        "API_DEBUG_ALLOWED_METHODS": "GET,POST,PUT,DELETE",
        "API_DEBUG_LOGIN_URL": "/api/login",
        "API_DEBUG_LOGIN_METHOD": "POST",
        "API_DEBUG_LOGIN_BODY": "{\"username\":\"\",\"password\":\"\"}"
      }
    },
    "project-standards-B": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "TOOL_PREFIX": "projB",
        "PROJECT_NAME": "项目B",
        "API_DEBUG_ALLOWED_METHODS": "GET,POST,PUT,DELETE",
        "API_DEBUG_LOGIN_URL": "/api/auth/login",
        "API_DEBUG_LOGIN_METHOD": "POST",
        "API_DEBUG_LOGIN_BODY": "{\"mobile\":\"\",\"password\":\"\"}"
      }
    }
  }
}
```


---

### English Version

GitHub: `https://github.com/liliangshan/mcp-server-project-standards`

NPM: `https://www.npmjs.com/package/@liangshanli/mcp-server-project-standards`

Installation (global):
```bash
npm install -g @liangshanli/mcp-server-project-standards
```

In a single product, teams often split work into multiple domains: backend services, frontend UI, user portal, and admin portal. With this tool, each module can define and run its own API workflows and standards within the same project—login/auth flows, common headers, error structures, and debugging/execution policies can be configured per domain—while still operating under a unified standard framework. This enables centralized governance, domain isolation, and local reuse.

As collaboration scales and projects run in parallel, keeping a consistent sense of standards and execution across machines and AI tools becomes critical. v3.0.0 focuses on three pillars—multi-project configuration isolation, a tool prefix system, and unified path resolution with auto-routing—so your team can achieve stable, unified, governable development.

Key change highlights:
- Unified `getConfigDir()` logic: `CONFIG_DIR` if set; else `./.setting.<TOOL_PREFIX>` when prefix is set; otherwise `./.setting`.
- Prefixed tool names and project-branded descriptions in `tools/list` when both `TOOL_PREFIX` and `PROJECT_NAME` are provided.
- Automatic prefix stripping in `tools/call`: calling `xxx_api_debug` routes to `api_debug` transparently.

Core benefits:
- Strong isolation with low coupling per domain via environment-only configuration.
- Recognizable and governable collaboration with consistent naming and branding.
- Lower cognitive load for AI tools; prefixed calls are routed automatically.

Editor integration examples for both single-project and multi-project setups:

Cursor (single project):
```json
{
  "mcpServers": {
    "project-standards": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "CONFIG_DIR": "./.setting",
        "API_DEBUG_ALLOWED_METHODS": "GET,POST,PUT,DELETE",
        "API_DEBUG_LOGIN_URL": "/api/login",
        "API_DEBUG_LOGIN_METHOD": "POST",
        "API_DEBUG_LOGIN_BODY": "{\"username\":\"\",\"password\":\"\"}"
      }
    }
  }
}
```

Cursor (multi project):
```json
{
  "mcpServers": {
    "project-standards-A": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "TOOL_PREFIX": "projA",
        "PROJECT_NAME": "项目A",
        "API_DEBUG_ALLOWED_METHODS": "GET,POST,PUT,DELETE",
        "API_DEBUG_LOGIN_URL": "/api/login",
        "API_DEBUG_LOGIN_METHOD": "POST",
        "API_DEBUG_LOGIN_BODY": "{\"username\":\"\",\"password\":\"\"}"
      }
    },
    "project-standards-B": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "TOOL_PREFIX": "projB",
        "PROJECT_NAME": "项目B",
        "API_DEBUG_ALLOWED_METHODS": "GET,POST,PUT,DELETE",
        "API_DEBUG_LOGIN_URL": "/api/auth/login",
        "API_DEBUG_LOGIN_METHOD": "POST",
        "API_DEBUG_LOGIN_BODY": "{\"mobile\":\"\",\"password\":\"\"}"
      }
    }
  }
}
```

VS Code (single project):
```json
{
  "mcp.servers": {
    "project-standards": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "CONFIG_DIR": "./.setting",
        "API_DEBUG_ALLOWED_METHODS": "GET,POST,PUT,DELETE",
        "API_DEBUG_LOGIN_URL": "/api/login",
        "API_DEBUG_LOGIN_METHOD": "POST",
        "API_DEBUG_LOGIN_BODY": "{\"username\":\"\",\"password\":\"\"}"
      }
    }
  }
}
```

VS Code (multi project):
```json
{
  "mcp.servers": {
    "project-standards-A": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "TOOL_PREFIX": "projA",
        "PROJECT_NAME": "项目A",
        "API_DEBUG_ALLOWED_METHODS": "GET,POST,PUT,DELETE",
        "API_DEBUG_LOGIN_URL": "/api/login",
        "API_DEBUG_LOGIN_METHOD": "POST",
        "API_DEBUG_LOGIN_BODY": "{\"username\":\"\",\"password\":\"\"}"
      }
    },
    "project-standards-B": {
      "command": "npx",
      "args": ["@liangshanli/mcp-server-project-standards"],
      "env": {
        "TOOL_PREFIX": "projB",
        "PROJECT_NAME": "项目B",
        "API_DEBUG_ALLOWED_METHODS": "GET,POST,PUT,DELETE",
        "API_DEBUG_LOGIN_URL": "/api/auth/login",
        "API_DEBUG_LOGIN_METHOD": "POST",
        "API_DEBUG_LOGIN_BODY": "{\"mobile\":\"\",\"password\":\"\"}"
      }
    }
  }
}
```
