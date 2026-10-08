# 自学自测 Self-Test Quiz

零构建静态自测站：`index.html` + 原生 ES Modules + JSON 题库，经 GitHub Pages 托管于 `/quiz/`。

## 结构

```
quiz/
├── index.html          # 单页应用入口（hash 路由：总览 / 答题 / 错题本）
├── assets/
│   ├── quiz-core.js    # 纯逻辑：判分/洗牌/得分/掌握度/校验/进度存储
│   ├── quiz-ui.js      # DOM 渲染 + 路由 + 中英切换
│   └── quiz.css
├── data/
│   ├── sections.json   # 9 个小节的元数据（题数声明）
│   └── deck1-s1.json … deck2-s5.json   # 题库（81 题（含 19 道挑战题），中英双语）
└── tests/              # node:test 单测 + 题库校验器
```

## 维护须知（内容变更的强制门槛）

修改 `quiz/data/*.json`（题库或小节元数据）后，必须通过：

```bash
cd quiz && npm test && npm run validate
```

`validate` 会逐题校验结构（id/type/双语字段/答案下标/ref 页码）并与 `sections.json` 声明的题型配比核对——这是题库内容的质量闸门（代替运行时校验）。

新增题目：按现有题目结构写入对应 `deckX-sY.json`，id 取 `d<课件>s<节>q<序号>`，同步更新 `sections.json` 的 `counts`，跑上述命令直至 `OK: 9 sections, 81 questions, 0 errors`（题数变化时以新总数为准）。挑战题需带 `"level": "challenge"` 字段。

## 设计文档

见 `docs/superpowers/specs/2026-10-07-selftest-quiz-design.md`。
