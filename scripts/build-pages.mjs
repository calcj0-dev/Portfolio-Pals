// タイプごとのページ（技術設計 6.2、T-13）。dist/index.html をもとに dist/t/<タイプID>/index.html を作る。
// 中身は同じアプリで、変えるのは <base>・<title>・OGP・app-type だけ

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DIST, loadData, siteUrl } from './lib.mjs';

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** <meta property="..." content="..."> の content を置き換える。見つからなければ失敗させる（ひな形が変わったのに気づくため） */
function setMeta(html, property, value) {
  const re = new RegExp(`(<meta\\s+property="${property}"\\s+content=")[^"]*(")`);
  if (!re.test(html)) throw new Error(`meta ${property} not found in index.html`);
  return html.replace(re, `$1${escapeAttr(value)}$2`);
}

/** 1キャラ分のページ */
export function typePageHtml(template, { id, name, one }, { site, appTitle, sub }) {
  const title = `${name} ｜ ${appTitle}`;
  let html = template.replace(
    /<head>/,
    `<head>\n    <base href="../../" />\n    <meta name="app-type" content="${escapeAttr(id)}" />`,
  );
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(title)}</title>`);
  html = setMeta(html, 'og:title', title);
  html = setMeta(html, 'og:description', `「${one}」― ${sub}`);
  html = setMeta(html, 'og:url', `${site}t/${id}/`);
  html = setMeta(html, 'og:image', `${site}og/${id}.png`);
  return html;
}

/** 公開中のキャラのページをすべて作る。作ったタイプIDを返す */
export function buildPages(dist = DIST, site = siteUrl()) {
  const { released, ja } = loadData();
  const template = readFileSync(join(dist, 'index.html'), 'utf-8');
  const opts = { site, appTitle: ja.messages['title.main'], sub: ja.messages['title.sub'] };
  for (const c of released) {
    const text = ja.characters[c.id];
    const dir = join(dist, 't', c.id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), typePageHtml(template, { id: c.id, name: text.name, one: text.one }, opts));
  }
  return released.map((c) => c.id);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const ids = buildPages();
  console.log(`pages: ${ids.length} (dist/t/<id>/index.html)`);
}
