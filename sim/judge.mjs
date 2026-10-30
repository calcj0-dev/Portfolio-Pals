// 判定の参照実装：rules.json の条件（値）を上から評価し、最初に当てはまったキャラに決める
export const CATEGORY_IDS = ['world','us','japan','otherReg','jpStock','usStock','otStock','bond','gold','crypto','misc','cash'];

// 指標（metric）を計算する。p は {区分ID: 割合(0〜100の整数)}
export function metrics(p) {
  const v = (k) => p[k] || 0;
  const vals = CATEGORY_IDS.map(v);
  const m = Object.fromEntries(CATEGORY_IDS.map((k) => [k, v(k)]));
  m.index = v('world') + v('us') + v('japan') + v('otherReg');      // インデックス度
  m.stocks = v('jpStock') + v('usStock') + v('otStock');             // 個別株
  m.foreignStocks = v('usStock') + v('otStock');                      // 海外の個別株
  m.equity = m.index + m.stocks;                                      // 株全体
  m.defense = v('bond') + v('gold') + v('cash');                      // 守り度
  m.attack = m.stocks + v('crypto');                                  // 攻め度
  m.count5 = vals.filter((x) => x >= 5).length;                       // 分散度（5%以上の区分の数）
  m.count25 = vals.filter((x) => x === 25).length;                    // ちょうど25%の区分の数
  m.usMinusWorld = v('us') - v('world');
  m.worldMinusUs = v('world') - v('us');
  m.absWorldUs = Math.abs(v('world') - v('us'));
  m.worldUs = v('world') + v('us');
  return m;
}

const OPS = {
  eq: (a, b) => a === b, gt: (a, b) => a > b, gte: (a, b) => a >= b,
  lt: (a, b) => a < b, lte: (a, b) => a <= b,
};

export function judge(p, rules) {
  const m = metrics(p);
  for (const r of rules) {
    if (r.all.every(([k, op, x]) => OPS[op](m[k], x))) return r.id;
  }
  throw new Error('no rule matched');
}
