# 墨记

## 项目概述
这是一个简单的Markdown编辑器应用，前端使用 Vue3 + TypeScript 开发，后端使用 Nest.js + TypeScript 开发

## 开发环境
- 操作系统：Windows
- 终端：PowerShell
- 请使用 Windows 兼容的命令
- Node.js版本：24.12.0

## 开发规范
- 前端、后端均使用 TypeScript，确保类型安全
- 前端使用 Vue3 Composition API + Hooks
- 前端使用 Tailwind CSS 编写样式
- 前端开发遵循 vue-best-practices Skill 的指导
- 后端开发遵循 nestjs-best-practices Skill 的指导
- 所有数据存储在 SQLLITE 数据库中

## 代码风格
- 使用 ESLint 和 Prettier
- 组件名使用 PascalCase
- 函数名使用 camelCase
- 常量使用 UPPER_SNAKE_CASE

## 前端项目路径
位于 markdown-editor-frontend 目录下

## 后端项目路径
位于 markdown-editor-backend 目录下

## 测试要求
- 对于 markdown-editor-frontend 目录下的前端项目，每个功能完成后，需要编写完善的自动化测试用例，调用 chrome-dev-tools MCP 进行自动化测试
- 确保数据正确存储和读取
- 测试各种边界情况
- 调用 audit-website Skill 进行安全审计，确保 前端 和 后端 代码安全可靠

## 注意事项
- 保持代码简洁，避免过度设计
- 优先实现核心功能
- 调用 fronted-design Skill 进行 UI 设计
- 必须确保移动端适配

## CodeGraph

CodeGraph 为代码库构建语义知识图谱，实现更快、更智能的代码探索。

### 如果项目中存在 `.codegraph/`

**直接使用 CodeGraph 回答 — 不要将探索委托给文件读取子代理或 grep/read 循环。** CodeGraph *就是* 预构建的搜索索引；用 grep + Read 重新推导其答案会重复它已完成的工作，对于相同结果花费更多，每次工具调用消耗更多。CodeGraph *就是* 预构建的搜索索引；用 grep + Read 重新推导其答案会重复它已完成的工作，对于相同结果花费更多。对于类似"X 如何工作？"、"X 如何实现？"、架构、追踪或"X 在哪里"的问题，调用 CodeGraph 来回答 —— 通常 **零文件读取**。返回的源代码是完整且可信的：将其视为已读取，不要重新打开这些文件。仅在确认 CodeGraph 未覆盖的特定细节时才使用原始 Read/Grep。

**按意图选择工具：**

| 工具 | 用途 |
|------|------|
| `codegraph_context` | 首先映射任务/功能/区域 — 一次调用组合搜索 + 节点 + 调用者 + 被调用者 |
| `codegraph_trace` | "X 如何到达 Y" — 调用路径，每个跃点的 body 内联（遵循 grep 无法处理的动态分派跃点） |
| `codegraph_explore` | 在一次预算受限调用中调查多个相关符号的源代码 |
| `codegraph_search` | 按名称查找符号 |
| `codegraph_callers` / `codegraph_callees` | 一次一个跃点地遍历调用流 |
| `codegraph_impact` | 编辑前检查受影响范围 |
| `codegraph_node` | 获取单个符号的源代码/签名 |

直接的 CodeGraph 回答只需几次调用；grep/read 探索则需要数十次。

### 如果 `.codegraph/` 不存在

在会话开始时，询问用户是否要初始化 CodeGraph：

"我注意到此项目未初始化 CodeGraph。你希望我运行 `codegraph init -i` 来构建代码知识图谱吗？"
