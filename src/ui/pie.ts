// 円グラフ（技術設計 1.2）。SVG のドーナツ形。0%の区分は描かない。
// 色だけに頼らないよう、凡例に区分名と%を出す（要件定義 5章）

import type { Portfolio } from '../core/metrics';
import { categories } from '../data';
import { categoryName, t } from '../i18n';
import { h } from './dom';
import { percent } from './parts';

const SVG_NS = 'http://www.w3.org/2000/svg';
const R = 38;
const WIDTH = 20;

function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

/** 0%より大きい区分（区分の並び順） */
export function slices(p: Portfolio): { id: string; color: string; value: number }[] {
  return categories.filter((c) => (p[c.id] ?? 0) > 0).map((c) => ({ id: c.id, color: c.color, value: p[c.id]! }));
}

/** ドーナツの絵だけ（演出・結果画像でも使う） */
export function pieSvg(p: Portfolio, size: number): SVGSVGElement {
  const root = svg('svg', { viewBox: '0 0 100 100', width: size, height: size, class: 'pie-svg', 'aria-hidden': 'true' });
  const g = svg('g', { transform: 'rotate(-90 50 50)' });
  let start = 0;
  for (const s of slices(p)) {
    g.append(
      svg('circle', {
        cx: 50,
        cy: 50,
        r: R,
        fill: 'none',
        stroke: s.color,
        'stroke-width': WIDTH,
        pathLength: 100,
        'stroke-dasharray': `${s.value} ${100 - s.value}`,
        'stroke-dashoffset': -start,
      }),
    );
    start += s.value;
  }
  root.append(g);
  return root;
}

/** 円グラフと凡例。update で描き直す */
export function createPie(p: Portfolio, size = 160): { el: HTMLElement; update(p: Portfolio): void } {
  const figure = h('figure', { className: 'pie', attrs: { role: 'img' } });
  const update = (next: Portfolio) => {
    const ss = slices(next);
    const legend = h(
      'ul',
      { className: 'pie-legend' },
      ss.map((s) =>
        h('li', {}, [
          h('span', { className: 'pie-dot', attrs: { style: `background:${s.color}` } }),
          h('span', { className: 'pie-name', text: categoryName(s.id) }),
          h('span', { className: 'pie-value', text: percent(s.value) }),
        ]),
      ),
    );
    figure.setAttribute('aria-label', `${t('pie.label')}: ${ss.map((s) => `${categoryName(s.id)} ${percent(s.value)}`).join(', ')}`);
    figure.replaceChildren(pieSvg(next, size), legend);
  };
  update(p);
  return { el: figure, update };
}
