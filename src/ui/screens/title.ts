// S1 タイトル（画面設計 4章）。キャラの絵・図鑑・プライバシーはあとで足す

import { track } from '../../analytics';
import { t } from '../../i18n';
import type { ScreenFactory } from '../app';
import { button, h } from '../dom';
import { soundButton, versionLabel } from '../parts';

export const titleScreen: ScreenFactory = (app) => {
  const sound = soundButton();
  const el = h('main', { className: 'screen screen-title' }, [
    h('div', { className: 'top-bar' }, [versionLabel(), sound.el]),
    h('div', { className: 'title-art', attrs: { 'aria-hidden': 'true' } }),
    h('h1', { className: 'title-main', text: t('title.main') }),
    h('p', { className: 'title-sub', text: t('title.sub') }),
    button(
      t('title.start'),
      () => {
        track('start', { from: 'title' });
        app.go('input');
      },
      'btn btn-primary btn-big',
    ),
    h('p', { className: 'small', text: t('title.safe') }),
    h('p', { className: 'small', text: t('title.credit') }),
  ]);
  return { el, unmount: sound.dispose };
};
