// ビルド後のスクリプト（build-og.mjs・build-pages.mjs）に共通の読み込み（技術設計 6章）

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

const readJson = (rel) => JSON.parse(readFileSync(new URL(rel, import.meta.url), 'utf-8'));

/** 公開中のキャラ（図鑑の並び）と、その文言 */
export function loadData() {
  const { characters } = readJson('../src/data/characters.json');
  const config = readJson('../src/data/config.json');
  const ja = readJson('../src/data/i18n/ja.json');
  const released = characters.filter((c) => c.released).sort((a, b) => a.zukanOrder - b.zukanOrder);
  return { released, config, ja };
}

/** 作品のURL（末尾は /）。.env と環境変数の VITE_SITE_URL */
export function siteUrl() {
  const url = (loadEnv('production', ROOT, 'VITE_').VITE_SITE_URL ?? '').trim();
  if (!url) throw new Error('VITE_SITE_URL is empty');
  return url.endsWith('/') ? url : `${url}/`;
}
