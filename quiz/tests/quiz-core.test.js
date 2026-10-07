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
