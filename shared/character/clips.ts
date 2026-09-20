// Clip metadata for the v1 clips (decision D-38). The motion itself is CSS keyframes in character.css.
// Loop clips repeat until another clip is played. One-shot clips end on `animationend` of the named
// animation, then the player goes back to idle (or to the clip asked for with `then`).
import type { ClipName } from './types';

export interface ClipDef {
  loop: boolean;
  /** For one-shot clips: the @keyframes name whose `animationend` marks the end of the clip. */
  endAnimation?: string;
}

export const CLIP_NAMES: readonly ClipName[] = ['idle', 'walk', 'wave', 'dance_a', 'jump'];

export const CLIPS: Record<ClipName, ClipDef> = {
  idle: { loop: true },
  walk: { loop: true },
  dance_a: { loop: true },
  wave: { loop: false, endAnimation: 'ch-wave-arm' },
  jump: { loop: false, endAnimation: 'ch-jump-root' },
};
