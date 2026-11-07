// T-14 送るデータ：track() は渡した属性と lang だけを送る。割合・区分の中身は送らない
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { foundBucket, selectedBucket, track } from '../src/analytics';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('T-14 送るデータ', () => {
  it('diagnose は決まった属性と lang だけを送る', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag });
    track('diagnose', { type: 'monk', first: true, new_found: true, selected: '1', preset: true });
    expect(gtag).toHaveBeenCalledTimes(1);
    const [kind, name, props] = gtag.mock.calls[0]!;
    expect([kind, name]).toEqual(['event', 'diagnose']);
    expect(Object.keys(props as object).sort()).toEqual(['first', 'lang', 'new_found', 'preset', 'selected', 'type']);
  });

  it('GA4 がなければ何もしない（例外も出さない）', () => {
    vi.stubGlobal('window', {});
    expect(() => track('retry', {})).not.toThrow();
  });

  it('選んだ区分は数の区分けだけ', () => {
    expect([1, 2, 3, 4, 6, 7, 12].map(selectedBucket)).toEqual(['1', '2-3', '2-3', '4-6', '4-6', '7+', '7+']);
  });

  it('発見数の区分け（1／2-5／6+／complete）', () => {
    expect([0, 1, 2, 5, 6, 9, 10].map((n) => foundBucket(n, 10))).toEqual(['1', '1', '2-5', '2-5', '6+', '6+', 'complete']);
    // キャラが増えても、全部そろったときだけ complete
    expect([10, 21, 22].map((n) => foundBucket(n, 22))).toEqual(['6+', '6+', 'complete']);
  });

  it('track() に入力の中身（割合・選んだ区分）を渡していない', () => {
    const dir = decodeURIComponent(new URL('../src/', import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
    const files = (function walk(d: string): string[] {
      return readdirSync(d, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(join(d, e.name)) : e.name.endsWith('.ts') ? [join(d, e.name)] : [],
      );
    })(dir);
    const found: string[] = [];
    for (const f of files) {
      // track( から対応する ) までを取り出して調べる
      const src = readFileSync(f, 'utf-8');
      for (const m of src.matchAll(/\btrack\(/g)) {
        let depth = 0;
        let end = m.index!;
        for (let i = m.index! + 5; i < src.length; i++) {
          if (src[i] === '(') depth++;
          if (src[i] === ')' && --depth === 0) {
            end = i;
            break;
          }
        }
        const call = src.slice(m.index!, end + 1);
        if (/\.values\b|toPortfolio|portfolio|\.selected\b(?!\.length)/.test(call)) found.push(`${f}: ${call}`);
      }
    }
    expect(found).toEqual([]);
  });
});
