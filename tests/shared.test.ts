// シェアURL（/t/<タイプID>/）の判定と、T-10「シェアURLで見ただけでは保存されない」
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { sharedTypeFrom } from '../src/share/appType';

describe('app-type の判定', () => {
  it('公開中のキャラならそのID', () => {
    expect(sharedTypeFrom('owl')).toBe('owl');
    expect(sharedTypeFrom(' monk ')).toBe('monk');
  });

  it('未公開・知らないID・空なら null（通常のトップとして開く）', () => {
    expect(sharedTypeFrom('dragon')).toBeNull();
    expect(sharedTypeFrom('ghost')).toBeNull();
    expect(sharedTypeFrom('')).toBeNull();
    expect(sharedTypeFrom(null)).toBeNull();
    expect(sharedTypeFrom(undefined)).toBeNull();
  });
});

describe('T-10 シェアURLで見ただけでは保存されない', () => {
  it('シェアURLの画面と起動の処理は、発見の記録を書かない', () => {
    for (const f of ['../src/ui/screens/shared.ts', '../src/main.ts']) {
      const src = readFileSync(new URL(f, import.meta.url), 'utf-8');
      expect(src).not.toMatch(/markFound/);
    }
  });
});
