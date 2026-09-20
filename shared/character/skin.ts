// Skin slider color logic (decision D-40). One slider from 0 to 1 over hand-picked anchor tones,
// blended between anchors. The stored value is a single hex string in colors.skin.
// The anchors are a first guess: Justin judges them by eye in the gallery.

export const DEFAULT_SKIN = '#c68642';

export const SKIN_ANCHORS: readonly { t: number; hex: string }[] = [
  { t: 0, hex: '#fbe0cd' },
  { t: 0.25, hex: '#e9b98e' },
  { t: 0.5, hex: DEFAULT_SKIN },
  { t: 0.75, hex: '#8d5524' },
  { t: 1, hex: '#5b3a24' },
];

/** The slider position that gives DEFAULT_SKIN. */
export const DEFAULT_SKIN_SLIDER = 0.5;

function parseHex(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(rgb: [number, number, number]): string {
  return '#' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');
}

export function skinFromSlider(t: number): string {
  const x = Math.min(1, Math.max(0, t));
  for (let i = 1; i < SKIN_ANCHORS.length; i++) {
    const a = SKIN_ANCHORS[i - 1];
    const b = SKIN_ANCHORS[i];
    if (x <= b.t) {
      const k = (x - a.t) / (b.t - a.t);
      const ca = parseHex(a.hex);
      const cb = parseHex(b.hex);
      return toHex([ca[0] + (cb[0] - ca[0]) * k, ca[1] + (cb[1] - ca[1]) * k, ca[2] + (cb[2] - ca[2]) * k]);
    }
  }
  return SKIN_ANCHORS[SKIN_ANCHORS.length - 1].hex;
}
