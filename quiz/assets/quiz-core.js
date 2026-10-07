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
