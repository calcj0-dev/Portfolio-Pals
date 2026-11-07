// 結果画像のタイプ名・一言の折り返し（OGP 画像の scripts/build-og.mjs と同じ決まり）
import { describe, expect, it } from 'vitest';
import { wrap } from '../scripts/build-og.mjs';
import { wrapText } from '../src/share/lineBreak';
import { releasedCharacters } from '../src/data';
import { charText } from '../src/i18n';

/** 全角1・半角0.55 で数える（build-og.mjs の見積もりと同じ） */
const measure = (size: number) => (s: string) => [...s].reduce((w, ch) => w + (/[\x20-\x7e]/.test(ch) ? 0.55 : 1), 0) * size;

describe('折り返し', () => {
  it('入るときは1行', () => {
    expect(wrapText('abc', 1000, measure(10))).toEqual(['abc']);
  });

  it('助詞を行頭にせず、「の」のあとで切る', () => {
    expect(wrapText('王道インデックスのビーバー', 520, measure(64))).toEqual(['王道インデックスの', 'ビーバー']);
  });

  it('閉じかっこ・読点を行頭にしない', () => {
    const lines = wrapText('「いい会社は、だいたい近所にある」', 520, measure(34));
    expect(lines).toHaveLength(2);
    expect(lines[1]).not.toMatch(/^[」）、。]/);
  });

  it('OGP 画像と同じ位置で切る（公開中の全キャラ）', () => {
    for (const c of releasedCharacters) {
      const { name, one } = charText(c.id);
      expect(wrapText(name, 520, measure(64))).toEqual(wrap(name, 64, 520).lines);
      expect(wrapText(`「${one}」`, 520, measure(34))).toEqual(wrap(`「${one}」`, 34, 520).lines);
    }
  });
});
