import fs from 'node:fs';
import { judge } from './judge.mjs';
import { samples } from './sample.mjs';
const rulesFile = process.argv[2] || 'rules.json';
const N = Number(process.argv[3] || 10000);
const { rules: _r } = JSON.parse(fs.readFileSync(rulesFile, 'utf8'));
const NAMES = JSON.parse(fs.readFileSync('names.json', 'utf8'));
const rules = _r.map((r) => ({ ...r, name: NAMES[r.id] }));
const { personas } = JSON.parse(fs.readFileSync(process.env.PERSONAS || 'personas.json', 'utf8'));
const cnt = Object.fromEntries(rules.map((r) => [r.id, 0]));
const byPersona = {};
for (const { persona, p } of samples(personas, N)) {
  const id = judge(p, rules); cnt[id]++;
  (byPersona[persona] ??= {})[id] = (byPersona[persona][id] || 0) + 1;
}
console.log(`# 出現割合（${rulesFile}、サンプル ${N} 件）\n\n| # | キャラ | 割合 |\n| --- | --- | --- |`);
rules.forEach((r, i) => console.log(`| ${i + 1} | ${r.name} | ${(100 * cnt[r.id] / N).toFixed(1)}% |`));
if (process.argv[4] === 'persona') {
  console.log('\n## 型ごとの主なキャラ');
  for (const [k, v] of Object.entries(byPersona)) {
    const tot = Object.values(v).reduce((a, b) => a + b, 0);
    const top = Object.entries(v).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id, c]) => `${rules.find((r) => r.id === id).name} ${(100 * c / tot).toFixed(0)}%`).join('、');
    console.log(`- ${k}（${tot}件）：${top}`);
  }
}
