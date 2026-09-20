// Frame rate test (decision D-42, option A). Started as the throwaway Phase 0 spike (D-9, O-1); Phase 1 swapped the
// hand-drawn placeholder for the real renderer (shared/character), keeping the same measuring so the numbers compare.
// UNVERIFIED until run on the Pi.
// Measures: N animated DOM SVG characters (one <svg> each, real parts and clips) + a canvas overlay of particles.
//
// URL params (all optional):
//   chars=30  particles=300  fx=1 (canvas on)  move=1 (JS movement on)
//   seconds=60 (length of a run)  autorun=1 (start a run 5 s after load)
//   clip=walk (idle | walk | wave | dance_a | jump; every character plays it)
//   worst=1 (the heaviest looks, near the node ceiling; otherwise random looks, the same every time)
// Keys: r run | [ ] characters -/+5 | - = particles -/+100 | p canvas | m movement | c next clip | l looks | h hide panel

import {
  CLIP_NAMES,
  SLOTS,
  createCharacter,
  listParts,
  skinFromSlider,
  type CharacterLook,
  type CharacterParts,
  type CharacterView,
  type ClipName,
} from '../../../shared/character';

const params = new URLSearchParams(location.search);
const num = (key: string, fallback: number): number => {
  const v = Number(params.get(key));
  return params.has(key) && Number.isFinite(v) ? v : fallback;
};

let particleCount = num('particles', 300);
let fxOn = num('fx', 1) === 1;
let moveOn = num('move', 1) === 1;
let worstOn = num('worst', 0) === 1;
const runSeconds = num('seconds', 60);
const autorun = num('autorun', 0) === 1;
const clipParam = params.get('clip') as ClipName | null;
let clip: ClipName = clipParam && CLIP_NAMES.includes(clipParam) ? clipParam : 'walk';
let hudHidden = false;

const stage = document.getElementById('stage') as HTMLDivElement;
const canvas = document.getElementById('fx') as HTMLCanvasElement;
const hud = document.getElementById('hud') as HTMLDivElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

// ---------- characters ----------

const KIT_W = 140;
const KIT_H = 196; // the character canvas is 100:140

/** A small seeded random generator, so the same character index always gets the same look. */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeLook(i: number, worst: boolean): CharacterLook {
  const rnd = mulberry32(i * 7919 + 13);
  const hue = (i * 47) % 360;
  const colors = {
    skin: skinFromSlider(rnd()),
    hair: `hsl(${Math.floor(rnd() * 360)} 60% 40%)`,
    bow: `hsl(${hue} 80% 50%)`,
    outfit: `hsl(${(hue + 180) % 360} 70% 55%)`,
  };
  if (worst) {
    // 46 nodes: the most any combination draws (rig 17, base 8, face_grin 5, pigtails 3, beanie 3, overalls 6, heart 2, glasses 1, freckles 1).
    return {
      parts: { bow: 'bow_beanie', hair: 'hair_pigtails', face: 'face_grin', outfit: 'outfit_overalls', accessory: 'acc_heart' },
      colors,
      options: { glasses: true, freckles: true },
    };
  }
  const parts = {} as CharacterParts;
  for (const slot of SLOTS) {
    const choices = listParts(slot).filter((p) => p.drawn || p.isNone);
    parts[slot] = choices[Math.floor(rnd() * choices.length)].id;
  }
  return { parts, colors, options: { glasses: rnd() < 0.3, freckles: rnd() < 0.3 } };
}

interface Kit {
  el: HTMLDivElement;
  view: CharacterView;
  x: number;
  y: number;
  vx: number;
  baseY: number;
  wob: number;
}

const kits: Kit[] = [];
let nodesLo = 0;
let nodesHi = 0;

function refreshNodes(): void {
  let lo = Infinity;
  let hi = 0;
  for (const k of kits) {
    const n = k.view.nodeCount();
    lo = Math.min(lo, n);
    hi = Math.max(hi, n);
  }
  nodesLo = kits.length ? lo : 0;
  nodesHi = hi;
}

function addKit(): void {
  const i = kits.length;
  const view = createCharacter(makeLook(i, worstOn), { width: KIT_W, clip });
  const el = document.createElement('div');
  el.className = 'kit';
  el.append(view.el);
  stage.appendChild(el);

  const w = window.innerWidth;
  const h = window.innerHeight;
  const top = h * 0.3;
  const range = Math.max(0, h - KIT_H - 20 - top);
  kits.push({
    el,
    view,
    x: Math.random() * Math.max(1, w - KIT_W),
    y: 0,
    vx: (40 + Math.random() * 50) * (Math.random() < 0.5 ? -1 : 1),
    baseY: top + Math.random() * range,
    wob: Math.random() * 6.28,
  });
}

function setCharCount(n: number): void {
  const target = Math.max(0, Math.min(300, Math.round(n)));
  while (kits.length < target) addKit();
  while (kits.length > target) kits.pop()?.el.remove();
  refreshNodes();
}

function nextClip(): void {
  clip = CLIP_NAMES[(CLIP_NAMES.indexOf(clip) + 1) % CLIP_NAMES.length];
  for (const k of kits) k.view.play(clip);
}

function toggleLooks(): void {
  worstOn = !worstOn;
  kits.forEach((k, i) => k.view.update(makeLook(i, worstOn)));
  refreshNodes();
}

function moveKits(now: number, dtMs: number): void {
  const w = window.innerWidth;
  for (const k of kits) {
    k.x += (k.vx * dtMs) / 1000;
    if (k.x < 0) {
      k.x = 0;
      k.vx = Math.abs(k.vx);
    } else if (k.x > w - KIT_W) {
      k.x = Math.max(0, w - KIT_W);
      k.vx = -Math.abs(k.vx);
    }
    k.y = k.baseY + Math.sin(now / 700 + k.wob) * 6;
    k.el.style.transform = `translate3d(${k.x.toFixed(1)}px, ${k.y.toFixed(1)}px, 0) scaleX(${k.vx < 0 ? -1 : 1})`;
  }
}

// ---------- canvas effects overlay ----------

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  s: number;
  r: number;
  vr: number;
  ci: number;
}

const COLORS = ['#ff4d8d', '#ffd23f', '#3ec1d3', '#8ac926', '#ff924c', '#b388eb'];
const particles: Particle[] = [];

function spawn(initial: boolean): Particle {
  return {
    x: Math.random() * canvas.width,
    y: initial ? Math.random() * canvas.height : -20,
    vx: (Math.random() - 0.5) * 60,
    vy: 60 + Math.random() * 120,
    s: 6 + Math.random() * 8,
    r: Math.random() * 6.28,
    vr: (Math.random() - 0.5) * 6,
    ci: Math.floor(Math.random() * COLORS.length),
  };
}

function resizeCanvas(): void {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
}

function drawFx(dtMs: number): void {
  while (particles.length < particleCount) particles.push(spawn(true));
  if (particles.length > particleCount) particles.length = particleCount;
  const w = canvas.width;
  const h = canvas.height;
  const k = dtMs / 1000;
  ctx.clearRect(0, 0, w, h);
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx * k;
    p.y += p.vy * k;
    p.r += p.vr * k;
    if (p.y > h + 20) particles[i] = spawn(false);
  }
  for (let ci = 0; ci < COLORS.length; ci++) {
    ctx.fillStyle = COLORS[ci];
    for (const p of particles) {
      if (p.ci !== ci) continue;
      const c = Math.cos(p.r);
      const s = Math.sin(p.r);
      ctx.setTransform(c, s, -s, c, p.x, p.y);
      ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- measuring ----------

interface Run {
  start: number;
  end: number;
  dts: number[];
  perSecond: number[];
}

let run: Run | null = null;
let lastResult = '';
let last = performance.now();
let framesSinceMark = 0;
let markAt = last;
let fps = 0;

function startRun(): void {
  const now = performance.now();
  run = { start: now, end: now + runSeconds * 1000, dts: [], perSecond: [] };
  lastResult = '';
}

function finishRun(): void {
  const r = run;
  run = null;
  if (!r) return;
  const per: number[] = [];
  for (let i = 0; i < runSeconds; i++) per.push(r.perSecond[i] ?? 0);
  const totalFrames = per.reduce((a, b) => a + b, 0);
  const sorted = [...r.dts].sort((a, b) => a - b);
  const p99 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.99))] ?? 0;
  const worst = sorted[sorted.length - 1] ?? 0;
  const result = {
    when: new Date().toISOString(),
    test: 'real characters (shared/character)',
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    devicePixelRatio: window.devicePixelRatio,
    characters: kits.length,
    nodesPerCharacterMin: nodesLo,
    nodesPerCharacterMax: nodesHi,
    clip,
    looks: worstOn ? 'worst' : 'random',
    particles: fxOn ? particleCount : 0,
    jsMovement: moveOn,
    seconds: runSeconds,
    avgFps: Number((totalFrames / runSeconds).toFixed(1)),
    minOneSecondFps: Math.min(...per),
    p99FrameMs: Number(p99.toFixed(1)),
    worstFrameMs: Number(worst.toFixed(1)),
    framesOver20ms: r.dts.filter((d) => d > 20).length,
    framesOver33ms: r.dts.filter((d) => d > 33.4).length,
  };
  const json = JSON.stringify(result, null, 2);
  console.log('[spike result]', json);
  lastResult =
    `RESULT avg ${result.avgFps} fps | min 1 s ${result.minOneSecondFps} fps | ` +
    `p99 ${result.p99FrameMs} ms | worst ${result.worstFrameMs} ms | >33 ms: ${result.framesOver33ms}`;
  fetch('/__spike-result', { method: 'POST', body: json }).catch(() => {
    // no result endpoint (for example a plain static server); the on-screen line still shows it
  });
}

function renderHud(now: number): void {
  if (hudHidden) {
    hud.style.display = 'none';
    return;
  }
  hud.style.display = 'block';
  const lines = [
    `fps ${fps.toFixed(1)}   ${window.innerWidth}x${window.innerHeight} @${window.devicePixelRatio}x`,
    `characters ${kits.length} (${nodesLo}-${nodesHi} nodes)   clip ${clip}   looks ${worstOn ? 'worst' : 'random'}`,
    `particles ${fxOn ? particleCount : 0}   move ${moveOn ? 'on' : 'off'}`,
    run
      ? `RUN ${Math.floor((now - run.start) / 1000)}/${runSeconds} s`
      : 'keys: r run  [ ] characters  - = particles  p canvas  m move  c clip  l looks  h panel',
    lastResult,
  ];
  hud.textContent = lines.join('\n');
}

function frame(now: number): void {
  const dt = now - last;
  last = now;
  const simDt = Math.min(dt, 100); // a stalled frame should not teleport characters

  if (moveOn) moveKits(now, simDt);
  if (fxOn) drawFx(simDt);
  else ctx.clearRect(0, 0, canvas.width, canvas.height);

  framesSinceMark++;
  if (now - markAt >= 500) {
    fps = (framesSinceMark * 1000) / (now - markAt);
    framesSinceMark = 0;
    markAt = now;
    renderHud(now);
  }

  if (run) {
    run.dts.push(dt);
    const sec = Math.max(0, Math.floor((now - run.start) / 1000));
    run.perSecond[sec] = (run.perSecond[sec] ?? 0) + 1;
    if (now >= run.end) finishRun();
  }
  requestAnimationFrame(frame);
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'r': startRun(); break;
    case '[': setCharCount(kits.length - 5); break;
    case ']': setCharCount(kits.length + 5); break;
    case '-': particleCount = Math.max(0, particleCount - 100); break;
    case '=': particleCount += 100; break;
    case 'p': fxOn = !fxOn; break;
    case 'm': moveOn = !moveOn; break;
    case 'c': nextClip(); break;
    case 'l': toggleLooks(); break;
    case 'h': hudHidden = !hudHidden; break;
  }
});

resizeCanvas();
setCharCount(num('chars', 30));
if (autorun) setTimeout(startRun, 5000);
requestAnimationFrame(frame);
