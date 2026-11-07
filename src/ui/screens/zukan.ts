// S5 図鑑（画面設計 8章、受け入れ基準 2.3）。公開中のキャラをグループごとに3列で並べる。
// 発見済みは絵＋名前で、押すと詳細。未発見は黒いシルエット＋「？？？」で、押しても開かない

import { track } from '../../analytics';
import { config, releasedCharacters, zukanCharacters } from '../../data';
import { charText, localeData, t } from '../../i18n';
import { foundCount, isFound } from '../../zukan';
import type { ScreenFactory } from '../app';
import { button, h } from '../dom';
import { characterArt } from '../character';
import { openDetail } from '../characterSections';
import { backButton } from '../parts';

export const zukanScreen: ScreenFactory = (app) => {
  const total = releasedCharacters.length;
  const count = foundCount();

  const card = (id: string): HTMLElement => {
    if (!isFound(id)) {
      return h('div', { className: 'zukan-card zukan-unknown' }, [
        characterArt(id, { silhouette: true, small: true }),
        h('p', { className: 'zukan-name', text: t('common.unknown') }),
      ]);
    }
    return h('button', { className: 'zukan-card', attrs: { type: 'button' }, on: { click: () => openDetail(app, id) } }, [
      characterArt(id, { small: true }),
      h('p', { className: 'zukan-name', text: charText(id).name }),
    ]);
  };

  // 公開中のキャラがいないグループは出さない
  const groups = config.zukanGroups
    .map((g) => [g, zukanCharacters.filter((c) => c.zukanGroup === g)] as const)
    .filter(([, list]) => list.length > 0);

  const el = h('main', { className: 'screen screen-zukan' }, [
    h('div', { className: 'top-bar top-bar-split' }, [backButton(() => history.back())]),
    h('h1', { className: 'zukan-heading', text: t('zukan.heading') }),
    h('p', {
      className: `zukan-count ${count === total ? 'zukan-complete' : ''}`.trim(),
      text: count === total ? t('zukan.complete', { total }) : t('zukan.count', { total, count }),
    }),
    ...groups.map(([g, list]) =>
      h('section', { className: 'zukan-group' }, [
        h('h2', { className: 'chip-group-name', text: localeData().zukanGroups[g] ?? g }),
        h('div', { className: 'zukan-grid' }, list.map((c) => card(c.id))),
      ]),
    ),
    button(
      t('title.start'),
      () => {
        track('start', { from: 'zukan' });
        app.go('input');
      },
      'btn btn-primary btn-big',
    ),
  ]);
  return { el };
};
