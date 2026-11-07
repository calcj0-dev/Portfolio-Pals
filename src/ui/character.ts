// キャラの絵（画面設計 9章）。public/chars/<タイプID>.webp を表示する。
// シルエットは同じ絵を CSS（filter: brightness(0)）で黒くする。絵がまだないときは丸い仮の形を出す。
// タイトル・図鑑・相性など小さく出すところは、小さい版（<タイプID>-256.webp）を使う（最初に読み込む量を減らす）

import { characterById } from '../data';
import { charText, t } from '../i18n';
import { h } from './dom';

/** 小さい版の絵のパス（tools/art/process.py が作る） */
export function smallImage(image: string): string {
  return image.replace(/\.webp$/, '-256.webp');
}

export function characterArt(id: string, opts: { silhouette?: boolean; className?: string; eager?: boolean; small?: boolean } = {}): HTMLElement {
  const def = characterById(id);
  const wrap = h('div', { className: `char-art ${opts.silhouette ? 'silhouette' : ''} ${opts.className ?? ''}`.trim() });
  if (!def) return wrap;
  const img = h('img', {
    attrs: {
      src: opts.small ? smallImage(def.image) : def.image,
      alt: opts.silhouette ? t('common.unknown') : charText(id).name,
      width: '240',
      height: '240',
      decoding: 'async',
      loading: opts.eager ? 'eager' : 'lazy',
      draggable: 'false',
    },
  });
  img.addEventListener('error', () => wrap.classList.add('missing'), { once: true });
  wrap.append(img);
  return wrap;
}
