// キャラの絵（画面設計 9章）。public/chars/<タイプID>.svg を表示する。
// シルエットは同じ絵を CSS（filter: brightness(0)）で黒くする。絵がまだないときは丸い仮の形を出す

import { characterById } from '../data';
import { charText, t } from '../i18n';
import { h } from './dom';

export function characterArt(id: string, opts: { silhouette?: boolean; className?: string } = {}): HTMLElement {
  const def = characterById(id);
  const wrap = h('div', { className: `char-art ${opts.silhouette ? 'silhouette' : ''} ${opts.className ?? ''}`.trim() });
  if (!def) return wrap;
  const img = h('img', {
    attrs: {
      src: def.image,
      alt: opts.silhouette ? t('common.unknown') : charText(id).name,
      width: '240',
      height: '240',
      decoding: 'async',
      loading: 'lazy',
      draggable: 'false',
    },
  });
  img.addEventListener('error', () => wrap.classList.add('missing'), { once: true });
  wrap.append(img);
  return wrap;
}
