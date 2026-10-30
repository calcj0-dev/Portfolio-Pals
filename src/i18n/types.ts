// 文言のキーの型（技術設計 14章）。全言語の JSON はこのキーをすべて持つ。
// 足りない JSON は data.ts の satisfies でビルドエラーになる

import type { LocaleCheck } from '../core/validate';

export const MESSAGE_KEYS = [
  'common.disclaimer',
  'common.back',
  'common.close',
  'common.soundOn',
  'common.soundOff',
  'common.percent',

  'title.main',
  'title.sub',
  'title.preparing',
  'title.start',
  'title.safe',
  'title.credit',

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
