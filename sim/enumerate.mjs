// 5%刻み・12区分・合計100% の全組み合わせで判定を回す
import fs from 'node:fs';
import { judge, CATEGORY_IDS } from './judge.mjs';
const { rules: _r } = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const NAMES = JSON.parse(fs.readFileSync('names.json', 'utf8'));
const rules = _r.map((r) => ({ ...r, name: NAMES[r.id] }));
const cnt = Object.fromEntries(rules.map((r) => [r.id, 0]));
const first = {};
let total = 0, errors = 0;
const p = Object.fromEntries(CATEGORY_IDS.map((k) => [k, 0]));
function rec(i, left) {
  if (i === CATEGORY_IDS.length - 1) {
    p[CATEGORY_IDS[i]] = left * 5;
    total++;
    try { const id = judge(p, rules); cnt[id]++; if (!first[id]) first[id] = { ...p }; } catch { errors++; }
    return;
  }
  for (let u = 0; u <= left; u++) { p[CATEGORY_IDS[i]] = u * 5; rec(i + 1, left - u); }
}
rec(0, 20);
console.log(`# 全組み合わせの確認（${process.argv[2]}）\n- 組み合わせの数：${total.toLocaleString()}\n- どのキャラにも決まらない入力：${errors}件\n- 一度も出ないキャラ：${rules.filter((r) => !cnt[r.id]).map((r) => r.name).join('、') || 'なし'}\n\n| キャラ | 件数 | 割合 | 例 |\n| --- | --- | --- | --- |`);
for (const r of rules) {
  const e = first[r.id] ? Object.entries(first[r.id]).filter(([, v]) => v).map(([k, v]) => `${k}${v}`).join(' ') : '-';
  console.log(`| ${r.name} | ${cnt[r.id].toLocaleString()} | ${(100 * cnt[r.id] / total).toFixed(2)}% | ${e} |`);
}
