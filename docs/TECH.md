# MarkDown 编辑器 技术设计文档

| 文档版本 | 1.0         |
|----------|-------------|
| 创建日期 | 2026-05-19  |
| 参考 PRD | v1.0（含用户系统） |

---

## 1. 技术栈选型

### 1.1 前端

| 类别 | 技术 | 版本                                                              | 说明 |
|------|------|-----------------------------------------------------------------|------|
| 框架 | Vue 3 | ^3.4                                                            | Composition API + `<script setup>` |
| 语言 | TypeScript | ^5.0                                                            | 严格模式 |
| 构建工具 | Vite | ^5.0                                                            | 快速热更新，支持ESBuild |
| UI 组件库 | Element Plus | ^2.5                                                            | 丰富的桌面端组件（表单、表格、日期选择器、消息提示等） |
| 样式方案 | Tailwind CSS | ^3.4                                                            | 原子化CSS，用于布局与细粒度样式；Element Plus 主题变量配套覆盖 |
| Markdown 编辑器 | vue3-markdown | 1.2.17(https://www.npmjs.com/package/vue3-markdown/v/1.2.17)    | 基于 Vue3 + vue3-markdown，支持编辑/预览分屏，代码高亮，工具栏定制 |
| Markdown 解析 | vue3-markdown | 同上                                                              | 预览时渲染 |
| 代码高亮 | highlight.js | 11.11.1(https://www.npmjs.com/package/highlight.js/v/11.11.1 )  | 代码高亮|
| 状态管理 | Pinia | ^2.1                                                            | 模块化状态（user, documents, tags, statistics） |
| 路由 | Vue Router 4 | ^4.2                                                            | 路由守卫实现登录拦截 |
| HTTP 客户端 | Axios | ^1.6                                                            | 请求/响应拦截器，统一处理 Token 与 401 |
| 图表 | ECharts | ^5.5                                                            | 柱状图、饼图，通过 vue-echarts 封装 |
| 图标 | @element-plus/icons-vue |                                                                 | Element Plus 配套图标 |
| 工具 | dayjs | ^1.11                                                           | 日期处理与格式化 |

### 1.2 后端

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | NestJS | ^10.0 | 模块化，依赖注入 |
| 语言 | TypeScript | ^5.0 | 严格模式 |
| 数据库 | SQLite | 3 | 通过 better-sqlite3 驱动（同步、高性能） |
| ORM | TypeORM | ^0.3 | 支持 SQLite，支持迁移 |
| 认证 | @nestjs/passport + passport-jwt + passport-local | | JWT签发与校验，本地账号密码验证 |
| 密码加密 | argon2 | ^0.4 (argon2) | 推荐 argon2（需 node-gyp，Ubuntu 编译环境友好） |
| 验证 | class-validator + class-transformer | | DTO 参数校验 |
| API 文档 | @nestjs/swagger | | 自动生成 Swagger 文档 |
| 限速 | @nestjs/throttler | | 防止登录暴力破解 |
| 跨域 | @nestjs/platform-express | | 开发环境允许 CORS |
| 环境变量 | @nestjs/config | | 管理数据库路径、JWT密钥等 |

### 1.3 开发与部署环境

- 开发环境：Windows 10/11，Node.js 24.12.0 LTS
- 生产环境：Ubuntu 24.04 LTS，Node.js 24.12.0 LTS，pm2 进程守护

---

## 2. 前端项目结构

```
markdown-editor-frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/                  # 静态资源（图片、全局样式）
│   │   └── styles/
│   │       ├── tailwind.css     # Tailwind 基础样式
│   │       └── element-override.css # 覆盖 Element Plus 变量
│   ├── components/              # 通用组件
│   │   ├── common/              # 基础组件（按钮、输入框等的二次封装，可选）
│   │   └── business/            # 业务组件
│   │       ├── DocumentCard.vue       # 文档卡片
│   │       ├── TagBadge.vue          # 标签徽章
│   │       ├── TagSelector.vue       # 标签选择器（自动补全）
│   │       └── StatisticsChart.vue   # 统计图表封装
│   ├── composables/             # 组合式函数（hooks）
│   │   ├── useAuth.ts           # 登录、注册、登出逻辑
│   │   ├── useDocument.ts       # 文档CRUD操作
│   │   ├── useTag.ts            # 标签操作
│   │   └── useSearch.ts         # 搜索与过滤逻辑
│   ├── layouts/                 # 布局组件
│   │   ├── AuthLayout.vue       # 登录/注册页布局
│   │   └── MainLayout.vue       # 主工作区三栏布局
│   ├── router/                  # 路由配置
│   │   ├── index.ts             # 路由实例，全局守卫
│   │   └── routes.ts            # 路由定义
│   ├── stores/                  # Pinia 状态管理
│   │   ├── auth.ts              # 用户信息、Token、登录状态
│   │   ├── documents.ts         # 文档列表、当前编辑文档
│   │   ├── tags.ts              # 用户标签列表
│   │   └── statistics.ts        # 统计缓存
│   ├── views/                   # 页面组件
│   │   ├── auth/
│   │   │   ├── LoginView.vue
│   │   │   └── RegisterView.vue
│   │   ├── documents/
│   │   │   ├── DocumentList.vue      # 文档列表页（主视图）
│   │   │   └── DocumentEditor.vue    # 编辑器视图
│   │   ├── tags/
│   │   │   └── TagManage.vue         # 标签管理页（可选，侧边栏已包含）
│   │   ├── statistics/
│   │   │   └── StatisticsView.vue    # 统计看板
│   │   └── profile/
│   │       └── ProfileView.vue       # 个人设置（修改密码）
│   ├── api/                     # API 封装
│   │   ├── request.ts           # axios 实例，拦截器
│   │   ├── auth.ts              # 登录/注册/个人信息API
│   │   ├── documents.ts         # 文档CRUD
│   │   ├── tags.ts              # 标签CRUD
│   │   └── statistics.ts       # 统计接口
│   ├── utils/                   # 工具函数
│   │   ├── token.ts             # Token 存取（localStorage）
│   │   ├── format.ts            # 日期格式化
│   │   └── validator.ts         # 前端表单校验规则
│   ├── App.vue
│   └── main.ts                  # 入口，注册插件
├── .env.development             # 环境变量（开发API基地址）
├── .env.production              # 生产API基地址
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

**关键模块交互：**
- 路由守卫从 `auth` store 获取 Token，若不存在则跳转登录页。
- 请求拦截器从 store 或 localStorage 获取 Token 并附加。
- 文档编辑器通过 `useDocument` composable 调用 API，并利用 Pinia store 缓存当前文档。
- 标签自动补全从 `tags` store 获取当前用户的标签列表。
- 统计页面通过 API 获取聚合数据，使用 ECharts 渲染，点击图表可调用 `useSearch` 跳转到文档列表过滤视图。

---

## 3. 后端项目结构

```
markdown-editor-backend/
├── src/
│   ├── config/                  # 配置文件（数据库、JWT等）
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── app.config.ts
│   ├── common/                  # 公共模块
│   │   ├── decorators/          # 自定义装饰器（@Public, @CurrentUser）
│   │   ├── guards/              # 全局守卫（JWT Auth Guard）
│   │   ├── interceptors/        # 响应格式统一拦截器
│   │   └── filters/             # 异常过滤器
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts   # 登录/注册/个人信息
│   │   │   ├── auth.service.ts      # 验证逻辑，签发Token
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/                # 登录/注册 DTO
│   │   │   ├── strategies/
│   │   │   │   ├── local.strategy.ts
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── entities/           # 用户实体（或复用 users 模块）
│   │   ├── users/
│   │   │   ├── users.controller.ts   # 用户信息（查询、修改密码、注销）
│   │   │   ├── users.service.ts
│   │   │   ├── users.module.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   ├── documents/
│   │   │   ├── documents.controller.ts
│   │   │   ├── documents.service.ts
│   │   │   ├── documents.module.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   │       └── document.entity.ts
│   │   ├── tags/
│   │   │   ├── tags.controller.ts
│   │   │   ├── tags.service.ts
│   │   │   ├── tags.module.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   │       ├── tag.entity.ts
│   │   │       └── document-tag.entity.ts   # 多对多关联表
│   │   └── statistics/
│   │       ├── statistics.controller.ts
│   │       ├── statistics.service.ts
│   │       └── statistics.module.ts
│   ├── app.module.ts            # 根模块，引入所有模块
│   └── main.ts                  # 启动入口，配置 Swagger，CORS
├── data/                        # SQLite 数据库文件存放目录（.gitignore）
│   └── database.sqlite
├── .env                         # 环境变量（JWT_SECRET, DB_PATH等）
├── tsconfig.json
└── package.json
```

**架构模式：**
- 采用 **Repository 模式**，Service 层通过 TypeORM Repository 操作数据库。
- **认证流程**：AuthModule 提供本地策略验证用户名密码，JWT 策略解析 Token 并将用户信息注入请求上下文。
- **数据隔离**：所有业务查询均添加 `where: { userId: currentUser.id }`，通过自定义装饰器 `@CurrentUser()` 获取当前请求用户。
- 公共接口（/auth/login, /auth/register）使用 `@Public()` 装饰器跳过全局 JWT 守卫。

---

## 4. 数据模型

### 4.1 表结构设计

#### users（用户表）
| 字段名 | 类型 | 约束 | 描述 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 用户唯一标识 |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名，小写存储，用于登录 |
| email | VARCHAR(100) | UNIQUE, NOT NULL | 邮箱 |
| password | VARCHAR(255) | NOT NULL | 哈希后的密码（argon2） |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | DATETIME | | 更新时间 |

索引：`idx_users_username`, `idx_users_email`

#### documents（文档表）
| 字段名 | 类型 | 约束 | 描述 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 文档唯一标识 |
| title | VARCHAR(255) | NOT NULL | 文档标题（自动提取或手动） |
| content | TEXT | NOT NULL | Markdown 原始内容 |
| userId | INTEGER | NOT NULL, FOREIGN KEY | 所属用户 ID |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | DATETIME | | 最后修改时间 |
| deletedAt | DATETIME | | 软删除时间（非 NULL 表示在回收站） |

索引：`idx_documents_userId`, `idx_documents_title`, `idx_documents_updatedAt`, `idx_documents_deletedAt`

#### tags（标签表）
| 字段名 | 类型 | 约束 | 描述 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 标签唯一标识 |
| name | VARCHAR(50) | NOT NULL | 标签名称（用户内唯一） |
| userId | INTEGER | NOT NULL, FOREIGN KEY | 所属用户 ID |

索引：`idx_tags_userId`，**联合唯一约束**：`UNIQUE(name, userId)` 保证同一用户不重名。

#### document_tags（文档-标签关联表）
| 字段名 | 类型 | 约束 | 描述 |
|--------|------|------|------|
| documentId | INTEGER | NOT NULL, FOREIGN KEY | 文档 ID |
| tagId | INTEGER | NOT NULL, FOREIGN KEY | 标签 ID |

主键：`PRIMARY KEY (documentId, tagId)`
外键：`FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE`，`FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE`

### 4.2 实体关系图（简要）

- 一个 User 拥有多个 Document 和多个 Tag。
- Document 与 Tag 是多对多关系，通过 document_tags 关联。
- 所有关系均限定在当前用户范围内，业务层通过 userId 严格控制。

### 4.3 TypeORM 实体定义示例（关键字段）

```typescript
// user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// document.entity.ts
@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn() // 软删除
  deletedAt: Date;

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'document_tags',
    joinColumn: { name: 'documentId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];
}

// tag.entity.ts
@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToMany(() => Document, document => document.tags)
  documents: Document[];
}
```

---

## 5. 关键技术难点

### 5.1 Markdown 编辑器集成与体验优化

**难点：** 需提供流畅的编辑/预览分屏体验，支持工具栏、快捷键、图片插入，且能处理大文档。

**解决方案：**
- 选用 `vue3-markdown`，支持编辑模式（CodeMirror 内核）、预览模式、分屏展示，可定制工具栏。
- 对大文档（>10万字）进行性能测试，若出现卡顿可启用 CodeMirror 的 `viewportMargin` 选项 或 考虑虚拟渲染。
- 图片处理：编辑器支持粘贴/拖拽图片，前端将图片转为 base64（限制大小 ≤ 1MB）直接嵌入 Markdown 内容中；亦可扩展为上传至本地静态目录返回路径引用（暂不实现）。PRD 要求本地路径或 base64 小图，base64 简单且不依赖文件服务，但会膨胀内容，需在 UI 提示“大图建议引用外部链接”。
- 自动保存：监听编辑器 `change` 事件，使用防抖（2秒）调用保存 API，保存成功后在状态栏显示“已保存”。编辑器卸载时需立即保存。注意并发保存冲突：前端在发送保存请求时携带 `updatedAt` 时间戳，后端校验并返回冲突提示（乐观锁），若冲突可提示用户刷新。

### 5.2 数据隔离与查询性能

**难点：** 多用户环境下，确保每个请求仅返回当前用户数据，且组合搜索（标题+日期+标签）需兼顾灵活性与效率。

**解决方案：**
- 后端全链路强制 `userId` 过滤：通过 `@CurrentUser()` 装饰器获取用户信息，在 Service 层注入查询条件。严禁前端传入 `userId` 或从请求体中获取。
- 搜索 API（GET /documents）接收 query params `?keyword=xxx&startDate=&endDate=&tags=1,2,3&tagMode=OR`。
    - 使用 TypeORM QueryBuilder 动态构建 SQL，添加 `AND documents.userId = :userId` 和 `AND documents.deletedAt IS NULL`。
    - 标题模糊搜索：`documents.title LIKE '%keyword%'`，可建立 FTS5 全文索引提升性能，但初期数据量不大时可暂用 LIKE。
    - 日期过滤：对 `createdAt` 或 `updatedAt` 建索引。
    - 标签过滤：当 tagMode=OR 时，使用 `IN` 子查询；AND 时使用 `HAVING COUNT(DISTINCT tagId) = tagCount` 配合 JOIN。
- 统计接口：使用 SQL 聚合函数，按月分组：
  ```sql
  SELECT strftime('%Y-%m', createdAt) as month, COUNT(*) as count
  FROM documents
  WHERE userId = :userId AND deletedAt IS NULL
  GROUP BY month;
  ```
  标签分类统计：
  ```sql
  SELECT t.name, COUNT(dt.documentId) as count
  FROM document_tags dt
  JOIN tags t ON t.id = dt.tagId
  JOIN documents d ON d.id = dt.documentId
  WHERE d.userId = :userId AND strftime('%Y-%m', d.createdAt) = :month
  GROUP BY t.name;
  ```
  索引 `documents(userId, createdAt)` 和 `document_tags(documentId, tagId)` 可大幅提升查询速度。

### 5.3 用户认证与安全问题

**难点：** JWT Token 的生成、存储、过期处理，防止暴力破解，密码安全存储，XSS 防护。

**解决方案：**
- 使用 `@nestjs/passport` 的 JWT 策略，签发 Token 时设置 `expiresIn: '24h'`。不实现 Refresh Token（V1 版本），Token 过期后用户需重新登录。
- 密码采用 argon2id 哈希（强记忆硬度），存储不可逆。
- 登录接口添加 `@nestjs/throttler` 限速，每分钟最多 5 次请求，防止字典攻击。
- 所有用户输入使用 class-validator 严格校验（白名单模式）。
- Markdown 预览时，必须使用 DOMPurify 清洗 HTML，防止 XSS。`@kangc/v-md-editor` 的预览功能内部已做安全处理，但仍需校验。
- 前端 Token 存储于 `localStorage`，存在 XSS 风险，但作为本地应用可接受；也可考虑 `httpOnly` cookie（但需后端配合，跨域配置需仔细）。当前方案 Token 通过 Axios 请求头 `Authorization: Bearer <token>` 发送。
- 后端统一响应格式 `{ code: number, data: any, message: string }`，所有异常被全局过滤器捕获，不暴露堆栈信息。
- 用户注销：后端删除用户数据时需开启事务，依次删除关联标签、文档标签、文档，最后删除用户。

### 5.4 标签管理与一致性

**难点：** 标签重命名、删除需级联更新所有关联文档，且需保证在并发下一致。

**解决方案：**
- 标签重命名：直接更新 `tags` 表的 `name`，所有关联通过 `tagId` 维持，无需更新 `document_tags` 表。
- 标签删除：先解除所有文档与该标签的关联（删除 `document_tags` 中的对应行），再删除标签。建议在后端一个事务中完成。
- 编辑文档时标签输入框需要自动补全当前用户已有标签。前端通过 `tags` store 缓存列表，输入时过滤匹配。
- 标签去重：注册/编辑标签时后端检查 `name` + `userId` 唯一约束。

### 5.5 统计图表下钻跳转

**难点：** 点击统计图表的柱状条或饼图扇区后，需携带过滤条件跳转到文档列表视图，并触发搜索。

**解决方案：**
- ECharts 配置点击事件回调，`params` 中可获取到月份（柱状图）或标签名（饼图）。
- 使用 Vue Router 的 `router.push` 跳转到文档列表页，并将过滤参数通过 `query` 传递（如 `?month=2026-05&tag=前端`）。
- 文档列表页监听路由 `query` 变化，调用搜索 API 更新列表。
- 为确保过滤条件与图表对应，统计 API 和文档搜索 API 的参数格式需要统一。

### 5.6 SQLite 并发写入限制与 WAL 模式

**难点：** SQLite 默认不支持高并发写入，同一时间只能有一个写入操作，自动保存与统计查询可能发生冲突。

**解决方案：**
- 启用 WAL（Write-Ahead Logging）模式，通过 TypeORM 的 `extra: { mode: 'WAL' }` 或在连接后执行 `PRAGMA journal_mode=WAL;`，可允许读写并发。
- 设置合适的 busy_timeout（如 5000ms），避免立即返回 SQLITE_BUSY 错误。
- 生产环境使用 `better-sqlite3` 驱动，它是同步调用，性能优秀且避免了异步回调的复杂性。
- 统计查询属于聚合读，WAL 模式下不会阻塞写操作。
- 在自动保存时若遇到数据库锁定，前端可进行重试（最多 3 次）。

### 5.7 跨平台兼容（Windows开发，Ubuntu部署）

**难点：** 数据库文件路径、Node.js 原生模块编译、环境变量差异。

**解决方案：**
- 数据库路径通过环境变量 `DB_PATH` 配置，默认为项目根目录 `./data/database.sqlite`，开发生产均使用相对路径（需确保进程工作目录一致）。
- 生产环境使用 `pm2` 启动，配置文件设置 `cwd`。
- argon2 或 bcrypt 在 Ubuntu 上编译需要 `build-essential` 和 `python3`，在部署脚本中提前安装。
- 前端 API 基地址通过环境变量 `VITE_API_BASE_URL` 配置，开发时为 `http://localhost:3000/api/v1`，生产构建时注入实际域名。
- Tailwind 的 JIT 模式在开发环境启动正常，生产构建时 `purge` 会自动移除无用样式。

### 5.8 文档导入导出（后续版本难点预览，当前版本暂不实现）

**难点：** 批量导入本地 .md 文件时，需解析文件名作为标题，处理编码，并关联用户；导出为 PDF 时需要渲染 Markdown 并分页。

**解决方案（概要）：** 后续版本将使用 Node.js 的 `fs` 模块读取文件，前端上传后由后端处理；导出使用 `puppeteer` 或 `markdown-pdf`，需在 Ubuntu 安装无头浏览器依赖。

---
