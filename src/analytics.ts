// 計測（技術設計 7章）。ページの表示は Vercel Analytics、イベントは GA4。
// 失敗しても例外を出さない（広告ブロックなどで読み込めなくても遊べるように）。
// 送らないもの：入力した割合、選んだ区分の中身（selected は数だけ）

import { inject } from '@vercel/analytics';
import { getLocale } from './i18n';

export type SelectedBucket = '1' | '2-3' | '4-6' | '7+';
export type FoundBucket = '1' | '2-5' | '6-10' | '11-21' | '22';

export type AnalyticsEvent =
  | { name: 'start'; props: { from: 'title' | 'shared' | 'zukan' | 'retry' } }
  | {
      name: 'diagnose';
      props: { type: string; first: boolean; new_found: boolean; selected: SelectedBucket; preset: boolean };
    }
  | { name: 'share_click'; props: { method: 'x_intent' | 'web_share' | 'save_image'; pie: 'on' | 'off'; type: string } }
  | { name: 'main_app_click'; props: { target: 'tameru' | 'tva' | 'follow'; type: string } }
  | { name: 'zukan_open'; props: { from: 'title' | 'result' | 'shared'; found: FoundBucket } }
  | { name: 'retry'; props: Record<string, never> }
  | { name: 'shared_view'; props: { type: string } };

type Gtag = (...args: unknown[]) => void;
type GtagWindow = { dataLayer?: unknown[]; gtag?: Gtag };

/** GA4 の測定ID（環境変数 VITE_GA_ID）。空なら GA4 は読み込まない */
export function gaId(): string {
  return ((import.meta.env.VITE_GA_ID as string | undefined) ?? '').trim();
}

/** 起動時に1回呼ぶ */
export function initAnalytics(): void {
  try {
    // Vercel Analytics（ページの表示）。公開版だけ
    if (import.meta.env.PROD) inject({ mode: 'production', framework: 'vanilla' });
  } catch {
    // 読み込めなくても遊べる
  }
  const id = gaId();
  if (!id) return;
  try {
    const w = window as unknown as GtagWindow;
    w.dataLayer = w.dataLayer ?? [];
    w.gtag = function gtag() {
      // gtag.js は arguments をそのまま受け取る決まり
      w.dataLayer!.push(arguments);
    };
    w.gtag('js', new Date());
    w.gtag('config', id);
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.append(s);
  } catch {
    // 読み込めなくても遊べる
  }
}

/** イベントを送る。全イベントに lang を付ける */
export function track<N extends AnalyticsEvent['name']>(name: N, props: Extract<AnalyticsEvent, { name: N }>['props']): void {
  try {
    const gtag = (window as unknown as GtagWindow).gtag;
    if (typeof gtag !== 'function') return;
    gtag('event', name, { ...props, lang: getLocale() });
  } catch {
    // 計測の失敗で遊びを止めない
  }
}

/** 選んだ区分の数の区分け（数だけ送る） */
export function selectedBucket(n: number): SelectedBucket {
  if (n <= 1) return '1';
  if (n <= 3) return '2-3';
  if (n <= 6) return '4-6';
  return '7+';
}

/** 発見数の区分け */
export function foundBucket(n: number): FoundBucket {
  if (n <= 1) return '1';
  if (n <= 5) return '2-5';
  if (n <= 10) return '6-10';
  if (n <= 21) return '11-21';
  return '22';
}
