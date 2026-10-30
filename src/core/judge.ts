// 判定（診断仕様 3章）。rules.json を上から順に評価し、all の条件をすべて満たした最初のタイプIDを返す。
// 参照実装 sim/judge.mjs と同じ結果になる（T-01）

import { metrics, type Portfolio } from './metrics';

export const OPS = {
  eq: (a: number, b: number) => a === b,
  gt: (a: number, b: number) => a > b,
  gte: (a: number, b: number) => a >= b,
  lt: (a: number, b: number) => a < b,
  lte: (a: number, b: number) => a <= b,
} as const;

export type Op = keyof typeof OPS;
export type Condition = readonly [metric: string, op: Op, value: number];
export type Rule = { readonly id: string; readonly all: readonly Condition[] };

export function judge(p: Portfolio, rules: readonly Rule[], categoryIds: readonly string[]): string {
  const m = metrics(p, categoryIds);
  for (const r of rules) {
    if (r.all.every(([k, op, x]) => OPS[op](m[k] ?? 0, x))) return r.id;
  }
  // 最後のルールは条件なし（検査で保証）なので、ここには来ない
  throw new Error('no rule matched');
}
