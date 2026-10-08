import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const dataDir = new URL('../data/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('sections.json', dataDir), 'utf8'));

const SPEC_COUNTS = { // spec 第8节挑战题扩展层表格：id -> [single, multi, judge, 总数]
  'deck1-s1': [5, 3, 1, 9], 'deck1-s2': [5, 0, 3, 8], 'deck1-s3': [7, 2, 1, 10], 'deck1-s4': [5, 3, 1, 9],
  'deck2-s1': [5, 3, 1, 9], 'deck2-s2': [7, 3, 1, 11], 'deck2-s3': [7, 0, 3, 10], 'deck2-s4': [4, 3, 0, 7],
  'deck2-s5': [5, 2, 1, 8],
};

test('sections.json 共9节、id/文件/计数符合spec', () => {
  const ss = manifest.sections;
  assert.equal(ss.length, 9);
  assert.equal(new Set(ss.map(s => s.id)).size, 9);
  for (const s of ss) {
    assert.match(s.id, /^deck[12]-s[1-5]$/);
    assert.ok(s.title.zh && s.title.en);
    assert.equal(s.file, s.id + '.json');
    assert.equal(s.deck, Number(s.id[4])); // id 形如 deck1-s1，deck 数字在第 4 位（brief 原文 s.id[3] 取到 'k'，为笔误）
    const [si, mu, ju, tot] = SPEC_COUNTS[s.id];
    assert.deepEqual(s.counts, { single: si, multi: mu, judge: ju });
    assert.equal(si + mu + ju, tot);
    assert.ok(existsSync(new URL(s.file, dataDir)), s.file + ' 应存在（可为空数组占位）');
  }
});
