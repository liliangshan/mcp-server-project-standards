# API Debug Tool - 使用示例和说明

## 📋 工具概述

`api_debug` 工具是一个强大的API调试工具，支持多种请求体格式和自动内容类型检测。

## 🔧 支持的请求体格式

### 1. JSON 对象格式
```json
{
  "url": "/api/login",
  "method": "POST",
  "body": {
    "username": "admin",
    "password": "123456"
  }
}
```

### 2. 表单数据格式
```json
{
  "url": "/api/update",
  "method": "PUT",
  "body": "username=admin&password=123456",
  "contentType": "application/x-www-form-urlencoded"
}
```

### 3. XML 格式
```json
{
  "url": "/api/data",
  "method": "POST",
  "body": "<user><name>John</name><email>john@example.com</email></user>",
  "contentType": "application/xml"
}
```

### 4. 纯文本格式
```json
{
  "url": "/api/message",
  "method": "POST",
  "body": "Hello World",
  "contentType": "text/plain"
}
```

### 5. HTML 格式
```json
{
  "url": "/api/report",
  "method": "POST",
  "body": "<html><body><h1>Report</h1></body></html>",
  "contentType": "text/html"
}
```

## 🎯 完整使用示例

### 示例 1: 简单 GET 请求
```json
{
  "url": "/api/users",
  "method": "GET",
  "query": {
    "page": 1,
    "limit": 10
  }
}
```

### 示例 2: POST 请求带认证
```json
{
  "url": "/api/users",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "Content-Type": "application/json"
  },
  "body": {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  }
}
```

### 示例 3: PUT 请求更新数据
```json
{
  "url": "/api/users/123",
  "method": "PUT",
  "body": "name=John&email=john@example.com&age=31",
  "contentType": "application/x-www-form-urlencoded"
}
```

### 示例 4: DELETE 请求
```json
{
  "url": "/api/users/123",
  "method": "DELETE",
  "headers": {
    "Authorization": "Bearer token123"
  }
}
```

### 示例 5: 带查询参数的 GET 请求
```json
{
  "url": "/api/search",
  "method": "GET",
  "query": {
    "keyword": "test",
    "category": "technology",
    "sort": "date"
  }
}
```

## 🔍 自动内容类型检测

工具会自动检测请求体格式并设置相应的 Content-Type：

| 请求体格式 | 自动检测的 Content-Type |
|-----------|----------------------|
| JSON 对象 | `application/json` |
| 表单数据 | `application/x-www-form-urlencoded` |
| XML | `application/xml` |
| HTML | `text/html` |
| 纯文本 | `text/plain` |

## ⚙️ 环境变量配置

可以通过以下环境变量配置API调试行为：

- `API_DEBUG_ALLOWED_METHODS`: 允许的HTTP方法（默认: GET）
- `API_DEBUG_LOGIN_URL`: 登录接口URL（默认: /api/login）
- `API_DEBUG_LOGIN_METHOD`: 登录请求方法（默认: POST）
- `API_DEBUG_LOGIN_BODY`: 登录请求体模板
- `API_DEBUG_LOGIN_DESCRIPTION`: 登录接口描述

## 🚀 最佳实践

1. **使用相对URL**: 推荐使用 `/api/endpoint` 而不是完整URL
2. **设置基础URL**: 通过 `api_config` 工具设置 `baseUrl`
3. **利用自动检测**: 让工具自动检测内容类型，除非有特殊需求
4. **合理使用查询参数**: GET请求使用 `query` 参数而不是 `body`
5. **设置认证头**: 通过 `headers` 参数设置认证信息

## 🔧 错误处理

工具会返回详细的错误信息，包括：
- 请求详情（URL、方法、请求头、请求体）
- 响应详情（状态码、响应头、响应数据）
- 错误信息（网络错误、HTTP错误等）

## 📊 响应格式

成功响应：
```json
{
  "success": true,
  "message": "Successfully executed API: /api/users",
  "request": {
    "url": "https://api.example.com/api/users",
    "method": "GET",
    "headers": {...},
    "body": null
  },
  "response": {
    "status": 200,
    "statusText": "OK",
    "headers": {...},
    "data": {...}
  },
  "timestamp": "2024-12-19T10:30:00.000Z"
}
```

失败响应：
```json
{
  "success": false,
  "message": "Failed to execute API: /api/users",
  "request": {...},
  "error": "HTTP 404: Not Found",
  "timestamp": "2024-12-19T10:30:00.000Z"
}
```
