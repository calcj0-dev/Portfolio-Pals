// 重ね表示（画面設計 1章）。M1 結果画像のプレビュー、M2 迷いやすいものの入れ方、M3 プライバシーについて

import { gaId, track } from '../analytics';
import { toPortfolio } from '../core/portfolio';
import { config, inputRules } from '../data';
import { localeData, t } from '../i18n';
import { postText } from '../share/postText';
import { resultImage } from '../share/resultImage';
import { openXIntent, preferWebShare, saveImage, shareWithImage, toDataUrl } from '../share/share';
import type { ModalFactory, ModalName } from './app';
import { button, externalLink, h } from './dom';
import { session } from './session';

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

/**
 * M1 結果画像のプレビュー（画面設計 10章）。「円グラフを載せる」は最初はオフで、切り替えるとすぐ描き直す。
 * 「画像を付けてシェア」は Web Share が使えるスマホだけ
 */
const image: ModalFactory = (app) => {
  const type = session.resultType;
  const portfolio = toPortfolio(session.input, inputRules);
  const img = h('img', { className: 'image-preview', attrs: { alt: t('image.alt') } });
  const pieSwitch = h('input', { className: 'switch', attrs: { type: 'checkbox', role: 'switch' } });
  const pie = () => (pieSwitch.checked ? 'on' : 'off');
  let blob: Blob | null = null;

  const shareBtn = button(
    t('image.shareWithImage'),
    () => {
      if (!blob || !type) return;
      track('share_click', { method: 'web_share', pie: pie(), type });
      void shareWithImage(postText(type), type, blob).then((r) => {
        if (r === 'failed') openXIntent(postText(type), type);
      });
    },
    'btn btn-primary',
  );
  const saveBtn = button(
    t('image.save'),
    () => {
      if (!blob || !type) return;
      track('share_click', { method: 'save_image', pie: pie(), type });
      void saveImage(blob);
    },
    'link',
  );
  shareBtn.hidden = true;
  saveBtn.disabled = true;

  // 切り替えが続いても、最後に頼んだ画像だけを出す
  let request = 0;
  const draw = () => {
    if (!type) return;
    const mine = ++request;
    saveBtn.disabled = true;
    void resultImage(type, portfolio, pieSwitch.checked).then(async (b) => {
      if (mine !== request || !b) return;
      blob = b;
      shareBtn.hidden = !preferWebShare(b);
      saveBtn.disabled = false;
      img.src = await toDataUrl(b);
    });
  };
  pieSwitch.addEventListener('change', draw);
  draw();

  return panel(
    t('image.heading'),
    [
      img,
      h('label', { className: 'switch-row' }, [h('span', { text: t('image.pie') }), pieSwitch]),
      h('p', { className: 'note', text: t('image.longPress') }),
    ],
    [shareBtn, saveBtn, button(t('common.close'), () => app.closeModal(), 'btn')],
  );
};

/** M3 プライバシーについて（技術設計 7.3）。GA4 を入れているか（測定IDがあるか）で文言を切り替える */
const privacy: ModalFactory = (app) => {
  const p = (text: string) => h('p', { text });
  const link = (text: string, href: string) => h('p', {}, [externalLink(text, href)]);
  const body = gaId()
    ? [
        p(t('privacy.ga.p1')),
        p(t('privacy.ga.p2')),
        p(t('privacy.ga.p3')),
        p(t('privacy.image')),
        p(t('privacy.storage')),
        p(t('privacy.ga.optout')),
        link(t('privacy.googlePolicy'), config.links.googlePrivacy),
        link(t('privacy.optoutLink'), config.links.gaOptout),
        link(t('privacy.vercelPolicy'), config.links.vercelPrivacy),
      ]
    : [
        p(t('privacy.basic.p1')),
        p(t('privacy.basic.p2')),
        p(t('privacy.basic.p3')),
        p(t('privacy.image')),
        p(t('privacy.storage')),
        link(t('privacy.vercelPolicy'), config.links.vercelPrivacy),
      ];
  return panel(t('privacy.heading'), body, [button(t('common.close'), () => app.closeModal(), 'btn')]);
};

export const modals: Record<ModalName, ModalFactory> = { help, image, privacy };
