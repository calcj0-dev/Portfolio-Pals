// 結果（S4）と詳細（S6）に共通の中身：性格・あるある・相性・格言（画面設計 7章・8章）

import { characterById } from '../data';
import { charText, t } from '../i18n';
import { isFound } from '../zukan';
import type { App } from './app';
import { h } from './dom';
import { characterArt } from './character';
import { session } from './session';

/** 詳細（S6）を開く。発見済みのキャラだけを渡す */
export function openDetail(app: App, id: string): void {
  session.detailType = id;
  app.go('detail');
}

const list = (items: string[]) => h('ul', { className: 'bullets' }, items.map((x) => h('li', { text: x })));

export const section = (heading: string, body: (HTMLElement | null)[]) =>
  h('section', { className: 'result-section' }, [h('h2', { className: 'result-h', text: heading }), ...body]);

/** 相性の1行。発見済みなら絵＋名前で、押すと詳細を開く。未発見なら「？？？」＋理由だけ（決定 #22） */
function compatRow(app: App, mark: string, otherId: string, why: string): HTMLElement {
  const found = isFound(otherId);
  const children = [
    h('span', { className: 'compat-mark', text: mark, attrs: { 'aria-hidden': 'true' } }),
    characterArt(otherId, { silhouette: !found, className: 'compat-art' }),
    h('div', { className: 'compat-text' }, [
      h('p', { className: 'compat-name', text: found ? charText(otherId).name : t('common.unknown') }),
      h('p', { className: 'compat-why', text: why }),
    ]),
  ];
  if (!found) return h('div', { className: 'compat compat-unknown' }, children);
  return h('button', { className: 'compat compat-open', attrs: { type: 'button' }, on: { click: () => openDetail(app, otherId) } }, children);
}

/** 性格・あるある・相性・格言 */
export function characterSections(app: App, type: string): HTMLElement[] {
  const def = characterById(type)!;
  const c = charText(type);
  return [
    section(t('result.traits'), [list(c.traits)]),
    section(t('result.aruaru'), [list(c.aruaru)]),
    section(t('result.compat'), [
      compatRow(app, t('result.goodMark'), def.good, c.goodWhy),
      compatRow(app, t('result.badMark'), def.bad, c.badWhy),
    ]),
    section(t('result.proverb'), [h('p', { className: 'proverb', text: t('common.quote', { text: c.proverb }) })]),
  ];
}
