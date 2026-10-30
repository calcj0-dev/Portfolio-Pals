import './style.css';
import { initAnalytics } from './analytics';
import { fromValues } from './core/portfolio';
import { config, inputRules } from './data';
import { setLocale } from './i18n';
import { createApp, type ScreenName } from './ui/app';
import { modals } from './ui/modals';
import { disclaimer } from './ui/parts';
import { unlockAudio } from './audio';
import { diagnosingScreen } from './ui/screens/diagnosing';
import { inputScreen } from './ui/screens/input';
import { preparingScreen } from './ui/screens/preparing';
import { resultScreen } from './ui/screens/result';
import { titleScreen } from './ui/screens/title';
import { session } from './ui/session';

setLocale('ja');
initAnalytics();
// iOS では利用者が触ったときに音を鳴らせるようにする（技術設計 11章）
document.addEventListener('pointerdown', unlockAudio, { capture: true });
document.addEventListener('keydown', unlockAudio, { capture: true });

const root = document.querySelector<HTMLElement>('#app');
if (root) {
  const app = createApp(
    root,
    {
      title: titleScreen,
      input: inputScreen,
      diagnosing: diagnosingScreen,
      result: resultScreen,
      zukan: preparingScreen,
      detail: preparingScreen,
      shared: preparingScreen,
    },
    modals,
    disclaimer(),
  );
  app.go('title');

  // 開発用：?screen=result&type=monk&preset=world100 のように画面を直接開く（公開版では無視する）
  if (import.meta.env.DEV) {
    const q = new URLSearchParams(location.search);
    const preset = config.presets.find((p) => p.id === q.get('preset'));
    if (preset) session.input = fromValues(preset.values, inputRules);
    if (q.get('type')) session.resultType = q.get('type');
    const screen = q.get('screen') as ScreenName | null;
    if (screen) app.go(screen);
  }
}
