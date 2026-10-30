// JSON のデータを読み込み、型を付けて渡す窓口（技術設計 2.1）。
// satisfies により、項目の不足・型の違いはビルド時にエラーになる

import type { Locale, Messages } from './i18n/types';
import configJson from './data/config.json';
import jaJson from './data/i18n/ja.json';

export type AppConfig = {
  links: { tameru: string; tva: string; follow: string; xIntent: string };
};

export const config = configJson satisfies AppConfig;

/** 言語ごとの文言。言語を足すときは JSON を作ってここに1行足す */
export const messagesByLocale = { ja: jaJson } satisfies Record<Locale, Messages>;

/** 作品のURL（環境変数 VITE_SITE_URL。末尾は /）。未設定なら今のページのURL */
export function siteUrl(): string {
  const v = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim();
  if (v) return v.endsWith('/') ? v : `${v}/`;
  return typeof location === 'undefined' ? '' : location.origin + location.pathname;
}

/** シェアするURL：タイプごとのページ（技術設計 6.3）。割合は入れない */
export function shareUrl(typeId: string): string {
  return `${siteUrl()}t/${encodeURIComponent(typeId)}/`;
}
