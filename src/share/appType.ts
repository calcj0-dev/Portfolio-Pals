// /t/<タイプID>/ で開いたかの判定（技術設計 5章）。
// ページに埋めた <meta name="app-type" content="<タイプID>"> で決める（パスを読まないので置き場所に依存しない）

import { characterById } from '../data';

/** meta の中身からタイプIDを返す。公開中のキャラでなければ null（通常のトップとして開く） */
export function sharedTypeFrom(content: string | null | undefined): string | null {
  const id = content?.trim() ?? '';
  return characterById(id)?.released ? id : null;
}

/** 今のページの app-type */
export function sharedTypeOfPage(doc: Document = document): string | null {
  return sharedTypeFrom(doc.querySelector<HTMLMetaElement>('meta[name="app-type"]')?.content);
}
