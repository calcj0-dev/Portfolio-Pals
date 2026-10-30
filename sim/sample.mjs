// 実際にありそうな構成比のサンプルを作る（乱数はシード固定で再現できる）
import { CATEGORY_IDS } from './judge.mjs';
export function mulberry32(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const uni = (rng, [lo, hi]) => lo + rng() * (hi - lo);

// 5%刻みにそろえ、合計を100にする（ずれは現金で吸収。現金が足りなければ一番大きい区分で吸収）
export function roundTo5(raw) {
  const p = Object.fromEntries(CATEGORY_IDS.map((k) => [k, Math.max(0, Math.round((raw[k] || 0) / 5) * 5)]));
  let sum = CATEGORY_IDS.reduce((s, k) => s + p[k], 0);
  let diff = 100 - sum;
  if (diff !== 0) {
    if (p.cash + diff >= 0) p.cash += diff;
    else { diff += p.cash; p.cash = 0; const big = CATEGORY_IDS.reduce((a, b) => (p[a] >= p[b] ? a : b)); p[big] += diff; }
  }
  return p;
}

export function samplePortfolio(rng, persona) {
  const raw = {};
  if (persona.pick) { const k = persona.pick.from[Math.floor(rng() * persona.pick.from.length)]; raw[k] = uni(rng, persona.pick.range); }
  for (const [k, r] of Object.entries(persona.parts || {})) raw[k] = (raw[k] || 0) + uni(rng, r);
  if (persona.spread) {
    const n = Math.round(uni(rng, persona.spread.count));
    const ks = [...CATEGORY_IDS].sort(() => rng() - 0.5).slice(0, n);
    for (const k of ks) raw[k] = (raw[k] || 0) + uni(rng, persona.spread.range);
  }
  let total = CATEGORY_IDS.reduce((s, k) => s + (raw[k] || 0), 0);
  if (total > 100) { for (const k of CATEGORY_IDS) if (raw[k]) raw[k] = (raw[k] * 100) / total; total = 100; }
  raw.cash = (raw.cash || 0) + (100 - total);
  return roundTo5(raw);
}

export function* samples(personas, n, seed = 20261030) {
  const rng = mulberry32(seed);
  const tw = personas.reduce((s, p) => s + p.weight, 0);
  for (let i = 0; i < n; i++) {
    let x = rng() * tw, per = personas[personas.length - 1];
    for (const p of personas) { x -= p.weight; if (x < 0) { per = p; break; } }
    yield { persona: per.id, p: samplePortfolio(rng, per) };
  }
}
