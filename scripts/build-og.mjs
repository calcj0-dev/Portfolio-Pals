// OGP 画像（技術設計 6.1、T-13）。1200×630 の SVG にキャラの絵・タイプ名・一言・作品名を入れ、resvg で PNG にする。
// 出力：dist/og/<タイプID>.png（タイプごと）と dist/og-default.png（タイトル用）。
// 文字は同梱のフォント（scripts/fonts/ の Zen Maru Gothic。OFL）だけを使う（ビルドする環境で見た目が変わらないように）

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import { DIST, loadData } from './lib.mjs';

export const OG_W = 1200;
export const OG_H = 630;

const FONT = 'Zen Maru Gothic';
const FONT_FILES = ['ZenMaruGothic-Bold.ttf', 'ZenMaruGothic-Medium.ttf'].map((f) =>
  fileURLToPath(new URL(`./fonts/${f}`, import.meta.url)),
);
// 画面の色（画面設計 3章・style.css）に合わせる
const COLOR = { bg: '#FFFDF8', text: '#3A3340', sub: '#7A7280', primary: '#FF8FA3', circle: '#FFE6EA' };

const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** 文字の幅の見積もり（全角を1、半角を0.55。フォントの実測はしない） */
export function textWidth(s, size) {
  let w = 0;
  for (const ch of s) w += /[\x20-\x7e]/.test(ch) ? 0.55 : 1;
  return w * size;
}

const kind = (ch) =>
  /[ぁ-ゖ]/.test(ch) ? 'hira' : /[ァ-ヺー]/.test(ch) ? 'kata' : /[一-龯々]/.test(ch) ? 'kanji' : 'other';

/**
 * 折り返してよい位置（その文字の前で改行する）。
 * 「の」のあと、または漢字・カタカナ・開きかっこの前（ひらがなの前では切らない＝助詞を行頭にしない）
 */
function breakPoints(chars) {
  const out = [];
  for (let i = 1; i < chars.length; i++) {
    const prev = chars[i - 1];
    const next = chars[i];
    if (/[「（]/.test(prev) || /[」）、。ー]/.test(next)) continue;
    if (prev === 'の' || (kind(prev) !== kind(next) && kind(next) !== 'hira')) out.push(i);
  }
  return out;
}

/** 1〜2行に折り返す。2行でも入らなければ文字を小さくする */
export function wrap(text, size, maxW) {
  if (textWidth(text, size) <= maxW) return { lines: [text], size };
  const chars = [...text];
  let best = null;
  for (const i of breakPoints(chars)) {
    const lines = [chars.slice(0, i).join(''), chars.slice(i).join('')];
    const w = Math.max(...lines.map((l) => textWidth(l, size)));
    if (!best || w < best.w) best = { lines, w };
  }
  if (!best) {
    // 切れる位置がなければ真ん中で切る
    const mid = Math.ceil(chars.length / 2);
    const lines = [chars.slice(0, mid).join(''), chars.slice(mid).join('')];
    best = { lines, w: Math.max(...lines.map((l) => textWidth(l, size))) };
  }
  return { lines: best.lines, size: best.w > maxW ? Math.floor((size * maxW) / best.w) : size };
}

const pngDataUrl = (file) => `data:image/png;base64,${readFileSync(file).toString('base64')}`;
const artFile = (id) => fileURLToPath(new URL(`../art/png/${id}.png`, import.meta.url));

function textLines(lines, { x, y, size, weight, color, anchor = 'start', lineHeight = 1.3 }) {
  return lines
    .map(
      (l, i) =>
        `<text x="${x}" y="${y + i * size * lineHeight}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${escapeXml(l)}</text>`,
    )
    .join('\n');
}

/** タイプごとの画像の SVG */
export function typeSvg({ id, name, one }, { appTitle, sub }) {
  const x = 620;
  const maxW = 1140 - x;
  const nameW = wrap(name, 64, maxW);
  // 一言は「」を付けてから折り返す
  const oneW = wrap(`「${one}」`, 34, maxW);

  // 上から：作品名のラベル → タイプ名 → 一言。縦の真ん中にそろえる
  const labelH = 52;
  const nameH = nameW.lines.length * nameW.size * 1.3;
  const oneH = oneW.lines.length * oneW.size * 1.4;
  const gap1 = 36;
  const gap2 = 24;
  const top = Math.round((OG_H - (labelH + gap1 + nameH + gap2 + oneH)) / 2);
  const labelW = Math.round(textWidth(appTitle, 28) + 48);
  const nameY = top + labelH + gap1 + nameW.size;
  const oneY = nameY + (nameW.lines.length - 1) * nameW.size * 1.3 + gap2 + oneW.size * 1.15;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}" viewBox="0 0 ${OG_W} ${OG_H}">
<rect width="${OG_W}" height="${OG_H}" fill="${COLOR.bg}"/>
<circle cx="320" cy="330" r="250" fill="${COLOR.circle}"/>
<image href="${pngDataUrl(artFile(id))}" x="70" y="70" width="500" height="500"/>
<rect x="${x}" y="${top}" width="${labelW}" height="${labelH}" rx="${labelH / 2}" fill="${COLOR.primary}"/>
${textLines([appTitle], { x: x + 24, y: top + 36, size: 28, weight: 700, color: COLOR.text })}
${textLines(nameW.lines, { x, y: nameY, size: nameW.size, weight: 700, color: COLOR.text })}
${textLines(oneW.lines, { x, y: oneY, size: oneW.size, weight: 500, color: COLOR.sub, lineHeight: 1.4 })}
<text x="1140" y="600" font-family="${FONT}" font-size="22" font-weight="500" fill="${COLOR.sub}" text-anchor="end">${escapeXml(sub)}</text>
</svg>`;
}

/** タイトル用の画像の SVG（タイトル画面と同じキャラを並べる） */
export function defaultSvg(ids, { appTitle, sub }) {
  const size = 180;
  const gap = Math.floor((OG_W - 60 - ids.length * size) / Math.max(1, ids.length - 1));
  const arts = ids
    .map((id, i) => `<image href="${pngDataUrl(artFile(id))}" x="${30 + i * (size + gap)}" y="370" width="${size}" height="${size}"/>`)
    .join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}" viewBox="0 0 ${OG_W} ${OG_H}">
<rect width="${OG_W}" height="${OG_H}" fill="${COLOR.bg}"/>
<ellipse cx="600" cy="540" rx="560" ry="70" fill="${COLOR.circle}"/>
${textLines([appTitle], { x: 600, y: 200, size: 96, weight: 700, color: COLOR.text, anchor: 'middle' })}
${textLines([sub], { x: 600, y: 290, size: 40, weight: 500, color: COLOR.sub, anchor: 'middle' })}
${arts}
</svg>`;
}

export function renderPng(svg) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: OG_W },
    font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: FONT },
  });
  return resvg.render().asPng();
}

/** 全部の画像を作る。作ったファイル名を返す */
export function buildOg(dist = DIST) {
  const { released, config, ja } = loadData();
  const opts = { appTitle: ja.messages['title.main'], sub: ja.messages['title.sub'] };
  mkdirSync(join(dist, 'og'), { recursive: true });
  const files = [];
  for (const c of released) {
    const text = ja.characters[c.id];
    writeFileSync(join(dist, c.og), renderPng(typeSvg({ id: c.id, name: text.name, one: text.one }, opts)));
    files.push(c.og);
  }
  writeFileSync(join(dist, 'og-default.png'), renderPng(defaultSvg(config.titleCharacters, opts)));
  files.push('og-default.png');
  return files;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const files = buildOg();
  console.log(`og: ${files.length} images (dist/og/*.png, dist/og-default.png)`);
}
