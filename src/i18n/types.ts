// 文言のキーの型（技術設計 14章）。全言語の JSON はこのキーをすべて持つ。
// 足りない JSON は data.ts の satisfies でビルドエラーになる

export const MESSAGE_KEYS = ['common.disclaimer', 'title.main', 'title.sub', 'title.preparing'] as const;

export type MessageKey = (typeof MESSAGE_KEYS)[number];

export type Messages = Record<MessageKey, string>;

export type Locale = 'ja';
