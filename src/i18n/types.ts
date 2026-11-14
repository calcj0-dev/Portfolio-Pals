// 文言のキーの型（技術設計 14章）。全言語の JSON はこのキーをすべて持つ。
// 足りない JSON は data.ts の satisfies でビルドエラーになる

import type { LocaleCheck } from '../core/validate';

export const MESSAGE_KEYS = [
  'common.disclaimer',
  'common.back',
  'common.home',
  'common.close',
  'common.soundOn',
  'common.soundOff',
  'common.percent',

  'title.main',
  'title.sub',
  'title.start',
  'title.safe',
  'title.credit',
  'title.zukan',
  'title.privacy',
  'title.lab',

  'input.help',
  'input.step1',
  'input.presets',
  'input.step2',
  'input.remainder',
  'input.note',
  'input.reset',
  'input.diagnose',

  'pie.label',

  'help.heading',
  'help.item',
  'help.to',
  'help.note',

  'common.quote',
  'common.unknown',

  'diagnosing.reading',

  'result.heading',
  'result.share',
  'result.retry',
  'result.traits',
  'result.aruaru',
  'result.compat',
  'result.goodMark',
  'result.badMark',
  'result.proverb',
  'result.pie',
  'result.newFound',
  'result.tameruHeading',
  'result.tameruBody',
  'result.tameruButton',
  'result.tvaHeading',
  'result.tvaButton',
  'result.follow',
  'result.zukan',
  'result.image',

  'image.heading',
  'image.alt',
  'image.pie',
  'image.shareWithImage',
  'image.save',
  'image.longPress',

  'privacy.heading',
  'privacy.ga.p1',
  'privacy.ga.p2',
  'privacy.ga.p3',
  'privacy.ga.optout',
  'privacy.basic.p1',
  'privacy.basic.p2',
  'privacy.basic.p3',
  'privacy.image',
  'privacy.storage',
  'privacy.googlePolicy',
  'privacy.optoutLink',
  'privacy.vercelPolicy',

  'zukan.heading',
  'zukan.count',
  'zukan.complete',

  'detail.backToZukan',

  'shared.lead',
  'shared.start',

  'share.post',
] as const;

export type MessageKey = (typeof MESSAGE_KEYS)[number];

export type Messages = Record<MessageKey, string>;

/** 言語ごとの JSON（data/i18n/<言語>.json）の形 */
export type LocaleData = LocaleCheck & {
  messages: Messages;
  /** 迷いやすいものの入れ方（M2） */
  help: { item: string; to: string }[];
};

export type Locale = 'ja';
