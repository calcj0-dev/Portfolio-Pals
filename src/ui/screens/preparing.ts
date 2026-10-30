// まだ作っていない画面の仮の中身（作り終えたら消す）

import { t } from '../../i18n';
import type { ScreenFactory } from '../app';
import { h } from '../dom';
import { backButton } from '../parts';

export const preparingScreen: ScreenFactory = () => ({
  el: h('main', { className: 'screen' }, [
    h('div', { className: 'top-bar top-bar-split' }, [backButton(() => history.back())]),
    h('p', { className: 'title-sub', text: t('title.preparing') }),
  ]),
});
