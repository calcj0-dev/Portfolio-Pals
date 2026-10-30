import './style.css';
import { initAnalytics } from './analytics';
import { setLocale, t } from './i18n';
import { h } from './ui/dom';
import { APP_VERSION, formatVersion } from './version';

setLocale('ja');
initAnalytics();

// #1 の仮の画面。画面の切り替えは #4 以降で作る
const root = document.querySelector<HTMLElement>('#app');
if (root) {
  root.replaceChildren(
    h('main', { className: 'screen' }, [
      h('div', { className: 'top-bar' }, [h('span', { className: 'version', text: formatVersion(APP_VERSION) })]),
      h('h1', { className: 'title-main', text: t('title.main') }),
      h('p', { className: 'title-sub', text: t('title.sub') }),
      h('p', { className: 'title-sub', text: t('title.preparing') }),
    ]),
    h('footer', { className: 'disclaimer', text: t('common.disclaimer') }),
  );
}
