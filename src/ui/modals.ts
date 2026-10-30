// 重ね表示（画面設計 1章）。M2 迷いやすいものの入れ方。M1・M3 はあとで足す

import { localeData, t } from '../i18n';
import type { ModalFactory, ModalName } from './app';
import { button, h } from './dom';

const panel = (heading: string, body: (HTMLElement | null)[], footer: HTMLElement[]) =>
  h('div', { className: 'modal-panel' }, [
    h('h2', { className: 'heading', text: heading }),
    h('div', { className: 'modal-body' }, body),
    h('div', { className: 'modal-actions' }, footer),
  ]);

const help: ModalFactory = (app) =>
  panel(
    t('help.heading'),
    [
      h('table', { className: 'help-table' }, [
        h('thead', {}, [h('tr', {}, [h('th', { text: t('help.item') }), h('th', { text: t('help.to') })])]),
        h(
          'tbody',
          {},
          localeData().help.map((x) => h('tr', {}, [h('td', { text: x.item }), h('td', { text: x.to })])),
        ),
      ]),
      h('p', { className: 'note', text: t('help.note') }),
    ],
    [button(t('common.close'), () => app.closeModal(), 'btn')],
  );

export const modals: Record<ModalName, ModalFactory> = { help };
