// 効果音（要件定義 F-20）。素材ファイルは使わず Web Audio で合成する。
// iOS は利用者が触ったときに AudioContext を作り直す・再開する必要がある（技術設計 11章）

import { settings } from './settings';

let ctx: AudioContext | null = null;

/** 最初のタッチ・クリックで呼ぶ。以後は鳴らせるようになる */
export function unlockAudio(): void {
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

type Tone = {
  freq: number;
  /** 終わりの周波数（音の高さを動かすとき） */
  to?: number;
  type?: OscillatorType;
  /** 開始までの遅れ（秒） */
  at?: number;
  dur: number;
  gain?: number;
};

function play(tones: Tone[]): void {
  if (!settings.sound || !ctx || ctx.state !== 'running') return;
  const now = ctx.currentTime;
  for (const tone of tones) {
    const t0 = now + (tone.at ?? 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = tone.type ?? 'sine';
    osc.frequency.setValueAtTime(tone.freq, t0);
    if (tone.to) osc.frequency.exponentialRampToValueAtTime(tone.to, t0 + tone.dur);
    const peak = tone.gain ?? 0.15;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + tone.dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + tone.dur + 0.02);
  }
}

export const sfx = {
  /** 診断の演出：ポン */
  pon: () => play([{ freq: 660, to: 990, dur: 0.12, gain: 0.16 }]),
  /** 結果の表示：キラン */
  reveal: () =>
    play([
      { freq: 783.99, dur: 0.14, gain: 0.12 },
      { freq: 1046.5, dur: 0.3, at: 0.11, gain: 0.12 },
      { freq: 1567.98, type: 'triangle', dur: 0.35, at: 0.2, gain: 0.06 },
    ]),
};
