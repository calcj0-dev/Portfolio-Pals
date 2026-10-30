// 文言の取り出し（技術設計 14章）。言語は起動時に1回だけ決める。公開時は常に ja

import type { CharacterText } from '../core/validate';
import { messagesByLocale } from '../data';
import type { Locale, LocaleData, MessageKey } from './types';

let locale: Locale = 'ja';
let data: LocaleData = messagesByLocale.ja;

export function setLocale(next: Locale): void {
  locale = next;
  data = messagesByLocale[next];
  if (typeof document !== 'undefined') document.documentElement.lang = next;
}

export function getLocale(): Locale {
  return locale;
}

export type Vars = Record<string, string | number>;

/** {name} の形の差し込みを置き換える。値がない差し込みはそのまま残す */
export function format(template: string, vars: Vars = {}): string {
  return template.replace(/\{(\w+)\}/g, (all, name: string) => (name in vars ? String(vars[name]) : all));
}

export function t(key: MessageKey, vars?: Vars): string {
  return format(data.messages[key] ?? key, vars);
}

/** キャラの文章（検査済みなので必ずある） */
export function charText(id: string): CharacterText {
  return data.characters[id]!;
}

export function categoryName(id: string): string {
  return data.categories[id]?.name ?? id;
}

export function localeData(): LocaleData {
  return data;
}
