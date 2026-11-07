// T-13 ビルドの成果物：OGP 画像とタイプごとのページ。
// 本物の dist の代わりに一時フォルダに作って確かめる（ひな形は index.html の %VITE_SITE_URL% を埋めたもの）
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildOg, OG_H, OG_W, wrap } from '../scripts/build-og.mjs';
import { buildPages } from '../scripts/build-pages.mjs';
import { releasedCharacters } from '../src/data';
import { charText } from '../src/i18n';

const SITE = 'https://example.test/';
let dist: string;

/** PNG の幅と高さ（IHDR） */
function pngSize(file: string): [number, number] {
  const b = readFileSync(file);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

beforeAll(() => {
  dist = mkdtempSync(join(tmpdir(), 'pp-dist-'));
  const template = readFileSync(new URL('../index.html', import.meta.url), 'utf-8').replaceAll('%VITE_SITE_URL%', SITE);
  writeFileSync(join(dist, 'index.html'), template);
});

afterAll(() => {
  rmSync(dist, { recursive: true, force: true });
});

describe('T-13 OGP 画像', () => {
  it('公開中のキャラ分とタイトル用があり、すべて 1200×630', () => {
    const files: string[] = buildOg(dist);
    expect(files).toHaveLength(releasedCharacters.length + 1);
    for (const c of releasedCharacters) {
      expect(pngSize(join(dist, c.og))).toEqual([OG_W, OG_H]);
    }
    expect(pngSize(join(dist, 'og-default.png'))).toEqual([OG_W, OG_H]);
  });

  it('タイプ名と一言は2行までに収まる', () => {
    for (const c of releasedCharacters) {
      const t = charText(c.id);
      expect(wrap(t.name, 64, 520).lines.length).toBeLessThanOrEqual(2);
      expect(wrap(`「${t.one}」`, 34, 520).lines.length).toBeLessThanOrEqual(2);
    }
  });
});

describe('T-13 タイプごとのページ', () => {
  it('公開中のキャラ分あり、base・app-type・og:url・og:image・タイトルが正しい', () => {
    const ids: string[] = buildPages(dist, SITE);
    expect(ids.sort()).toEqual(releasedCharacters.map((c) => c.id).sort());
    for (const c of releasedCharacters) {
      const file = join(dist, 't', c.id, 'index.html');
      expect(existsSync(file)).toBe(true);
      const html = readFileSync(file, 'utf-8');
      expect(html).toContain('<base href="../../" />');
      expect(html).toContain(`<meta name="app-type" content="${c.id}" />`);
      expect(html).toContain(`<meta property="og:url" content="${SITE}t/${c.id}/" />`);
      expect(html).toContain(`<meta property="og:image" content="${SITE}og/${c.id}.png" />`);
      expect(html).toContain(`<title>${charText(c.id).name} ｜ `);
      // 「質問ゼロ。」は作品のどこにも出さない（2026-10-30 の決定）
      expect(html).not.toContain('質問ゼロ');
    }
  });
});
