// 指標の計算（診断仕様 3.2）。指標の名前と計算はコードで持ち、rules.json から名前で使う（技術設計 5章）

/** 区分ID → 割合（0〜100の整数）。ない区分は0とみなす */
export type Portfolio = Readonly<Record<string, number>>;

type Get = (id: string) => number;

/** 区分そのもの以外の指標。足すときはここに1行足す */
const DERIVED: Record<string, (v: Get, values: number[]) => number> = {
  index: (v) => v('world') + v('us') + v('japan') + v('otherReg'),
  stocks: (v) => v('jpStock') + v('usStock') + v('otStock'),
  foreignStocks: (v) => v('usStock') + v('otStock'),
  equity: (v) => v('world') + v('us') + v('japan') + v('otherReg') + v('jpStock') + v('usStock') + v('otStock'),
  defense: (v) => v('bond') + v('gold') + v('cash'),
  attack: (v) => v('jpStock') + v('usStock') + v('otStock') + v('crypto'),
  count5: (_v, values) => values.filter((x) => x >= 5).length,
  count25: (_v, values) => values.filter((x) => x === 25).length,
  usMinusWorld: (v) => v('us') - v('world'),
  worldMinusUs: (v) => v('world') - v('us'),
  absWorldUs: (v) => Math.abs(v('world') - v('us')),
  worldUs: (v) => v('world') + v('us'),
};

/** 指標の計算が前提にしている区分ID（categories.json にあるかを検査する） */
export const REQUIRED_CATEGORY_IDS = [
  'world', 'us', 'japan', 'otherReg', 'jpStock', 'usStock', 'otStock', 'bond', 'gold', 'crypto', 'cash',
] as const;

/** rules.json で使える指標の名前（区分ID＋計算する指標） */
export function metricNames(categoryIds: readonly string[]): string[] {
  return [...categoryIds, ...Object.keys(DERIVED)];
}

export function metrics(p: Portfolio, categoryIds: readonly string[]): Record<string, number> {
  const v: Get = (id) => p[id] ?? 0;
  const values = categoryIds.map(v);
  const m: Record<string, number> = Object.fromEntries(categoryIds.map((id) => [id, v(id)]));
  for (const [name, fn] of Object.entries(DERIVED)) m[name] = fn(v, values);
  return m;
}
