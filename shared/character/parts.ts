// Part registry (decision D-37). Every assets/parts/*.svg is bundled as text at build time
// (import.meta.glob with ?raw; UNVERIFIED until run). The parts list comes from the file names.
import { ALL_LAYERS, BASE_LAYERS, SLOTS, SLOT_LAYERS, type LayerName } from './rig';
import type { CharacterLook, Slot } from './types';

const files = import.meta.glob<string>('../../assets/parts/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

type Art = Partial<Record<LayerName, string>>;

/** File prefix (contracts.md section 7) to slot. */
const PREFIX_TO_SLOT: Record<string, Slot> = {
  ears: 'ears',
  bow: 'bow',
  hair: 'hair',
  face: 'face',
  outfit: 'outfit',
  acc: 'accessory',
};

interface PartEntry {
  id: string;
  slot: Slot;
  art: Art;
  drawn: boolean;
}

/** Pull the inner markup of each rig-layer group (by id) out of a part file. */
function parseArt(svgText: string): Art {
  const doc = new DOMParser().parseFromString(svgText, 'text/html');
  const art: Art = {};
  for (const layer of ALL_LAYERS) {
    const g = doc.querySelector(`[id="${layer}"]`);
    if (g) art[layer] = g.innerHTML;
  }
  return art;
}

const registry = new Map<string, PartEntry>();
let base: Art = {};

for (const [path, text] of Object.entries(files)) {
  const id = (path.split('/').pop() ?? '').replace(/\.svg$/, '');
  if (id === 'base') {
    base = parseArt(text);
    continue;
  }
  const slot = PREFIX_TO_SLOT[id.split('_')[0]];
  if (!slot) {
    console.warn(`[parts] ignoring ${path}: unknown slot prefix`);
    continue;
  }
  const art = parseArt(text);
  const drawn = SLOT_LAYERS[slot].some((layer) => (art[layer] ?? '').trim() !== '');
  registry.set(id, { id, slot, art, drawn });
}

if (Object.keys(base).length === 0) console.error('[parts] assets/parts/base.svg is missing or has no layer groups');

export interface PartInfo {
  id: string;
  slot: Slot;
  /** False for an empty file. Empty is fine for `_none` parts; any other empty file is a stub not yet drawn. */
  drawn: boolean;
  isNone: boolean;
}

/** Parts of one slot: "none" first, then alphabetical. */
export function listParts(slot: Slot): PartInfo[] {
  return [...registry.values()]
    .filter((p) => p.slot === slot)
    .map((p) => ({ id: p.id, slot: p.slot, drawn: p.drawn, isNone: p.id.endsWith('_none') }))
    .sort((a, b) => Number(b.isNone) - Number(a.isNone) || a.id.localeCompare(b.id));
}

export function hasPart(slot: Slot, id: string): boolean {
  return registry.get(id)?.slot === slot;
}

const warned = new Set<string>();

/** The SVG markup for every rig layer of one character. Layers with nothing to draw are empty strings. */
export function layerArt(look: CharacterLook): Record<LayerName, string> {
  const out = Object.fromEntries(ALL_LAYERS.map((layer) => [layer, ''])) as Record<LayerName, string>;
  for (const layer of BASE_LAYERS) out[layer] = base[layer] ?? '';
  if (!look.options.freckles) out.freckles = '';
  if (!look.options.glasses) out.glasses = '';
  for (const slot of SLOTS) {
    const id = look.parts[slot];
    const part = registry.get(id);
    if (!part || part.slot !== slot) {
      if (!warned.has(`${slot}:${id}`)) {
        warned.add(`${slot}:${id}`);
        console.warn(`[parts] unknown ${slot} part "${id}"`);
      }
      continue;
    }
    for (const layer of SLOT_LAYERS[slot]) out[layer] = part.art[layer] ?? '';
  }
  return out;
}
