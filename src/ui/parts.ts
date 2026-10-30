// 画面に共通の部品（画面設計 3章）

import { t } from '../i18n';
import { onSettingsChange, settings } from '../settings';
import { APP_VERSION, formatVersion } from '../version';
import { h } from './dom';

const SPEAKER_ON =
  '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const SPEAKER_OFF =
  '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 9.5l5 5m0-5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const ARROW_LEFT =
  '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** 右上の音のボタン。設定が変わると見た目も変わる。戻り値の dispose で購読を解除 */
export function soundButton(): { el: HTMLButtonElement; dispose: () => void } {
  const el = h('button', { className: 'icon-btn', attrs: { type: 'button' } });
  const paint = () => {
    el.innerHTML = settings.sound ? SPEAKER_ON : SPEAKER_OFF;
    el.setAttribute('aria-label', t(settings.sound ? 'common.soundOn' : 'common.soundOff'));
  };
  el.addEventListener('click', () => {
    settings.sound = !settings.sound;
  });
  paint();
  return { el, dispose: onSettingsChange(paint) };
}

/** 左上の「もどる」 */
export function backButton(onClick: () => void): HTMLButtonElement {
  const el = h('button', { className: 'back-btn', attrs: { type: 'button' }, on: { click: onClick } });
  el.innerHTML = ARROW_LEFT;
  el.append(t('common.back'));
  return el;
}

export function versionLabel(): HTMLElement {
  return h('span', { className: 'version', text: formatVersion(APP_VERSION) });
}

/** 全画面の最下部の免責の帯 */
export function disclaimer(): HTMLElement {
  return h('footer', { className: 'disclaimer', text: t('common.disclaimer') });
}

export function percent(value: number): string {
  return t('common.percent', { value });
}
