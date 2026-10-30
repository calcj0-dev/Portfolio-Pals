// 判定のテスト（T-01〜T-05）
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { judge } from '../src/core/judge';
import { categoryIds, characters, rules } from '../src/data';
import { judge as refJudge } from '../sim/judge.mjs';
import { samples } from '../sim/sample.mjs';

type P = Record<string, number>;
const readJson = <T>(path: string): T => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf-8')) as T;
const refRules = readJson<{ rules: unknown[] }>('../sim/rules.json').rules;
const personas = readJson<{ personas: unknown[] }>('../sim/personas.json').personas;
const personasIndexHeavy = readJson<{ personas: unknown[] }>('../sim/personas_indexheavy.json').personas;
const run = (p: P) => judge(p, rules, categoryIds);
const examples = readJson<{ examples: { input: P; expect: string }[] }>('./fixtures/examples.json').examples;

/** 設計書と同じシードのサンプル10,000件 */
function sample(ps: unknown[]): P[] {
  return [...samples(ps, 10000)].map((s: { p: P }) => s.p);
}

describe('T-01 参照実装と一致', () => {
  it('sim/rules.json と src/data/rules.json が同じ', () => {
    expect(rules).toEqual(refRules);
  });

  it.each([
    ['ふつうの仮定', personas],
    ['投信だけの人が多い仮定', personasIndexHeavy],
  ])('サンプル10,000件（%s）で sim/judge.mjs と同じ', (_label, ps) => {
    const diffs = sample(ps).filter((p) => run(p) !== refJudge(p, refRules));
    expect(diffs).toEqual([]);
  });

  it('入力例で sim/judge.mjs と同じ', () => {
    for (const { input } of examples) expect(run(input)).toBe(refJudge(input, refRules));
  });
});

describe('T-02 判定の漏れ', () => {
  it('10%刻み・12区分の全組み合わせ（352,716通り）で、どれかのキャラに決まる', () => {
    const ids = categoryIds;
    const p: P = Object.fromEntries(ids.map((id) => [id, 0]));
    let count = 0;
    const known = new Set(characters.map((c) => c.id));
    const unknown: string[] = [];
    const walk = (i: number, rest: number) => {
      const id = ids[i]!;
      if (i === ids.length - 1) {
        p[id] = rest;
        count++;
        const r = run(p);
        if (!known.has(r)) unknown.push(r);
        return;
      }
      for (let v = 0; v <= rest; v += 10) {
        p[id] = v;
        walk(i + 1, rest - v);
      }
    };
    walk(0, 100);
    expect(count).toBe(352716);
    expect(unknown).toEqual([]);
  });
});

describe('T-03 入力例', () => {
  it.each(examples.map((e) => [JSON.stringify(e.input), e.input, e.expect] as const))('%s', (_l, input, expected) => {
    expect(run(input)).toBe(expected);
  });
});

describe('T-04 全キャラに出る入力がある', () => {
  // sim/enumerate_all.md の「例」（そのキャラになる最初の組み合わせ）を期待値にする
  const names = readJson<Record<string, string>>('../sim/names.json');
  const idByName = new Map(Object.entries(names).map(([id, name]) => [name, id]));
  const md = readFileSync(new URL('../sim/enumerate_all.md', import.meta.url), 'utf-8');
  const rows = md
    .split('\n')
    .map((line) => line.split('|').map((c) => c.trim()))
    .filter((c) => c.length === 6 && idByName.has(c[1]!))
    .map((c) => {
      const input: P = Object.fromEntries(c[4]!.split(' ').map((t) => [t.replace(/\d+$/, ''), Number(t.match(/\d+$/)![0])]));
      return [idByName.get(c[1]!)!, input] as const;
    });

  it('22キャラすべての例がある', () => {
    expect(new Set(rows.map(([id]) => id))).toEqual(new Set(characters.map((c) => c.id)));
  });

  it.each(rows)('%s', (id, input) => {
    expect(run(input)).toBe(id);
  });
});

describe('T-05 偏り', () => {
  it.each([
    ['ふつうの仮定', personas],
    ['投信だけの人が多い仮定', personasIndexHeavy],
  ])('サンプル10,000件（%s）で、どのキャラも20%%以下', (_label, ps) => {
    const ss = sample(ps);
    const cnt = new Map<string, number>();
    for (const p of ss) {
      const id = run(p);
      cnt.set(id, (cnt.get(id) ?? 0) + 1);
    }
    const over = [...cnt].filter(([, n]) => n / ss.length > 0.2);
    expect(over).toEqual([]);
  });
});
