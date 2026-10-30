// データの検査（技術設計 2.1、T-06・T-07）。おかしなところを文で返す（空なら正しい）。
// data.ts が読み込み時に呼び、1つでもあれば起動・ビルド・テストを失敗させる

import { OPS } from './judge';
import { metricNames, REQUIRED_CATEGORY_IDS } from './metrics';

export type CategoryDef = { id: string; group: string; label: string; color: string };
export type CharacterDef = {
  id: string;
  zukanGroup: string;
  zukanOrder: number;
  good: string;
  bad: string;
  image: string;
  og: string;
  /** 隠しキャラ（公開後に使う。技術設計 9.3） */
  hidden?: boolean;
};
export type CharacterText = {
  name: string;
  animal: string;
  look: string;
  one: string;
  traits: string[];
  aruaru: string[];
  goodWhy: string;
  badWhy: string;
  proverb: string;
};
/** values は JSON の読み込みの都合で undefined を許す（ない区分は0） */
export type PresetDef = { id: string; values: Readonly<Record<string, number | undefined>> };
export type RawRules = { version: number; rules: { id: string; all: unknown[][] }[] };

/** 言語ごとの文言のうち、検査するところ */
export type LocaleCheck = {
  categories: Record<string, { name: string; note: string }>;
  categoryGroups: Record<string, string>;
  zukanGroups: Record<string, string>;
  presets: Record<string, string>;
  characters: Record<string, CharacterText>;
};

export type DataSet = {
  config: {
    sliderStep: number;
    remainderCategory: string;
    presets: PresetDef[];
    categoryGroups: string[];
    zukanGroups: string[];
  };
  categories: CategoryDef[];
  rules: RawRules;
  characters: CharacterDef[];
  locales: Record<string, LocaleCheck>;
};

/** 性格・あるあるの数（診断仕様 4章） */
export const TEXT_LINES = 3;

const HEX = /^#[0-9A-Fa-f]{6}$/;
const nonEmpty = (s: unknown): s is string => typeof s === 'string' && s.trim() !== '';

function duplicates(xs: readonly (string | number)[]): (string | number)[] {
  return [...new Set(xs.filter((x, i) => xs.indexOf(x) !== i))];
}

export function validateData(d: DataSet): string[] {
  const errors: string[] = [];
  const err = (msg: string) => errors.push(msg);

  // ---- 区分 ----
  const catIds = d.categories.map((c) => c.id);
  for (const x of duplicates(catIds)) err(`categories: duplicate id "${x}"`);
  for (const id of REQUIRED_CATEGORY_IDS) if (!catIds.includes(id)) err(`categories: missing "${id}" (used by metrics)`);
  for (const c of d.categories) {
    if (!d.config.categoryGroups.includes(c.group)) err(`categories: "${c.id}" has unknown group "${c.group}"`);
    if (!HEX.test(c.color ?? '')) err(`categories: "${c.id}" color must be #RRGGBB`);
  }
  if (!catIds.includes(d.config.remainderCategory)) err(`config: remainderCategory "${d.config.remainderCategory}" is not a category`);

  // ---- キャラ ----
  const charIds = d.characters.map((c) => c.id);
  for (const x of duplicates(charIds)) err(`characters: duplicate id "${x}"`);
  const orders = d.characters.map((c) => c.zukanOrder);
  for (const x of duplicates(orders)) err(`characters: duplicate zukanOrder ${x}`);
  const sorted = [...orders].sort((a, b) => a - b);
  if (sorted.some((o, i) => o !== i + 1)) err(`characters: zukanOrder must be 1..${orders.length}`);
  for (const c of d.characters) {
    if (!d.config.zukanGroups.includes(c.zukanGroup)) err(`characters: "${c.id}" has unknown zukanGroup "${c.zukanGroup}"`);
    for (const k of ['good', 'bad'] as const) {
      if (c[k] === c.id) err(`characters: "${c.id}" ${k} is itself`);
      else if (!charIds.includes(c[k])) err(`characters: "${c.id}" ${k} "${c[k]}" is unknown`);
    }
    if (c.image !== `chars/${c.id}.svg`) err(`characters: "${c.id}" image must be chars/${c.id}.svg`);
    if (c.og !== `og/${c.id}.png`) err(`characters: "${c.id}" og must be og/${c.id}.png`);
  }

  // ---- 判定表 ----
  const rules = d.rules.rules;
  const names = new Set(metricNames(catIds));
  const ruleIds = rules.map((r) => r.id);
  for (const x of duplicates(ruleIds)) err(`rules: duplicate id "${x}"`);
  rules.forEach((r, i) => {
    if (!charIds.includes(r.id)) err(`rules: "${r.id}" is not in characters`);
    const last = i === rules.length - 1;
    if (last && r.all.length !== 0) err(`rules: last rule "${r.id}" must have empty "all"`);
    if (!last && r.all.length === 0) err(`rules: "${r.id}" has empty "all" but is not last`);
    for (const cond of r.all) {
      const [metric, op, value] = cond;
      if (cond.length !== 3 || typeof metric !== 'string' || typeof op !== 'string' || typeof value !== 'number') {
        err(`rules: "${r.id}" condition must be [metric, op, number]`);
        continue;
      }
      if (!names.has(metric)) err(`rules: "${r.id}" unknown metric "${metric}"`);
      if (!(op in OPS)) err(`rules: "${r.id}" unknown op "${op}"`);
    }
  });
  if (rules.length === 0) err('rules: empty');
  for (const c of d.characters) if (!c.hidden && !ruleIds.includes(c.id)) err(`characters: "${c.id}" has no rule`);

  // ---- プリセット ----
  for (const p of d.config.presets) {
    let total = 0;
    for (const [id, raw] of Object.entries(p.values)) {
      const v = raw ?? 0;
      if (!catIds.includes(id) || id === d.config.remainderCategory) err(`presets: "${p.id}" has invalid category "${id}"`);
      if (v % d.config.sliderStep !== 0 || v < 0) err(`presets: "${p.id}" value of "${id}" must be a multiple of ${d.config.sliderStep}`);
      total += v;
    }
    if (total > 100) err(`presets: "${p.id}" total is over 100`);
  }

  // ---- 文言（言語ごと） ----
  for (const [lang, l] of Object.entries(d.locales)) {
    for (const id of catIds) {
      const c = l.categories[id];
      if (!c || !nonEmpty(c.name) || !nonEmpty(c.note)) err(`${lang}: category "${id}" text is missing`);
    }
    for (const g of d.config.categoryGroups) if (!nonEmpty(l.categoryGroups[g])) err(`${lang}: categoryGroup "${g}" is missing`);
    for (const g of d.config.zukanGroups) if (!nonEmpty(l.zukanGroups[g])) err(`${lang}: zukanGroup "${g}" is missing`);
    for (const p of d.config.presets) if (!nonEmpty(l.presets[p.id])) err(`${lang}: preset "${p.id}" label is missing`);
    for (const id of charIds) {
      const t = l.characters[id];
      if (!t) {
        err(`${lang}: character "${id}" text is missing`);
        continue;
      }
      for (const k of ['name', 'animal', 'look', 'one', 'goodWhy', 'badWhy', 'proverb'] as const) {
        if (!nonEmpty(t[k])) err(`${lang}: character "${id}" ${k} is missing`);
      }
      for (const k of ['traits', 'aruaru'] as const) {
        if (!Array.isArray(t[k]) || t[k].length !== TEXT_LINES || !t[k].every(nonEmpty)) {
          err(`${lang}: character "${id}" ${k} must have ${TEXT_LINES} lines`);
        }
      }
    }
    for (const id of Object.keys(l.characters)) if (!charIds.includes(id)) err(`${lang}: unknown character "${id}"`);
  }

  return errors;
}
