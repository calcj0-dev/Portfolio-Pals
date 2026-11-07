// 結果画像 1200×630（技術設計 8章）。画面に出さない Canvas に描いて PNG にする。
// 円グラフは「円グラフを載せる」がオンのときだけ入れる（入力した割合が画像に入るのは、利用者が選んだときだけ）

import type { Portfolio } from '../core/metrics';
import { characterById, siteUrl } from '../data';
import { categoryName, charText, t } from '../i18n';
import { slices } from '../ui/pie';
import { wrapText } from './lineBreak';

const W = 1200;
const H = 630;
const FONT = 'system-ui, "Hiragino Maru Gothic ProN", "Hiragino Sans", "Noto Sans JP", sans-serif';
// 画面の色（style.css）に合わせる
const COLOR = { bg: '#FFFDF8', text: '#3A3340', sub: '#7A7280', circle: '#FFE6EA', line: '#EDE5DA' };

const X = 620;
const RIGHT = W - 40;
const MAX_W = RIGHT - X;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** 2行までに折り返し、入らなければ文字を小さくする。決まった大きさを返す */
function fitLines(ctx: CanvasRenderingContext2D, text: string, size: number, weight: number, min: number): { lines: string[]; size: number } {
  for (let s = size; ; s -= 2) {
    ctx.font = `${weight} ${s}px ${FONT}`;
    const lines = wrapText(text, MAX_W, (x) => ctx.measureText(x).width);
    if (s <= min || Math.max(...lines.map((l) => ctx.measureText(l).width)) <= MAX_W) return { lines, size: s };
  }
}

function drawPie(ctx: CanvasRenderingContext2D, p: Portfolio, cx: number, cy: number, r: number, width: number): void {
  let start = -Math.PI / 2;
  ctx.lineWidth = width;
  for (const s of slices(p)) {
    const end = start + (Math.PI * 2 * s.value) / 100;
    ctx.beginPath();
    ctx.strokeStyle = s.color;
    ctx.arc(cx, cy, r, start, end);
    ctx.stroke();
    start = end;
  }
}

async function renderResultImage(type: string, portfolio: Portfolio, withPie: boolean): Promise<Blob | null> {
  const def = characterById(type);
  if (!def) return null;
  try {
    await document.fonts?.ready;
  } catch {
    // フォントの読み込みを待てなくても描く
  }
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const c = charText(type);

  ctx.fillStyle = COLOR.bg;
  ctx.fillRect(0, 0, W, H);

  // 左：キャラの絵（大）
  ctx.fillStyle = COLOR.circle;
  ctx.beginPath();
  ctx.arc(320, 290, 235, 0, Math.PI * 2);
  ctx.fill();
  const art = await loadImage(def.image);
  if (art) ctx.drawImage(art, 90, 60, 460, 460);

  // 右：見出し → タイプ名 → 一言 →（オンなら）円グラフと上位3区分。縦の真ん中にそろえる
  const name = fitLines(ctx, c.name, 60, 700, 36);
  const one = fitLines(ctx, t('common.quote', { text: c.one }), 32, 500, 22);
  const top3 = withPie ? [...slices(portfolio)].sort((a, b) => b.value - a.value).slice(0, 3) : [];
  const PIE = 150;
  const blocks = [36, name.lines.length * name.size * 1.25, 16, one.lines.length * one.size * 1.4, withPie ? 28 + PIE : 0];
  let y = Math.round(40 + (500 - blocks.reduce((a, b) => a + b, 0)) / 2);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = COLOR.sub;
  ctx.font = `700 26px ${FONT}`;
  ctx.fillText(t('result.heading'), X, y);
  y += blocks[0]!;

  ctx.fillStyle = COLOR.text;
  ctx.font = `700 ${name.size}px ${FONT}`;
  for (const l of name.lines) {
    ctx.fillText(l, X, y);
    y += name.size * 1.25;
  }
  y += blocks[2]!;

  ctx.fillStyle = COLOR.sub;
  ctx.font = `500 ${one.size}px ${FONT}`;
  for (const l of one.lines) {
    ctx.fillText(l, X, y);
    y += one.size * 1.4;
  }

  if (withPie) {
    y += 28;
    drawPie(ctx, portfolio, X + PIE / 2, y + PIE / 2, PIE / 2 - 18, 34);
    const lx = X + PIE + 32;
    const rowH = 40;
    let ly = y + PIE / 2 - (top3.length * rowH) / 2;
    ctx.textBaseline = 'middle';
    for (const s of top3) {
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(lx + 10, ly + rowH / 2, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLOR.text;
      ctx.font = `500 26px ${FONT}`;
      ctx.fillText(categoryName(s.id), lx + 32, ly + rowH / 2);
      ctx.textAlign = 'right';
      ctx.font = `700 26px ${FONT}`;
      ctx.fillText(t('common.percent', { value: s.value }), RIGHT, ly + rowH / 2);
      ctx.textAlign = 'left';
      ly += rowH;
    }
  }

  // 下：作品名・URL・免責
  ctx.fillStyle = COLOR.line;
  ctx.fillRect(40, 548, W - 80, 2);
  ctx.textBaseline = 'middle';
  ctx.fillStyle = COLOR.text;
  ctx.font = `700 30px ${FONT}`;
  ctx.fillText(t('title.main'), 40, 588);
  const titleW = ctx.measureText(t('title.main')).width;
  ctx.fillStyle = COLOR.sub;
  ctx.font = `500 20px ${FONT}`;
  ctx.fillText(siteUrl().replace(/^https?:\/\//, '').replace(/\/$/, ''), 40 + titleW + 18, 590);
  ctx.textAlign = 'right';
  ctx.fillText(t('common.disclaimer'), RIGHT, 590);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}

const cache = new Map<string, Promise<Blob | null>>();

/**
 * 結果画像。同じ結果・同じスイッチなら作り直さない（結果画面を開いたときに作り始め、シェアのときにすぐ使えるようにする）。
 * 覚えておくのはメモリの中だけで、端末には保存しない
 */
export function resultImage(type: string, portfolio: Portfolio, withPie: boolean): Promise<Blob | null> {
  const key = `${type}|${withPie}|${JSON.stringify(portfolio)}`;
  let p = cache.get(key);
  if (!p) {
    p = renderResultImage(type, portfolio, withPie);
    cache.set(key, p);
    // 古いものから捨てる（もう一回を繰り返してもふくらまないように）
    while (cache.size > 4) cache.delete(cache.keys().next().value!);
  }
  return p;
}
