// S2 入力（画面設計 5章、診断仕様 2章）。①持っているものを選ぶ ②割合を入れる。
// 残りは自動で現金・預金に入る。入力はメモリの中だけに持つ

import { emptyInput, fromValues, remainderValue, setValue, toggle, toPortfolio } from '../../core/portfolio';
import { categories, config, inputRules } from '../../data';
import { categoryName, localeData, t } from '../../i18n';
import type { ScreenFactory } from '../app';
import { button, h, linkButton } from '../dom';
import { createPie } from '../pie';
import { backButton, percent } from '../parts';
import { session } from '../session';
import { createSlider } from '../slider';

export const inputScreen: ScreenFactory = (app) => {
  const r = inputRules;
  const colorOf = (id: string) => categories.find((c) => c.id === id)?.color ?? '#ccc';

  // ---- ① 持っているものを選ぶ ----
  const chips = new Map<string, HTMLButtonElement>();
  const groups = config.categoryGroups
    .map((g) => ({ g, items: categories.filter((c) => c.group === g && c.id !== r.remainder) }))
    .filter((x) => x.items.length > 0)
    .map(({ g, items }) =>
      h('div', { className: 'chip-group' }, [
        h('h3', { className: 'chip-group-name', text: localeData().categoryGroups[g] ?? g }),
        h(
          'div',
          { className: 'chips' },
          items.map((c) => {
            const chip = button(categoryName(c.id), () => change(toggle(session.input, c.id, r)), 'chip');
            chip.style.setProperty('--c', c.color);
            chips.set(c.id, chip);
            return chip;
          }),
        ),
      ]),
    );

  const presets = h('div', { className: 'presets' }, [
    h('span', { className: 'presets-label', text: t('input.presets') }),
    ...config.presets.map((p) =>
      button(
        localeData().presets[p.id] ?? p.id,
        () => {
          change(fromValues(p.values, r));
          session.presetId = p.id;
        },
        'preset',
      ),
    ),
  ]);

  // ---- ② 割合を入れる ----
  const rows = h('div', { className: 'rows' });
  const remainderLabel = h('span', { className: 'row-name', text: t('input.remainder', { name: categoryName(r.remainder) }) });
  const remainderValueEl = h('span', { className: 'row-value' });
  const remainderRow = h('div', { className: 'row row-remainder' }, [remainderLabel, remainderValueEl]);
  remainderRow.style.setProperty('--c', colorOf(r.remainder));
  const pie = createPie(toPortfolio(session.input, r));
  const valueEls = new Map<string, HTMLElement>();

  /** 値だけ変わったとき（スライダーを動かしている間）。行は作り直さない */
  const paintValues = () => {
    for (const [id, el] of valueEls) el.textContent = percent(session.input.values[id] ?? 0);
    remainderValueEl.textContent = percent(remainderValue(session.input));
    pie.update(toPortfolio(session.input, r));
  };

  /** 選ぶ区分が変わったとき。チップと行を作り直す */
  const paintAll = () => {
    for (const [id, chip] of chips) {
      const on = session.input.selected.includes(id);
      chip.classList.toggle('on', on);
      chip.setAttribute('aria-pressed', String(on));
    }
    valueEls.clear();
    rows.replaceChildren(
      ...session.input.selected.map((id) => {
        const valueEl = h('span', { className: 'row-value' });
        valueEls.set(id, valueEl);
        const slider = createSlider({
          label: categoryName(id),
          color: colorOf(id),
          value: session.input.values[id] ?? 0,
          step: r.step,
          format: percent,
          onInput: (v) => {
            session.input = setValue(session.input, id, v, r);
            session.presetId = null;
            paintValues();
            return session.input.values[id] ?? 0;
          },
        });
        return h('div', { className: 'row' }, [
          h('div', { className: 'row-head' }, [h('span', { className: 'row-name', text: categoryName(id) }), valueEl]),
          slider.el,
        ]);
      }),
    );
    paintValues();
  };

  const change = (next: typeof session.input) => {
    session.input = next;
    session.presetId = null;
    paintAll();
  };

  const el = h('main', { className: 'screen screen-input' }, [
    h('div', { className: 'top-bar top-bar-split' }, [
      backButton(() => history.back()),
      linkButton(t('input.help'), () => app.openModal('help')),
    ]),
    h('section', { className: 'card' }, [h('h2', { className: 'step', text: t('input.step1') }), ...groups, presets]),
    h('section', { className: 'card' }, [
      h('h2', { className: 'step', text: t('input.step2') }),
      rows,
      remainderRow,
      pie.el,
      h('p', { className: 'note', text: t('input.note') }),
      linkButton(t('input.reset'), () => change(emptyInput())),
    ]),
    h('div', { className: 'sticky-action' }, [
      button(t('input.diagnose'), () => app.go('diagnosing'), 'btn btn-primary btn-big'),
    ]),
  ]);

  paintAll();
  return { el };
};
