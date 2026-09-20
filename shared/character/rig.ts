// The shared rig (decision D-35). Every clip depends on these names, their order, and the pivots.
// Changing any of them after clips exist needs a new decision in docs/decisions.md.
import type { Slot } from './types';

export const CANVAS = { width: 100, height: 140 } as const;

export const SLOTS: readonly Slot[] = ['ears', 'bow', 'hair', 'face', 'outfit', 'accessory'];

/** Body layers, back to front, inside the root group. */
export const BODY_LAYERS = ['leg_l', 'leg_r', 'body', 'outfit', 'accessory', 'arm_l', 'arm_r'] as const;

/** Head layers, back to front, inside the head group (which is drawn after the body layers). */
export const HEAD_LAYERS = [
  'ears',
  'hair_back',
  'head_base',
  'face',
  'freckles',
  'hair_front',
  'glasses',
  'bow',
] as const;

export type LayerName = (typeof BODY_LAYERS)[number] | (typeof HEAD_LAYERS)[number];

export const ALL_LAYERS: readonly LayerName[] = [...BODY_LAYERS, ...HEAD_LAYERS];

/** Nodes in the rig itself: the <svg>, root, 7 body layers, head, and 8 head layers (D-35). */
export const RIG_NODE_COUNT = 18;

/** Layers drawn by assets/parts/base.svg. freckles and glasses are shown only when the option is on. */
export const BASE_LAYERS: readonly LayerName[] = [
  'leg_l',
  'leg_r',
  'body',
  'arm_l',
  'arm_r',
  'head_base',
  'freckles',
  'glasses',
];

/** Which layers each part slot fills. One `hair` part supplies both hair layers (D-35). */
export const SLOT_LAYERS: Record<Slot, readonly LayerName[]> = {
  ears: ['ears'],
  bow: ['bow'],
  hair: ['hair_back', 'hair_front'],
  face: ['face'],
  outfit: ['outfit'],
  accessory: ['accessory'],
};

/**
 * Pivots in viewBox units (D-35). Keys are the layer groups that rotate.
 * root = feet (bob and jump); head = neck; legs = hips; arms = shoulders.
 */
export const PIVOTS = {
  root: [50, 130],
  head: [50, 64],
  leg_l: [38.5, 102],
  leg_r: [61.5, 102],
  arm_l: [19.5, 70],
  arm_r: [80.5, 70],
} as const;

/** CSS that puts each pivot in one place (D-38). UNVERIFIED on the Pi's Chromium (transform-box: view-box). */
export function pivotCss(): string {
  return (Object.entries(PIVOTS) as [string, readonly [number, number]][])
    .map(([layer, [x, y]]) => `.ch .l-${layer}{transform-origin:${x}px ${y}px}`)
    .join('\n');
}
