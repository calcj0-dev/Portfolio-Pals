import './style.css';
import { initAnalytics, track } from './analytics';
import { fromValues } from './core/portfolio';
import { config, inputRules } from './data';
import { setLocale } from './i18n';
import { sharedTypeOfPage } from './share/appType';
import { createApp, type ModalName, type ScreenName } from './ui/app';
import { modals } from './ui/modals';
import { disclaimer } from './ui/parts';
import { unlockAudio } from './audio';
import { detailScreen } from './ui/screens/detail';
import { diagnosingScreen } from './ui/screens/diagnosing';
import { inputScreen } from './ui/screens/input';
import { resultScreen } from './ui/screens/result';
import { sharedScreen } from './ui/screens/shared';
import { titleScreen } from './ui/screens/title';
import { zukanScreen } from './ui/screens/zukan';
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
      zukan: zukanScreen,
      detail: detailScreen,
      shared: sharedScreen,
    },
    modals,
    disclaimer(),
  );
  // /t/<タイプID>/ で開いたら、最初にそのキャラの紹介（S7）を出す。発見には数えない
  const sharedType = sharedTypeOfPage();
  if (sharedType) {
    session.sharedType = sharedType;
    track('shared_view', { type: sharedType });
    app.go('shared');
  } else {
    app.go('title');
  }

  // 開発用：?screen=result&type=monk&preset=world100 のように画面を直接開く（公開版では無視する）。
  // found=monk,owl で発見の記録を置き換える。modal=image で重ね表示を開く。
  // values=us:60,gold:10 で割合を入れる（残りは現金・預金）。pie=1 で結果画像の円グラフをオンにして開く
  if (import.meta.env.DEV) {
    const q = new URLSearchParams(location.search);
    const preset = config.presets.find((p) => p.id === q.get('preset'));
    if (preset) session.input = fromValues(preset.values, inputRules);
    const values = q.get('values');
    if (values) {
      session.input = fromValues(
        Object.fromEntries(values.split(',').map((kv) => [kv.split(':')[0]!, Number(kv.split(':')[1])])),
        inputRules,
      );
    }
    if (q.get('type')) session.resultType = session.detailType = session.sharedType = q.get('type');
    const found = q.get('found');
    if (found !== null) localStorage.setItem('baka017.found', JSON.stringify(found.split(',').filter(Boolean)));
    const screen = q.get('screen') as ScreenName | null;
    if (screen) app.go(screen);
    const modal = q.get('modal') as ModalName | null;
    if (modal) app.openModal(modal);
  }
}
