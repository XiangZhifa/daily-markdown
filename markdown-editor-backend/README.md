# Markdown Editor Backend

简洁优雅的 Markdown 文档后端服务，支持文档管理、标签分类、用户认证和数据统计。

## 功能特性

- **用户认证**：JWT 令牌认证，支持注册、登录、修改密码
- **文档管理**：创建、编辑、软删除、恢复文档，支持关键词搜索和日期筛选
- **标签系统**：多标签分类，支持 AND/OR 组合筛选
- **数据统计**：月度/年度统计，标签使用排行
- **安全防护**：JWT 认证、密码加密、请求限流、CORS 跨域

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | NestJS 10.0 + TypeScript |
| 数据库 | SQLite + TypeORM |
| 认证 | Passport JWT + Local |
| 文档 | Swagger (OpenAPI) |
| 工具 | ESLint, Jest, Prettier |

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      客户端请求                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Global Guards                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ JwtAuthGuard │  │ThrottlerGuard│  │  CORS        │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Global Pipes                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │         ValidationPipe (whitelist, transform)     │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Modules (5个)                             │
│  ┌─────────┐ ┌─────────┐ ┌───────────┐ ┌────────┐ ┌──────┐ │
│  │   Auth  │ │  Users  │ │ Documents │ │  Tags  │ │ Stats│ │
│  └─────────┘ └─────────┘ └───────────┘ └────────┘ └──────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据库层                                │
│  ┌──────────────────────────────────────────────────┐      │
│  │          SQLite (data/database.sqlite)           │      │
│  │   User │ Document │ Tag │ DocumentTag │ Sessions  │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 快速开始

### 环境要求

- Node.js >= 18.x
- npm >= 9.x

### 安装

```bash
# 克隆项目
cd markdown-editor-backend

# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env
```

### 启动服务

```bash
# 开发模式（热重载）
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

服务启动后访问：
- API 地址：`http://localhost:3000/api/v1`
- Swagger 文档：`http://localhost:3000/api/docs`

## 环境变量

创建 `.env` 文件：

```bash
# 必需
JWT_SECRET=your-secret-key-change-in-production

# 可选（均有默认值）
DB_PATH=data/database.sqlite
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `JWT_SECRET` | - | JWT 签名密钥（生产环境必须修改） |
| `DB_PATH` | `data/database.sqlite` | 数据库文件路径 |
| `PORT` | `3000` | 服务端口 |
| `FRONTEND_URL` | `http://localhost:5173` | 前端地址（用于 CORS） |
| `NODE_ENV` | `development` | 运行环境 |

## 数据库结构

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User    │       │  Document   │       │     Tag     │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ username    │       │ title       │       │ name        │
│ email       │       │ content     │       │ color       │
│ password    │       │ userId (FK) │       │ userId (FK) │
│ createdAt   │       │ createdAt   │       │ createdAt   │
│ updatedAt   │       │ updatedAt   │       │ updatedAt   │
└─────────────┘       │ deletedAt   │       └─────────────┘
                      └──────┬──────┘              │
                             │                      │
                      ┌──────┴──────┐              │
                      │document_tags│◄─────────────┘
                      ├─────────────┤
                      │documentId   │
                      │tagId        │
                      └─────────────┘
```

## 认证流程

```
用户注册/登录
      │
      ▼
┌─────────────┐    POST /api/v1/auth/login
│  LocalStrategy │ ◄── username + password
└─────────────┘
      │
      ▼ (验证成功)
┌─────────────┐
│  JWT Token   │ ─── 返回 access_token
└─────────────┘
      │
      ▼
后续请求携带 Header：
Authorization: Bearer <token>
      │
      ▼
┌─────────────┐    JwtStrategy 验证 Token
│ JwtAuthGuard │ ◄── 验证通过则放行
└─────────────┘
```

## API 文档

### 认证模块 `/api/v1/auth`

#### 注册

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "zhangsan",
  "password": "Pass123!",
  "email": "zhangsan@example.com"
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 登录

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "zhangsan",
  "password": "Pass123!"
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 获取个人信息

```http
GET /api/v1/auth/profile
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "createdAt": "2024-01-15T08:30:00.000Z"
  }
}
```

#### 修改密码

```http
PUT /api/v1/auth/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "Pass123!",
  "newPassword": "NewPass456!"
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "密码修改成功"
}
```

#### 登出

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "code": 0,
  "message": "登出成功"
}
```

---

### 文档模块 `/api/v1/documents`

#### 创建文档

```http
POST /api/v1/documents
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "我的第一篇笔记",
  "content": "# 标题\n\n这是文档内容..."
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "文档创建成功",
  "data": {
    "id": 1,
    "title": "我的第一篇笔记",
    "content": "# 标题\n\n这是文档内容...",
    "preview": "# 标题\n\n这是文档内容...",
    "userId": 1,
    "createdAt": "2024-01-15T08:30:00.000Z",
    "updatedAt": "2024-01-15T08:30:00.000Z",
    "deletedAt": null,
    "tags": []
  }
}
```

#### 文档列表（支持筛选）

```http
GET /api/v1/documents?keyword=笔记&startDate=2024-01-01&endDate=2024-12-31&tags=work,study&tagMode=AND&page=1&pageSize=10
Authorization: Bearer <token>
```

**参数说明：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `keyword` | string | 否 | 搜索标题和内容 |
| `startDate` | string | 否 | 开始日期 (YYYY-MM-DD) |
| `endDate` | string | 否 | 结束日期 (YYYY-MM-DD) |
| `tags` | string | 否 | 标签列表，逗号分隔 |
| `tagMode` | string | 否 | `AND` 或 `OR`，默认 `OR` |
| `page` | number | 否 | 页码，默认 1 |
| `pageSize` | number | 否 | 每页数量，默认 10 |

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "title": "我的第一篇笔记",
        "preview": "# 标题\n\n这是文档内容...",
        "userId": 1,
        "createdAt": "2024-01-15T08:30:00.000Z",
        "updatedAt": "2024-01-15T08:30:00.000Z",
        "tags": [
          { "id": 1, "name": "work", "color": "#1890ff" }
        ]
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "pageSize": 10,
      "totalPage": 1
    }
  }
}
```

#### 获取单个文档

```http
GET /api/v1/documents/1
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "title": "我的第一篇笔记",
    "content": "# 标题\n\n这是文档内容...",
    "userId": 1,
    "createdAt": "2024-01-15T08:30:00.000Z",
    "updatedAt": "2024-01-15T08:30:00.000Z",
    "deletedAt": null,
    "tags": [
      { "id": 1, "name": "work", "color": "#1890ff" }
    ]
  }
}
```

#### 更新文档

```http
PATCH /api/v1/documents/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "更新后的标题",
  "content": "更新后的内容..."
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "文档更新成功",
  "data": {
    "id": 1,
    "title": "更新后的标题",
    "content": "更新后的内容...",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### 删除文档（软删除）

```http
DELETE /api/v1/documents/1
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "code": 0,
  "message": "文档删除成功"
}
```

#### 恢复文档

```http
POST /api/v1/documents/1/restore
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "code": 0,
  "message": "文档恢复成功"
}
```

#### 添加标签

```http
POST /api/v1/documents/1/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "tagIds": [1, 2, 3]
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "标签添加成功",
  "data": {
    "id": 1,
    "title": "我的第一篇笔记",
    "tags": [
      { "id": 1, "name": "work", "color": "#1890ff" },
      { "id": 2, "name": "study", "color": "#52c41a" },
      { "id": 3, "name": "重要", "color": "#f5222d" }
    ]
  }
}
```

#### 移除标签

```http
DELETE /api/v1/documents/1/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "tagIds": [1, 2]
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "标签移除成功"
}
```

---

### 标签模块 `/api/v1/tags`

#### 创建标签

```http
POST /api/v1/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "工作",
  "color": "#1890ff"
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "标签创建成功",
  "data": {
    "id": 1,
    "name": "工作",
    "color": "#1890ff",
    "userId": 1,
    "createdAt": "2024-01-15T08:30:00.000Z"
  }
}
```

#### 标签列表

```http
GET /api/v1/tags
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    { "id": 1, "name": "工作", "color": "#1890ff" },
    { "id": 2, "name": "学习", "color": "#52c41a" }
  ]
}
```

#### 更新标签

```http
PATCH /api/v1/tags/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "工作笔记",
  "color": "#722ed1"
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "标签更新成功",
  "data": {
    "id": 1,
    "name": "工作笔记",
    "color": "#722ed1"
  }
}
```

#### 删除标签

```http
DELETE /api/v1/tags/1
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "code": 0,
  "message": "标签删除成功"
}
```

---

### 统计模块 `/api/v1/statistics`

#### 月度统计

```http
GET /api/v1/statistics/monthly?year=2024&month=3
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    { "date": "2024-03-01", "count": 5 },
    { "date": "2024-03-02", "count": 3 },
    { "date": "2024-03-03", "count": 8 }
  ]
}
```

#### 月度范围统计

```http
GET /api/v1/statistics/monthly?year=2024&startMonth=1&endMonth=6
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    { "month": "2024-01", "count": 25 },
    { "month": "2024-02", "count": 32 },
    { "month": "2024-03", "count": 28 }
  ]
}
```

#### 年度统计

```http
GET /api/v1/statistics/yearly?year=2024
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    { "month": "2024-01", "count": 25 },
    { "month": "2024-02", "count": 32 },
    { "month": "2024-03", "count": 28 }
  ]
}
```

#### 标签使用统计

```http
GET /api/v1/statistics/tags?year=2024&month=3
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    { "tagId": 1, "tagName": "工作", "count": 15 },
    { "tagId": 2, "tagName": "学习", "count": 12 }
  ]
}
```

---

## 错误响应格式

所有 API 错误遵循统一格式：

```json
{
  "code": 40401,
  "message": "文档不存在",
  "error": "NotFoundException"
}
```

**常见错误码：**

| HTTP 状态码 | 错误码 | 说明 |
|------------|--------|------|
| 400 | 40001 | 参数校验失败 |
| 401 | 40101 | 未登录或 Token 过期 |
| 403 | 40301 | 无权访问该资源 |
| 404 | 40401 | 资源不存在 |
| 409 | 40901 | 资源冲突（如用户名已存在） |
| 429 | 42901 | 请求过于频繁 |
| 500 | 50001 | 服务器内部错误 |

## 项目结构

```
markdown-editor-backend/
├── data/                          # 数据库目录
│   └── database.sqlite            # SQLite 数据库文件
├── src/
│   ├── common/                    # 公共模块
│   │   ├── filters/               # 异常过滤器
│   │   ├── interceptors/           # 响应拦截器
│   │   └── guards/                # 认证守卫
│   ├── config/                    # 配置文件
│   │   └── configuration.ts       # 环境配置
│   ├── modules/                   # 功能模块
│   │   ├── auth/                  # 认证模块
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/        # Passport 策略
│   │   │   └── dto/               # 数据传输对象
│   │   ├── users/                 # 用户模块
│   │   │   ├── user.entity.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.module.ts
│   │   │   └── users.service.ts
│   │   ├── documents/             # 文档模块
│   │   │   ├── document.entity.ts
│   │   │   ├── documents.controller.ts
│   │   │   ├── documents.module.ts
│   │   │   ├── documents.service.ts
│   │   │   └── dto/
│   │   ├── tags/                  # 标签模块
│   │   │   ├── tag.entity.ts
│   │   │   ├── tags.controller.ts
│   │   │   ├── tags.module.ts
│   │   │   ├── tags.service.ts
│   │   │   └── dto/
│   │   └── statistics/            # 统计模块
│   │       ├── statistics.controller.ts
│   │       ├── statistics.module.ts
│   │       └── statistics.service.ts
│   ├── app.module.ts              # 根模块
│   └── main.ts                    # 应用入口
├── test/                          # 测试文件
│   └── *.spec.ts
├── .env.example                   # 环境变量示例
├── .eslintrc.js                   # ESLint 配置
├── .prettierrc                    # Prettier 配置
├── nest-cli.json                  # NestJS CLI 配置
├── package.json                   # 依赖管理
├── tsconfig.json                  # TypeScript 配置
└── README.md                      # 项目文档
```

## 开发工作流

### 1. 创建新模块

```bash
# 1. 创建模块目录和文件
src/modules/new-module/
├── new-module.entity.ts
├── new-module.controller.ts
├── new-module.service.ts
├── new-module.module.ts
└── dto/
    ├── create.dto.ts
    └── update.dto.ts

# 2. 注册模块到 app.module.ts
# 3. 实现业务逻辑
# 4. 编写单元测试
```

### 2. 代码规范

```bash
# 检查代码规范
npm run lint

# 自动修复
npm run lint -- --fix

# 格式化代码
npx prettier --write "src/**/*.ts"
```

### 3. 测试

```bash
# 运行所有测试
npm run test

# 运行测试并生成覆盖率报告
npm run test -- --coverage

# 监听模式运行测试
npm run test -- --watch

# 运行指定测试文件
npm run test -- documents.service.spec.ts
```

### 4. 构建部署

```bash
# 构建生产版本
npm run build

# 构建产物位于 dist/ 目录
# 启动生产服务
NODE_ENV=production 

npm run start:prod
```

## 常见问题

### 数据库初始化失败

**问题**：启动时报 `SQLITE_CANTOPEN` 错误

**解决**：

```bash
# 确保 data 目录存在
mkdir -p data

# 检查目录权限
ls -la data/
```

### JWT Token 过期

**问题**：请求返回 401 未授权

**解决**：重新登录获取新 Token

```javascript
// 请求时携带 Token
headers: {
  Authorization: `Bearer ${access_token}`
}
```

### CORS 跨域错误

**问题**：浏览器提示跨域被阻止

**解决**：确保 `.env` 中 `FRONTEND_URL` 配置正确

```bash
FRONTEND_URL=http://localhost:5173
```

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT License
