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

## Behavioral Guidelines
Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## CodeGraph

CodeGraph builds a semantic knowledge graph of codebases for faster, smarter code exploration.

### If `.codegraph/` exists in the project

**Answer directly with CodeGraph — don't delegate exploration to a file-reading sub-agent or a grep/read loop.** CodeGraph *is* the pre-built search index; re-deriving its answers with grep + Read repeats work it already did and costs more for the same result. For "how does X work?", architecture, trace, or where-is-X questions, answer in a handful of CodeGraph calls and stop — typically with **zero file reads**. The returned source is complete and authoritative: treat it as already read and do not re-open those files. Reach for raw Read/Grep only to confirm a specific detail CodeGraph didn't cover.

**Tool selection by intent:**

| Tool | Use For |

|------|---------|

| `codegraph_context` | Map a task / feature / area first — composes search + node + callers + callees in one call |

| `codegraph_trace` | "How does X reach Y" — the call path, each hop's body inline (follows dynamic-dispatch hops grep can't) |

| `codegraph_explore` | Survey several related symbols' source in ONE budget-capped call |

| `codegraph_search` | Find a symbol by name |

| `codegraph_callers` / `codegraph_callees` | Walk call flow one hop at a time |

| `codegraph_impact` | Check what's affected before editing |

| `codegraph_node` | Get a single symbol's source / signature |

A direct CodeGraph answer is a handful of calls; a grep/read exploration is dozens.

### If `.codegraph/` does NOT exist

At the start of a session, ask the user if they'd like to initialize CodeGraph:

"I notice this project doesn't have CodeGraph initialized. Would you like me to run `codegraph init -i` to build a code knowledge graph?"
