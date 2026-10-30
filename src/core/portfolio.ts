// 入力の決まり（診断仕様 2.3、技術設計 4.1）。
// 残りは自動で「現金・預金」（remainder）に入る。値は常に刻み（5%）の倍数で、合計は常に100

import type { Portfolio } from './metrics';

export type InputRules = {
  readonly categoryIds: readonly string[];
  /** 残りが入る区分（現金・預金）。スライダーを持たない */
  readonly remainder: string;
  readonly step: number;
};

/** 入力の状態。メモリの中だけに持ち、端末に保存しない */
export type InputState = {
  /** 選んだ区分（選んだ順）。remainder は入らない */
  readonly selected: readonly string[];
  /** 選んだ区分の割合 */
  readonly values: Readonly<Record<string, number>>;
};

export const emptyInput = (): InputState => ({ selected: [], values: {} });

function sum(values: Readonly<Record<string, number>>, except?: string): number {
  return Object.entries(values).reduce((s, [k, v]) => (k === except ? s : s + v), 0);
}

/** 残り（現金・預金）の割合 */
export function remainderValue(state: InputState): number {
  return 100 - sum(state.values);
}

/** その区分が増やせる上限（ほかの合計を引いた分） */
export function maxValue(state: InputState, id: string): number {
  return 100 - sum(state.values, id);
}

export function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function isInputCategory(r: InputRules, id: string): boolean {
  return id !== r.remainder && r.categoryIds.includes(id);
}

/** 割合を変える。刻みに合わせ、残りが0%を下回らないよう上限で止める。選んでいなければ選ぶ */
export function setValue(state: InputState, id: string, value: number, r: InputRules): InputState {
  if (!isInputCategory(r, id)) return state;
  const v = Math.min(roundToStep(Math.min(Math.max(value, 0), 100), r.step), maxValue(state, id));
  const selected = state.selected.includes(id) ? state.selected : [...state.selected, id];
  return { selected, values: { ...state.values, [id]: v } };
}

/** 選ぶ・選ぶのをやめる。やめたら0%になり、その分は残りに戻る */
export function toggle(state: InputState, id: string, r: InputRules): InputState {
  if (!isInputCategory(r, id)) return state;
  if (state.selected.includes(id)) {
    const values = { ...state.values };
    delete values[id];
    return { selected: state.selected.filter((x) => x !== id), values };
  }
  return { selected: [...state.selected, id], values: { ...state.values, [id]: 0 } };
}

/** プリセットの値を入力にする。0%より大きい区分を選んだ状態にする */
export function fromValues(values: Readonly<Record<string, number | undefined>>, r: InputRules): InputState {
  return Object.entries(values)
    .filter((e): e is [string, number] => (e[1] ?? 0) > 0 && isInputCategory(r, e[0]))
    .reduce((s, [id, v]) => setValue(s, id, v, r), emptyInput());
}

/** 判定に渡す形。全区分をそろえる（選んでいない区分は0） */
export function toPortfolio(state: InputState, r: InputRules): Portfolio {
  return Object.fromEntries(
    r.categoryIds.map((id) => [id, id === r.remainder ? remainderValue(state) : (state.values[id] ?? 0)]),
  );
}
