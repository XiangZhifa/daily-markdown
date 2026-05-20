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
