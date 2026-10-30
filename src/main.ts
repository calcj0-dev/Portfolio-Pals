import './style.css';
import { initAnalytics } from './analytics';
import { setLocale } from './i18n';
import { createApp, type ScreenName } from './ui/app';
import { modals } from './ui/modals';
import { disclaimer } from './ui/parts';
import { inputScreen } from './ui/screens/input';
import { preparingScreen } from './ui/screens/preparing';
import { titleScreen } from './ui/screens/title';

setLocale('ja');
initAnalytics();

const root = document.querySelector<HTMLElement>('#app');
if (root) {
  const app = createApp(
    root,
    {
      title: titleScreen,
      input: inputScreen,
      diagnosing: preparingScreen,
      result: preparingScreen,
      zukan: preparingScreen,
      detail: preparingScreen,
      shared: preparingScreen,
    },
    modals,
    disclaimer(),
  );
  app.go('title');

  // 開発用：?screen=input のように画面を直接開く（公開版では無視する）
  if (import.meta.env.DEV) {
    const screen = new URLSearchParams(location.search).get('screen') as ScreenName | null;
    if (screen) app.go(screen);
  }
}
