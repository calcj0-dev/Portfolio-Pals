// S4 結果（画面設計 7章、診断仕様 5章）。
// 絵がぽよんと出る → タイプ名 → 一言 の順に少しずつ出す（タップで飛ばす）。
// 結果画像・図鑑・プライバシーへの導線はそれぞれの作業で足す

import { track } from '../../analytics';
import { sfx } from '../../audio';
import { toPortfolio } from '../../core/portfolio';
import { characterById, characters, config, inputRules } from '../../data';
import { charText, t } from '../../i18n';
import { postText } from '../../share/postText';
import { openXIntent } from '../../share/share';
import { foundIds, isFound } from '../../zukan';
import type { ScreenFactory } from '../app';
import { button, externalLink, h } from '../dom';
import { characterArt } from '../character';
import { createPie } from '../pie';
import { soundButton } from '../parts';
import { session } from '../session';
import { reducedMotion } from './diagnosing';

const list = (items: string[]) => h('ul', { className: 'bullets' }, items.map((x) => h('li', { text: x })));
const section = (heading: string, body: (HTMLElement | null)[]) =>
  h('section', { className: 'result-section' }, [h('h2', { className: 'result-h', text: heading }), ...body]);

/** 相性の1行。発見済みなら絵＋名前、未発見なら「？？？」＋理由（決定 #22） */
function compatRow(mark: string, otherId: string, why: string): HTMLElement {
  const found = isFound(otherId);
  return h('div', { className: `compat ${found ? '' : 'compat-unknown'}`.trim() }, [
    h('span', { className: 'compat-mark', text: mark, attrs: { 'aria-hidden': 'true' } }),
    characterArt(otherId, { silhouette: !found, className: 'compat-art' }),
    h('div', { className: 'compat-text' }, [
      h('p', { className: 'compat-name', text: found ? charText(otherId).name : t('common.unknown') }),
      h('p', { className: 'compat-why', text: why }),
    ]),
  ]);
}

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
        text: t('result.newFound', { total: characters.length, count: foundIds().filter((id) => characterById(id)).length }),
      })
    : null;

  const el = h('main', { className: 'screen screen-result' }, [
    h('div', { className: 'top-bar top-bar-split' }, [h('p', { className: 'result-lead', text: t('result.heading') }), sound.el]),
    hero,
    newFound,
    button(
      t('result.share'),
      () => {
        track('share_click', { method: 'x_intent', pie: 'off', type });
        openXIntent(postText(type), type);
      },
      'btn btn-primary btn-big',
    ),
    h('div', { className: 'result-links' }, [
      button(
        t('result.retry'),
        () => {
          track('retry', {});
          track('start', { from: 'retry' });
          app.go('input');
        },
        'link',
      ),
    ]),
    h('div', { className: 'card result-body' }, [
      section(t('result.traits'), [list(c.traits)]),
      section(t('result.aruaru'), [list(c.aruaru)]),
      section(t('result.compat'), [compatRow(t('result.goodMark'), def.good, c.goodWhy), compatRow(t('result.badMark'), def.bad, c.badWhy)]),
      section(t('result.proverb'), [h('p', { className: 'proverb', text: t('common.quote', { text: c.proverb }) })]),
      section(t('result.pie'), [createPie(toPortfolio(session.input, inputRules), 140).el]),
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
