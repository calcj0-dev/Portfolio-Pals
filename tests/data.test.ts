// データの検査（T-06・T-07。絵の有無は #9 で足す）
import { describe, expect, it } from 'vitest';
import { validateData, type DataSet } from '../src/core/validate';
import { characters, dataSet } from '../src/data';

/** 正しいデータを複製して、一か所だけ壊す */
function broken(edit: (d: DataSet) => void): string[] {
  const d = structuredClone(dataSet);
  edit(d);
  return validateData(d);
}

describe('今のデータ', () => {
  it('検査で何も見つからない', () => {
    expect(validateData(dataSet)).toEqual([]);
  });

  it('キャラは22種', () => {
    expect(characters).toHaveLength(22);
  });
});

describe('T-06 rules.json の検査', () => {
  it.each<[string, (d: DataSet) => void]>([
    ['知らない指標', (d) => (d.rules.rules[0]!.all[0]![0] = 'nope')],
    ['知らない比較', (d) => (d.rules.rules[0]!.all[0]![1] = 'ne')],
    ['値が数でない', (d) => (d.rules.rules[0]!.all[0]![2] = '30')],
    ['タイプIDの重複', (d) => (d.rules.rules[1]!.id = d.rules.rules[0]!.id)],
    ['characters にないタイプID', (d) => (d.rules.rules[0]!.id = 'ghost')],
    ['最後のルールの all が空でない', (d) => d.rules.rules.at(-1)!.all.push(['cash', 'gte', 0])],
    ['途中のルールの all が空', (d) => (d.rules.rules[0]!.all = [])],
  ])('%s で失敗する', (_label, edit) => {
    expect(broken(edit)).not.toEqual([]);
  });
});

describe('T-07 キャラのデータの検査', () => {
  it.each<[string, (d: DataSet) => void]>([
    ['zukanOrder の重複', (d) => (d.characters[1]!.zukanOrder = d.characters[0]!.zukanOrder)],
    ['zukanOrder が1〜22でない', (d) => (d.characters[0]!.zukanOrder = 99)],
    ['相性が自分', (d) => (d.characters[0]!.good = d.characters[0]!.id)],
    ['相性が知らないID', (d) => (d.characters[0]!.bad = 'ghost')],
    ['知らない図鑑のグループ', (d) => (d.characters[0]!.zukanGroup = 'ghost')],
    ['判定のないキャラ', (d) => (d.rules.rules = d.rules.rules.filter((r) => r.id !== 'monk'))],
    ['文章がない', (d) => delete d.locales.ja!.characters.monk],
    ['性格が2つ', (d) => d.locales.ja!.characters.monk!.traits.pop()],
    ['あるあるが4つ', (d) => d.locales.ja!.characters.monk!.aruaru.push('x')],
    ['一言が空', (d) => (d.locales.ja!.characters.monk!.one = '')],
    ['区分名がない', (d) => delete d.locales.ja!.categories.world],
    ['区分の色がない', (d) => (d.categories[0]!.color = 'pink')],
    ['プリセットが5の倍数でない', (d) => (d.config.presets[0]!.values = { world: 33 })],
    ['プリセットに現金・預金', (d) => (d.config.presets[0]!.values = { cash: 50 })],
  ])('%s で失敗する', (_label, edit) => {
    expect(broken(edit)).not.toEqual([]);
  });
});
