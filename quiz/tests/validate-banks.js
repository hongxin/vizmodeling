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
