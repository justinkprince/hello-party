// Character renderer and clip player (decisions D-36, D-37, D-38).
// One <div class="ch"> per character holding one <svg> (DOM SVG, D-28). Colors are CSS variables on the
// wrapper. The current clip is data-clip on the wrapper. UNVERIFIED until run on the Mac and the Pi.
import './character.css';
import { CLIPS } from './clips';
import { BODY_LAYERS, CANVAS, HEAD_LAYERS, pivotCss, type LayerName } from './rig';
import { layerArt } from './parts';
import type { CharacterLook, ClipName } from './types';

const COLOR_KEYS = ['skin', 'hair', 'bow', 'outfit'] as const;

let stylesInstalled = false;

/** Adds the generated pivot rules to the page once. createCharacter calls this. */
export function installStyles(): void {
  if (stylesInstalled || typeof document === 'undefined') return;
  stylesInstalled = true;
  const style = document.createElement('style');
  style.setAttribute('data-ch', 'pivots');
  style.textContent = pivotCss();
  document.head.append(style);
}

/** The character's <svg> markup: the rig (D-35) filled with the layers of each chosen part. */
export function buildSvg(look: CharacterLook): string {
  const art = layerArt(look);
  const group = (name: LayerName): string => `<g class="g l-${name}">${art[name]}</g>`;
  const body = BODY_LAYERS.map((name) => group(name)).join('');
  const head = HEAD_LAYERS.map((name) => group(name)).join('');
  return (
    `<svg viewBox="0 0 ${CANVAS.width} ${CANVAS.height}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
    `<g class="g l-root">${body}<g class="g l-head">${head}</g></g></svg>`
  );
}

export interface CreateOptions {
  /** Width in CSS px (height follows the 100:140 canvas). Default 140. */
  width?: number;
  /** Starting clip; null draws the still pose. Default 'idle'. */
  clip?: ClipName | null;
}

export interface PlayOptions {
  /** For one-shot clips: what to play when the clip ends. Default 'idle'. */
  then?: ClipName;
  /** Called when a one-shot clip ends (after `then` starts). */
  onEnd?: () => void;
}

export interface CharacterView {
  readonly el: HTMLDivElement;
  /** Redraw for a new look. Only a color change just sets the CSS variables and keeps the animation running. */
  update(look: CharacterLook): void;
  /** Play a clip from its start (also when it is already the current clip). */
  play(clip: ClipName, opts?: PlayOptions): void;
  /** The current clip, or null for the still pose. */
  readonly clip: ClipName | null;
  /** Elements inside the wrapper: the <svg> and everything in it (the spike counted the same way). */
  nodeCount(): number;
}

export function createCharacter(look: CharacterLook, opts: CreateOptions = {}): CharacterView {
  installStyles();
  const el = document.createElement('div');
  el.className = 'ch';
  if (opts.width) el.style.setProperty('--ch-w', `${opts.width}px`);
  // A negative delay per character so loop clips do not run in step (the spike did the same).
  el.style.setProperty('--d', `${(-Math.random() * 2).toFixed(2)}s`);

  let markupKey = '';
  let current: ClipName | null = opts.clip === undefined ? 'idle' : opts.clip;
  let then: ClipName = 'idle';
  let onEnd: (() => void) | undefined;

  function update(next: CharacterLook): void {
    for (const key of COLOR_KEYS) el.style.setProperty(`--${key}`, next.colors[key]);
    const key = JSON.stringify([next.parts, next.options]);
    if (key !== markupKey) {
      markupKey = key;
      el.innerHTML = buildSvg(next);
    }
  }

  function play(clip: ClipName, playOpts: PlayOptions = {}): void {
    current = clip;
    then = playOpts.then ?? 'idle';
    onEnd = playOpts.onEnd;
    // Removing and re-adding the attribute restarts the animations.
    el.removeAttribute('data-clip');
    void el.offsetWidth;
    el.dataset.clip = clip;
  }

  el.addEventListener('animationend', (event: AnimationEvent) => {
    if (!current) return;
    const end = CLIPS[current].endAnimation;
    if (!end || event.animationName !== end) return;
    const done = onEnd;
    play(then);
    done?.();
  });

  update(look);
  if (current) el.dataset.clip = current;

  return {
    el,
    update,
    play,
    get clip() {
      return current;
    },
    nodeCount: () => el.querySelectorAll('*').length,
  };
}
