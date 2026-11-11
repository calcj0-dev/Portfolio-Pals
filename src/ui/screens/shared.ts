// S7 シェアURLで開いたとき（画面設計 11章）。シェアした人のキャラの紹介と「あなたも診断する」。
// 相性は出さない（相手のキャラのネタばれを減らすため）。このキャラは発見に数えない（T-10）

import { track } from '../../analytics';
import { characterById } from '../../data';
import { charText, t } from '../../i18n';
import { foundBucketNow } from '../../zukan';
import type { ScreenFactory } from '../app';
import { button, h } from '../dom';
import { characterArt } from '../character';
import { characterSections } from '../characterSections';
import { homeButton } from '../parts';
import { session } from '../session';

export const sharedScreen: ScreenFactory = (app) => {
  const type = session.sharedType;
  if (!type || !characterById(type)?.released) {
    queueMicrotask(() => app.go('title', { replace: true }));
    return { el: h('main', { className: 'screen' }) };
  }
  const c = charText(type);

  const el = h('main', { className: 'screen screen-shared' }, [
    h('div', { className: 'top-bar top-bar-split' }, [h('p', { className: 'shared-app', text: t('title.main') }), homeButton(() => app.go('title'))]),
    h('p', { className: 'result-lead shared-lead', text: t('shared.lead') }),
    h('div', { className: 'result-hero' }, [
      characterArt(type, { className: 'result-art', eager: true }),
      h('h1', { className: 'result-name', text: c.name }),
      h('p', { className: 'result-one', text: t('common.quote', { text: c.one }) }),
    ]),
    h('div', { className: 'card result-body' }, characterSections(app, type, { compat: false })),
    button(
      t('shared.start'),
      () => {
        track('start', { from: 'shared' });
        app.go('input');
      },
      'btn btn-primary btn-big',
    ),
    h('div', { className: 'result-links' }, [
      button(
        t('result.zukan'),
        () => {
          track('zukan_open', { from: 'shared', found: foundBucketNow() });
          app.go('zukan');
        },
        'link',
      ),
    ]),
  ]);
  return { el };
};
