// T-11 投稿文の長さ
import { describe, expect, it } from 'vitest';
import { characters, config } from '../src/data';
import { charText } from '../src/i18n';
import { postText, xWeight } from '../src/share/postText';

describe('T-11 投稿文の長さ', () => {
  it.each(characters.map((c) => [c.id]))('%s の投稿文が X の上限に収まる', (id) => {
    expect(xWeight(postText(id), 1)).toBeLessThanOrEqual(config.xPost.maxWeight);
  });

  it('投稿文にタイプ名・一言・ハッシュタグが入る', () => {
    const text = postText('monk');
    expect(text).toContain(charText('monk').name);
    expect(text).toContain(charText('monk').one);
    expect(text).toContain(config.hashtag);
  });

  it('全角は2、半角は1で数える', () => {
    expect(xWeight('ab', 0)).toBe(2);
    expect(xWeight('あい', 0)).toBe(4);
    expect(xWeight('', 1)).toBe(config.xPost.urlWeight + 1);
  });
});
