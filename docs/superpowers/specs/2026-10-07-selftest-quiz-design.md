# 自学测试系统设计文档

- 日期：2026-10-07
- 状态：已获用户认可（内容蓝图 + 技术设计两轮确认）
- 仓库：hongxin/vizmodeling

## 1. 背景与目标

为《可视化建模》两次课件（2026/vizmodeling-1.pdf 82页、vizmodeling-2.pdf 84页）配套建设在线自学测试，帮助学生自检概念掌握情况。依托 GitHub 机制在线分享，学生**无需账号、无需安装**，打开网页即可作答。

### 已锁定的四项需求决策

| 决策点 | 结论 |
|---|---|
| 组织粒度 | 按知识点分小节微测（5-8题/节），非整卷 |
| 语言 | 中英双语，页面一键切换 |
| 题型 | 单选 + 多选 + 判断 |
| 进度记录 | localStorage 本地完整记录（最高分/掌握度/错题本） |

## 2. 调研结论摘要（决策依据）

**学习平台模式**（Khan/Coursera/edX/Duolingo/Anki/中国大学MOOC）：
- 自测（无监考、形成性）核心机制均可纯前端静态实现，无需后端账号
- 最佳实践：即时反馈+每题解析、分级提示（用提示则不计独立掌握）、建议及格线80%、无限重做只记最高分、题与选项乱序、结尾小结指向课件出处
- 需后端的只有跨设备同步、班级统计等 → 本场景明确不做

**GitHub 机制**：
- GitHub Classroom 已于 2026-08 退役，不可依赖
- GitHub Pages 托管零构建静态站是成熟路线（范例：LMU i2ml 课程）
- 坑：Pages 默认跑 Jekyll（需 `.nojekyll`）；站点≤1GB（本仓库远未触及）；前端判分则答案可见于源码（自测场景可接受）

**技术路线**：方案 A「零构建静态自测站」，否决 mdBook（引构建链、结构大改）与 Actions 批改（学生需会 git，自学摩擦大）。giscus 答疑、Actions 批改留作未来独立演进层。

## 3. 内容蓝图（9 小节 62 题）

| # | 小节ID | 覆盖内容 | 题数 | 题型配比 |
|---|---|---|---|---|
| 1 | deck1-s1 | 可视化基础：定义、三大任务、Minard/宽街霍乱/Rosling、变化盲视、Anscombe四重奏、与图形学/HCI/数据挖掘边界 | 7 | 单选4 多选2 判断1 |
| 2 | deck1-s2 | 一维图表辨析：柱形/堆叠柱/散点/折线/阶梯、自变量应变量、延续vs离散 | 6 | 单选4 判断2 |
| 3 | deck1-s3 | 插值与拟合：插值、Catmull-Rom、最小二乘/正则方程、多项式拟合、过拟合与正则化 | 8 | 单选5 多选2 判断1 |
| 4 | deck1-s4 | LOESS与密度估计：LOESS/Robust LOESS、Epanechnikov核、边界问题、直方图缺点、核密度估计 | 7 | 单选4 多选2 判断1 |
| 5 | deck2-s1 | 多维图表：热力图、Treemap、层次气泡/Voronoi、散点图矩阵、平行坐标 | 7 | 单选4 多选2 判断1 |
| 6 | deck2-s2 | 聚类：K-means、层次聚类/linkage、MOG+EM、Mean-Shift收敛性 | 8 | 单选5 多选2 判断1 |
| 7 | deck2-s3 | 降维：特征抽取、SVD/PCA、ISOMAP、LLE、t-SNE | 7 | 单选5 判断2 |
| 8 | deck2-s4 | 非结构化数据：LDA主题模型、时空网格量化、手机日志案例 | 5 | 单选3 多选2 |
| 9 | deck2-s5 | 可视化与AI：三大方法、新一代AI五大方向、混合增强智能 | 7 | 单选4 多选2 判断1 |

- 聚类、降维两节解析互链仓库已有演示程序（code/nodejs 的聚类与降维 demo）
- 每题 `ref` 指明课件册与页码，答错可一键回看

### 题目数据结构（每节一个 JSON 文件）

```json
{
  "id": "d1s3q5",
  "type": "single",
  "topic": "过拟合",
  "question":  { "zh": "…", "en": "…" },
  "options":   { "zh": ["…","…","…","…"], "en": ["…","…","…","…"] },
  "answer":    [1],
  "hint":      { "zh": "…", "en": "…" },
  "explanation": { "zh": "……见课件一第61-62页", "en": "…" },
  "ref": { "deck": 1, "page": 62 }
}
```

- `type`: `single` | `multi` | `judge`；`judge` 型 options 固定为 对/错（True/False）
- `answer`: 选项下标数组；multi 全对才判对
- `id` 全局唯一：`d<deck>s<section>q<序号>`

## 4. 站点架构

```
quiz/
├── index.html            # 单页应用入口
├── assets/
│   ├── quiz.css          # 样式：学术蓝白基调，移动端适配
│   └── quiz.js           # 路由/判分/i18n/进度记录，原生JS零依赖
├── data/
│   ├── sections.json     # 小节元数据（id/双语标题/所属课件/知识点）
│   └── deck1-s1.json … deck2-s5.json   # 9个题库
.nojekyll                 # 仓库根，跳过Jekyll
```

访问地址：`https://hongxin.github.io/vizmodeling/quiz/`

### 视图与路由（hash 路由）

1. `#/` 小节总览：9 个小节卡片（掌握度徽章：未开始/进行中/已掌握、最高分、错题数），顶部总进度条，「清除全部进度」按钮
2. `#/quiz/<sectionId>` 答题页：一屏一题，顶部进度条；动作：💡提示 / 📄看课件（跳 ref）/ 下一题；交卷后成绩单+逐题回看
3. `#/review` 错题本：汇集所有曾答错的题，可重做

右上角 中/EN 切换（持久化）。答案明文存于题库 JSON（自测场景接受源码可见）。

### 判分与掌握度

- single/judge 精确匹配；multi 全对才对（解析逐项说明）
- 每次进入小节：题序与选项序洗牌
- 每题在一次作答中**仅可提交一次**，提交后立即显示对错、解析，答案不可更改；重做 = 重新开始整节（新洗牌）
- 小节得分 = 答对题数 / 总题数 × 100（百分制整数）
- 掌握度：小节最高分 ≥80% 且 ≥80% 的题为未用提示答对 → 已掌握；有作答 → 进行中；否则未开始
- 无限重做，只记最高分
- 错题本中的重做仅为练习，不更新小节成绩与任何记录

### localStorage

```
vmquiz.v1.lang = "zh"
vmquiz.v1.progress = {
  "<sectionId>": {
    "best": 86, "attempts": 2, "lastScore": 71,
    "questions": { "<questionId>": { "correct": true, "hintUsed": false, "wrongCount": 1 } }
  }
}
```

## 5. 错误处理

- 题库 fetch 失败 → 页内明确报错，不白屏
- 加载时校验必填字段（id/type/question/options/answer/explanation/ref），坏题跳过 + console 警告
- 隐私模式等 localStorage 不可用 → 降级为不记录，答题功能照常
- 存储 key 带 v1 版本号，未来升级换 key 不迁移

## 6. 验证方式

- 判分/洗牌/掌握度为纯函数，`node:test` 单测（不引测试框架）
- 题库 JSON 校验脚本全量检查，可重复运行
- 手动验收清单：桌面+手机、Chrome+Safari、双语切换、清进度后重来

## 7. 上线步骤

1. 完成全部文件、测试通过后提交推送
2. **用户操作**：仓库 Settings → Pages → Source 选 `main` / root（一次性）
3. README.md 与 README_cn.md 各加自测入口链接

## 8. 明确不做（YAGNI）

- 后端服务、账号体系、跨设备同步、班级统计排行
- 真正的 SRS 间隔重复调度
- giscus 答疑组件、Actions 自动批改（留作未来独立叠加层）
- 对 IE 等旧浏览器兼容（目标 ES2020+ 现代浏览器）
