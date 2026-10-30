import fs from 'node:fs';
import { judge } from './judge.mjs';
const file = process.argv[2];
const { rules: _r } = JSON.parse(fs.readFileSync(file, 'utf8'));
const NAMES = JSON.parse(fs.readFileSync('names.json', 'utf8'));
const rules = _r.map((r) => ({ ...r, name: NAMES[r.id] }));
const name = (id) => rules.find((r) => r.id === id).name;
const ex = [
  ['全世界100', { world: 100 }], ['全世界60・米国20・現金15・金5', { world: 60, us: 20, cash: 15, gold: 5 }],
  ['全世界80・現金20', { world: 80, cash: 20 }], ['全世界70・個別株(日本)10・現金20', { world: 70, jpStock: 10, cash: 20 }],
  ['全世界60・米国30・現金10', { world: 60, us: 30, cash: 10 }], ['米国70・現金30', { us: 70, cash: 30 }],
  ['全世界40・債券30・現金30', { world: 40, bond: 30, cash: 30 }], ['全世界50・米国50', { world: 50, us: 50 }],
  ['現金100', { cash: 100 }], ['米国100', { us: 100 }], ['全世界50・現金50', { world: 50, cash: 50 }],
  ['全世界30・米国30・現金40', { world: 30, us: 30, cash: 40 }], ['日本の個別株50・現金50', { jpStock: 50, cash: 50 }], ['米国の個別株50・現金50', { usStock: 50, cash: 50 }], ['その他の個別株60・現金40', { otStock: 60, cash: 40 }], ['全世界40・日本の個別株20・米国の個別株15・現金25', { world: 40, jpStock: 20, usStock: 15, cash: 25 }],
  ['全世界50・暗号資産20・現金30', { world: 50, crypto: 20, cash: 30 }], ['米国80・現金20', { us: 80, cash: 20 }],
  ['全世界25・米国25・債券25・金25', { world: 25, us: 25, bond: 25, gold: 25 }],
];
console.log('| 入力例 | 判定 |\n| --- | --- |');
for (const [l, p] of ex) console.log(`| ${l} | ${name(judge(p, rules))} |`);
