// JSON のデータを読み込み、型を付けて渡す窓口（技術設計 2.1）。
// satisfies により、項目の不足・型の違いはビルド時にエラーになる。
// 中身の整合（ID・指標名・相性・文章の数など）は読み込み時に検査し、おかしければ例外を出す（T-06・T-07）

import type { Rule } from './core/judge';
import type { InputRules } from './core/portfolio';
import { validateData, type CategoryDef, type CharacterDef, type DataSet, type PresetDef, type RawRules } from './core/validate';
import type { Locale, LocaleData } from './i18n/types';
import categoriesJson from './data/categories.json';
import charactersJson from './data/characters.json';
import configJson from './data/config.json';
import jaJson from './data/i18n/ja.json';
import rulesJson from './data/rules.json';

export type AppConfig = DataSet['config'] & {
  presets: PresetDef[];
  diagnoseMs: number;
  diagnoseReducedMs: number;
  revealStepMs: number;
  hashtag: string;
  /** X の投稿の上限（全角を2、URLを urlWeight で数える。T-11） */
  xPost: { maxWeight: number; urlWeight: number };
  links: { tameru: string; tva: string; follow: string; xIntent: string };
};

export const config: AppConfig = configJson satisfies AppConfig;
export const categories: CategoryDef[] = categoriesJson.categories satisfies CategoryDef[];
export const characters: CharacterDef[] = charactersJson.characters satisfies CharacterDef[];
const rawRules: RawRules = rulesJson satisfies RawRules;

/** 言語ごとの文言。言語を足すときは JSON を作ってここに1行足す */
export const messagesByLocale = { ja: jaJson } satisfies Record<Locale, LocaleData>;

export const dataSet: DataSet = { config, categories, rules: rawRules, characters, locales: messagesByLocale };

const errors = validateData(dataSet);
if (errors.length > 0) throw new Error(`invalid data:\n${errors.join('\n')}`);

/** 判定表（検査済みなので型を付けてよい） */
export const rules = rawRules.rules as unknown as Rule[];

export const categoryIds: string[] = categories.map((c) => c.id);

export const inputRules: InputRules = {
  categoryIds,
  remainder: config.remainderCategory,
  step: config.sliderStep,
};

/** 図鑑の順（隠しキャラは今は扱わない） */
export const zukanCharacters: CharacterDef[] = [...characters].sort((a, b) => a.zukanOrder - b.zukanOrder);

export function characterById(id: string): CharacterDef | undefined {
  return characters.find((c) => c.id === id);
}

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
