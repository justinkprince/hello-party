// Throwaway Phase 0 performance spike (D-9, O-1). UNVERIFIED until run on the Pi.
// Measures: N animated DOM SVG characters (one <svg> each) + a canvas overlay of particles.
//
// URL params (all optional):
//   chars=30  particles=300  fx=1 (canvas on)  move=1 (JS movement on)
//   seconds=60 (length of a run)  autorun=1 (start a run 5 s after load)
// Keys: r run | [ ] characters -/+5 | - = particles -/+100 | p canvas | m movement | h hide panel

const params = new URLSearchParams(location.search);
const num = (key: string, fallback: number): number => {
  const v = Number(params.get(key));
  return params.has(key) && Number.isFinite(v) ? v : fallback;
};

let particleCount = num('particles', 300);
let fxOn = num('fx', 1) === 1;
let moveOn = num('move', 1) === 1;
const runSeconds = num('seconds', 60);
const autorun = num('autorun', 0) === 1;
let hudHidden = false;

const stage = document.getElementById('stage') as HTMLDivElement;
const canvas = document.getElementById('fx') as HTMLCanvasElement;
const hud = document.getElementById('hud') as HTMLDivElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

// ---------- characters ----------

const KIT_W = 140;
const KIT_H = 196;

function kitSvg(hue: number): string {
  const body = `hsl(${hue} 80% 65%)`;
  const dark = `hsl(${hue} 70% 45%)`;
  const line = 'stroke="#333" stroke-width="2"';
  return `<svg viewBox="0 0 100 140" width="${KIT_W}" height="${KIT_H}" xmlns="http://www.w3.org/2000/svg">
  <g class="bob">
    <rect class="leg l" x="32" y="100" width="13" height="30" rx="6" fill="${dark}"/>
    <rect class="leg r" x="55" y="100" width="13" height="30" rx="6" fill="${dark}"/>
    <rect x="28" y="64" width="44" height="44" rx="14" fill="${body}"/>
    <rect class="arm l" x="13" y="68" width="13" height="32" rx="6" fill="${body}"/>
    <rect class="arm r" x="74" y="68" width="13" height="32" rx="6" fill="${body}"/>
    <g class="head">
      <path d="M22 22 L26 2 L44 14 Z" fill="#fff" ${line}/>
      <path d="M78 22 L74 2 L56 14 Z" fill="#fff" ${line}/>
      <ellipse cx="50" cy="38" rx="32" ry="26" fill="#fff" ${line}/>
      <ellipse cx="38" cy="38" rx="3" ry="4" fill="#222"/>
      <ellipse cx="62" cy="38" rx="3" ry="4" fill="#222"/>
      <ellipse cx="50" cy="46" rx="4" ry="3" fill="#f6c21a"/>
      <circle cx="30" cy="46" r="4" fill="#ffb3c7"/>
      <circle cx="70" cy="46" r="4" fill="#ffb3c7"/>
      <line x1="14" y1="36" x2="27" y2="38" stroke="#333" stroke-width="1.5"/>
      <line x1="13" y1="42" x2="27" y2="42" stroke="#333" stroke-width="1.5"/>
      <line x1="14" y1="48" x2="27" y2="46" stroke="#333" stroke-width="1.5"/>
      <line x1="86" y1="36" x2="73" y2="38" stroke="#333" stroke-width="1.5"/>
      <line x1="87" y1="42" x2="73" y2="42" stroke="#333" stroke-width="1.5"/>
      <line x1="86" y1="48" x2="73" y2="46" stroke="#333" stroke-width="1.5"/>
      <g class="bow">
        <path d="M62 14 L76 6 L76 22 Z" fill="${dark}"/>
        <path d="M62 14 L48 6 L48 22 Z" fill="${dark}"/>
        <circle cx="62" cy="14" r="4" fill="${body}"/>
      </g>
    </g>
  </g>
</svg>`;
}

interface Kit {
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  baseY: number;
  wob: number;
}

const kits: Kit[] = [];
let nodesPerKit = 0;

function addKit(): void {
  const i = kits.length;
  const el = document.createElement('div');
  el.className = 'kit';
  el.innerHTML = kitSvg((i * 47) % 360);
  el.style.setProperty('--d', `${(-Math.random() * 2).toFixed(2)}s`);
  stage.appendChild(el);
  nodesPerKit = el.querySelectorAll('*').length; // the <svg> and everything inside it

  const w = window.innerWidth;
  const h = window.innerHeight;
  const top = h * 0.3;
  const range = Math.max(0, h - KIT_H - 20 - top);
  kits.push({
    el,
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
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    devicePixelRatio: window.devicePixelRatio,
    characters: kits.length,
    nodesPerCharacter: nodesPerKit,
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
    `characters ${kits.length} (${nodesPerKit} nodes each)   particles ${fxOn ? particleCount : 0}   move ${moveOn ? 'on' : 'off'}`,
    run
      ? `RUN ${Math.floor((now - run.start) / 1000)}/${runSeconds} s`
      : 'keys: r run  [ ] characters  - = particles  p canvas  m move  h panel',
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
    case 'h': hudHidden = !hudHidden; break;
  }
});

resizeCanvas();
setCharCount(num('chars', 30));
if (autorun) setTimeout(startRun, 5000);
requestAnimationFrame(frame);
