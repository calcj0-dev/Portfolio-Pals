// 5%刻みのスライダー（技術設計 11章）。ポインター操作で動かす。
// 縦スクロールと両立させるため、指で触ったときは最初の数pxで向きを見て、横のときだけ値を変える。
// 縦に動かしたときはブラウザのスクロールに任せる（touch-action: pan-y）

import { h } from './dom';

export type SliderOptions = {
  label: string;
  color: string;
  value: number;
  step: number;
  /** 値を変えようとしたときに呼ぶ。実際に入った値（上限で止まった値）を返す */
  onInput: (requested: number) => number;
  /** 値の表示（aria-valuetext） */
  format: (value: number) => string;
};

export type Slider = { el: HTMLElement; set(value: number): void };

/** 向きを決めるまでの距離（px） */
const LOCK_PX = 6;

export function createSlider(o: SliderOptions): Slider {
  const fill = h('div', { className: 'slider-fill' });
  const thumb = h('div', { className: 'slider-thumb' });
  const el = h(
    'div',
    {
      className: 'slider',
      attrs: { role: 'slider', tabindex: '0', 'aria-label': o.label, 'aria-valuemin': '0', 'aria-valuemax': '100' },
    },
    [h('div', { className: 'slider-track' }, [fill]), thumb],
  );
  el.style.setProperty('--c', o.color);

  let value = o.value;
  const paint = () => {
    el.style.setProperty('--v', String(value / 100));
    el.setAttribute('aria-valuenow', String(value));
    el.setAttribute('aria-valuetext', o.format(value));
  };

  const bump = () => {
    thumb.classList.remove('bump');
    void thumb.offsetWidth;
    thumb.classList.add('bump');
  };

  const request = (v: number) => {
    const accepted = o.onInput(v);
    // 上限で止まったときは、つまみを少し揺らす（画面設計 5章）
    if (v - accepted >= o.step / 2 && accepted === value) bump();
    value = accepted;
    paint();
  };

  const valueAt = (clientX: number) => {
    const r = el.getBoundingClientRect();
    const pad = thumb.offsetWidth / 2;
    const ratio = (clientX - r.left - pad) / Math.max(1, r.width - pad * 2);
    return Math.min(Math.max(ratio, 0), 1) * 100;
  };

  type Drag = { id: number; x: number; y: number; mode: 'pending' | 'drag' | 'scroll' };
  let drag: Drag | null = null;

  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, mode: e.pointerType === 'mouse' ? 'drag' : 'pending' };
    if (drag.mode === 'drag') {
      el.setPointerCapture(e.pointerId);
      request(valueAt(e.clientX));
      e.preventDefault();
    }
  });
  el.addEventListener('pointermove', (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    if (drag.mode === 'pending') {
      const dx = Math.abs(e.clientX - drag.x);
      const dy = Math.abs(e.clientY - drag.y);
      if (dx >= LOCK_PX && dx > dy) {
        drag.mode = 'drag';
        el.setPointerCapture(e.pointerId);
      } else if (dy >= LOCK_PX) {
        drag.mode = 'scroll';
      }
    }
    if (drag.mode === 'drag') request(valueAt(e.clientX));
  });
  const end = (e: PointerEvent) => {
    if (!drag || drag.id !== e.pointerId) return;
    // 指で軽く叩いたときは、その位置に合わせる
    if (drag.mode === 'pending' && e.type === 'pointerup') request(valueAt(e.clientX));
    drag = null;
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);

  el.addEventListener('keydown', (e) => {
    const map: Record<string, number> = {
      ArrowRight: value + o.step,
      ArrowUp: value + o.step,
      ArrowLeft: value - o.step,
      ArrowDown: value - o.step,
      Home: 0,
      End: 100,
    };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    request(next);
  });

  paint();
  return {
    el,
    set(v) {
      value = v;
      paint();
    },
  };
}
