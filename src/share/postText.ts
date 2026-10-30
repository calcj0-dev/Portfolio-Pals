// 投稿文（診断仕様 7.1）。URL は投稿画面に別に渡すので、ここには入れない

import { config } from '../data';
import { charText, t } from '../i18n';

export function postText(typeId: string): string {
  const c = charText(typeId);
  return t('share.post', { name: c.name, one: c.one, hashtag: config.hashtag });
}

/** X での長さ（全角を2、半角を1、URLは urlWeight で数える。T-11） */
export function xWeight(text: string, urls: number): number {
  let w = 0;
  for (const ch of text) w += /[\u0000-ჿ -‍‐-‟′-‷]/.test(ch) ? 1 : 2;
  // 投稿文と URL の間の空白も1つ数える
  return w + urls * (config.xPost.urlWeight + 1);
}
