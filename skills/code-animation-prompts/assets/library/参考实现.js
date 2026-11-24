// 参考实现.js — 由素材库 .md 中的参考实现自动打包生成（风格挑选器动态预览用）。
// 生成脚本：仓库 scripts 之外的本地工具；样式绘制函数 S.xx(c, w, h, t, s) 与 A-G 样片同约定。
(function () {
'use strict';

// A–G 参考实现共用的小工具函数
const SANS = '"Noto Sans SC", "PingFang SC", sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';
// —— 补丁 2026-11-24：以下常量被 A1/A2/A4/A5/B5/C1/F3 引用但原包未定义（源 .md 同缺） ——
const SERIF = 'Georgia,"Noto Serif SC","Songti SC",serif';
const PARENT = ['你要努力', '别人家的孩子', '我都是为你好', '听话', '快去学习', '别玩手机了', '怎么又错了', '为你好']; // A1 字雨落下的“被说教的话”（原词表未定义，按提示词主题补写）
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



// ==== 2026-11-24 补充：M 动态风格 / Z 中国风 参考实现（按 K/H .md 惯例编写） ====

// ---- M1 ----
S.M1 = (c, w, h, t, s) => {
  const m = Math.min(w, h), INK = '#232323', ACC = '#FFC53D', BLU = '#3B82F6';
  const q = t % 12, seg = (a, b) => clamp((q - a) / (b - a), 0, 1);
  c.fillStyle = '#FCFBF7'; c.fillRect(0, 0, w, h);
  const poly = (pts, f) => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); const n = f * (pts.length - 1); for (let i = 1; i <= Math.floor(n); i++) c.lineTo(pts[i][0], pts[i][1]); const i = Math.floor(n); if (i < pts.length - 1) c.lineTo(lerp(pts[i][0], pts[i + 1][0], n - i), lerp(pts[i][1], pts[i + 1][1], n - i)); c.stroke(); };
  const cx = w * .27, cy = h * .42, r = m * .13;
  // 灯泡：圆 + 灯丝 + 光线（笔画逐段画出）
  c.strokeStyle = INK; c.lineWidth = m * .012; c.lineCap = 'round';
  const bulb = []; for (let i = 0; i <= 24; i++) { const a = -Math.PI / 2 + i / 24 * TAU; bulb.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  poly(bulb, eOut(seg(.3, 1.4)));
  if (q > 1.2) { c.beginPath(); c.moveTo(cx - r * .35, cy + r * .75); c.lineTo(cx + r * .35, cy + r * .75); c.moveTo(cx - r * .3, cy + r * 1.05); c.lineTo(cx + r * .3, cy + r * 1.05); c.stroke(); }
  for (let k = 0; k < 8; k++) { const a = -Math.PI / 2 + k / 8 * TAU, f = eOut(seg(1.4 + k * .08, 1.9 + k * .08)); if (f > 0) poly([[cx + Math.cos(a) * r * 1.25, cy + Math.sin(a) * r * 1.25], [cx + Math.cos(a) * r * (1.25 + .5 * f), cy + Math.sin(a) * r * (1.25 + .5 * f)]], 1); }
  // 高亮马克笔
  const hi = eOut(seg(2.2, 3.0)); if (hi > 0) { c.fillStyle = hex(ACC, .8); c.fillRect(w * .5, h * .3, w * .3 * hi, m * .09); }
  // 右侧文字骨架
  c.lineWidth = m * .01; c.strokeStyle = INK;
  for (let i = 0; i < 3; i++) poly([[w * .5, h * (.36 + i * .14)], [w * (.5 + .26 * eOut(seg(2.6 + i * .25, 3.2 + i * .25))), h * (.36 + i * .14)]], 1);
  // 箭头
  const af = eOut(seg(3.6, 4.2)); if (af > 0) { poly([[cx + r * 1.6, cy + r * .6], [w * .47, h * .33]], af); if (af > .8) { c.fillStyle = INK; c.beginPath(); c.moveTo(w * .47, h * .33); c.lineTo(w * .44, h * .36); c.lineTo(w * .485, h * .375); c.closePath(); c.fill(); } }
  // 手写批注：下划线 → 圈注 → 对勾（保持画面一直在动）
  c.strokeStyle = BLU; c.lineWidth = m * .009; c.lineCap = 'round';
  const f2 = eOut(seg(5.2, 6.2)); if (f2 > 0) { c.beginPath(); c.moveTo(w * .5, h * .62); for (let i = 1; i <= 12 * f2; i++) c.lineTo(w * (.5 + .24 * i / 12), h * .62 + Math.sin(i * 2.2) * m * .007); c.stroke(); }
  const f3 = eOut(seg(6.8, 8.0)); if (f3 > 0) { c.strokeStyle = ACC; c.beginPath(); c.ellipse(w * .585, h * .345, w * .15 * f3, h * .12 * f3, .12, 0, TAU); c.stroke(); }
  const f4 = eOut(seg(8.6, 9.4)); if (f4 > 0) { c.strokeStyle = '#2E8B6F'; c.lineWidth = m * .012; c.beginPath(); c.moveTo(w * .78, h * .63); c.lineTo(w * .8, h * .66); c.lineTo(w * .84, h * .59); c.stroke(); }
  // 画笔跟着批注走
  if (q > .3 && q < 9.8) {
    let px = w * (.27 + .2 * seg(.3, 4.2)), py = h * (.3 + .1 * Math.sin(q * 3));
    if (q > 5.2) { px = w * (.5 + .3 * seg(5.2, 9.4)); py = h * (.62 - .27 * seg(5.2, 9.4)); }
    c.save(); c.translate(px, py); c.rotate(.6); c.fillStyle = '#E8B04B'; c.fillRect(0, 0, m * .11, m * .028); c.fillStyle = INK; c.beginPath(); c.moveTo(m * .11, 0); c.lineTo(m * .145, m * .014); c.lineTo(m * .11, m * .028); c.closePath(); c.fill(); c.restore();
  }
  // 收尾：整图淡出重来
  if (q > 10.5) { c.fillStyle = hex('#FCFBF7', (q - 10.5) / 1.5); c.fillRect(0, 0, w, h); }
};

// ---- M2 ----
S.M2 = (c, w, h, t, s) => {
  const m = Math.min(w, h), PAPER = '#F7F1E3', INK = '#2B2B2B', ORG = '#FF7A59', TEAL = '#2EC4B6';
  const q = t % 10, seg = (a, b) => clamp((q - a) / (b - a), 0, 1);
  if (!s.init) { s.init = 1; s.r = rng(11); }
  c.fillStyle = PAPER; c.fillRect(0, 0, w, h);
  c.save(); c.translate(Math.sin(t * .4) * m * .01, Math.cos(t * .3) * m * .008);
  // 大标题（遮罩显出）
  c.font = `900 ${m * .12}px ${SANS}`; c.fillStyle = INK; c.textBaseline = 'alphabetic';
  c.save(); c.beginPath(); c.rect(w * .07, h * .1, w * .6 * eOut(seg(.2, 1.0)), m * .16); c.clip(); c.fillText('今天的三个想法', w * .07, h * .24); c.restore();
  // 手写下划线（抖动折线）
  c.strokeStyle = ORG; c.lineWidth = m * .014; c.lineCap = 'round';
  const f = eOut(seg(1.2, 1.8)); if (f > 0) { c.beginPath(); c.moveTo(w * .07, h * .28); const n = 12; for (let i = 1; i <= n * f; i++) c.lineTo(w * (.07 + .52 * i / n), h * .28 + Math.sin(i * 2.1) * m * .008); c.stroke(); }
  // 便签卡（弹入）
  const cards = [['01', '先写下来', ORG], ['02', '再讲清楚', TEAL], ['03', '最后做出来', INK]];
  cards.forEach((cd, i) => {
    const e = eBack(seg(2.2 + i * .5, 2.9 + i * .5)); if (e <= 0) return;
    const x = w * (.08 + i * .3), y = h * .46, cw = w * .25, ch = h * .32;
    c.save(); c.translate(x + cw / 2, y + ch / 2); c.scale(e, e); c.translate(-cw / 2, -ch / 2);
    c.fillStyle = '#FFFDF6'; c.fillRect(0, 0, cw, ch); c.strokeStyle = hex(INK, .25); c.lineWidth = 2; c.strokeRect(0, 0, cw, ch);
    c.fillStyle = cd[2]; c.fillRect(0, 0, cw, ch * .12);
    c.fillStyle = INK; c.font = `700 ${m * .05}px ${SANS}`; c.fillText(cd[0], cw * .1, ch * .34);
    c.font = `500 ${m * .042}px ${SANS}`; c.fillText(cd[1], cw * .1, ch * .58);
    c.restore();
  });
  // 批注笔圈
  const cf = eOut(seg(4.4, 5.2)); if (cf > 0) { c.strokeStyle = ORG; c.lineWidth = m * .008; c.beginPath(); c.ellipse(w * .425, h * .62, w * .1 * cf, h * .16 * cf, .15, 0, TAU); c.stroke(); }
  c.restore();
};

// ---- M3 ----
S.M3 = (c, w, h, t, s) => {
  const m = Math.min(w, h), BG = '#12141C', PAPER = '#EDE6D2', ACC = '#E2725B';
  const q = t % 12, seg = (a, b) => clamp((q - a) / (b - a), 0, 1);
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  const block = (txt, x, y, bw, bh, e, col) => { if (e <= 0) return; c.save(); c.translate(x + bw / 2, y + bh / 2); c.scale(1, e); c.translate(-bw / 2, -bh / 2); c.fillStyle = col; c.fillRect(0, 0, bw, bh); c.fillStyle = BG; c.font = `900 ${bh * .52}px ${SANS}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, bw / 2, bh / 2); c.restore(); };
  // 地基：学习（砸下来，微弹）
  block('学习', w * .3, h * .68, w * .4, h * .16, eBack(seg(.3, 1.0)), PAPER);
  // 柱子：相信（两根，从地基长出）
  const e2 = eOut(seg(1.6, 2.4));
  if (e2 > 0) { c.fillStyle = hex(PAPER, .85); c.fillRect(w * .33, h * .68 - h * .3 * e2, w * .1, h * .3 * e2); c.fillRect(w * .57, h * .68 - h * .3 * e2, w * .1, h * .3 * e2); c.fillStyle = BG; c.font = `900 ${m * .05}px ${SANS}`; c.textAlign = 'center'; if (e2 > .5) { c.fillText('相', w * .38, h * .58); c.fillText('信', w * .62, h * .58); } }
  // 梁：自己（横着放上去）
  const e3 = eOut(seg(3.0, 3.7)); if (e3 > 0) { c.fillStyle = ACC; c.fillRect(w * .28 + w * .22 * (1 - e3), h * .32, w * .44, h * .12); c.fillStyle = '#fff'; c.font = `900 ${h * .07}px ${SANS}`; c.textAlign = 'center'; c.textBaseline = 'middle'; if (e3 > .6) c.fillText('自己', w * .5, h * .38); }
  // 站上去的小人
  const e4 = eBack(seg(4.2, 5.0));
  if (e4 > 0) { const px = w * .5, py = h * .32 - h * .12 * e4 + Math.sin(t * 2) * m * .006; c.fillStyle = PAPER; c.beginPath(); c.arc(px, py, m * .045, 0, TAU); c.fill(); c.fillRect(px - m * .02, py + m * .05, m * .04, m * .09); }
  // 结尾字幕（逐字打出）
  if (q > 6) { const txt = '每一句，都站在上一句搭好的东西上'; const n = Math.floor(clamp((q - 6) / 2.5, 0, 1) * txt.length); c.globalAlpha = (q > 10.8 ? (12 - q) / 1.2 : 1); c.fillStyle = PAPER; c.font = `500 ${m * .045}px ${SANS}`; c.textAlign = 'center'; c.fillText(txt.slice(0, n), w * .5, h * .9); c.globalAlpha = 1; }
};

// ---- M4 ----
S.M4 = (c, w, h, t, s) => {
  const m = Math.min(w, h), BG = '#FAF7F0', INK = '#22262B', DOT = '#FF6B35';
  const q = t % 12, seg = (a, b) => eOut(clamp((q - a) / (b - a), 0, 1));
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  const dot = (x, y, r) => { c.fillStyle = DOT; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };
  // 场景1：开关（0-3）
  const sw = { x: w * .2, y: h * .5 };
  c.strokeStyle = INK; c.lineWidth = m * .012; c.strokeRect(sw.x - m * .1, sw.y - m * .14, m * .2, m * .28);
  const swi = q < 2 ? 0 : seg(2, 2.6);
  c.fillStyle = INK; c.fillRect(sw.x - m * .02, sw.y - m * .1 + (1 - swi) * m * .12, m * .04, m * .08);
  // 场景2：字母 i 的点（3-6）
  c.font = `900 ${m * .3}px ${SANS}`; c.fillStyle = INK; c.textAlign = 'center'; c.fillText('idea', w * .5, h * .62);
  // 场景3：心的中心（6-9）
  const hx = w * .8, hy = h * .42;
  c.strokeStyle = INK; c.lineWidth = m * .012;
  c.beginPath(); c.moveTo(hx, hy + m * .12); c.bezierCurveTo(hx - m * .18, hy - m * .02, hx - m * .08, hy - m * .16, hx, hy - m * .05); c.bezierCurveTo(hx + m * .08, hy - m * .16, hx + m * .18, hy - m * .02, hx, hy + m * .12); c.stroke();
  // 圆点：沿路径连续移动（不瞬移）
  let x, y;
  if (q < 3) { x = sw.x; y = sw.y + (1 - swi) * m * .06; }
  else if (q < 6) { const e = seg(3, 5.4); x = lerp(sw.x, w * .5, e); y = lerp(sw.y, h * .435, e) - Math.sin(e * Math.PI) * h * .12; }
  else if (q < 9) { const e = seg(6, 8.4); x = lerp(w * .5, hx, e); y = lerp(h * .435, hy + m * .01, e) - Math.sin(e * Math.PI) * h * .1; }
  else { const e = seg(9, 11.4); x = lerp(hx, w * .5, e); y = lerp(hy + m * .01, h * .5, e) + Math.sin(e * Math.PI) * h * .08; }
  dot(x, y + Math.sin(t * 3.5) * m * .005, m * .035);
  // 结尾卡
  if (q > 9) { const e = clamp((q - 9.6) / .8, 0, 1); c.fillStyle = hex(INK, e); c.font = `700 ${m * .06}px ${SANS}`; c.textAlign = 'center'; c.fillText('一个点，串起所有场景', w * .5, h * .5 - m * .12); }
};

// ---- M5 ----
S.M5 = (c, w, h, t, s) => {
  const m = Math.min(w, h), BG = '#0E1116', LINE = '#E8E3D6', ACC = '#5AD1A5';
  const q = t % 12, seg = (a, b) => clamp((q - a) / (b - a), 0, 1);
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  // 一条线 → 升起文字 → 展开成页面 → 颜色铺满
  const lineW = w * (.2 + .7 * eOut(seg(0, 1.6)));
  c.fillStyle = ACC; c.fillRect(w * .5 - lineW / 2, h * .52, lineW, m * .008);
  // 文字从线里升起
  const e = eOut(seg(1.8, 3.2));
  if (e > 0) { c.fillStyle = LINE; c.font = `900 ${m * .09}px ${SANS}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.save(); c.translate(w * .5, h * .52 - h * .12 * e); c.scale(1, .2 + .8 * e); c.fillText('一镜到底', 0, 0); c.restore(); }
  // 按钮展开成页面（一个圆角矩形长成整页）
  const g = eOut(seg(3.6, 5.4));
  if (g > 0) { const bw = lerp(m * .3, w * .7, g), bh = lerp(m * .12, h * .58, g); c.fillStyle = hex('#1A2029', 1); c.fillRect(w * .5 - bw / 2, h * .52 - bh / 2 + h * .1 * g, bw, bh); c.strokeStyle = hex(LINE, .35); c.lineWidth = 2; c.strokeRect(w * .5 - bw / 2, h * .52 - bh / 2 + h * .1 * g, bw, bh);
    if (g > .5) { c.strokeStyle = hex(LINE, .5); for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(w * .5 - bw * .38, h * .42 + i * h * .09); c.lineTo(w * .5 - bw * .38 + bw * .55 * seg(5.6 + i * .15, 6.1 + i * .15), h * .42 + i * h * .09); c.stroke(); } } }
  // 一种颜色铺满画面 → 下一段
  const flood = seg(7.4, 8.2);
  if (flood > 0) { c.fillStyle = ACC; c.beginPath(); c.arc(w * .5, h * .5, Math.max(w, h) * flood, 0, TAU); c.fill(); if (flood > .55) { c.fillStyle = '#0E1116'; c.font = `900 ${m * .1}px ${SANS}`; c.textAlign = 'center'; c.fillText('一次缓动，切到下一段', w * .5, h * .52); for (let i = 0; i < 2; i++) { const e2 = seg(8.6 + i * .3, 9.4 + i * .3); c.fillRect(w * .5 - w * .22, h * .58 + i * h * .09, w * .44 * e2, m * .013); } } }
  if (q > 11.4) { c.fillStyle = hex(BG, (q - 11.4) / .6); c.fillRect(0, 0, w, h); }
};

// ---- M6 ----
S.M6 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  const drift = t * .12;
  c.fillStyle = '#F5F7FA'; c.fillRect(0, 0, w, h);
  // 柔和光斑背景
  glowDot(c, w * .3 + Math.sin(t * .3) * m * .05, h * .35, m * .5, '#BBD7FF', .5);
  glowDot(c, w * .75, h * .7 + Math.cos(t * .25) * m * .05, m * .45, '#D9ECFF', .55);
  // 玻璃卡片（镜头一直在动：缓慢缩放）
  const cam = 1 + .03 * Math.sin(t * .35);
  c.save(); c.translate(w / 2, h / 2); c.scale(cam, cam); c.translate(-w / 2, -h / 2);
  const card = (x, y, cw, ch, r, i) => {
    const g = c.createLinearGradient(x, y, x + cw, y + ch);
    g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,.35)');
    c.fillStyle = g; c.beginPath(); c.roundRect(x, y, cw, ch, r); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2; c.stroke();
  };
  card(w * .12 + Math.sin(t * .5) * m * .012, h * .18, w * .36, h * .5, m * .05, 0);
  card(w * .55 + Math.cos(t * .4) * m * .012, h * .3, w * .3, h * .42, m * .05, 1);
  // 主角玻璃球
  glowDot(c, w * .3, h * .43, m * .16, '#8FC7FF', .8);
  c.fillStyle = '#fff'; c.font = `600 ${m * .05}px ${SANS}`; c.textAlign = 'center';
  c.fillStyle = '#1D2733'; c.fillText('hello.', w * .3, h * .45);
  c.font = `400 ${m * .032}px ${SANS}`; c.fillStyle = '#4A5866';
  c.fillText('轻盈 · 亮 · 一直在动', w * .7, h * .52);
  c.restore();
};

// ---- M7 ----
S.M7 = (c, w, h, t, s) => {
  const m = Math.min(w, h), ACC = '#E2725B';
  const beat = 1.2, shot = Math.floor(t / beat) % 5, ph = (t % beat) / beat;
  c.fillStyle = '#F4F1EA'; c.fillRect(0, 0, w, h);
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const mask = (draw, cw, ch) => { const e = eOut(clamp(ph * 2.2, 0, 1)); c.save(); c.beginPath(); c.rect(w / 2 - cw / 2, h / 2 - ch / 2, cw * e, ch); c.clip(); draw(); c.restore(); };
  if (shot === 0) mask(() => { c.fillStyle = '#1D232B'; c.font = `700 ${m * .09}px ${SANS}`; c.fillText('一 个 镜 头', w / 2, h / 2); }, m * .8, m * .2);
  else if (shot === 1) { const e = eOut(clamp(ph * 2, 0, 1)); c.fillStyle = ACC; c.fillRect(w * .5 - m * .18, h * .5 - m * .02, m * .36 * e, m * .04); }
  else if (shot === 2) { const e = eOut(clamp(ph * 2, 0, 1)); c.fillStyle = '#1D232B'; c.beginPath(); c.arc(w / 2, h / 2, m * .12 * e, 0, TAU); c.fill(); }
  else if (shot === 3) mask(() => { c.fillStyle = '#1D232B'; c.font = `700 ${m * .07}px ${SANS}`; c.fillText('只 讲 一 件 事', w / 2, h / 2); }, m * .7, m * .18);
  else { const e = eOut(clamp(ph * 2, 0, 1)); c.fillStyle = ACC; for (let i = 0; i < 3; i++) c.fillRect(w * .5 - m * .15, h * (.42 + i * .08) - m * .01, m * .3 * (i === 1 ? e : Math.min(1, e * 1.4)), m * .016); }
};

// ---- M8 ----
S.M8 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  const words = ['把', '复杂', '的话', '一个词', '一个词', '讲', '清楚'];
  const q = t % 10, shown = Math.min(words.length, Math.floor(q * 1.2));
  c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h);
  c.save(); c.translate(Math.sin(t * .25) * m * .015, 0);
  // 图片位（音乐节拍上换：每 2 秒一换）
  const img = Math.floor(t / 2) % 3;
  c.fillStyle = '#EDEFF2'; c.fillRect(w * .1, h * .12, w * .35, h * .38);
  c.fillStyle = '#C9D2DC';
  if (img === 0) { c.beginPath(); c.moveTo(w * .13, h * .44); c.lineTo(w * .25, h * .22); c.lineTo(w * .32, h * .34); c.lineTo(w * .38, h * .26); c.lineTo(w * .43, h * .44); c.closePath(); c.fill(); }
  else if (img === 1) { c.beginPath(); c.arc(w * .27, h * .3, m * .1, 0, TAU); c.fill(); }
  else { c.fillRect(w * .16, h * .22, w * .22, h * .2); }
  // 逐词字幕（白底黑字，一种字体，无句号）
  c.fillStyle = '#111'; c.font = `600 ${m * .055}px ${SANS}`; c.textAlign = 'left'; c.textBaseline = 'middle';
  const lx = w * .1, ly = h * .68;
  let x = lx;
  for (let i = 0; i < shown; i++) {
    const wrd = words[i], ww = c.measureText(wrd).width;
    if (i === shown - 1) { const pop = eOut(clamp((q * 1.2 - Math.floor(q * 1.2)) * 3, 0, 1)); c.globalAlpha = pop; c.fillText(wrd, x, ly); c.globalAlpha = 1; }
    else c.fillText(wrd, x, ly);
    x += ww + m * .022;
  }
  c.restore();
};

// ---- M9 ----
S.M9 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 10;
  if (!s.init) { s.init = 1; const r = rng(21); s.p = []; for (let i = 0; i < 26; i++) s.p.push({ x0: r() * w, y0: r() * h, rot: r() * TAU, k: r() }); }
  const phase1 = eOut(clamp((q - 1) / 3, 0, 1));   // 混乱 → 排序
  const phase2 = eOut(clamp((q - 5) / 3, 0, 1));   // 排序 → 一句话
  c.fillStyle = q < 4 ? '#22262E' : mixHex('#22262E', '#F2EFE8', clamp((q - 4) / 2, 0, 1));
  c.fillRect(0, 0, w, h);
  s.p.forEach((p, i) => {
    const gx = w * .12 + (i % 13) * w * .06, gy = h * .35 + Math.floor(i / 13) * h * .12;
    const cxp = lerp(lerp(p.x0, gx, phase1), w * .5, phase2), cyp = lerp(lerp(p.y0, gy, phase1), h * .5, phase2);
    const size = lerp(m * .02, m * .035, phase1) * (1 - phase2);
    if (size < m * .004) return;
    c.save(); c.translate(cxp, cyp); c.rotate(lerp(p.rot, 0, phase1));
    c.fillStyle = mixHex('#FF7A59', '#5AD1A5', p.k * phase1 + .2);
    c.fillRect(-size / 2, -size / 2, size, size); c.restore();
  });
  if (q > 8) { const e = clamp((q - 8) / 1, 0, 1) * clamp(10 - q, 0, 1); c.fillStyle = hex('#1D2733', e); c.font = `700 ${m * .06}px ${SANS}`; c.textAlign = 'center'; c.fillText('从混乱，到掌控，到清晰', w * .5, h * .53); }
};

// ---- M10 ----
S.M10 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 10;
  const k = eOut(clamp((q - 1) / 5, 0, 1)); // 焦虑 → 平静
  c.fillStyle = mixHex('#1B1E2B', '#EAF2F0', k); c.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2;
  // 外形：从刺状噪声云到平滑圆
  c.beginPath();
  for (let i = 0; i <= 60; i++) {
    const a = i / 60 * TAU;
    const chaos = (nz(Math.cos(a) * 2, Math.sin(a) * 2, t * 1.2) * .5 + .5) * m * .18;
    const r = lerp(m * .17 + chaos, m * .18, k);
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    i ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.closePath();
  const g = c.createRadialGradient(cx, cy, m * .02, cx, cy, m * .3);
  g.addColorStop(0, mixHex('#FF6B6B', '#9AD8C7', k)); g.addColorStop(1, mixHex('#7A3B8F', '#CDE9E2', k));
  c.fillStyle = g; c.fill();
  // 浮动文字：状态词交替
  c.textAlign = 'center'; c.font = `700 ${m * .075}px ${SANS}`;
  c.fillStyle = mixHex('#FFD9D9', '#20423C', k);
  c.fillText(k < .5 ? '焦虑' : '平静', cx, cy + m * .02);
  // 尘点
  if (!s.init) { s.init = 1; const r = rng(5); s.d = []; for (let i = 0; i < 30; i++) s.d.push([r() * w, r() * h, r()]); }
  s.d.forEach(d => { const a = lerp(.55, .12, k); c.fillStyle = hex(k < .5 ? '#FFB3B3' : '#7FB8AA', a); c.beginPath(); c.arc(d[0], d[1] + Math.sin(t * .6 + d[2] * 9) * m * .01, m * .006, 0, TAU); c.fill(); });
};

// ---- M11 ----
S.M11 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 16;
  c.fillStyle = '#F3EDE2'; c.fillRect(0, 0, w, h);
  const cx = w / 2, base = h * .78;
  // 同一个人四个阶段循环（身高/头身比变化，无缝接回）
  const stages = [
    { hgt: .16, head: .45, cane: 0, label: '小时候' },
    { hgt: .26, head: .32, cane: 0, label: '少年' },
    { hgt: .34, head: .22, cane: 0, label: '现在' },
    { hgt: .28, head: .26, cane: 1, label: '慢慢来' },
  ];
  const segf = q / 4, i0 = Math.floor(segf) % 4, i1 = (i0 + 1) % 4, f = ss(0, 1, segf - Math.floor(segf));
  const A = stages[i0], B = stages[i1];
  const hgt = lerp(A.hgt, B.hgt, f) * h, head = lerp(A.head, B.head, f);
  const bob = Math.sin(t * 3) * m * .006;
  c.fillStyle = '#2C2A28';
  c.beginPath(); c.arc(cx, base - hgt + head * hgt * .5, head * hgt * .5, 0, TAU); c.fill();
  c.fillRect(cx - head * hgt * .28, base - hgt + head * hgt, head * hgt * .56, hgt - head * hgt + bob);
  const cane = lerp(A.cane, B.cane, f);
  if (cane > .05) { c.strokeStyle = hex('#8A5A2B', cane); c.lineWidth = m * .012; c.beginPath(); c.moveTo(cx + head * hgt * .5, base - hgt * .55); c.lineTo(cx + head * hgt * .5, base); c.stroke(); }
  c.fillStyle = hex('#2C2A28', .65); c.font = `500 ${m * .05}px ${SANS}`; c.textAlign = 'center';
  c.fillText(f < .5 ? A.label : B.label, cx, base + h * .1);
  c.fillStyle = hex('#2C2A28', .3); c.font = `400 ${m * .028}px ${SANS}`;
  c.fillText('同一个人 · 无缝循环', cx, base + h * .16);
};

// ---- M12 ----
S.M12 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 8;
  // 光后纸幕 + 剪纸皮影小人
  const g = c.createRadialGradient(w / 2, h * .45, m * .1, w / 2, h * .5, m * .8);
  g.addColorStop(0, '#F6E7C8'); g.addColorStop(1, '#C9A15C');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  // 红纸边框
  c.fillStyle = '#B3281D';
  c.fillRect(0, 0, w, h * .07); c.fillRect(0, h * .93, w, h * .07);
  c.fillRect(0, 0, w * .05, h); c.fillRect(w * .95, 0, w * .05, h);
  // 关节小人（走路循环）
  const px = w * (.25 + .5 * (q / 8)), base = h * .72, ph = t * 5;
  const legA = Math.sin(ph) * .6, legB = -legA;
  c.fillStyle = '#171310';
  const joint = (x0, y0, ang, len, wdt) => { c.save(); c.translate(x0, y0); c.rotate(ang); c.fillRect(-wdt / 2, 0, wdt, len); c.restore(); };
  c.beginPath(); c.arc(px, base - m * .3, m * .065, 0, TAU); c.fill();          // 头
  c.fillRect(px - m * .05, base - m * .24, m * .1, m * .17);                    // 身
  joint(px - m * .035, base - m * .08, legA, m * .16, m * .035);                // 腿
  joint(px + m * .035, base - m * .08, legB, m * .16, m * .035);
  joint(px - m * .06, base - m * .21, -legA * .7, m * .13, m * .028);           // 臂
  joint(px + m * .06, base - m * .21, -legB * .7, m * .13, m * .028);
  // 摇曳的烛光
  glowDot(c, w * .5, h * .38, m * .28 + Math.sin(t * 2.2) * m * .015, '#FFE9B8', .5);
};

// ---- M13 ----
S.M13 = (c, w, h, t, s) => {
  const m = Math.min(w, h), fr = Math.floor(t * 8) / 8; // 8fps 定格
  if (!s.init) { s.init = 1; s.r = rng(7); }
  const j = () => (s.r() - .5) * m * .006;
  c.fillStyle = '#F2ECDD'; c.fillRect(0, 0, w, h);
  c.save(); c.translate(j(), j());
  // 手绘方格纸背景
  c.strokeStyle = 'rgba(90,110,150,.18)'; c.lineWidth = 1;
  for (let x = 0; x < w; x += m * .07) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
  for (let y = 0; y < h; y += m * .07) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  // 第一人称的铅笔小人（会说话）
  const cx = w / 2, cy = h * .55;
  c.strokeStyle = '#2A2A33'; c.lineWidth = m * .014; c.lineCap = 'round';
  c.strokeRect(cx - m * .09, cy - m * .2, m * .18, m * .3);                      // 笔身
  c.beginPath(); c.moveTo(cx - m * .09, cy + m * .1); c.lineTo(cx, cy + m * .22); c.lineTo(cx + m * .09, cy + m * .1); c.stroke(); // 笔尖
  const blink = Math.floor(fr * .8) % 4 === 0 ? .1 : 1;
  c.fillStyle = '#2A2A33';
  c.beginPath(); c.arc(cx - m * .035, cy - m * .12, m * .012 * blink, 0, TAU); c.fill();
  c.beginPath(); c.arc(cx + m * .035, cy - m * .12, m * .012 * blink, 0, TAU); c.fill();
  const talk = Math.floor(fr * 3) % 2 ? m * .03 : m * .008;                      // 嘴巴开合
  c.beginPath(); c.ellipse(cx, cy - m * .05, m * .03, talk, 0, 0, TAU); c.fill();
  // 手绘台词框
  c.strokeRect(w * .12, h * .12, w * .34, h * .14);
  c.fillStyle = '#2A2A33'; c.font = `600 ${m * .04}px ${SANS}`;
  c.fillText('你好，我是一支铅笔', w * .15, h * .21);
  c.restore();
  // 帧号（定格感）
  c.fillStyle = 'rgba(40,40,50,.4)'; c.font = `400 ${m * .022}px ${MONO}`;
  c.fillText('stop-motion · 8fps', m * .04, h - m * .04);
};

// ---- M14 ----
S.M14 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 12;
  if (!s.init) { s.init = 1; const r = rng(61); s.gr = []; for (let i = 0; i < 120; i++) s.gr.push([r(), r(), r()]); }
  const shakeX = (Math.sin(t * 2.1) + Math.sin(t * 3.7) * .5) * m * .006, shakeY = (Math.cos(t * 1.7) + Math.sin(t * 2.9) * .5) * m * .005;
  c.fillStyle = '#14120E'; c.fillRect(0, 0, w, h);
  c.save(); c.translate(shakeX, shakeY);
  const shot = Math.floor(q / 4) % 3; // 0 访谈 1 空镜 2 近景
  const g = c.createLinearGradient(0, 0, 0, h);
  if (shot === 1) { g.addColorStop(0, '#3E4A3C'); g.addColorStop(1, '#8A7A52'); } else { g.addColorStop(0, '#2A2620'); g.addColorStop(1, '#4A4238'); }
  c.fillStyle = g; c.fillRect(-m * .03, -m * .03, w + m * .06, h + m * .06);
  if (shot === 1) {
    const pan = (q % 4) / 4;
    c.fillStyle = '#5A6248';
    for (let k = 0; k < 5; k++) { const x = (((k / 5 + pan * .18) % 1) * 1.2 - .1) * w; c.beginPath(); c.moveTo(x, h * .7); c.quadraticCurveTo(x + w * .1, h * .48, x + w * .24, h * .7); c.closePath(); c.fill(); }
    c.fillStyle = '#C9A05C'; c.beginPath(); c.arc(w * (.72 - pan * .08), h * .28, m * .085, 0, TAU); c.fill();
  } else {
    const px = shot === 0 ? w * .38 : w * .5, sc = shot === 0 ? 1 : 1.35;
    glowDot(c, w * .78, h * .3, m * .22, '#C9A05C', .3);
    c.fillStyle = '#201B15';
    c.beginPath(); c.arc(px, h * (.44 - .05 * (sc - 1)), m * .11 * sc, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(px - m * .21 * sc, h * 1.02); c.quadraticCurveTo(px, h * (.54 - .05 * (sc - 1)), px + m * .21 * sc, h * 1.02); c.closePath(); c.fill();
    const nod = Math.sin(t * 2.2) * m * .006;
    c.fillStyle = '#C9A05C'; c.beginPath(); c.arc(px + m * .035 * sc, h * (.44 - .05 * (sc - 1)) + nod, m * .008, 0, TAU); c.fill();
    if (q < 3.2) { const e = eOut(clamp(q / .6, 0, 1)) * clamp((3.2 - q) / .5, 0, 1); c.fillStyle = hex('#E8DFC8', .92 * e); c.fillRect(w * .08, h * .66, w * .3 * e, h * .1); c.fillStyle = '#201B15'; c.textAlign = 'left'; c.font = `700 ${m * .045}px ${SANS}`; c.fillText('林晚 · 修表匠', w * .1, h * .715); c.font = `400 ${m * .028}px ${SANS}`; c.fillText('「这块表跟了我四十年」', w * .1, h * .752); }
  }
  const caps = ['它停在下午三点十四分', '那年我十八岁', '有些东西修得好，有些修不好', '但我一直在修'];
  c.fillStyle = 'rgba(232,223,200,.92)'; c.font = `500 ${m * .04}px ${SANS}`; c.textAlign = 'center';
  c.fillText(caps[Math.floor(q / 3) % 4], w * .5, h * .88);
  c.restore();
  s.gr.forEach(d => { c.fillStyle = hex('#FFFFFF', .05 * d[2]); c.fillRect(d[0] * w, d[1] * h, 1.5, 1.5); });
  c.fillStyle = '#0A0908'; c.fillRect(0, 0, w, h * .07); c.fillRect(0, h * .93, w, h * .07);
};

// ---- M15 ----
S.M15 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 12, page = Math.floor(q / 4) % 3, ph = (q % 4) / 4;
  c.fillStyle = '#C9A97C'; c.fillRect(0, 0, w, h);
  const pw = w * .42, phh = h * .62, lx = w * .5 - pw, ty = h * .19;
  // 书页
  const pageBg = (x) => { c.fillStyle = '#F7EFDC'; c.fillRect(x, ty, pw, phh); c.strokeStyle = 'rgba(120,90,50,.35)'; c.lineWidth = 2; c.strokeRect(x, ty, pw, phh); };
  pageBg(lx); pageBg(w * .5);
  // 中缝阴影
  const g = c.createLinearGradient(w * .5 - m * .06, 0, w * .5 + m * .06, 0);
  g.addColorStop(0, 'rgba(120,90,50,0)'); g.addColorStop(.5, 'rgba(120,90,50,.4)'); g.addColorStop(1, 'rgba(120,90,50,0)');
  c.fillStyle = g; c.fillRect(w * .5 - m * .06, ty, m * .12, phh);
  // 每页一幅小画
  const scene = (x, kind) => {
    const cx = x + pw * .5, cy = ty + phh * .45;
    if (kind === 0) { c.fillStyle = '#E8B04B'; c.beginPath(); c.arc(cx, cy - phh * .12, m * .06, 0, TAU); c.fill(); c.fillStyle = '#7FA86B'; c.beginPath(); c.moveTo(x + pw * .12, ty + phh * .62); c.quadraticCurveTo(cx, ty + phh * .38, x + pw * .88, ty + phh * .62); c.lineTo(x + pw * .88, ty + phh * .72); c.lineTo(x + pw * .12, ty + phh * .72); c.closePath(); c.fill(); }
    else if (kind === 1) { c.fillStyle = '#B85C4B'; c.fillRect(cx - m * .07, cy - m * .02, m * .14, m * .1); c.beginPath(); c.moveTo(cx - m * .095, cy - m * .02); c.lineTo(cx, cy - m * .1); c.lineTo(cx + m * .095, cy - m * .02); c.closePath(); c.fill(); c.fillStyle = '#7FA86B'; c.fillRect(x + pw * .12, ty + phh * .62, pw * .76, phh * .1); }
    else { c.fillStyle = '#6B8FB8'; c.fillRect(x + pw * .12, ty + phh * .52, pw * .76, phh * .2); c.fillStyle = '#F7EFDC'; c.beginPath(); c.moveTo(cx - m * .06, ty + phh * .52); c.lineTo(cx + m * .06, ty + phh * .52); c.lineTo(cx, ty + phh * .42); c.closePath(); c.fill(); }
  };
  scene(lx, page); scene(w * .5, (page + 1) % 3);
  // 翻页动画（右页掀起盖到左边）
  if (ph > .25 && ph < .85) {
    const k = eOut((ph - .25) / .6), sw = pw * k;
    c.fillStyle = '#EFE4CB';
    c.beginPath(); c.moveTo(w * .5, ty); c.lineTo(w * .5 - sw, ty + phh * k * .12); c.lineTo(w * .5 - sw, ty + phh * (1 - k * .12)); c.lineTo(w * .5, ty + phh); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(120,90,50,.3)'; c.lineWidth = 2; c.stroke();
  }
  // 页脚文字与页码
  c.fillStyle = 'rgba(60,45,25,.75)'; c.textAlign = 'center'; c.font = `500 ${m * .03}px ${SANS}`;
  c.fillText(['第一页 · 从前有座山', '第二页 · 山里有间屋', '第三页 · 屋里有人在讲故事'][page], w * .5, ty + phh + h * .06);
  c.font = `400 ${m * .024}px ${MONO}`;
  c.fillText(String(page * 2 + 1) + ' / 6', w * .5, ty + phh + h * .1);
};

// ---- M16 ----
S.M16 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 8, turn = Math.floor(q / 2) % 2, ph = q % 2;
  c.fillStyle = '#F2EEE4'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#DCE6E2'; c.fillRect(0, h * .72, w, h * .28);
  const person = (x, col, active) => {
    const bob = active ? Math.sin(t * 4) * m * .008 : 0;
    c.fillStyle = col;
    c.beginPath(); c.arc(x, h * .5 + bob, m * .075, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(x - m * .1, h * .78); c.quadraticCurveTo(x, h * .58 + bob, x + m * .1, h * .78); c.closePath(); c.fill();
    if (active) { c.fillStyle = '#2B2B2B'; const talk = (Math.floor(t * 4) % 2) ? m * .016 : m * .005; c.beginPath(); c.ellipse(x, h * .53 + bob, m * .022, talk, 0, 0, TAU); c.fill(); }
    // 听话的人点头
    if (!active) { c.fillStyle = hex(col, .8); c.beginPath(); c.arc(x, h * .5 + Math.sin(t * 1.2) * m * .006, m * .075, 0, TAU); c.fill(); }
  };
  person(w * .22, '#4E7A96', turn === 0);
  person(w * .78, '#C4694F', turn === 1);
  // 说话气泡（谁说话谁出泡）
  const lines = [['如果把这个问题拆开看', '#4E7A96'], ['其实就两件事', '#C4694F'], ['一件是时间，一件是成本', '#4E7A96'], ['对，先解决时间', '#C4694F']];
  const li = Math.floor(q / 2) % 4;
  const pop = eBack(clamp(ph * 2.2, 0, 1)), fade = clamp((2 - ph) * 2.2, 0, 1);
  const bx = turn === 0 ? w * .38 : w * .38, by = h * .22;
  if (fade > .02) {
    c.save(); c.translate(bx + w * .12, by); c.scale(pop, pop);
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.roundRect(-w * .13, -h * .07, w * .26, h * .14, m * .02); c.fill();
    c.fillStyle = hex('#2B2B2B', fade); c.textAlign = 'center'; c.font = `600 ${m * .038}px ${SANS}`;
    c.fillText(lines[li][0], 0, m * .012);
    c.fillStyle = '#FFFFFF';
    c.beginPath(); c.moveTo(-w * .02, h * .07); c.lineTo(w * .01, h * .11); c.lineTo(w * .03, h * .07); c.closePath(); c.fill();
    c.restore();
  }
  // 底部字幕条
  c.fillStyle = 'rgba(43,43,43,.08)'; c.fillRect(0, h * .88, w, h * .12);
  c.fillStyle = '#2B2B2B'; c.textAlign = 'center'; c.font = `500 ${m * .034}px ${SANS}`;
  c.fillText('一问一答，谁说话谁动，另一个人安静听', w * .5, h * .95);
};

// ---- M17 ----
S.M17 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 9, beat = 0.75, shot = Math.min(7, Math.floor(q / beat)), ph = (q % beat) / beat;
  const pulse = eOut(clamp(ph * 3, 0, 1));
  c.fillStyle = '#0B0B0D'; c.fillRect(0, 0, w, h);
  // 上下遮幅
  c.fillRect(0, 0, w, h * .12); c.fillRect(0, h * .88, w, h * .12);
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const flash = ph < .06 ? .55 : 0;
  if (shot === 0) { c.fillStyle = '#F2EFE6'; c.font = `900 ${m * .16 * (0.9 + pulse * .1)}px ${SANS}`; c.fillText('这一次', w / 2, h * .5); }
  else if (shot === 1) { c.fillStyle = '#F2EFE6'; c.font = `900 ${m * .2 * (0.85 + pulse * .15)}px ${SANS}`; c.fillText('不一样', w / 2, h * .5); }
  else if (shot === 2) { c.fillStyle = '#E2725B'; c.fillRect(w * .5 - w * .3 * pulse, h * .46, w * .6 * pulse, h * .08); c.fillStyle = '#F2EFE6'; c.font = `900 ${m * .09}px ${SANS}`; c.fillText('三个问题', w / 2, h * .5); }
  else if (shot === 3) { const k = 1 + (1 - pulse) * .8; c.save(); c.translate(w / 2, h * .5); c.scale(k, k); c.fillStyle = '#F2EFE6'; c.font = `900 ${m * .14}px ${SANS}`; c.fillText('一个答案', 0, 0); c.restore(); }
  else if (shot === 4) { for (let i = 0; i < 4; i++) { c.fillStyle = ['#E2725B', '#F2EFE6', '#5B87C9', '#E8B04B'][i]; const e = eOut(clamp(ph * 2 - i * .12, 0, 1)); c.fillRect(w * (.12 + i * .2), h * (.3 + (1 - e) * .3), w * .12, h * .4 * e); } }
  else if (shot === 5) { const n = String(3 - Math.floor(q / beat * 1) % 3); c.fillStyle = '#F2EFE6'; c.font = `900 ${m * .24}px ${MONO}`; c.fillText('0:0' + (Math.floor(q * 2) % 9), w / 2, h * .5); }
  else if (shot === 6) { c.strokeStyle = '#F2EFE6'; c.lineWidth = m * .008; c.strokeRect(w * .2, h * .26, w * .6, h * .48); c.fillStyle = '#F2EFE6'; c.font = `900 ${m * .12}px ${SANS}`; c.fillText('大标题', w / 2, h * .46); c.font = `500 ${m * .045}px ${MONO}`; c.fillText('12 月 1 日 · 敬请期待', w / 2, h * .58); }
  else { c.fillStyle = '#E2725B'; c.beginPath(); c.arc(w / 2, h * .5, m * .07 + Math.sin(t * 6) * m * .008, 0, TAU); c.fill(); c.fillStyle = '#0B0B0D'; c.font = `900 ${m * .05}px ${SANS}`; c.fillText('▲', w / 2, h * .5); }
  // 重拍闪白
  if (flash > 0) { c.fillStyle = hex('#FFFFFF', flash); c.fillRect(0, 0, w, h); }
};

// ---- M18 ----
S.M18 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 12;
  c.fillStyle = '#0B1020'; c.fillRect(0, 0, w, h);
  const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, m * .8);
  g.addColorStop(0, 'rgba(60,90,180,.18)'); g.addColorStop(1, 'rgba(11,16,32,0)');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  const ox = w * .5, oy = h * .58, R = m * .26;
  // 坐标轴
  c.strokeStyle = 'rgba(160,190,255,.5)'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(ox - R * 1.5, oy); c.lineTo(ox + R * 1.5, oy); c.moveTo(ox, oy - R * 1.3); c.lineTo(ox, oy + R * .5); c.stroke();
  // 正弦波→圆的变形（概念：e^{iθ}）
  const k = (Math.sin(q / 12 * TAU - Math.PI / 2) + 1) / 2;
  c.strokeStyle = '#7FB3FF'; c.lineWidth = 3; c.beginPath();
  for (let i = 0; i <= 120; i++) {
    const th = i / 120 * TAU;
    const x = lerp(ox - R * 1.3 + i / 120 * R * 2.6, ox + Math.cos(th) * R, k);
    const y = lerp(oy - Math.sin(th * 2.2) * R * .5, oy + Math.sin(th) * R, k);
    i ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.stroke();
  // 动点
  const th = q * .9;
  const px = lerp(ox - R * 1.3 + (th % (TAU)) / TAU * R * 2.6, ox + Math.cos(th) * R, k);
  const py = lerp(oy - Math.sin(th * 2.2) * R * .5, oy + Math.sin(th) * R, k);
  glowDot(c, px, py, m * .03, '#FFD866', .9);
  // 公式
  c.fillStyle = '#E8EEFF'; c.font = `500 ${m * .05}px ${MONO}`; c.textAlign = 'center';
  c.fillText('e^(iθ) = cos θ + i sin θ', w * .5, h * .14);
  c.fillStyle = 'rgba(200,215,255,.7)'; c.font = `400 ${m * .028}px ${SANS}`;
  c.fillText('从波形到圆 · 一点点变形讲清楚', w * .5, h * .88);
};

// ---- M19 ----
S.M19 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 10, step = Math.min(2, Math.floor(q / 3.2));
  c.fillStyle = '#FFF8EC'; c.fillRect(0, 0, w, h);
  c.textAlign = 'center';
  const cap = ['先看生活里的例子', '再看水面上发生了什么', '这就叫「蒸发」'];
  c.fillStyle = '#2B2B2B'; c.font = `700 ${m * .05}px ${SANS}`; c.fillText(cap[step], w * .5, h * .14);
  // 杯子与水
  const cx = w * .5, cy = h * .62, cw = m * .3, ch = m * .36;
  c.strokeStyle = '#2B2B2B'; c.lineWidth = m * .012;
  c.strokeRect(cx - cw / 2, cy - ch / 2, cw, ch);
  const level = .7 - step * .12;
  c.fillStyle = '#7EC8E3'; c.fillRect(cx - cw / 2 + m * .012, cy - ch / 2 + ch * (1 - level), cw - m * .024, ch * level - m * .012);
  // 水面上升的气/蒸汽
  if (!s.init) { s.init = 1; const r = rng(13); s.b = []; for (let i = 0; i < 10; i++) s.b.push([r() * cw - cw / 2, r(), r()]); }
  s.b.forEach(b => {
    const y = cy - ch / 2 + ch * (1 - level) - ((t * .12 + b[1]) % 1) * ch * .8;
    c.fillStyle = hex('#7EC8E3', .5 * (1 - ((t * .12 + b[1]) % 1)));
    c.beginPath(); c.arc(cx + b[0] * .8 + Math.sin(t + b[2] * 9) * m * .015, y, m * .012, 0, TAU); c.fill();
  });
  // 第三步：术语卡
  if (step === 2) { const e = eBack(clamp((q - 6.8) / .8, 0, 1)); c.save(); c.translate(cx, cy + ch * .75); c.scale(e, e); c.fillStyle = '#E2725B'; c.fillRect(-m * .16, -m * .05, m * .32, m * .1); c.fillStyle = '#fff'; c.font = `700 ${m * .055}px ${SANS}`; c.fillText('蒸发', 0, m * .022); c.restore(); }
};

// ---- M20 ----
S.M20 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 12;
  c.fillStyle = '#101418'; c.fillRect(0, 0, w, h);
  const nodes = [
    { x: .15, y: .38, yr: '1969', txt: '第一台机器' },
    { x: .42, y: .62, yr: '1991', txt: '连成一张网' },
    { x: .68, y: .36, yr: '2007', txt: '装进口袋' },
    { x: .9, y: .58, yr: '现在', txt: '读懂你说的话' },
  ];
  const line = clamp(q / 10, 0, 1);
  // 时间轴推进
  c.strokeStyle = '#E8E3D6'; c.lineWidth = m * .01;
  c.beginPath(); c.moveTo(w * .05, h * .5);
  for (let i = 0; i <= 60 * line; i++) {
    const tt = i / 60, x = w * (.05 + tt * .9), y = h * (.5 + Math.sin(tt * 5) * .16);
    c.lineTo(x, y);
  }
  c.stroke();
  // 节点弹出
  nodes.forEach((n, i) => {
    const reach = .05 + n.x * .95 / 1.05;
    if (line < reach - .02) return;
    const e = eBack(clamp((line - reach + .02) / .06, 0, 1));
    const x = w * n.x, y = h * (0.5 + Math.sin((n.x - .05) / .9 * 5) * .16);
    glowDot(c, x, y, m * .04 * e, '#FFD866', .9);
    c.fillStyle = '#E8E3D6'; c.font = `700 ${m * .045}px ${MONO}`; c.textAlign = 'center';
    c.fillText(n.yr, x, y - m * .09 * e);
    c.fillStyle = 'rgba(232,227,214,.75)'; c.font = `400 ${m * .032}px ${SANS}`;
    c.fillText(n.txt, x, y + m * .1 * e);
  });
  // 相机微推
  c.fillStyle = 'rgba(255,255,255,.06)'; c.font = `400 ${m * .026}px ${SANS}`;
  c.fillText('时间线从左往右，每到一个节点讲一件事', w * .5, h * .92);
};

// ---- M21 ----
S.M21 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 10;
  const open = eOut(clamp((q - 1) / 2.5, 0, 1)) * (q < 8 ? 1 : eOut(clamp((10 - q) / 1.6, 0, 1)));
  c.fillStyle = '#F4F1EA'; c.fillRect(0, 0, w, h);
  const cx = w * .5, cy = h * .52;
  // 灯泡拆三层：玻璃壳 / 灯丝 / 灯座
  const layers = [
    { dy: -1, draw: (x, y) => { c.strokeStyle = '#C9A227'; c.lineWidth = m * .012; c.beginPath(); c.arc(x, y, m * .13, 0, TAU); c.stroke(); } },
    { dy: 0, draw: (x, y) => { c.strokeStyle = '#E2725B'; c.lineWidth = m * .012; c.beginPath(); c.moveTo(x - m * .05, y + m * .03); c.lineTo(x - m * .02, y - m * .04); c.lineTo(x + m * .02, y + m * .03); c.lineTo(x + m * .05, y - m * .04); c.stroke(); } },
    { dy: 1, draw: (x, y) => { c.fillStyle = '#5B6B7A'; c.fillRect(x - m * .06, y - m * .02, m * .12, m * .1); } },
  ];
  layers.forEach((L, i) => { const y = cy + L.dy * open * m * .3 + Math.sin(t * 1.2 + i) * m * .008; L.draw(cx, y); });
  if (open > .6) { c.strokeStyle = 'rgba(43,43,43,.35)'; c.setLineDash([m * .012, m * .012]); c.lineDashOffset = -t * 24; c.beginPath(); c.moveTo(cx, cy - open * m * .3); c.lineTo(cx, cy + open * m * .3); c.stroke(); c.setLineDash([]); }
  // 标签
  const labels = ['玻璃壳', '灯丝', '灯座'];
  c.fillStyle = '#2B2B2B'; c.font = `500 ${m * .034}px ${SANS}`; c.textAlign = 'center';
  labels.forEach((t2, i) => { if (open > .4) c.fillText(t2, cx + m * .3, cy + (i - 1) * open * m * .3); });
  // 步骤文字
  const step = Math.min(2, Math.floor(q / 3.2));
  c.fillStyle = '#2B2B2B'; c.font = `700 ${m * .05}px ${SANS}`;
  c.fillText(['整体', '拆开', '再合起来看全貌'][step], w * .5, h * .14);
  if (step === 2) { c.fillStyle = 'rgba(43,43,43,.5)'; c.font = `400 ${m * .03}px ${SANS}`; c.fillText('前一步的结果，是下一步的开头', w * .5, h * .88); }
};

// ---- M22 ----
S.M22 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 10;
  c.fillStyle = '#1C2430'; c.fillRect(0, 0, w, h);
  const cx = w * .5, top = h * .3, bw = m * .26, bh = m * .42;
  // 杯子
  c.strokeStyle = '#E8EEF4'; c.lineWidth = m * .012;
  c.beginPath(); c.moveTo(cx - bw / 2, top); c.lineTo(cx - bw / 2 + m * .03, top + bh); c.lineTo(cx + bw / 2 - m * .03, top + bh); c.lineTo(cx + bw / 2, top); c.stroke();
  // 配料依次落入：柠檬汁 / 蜂蜜 / 冰 + 标签
  const items = [
    { t0: .5, col: '#F5D76E', name: '柠檬汁 20ml', y: .35 },
    { t0: 2.8, col: '#E8A13C', name: '蜂蜜 15ml', y: .52 },
    { t0: 5.1, col: '#BFE3F2', name: '冰块 3 颗', y: .7 },
    { t0: 7.2, col: '#7FB8A2', name: '薄荷 2 片', y: .22 },
  ];
  items.forEach((it, i) => {
    const f = clamp((q - it.t0) / .8, 0, 1); if (f <= 0) return;
    const y = lerp(top - m * .12, top + bh * it.y, eOut(f));
    c.fillStyle = it.col;
    c.beginPath(); c.arc(cx, y, m * .032, 0, TAU); c.fill();
    if (f > .8) {
      const a = clamp((q - it.t0 - .8) / .5, 0, 1);
      c.fillStyle = hex('#E8EEF4', a); c.font = `500 ${m * .032}px ${SANS}`; c.textAlign = 'left';
      c.fillText(it.name, cx + bw * .7, y);
      c.strokeStyle = hex('#E8EEF4', a * .5); c.lineWidth = 1;
      c.beginPath(); c.moveTo(cx + m * .035, y); c.lineTo(cx + bw * .68, y); c.stroke();
    }
  });
  // 液面
  const lv = clamp(q / 9, 0, 1) * .8;
  c.fillStyle = hex('#F5D76E', .35); c.fillRect(cx - bw / 2 + m * .026, top + bh * (1 - lv), bw - m * .052, bh * lv - m * .012);
  c.fillStyle = '#E8EEF4'; c.font = `700 ${m * .05}px ${SANS}`; c.textAlign = 'center';
  c.fillText('一步步做，每一步都标名字和分量', w * .5, h * .16);
};

// ---- M23 ----
S.M23 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 12, act = Math.min(4, Math.floor(q / 2.4)), ph = (q % 2.4) / 2.4;
  const titles = ['一 · 问题', '二 · 它是什么', '三 · 怎么用', '四 · 真实例子', '五 · 结尾卡'];
  c.fillStyle = mixHex('#1B2028', '#233042', act / 4); c.fillRect(0, 0, w, h);
  const slide = eOut(clamp(ph * 2, 0, 1));
  c.save(); c.translate((1 - slide) * w * .12, 0); c.globalAlpha = slide;
  c.fillStyle = '#F2E9D2'; c.font = `900 ${m * .075}px ${SANS}`; c.textAlign = 'center';
  c.fillText(titles[act], w * .5, h * .18);
  const cx = w * .5, cy = h * .55;
  if (act === 0) { c.strokeStyle = '#F2E9D2'; c.lineWidth = m * .012; c.beginPath(); c.arc(cx, cy, m * .12, 0, TAU); c.stroke(); c.fillStyle = '#F2E9D2'; c.font = `900 ${m * .12}px ${SANS}`; c.fillText('?', cx, cy + m * .045); }
  else if (act === 1) { c.fillStyle = '#F2E9D2'; c.fillRect(cx - m * .28, cy - m * .12, m * .56, m * .24); c.fillStyle = '#1B2028'; c.font = `800 ${m * .06}px ${SANS}`; c.fillText('一句话说清楚', cx, cy + m * .022); }
  else if (act === 2) { for (let i = 0; i < 3; i++) { const e = eBack(clamp((ph - i * .12) * 3, 0, 1)); c.fillStyle = '#F2E9D2'; c.beginPath(); c.arc(cx + (i - 1) * m * .3, cy, m * .075 * e, 0, TAU); c.fill(); c.fillStyle = '#1B2028'; c.font = `800 ${m * .05}px ${SANS}`; if (e > .5) c.fillText(String(i + 1), cx + (i - 1) * m * .3, cy + m * .018); } }
  else if (act === 3) { c.fillStyle = '#F2E9D2'; c.fillRect(cx - m * .3, cy - m * .18, m * .6, m * .36); c.fillStyle = '#233042'; c.fillRect(cx - m * .27, cy - m * .15, m * .54, m * .22); c.fillStyle = '#F2E9D2'; c.font = `500 ${m * .035}px ${SANS}`; c.fillText('真实案例', cx, cy + m * .135); }
  else { const e = eBack(clamp(ph * 2.2, 0, 1)); c.scale(e, e); c.fillStyle = '#F2E9D2'; c.font = `900 ${m * .1}px ${SANS}`; c.fillText('频道名', cx, cy); c.fillStyle = '#FFD866'; c.fillRect(cx - m * .12, cy + m * .06, m * .24, m * .012); }
  c.restore();
};

// ---- M24 ----
S.M24 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 12, act = Math.min(3, Math.floor(q / 2.8));
  c.fillStyle = '#F7F5F0'; c.fillRect(0, 0, w, h);
  const e = eBack(clamp((q % 2.8) / .7, 0, 1));
  c.textAlign = 'center';
  if (act === 0) { // 大环境
    if (!s.init) { s.init = 1; const r = rng(31); s.dots = []; for (let i = 0; i < 40; i++) s.dots.push([r() * w, r() * h]); }
    c.fillStyle = '#C8D2DC'; s.dots.forEach(d => { c.beginPath(); c.arc(d[0] + Math.sin(t + d[1]) * m * .006, d[1] + Math.cos(t * .8 + d[0]) * m * .006, m * .008, 0, TAU); c.fill(); });
    c.fillStyle = '#1D2733'; c.font = `800 ${m * .06}px ${SANS}`; c.fillText('世界正在变快', w * .5, h * .5);
  } else if (act === 1) { // 痛点
    c.fillStyle = '#E2725B'; for (let i = 0; i < 3; i++) { const b = eBack(clamp((q % 2.8) / .6 - i * .15, 0, 1)); c.fillRect(w * .3, h * (.32 + i * .14), w * .4 * b, h * .07); }
    c.fillStyle = '#1D2733'; c.font = `800 ${m * .06}px ${SANS}`; c.fillText('而现在的工具很难用', w * .5, h * .85);
  } else if (act === 2) { // 解决
    c.save(); c.translate(w * .5, h * .5); c.scale(e, e);
    c.fillStyle = '#1D2733'; c.beginPath(); c.roundRect(-m * .3, -m * .16, m * .6, m * .32, m * .04); c.fill();
    c.fillStyle = '#7FD1AE'; c.fillRect(-m * .26, -m * .1, m * .3, m * .03); c.fillRect(-m * .26, -m * .03, m * .4, m * .03);
    c.fillStyle = '#fff'; c.font = `700 ${m * .045}px ${SANS}`; c.fillText('一个工具搞定', 0, m * .115);
    c.restore();
  } else { // 好处 + logo
    for (let i = 0; i < 3; i++) { const b = eBack(clamp((q % 2.8) / .6 - i * .15, 0, 1)); if (b <= 0) continue; c.fillStyle = '#2E8B6F'; c.beginPath(); c.arc(w * .35, h * (.3 + i * .14), m * .02 * b, 0, TAU); c.fill(); c.fillStyle = '#1D2733'; c.font = `600 ${m * .04}px ${SANS}`; c.textAlign = 'left'; c.fillText(['更省时间', '更少出错', '更有把握'][i], w * .39, h * (.31 + i * .14)); c.textAlign = 'center'; }
    const lg = eBack(clamp((q - 10.6) / .8, 0, 1)); if (lg > 0) { c.fillStyle = '#1D2733'; c.beginPath(); c.arc(w * .5, h * .82, m * .06 * lg, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.font = `800 ${m * .045}px ${SANS}`; c.fillText('LOGO', w * .5, h * .833); }
  }
};

// ---- M25 ----
S.M25 = (c, w, h, t, s) => {
  const m = Math.min(w, h), beat = .5, bt = t / beat;
  const lines = [['我', '走过', '很多', '路'], ['才', '学会', '慢慢', '来'], ['一', '步', '一', '步']];
  const li = Math.floor(bt / 4) % 3, wi = Math.floor(bt) % 4;
  const pop = eBack(clamp((bt % 1) * 2.5, 0, 1));
  // 背景踩点闪
  const pulse = (bt % 1) < .12 ? .12 : 0;
  c.fillStyle = mixHex('#141821', '#2A3350', pulse * 5); c.fillRect(0, 0, w, h);
  glowDot(c, w / 2, h / 2, m * .5, '#3D4E7A', .25 + pulse);
  // 歌词：一字一卡点跳出
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const row = lines[li], total = row.length;
  row.forEach((wd, i) => {
    const x = w * (.5 + (i - (total - 1) / 2) * .22);
    const active = i === wi;
    const sc = active ? .8 + .35 * pop : 1;
    c.save(); c.translate(x, h * .5); c.scale(sc, sc);
    c.fillStyle = active ? '#FFD866' : 'rgba(232,236,242,.55)';
    c.font = `900 ${m * .1}px ${SANS}`; c.fillText(wd, 0, 0);
    c.restore();
    if (active) { c.strokeStyle = hex('#FFD866', .5 * (1 - (bt % 1))); c.lineWidth = 2; c.strokeRect(x - m * .085, h * .5 - m * .075, m * .17, m * .15); }
  });
  c.fillStyle = 'rgba(232,236,242,.4)'; c.font = `400 ${m * .026}px ${MONO}`;
  c.fillText('♪ 踩着 120 BPM 的拍点', w * .5, h * .85);
};

// ---- M26 ----
S.M26 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 8;
  const amp = (x) => Math.abs(Math.sin(x * 1.1) * .5 + Math.sin(x * 2.7) * .3 + Math.sin(x * .43) * .2); // 伪音频包络
  const A = amp(t * 2.2), beat = Math.pow(amp(Math.floor(t * 2) / 2 * 2.2), 3);
  c.fillStyle = '#0A0C12'; c.fillRect(0, 0, w, h);
  glowDot(c, w / 2, h / 2, m * (.32 + A * .12), '#2E6B8A', .4 + A * .3);
  // 同心圆频谱
  const cx = w / 2, cy = h * .52, R = m * .17;
  for (let ring = 0; ring < 3; ring++) {
    c.strokeStyle = hex('#7FD1FF', .12 + .1 * (2 - ring));
    c.lineWidth = m * .004;
    c.beginPath(); c.arc(cx, cy, R * (1 + ring * .4) + beat * m * .02, 0, TAU); c.stroke();
  }
  // 频谱柱（围绕圆）
  for (let i = 0; i < 36; i++) {
    const a = i / 36 * TAU, v = amp(t * 2.2 + i * .7) * (0.35 + A);
    const r0 = R * .78, r1 = r0 + m * .05 + v * m * .12;
    c.strokeStyle = hex(i % 3 === 0 ? '#FFD866' : '#7FD1FF', .85);
    c.lineWidth = m * .011; c.lineCap = 'round';
    c.beginPath(); c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); c.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); c.stroke();
  }
  // 重音冲击圈
  const bp = (t * 2) % 1;
  if (beat > .32) { c.strokeStyle = hex('#FFD866', (1 - bp) * .6); c.lineWidth = m * .008; c.beginPath(); c.arc(cx, cy, R * (1 + bp * 1.6), 0, TAU); c.stroke(); }
  // 底部波形线
  c.strokeStyle = hex('#7FD1FF', .8); c.lineWidth = m * .008; c.beginPath();
  for (let x = 0; x <= w; x += w / 90) {
    const y = h * .84 + Math.sin(x / w * 14 + t * 5) * amp(t * 2.2 + x / w * 5) * h * .07;
    x ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.stroke();
  c.fillStyle = hex('#7FD1FF', .45); c.textAlign = 'center'; c.font = `400 ${m * .026}px ${MONO}`;
  c.fillText('volume ' + (0.35 + A * 0.6).toFixed(2), w / 2, h * .95);
};

// ---- M27 ----
S.M27 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 20;
  if (!s.init) { s.init = 1; const r = rng(17); s.rain = []; for (let i = 0; i < 60; i++) s.rain.push([r() * w, r() * h, .5 + r()]); }
  // 无对白：一扇窗、雨、一杯咖啡，光线慢慢变暖
  const warm = clamp((q - 8) / 8, 0, 1);
  c.fillStyle = mixHex('#20262E', '#3A2E28', warm); c.fillRect(0, 0, w, h);
  // 窗
  const wx = w * .2, wy = h * .16, ww = w * .6, wh = h * .56;
  c.fillStyle = mixHex('#3E4E60', '#6A4E3C', warm); c.fillRect(wx, wy, ww, wh);
  c.strokeStyle = '#171B21'; c.lineWidth = m * .02;
  c.strokeRect(wx, wy, ww, wh);
  c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.moveTo(wx, wy + wh / 2); c.lineTo(wx + ww, wy + wh / 2); c.stroke();
  // 雨
  c.strokeStyle = 'rgba(190,215,235,.5)'; c.lineWidth = 1.2;
  s.rain.forEach(r => {
    const y = (r[1] + t * r[2] * .35) % 1;
    c.beginPath(); c.moveTo(wx + r[0] % ww, wy + y * wh); c.lineTo(wx + r[0] % ww - m * .01, wy + y * wh + m * .05); c.stroke();
  });
  // 咖啡与暖光
  glowDot(c, w * .5, h * .84, m * .16 + Math.sin(t) * m * .008, '#FFB25E', .25 + warm * .45);
  c.fillStyle = '#E8DCC8'; c.fillRect(w * .46, h * .76, m * .14, m * .1);
  c.beginPath(); c.arc(w * .62, h * .81, m * .035, -Math.PI / 2, Math.PI / 2); c.stroke();
  // 蒸汽
  for (let i = 0; i < 3; i++) { const y = h * .74 - ((t * .1 + i * .33) % 1) * h * .12; c.fillStyle = hex('#E8DCC8', .3 * (1 - ((t * .1 + i * .33) % 1))); c.beginPath(); c.arc(w * (.5 + i * .03), y, m * .012, 0, TAU); c.fill(); }
  // 字幕（声音讲一半）
  if (q > 4 && q < 16) { c.fillStyle = hex('#F2E9D2', .8); c.font = `500 ${m * .035}px ${SANS}`; c.textAlign = 'center'; c.fillText('（雨声）', w * .5, h * .95); }
};

// ---- M28 ----
S.M28 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  // 对称暖色：火车窗 + 四季流过
  const season = (t * .08) % 4;
  const cols = [['#A8C686', '#F2E8C9'], ['#E8B84B', '#F5D9A0'], ['#C97B4B', '#EFD3B0'], ['#BFD5E8', '#E8EFF5']];
  const i0 = Math.floor(season), i1 = (i0 + 1) % 4, f = season - i0;
  const sky = mixHex(cols[i0][1], cols[i1][1], f), hill = mixHex(cols[i0][0], cols[i1][0], f);
  c.fillStyle = '#E9D9C3'; c.fillRect(0, 0, w, h);   // 车厢内壁
  // 窗（严格左右对称）
  const ww = m * .9, wh = m * .52, wx = w / 2 - ww / 2, wy = h * .2;
  c.fillStyle = sky; c.fillRect(wx, wy, ww, wh);
  // 山丘流过（视差）
  for (let k = 0; k < 3; k++) {
    c.fillStyle = hex(hill, .4 + k * .3);
    c.beginPath(); c.moveTo(wx, wy + wh);
    for (let x = 0; x <= 20; x++) {
      const xx = wx + x / 20 * ww, ph = x / 20 * TAU * 1.5 + t * (.25 + k * .18);
      c.lineTo(xx, wy + wh * (.62 - k * .12) + Math.sin(ph) * wh * .1);
    }
    c.lineTo(wx + ww, wy + wh); c.closePath(); c.fill();
  }
  c.strokeStyle = '#B98A5E'; c.lineWidth = m * .02; c.strokeRect(wx, wy, ww, wh);
  // 对称的咖啡杯（前景）
  c.fillStyle = '#F5EFE4'; c.fillRect(w / 2 - m * .07, h * .76, m * .14, m * .1);
  c.strokeStyle = '#B98A5E'; c.lineWidth = m * .008;
  c.beginPath(); c.arc(w / 2 + m * .085, h * .81, m * .032, -Math.PI / 2, Math.PI / 2); c.stroke();
  // 台面反光
  c.fillStyle = 'rgba(255,245,225,.35)'; c.fillRect(0, h * .88, w, h * .12);
};

// ---- M29 ----
S.M29 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 14;
  // 日落海面：紫云、反光、慢慢飞的镜头
  const sky = c.createLinearGradient(0, 0, 0, h * .62);
  sky.addColorStop(0, '#2E2140'); sky.addColorStop(.55, '#8A4A6B'); sky.addColorStop(1, '#F2A65A');
  c.fillStyle = sky; c.fillRect(0, 0, w, h * .62);
  // 太阳
  const sunY = h * (.46 + .08 * Math.sin(t * .1));
  glowDot(c, w * .5 + Math.sin(t * .07) * m * .1, sunY, m * .16, '#FFD8A0', .95);
  // 积云（缓慢横漂）
  if (!s.init) { s.init = 1; const r = rng(23); s.cl = []; for (let i = 0; i < 7; i++) s.cl.push([r() * w, h * (.12 + r() * .3), .5 + r() * .8, r()]); }
  s.cl.forEach(cl => {
    const x = ((cl[0] + t * cl[2] * 12) % (w + m * .5)) - m * .25;
    c.fillStyle = hex('#6B4A78', .8);
    for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(x + k * m * .07, cl[1] + Math.sin(k * 2 + cl[3] * 9) * m * .012, m * .06, m * .032, 0, 0, TAU); c.fill(); }
  });
  // 海面
  const sea = c.createLinearGradient(0, h * .62, 0, h);
  sea.addColorStop(0, '#B06A5A'); sea.addColorStop(1, '#2E2140');
  c.fillStyle = sea; c.fillRect(0, h * .62, w, h * .38);
  // 反光带（闪烁）
  for (let i = 0; i < 26; i++) {
    const y = h * .64 + i * h * .013, spread = (i / 26) * m * .32 + m * .02;
    c.fillStyle = hex('#FFD8A0', .5 * (1 - i / 26) * (.6 + .4 * Math.sin(t * 3 + i)));
    c.fillRect(w * .5 - spread / 2 + Math.sin(t * 1.5 + i * 2) * m * .02, y, spread, m * .006);
  }
  // 一句话
  const a = clamp((q - 2) / 1.5, 0, 1) * (q > 11 ? (14 - q) / 3 : 1);
  c.fillStyle = hex('#FFEFD8', a * .95); c.font = `500 ${m * .055}px ${SANS}`; c.textAlign = 'center';
  c.fillText('今天的风，有点温柔', w * .5, h * .2);
};

// ---- M30 ----
S.M30 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 16;
  // 东方意境：月夜江水楼阁
  const sky = c.createLinearGradient(0, 0, 0, h * .7);
  sky.addColorStop(0, '#0B1220'); sky.addColorStop(1, '#243447');
  c.fillStyle = sky; c.fillRect(0, 0, w, h * .7);
  glowDot(c, w * .72, h * .2, m * .1, '#F2E9D2', .95);
  glowDot(c, w * .72, h * .2, m * .22, '#8FA8C8', .18);
  // 远山
  for (let k = 0; k < 3; k++) {
    c.fillStyle = hex('#16202E', .5 + k * .2);
    c.beginPath(); c.moveTo(0, h * .7);
    for (let x = 0; x <= 16; x++) c.lineTo(x / 16 * w, h * (.52 + k * .06) + Math.sin(x / 16 * TAU * 1.2 + k * 2) * h * .05);
    c.lineTo(w, h * .7); c.closePath(); c.fill();
  }
  // 楼阁剪影
  const px = w * .24, py = h * .62;
  c.fillStyle = '#0A0F16';
  c.fillRect(px - m * .06, py - m * .12, m * .12, m * .12);
  c.beginPath(); c.moveTo(px - m * .11, py - m * .12); c.lineTo(px, py - m * .21); c.lineTo(px + m * .11, py - m * .12); c.closePath(); c.fill();
  c.fillRect(px - m * .025, py - m * .26, m * .05, m * .05);
  // 江水（月影闪烁）
  c.fillStyle = '#14202E'; c.fillRect(0, h * .7, w, h * .3);
  for (let i = 0; i < 18; i++) {
    const y = h * .72 + i * h * .014;
    c.fillStyle = hex('#CFE0F2', .16 + .1 * Math.sin(t * 2 + i * 1.7));
    c.fillRect(w * .72 - (m * .06 + i * m * .012) / 2 + Math.sin(t * 1.2 + i) * m * .015, y, m * .06 + i * m * .012, m * .005);
  }
  // 小舟
  const bx = w * (.15 + .25 * ((q / 16) % 1));
  c.fillStyle = '#0A0F16'; c.beginPath(); c.moveTo(bx - m * .045, h * .8); c.lineTo(bx + m * .045, h * .8); c.lineTo(bx + m * .028, h * .816); c.lineTo(bx - m * .028, h * .816); c.closePath(); c.fill();
  // 诗句
  const a = clamp((q - 3) / 2, 0, 1);
  c.fillStyle = hex('#E8E0CC', a * .9); c.font = `500 ${m * .05}px ${SANS}`; c.textAlign = 'left';
  c.fillText('月落乌啼霜满天', w * .08, h * .18);
};

// ---- M31 ----
S.M31 = (c, w, h, t, s) => {
  const m = Math.min(w, h), fr = Math.floor(t * 12) / 12; // 12fps 定格
  if (!s.init) { s.init = 1; const r = rng(29); s.tex = []; for (let i = 0; i < 90; i++) s.tex.push([r(), r(), r()]); }
  c.fillStyle = '#F2D9C4'; c.fillRect(0, 0, w, h);
  // 粘土台面
  c.fillStyle = '#D9A084'; c.fillRect(0, h * .68, w, h * .32);
  // 粘土小人（一帧一顿）
  const bob = Math.sin(fr * 6) * m * .02, cx = w * .5, base = h * .68;
  const clay = (x, y, r2, col) => {
    c.fillStyle = col; c.beginPath(); c.arc(x, y, r2, 0, TAU); c.fill();
    // 指印纹理
    s.tex.forEach(tp => { const dx = (tp[0] - .5) * r2 * 1.7, dy = (tp[1] - .5) * r2 * 1.7; if (dx * dx + dy * dy < r2 * r2) { c.fillStyle = hex('#00000018', .5); c.beginPath(); c.arc(x + dx, y + dy, r2 * .08, 0, TAU); c.fill(); } });
  };
  clay(cx, base - m * .22 + bob, m * .11, '#E2725B');   // 头
  clay(cx, base - m * .02 + bob, m * .13, '#C96A50');   // 身
  clay(cx - m * .15, base - m * .06 + bob, m * .055, '#E2725B'); // 手
  clay(cx + m * .15, base - m * .06 + bob, m * .055, '#E2725B');
  // 表情
  c.fillStyle = '#3A241C';
  c.beginPath(); c.arc(cx - m * .04, base - m * .24 + bob, m * .012, 0, TAU); c.fill();
  c.beginPath(); c.arc(cx + m * .04, base - m * .24 + bob, m * .012, 0, TAU); c.fill();
  c.beginPath(); c.arc(cx, base - m * .19 + bob, m * .02, 0, Math.PI); c.stroke();
  // 踩点的心
  const beat = (t * 2) % 1;
  if (beat < .25) { const e = eBack(beat / .25); c.fillStyle = hex('#D94F6B', .8 * (1 - beat * 3)); c.font = `900 ${m * .07 * e}px ${SANS}`; c.textAlign = 'center'; c.fillText('♥', cx + m * .22, base - m * .3); }
};

// ---- M32 ----
S.M32 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  // 竖屏 9:16 快节奏 POV（内容画在中间竖条里）
  const pw = Math.min(w * .92, h * 9 / 16 * .92), phh = pw * 16 / 9;
  c.fillStyle = '#0B0B0E'; c.fillRect(0, 0, w, h);
  c.save(); c.beginPath(); c.rect(w / 2 - pw / 2, h / 2 - phh / 2, pw, phh); c.clip();
  const shot = Math.floor(t * 2) % 4, f = (t * 2) % 1, z = 1 + .12 * (1 - f); // 每0.5s一刀，刀刀推近
  c.save(); c.translate(w / 2, h / 2); c.scale(z, z); c.translate(-w / 2, -h / 2);
  const bx = w / 2 - pw / 2, by = h / 2 - phh / 2;
  if (shot === 0) { c.fillStyle = '#FF6B35'; c.fillRect(bx, by, pw, phh); c.fillStyle = '#fff'; c.font = `900 ${pw * .12}px ${SANS}`; c.textAlign = 'center'; c.fillText('出发!', w / 2, h / 2); }
  else if (shot === 1) { c.fillStyle = '#12263A'; c.fillRect(bx, by, pw, phh); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = pw * .012; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t * 6; c.beginPath(); c.moveTo(w / 2, h / 2); c.lineTo(w / 2 + Math.cos(a) * pw, h / 2 + Math.sin(a) * pw); c.stroke(); } }
  else if (shot === 2) { c.fillStyle = '#F5EFE0'; c.fillRect(bx, by, pw, phh); c.fillStyle = '#0B0B0E'; c.font = `900 ${pw * .1}px ${SANS}`; c.textAlign = 'center'; c.fillText('跟上节奏', w / 2, h / 2); }
  else { c.fillStyle = '#241528'; c.fillRect(bx, by, pw, phh); c.fillStyle = '#FFD866'; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t * 2; c.fillRect(w / 2 + Math.cos(a) * pw * .3 - pw * .03, h / 2 + Math.sin(a) * pw * .3 - pw * .03, pw * .06, pw * .06); } }
  c.restore();
  // POV 手
  c.fillStyle = '#E8B088'; c.beginPath(); c.ellipse(w / 2, h / 2 + phh * .42, pw * .16, pw * .1, 0, 0, TAU); c.fill();
  c.restore();
  // 画幅说明
  c.fillStyle = 'rgba(255,255,255,.35)'; c.font = `400 ${m * .022}px ${MONO}`; c.textAlign = 'center';
  c.fillText('9:16 · 快切 · POV', w / 2, h * .96);
};

// ---- M33 ----
S.M33 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 16, stage = q / 16;
  c.fillStyle = '#05070C'; c.fillRect(0, 0, w, h);
  // 连续拉远：点 → 房间 → 城市 → 地球 → 星空 → 点
  const zoom = Math.exp(Math.sin((stage - .25) * Math.PI) * 3.2); // 0.04→25→0.04
  if (!s.init) { s.init = 1; const r = rng(41); s.stars = []; for (let i = 0; i < 90; i++) s.stars.push([r(), r(), r()]); }
  s.stars.forEach(st => { if (zoom < .6) { c.fillStyle = hex('#FFFFFF', .4 + st[2] * .6); c.fillRect(st[0] * w, st[1] * h, m * .006, m * .006); } });
  c.save(); c.translate(w / 2, h / 2); c.scale(zoom, zoom); c.translate(-w / 2, -h / 2);
  // 地球
  if (zoom < 3) {
    const g = c.createRadialGradient(w * .42, h * .38, m * .02, w * .5, h * .5, m * .3);
    g.addColorStop(0, '#6FA8DC'); g.addColorStop(1, '#1B3A6B');
    c.fillStyle = g; c.beginPath(); c.arc(w / 2, h / 2, m * .28, 0, TAU); c.fill();
    c.fillStyle = 'rgba(120,190,140,.7)';
    c.beginPath(); c.ellipse(w * .42, h * .42, m * .1, m * .07, .5, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(w * .58, h * .58, m * .12, m * .06, -.4, 0, TAU); c.fill();
  }
  // 城市网格（中景）
  if (zoom > .25 && zoom < 12) {
    c.strokeStyle = 'rgba(255,216,120,.55)'; c.lineWidth = m * .004;
    for (let i = -6; i <= 6; i++) {
      c.beginPath(); c.moveTo(w / 2 + i * m * .09, h / 2 - m * .5); c.lineTo(w / 2 + i * m * .09, h / 2 + m * .5); c.stroke();
      c.beginPath(); c.moveTo(w / 2 - m * .5, h / 2 + i * m * .09); c.lineTo(w / 2 + m * .5, h / 2 + i * m * .09); c.stroke();
    }
  }
  // 房间（近景）与中心的点
  if (zoom > 2) {
    c.fillStyle = '#20262E'; c.fillRect(w / 2 - m * .18, h / 2 - m * .12, m * .36, m * .24);
    c.fillStyle = '#FFD866'; c.fillRect(w / 2 - m * .14, h / 2 - m * .07, m * .12, m * .02);
    c.fillRect(w / 2 - m * .14, h / 2 - m * .02, m * .2, m * .02);
    c.fillStyle = '#FF6B35'; c.beginPath(); c.arc(w / 2 + m * .1, h / 2 + m * .04, m * .03, 0, TAU); c.fill();
  }
  c.restore();
  // 最外层的点
  if (zoom < .18) { c.fillStyle = '#FF6B35'; c.beginPath(); c.arc(w / 2, h / 2, m * .012, 0, TAU); c.fill(); }
  const a = clamp((q - 12) / 2, 0, 1);
  c.fillStyle = hex('#E8E3D6', a * .9); c.font = `500 ${m * .05}px ${SANS}`; c.textAlign = 'center';
  c.fillText('从一个点，到整个宇宙', w * .5, h * .9);
};

// ---- M34 ----
S.M34 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 12, item = Math.min(2, Math.floor(q / 4)), f = (q % 4) / 4;
  c.fillStyle = '#10202F'; c.fillRect(0, 0, w, h);
  // 演播室背景格
  c.fillStyle = 'rgba(255,255,255,.04)';
  for (let x = 0; x < w; x += m * .09) for (let y = 0; y < h; y += m * .09) c.fillRect(x, y, m * .04, m * .04);
  const news = [
    ['01', '新工具上线', '一句话就能生成整段动画'],
    ['02', '价格更亲民', '个人创作者也用得起'],
    ['03', '上手变简单', '不用写代码也能开始'],
  ];
  // 下三分之一新闻条（滑入）
  const slide = eOut(clamp(f * 3, 0, 1));
  const y0 = h * .62;
  c.fillStyle = '#E8EEF4'; c.fillRect((1 - slide) * -w, y0, w * .72, h * .16);
  c.fillStyle = '#D64545'; c.fillRect((1 - slide) * -w, y0, w * .12, h * .16);
  c.fillStyle = '#fff'; c.font = `900 ${m * .055}px ${MONO}`; c.textAlign = 'center';
  c.fillText(news[item][0], (1 - slide) * -w + w * .06, y0 + h * .1);
  c.fillStyle = '#10202F'; c.font = `800 ${m * .055}px ${SANS}`; c.textAlign = 'left';
  c.fillText(news[item][1], (1 - slide) * -w + w * .15, y0 + h * .075);
  c.fillStyle = '#3A4A5A'; c.font = `400 ${m * .035}px ${SANS}`;
  c.fillText(news[item][2], (1 - slide) * -w + w * .15, y0 + h * .135);
  // 跑马灯
  c.fillStyle = '#D64545'; c.fillRect(0, h * .92, w, h * .08);
  c.fillStyle = '#fff'; c.font = `500 ${m * .032}px ${SANS}`; c.textAlign = 'left';
  const tick = '新东西一条条说清楚 · 普通用户视角 · 每条只讲有意思在哪 · ';
  const tw = c.measureText(tick).width;
  for (let i = 0; i < 3; i++) c.fillText(tick, ((i * tw - t * 60) % (tw * 3)) - tw, h * .972);
};

// ---- M35 ----
S.M35 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 12, act = Math.floor(q / 4), ph = (q % 4) / 4;
  c.fillStyle = '#F7F6F2'; c.fillRect(0, 0, w, h);
  // 网格
  c.strokeStyle = 'rgba(40,50,60,.1)'; c.lineWidth = 1;
  for (let x = w * .1; x < w * .92; x += w * .1) { c.beginPath(); c.moveTo(x, h * .16); c.lineTo(x, h * .78); c.stroke(); }
  for (let y = h * .16; y < h * .8; y += h * .12) { c.beginPath(); c.moveTo(w * .1, y); c.lineTo(w * .9, y); c.stroke(); }
  c.fillStyle = '#28323C'; c.textAlign = 'left'; c.font = `700 ${m * .05}px ${SANS}`;
  c.fillText(['用户增长 · 月度', '渠道占比', '留存曲线'][act], w * .1, h * .12);
  if (act === 0) {
    const vals = [.35, .52, .46, .68, .82, .95];
    vals.forEach((v, i) => {
      const e = eOut(clamp(ph * 1.6 - i * .12, 0, 1));
      const bh = h * .5 * v * e, x = w * (.16 + i * .125);
      c.fillStyle = i === vals.length - 1 ? '#E2725B' : '#3B6FA8';
      c.fillRect(x, h * .76 - bh, w * .08, bh);
      c.fillStyle = '#28323C'; c.textAlign = 'center'; c.font = `600 ${m * .032}px ${MONO}`;
      if (e > .3) c.fillText(Math.round(v * 12000 * e), x + w * .04, h * .74 - bh);
    });
    c.fillStyle = '#28323C'; c.textAlign = 'right'; c.font = `400 ${m * .026}px ${MONO}`; c.fillText('单位：人', w * .9, h * .84);
  } else if (act === 1) {
    const cx = w * .42, cy = h * .46, R = m * .2;
    const segs = [[.45, '#3B6FA8'], [.3, '#E2725B'], [.15, '#E8B04B'], [.1, '#8FA8B8']];
    let a0 = -Math.PI / 2;
    segs.forEach((sg, i) => {
      const sweep = clamp(ph * 1.5 - i * .1, 0, 1) * sg[0] * TAU;
      c.fillStyle = sg[1]; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, a0, a0 + sweep); c.closePath(); c.fill();
      a0 += sg[0] * TAU;
    });
    c.fillStyle = '#F7F6F2'; c.beginPath(); c.arc(cx, cy, R * .55, 0, TAU); c.fill();
    c.fillStyle = '#28323C'; c.textAlign = 'center'; c.font = `700 ${m * .05}px ${MONO}`;
    c.fillText(Math.round(clamp(ph * 1.5, 0, 1) * 100) + '%', cx, cy + m * .018);
    segs.forEach((sg, i) => { c.fillStyle = sg[1]; c.fillRect(w * .68, h * (.3 + i * .11), m * .03, m * .03); c.fillStyle = '#28323C'; c.textAlign = 'left'; c.font = `500 ${m * .032}px ${SANS}`; c.fillText(['自然流量', '内容推荐', '老用户', '其他'][i] + ' ' + Math.round(sg[0] * 100) + '%', w * .71, h * (.325 + i * .11)); });
  } else {
    const draw = clamp(ph * 1.3, 0, 1);
    c.strokeStyle = '#3B6FA8'; c.lineWidth = m * .012; c.beginPath();
    for (let i = 0; i <= 60 * draw; i++) {
      const k = i / 60, x = w * .12 + k * w * .74, y = h * .7 - (Math.exp(-k * 2.2) * .8 + .12) * h * .44 * (1 + Math.sin(k * 9) * .05);
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
    const kx = draw, px = w * .12 + kx * w * .74, py = h * .7 - (Math.exp(-kx * 2.2) * .8 + .12) * h * .44 * (1 + Math.sin(kx * 9) * .05);
    glowDot(c, px, py, m * .03, '#E2725B', .9);
    c.fillStyle = '#28323C'; c.textAlign = 'right'; c.font = `600 ${m * .032}px ${MONO}`;
    c.fillText('30 日留存 ' + (12 + draw * 18).toFixed(1) + '%', w * .88, py - m * .05);
  }
  // 结论条
  c.fillStyle = '#28323C'; c.textAlign = 'left'; c.font = `500 ${m * .032}px ${SANS}`;
  c.fillText('结论：' + ['增长来自内容推荐', '自然流量接近一半', '前 7 天是关键窗口'][act], w * .1, h * .92);
};

// ---- M36 ----
S.M36 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 3.2, f = clamp(q / 2, 0, 1);
  c.fillStyle = '#EDE6D6'; c.fillRect(0, 0, w, h);
  // 海报框
  const pw = m * .62, ph = m * .82, px = w / 2 - pw / 2, py = h / 2 - ph / 2;
  const shake = q > .7 && q < 1.5 ? Math.sin(q * 40) * m * .006 : 0;
  c.save(); c.translate(shake, 0);
  c.fillStyle = '#1D2733'; c.fillRect(px, py, pw, ph);
  c.strokeStyle = '#E8E3D6'; c.lineWidth = m * .008; c.strokeRect(px, py, pw, ph);
  // 海报里的标题
  c.fillStyle = '#E8E3D6'; c.font = `900 ${m * .06}px ${SANS}`; c.textAlign = 'center';
  c.fillText('冲出去', w / 2, py + ph * .18);
  // 冲出边框的东西（火箭/鸟形），带残影
  const ex = lerp(w / 2, w / 2 + m * .55, eOut(f)), ey = lerp(h * .62, h * .3, eOut(f));
  for (let k = 4; k >= 0; k--) {
    const t2 = clamp(f - k * .06, 0, 1);
    const x = lerp(w / 2, w / 2 + m * .55, eOut(t2)), y = lerp(h * .62, h * .3, eOut(t2));
    c.fillStyle = hex('#FF6B35', k === 0 ? 1 : .12 * (4 - k));
    c.save(); c.translate(x, y); c.rotate(-.6);
    c.beginPath(); c.moveTo(0, -m * .06); c.lineTo(m * .045, m * .05); c.lineTo(-m * .045, m * .05); c.closePath(); c.fill();
    c.restore();
  }
  c.restore();
  // 破框标记
  if (f > .5) { c.strokeStyle = hex('#FF6B35', .8); c.lineWidth = m * .006; c.setLineDash([m * .02, m * .012]); c.strokeRect(px - m * .02, py - m * .02, pw + m * .04, ph + m * .04); c.setLineDash([]); }
};

// ---- M37 ----
S.M37 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 10, f = eOut(clamp(q / 3.2, 0, 1));
  c.fillStyle = '#101418'; c.fillRect(0, 0, w, h);
  if (!s.init) { s.init = 1; const r = rng(53); s.frags = []; for (let i = 0; i < 26; i++) s.frags.push({ a: r() * TAU, d: .5 + r() * .8, rot: r() * TAU, sz: .02 + r() * .035 }); }
  const cx = w / 2, cy = h / 2, R = m * .17;
  // 碎片聚拢拼成六边形 logo
  s.frags.forEach((fg, i) => {
    const ang = i / s.frags.length * TAU;
    const tx = cx + Math.cos(ang) * R * .62, ty = cy + Math.sin(ang) * R * .62;
    const x = lerp(cx + Math.cos(fg.a) * m * .7 * fg.d, tx, f), y = lerp(cy + Math.sin(fg.a) * m * .7 * fg.d, ty, f);
    c.save(); c.translate(x, y); c.rotate(lerp(fg.rot, 0, f));
    c.fillStyle = mixHex('#3E5C8A', '#7FD1AE', f);
    c.fillRect(-m * fg.sz / 2, -m * fg.sz / 2, m * fg.sz, m * fg.sz); c.restore();
  });
  // 中心 logo 形（拼好后亮起）
  if (f > .85) {
    const glow = .5 + .5 * Math.sin(t * 2);
    c.strokeStyle = hex('#7FD1AE', .5 + glow * .4); c.lineWidth = m * .012;
    c.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU - Math.PI / 2; const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); c.stroke();
    c.fillStyle = '#E8E3D6'; c.font = `900 ${m * .09}px ${SANS}`; c.textAlign = 'center'; c.fillText('LOGO', cx, cy + m * .032);
    glowDot(c, cx, cy, m * .3 * glow, '#7FD1AE', .12);
  }
};

// ---- M38 ----
S.M38 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 12, stage = Math.floor(q / 2.4), f = q % 2.4;
  const k = eOut(clamp((f - .2) / 1.0, 0, 1)); // 鼠标点击触发的弹簧变化
  const cx = w / 2, cy = h * .46;
  c.fillStyle = '#F4F1EA'; c.fillRect(0, 0, w, h);
  // 同一个形状：按钮→加载圈→播放器→滑块→开关
  const cols = ['#3B82F6', '#7FD1AE', '#FF6B35', '#8B5CF6', '#E2725B'];
  c.save(); c.translate(cx, cy); c.scale(1 + .06 * (1 - k), 1 - .06 * (1 - k));
  const col = cols[stage];
  if (stage === 0) { c.fillStyle = col; c.beginPath(); c.roundRect(-m * .18, -m * .07, m * .36, m * .14, m * .07); c.fill(); c.fillStyle = '#fff'; c.font = `700 ${m * .045}px ${SANS}`; c.textAlign = 'center'; c.fillText('按钮', 0, m * .016); }
  else if (stage === 1) { c.strokeStyle = col; c.lineWidth = m * .022; c.beginPath(); c.arc(0, 0, m * .11, t * 2, t * 2 + Math.PI * 1.4); c.stroke(); }
  else if (stage === 2) { c.fillStyle = col; c.beginPath(); c.roundRect(-m * .2, -m * .12, m * .4, m * .24, m * .03); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-m * .03, -m * .05); c.lineTo(m * .06, 0); c.lineTo(-m * .03, m * .05); c.closePath(); c.fill(); }
  else if (stage === 3) { c.fillStyle = hex(col, .25); c.beginPath(); c.roundRect(-m * .22, -m * .015, m * .44, m * .03, m * .015); c.fill(); c.fillStyle = col; c.beginPath(); c.roundRect(-m * .22, -m * .015, m * .2 + m * .22 * k, m * .03, m * .015); c.fill(); c.beginPath(); c.arc(-m * .02 + m * .42 * k, 0, m * .028, 0, TAU); c.fill(); }
  else { c.fillStyle = col; c.beginPath(); c.roundRect(-m * .14, -m * .06, m * .28, m * .12, m * .06); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(m * .07 - m * .14 * (1 - k), 0, m * .045, 0, TAU); c.fill(); }
  c.restore();
  // 鼠标指针（真的点了一下）
  const click = f < .25;
  const mx = cx + m * .18, my = cy + m * .14;
  c.fillStyle = '#1D2733'; c.save(); c.translate(mx, my); c.scale(click ? .85 : 1, click ? .85 : 1);
  c.beginPath(); c.moveTo(0, 0); c.lineTo(0, m * .06); c.lineTo(m * .018, m * .045); c.lineTo(m * .03, m * .07); c.lineTo(m * .042, m * .062); c.lineTo(m * .03, m * .038); c.lineTo(m * .05, m * .036); c.closePath(); c.fill(); c.restore();
  if (click) { c.strokeStyle = hex('#1D2733', .5); c.lineWidth = 2; c.beginPath(); c.arc(mx, my, m * .05, 0, TAU); c.stroke(); }
  c.fillStyle = 'rgba(29,39,51,.55)'; c.font = `400 ${m * .03}px ${MONO}`; c.textAlign = 'center';
  c.fillText('一个形状变到底 · 最后一帧 = 第一帧', w / 2, h * .85);
};

// ---- M39 ----
S.M39 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 12;
  const openK = eOut(clamp(q / 1.5, 0, 1)) * (q < 10.5 ? 1 : eOut(clamp((12 - q) / 1.5, 0, 1)));
  c.fillStyle = '#1A0F12'; c.fillRect(0, 0, w, h);
  // 舞台地板（透视）
  c.fillStyle = '#3A2420'; c.beginPath(); c.moveTo(0, h * .78); c.lineTo(w, h * .78); c.lineTo(w, h); c.lineTo(0, h); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(255,220,180,.12)'; c.lineWidth = 2;
  for (let i = -4; i <= 4; i++) { c.beginPath(); c.moveTo(w / 2 + i * w * .06, h * .78); c.lineTo(w / 2 + i * w * .18, h); c.stroke(); }
  // 追光（跟着主角）
  const ax = w * (.3 + .4 * (Math.sin(t * .5) * .5 + .5)), ay = h * .62;
  const lg = c.createRadialGradient(ax, ay - h * .1, m * .04, ax, ay, m * .5);
  lg.addColorStop(0, 'rgba(255,235,190,.5)'); lg.addColorStop(1, 'rgba(255,235,190,0)');
  c.fillStyle = lg; c.beginPath(); c.moveTo(ax, h * .02); c.lineTo(ax - m * .3, h * .95); c.lineTo(ax + m * .3, h * .95); c.closePath(); c.fill();
  glowDot(c, ax, ay - h * .05, m * .18, '#FFE9B8', .35);
  // 主角（亮相式走位，有定格）
  const pose = Math.sin(t * 1.4);
  c.fillStyle = '#120B0D';
  c.beginPath(); c.arc(ax, ay - m * .18, m * .055, 0, TAU); c.fill();
  c.fillRect(ax - m * .035, ay - m * .13, m * .07, m * .15);
  c.save(); c.translate(ax, ay - m * .11); c.rotate(pose * .25);
  c.fillRect(-m * .095, -m * .012, m * .08, m * .026); c.restore();
  c.save(); c.translate(ax, ay - m * .11); c.rotate(-pose * .25);
  c.fillRect(m * .015, -m * .012, m * .08, m * .026); c.restore();
  c.fillRect(ax - m * .03, ay + m * .01, m * .024, m * .11); c.fillRect(ax + m * .006, ay + m * .01, m * .024, m * .11);
  // 暗处的配角（景片）
  c.fillStyle = '#241417';
  c.beginPath(); c.moveTo(w * .06, h * .78); c.lineTo(w * .13, h * .42); c.lineTo(w * .2, h * .78); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(w * .8, h * .78); c.lineTo(w * .87, h * .46); c.lineTo(w * .94, h * .78); c.closePath(); c.fill();
  // 幕布（开合）
  const cw = w * .5 * (1 - openK);
  const curtain = (x, dir) => {
    c.fillStyle = '#7A1E22';
    c.fillRect(x, 0, cw, h);
    c.fillStyle = 'rgba(0,0,0,.18)';
    for (let i = 0; i < 6; i++) c.fillRect(x + cw * (i / 6) + Math.sin(t * .4 + i) * m * .004, 0, cw * .05, h);
    c.fillStyle = '#8C2A24'; c.fillRect(x, 0, cw, h * .06);
    return cw;
  };
  if (cw > 1) { curtain(0, 1); curtain(w - cw, -1); }
  // 幕间字幕
  if (q > 10.5 || q < 1.5) { c.fillStyle = hex('#E8D8B8', .85); c.textAlign = 'center'; c.font = `500 ${m * .04}px ${SANS}`; c.fillText('—— 第一幕 · 亮相 ——', w / 2, h * .5); }
};

// ---- M40 ----
S.M40 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 10, explode = eOut(clamp((q - 2.5) / 2, 0, 1)) * (q < 8 ? 1 : eOut(clamp((10 - q) / 1.8, 0, 1)));
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#F2F4F7'); g.addColorStop(1, '#D8DEE6');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  const cx = w * .5, cy = h * .52, rot = Math.cos(t * .6) * m * .006;
  glowDot(c, cx, cy + m * .26, m * .3, '#FFFFFF', .5);
  // 产品三层：屏幕 / 机身 / 镜头（分离爆炸图）
  const layer = (dy, draw) => { c.save(); c.translate(cx + rot * dy, cy - dy * explode * m * .34); draw(); c.restore(); };
  layer(-1, () => {
    c.fillStyle = '#2B3440'; c.beginPath(); c.roundRect(-m * .17, -m * .3, m * .34, m * .52, m * .05); c.fill();
    c.fillStyle = '#8FB8E0'; c.beginPath(); c.roundRect(-m * .145, -m * .27, m * .29, m * .42, m * .03); c.fill();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.roundRect(-m * .12, -m * .25, m * .1, m * .36, m * .02); c.fill();
  });
  layer(0, () => {
    c.fillStyle = '#46546A'; c.beginPath(); c.roundRect(-m * .19, -m * .33, m * .38, m * .58, m * .055); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 2; c.stroke();
  });
  layer(1, () => {
    c.fillStyle = '#2B3440'; c.beginPath(); c.arc(-m * .12, -m * .24, m * .062, 0, TAU); c.fill();
    c.fillStyle = '#8FB8E0'; c.beginPath(); c.arc(-m * .12, -m * .24, m * .032, 0, TAU); c.fill();
    c.fillStyle = '#2B3440'; c.beginPath(); c.arc(m * .02, -m * .24, m * .045, 0, TAU); c.fill();
  });
  // 光扫
  const sweep = ((t * .35) % 1);
  c.fillStyle = 'rgba(255,255,255,.4)';
  c.save(); c.translate(cx, cy); c.rotate(-.5);
  c.fillRect(-m * .02 + (sweep - .5) * m * 1.1, -m * .5, m * .05, m * 1); c.restore();
  // 卖点标注
  const points = [[-1, '更亮的屏'], [0, '更轻的机身'], [1, '更强的镜头']];
  points.forEach((p, i) => {
    const on = explode > .25 ? clamp((explode - .25) * 3 - i * .35, 0, 1) : 0;
    if (on <= 0) return;
    const y = cy - (i - 1) * explode * m * .34 - m * .06;
    c.strokeStyle = hex('#46546A', on * .8); c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx + m * .2, y); c.lineTo(cx + m * .3, y); c.stroke();
    c.fillStyle = hex('#2B3440', on); c.textAlign = 'left'; c.font = `600 ${m * .034}px ${SANS}`;
    c.fillText(p[1], cx + m * .33, y + m * .012);
  });
  // 底部标语
  c.fillStyle = '#2B3440'; c.textAlign = 'center'; c.font = `700 ${m * .055}px ${SANS}`;
  c.fillText('产品名 · 一句话卖点', w * .5, h * .88);
  c.fillStyle = 'rgba(43,52,64,.55)'; c.font = `400 ${m * .028}px ${MONO}`;
  c.fillText('slow reveal · explode view · spec callout', w * .5, h * .93);
};

// ---- Z1 ----
S.Z1 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  if (!s.init) { s.init = 1; const r = rng(101); s.ink = []; for (let i = 0; i < 6; i++) s.ink.push({ x: r() * w, y: h * (.2 + r() * .5), ph: r() * TAU }); s.bamboo = []; for (let i = 0; i < 3; i++) s.bamboo.push([w * (.12 + i * .09), r()]); }
  c.fillStyle = '#F2EDE2'; c.fillRect(0, 0, w, h);
  paperTex(w, h, 1, '#F2EDE2', 7); // 纸纹（静态基底）
  // 墨晕（缓慢呼吸的湿边墨团）
  s.ink.forEach((k, i) => {
    const r0 = m * (.07 + .02 * Math.sin(t * .5 + k.ph));
    const g = c.createRadialGradient(k.x, k.y, 0, k.x, k.y, r0 * 2.2);
    g.addColorStop(0, 'rgba(28,26,24,.5)'); g.addColorStop(.55, 'rgba(28,26,24,.16)'); g.addColorStop(1, 'rgba(28,26,24,0)');
    c.fillStyle = g; c.beginPath(); c.arc(k.x, k.y, r0 * 2.2, 0, TAU); c.fill();
  });
  // 竹（几节竿 + 叶，微微摇）
  s.bamboo.forEach((b, i) => {
    const sway = Math.sin(t * .8 + i * 2) * m * .008;
    c.strokeStyle = 'rgba(30,28,26,.72)'; c.lineWidth = m * (.016 - i * .003); c.lineCap = 'round';
    c.beginPath(); c.moveTo(b[0], h * .82); c.quadraticCurveTo(b[0] + sway * 3, h * .5, b[0] + sway * 6, h * .16); c.stroke();
    for (let k = 0; k < 4; k++) {
      const y = h * (.3 + k * .12), side = k % 2 ? 1 : -1;
      c.save(); c.translate(b[0] + sway * 5, y); c.rotate(side * (.6 + Math.sin(t * .7 + k) * .06));
      c.fillStyle = 'rgba(30,28,26,.6)';
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(m * .07, -m * .012, m * .13, 0); c.quadraticCurveTo(m * .07, m * .012, 0, 0); c.fill();
      c.restore();
    }
  });
  // 留白处一枚淡月 + 飞鸟
  c.fillStyle = 'rgba(30,28,26,.18)'; c.beginPath(); c.arc(w * .74, h * .24, m * .075, 0, TAU); c.fill();
  for (let i = 0; i < 2; i++) { const bx = w * (.5 + ((t * .04 + i * .25) % 1) * .35), by = h * (.2 + i * .07 + Math.sin(t + i) * .01); c.strokeStyle = 'rgba(30,28,26,.6)'; c.lineWidth = m * .005; c.beginPath(); c.moveTo(bx - m * .02, by); c.quadraticCurveTo(bx, by - m * .015, bx + m * .02, by); c.stroke(); }
};

// ---- Z2 ----
S.Z2 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 10;
  c.fillStyle = '#F4EDDD'; c.fillRect(0, 0, w, h);
  const cx = w * .5, cy = h * .52;
  // 工笔牡丹：细线勾勒 + 层层花瓣渐次开放
  const petal = (ang, len, wid, col, f) => {
    c.save(); c.translate(cx, cy); c.rotate(ang); c.scale(f, f);
    c.fillStyle = col; c.beginPath();
    c.moveTo(0, 0); c.bezierCurveTo(wid, -len * .4, wid * .8, -len * .9, 0, -len); c.bezierCurveTo(-wid * .8, -len * .9, -wid, -len * .4, 0, 0);
    c.fill(); c.strokeStyle = 'rgba(120,60,50,.55)'; c.lineWidth = m * .004; c.stroke(); c.restore();
  };
  const bloom = eOut(clamp(q / 3, 0, 1));
  for (let ring = 0; ring < 3; ring++) {
    const f = clamp((bloom - ring * .22) / .55, 0, 1);
    for (let i = 0; i < 6; i++) {
      petal(ring * .52 + i / 6 * TAU, m * (.1 + ring * .055), m * (.05 + ring * .012), ring === 0 ? '#D9536B' : ring === 1 ? '#E88AA0' : '#F2B8C2', f);
    }
  }
  c.fillStyle = '#F2D06B'; c.beginPath(); c.arc(cx, cy, m * .035, 0, TAU); c.fill();
  // 花蕊点
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; c.fillStyle = '#B8862B'; c.beginPath(); c.arc(cx + Math.cos(a) * m * .022, cy + Math.sin(a) * m * .022, m * .005, 0, TAU); c.fill(); }
  // 叶（细脉）
  [[-.9, .25], [.85, .3], [-.6, -.72]].forEach((lf, i) => {
    c.save(); c.translate(cx + lf[0] * m * .28, cy + lf[1] * m * .28); c.rotate(lf[0] * 1.2 + Math.sin(t * .4 + i) * .03);
    c.fillStyle = '#7A9A5B'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(m * .1, -m * .05, m * .2, 0); c.quadraticCurveTo(m * .1, m * .05, 0, 0); c.fill();
    c.strokeStyle = 'rgba(70,90,45,.6)'; c.lineWidth = m * .003; c.beginPath(); c.moveTo(0, 0); c.lineTo(m * .2, 0); c.stroke(); c.restore();
  });
  // 蝴蝶
  const bt = (t * .12) % 1, bx = w * (.12 + bt * .8), by = h * (.3 + Math.sin(bt * TAU * 1.5) * .18);
  const flap = Math.abs(Math.sin(t * 7));
  c.fillStyle = '#5B4B8A';
  c.beginPath(); c.ellipse(bx - m * .018, by, m * .022 * (.5 + flap * .5), m * .012, -.5, 0, TAU); c.fill();
  c.beginPath(); c.ellipse(bx + m * .018, by, m * .022 * (.5 + flap * .5), m * .012, .5, 0, TAU); c.fill();
};

// ---- Z3 ----
S.Z3 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 8;
  c.fillStyle = '#F2ECDC'; c.fillRect(0, 0, w, h);
  // 写意：大笔挥洒，笔笔见飞白
  const stroke = (x0, y0, x1, y1, wid, f, seed) => {
    if (f <= 0) return;
    const r = rng(seed), n = 26;
    for (let i = 0; i < n * f; i++) {
      const k = i / n, px = lerp(x0, x1, k), py = lerp(y0, y1, k) + Math.sin(k * 3) * m * .03;
      const wgt = wid * (0.4 + Math.sin(k * Math.PI) * .8);
      c.fillStyle = r() < .25 ? 'rgba(30,26,22,.28)' : 'rgba(30,26,22,.82)';
      c.beginPath(); c.ellipse(px, py, wgt * (.5 + r() * .5), wgt * .28, Math.atan2(y1 - y0, x1 - x0), 0, TAU); c.fill();
    }
  };
  // 一笔山
  stroke(w * .12, h * .7, w * .48, h * .3, m * .05, eOut(clamp(q / 1.2, 0, 1)), 3);
  stroke(w * .42, h * .68, w * .84, h * .38, m * .045, eOut(clamp((q - .8) / 1.2, 0, 1)), 7);
  // 挥洒的远山淡扫
  stroke(w * .2, h * .24, w * .7, h * .2, m * .03, eOut(clamp((q - 1.8) / 1, 0, 1)), 11);
  // 意到笔不到：两只鸟
  if (q > 3) { for (let i = 0; i < 2; i++) { const bx = w * (.6 + i * .12 + Math.sin(t * .5 + i) * .03), by = h * (.18 + i * .07); c.strokeStyle = 'rgba(30,26,22,.85)'; c.lineWidth = m * .008; c.beginPath(); c.moveTo(bx - m * .028, by); c.quadraticCurveTo(bx, by - m * .02, bx + m * .028, by); c.stroke(); } }
  // 墨点溅洒
  if (q > 4) { const r = rng(19); for (let i = 0; i < 14; i++) { const a = clamp((q - 4) * 2 - i * .12, 0, 1); c.fillStyle = hex('#1E1A16', .35 * a); c.beginPath(); c.arc(w * (.15 + r() * .7), h * (.2 + r() * .6), m * .006 * (0.5 + r()), 0, TAU); c.fill(); } }
  // 一枚闲章
  if (q > 5.2) { const e = eBack(clamp((q - 5.2) / .5, 0, 1)); c.save(); c.translate(w * .82, h * .8); c.scale(e, e); c.fillStyle = '#B3281D'; c.fillRect(-m * .035, -m * .035, m * .07, m * .07); c.fillStyle = '#F2ECDC'; c.fillRect(-m * .02, -m * .02, m * .04, m * .04); c.restore(); }
};

// ---- Z4 ----
S.Z4 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  c.fillStyle = '#EFE7D2'; c.fillRect(0, 0, w, h);
  // 山水：远山层叠 + 流水 + 古亭
  for (let k = 0; k < 4; k++) {
    const base = h * (.36 + k * .12), drift = Math.sin(t * .18 + k) * m * .012;
    c.fillStyle = hex('#2A3A38', .22 + k * .2);
    c.beginPath(); c.moveTo(0, h);
    for (let x = 0; x <= 24; x++) {
      const xx = x / 24 * w + drift;
      const yy = base + Math.sin(x / 24 * TAU * (1 + k * .4) + k * 2.2) * h * .1 + Math.cos(x / 24 * 9 + k) * h * .035;
      c.lineTo(xx, yy);
    }
    c.lineTo(w, h); c.closePath(); c.fill();
  }
  // 瀑布（一条白练，流动条纹）
  const fx = w * .62;
  c.fillStyle = 'rgba(240,238,228,.85)';
  c.fillRect(fx - m * .02, h * .4, m * .045, h * .3);
  c.fillStyle = 'rgba(120,150,150,.5)';
  for (let i = 0; i < 10; i++) { const y = h * .4 + ((i / 10 + t * .35) % 1) * h * .3; c.fillRect(fx - m * .018, y, m * .036, m * .012); }
  glowDot(c, fx, h * .72, m * .07, '#FFFFFF', .5);
  // 山腰云雾（横漂）
  for (let i = 0; i < 3; i++) {
    const y = h * (.5 + i * .1), x = ((t * 8 + i * 200) % (w + m * .6)) - m * .3;
    c.fillStyle = hex('#EFE7D2', .55);
    c.beginPath(); c.ellipse(x, y, m * .22, m * .035, 0, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(x + m * .18, y + m * .01, m * .16, m * .028, 0, 0, TAU); c.fill();
  }
  // 古亭（近景山头）
  const px = w * .22, py = h * .62;
  c.fillStyle = '#22302E';
  c.fillRect(px - m * .035, py - m * .05, m * .07, m * .05);
  c.beginPath(); c.moveTo(px - m * .075, py - m * .05); c.quadraticCurveTo(px, py - m * .105, px + m * .075, py - m * .05); c.closePath(); c.fill();
  c.fillRect(px - m * .012, py - m * .085, m * .024, m * .035);
  // 孤舟
  const bx = w * (.35 + ((t * .012) % 1) * .3);
  c.fillStyle = '#22302E'; c.beginPath(); c.moveTo(bx - m * .04, h * .82); c.quadraticCurveTo(bx, h * .845, bx + m * .04, h * .82); c.lineTo(bx + m * .025, h * .835); c.lineTo(bx - m * .025, h * .835); c.closePath(); c.fill();
  c.strokeStyle = '#22302E'; c.lineWidth = m * .005; c.beginPath(); c.moveTo(bx, h * .82); c.lineTo(bx + m * .008, h * .79); c.stroke();
};

// ---- Z5 ----
S.Z5 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 8;
  c.fillStyle = '#F7F0DF'; c.fillRect(0, 0, w, h);
  // 剪纸：红纸对称镂空（团花），边剪边转
  c.save(); c.translate(w / 2, h / 2); c.rotate(Math.sin(t * .3) * .06);
  const cut = eOut(clamp(q / 2.4, 0, 1));
  for (let k = 0; k < 12; k++) {
    const a = k / 12 * TAU;
    c.save(); c.rotate(a);
    // 花瓣（红纸）+ 镂空
    c.fillStyle = '#C6281D';
    c.beginPath(); c.moveTo(0, -m * .06); c.quadraticCurveTo(m * .075, -m * .22 * cut, 0, -m * .34 * cut); c.quadraticCurveTo(-m * .075, -m * .22 * cut, 0, -m * .06); c.closePath(); c.fill();
    c.fillStyle = '#F7F0DF'; c.beginPath(); c.arc(0, -m * .22 * cut, m * .03 * cut, 0, TAU); c.fill();
    // 小锯齿边
    c.fillStyle = '#C6281D';
    for (let j = 0; j < 3; j++) { c.beginPath(); c.arc((j - 1) * m * .028, -m * .3 * cut, m * .012 * cut, 0, TAU); c.fill(); }
    c.restore();
  }
  c.fillStyle = '#C6281D'; c.beginPath(); c.arc(0, 0, m * .09, 0, TAU); c.fill();
  c.fillStyle = '#F7F0DF'; c.beginPath(); c.arc(0, 0, m * .05, 0, TAU); c.fill();
  c.fillStyle = '#C6281D'; c.beginPath(); c.arc(0, 0, m * .022, 0, TAU); c.fill();
  c.restore();
  // 四角小剪纸
  const corners = [[.12, .12], [.88, .12], [.12, .88], [.88, .88]];
  corners.forEach((cn, i) => {
    const e = eBack(clamp(q / 1.2 - i * .12, 0, 1));
    c.save(); c.translate(cn[0] * w, cn[1] * h); c.rotate(i * Math.PI / 2); c.scale(e, e);
    c.fillStyle = '#C6281D';
    for (let k = 0; k < 4; k++) { c.save(); c.rotate(k * Math.PI / 2); c.beginPath(); c.moveTo(0, 0); c.lineTo(m * .035, -m * .02); c.lineTo(m * .035, m * .02); c.closePath(); c.fill(); c.restore(); }
    c.restore();
  });
  // 纸纹
  if (!s.tex) { s.tex = paperTex(w, h, 1, 'rgba(0,0,0,0)', 9); }
  c.globalAlpha = .12; c.drawImage(s.tex, 0, 0, w, h); c.globalAlpha = 1;
};

// ---- Z6 ----
S.Z6 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  c.fillStyle = '#C6281D'; c.fillRect(0, 0, w, h);
  // 年画：红灯笼摇摆 + 对联 + 喜庆金点
  const lantern = (x, y, sc, ph) => {
    const sw = Math.sin(t * 1.1 + ph) * .1;
    c.save(); c.translate(x, y); c.rotate(sw);
    c.strokeStyle = '#E8B04B'; c.lineWidth = m * .008;
    c.beginPath(); c.moveTo(0, -m * .18 * sc); c.lineTo(0, -m * .12 * sc); c.stroke();
    c.fillStyle = '#E8452F'; c.beginPath(); c.ellipse(0, 0, m * .1 * sc, m * .13 * sc, 0, 0, TAU); c.fill();
    c.strokeStyle = '#E8B04B'; c.lineWidth = m * .006;
    for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * m * .03 * sc, -m * .11 * sc); c.quadraticCurveTo(i * m * .042 * sc, 0, i * m * .03 * sc, m * .11 * sc); c.stroke(); }
    c.fillStyle = '#E8B04B'; c.fillRect(-m * .045 * sc, -m * .155 * sc, m * .09 * sc, m * .035 * sc);
    c.fillRect(-m * .045 * sc, m * .12 * sc, m * .09 * sc, m * .035 * sc);
    for (let i = -1; i <= 1; i++) { c.strokeStyle = '#E8B04B'; c.beginPath(); c.moveTo(i * m * .015 * sc, m * .155 * sc); c.lineTo(i * m * .015 * sc, m * .23 * sc); c.stroke(); }
    c.restore();
  };
  lantern(w * .28, h * .26, 1, 0); lantern(w * .72, h * .26, 1, 1.7);
  // 对联
  c.fillStyle = '#E8B04B'; c.fillRect(w * .06, h * .2, w * .1, h * .58); c.fillRect(w * .84, h * .2, w * .1, h * .58);
  c.fillStyle = '#C6281D'; c.font = `900 ${m * .062}px ${SANS}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  '万事如意'.split('').forEach((ch, i) => c.fillText(ch, w * .11, h * (.27 + i * .15)));
  '步步高升'.split('').forEach((ch, i) => c.fillText(ch, w * .89, h * (.27 + i * .15)));
  // 中间的福字（倒贴）
  c.fillStyle = '#E8B04B'; c.beginPath(); c.arc(w * .5, h * .52, m * .15, 0, TAU); c.fill();
  c.save(); c.translate(w * .5, h * .52); c.rotate(Math.PI); c.fillStyle = '#C6281D'; c.font = `900 ${m * .17}px ${SANS}`; c.fillText('福', 0, m * .012); c.restore();
  // 金点飘落
  if (!s.init) { s.init = 1; const r = rng(103); s.g = []; for (let i = 0; i < 26; i++) s.g.push([r(), r(), r()]); }
  s.g.forEach(g => { const y = ((g[1] + t * .05 * (0.5 + g[2])) % 1) * h; c.fillStyle = hex('#E8B04B', .5); c.beginPath(); c.arc(g[0] * w, y, m * .006, 0, TAU); c.fill(); });
};

// ---- Z7 ----
S.Z7 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  // 皮影：亮幕后的关节剪影
  const g = c.createRadialGradient(w / 2, h * .42, m * .08, w / 2, h * .5, m * .85);
  g.addColorStop(0, '#F5E3B8'); g.addColorStop(1, '#C99B52');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  glowDot(c, w * .5, h * .42, m * .3 + Math.sin(t * 2) * m * .012, '#FFE9B8', .45);
  const px = w * .5, base = h * .74, ph = t * 2.4;
  const seg = (x0, y0, ang, len, wdt, col) => { c.save(); c.translate(x0, y0); c.rotate(ang); c.fillStyle = col; c.fillRect(-wdt / 2, 0, wdt, len); c.beginPath(); c.arc(0, len, wdt * .62, 0, TAU); c.fill(); c.restore(); };
  const dark = '#1A120B';
  // 皮影人物（头饰 + 长袖），手臂带水袖摆动
  c.fillStyle = dark;
  c.beginPath(); c.arc(px, base - m * .34, m * .055, 0, TAU); c.fill();           // 头
  c.fillRect(px - m * .028, base - m * .42, m * .056, m * .03);                   // 冠
  c.beginPath(); c.moveTo(px - m * .1, base - m * .3); c.lineTo(px + m * .1, base - m * .3); c.lineTo(px + m * .07, base - m * .06); c.lineTo(px - m * .07, base - m * .06); c.closePath(); c.fill(); // 身
  seg(px - m * .08, base - m * .28, -1.1 + Math.sin(ph) * .35, m * .16, m * .03, dark);  // 左臂
  seg(px + m * .08, base - m * .28, 1.1 - Math.sin(ph) * .35, m * .16, m * .03, dark);  // 右臂
  seg(px - m * .035, base - m * .08, .35 + Math.sin(ph) * .3, m * .17, m * .032, dark); // 腿
  seg(px + m * .035, base - m * .08, -.35 - Math.sin(ph) * .3, m * .17, m * .032, dark);
  // 水袖（飘带）
  c.strokeStyle = dark; c.lineWidth = m * .012; c.lineCap = 'round';
  c.beginPath(); c.moveTo(px - m * .2, base - m * .22 + Math.sin(ph) * m * .03);
  c.quadraticCurveTo(px - m * .28, base - m * .1, px - m * .22 + Math.sin(ph * .7) * m * .04, base + m * .02); c.stroke();
  c.beginPath(); c.moveTo(px + m * .2, base - m * .22 - Math.sin(ph) * m * .03);
  c.quadraticCurveTo(px + m * .28, base - m * .1, px + m * .22 - Math.sin(ph * .7) * m * .04, base + m * .02); c.stroke();
};

// ---- Z8 ----
S.Z8 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  // 敦煌：壁画底 + 飞天飘带
  c.fillStyle = '#C9A06A'; c.fillRect(0, 0, w, h);
  if (!s.tex) s.tex = paperTex(w, h, 1, 'rgba(0,0,0,0)', 23);
  c.globalAlpha = .18; c.drawImage(s.tex, 0, 0, w, h); c.globalAlpha = 1;
  // 壁画色块（石青石绿）
  c.fillStyle = 'rgba(60,110,120,.35)'; c.fillRect(0, 0, w, h * .18); c.fillRect(0, h * .84, w, h * .16);
  c.strokeStyle = 'rgba(120,60,40,.5)'; c.lineWidth = m * .012;
  c.strokeRect(w * .06, h * .12, w * .88, h * .76);
  // 飞天：身形 + 两条长飘带（正弦摆动）
  const px = w * (.42 + Math.sin(t * .3) * .06), py = h * (.38 + Math.cos(t * .22) * .05);
  c.fillStyle = '#B85C38';
  c.beginPath(); c.ellipse(px, py, m * .05, m * .11, .5, 0, TAU); c.fill();   // 身
  c.beginPath(); c.arc(px + m * .055, py - m * .1, m * .032, 0, TAU); c.fill(); // 头
  c.fillStyle = '#2E6B72';
  c.beginPath(); c.ellipse(px - m * .07, py + m * .02, m * .045, m * .02, -.7, 0, TAU); c.fill(); // 臂
  const ribbon = (yoff, col, k) => {
    c.strokeStyle = col; c.lineWidth = m * .018; c.lineCap = 'round';
    c.beginPath();
    for (let i = 0; i <= 14; i++) {
      const kx = i / 14, x = px - kx * m * .55, y = py + yoff + Math.sin(t * 1.4 + kx * 5 + k) * m * .07 * (0.3 + kx);
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
  };
  ribbon(-m * .04, '#3E8C85', 0); ribbon(m * .03, '#D98E4B', 2);
  // 矿物颜料小色点（壁画剥落感）
  const r = rng(107);
  for (let i = 0; i < 40; i++) { c.fillStyle = hex(['#B85C38', '#2E6B72', '#E8C06A'][i % 3], .3); c.beginPath(); c.arc(r() * w, r() * h, m * .006 * (0.4 + r()), 0, TAU); c.fill(); }
  // 飘落花瓣
  for (let i = 0; i < 6; i++) { const x = ((t * 12 + i * 160) % (w + 100)) - 50, y = h * (.15 + ((t * .05 + i * .17) % 1) * .7); c.fillStyle = hex('#E8A0B0', .55); c.beginPath(); c.ellipse(x, y, m * .012, m * .006, t + i, 0, TAU); c.fill(); }
};

// ---- Z9 ----
S.Z9 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 9;
  c.fillStyle = '#F2F0EA'; c.fillRect(0, 0, w, h);
  // 青花：瓷瓶 + 缠枝莲纹渐次画出
  const cx = w / 2, cy = h * .54;
  c.fillStyle = '#FBFAF6';
  c.beginPath();
  c.moveTo(cx - m * .12, cy - m * .3);
  c.bezierCurveTo(cx - m * .26, cy - m * .12, cx - m * .24, cy + m * .22, cx - m * .14, cy + m * .3);
  c.lineTo(cx + m * .14, cy + m * .3);
  c.bezierCurveTo(cx + m * .24, cy + m * .22, cx + m * .26, cy - m * .12, cx + m * .12, cy - m * .3);
  c.closePath(); c.fill();
  c.strokeStyle = 'rgba(120,130,145,.5)'; c.lineWidth = m * .006; c.stroke();
  c.fillStyle = '#FBFAF6'; c.fillRect(cx - m * .075, cy - m * .38, m * .15, m * .1);
  c.strokeRect(cx - m * .075, cy - m * .38, m * .15, m * .1);
  // 青花纹样：缠枝（藤蔓一点点画出来）
  const BLUE = '#2E5BA8';
  c.strokeStyle = BLUE; c.lineWidth = m * .008; c.lineCap = 'round';
  const total = 3, done = clamp(q / 3.5, 0, 1);
  for (let v = 0; v < total; v++) {
    const f = clamp(done * total - v, 0, 1);
    if (f <= 0) continue;
    c.beginPath();
    for (let i = 0; i <= 30 * f; i++) {
      const k = i / 30, y = cy - m * .22 + v * m * .18 + k * m * .1;
      const x = cx + Math.sin(k * TAU + v * 2) * m * .13;
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
    // 藤上的叶子与花
    for (let i = 0; i < 3; i++) {
      const k = (i + .5) / 3; if (k > f) continue;
      const y = cy - m * .22 + v * m * .18 + k * m * .1, x = cx + Math.sin(k * TAU + v * 2) * m * .13;
      c.fillStyle = BLUE; c.beginPath(); c.ellipse(x + m * .035, y, m * .022, m * .011, .7, 0, TAU); c.fill();
      if (i === 1) { c.beginPath(); c.arc(x, y - m * .02, m * .017, 0, TAU); c.fill(); c.fillStyle = '#FBFAF6'; c.beginPath(); c.arc(x, y - m * .02, m * .008, 0, TAU); c.fill(); }
    }
  }
  // 青花口沿与底足
  c.strokeStyle = BLUE; c.lineWidth = m * .012;
  c.beginPath(); c.moveTo(cx - m * .075, cy - m * .365); c.lineTo(cx + m * .075, cy - m * .365); c.stroke();
  c.beginPath(); c.moveTo(cx - m * .14, cy + m * .285); c.lineTo(cx + m * .14, cy + m * .285); c.stroke();
  // 釉面流光（持续扫过）+ 星点
  const sw = ((t * .16) % 1);
  c.fillStyle = 'rgba(255,255,255,.4)';
  c.beginPath(); c.ellipse(cx - m * .2 + sw * m * .4, cy - m * .04, m * .026, m * .24, .18, 0, TAU); c.fill();
  for (let i = 0; i < 5; i++) { const k = ((t * .1 + i * .2) % 1); c.fillStyle = hex('#2E5BA8', .35 * Math.sin(k * Math.PI)); c.beginPath(); c.arc(cx + Math.cos(i * 2 + t * .3) * m * .3, cy - m * .2 + Math.sin(i * 1.7 + t * .25) * m * .26, m * .008, 0, TAU); c.fill(); }
};

// ---- Z10 ----
S.Z10 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 8;
  // 木版画：刻线 + 两色套印（错版呼吸）
  const off = Math.sin(t * .6) * m * .004;
  c.fillStyle = '#F0E6CE'; c.fillRect(0, 0, w, h);
  if (!s.tex) s.tex = paperTex(w, h, 1, 'rgba(0,0,0,0)', 31);
  c.globalAlpha = .15; c.drawImage(s.tex, 0, 0, w, h); c.globalAlpha = 1;
  // 红版（山与日）
  c.fillStyle = hex('#C23B22', .82);
  c.beginPath(); c.arc(w * .62 + off, h * .32 + off, m * .1, 0, TAU); c.fill();
  c.beginPath(); c.moveTo(w * .12 + off, h * .72 + off);
  c.lineTo(w * .4 + off, h * .38 + off); c.lineTo(w * .58 + off, h * .62 + off); c.lineTo(w * .72 + off, h * .44 + off); c.lineTo(w * .92 + off, h * .72 + off);
  c.closePath(); c.fill();
  // 蓝版（水与鸟）
  c.fillStyle = hex('#2E5BA8', .72);
  c.beginPath(); c.moveTo(w * .1, h * .76 - off); c.quadraticCurveTo(w * .5, h * .68 - off, w * .92, h * .78 - off); c.lineTo(w * .92, h * .92); c.lineTo(w * .1, h * .92); c.closePath(); c.fill();
  // 黑刻线（关键轮廓 + 排线）
  c.strokeStyle = '#241F1A'; c.lineWidth = m * .007;
  const ln = (x0, y0, x1, y1) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
  ln(w * .12, h * .72, w * .4, h * .38); ln(w * .4, h * .38, w * .58, h * .62); ln(w * .58, h * .62, w * .72, h * .44); ln(w * .72, h * .44, w * .92, h * .72);
  for (let i = 0; i < 12; i++) ln(w * (.16 + i * .02), h * (.72 - i * .016), w * (.2 + i * .02), h * (.72 - i * .016));
  // 木刻肌理（横刀痕）
  c.strokeStyle = 'rgba(36,31,26,.14)'; c.lineWidth = 1;
  for (let y = 0; y < h; y += m * .014) ln(0, y, w, y + m * .002);
  // 鸟（刻出来，扑翅）
  const bx = w * .3, by = h * .22, fl = Math.sin(t * 3) * m * .03;
  ln(bx - m * .05, by, bx + m * .05, by); ln(bx - m * .05, by, bx - m * .02, by - fl); ln(bx + m * .05, by, bx + m * .02, by - fl);
  // 印记文字条
  if (q > 3) { c.fillStyle = hex('#241F1A', .85); c.fillRect(w * .08, h * .84, m * .3, m * .05); c.fillStyle = '#F0E6CE'; c.font = `700 ${m * .032}px ${SANS}`; c.fillText('套色木刻', w * .1, h * .877); }
};

// ---- Z11 ----
S.Z11 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  c.fillStyle = '#1A1216'; c.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h * .5, turn = Math.sin(t * .7) * m * .012;
  c.save(); c.translate(cx + turn, cy);
  // 脸谱：对称浓烈色块
  const mirror = (draw) => { draw(1); c.save(); c.scale(-1, 1); draw(-1); c.restore(); };
  // 脸型
  c.fillStyle = '#F2E8D8'; c.beginPath(); c.ellipse(0, 0, m * .2, m * .26, 0, 0, TAU); c.fill();
  // 额纹（红）
  mirror(sg => { c.fillStyle = '#C22B1E'; c.beginPath(); c.moveTo(0, -m * .24); c.quadraticCurveTo(sg * m * .12, -m * .16, sg * m * .05, -m * .06); c.quadraticCurveTo(sg * m * .02, -m * .14, 0, -m * .24); c.fill(); });
  // 眼窝（黑）+ 眨眼
  const blink = (Math.floor(t * 1.2) % 5 === 0) ? .12 : 1;
  mirror(sg => {
    c.fillStyle = '#241F1A';
    c.beginPath(); c.ellipse(sg * m * .085, -m * .02, m * .055, m * .05 * blink, sg * .25, 0, TAU); c.fill();
    c.fillStyle = '#F2E8D8'; c.beginPath(); c.ellipse(sg * m * .085, -m * .02, m * .02, m * .018 * blink, 0, 0, TAU); c.fill();
    // 脸颊绿纹
    c.fillStyle = '#2E7D5B'; c.beginPath(); c.moveTo(sg * m * .16, m * .06); c.quadraticCurveTo(sg * m * .1, m * .12, sg * m * .04, m * .1); c.lineTo(sg * m * .12, m * .04); c.closePath(); c.fill();
  });
  // 鼻与嘴
  c.fillStyle = '#241F1A'; c.beginPath(); c.moveTo(0, m * .02); c.lineTo(-m * .025, m * .1); c.lineTo(m * .025, m * .1); c.closePath(); c.fill();
  const talk = (Math.floor(t * 2) % 2) ? m * .035 : m * .012;   // 唱念做打
  c.fillStyle = '#8A1F1F'; c.beginPath(); c.ellipse(0, m * .16, m * .07, talk, 0, 0, TAU); c.fill();
  c.strokeStyle = '#241F1A'; c.lineWidth = m * .008;
  mirror(sg => { c.beginPath(); c.moveTo(sg * m * .07, m * .15); c.quadraticCurveTo(sg * m * .13, m * .12, sg * m * .15, m * .06); c.stroke(); });
  // 盔头
  c.fillStyle = '#E8B04B';
  mirror(sg => { c.beginPath(); c.moveTo(sg * m * .2, -m * .12); c.lineTo(sg * m * .24, -m * .34); c.lineTo(sg * m * .08, -m * .22); c.closePath(); c.fill(); });
  c.beginPath(); c.arc(0, -m * .27, m * .035, 0, TAU); c.fill();
  // 翎子（两根，摆动）
  c.strokeStyle = '#E8B04B'; c.lineWidth = m * .009;
  mirror(sg => { c.beginPath(); c.moveTo(sg * m * .12, -m * .28); c.quadraticCurveTo(sg * m * .34, -m * .5 + Math.sin(t * 1.3) * m * .04, sg * m * .42, -m * .34 + Math.sin(t * 1.1 + 1) * m * .05); c.stroke(); });
  c.restore();
};

// ---- Z12 ----
S.Z12 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 9;
  c.fillStyle = '#F2ECDC'; c.fillRect(0, 0, w, h);
  if (!s.tex) s.tex = paperTex(w, h, 1, 'rgba(0,0,0,0)', 41);
  c.globalAlpha = .12; c.drawImage(s.tex, 0, 0, w, h); c.globalAlpha = 1;
  // 书法：永字八法，一笔一笔写出来
  const strokes = [
    [[.5, .18], [.5, .3]],                     // 侧（点→竖）
    [[.32, .3], [.68, .3]],                    // 勒（横）
    [[.5, .3], [.32, .52]],                    // 努（撇）
    [[.5, .34], [.72, .55]],                   // 趯（挑）
    [[.38, .52], [.34, .72]],                  // 策（短撇）
    [[.62, .52], [.68, .74]],                  // 掠（长撇）
    [[.3, .44], [.74, .44]],                   // 啄（短横）
    [[.42, .74], [.62, .78]],                  // 磔（捺）
  ];
  const per = .8;
  strokes.forEach((st, i) => {
    const f = eOut(clamp((q - i * per) / (per * .8), 0, 1)); if (f <= 0) return;
    const [a, b] = st;
    // 笔锋：起笔重、行笔渐细、收笔出锋
    const n = 12;
    for (let k = 0; k <= n * f; k++) {
      const kk = k / n, x = lerp(a[0], b[0], kk) * w, y = lerp(a[1], b[1], kk) * h;
      const wgt = m * .022 * (.55 + Math.sin(Math.min(kk * 3, Math.PI)) * .6);
      c.fillStyle = 'rgba(24,20,18,.92)';
      c.beginPath(); c.ellipse(x, y, wgt, wgt * .8, Math.atan2(b[1] - a[1], b[0] - a[0]), 0, TAU); c.fill();
    }
  });
  // 墨的浓淡渗化
  c.fillStyle = 'rgba(24,20,18,.06)'; c.beginPath(); c.arc(w * .5, h * .5, m * .22, 0, TAU); c.fill();
  // 落款红印（写完后盖章）
  if (q > strokes.length * per + .3) {
    const e = eBack(clamp((q - strokes.length * per - .3) / .5, 0, 1));
    c.save(); c.translate(w * .74, h * .78); c.scale(e, e);
    c.fillStyle = '#B3281D'; c.fillRect(-m * .04, -m * .04, m * .08, m * .08);
    c.fillStyle = '#F2ECDC'; c.fillRect(-m * .022, -m * .022, m * .044, m * .044);
    c.fillStyle = '#B3281D'; c.fillRect(-m * .012, -m * .012, m * .024, m * .024);
    c.restore();
  }
  c.fillStyle = 'rgba(24,20,18,.5)'; c.font = `400 ${m * .026}px ${SANS}`; c.textAlign = 'left';
  c.fillText('永字八法 · 一笔一笔写出来', m * .05, h - m * .05);
};

// ---- Z13 ----
S.Z13 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 8;
  c.fillStyle = '#F2EDE2'; c.fillRect(0, 0, w, h);
  // 水墨漫画：三格漫画逐格画出
  const panels = [
    { x: .06, y: .12, w: .4, h: .34 },
    { x: .54, y: .12, w: .4, h: .34 },
    { x: .06, y: .52, w: .88, h: .36 },
  ];
  panels.forEach((p, i) => {
    const f = eOut(clamp(q / 1.2 - i * .8, 0, 1)); if (f <= 0) return;
    const x = p.x * w, y = p.y * h, pw = p.w * w, ph = p.h * h;
    c.strokeStyle = '#241F1A'; c.lineWidth = m * .007;
    c.strokeRect(x, y, pw, ph);
    if (f < .35) return;
    // 每格里的内容：小人 + 墨团
    const cx2 = x + pw * .4, cy2 = y + ph * .58 + Math.sin(t * 2 + i) * m * .006;
    c.fillStyle = '#241F1A';
    c.beginPath(); c.arc(cx2, cy2 - m * .05, m * .028, 0, TAU); c.fill();
    c.fillRect(cx2 - m * .02, cy2 - m * .022, m * .04, m * .06);
    // 墨晕背景
    const g = c.createRadialGradient(x + pw * .75, y + ph * .3, 0, x + pw * .75, y + ph * .3, m * .12);
    g.addColorStop(0, 'rgba(36,31,26,.28)'); g.addColorStop(1, 'rgba(36,31,26,0)');
    c.fillStyle = g; c.fillRect(x, y, pw, ph);
    // 对白框
    if (f > .6) {
      const bx = x + pw * .55, by = y + ph * .18, bw = pw * .38, bh = ph * .3;
      c.fillStyle = '#F8F4EA'; c.fillRect(bx, by, bw, bh); c.strokeStyle = '#241F1A'; c.lineWidth = m * .005; c.strokeRect(bx, by, bw, bh);
      c.fillStyle = '#241F1A'; c.font = `600 ${m * .024}px ${SANS}`;
      c.fillText(['然后呢？', '再然后？', '后来就都好了'][i], bx + bw * .12, by + bh * .55);
    }
    // 墨点飞白
    const r = rng(61 + i);
    for (let k = 0; k < 8; k++) { c.fillStyle = hex('#241F1A', .3); c.beginPath(); c.arc(x + r() * pw, y + r() * ph, m * .005 * (0.4 + r()), 0, TAU); c.fill(); }
  });
  // 墨雨（持续下落，画面不停）
  if (!s.r2) { s.r2 = rng(97); s.drops = []; for (let i = 0; i < 18; i++) s.drops.push([s.r2(), s.r2()]); }
  s.drops.forEach(d => { const y2 = ((d[1] + t * .1) % 1) * h; c.fillStyle = 'rgba(36,31,26,.3)'; c.beginPath(); c.arc(d[0] * w, y2, m * .007, 0, TAU); c.fill(); });
};

// ---- Z14 ----
S.Z14 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 8;
  c.fillStyle = '#F4EEE0'; c.fillRect(0, 0, w, h);
  if (!s.tex) s.tex = paperTex(w, h, 1, 'rgba(0,0,0,0)', 47);
  c.globalAlpha = .16; c.drawImage(s.tex, 0, 0, w, h); c.globalAlpha = 1;
  // 彩铅：排线一层层铺出一个苹果
  const cx = w * .5, cy = h * .52, R = m * .2;
  const hatch = (col, ang, f, dens) => {
    if (f <= 0) return;
    c.save(); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.clip(); c.translate(cx, cy); c.rotate(ang);
    c.strokeStyle = col; c.lineWidth = m * .006; c.lineCap = 'round';
    const n = Math.floor(dens * f);
    for (let i = -dens; i <= n; i++) {
      const off = i * m * .012;
      c.beginPath(); c.moveTo(-R * 1.2, off); c.lineTo(R * 1.2, off + R * .5); c.stroke();
    }
    c.restore();
  };
  hatch('#D9534B', .5, clamp(q / 1.4, 0, 1), 14);      // 第一层：平铺红
  hatch('#A82F2A', -.7, clamp((q - 1.2) / 1.4, 0, 1), 10); // 第二层：暗部
  hatch('#E8A06B', 1.5, clamp((q - 2.4) / 1.2, 0, 1), 6);  // 第三层：亮部暖
  // 高光留白 + 果蒂与叶
  c.fillStyle = 'rgba(255,250,240,.75)';
  c.beginPath(); c.ellipse(cx - R * .38, cy - R * .42, R * .16, R * .1, -.6, 0, TAU); c.fill();
  c.strokeStyle = '#5B4B2B'; c.lineWidth = m * .012;
  c.beginPath(); c.moveTo(cx, cy - R * .95); c.quadraticCurveTo(cx + m * .02, cy - R * 1.18, cx + m * .05, cy - R * 1.22); c.stroke();
  // 叶（绿排线）
  c.save(); c.translate(cx + m * .06, cy - R * 1.16); c.rotate(.5);
  c.fillStyle = 'rgba(122,154,91,.75)';
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(m * .07, -m * .035, m * .14, 0); c.quadraticCurveTo(m * .07, m * .035, 0, 0); c.fill();
  c.strokeStyle = 'rgba(85,110,60,.8)'; c.lineWidth = m * .004;
  for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(i * m * .028, 0); c.lineTo(i * m * .028 + m * .014, -m * .012); c.stroke(); }
  c.restore();
  // 桌面阴影排线（铅笔持续补排线）
  c.strokeStyle = 'rgba(90,80,60,.4)'; c.lineWidth = m * .005;
  for (let i = 0; i < 14; i++) { const y = cy + R * 1.12 + i * m * .008; c.beginPath(); c.moveTo(cx - R * (1.1 - i * .03), y); c.lineTo(cx + R * (1.1 - i * .03), y); c.stroke(); }
  const pk = (t * .3) % 1, px2 = cx - R * .9 + pk * R * 1.8, py2 = cy + R * 1.12 + Math.floor(pk * 7) * m * .008;
  c.strokeStyle = 'rgba(90,80,60,.7)'; c.lineWidth = m * .006;
  c.beginPath(); c.moveTo(px2 - m * .05, py2); c.lineTo(px2 + m * .05, py2); c.stroke();
  c.save(); c.translate(px2, py2 + m * .01); c.rotate(.7);
  c.fillStyle = '#E8B04B'; c.fillRect(-m * .012, -m * .055, m * .026, m * .1);
  c.fillStyle = '#5B4B2B'; c.beginPath(); c.moveTo(-m * .012, m * .045); c.lineTo(0, m * .08); c.lineTo(m * .014, m * .045); c.closePath(); c.fill(); c.restore();
};

// ---- Z15 ----
S.Z15 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 10;
  // 温暖水彩科普卡：柔和晕染 + 友好造型（水循环）
  c.fillStyle = '#FBF6EC'; c.fillRect(0, 0, w, h);
  const wash = (x, y, r, col, a, ph) => {
    const g = c.createRadialGradient(x, y, 0, x, y, r * (1 + .08 * Math.sin(t * .7 + ph)));
    g.addColorStop(0, hex(col, a)); g.addColorStop(1, hex(col, 0));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 1.2, 0, TAU); c.fill();
  };
  wash(w * .3, h * .35, m * .28, '#F2B8A0', .5, 0);
  wash(w * .72, h * .6, m * .3, '#A8C8E8', .5, 2);
  wash(w * .55, h * .22, m * .22, '#F2D98A', .45, 4);
  // 太阳
  const sy = h * .22;
  c.fillStyle = '#E8A04B'; c.beginPath(); c.arc(w * .72, sy, m * .065, 0, TAU); c.fill();
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t * .3; c.strokeStyle = '#E8A04B'; c.lineWidth = m * .008; c.beginPath(); c.moveTo(w * .72 + Math.cos(a) * m * .085, sy + Math.sin(a) * m * .085); c.lineTo(w * .72 + Math.cos(a) * m * .12, sy + Math.sin(a) * m * .12); c.stroke(); }
  // 云（友好的三球）
  const cloudX = w * .3 + Math.sin(t * .3) * m * .03;
  c.fillStyle = '#FFFFFF';
  [[-.09, .01, .075], [0, -.025, .09], [.09, .012, .07]].forEach(cc => { c.beginPath(); c.arc(cloudX + cc[0] * m, h * .3 + cc[1] * m, cc[2] * m, 0, TAU); c.fill(); });
  // 雨滴落下 → 水面 → 蒸发回云（循环箭头）
  const cyc = (t * .22) % 1;
  for (let i = 0; i < 5; i++) {
    const k = (cyc + i / 5) % 1;
    const y = h * .38 + k * h * .3;
    c.fillStyle = hex('#6FA8DC', .8 * (1 - k * .5));
    c.beginPath(); c.moveTo(cloudX + (i - 2) * m * .055, y);
    c.quadraticCurveTo(cloudX + (i - 2) * m * .055 - m * .016, y + m * .026, cloudX + (i - 2) * m * .055, y + m * .034);
    c.quadraticCurveTo(cloudX + (i - 2) * m * .055 + m * .016, y + m * .026, cloudX + (i - 2) * m * .055, y);
    c.fill();
  }
  c.fillStyle = 'rgba(111,168,220,.5)'; c.fillRect(w * .16, h * .72, w * .68, m * .07);
  c.strokeStyle = '#6FA8DC'; c.lineWidth = m * .007;
  for (let i = 0; i < 3; i++) { const k = (cyc + i / 3) % 1; c.beginPath(); c.arc(w * .86, h * .62 - k * h * .22, m * .02 * (1 - k) + m * .004, 0, TAU); c.stroke(); }
  // 科普卡文字
  c.fillStyle = '#3A4A5A'; c.font = `700 ${m * .055}px ${SANS}`; c.textAlign = 'center';
  c.fillText('水是怎么旅行的？', w * .5, h * .88);
  c.fillStyle = hex('#3A4A5A', .7); c.font = `400 ${m * .032}px ${SANS}`;
  c.fillText('下雨 · 汇聚 · 蒸发 · 再变成云', w * .5, h * .94);
};
window.S = S;
})();
