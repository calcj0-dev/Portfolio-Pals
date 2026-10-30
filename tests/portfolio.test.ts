// 入力の決まり（T-08）とプリセット（T-09）
import { describe, expect, it } from 'vitest';
import { judge } from '../src/core/judge';
import {
  emptyInput,
  fromValues,
  remainderValue,
  setValue,
  toggle,
  toPortfolio,
  type InputState,
} from '../src/core/portfolio';
import { categoryIds, config, inputRules as r, rules } from '../src/data';

const total = (s: InputState) => Object.values(toPortfolio(s, r)).reduce((a, b) => a + b, 0);
const allMultiples = (s: InputState) => Object.values(toPortfolio(s, r)).every((v) => v % r.step === 0 && v >= 0);

describe('T-08 入力の決まり', () => {
  it('最初は現金・預金100%', () => {
    expect(remainderValue(emptyInput())).toBe(100);
    expect(toPortfolio(emptyInput(), r).cash).toBe(100);
  });

  it('現金・預金＝100−ほかの合計', () => {
    let s = setValue(emptyInput(), 'world', 60, r);
    s = setValue(s, 'us', 20, r);
    expect(toPortfolio(s, r).cash).toBe(20);
    expect(total(s)).toBe(100);
  });

  it('5%に合わせる', () => {
    const s = setValue(emptyInput(), 'world', 62, r);
    expect(s.values.world).toBe(60);
    expect(setValue(emptyInput(), 'world', 63, r).values.world).toBe(65);
  });

  it('0〜100の外は端で止める', () => {
    expect(setValue(emptyInput(), 'world', -20, r).values.world).toBe(0);
    expect(setValue(emptyInput(), 'world', 140, r).values.world).toBe(100);
  });

  it('現金・預金が0%のときに増やそうとしても増えない', () => {
    let s = setValue(emptyInput(), 'world', 70, r);
    s = setValue(s, 'us', 30, r);
    expect(remainderValue(s)).toBe(0);
    s = setValue(s, 'us', 50, r);
    expect(s.values.us).toBe(30);
    expect(total(s)).toBe(100);
  });

  it('上限の手前までは増やせる', () => {
    let s = setValue(emptyInput(), 'world', 70, r);
    s = setValue(s, 'us', 50, r);
    expect(s.values.us).toBe(30);
  });

  it('選ぶのをやめると、その分が現金・預金に戻る', () => {
    let s = setValue(emptyInput(), 'world', 60, r);
    s = setValue(s, 'gold', 20, r);
    s = toggle(s, 'gold', r);
    expect(s.selected).toEqual(['world']);
    expect(toPortfolio(s, r).gold).toBe(0);
    expect(toPortfolio(s, r).cash).toBe(40);
  });

  it('選ぶと0%で加わる', () => {
    const s = toggle(emptyInput(), 'bond', r);
    expect(s.selected).toEqual(['bond']);
    expect(s.values.bond).toBe(0);
  });

  it('現金・預金は選べず、直接は変えられない', () => {
    expect(toggle(emptyInput(), 'cash', r)).toEqual(emptyInput());
    expect(setValue(emptyInput(), 'cash', 50, r)).toEqual(emptyInput());
  });

  it('知らない区分は無視する', () => {
    expect(setValue(emptyInput(), 'nope', 50, r)).toEqual(emptyInput());
  });

  it('どう操作しても、値は5の倍数で合計は100', () => {
    let s = emptyInput();
    let seed = 1;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
    const ids = categoryIds.filter((id) => id !== r.remainder);
    for (let i = 0; i < 2000; i++) {
      const id = ids[Math.floor(rnd() * ids.length)]!;
      s = rnd() < 0.2 ? toggle(s, id, r) : setValue(s, id, rnd() * 120 - 10, r);
      expect(total(s)).toBe(100);
      expect(allMultiples(s)).toBe(true);
    }
  });
});

describe('T-09 プリセット', () => {
  const expected: Record<string, string> = { world100: 'monk', us70cash30: 'pioneer', cash100: 'squirrel' };

  it('3つある', () => {
    expect(config.presets.map((p) => p.id)).toEqual(Object.keys(expected));
  });

  it.each(config.presets.map((p) => [p.id, p] as const))('%s が診断仕様 2.4 のキャラになる', (id, p) => {
    const s = fromValues(p.values, r);
    expect(total(s)).toBe(100);
    expect(judge(toPortfolio(s, r), rules, categoryIds)).toBe(expected[id]);
  });
});
