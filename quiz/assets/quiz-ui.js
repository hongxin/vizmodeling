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
const badgeKey = m => m === 'in-progress' ? 'inProgress' : m === 'not-started' ? 'notStarted' : 'mastered';

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
      <span class="badge ${badge}">${esc(t(badgeKey(m)))}</span>
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
  $app.querySelector('#clear-btn').addEventListener('click', () => {
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
          : `<button class="btn primary" id="submit-btn" type="button" ${picked.size ? '' : 'disabled'}>${esc(t('submit'))}</button>`}
      </div>
    </div>`;
  if (!answered) {
    $app.querySelectorAll('.opt').forEach(el => el.addEventListener('click', () => {
      const i = Number(el.dataset.opt);
      if (q.type === 'multi') { picked.has(i) ? picked.delete(i) : picked.add(i); }
      else { picked.clear(); picked.add(i); }
      drawQuestion();
    }));
    const hb = $app.querySelector('#hint-btn');
    if (hb) hb.addEventListener('click', () => {
      const rec = session.results.get(q.id) || { selected: [], correct: false, hintUsed: true };
      rec.hintUsed = true; rec.hintShown = true;
      session.results.set(q.id, rec);
      drawQuestion();
    });
    const sb = $app.querySelector('#submit-btn');
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
    $app.querySelector('#next-btn').addEventListener('click', () => {
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
        &nbsp;<span class="badge ${badge}">${esc(t(badgeKey(mastery)))}</span></p>
      <div class="actions" style="justify-content:center">
        <button class="btn primary" id="retry-btn" type="button">${esc(t('retry'))}</button>
        <button class="btn ghost" id="home-btn" type="button">${esc(t('backHome'))}</button>
      </div>
    </div>
    <table class="scoreboard" style="width:100%;text-align:left;font-size:.92rem">
      <tr><th>#</th><th>${esc(lang === 'zh' ? '题目' : 'Question')}</th><th>✓/✗</th></tr>${rows}
    </table>`;
  $app.querySelector('#retry-btn').addEventListener('click', () => {
    const id = session.sectionId;
    session = null;
    viewQuiz(id);
  });
  $app.querySelector('#home-btn').addEventListener('click', () => { location.hash = '#/'; });
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
