# 自学测试系统（Self-Test Quiz）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 vizmodeling 仓库构建零构建静态自测站（9 小节 62 题、中英双语、localStorage 进度），经 GitHub Pages 在线分享。

**Architecture:** `quiz/` 目录下单页应用（hash 路由三视图），纯函数核心（判分/洗牌/掌握度/校验）与 DOM 渲染分离；题库为 9 个 JSON 文件，由校验脚本全量把关；`node:test` 单测覆盖核心逻辑。

**Tech Stack:** 原生 ES Modules JavaScript（零依赖零构建）、JSON、node:test（Node v22）、GitHub Pages。

**Spec:** `docs/superpowers/specs/2026-10-07-selftest-quiz-design.md`（需求唯一权威来源）

## Global Constraints

- 零依赖、零构建；ES Modules；目标 ES2020+ 现代浏览器（Chrome/Safari/Edge/Firefox）
- 部署路径为项目页 `/vizmodeling/quiz/`：所有资源引用必须用相对路径（`assets/…`、`data/…`）
- 所有用户可见文案双语 `{zh, en}` 字段；界面文案走内置字典 T
- 测试命令：`cd quiz && npm test`；题库校验：`cd quiz && npm run validate`
- 不改动 `2024/ 2025/ 2026/ code/ image/` 下任何现有文件；README 仅新增链接小节
- 每个任务结束即提交；提交信息小写动词开头，末尾带：

  ```
  Co-Authored-By: Claude Code <noreply@anthropic.com>
  ```

- localStorage 键：`vmquiz.v1.lang`（"zh"|"en"）、`vmquiz.v1.progress`（对象）
- 进度对象形状（spec 第4节）：

  ```json
  { "<sectionId>": { "best": 86, "attempts": 2, "lastScore": 71,
      "questions": { "<qid>": { "correct": true, "hintUsed": false, "wrongCount": 1 } } } }
  ```

---

### Task 1: 环境脚手架 + quiz-core.js 纯函数（TDD）

**Files:**
- Create: `quiz/package.json`
- Create: `.nojekyll`（仓库根，内容仅一个换行）
- Create: `quiz/assets/quiz-core.js`
- Test: `quiz/tests/quiz-core.test.js`

**Interfaces（后续任务依赖）:**
- Produces（`quiz-core.js` 导出，签名固定）:
  - `shuffle(arr, rng = Math.random) -> Array`（新数组，不改入参）
  - `judgeAnswer(question, selected) -> boolean`（`selected` 与 `question.answer` 均为原始选项下标数组，集合相等才 true）
  - `computeScore(correctCount, totalCount) -> Integer`（`Math.round(correct/total*100)`；total≤0 → 0）
  - `computeMastery(progress, sectionTotal) -> 'not-started'|'in-progress'|'mastered'`（progress 为某节进度对象或 undefined；规则：attempts 为 0 → not-started；best≥80 且「correct 且非 hintUsed」题数/sectionTotal ≥ 0.8 → mastered；否则 in-progress）
  - `validateQuestion(q, ctx) -> String[]`、`validateBank(bank, ctx) -> String[]`（ctx: `{deck}`，返回错误信息数组，空即合法）
  - `createProgressStore(storage) -> {load(), save(progress), clear(), available}`（storage 传 null/抛错 → 降级内存态，`available` 为 false）

- [ ] **Step 1: 建脚手架**

`quiz/package.json`：

```json
{
  "name": "vizmodeling-quiz",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/",
    "validate": "node tests/validate-banks.js"
  }
}
```

仓库根 `.nojekyll`（空文件）：

```bash
printf '\n' > .nojekyll
```

- [ ] **Step 2: 写失败测试** `quiz/tests/quiz-core.test.js`

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shuffle, judgeAnswer, computeScore, computeMastery,
  validateQuestion, validateBank, createProgressStore,
} from '../assets/quiz-core.js';

test('shuffle 保持元素集合与长度，不改入参', () => {
  const src = [1, 2, 3, 4, 5];
  const out = shuffle(src, () => 0.3);
  assert.equal(out.length, 5);
  assert.deepEqual([...out].sort(), [1, 2, 3, 4, 5]);
  assert.deepEqual(src, [1, 2, 3, 4, 5]);
});

test('judgeAnswer：single 精确匹配、multi 全对才对、与顺序无关', () => {
  const single = { answer: [1] };
  assert.equal(judgeAnswer(single, [1]), true);
  assert.equal(judgeAnswer(single, [0]), false);
  const multi = { answer: [0, 2] };
  assert.equal(judgeAnswer(multi, [2, 0]), true);
  assert.equal(judgeAnswer(multi, [0]), false);      // 漏选
  assert.equal(judgeAnswer(multi, [0, 1, 2]), false); // 多选
});

test('computeScore 四舍五入百分制', () => {
  assert.equal(computeScore(6, 7), 86);
  assert.equal(computeScore(0, 5), 0);
  assert.equal(computeScore(3, 0), 0);
});

test('computeMastery 三档判定', () => {
  const mk = (best, noHint, total, attempts = 1) => ({
    best, attempts, lastScore: best,
    questions: Object.fromEntries(
      Array.from({ length: total }, (_, i) => [`q${i}`, { correct: i < noHint, hintUsed: false, wrongCount: 0 }])),
  });
  assert.equal(computeMastery(undefined, 7), 'not-started');
  assert.equal(computeMastery({ best: 0, attempts: 0, questions: {} }, 7), 'not-started');
  assert.equal(computeMastery(mk(86, 6, 7), 7), 'mastered');   // 6/7≈0.857≥0.8
  assert.equal(computeMastery(mk(86, 5, 7), 7), 'in-progress'); // 5/7≈0.714<0.8
  assert.equal(computeMastery(mk(71, 7, 7), 7), 'in-progress'); // best<80
});

const goodQ = {
  id: 'd1s3q5', type: 'single', topic: 'overfitting',
  question: { zh: '题干', en: 'stem' },
  options: { zh: ['甲', '乙', '丙', '丁'], en: ['A', 'B', 'C', 'D'] },
  answer: [1],
  hint: { zh: '提示', en: 'hint' },
  explanation: { zh: '解析', en: 'expl' },
  ref: { deck: 1, page: 62 },
};

test('validateQuestion 通过合法题', () => {
  assert.deepEqual(validateQuestion(goodQ, { deck: 1 }), []);
});

test('validateQuestion 捕获各类非法', () => {
  const errs = validateQuestion({ ...goodQ, id: 'bad' }, { deck: 1 });
  assert.ok(errs.some(e => e.includes('id')));
  const noEn = validateQuestion({ ...goodQ, hint: { zh: 'x' } }, { deck: 1 });
  assert.ok(noEn.some(e => e.includes('hint')));
  const oob = validateQuestion({ ...goodQ, answer: [4] }, { deck: 1 });
  assert.ok(oob.some(e => e.includes('answer')));
  const multiOne = validateQuestion({ ...goodQ, type: 'multi' }, { deck: 1 });
  assert.ok(multiOne.some(e => e.includes('multi')));
  const wrongDeck = validateQuestion(goodQ, { deck: 2 });
  assert.ok(wrongDeck.some(e => e.includes('deck')));
  const badRef = validateQuestion({ ...goodQ, ref: { deck: 1, page: 0 } }, { deck: 1 });
  assert.ok(badRef.some(e => e.includes('ref')));
});

test('validateBank 汇总并查重复 id', () => {
  const errs = validateBank([goodQ, goodQ], { deck: 1 });
  assert.ok(errs.some(e => e.includes('重复')));
});

test('createProgressStore 正常与降级', () => {
  const mem = new Map();
  const ok = createProgressStore({ getItem: k => mem.get(k), setItem: (k, v) => mem.set(k, v), removeItem: k => mem.delete(k) });
  assert.equal(ok.available, true);
  ok.save({ a: { best: 10 } });
  assert.deepEqual(ok.load().a.best, 10);
  ok.clear();
  assert.deepEqual(ok.load(), {});

  const broken = createProgressStore({ getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); }, removeItem: () => {} });
  assert.deepEqual(broken.load(), {});
  broken.save({ x: 1 });                       // 不抛
  assert.equal(broken.available, false);
  const none = createProgressStore(null);
  assert.deepEqual(none.load(), {});
});
```

- [ ] **Step 3: 跑测试确认失败**

Run: `cd quiz && npm test`
Expected: FAIL（Cannot find module `../assets/quiz-core.js`）

- [ ] **Step 4: 实现** `quiz/assets/quiz-core.js`

```js
// quiz/assets/quiz-core.js — 纯逻辑：判分/洗牌/得分/掌握度/校验/进度存储（零依赖）

export function shuffle(arr, rng = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function judgeAnswer(question, selected) {
  const ans = new Set(question.answer);
  const sel = new Set(selected);
  if (ans.size !== sel.size) return false;
  for (const v of ans) if (!sel.has(v)) return false;
  return true;
}

export function computeScore(correctCount, totalCount) {
  if (totalCount <= 0) return 0;
  return Math.round((correctCount / totalCount) * 100);
}

export function computeMastery(progress, sectionTotal) {
  if (!progress || !progress.attempts) return 'not-started';
  if (progress.best >= 80 && sectionTotal > 0) {
    let noHint = 0;
    for (const q of Object.values(progress.questions)) {
      if (q.correct && !q.hintUsed) noHint++;
    }
    if (noHint / sectionTotal >= 0.8) return 'mastered';
  }
  return 'in-progress';
}

export function validateQuestion(q, ctx = {}) {
  const errs = [];
  const name = q && q.id ? q.id : '(无id)';
  if (!/^d[12]s[1-5]q\d+$/.test(q?.id ?? '')) errs.push(`${name}: id格式错误`);
  if (!['single', 'multi', 'judge'].includes(q?.type)) errs.push(`${name}: type非法`);
  for (const f of ['question', 'hint', 'explanation']) {
    if (!q?.[f]?.zh?.trim() || !q?.[f]?.en?.trim()) errs.push(`${name}: ${f}缺少zh/en`);
  }
  const nZh = q?.options?.zh?.length ?? 0;
  const nEn = q?.options?.en?.length ?? 0;
  if (nZh < 2 || nZh !== nEn) errs.push(`${name}: options zh/en数量不符`);
  if (q?.options?.zh?.some(t => !String(t).trim())) errs.push(`${name}: 存在空选项`);
  const n = Math.min(nZh, nEn);
  if (!Array.isArray(q?.answer) || q.answer.length === 0) errs.push(`${name}: answer缺失`);
  else {
    if (q.type === 'multi' && q.answer.length < 2) errs.push(`${name}: multi答案应≥2项`);
    if (q.type !== 'multi' && q.answer.length !== 1) errs.push(`${name}: single/judge答案应为1项`);
    for (const i of q.answer) if (!Number.isInteger(i) || i < 0 || i >= n) errs.push(`${name}: answer下标越界`);
  }
  if (!q?.ref || ![1, 2].includes(q.ref.deck) || !Number.isInteger(q.ref.page) || q.ref.page < 1) errs.push(`${name}: ref非法`);
  else if (ctx.deck && q.ref.deck !== ctx.deck) errs.push(`${name}: ref.deck与所属小节不符`);
  return errs;
}

export function validateBank(bank, ctx) {
  const errs = [];
  const ids = new Set();
  for (const q of bank ?? []) {
    errs.push(...validateQuestion(q, ctx));
    if (ids.has(q.id)) errs.push(`${q.id}: 重复id`);
    ids.add(q.id);
  }
  return errs;
}

export function createProgressStore(storage) {
  const KEY = 'vmquiz.v1.progress';
  let ok = true;
  let mem = {};
  if (!storage) ok = false;
  function load() {
    if (!storage) return mem;
    try {
      const raw = storage.getItem(KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { ok = false; return mem; }
  }
  function save(progress) {
    mem = progress;
    try { storage.setItem(KEY, JSON.stringify(progress)); } catch { ok = false; }
  }
  function clear() {
    mem = {};
    try { storage.removeItem(KEY); } catch { ok = false; }
  }
  return { load, save, clear, get available() { return ok; } };
}
```

- [ ] **Step 5: 跑测试确认通过**

Run: `cd quiz && npm test`
Expected: PASS（8 tests）

- [ ] **Step 6: Commit**

```bash
git add quiz/package.json quiz/assets/quiz-core.js quiz/tests/quiz-core.test.js .nojekyll
git commit -m "add quiz core pure functions with tests

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 2: sections.json + 题库校验器（TDD）

**Files:**
- Create: `quiz/data/sections.json`
- Create: `quiz/tests/validate-banks.js`
- Test: `quiz/tests/manifest.test.js`

**Interfaces:**
- Consumes: `validateBank(bank, {deck})`（Task 1）
- Produces:
  - `sections.json` 形状：`{"sections": [{id, deck, file, title:{zh,en}, topics, counts:{single,multi,judge}}]}`
  - 校验命令 `cd quiz && npm run validate`：9 节全过打印 `OK: 9 sections, 62 questions, 0 errors` 退出码 0；任何错误逐条打印并以退出码 1 结束
  - 题库文件（Task 3-5 填充）形状：`[ <question>, ... ]`，question 结构见 spec 第 3 节 / Task 3 模板

- [ ] **Step 1: 写失败测试** `quiz/tests/manifest.test.js`

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const dataDir = new URL('../data/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('sections.json', dataDir), 'utf8'));

const SPEC_COUNTS = { // spec 第3节表格：id -> [single, multi, judge, 总数]
  'deck1-s1': [4, 2, 1, 7], 'deck1-s2': [4, 0, 2, 6], 'deck1-s3': [5, 2, 1, 8], 'deck1-s4': [4, 2, 1, 7],
  'deck2-s1': [4, 2, 1, 7], 'deck2-s2': [5, 2, 1, 8], 'deck2-s3': [5, 0, 2, 7], 'deck2-s4': [3, 2, 0, 5],
  'deck2-s5': [4, 2, 1, 7],
};

test('sections.json 共9节、id/文件/计数符合spec', () => {
  const ss = manifest.sections;
  assert.equal(ss.length, 9);
  assert.equal(new Set(ss.map(s => s.id)).size, 9);
  for (const s of ss) {
    assert.match(s.id, /^deck[12]-s[1-5]$/);
    assert.ok(s.title.zh && s.title.en);
    assert.equal(s.file, s.id + '.json');
    assert.equal(s.deck, Number(s.id[3]));
    const [si, mu, ju, tot] = SPEC_COUNTS[s.id];
    assert.deepEqual(s.counts, { single: si, multi: mu, judge: ju });
    assert.equal(si + mu + ju, tot);
    assert.ok(existsSync(new URL(s.file, dataDir)), s.file + ' 应存在（可为空数组占位）');
  }
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd quiz && npm test`
Expected: FAIL（无法读取 sections.json）

- [ ] **Step 3: 写 `quiz/data/sections.json` 并放空题库占位**

```json
{
  "sections": [
    { "id": "deck1-s1", "deck": 1, "file": "deck1-s1.json",
      "title": { "zh": "可视化基础", "en": "Visualization Fundamentals" },
      "topics": { "zh": "定义、三大任务、经典案例、为什么需要可视化、学科边界", "en": "Definition, tasks, classic cases, why visualization, field boundaries" },
      "counts": { "single": 4, "multi": 2, "judge": 1 } },
    { "id": "deck1-s2", "deck": 1, "file": "deck1-s2.json",
      "title": { "zh": "一维图表辨析", "en": "1D Chart Types" },
      "topics": { "zh": "柱形/堆叠柱/散点/折线/阶梯、延续型与离散型", "en": "Bar/stacked bar/scatter/line/step, continuous vs discrete" },
      "counts": { "single": 4, "multi": 0, "judge": 2 } },
    { "id": "deck1-s3", "deck": 1, "file": "deck1-s3.json",
      "title": { "zh": "插值与拟合", "en": "Interpolation & Fitting" },
      "topics": { "zh": "插值、Catmull-Rom、最小二乘、正则方程、过拟合与正则化", "en": "Interpolation, Catmull-Rom, least squares, normal equation, overfitting & regularization" },
      "counts": { "single": 5, "multi": 2, "judge": 1 } },
    { "id": "deck1-s4", "deck": 1, "file": "deck1-s4.json",
      "title": { "zh": "LOESS与密度估计", "en": "LOESS & Density Estimation" },
      "topics": { "zh": "LOESS/Robust LOESS、Epanechnikov核、边界问题、直方图缺点、核密度估计", "en": "LOESS/Robust LOESS, Epanechnikov kernel, boundary issue, histogram drawbacks, KDE" },
      "counts": { "single": 4, "multi": 2, "judge": 1 } },
    { "id": "deck2-s1", "deck": 2, "file": "deck2-s1.json",
      "title": { "zh": "多维图表", "en": "Multivariate Charts" },
      "topics": { "zh": "热力图、Treemap、层次气泡/Voronoi、散点图矩阵、平行坐标", "en": "Heatmap, Treemap, hierarchical bubbles/Voronoi, scatterplot matrix, parallel coordinates" },
      "counts": { "single": 4, "multi": 2, "judge": 1 } },
    { "id": "deck2-s2", "deck": 2, "file": "deck2-s2.json",
      "title": { "zh": "聚类", "en": "Clustering" },
      "topics": { "zh": "K-means、层次聚类/linkage、MOG+EM、Mean-Shift收敛性", "en": "K-means, hierarchical/linkage, MOG+EM, Mean-Shift convergence" },
      "counts": { "single": 5, "multi": 2, "judge": 1 } },
    { "id": "deck2-s3", "deck": 2, "file": "deck2-s3.json",
      "title": { "zh": "降维", "en": "Dimensionality Reduction" },
      "topics": { "zh": "特征抽取、SVD/PCA、ISOMAP、LLE、t-SNE", "en": "Feature extraction, SVD/PCA, ISOMAP, LLE, t-SNE" },
      "counts": { "single": 5, "multi": 0, "judge": 2 } },
    { "id": "deck2-s4", "deck": 2, "file": "deck2-s4.json",
      "title": { "zh": "非结构化数据", "en": "Unstructured Data" },
      "topics": { "zh": "LDA主题模型、时空网格量化、手机日志案例", "en": "LDA topic model, spatio-temporal grid quantization, mobile log cases" },
      "counts": { "single": 3, "multi": 2, "judge": 0 } },
    { "id": "deck2-s5", "deck": 2, "file": "deck2-s5.json",
      "title": { "zh": "可视化与AI", "en": "Visualization & AI" },
      "topics": { "zh": "AI三大方法、新一代AI五大方向、混合增强智能", "en": "Three AI approaches, five new-AI directions, hybrid-augmented intelligence" },
      "counts": { "single": 4, "multi": 2, "judge": 1 } }
  ]
}
```

空占位（9 个文件，内容均为 `[]`）：

```bash
cd quiz/data && for f in deck1-s1 deck1-s2 deck1-s3 deck1-s4 deck2-s1 deck2-s2 deck2-s3 deck2-s4 deck2-s5; do echo '[]' > $f.json; done
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd quiz && npm test`
Expected: PASS（9 tests）

- [ ] **Step 5: 写校验器** `quiz/tests/validate-banks.js`

```js
// 全量题库校验：node tests/validate-banks.js（cwd 任意）
import { readFileSync } from 'node:fs';
import { validateBank } from '../assets/quiz-core.js';

const dataDir = new URL('../data/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('sections.json', dataDir), 'utf8'));

const errors = [];
let total = 0;
for (const s of manifest.sections) {
  let bank;
  try {
    bank = JSON.parse(readFileSync(new URL(s.file, dataDir), 'utf8'));
  } catch {
    errors.push(`${s.id}: 无法读取 ${s.file}`);
    continue;
  }
  errors.push(...validateBank(bank, { deck: s.deck }));
  const tally = { single: 0, multi: 0, judge: 0 };
  for (const q of bank) if (tally[q.type] !== undefined) tally[q.type]++;
  const want = s.counts;
  if (bank.length !== want.single + want.multi + want.judge)
    errors.push(`${s.id}: 题数 ${bank.length} ≠ 声明 ${want.single + want.multi + want.judge}`);
  for (const k of ['single', 'multi', 'judge'])
    if (tally[k] !== want[k]) errors.push(`${s.id}: ${k} 题数 ${tally[k]} ≠ 声明 ${want[k]}`);
  total += bank.length;
}
if (errors.length) {
  console.error(`✗ ${errors.length} 个错误:\n` + errors.join('\n'));
  process.exit(1);
}
console.log(`OK: ${manifest.sections.length} sections, ${total} questions, 0 errors`);
```

- [ ] **Step 6: 验证校验器此刻的行为**

Run: `cd quiz && npm run validate; echo "exit=$?"`
Expected: 因空题库打印 `✗ … 题数 0 ≠ 声明 N`（9条），exit=1 —— 校验器确实拦截空库，符合预期（Task 3-5 填入题目后转绿）

- [ ] **Step 7: Commit**

```bash
git add quiz/data/ quiz/tests/
git commit -m "add section manifest and bank validator

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 3: 课件一题库（4 文件 28 题）

**Files:**
- Modify: `quiz/data/deck1-s1.json`（7题）、`deck1-s2.json`（6题）、`deck1-s3.json`（8题）、`deck1-s4.json`（7题）

**Interfaces:**
- Consumes: `npm run validate`（Task 2）
- Produces: 每文件为 JSON 数组，元素结构如下（id 规则 `d<deck>s<节>q<序号>`，序号从 1 起）

**命题依据（课件原文提取命令，先跑一遍获得底稿）：**

```bash
python3 -c "
from pypdf import PdfReader
for n, src in [('1','2026/vizmodeling-1.pdf'),('2','2026/vizmodeling-2.pdf')]:
    r = PdfReader(src)
    with open(f'/tmp/vm{n}.txt','w') as f:
        for i,p in enumerate(r.pages,1):
            f.write(f'\n===== PAGE {i} =====\n'); f.write(p.extract_text() or '')
print('done')"
```

**逐节命题范围（题号→课件页码锚点）：**

| 文件 | 题号 | 主题锚点（课件一页码） |
|---|---|---|
| deck1-s1 | q1-q7 | 定义 data→visual form→insight(p7-8)；三大任务 Represent/Analyze/Communicate(p9)；Minard(p10)、宽街霍乱(p11)、Rosling(p12)；变化盲视(p14-15)；Anscombe四重奏(p16-17)；与图形学(p23)/HCI(p24)/数据挖掘(p25-26)的边界 |
| deck1-s2 | q1-q6 | 柱形图框架：自变量/应变量(p30-31)；堆叠柱(p32-33)；散点图(p34-35)；折线图(p36)；阶梯图(p37-38)；延续型vs离散型(p36-37思考题) |
| deck1-s3 | q1-q8 | 插值概念(p39-51)；Catmull-Rom(p52-55)；直线拟合(p56)；多项式基与矩阵形式(p57-58)；正则方程(p59-60)；过拟合现象(p61)；正则化解法(p62) |
| deck1-s4 | q1-q7 | LOESS定义与Cleveland 1979(p63-65)；kernel连续光滑 vs K-NN不连续(p66-67)；Epanechnikov核(p67)；边界问题与权值再修正(p68-70)；Robust LOESS/bisquare/残差中位数(p71)；直方图缺点-采样率敏感(p74)；密度图与KDE核(p75-79) |

**题目模板（完整示例，其余题按此格式）：**

```json
{
  "id": "d1s3q5",
  "type": "single",
  "topic": "overfitting",
  "question": {
    "zh": "多项式拟合中，阶数过高会导致过拟合。课件中给出的解法是什么？",
    "en": "When a high polynomial order causes overfitting, what remedy does the course give?"
  },
  "options": {
    "zh": ["继续提高阶数", "在误差函数中加入正则项", "删除部分训练数据", "改用分段插值"],
    "en": ["Increase the order further", "Add a regularization term to the error function", "Delete some training data", "Switch to piecewise interpolation"]
  },
  "answer": [1],
  "hint": {
    "zh": "回忆课件中平方和误差函数旁边的「正则函数校正」。",
    "en": "Recall the 'regularization' shown beside the sum-of-squares error function."
  },
  "explanation": {
    "zh": "正则项惩罚过大的权重、抑制曲线剧烈震荡，是课件给出的过拟合解法（见课件一第61-62页）。",
    "en": "A regularization term penalizes large weights and damps oscillation — the remedy shown in the slides (Deck 1, pp.61-62)."
  },
  "ref": { "deck": 1, "page": 62 }
}
```

**命题质量规则（每题自检）：**
1. 考察概念为主（对齐课堂小测传统），避免数值计算题
2. 干扰项必须貌似合理（来自课件中的相邻概念），不出「一眼假」选项
3. `answer` 下标在 0-3 间均匀分布，避免连续 3 题同位置；`judge` 型 options 固定 `["对","错"]` / `["True","False"]`
4. `multi` 型答案 ≥2 项，题干须含「哪些」（zh）/「Which…」(en) 提示多选
5. `explanation` 必须解释「为什么」并含页码；`hint` 只给方向不给答案
6. zh/en 语义一致（不必逐字直译）；`ref.deck` 一律为 1，`ref.page` 取命题锚点页码

- [ ] **Step 1: 提取课件底稿**

Run 上述 python3 命令；Read `/tmp/vm1.txt`（重点 p7-26, p27-38, p39-62, p63-79）

- [ ] **Step 2: 逐文件写题**

按「逐节命题范围」表写 4 个 JSON 文件（数组，元素按模板结构），id 分别为 `d1s1q1`-`d1s1q7`、`d1s2q1`-`d1s2q6`、`d1s3q1`-`d1s3q8`、`d1s4q1`-`d1s4q7`

- [ ] **Step 3: 校验**

Run: `cd quiz && npm run validate`
Expected: deck1 四节从错误清单中消失（deck2 五节仍报题数错误——Task 4/5 处理）

Run: `cd quiz && npm test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add quiz/data/deck1-*.json
git commit -m "add deck1 question banks (28 questions)

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 4: 课件二题库·聚类与降维（2 文件 15 题）

**Files:**
- Modify: `quiz/data/deck2-s2.json`（8题）、`quiz/data/deck2-s3.json`（7题）

**Interfaces:** 同 Task 3（`ref.deck` 一律为 2）

**逐节命题范围（课件二页码）：**

| 文件 | 题号 | 主题锚点 |
|---|---|---|
| deck2-s2 | q1-q8 | Mean-Shift梯度与均值移动向量、收敛到局部极大值(p15-16)；Mean-Shift分割(p17)；MOG混合分布与两步生成过程(p18-19)；EM(p20)；K-means(p21-22)；层次聚类自底向上、距离度量与linkage两前提(p23-25) |
| deck2-s3 | q1-q7 | 手写数字可视化动机(p36)；特征抽取-常量/低频/高频分量(p37-39)；SVD定义与奇异值(p40-41)；PCA主成分(p42)；ISOMAP测地距离三步算法(p43-45)；LLE(p46)；SNE与t-SNE、t分布(p47-50) |

**质量规则：** 同 Task 3 第 1-6 条（`ref.deck`=2）。聚类节解析中，K-means/Mean-Shift/MOG 相关题的 explanation.en 末尾追加 `" Try the live demo: code/nodejs/clustering-viz."`，zh 对应「可配合仓库演示程序练习：code/nodejs/clustering-viz」；降维节 PCA/t-SNE 题同理链 `code/nodejs/dimreduction-viz`。

- [ ] **Step 1: Read `/tmp/vm2.txt`**（若不存在先重跑 Task 3 Step 1 的提取命令；重点 p15-25, p36-50）

- [ ] **Step 2: 写题**（id：`d2s2q1`-`d2s2q8`、`d2s3q1`-`d2s3q7`，结构同 Task 3 模板）

- [ ] **Step 3: 校验**

Run: `cd quiz && npm run validate`
Expected: 仅剩 deck2-s1/s4/s5 三节报题数错误

Run: `cd quiz && npm test` → PASS

- [ ] **Step 4: Commit**

```bash
git add quiz/data/deck2-s2.json quiz/data/deck2-s3.json
git commit -m "add clustering and dimensionality-reduction banks (15 questions)

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 5: 课件二题库·多维图表/非结构化/AI（3 文件 19 题）

**Files:**
- Modify: `quiz/data/deck2-s1.json`（7题）、`quiz/data/deck2-s4.json`（5题）、`quiz/data/deck2-s5.json`（7题）

**Interfaces:** 同 Task 3（`ref.deck`=2）

**逐节命题范围（课件二页码）：**

| 文件 | 题号 | 主题锚点 |
|---|---|---|
| deck2-s1 | q1-q7 | 热力图与热点集中区域/pattern寻找(p9-11)；Treemap基本框架与图例(p26-27)；层次气泡图与Voronoi(p28)；散点图矩阵框架、美国各州犯罪率(p29-31)；直方图矩阵(p33)；平行坐标框架与SAT成绩例(p34-35) |
| deck2-s4 | q1-q5 | 非结构化难点-应用个数不一(p51)；LDA主题模型统一量化(p52-53)；时空网格量化(p57)；组合案例（交通流量图卷积2020、数字货币新闻CVMJ2021）(p59-62) |
| deck2-s5 | q1-q7 | 应用领域(p67)；领域AI vs 通用AI(p68)；混合增强智能-达芬奇手术机器人(p69)；用规则教-符号主义/深蓝/沃森(p70-71)；用数据学-大小数据、Jill Watson(p72-74)；从经验中学-强化学习(p75-76)；三方法优劣小结表(p77)；五大方向(p78)；三元空间(p79) |

**质量规则：** 同 Task 3 第 1-6 条（`ref.deck`=2）。

- [ ] **Step 1: Read `/tmp/vm2.txt`**（重点 p9-11, p26-35, p51-62, p66-79）

- [ ] **Step 2: 写题**（id：`d2s1q1`-`d2s1q7`、`d2s4q1`-`d2s4q5`、`d2s5q1`-`d2s5q7`）

- [ ] **Step 3: 全量校验转绿**

Run: `cd quiz && npm run validate`
Expected: `OK: 9 sections, 62 questions, 0 errors`，退出码 0

Run: `cd quiz && npm test` → PASS

- [ ] **Step 4: Commit**

```bash
git add quiz/data/deck2-s1.json quiz/data/deck2-s4.json quiz/data/deck2-s5.json
git commit -m "add multivariate/unstructured/AI banks (19 questions), all 62 validated

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 6: 前端 UI（index.html + quiz.css + quiz-ui.js）

**Files:**
- Create: `quiz/index.html`
- Create: `quiz/assets/quiz.css`
- Create: `quiz/assets/quiz-ui.js`

**Interfaces:**
- Consumes: `shuffle/judgeAnswer/computeScore/computeMastery/createProgressStore`（Task 1 签名）；`sections.json`（Task 2 形状）；题库 JSON（Task 3-5）
- Produces: 可在 `http://localhost:8000/quiz/` 完整运行的三视图单页应用

**行为规格（逐条实现，不可缺）：**
1. hash 路由三视图：`#/` 总览、`#/quiz/<sectionId>` 答题、`#/review` 错题本；`hashchange` 重渲染；数据加载失败 → 页内错误文案不白屏
2. 总览：9 张小节卡片（双语标题、题数、掌握度徽章 not-started/in-progress/mastered、最高分、曾答错数），点卡片进答题页；顶部总进度（已掌握节数/9）；「清除全部进度」按钮（confirm 确认后 `store.clear()` 并重渲染）
3. 答题：进入时 `shuffle` 题序、每题 `shuffle` 选项序（记录原始下标映射，切语言不重排）；一屏一题；提交前可用「💡提示」（标记 hintUsed）与「📄看课件」（链 `https://github.com/hongxin/vizmodeling/blob/main/2026/vizmodeling-<deck>.pdf`，显示「课件N·第X页」）；未选任何选项时提交禁用；提交后立即判分，显示对错+解析，不可改答；「下一题」推进；最后一题后「交卷」→ 成绩单（得分、逐题 ✓/✗ 回看、掌握度徽章、「再测一次」「返回总览」）
4. multi 用多选按钮（可反复切换选中），single/judge 用单选按钮；judge 题选项渲染 `options[lang]`（题库固定 对/错、True/False）
5. 交卷时合并进度并保存：`attempts+1`、`lastScore`、`best=max`、每题 `{correct, hintUsed}` 取本次状态、`wrongCount` 累加本次答错；存储不可用时静默降级（页面照常，不报错）
6. 错题本：汇总所有 `wrongCount>0` 的题（按节分组），逐题自由练习作答、即时看对错与解析，明确标注「练习不记录」；无错题显示空状态文案
7. 右上角语言切换（按钮显示另一语言名），写 `vmquiz.v1.lang`，切换即重渲染当前视图；`document.documentElement.lang` 同步
8. 移动端适配（viewport meta、单列布局、按钮触控友好）

- [ ] **Step 1: 写 `quiz/index.html`**

```html
<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>可视化建模 · 自学自测 | VizModeling Self-Test</title>
<link rel="stylesheet" href="assets/quiz.css">
</head>
<body>
<header>
  <a class="brand" href="#/">可视化建模 · 自学自测</a>
  <nav>
    <a href="#/" data-i18n="overview">小节总览</a>
    <a href="#/review" data-i18n="review">错题本</a>
    <button id="lang-toggle" type="button">EN</button>
  </nav>
</header>
<main id="app">
  <p class="loading">加载中… / Loading…</p>
</main>
<script type="module" src="assets/quiz-ui.js"></script>
</body>
</html>
```

- [ ] **Step 2: 写 `quiz/assets/quiz.css`**

```css
:root {
  --blue: #1a5fb4; --blue-dark: #0f3d78; --bg: #f6f8fb; --card: #ffffff;
  --ok: #1a7f37; --bad: #c62828; --muted: #667085; --line: #d8dee9;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif; background: var(--bg); color: #1f2328; line-height: 1.6; }
header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: var(--blue-dark); color: #fff; position: sticky; top: 0; z-index: 10; }
header .brand { color: #fff; font-weight: 700; text-decoration: none; font-size: 1.05rem; }
header nav { display: flex; gap: 14px; align-items: center; }
header nav a { color: #dbe7f5; text-decoration: none; }
header nav a:hover { color: #fff; }
#lang-toggle { background: transparent; border: 1px solid #9db8d9; color: #fff; border-radius: 6px; padding: 3px 10px; cursor: pointer; }
main { max-width: 760px; margin: 0 auto; padding: 20px 16px 60px; }
.loading, .error { text-align: center; color: var(--muted); padding: 40px 0; }
.error { color: var(--bad); }

.progress-summary { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 14px 18px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; }
.card { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; cursor: pointer; transition: box-shadow .15s, transform .15s; }
.card:hover { box-shadow: 0 3px 12px rgba(15,61,120,.12); transform: translateY(-2px); }
.card h3 { margin: 0 0 6px; font-size: 1rem; color: var(--blue-dark); }
.card .meta { font-size: .85rem; color: var(--muted); display: flex; gap: 10px; flex-wrap: wrap; }
.badge { display: inline-block; font-size: .75rem; border-radius: 999px; padding: 1px 10px; border: 1px solid var(--line); color: var(--muted); }
.badge.in-progress { color: #9a6700; border-color: #d4a72c66; background: #fff8c5; }
.badge.mastered { color: var(--ok); border-color: #1a7f3755; background: #dafbe1; }
button.danger { background: none; border: 1px solid var(--line); color: var(--muted); border-radius: 6px; padding: 4px 10px; cursor: pointer; font-size: .8rem; }
button.danger:hover { color: var(--bad); border-color: var(--bad); }

.qbar { height: 6px; background: #e4e9f1; border-radius: 3px; overflow: hidden; margin: 6px 0 18px; }
.qbar > div { height: 100%; background: var(--blue); width: 0; transition: width .2s; }
.qcard { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 18px; }
.qcard .qmeta { font-size: .8rem; color: var(--muted); margin-bottom: 8px; display: flex; gap: 10px; flex-wrap: wrap; }
.qtext { font-size: 1.05rem; font-weight: 600; margin: 0 0 14px; white-space: pre-line; }
.opts { display: grid; gap: 8px; }
.opt { text-align: left; border: 1.5px solid var(--line); background: #fff; border-radius: 8px; padding: 10px 12px; font-size: .95rem; cursor: pointer; line-height: 1.5; }
.opt:hover { border-color: var(--blue); }
.opt.selected { border-color: var(--blue); background: #eaf1fb; }
.opt.correct { border-color: var(--ok); background: #dafbe1; }
.opt.wrong { border-color: var(--bad); background: #fdecea; }
.actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
.btn { border: none; border-radius: 8px; padding: 9px 18px; font-size: .95rem; cursor: pointer; }
.btn.primary { background: var(--blue); color: #fff; }
.btn.primary:disabled { background: #a8c0dd; cursor: not-allowed; }
.btn.ghost { background: #fff; color: var(--blue-dark); border: 1px solid var(--line); }
.hint-box { background: #fff8c5; border: 1px solid #d4a72c66; border-radius: 8px; padding: 10px 12px; margin-top: 12px; }
.explain { border-top: 1px dashed var(--line); margin-top: 14px; padding-top: 12px; }
.verdict { font-weight: 700; }
.verdict.ok { color: var(--ok); } .verdict.bad { color: var(--bad); }
.slidelink { color: var(--blue); }

.scoreboard { text-align: center; background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 24px; margin-bottom: 16px; }
.scoreboard .big { font-size: 2.4rem; font-weight: 800; color: var(--blue-dark); }
.review-item { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 16px; margin-bottom: 14px; }
.note { font-size: .85rem; color: var(--muted); }
@media (max-width: 480px) { .cards { grid-template-columns: 1fr; } header { padding: 10px 12px; } header .brand { font-size: .95rem; } }
```

- [ ] **Step 3: 写 `quiz/assets/quiz-ui.js`**

```js
// quiz/assets/quiz-ui.js — 视图渲染 + hash 路由 + i18n（DOM 层，逻辑在 quiz-core.js）
import { shuffle, judgeAnswer, computeScore, computeMastery, createProgressStore } from './quiz-core.js';

const $app = document.getElementById('app');
const $langBtn = document.getElementById('lang-toggle');

function safeStorage() {
  try {
    const s = window.localStorage;
    s.setItem('vmquiz.v1.probe', '1'); s.removeItem('vmquiz.v1.probe');
    return s;
  } catch { return null; }
}
const store = createProgressStore(safeStorage());
const LANG_KEY = 'vmquiz.v1.lang';
let lang = (() => { try { return localStorage.getItem(LANG_KEY) || 'zh'; } catch { return 'zh'; } })();

const T = {
  zh: { overview: '小节总览', review: '错题本', progress: '总进度', masteredOf: '已掌握', clearAll: '清除全部进度', confirmClear: '确定清除全部本地进度？此操作不可恢复。',
    questions: '题', best: '最高分', wrongBank: '曾答错', notStarted: '未开始', inProgress: '进行中', mastered: '已掌握',
    qOf: '第', of: '/', submit: '提交', next: '下一题', finish: '交卷', hint: '💡 提示', seeSlides: '📄 看课件',
    deck: '课件', page: '第', correct: '✓ 答对了', incorrect: '✗ 答错了', explanation: '解析', multiNote: '多选题：全部选对方可得分',
    resultTitle: '成绩单', yourScore: '得分', retry: '再测一次', backHome: '返回总览', attemptCorrect: '本次答对',
    reviewNote: '以下题目你曾答错。自由练习，作答不计入成绩。', reviewEmpty: '暂无错题，继续保持！', practiceOnly: '练习',
    loadError: '题库加载失败：请刷新重试或检查网络。', noHintNote: '看过提示后答对的题不计入「独立掌握」。', langBtn: 'EN' },
  en: { overview: 'Sections', review: 'Wrong Questions', progress: 'Overall', masteredOf: 'Mastered', clearAll: 'Clear all progress', confirmClear: 'Clear all local progress? This cannot be undone.',
    questions: 'questions', best: 'Best', wrongBank: 'Wrong', notStarted: 'Not started', inProgress: 'In progress', mastered: 'Mastered',
    qOf: 'Question', of: ' of ', submit: 'Submit', next: 'Next', finish: 'Finish', hint: '💡 Hint', seeSlides: '📄 Slides',
    deck: 'Deck', page: ' p.', correct: '✓ Correct', incorrect: '✗ Incorrect', explanation: 'Explanation', multiNote: 'Multiple answers — select all correct options',
    resultTitle: 'Result', yourScore: 'Score', retry: 'Retry', backHome: 'Home', attemptCorrect: 'Correct this run',
    reviewNote: 'Questions you got wrong before. Practice freely — not recorded.', reviewEmpty: 'No wrong questions yet. Great job!', practiceOnly: 'Practice',
    loadError: 'Failed to load questions. Refresh or check your network.', noHintNote: 'Answers correct after viewing a hint do not count as independent mastery.', langBtn: '中文' },
};
const t = k => T[lang][k] ?? k;

let sections = [];
const bankCache = new Map();

async function loadSections() {
  if (sections.length) return;
  const r = await fetch('data/sections.json');
  if (!r.ok) throw new Error('sections.json ' + r.status);
  sections = (await r.json()).sections;
}
async function loadBank(id) {
  if (bankCache.has(id)) return bankCache.get(id);
  const meta = sections.find(s => s.id === id);
  const r = await fetch('data/' + meta.file);
  if (!r.ok) throw new Error(meta.file + ' ' + r.status);
  const bank = await r.json();
  bankCache.set(id, bank);
  return bank;
}
const pdfUrl = deck => `https://github.com/hongxin/vizmodeling/blob/main/2026/vizmodeling-${deck}.pdf`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// —— 语言切换 ——
$langBtn.addEventListener('click', () => {
  lang = lang === 'zh' ? 'en' : 'zh';
  try { localStorage.setItem(LANG_KEY, lang); } catch {}
  render();
});
function syncChrome() {
  document.documentElement.lang = lang;
  $langBtn.textContent = t('langBtn');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
}

// —— 路由 ——
window.addEventListener('hashchange', render);
async function render() {
  syncChrome();
  const h = location.hash.slice(1);
  try {
    await loadSections();
    if (h.startsWith('/quiz/')) await viewQuiz(decodeURIComponent(h.slice(6)));
    else if (h === '/review') await viewReview();
    else viewOverview();
  } catch (e) {
    console.error(e);
    $app.innerHTML = `<p class="error">${esc(t('loadError'))}</p>`;
  }
}

// —— 视图：总览 ——
function viewOverview() {
  session = null; // 离开答题视图，确保下次从卡片进入是新会话
  const all = store.available ? store.load() : {};
  const totalQ = s => s.counts.single + s.counts.multi + s.counts.judge;
  const masteredCount = sections.filter(s => computeMastery(all[s.id], totalQ(s)) === 'mastered').length;
  const cards = sections.map(s => {
    const p = all[s.id];
    const m = computeMastery(p, totalQ(s));
    const badge = m === 'mastered' ? 'mastered' : m === 'in-progress' ? 'in-progress' : 'not-started';
    const wrong = p ? Object.values(p.questions).filter(q => q.wrongCount > 0).length : 0;
    const meta = [`${totalQ(s)} ${t('questions')}`];
    if (p && p.attempts) meta.push(`${t('best')} ${p.best}`, `${t('wrongBank')} ${wrong}`);
    return `<div class="card" data-quiz="${s.id}">
      <h3>${esc(s.title[lang])}</h3>
      <span class="badge ${badge}">${esc(t(badge))}</span>
      <div class="meta">${meta.map(esc).join(' · ')}</div>
    </div>`;
  }).join('');
  $app.innerHTML = `
    <div class="progress-summary">
      <span><b>${esc(t('progress'))}</b>：${esc(t('masteredOf'))} ${masteredCount} / ${sections.length}</span>
      <button class="danger" id="clear-btn" type="button">${esc(t('clearAll'))}</button>
    </div>
    <div class="cards">${cards}</div>`;
  $app.querySelectorAll('[data-quiz]').forEach(el =>
    el.addEventListener('click', () => { location.hash = '#/quiz/' + el.dataset.quiz; }));
  $app.getElementById('clear-btn').addEventListener('click', () => {
    if (confirm(t('confirmClear'))) { store.clear(); render(); }
  });
}

// —— 视图：答题 ——
let session = null; // {sectionId, order, optOrder:Map(qid->idx数组), idx, picked:Set, results:Map(qid->{selected,correct,hintUsed}), done:Set(qid), score, finished}

async function viewQuiz(sectionId) {
  const meta = sections.find(s => s.id === sectionId);
  if (!meta) { viewOverview(); return; }
  // 同节未完成会话复用（切语言/重渲染不洗牌不丢进度）；已完成则重放成绩单
  if (session && session.sectionId === sectionId) {
    session.finished ? drawResult() : drawQuestion();
    return;
  }
  const bank = await loadBank(sectionId);
  session = {
    sectionId: sectionId, meta, bank,
    order: shuffle(bank),
    optOrder: new Map(bank.map(q => [q.id, shuffle(q.options.zh.map((_, i) => i))])),
    idx: 0, picked: new Set(), pickedFor: null, results: new Map(), done: new Set(),
    score: 0, correctCount: 0, finished: false, spAfter: null,
  };
  drawQuestion();
}

function drawQuestion() {
  const { order, idx } = session;
  const q = order[idx];
  // 换题时才重置选择；重渲染（点选项/看提示/切语言）保留已选
  if (session.pickedFor !== q.id) { session.picked = new Set(); session.pickedFor = q.id; }
  const picked = session.picked;
  const answered = session.done.has(q.id);
  const r = session.results.get(q.id);
  const optIdx = session.optOrder.get(q.id);
  const optsHtml = optIdx.map(i => {
    let cls = 'opt';
    if (!answered && picked.has(i)) cls += ' selected';
    if (answered) {
      if (q.answer.includes(i)) cls += ' correct';
      else if (r.selected.includes(i)) cls += ' wrong';
    }
    const mark = answered && q.answer.includes(i) ? ' ✓' : (answered && r.selected.includes(i) && !q.answer.includes(i) ? ' ✗' : '');
    return `<button type="button" class="${cls}" data-opt="${i}" ${answered ? 'disabled' : ''}>${esc(q.options[lang][i])}${mark}</button>`;
  }).join('');
  const hintText = session.results.get(q.id)?.hintShown ? `<div class="hint-box">${esc(q.hint[lang])}</div>` : '';
  const feedback = answered ? `
    <p class="verdict ${r.correct ? 'ok' : 'bad'}">${esc(r.correct ? t('correct') : t('incorrect'))}</p>
    <div class="explain"><b>${esc(t('explanation'))}</b>：${esc(q.explanation[lang])}
    <span class="note">${esc(t('noHintNote'))}</span></div>` : '';
  const isLast = idx === order.length - 1;
  $app.innerHTML = `
    <div class="qbar"><div style="width:${Math.round((idx + (answered ? 1 : 0)) / order.length * 100)}%"></div></div>
    <div class="qcard">
      <div class="qmeta"><span>${esc(t('qOf'))} ${idx + 1}${esc(t('of'))}${order.length}</span>
        <span>${esc(q.type === 'multi' ? t('multiNote') : '')}</span></div>
      <p class="qtext">${esc(q.question[lang])}</p>
      <div class="opts">${optsHtml}</div>
      ${hintText}${feedback}
      <div class="actions">
        ${answered ? '' : `<button class="btn ghost" id="hint-btn" type="button">${esc(t('hint'))}</button>`}
        <a class="btn ghost slidelink" href="${pdfUrl(q.ref.deck)}" target="_blank" rel="noopener">${esc(t('seeSlides'))}：${esc(t('deck'))}${q.ref.deck}${esc(t('page'))}${q.ref.page}</a>
        ${answered
          ? `<button class="btn primary" id="next-btn" type="button">${esc(isLast ? t('finish') : t('next'))}</button>`
          : `<button class="btn primary" id="submit-btn" type="button" disabled>${esc(t('submit'))}</button>`}
      </div>
    </div>`;
  if (!answered) {
    $app.querySelectorAll('.opt').forEach(el => el.addEventListener('click', () => {
      const i = Number(el.dataset.opt);
      if (q.type === 'multi') { picked.has(i) ? picked.delete(i) : picked.add(i); }
      else { picked.clear(); picked.add(i); }
      drawQuestion();
    }));
    const hb = $app.getElementById('hint-btn');
    if (hb) hb.addEventListener('click', () => {
      const rec = session.results.get(q.id) || { selected: [], correct: false, hintUsed: true };
      rec.hintUsed = true; rec.hintShown = true;
      session.results.set(q.id, rec);
      drawQuestion();
    });
    const sb = $app.getElementById('submit-btn');
    sb.addEventListener('click', () => {
      const selected = [...picked];
      const correct = judgeAnswer(q, selected);
      const rec = session.results.get(q.id) || {};
      Object.assign(rec, { selected, correct });
      session.results.set(q.id, rec);
      session.done.add(q.id);
      drawQuestion();
    });
  } else {
    $app.getElementById('next-btn').addEventListener('click', () => {
      if (isLast) finishQuiz(); else { session.idx++; drawQuestion(); }
    });
  }
}

function finishQuiz() {
  const { bank, results } = session;
  let correct = 0;
  for (const q of bank) if (results.get(q.id)?.correct) correct++;
  session.score = computeScore(correct, bank.length);
  session.correctCount = correct;

  const all = store.available ? store.load() : {};
  const sp = all[session.sectionId] || { best: 0, attempts: 0, lastScore: 0, questions: {} };
  sp.attempts++; sp.lastScore = session.score; sp.best = Math.max(sp.best, session.score);
  for (const q of bank) {
    const r = results.get(q.id) || { selected: [], correct: false, hintUsed: false };
    const prev = sp.questions[q.id] || { correct: false, hintUsed: false, wrongCount: 0 };
    if (!r.correct) prev.wrongCount++;
    prev.correct = r.correct; prev.hintUsed = !!r.hintUsed;
    sp.questions[q.id] = prev;
  }
  all[session.sectionId] = sp;
  if (store.available) store.save(all);

  session.spAfter = sp;
  session.finished = true;
  drawResult();
}

function drawResult() {
  const { bank, order, results, score, correctCount, meta, spAfter } = session;
  const rows = order.map((q, i) => {
    const r = results.get(q.id);
    return `<tr><td>${i + 1}</td><td>${esc(q.question[lang])}</td>
      <td class="verdict ${r?.correct ? 'ok' : 'bad'}">${r?.correct ? '✓' : '✗'}</td></tr>`;
  }).join('');
  const mastery = computeMastery(spAfter, bank.length);
  const badge = mastery === 'mastered' ? 'mastered' : 'in-progress';
  $app.innerHTML = `
    <div class="scoreboard">
      <p>${esc(t('resultTitle'))} · ${esc(meta.title[lang])}</p>
      <div class="big">${score}</div>
      <p>${esc(t('attemptCorrect'))}：${correctCount} / ${bank.length}
        &nbsp;<span class="badge ${badge}">${esc(t(badge))}</span></p>
      <div class="actions" style="justify-content:center">
        <button class="btn primary" id="retry-btn" type="button">${esc(t('retry'))}</button>
        <button class="btn ghost" id="home-btn" type="button">${esc(t('backHome'))}</button>
      </div>
    </div>
    <table class="scoreboard" style="width:100%;text-align:left;font-size:.92rem">
      <tr><th>#</th><th>${esc(lang === 'zh' ? '题目' : 'Question')}</th><th>✓/✗</th></tr>${rows}
    </table>`;
  $app.getElementById('retry-btn').addEventListener('click', () => {
    const id = session.sectionId;
    session = null;
    viewQuiz(id);
  });
  $app.getElementById('home-btn').addEventListener('click', () => { location.hash = '#/'; });
}

// —— 视图：错题本（练习不记录） ——
async function viewReview() {
  const all = store.available ? store.load() : {};
  const groups = [];
  for (const s of sections) {
    const sp = all[s.id];
    if (!sp) continue;
    const wrongIds = Object.entries(sp.questions).filter(([, q]) => q.wrongCount > 0).map(([id]) => id);
    if (!wrongIds.length) continue;
    const bank = await loadBank(s.id);
    const qs = wrongIds.map(id => bank.find(x => x.id === id)).filter(Boolean);
    if (qs.length) groups.push({ s, qs });
  }
  if (!groups.length) {
    $app.innerHTML = `<p class="loading">${esc(t('reviewEmpty'))}</p>`;
    return;
  }
  $app.innerHTML = `<p class="note">${esc(t('reviewNote'))}</p>` + groups.map(({ s, qs }) => `
    <h3 style="color:var(--blue-dark)">${esc(s.title[lang])}</h3>
    ${qs.map(q => `
      <div class="review-item" data-qid="${q.id}">
        <div class="qmeta note">${esc(t('practiceOnly'))}</div>
        <p class="qtext">${esc(q.question[lang])}</p>
        <div class="opts">${q.options.zh.map((_, i) =>
          `<button type="button" class="opt" data-opt="${i}">${esc(q.options[lang][i])}</button>`).join('')}</div>
      </div>`).join('')}`).join('');
  $app.querySelectorAll('.review-item').forEach(item => {
    const qid = item.dataset.qid;
    const q = groups.flatMap(g => g.qs).find(x => x.id === qid);
    item.querySelectorAll('.opt').forEach(btn => btn.addEventListener('click', () => {
      const i = Number(btn.dataset.opt);
      const right = q.answer.includes(i);
      item.querySelectorAll('.opt').forEach(b2 => {
        const j = Number(b2.dataset.opt);
        b2.className = 'opt' + (q.answer.includes(j) ? ' correct' : j === i && !right ? ' wrong' : '');
        b2.disabled = true;
      });
      const note = item.querySelector('.feedback') || document.createElement('div');
      note.className = 'explain';
      note.innerHTML = `<p class="verdict ${right ? 'ok' : 'bad'}">${esc(right ? t('correct') : t('incorrect'))}</p>
        <b>${esc(t('explanation'))}</b>：${esc(q.explanation[lang])}`;
      item.appendChild(note);
    }));
  });
}

render();
```

- [ ] **Step 4: 语法检查 + 本地冒烟**

Run: `node --check quiz/assets/quiz-ui.js && node --check quiz/assets/quiz-core.js`
Expected: 无输出（语法通过）

Run（后台起服务）: `cd /Users/hongxin/Workspace/vizmodeling && python3 -m http.server 8000`
然后: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/quiz/` → 200；
`curl -s http://localhost:8000/quiz/data/sections.json | head -c 100` → JSON 开头
（浏览器逐项交互验证归 Task 7 统一做）

- [ ] **Step 5: Commit**

```bash
git add quiz/index.html quiz/assets/
git commit -m "add quiz single-page UI (overview/quiz/review, bilingual)

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 7: 集成验证 + README 链接 + 推送（主会话执行）

**Files:**
- Modify: `README.md`（Course Materials 节后新增小节）
- Modify: `README_cn.md`（课程资料节后新增小节）

**Interfaces:**
- Consumes: 全部前序任务产物；本地服务 `http://localhost:8000/quiz/`

- [ ] **Step 1: 全量测试与校验**

Run: `cd quiz && npm test && npm run validate`
Expected: 全部 PASS；`OK: 9 sections, 62 questions, 0 errors`

- [ ] **Step 2: 本地服务器 + 浏览器全流程验证（Playwright MCP）**

```bash
cd /Users/hongxin/Workspace/vizmodeling && python3 -m http.server 8000
```

用 Playwright MCP（browser_navigate → `http://localhost:8000/quiz/`）逐项验收：
1. 总览渲染 9 卡片，中文界面
2. 点进 deck1-s1：逐题作答一题（验证选中态/提交禁用逻辑）→ 看提示 → 提交 → 出现对错+解析+课件链接 → 下一题
3. 快速答完 7 题（可全选 A）→ 交卷 → 成绩单 + 掌握度徽章 + 逐题回看
4. 返回总览 → 该节显示最高分/进行中徽章；错题本出现曾答错题目，练习作答不改变成绩
5. 切 EN：界面与题目转英文；刷新仍英文；切回中文
6. 「清除全部进度」→ confirm → 总览归零
7. 移动端视口（browser_resize 390×844）下布局单列可用

Expected: 7 项全部通过；任一项不过 → 修复后重跑本步

- [ ] **Step 3: README 双语入口**

`README.md` 在 `### 2026` 列表之后、`### 2025` 之前无插入（保持年份列表完整）；在 `## Course Materials` 小节末尾（`### 2024` 列表之后）插入：

```markdown

## Self-Test
Practice what you learned — 9 short bilingual quizzes (62 questions) with instant feedback, no account needed:

👉 https://hongxin.github.io/vizmodeling/quiz/
```

`README_cn.md` 在 `### 2024` 列表之后插入：

```markdown

## 自学自测
配套课件的自测练习——9 个小节共 62 题，中英双语、即时反馈与解析，无需账号：

👉 https://hongxin.github.io/vizmodeling/quiz/
```

- [ ] **Step 4: 提交并推送**

```bash
git add README.md README_cn.md
git commit -m "add self-test entry links in READMEs

Co-Authored-By: Claude Code <noreply@anthropic.com>"
git push
```

- [ ] **Step 5: 告知用户开启 Pages（唯一人工步骤）**

向用户输出：打开 https://github.com/hongxin/vizmodeling/settings/pages → Build and deployment → Source 选 `Deploy from a branch` → Branch 选 `main` / `/ (root)` → Save。约 1 分钟后 https://hongxin.github.io/vizmodeling/quiz/ 生效。验证：curl 该地址返回 200。

---

## Self-Review 记录

- **Spec 覆盖**：spec §3 内容蓝图 → Task 2-5；§4 架构/路由/判分/掌握度/存储 → Task 1/2/6；§5 错误处理（fetch 报错、题库校验、存储降级、v1 键）→ Task 1/2/6；§6 验证（单测/校验/手动清单）→ Task 1-7；§7 上线 → Task 7。无缺口。
- **占位符扫描**：无 TBD/TODO；内容任务的题目本体按「模板+逐题命题锚点+质量规则」生成，属规格而非占位。
- **类型一致性**：`shuffle/judgeAnswer/computeScore/computeMastery/createProgressStore/validateBank` 签名在 Task 1 定义、Task 2/6 按同签名调用；进度对象形状与 Global Constraints 一致；`sections.json` 字段（id/deck/file/title/counts）在 Task 2 定义、Task 6 消费一致。
- **预检修正（执行前）**：修复 Task 6 UI 代码两处缺陷——①重渲染清空已选选项（`picked` 改为按题缓存，仅换题时重置）；②切语言/重渲染会重建答题会话导致重洗牌丢进度（`viewQuiz` 增加同节会话复用，`finishQuiz` 拆出 `drawResult`，`viewOverview` 清空会话）。
