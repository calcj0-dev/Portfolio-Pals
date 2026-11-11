// S6 キャラの詳細（画面設計 8章）。結果画面の「キャラ〜格言」と同じ中身で、円グラフ・シェアはなし

import { characterById } from '../../data';
import { charText, t } from '../../i18n';
import { isFound } from '../../zukan';
import type { ScreenFactory } from '../app';
import { button, h } from '../dom';
import { characterArt } from '../character';
import { characterSections } from '../characterSections';
import { backButton, homeButton } from '../parts';
import { session } from '../session';

export const detailScreen: ScreenFactory = (app) => {
  const type = session.detailType;
  // 未発見・未公開のキャラは開かない（再読み込みで中身がないときも図鑑へ）
  if (!type || !characterById(type)?.released || !isFound(type)) {
    queueMicrotask(() => app.go('zukan', { replace: true }));
    return { el: h('main', { className: 'screen' }) };
  }
  const c = charText(type);

  const el = h('main', { className: 'screen screen-detail' }, [
    h('div', { className: 'top-bar top-bar-split' }, [backButton(() => history.back()), homeButton(() => app.go('title'))]),
    h('div', { className: 'result-hero' }, [
      characterArt(type, { className: 'result-art', eager: true }),
      h('h1', { className: 'result-name', text: c.name }),
      h('p', { className: 'result-one', text: t('common.quote', { text: c.one }) }),
    ]),
    h('div', { className: 'card result-body' }, characterSections(app, type)),
    button(t('detail.backToZukan'), () => app.go('zukan'), 'btn btn-secondary'),
  ]);
  return { el };
};
