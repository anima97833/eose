# 「角色工坊」（Character Studio）全功能应用设计与实施规划 (Plan.md)

## 一、 核心目标与定位

在小手机中新增一个**第一公民级系统应用——「角色工坊」**（应用名：**角色工坊**，图标：✨/🎨）。
对标 **SillyTavern（酒馆）** 的角色卡生态，打造集“人设精修、酒馆级正则脚本编写、HTML富文本美化、实时对局沙盒、角色卡导入导出”于一体的综合角色工坊。

---

## 二、 核心四大支柱架构

### 1. 酒馆级正则替换脚本引擎 (Regex Scripts Engine)
- 遵循酒馆的 `RegexRule` 规范：
  - `findRegex`：正则表达式字符串（如 `/<think>([\s\S]*?)<\/think>/gi` 或 `/[（(]([^）)]+)[）)]/g`）
  - `replaceString`：替换内容或 HTML 结构（支持 `$1`, `$2`, `{{match}}`, `{{char}}`）
  - `placement`：执行阶段（`display` 前端展示美化、`ai_output` 入库前清洗、`user_input` 输入前修改）
  - `disabled`：一键启用/禁用单条规则
- **预置常用神仙模板一键应用**：
  - 🧠 思维链拟物折叠框（`<details class="think-fold">`）
  - 💭 括号心声偷听气泡（`<span class="thought-whisper">`）
  - 🎭 动作星号斜体美化（`<span class="action-tag">`）
  - 💬 台词高亮染色（`<span class="dialogue-text">`）
  - 🧹 自动剥离大模型废话引导语

### 2. 实时对局沙盒 (Live Sandbox)
- 上方输入测试文本，下方以小手机真实聊天气泡的轻拟物 HTML 样式**实时呈现正则美化效果**！
- 提供“原始文本”与“转换后 HTML 结构”对比切换。

### 3. 微聊 (ChatApp) 实时联动
- 角色工坊配置的正则与美化脚本，直接存储于本地 IndexedDB 中；
- 在微聊中与角色对话时，AI 消息实时通过正则流水线渲染为高质感气泡。

### 4. 酒馆角色卡导入与导出 (Import & Export)
- 支持导出为标准酒馆兼容的 `.json` 角色卡；
- 支持导入外部酒馆角色卡文件。

---

## 三、 实施步骤

1. **扩展数据结构**：在 `src/types/character.ts` 与 `db.ts` 中定义 `CharacterRegexScript` 与扩展字段；
2. **构建正则引擎**：在 `src/core/regex/regexEngine.ts` 中实现带有编译缓存与安全转义的流水线执行器；
3. **实现角色工坊组件**：
   - `CharacterStudioApp.tsx`（角色货架列表）
   - `CharacterWorkspace.tsx`（4标签页工作台）
   - `RegexScriptEditorModal.tsx`（正则规则增删改弹窗）
   - `LiveSandboxPreview.tsx`（实时渲染沙盒）
4. **微聊渲染对接**：在 `ChatConversation.tsx` 中接入正则富文本 HTML 管道；
5. **系统挂载与构建验证**：在 `App.tsx`、`desktopIconHelper.tsx`、`appStoreCatalog.ts` 注册并测试 `npm run build`。
