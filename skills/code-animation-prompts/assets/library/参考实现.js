// 参考实现.js — 由素材库 .md 中的参考实现自动打包生成（风格挑选器动态预览用）。
// 生成脚本：仓库 scripts 之外的本地工具；样式绘制函数 S.xx(c, w, h, t, s) 与 A-G 样片同约定。
(function () {
'use strict';

// A–G 参考实现共用的小工具函数
const SANS = '"Noto Sans SC", "PingFang SC", sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';
const TAU = Math.PI * 2;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const eOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const eBack = t => { t = clamp(t, 0, 1); const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const nz = (x, y, t) => Math.sin(x * 1.7 + t) * Math.cos(y * 1.3 - t * 0.7) + Math.sin((x + y) * 0.9 + t * 0.5) * 0.5 + Math.cos(x * 0.6 - y * 1.1 - t * 0.3) * 0.35;
const hex = (h, a = 1) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
const toRGB = h => h[0] === '#' ? (n => [n >> 16 & 255, n >> 8 & 255, n & 255])(parseInt(h.slice(1), 16)) : h.match(/[\d.]+/g).slice(0, 3).map(Number);
const mixHex = (h1, h2, t) => { const a = toRGB(h1), b = toRGB(h2), c = k => Math.round(lerp(a[k], b[k], t)); return `rgb(${c(0)},${c(1)},${c(2)})`; };
function vgrad(ctx, h, c1, c2) { const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, c1); g.addColorStop(1, c2); return g; }
function glowDot(ctx, x, y, r, col, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, hex(col, a)); g.addColorStop(1, hex(col, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
function offscreen(w, h, dpr) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * dpr)); c.height = Math.max(1, Math.round(h * dpr)); const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); return [c, x]; }
function paperTex(w, h, dpr, base, seed) {
  const [c, x] = offscreen(w, h, dpr); const r = rng(seed);
  x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (let i = 0; i < w * h / 40; i++) { x.fillStyle = r() < .5 ? 'rgba(0,0,0,.035)' : 'rgba(255,255,255,.05)'; x.fillRect(r() * w, r() * h, 1, 1); }
  x.strokeStyle = 'rgba(90,70,40,.05)'; x.lineWidth = .6;
  for (let i = 0; i < w * h / 900; i++) { const px = r() * w, py = r() * h, a = r() * TAU, l = 4 + r() * 14; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  return c;
}


var S = {};

// ---- A1 ----
S.A1 = (c, w, h, t, s) => {
  if (!s.init) { s.init = 1; s.r = rng(3); s.drops = []; s.pile = []; for (let i = 0; i < 26; i++) s.drops.push(spawn(true)); }
  function spawn(first) { const r = s.r, base = Math.min(w, h) / 17, k = [0.55, 0.7, 0.9, 1.2, 1.7][Math.floor(r() * 5)]; return { txt: PARENT[Math.floor(r() * PARENT.length)], size: base * k, x: r() * w * 0.92 - w * 0.04, y: first ? -r() * h * 1.2 : -base * 2, v: (h / 300) * (36 + base * k * 3.2) }; }
  const dt = clamp(t - (s.lt ?? t), 0, .05); s.lt = t;
  c.fillStyle = vgrad(c, h, '#0b0e15', '#050608'); c.fillRect(0, 0, w, h);
  const ground = h - 10 - Math.min(s.pile.length, 60) * h * 0.004;
  c.textBaseline = 'alphabetic';
  for (const p of s.pile) { c.font = `${p.size}px ${SERIF}`; c.fillStyle = `rgba(150,164,190,${p.a})`; c.fillText(p.txt, p.x, p.y); }
  for (const d of s.drops) {
    d.y += d.v * dt;
    if (d.y >= ground) { s.pile.push({ txt: d.txt, size: d.size * 0.9, x: d.x, y: ground + s.r() * 8, a: .32 }); Object.assign(d, spawn(false)); }
    c.font = `${d.size}px ${SERIF}`; c.fillStyle = `rgba(214,224,242,${0.25 + d.size / (Math.min(w, h) / 17) * 0.35})`; c.fillText(d.txt, d.x, d.y);
  }
  if (s.pile.length > 70) s.pile.splice(0, 8);
  glowDot(c, w * 0.5, h - 14, 14, '#f1b25c', .55 + .35 * (Math.sin(t * 5) > 0 ? 1 : 0.2));
};

// ---- A2 ----
S.A2 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; let tt = 0, str = ''; const st = [[0, '']];
    const ops = [['type', '我其实一直想跟你说'], ['wait', 1.1], ['del', 6], ['wait', .5], ['type', '没事。'], ['wait', 1.6], ['del', 3], ['wait', .4], ['type', '……'], ['wait', 1.6], ['clear']];
    for (const [k, v] of ops) {
      if (k === 'type') for (const ch of v) { tt += .17; str += ch; st.push([tt, str]); }
      else if (k === 'wait') tt += v;
      else if (k === 'del') for (let i = 0; i < v; i++) { tt += .07; str = str.slice(0, -1); st.push([tt, str]); }
      else { tt += .4; str = ''; st.push([tt, str]); }
    }
    s.st = st; s.len = tt + .8;
  }
  const tm = t % s.len; let i = 0; while (i + 1 < s.st.length && s.st[i + 1][0] <= tm) i++;
  const str = s.st[i][1], since = tm - s.st[i][0];
  c.fillStyle = '#0b0b0c'; c.fillRect(0, 0, w, h);
  const fs = Math.min(w / 10.5, h / 7); c.font = `500 ${fs}px ${SERIF}`; c.textBaseline = 'middle';
  const x0 = w * 0.1, y0 = h * 0.5; c.fillStyle = '#ece8df'; c.fillText(str, x0, y0);
  const cx = x0 + c.measureText(str).width + fs * 0.12;
  const on = since < .45 || Math.floor(tm * 1.8) % 2 === 0;
  if (on) { c.fillStyle = '#f1b25c'; c.fillRect(cx, y0 - fs * 0.55, Math.max(2, fs * 0.07), fs * 1.1); glowDot(c, cx, y0, fs * 0.9, '#f1b25c', .18); }
};

// ---- A3 ----
S.A3 = (c, w, h, t, s) => {
  const L = [["你", .17, .33, .30, 0], ["懂", .40, .30, .22, 0], ["什么", .70, .33, .17, 0], ["我", .19, .64, .20, 0], ["都是", .43, .62, .14, 0], ["为你好", .63, .84, .16, 1], ["听话", .80, .60, .13, 0], ["！", .90, .84, .22, 1]];
  const beat = .4, len = L.length * beat + 1.4, tm = t % len, k = Math.floor(tm / beat), age = tm - k * beat;
  const m = Math.min(w, h), hit = k < L.length ? Math.exp(-age * 9) : 0;
  c.fillStyle = mixHex('#08080a', '#2a2a2e', hit * .5); c.fillRect(0, 0, w, h);
  const sx = (Math.sin(t * 91) * 6) * hit, sy = (Math.cos(t * 77) * 6) * hit;
  c.save(); c.translate(sx, sy); c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = 0; i <= Math.min(k, L.length - 1); i++) {
    const [txt, fx0, fy, fz, red] = L[i], newest = i === k, port = h > w, fx = port ? .5 + (fx0 - .5) * .85 : fx0;
    const sc = newest ? 1 + .9 * Math.exp(-age * 16) : 1;
    c.font = `900 ${fz * m * (port ? .95 : 1.45) * sc}px ${SANS}`;
    c.fillStyle = red ? (newest ? '#ff4a32' : '#a3392a') : (newest ? '#ffffff' : '#55565c');
    c.fillText(txt, fx * w, fy * h);
  }
  c.restore();
};

// ---- A4 ----
S.A4 = (c, w, h, t, s) => {
  c.fillStyle = '#04050a'; c.fillRect(0, 0, w, h);
  const N = 14, R = Math.hypot(w, h) * 0.5, txt = '为什么是我为什么不能说为什么';
  c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = 0; i < N; i++) {
    const p = ((i / N) + t * 0.08) % 1, r = R * (0.03 + Math.pow(p, 2.6) * 1.6), a = Math.sin(Math.PI * p) * .9;
    if (r < 3) continue;
    const n = 20, rot = i * .37 + t * .18 * (i % 2 ? 1 : -1), fs = r * 0.15;
    c.font = `500 ${fs}px ${SERIF}`; c.fillStyle = `rgba(${lerp(120, 230, p)},${lerp(140, 225, p)},${lerp(200, 240, p)},${a})`;
    for (let j = 0; j < n; j++) { const an = rot + j / n * TAU; c.save(); c.translate(w / 2 + Math.cos(an) * r, h / 2 + Math.sin(an) * r); c.rotate(an + Math.PI / 2); c.fillText(txt[(i * 3 + j) % txt.length], 0, 0); c.restore(); }
  }
  glowDot(c, w / 2, h / 2, Math.min(w, h) * .12, '#7f8fd6', .25);
};

// ---- A5 ----
S.A5 = (c, w, h, t, s, dpr) => {
  if (!s.init) {
    s.init = 1; const P = ['都是我的错', '那不是我的错'], pts = [];
    for (const p of P) {
      const [oc, ox] = offscreen(w, h, 1), lines = h > w ? [p.slice(0, Math.ceil(p.length / 2)), p.slice(Math.ceil(p.length / 2))] : [p];
      const fs = Math.min(w * 0.82 / Math.max(...lines.map(l => l.length)), h * 0.34 / lines.length);
      ox.fillStyle = '#fff'; ox.font = `900 ${fs}px ${SERIF}`; ox.textAlign = 'center'; ox.textBaseline = 'middle';
      lines.forEach((l, i) => ox.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * fs * 1.15));
      const d = ox.getImageData(0, 0, oc.width, oc.height).data, st = Math.max(2, Math.round(fs / 26)), arr = [];
      for (let y = 0; y < oc.height; y += st) for (let x = 0; x < oc.width; x += st) if (d[(y * oc.width + x) * 4 + 3] > 128) arr.push([x, y]);
      pts.push(arr);
    }
    const r = rng(9), N = Math.min(1800, Math.max(pts[0].length, pts[1].length));
    s.p = []; for (let i = 0; i < N; i++) { const a = pts[0][Math.floor(r() * pts[0].length)], b = pts[1][Math.floor(r() * pts[1].length)], an = r() * TAU, rr = Math.sqrt(r()) * Math.min(w, h) * .55; s.p.push([a[0], a[1], b[0], b[1], w / 2 + Math.cos(an) * rr * 1.4, h / 2 + Math.sin(an) * rr, r()]); }
  }
  const q = t % 9; c.fillStyle = '#07070a'; c.fillRect(0, 0, w, h);
  let col;
  for (const p of s.p) {
    let x, y, k;
    if (q < 2) { x = p[0]; y = p[1]; k = 0; }
    else if (q < 3.3) { const e = eOut((q - 2) / 1.3); x = lerp(p[0], p[4], e); y = lerp(p[1], p[5], e); k = e * .5; }
    else if (q < 4.9) { const e = ss(0, 1, (q - 3.3) / 1.6 - p[6] * .15); x = lerp(p[4], p[2], e); y = lerp(p[5], p[3], e); k = .5 + e * .5; }
    else if (q < 7.4) { x = p[2]; y = p[3]; k = 1; }
    else { const e = ss(7.4, 9, q); x = lerp(p[2], p[0], e); y = lerp(p[3], p[1], e); k = 1 - e; }
    const j = 1.2; x += Math.sin(t * 2 + p[6] * 40) * j; y += Math.cos(t * 1.7 + p[6] * 30) * j;
    col = mixHex('#9aa9c4', '#f6be72', k); c.fillStyle = col; c.fillRect(x, y, 1.6, 1.6);
  }
};

// ---- B1 ----
S.B1 = (c, w, h, t, s, dpr) => {
  if (!s.init) { s.init = 1; [s.bc, s.bx] = offscreen(w, h, dpr); s.bx.fillStyle = '#05080d'; s.bx.fillRect(0, 0, w, h); const r = rng(5); s.r = r; s.p = []; for (let i = 0; i < 800; i++) s.p.push([r() * w, r() * h, r() * 200, r()]); }
  const b = s.bx, sc = 3.2 / Math.min(w, h); b.fillStyle = 'rgba(5,8,13,.07)'; b.fillRect(0, 0, w, h); b.lineWidth = .8;
  for (const p of s.p) {
    const a = nz(p[0] * sc, p[1] * sc, t * .12) * Math.PI, sp = Math.min(w, h) / 260;
    const nx = p[0] + Math.cos(a) * sp, ny = p[1] + Math.sin(a) * sp;
    b.strokeStyle = `hsla(${195 + p[3] * 40},60%,${62 + p[3] * 25}%,.4)`; b.beginPath(); b.moveTo(p[0], p[1]); b.lineTo(nx, ny); b.stroke();
    p[0] = nx; p[1] = ny; p[2]--;
    if (p[2] < 0 || nx < 0 || nx > w || ny < 0 || ny > h) { p[0] = s.r() * w; p[1] = s.r() * h; p[2] = 80 + s.r() * 200; }
  }
  c.drawImage(s.bc, 0, 0, w, h);
};

// ---- B2 ----
S.B2 = (c, w, h, t, s) => {
  if (!s.init) { s.init = 1; const r = rng(7); s.p = []; for (let i = 0; i < 70; i++) s.p.push({ x: r() * w, y: r() * h, z: r(), ph: r() * TAU, f: .5 + r() * 1.5 }); }
  const g = c.createRadialGradient(w * .5, h * .7, 0, w * .5, h * .7, Math.hypot(w, h) * .7); g.addColorStop(0, '#231409'); g.addColorStop(1, '#060403'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = 'lighter'; const m = Math.min(w, h) / 300;
  for (const p of s.p) {
    const z = p.z, size = (1.2 + z * z * 24) * m, vy = (5 + z * 16) * m;
    const y = ((p.y - t * vy) % (h + 60) + h + 60) % (h + 60) - 30, x = p.x + Math.sin(t * .4 * p.f + p.ph) * 18 * m;
    const fl = .55 + .45 * Math.sin(t * p.f * 2.2 + p.ph), a = (z > .8 ? .13 : .55) * fl;
    glowDot(c, x, y, size * (z > .8 ? 1.6 : 1), z > .5 ? '#ffb664' : '#ffd79a', a);
    if (z < .8) { c.fillStyle = `rgba(255,236,200,${.8 * fl})`; c.beginPath(); c.arc(x, y, Math.max(.6, size * .12), 0, TAU); c.fill(); }
  }
  c.globalCompositeOperation = 'source-over';
};

// ---- B4 ----
S.B4 = (c, w, h, t, s) => {
  if (!s.init) { s.init = 1; const r = rng(13); s.n = []; for (let i = 0; i < 60; i++) s.n.push([r() * w, r() * h, (r() - .5) * 12, (r() - .5) * 12]); }
  const dt = clamp(t - (s.lt ?? t), 0, .05); s.lt = t;
  c.fillStyle = vgrad(c, h, '#070b18', '#03040a'); c.fillRect(0, 0, w, h);
  const D = Math.min(w, h) * .24, me = [w * .5 + Math.sin(t * .3) * w * .08, h * .5 + Math.cos(t * .23) * h * .08];
  for (const p of s.n) { p[0] += p[2] * dt; p[1] += p[3] * dt; if (p[0] < 0 || p[0] > w) p[2] *= -1; if (p[1] < 0 || p[1] > h) p[3] *= -1; }
  c.lineWidth = .7;
  for (let i = 0; i < s.n.length; i++) for (let j = i + 1; j < s.n.length; j++) {
    const a = s.n[i], b = s.n[j], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (d < D) { c.strokeStyle = `rgba(150,175,230,${(1 - d / D) * .45})`; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
  }
  for (const p of s.n) { const d = Math.hypot(p[0] - me[0], p[1] - me[1]); if (d < D * 1.3) { c.strokeStyle = `rgba(241,178,92,${(1 - d / (D * 1.3)) * (.35 + .3 * Math.sin(t * 3 + p[0]))})`; c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(me[0], me[1]); c.stroke(); } }
  c.fillStyle = '#dfe6ff'; for (const p of s.n) { c.beginPath(); c.arc(p[0], p[1], 1.4, 0, TAU); c.fill(); }
  glowDot(c, me[0], me[1], 16, '#f1b25c', .7); c.fillStyle = '#fff1d8'; c.beginPath(); c.arc(me[0], me[1], 2.6, 0, TAU); c.fill();
};

// ---- B5 ----
S.B5 = (c, w, h, t, s) => {
  if (!s.init) { s.init = 1; const r = rng(17); s.p = Array.from({ length: 750 }, () => [r() * TAU, Math.sqrt(r()), r()]); }
  const b = .5 - .5 * Math.cos(TAU * t / 8), R = Math.min(w, h) * .33 * (.55 + .45 * b);
  c.fillStyle = '#061213'; c.fillRect(0, 0, w, h);
  glowDot(c, w / 2, h / 2, R * 1.3, '#4fb7a8', .12 + .1 * b);
  c.fillStyle = mixHex('#5fbfb0', '#dff3ec', b);
  for (const p of s.p) { const a = p[0] + t * .05 * (p[2] - .5), rr = p[1] * R + Math.sin(t * 1.3 + p[2] * 50) * 2; c.fillRect(w / 2 + Math.cos(a) * rr, h / 2 + Math.sin(a) * rr, 1.4, 1.4); }
  const rising = Math.sin(TAU * t / 8) > 0; c.font = `500 ${Math.min(w, h) / 20}px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(220,240,235,.55)'; c.fillText(rising ? '吸气' : '呼气', w / 2, h / 2 + Math.min(w, h) * .42);
};

// ---- C1 ----
S.C1 = (c, w, h, t, s, dpr) => {
  if (!s.init) {
    s.init = 1; s.paper = paperTex(w, h, dpr, '#e9e2d2', 21); const r = rng(23);
    s.blobs = [[.3, .45, .26, .2], [.62, .38, .2, 1.5], [.48, .66, .16, 3.0], [.78, .62, .12, 4.2]].map(([x, y, R, t0]) => ({ x, y, R, t0, k: Array.from({ length: 16 }, () => [(r() - .5) * .5, (r() - .5) * .5, .4 + r() * .6]) }));
  }
  const tm = t % 10; c.drawImage(s.paper, 0, 0, w, h); const m = Math.min(w, h);
  c.globalCompositeOperation = 'multiply';
  for (const b of s.blobs) {
    const age = tm - b.t0; if (age <= 0) continue; const g = 1 - Math.exp(-age * .9), R = b.R * m * g;
    for (const [dx, dy, kk] of b.k) { const gr = c.createRadialGradient(b.x * w + dx * R, b.y * h + dy * R, 0, b.x * w + dx * R, b.y * h + dy * R, R * kk); gr.addColorStop(0, 'rgba(28,28,32,.22)'); gr.addColorStop(.7, 'rgba(28,28,32,.08)'); gr.addColorStop(1, 'rgba(28,28,32,0)'); c.fillStyle = gr; c.beginPath(); c.arc(b.x * w + dx * R, b.y * h + dy * R, R * kk, 0, TAU); c.fill(); }
  }
  c.globalCompositeOperation = 'source-over';
  const sz = m * .085, sx = w * .06, sy = h - sz - h * .07; c.fillStyle = '#b3352a'; c.fillRect(sx, sy, sz, sz);
  c.fillStyle = '#f3e6d6'; c.font = `700 ${sz * .38}px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('俯仰', sx + sz / 2, sy + sz / 2);
  const f = ss(8.6, 10, tm); if (f > 0) { c.globalAlpha = f; c.drawImage(s.paper, 0, 0, w, h); c.globalAlpha = 1; }
};

// ---- C2 ----
S.C2 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const m = Math.min(w, h), P = (x, y) => [x * w, y * h], circ = (cx, cy, r, n) => Array.from({ length: n + 1 }, (_, i) => [cx * w + Math.cos(-Math.PI / 2 + i / n * TAU) * r * m, cy * h + Math.sin(-Math.PI / 2 + i / n * TAU) * r * m]);
    s.strokes = [
      [[.04, .72], [.96, .72]].map(p => P(...p)),
      [[.06, .72], [.18, .5], [.27, .6], [.42, .36], [.55, .56], [.66, .47], [.79, .61], [.94, .52]].map(p => P(...p)),
      circ(.76, .27, .07, 48),
      circ(.3, .61, .02, 20),
      [[.3, .633], [.3, .68], [.29, .72]].map(p => P(...p)), [[.3, .68], [.31, .72]].map(p => P(...p)), [[.288, .665], [.3, .645], [.312, .665]].map(p => P(...p)),
    ];
    s.total = 0; for (const st of s.strokes) { st.len = 0; for (let i = 1; i < st.length; i++) st.len += Math.hypot(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]); s.total += st.len; }
  }
  const tm = t % 10, p = eOut(clamp(tm / 6.5, 0, 1)) * s.total, fade = 1 - ss(8.8, 10, tm);
  c.fillStyle = '#121722'; c.fillRect(0, 0, w, h);
  c.strokeStyle = `rgba(242,239,232,${fade})`; c.lineWidth = Math.max(1.4, Math.min(w, h) / 220); c.lineCap = 'round'; c.lineJoin = 'round';
  let left = p, tip = null;
  for (const st of s.strokes) {
    if (left <= 0) break; c.beginPath(); c.moveTo(st[0][0], st[0][1]);
    for (let i = 1; i < st.length; i++) { const sl = Math.hypot(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]); if (left >= sl) { c.lineTo(st[i][0], st[i][1]); left -= sl; tip = st[i]; } else { const k = left / sl; tip = [lerp(st[i - 1][0], st[i][0], k), lerp(st[i - 1][1], st[i][1], k)]; c.lineTo(tip[0], tip[1]); left = 0; break; } }
    c.stroke();
  }
  if (tip && tm < 6.6) glowDot(c, tip[0], tip[1], 14, '#f1b25c', .8);
};

// ---- C3 ----
S.C3 = (c, w, h, t, s) => {
  const cols = 60, rows = Math.max(8, Math.round(cols * h / w)), cw = w / cols, ch = h / rows;
  const cen = [0, 1, 2, 3, 4].map(i => [.5 + .32 * Math.sin(t * .13 * (1 + i * .3) + i * 2), .5 + .3 * Math.cos(t * .11 * (1 + i * .2) + i * 1.3), .16 + .05 * i]);
  const f = (x, y) => { let v = 0; for (const [cx, cy, r] of cen) { const dx = (x - cx) * (w / Math.min(w, h)), dy = (y - cy) * (h / Math.min(w, h)); v += Math.exp(-(dx * dx + dy * dy) / (r * r)); } return v + .08 * Math.sin(x * 9 + t * .3) * Math.cos(y * 7); };
  const G = []; for (let j = 0; j <= rows; j++) { const row = []; for (let i = 0; i <= cols; i++) row.push(f(i / cols, j / rows)); G.push(row); }
  c.fillStyle = '#0c120f'; c.fillRect(0, 0, w, h);
  for (let L = 1; L <= 11; L++) {
    const lv = L * .13; c.strokeStyle = L === 6 ? 'rgba(244,196,120,.95)' : `rgba(214,182,128,${.18 + L * .04})`; c.lineWidth = L === 6 ? 1.6 : .8; c.beginPath();
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const a = G[j][i], b = G[j][i + 1], d = G[j + 1][i], e = G[j + 1][i + 1];
      const idx = (a > lv ? 8 : 0) | (b > lv ? 4 : 0) | (e > lv ? 2 : 0) | (d > lv ? 1 : 0); if (idx === 0 || idx === 15) continue;
      const x = i * cw, y = j * ch, T = [x + cw * (lv - a) / (b - a), y], R = [x + cw, y + ch * (lv - b) / (e - b)], B = [x + cw * (lv - d) / (e - d), y + ch], Lf = [x, y + ch * (lv - a) / (d - a)];
      const seg = { 1: [Lf, B], 2: [B, R], 3: [Lf, R], 4: [T, R], 5: [Lf, T, B, R], 6: [T, B], 7: [Lf, T], 8: [Lf, T], 9: [T, B], 10: [T, R, Lf, B], 11: [T, R], 12: [Lf, R], 13: [B, R], 14: [Lf, B] }[idx];
      for (let k = 0; k < seg.length; k += 2) { c.moveTo(seg[k][0], seg[k][1]); c.lineTo(seg[k + 1][0], seg[k + 1][1]); }
    }
    c.stroke();
  }
};

// ---- C4 ----
S.C4 = (c, w, h, t, s) => {
  c.fillStyle = vgrad(c, h, '#082027', '#020708'); c.fillRect(0, 0, w, h);
  const r = rng(29), per = 1.15, k = Math.floor(t / per), m = Math.min(w, h); c.lineWidth = 1;
  for (let i = k - 4; i <= k; i++) {
    if (i < 0) continue; const rr = rng(i * 7 + 1), x = (.12 + rr() * .76) * w, y = (.25 + rr() * .6) * h, age = t - i * per;
    for (let j = 0; j < 4; j++) { const a = age - j * .2; if (a <= 0) continue; const R = a * m * .17, al = Math.max(0, 1 - age / 4.4) * (1 - j * .2) * .75; c.strokeStyle = `rgba(170,225,230,${al})`; c.beginPath(); c.ellipse(x, y, R, R * .42, 0, 0, TAU); c.stroke(); }
    if (age < .25) glowDot(c, x, y, 10, '#cdf3f5', (1 - age / .25) * .8);
  }
};

// ---- D1 ----
S.D1 = (c, w, h, t, s, dpr) => {
  if (!s.init) {
    s.init = 1; const r = rng(31); [s.bg, s.bx] = offscreen(w, h, dpr); const b = s.bx; b.fillStyle = vgrad(b, h, '#0b1020', '#05060b'); b.fillRect(0, 0, w, h);
    const cols = ['#ffb35c', '#ff6a4d', '#6fd1e0', '#fff1cf', '#ffd27a'];
    for (let i = 0; i < 46; i++) glowDot(b, r() * w, h * (.25 + r() * .7), (8 + r() * 36) * Math.min(w, h) / 300, cols[Math.floor(r() * cols.length)], .28 + r() * .25);
    s.dots = Array.from({ length: Math.round(w * h / 500) }, () => [r() * w, r() * h, .6 + r() * 2.2]);
    s.sl = Array.from({ length: 9 }, () => ({ x: r() * w, y: r() * h, v: 0, r: 2 + r() * 2.2, ph: r() * 10, tr: [] }));
  }
  const dt = clamp(t - (s.lt ?? t), 0, .05); s.lt = t;
  c.drawImage(s.bg, 0, 0, w, h);
  for (const [x, y, r] of s.dots) { c.fillStyle = 'rgba(190,210,235,.12)'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x - r * .3, y - r * .4, Math.max(.6, r * .35), Math.max(.6, r * .35)); }
  for (const d of s.sl) {
    const go = Math.sin(t * 1.3 + d.ph) > .2; d.v = lerp(d.v, go ? 60 * h / 300 : 2, .1); d.y += d.v * dt; d.x += Math.sin(t * 3 + d.ph) * .15;
    d.tr.push([d.x, d.y]); if (d.tr.length > 60) d.tr.shift();
    if (d.y > h + 10) { d.y = -10; d.x = Math.random() * w; d.tr = []; }
    c.strokeStyle = 'rgba(200,220,240,.12)'; c.lineWidth = d.r * .6; c.beginPath(); d.tr.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
    const g = c.createLinearGradient(d.x, d.y - d.r, d.x, d.y + d.r); g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(120,140,170,.2)'); c.fillStyle = g; c.beginPath(); c.ellipse(d.x, d.y, d.r, d.r * 1.25, 0, 0, TAU); c.fill();
  }
};

// ---- D2 ----
S.D2 = (c, w, h, t, s) => {
  if (!s.init) { s.init = 1; const r = rng(37); s.p = Array.from({ length: 170 }, () => [r() * w, r() * h, r() * TAU, .4 + r() * 1.4]); }
  c.fillStyle = '#0b0806'; c.fillRect(0, 0, w, h);
  const wx = w * .08, wy = h * .08, ww = w * .2, wh = h * .36;
  const beam = new Path2D(); beam.moveTo(wx + ww, wy); beam.lineTo(wx, wy + wh); beam.lineTo(w * .52, h * 1.02); beam.lineTo(w * 1.02, h * .66); beam.closePath();
  const g = c.createLinearGradient(wx, wy, w * .8, h); g.addColorStop(0, 'rgba(255,222,165,.34)'); g.addColorStop(1, 'rgba(255,200,140,.03)');
  c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fill(beam);
  c.fillStyle = 'rgba(255,214,160,.12)'; c.beginPath(); c.moveTo(w * .52, h); c.lineTo(w * .7, h * .86); c.lineTo(w, h * .7); c.lineTo(w, h); c.fill();
  c.globalCompositeOperation = 'source-over';
  c.fillStyle = '#f4e2c2'; c.fillRect(wx, wy, ww, wh); c.fillStyle = '#0b0806'; c.fillRect(wx + ww / 2 - 2, wy, 4, wh); c.fillRect(wx, wy + wh / 2 - 2, ww, 4);
  for (const p of s.p) {
    const x = (p[0] + Math.sin(t * .2 + p[2]) * 20 + t * 4) % w, y = (p[1] + Math.cos(t * .17 + p[2]) * 16 - t * 2 + h * 10) % h;
    const lit = c.isPointInPath(beam, x * (c.getTransform().a), y * (c.getTransform().d));
    c.fillStyle = lit ? `rgba(255,236,200,${.5 + .4 * Math.sin(t * 2 + p[2])})` : 'rgba(255,220,170,.05)'; c.beginPath(); c.arc(x, y, p[3] * (lit ? 1 : .7), 0, TAU); c.fill();
  }
};

// ---- D3 ----
S.D3 = (c, w, h, t, s) => {
  if (!s.init) { s.init = 1; const r = rng(41); s.f = Array.from({ length: 170 }, () => [r() * w, r() * h, r(), r() * TAU]); s.e = Array.from({ length: 14 }, () => [r() * w, r() * h, r(), r() * TAU]); }
  c.fillStyle = vgrad(c, h, '#0e1627', '#04060b'); c.fillRect(0, 0, w, h); const m = Math.min(w, h) / 300;
  for (const [x0, y0, z, ph] of s.f) { const y = (y0 + t * (8 + z * 26) * m) % (h + 10), x = x0 + Math.sin(t * .6 + ph) * 10 * m; c.fillStyle = `rgba(235,242,255,${.35 + z * .55})`; c.beginPath(); c.arc(x, y, (.6 + z * 2.4) * m, 0, TAU); c.fill(); }
  c.globalCompositeOperation = 'lighter';
  for (const [x0, y0, z, ph] of s.e) { const y = h - ((h - y0 + t * (20 + z * 30) * m) % (h + 20)), x = x0 + Math.sin(t * 1.4 + ph) * 14 * m, fl = .5 + .5 * Math.sin(t * 9 + ph * 5); glowDot(c, x, y, 7 * m, '#ff9a3d', .45 * fl * (y / h)); c.fillStyle = `rgba(255,214,150,${fl * (y / h)})`; c.fillRect(x - .8, y - .8, 1.6, 1.6); }
  c.globalCompositeOperation = 'source-over';
};

// ---- D4 ----
S.D4 = (c, w, h, t, s) => {
  if (!s.init) { s.init = 1; const r = rng(43); s.st = Array.from({ length: 90 }, () => [r() * w, r() * h * .6, r()]); }
  const K = [['#04060f', '#0d1430'], ['#0c1233', '#3b2e58'], ['#26305e', '#d0766a'], ['#4f79b5', '#f6c27f']];
  const p = (t % 12) / 12, seg = p < .75 ? p / .75 * 3 : 3, i = Math.min(2, Math.floor(seg)), f = ss(0, 1, seg - i), back = ss(.9, 1, p);
  const top = mixHex(mixHex(K[i][0], K[i + 1][0], f), K[0][0], back), bot = mixHex(mixHex(K[i][1], K[i + 1][1], f), K[0][1], back);
  c.fillStyle = vgrad(c, h, top, bot); c.fillRect(0, 0, w, h);
  const dawn = clamp(seg / 3, 0, 1) * (1 - back);
  for (const [x, y, z] of s.st) { c.fillStyle = `rgba(255,255,255,${(1 - dawn * 1.4) * (.3 + z * .6)})`; c.fillRect(x, y, 1.2, 1.2); }
  const m = Math.min(w, h), sy = lerp(h * .86, h * .5, eOut(dawn)); glowDot(c, w * .62, sy, m * .5, '#ffb46a', .35 * dawn); c.fillStyle = mixHex('#ff8a4a', '#fff1c8', dawn); c.beginPath(); c.arc(w * .62, sy, m * .07, 0, TAU); c.fill();
  const hill = (base, amp, col, ph) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w; x += 6) c.lineTo(x, base + Math.sin(x / w * 5 + ph) * amp + Math.sin(x / w * 13 + ph) * amp * .3); c.lineTo(w, h); c.fill(); };
  hill(h * .74, h * .04, mixHex('#0a0f20', '#3a3550', dawn * .6), 1); hill(h * .82, h * .03, mixHex('#05070e', '#1d1a28', dawn * .5), 3);
};

// ---- E1 ----
S.E1 = (c, w, h, t, s) => {
  const tm = t % 6.5, m = Math.min(w, h), ly = h * .68, out = eOut(ss(4.6, 5.6, tm)) * w * 1.2;
  c.fillStyle = '#ebe5d6'; c.fillRect(0, 0, w, h);
  c.save(); c.translate(-out * 0, 0);
  c.fillStyle = '#161616'; c.fillRect(w * .06, ly, w * .88 * eOut(tm / .8), Math.max(2, m * .012));
  const cr = m * .14, cx = lerp(-cr, w * .46, eOut((tm - .4) / 1.3)) + out; c.save(); c.translate(cx, ly - cr); c.rotate((cx / cr)); c.fillStyle = '#d9432f'; c.beginPath(); c.arc(0, 0, cr, 0, TAU); c.fill(); c.fillStyle = '#ebe5d6'; c.fillRect(-cr * .08, -cr, cr * .16, cr * .5); c.restore();
  const sq = m * .2, sqx = w * .72 + out, sqy = lerp(-sq, ly - sq / 2, eBack((tm - 1.1) / .9)), rot = eBack((tm - 3) / .7) * Math.PI / 2;
  c.save(); c.translate(sqx, sqy); c.rotate(rot); c.fillStyle = '#2047c9'; c.fillRect(-sq / 2, -sq / 2, sq, sq); c.restore();
  const yr = m * .18 * eBack((tm - 2) / .8); if (yr > 0) { c.fillStyle = '#f2b630'; c.beginPath(); c.arc(w * .24 + out, ly, yr, Math.PI, TAU); c.fill(); }
  c.restore();
};

// ---- E2 ----
S.E2 = (c, w, h, t, s, dpr) => {
  if (!s.init) { s.init = 1; s.paper = paperTex(w, h, dpr, '#f1e9dc', 47); }
  c.fillStyle = vgrad(c, h, '#f4ecdf', '#dcebe5'); c.fillRect(0, 0, w, h);
  const m = Math.min(w, h); c.save(); c.shadowColor = 'rgba(80,60,30,.25)'; c.shadowBlur = 14; c.fillStyle = '#fff8e7'; c.beginPath(); c.arc(w * .72, h * .26, m * .1, 0, TAU); c.fill(); c.restore();
  const cols = ['#cfe3df', '#9fc7c1', '#6fa59f', '#43807b', '#235a57'];
  cols.forEach((col, i) => {
    const base = h * (.42 + i * .11), amp = h * (.05 + i * .012), off = t * (6 + i * 10) * m / 300;
    c.save(); c.shadowColor = 'rgba(20,40,40,.35)'; c.shadowBlur = 10; c.shadowOffsetY = -3; c.fillStyle = col; c.beginPath(); c.moveTo(0, h);
    for (let x = 0; x <= w + 6; x += 6) { const u = (x + off) / w; c.lineTo(x, base + Math.sin(u * (3 + i) + i * 1.7) * amp + Math.sin(u * 11 + i) * amp * .25); }
    c.lineTo(w, h); c.closePath(); c.fill(); c.restore();
    if (i === 2) { const hx = ((w * .3 - off) % (w * 1.3) + w * 1.3) % (w * 1.3) - w * .15, u = (hx + off) / w, hy = base + Math.sin(u * 5 + i * 1.7) * amp + Math.sin(u * 11 + i) * amp * .25, hs = m * .07; c.fillStyle = '#2f6f69'; c.fillRect(hx - hs / 2, hy - hs * .9, hs, hs); c.beginPath(); c.moveTo(hx - hs * .65, hy - hs * .9); c.lineTo(hx, hy - hs * 1.5); c.lineTo(hx + hs * .65, hy - hs * .9); c.fill(); c.fillStyle = '#ffd98a'; c.fillRect(hx - hs * .12, hy - hs * .55, hs * .24, hs * .3); }
  });
  c.globalAlpha = .5; c.globalCompositeOperation = 'multiply'; c.drawImage(s.paper, 0, 0, w, h); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
};

// ---- E3 ----
S.E3 = (c, w, h, t, s) => {
  const cs = Math.max(7, Math.round(Math.min(w, h) / 26)), cols = Math.floor(w / (cs * .62)), rows = Math.floor(h / cs), ch = ' .,:;-=+*#%@';
  c.fillStyle = '#0a0703'; c.fillRect(0, 0, w, h); c.font = `500 ${cs}px ${MONO}`; c.textBaseline = 'top';
  const lx = .5 + .3 * Math.cos(t * .7), ly = .5 + .3 * Math.sin(t * .9);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = i / cols, y = j / rows, ax = (x - .5) * w / h, d = Math.hypot(ax, y - .5);
    let v = .5 + .5 * Math.sin(d * 22 - t * 2.4); v *= Math.exp(-d * 1.6);
    v += .9 * Math.exp(-(((x - lx) * w / h) ** 2 + (y - ly) ** 2) / .02);
    const k = Math.min(ch.length - 1, Math.floor(clamp(v, 0, .999) * ch.length)); if (!k) continue;
    c.fillStyle = `rgba(255,179,71,${.35 + v * .65})`; c.fillText(ch[k], i * cs * .62, j * cs);
  }
};

// ---- F1 ----
S.F1 = (c, w, h, t, s) => {
  const tm = t % 8.5, V = [12, 19, 27, 33, 41, 58], N = ['小学', '初中', '高中', '大学', '工作', '现在'], fade = 1 - ss(7.6, 8.5, tm);
  c.fillStyle = '#0f1418'; c.fillRect(0, 0, w, h); c.globalAlpha = fade;
  const l = w * .1, r = w * .94, top = h * .2, bot = h * .8, fs = Math.max(9, Math.min(w, h) / 24);
  c.fillStyle = '#8f9aa5'; c.font = `500 ${fs}px ${SANS}`; c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.fillText('示例数据：心里那句话想说出口的次数', l, h * .11);
  c.strokeStyle = '#2c3640'; c.lineWidth = 1; for (let k = 0; k <= 3; k++) { const y = lerp(bot, top, k / 3); c.beginPath(); c.moveTo(l, y); c.lineTo(r, y); c.stroke(); }
  const bw = (r - l) / V.length, pts = [];
  V.forEach((v, i) => {
    const e = eOut((tm - .2 - i * .25) / .8), bh = (bot - top) * v / 60 * e, x = l + bw * i + bw * .22, ww = bw * .56;
    c.fillStyle = i === V.length - 1 ? '#f1b25c' : '#5d7fa3'; c.fillRect(x, bot - bh, ww, bh);
    c.fillStyle = '#e8ecef'; c.textAlign = 'center'; c.font = `500 ${fs}px ${MONO}`; if (e > 0) c.fillText(Math.round(v * e), x + ww / 2, bot - bh - fs * .5);
    c.fillStyle = '#8f9aa5'; c.font = `400 ${fs * .9}px ${SANS}`; c.fillText(N[i], x + ww / 2, bot + fs * 1.4);
    pts.push([x + ww / 2, bot - (bot - top) * v / 60]);
  });
  const lp = clamp((tm - 2.6) / 1.4, 0, 1); if (lp > 0) { c.strokeStyle = '#f1b25c'; c.lineWidth = 2; c.beginPath(); const n = lp * (pts.length - 1); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i <= Math.floor(n); i++) c.lineTo(pts[i][0], pts[i][1]); const fi = Math.floor(n); if (fi < pts.length - 1) c.lineTo(lerp(pts[fi][0], pts[fi + 1][0], n - fi), lerp(pts[fi][1], pts[fi + 1][1], n - fi)); c.stroke(); }
  c.globalAlpha = 1;
};

// ---- F2 ----
S.F2 = (c, w, h, t, s) => {
  const tm = t % 10, fade = 1 - ss(9, 10, tm), m = Math.min(w, h), fs = Math.max(10, m / 20);
  const Nd = { 我: [.5, .55], 爸爸: [.22, .3], 妈妈: [.78, .3], 奶奶: [.5, .12], 学校: [.2, .82], 工作: [.8, .82] };
  const E = [['爸爸', '我', '为你好', 1], ['妈妈', '我', '听话', 1.8], ['奶奶', '爸爸', '吃苦', 2.6], ['我', '学校', '要争气', 3.4], ['我', '工作', '不能软弱', 4.2], ['我', '妈妈', '说不出口', 5.2]];
  c.fillStyle = '#0e1116'; c.fillRect(0, 0, w, h); c.globalAlpha = fade;
  const R = m * .075, at = k => [Nd[k][0] * w, Nd[k][1] * h];
  for (const [a, b, lab, t0] of E) {
    const p = eOut((tm - t0) / .7); if (p <= 0) continue; const A = at(a), B = at(b), an = Math.atan2(B[1] - A[1], B[0] - A[0]);
    const sx = A[0] + Math.cos(an) * R, sy = A[1] + Math.sin(an) * R, ex = B[0] - Math.cos(an) * R, ey = B[1] - Math.sin(an) * R, cx = lerp(sx, ex, p), cy = lerp(sy, ey, p);
    const warm = lab === '说不出口'; c.strokeStyle = warm ? '#f1b25c' : '#7c8798'; c.lineWidth = 1.4; if (warm) c.setLineDash([5, 5]); c.beginPath(); c.moveTo(sx, sy); c.lineTo(cx, cy); c.stroke(); c.setLineDash([]);
    c.fillStyle = c.strokeStyle; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx - Math.cos(an - .4) * 9, cy - Math.sin(an - .4) * 9); c.lineTo(cx - Math.cos(an + .4) * 9, cy - Math.sin(an + .4) * 9); c.fill();
    c.font = `400 ${fs * .8}px ${SANS}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = warm ? '#f1b25c' : '#aab3c0'; c.globalAlpha = fade * p; c.fillText(lab, (sx + ex) / 2 - Math.sin(an) * fs * .8, (sy + ey) / 2 + Math.cos(an) * fs * .8); c.globalAlpha = fade;
  }
  Object.keys(Nd).forEach((k, i) => {
    const p = eBack((tm - i * .12) / .5); if (p <= 0) return; const [x, y] = at(k); const me = k === '我';
    c.fillStyle = me ? '#f1b25c' : '#161b23'; c.strokeStyle = me ? '#f1b25c' : '#cfd6e0'; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, R * p, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = me ? '#14100a' : '#e6e9ee'; c.font = `500 ${fs * .85 * p}px ${SANS}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(k, x, y);
  });
  c.globalAlpha = 1;
};

// ---- F3 ----
S.F3 = (c, w, h, t, s) => {
  if (!s.init) { s.init = 1; const r = rng(53); s.rain = Array.from({ length: 90 }, () => [r(), r(), .5 + r()]); s.lit = Array.from({ length: 40 }, () => [r(), r(), r() * TAU, r()]); }
  const dx = w * .5 + Math.sin(t * .6) * w * .04, m = Math.min(w, h), fs = Math.max(11, m / 16);
  c.save(); c.beginPath(); c.rect(0, 0, dx, h); c.clip(); c.fillStyle = vgrad(c, h, '#1a1e26', '#0b0d11'); c.fillRect(0, 0, w, h);
  c.strokeStyle = 'rgba(170,185,205,.35)'; c.lineWidth = 1; for (const [x, y, v] of s.rain) { const yy = ((y * h + t * 220 * v) % (h + 20)) - 10, xx = x * w; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx - 2, yy + 12 * v); c.stroke(); }
  c.fillStyle = 'rgba(210,218,230,.85)'; c.font = `700 ${fs}px ${SERIF}`; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText('以前', m * .06, m * .06); c.restore();
  c.save(); c.beginPath(); c.rect(dx, 0, w - dx, h); c.clip(); const g = c.createRadialGradient(w * .75, h * .6, 0, w * .75, h * .6, w * .6); g.addColorStop(0, '#3a2410'); g.addColorStop(1, '#120b05'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = 'lighter'; for (const [x, y, ph, z] of s.lit) { const yy = ((y * h - t * (8 + z * 14)) % h + h) % h; glowDot(c, x * w, yy, 3 + z * 9, '#ffb664', .4 + .3 * Math.sin(t * 2 + ph)); } c.globalCompositeOperation = 'source-over';
  c.fillStyle = 'rgba(255,226,180,.92)'; c.font = `700 ${fs}px ${SERIF}`; c.textAlign = 'right'; c.textBaseline = 'top'; c.fillText('现在', w - m * .06, m * .06); c.restore();
  c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(dx - .5, 0, 1, h);
};

// ---- G1 ----
S.G1 = (c, w, h, t, s, dpr) => {
  if (!s.init) { s.init = 1; const r = rng(59); [s.nz, s.nx] = offscreen(256, 256, 1); const id = s.nx.createImageData(256, 256); for (let i = 0; i < id.data.length; i += 4) { const v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } s.nx.putImageData(id, 0, 0); }
  const jy = (Math.random() - .5) * 1.4; c.save(); c.translate(0, jy);
  c.fillStyle = vgrad(c, h, '#5b3a63', '#f0a36a'); c.fillRect(0, -2, w, h + 4);
  const m = Math.min(w, h); glowDot(c, w * .68, h * .58, m * .4, '#ffd08a', .5); c.fillStyle = '#ffe3b0'; c.beginPath(); c.arc(w * .68, h * .58, m * .08, 0, TAU); c.fill();
  c.fillStyle = '#2a1626'; c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w; x += 8) c.lineTo(x, h * .72 - Math.sin(x / w * Math.PI) * h * .12); c.lineTo(w, h); c.fill();
  const tx = w * .36, ty = h * .72 - Math.sin(.36 * Math.PI) * h * .12; c.fillRect(tx - 2, ty - m * .22, 4, m * .22); c.beginPath(); c.arc(tx, ty - m * .24, m * .08, 0, TAU); c.arc(tx - m * .06, ty - m * .19, m * .06, 0, TAU); c.arc(tx + m * .06, ty - m * .19, m * .06, 0, TAU); c.fill();
  const px = w * .47, py = ty + h * .01; c.beginPath(); c.arc(px, py - m * .085, m * .016, 0, TAU); c.fill(); c.fillRect(px - m * .012, py - m * .07, m * .024, m * .07);
  c.restore();
  c.globalAlpha = .22; c.globalCompositeOperation = 'overlay'; const ox = Math.random() * 256, oy = Math.random() * 256; c.fillStyle = c.createPattern(s.nz, 'repeat'); c.save(); c.translate(-ox, -oy); c.fillRect(ox, oy, w, h); c.restore();
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  c.fillStyle = `rgba(0,0,0,${Math.random() * .08})`; c.fillRect(0, 0, w, h);
  const lx = w * (.1 + .08 * Math.sin(t * .5)); glowDot(c, lx, h * .3, m * .7, '#ff7a2a', .22 + .1 * Math.sin(t * 1.3));
  if (Math.random() < .3) { c.fillStyle = 'rgba(255,240,220,.25)'; c.fillRect(Math.random() * w, 0, 1, h); }
  const v = c.createRadialGradient(w / 2, h / 2, m * .3, w / 2, h / 2, Math.hypot(w, h) * .6); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.6)'); c.fillStyle = v; c.fillRect(0, 0, w, h);
};

// ---- G2 ----
S.G2 = (c, w, h, t, s) => {
  const tm = t % 5, burst = (tm > 1.2 && tm < 1.7) || (tm > 3.1 && tm < 3.3) || (tm > 3.6 && tm < 4.2), m = Math.min(w, h), fs = Math.min(w / 4.6, h / 3.2);
  c.fillStyle = '#060607'; c.fillRect(0, 0, w, h); const dx = burst ? 4 + Math.random() * 10 : 1.2;
  c.font = `900 ${fs}px ${SANS}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.globalCompositeOperation = 'lighter';
  c.fillStyle = '#ff2b2b'; c.fillText('我没事。', w / 2 - dx, h / 2); c.fillStyle = '#00e1ff'; c.fillText('我没事。', w / 2 + dx, h / 2);
  c.globalCompositeOperation = 'source-over';
  if (burst) { for (let k = 0; k < 7; k++) { const y = Math.random() * h, sh = 4 + Math.random() * h * .08, off = (Math.random() - .5) * w * .12; c.drawImage(c.canvas, 0, y * (c.canvas.height / h), c.canvas.width, sh * (c.canvas.height / h), off, y, w, sh); } c.fillStyle = 'rgba(230,230,235,.8)'; c.font = `400 ${fs * .22}px ${SANS}`; c.fillText('（其实不是）', w / 2 + (Math.random() - .5) * 8, h / 2 + fs * .78); }
  c.fillStyle = 'rgba(0,0,0,.22)'; for (let y = 0; y < h; y += 3) c.fillRect(0, y, w, 1);
};

// ---- H1 ----
S.H1 = (c, w, h, t, s) => {
  const P = '#F2E9D2', SUN = '#F6C23E', INK = '#1D2A68';
  const SERIF = 'Georgia,"Times New Roman","Noto Serif SC","Songti SC",serif';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6.5;
  c.fillStyle = P; c.fillRect(0, 0, w, h);
  if (!s.tex) s.tex = paperTex(1920, 1080, 1, P, 2026);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.drawImage(s.tex, 0, 0, 1920, 1080);
  c.globalAlpha = 1 - ss(6.0, 6.5, tm);
  const fr = eOut(tm / .8);
  c.strokeStyle = INK; c.lineWidth = 1.8; c.setLineDash([5200 * fr, 5200]); c.strokeRect(64, 64, 1792, 952); c.setLineDash([]);
  c.lineWidth = 1.6;
  for (const y of [148, 932]) { c.beginPath(); c.moveTo(64, y); c.lineTo(64 + 1792 * fr, y); c.stroke(); }
  const sy = lerp(770, 470, eOut(ss(.4, 1.8, tm))), ha = eOut(ss(.4, 1.8, tm));
  const g = c.createRadialGradient(1380, sy, 20, 1380, sy, 560);
  g.addColorStop(0, hex(SUN, ha)); g.addColorStop(.38, hex(SUN, .92 * ha));
  g.addColorStop(.7, `rgba(246,214,120,${.35 * ha})`); g.addColorStop(1, 'rgba(246,214,120,0)');
  c.fillStyle = g; c.beginPath(); c.arc(1380, sy, 560, 0, TAU); c.fill();
  c.fillStyle = hex(SUN, ha); c.beginPath(); c.arc(1380, sy, 250, 0, TAU); c.fill();
  c.lineWidth = 1.7;
  for (const [r, a] of [[250, .9], [330, .45], [410, .45]]) { c.strokeStyle = hex(INK, a * ha); c.beginPath(); c.arc(1380, sy, r, 0, TAU); c.stroke(); }
  const rot = t * Math.PI / 180;
  c.strokeStyle = hex(INK, .85 * ha);
  for (let i = 0; i < 120; i++) { const a = rot + i / 120 * TAU, r2 = i % 5 ? 421 : 432; c.beginPath(); c.moveTo(1380 + Math.cos(a) * 410, sy + Math.sin(a) * 410); c.lineTo(1380 + Math.cos(a) * r2, sy + Math.sin(a) * r2); c.stroke(); }
  const t1 = eOut(ss(1.0, 1.9, tm)), t2 = eOut(ss(1.3, 2.4, tm));
  c.fillStyle = hex(INK, t1); c.font = `214px ${SERIF}`; c.letterSpacing = '-4px';
  c.fillText('Biennale', 100, 560 + 24 * (1 - t1));
  c.fillStyle = hex(INK, t2); c.font = `italic 214px ${SERIF}`;
  c.fillText('Yellow', 100, 770 + 24 * (1 - t2));
  const hd = eOut(ss(2.0, 2.8, tm));
  c.fillStyle = hex(INK, hd); c.font = `26px ${SERIF}`; c.letterSpacing = '6px';
  c.fillText('THE TWELFTH BIENNALE · EDITORIAL SERIES', 104, 118);
  c.fillText('N° 01', 1650, 118);
  c.letterSpacing = '0px';
  c.font = `34px ${SERIF}`; c.fillText('示例页脚：把想法排成版面', 104, 980);
  c.textAlign = 'right'; c.fillText('NO. 012', 1816, 980); c.textAlign = 'left';
  c.restore();
};

// ---- H2 ----
S.H2 = (c, w, h, t, s) => {
  const INK = '#141414', CREAM = '#F5F0E6', PINK = '#FF6B9D', YEL = '#FFD84D', MINT = '#6BE8B8';
  const BLK = `"Arial Black",${SANS}`;
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = CREAM; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  const card = (x, y, bw, bh, col, e, sh = 24) => {
    if (e <= 0) return;
    c.fillStyle = INK; c.fillRect(x + e * sh, y + e * sh, bw, bh);
    c.fillStyle = col; c.fillRect(x, y, bw, bh);
    c.lineWidth = 12; c.strokeStyle = INK; c.strokeRect(x, y, bw, bh);
  };
  card(150, 160, 1180, 760, '#FFFFFF', eOut(ss(0, .7, tm)));
  const w1 = eBack(ss(.4, 1.2, tm)), w2 = eBack(ss(.8, 1.6, tm));
  c.fillStyle = INK; c.font = `170px ${BLK}`;
  c.fillText('BLOCK', lerp(-600, 230, w1), 470);
  c.fillText('FRAME', lerp(2420, 230, w2), 660);
  card(1170, 610, 580, 320, MINT, eBack(ss(2.0, 2.8, tm)));
  c.fillStyle = INK; c.font = `72px ${BLK}`; c.fillText('HARD', 1235, 735); c.fillText('SHADOW', 1235, 820);
  const st = eBack(ss(1.4, 2.1, tm));
  if (st > 0) {
    c.save(); c.translate(1490, 290); c.rotate((1 - st) * .9 + Math.sin(t * 2.2) * .05); c.scale(st, st);
    c.fillStyle = INK; c.beginPath(); c.arc(12, 12, 132, 0, TAU); c.fill();
    c.fillStyle = PINK; c.beginPath(); c.arc(0, 0, 132, 0, TAU); c.fill();
    c.lineWidth = 11; c.strokeStyle = INK; c.stroke();
    c.fillStyle = INK; c.font = `58px ${BLK}`; c.textAlign = 'center'; c.fillText('NEW!', 0, 21); c.textAlign = 'left';
    c.restore();
  }
  const tg = eBack(ss(1.7, 2.4, tm));
  if (tg > 0) {
    c.save(); c.translate(1120, 250); c.rotate(-.08); c.scale(tg, tg);
    c.fillStyle = YEL; c.fillRect(-150, -58, 300, 116);
    c.lineWidth = 10; c.strokeStyle = INK; c.strokeRect(-150, -58, 300, 116);
    c.fillStyle = INK; c.font = `48px ${BLK}`; c.textAlign = 'center'; c.fillText('★ 2026', 0, 18); c.textAlign = 'left';
    c.restore();
  }
  c.fillStyle = hex(INK, eOut(ss(2.6, 3.2, tm))); c.font = `40px ${BLK}`;
  c.fillText('NEO-BRUTALISM · BORDERS · HARD SHADOWS', 230, 1010);
  c.restore();
};

// ---- H3 ----
S.H3 = (c, w, h, t, s) => {
  const PAPER = '#F2ECD9', COB = '#2453E0', NAVY = '#16233F';
  const GRO = `"Space Grotesk",${SANS}`;
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = PAPER; c.fillRect(0, 0, w, h);
  if (!s.tex) s.tex = paperTex(1920, 1080, 1, PAPER, 3);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.drawImage(s.tex, 0, 0, 1920, 1080);
  c.fillStyle = COB; c.fillRect(0, 0, 1920 * eOut(tm / .7), 16);
  const lab = eOut(ss(.4, 1.2, tm));
  c.fillStyle = hex(COB, lab); c.font = `28px ${GRO}`;
  c.fillText('PROFESSIONAL SERIES — Q4 REPORT', 120, 170);
  const t1 = eOut(ss(.7, 1.5, tm)), t2 = eOut(ss(1.0, 1.8, tm));
  c.fillStyle = hex(NAVY, t1); c.font = `600 140px ${GRO}`;
  c.fillText('Blue', 120, 380 + 26 * (1 - t1));
  c.fillStyle = hex(COB, t2); c.fillText('Professional', 120, 530 + 26 * (1 - t2));
  c.fillStyle = hex(COB, t2); c.fillRect(120, 556, 760 * t2, 12);
  c.fillStyle = hex(NAVY, eOut(ss(1.4, 2.2, tm))); c.font = `36px ${GRO}`;
  c.fillText('清晰的层级、克制的配色、可靠的数据。', 120, 640);
  c.fillText('Clear hierarchy · restrained palette · reliable data.', 120, 700);
  const bars = [.45, .72, .58, .92], bw = 110, gap = 60, x0 = 1180, base = 860;
  const ae = eOut(ss(1.2, 1.8, tm));
  c.lineWidth = 3; c.strokeStyle = hex(NAVY, ae);
  c.beginPath(); c.moveTo(x0 - 40, base); c.lineTo(1820, base); c.stroke();
  for (let i = 0; i < 4; i++) {
    const e = eOut(ss(1.4 + i * .18, 2.2 + i * .18, tm)), bh = bars[i] * 380 * e;
    c.fillStyle = i === 3 ? COB : hex(COB, .35 + .25 * i);
    c.fillRect(x0 + i * (bw + gap), base - bh, bw, bh);
    c.fillStyle = hex(NAVY, e); c.font = `24px ${GRO}`;
    c.fillText(['Q1', 'Q2', 'Q3', 'Q4'][i], x0 + i * (bw + gap) + 28, base + 44);
  }
  const ba = eOut(ss(2.4, 3.2, tm));
  if (ba > 0) {
    c.strokeStyle = hex(COB, ba); c.lineWidth = 4;
    c.beginPath(); c.arc(1700, 280, 120, -Math.PI / 2, -Math.PI / 2 + TAU * ba); c.stroke();
    c.fillStyle = hex(NAVY, ba); c.font = `600 34px ${GRO}`; c.textAlign = 'center';
    c.fillText('2026', 1700, 295); c.textAlign = 'left';
  }
  c.restore();
};

// ---- H4 ----
S.H4 = (c, w, h, t, s) => {
  const CREAM = '#FBF3E4', RED = '#E23A2E', INK = '#221B16';
  const SCRIPT = `"Brush Script MT","Segoe Script","Snell Roundhand",cursive`;
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = CREAM; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  const m = eOut(ss(.2, 1.0, tm));
  c.fillStyle = hex(INK, m); c.font = `28px ${SANS}`;
  c.fillText('MAGAZINE — VOL.4 — SPRING', 110, 120);
  c.textAlign = 'right'; c.fillText('EST. 2026', 1810, 120); c.textAlign = 'left';
  c.lineWidth = 3; c.strokeStyle = hex(INK, m);
  c.beginPath(); c.moveTo(110, 150); c.lineTo(110 + 1700 * m, 150); c.stroke();
  const p = eBack(ss(.4, 1.4, tm));
  if (p > 0) {
    c.save(); c.translate(lerp(-500, 520, p), lerp(640, 540, p)); c.rotate(lerp(-.35, -.09, p));
    c.fillStyle = RED; c.font = `320px ${SCRIPT}`; c.textAlign = 'center';
    c.fillText('Bold', 0, 0);
    c.fillText('Poster', 0, 250);
    c.textAlign = 'left';
    c.restore();
  }
  const sw = eOut(ss(1.6, 2.4, tm));
  if (sw > 0) {
    c.strokeStyle = INK; c.lineWidth = 26; c.lineCap = 'round';
    c.beginPath(); c.moveTo(220, 950);
    for (let i = 1; i <= 40; i++) { const q = i / 40 * sw; c.lineTo(220 + 1100 * q, 950 - Math.sin(q * Math.PI) * 60); }
    c.stroke(); c.lineCap = 'butt';
  }
  const star = (x, y, r, e, rot) => {
    if (e <= 0) return;
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(e, e);
    c.strokeStyle = INK; c.lineWidth = 14; c.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * r, Math.sin(a) * r); c.stroke(); }
    c.lineCap = 'butt'; c.restore();
  };
  star(1650, 280, 110, eBack(ss(2.2, 2.9, tm)), t * .3);
  star(1450, 780, 70, eBack(ss(2.5, 3.2, tm)), -t * .22);
  const tb = eBack(ss(2.8, 3.5, tm));
  if (tb > 0) {
    c.save(); c.translate(1520, 520); c.rotate(.06); c.scale(tb, tb);
    c.fillStyle = RED; c.fillRect(-180, -55, 360, 110);
    c.fillStyle = CREAM; c.font = `900 44px ${SANS}`; c.textAlign = 'center'; c.fillText('RED ALERT', 0, 16); c.textAlign = 'left';
    c.restore();
  }
  c.restore();
};

// ---- H5 ----
S.H5 = (c, w, h, t, s) => {
  const CREAM = '#F0E9D8', INK = '#1A1712', ORA = '#E8541F';
  const COND = `800 190px "Impact","Arial Narrow",${SANS}`;
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = CREAM; c.fillRect(0, 0, w, h);
  if (!s.tex) s.tex = paperTex(1920, 1080, 1, CREAM, 5);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.drawImage(s.tex, 0, 0, 1920, 1080);
  const ln = eOut(tm / .8);
  c.fillStyle = INK;
  c.fillRect(80, 84, 1760 * ln, 12); c.fillRect(80, 112, 1760 * ln, 5);
  c.font = COND;
  let x = 110;
  for (let i = 0; i < 13; i++) {
    const ch = 'THE BROADSIDE'[i], e = eOut(ss(.3 + i * .05, .9 + i * .05, tm));
    if (ch !== ' ' && e > 0) { c.fillStyle = hex(INK, e); c.fillText(ch, x, lerp(340, 300, e)); }
    x += c.measureText(ch).width + 10;
  }
  const sb = eOut(ss(1.2, 1.9, tm));
  c.fillStyle = hex(INK, sb); c.font = `28px ${MONO}`;
  c.fillText('INDUSTRIAL NEWS POSTER · CREAM & INK · FIRE ORANGE', 112, 380);
  c.fillStyle = hex(ORA, sb); c.fillRect(112, 404, 560 * sb, 8);
  for (let ci = 0; ci < 3; ci++) {
    const e = eOut(ss(1.6 + ci * .25, 2.4 + ci * .25, tm));
    if (e <= 0) continue;
    const cx = 112 + ci * 640;
    c.fillStyle = hex(INK, .8 * e);
    for (let r = 0; r < 12; r++) c.fillRect(cx, 480 + r * 34, (r === 11 ? 260 : 420) * (r % 4 === 3 ? .8 : 1) * e, 6);
  }
  const b = eBack(ss(2.6, 3.3, tm));
  if (b > 0) {
    c.save(); c.translate(1520, 850); c.rotate(-.12 + (1 - b) * .5); c.scale(b, b);
    c.fillStyle = ORA; c.beginPath(); c.arc(0, 0, 130, 0, TAU); c.fill();
    c.fillStyle = CREAM; c.font = `900 52px ${SANS}`; c.textAlign = 'center';
    c.fillText('EXTRA!', 0, -6); c.fillText('READ ALL', 0, 52); c.textAlign = 'left';
    c.restore();
  }
  c.fillStyle = INK; c.fillRect(80, 1000, 1760 * ln, 5); c.fillRect(80, 1016, 1760 * ln, 12);
  c.restore();
};

// ---- H6 ----
S.H6 = (c, w, h, t, s) => {
  const CREAM = '#FAF0DC', INK = '#3B2B2B';
  const PINK = '#FF8FB1', MINT = '#7FDBC4', BUT = '#FFD97A', LIL = '#B79CE8';
  const BOD = `700 120px "Bodoni Moda","Didot",Georgia,serif`;
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = CREAM; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  const pill = (x, y, pw, ph, col, e, from) => {
    if (e <= 0) return;
    const xx = lerp(from, x, e), r = ph / 2;
    c.fillStyle = col; c.beginPath();
    c.moveTo(xx + r, y);
    c.arcTo(xx + pw, y, xx + pw, y + ph, r); c.arcTo(xx + pw, y + ph, xx, y + ph, r);
    c.arcTo(xx, y + ph, xx, y, r); c.arcTo(xx, y, xx + pw, y, r); c.closePath(); c.fill();
    c.lineWidth = 4; c.strokeStyle = hex(INK, .85); c.stroke();
  };
  pill(160, 180, 1100, 200, PINK, eBack(ss(.2, 1.0, tm)), -1300);
  pill(660, 430, 1100, 200, MINT, eBack(ss(.6, 1.4, tm)), 2000);
  pill(160, 680, 1100, 200, BUT, eBack(ss(1.0, 1.8, tm)), -1300);
  pill(360, 420, 1200, 240, '#FFFDF6', eBack(ss(1.4, 2.2, tm)), 2000);
  const ti = eOut(ss(2.0, 2.8, tm));
  c.fillStyle = hex(INK, ti); c.font = BOD; c.textAlign = 'center';
  c.fillText('Capsule', 960, 585);
  c.font = `34px ${SANS}`; c.fillText('CANDY · BODONI · CREAM PAPER', 960, 660);
  c.textAlign = 'left';
  for (let i = 0; i < 5; i++) {
    const px = 300 + i * 340, py = 920 + Math.sin(t * .8 + i * 1.3) * 18;
    pill(px, py, 170, 64, [PINK, MINT, BUT, LIL, PINK][i], eBack(ss(2.4 + i * .15, 3.0 + i * .15, tm)), px + 600);
  }
  c.restore();
};

// ---- H7 ----
S.H7 = (c, w, h, t, s) => {
  const PAPER = '#F5EFE3', INK = '#2B2A26', TAUPE = '#A89A80';
  const SERIF = 'Georgia,"Noto Serif SC","Songti SC",serif';
  const u = Math.min(w / 1920, h / 1080), tm = t % 7;
  c.fillStyle = PAPER; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  const fr = eOut(tm / 1.0);
  c.strokeStyle = hex(INK, .8); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(120, 120); c.lineTo(120 + 1680 * fr, 120); c.stroke();
  c.beginPath(); c.moveTo(120, 960); c.lineTo(120 + 1680 * eOut(ss(.2, 1.2, tm)), 960); c.stroke();
  const ax = eOut(ss(.4, 1.4, tm));
  c.strokeStyle = hex(INK, ax); c.lineWidth = 2;
  c.beginPath(); c.moveTo(300, 860); c.lineTo(300 + 1300 * ax, 860); c.stroke();
  c.beginPath(); c.moveTo(300, 860); c.lineTo(300, 860 - 560 * ax); c.stroke();
  c.lineWidth = 1.4; c.strokeStyle = hex(TAUPE, ax);
  for (let i = 1; i <= 6; i++) { const x = 300 + i * 190; c.beginPath(); c.moveTo(x, 860); c.lineTo(x, 848); c.stroke(); }
  for (let i = 1; i <= 4; i++) { const y = 860 - i * 130; c.beginPath(); c.moveTo(300, y); c.lineTo(312, y); c.stroke(); }
  const cv = eOut(ss(1.2, 3.4, tm));
  const fx = q => 300 + q * 1300, fy = q => 860 - 560 / (1 + Math.exp(-(q * 8 - 4)));
  if (cv > 0) {
    c.strokeStyle = hex(INK, .95); c.lineWidth = 3; c.beginPath();
    c.moveTo(fx(0), fy(0));
    for (let i = 1; i <= 60; i++) { const q = i / 60; if (q > cv) break; c.lineTo(fx(q), fy(q)); }
    c.stroke();
    const px = fx(cv), py = fy(cv);
    c.setLineDash([6, 8]); c.strokeStyle = hex(TAUPE, .9); c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(px, 860); c.lineTo(px, py); c.lineTo(300, py); c.stroke(); c.setLineDash([]);
    c.fillStyle = INK; c.beginPath(); c.arc(px, py, 10, 0, TAU); c.fill();
  }
  const lb = eOut(ss(2.8, 3.6, tm));
  c.fillStyle = hex(INK, lb); c.font = `44px ${SERIF}`; c.fillText('收敛', 230, 210);
  c.fillStyle = hex(TAUPE, lb); c.font = `24px ${MONO}`;
  c.fillText('x → t', 1560, 935); c.fillText('y', 170, 320);
  c.fillText('CARTESIAN — MINIMAL — THIN LINES', 300, 1010);
  c.fillText('FIG. 1 — 收敛曲线', 1380, 175);
  c.restore();
};

// ---- H8 ----
S.H8 = (c, w, h, t, s) => {
  const PAPER = '#F3ECDA', COB = '#2B4FD8', INK = '#1E2440';
  const NEWS = `"Newsreader",Georgia,serif`;
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = PAPER; c.fillRect(0, 0, w, h);
  if (!s.tex) s.tex = paperTex(1920, 1080, 1, PAPER, 8);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.drawImage(s.tex, 0, 0, 1920, 1080);
  const cols = 6, rows = 4, x0 = 96, y0 = 96, cw = 1728 / cols, chh = 888 / rows;
  c.lineWidth = 2; c.strokeStyle = hex(COB, .55);
  for (let i = 0; i <= cols; i++) { const e = eOut(ss(i * .08, .6 + i * .08, tm)); if (!e) continue; c.beginPath(); c.moveTo(x0 + i * cw, y0); c.lineTo(x0 + i * cw, y0 + 888 * e); c.stroke(); }
  for (let j = 0; j <= rows; j++) { const e = eOut(ss(.5 + j * .1, 1.1 + j * .1, tm)); if (!e) continue; c.beginPath(); c.moveTo(x0, y0 + j * chh); c.lineTo(x0 + 1728 * e, y0 + j * chh); c.stroke(); }
  const cells = [[0, 0, 2, 1], [4, 2, 2, 1], [3, 3, 1, 1]];
  cells.forEach(([ci, cj, cwi, chj], i) => {
    const e = eBack(ss(1.4 + i * .2, 2.1 + i * .2, tm));
    if (e <= 0) return;
    c.save(); c.globalAlpha *= Math.min(1, e);
    c.fillStyle = COB;
    c.fillRect(x0 + ci * cw + 4, y0 + cj * chh + 4, cwi * cw - 8, chj * chh - 8);
    c.restore();
  });
  const tb = eOut(ss(1.8, 2.6, tm));
  if (tb > 0) {
    const by = y0 + chh * 1.15;
    c.fillStyle = hex(INK, .92 * tb); c.fillRect(x0, by, 1728 * tb, 150);
    c.save(); c.beginPath(); c.rect(x0, by, 1728 * tb, 150); c.clip();
    c.fillStyle = '#FFFFFF'; c.font = `110px ${NEWS}`;
    c.fillText('Cobalt Grid', x0 + 40, by + 118);
    c.restore();
  }
  const sm = eOut(ss(2.6, 3.4, tm));
  c.fillStyle = hex(COB, sm); c.font = `26px ${MONO}`;
  c.fillText('GRID 6×4', x0 + 4, 1035);
  c.fillText('NEWSREADER', x0 + 1500, 1035);
  c.restore();
};

// ---- H9 ----
S.H9 = (c, w, h, t, s) => {
  const CREAM = '#FAF3E8', CORAL = '#FF6F5E', INK = '#2B2118';
  const BEB = `"Bebas Neue","Oswald","Arial Narrow",${SANS}`;
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = CREAM; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  const ln = eOut(tm / .8);
  c.strokeStyle = hex(INK, ln); c.lineWidth = 2.5;
  c.beginPath(); c.moveTo(100, 120); c.lineTo(100 + 1720 * ln, 120); c.stroke();
  c.beginPath(); c.moveTo(100, 960); c.lineTo(100 + 1720 * ln, 960); c.stroke();
  const bd = eOut(ss(.4, 1.3, tm));
  c.fillStyle = CORAL; c.fillRect(0, 360, 1920 * bd, 340);
  const p1 = eBack(ss(.8, 1.7, tm)), p2 = eBack(ss(1.1, 2.0, tm));
  if (p1 > 0) {
    c.save(); c.beginPath(); c.rect(0, 360, 1920, 340); c.clip();
    c.fillStyle = CREAM; c.font = `280px ${BEB}`;
    c.fillText('CORAL', lerp(-1000, 130, p1), 620);
    c.restore();
  }
  if (p2 > 0) {
    c.save(); c.beginPath(); c.rect(0, 360, 1920, 340); c.clip();
    c.font = `150px ${BEB}`; c.lineWidth = 5; c.strokeStyle = CREAM;
    c.strokeText('ALL CAPS', lerp(2900, 1150, p2), 590);
    c.restore();
  }
  const tg = eBack(ss(2.0, 2.7, tm));
  if (tg > 0) {
    c.save(); c.translate(1650, 210); c.scale(tg, tg);
    c.fillStyle = INK; c.fillRect(-95, -58, 190, 116);
    c.fillStyle = CREAM; c.font = `600 48px ${SANS}`; c.textAlign = 'center'; c.fillText('N°9', 0, 18); c.textAlign = 'left';
    c.restore();
  }
  const ft = eOut(ss(2.2, 3.0, tm));
  c.fillStyle = hex(INK, ft); c.font = `28px ${MONO}`;
  c.fillText('ALL CAPS · CONDENSED · CREAM & CORAL', 104, 1015);
  c.font = `34px ${MONO}`;
  c.fillText('CREAM BASE · CORAL BAND · CONDENSED CAPS', 104, 810);
  c.restore();
};

// ---- H10 ----
S.H10 = (c, w, h, t, s) => {
  const CREAM = '#FFF6E9', PINK = '#FF3D8B', BLUE = '#2E6BFF', LIME = '#B8E62E', ORA = '#FF7A1A', INK = '#17161A';
  const AB = `900 170px "Archivo Black","Arial Black",${SANS}`;
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = CREAM; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  if (!s.cf) {
    const r = rng(42);
    s.cf = Array.from({ length: 42 }, () => {
      let x = r() * 1920, y = r() * 1080;
      if (x < 1340 && y > 280 && y < 820) y = y < 550 ? 60 + r() * 180 : 850 + r() * 170;
      return [x, y, r() * TAU, .6 + r() * .8, (r() * 3) | 0, 14 + r() * 22];
    });
  }
  const b1 = eBack(ss(.2, 1.0, tm)), b2 = eBack(ss(.5, 1.3, tm));
  if (b1 > 0) { c.fillStyle = PINK; c.fillRect(220, 330, 1060 * Math.min(1, b1), 190); }
  if (b2 > 0) { c.fillStyle = BLUE; c.fillRect(420, 560, 560 * Math.min(1, b2), 190); }
  s.cf.forEach(([x, y, a, sp, kind, sz], i) => {
    const e = eBack(ss(1.2 + (i % 8) * .12, 1.9 + (i % 8) * .12, tm));
    if (e <= 0) return;
    const px = x + Math.sin(t * sp + a) * 26, py = y + Math.cos(t * sp * .8 + a) * 22, rot = a + t * sp * .4;
    c.save(); c.translate(px, py); c.rotate(rot); c.globalAlpha *= Math.min(1, e) * .7;
    c.fillStyle = [PINK, BLUE, LIME, ORA][i % 4];
    if (kind === 0) c.fillRect(-sz / 2, -sz / 2, sz, sz);
    else if (kind === 1) { c.beginPath(); c.arc(0, 0, sz / 2, 0, TAU); c.fill(); }
    else { c.beginPath(); c.moveTo(0, -sz / 2); c.lineTo(sz / 2, sz / 2); c.lineTo(-sz / 2, sz / 2); c.closePath(); c.fill(); }
    c.restore();
  });
  const t1 = eOut(ss(.5, 1.3, tm)), t2 = eOut(ss(.8, 1.6, tm));
  c.fillStyle = hex(INK, t1); c.font = AB; c.fillText('CREATIVE', 240, 485 + 20 * (1 - t1));
  c.fillStyle = hex(INK, t2); c.fillText('MODE', 440, 715 + 20 * (1 - t2));
  const bg = eBack(ss(2.0, 2.7, tm));
  if (bg > 0) {
    c.save(); c.translate(1560, 260); c.rotate(.1); c.scale(bg, bg);
    c.fillStyle = LIME; c.fillRect(-150, -60, 300, 120);
    c.lineWidth = 8; c.strokeStyle = INK; c.strokeRect(-150, -60, 300, 120);
    c.fillStyle = INK; c.font = `900 52px ${SANS}`; c.textAlign = 'center'; c.fillText('ON AIR', 0, 18); c.textAlign = 'left';
    c.restore();
  }
  c.restore();
};

// ---- H11 ----
S.H11 = (c, w, h, t, s) => {
  const CREAM = '#FDF6E3', CH = '#3A3A3A', PINK = '#F7C8D8', MINT = '#C9E8D2', BUT = '#F9E6A7', YOL = '#F6C445';
  const ROUND = `700 130px "Quicksand","Varela Round",${SANS}`;
  const u = Math.min(w / 1920, h / 1080), tm = t % 7;
  c.fillStyle = CREAM; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  const card = (x, y, cw, ch, col, e) => {
    if (e <= 0) return;
    c.save(); c.translate(x, y); c.scale(Math.min(1.05, e), Math.min(1.05, e));
    c.fillStyle = CH; c.fillRect(14, 14, cw, ch);
    c.fillStyle = col; c.fillRect(0, 0, cw, ch);
    c.lineWidth = 6; c.strokeStyle = CH; c.strokeRect(0, 0, cw, ch);
    c.restore();
  };
  card(140, 180, 460, 320, PINK, eBack(ss(.2, 1.0, tm)));
  card(140, 580, 460, 320, MINT, eBack(ss(.5, 1.3, tm)));
  card(1360, 180, 420, 720, BUT, eBack(ss(.8, 1.6, tm)));
  const daisy = (x, y, r, rot, e) => {
    if (e <= 0) return;
    c.save(); c.translate(x, y); c.scale(Math.min(1.05, e), Math.min(1.05, e)); c.rotate(rot);
    c.lineWidth = 4; c.strokeStyle = CH;
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU;
      c.fillStyle = '#FFFFFF';
      c.beginPath(); c.ellipse(Math.cos(a) * r * .62, Math.sin(a) * r * .62, r * .42, r * .22, a, 0, TAU); c.fill(); c.stroke();
    }
    c.fillStyle = YOL; c.beginPath(); c.arc(0, 0, r * .3, 0, TAU); c.fill(); c.stroke();
    c.restore();
  };
  daisy(370, 340, 120, t * .35, eBack(ss(1.2, 2.0, tm)));
  daisy(370, 740, 120, -t * .28, eBack(ss(1.5, 2.3, tm)));
  daisy(1570, 380, 150, t * .22, eBack(ss(1.8, 2.6, tm)));
  daisy(1150, 880, 90, -t * .4, eBack(ss(2.0, 2.8, tm)));
  const se = eBack(ss(.6, 1.4, tm));
  if (se > 0) {
    c.save(); c.translate(1180, 130); c.scale(se, se); c.rotate(t * .1);
    c.lineWidth = 5; c.strokeStyle = CH;
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c.beginPath(); c.moveTo(Math.cos(a) * 70, Math.sin(a) * 70); c.lineTo(Math.cos(a) * 105, Math.sin(a) * 105); c.stroke(); }
    c.fillStyle = YOL; c.beginPath(); c.arc(0, 0, 60, 0, TAU); c.fill(); c.stroke();
    c.restore();
  }
  const tt = eBack(ss(2.2, 3.0, tm));
  if (tt > 0) {
    c.save(); c.globalAlpha *= Math.min(1, tt); c.translate(960, 470); c.scale(tt, tt);
    c.font = ROUND; c.textAlign = 'center';
    c.fillStyle = CH; c.fillText('Daisy Days', 12, 12);
    c.fillStyle = '#FFFFFF'; c.fillText('Daisy Days', 0, 0);
    c.lineWidth = 8; c.strokeStyle = CH; c.strokeText('Daisy Days', 0, 0);
    c.fillStyle = CH; c.fillRect(-330, 140, 680, 120);
    c.fillStyle = '#FFFFFF'; c.fillRect(-340, 130, 680, 120);
    c.lineWidth = 6; c.strokeStyle = CH; c.strokeRect(-340, 130, 680, 120);
    c.font = `44px ${SANS}`; c.fillStyle = CH;
    c.fillText('阳光花园 · 粉彩 · 硬投影', 0, 212);
    c.textAlign = 'left';
    c.restore();
  }
  c.restore();
};

// ---- H12 ----
S.H12 = (c, w, h, t, s) => {
  const CREAM = '#F6EFDF', FOR = '#2E5D4B', PINK = '#E8A7B8', INK = '#22301F';
  const SERIF = 'Georgia,"Noto Serif SC","Songti SC",serif';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = CREAM; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  const pn = eOut(ss(.2, 1.2, tm));
  c.fillStyle = FOR; c.fillRect(0, 1080 - 1080 * pn, 800, 1080 * pn);
  const ci = eBack(ss(.8, 1.6, tm));
  if (ci > 0) {
    c.fillStyle = PINK; c.beginPath(); c.arc(1420, 350, 240 * Math.min(1, ci), 0, TAU); c.fill();
  }
  const up = eOut(ss(1.6, 2.4, tm));
  c.fillStyle = hex(INK, up); c.font = `32px ${SERIF}`;
  c.fillText('月刊 · 第十二期', 860, 260);
  c.fillText('EDITORIAL SERIES', 860, 312);
  const t1 = eOut(ss(1.2, 2.0, tm)), t2 = eOut(ss(1.5, 2.3, tm));
  c.fillStyle = hex(CREAM, t1); c.font = `140px ${SERIF}`;
  c.fillText('Editorial', 60, 330 + 22 * (1 - t1));
  c.fillStyle = hex(INK, t2); c.font = `150px ${SERIF}`;
  c.fillText('Forest', 860, 730 + 22 * (1 - t2));
  const ln = eOut(ss(1.8, 2.6, tm));
  c.strokeStyle = hex(INK, ln); c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(860, 790); c.lineTo(860 + 950 * ln, 790); c.stroke();
  c.lineWidth = 1;
  c.beginPath(); c.moveTo(860, 802); c.lineTo(860 + 950 * ln, 802); c.stroke();
  for (let i = 0; i < 8; i++) {
    const e = eOut(ss(2.2 + i * .1, 2.8 + i * .1, tm));
    if (e > 0) { c.fillStyle = hex(INK, .55 * e); c.fillRect(860, 850 + i * 26, (i === 7 ? 320 : 860) * e, 5); }
  }
  const sm = eOut(ss(2.0, 2.8, tm));
  c.fillStyle = hex(CREAM, sm); c.font = `30px ${SERIF}`;
  c.fillText('Vol. 12 — Green Issue', 60, 950);
  c.fillText('封面故事 · 森林与纸', 60, 1000);
  c.restore();
};

// ---- K1 ----
S.K1 = (c, w, h, t, s) => {
  const BG = '#F7F3E8', INK = '#28323A';
  const SUN = '#FFC93C', GRN = '#74C98A', CORAL = '#FF7A59', SKIN = '#FFD9B8', WOOD = '#B98A5E';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.lineWidth = 12; c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = INK;
  const grp = (a, b, fn) => {
    const e = eOut(ss(a, b, tm)); if (e <= 0) return;
    c.save(); c.globalAlpha = e; c.translate(0, (1 - e) * 90); fn(); c.restore();
  };
  grp(0, .8, () => {
    c.beginPath(); c.arc(1520, 250 + Math.sin(t * 1.1) * 10, 130, 0, TAU);
    c.fillStyle = SUN; c.fill(); c.stroke();
  });
  grp(.3, 1.1, () => {
    c.beginPath(); c.moveTo(0, 880); c.quadraticCurveTo(520, 730, 1040, 870);
    c.quadraticCurveTo(1520, 1010, 1920, 850); c.lineTo(1920, 1080); c.lineTo(0, 1080); c.closePath();
    c.fillStyle = GRN; c.fill(); c.stroke();
  });
  grp(.6, 1.4, () => {
    const bob = Math.sin(t * 1.3) * 8;
    c.beginPath(); c.arc(620, 520 + bob, 110, 0, TAU); c.fillStyle = SKIN; c.fill(); c.stroke();
    c.beginPath(); c.roundRect(530, 645 + bob, 180, 205, 42); c.fillStyle = CORAL; c.fill(); c.stroke();
    for (const sd of [-1, 1]) {
      c.save(); c.translate(620 + sd * 95, 690 + bob); c.scale(sd, 1); c.rotate(.55 + Math.sin(t * 1.3 + sd) * .18);
      c.beginPath(); c.roundRect(-24, -24, 205, 48, 24); c.fillStyle = SKIN; c.fill(); c.stroke(); c.restore();
    }
    for (const sd of [-1, 1]) {
      c.beginPath(); c.roundRect(560 + sd * 52, 845 + bob, 62, 170, 31); c.fillStyle = INK; c.fill();
    }
  });
  grp(.9, 1.7, () => {
    c.beginPath(); c.roundRect(1180, 645, 46, 295, 22); c.fillStyle = WOOD; c.fill(); c.stroke();
    for (const [ox, oy, r] of [[-115, 20, 105], [0, -85, 128], [115, 25, 105]]) {
      c.beginPath(); c.arc(1203 + ox, 565 + oy, r, 0, TAU); c.fillStyle = GRN; c.fill(); c.stroke();
    }
  });
  const ti = eOut(ss(1.3, 2.1, tm));
  c.globalAlpha = ti; c.fillStyle = INK; c.textAlign = 'center';
  c.font = `700 140px ${SANS}`; c.fillText('扁平矢量', 960, 265);
  c.font = `36px ${MONO}`; c.fillStyle = hex(INK, .7);
  c.fillText('FLAT VECTOR · CONSISTENT LINE · NO SHADING', 960, 335);
  c.textAlign = 'left'; c.globalAlpha = 1;
  c.restore();
};

// ---- K2 ----
S.K2 = (c, w, h, t, s) => {
  const SKIN = '#FFE7D2', HAIR = '#B8A4F0', DRESS = '#9FE0C8', BLUSH = '#FF9FB1';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = vgrad(c, 1080, '#FFEAF2', '#FFF7E6'); c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  for (let i = 0; i < 8; i++) {
    const e = eOut(ss(.2 + i * .1, .9 + i * .1, tm)); if (e <= 0) continue;
    const px = 170 + ((i * 277) % 1580), py = 130 + ((i * 391) % 830) + Math.sin(t * .9 + i * 1.3) * 22;
    c.globalAlpha = e * .8; c.fillStyle = ['#FFB7C9', '#B7E4FF', '#FFE28A', '#C9F0D8'][i % 4];
    if (i % 2) { c.beginPath(); c.arc(px, py, 26, 0, TAU); c.fill(); }
    else {
      c.beginPath();
      c.moveTo(px, py - 34); c.quadraticCurveTo(px, py, px + 34, py);
      c.quadraticCurveTo(px, py, px, py + 34); c.quadraticCurveTo(px, py, px - 34, py);
      c.quadraticCurveTo(px, py, px, py - 34); c.fill();
    }
    c.globalAlpha = 1;
  }
  const e = Math.min(1.05, eBack(ss(0, .9, tm)));
  if (e > 0) {
    const bob = Math.sin(t * 1.4) * 10;
    c.save(); c.translate(960, 545 + bob); c.scale(e, e);
    c.fillStyle = DRESS;
    c.beginPath(); c.moveTo(-120, 265); c.quadraticCurveTo(0, 130, 120, 265); c.closePath(); c.fill();
    c.strokeStyle = SKIN; c.lineWidth = 52; c.lineCap = 'round';
    for (const sd of [-1, 1]) {
      c.beginPath(); c.moveTo(sd * 95, 215); c.lineTo(sd * 190, 262 + Math.sin(t * 1.6 + sd) * 14); c.stroke();
      c.beginPath(); c.moveTo(sd * 55, 258); c.lineTo(sd * 62, 352); c.stroke();
    }
    c.fillStyle = SKIN; c.beginPath(); c.ellipse(0, -55, 252, 228, 0, 0, TAU); c.fill();
    c.fillStyle = HAIR;
    c.beginPath(); c.ellipse(0, -60, 262, 238, 0, Math.PI, TAU); c.fill();
    c.beginPath();
    c.moveTo(-258, -75); c.quadraticCurveTo(-230, -235, 0, -252);
    c.quadraticCurveTo(230, -235, 258, -75);
    c.lineTo(190, -120); c.lineTo(120, -35); c.lineTo(45, -125); c.lineTo(-40, -30); c.lineTo(-125, -125); c.lineTo(-195, -40);
    c.closePath(); c.fill();
    const bl = 1 - .92 * ss(.9, .99, Math.abs(Math.sin(t * 1.15)));
    for (const sd of [-1, 1]) {
      const ex = sd * 102, ey = -35;
      c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(ex, ey, 66, 74 * bl, 0, 0, TAU); c.fill();
      if (bl > .12) {
        c.fillStyle = '#4A3B52'; c.beginPath(); c.ellipse(ex, ey + 8, 46, 54 * bl, 0, 0, TAU); c.fill();
        c.fillStyle = '#FFF';
        c.beginPath(); c.arc(ex - 18, ey - 20 * bl, 17, 0, TAU); c.fill();
        c.beginPath(); c.arc(ex + 18, ey + 22 * bl, 9, 0, TAU); c.fill();
      }
      c.fillStyle = hex(BLUSH, .85);
      c.beginPath(); c.ellipse(sd * 185, 48, 52, 30, 0, 0, TAU); c.fill();
    }
    c.strokeStyle = '#B26B7E'; c.lineWidth = 9; c.lineCap = 'round';
    c.beginPath(); c.arc(0, 55, 26, .25 * Math.PI, .75 * Math.PI); c.stroke();
    c.restore();
  }
  const ti = eOut(ss(1.2, 2, tm));
  c.globalAlpha = ti; c.fillStyle = '#8A6E9E'; c.textAlign = 'center';
  c.font = `700 130px ${SANS}`; c.fillText('Q 版', 960, 175);
  c.font = `34px ${MONO}`; c.fillText('CHIBI · BIG HEAD · PASTEL', 960, 240);
  c.textAlign = 'left'; c.globalAlpha = 1;
  c.restore();
};

// ---- K3 ----
S.K3 = (c, w, h, t, s) => {
  const BG = '#FFE9F1', BODY = '#FFD3E0', INK = '#8A5A6E', BLUSH = '#FF9BB8';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  const es = eOut(ss(.2, 1, tm));
  if (es > 0) {
    c.globalAlpha = es * .7;
    for (let i = 0; i < 9; i++) {
      const px = 150 + ((i * 263) % 1620), py = 120 + ((i * 431) % 840) + Math.sin(t * .9 + i) * 18;
      c.fillStyle = [BLUSH, '#FFE28A', '#B7E4FF'][i % 3];
      c.beginPath(); c.arc(px, py, 10 + (i % 3) * 9, 0, TAU); c.fill();
    }
    c.globalAlpha = 1;
  }
  const critter = (x, y, r, e, ph) => {
    if (e <= 0) return;
    const sq = 1 + Math.sin(t * 1.2 + ph) * .022, bob = Math.sin(t * 1.2 + ph) * r * .05;
    c.save(); c.translate(x, y + bob); c.scale(e, e);
    c.fillStyle = BODY;
    for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * r * .62, -r * .78, r * .32, 0, TAU); c.fill(); }
    c.beginPath(); c.ellipse(0, 0, r * sq, r * .92 / sq, 0, 0, TAU); c.fill();
    for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * r * .62, r * .58, r * .22, r * .15, 0, 0, TAU); c.fill(); }
    c.fillStyle = INK;
    for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * r * .34, -r * .12, r * .085, 0, TAU); c.fill(); }
    c.fillStyle = hex(BLUSH, .85);
    for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * r * .62, r * .12, r * .17, r * .1, 0, 0, TAU); c.fill(); }
    c.strokeStyle = INK; c.lineWidth = r * .045; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(-r * .11, r * .12); c.quadraticCurveTo(-r * .05, r * .21, 0, r * .13);
    c.quadraticCurveTo(r * .05, r * .21, r * .11, r * .12);
    c.stroke();
    c.restore();
  };
  critter(820, 560, 270, Math.min(1.05, eBack(ss(0, .9, tm))), 0);
  critter(1370, 700, 150, Math.min(1.05, eBack(ss(.6, 1.5, tm))), 2);
  const ti = eOut(ss(1.2, 2, tm));
  c.globalAlpha = ti; c.fillStyle = '#C96A8E'; c.textAlign = 'center';
  c.font = `700 135px ${SANS}`; c.fillText('卡哇伊', 960, 225);
  c.font = `34px ${MONO}`; c.fillText('KAWAII · ROUND · DOT EYES · PASTEL', 960, 295);
  c.textAlign = 'left'; c.globalAlpha = 1;
  c.restore();
};

// ---- K4 ----
S.K4 = (c, w, h, t, s) => {
  const BG = '#FAFAF6', INK = '#1E1E1E';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.strokeStyle = INK; c.lineWidth = 8; c.lineCap = 'round';
  const man = (x, y, sc, ph, a, b) => {
    const e = eOut(ss(a, b, tm)); if (e <= 0) return;
    c.save(); c.translate(x, y); c.scale(sc, sc); c.globalAlpha = e;
    c.beginPath(); c.arc(0, -150, 36, 0, TAU); c.stroke();
    c.beginPath(); c.moveTo(0, -114); c.lineTo(0, 20); c.stroke();
    const sw = Math.sin(t * 1.8 + ph), sw2 = Math.sin(t * 1.8 + ph + 1.2);
    c.beginPath();
    c.moveTo(0, -84); c.lineTo(70, -84 + 52 * sw);
    c.moveTo(0, -84); c.lineTo(-70, -84 - 52 * sw);
    c.moveTo(0, 20); c.lineTo(58, 130 + 26 * sw2);
    c.moveTo(0, 20); c.lineTo(-58, 130 - 26 * sw2);
    c.stroke();
    c.restore();
  };
  man(520, 700, 1, 0, 0, .9);
  man(960, 700, 1.15, 2, .25, 1.15);
  man(1420, 700, .95, 4, .5, 1.4);
  c.globalAlpha = eOut(ss(.6, 1.4, tm));
  c.lineWidth = 4;
  c.beginPath(); c.moveTo(220, 880); c.lineTo(1700, 880); c.stroke();
  c.globalAlpha = eOut(ss(1.2, 2, tm));
  c.fillStyle = INK; c.textAlign = 'center';
  c.font = `300 120px ${SANS}`; c.fillText('极简线条小人', 960, 260);
  c.font = `30px ${MONO}`; c.fillText('MINIMALIST LINE · MONOCHROME', 960, 330);
  c.textAlign = 'left'; c.globalAlpha = 1;
  c.restore();
};

// ---- K5 ----
S.K5 = (c, w, h, t, s) => {
  const BG = '#F5F0E6', NAVY = '#2E2A4A', SKIN = '#EFB08A';
  const PUR = '#6C63E0', TEAL = '#1FB8A6', MUST = '#F5C242', CORAL = '#EF6D5A';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  const shapes = [
    () => { c.fillStyle = MUST; c.beginPath(); c.arc(300, 240, 175, 0, TAU); c.fill(); },
    () => { c.fillStyle = TEAL; c.beginPath(); c.arc(1650, 830, 230, Math.PI, 0); c.closePath(); c.fill(); },
    () => { c.fillStyle = CORAL; c.beginPath(); c.moveTo(1560, 110); c.lineTo(1880, 310); c.lineTo(1510, 350); c.closePath(); c.fill(); },
    () => {
      c.strokeStyle = PUR; c.lineWidth = 26; c.lineCap = 'round';
      c.beginPath(); c.moveTo(120, 820);
      for (let i = 0; i < 6; i++) c.quadraticCurveTo(120 + i * 90 + 45, 820 + (i % 2 ? -70 : 70), 120 + (i + 1) * 90, 820);
      c.stroke();
    },
  ];
  shapes.forEach((fn, i) => {
    const e = eOut(ss(i * .22, i * .22 + .8, tm)); if (e <= 0) return;
    c.save(); c.globalAlpha = e; fn(); c.restore();
  });
  const person = (x, y, sc, shirt, ph, a, b) => {
    const e = eOut(ss(a, b, tm)); if (e <= 0) return;
    c.save(); c.translate(x, y); c.scale(sc, sc); c.globalAlpha = e;
    const sw = Math.sin(t * 1.2 + ph);
    c.lineCap = 'round';
    c.strokeStyle = NAVY; c.lineWidth = 30;
    c.beginPath(); c.moveTo(-25, 240); c.lineTo(-85, 590 + 16 * sw);
    c.moveTo(25, 240); c.lineTo(95, 590 - 16 * sw); c.stroke();
    c.fillStyle = NAVY;
    c.beginPath(); c.arc(-85, 615 + 16 * sw, 36, 0, TAU); c.fill();
    c.beginPath(); c.arc(95, 615 - 16 * sw, 36, 0, TAU); c.fill();
    c.fillStyle = shirt; c.beginPath(); c.roundRect(-95, -30, 190, 285, 95); c.fill();
    c.strokeStyle = SKIN; c.lineWidth = 26;
    c.beginPath(); c.moveTo(-85, 20);
    c.quadraticCurveTo(-190, 60, -215 - 20 * sw, 190 + 30 * sw);
    c.moveTo(85, 20);
    c.quadraticCurveTo(195, 55, 225 + 20 * sw, 165 - 40 * sw);
    c.stroke();
    c.fillStyle = SKIN; c.beginPath(); c.ellipse(0, -125, 88, 105, 0, 0, TAU); c.fill();
    c.fillStyle = NAVY; c.beginPath(); c.arc(0, -165, 92, Math.PI, 0); c.closePath(); c.fill();
    c.restore();
  };
  person(620, 400, 1, PUR, 0, .7, 1.5);
  person(1180, 420, .92, CORAL, 2.1, 1.0, 1.8);
  const ti = eOut(ss(1.6, 2.4, tm));
  c.globalAlpha = ti; c.fillStyle = NAVY;
  c.fillRect(120, 920, 420 * clamp((tm - 1.6) / .8, 0, 1), 14);
  c.font = `700 110px ${SANS}`; c.fillText('孟菲斯扁平人', 120, 890);
  c.font = `30px ${MONO}`; c.fillStyle = hex(NAVY, .7);
  c.fillText('CORPORATE MEMPHIS · FLAT VECTOR PEOPLE', 120, 985);
  c.globalAlpha = 1;
  c.restore();
};

// ---- K6 ----
S.K6 = (c, w, h, t, s) => {
  const SKY = '#A9D3EE', GROUND = '#D8D0BE', WALL = '#F2DFB8', ROOF = '#CE6A55', WIN = '#7FB6D9';
  const INK = '#141414', CREAM = '#FBF7EC', COAT = '#4E86C6';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = SKY; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.lineWidth = 8; c.lineJoin = 'round'; c.strokeStyle = INK;
  const flat = (fn, fill, a, b) => {
    const e = eOut(ss(a, b, tm)); if (e <= 0) return;
    c.save(); c.globalAlpha = e; fn();
    if (fill) { c.fillStyle = fill; c.fill(); }
    c.stroke(); c.restore();
  };
  flat(() => { c.beginPath(); c.rect(0, 820, 1920, 260); }, GROUND, 0, .7);
  flat(() => { c.beginPath(); c.rect(180, 330, 620, 490); }, WALL, .25, 1.0);
  flat(() => { c.beginPath(); c.moveTo(130, 330); c.lineTo(490, 145); c.lineTo(850, 330); c.closePath(); }, ROOF, .45, 1.15);
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    flat(() => { c.beginPath(); c.rect(265 + i * 310, 405 + j * 215, 155, 145); }, WIN, .7 + (i + j) * .12, 1.3 + (i + j) * .12);
  }
  flat(() => { c.beginPath(); c.roundRect(415, 620, 155, 200, 6); }, ROOF, .95, 1.55);
  const cx = 1210 + Math.sin(t * .25) * 40;
  flat(() => {
    c.beginPath(); c.arc(cx, 250, 75, Math.PI * .5, Math.PI * 1.5);
    c.arc(cx + 85, 205, 95, Math.PI, 0); c.arc(cx + 200, 255, 70, Math.PI * 1.5, Math.PI * .5);
    c.closePath();
  }, CREAM, .6, 1.3);
  const bob = Math.abs(Math.sin(t * 1.7)) * 9;
  flat(() => { c.beginPath(); c.arc(1350, 585 - bob, 82, 0, TAU); }, '#F6D9B8', 1.05, 1.75);
  flat(() => { c.beginPath(); c.arc(1350, 545 - bob, 84, Math.PI, TAU); c.closePath(); }, '#3B2E26', 1.15, 1.85);
  flat(() => { c.beginPath(); c.roundRect(1288, 665 - bob, 125, 190, 30); }, COAT, 1.25, 1.95);
  flat(() => {
    c.beginPath();
    c.moveTo(1310, 845 - bob); c.lineTo(1295, 990 - bob * .2);
    c.moveTo(1392, 845 - bob); c.lineTo(1425, 985 + bob * .2);
    c.moveTo(1290, 700 - bob); c.lineTo(1215, 810 + bob * .3);
    c.moveTo(1412, 700 - bob); c.lineTo(1480, 805 - bob * .3);
  }, null, 1.35, 2.05);
  const cb = eOut(ss(1.8, 2.5, tm));
  if (cb > 0) {
    c.save(); c.globalAlpha = cb; c.fillStyle = CREAM;
    c.fillRect(100, 70, 620, 150); c.strokeRect(100, 70, 620, 150);
    c.fillStyle = INK; c.font = `700 84px ${SANS}`; c.fillText('清线漫画', 150, 175);
    c.font = `30px ${MONO}`; c.fillStyle = hex(INK, .7); c.fillText('LIGNE CLAIRE', 470, 172);
    c.restore();
  }
  c.restore();
};

// ---- K7 ----
S.K7 = (c, w, h, t, s) => {
  const HAIR = '#5B6BB5', HAIR2 = '#454F8C', SKIN = '#FFE9D6', SKIN2 = '#F0C6A8', LINE = '#43354B';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = vgrad(c, 1080, '#BFE3FF', '#FFEAF2'); c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.fillStyle = hex('#FFFFFF', .5); c.beginPath(); c.arc(960, 560, 470, 0, TAU); c.fill();
  for (let i = 0; i < 12; i++) {
    const px = 180 + ((i * 419) % 1560), py = 90 + ((i * 233) % 880);
    const a = .3 + .35 * Math.sin(t * 1.3 + i * 1.7), r = 9 + 5 * Math.sin(t + i);
    c.fillStyle = hex('#FFFFFF', a);
    c.beginPath();
    c.moveTo(px, py - r * 2.2); c.quadraticCurveTo(px, py, px + r * 2.2, py);
    c.quadraticCurveTo(px, py, px, py + r * 2.2); c.quadraticCurveTo(px, py, px - r * 2.2, py);
    c.quadraticCurveTo(px, py, px, py - r * 2.2); c.fill();
  }
  const e = eOut(ss(0, 1, tm));
  if (e > 0) {
    const bob = Math.sin(t * 1.1) * 8;
    c.save(); c.globalAlpha = e; c.translate(0, (1 - e) * 60 + bob);
    c.fillStyle = HAIR; c.beginPath(); c.ellipse(960, 590, 375, 430, 0, 0, TAU); c.fill();
    c.fillStyle = SKIN; c.beginPath();
    c.moveTo(725, 470); c.quadraticCurveTo(735, 300, 960, 295);
    c.quadraticCurveTo(1185, 300, 1195, 470);
    c.quadraticCurveTo(1195, 780, 960, 875); c.quadraticCurveTo(725, 780, 725, 470);
    c.closePath(); c.fill();
    c.fillStyle = SKIN2; c.beginPath();
    c.moveTo(745, 445); c.quadraticCurveTo(960, 545, 1175, 445);
    c.quadraticCurveTo(1180, 355, 960, 345); c.quadraticCurveTo(740, 355, 745, 445);
    c.closePath(); c.fill();
    c.fillStyle = HAIR;
    c.beginPath();
    c.moveTo(685, 430); c.quadraticCurveTo(700, 235, 960, 230);
    c.quadraticCurveTo(1220, 235, 1235, 430);
    c.lineTo(1170, 545); c.lineTo(1115, 405); c.lineTo(1045, 565); c.lineTo(985, 410);
    c.lineTo(915, 560); c.lineTo(855, 405); c.lineTo(785, 540);
    c.closePath(); c.fill();
    for (const sd of [-1, 1]) {
      c.beginPath(); c.moveTo(960 + sd * 300, 380);
      c.quadraticCurveTo(960 + sd * 420, 620, 960 + sd * 330, 900);
      c.lineTo(960 + sd * 235, 860); c.quadraticCurveTo(960 + sd * 300, 600, 960 + sd * 262, 420);
      c.closePath(); c.fill();
    }
    const bl = 1 - .92 * ss(.9, .99, Math.abs(Math.sin(t * 1.05)));
    for (const sd of [-1, 1]) {
      const ex = 960 + sd * 135, ey = 585;
      c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(ex, ey, 96, 82 * bl, 0, 0, TAU); c.fill();
      if (bl > .1) {
        c.save(); c.beginPath(); c.ellipse(ex, ey, 78, 74 * bl, 0, 0, TAU); c.clip();
        c.fillStyle = '#7D8FE0'; c.fillRect(ex - 85, ey - 85 * bl, 170, 170 * bl);
        c.fillStyle = HAIR2; c.fillRect(ex - 85, ey - 85 * bl, 170, 85 * bl);
        c.restore();
        c.fillStyle = '#2A2F55'; c.beginPath(); c.ellipse(ex, ey + 8, 30, 40 * bl, 0, 0, TAU); c.fill();
        c.fillStyle = '#FFFFFF';
        c.beginPath(); c.arc(ex - 28, ey - 24 * bl, 21, 0, TAU); c.fill();
        c.beginPath(); c.arc(ex + 24, ey + 18 * bl, 11, 0, TAU); c.fill();
        c.strokeStyle = LINE; c.lineWidth = 15; c.lineCap = 'round';
        c.beginPath(); c.moveTo(ex - 96, ey - 52 * bl); c.quadraticCurveTo(ex, ey - 112 * bl, ex + 96, ey - 48 * bl); c.stroke();
      }
      c.strokeStyle = LINE; c.lineWidth = 10;
      c.beginPath(); c.moveTo(ex - 70, ey - 135); c.quadraticCurveTo(ex, ey - 175, ex + 70, ey - 128); c.stroke();
    }
    c.strokeStyle = LINE; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(965, 645); c.lineTo(952, 675); c.stroke();
    c.beginPath(); c.moveTo(938, 745); c.quadraticCurveTo(960, 765, 985, 743); c.stroke();
    c.fillStyle = hex('#FF9AA8', .5);
    for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(960 + sd * 215, 665, 62, 30, 0, 0, TAU); c.fill(); }
    c.fillStyle = '#3D4C86';
    c.beginPath(); c.moveTo(735, 1020); c.quadraticCurveTo(960, 865, 1185, 1020);
    c.lineTo(1185, 1080); c.lineTo(735, 1080); c.closePath(); c.fill();
    c.fillStyle = '#FFFFFF';
    c.beginPath(); c.moveTo(880, 950); c.lineTo(960, 1060); c.lineTo(1040, 950);
    c.quadraticCurveTo(960, 905, 880, 950); c.closePath(); c.fill();
    c.restore();
  }
  const ti = eOut(ss(1.5, 2.3, tm));
  c.globalAlpha = ti; c.fillStyle = '#43354B';
  c.font = `700 110px ${SANS}`; c.fillText('日式动画', 130, 215);
  c.font = `32px ${MONO}`; c.fillStyle = hex('#43354B', .7);
  c.fillText('ANIME CEL · BIG EYES · CLEAN LINE', 130, 285);
  c.globalAlpha = 1;
  c.restore();
};

// ---- K8 ----
S.K8 = (c, w, h, t, s) => {
  const INK = '#7A4B2A', HILL = '#A9C08A', LEAF = '#6E9A5B', TRUNK = '#A9713F';
  const SUN = '#F2B25C', BEAR = '#D9A066', MZL = '#F2D8B0';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = '#F7EFDD'; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  if (!s.tex) s.tex = paperTex(1920, 1080, 1, '#F7EFDD', 11);
  c.drawImage(s.tex, 0, 0, 1920, 1080);
  c.lineWidth = 6; c.lineJoin = 'round'; c.strokeStyle = hex(INK, .85);
  const e1 = eOut(ss(0, .9, tm));
  if (e1 > 0) {
    c.save(); c.globalAlpha = e1; c.fillStyle = HILL;
    c.beginPath(); c.moveTo(0, 900); c.quadraticCurveTo(480, 700, 980, 860);
    c.quadraticCurveTo(1480, 1010, 1920, 840); c.lineTo(1920, 1080); c.lineTo(0, 1080); c.closePath();
    c.fill(); c.stroke(); c.restore();
  }
  const e2 = eOut(ss(.35, 1.15, tm));
  if (e2 > 0) {
    c.save(); c.globalAlpha = e2; c.fillStyle = SUN;
    c.beginPath(); c.arc(1610, 260 + Math.sin(t * .7) * 10, 120 * (1 + Math.sin(t * .8) * .03), 0, TAU);
    c.fill(); c.stroke(); c.restore();
  }
  const e3 = eOut(ss(.7, 1.5, tm));
  if (e3 > 0) {
    c.save(); c.globalAlpha = e3; c.translate(420, 0); c.rotate(Math.sin(t * .6) * .03);
    c.fillStyle = TRUNK; c.beginPath(); c.roundRect(-38, 560, 76, 340, 24); c.fill(); c.stroke();
    c.fillStyle = LEAF;
    for (const [ox, oy, r] of [[-130, -30, 130], [0, -130, 155], [135, -20, 130], [20, 60, 140]]) {
      c.beginPath(); c.arc(ox, 520 + oy, r, 0, TAU); c.fill(); c.stroke();
    }
    c.restore();
  }
  const e4 = eBack(ss(1.1, 1.9, tm));
  if (e4 > 0) {
    const bob = Math.sin(t * 1.3) * 10, sc = Math.min(1.05, e4);
    c.save(); c.translate(1180, 700 + bob); c.scale(sc, sc);
    c.fillStyle = BEAR;
    c.beginPath(); c.ellipse(0, 120, 150, 140, 0, 0, TAU); c.fill(); c.stroke();
    for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * 115, -105, 58, 0, TAU); c.fill(); c.stroke(); }
    c.beginPath(); c.arc(0, -40, 135, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = MZL; c.beginPath(); c.ellipse(0, 5, 68, 52, 0, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = INK;
    c.beginPath(); c.arc(-52, -65, 12, 0, TAU); c.fill();
    c.beginPath(); c.arc(52, -65, 12, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(0, -12, 16, 12, 0, 0, TAU); c.fill();
    c.strokeStyle = hex(INK, .85); c.lineWidth = 5;
    c.beginPath(); c.arc(0, 8, 22, .2 * Math.PI, .8 * Math.PI); c.stroke();
    c.restore();
  }
  const ti = eOut(ss(1.7, 2.5, tm));
  c.globalAlpha = ti; c.fillStyle = INK; c.textAlign = 'center';
  c.font = `700 130px "Comic Sans MS", "Chalkboard SE", ${SANS}`;
  c.fillText('绘本', 960, 235);
  c.font = `34px ${MONO}`; c.fillStyle = hex(INK, .75);
  c.fillText('CHILDRENS BOOK · PAPER TEXTURE · WARM', 960, 300);
  c.textAlign = 'left'; c.globalAlpha = 1;
  c.restore();
};

// ---- K9 ----
S.K9 = (c, w, h, t, s) => {
  const BG = '#FBF9F2', INK = '#26221E', RED = '#E2483C';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.lineCap = 'round'; c.lineJoin = 'round';
  const wob = (pts, sd, lw, col, e) => {
    if (e <= 0) return;
    c.save(); c.globalAlpha = e;
    for (let k = 0; k < 2; k++) {
      c.strokeStyle = col; c.lineWidth = lw - k;
      c.beginPath();
      pts.forEach((p, i) => {
        const jx = Math.sin(i * 2.3 + sd + k * 1.7 + t * 1.2) * 7 + (k ? 4 : -3);
        const jy = Math.cos(i * 1.9 + sd + k * 2.1 - t) * 7 + (k ? 3 : -3);
        if (i) c.lineTo(p[0] + jx, p[1] + jy); else c.moveTo(p[0] + jx, p[1] + jy);
      });
      c.stroke();
    }
    c.restore();
  };
  const circ = (x, y, r, n) => Array.from({ length: n + 1 }, (_, i) =>
    [x + Math.cos(i / n * TAU) * r, y + Math.sin(i / n * TAU) * r]);
  const e1 = eOut(ss(0, .9, tm));
  wob(circ(620, 400, 150, 22), 1, 7, INK, e1);
  wob(circ(565, 370, 12, 10), 2, 6, INK, e1);
  wob(circ(675, 370, 12, 10), 3, 6, INK, e1);
  wob([[575, 455], [600, 480], [625, 455], [650, 480], [675, 455]], 4, 6, INK, e1);
  wob([[620, 555], [620, 800]], 5, 7, INK, e1);
  wob([[620, 620], [500, 700]], 6, 7, INK, e1);
  wob([[620, 620], [745, 685]], 7, 7, INK, e1);
  wob([[620, 800], [545, 960]], 8, 7, INK, e1);
  wob([[620, 800], [710, 955]], 9, 7, INK, e1);
  wob([[1000, 420], [1180, 380], [1330, 420], [1450, 360]], 12, 6, INK, eOut(ss(.8, 1.5, tm)));
  wob([[300, 240], [420, 205], [540, 250]], 11, 7, RED, eOut(ss(1.2, 1.9, tm)));
  const e3 = eOut(ss(1.5, 2.2, tm));
  wob([[1150, 620], [1520, 620], [1520, 820], [1150, 820], [1150, 620]], 13, 7, INK, e3);
  wob([[1150, 620], [1520, 820]], 14, 5, RED, e3);
  wob([[1520, 620], [1150, 820]], 15, 5, RED, e3);
  wob([[1650, 240], [1700, 345], [1815, 355], [1725, 430], [1760, 545], [1650, 485],
    [1545, 550], [1580, 435], [1495, 360], [1610, 350], [1650, 240]], 16, 6, INK, eOut(ss(1.9, 2.6, tm)));
  const ti = eOut(ss(2.1, 2.9, tm));
  if (ti > 0) {
    c.save(); c.textAlign = 'center';
    c.font = `700 170px ${SANS}`; c.fillStyle = INK;
    c.globalAlpha = ti * .5; c.fillText('涂鸦', 972, 112); c.fillText('涂鸦', 948, 96);
    c.globalAlpha = ti; c.fillText('涂鸦', 960, 104);
    c.font = `34px ${MONO}`; c.fillStyle = hex(INK, .6);
    c.fillText('DOODLE · ROUGH LINES · SKETCH', 960, 172);
    c.restore();
  }
  c.restore();
};

// ---- K10 ----
S.K10 = (c, w, h, t, s) => {
  const BOARD = '#22302B';
  const WHT = '#F2EEE2', YEL = '#FFD866', PINK = '#FF9BB3', CYAN = '#8FE3D8', ORG = '#FFB07C';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = BOARD; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  if (!s.gr) { const r = rng(21); s.gr = [...Array(150)].map(() => [r() * 1920, r() * 1080, 30 + r() * 130, r()]); }
  for (const [x, y, rr, a] of s.gr) {
    c.fillStyle = hex('#FFFFFF', .015 + a * .03);
    c.beginPath(); c.arc(x, y, rr, 0, TAU); c.fill();
  }
  const chalk = (fn, col, lw, e) => {
    if (e <= 0) return;
    for (const [dx, dy, al] of [[0, 0, .9], [2.5, -2, .38], [-2, 2, .3]]) {
      c.save(); c.globalAlpha = e * al; c.translate(dx, dy);
      c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round';
      fn(); c.stroke(); c.restore();
    }
  };
  const chalkText = (txt, x, y, font, col, e) => {
    if (e <= 0) return;
    c.font = font; c.textAlign = 'center';
    for (const [dx, dy, al] of [[0, 0, .95], [3, -2, .4], [-3, 2, .3], [1, 3, .22]]) {
      c.save(); c.globalAlpha = e * al; c.fillStyle = col;
      c.fillText(txt, x + dx, y + dy); c.restore();
    }
  };
  chalkText('粉笔黑板', 960, 340, `700 170px ${SANS}`, WHT, eOut(ss(0, .9, tm)));
  const pts = [];
  for (let i = 0; i <= 12; i++) pts.push([620 + i * 58, 425 + Math.sin(i * 1.2 + t) * 12]);
  chalk(() => {
    c.beginPath();
    pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
  }, YEL, 14, eOut(ss(.5, 1.2, tm)));
  const eb = eOut(ss(1.0, 1.8, tm));
  chalk(() => {
    c.beginPath(); c.arc(430, 680, 110, 0, TAU);
    c.moveTo(395, 785); c.lineTo(465, 785);
    c.moveTo(402, 815); c.lineTo(458, 815);
    c.moveTo(415, 845); c.lineTo(445, 845);
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU + t * .25;
      c.moveTo(430 + Math.cos(a) * 150, 680 + Math.sin(a) * 150);
      c.lineTo(430 + Math.cos(a) * 205, 680 + Math.sin(a) * 205);
    }
  }, PINK, 12, eb);
  chalk(() => {
    c.beginPath(); c.moveTo(660, 660);
    c.quadraticCurveTo(800, 600, 920, 655);
    c.moveTo(920, 655); c.lineTo(870, 630);
    c.moveTo(920, 655); c.lineTo(880, 690);
  }, CYAN, 12, eOut(ss(1.4, 2.1, tm)));
  chalk(() => { c.beginPath(); c.roundRect(980, 560, 560, 240, 12); }, ORG, 12, eOut(ss(1.8, 2.5, tm)));
  chalkText('1 + 1 = 2', 1260, 715, `700 110px ${SANS}`, ORG, eOut(ss(2.1, 2.8, tm)));
  if (!s.dust) { const r = rng(33); s.dust = [...Array(120)].map(() => [r() * 1920, r() * 1080, 1.5 + r() * 3.5]); }
  c.fillStyle = hex(WHT, .18);
  for (const [x, y, rr] of s.dust) { c.beginPath(); c.arc(x, y, rr, 0, TAU); c.fill(); }
  chalkText('CHALK · BLACKBOARD · HAND-DRAWN', 960, 985, `44px ${MONO}`, hex(WHT, .8), eOut(ss(2.4, 3.1, tm)));
  chalk(() => {
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      for (let q = 0; q <= 20; q++) {
        const xx = 150 + q * 22, yy = 195 + i * 58 + Math.sin(q * .9 + i) * 7;
        if (q) c.lineTo(xx, yy); else c.moveTo(xx, yy);
      }
    }
  }, WHT, 7, eOut(ss(1.2, 1.9, tm)));
  chalk(() => {
    c.beginPath(); c.arc(1620, 230, 62, 0, TAU);
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * TAU + t * .18;
      c.moveTo(1620 + Math.cos(a) * 88, 230 + Math.sin(a) * 88);
      c.lineTo(1620 + Math.cos(a) * 126, 230 + Math.sin(a) * 126);
    }
  }, PINK, 11, eOut(ss(1.6, 2.3, tm)));
  chalkText('2 + 2 = 4', 1620, 405, `700 70px ${SANS}`, CYAN, eOut(ss(2.0, 2.7, tm)));
  chalkText('a² + b² = c²', 800, 905, `700 74px ${SANS}`, YEL, eOut(ss(2.3, 3.0, tm)));
  chalk(() => {
    c.beginPath();
    for (let q = 0; q <= 24; q++) {
      const xx = 200 + q * 24, yy = 905 + Math.sin(q * .7) * 9;
      if (q) c.lineTo(xx, yy); else c.moveTo(xx, yy);
    }
  }, PINK, 9, eOut(ss(2.5, 3.2, tm)));
  c.restore();
};

// ---- K11 ----
S.K11 = (c, w, h, t, s) => {
  const PAPER = '#FFFDF6', RULE = '#C7D8EA', RED = '#E4736B', INK = '#3A3A3A';
  const HL = '#FFE58A', STK = '#FFE07A', TAPE = '#9ED8C4', GREEN = '#3FA36B';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = PAPER; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  const rl = eOut(ss(0, .8, tm));
  if (rl > 0) {
    c.save(); c.globalAlpha = rl;
    c.strokeStyle = RULE; c.lineWidth = 3;
    for (let y = 150; y < 1040; y += 66) { c.beginPath(); c.moveTo(120, y); c.lineTo(1810, y); c.stroke(); }
    c.strokeStyle = hex(RED, .7); c.beginPath(); c.moveTo(250, 60); c.lineTo(250, 1040); c.stroke();
    c.restore();
  }
  const hi = eOut(ss(.35, 1.1, tm));
  if (hi > 0) {
    c.save(); c.translate(960, 310); c.rotate(-.015); c.globalAlpha = hi * .85;
    c.fillStyle = HL; c.fillRect(-540, -85, 1080 * hi, 165);
    c.restore();
  }
  const ti = eOut(ss(.8, 1.5, tm));
  c.globalAlpha = ti; c.fillStyle = INK; c.textAlign = 'center';
  c.font = `700 118px ${SANS}`; c.fillText('手账笔记', 960, 355);
  c.font = `32px ${MONO}`; c.fillStyle = hex(INK, .65);
  c.fillText('BULLET NOTES · CHECKLIST · STICKY', 960, 425);
  c.textAlign = 'left'; c.globalAlpha = 1;
  for (let i = 0; i < 3; i++) {
    const e = eOut(ss(1.1 + i * .25, 1.8 + i * .25, tm)); if (e <= 0) continue;
    const y = 540 + i * 130;
    c.save(); c.globalAlpha = e;
    c.strokeStyle = INK; c.lineWidth = 5; c.strokeRect(330, y - 42, 62, 62);
    if (i < 2) {
      const k = eOut(ss(1.5 + i * .25, 2.0 + i * .25, tm));
      if (k > 0) {
        c.strokeStyle = GREEN; c.lineWidth = 11; c.lineCap = 'round'; c.lineJoin = 'round';
        c.beginPath(); c.moveTo(342, y - 10);
        c.lineTo(352 + 14 * k, y + 2 + 16 * k);
        c.lineTo(342 + 42 * k, y - 22 - 20 * k);
        c.stroke();
      }
    }
    c.fillStyle = hex(INK, .5);
    c.fillRect(450, y - 26, 520 * e, 15); c.fillRect(450, y + 6, 390 * e, 13);
    c.restore();
  }
  const sn = eOut(ss(1.8, 2.5, tm));
  if (sn > 0) {
    c.save(); c.translate(1480, 640); c.rotate(.05 + Math.sin(t * .8) * .02); c.globalAlpha = sn;
    c.fillStyle = STK; c.fillRect(-195, -175, 390, 370);
    c.fillStyle = hex(INK, .45);
    for (let i = 0; i < 4; i++) c.fillRect(-145, -115 + i * 66, 290 - (i % 2) * 100, 13);
    c.fillStyle = hex(TAPE, .9); c.fillRect(-95, -222, 190, 58);
    c.restore();
  }
  const deco = eOut(ss(2.3, 3.0, tm));
  if (deco > 0) {
    c.globalAlpha = deco; c.strokeStyle = RED; c.lineWidth = 7; c.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const x = 350 + i * 70, y = 985;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + 24, y - 30); c.lineTo(x + 48, y); c.stroke();
    }
    c.globalAlpha = 1;
  }
  c.restore();
};

// ---- K12 ----
S.K12 = (c, w, h, t, s) => {
  const BG = '#F7F2E4', INK = '#1B1B1B';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.fillStyle = INK; c.font = `700 72px ${SANS}`;
  c.globalAlpha = eOut(ss(0, .8, tm));
  c.fillText('报纸四格', 120, 118);
  c.font = `30px ${MONO}`; c.fillText('NEWSPAPER 4-KOMA · BLACK & WHITE', 520, 114);
  c.fillRect(120, 148, 1680 * clamp(tm / .8, 0, 1), 8);
  c.globalAlpha = 1;
  const PW = 800, PH = 380, GAP = 44;
  const face = (mx, my, mouth) => {
    c.fillStyle = '#FFFDF6'; c.beginPath(); c.arc(mx, my, 95, 0, TAU); c.fill();
    c.strokeStyle = INK; c.lineWidth = 8; c.stroke();
    c.fillStyle = INK;
    c.beginPath(); c.arc(mx - 34, my - 22, 10, 0, TAU); c.fill();
    c.beginPath(); c.arc(mx + 34, my - 22, 10, 0, TAU); c.fill();
    c.lineWidth = 8; c.lineCap = 'round';
    c.beginPath();
    if (mouth === 'grin') { c.arc(mx, my + 18, 42, .15 * Math.PI, .85 * Math.PI); }
    else if (mouth === 'oh') { c.ellipse(mx, my + 42, 22, 30, 0, 0, TAU); }
    else { c.moveTo(mx - 34, my + 40); c.lineTo(mx + 34, my + 40); }
    c.stroke();
  };
  const balloon = (x, y, bw, bh, txt, e) => {
    if (e <= 0) return;
    c.save(); c.globalAlpha = e;
    c.fillStyle = '#FFFDF6'; c.strokeStyle = INK; c.lineWidth = 7;
    c.beginPath(); c.roundRect(x, y, bw, bh, 36); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(x + 40, y + bh - 4); c.lineTo(x + 10, y + bh + 52); c.lineTo(x + 95, y + bh - 4);
    c.closePath(); c.fill(); c.stroke();
    c.fillStyle = INK; c.font = `600 40px ${SANS}`; c.textAlign = 'center';
    c.fillText(txt, x + bw / 2, y + bh / 2 + 14);
    c.textAlign = 'left'; c.restore();
  };
  const hatch = (x, y, n) => {
    c.strokeStyle = hex(INK, .55); c.lineWidth = 5;
    for (let i = 0; i < n; i++) {
      c.beginPath(); c.moveTo(x + i * 34, y); c.lineTo(x + i * 34 - 60, y + 60); c.stroke();
    }
  };
  const panel = (i, fn) => {
    const e = Math.min(1.05, eBack(ss(.25 + i * .35, 1.05 + i * .35, tm)));
    if (e <= 0) return;
    const x = 120 + (i % 2) * (PW + GAP), y = 215 + Math.floor(i / 2) * (PH + GAP);
    c.save(); c.translate(x + PW / 2, y + PH / 2); c.scale(e, e); c.translate(-PW / 2, -PH / 2);
    c.globalAlpha = Math.min(1, e * 1.3);
    c.fillStyle = '#FFFDF6'; c.fillRect(0, 0, PW, PH);
    c.strokeStyle = INK; c.lineWidth = 9; c.strokeRect(0, 0, PW, PH);
    c.save(); c.beginPath(); c.rect(0, 0, PW, PH); c.clip(); fn(); c.restore();
    c.restore();
  };
  panel(0, () => {
    face(240, 210, 'grin');
    balloon(360, 50, 380, 130, '今天开始减肥！', eOut(ss(1.0, 1.6, tm)));
  });
  panel(1, () => {
    hatch(20, 20, 8);
    face(230, 215, 'flat');
    balloon(350, 55, 400, 130, '可是有蛋糕…', eOut(ss(1.7, 2.3, tm)));
  });
  panel(2, () => {
    const run = Math.sin(t * 3) * 8;
    face(260 + run, 210, 'oh');
    c.fillStyle = INK;
    for (let i = 0; i < 3; i++) c.fillRect(55 - i * 12, 165 + i * 58, 120 + i * 30, 12);
    balloon(380, 45, 360, 130, '就吃一口！', eOut(ss(2.4, 3.0, tm)));
  });
  panel(3, () => {
    face(400, 215, 'grin');
    c.fillStyle = INK; c.font = `700 84px ${SANS}`; c.fillText('哈哈哈', 90, 130);
    hatch(560, 300, 10);
    const pk = eOut(ss(3.1, 3.7, tm));
    if (pk > 0) {
      c.globalAlpha = pk; c.font = `700 56px ${SANS}`; c.fillText('THE END', 420, 345);
      c.globalAlpha = 1;
    }
  });
  c.restore();
};

// ---- K13 ----
S.K13 = (c, w, h, t, s) => {
  const INK = '#101010', PAPER = '#F5F2EA', YEL = '#FFD24C';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = PAPER; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.fillStyle = hex(INK, .26);
  for (let y = 18; y < 1080; y += 36) {
    for (let x = 18; x < 1920; x += 36) {
      const d = Math.hypot(x - 1560, y - 120) / 1500;
      const r = clamp(13 - d * 11, 1.2, 13) * (1 + .12 * Math.sin(t * 2 + x * .02 + y * .03));
      c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    }
  }
  if (!s.sl) { const r = rng(31); s.sl = [...Array(26)].map(() => [(r() - .5) * 1.1, .5 + r() * .8, 10 + r() * 26]); }
  for (const [da, len, lw] of s.sl) {
    const a = Math.PI * .78 + da;
    const x1 = 1660 + Math.cos(a) * 300, y1 = 60 + Math.sin(a) * 300;
    const x2 = 1660 + Math.cos(a) * (300 + len * 1500), y2 = 60 + Math.sin(a) * (300 + len * 1500);
    const px = -Math.sin(a) * lw, py = Math.cos(a) * lw;
    c.fillStyle = INK;
    c.beginPath(); c.moveTo(x1 + px, y1 + py); c.lineTo(x2, y2); c.lineTo(x1 - px, y1 - py); c.closePath(); c.fill();
  }
  const e = eBack(ss(0, .9, tm));
  if (e > 0) {
    const sc = Math.min(1.05, e);
    c.save(); c.translate(870, 560); c.scale(sc, sc); c.rotate(Math.sin(t * .7) * .025);
    c.beginPath();
    for (let i = 0; i < 24; i++) {
      const a = i / 24 * TAU, r = (i % 2 ? 320 : 480) + Math.sin(i * 2.7) * 26;
      const x = Math.cos(a) * r, y = Math.sin(a) * r * .78;
      if (i) c.lineTo(x, y); else c.moveTo(x, y);
    }
    c.closePath();
    c.fillStyle = YEL; c.fill();
    c.lineWidth = 15; c.strokeStyle = INK; c.lineJoin = 'miter'; c.stroke();
    c.textAlign = 'center';
    c.font = `italic 900 165px ${SANS}`;
    c.lineWidth = 20; c.lineJoin = 'round'; c.strokeStyle = INK;
    c.strokeText('美漫网点', 0, 30);
    c.fillStyle = '#FFFFFF'; c.fillText('美漫网点', 0, 30);
    c.font = `italic 700 46px ${MONO}`; c.fillStyle = INK;
    c.fillText('COMIC · HALFTONE', 0, 130);
    c.restore();
    const cb = eOut(ss(1.2, 1.9, tm));
    if (cb > 0) {
      c.save(); c.translate(320, 860); c.rotate(-.06); c.globalAlpha = cb;
      c.fillStyle = YEL; c.fillRect(-10, -80, 360, 160);
      c.lineWidth = 12; c.strokeStyle = INK; c.strokeRect(-10, -80, 360, 160);
      c.fillStyle = INK; c.font = `italic 900 92px ${SANS}`; c.textAlign = 'center';
      c.fillText('BAM!', 170, 32);
      c.textAlign = 'left'; c.restore();
    }
  }
  c.restore();
};

// ---- K14 ----
S.K14 = (c, w, h, t, s) => {
  const RED = '#E4342B', YEL = '#FFC81E', BLU = '#2B5FD9', INK = '#181210', CREAM = '#FBF3E4';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = CREAM; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.fillStyle = hex(RED, .15);
  for (let y = 30; y < 1080; y += 60) for (let x = 30; x < 1920; x += 60) {
    c.beginPath(); c.arc(x + ((y / 60) % 2) * 30, y, 13, 0, TAU); c.fill();
  }
  const star = (x, y, r1, r2, n, rot) => {
    c.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = rot + i * Math.PI / n, r = i % 2 ? r2 : r1;
      c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    c.closePath();
  };
  const es = Math.min(1.05, eBack(ss(.1, 1.0, tm)));
  if (es > 0) {
    c.save(); c.translate(1380, 420); c.scale(es, es); c.rotate(Math.sin(t * .35) * .04);
    star(0, 0, 330, 205, 12, t * .05); c.fillStyle = YEL; c.fill();
    c.lineWidth = 14; c.strokeStyle = INK; c.stroke();
    c.restore();
  }
  const eb = Math.min(1.05, eBack(ss(.5, 1.4, tm)));
  if (eb > 0) {
    c.save(); c.translate(680, 450 + Math.sin(t * .9) * 12); c.scale(eb, eb);
    c.fillStyle = '#FFFFFF'; c.strokeStyle = INK; c.lineWidth = 16; c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(-420, -180); c.quadraticCurveTo(0, -250, 420, -180);
    c.quadraticCurveTo(500, 0, 420, 180); c.quadraticCurveTo(0, 250, -420, 180);
    c.quadraticCurveTo(-500, 0, -420, -180); c.closePath();
    c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-170, 185); c.lineTo(-60, 330); c.lineTo(-20, 180); c.closePath();
    c.fill(); c.stroke();
    c.fillStyle = INK; c.textAlign = 'center';
    c.font = `900 165px ${SANS}`; c.fillText('波普', 0, 45);
    c.font = `700 52px ${SANS}`; c.fillText('POP · DOTS · BALLOON', 0, 135);
    c.restore(); c.textAlign = 'left';
  }
  for (let i = 0; i < 3; i++) {
    const e = Math.min(1.05, eBack(ss(1.7 + i * .3, 2.5 + i * .3, tm)));
    if (e <= 0) continue;
    const x = 380 + i * 330, y = 880 + Math.sin(t * 1.1 + i * 2) * 10;
    c.save(); c.translate(x, y); c.scale(e, e);
    c.fillStyle = [RED, YEL, BLU][i]; c.strokeStyle = INK; c.lineWidth = 12;
    c.beginPath();
    if (i === 0) c.arc(0, 0, 92, 0, TAU);
    else if (i === 1) c.rect(-82, -82, 164, 164);
    else { c.moveTo(0, -98); c.lineTo(98, 82); c.lineTo(-98, 82); c.closePath(); }
    c.fill(); c.stroke(); c.restore();
  }
  c.restore();
};

// ---- K15 ----
S.K15 = (c, w, h, t, s) => {
  const INK = '#241A0C', PAPER = '#EADCB6', LIGHT = '#F6ECCF';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = PAPER; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  const vg = c.createRadialGradient(960, 500, 280, 960, 520, 1120);
  vg.addColorStop(0, hex('#3A2A12', 0)); vg.addColorStop(1, hex('#3A2A12', .4));
  c.fillStyle = vg; c.fillRect(0, 0, 1920, 1080);
  c.strokeStyle = INK; c.lineWidth = 5;
  c.strokeRect(40, 40, 1840, 1000); c.lineWidth = 2; c.strokeRect(58, 58, 1804, 964);
  const ec = Math.min(1.05, eOut(ss(.2, 1.1, tm)));
  if (ec > 0) {
    const bob = Math.sin(t * 1.5) * 12;
    c.save(); c.translate(880, 40 + bob); c.scale(ec, ec);
    c.strokeStyle = INK; c.lineCap = 'round'; c.lineJoin = 'round';
    for (const sgn of [-1, 1]) {
      const sw = Math.sin(t * 1.8 + (sgn > 0 ? 0 : 1.3));
      const hx = sgn * (375 + sw * 25), hy = 115 + sw * 75;
      c.lineWidth = 34;
      c.beginPath(); c.moveTo(sgn * 120, 330); c.quadraticCurveTo(sgn * (345 + sw * 45), 265 + sw * 95, hx, hy); c.stroke();
      c.fillStyle = LIGHT; c.lineWidth = 10;
      c.beginPath(); c.arc(hx, hy, 52, 0, TAU); c.fill(); c.stroke();
    }
    for (const sgn of [-1, 1]) {
      const sw = Math.sin(t * 1.6 + sgn), fx = sgn * (98 + sw * 42) + sgn * 32;
      c.lineWidth = 36;
      c.beginPath(); c.moveTo(sgn * 62, 565); c.quadraticCurveTo(sgn * (112 + sw * 22), 700, fx - sgn * 32, 815); c.stroke();
      c.fillStyle = INK;
      c.beginPath(); c.ellipse(fx, 838, 96, 42, sgn * .12, 0, TAU); c.fill();
      c.fillStyle = LIGHT;
      c.beginPath(); c.ellipse(fx, 856, 88, 15, sgn * .12, 0, TAU); c.fill();
    }
    c.fillStyle = LIGHT; c.strokeStyle = INK; c.lineWidth = 12;
    c.beginPath(); c.ellipse(0, 435, 168, 210, 0, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = INK;
    c.beginPath(); c.ellipse(0, 552, 152, 82, 0, 0, TAU); c.fill();
    c.fillStyle = LIGHT;
    c.beginPath(); c.arc(0, 152, 186, 0, TAU); c.fill(); c.stroke();
    for (const sgn of [-1, 1]) {
      c.fillStyle = INK;
      c.beginPath(); c.arc(sgn * 64, 118, 47, 0, TAU); c.fill();
      c.fillStyle = LIGHT;
      c.beginPath(); c.moveTo(sgn * 64, 118); c.arc(sgn * 64, 118, 47, sgn > 0 ? .6 : 2.54, sgn > 0 ? 2.1 : 4.1); c.closePath(); c.fill();
    }
    c.fillStyle = INK;
    c.beginPath(); c.ellipse(0, 196, 17, 13, 0, 0, TAU); c.fill();
    c.lineWidth = 11;
    c.beginPath(); c.arc(0, 190, 82, .32, Math.PI - .32); c.stroke();
    c.restore();
  }
  const en = eOut(ss(.6, 1.4, tm));
  if (en > 0) {
    c.fillStyle = hex(INK, .9 * en); c.strokeStyle = hex(INK, .9 * en); c.lineCap = 'round';
    for (const [nx, ny, ph] of [[300, 320, 0], [1620, 380, 2], [1660, 210, 4]]) {
      const fy = ny + Math.sin(t * .9 + ph) * 16;
      c.lineWidth = 12;
      c.beginPath(); c.moveTo(nx + 34, fy - 6); c.lineTo(nx + 34, fy - 92); c.stroke();
      c.beginPath(); c.ellipse(nx, fy, 30, 22, -.35, 0, TAU); c.fill();
      c.lineWidth = 10;
      c.beginPath(); c.moveTo(nx + 34, fy - 92); c.quadraticCurveTo(nx + 92, fy - 78, nx + 82, fy - 30); c.stroke();
    }
  }
  const et = eOut(ss(1.2, 2.0, tm));
  c.fillStyle = hex(INK, et); c.textAlign = 'center';
  c.font = `700 72px Georgia,"Times New Roman",serif`;
  c.fillText('橡皮管 1930', 960, 972);
  c.font = `400 30px ${SANS}`; c.fillStyle = hex(INK, .7 * et);
  c.fillText('RUBBER HOSE · PIE-CUT EYES · OLD FILM TONE', 960, 1012);
  c.textAlign = 'left';
  c.restore();
};

// ---- K16 ----
S.K16 = (c, w, h, t, s) => {
  const CREAM = '#F2E7D2', BROWN = '#3D2B1F', MUST = '#E8A33D', TEAL = '#2E7D7B', ORNG = '#D95B2E';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = CREAM; c.fillRect(0, 0, w, h);
  if (!s.tex) s.tex = paperTex(1920, 1080, 1, CREAM, 21);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.globalAlpha = .55; c.drawImage(s.tex, 0, 0, 1920, 1080); c.globalAlpha = 1;
  const es = Math.min(1.05, eBack(ss(.1, .9, tm)));
  if (es > 0) {
    c.save(); c.translate(1580, 250); c.scale(es, es); c.rotate(Math.sin(t * .3) * .05);
    c.strokeStyle = MUST; c.lineWidth = 9; c.lineCap = 'round';
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * TAU, r0 = i % 2 ? 72 : 118, r1 = i % 2 ? 158 : 232;
      c.beginPath(); c.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); c.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); c.stroke();
    }
    c.fillStyle = ORNG; c.beginPath(); c.arc(0, 0, 48, 0, TAU); c.fill();
    c.restore();
  }
  const ea = eOut(ss(.5, 1.3, tm));
  if (ea > 0) {
    c.save(); c.translate(1560, 840); c.scale(ea, ea);
    c.strokeStyle = TEAL; c.lineWidth = 90; c.lineCap = 'butt';
    c.beginPath(); c.arc(0, 0, 220, Math.PI, 0); c.stroke();
    c.restore();
  }
  const eb = Math.min(1.05, eBack(ss(.9, 1.7, tm)));
  if (eb > 0) {
    c.save(); c.translate(330, 800); c.rotate(-.25 + Math.sin(t * .35) * .03); c.scale(eb, eb);
    c.fillStyle = ORNG; c.beginPath();
    c.moveTo(-230, -60); c.quadraticCurveTo(0, -190, 230, -60);
    c.quadraticCurveTo(60, 10, 0, 150); c.quadraticCurveTo(-60, 10, -230, -60);
    c.closePath(); c.fill();
    c.restore();
  }
  const b = eOut(ss(1.2, 2.0, tm));
  if (b > 0) {
    c.globalAlpha = b; c.strokeStyle = BROWN; c.lineWidth = 12; c.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const x = 420 + i * 170 + Math.sin(t * .4 + i) * 16, y = 220 + i * 70 + Math.cos(t * .5 + i) * 12;
      c.beginPath(); c.moveTo(x - 55, y + 18); c.quadraticCurveTo(x - 22, y - 30, x, y);
      c.quadraticCurveTo(x + 22, y - 30, x + 55, y + 18); c.stroke();
    }
    c.globalAlpha = 1;
  }
  const et = eOut(ss(1.5, 2.3, tm));
  c.fillStyle = hex(BROWN, et); c.textAlign = 'center';
  c.font = `800 120px ${SANS}`; c.fillText('中世纪现代', 960, 560);
  c.fillStyle = MUST; c.fillRect(960 - 300 * et, 598, 600 * et, 12);
  c.fillStyle = hex(BROWN, et * .8); c.font = `600 42px ${SANS}`;
  c.fillText('MID-CENTURY · 1950s AD', 960, 668);
  c.textAlign = 'left';
  c.restore();
};

// ---- K17 ----
S.K17 = (c, w, h, t, s) => {
  const BG = '#F7F2E6', INK = '#1D1D1B', RED = '#E24A3B', YEL = '#F2B430', BLU = '#3B6FD4', GRN = '#3E9C63';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.lineWidth = 10; c.strokeStyle = INK; c.lineJoin = 'round';
  const pop = (x, y, a, b, draw) => {
    const e = Math.min(1.05, eBack(ss(a, b, tm)));
    if (e <= 0) return;
    c.save(); c.translate(x, y); c.scale(e, e); draw(); c.restore();
  };
  pop(1560, 230, 0, .8, () => {
    c.save(); c.rotate(t * .06);
    c.fillStyle = YEL;
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU;
      c.save(); c.translate(Math.cos(a) * 180, Math.sin(a) * 180); c.rotate(a);
      c.fillRect(-18, -18, 36, 36); c.strokeRect(-18, -18, 36, 36); c.restore();
    }
    c.beginPath(); c.arc(0, 0, 108, 0, TAU); c.fill(); c.stroke();
    c.restore();
  });
  const sway = Math.sin(t * .9) * .05;
  pop(1080, 600, .3, 1.1, () => {
    c.fillStyle = RED;
    c.beginPath(); c.moveTo(0, -200); c.lineTo(225, 185); c.lineTo(-225, 185); c.closePath();
    c.fill(); c.stroke();
    c.save(); c.rotate(sway);
    c.fillStyle = BLU; c.fillRect(-415, -155, 215, 85); c.strokeRect(-415, -155, 215, 85);
    c.restore();
    c.save(); c.rotate(-sway);
    c.fillStyle = BLU; c.fillRect(200, -155, 215, 85); c.strokeRect(200, -155, 215, 85);
    c.restore();
    c.fillStyle = GRN; c.fillRect(-150, 185, 85, 225); c.strokeRect(-150, 185, 85, 225);
    c.fillRect(65, 185, 85, 225); c.strokeRect(65, 185, 85, 225);
  });
  pop(1080, 335, .5, 1.3, () => {
    c.save(); c.rotate(sway * .6);
    c.fillStyle = YEL;
    c.beginPath(); c.arc(0, 0, 128, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = INK;
    c.fillRect(-62, -34, 38, 38); c.fillRect(24, -34, 38, 38);
    c.lineWidth = 8; c.beginPath(); c.arc(0, 18, 52, .35, Math.PI - .35); c.stroke();
    c.restore();
  });
  const eg = eOut(ss(1.2, 2.0, tm));
  if (eg > 0) {
    c.fillStyle = INK; c.fillRect(300, 1012, 1400 * eg, 18);
  }
  const et = eOut(ss(1.5, 2.3, tm));
  c.fillStyle = hex(INK, et); c.textAlign = 'left';
  c.font = `900 150px ${SANS}`; c.fillText('几何', 250, 320);
  c.font = `600 42px ${SANS}`; c.fillStyle = hex(INK, .7 * et);
  c.fillText('CIRCLE · SQUARE · TRIANGLE', 255, 392);
  c.restore();
};

// ---- K18 ----
S.K18 = (c, w, h, t, s) => {
  const PAPER = '#F6F0E4', BLUE = '#7C9CC4', ROSE = '#D98E9C', SAGE = '#9DB98C', OCHRE = '#D9B36A', INK = '#4A5468';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = PAPER; c.fillRect(0, 0, w, h);
  if (!s.tex) s.tex = paperTex(1920, 1080, 1, PAPER, 33);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.globalAlpha = .7; c.drawImage(s.tex, 0, 0, 1920, 1080); c.globalAlpha = 1;
  const blob = (x, y, r, col, a, seed) => {
    c.beginPath();
    for (let i = 0; i <= 28; i++) {
      const ang = i / 28 * TAU, rr = r * (1 + .16 * Math.sin(ang * 3 + seed) + .09 * Math.cos(ang * 5 - seed));
      c[i ? 'lineTo' : 'moveTo'](x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
    }
    c.closePath(); c.fillStyle = hex(col, a); c.fill();
  };
  const washes = [[520, 420, 330, BLUE, 2.1], [1350, 380, 300, ROSE, 5.4], [960, 720, 380, SAGE, 1.3], [1520, 760, 220, OCHRE, 3.9]];
  for (let i = 0; i < washes.length; i++) {
    const [x, y, r, col, seed] = washes[i];
    const e = eOut(ss(.15 + i * .35, 1.2 + i * .35, tm));
    if (e <= 0) continue;
    const br = 1 + .015 * Math.sin(t * .7 + i * 1.7);
    blob(x, y, r * e * br, col, .15, seed);
    blob(x - r * .1, y - r * .08, r * .72 * e * br, col, .17, seed + 2);
    blob(x + r * .12, y + r * .1, r * .42 * e * br, col, .21, seed + 4);
    blob(x + r * .05, y + r * .02, r * .2 * e * br, col, .25, seed + 6);
  }
  const ed = eOut(ss(1.6, 2.4, tm));
  if (ed > 0) {
    c.strokeStyle = hex(BLUE, .25 * ed); c.lineWidth = 14; c.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const x = 380 + i * 620, y0 = 830 + i * 30;
      c.beginPath(); c.moveTo(x, y0); c.lineTo(x + 8, y0 + 90 * ed); c.stroke();
    }
  }
  const et = eOut(ss(1.8, 2.7, tm));
  c.fillStyle = hex(INK, .9 * et); c.textAlign = 'center';
  c.font = `300 170px "Noto Serif SC","Songti SC",Georgia,serif`;
  c.fillText('水彩', 960, 560);
  c.font = `400 44px ${SANS}`; c.fillStyle = hex(INK, .55 * et);
  c.fillText('WATERCOLOR · SOFT EDGES · PAPER GRAIN', 960, 648);
  c.textAlign = 'left';
  c.restore();
};

// ---- K19 ----
S.K19 = (c, w, h, t, s) => {
  const SKY = '#2E4A7D', SKY2 = '#4E6FA8', SUN = '#E8933C', HILL = '#274A3A', CREAM = '#F2E4C8', DEEP = '#1B2C4A';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = SKY; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  if (!s.strokes) {
    const r = rng(19), st = [];
    for (let i = 0; i < 120; i++) {
      const layer = i < 46 ? 0 : i < 86 ? 1 : 2;
      const y = layer === 0 ? 80 + r() * 500 : layer === 1 ? 480 + r() * 240 : 720 + r() * 320;
      st.push({ x: -60 + r() * 2040, y, len: 130 + r() * 220, ang: layer === 2 ? (r() - .5) * .6 : (r() - .5) * .16, wd: 26 + r() * 32, layer });
    }
    s.strokes = st;
  }
  const n = Math.floor(s.strokes.length * eOut(ss(.1, 2.2, tm)));
  c.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const k = s.strokes[i], col = k.layer === 0 ? (i % 3 ? SKY2 : SKY) : k.layer === 1 ? (i % 2 ? SUN : '#C96A2E') : (i % 3 ? HILL : '#3E6B4E');
    const a = k.ang + Math.sin(t * .5 + i) * .015, dx = Math.cos(a) * k.len, dy = Math.sin(a) * k.len;
    c.strokeStyle = hex(col, .92); c.lineWidth = k.wd;
    c.beginPath(); c.moveTo(k.x - dx / 2, k.y - dy / 2);
    c.quadraticCurveTo(k.x, k.y - 12, k.x + dx / 2, k.y + dy / 2); c.stroke();
    c.strokeStyle = hex(CREAM, .16); c.lineWidth = k.wd * .32;
    c.beginPath(); c.moveTo(k.x - dx / 2 + 6, k.y - dy / 2 - k.wd * .22);
    c.quadraticCurveTo(k.x + 4, k.y - 16, k.x + dx / 2 - 6, k.y + dy / 2 - k.wd * .22); c.stroke();
  }
  const es = eOut(ss(2.0, 2.8, tm));
  if (es > 0) {
    c.fillStyle = hex(SUN, .92 * es);
    c.beginPath(); c.arc(1430, 300, 150, 0, TAU); c.fill();
    c.strokeStyle = hex(CREAM, .5 * es); c.lineWidth = 16; c.lineCap = 'round';
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * TAU + t * .05;
      c.beginPath(); c.moveTo(1430 + Math.cos(a) * 195, 300 + Math.sin(a) * 195);
      c.lineTo(1430 + Math.cos(a) * 245, 300 + Math.sin(a) * 245); c.stroke();
    }
  }
  const et = eOut(ss(2.4, 3.2, tm));
  if (et > 0) {
    c.globalAlpha = et;
    c.fillStyle = hex(DEEP, .55);
    c.beginPath();
    for (let i = 0; i <= 16; i++) c[i ? 'lineTo' : 'moveTo'](120 + i * 42, 870 + Math.sin(i * 1.7) * 12);
    for (let i = 16; i >= 0; i--) c.lineTo(120 + i * 42, 1010 + Math.sin(i * 2.1) * 12);
    c.closePath(); c.fill();
    c.fillStyle = CREAM; c.textAlign = 'left';
    c.font = `900 132px ${SANS}`; c.fillText('厚涂', 190, 972);
    c.font = `600 40px ${SANS}`; c.fillStyle = hex(CREAM, .8);
    c.fillText('IMPASTO · VISIBLE BRUSHWORK', 470, 962);
    c.globalAlpha = 1;
  }
  c.restore();
};

// ---- K20 ----
S.K20 = (c, w, h, t, s) => {
  const CREAM = '#F3E9D2', CORAL = '#E2725B', TEAL = '#3E8C85', MUST = '#E8B33C', DEEP = '#2E5E52';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = CREAM; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  const paper = (path, col, edge, e) => {
    if (e <= 0) return;
    c.save(); c.translate(0, (1 - e) * 80);
    c.shadowColor = 'rgba(70,45,20,.22)'; c.shadowBlur = 16; c.shadowOffsetY = 10;
    path(); c.fillStyle = col; c.fill();
    c.shadowColor = 'rgba(0,0,0,0)'; c.shadowBlur = 0; c.shadowOffsetY = 0;
    c.strokeStyle = edge; c.lineWidth = 3; c.stroke();
    c.restore();
  };
  const hill = (y, amp, ph) => {
    c.beginPath(); c.moveTo(-40, 1140);
    for (let x = -40; x <= 1960; x += 80) c.lineTo(x, y + Math.sin(x / 260 + ph) * amp);
    c.lineTo(1960, 1140); c.closePath();
  };
  paper(() => hill(740, 58, .4), MUST, '#C7952C', eOut(ss(0, .8, tm)));
  paper(() => hill(850, 44, 2.1), CORAL, '#B8523D', eOut(ss(.25, 1.05, tm)));
  paper(() => hill(945, 32, 4.2), TEAL, '#2E6B62', eOut(ss(.5, 1.3, tm)));
  paper(() => hill(1035, 20, 5.6), DEEP, '#20463C', eOut(ss(.75, 1.55, tm)));
  const es = Math.min(1.05, eBack(ss(.4, 1.2, tm)));
  if (es > 0) {
    c.save(); c.translate(1500, 270); c.scale(es, es); c.rotate(Math.sin(t * .3) * .04);
    c.shadowColor = 'rgba(70,45,20,.25)'; c.shadowBlur = 14; c.shadowOffsetY = 8;
    c.fillStyle = MUST;
    for (let i = 0; i < 12; i++) { c.save(); c.rotate(i / 12 * TAU); c.fillRect(96, -15, 88, 30); c.restore(); }
    c.beginPath(); c.arc(0, 0, 118, 0, TAU); c.fill();
    c.shadowColor = 'rgba(0,0,0,0)'; c.shadowBlur = 0; c.shadowOffsetY = 0;
    c.strokeStyle = '#C7952C'; c.lineWidth = 3; c.stroke();
    c.restore();
  }
  const et = Math.min(1.05, eBack(ss(1.1, 1.9, tm)));
  if (et > 0) {
    c.save(); c.translate(960, 330); c.scale(et, et); c.rotate(-.03 + Math.sin(t * .4) * .012);
    c.shadowColor = 'rgba(70,45,20,.28)'; c.shadowBlur = 18; c.shadowOffsetY = 12;
    c.fillStyle = '#F7EED6';
    c.beginPath(); c.moveTo(-470, -135); c.lineTo(470, -125); c.lineTo(480, 135); c.lineTo(-480, 125); c.closePath(); c.fill();
    c.shadowColor = 'rgba(0,0,0,0)'; c.shadowBlur = 0; c.shadowOffsetY = 0;
    c.strokeStyle = '#D9C9A0'; c.lineWidth = 3; c.stroke();
    c.fillStyle = '#3B2B1B'; c.textAlign = 'center';
    c.font = `900 120px ${SANS}`; c.fillText('剪纸', 0, 34);
    c.font = `600 38px ${SANS}`; c.fillStyle = '#8A6B47';
    c.fillText('PAPER CUT · LAYERS · SOFT SHADOWS', 0, 112);
    c.restore(); c.textAlign = 'left';
  }
  c.restore();
};

// ---- K21 ----
S.K21 = (c, w, h, t, s) => {
  const KRAFT = '#C9A876', CREAM = '#F4EAD6', TERRA = '#C96F4A', SAGE = '#8FA57C', DENIM = '#5B7A9E', INK = '#4A3524';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = KRAFT; c.fillRect(0, 0, w, h);
  if (!s.tex) s.tex = paperTex(1920, 1080, 1, KRAFT, 44);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.globalAlpha = .6; c.drawImage(s.tex, 0, 0, 1920, 1080); c.globalAlpha = 1;
  const tornRect = (x, y, wd, ht, seed) => {
    const key = 'tr' + seed;
    if (!s[key]) {
      const r = rng(seed), pts = [];
      for (let i = 0; i <= 20; i++) pts.push([wd * i / 20, (r() - .5) * 18]);
      for (let i = 1; i <= 12; i++) pts.push([wd + (r() - .5) * 18, ht * i / 12]);
      for (let i = 19; i >= 0; i--) pts.push([wd * i / 20, ht + (r() - .5) * 18]);
      for (let i = 11; i >= 1; i--) pts.push([(r() - .5) * 18, ht * i / 12]);
      s[key] = pts;
    }
    c.beginPath();
    s[key].forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](x + p[0], y + p[1]));
    c.closePath();
  };
  const ec = eOut(ss(0, .8, tm));
  if (ec > 0) {
    c.save(); c.translate(520, 300 + (1 - ec) * 50);
    tornRect(0, 0, 880, 420, 3);
    c.fillStyle = CREAM; c.fill();
    c.setLineDash([20, 15]); c.lineWidth = 7; c.strokeStyle = TERRA; c.stroke(); c.setLineDash([]);
    c.fillStyle = INK; c.textAlign = 'left';
    c.font = `800 112px ${SANS}`; c.fillText('手工纸艺', 90, 215);
    c.font = `600 38px ${SANS}`; c.fillStyle = hex(INK, .7);
    c.fillText('HANDMADE PAPER · STITCHES · FELT', 95, 305);
    c.restore();
  }
  const ef = Math.min(1.05, eBack(ss(.5, 1.3, tm)));
  if (ef > 0) {
    c.save(); c.translate(1600, 320 + Math.sin(t * .7) * 10); c.scale(ef, ef); c.rotate(Math.sin(t * .4) * .05);
    c.fillStyle = TERRA;
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * TAU;
      c.beginPath(); c.ellipse(Math.cos(a) * 115, Math.sin(a) * 115, 78, 52, a, 0, TAU); c.fill();
    }
    c.fillStyle = '#E8C15C';
    c.beginPath(); c.arc(0, 0, 62, 0, TAU); c.fill();
    c.setLineDash([12, 10]); c.strokeStyle = hex(INK, .5); c.lineWidth = 5;
    c.beginPath(); c.arc(0, 0, 62, 0, TAU); c.stroke(); c.setLineDash([]);
    c.restore();
  }
  const eb = Math.min(1.05, eBack(ss(.9, 1.7, tm)));
  if (eb > 0) {
    c.save(); c.translate(330, 800); c.scale(eb, eb); c.rotate(Math.sin(t * .5) * .08);
    c.fillStyle = SAGE;
    c.beginPath(); c.arc(0, 0, 110, 0, TAU); c.fill();
    c.strokeStyle = '#5F744E'; c.lineWidth = 6; c.stroke();
    for (const [hx, hy] of [[-32, -32], [32, -32], [-32, 32], [32, 32]]) {
      c.fillStyle = CREAM;
      c.beginPath(); c.arc(hx, hy, 15, 0, TAU); c.fill();
    }
    c.strokeStyle = TERRA; c.lineWidth = 12; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-32, -32); c.lineTo(32, 32); c.moveTo(32, -32); c.lineTo(-32, 32); c.stroke();
    c.restore();
  }
  const ey = eOut(ss(1.2, 2.0, tm));
  if (ey > 0) {
    c.strokeStyle = DENIM; c.lineWidth = 26; c.lineCap = 'round';
    c.beginPath(); c.moveTo(620, 860);
    c.bezierCurveTo(780, 760 + Math.sin(t * .8) * 18, 980, 960 - Math.sin(t * .8) * 18, 1180, 850);
    c.bezierCurveTo(1330, 780, 1420, 900, 1560, 840);
    c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 8; c.stroke();
  }
  const es = eOut(ss(1.5, 2.3, tm));
  if (es > 0) {
    c.save(); c.translate(1520, 560); c.rotate(.12);
    tornRect(0, 0, 320, 220, 9);
    c.fillStyle = '#B98BC9'; c.fill();
    c.strokeStyle = 'rgba(80,50,20,.25)'; c.lineWidth = 4; c.stroke();
    c.restore();
  }
  c.restore();
};

// ---- K22 ----
S.K22 = (c, w, h, t, s) => {
  const BG = '#F0E6D2', L1 = '#F6EAD0', L2 = '#E2CDA6', L3 = '#C9AE82', L4 = '#A98A5E';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  const facet = (pts, col) => {
    c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](p[0], p[1])); c.closePath();
    c.fillStyle = col; c.fill();
    c.strokeStyle = 'rgba(120,90,50,.22)'; c.lineWidth = 2; c.stroke();
  };
  const grp = (a, b, x, y, draw) => {
    const e = Math.min(1.05, eOut(ss(a, b, tm)));
    if (e <= 0) return;
    c.save(); c.translate(x, y); c.scale(e, e); draw(); c.restore();
  };
  grp(0, .8, 520, 720, () => {
    facet([[-320, 140], [0, -380], [0, 140]], L2);
    facet([[0, -380], [340, 140], [0, 140]], L4);
    facet([[-260, 140], [-70, -160], [-70, 140]], L1);
    facet([[-70, -160], [130, 140], [-70, 140]], L3);
  });
  grp(.3, 1.1, 330, 260, () => {
    for (let i = 0; i < 10; i++) {
      const a0 = i / 10 * TAU + t * .05, a1 = (i + 1) / 10 * TAU + t * .05;
      facet([[0, 0], [Math.cos(a0) * 150, Math.sin(a0) * 150], [Math.cos(a1) * 150, Math.sin(a1) * 150]], i % 2 ? L1 : L2);
    }
  });
  grp(.6, 1.4, 1400, 520 + Math.sin(t * .8) * 12, () => {
    facet([[-130, 40], [80, -20], [-20, 130]], L2);
    facet([[-10, -10], [150, -190], [60, 0]], L1);
    facet([[-40, 0], [-190, 110], [-30, 50]], L3);
    facet([[80, -20], [180, -110], [195, -85], [95, 5]], L2);
    facet([[180, -110], [245, -95], [178, -70]], L4);
    facet([[-130, 40], [-250, 80], [-120, 75]], L3);
  });
  const et = eOut(ss(1.2, 2.0, tm));
  c.fillStyle = hex('#5A4326', et); c.textAlign = 'center';
  c.font = `300 150px "Noto Serif SC","Songti SC",Georgia,serif`;
  c.fillText('折纸', 960, 985);
  c.font = `400 38px ${SANS}`; c.fillStyle = hex('#5A4326', et * .7);
  c.fillText('ORIGAMI · FOLDED FACETS', 960, 1040);
  c.textAlign = 'left';
  c.restore();
};

// ---- K23 ----
S.K23 = (c, w, h, t, s) => {
  const BG = '#EDE6D6', INK = '#2B2B2B', RED = '#D9483B', YEL = '#E8B33C', BLU = '#3B6FD4';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  if (!s.tex) s.tex = paperTex(1920, 1080, 1, BG, 55);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.globalAlpha = .55; c.drawImage(s.tex, 0, 0, 1920, 1080); c.globalAlpha = 1;
  const e1 = eOut(ss(0, .8, tm));
  if (e1 > 0) {
    c.save(); c.translate(140, 120); c.rotate(-.05); c.globalAlpha = e1;
    c.fillStyle = '#FBF7EE';
    c.beginPath();
    for (let i = 0; i <= 34; i++) c[i ? 'lineTo' : 'moveTo'](i * 21, Math.sin(i * 2.7) * 7);
    for (let i = 34; i >= 0; i--) c.lineTo(i * 21, 195 + Math.sin(i * 3.1) * 7);
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(70,70,70,.32)';
    for (let r = 0; r < 6; r++) for (let seg = 0; seg < 3; seg++) {
      c.fillRect(36 + seg * 225 + (r % 2) * 26, 30 + r * 26, 150 + ((r * 7 + seg * 13) % 46), 7);
    }
    c.restore(); c.globalAlpha = 1;
  }
  const e2 = Math.min(1.05, eBack(ss(.4, 1.2, tm)));
  if (e2 > 0) {
    c.save(); c.translate(1370, 400); c.rotate(.07 + Math.sin(t * .25) * .008); c.scale(e2, e2);
    c.shadowColor = 'rgba(0,0,0,.28)'; c.shadowBlur = 20; c.shadowOffsetY = 12;
    c.fillStyle = '#FFFFFF'; c.fillRect(-300, -250, 600, 500);
    c.shadowColor = 'rgba(0,0,0,0)'; c.shadowBlur = 0; c.shadowOffsetY = 0;
    c.save(); c.beginPath(); c.rect(-252, -205, 504, 350); c.clip();
    c.fillStyle = '#9CC0DE'; c.fillRect(-252, -205, 504, 175);
    c.fillStyle = '#D9E6EE'; c.fillRect(-252, -30, 504, 175);
    c.fillStyle = '#F2C14E';
    c.beginPath(); c.arc(120, -110, 52, 0, TAU); c.fill();
    c.fillStyle = '#4E7CA8';
    c.beginPath(); c.moveTo(-252, 60); c.lineTo(-60, -80); c.lineTo(110, 60); c.closePath(); c.fill();
    c.fillStyle = '#33587E';
    c.beginPath(); c.moveTo(30, 75); c.lineTo(200, -55); c.lineTo(300, 75); c.closePath(); c.fill();
    c.restore();
    c.fillStyle = 'rgba(60,60,60,.5)';
    c.fillRect(-252, 172, 300, 12); c.fillRect(-252, 198, 200, 12);
    c.restore();
  }
  const e3 = eOut(ss(.9, 1.7, tm));
  if (e3 > 0) {
    c.globalAlpha = .62 * e3;
    for (const [tx, ty, rot] of [[1180, 220, -.5], [1560, 610, -.55]]) {
      c.save(); c.translate(tx, ty); c.rotate(rot);
      c.fillStyle = YEL; c.fillRect(-150, -46, 300, 92);
      c.fillStyle = 'rgba(255,255,255,.5)';
      for (let i = -2; i <= 2; i++) c.fillRect(-150, i * 22 - 5, 300, 8);
      c.restore();
    }
    c.globalAlpha = 1;
  }
  const e4 = Math.min(1.05, eBack(ss(1.2, 2.0, tm)));
  if (e4 > 0) {
    c.save(); c.translate(230, 620); c.rotate(.1); c.scale(e4, e4);
    c.fillStyle = '#EAF0FA'; c.fillRect(0, 0, 420, 260);
    c.fillStyle = BLU;
    for (let y = 0; y < 6; y++) for (let x = 0; x < 9; x++) {
      c.beginPath(); c.arc(34 + x * 44, 34 + y * 42, 12 + ((x + y) % 3) * 3, 0, TAU); c.fill();
    }
    c.strokeStyle = 'rgba(40,40,40,.3)'; c.lineWidth = 3; c.strokeRect(0, 0, 420, 260);
    c.restore();
  }
  for (let i = 0; i < 2; i++) {
    const e = Math.min(1.05, eBack(ss(1.6 + i * .3, 2.3 + i * .3, tm)));
    if (e <= 0) continue;
    c.save(); c.translate(730 + i * 300, 850 + Math.sin(t * .6 + i) * 8);
    c.rotate((i ? .06 : -.07) + Math.sin(t * .5 + i * 2) * .02); c.scale(e, e);
    c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 14; c.shadowOffsetY = 8;
    c.fillStyle = [RED, BLU][i]; c.fillRect(-130, -165, 260, 320);
    c.shadowColor = 'rgba(0,0,0,0)'; c.shadowBlur = 0; c.shadowOffsetY = 0;
    c.fillStyle = i ? '#FFFFFF' : '#FFF8E8'; c.textAlign = 'center';
    c.font = `900 190px ${SANS}`; c.fillText(['拼', '贴'][i], 0, 70);
    c.restore(); c.textAlign = 'left';
  }
  c.restore();
};

// ---- K24 ----
S.K24 = (c, w, h, t, s) => {
  const BG = '#F2E3C9', CLAY2 = '#B96A42', CREAM = '#F7EEDB', INK = '#4A2B1B';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  const ep = eOut(ss(0, .8, tm));
  if (ep > 0) {
    c.save(); c.translate(880, 400 + Math.sin(t * .6) * 8); c.scale(ep, ep);
    c.fillStyle = 'rgba(110,60,25,.18)';
    c.beginPath(); c.ellipse(0, 185, 640, 62, 0, 0, TAU); c.fill();
    const g = c.createLinearGradient(-520, -220, 520, 260);
    g.addColorStop(0, '#E8A97C'); g.addColorStop(1, CLAY2);
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(-470, -190); c.arcTo(570, -190, 570, 190, 95); c.arcTo(570, 190, -570, 190, 95);
    c.arcTo(-570, 190, -570, -190, 95); c.arcTo(-570, -190, 570, -190, 95); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(120,60,25,.14)'; c.lineWidth = 10;
    for (let i = 0; i < 5; i++) {
      c.beginPath(); c.ellipse(-320 + i * 46, -50 + i * 34, 150 - i * 20, 92 - i * 13, .6, 0, TAU); c.stroke();
    }
    c.fillStyle = 'rgba(255,242,222,.4)';
    c.beginPath(); c.ellipse(-150, -130, 330, 52, -.22, 0, TAU); c.fill();
    c.textAlign = 'center';
    c.fillStyle = 'rgba(90,45,18,.4)';
    c.font = `900 158px ${SANS}`; c.fillText('粘土', 4, 58);
    c.fillStyle = CREAM; c.fillText('粘土', 0, 52);
    c.font = `700 40px ${SANS}`; c.fillStyle = 'rgba(255,240,220,.85)';
    c.fillText('CLAY · FINGERPRINTS · ROUND SHAPES', 0, 132);
    c.restore(); c.textAlign = 'left';
  }
  const eb = Math.min(1.05, eBack(ss(.5, 1.4, tm)));
  if (eb > 0) {
    const br = 1 + .015 * Math.sin(t * 1.1);
    c.save(); c.translate(1520, 780 + Math.sin(t * .9) * 10); c.scale(eb * br, eb * br);
    c.fillStyle = 'rgba(110,60,25,.2)';
    c.beginPath(); c.ellipse(0, 205, 240, 48, 0, 0, TAU); c.fill();
    const bg2 = c.createRadialGradient(-90, -110, 30, 0, 0, 300);
    bg2.addColorStop(0, '#A8CDC2'); bg2.addColorStop(1, '#5B8C82');
    c.fillStyle = bg2;
    c.beginPath(); c.arc(0, 0, 195, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 12;
    for (let i = 0; i < 4; i++) {
      c.beginPath(); c.ellipse(-60 + i * 22, 90 + i * 16, 120 - i * 18, 78 - i * 12, .5, 0, TAU); c.stroke();
    }
    const bl = 1 - .85 * (ss(2.5, 2.62, tm) - ss(2.68, 2.8, tm));
    for (const sgn of [-1, 1]) {
      c.fillStyle = '#FFFFFF';
      c.beginPath(); c.ellipse(sgn * 72, -52, 52, 58 * bl, 0, 0, TAU); c.fill();
      c.fillStyle = INK;
      c.beginPath(); c.ellipse(sgn * 66, -46, 22, 26 * bl, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.9)';
      c.beginPath(); c.arc(sgn * 58, -62, 9, 0, TAU); c.fill();
    }
    c.strokeStyle = INK; c.lineWidth = 12; c.lineCap = 'round';
    c.beginPath(); c.arc(0, 30, 58, .3, Math.PI - .3); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.3)';
    c.beginPath(); c.ellipse(-80, -110, 90, 34, -.5, 0, TAU); c.fill();
    c.restore();
  }
  c.restore();
};

// ---- K25 ----
S.K25 = (c, w, h, t, s) => {
  const BG = '#F6D9A8', BODY = '#E8834A', BODY2 = '#B9522A', INK = '#4A2412';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  const bg = c.createRadialGradient(820, 480, 120, 820, 480, 1050);
  bg.addColorStop(0, hex('#FFE9C4', .95)); bg.addColorStop(1, hex('#E8A868', .3));
  c.fillStyle = bg; c.fillRect(0, 0, 1920, 1080);
  const eb = Math.min(1.05, eBack(ss(.1, 1.0, tm)));
  if (eb > 0) {
    const bob = Math.sin(t * .8) * 10, br = 1 + .012 * Math.sin(t * 1.6);
    c.save(); c.translate(830, 590 + bob); c.scale(eb * br, eb * br);
    c.fillStyle = 'rgba(120,60,20,.22)';
    c.beginPath(); c.ellipse(0, 335, 330, 58, 0, 0, TAU); c.fill();
    for (const sgn of [-1, 1]) {
      const sw = Math.sin(t * 1.2 + (sgn > 0 ? 0 : 1)) * .12;
      c.save(); c.translate(sgn * 232, 110); c.rotate(sgn * (.55 + sw));
      const ag = c.createLinearGradient(0, -40, 0, 170);
      ag.addColorStop(0, '#EE9A62'); ag.addColorStop(1, BODY2);
      c.fillStyle = ag;
      c.beginPath(); c.ellipse(0, 68, 54, 112, 0, 0, TAU); c.fill();
      c.restore();
    }
    const g = c.createRadialGradient(-150, 90, 40, 0, 140, 460);
    g.addColorStop(0, '#F2A268'); g.addColorStop(1, BODY2);
    c.fillStyle = g;
    c.beginPath(); c.ellipse(0, 165, 258, 238, 0, 0, TAU); c.fill();
    const hg = c.createRadialGradient(-110, -190, 50, 0, -110, 380);
    hg.addColorStop(0, '#F8B87F'); hg.addColorStop(1, BODY);
    c.fillStyle = hg;
    c.beginPath(); c.arc(0, -115, 262, 0, TAU); c.fill();
    const bl = 1 - .92 * (ss(2.4, 2.52, tm) - ss(2.6, 2.72, tm));
    for (const sgn of [-1, 1]) {
      c.fillStyle = '#FFFFFF';
      c.beginPath(); c.ellipse(sgn * 102, -150, 80, 90 * bl, 0, 0, TAU); c.fill();
      c.fillStyle = '#5A2E12';
      c.beginPath(); c.ellipse(sgn * 98, -142, 42, 48 * bl, 0, 0, TAU); c.fill();
      c.fillStyle = '#241006';
      c.beginPath(); c.ellipse(sgn * 96, -138, 20, 25 * bl, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.96)';
      c.beginPath(); c.ellipse(sgn * 80, -176, 17, 21 * bl, -.4, 0, TAU); c.fill();
      c.beginPath(); c.ellipse(sgn * 114, -110, 8, 10 * bl, 0, 0, TAU); c.fill();
    }
    c.fillStyle = 'rgba(226,110,90,.4)';
    c.beginPath(); c.ellipse(-152, -58, 52, 30, 0, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(152, -58, 52, 30, 0, 0, TAU); c.fill();
    c.strokeStyle = '#6B3418'; c.lineWidth = 14; c.lineCap = 'round';
    c.beginPath(); c.arc(0, -42, 62, .35, Math.PI - .35); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.35)';
    c.beginPath(); c.ellipse(-120, -235, 120, 42, -.45, 0, TAU); c.fill();
    c.restore();
  }
  const et = eOut(ss(1.4, 2.2, tm));
  c.fillStyle = hex(INK, et); c.textAlign = 'center';
  c.font = `800 96px ${SANS}`;
  c.fillText('皮克斯式 3D', 1500, 902);
  c.font = `600 36px ${SANS}`; c.fillStyle = hex(INK, .7 * et);
  c.fillText('BIG EYES · ROUND · NICE MATERIALS', 1500, 962);
  c.textAlign = 'left';
  c.restore();
};

// ---- K26 ----
S.K26 = (c, w, h, t, s) => {
  const BG = '#EAF2F7', GREEN = '#5FA83C', GL = '#8FD14F', GD = '#3B7A28', INK = '#141414';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.fillStyle = '#D8E6F0'; c.fillRect(0, 872, 1920, 208);
  c.strokeStyle = hex(INK, .5); c.lineWidth = 4;
  c.beginPath(); c.moveTo(0, 872); c.lineTo(1920, 872); c.stroke();
  const e1 = eOut(ss(.1, .9, tm));
  if (e1 > 0) {
    const bob = Math.sin(t * .9) * 14;
    c.fillStyle = 'rgba(30,50,80,.22)';
    c.beginPath(); c.ellipse(720, 852, 300 - bob, 50, 0, 0, TAU); c.fill();
    c.save(); c.translate(720, 520 + bob); c.scale(e1, e1);
    c.fillStyle = GREEN;
    c.beginPath(); c.arc(0, 0, 240, 0, TAU); c.fill();
    c.save(); c.beginPath(); c.arc(0, 0, 240, 0, TAU); c.clip();
    c.fillStyle = GD;
    c.beginPath(); c.arc(150 + Math.sin(t * .5) * 20, 120, 238, 0, TAU); c.fill();
    c.fillStyle = GL;
    c.beginPath(); c.arc(-115, -115, 152, 0, TAU); c.fill();
    c.fillStyle = '#FFFFFF';
    c.beginPath(); c.arc(-140 + Math.sin(t * .5) * 8, -140, 50, 0, TAU); c.fill();
    c.restore();
    c.strokeStyle = INK; c.lineWidth = 13;
    c.beginPath(); c.arc(0, 0, 240, 0, TAU); c.stroke();
    c.restore();
  }
  const e2 = eOut(ss(.4, 1.2, tm));
  if (e2 > 0) {
    const bob = Math.sin(t * .9 + 2.4) * 12;
    c.fillStyle = 'rgba(30,50,80,.22)';
    c.beginPath(); c.ellipse(1400, 922, 320 - bob, 48, 0, 0, TAU); c.fill();
    c.save(); c.translate(1400, 640 + bob); c.scale(e2, e2);
    const faces = [
      [[[0, -220], [240, -120], [0, -20], [-240, -120]], '#7FB6E8'],
      [[[-240, -120], [0, -20], [0, 260], [-240, 160]], '#4E86C4'],
      [[[0, -20], [240, -120], [240, 160], [0, 260]], '#2E5E96']
    ];
    for (const [pts, col] of faces) {
      c.beginPath(); pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](p[0], p[1])); c.closePath();
      c.fillStyle = col; c.fill();
      c.strokeStyle = INK; c.lineWidth = 13; c.lineJoin = 'round'; c.stroke();
    }
    c.restore();
  }
  const et = eOut(ss(.9, 1.7, tm));
  if (et > 0) {
    c.globalAlpha = et;
    c.textAlign = 'center';
    c.font = `900 118px ${SANS}`;
    c.lineWidth = 16; c.lineJoin = 'round'; c.strokeStyle = INK;
    c.strokeText('卡通渲染 3D', 960, 190);
    c.fillStyle = '#FFD84D'; c.fillText('卡通渲染 3D', 960, 190);
    c.font = `700 38px ${SANS}`; c.lineWidth = 8;
    c.strokeText('CEL SHADING · HARD EDGES · BLACK OUTLINES', 960, 252);
    c.fillStyle = '#FFFFFF'; c.fillText('CEL SHADING · HARD EDGES · BLACK OUTLINES', 960, 252);
    c.globalAlpha = 1;
    c.textAlign = 'left';
  }
  c.restore();
};

// ---- K27 ----
S.K27 = (c, w, h, t, s) => {
  const ICE = '#9BE8F2', TEAL = '#3FC1C9';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = '#0D1B2E'; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.fillStyle = vgrad(c, 1080, '#17304F', '#0D1B2E'); c.fillRect(0, 0, 1920, 1080);
  if (!s.mt) { const r = rng(11); s.mt = []; for (let i = 0; i < 8; i++) s.mt.push([i * 260 - 60, 130 + r() * 190, .3 + r() * .55]); }
  const eM = eOut(ss(.1, 1.1, tm));
  for (const [mx, mh, sh] of s.mt) {
    const top = 960 - mh * eM;
    c.fillStyle = mixHex('#12263F', '#2E5B8A', sh);
    c.beginPath(); c.moveTo(mx - 30, 960); c.lineTo(mx + 120, top); c.lineTo(mx + 290, 960); c.closePath(); c.fill();
    c.fillStyle = mixHex('#1B3B62', TEAL, sh * .75);
    c.beginPath(); c.moveTo(mx + 120, top); c.lineTo(mx + 290, 960); c.lineTo(mx + 150, 960); c.closePath(); c.fill();
  }
  const cx = 960, cy = 430 + Math.sin(t * .8) * 14, R = 195;
  const eG = Math.min(1.05, eBack(ss(.4, 1.7, tm)));
  if (eG > 0) {
    c.save(); c.translate(cx, cy); c.scale(eG, eG); c.translate(-cx, -cy);
    const rot = t * .32, N = 6;
    const pt = i => { const a = i / N * TAU + rot; return [cx + R * Math.cos(a), cy + R * .34 * Math.sin(a)]; };
    for (let i = 0; i < N; i++) {
      const a = pt(i), b = pt(i + 1), am = (i + .5) / N * TAU + rot;
      const lum = .28 + .72 * Math.max(0, Math.cos(am - 2.3));
      c.fillStyle = mixHex('#14324F', ICE, lum);
      c.beginPath(); c.moveTo(cx, cy - 240); c.lineTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.closePath(); c.fill();
      c.fillStyle = mixHex('#0E2438', TEAL, lum * .8);
      c.beginPath(); c.moveTo(cx, cy + 255); c.lineTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.closePath(); c.fill();
      c.strokeStyle = hex(ICE, .45); c.lineWidth = 3;
      c.beginPath(); c.moveTo(cx, cy - 240); c.lineTo(a[0], a[1]); c.lineTo(cx, cy + 255); c.stroke();
    }
    c.restore();
  }
  const eT = eOut(ss(1.9, 2.7, tm));
  c.textAlign = 'center';
  c.fillStyle = hex(ICE, eT); c.font = `700 132px ${SANS}`;
  c.fillText('低多边形', 960, 215);
  c.fillStyle = hex(TEAL, eT * .9); c.font = `38px ${MONO}`;
  c.fillText('LOW POLY · FACETED 3D', 960, 290);
  c.textAlign = 'left';
  c.restore();
};

// ---- K28 ----
S.K28 = (c, w, h, t, s) => {
  const SKY = '#5B8FD9', SUN = '#FFD75E', CLOUD = '#F2F0E6', HILL = '#3F8F4A', DARK = '#17223B', RED = '#E8524A';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6, G = 12;
  c.fillStyle = SKY; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.fillRect(0, 0, 1920, 1080);
  const px = (x, y, gw, gh, col) => { c.fillStyle = col; c.fillRect(Math.round(x / G) * G, Math.round(y / G) * G, gw * G, gh * G); };
  const eS = eOut(ss(0, .9, tm));
  for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++)
    if ((i - 2.5) * (i - 2.5) + (j - 2.5) * (j - 2.5) < 8) px(300 + i * G, 150 + j * G + Math.round((1 - eS) * 10) * G, 1, 1, SUN);
  const cstep = Math.floor(tm * 3);
  for (let k = 0; k < 2; k++) {
    const cx = ((k * 900 + cstep * 24) % 2200) - 200, cy = 540 + k * 130;
    px(cx, cy, 8, 2, CLOUD); px(cx + 2 * G, cy - G, 5, 1, CLOUD); px(cx + 2 * G, cy + 2 * G, 6, 1, CLOUD);
  }
  const eH = eOut(ss(.3, 1.3, tm));
  for (let i = 0; i < 22; i++) {
    const hh = Math.round((1 + Math.abs(Math.sin(i * 1.7)) * 5) * eH);
    px(i * 8 * G, 840 - hh * G, 8, hh, HILL);
  }
  px(0, 840, 160, 20, HILL); px(0, 1020, 160, 5, DARK);
  px(312, 720, 2, 10, DARK); px(276, 636, 9, 7, HILL); px(312, 600, 5, 3, HILL);
  const INV = ['..X.....X..', '...X...X...', '..XXXXXXX..', '.XX.XXX.XX.', 'XXXXXXXXXXX', 'X.XXXXXXX.X', 'X.X.....X.X', '...XX.XX...'];
  const INV2 = ['..X.....X..', '...X...X...', '..XXXXXXX..', '.XX.XXX.XX.', 'XXXXXXXXXXX', 'X.XXXXXXX.X', 'X.X.....X.X', '..X.....X..'];
  const eI = eOut(ss(1.2, 2.0, tm));
  if (eI > 0) {
    const frame = Math.floor(tm * 3) % 2 ? INV2 : INV;
    const ix = 1332, iy = 612 + Math.round((1 - eI) * 16) * G + (Math.floor(tm * 3) % 2) * G;
    for (let r0 = 0; r0 < frame.length; r0++) for (let q = 0; q < frame[r0].length; q++)
      if (frame[r0][q] === 'X') px(ix + q * G, iy + r0 * G, 1, 1, DARK);
  }
  const eT = eOut(ss(2.2, 3.0, tm));
  c.textAlign = 'center'; c.globalAlpha = eT;
  c.fillStyle = DARK; c.font = `bold 130px ${MONO}`; c.fillText('像素', 960, 330);
  c.fillStyle = RED; c.font = `bold 46px ${MONO}`; c.fillText('PIXEL ART', 960, 410);
  c.globalAlpha = 1; c.textAlign = 'left';
  c.restore();
};

// ---- K29 ----
S.K29 = (c, w, h, t, s) => {
  const BLUE = '#0E2F5B', LINE = '#DCEBFF';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = BLUE; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.fillStyle = vgrad(c, 1080, '#123A6E', '#0B2648'); c.fillRect(0, 0, 1920, 1080);
  c.lineWidth = 1;
  for (let i = 0; i <= 32; i++) {
    c.strokeStyle = hex(LINE, i % 4 ? .07 : .16);
    c.beginPath(); c.moveTo(i * 60, 0); c.lineTo(i * 60, 1080); c.stroke();
    c.beginPath(); c.moveTo(0, i * 60); c.lineTo(1920, i * 60); c.stroke();
  }
  c.strokeStyle = hex(LINE, .8); c.lineWidth = 4; c.strokeRect(46, 46, 1828, 988);
  c.lineWidth = 2; c.strokeRect(66, 66, 1788, 948);
  c.strokeRect(1330, 850, 500, 140);
  c.font = `26px ${MONO}`; c.fillStyle = hex(LINE, .85);
  c.fillText('DRAWING NO. K29-ISO-01', 1356, 898);
  c.fillText('SCALE 1:20 · SHEET 1/1', 1356, 942);
  const iso = (x, y, z) => [960 + (x - y) * 45, 560 + (x + y) * 26 - z * 44];
  const box = (x, y, z, dx, dy, dz) => {
    const P = (a, b, cc) => iso(x + a, y + b, z + cc);
    const face = (pts, al) => {
      c.fillStyle = hex(LINE, al); c.beginPath();
      pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
      c.closePath(); c.fill(); c.stroke();
    };
    face([P(0, 0, dz), P(dx, 0, dz), P(dx, dy, dz), P(0, dy, dz)], .10);
    face([P(0, dy, dz), P(dx, dy, dz), P(dx, dy, 0), P(0, dy, 0)], .05);
    face([P(dx, 0, dz), P(dx, dy, dz), P(dx, dy, 0), P(dx, 0, 0)], .07);
  };
  const e1 = eOut(ss(.2, 1.2, tm)), e2 = eOut(ss(.7, 1.7, tm)), e3 = eOut(ss(1.2, 2.2, tm));
  c.strokeStyle = hex(LINE, .9); c.lineWidth = 3;
  if (e1 > 0) box(-2, -2, 0, 4, 4, 1.2 * e1);
  if (e2 > 0) box(-1.3, -1.3, 1.2, 2.6, 2.6, 1.1 * e2);
  if (e3 > 0) box(-.5, -.5, 2.3, 1, 1, 1.2 * e3);
  const eD = eOut(ss(2.0, 2.9, tm));
  if (eD > 0) {
    c.globalAlpha = eD;
    c.lineWidth = 2; c.strokeStyle = hex(LINE, .8);
    c.beginPath(); c.moveTo(560, 930); c.lineTo(1360, 930);
    c.moveTo(560, 915); c.lineTo(560, 945); c.moveTo(1360, 915); c.lineTo(1360, 945); c.stroke();
    c.setLineDash([12, 10]); c.lineDashOffset = -t * 30;
    c.beginPath(); c.moveTo(760, 760); c.lineTo(760, 930); c.moveTo(1260, 700); c.lineTo(1260, 930); c.stroke();
    c.setLineDash([]);
    c.fillStyle = hex(LINE, .9); c.font = `28px ${MONO}`; c.textAlign = 'center';
    c.fillText('1200 mm', 960, 905);
    c.textAlign = 'left'; c.globalAlpha = 1;
  }
  const eT = eOut(ss(2.4, 3.2, tm));
  c.fillStyle = hex(LINE, eT); c.font = `700 84px ${MONO}`;
  c.fillText('蓝图 · BLUEPRINT', 120, 200);
  c.restore();
};

// ---- K30 ----
S.K30 = (c, w, h, t, s) => {
  const INK = '#211C15', YEL = '#FBD24B', BG = '#FAF7F0';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  if (!s.tex) s.tex = paperTex(1920, 1080, 1, BG, 19);
  c.drawImage(s.tex, 0, 0, 1920, 1080);
  c.strokeStyle = INK; c.lineWidth = 6; c.lineCap = 'round'; c.lineJoin = 'round';
  for (let i = 0; i < 3; i++) {
    const e = eBack(ss(.2 + i * .3, .9 + i * .3, tm));
    if (e <= 0) continue;
    const sx = 420 + i * 540, sy = 190, m = Math.min(1.05, e);
    c.save(); c.translate(sx, sy); c.scale(m, m);
    c.fillStyle = YEL; c.beginPath(); c.arc(0, 0, 62, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = INK; c.font = `700 62px ${SANS}`; c.textAlign = 'center'; c.fillText(String(i + 1), 0, 23);
    c.restore(); c.textAlign = 'left';
    if (i < 2) {
      c.lineWidth = 5;
      c.beginPath(); c.moveTo(sx + 105, sy); c.lineTo(sx + 435, sy);
      c.moveTo(sx + 435, sy); c.lineTo(sx + 402, sy - 18); c.moveTo(sx + 435, sy); c.lineTo(sx + 402, sy + 18); c.stroke();
      c.lineWidth = 6;
    }
  }
  const gap = 24 + 34 * (Math.sin(tm * 1.1) * .5 + .5);
  const eP = eOut(ss(1.3, 2.2, tm));
  if (eP > 0) {
    c.globalAlpha = eP;
    c.fillStyle = '#FFFDF8'; c.fillRect(720, 480, 480, 96); c.strokeRect(720, 480, 480, 96);
    const ly = 660 + gap;
    c.beginPath(); c.moveTo(790, ly); c.lineTo(790, ly + 250); c.moveTo(1130, ly); c.lineTo(1130, ly + 250);
    c.moveTo(790, ly + 160); c.lineTo(1130, ly + 160); c.stroke();
    c.save(); c.setLineDash([14, 12]); c.lineWidth = 4; c.strokeStyle = hex(INK, .5);
    c.beginPath(); c.moveTo(790, 590); c.lineTo(790, ly); c.moveTo(1130, 590); c.lineTo(1130, ly); c.stroke();
    c.restore();
    for (const sc of [860, 1060]) {
      const cy2 = 408 - gap * .5;
      c.beginPath(); c.arc(sc, cy2, 26, 0, TAU); c.stroke();
      c.beginPath(); c.moveTo(sc - 14, cy2); c.lineTo(sc + 14, cy2); c.moveTo(sc, cy2 - 14); c.lineTo(sc, cy2 + 14); c.stroke();
    }
    c.globalAlpha = 1;
  }
  const eT = eOut(ss(2.2, 3.0, tm));
  c.fillStyle = hex(INK, eT); c.font = `700 92px ${SANS}`; c.textAlign = 'center';
  c.fillText('说明书 · 组装步骤', 960, 1015);
  c.textAlign = 'left';
  c.restore();
};

// ---- K31 ----
S.K31 = (c, w, h, t, s) => {
  const INK = '#3A3226', BG = '#E7DFD2';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  if (!s.tex) s.tex = paperTex(1920, 1080, 1, BG, 23);
  c.drawImage(s.tex, 0, 0, 1920, 1080);
  c.strokeStyle = hex(INK, .12); c.lineWidth = 3; c.setLineDash([16, 14]);
  for (const x of [420, 960, 1500]) { c.beginPath(); c.moveTo(x, 120); c.lineTo(x, 960); c.stroke(); }
  for (const y of [340, 740]) { c.beginPath(); c.moveTo(180, y); c.lineTo(1740, y); c.stroke(); }
  c.setLineDash([]);
  const rr = (x, y, ww, hh, r) => { c.beginPath(); c.roundRect(x, y, ww, hh, r); };
  const item = (x, y, i, draw) => {
    const e = eBack(ss(.2 + i * .28, 1.0 + i * .28, tm));
    if (e <= 0) return;
    const dir = [[-560, 0], [0, -420], [560, 0], [-560, 0], [0, 420]][i];
    c.save();
    c.translate(lerp(x + dir[0], x, e), lerp(y + dir[1], y, e));
    c.rotate(Math.sin(t * .6 + i * 1.4) * .025);
    c.fillStyle = hex(INK, .14); c.beginPath(); c.ellipse(10, 14, 130, 28, 0, 0, TAU); c.fill();
    draw(); c.restore();
  };
  item(420, 340, 0, () => {
    c.fillStyle = '#E8623F'; rr(-110, -150, 220, 300, 18); c.fill();
    c.lineWidth = 5; c.strokeStyle = INK; c.stroke();
    c.fillStyle = '#FFF6E8'; rr(-72, -118, 156, 236, 10); c.fill(); c.stroke();
    c.fillStyle = INK;
    for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(-110, -100 + k * 52, 9, 0, TAU); c.fill(); }
  });
  item(960, 340, 1, () => {
    c.rotate(-.35);
    c.fillStyle = '#F2B23D'; rr(-230, -26, 380, 52, 12); c.fill();
    c.lineWidth = 5; c.strokeStyle = INK; c.stroke();
    c.fillStyle = '#F4D8B8'; c.beginPath(); c.moveTo(150, -26); c.lineTo(248, 0); c.lineTo(150, 26); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = INK; c.beginPath(); c.moveTo(224, -8); c.lineTo(248, 0); c.lineTo(224, 8); c.closePath(); c.fill();
    c.fillStyle = '#E8623F'; rr(-230, -26, 44, 52, 10); c.fill(); c.stroke();
  });
  item(1500, 340, 2, () => {
    c.fillStyle = '#5AA9C9'; rr(-240, -34, 480, 68, 12); c.fill();
    c.lineWidth = 5; c.strokeStyle = INK; c.stroke();
    c.beginPath();
    for (let k = -5; k <= 5; k++) { c.moveTo(k * 40, -34); c.lineTo(k * 40, k % 2 ? -4 : 12); }
    c.stroke();
  });
  item(520, 740, 3, () => {
    c.fillStyle = '#FFF6E8'; c.beginPath(); c.arc(0, 0, 92, 0, TAU); c.fill();
    c.lineWidth = 5; c.strokeStyle = INK; c.stroke();
    c.lineWidth = 16; c.beginPath(); c.arc(108, 0, 42, -1.15, 1.15); c.stroke();
    c.lineWidth = 5; c.beginPath(); c.arc(0, 0, 56, 0, TAU); c.stroke();
    c.fillStyle = '#7B5E3B'; c.beginPath(); c.arc(0, 0, 50, 0, TAU); c.fill();
  });
  item(1240, 740, 4, () => {
    c.lineWidth = 15; c.strokeStyle = '#AEB9C4';
    c.beginPath(); c.moveTo(-70, -46); c.lineTo(120, 46); c.moveTo(-70, 46); c.lineTo(120, -46); c.stroke();
    c.lineWidth = 13; c.strokeStyle = INK;
    c.beginPath(); c.arc(-120, -80, 38, 0, TAU); c.stroke();
    c.beginPath(); c.arc(-120, 80, 38, 0, TAU); c.stroke();
    c.beginPath(); c.moveTo(-92, -58); c.lineTo(-40, -30); c.moveTo(-92, 58); c.lineTo(-40, 30); c.stroke();
  });
  const eT = eOut(ss(2.2, 3.0, tm));
  c.fillStyle = hex(INK, eT); c.font = `700 92px ${SANS}`; c.fillText('平铺整理', 150, 130);
  c.font = `34px ${MONO}`; c.fillStyle = hex(INK, eT * .6);
  c.fillText('KNOLLING · TOP VIEW', 150, 186);
  c.restore();
};

// ---- K32 ----
S.K32 = (c, w, h, t, s) => {
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = '#D8E4F2'; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.fillStyle = vgrad(c, 1080, '#EAF1FA', '#C2D4EA'); c.fillRect(0, 0, 1920, 1080);
  c.fillStyle = hex('#22304A', .18); c.beginPath(); c.ellipse(960, 880, 420, 80, 0, 0, TAU); c.fill();
  const UX = [56, 32], UY = [-56, 32], H = 68;
  const brick = (ox, oy, a, b, col, e) => {
    if (e <= 0) return;
    const drop = lerp(-340, 0, e);
    const P = (i, j) => [ox + i * UX[0] + j * UY[0], oy + i * UX[1] + j * UY[1] + drop];
    const A = P(0, 0), B = P(a, 0), C = P(a, b), D = P(0, b);
    const face = (pts, col2) => {
      c.fillStyle = col2; c.beginPath();
      pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
      c.closePath(); c.fill(); c.strokeStyle = hex('#1A2233', .3); c.lineWidth = 3; c.stroke();
    };
    face([D, C, [C[0], C[1] + H], [D[0], D[1] + H]], mixHex(col, '#000000', .22));
    face([B, C, [C[0], C[1] + H], [B[0], B[1] + H]], mixHex(col, '#000000', .4));
    face([A, B, C, D], col);
    for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) {
      const p = P(i + .5, j + .5);
      c.fillStyle = mixHex(col, '#000000', .12);
      c.beginPath(); c.ellipse(p[0], p[1], 27, 15, 0, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = mixHex(col, '#FFFFFF', .3);
      c.beginPath(); c.ellipse(p[0], p[1] - 9, 21, 10, 0, 0, TAU); c.fill();
    }
  };
  const bricks = [[960, 624, 3, 3, '#F2C230'], [960, 588, 2, 2, '#E24A4A'], [960, 536, 2, 1, '#2E6FD9'], [960, 484, 1, 1, '#2FA84F']];
  bricks.forEach(([ox, oy, a, b, col], i) => brick(ox, oy, a, b, col, eBack(ss(.3 + i * .5, 1.3 + i * .5, tm))));
  const eT = eOut(ss(2.4, 3.2, tm));
  c.fillStyle = hex('#22304A', eT); c.font = `700 120px ${SANS}`; c.fillText('积木', 150, 230);
  c.font = `38px ${MONO}`; c.fillStyle = hex('#4A5B7A', eT);
  c.fillText('BUILD · STACK · BRICKS', 150, 296);
  c.restore();
};

// ---- K33 ----
S.K33 = (c, w, h, t, s) => {
  const BG = '#F6F2E9', INK = '#23272E';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  const routes = [
    ['#E24A4A', [[140, 300], [520, 300], [720, 500], [1120, 500], [1330, 290], [1780, 290]]],
    ['#2E6FD9', [[300, 880], [640, 880], [860, 660], [1240, 660], [1520, 940]]],
    ['#2FA84F', [[220, 620], [520, 620], [720, 420], [720, 180]]],
    ['#F2913D', [[1780, 640], [1440, 640], [1240, 840], [860, 840], [660, 1040]]]
  ];
  const segs = pts => { const a = []; for (let i = 1; i < pts.length; i++) a.push(Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return a; };
  const at = (pts, f) => {
    const sg = segs(pts); let d = f * sg.reduce((x, y) => x + y, 0);
    for (let i = 0; i < sg.length; i++) {
      if (d <= sg[i]) { const r = d / sg[i]; return [lerp(pts[i][0], pts[i + 1][0], r), lerp(pts[i][1], pts[i + 1][1], r)]; }
      d -= sg[i];
    }
    return pts[pts.length - 1];
  };
  routes.forEach(([col, pts], ri) => {
    const e = eOut(ss(ri * .35, ri * .35 + 1.1, tm));
    const L = segs(pts).reduce((x, y) => x + y, 0);
    c.strokeStyle = col; c.lineWidth = 26; c.lineCap = 'round'; c.lineJoin = 'round';
    c.setLineDash([L * e, L]);
    c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
    c.setLineDash([]);
  });
  const stations = [[520, 300], [720, 500], [1120, 500], [640, 880], [860, 660], [1240, 660], [520, 620], [720, 420], [1440, 640], [860, 840]];
  const names = ['中央公园', '老城', '港口', '西站', '博物馆', '科技园', '河岸', '钟楼', '东门', '机场'];
  stations.forEach((p, i) => {
    const e = eBack(ss(1.4 + i * .08, 2.0 + i * .08, tm));
    if (e <= 0) return;
    const big = i === 1 || i === 4, m = Math.min(1.05, e);
    c.fillStyle = '#FFFFFF'; c.strokeStyle = INK; c.lineWidth = 6;
    c.beginPath(); c.arc(p[0], p[1], (big ? 20 : 13) * m, 0, TAU); c.fill(); c.stroke();
    if (big) { c.beginPath(); c.arc(p[0], p[1], 32 * m, 0, TAU); c.stroke(); }
    c.fillStyle = INK; c.font = `600 24px ${MONO}`; c.textAlign = 'center';
    const tw = c.measureText(names[i]).width;
    c.fillStyle = hex('#FFFFFF', .95); c.fillRect(p[0] - tw / 2 - 10, p[1] - 72, tw + 20, 36);
    c.fillStyle = INK;
    c.fillText(names[i], p[0], p[1] - 42);
    c.textAlign = 'left';
  });
  const tr = at(routes[0][1], (tm / 6 + .1) % 1);
  c.fillStyle = routes[0][0]; c.strokeStyle = '#FFF'; c.lineWidth = 5;
  c.beginPath(); c.arc(tr[0], tr[1], 20, 0, TAU); c.fill(); c.stroke();
  const eT = eOut(ss(2.4, 3.2, tm));
  c.fillStyle = hex(INK, eT); c.font = `700 92px ${SANS}`; c.fillText('地铁图', 120, 175);
  c.font = `40px ${MONO}`; c.fillStyle = hex('#7A7E86', eT);
  c.fillText('METRO MAP · ROUTES & LINES', 120, 235);
  c.restore();
};

// ---- K34 ----
S.K34 = (c, w, h, t, s) => {
  const PINK = '#FF2E88', CYAN = '#00E5FF', PUR = '#B04DFF';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = '#0A0A1F'; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.fillStyle = vgrad(c, 1080, '#150C2E', '#0A0A1F'); c.fillRect(0, 0, 1920, 1080);
  glowDot(c, 960, 640, 700, PUR, .35 + .1 * Math.sin(t * .9));
  if (!s.bld) { const r = rng(9); s.bld = []; for (let i = 0; i < 16; i++) s.bld.push([i * 130 + r() * 40, 180 + r() * 320, r()]); }
  for (const [bx, bh, br] of s.bld) {
    c.fillStyle = '#120B26'; c.fillRect(bx, 640 - bh, 110, bh);
    c.fillStyle = hex(br < .5 ? CYAN : PINK, .5);
    for (let wy = 0; wy < 5; wy++) for (let wx = 0; wx < 3; wx++)
      if ((wx * 7 + wy * 13 + Math.floor(bx)) % 3 === 0) c.fillRect(bx + 16 + wx * 30, 640 - bh + 24 + wy * 52, 14, 22);
  }
  c.strokeStyle = hex(PUR, .5); c.lineWidth = 3;
  for (let i = -10; i <= 10; i++) {
    c.beginPath(); c.moveTo(960 + i * 90, 640); c.lineTo(960 + i * 420, 1080); c.stroke();
  }
  for (let i = 0; i < 10; i++) {
    const z = (i / 10 + tm * .1) % 1;
    const y = 640 + Math.pow(z, 2.4) * 440;
    c.strokeStyle = hex(PINK, .15 + z * .5);
    c.beginPath(); c.moveTo(0, y); c.lineTo(1920, y); c.stroke();
  }
  const fl = Math.sin(t * 11) + Math.sin(t * 6.3) > -1.55 ? 1 : .45;
  const eT = eOut(ss(.3, 1.2, tm)) * fl;
  const neon = (txt, y, col, size) => {
    c.font = `700 ${size}px ${SANS}`; c.textAlign = 'center';
    for (const [lw, al] of [[34, .08], [18, .2], [6, .95]]) {
      c.lineWidth = lw; c.strokeStyle = hex(col, al * eT); c.lineJoin = 'round';
      c.strokeText(txt, 960, y);
    }
    c.fillStyle = hex('#FFFFFF', .92 * eT); c.fillText(txt, 960, y);
    c.textAlign = 'left';
  };
  neon('赛博霓虹', 330, PINK, 150);
  neon('CYBER NEON', 452, CYAN, 62);
  c.restore();
};

// ---- K35 ----
S.K35 = (c, w, h, t, s) => {
  const INK = '#4A3520', SEPIA = '#8A6B43', CREAM = '#E9DBB8';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = CREAM; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  if (!s.tex) s.tex = paperTex(1920, 1080, 1, CREAM, 31);
  c.drawImage(s.tex, 0, 0, 1920, 1080);
  const vg = c.createRadialGradient(960, 540, 260, 960, 540, 1120);
  vg.addColorStop(0, hex('#5A3C1E', 0)); vg.addColorStop(1, hex('#5A3C1E', .38));
  c.fillStyle = vg; c.fillRect(0, 0, 1920, 1080);
  const eF = eOut(ss(0, 1.2, tm));
  c.strokeStyle = hex(INK, .8 * eF);
  c.lineWidth = 6; c.strokeRect(80, 80, 1760, 920);
  c.lineWidth = 2.5; c.strokeRect(112, 112, 1696, 856);
  for (const [cx, cy, sx, sy] of [[112, 112, 1, 1], [1808, 112, -1, 1], [112, 968, 1, -1], [1808, 968, -1, -1]]) {
    c.save(); c.translate(cx, cy); c.scale(sx, sy);
    c.beginPath(); c.moveTo(0, 92); c.quadraticCurveTo(8, 8, 92, 0); c.stroke();
    c.beginPath(); c.moveTo(20, 122); c.quadraticCurveTo(20, 20, 122, 20); c.stroke();
    c.restore();
  }
  const eM = eBack(ss(.6, 1.7, tm));
  if (eM > 0) {
    const m = Math.min(1.05, eM);
    c.save(); c.translate(960, 470); c.scale(m, m);
    c.strokeStyle = hex(INK, .85); c.lineWidth = 5;
    c.beginPath(); c.arc(0, 0, 175, 0, TAU); c.stroke();
    c.lineWidth = 2.5; c.beginPath(); c.arc(0, 0, 152, 0, TAU); c.stroke();
    for (let i = 0; i < 36; i++) {
      const a = i / 36 * TAU + t * .04;
      const r2 = i % 3 ? 162 : 173;
      c.beginPath(); c.moveTo(Math.cos(a) * 152, Math.sin(a) * 152); c.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); c.stroke();
    }
    c.fillStyle = hex(SEPIA, .9);
    for (let k = 0; k < 4; k++) {
      const a = k / 4 * TAU + t * .12;
      c.beginPath(); c.moveTo(Math.cos(a) * 128, Math.sin(a) * 128);
      c.lineTo(Math.cos(a + .32) * 26, Math.sin(a + .32) * 26);
      c.lineTo(Math.cos(a + Math.PI) * 128, Math.sin(a + Math.PI) * 128);
      c.lineTo(Math.cos(a + Math.PI + .32) * 26, Math.sin(a + Math.PI + .32) * 26);
      c.closePath(); c.fill();
    }
    c.fillStyle = hex(INK, .9); c.beginPath(); c.arc(0, 0, 20, 0, TAU); c.fill();
    c.restore();
  }
  const eT = eOut(ss(1.6, 2.5, tm));
  c.textAlign = 'center';
  c.fillStyle = hex(INK, eT);
  c.font = `700 128px "Palatino Linotype","Book Antiqua",Georgia,serif`;
  c.fillText('旧学院风', 960, 790);
  c.letterSpacing = '14px';
  c.font = `36px ${MONO}`; c.fillStyle = hex(SEPIA, eT);
  c.fillText('OLD ACADEMY · SEPIA · EX LIBRIS', 960, 856);
  c.letterSpacing = '0px';
  c.strokeStyle = hex(SEPIA, eT * .9); c.lineWidth = 3;
  c.beginPath(); c.moveTo(620, 890); c.lineTo(1300, 890); c.stroke();
  c.fillStyle = hex(SEPIA, eT * .9);
  c.beginPath(); c.moveTo(960, 872); c.lineTo(982, 890); c.lineTo(960, 908); c.lineTo(938, 890); c.closePath(); c.fill();
  if (!s.fox) { const r = rng(77); s.fox = []; for (let i = 0; i < 16; i++) s.fox.push([r() * 1920, r() * 1080, 6 + r() * 22]); }
  for (let i = 0; i < s.fox.length; i++) {
    const [fx, fy, fr] = s.fox[i];
    c.fillStyle = hex('#8A5A28', .1 + .05 * Math.sin(t * .6 + i));
    c.beginPath(); c.arc(fx, fy, fr, 0, TAU); c.fill();
  }
  c.textAlign = 'left';
  c.restore();
};

// ---- K36 ----
S.K36 = (c, w, h, t, s) => {
  const ORG = '#E8552F', TEAL = '#17716B', INK = '#26221E', PAPER = '#F3EAD8';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = PAPER; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  if (!s.tex) s.tex = paperTex(1920, 1080, 1, PAPER, 55);
  c.drawImage(s.tex, 0, 0, 1920, 1080);
  const lay = (i, fx, fy, fn) => {
    const e = eOut(ss(.2 + i * .35, 1.1 + i * .35, tm));
    if (e <= 0) return;
    c.save(); c.globalCompositeOperation = 'multiply';
    c.translate(lerp(fx, 0, e) + Math.sin(t * .55 + i * 2.1) * 5, lerp(fy, 0, e) + Math.sin(t * .42 + i) * 5);
    fn(); c.restore();
  };
  lay(0, -160, 0, () => {
    c.fillStyle = ORG;
    c.beginPath(); c.arc(720, 470, 330, 0, TAU); c.fill();
    c.fillRect(1190, 170, 400, 640);
  });
  lay(1, 160, 0, () => {
    c.fillStyle = TEAL;
    c.beginPath(); c.moveTo(300, 880); c.lineTo(300, 580); c.arc(500, 580, 200, Math.PI, 0); c.lineTo(700, 880); c.closePath(); c.fill();
    c.save(); c.translate(1520, 330); c.rotate(-.35);
    for (let k = -2; k <= 2; k++) c.fillRect(k * 64, -290, 32, 580);
    c.restore();
    for (let k = 0; k < 10; k++) c.fillRect(150, 920 + k * 16, 420, 8);
  });
  lay(2, 0, 120, () => {
    c.fillStyle = INK;
    c.beginPath(); c.arc(720, 470, 118, 0, TAU); c.fill();
    c.strokeStyle = INK; c.lineWidth = 14;
    c.beginPath(); c.arc(720, 470, 172, 0, TAU); c.stroke();
    c.fillStyle = ORG;
    for (let k = 0; k < 6; k++) for (let j = 0; j < 2; j++) {
      c.beginPath(); c.arc(170 + k * 52, 300 + j * 52, 16, 0, TAU); c.fill();
    }
  });
  const eT = eOut(ss(1.7, 2.5, tm));
  c.globalAlpha = eT;
  c.fillStyle = hex(PAPER, .92); c.fillRect(575, 420, 775, 180);
  c.fillRect(625, 612, 672, 76);
  c.textAlign = 'center'; c.font = `700 172px ${SANS}`;
  c.fillStyle = ORG; c.fillText('丝网印刷', 950, 552);
  c.fillStyle = INK; c.fillText('丝网印刷', 960, 560);
  c.font = `600 44px ${SANS}`; c.fillStyle = INK;
  c.fillText('SCREEN PRINT · 套色 · 平涂 · 错位', 960, 662);
  c.textAlign = 'left'; c.globalAlpha = 1;
  c.restore();
};

// ---- K37 ----
S.K37 = (c, w, h, t, s) => {
  const LILAC = '#C9B6D9', WINE = '#7A1F2B';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = '#0B060F'; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.fillStyle = vgrad(c, 1080, '#1A0E24', '#0B060F'); c.fillRect(0, 0, 1920, 1080);
  glowDot(c, 960, 360, 520, WINE, .5 + .12 * Math.sin(t * .7));
  c.fillStyle = hex('#8E2433', .92); c.beginPath(); c.arc(960, 360, 150, 0, TAU); c.fill();
  const arch = (cx, yb, wA, hA) => {
    c.beginPath();
    c.moveTo(cx - wA, yb); c.lineTo(cx - wA, yb - hA * .55);
    c.quadraticCurveTo(cx - wA, yb - hA * .95, cx, yb - hA);
    c.quadraticCurveTo(cx + wA, yb - hA * .95, cx + wA, yb - hA * .55);
    c.lineTo(cx + wA, yb); c.closePath();
  };
  const eW = eOut(ss(.3, 1.5, tm));
  if (eW > 0) {
    c.globalAlpha = eW;
    arch(960, 900, 300, 700);
    c.fillStyle = hex('#160A20', .88); c.fill();
    c.strokeStyle = hex(LILAC, .7); c.lineWidth = 7; c.stroke();
    c.lineWidth = 5; c.strokeStyle = hex(LILAC, .5);
    for (const dx of [-150, 0, 150]) {
      c.beginPath(); c.moveTo(960 + dx, 900); c.lineTo(960 + dx, 500 + Math.abs(dx) * .6); c.stroke();
    }
    for (const dx of [-150, 150]) { arch(960 + dx, 640, 100, 250); c.strokeStyle = hex(WINE, .85); c.stroke(); }
    c.globalAlpha = 1;
  }
  const eS = eOut(ss(1.0, 2.0, tm));
  if (eS > 0) {
    c.fillStyle = hex('#12081B', eS); c.strokeStyle = hex('#3A2148', eS); c.lineWidth = 5;
    for (const [bx, bw2, bh2] of [[180, 130, 560], [1610, 130, 560], [330, 70, 380], [1520, 70, 380]]) {
      c.beginPath(); c.moveTo(bx - bw2 / 2, 900); c.lineTo(bx, 900 - bh2); c.lineTo(bx + bw2 / 2, 900); c.closePath(); c.fill(); c.stroke();
    }
  }
  for (let i = 0; i < 3; i++) {
    const mx = ((t * 26 + i * 700) % 2300) - 200;
    c.fillStyle = hex(LILAC, .05);
    c.fillRect(mx, 620 + i * 120, 700, 46);
  }
  const eT = eOut(ss(1.8, 2.7, tm));
  c.textAlign = 'center';
  c.letterSpacing = '24px';
  c.fillStyle = hex(LILAC, eT);
  c.font = `600 132px "Playfair Display","Times New Roman",serif`;
  c.fillText('哥特', 960, 1015);
  c.font = `34px ${MONO}`; c.fillStyle = hex(WINE, eT);
  c.fillText('GOTHIC · SHARP · DARK', 960, 150);
  c.letterSpacing = '0px';
  c.textAlign = 'left';
  c.restore();
};

// ---- K38 ----
S.K38 = (c, w, h, t, s) => {
  const OUT = '#1A1A1A', SKIN = '#F5D24E', COUCH = '#D8603A';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = '#9BD9F2'; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.fillStyle = '#A6DFF5'; c.fillRect(0, 0, 1920, 780);
  c.fillStyle = '#C88B4A'; c.fillRect(0, 780, 1920, 300);
  c.strokeStyle = OUT; c.lineWidth = 8;
  c.beginPath(); c.moveTo(0, 780); c.lineTo(1920, 780); c.stroke();
  const rr = (x, y, ww, hh, r) => { c.beginPath(); c.roundRect(x, y, ww, hh, r); };
  const eW = eBack(ss(.1, .9, tm));
  if (eW > 0) {
    const m = Math.min(1.05, eW);
    c.save(); c.translate(360, 320); c.scale(m, m);
    c.fillStyle = '#FFFDF5'; c.fillRect(-200, -180, 400, 340); c.strokeRect(-200, -180, 400, 340);
    c.fillStyle = '#6FC5F5'; c.fillRect(-165, -145, 330, 270);
    c.fillStyle = '#FFD75E'; c.beginPath(); c.arc(70, -60, 50, 0, TAU); c.fill();
    c.fillStyle = '#7BC47B'; c.fillRect(-165, 75, 330, 50);
    c.beginPath(); c.moveTo(-165, -145); c.lineTo(0, -10); c.lineTo(165, -145); c.stroke();
    c.restore();
  }
  const eC = eBack(ss(.5, 1.4, tm));
  if (eC > 0) {
    const m = Math.min(1.05, eC);
    c.save(); c.translate(1060, 640); c.scale(m, m);
    c.fillStyle = COUCH;
    rr(-420, -220, 840, 180, 30); c.fill(); c.stroke();
    rr(-420, -60, 840, 160, 26); c.fill(); c.stroke();
    rr(-420, -60, 130, 240, 26); c.fill(); c.stroke();
    rr(290, -60, 130, 240, 26); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-140, -60); c.lineTo(-140, 100); c.moveTo(140, -60); c.lineTo(140, 100); c.stroke();
    c.restore();
  }
  const bob = Math.sin(t * .9) * 5;
  const blink = (tm % 2.6) < .12 ? .12 : 1;
  const eP = eBack(ss(1.0, 1.9, tm));
  if (eP > 0) {
    const m = Math.min(1.05, eP);
    c.save(); c.translate(1060, 430 + bob); c.scale(m, m);
    c.fillStyle = '#3E6FBF'; rr(-95, 60, 190, 170, 24); c.fill(); c.stroke();
    c.fillStyle = SKIN; c.beginPath(); c.arc(0, -20, 118, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-30, -120); c.lineTo(-10, -180); c.lineTo(10, -120);
    c.moveTo(20, -118); c.lineTo(48, -172); c.lineTo(62, -112); c.stroke();
    c.fillStyle = '#FFF';
    c.beginPath(); c.ellipse(-38, -35, 26, 26 * blink, 0, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(38, -35, 26, 26 * blink, 0, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = OUT;
    c.beginPath(); c.arc(-32, -32, 9, 0, TAU); c.arc(44, -32, 9, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(0, -20); c.lineTo(16, 10); c.lineTo(-8, 12); c.closePath(); c.fill();
    c.beginPath(); c.arc(6, 42, 30, .2 * Math.PI, .8 * Math.PI); c.stroke();
    c.restore();
  }
  const eL = eBack(ss(.8, 1.6, tm));
  if (eL > 0) {
    const m = Math.min(1.05, eL);
    c.save(); c.translate(300, 620); c.scale(m, m); c.rotate(Math.sin(t * .7) * .04);
    c.fillStyle = '#E8B23A'; rr(-70, -120, 140, 110, 16); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(0, -10); c.lineTo(0, 120); c.stroke();
    rr(-80, 120, 160, 26, 12); c.fill(); c.stroke();
    c.restore();
  }
  const eT = eOut(ss(1.8, 2.6, tm));
  c.globalAlpha = eT;
  c.textAlign = 'center'; c.font = `700 110px ${SANS}`;
  c.lineWidth = 12; c.strokeStyle = OUT; c.strokeText('情景喜剧', 960, 190);
  c.fillStyle = '#FFD75E'; c.fillText('情景喜剧', 960, 190);
  c.font = `700 40px ${SANS}`; c.strokeText('SITCOM · 平涂 · 生活小场景', 960, 258);
  c.fillStyle = '#FFF'; c.fillText('SITCOM · 平涂 · 生活小场景', 960, 258);
  c.textAlign = 'left'; c.globalAlpha = 1;
  c.restore();
};


window.S = S;
})();
