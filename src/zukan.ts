// 発見の記録（診断仕様 6章、技術設計 10章）。自分の入力で出たキャラだけを端末に保存する。
// シェアURLで見たキャラは数えない。保存できない環境でも動く（T-10）

import { load, save } from './storage';

/** 発見したタイプID（知らないIDが入っていても捨てずに残す。キャラを増やしても過去の記録が消えないように） */
export function foundIds(): string[] {
  try {
    const v: unknown = JSON.parse(load('found', '[]'));
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function isFound(id: string): boolean {
  return foundIds().includes(id);
}

/** 発見として記録する。初めてなら true */
export function markFound(id: string): boolean {
  const ids = foundIds();
  if (ids.includes(id)) return false;
  save('found', JSON.stringify([...ids, id]));
  return true;
}

/** その端末で一度でも診断したか（計測の first 用） */
export function hasDiagnosed(): boolean {
  return load('diagnosed', '0') === '1';
}

export function markDiagnosed(): void {
  save('diagnosed', '1');
}
