// S3 診断の演出（画面設計 6章）。円グラフがくるっと1回転し、約1秒で結果へ。
// 判定と発見の記録はここで行う（結果画面は session.resultType を出すだけ）

import { selectedBucket, track } from '../../analytics';
import { sfx } from '../../audio';
import { judge } from '../../core/judge';
import { toPortfolio } from '../../core/portfolio';
import { categoryIds, config, inputRules, rules } from '../../data';
import { t } from '../../i18n';
import { hasDiagnosed, markDiagnosed, markFound } from '../../zukan';
import type { ScreenFactory } from '../app';
import { h } from '../dom';
import { pieSvg } from '../pie';
import { session } from '../session';

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const diagnosingScreen: ScreenFactory = (app) => {
  const p = toPortfolio(session.input, inputRules);
  const ms = reducedMotion() ? config.diagnoseReducedMs : config.diagnoseMs;
  const pie = h('div', { className: 'diagnosing-pie' }, [pieSvg(p, 180)]);
  pie.style.setProperty('--ms', `${ms}ms`);
  const el = h('main', { className: 'screen screen-diagnosing' }, [
    pie,
    h('p', { className: 'diagnosing-text', text: t('diagnosing.reading') }),
  ]);

  const type = judge(p, rules, categoryIds);
  const first = !hasDiagnosed();
  const newFound = markFound(type);
  markDiagnosed();
  session.resultType = type;
  session.newFound = newFound;
  track('diagnose', {
    type,
    first,
    new_found: newFound,
    selected: selectedBucket(session.input.selected.length),
    preset: session.presetId !== null,
  });

  sfx.pon();
  // 「戻る」で演出に戻らないよう、結果は今の履歴を置き換えて出す
  const timer = setTimeout(() => app.go('result', { replace: true }), ms);
  return { el, unmount: () => clearTimeout(timer) };
};
