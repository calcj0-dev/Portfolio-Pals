// S1 タイトル（画面設計 4章）

import { track } from '../../analytics';
import { config, releasedCharacters } from '../../data';
import { t } from '../../i18n';
import { foundBucketNow, foundCount } from '../../zukan';
import type { ScreenFactory } from '../app';
import { button, externalLink, h } from '../dom';
import { characterArt } from '../character';
import { soundButton, versionLabel } from '../parts';

export const titleScreen: ScreenFactory = (app) => {
  const sound = soundButton();
  const el = h('main', { className: 'screen screen-title' }, [
    h('div', { className: 'top-bar' }, [versionLabel(), sound.el]),
    // キャラの名前は出さない（案A）。絵は飾りなので読み上げない
    h(
      'div',
      { className: 'title-art', attrs: { 'aria-hidden': 'true' } },
      config.titleCharacters.map((id) => characterArt(id, { className: 'title-char', eager: true })),
    ),
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
    button(
      t('title.zukan', { total: releasedCharacters.length, count: foundCount() }),
      () => {
        track('zukan_open', { from: 'title', found: foundBucketNow() });
        app.go('zukan');
      },
      'link',
    ),
    h('p', { className: 'small', text: t('title.safe') }),
    externalLink(t('title.credit'), config.links.follow),
    button(t('title.privacy'), () => app.openModal('privacy'), 'link'),
  ]);
  return { el, unmount: sound.dispose };
};
