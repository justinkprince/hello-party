// Parts gallery (Phase 1, D-42). Preview any combination of parts and colors, play the v1 clips,
// and check the skin tones. UNVERIFIED until run.
//
// TV showcase (D-51): gallery.html?tv=1&look=<url-encoded JSON>&bg=<pink|white|grey|sand|dark> hides the controls and
// shows one large character, playing idle, walk, wave, dance A, and jump in turn (3 s each, looping). The Pi has no
// keyboard, so this is how a chosen look is shown on the TV. The gallery prints a ready-made link at the bottom.
import {
  DEFAULT_SKIN_SLIDER,
  createCharacter,
  SLOTS,
  hasPart,
  listParts,
  sampleLook,
  skinFromSlider,
  type CharacterLook,
  type CharacterView,
  type ClipName,
  type Slot,
} from '../../../shared/character';

type Child = Node | string;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<HTMLElementTagNameMap[K]> = {},
  ...kids: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  Object.assign(node, props);
  node.append(...kids);
  return node;
}

const SLOT_LABELS: [Slot, string][] = [
  ['bow', 'Bow / hat'],
  ['hair', 'Hair'],
  ['face', 'Face'],
  ['outfit', 'Outfit'],
  ['accessory', 'Accessory'],
];
const CLIP_BUTTONS: [ClipName, string][] = [
  ['idle', 'Idle'],
  ['walk', 'Walk'],
  ['wave', 'Wave'],
  ['dance_a', 'Dance A'],
  ['jump', 'Jump'],
];
const BACKGROUNDS: [string, string][] = [
  ['#ffe3ee', 'Pink'],
  ['#ffffff', 'White'],
  ['#d4d4d4', 'Grey'],
  ['#f3e3bf', 'Sand'],
  ['#2b2b3a', 'Dark'],
];
const SKIN_STEPS = 9;

if (new URLSearchParams(location.search).get('tv') === '1') startShowcase();
else startGallery();

function startGallery(): void {
const look: CharacterLook = structuredClone(sampleLook);
let skinT = DEFAULT_SKIN_SLIDER;

const app = document.getElementById('app');
if (!app) throw new Error('missing #app');

// ---------- tiles: small still characters (all parts, skin tones) ----------

interface Tile {
  view: CharacterView;
  box: HTMLElement;
  make: () => CharacterLook;
  selected?: () => boolean;
}
const tiles: Tile[] = [];

function addTile(
  parent: HTMLElement,
  label: string,
  make: () => CharacterLook,
  onClick: () => void,
  selected?: () => boolean,
): void {
  const view = createCharacter(make(), { width: 96, clip: null });
  const box = el('div', { className: 'tile', title: label }, view.el, el('div', { className: 'tile-label', textContent: label }));
  box.addEventListener('click', onClick);
  tiles.push({ view, box, make, selected });
  parent.append(box);
}

// ---------- preview and controls ----------

const preview = createCharacter(look, { width: 260 });
const stage = el('div', { className: 'stage' }, preview.el);
const nodes = el('div', { className: 'small' });
const json = el('pre');
const tvLink = el('pre');
tvLink.style.whiteSpace = 'pre-wrap';
tvLink.style.overflowWrap = 'anywhere';

const clipButtons = new Map<ClipName, HTMLButtonElement>();
function setActiveClip(name: ClipName): void {
  for (const [n, b] of clipButtons) b.classList.toggle('on', n === name);
}
function playClip(name: ClipName): void {
  setActiveClip(name);
  preview.play(name, { then: 'idle', onEnd: () => setActiveClip('idle') });
}

const clipRow = el('div', { className: 'row' });
for (const [name, label] of CLIP_BUTTONS) {
  const b = el('button', { textContent: label });
  b.addEventListener('click', () => playClip(name));
  clipButtons.set(name, b);
  clipRow.append(b);
}

const bgRow = el('div', { className: 'row' });
for (const [color, label] of BACKGROUNDS) {
  const b = el('button', { className: 'swatch', title: label });
  b.style.background = color;
  b.addEventListener('click', () => {
    stage.style.background = color;
  });
  bgRow.append(b);
}

const left = el('div', {}, stage, clipRow, bgRow, nodes);

const controls = el('div', { className: 'panel' });

const selects = new Map<Slot, HTMLSelectElement>();
for (const [slot, label] of SLOT_LABELS) {
  const sel = el('select');
  for (const p of listParts(slot)) {
    sel.append(el('option', { value: p.id, textContent: p.id + (p.drawn || p.isNone ? '' : ' (not drawn)') }));
  }
  sel.value = look.parts[slot];
  sel.addEventListener('change', () => {
    look.parts[slot] = sel.value;
    refresh();
  });
  selects.set(slot, sel);
  controls.append(el('label', {}, label, sel));
}

const colorRows: ['hair' | 'bow' | 'outfit', string][] = [
  ['hair', 'Hair color'],
  ['bow', 'Bow / hat color'],
  ['outfit', 'Outfit color'],
];
for (const [key, label] of colorRows) {
  const input = el('input', { type: 'color', value: look.colors[key] });
  input.addEventListener('input', () => {
    look.colors[key] = input.value;
    refresh();
  });
  controls.append(el('label', {}, label, input));
}

const skinHex = el('span', { textContent: look.colors.skin });
const skinSlider = el('input', { type: 'range', min: '0', max: '1', step: '0.01', value: String(skinT) });
skinSlider.addEventListener('input', () => setSkin(Number(skinSlider.value)));
controls.append(el('label', {}, 'Skin tone (lighter to darker) ', skinHex, skinSlider));

function setSkin(t: number): void {
  skinT = t;
  skinSlider.value = String(t);
  look.colors.skin = skinFromSlider(t);
  skinHex.textContent = look.colors.skin;
  refresh();
}

for (const [key, label] of [
  ['glasses', 'Glasses'],
  ['freckles', 'Freckles'],
] as const) {
  const box = el('input', { type: 'checkbox', checked: look.options[key] });
  box.addEventListener('change', () => {
    look.options[key] = box.checked;
    refresh();
  });
  controls.append(el('label', { className: 'inline' }, box, label));
}

// ---------- sections ----------

function section(title: string, ...kids: Child[]): HTMLElement {
  return el('section', {}, el('h2', { textContent: title }), ...kids);
}

const skinTiles = el('div', { className: 'tiles' });
for (let i = 0; i < SKIN_STEPS; i++) {
  const t = i / (SKIN_STEPS - 1);
  addTile(
    skinTiles,
    `${t.toFixed(2)}  ${skinFromSlider(t)}`,
    () => ({ ...look, colors: { ...look.colors, skin: skinFromSlider(t) } }),
    () => setSkin(t),
    () => Math.abs(skinT - t) < 0.02,
  );
}

const partSections: HTMLElement[] = [];
for (const [slot, label] of SLOT_LABELS) {
  const row = el('div', { className: 'tiles' });
  for (const p of listParts(slot)) {
    addTile(
      row,
      p.id + (p.drawn || p.isNone ? '' : ' (not drawn)'),
      () => ({ ...look, parts: { ...look.parts, [slot]: p.id } }),
      () => {
        look.parts[slot] = p.id;
        const sel = selects.get(slot);
        if (sel) sel.value = p.id;
        refresh();
      },
      () => look.parts[slot] === p.id,
    );
  }
  partSections.push(el('div', {}, el('h3', { textContent: label }), row));
}

app.append(
  el('h1', { textContent: 'Parts gallery' }),
  el('p', {
    className: 'note',
    textContent:
      'Pick parts and colors, play the clips, try the backgrounds. Parts marked (not drawn) are empty stubs. Tiles below use your current choices.',
  }),
  el('div', { className: 'top' }, left, controls),
  section('Skin tones (click one to use it)', skinTiles),
  section('All parts (click one to use it)', ...partSections),
  section('This character as JSON (parts, colors, options)', json),
  section('TV showcase link (add it after the host and port; in a shell, put the whole URL in single quotes)', tvLink),
);

function refresh(): void {
  preview.update(look);
  for (const t of tiles) {
    t.view.update(t.make());
    if (t.selected) t.box.classList.toggle('sel', t.selected());
  }
  nodes.textContent = `${preview.nodeCount()} nodes in this character (target 40 or fewer, ceiling about 50)`;
  json.textContent = JSON.stringify({ parts: look.parts, colors: look.colors, options: look.options }, null, 2);
  tvLink.textContent =
    'gallery.html?tv=1&look=' +
    encodeURIComponent(JSON.stringify({ parts: look.parts, colors: look.colors, options: look.options }));
}

setActiveClip('idle');
refresh();
}

// ---------- TV showcase (D-51) ----------

function startShowcase(): void {
  const params = new URLSearchParams(location.search);
  const show: CharacterLook = structuredClone(sampleLook);
  let note = '';
  const raw = params.get('look');
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<CharacterLook>;
      Object.assign(show.parts, parsed.parts ?? {});
      Object.assign(show.colors, parsed.colors ?? {});
      Object.assign(show.options, parsed.options ?? {});
    } catch {
      note = 'look= is not valid JSON, showing the sample';
    }
  }
  for (const slot of SLOTS) {
    if (!hasPart(slot, show.parts[slot])) note += ` unknown ${slot} part "${show.parts[slot]}"`;
  }

  const bgName = (params.get('bg') ?? 'pink').toLowerCase();
  const bg = BACKGROUNDS.find(([, label]) => label.toLowerCase() === bgName)?.[0] ?? BACKGROUNDS[0][0];

  document.title = 'hello-party showcase';
  document.body.replaceChildren();
  Object.assign(document.body.style, { margin: '0', height: '100vh', overflow: 'hidden', background: bg, cursor: 'none' });

  const height = Math.round(window.innerHeight * 0.7);
  const view = createCharacter(show, { width: Math.round((height * 100) / 140), clip: 'idle' });
  const stage = el('div', {}, view.el);
  stage.style.cssText = 'position:fixed;left:0;right:0;top:15vh;display:flex;justify-content:center;';
  const label = el('div');
  label.style.cssText =
    'position:fixed;left:24px;bottom:20px;font:700 40px/1.2 system-ui,sans-serif;color:#222;' +
    'background:rgba(255,255,255,0.7);padding:6px 14px;border-radius:10px;';
  const noteEl = el('div', { textContent: note.trim() });
  noteEl.style.cssText = 'position:fixed;right:24px;bottom:20px;font:20px system-ui,sans-serif;color:#a00;';
  document.body.append(stage, label, noteEl);

  let i = 0;
  const next = (): void => {
    const [name, text] = CLIP_BUTTONS[i % CLIP_BUTTONS.length];
    i++;
    view.play(name, { then: 'idle' });
    label.textContent = text;
  };
  next();
  setInterval(next, 3000);
}
