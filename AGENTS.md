# AGENTS.md — Hakku 团队分工 & AI 协作规则

> 给所有 AI coding agent（ILMUcode / Claude / Cursor / Copilot 等）看的。**每次开始写代码前先读这份文件。**
> 人类队友也一样 🙂

---

## 0. 项目一句话

**Hakku**（Hak-ku = 我的权益）— 给马来西亚打工人（全职 + freelancer/gig worker）和 SME 老板的劳工权益 / 合规助手。
技术栈：**Next.js 15 (App Router) + React 19 + TypeScript + MYDS (`@govtechmy/myds-react`) + Tailwind 3.4 + zod + Vitest**，AI 走 **YTL ILMU**（OpenAI-compatible，`https://api.ytlailabs.tech/v1`）。

比赛：**ILMUcode: Jom Bina**。Build week 1–7 Dec，**8 Dec 12pm 截止提交**（live link + GitHub repo + 2 分钟 demo video + 真实用户使用证明）。

---

## 1. 分工（谁负责什么）

| 角色 | 人 | 负责 |
| :--- | :--- | :--- |
| **Frontend** | **Huien** | 所有页面、UI 组件、样式、双语文案、前端状态、调用 API 的前端代码、用户体验 |
| **Backend** | **Evan** | 所有 API route、法规计算引擎、ILMU AI 接入、prompt、法规数据、测试、部署/build 脚本 |

### 1.1 Huien（Frontend）拥有的文件

```
src/app/**/page.tsx            # 所有页面：/, /workspace, /portals/*, /vision
src/app/layout.tsx
src/app/globals.css
src/components/**              # shell/, workspace/, portals/
src/lib/i18n/dictionary.ts     # EN / BM 文案
src/lib/store/HakkuContext.tsx # 前端全局状态 (sessionStorage)
public/**                      # logo、图片、svg
tailwind.config.ts
postcss.config.mjs
```

### 1.2 Evan（Backend）拥有的文件

```
src/app/api/**                 # /api/audit, /api/ilmu/{draft,rag,ocr,asr,tts,status}
src/lib/engines/payrollEngine.ts
src/lib/engines/gigEngine.ts
src/lib/engines/stampDutyEngine.ts
src/lib/ilmu/client.ts         # ILMU client + live/demo 切换
src/lib/ilmu/demoEngine.ts     # 没有 API key 时的 demo fallback
src/data/**                    # statutory-2026/rules.ts, demo-scenarios.ts
src/tests/**                   # Vitest
scripts/**                     # build-netlify-static.mjs
next.config.ts
.env.example
```

### 1.3 共用文件（改之前要先跟对方讲 ⚠️）

| 文件 | 为什么是共用 | 规则 |
| :--- | :--- | :--- |
| `src/lib/engines/types.ts` | **前后端的数据合约**（input/output 类型） | 由 **Evan 主导**。Huien 需要新字段 → 开 issue / 群里讲，Evan 加。只能**加字段**，不要随便改名或删字段 |
| `src/lib/ilmu/browserBridge.ts` | 前端调用 API 的唯一入口（也处理 static export fallback） | 由 **Huien 主导**，但 request/response 形状必须跟 Evan 的 API route 一致 |
| `package.json` / `package-lock.json` | 依赖 | 加新 package 前先在群里讲，避免 lockfile conflict |
| `README.md` / `EXPLAINER.md` / `AGENTS.md` | 文档 | 谁改了功能谁更新相关段落 |

> **AI agent 规则：** 如果你在帮 Huien 做事，**不要改 Evan 的文件**；在帮 Evan 做事，**不要改 Huien 的文件**。真的需要改对方的文件 → 停下来，告诉人类，让他们去沟通。

---

## 2. 前后端怎么对接（API 合约）

前端 **只通过 `src/lib/ilmu/browserBridge.ts`（或一个 `fetch` helper）调用 API**，不要在组件里到处写 `fetch`。
所有 request body 用 **zod** 在后端验证；类型定义放 `src/lib/engines/types.ts`。

| Endpoint | Method | Request（主要字段） | Response（主要字段） | Owner |
| :--- | :--- | :--- | :--- | :--- |
| `/api/audit` | POST | `{ kind: "payroll" \| "gig" \| "stamp", employees? \| gigCase? \| stampDuty? }` | `{ kind, audits }` 或 `{ kind, result }` | Evan |
| `/api/ilmu/draft` | POST | `{ mode?, locale, persona, draftKind, partyName, counterpartyName, findingsSummary[], totalAmountRm }` | `{ executionMode, modelUsed, title, body, fallbackNotice? }` | Evan |
| `/api/ilmu/rag` | POST | `{ mode?, locale, persona, query }` | 答案 + 引用的法规条文 | Evan |
| `/api/ilmu/ocr` | POST | `{ mode?, persona, documentType, imageBase64?, fileName?, maskPii }` | 抽出来的字段 + `rawText?` | Evan |
| `/api/ilmu/asr` | POST | `{ mode?, persona, audioBase64?, scenarioId? }` | 转录文字 | Evan |
| `/api/ilmu/tts` | POST | `{ mode?, locale, text (2–1500 chars) }` | 音频 / fallback 提示 | Evan |
| `/api/ilmu/status` | GET | – | `{ credentialsConfigured }` | Evan |

**共同约定：**
- `mode`: `"demo" | "live"`。没有 `ILMU_API_KEY` 时后端**自动 fallback 到 demo**，并回 `fallbackNotice` —— 前端要把这个提示显示出来，不要当 error。
- `locale`: `"en" | "bm"`；`persona`: `"freelancer" | "sme" | "worker"`。
- 错误统一格式：`{ error: string }` + HTTP 4xx/5xx。前端遇到 error 显示友好讯息，不要白屏。
- **新增 / 修改 endpoint 时**：Evan 先更新这张表 + `types.ts`，再写 route；Huien 照表接。
- 前端在后端还没好之前，可以先用 `demoEngine.ts` 的 mock 数据做 UI，不要等。

---

## 3. 两个人各自的「完成标准」

### Huien — Frontend Definition of Done
- [ ] 手机屏幕（≤ 400px）能正常用 —— 真实用户大多用手机
- [ ] EN / BM 两种语言文案都有（放 `dictionary.ts`，不要 hardcode 在组件里）
- [ ] Light / Dark mode 都看得清楚
- [ ] 有 loading 状态、error 状态、空状态
- [ ] 用 MYDS 组件 + MYDS token（`primary-600`, `txt-*`, `bg-*`, `otl-*`），不要乱加新颜色
- [ ] 金额用 `tabular-nums`，格式 `RM1,700.00`
- [ ] `npx tsc --noEmit` 通过

### Evan — Backend Definition of Done
- [ ] **所有 RM 金额都由 TypeScript 引擎算，LLM 绝对不算钱**（LLM 只负责写文字 / 解释）
- [ ] 每个 route 用 zod 验证 input，坏 input 回 400
- [ ] live 模式失败 → 自动 fallback demo，不会 crash
- [ ] 引擎有改 → `src/tests/engines.test.ts` 加 / 更新测试，`npm test` 通过
- [ ] `ILMU_API_KEY` 只在 server 端读，**永远不要**用 `NEXT_PUBLIC_` 前缀，不要 commit `.env.local`
- [ ] Prompt 要求 AI：只根据给的 findings 和数字写、不编造法条、语气礼貌建设性、附上免责声明（不是法律意见）
- [ ] `npx tsc --noEmit` + `npm test` + `npm run build` 通过

---

## 4. Git 工作流程

```
main            ← 永远保持能 build、能 demo
├── fe/<功能>   ← Huien 的分支，例如 fe/chat-ui, fe/mobile-layout
└── be/<功能>   ← Evan 的分支，例如 be/chat-endpoint, be/ilmu-live
```

1. 开工前：`git pull origin main`
2. 开自己的分支：`git checkout -b fe/xxx` 或 `be/xxx`
3. **小步 commit，每天都要 commit**（比赛看 1–7 Dec 的 commit 记录）
4. Commit message 格式：`fe: 加聊天输入框` / `be: 新增 /api/chat endpoint` / `docs: 更新 API 表`
5. Push 后开 PR → 对方看一眼 → merge 进 `main`
6. merge 前本地跑：`npx tsc --noEmit && npm test && npm run build`

> **AI agent 规则：** 不要直接 push 到 `main`；不要 `git push --force`；不要 commit `node_modules/`, `.next/`, `.env.local`。

---

## 5. 常用指令

```bash
npm install
cp .env.example .env.local     # 填 ILMU_API_KEY（只有 Evan 需要 live key 测试）
npm run dev                    # http://localhost:3000
npx tsc --noEmit               # type check
npm test                       # Vitest
npm run build                  # production build
npm run build:netlify          # 生成 netlify-static/ 静态版
```

---

## 6. 给 AI agent 的总规则（重要）

1. **先读这份文件，确认你在帮谁（Huien = frontend / Evan = backend），只改那个人的文件。**
2. 改共用文件（`types.ts`, `browserBridge.ts`, `package.json`）前，先告诉人类。
3. 不要大改架构、不要换框架、不要换 design system（MYDS 保留）。
4. 不要一次改几十个文件；一个功能一个小改动，方便 review 和 commit。
5. 钱和法律数字 → 只能来自 `src/lib/engines/` + `src/data/statutory-2026/`，有不确定的法规就标 TODO 给人类确认，**不要自己编**。
6. 所有给用户看的文字要 EN + BM 两种。
7. 写完代码要跑 `npx tsc --noEmit`（backend 再加 `npm test`）。
8. 不确定需求时，问人类，不要猜。
