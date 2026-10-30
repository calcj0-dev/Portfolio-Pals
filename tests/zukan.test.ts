// T-10 発見の記録（シェアURLで見ただけでは保存されないことは #11 で足す）
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { foundIds, hasDiagnosed, isFound, markDiagnosed, markFound } from '../src/zukan';

let store: Map<string, string>;

beforeEach(() => {
  store = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('T-10 発見の記録', () => {
  it('結果を出すとそのIDが保存される。初めてのときだけ true', () => {
    expect(markFound('monk')).toBe(true);
    expect(markFound('monk')).toBe(false);
    expect(isFound('monk')).toBe(true);
    expect(JSON.parse(store.get('baka017.found')!)).toEqual(['monk']);
  });

  it('知らないIDも捨てずに残す（キャラを増やしたときに過去の記録が消えない）', () => {
    store.set('baka017.found', JSON.stringify(['future_char']));
    markFound('owl');
    expect(foundIds()).toEqual(['future_char', 'owl']);
  });

  it('壊れた記録は空として扱う', () => {
    store.set('baka017.found', '{oops');
    expect(foundIds()).toEqual([]);
  });

  it('一度でも診断したかを記録する', () => {
    expect(hasDiagnosed()).toBe(false);
    markDiagnosed();
    expect(hasDiagnosed()).toBe(true);
  });

  it('保存できない環境でも動く', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
    });
    expect(() => markFound('monk')).not.toThrow();
    expect(foundIds()).toEqual([]);
  });
});
