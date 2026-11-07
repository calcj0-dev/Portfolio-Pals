// S4 結果（画面設計 7章、診断仕様 5章）。
// 絵がぽよんと出る → タイプ名 → 一言 の順に少しずつ出す（タップで飛ばす）。
// プライバシーへの導線は #15 で足す

import { foundBucket, track } from '../../analytics';
import { sfx } from '../../audio';
import { toPortfolio } from '../../core/portfolio';
import { characterById, config, inputRules, releasedCharacters } from '../../data';
import { charText, t } from '../../i18n';
import { postText } from '../../share/postText';
import { resultImage } from '../../share/resultImage';
import { openXIntent, preferWebShare, shareWithImage } from '../../share/share';
import { foundCount } from '../../zukan';
import type { ScreenFactory } from '../app';
import { button, externalLink, h } from '../dom';
import { characterArt } from '../character';
import { characterSections, section } from '../characterSections';
import { createPie } from '../pie';
import { soundButton } from '../parts';
import { session } from '../session';
import { reducedMotion } from './diagnosing';

/** 外部へのリンク（TAMERU・前作・フォロー）。押したら計測する */
function outLink(text: string, href: string, target: 'tameru' | 'tva' | 'follow', type: string, className: string) {
  const a = externalLink(text, href);
  a.className = className;
  a.addEventListener('click', () => track('main_app_click', { target, type }));
  return a;
}

export const resultScreen: ScreenFactory = (app) => {
  const type = session.resultType;
  const def = type ? characterById(type) : undefined;
  if (!type || !def) {
    // 結果がない（再読み込みなど）ときはタイトルへ
    queueMicrotask(() => app.go('title', { replace: true }));
    return { el: h('main', { className: 'screen' }) };
  }
  const c = charText(type);
  const sound = soundButton();

  const hero = h('div', { className: 'result-hero revealing' }, [
    characterArt(type, { className: 'result-art reveal' }),
    h('h1', { className: 'result-name reveal', text: c.name }),
    h('p', { className: 'result-one reveal', text: t('common.quote', { text: c.one }) }),
  ]);
  hero.querySelectorAll<HTMLElement>('.reveal').forEach((x, i) => x.style.setProperty('--i', String(i)));
  hero.style.setProperty('--step', `${config.revealStepMs}ms`);
  const skip = () => hero.classList.remove('revealing');
  hero.addEventListener('click', skip);
  hero.addEventListener('animationend', (e) => {
    if ((e.target as HTMLElement).classList.contains('result-one')) skip();
  });
  if (reducedMotion()) skip();
  // 演出が終わった合図が来ない環境（裏のタブなど）でも、時間がたてば必ず全部見えるようにする
  const revealTimer = setTimeout(skip, config.revealStepMs * 3 + 600);

  const newFound = session.newFound
    ? h('p', {
        className: 'new-found',
        text: t('result.newFound', {
          total: releasedCharacters.length,
          count: foundCount(),
        }),
      })
    : null;

  // 「Xでシェア」：スマホは画像つきの共有画面、パソコンは X の投稿画面（技術設計 6.3）。
  // 共有画面は押した直後に呼ばないと断られるので、画像は画面を開いたときに作っておく（円グラフなし）
  const portfolio = toPortfolio(session.input, inputRules);
  let shareBlob: Blob | null = null;
  void resultImage(type, portfolio, false).then((b) => {
    shareBlob = b;
  });
  const share = () => {
    const text = postText(type);
    if (shareBlob && preferWebShare(shareBlob)) {
      track('share_click', { method: 'web_share', pie: 'off', type });
      void shareWithImage(text, type, shareBlob).then((r) => {
        if (r === 'failed') openXIntent(text, type);
      });
      return;
    }
    track('share_click', { method: 'x_intent', pie: 'off', type });
    openXIntent(text, type);
  };

  const el = h('main', { className: 'screen screen-result' }, [
    h('div', { className: 'top-bar top-bar-split' }, [h('p', { className: 'result-lead', text: t('result.heading') }), sound.el]),
    hero,
    newFound,
    button(t('result.share'), share, 'btn btn-primary btn-big'),
    h('div', { className: 'result-links' }, [
      button(t('result.image'), () => app.openModal('image'), 'link'),
      button(
        t('result.retry'),
        () => {
          track('retry', {});
          track('start', { from: 'retry' });
          app.go('input');
        },
        'link',
      ),
      button(
        t('result.zukan'),
        () => {
          track('zukan_open', { from: 'result', found: foundBucket(foundCount()) });
          app.go('zukan');
        },
        'link',
      ),
    ]),
    h('div', { className: 'card result-body' }, [
      ...characterSections(app, type),
      section(t('result.pie'), [createPie(portfolio, 140).el]),
      h('p', { className: 'small', text: t('common.disclaimer') }),
    ]),
    h('section', { className: 'card promo' }, [
      h('p', { className: 'promo-heading', text: t('result.tameruHeading') }),
      h('p', { className: 'small', text: t('result.tameruBody') }),
      outLink(t('result.tameruButton'), config.links.tameru, 'tameru', type, 'btn btn-secondary'),
    ]),
    h('section', { className: 'promo promo-plain' }, [
      h('p', { className: 'promo-heading', text: t('result.tvaHeading') }),
      outLink(t('result.tvaButton'), config.links.tva, 'tva', type, 'btn btn-secondary'),
    ]),
    outLink(t('result.follow'), config.links.follow, 'follow', type, 'link'),
  ]);

  sfx.reveal();
  return {
    el,
    unmount: () => {
      clearTimeout(revealTimer);
      sound.dispose();
    },
  };
};
