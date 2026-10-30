// 画面の切り替えと重ね表示（画面設計 2章、技術設計 4章）。ページの読み込みは起こさない。
// ブラウザの「戻る」に対応するため、画面ごとに history を1つ積む

export type ScreenName = 'title' | 'input' | 'diagnosing' | 'result' | 'zukan' | 'detail' | 'shared';
export type ModalName = 'help';

export type GoOptions = {
  /** 今の履歴を置き換える（演出→結果のように「戻る」で戻したくないとき） */
  replace?: boolean;
};

export type App = {
  go(screen: ScreenName, opts?: GoOptions): void;
  openModal(modal: ModalName): void;
  closeModal(): void;
  readonly screen: ScreenName;
};

export type ScreenView = { el: HTMLElement; unmount?: () => void };
export type ScreenFactory = (app: App) => ScreenView;
export type ModalFactory = (app: App) => HTMLElement;

/** 「戻る」で戻ったときに、そのまま出してよい画面（演出の途中には戻らない） */
const RESTORABLE: ReadonlySet<ScreenName> = new Set(['title', 'input', 'result', 'zukan', 'detail', 'shared']);

export function createApp(
  root: HTMLElement,
  screens: Record<ScreenName, ScreenFactory>,
  modals: Record<ModalName, ModalFactory>,
  footer: HTMLElement,
): App {
  const main = document.createElement('div');
  main.className = 'screen-host';
  const dialog = document.createElement('dialog');
  dialog.className = 'modal';
  root.replaceChildren(main, footer, dialog);

  let current: ScreenView | null = null;
  let screenName: ScreenName = 'title';

  const render = (next: ScreenName) => {
    if (dialog.open) dialog.close();
    current?.unmount?.();
    screenName = next;
    current = screens[next](app);
    main.replaceChildren(current.el);
    main.dataset.screen = next;
    window.scrollTo(0, 0);
  };

  const app: App = {
    get screen() {
      return screenName;
    },
    go(next, opts = {}) {
      const state = { screen: next };
      try {
        if (opts.replace || history.state === null) history.replaceState(state, '');
        else history.pushState(state, '');
      } catch {
        // 履歴が使えなくても画面は切り替える
      }
      render(next);
    },
    openModal(name) {
      dialog.replaceChildren(modals[name](app));
      dialog.dataset.modal = name;
      if (!dialog.open) dialog.showModal();
    },
    closeModal() {
      if (dialog.open) dialog.close();
    },
  };

  window.addEventListener('popstate', (e) => {
    const s = (e.state as { screen?: ScreenName } | null)?.screen;
    render(s && RESTORABLE.has(s) ? s : 'title');
  });

  // 外側（背景）を押したら閉じる
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) app.closeModal();
  });

  return app;
}
