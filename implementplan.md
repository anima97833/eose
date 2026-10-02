# 间词 APP · 韩文原著小说导入与韩中专业词库扩展实施方案
(Implementation Plan: Korean Native Novel Reader & Yomitan Term Bank Integration)

---

## 一、 现状分析与需求升级背景

### 1.1 现有系统局限
- **阅读语料假定**：章节切分（`ebookParser.ts`）与间词编译（`novelVocabCompiler.ts`）完全基于**中文小说文本**，通过中文触发词（`triggers`）查找并替换为英文。
- **词库模型绑定**：自定义词库引擎（`customLexiconEngine.ts`）硬编码英文正则 `/^[a-zA-Z\s\-']+$/`，不支持谚文（Hangul: `\uAC00-\uD7A3`）与汉字词（Hanja）。
- **语言发音受限**：TTS 语音合成固定为英文语音包，缺乏韩语音色。

### 1.2 核心原则：零打包注入，纯框架能力交付 (Zero Bundling & User-Driven)
> [!IMPORTANT]
> **严禁在工程代码或静态资源（dist/public）中打包、注入任何实体词库文件。**
> - 项目代码只负责提供**纯净、高效的解析与查词框架**；
> - `term_bank_1.json` 仅作为技术研发阶段的标准数据结构参照格式规范；
> - **词库数据 100% 由用户在前端界面中自行选择/拖拽上传**，并在前端通过分块流式解析入库到用户本地浏览器的 **IndexedDB** 中；
> - 保证打包产物体积极小、加载飞快，用户数据与版权完全归属于用户本地。

### 1.3 目标与业务价值
提供一套通用的 **韩文原著小说导入 + Yomitan/TermBank 词库解析入库 + 词形还原点词查词** 框架体系，让用户自主导入韩语小说与词库，享受**即时沉浸悬浮查词、拟物词典卡片展示、难词行间气泡注音/释义**与生词复习。

---

## 二、 韩中词库资产深度解构 (`term_bank_1.json`)

经检测，`term_bank_1.json` 为国际标准的 **Yomitan / Yomichan 结构化词库**（单文件 7.09 MB，数十万条词目）：

### 2.1 词条元组格式 (Tuple Definition)
每个词条为 8 项元组：
`[term, reading, definition_tags, rules, score, definitions, sequence, term_tags]`

| 索引 | 字段名 | 样例数据 | 业务作用 |
|---|---|---|---|
| `[0]` | **term** | `"칙칙하다"` / `"친근하다"` / `"친구"` / `"親舊"` | 检索词头（支持韩文原词、汉字词） |
| `[1]` | **reading** | `""` 或 发音标记 | 读音/特殊注音 |
| `[2]` | **definition_tags** | `"形容词 ⭐"` / `"名词 ⭐⭐⭐"` | 词性分类及核心难度星级（⭐⭐⭐ 为高频词） |
| `[3]` | **rules** | `"adj"` / `"v"` / `""` | 词形屈折规则（用于动词/形容词还原） |
| `[4]` | **score** | `0` | 排序加权优先级 |
| `[5]` | **definitions** | `[{"type": "structured-content", "content": [...]}]` | 结构化中文释义（包含义项 1/2、汉字对应、例句、句型） |
| `[6]` | **sequence** | `1` | 词条序列唯一索引 |
| `[7]` | **term_tags** | `""` | 额外标签 |

### 2.2 结构化定义 AST 树递归解析
definitions 中包含 Rich AST：
```json
{
  "type": "structured-content",
  "content": [
    { "tag": "span", "content": [{ "content": "친가", "lang": "ko" }, { "content": " 〔親家〕", "lang": "ko" }] },
    { "tag": "div", "content": [{ "content": "爷爷奶奶家", "lang": "zh" }] }
  ]
}
```
需提供轻量级 AST Renderer，将其清洗渲染为：
1. **简明纯文本释义**（用于卡片摘要与词汇列表展示）；
2. **拟物富文本卡片**（保留汉字标、句型和例句展示）。

---

## 三、 韩语原著语言学挑战与关键技术方案

韩语属于**黏着语（Agglutinative Language）**，在小说正文中几乎从不以词典“基本形/原形（원형）”独立出现。

### 3.1 核心痛点与对策矩阵

| 挑战 | 表现场景 | 解决机制 |
|---|---|---|
| **助词黏连 (Particles)** | `친구` 出现在文本中为 `친구가`、`친구를`、`친구에게`、`친구와` | **轻量助词剥离算法 (Korean Particle Stripper)**：若直接匹配不到，尝试剥离常见格助词/添意助词，再探查词库。 |
| **用言屈折 (Conjugations)** | `친근하다` 变为 `친근한`(冠形词)、`친근하고`、`친근해서`、`친근했다`(过去式) | **词尾逆向还原器 (Deinflector)**：根据 `rules: "adj" / "v"`，针对 `-다, -ㄴ/은, -ㄹ/을, -고, -어/아, -어서/아서, -면, -지` 建立逆向查表映射。 |
| **汉字词互查 (Hanja Mapping)** | 词库中同时收录 `친구` 与 `親舊`，释义中带有 `〔親家〕` 标记 | 自动提取汉字对应关系，为读者提供汉字联想记忆。 |
| **大体积存储 (7MB 瓶颈)** | LocalStorage 单域名 5MB 限制，存入必崩溃 | **入库 IndexedDB (Dexie.js)**，以 `term` 与 `hanja` 双索引秒级查询，内存建立首字 Trie / 前缀索引。 |

---

## 四、 系统架构升级模块设计

```
┌─────────────────────────────────────────────────────────────┐
│                      间词 APP 阅读器视窗                     │
├──────────────────────────────┬──────────────────────────────┤
│       【模式 A：韩文原著伴读】        │     【模式 B：双向间词混合】     │
│  - 纯韩文小说排版 (TXT/EPUB)  │  - 韩文高频词上浮 Ruby 气泡  │
│  - 长按/点击任意单词弹出释义卡   │  - 或中文网文抠入韩语生词   │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────────────────────▼───────────────┐
│              Korean Deinflector & Tokenizer                 │
│         (韩语分词 + 格助词剥离 + 动形容词屈折还原引擎)         │
└──────────────────────────────┬──────────────────────────────┘
                               │ 查词
┌──────────────────────────────▼──────────────────────────────┐
│           IndexedDB 专用词库表 (Dexie: koreanTerms)          │
│       - term (主索引)  - rules (屈折标记)  - score (星级)    │
│       - hanja (汉字索引) - definitionsAST / plainSummary   │
└─────────────────────────────────────────────────────────────┘
```

---

## 五、 分步实施路线图 (Step-by-Step Implementation Roadmap)

### 阶段一：数据层 —— Yomitan 词库导入与 IndexedDB 存储适配
- [x] **1.1 扩展 Dexie 数据库架构 (`src/core/storage/db.ts`)**
  - 新增 `storyword_korean_terms` 表：`id, term, score, *hanja`，升级版本至 27。
  - 创建高效复合索引：`term`, `score`, `*hanja`。
- [x] **1.2 编写 Yomitan 格式异步流式解析器 (`src/core/storyword/yomitanParser.ts`)**
  - 支持解析用户本地上传的 Yomitan / TermBank 格式 JSON 文件（零打包注入）。
  - 提取 `definition_tags` 中的词性与 ⭐ 星级作为分级标注。
  - 递归遍历 `structured-content` 提取纯文本中文摘要（`plainSummary`）与汉字词（`hanja`）。
- [x] **1.3 词库管理 UI 适配 (`CustomLexiconModal.tsx`)**
  - **用户全权管理**：新增“韩语 Yomitan 词库”Tab 入口，用户点击或拖入本地 `.json` 文件。
  - **分批流式入库**：前端分块异步批量写入用户浏览器本地 IndexedDB，展示百分比进度条与词条统计，零卡顿。
  - **词库生命周期管理**：支持查看当前词库名称、条目量、一键清空/重新导入。
  - **优雅缺省态**：在用户未导入词库时，阅读器保持纯净阅读，点击查词时弹出友好的“请先导入词库”轻拟物引导卡片，不内置任何假数据或静态词包。

---

### 阶段二：计算层 —— 韩语屈折还原与分词引擎
- [x] **2.1 实现轻量韩语词形还原算法 (`src/core/storyword/koreanDeinflector.ts`)**
  - **助词表脱落**：
    - 主格/宾格：`이, 가, 을, 를, 은, 는`
    - 与格/位格：`에, 에서, 에게, 한테, 께`
    - 造格/工具格：`로, 으로`
    - 伴随格/连接格：`와, 과, 랑, 이랑, 하고`
    - 添意词：`도, 만, 은커녕, 부터, 까지`
  - **规则形容词/动词语尾还原**：
    - `ㄴ/은` (冠形词定语) $\rightarrow$ `다` (如 `친근한` $\rightarrow$ `친근하다`)
    - `아/어/여서` (因果连词) $\rightarrow$ `다` (如 `칙칙해서` $\rightarrow$ `칙칙하다`)
    - `았/었/였` (过去时) $\rightarrow$ `다`
    - `고, 며, 지만, 면` (并列/假设) $\rightarrow$ `다`
    - ㅂ 不规则形容词还原（如 `어두운` $\rightarrow$ `어둡다`）
- [x] **2.2 韩文原著分词索引匹配器**
  - 给定段落文本，按词切分并批量命中候选词，计算最佳匹配项。

---

### 阶段三：阅读层 —— 韩文原著小说导入与阅读模式
- [x] **3.1 电子书解析器增强 (`src/core/storyword/ebookParser.ts`)**
  - 扩充章节识别正则，支持韩文章节标题：
    - `제[0-9]+장` (第x章)、`제[0-9]+화` (第x话)、`[0-9]+화.`、`프롤로그` (序章/Prologue)、`에필로그` (后记/Epilogue)。
  - 保留韩语排版与段落空格。
- [x] **3.2 阅读器新增韩语阅读视图 (`StoryWordReader.tsx`)**
  - **点词即查模式（Tap-to-Lookup）**：点击小说中的任何韩文词汇，自动高亮该词并在底部或上方弹出轻拟物词典浮层；
  - **韩语原著伴读标识**：顶部与章节指示器自动识别并切换为韩语原著伴读视图，提供词典状态直达按钮。

---

### 阶段四：交互与体验层 —— 词典气泡、韩语发音与错题本
- [x] **4.1 拟物化韩语词典弹窗 (`KoreanDictModal.tsx`)**
  - 展示韩文词头、汉字对应词（如 `친근하다 〔親近하다〕`）、词性分类；
  - 渲染中文释义、语法句型与例句；
  - 溯源形态素变化（如显示 *“原词 친근한 ➔ 还原用言基本形 친근하다”*）；
  - 一键“收藏至错词本”。
- [x] **4.2 韩语 TTS 发音支持 (`KoreanDictModal.tsx`)**
  - 扩展调用系统 `ko-KR` 语音包纯正真人发音。

---

## 六、 关键核心代码设计预览

### 6.1 IndexedDB 表设计 (`db.ts`)
```typescript
export interface KoreanTermEntry {
  id?: number;
  term: string;           // 词头，例如 "친근하다" 或 "친목"
  reading: string;        // 读音
  pos: string;            // 词性，例如 "形容词 ⭐"
  rules: string;          // 规则，例如 "adj", "v"
  score: number;          // 词频分数/星级权重
  summary: string;        // 提取出的简明中文释义
  rawAst: any;            // Yomitan 完整 structured-content AST
  hanja?: string;         // 提取出的汉字词，例如 "親近"
}

// Dexie schema:
// db.version(3).stores({
//   koreanTerms: '++id, term, reading, score, hanja'
// });
```

### 6.2 屈折还原核心函数 (`koreanDeinflector.ts`)
```typescript
export interface DeinflectResult {
  candidate: string;
  sourceType: 'exact' | 'particle_stripped' | 'verb_base';
}

const PARTICLES = ['에서', '에게', '한테', '으로', '부터', '까지', '은', '는', '이', '가', '을', '를', '에', '로', '와', '과', '도', '만'];

export function generateKoreanCandidates(word: string): DeinflectResult[] {
  const results: DeinflectResult[] = [{ candidate: word, sourceType: 'exact' }];
  
  // 1. 尝试剥离助词
  for (const p of PARTICLES) {
    if (word.length > p.length + 1 && word.endsWith(p)) {
      results.push({ candidate: word.slice(0, -p.length), sourceType: 'particle_stripped' });
    }
  }

  // 2. 尝试用言冠形词形还原：-ㄴ/은 -> -다
  if (word.endsWith('한') && word.length >= 2) {
    results.push({ candidate: word.slice(0, -1) + '하다', sourceType: 'verb_base' });
  }
  
  return results;
}
```

---

## 七、 实施交付安排

1. **第一步（准备就绪）**：已完成方案策划与 `term_bank_1.json` 数据结构全景分析；
2. **第二步（下一行动）**：在 Dexie 中创建 `koreanTerms` 表并编写 7MB 词库的高性能解析导入流水线；
3. **第三步**：验证韩文 TXT/EPUB 导入与点词查词交互。
