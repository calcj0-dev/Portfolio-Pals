// タイプ名・一言を2行に折り返す（結果画像）。決まりは scripts/build-og.mjs（OGP 画像）と同じ

// 文字の種類は Unicode の書き方で持つ（画面の文言ではないので i18n の JSON には置かない）
const kind = (ch: string) =>
  /\p{Script=Hiragana}/u.test(ch)
    ? 'hira'
    : /[\p{Script=Katakana}\u30FC]/u.test(ch)
      ? 'kata'
      : /\p{Script=Han}/u.test(ch)
        ? 'kanji'
        : 'other';
/** 行末に置かない文字（「 （） */
const NO_END = /[\u300C\uFF08]/;
/** 行頭に置かない文字（」 ） 、 。 ー） */
const NO_START = /[\u300D\uFF09\u3001\u3002\u30FC]/;
/** この字のあとでは切ってよい（の） */
const PARTICLE_NO = '\u306E';

/**
 * 折り返してよい位置（その文字の前で改行する）。
 * 「の」のあと、または漢字・カタカナ・開きかっこの前（ひらがなの前では切らない＝助詞を行頭にしない）
 */
export function breakPoints(text: string): number[] {
  const chars = [...text];
  const out: number[] = [];
  for (let i = 1; i < chars.length; i++) {
    const prev = chars[i - 1]!;
    const next = chars[i]!;
    if (NO_END.test(prev) || NO_START.test(next)) continue;
    if (prev === PARTICLE_NO || (kind(prev) !== kind(next) && kind(next) !== 'hira')) out.push(i);
  }
  return out;
}

/** 1行に入れば1行、入らなければ幅が一番そろう位置で2行にする（入りきるかは呼ぶ側が文字の大きさで調整する） */
export function wrapText(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  if (measure(text) <= maxWidth) return [text];
  const chars = [...text];
  const points = breakPoints(text);
  const candidates = points.length > 0 ? points : [Math.ceil(chars.length / 2)];
  let best: { lines: string[]; w: number } | null = null;
  for (const i of candidates) {
    const lines = [chars.slice(0, i).join(''), chars.slice(i).join('')];
    const w = Math.max(...lines.map(measure));
    if (!best || w < best.w) best = { lines, w };
  }
  return best!.lines;
}
