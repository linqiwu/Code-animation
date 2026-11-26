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
function offscreen(w, h, dpr) { dpr = dpr || 1; const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * dpr)); c.height = Math.max(1, Math.round(h * dpr)); const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); return [c, x]; }
function paperTex(w, h, dpr, base, seed) {
  const [c, x] = offscreen(w, h, dpr); const r = rng(seed);
  x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (let i = 0; i < w * h / 40; i++) { x.fillStyle = r() < .5 ? 'rgba(0,0,0,.035)' : 'rgba(255,255,255,.05)'; x.fillRect(r() * w, r() * h, 1, 1); }
  x.strokeStyle = 'rgba(90,70,40,.05)'; x.lineWidth = .6;
  for (let i = 0; i < w * h / 900; i++) { const px = r() * w, py = r() * h, a = r() * TAU, l = 4 + r() * 14; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  return c;
}


var S = {};

// —— 兼容垫片：roundRect 是较新 API，老浏览器手动补圆角路径 ——
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    r = Math.min(Math.abs(r || 0), Math.abs(w) / 2, Math.abs(h) / 2);
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

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

// ---- B3 ----
S.B3 = (c, w, h, t, s) => {
  const N = 5000, PER = 4.8;
  const COL = ['#F08A8A', '#F1C070', '#A9C6FF', '#F6EBD0'];
  const SUB = ['先有一颗心', '再有一个房子', '里面住进一个人', '合起来叫家'];
  if (!s.init) {
    s.init = 1;
    const r = rng(2026);
    const heart = (x, y) => { y = -y * 1.15 + .1; x *= 1.15; return Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y <= 0; };
    const house = (x, y) => (Math.abs(x) <= .6 && y >= -.1 && y <= .75 && !(Math.abs(x) < .14 && y > .38)) || (y < -.1 && y > -.8 && Math.abs(x) <= .8 * (y + .8) / .7);
    const person = (x, y) => (x * x + (y + .55) * (y + .55) <= .05) || (y >= -.28 && y <= .85 && Math.abs(x) <= .25 + (y + .28) * .2);
    const shuffle = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp; } return arr; };
    const topUp = pts => { const out = pts.slice(); let i = 0; while (out.length < N) { const p = pts[i % pts.length]; out.push([p[0] + (r() - .5) * .008, p[1] + (r() - .5) * .008]); i++; } return out; };
    const sample = inside => { const pts = []; let guard = 0; while (pts.length < N && guard++ < N * 80) { const x = r() * 2 - 1, y = r() * 2 - 1; if (inside(x, y)) pts.push([x, y]); } return shuffle(topUp(pts)); };
    const hc = document.createElement('canvas'); hc.width = hc.height = 400;
    const hx = hc.getContext('2d'); hx.fillStyle = '#fff'; hx.font = `bold 340px ${SERIF}`; hx.textAlign = 'center'; hx.textBaseline = 'middle'; hx.fillText('家', 200, 210);
    const hd = hx.getImageData(0, 0, 400, 400).data, hpts = [];
    for (let py = 0; py < 400; py += 2) for (let px = 0; px < 400; px += 2) if (hd[(py * 400 + px) * 4 + 3] > 128) hpts.push([px / 200 - 1, py / 200 - 1]);
    s.tg = [sample(heart), sample(house), sample(person), topUp(shuffle(hpts))];
    s.p = Array.from({ length: N }, () => ({ a: r() * TAU, m: r(), ph: r() * TAU, f: .6 + r() * 1.0, sz: r(), glow: r() < .2 }));
    s.stars = Array.from({ length: 220 }, () => [r(), r(), r() * TAU, .6 + r() * 1.2]);
  }
  const m = Math.min(w, h), cx = w / 2, cy = h * 520 / 1080, SC = h * 0.36;
  const zoom = 1 + 0.015 * Math.sin(0.33 * t);
  c.fillStyle = '#07080C'; c.fillRect(0, 0, w, h);
  const bg = c.createRadialGradient(cx, cy, 0, cx, cy, 800 * m / 1080);
  bg.addColorStop(0, 'rgba(40,46,66,.30)'); bg.addColorStop(1, 'rgba(7,8,12,0)'); c.fillStyle = bg; c.fillRect(0, 0, w, h);
  for (const st of s.stars) { const a = .15 + .25 * (.5 + .5 * Math.sin(st[2] + t * st[3])); c.fillStyle = `rgba(220,228,255,${a})`; c.fillRect(st[0] * w, st[1] * h, 1.2, 1.2); }
  const k = Math.floor(t / PER) % 4, n = (k + 1) % 4, q = t % PER;
  const cA = toRGB(COL[k]), cB = toRGB(COL[n]);
  const pos = (i, tt) => {
    tt = Math.max(0, tt);
    const kk = ((Math.floor(tt / PER) % 4) + 4) % 4, nn = (kk + 1) % 4, qq = ((tt % PER) + PER) % PER;
    const A = s.tg[kk][i] || [0, 0], B = s.tg[nn][i] || [0, 0], e = ss(2.4, 4.2, qq), p = s.p[i];
    const Cx = (A[0] + B[0]) / 2 + Math.cos(p.a) * (0.35 + 0.9 * p.m);
    const Cy = (A[1] + B[1]) / 2 + Math.sin(p.a) * (0.35 + 0.9 * p.m);
    let Px = (1 - e) * (1 - e) * A[0] + 2 * (1 - e) * e * Cx + e * e * B[0];
    let Py = (1 - e) * (1 - e) * A[1] + 2 * (1 - e) * e * Cy + e * e * B[1];
    const jit = 0.012 * (1 - Math.sin(Math.PI * e));
    Px += Math.cos(p.ph + 1.3 * tt) * jit; Py += Math.sin(1.7 * p.ph + 1.1 * tt) * jit;
    return [cx + Px * SC * zoom, cy + Py * SC * zoom, e];
  };
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < N; i++) {
    const p = s.p[i], L = .75 + .25 * Math.sin(p.f * t + p.ph), r0 = 1.1 + 1.6 * p.sz;
    const [x, y, e] = pos(i, t);
    const cr = Math.round(lerp(cA[0], cB[0], e)), cg = Math.round(lerp(cA[1], cB[1], e)), cb = Math.round(lerp(cA[2], cB[2], e));
    const trail = [[1, 1, 0], [.5, .8, .045], [.25, .6, .09]];
    for (const [ta, tr, dt] of trail) {
      const pt = pos(i, t - dt);
      c.fillStyle = `rgba(${cr},${cg},${cb},${.55 * L * ta})`;
      c.beginPath(); c.arc(pt[0], pt[1], Math.max(.5, r0 * tr), 0, TAU); c.fill();
    }
    if (p.glow) { c.fillStyle = `rgba(${cr},${cg},${cb},.05)`; c.beginPath(); c.arc(x, y, r0 * 3, 0, TAU); c.fill(); }
  }
  c.globalCompositeOperation = 'source-over';
  const sa = q < .3 ? 0 : q < 1.0 ? ss(.3, 1.0, q) : q < 2.1 ? 1 : q < 2.5 ? 1 - ss(2.1, 2.5, q) : 0;
  if (sa > 0) {
    c.font = `500 ${Math.max(16, m / 23.5)}px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = `rgba(237,230,214,${.85 * sa})`; c.fillText(SUB[k], cx, h * .89);
  }
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
// ---- L1 ----
S.L1 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const r = rng(11); s.bars = [];
    for (let i = 0; i < 22; i++) s.bars.push({ x: r(), y: .06 + r() * .55, w: .03 + r() * .06, h: .05 + r() * .12, v: .008 + r() * .02, a: .08 + r() * .2 });
  }
  const m = Math.min(w, h), T = t % 6.4, honey = '#FFC21A', ink = '#0E0E0C', iv = '#F7F5EF';
  c.fillStyle = vgrad(c, h, '#2c2418', '#100e0a'); c.fillRect(0, 0, w, h);
  for (const b of s.bars) {
    const x = ((b.x + t * b.v) % 1.3 - .15) * w;
    c.fillStyle = hex('#d8b070', b.a); c.fillRect(x, b.y * h, b.w * w, b.h * h);
    c.fillStyle = hex('#6e4c22', b.a * .9); c.fillRect(x, b.y * h, b.w * w, h * .012);
  }
  c.fillStyle = hex('#ff9d3c', .05 + .025 * Math.sin(t * 1.3)); c.fillRect(0, 0, w, h);
  const g = c.createLinearGradient(0, h * .42, 0, h); g.addColorStop(0, 'rgba(8,8,6,0)'); g.addColorStop(1, 'rgba(8,8,6,.88)');
  c.fillStyle = g; c.fillRect(0, h * .42, w, h * .58);
  const bug = eOut(clamp(T / .3, 0, 1));
  c.save(); c.translate(-w * .05 * (1 - bug), 0);
  c.fillStyle = honey; c.fillRect(w * .045, h * .05, m * .2, m * .075);
  c.textBaseline = 'middle'; c.fillStyle = ink; c.font = `900 ${m * .044}px ${SANS}`; c.fillText('蜂讯', w * .052, h * .05 + m * .038);
  c.font = `600 ${m * .016}px ${MONO}`; c.fillStyle = hex(ink, .7); c.fillText('BEE NEWS', w * .052 + m * .115, h * .05 + m * .04);
  c.restore();
  const st = eOut(clamp((T - .8) / .2, 0, 1));
  if (st > 0) {
    c.save(); c.translate(-w * .03 * (1 - st), 0);
    c.textBaseline = 'middle'; c.fillStyle = iv; c.font = `700 ${m * .022}px ${SANS}`; c.fillText('来源', w * .045, h * .05 + m * .108);
    c.fillStyle = hex(iv, .62); c.font = `500 ${m * .018}px ${MONO}`; c.fillText('USDA NASS · 2026.08 · 第 13 页', w * .045 + m * .055, h * .05 + m * .11);
    c.restore();
  }
  c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillStyle = hex(iv, .55); c.font = `500 ${m * .014}px ${MONO}`;
  c.fillText('视频 蜂农日记 · CC BY 3.0', w * .955, h * .06); c.textAlign = 'left';
  c.textBaseline = 'alphabetic';
  if (T < 3.2) {
    const roll = eOut(clamp((T - .15) / .45, 0, 1)), v = lerp(0, 130, roll).toFixed(1);
    c.font = `900 ${m * .062}px ${SANS}`; c.fillStyle = iv; c.fillText('一年少了', w * .075, h * .5);
    c.fillStyle = honey; c.fillRect(w * .07, h * .53, m * .56, m * .135);
    c.fillStyle = ink; c.font = `800 ${m * .3}px ${MONO}`; c.fillText(v, w * .085, h * .53 + m * .115);
    c.font = `700 ${m * .05}px ${SANS}`; c.fillText('万箱', w * .085 + m * .375, h * .53 + m * .112);
    c.fillStyle = hex(iv, .85); c.font = `500 ${m * .026}px ${SANS}`; c.fillText('蜂群消失 —— 可总数却在上涨', w * .075, h * .75);
    glowDot(c, w * .075 + m * .3, h * .62, m * .1, honey, Math.sin(t * 6) > .6 ? .22 : .1);
  } else {
    const TT = T - 3.2, fs = m * .105;
    c.font = `900 ${fs}px ${SANS}`;
    const chunks = [['总数却', 0, 0], ['涨了', .3, 0], ['6%', .6, 1]];
    let x = w * .075;
    for (const [txt, dt, key] of chunks) {
      const tw = c.measureText(txt).width, age = TT - dt;
      if (age < 0) { x += tw + fs * .12; continue; }
      const sc = lerp(1.3, 1, eBack(clamp(age / .13, 0, 1)));
      if (key) {
        const wipe = clamp(age / .12, 0, 1);
        c.fillStyle = honey; c.fillRect(x - fs * .1, h * .72 - fs * .95, (tw + fs * .2) * wipe, fs * 1.2);
      }
      c.save(); c.translate(x, h * .72); c.scale(sc, sc);
      c.fillStyle = key ? ink : iv; c.fillText(txt, 0, 0); c.restore();
      x += tw + fs * .12;
    }
    const et = eOut(clamp((TT - .7) / .18, 0, 1));
    c.fillStyle = hex(iv, et * .9); c.font = `500 ${m * .026}px ${SANS}`;
    c.fillText('Colony totals rose six percent', w * .077, h * .8 + (1 - et) * m * .016);
    glowDot(c, w * .55, h * .68, m * .12, honey, .12 + .1 * (Math.sin(t * 5) > .7 ? 1 : 0));
  }
};


// ---- L2 ----
S.L2 = (c, w, h, t, s) => {
  const m = Math.min(w, h), T = t % 8, fr = Math.floor(t * 24);
  const gw = h * 1.37, gx = (w - gw) / 2, rad = 26 * (h / 1080);
  c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
  const wx = nz(fr, 3, 0) * 1.6, wy = nz(9, fr, 0) * 2.2;
  c.save(); c.beginPath(); c.roundRect(gx, 0, gw, h, rad); c.clip();
  c.save(); c.translate(gx + wx, wy);
  c.fillStyle = vgrad(c, h, '#3c362b', '#151310'); c.fillRect(0, 0, gw, h);
  if (T < 2.4) {
    for (let i = 0; i < 18; i++) {
      const a = i / 18 * TAU + t * .2;
      c.fillStyle = i % 2 ? 'rgba(240,232,214,.14)' : 'rgba(18,16,12,.32)';
      c.beginPath(); c.moveTo(gw * .5, h * .46); c.arc(gw * .5, h * .46, gw, a, a + TAU / 36); c.closePath(); c.fill();
    }
    for (const sgn of [-1, 1]) {
      const a0 = Math.sin(t * .8 + sgn) * .3;
      const g2 = c.createLinearGradient(gw * .5, h * .95, gw * .5 + sgn * gw * .8, 0);
      g2.addColorStop(0, 'rgba(255,246,220,.32)'); g2.addColorStop(1, 'rgba(255,246,220,0)');
      c.fillStyle = g2; c.beginPath(); c.moveTo(gw * .5 + sgn * gw * .14, h * 1.02);
      c.lineTo(gw * .5 + sgn * gw * (.72 + a0), -10); c.lineTo(gw * .5 + sgn * gw * (.36 + a0), -10); c.closePath(); c.fill();
    }
    const R = gw * .16 * eOut(clamp(T / 1.1, 0, 1)), cx = gw * .5, cy = h * .42;
    c.strokeStyle = 'rgba(238,231,214,.8)'; c.lineWidth = 2;
    c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
    for (let i = -2; i <= 2; i++) { c.beginPath(); c.ellipse(cx, cy + i * R * .3, R * Math.cos(i * .3), R * .12, 0, 0, TAU); c.stroke(); }
    for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(cx, cy, R * (.32 + i * .3), R, 0, 0, TAU); c.stroke(); }
    const tl = eBack(clamp((T - 1.05) / .5, 0, 1));
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const y = lerp(h * .88, h * .72, tl);
    const g3 = c.createLinearGradient(0, y - m * .06, 0, y + m * .06);
    g3.addColorStop(0, '#fff'); g3.addColorStop(.5, '#d9d4ca'); g3.addColorStop(.52, '#9e978a'); g3.addColorStop(1, '#efebe2');
    c.font = `900 ${m * .115}px ${SANS}`; c.lineWidth = m * .014; c.strokeStyle = '#0a0908';
    c.strokeText('都市新闻片', gw * .5, y); c.fillStyle = g3; c.fillText('都市新闻片', gw * .5, y);
    c.textAlign = 'left';
  } else if (T < 5.2) {
    const u = clamp((T - 2.4) / 1.1, 0, 1), sc = .22 + .78 * Math.pow(u, 1.6), rot = Math.pow(1 - u, 1.25) * 2.5 * 2;
    const jig = u > .92 ? Math.exp(-(u - .92) * 40) * Math.sin((u - .92) * 90) * 16 : 0;
    c.save(); c.translate(gw * .5, h * .5 + jig); c.rotate(rot); c.scale(sc, sc);
    c.fillStyle = '#d9d2c2'; c.fillRect(-gw * .32, -h * .34, gw * .64, h * .68);
    c.fillStyle = '#191713'; c.font = `900 ${m * .085}px ${SANS}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('查尔斯顿舞伤膝', 0, -h * .22);
    c.fillStyle = '#3d382f';
    for (let i = 0; i < 21; i++) {
      const col = i % 3, row = (i / 3) | 0;
      c.fillRect(-gw * .27 + col * gw * .185, -h * .1 + row * h * .058, gw * .16, h * .018);
    }
    c.strokeStyle = '#3d382f'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(-gw * .27, -h * .02); c.lineTo(gw * .27, -h * .02); c.stroke();
    c.restore(); c.textAlign = 'left';
    const push = 1 + .04 * u;
    c.fillStyle = 'rgba(255,250,235,' + (u > .95 ? .4 : 0) + ')'; c.fillRect(0, 0, gw, h);
  } else {
    const pu = clamp((T - 5.2) / 2.8, 0, 1);
    for (let i = 0; i < 26; i++) {
      const row = i % 3, xx = ((i * 0.137 + t * (.02 + row * .008)) % 1.15 - .08) * gw;
      const yy = h * (.82 - row * .1) - nz(i, fr, 0) * 6;
      c.fillStyle = `rgba(24,20,16,${.5 + row * .15})`;
      c.beginPath(); c.arc(xx, yy, m * .02, 0, TAU); c.fill();
      c.fillRect(xx - m * .024, yy + m * .014, m * .048, m * .07);
    }
    c.fillStyle = hex('#f0ead9', .1); c.fillRect(0, 0, gw, h * .4);
    const pc = eOut(clamp((T - 5.35) / .22, 0, 1));
    if (pc > 0) {
      c.save(); c.beginPath(); c.rect(gw * .045, h * .07, (gw * .42) * pc, h * .17); c.clip();
      c.fillStyle = 'rgba(12,11,10,.8)'; c.fillRect(gw * .045, h * .07, gw * .42, h * .17);
      c.strokeStyle = '#ece7dc'; c.lineWidth = 2;
      c.strokeRect(gw * .045 + 8, h * .07 + 8, gw * .42 - 16, h * .17 - 16);
      c.fillStyle = '#ece7dc'; c.font = `600 ${m * .036}px ${SANS}`; c.textBaseline = 'middle';
      c.fillText('福特工厂野餐会', gw * .06, h * .125);
      c.font = `600 ${m * .024}px ${MONO}`; c.fillStyle = '#d6cfc0';
      c.fillText('DETROIT · 1926', gw * .06, h * .185);
      c.restore();
    }
  }
  // 片门效果
  const fl = clamp(.022 + .02 * nz(fr, 0, 0), 0, .07);
  c.fillStyle = `rgba(255,246,225,${fl})`; c.fillRect(0, 0, gw, h);
  for (let i = 0; i < 3; i++) {
    const sx = ((nz(i * 7 + 1, fr, 0) + 2) / 4) * gw;
    c.fillStyle = 'rgba(255,250,240,.16)'; c.fillRect(sx, 0, 1.2, h);
  }
  for (let i = 0; i < 4; i++) {
    const dx = ((nz(i * 5 + 2, fr, 3) + 2) / 4) * gw, dy = ((nz(fr, i * 3 + 1, 0) + 2) / 4) * h;
    c.fillStyle = 'rgba(30,26,20,.5)'; c.beginPath(); c.arc(dx, dy, 1.6 + (i % 2), 0, TAU); c.fill();
  }
  const vg = c.createRadialGradient(gw * .5, h * .5, h * .3, gw * .5, h * .5, h * .82);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(10,8,5,.42)');
  c.fillStyle = vg; c.fillRect(0, 0, gw, h);
  c.restore(); // 去掉抖动，字幕层稳定
  const sb = c.createLinearGradient(0, h * .8, 0, h);
  sb.addColorStop(0, 'rgba(10,9,8,0)'); sb.addColorStop(.35, 'rgba(10,9,8,.93)');
  c.fillStyle = sb; c.fillRect(0, h * .8, gw, h * .2);
  const su = eOut(clamp((T - .3) / .25, 0, 1));
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = `rgba(243,238,228,${su})`; c.font = `600 ${m * .05}px ${SANS}`;
  c.fillText('孩子们照跳不误', gw * .5, h * .9);
  c.fillStyle = `rgba(214,207,192,${su * .9})`; c.font = `400 ${m * .034}px ${MONO}`;
  c.fillText('THE CHILDREN DANCED ON', gw * .5, h * .955);
  c.textAlign = 'left';
  c.restore();
};


// ---- L3 ----
S.L3 = (c, w, h, t, s) => {
  const m = Math.min(w, h), D = 14, T = t % D, Z = 10;
  const after = T > Z, el = after ? T - Z : Z - T;
  const G = '#06080A', PA = '#0B0E11', OR = '#FF5B1F', TX = '#F2F5F7', SC2 = '#7C878D';
  c.fillStyle = G; c.fillRect(0, 0, w, h);
  const names = ['主摄像', '高机位', '控制室', '塔架', '远景', '点火台'];
  const ph = [0, 2, 4, 6.2, 8, 10.05, 11.4];
  const conf = [[1, 1, 1], [2, 2, 1], [3, 3, 1], [4, 2, 2], [6, 3, 2], [1, 1, 1], [2, 2, 1]];
  let p = 0; while (p + 1 < ph.length && T >= ph[p + 1]) p++;
  const k = ss(0, .34, T - ph[p]);
  const rectOf = (i, cols, rows) => {
    const mg = m * .035, gu = m * .012;
    const cw = (w - mg * 2 - gu * (cols - 1)) / cols, ch = (h * .76 - gu * (rows - 1)) / rows;
    return { x: mg + (i % cols) * (cw + gu), y: h * .22 + ((i / cols) | 0) * (ch + gu), w: cw, h: ch };
  };
  const cell = (i, R, sync) => {
    c.save(); c.beginPath(); c.rect(R.x, R.y, R.w, R.h); c.clip();
    const g1 = c.createLinearGradient(R.x, R.y, R.x + R.w, R.y + R.h);
    g1.addColorStop(0, i % 2 ? '#14202a' : '#1a2430'); g1.addColorStop(1, '#0a1016');
    c.fillStyle = g1; c.fillRect(R.x, R.y, R.w, R.h);
    const vx = nz(i * 3, t * .5, 0) * R.w * .015;
    for (let b = 0; b < 5; b++) {
      const y = R.y + ((b * .21 + t * (.03 + i * .008) + i * .1) % 1) * R.h;
      c.fillStyle = 'rgba(120,160,190,.1)'; c.fillRect(R.x + vx, y, R.w, R.h * .05);
    }
    c.fillStyle = 'rgba(8,12,16,.85)';
    c.fillRect(R.x + R.w * .42 + vx, R.y + R.h * .3, R.w * .16, R.h * .7);
    c.fillRect(R.x + R.w * .18 + vx, R.y + R.h * .58, R.w * .64, R.h * .05);
    c.fillRect(R.x + R.w * .55 + vx, R.y + R.h * .16, R.w * .03, R.h * .4);
    const glow = .1 + .06 * Math.sin(t * 3 + i);
    glowDot(c, R.x + R.w * .5 + vx, R.y + R.h * .32, R.w * .22, '#FF5B1F', glow);
    const cs = m * .017;
    c.fillStyle = 'rgba(6,8,10,.84)'; c.fillRect(R.x, R.y, R.w * .34, cs * 2.4);
    c.fillStyle = sync ? OR : SC2; c.fillRect(R.x + cs * .5, R.y + cs * .7, cs * .8, cs * .8);
    c.fillStyle = TX; c.font = `500 ${cs}px ${MONO}`;
    c.fillText('CAM ' + (i + 1) + ' ' + names[i % 6], R.x + cs * 1.8, R.y + cs * 1.15);
    c.fillStyle = 'rgba(6,8,10,.7)'; c.fillRect(R.x + R.w * .55, R.y, R.w * .45, cs * 2);
    c.fillStyle = sync ? OR : SC2; c.font = `500 ${cs * .82}px ${MONO}`;
    c.fillText(sync ? '● 实时同步 LIVE' : '○ 同窗未同步', R.x + R.w * .58, R.y + cs * 1.05);
    c.restore();
    c.strokeStyle = 'rgba(222,232,238,.16)'; c.lineWidth = 1; c.strokeRect(R.x, R.y, R.w, R.h);
    if (R.new) { c.strokeStyle = OR; c.lineWidth = 3; c.globalAlpha = clamp(1 - (T - R.new) * 3, 0, 1); c.strokeRect(R.x, R.y, R.w, R.h); c.globalAlpha = 1; }
  };
  const n0 = conf[Math.max(0, p - 1)], n1 = conf[p];
  const cnt = Math.round(lerp(n0[0], n1[0], k));
  for (let i = 0; i < cnt; i++) {
    const cur = rectOf(i, n1[1], n1[2]);
    if (p > 0 && i < n0[0]) {
      const prv = rectOf(i, n0[1], n0[2]);
      const R = { x: lerp(prv.x, cur.x, k), y: lerp(prv.y, cur.y, k), w: lerp(prv.w, cur.w, k), h: lerp(prv.h, cur.h, k) };
      cell(i, R, (T > 6 && i % 3 === 0) || i === 0);
    } else {
      const R = { x: cur.x, y: cur.y, w: cur.w * clamp(k * 1.4, 0, 1), h: cur.h, new: ph[p] };
      cell(i, R, i % 2 === 0);
    }
  }
  // 零点合并闪光
  if (after) {
    const fl = Math.exp(-(T - Z) / .11) * .7;
    if (fl > .01) { c.fillStyle = `rgba(255,248,236,${fl})`; c.fillRect(0, 0, w, h); }
  }
  // 时钟
  const cx = m * .055, cy = h * .115, fs = m * .125;
  const drop = (1 - eOut(clamp((t % 1) / .12, 0, 1))) * 14;
  if (after) { c.fillStyle = OR; c.fillRect(cx - m * .02, cy - fs * .8, m * .38, fs * 1.6); }
  c.textBaseline = 'middle';
  c.fillStyle = after ? '#0A0B0C' : OR; c.font = `700 ${fs * .55}px ${MONO}`;
  c.fillText(after ? 'T+' : 'T−', cx, cy);
  c.fillStyle = after ? '#0A0B0C' : TX; c.font = `700 ${fs}px ${MONO}`;
  const ds = String(Math.min(99, Math.floor(el))).padStart(2, '0');
  c.fillText(ds[0], cx + fs * .58, cy + drop);
  c.fillText(ds[1], cx + fs * .58 + fs * .56, cy + drop);
  c.fillStyle = after ? 'rgba(10,11,12,.6)' : SC2; c.font = `700 ${fs * .41}px ${MONO}`;
  c.fillText('.' + Math.floor((el % 1) * 10), cx + fs * 1.78, cy);
  for (let i = 0; i < 10; i++) {
    const on = after ? (el % 1) * 10 > i : (el % 1) * 10 <= i;
    c.fillStyle = on ? (after ? '#0A0B0C' : OR) : (after ? 'rgba(10,11,12,.25)' : 'rgba(242,245,247,.18)');
    c.fillRect(cx + i * fs * .19, cy + fs * .62, fs * .15, fs * .1);
  }
  c.fillStyle = SC2; c.font = `500 ${m * .018}px ${MONO}`;
  c.fillText(after ? 'ELAPSED · 点火后' : 'COUNTDOWN · 发射流程', cx + fs * 2.4, cy - fs * .3);
  c.fillText('T−10 计划 06:12:40 UTC', cx + fs * 2.4, cy + fs * .18);
  // 事件旗
  const fU = clamp((T - 8.6) / .3, 0, 1) * (1 - clamp((T - 12.6) / .4, 0, 1));
  if (fU > 0) {
    const fy = h - m * .075;
    c.fillStyle = OR; c.fillRect(w * .055 - w * .2 * (1 - eOut(fU)), fy, w * .46, m * .055);
    c.fillStyle = '#0A0B0C'; c.font = `700 ${m * .026}px ${SANS}`; c.textBaseline = 'middle';
    c.fillText('主发动机点火 · T−1.4', w * .07 - w * .2 * (1 - eOut(fU)), fy + m * .028);
    c.textBaseline = 'alphabetic';
  }
};


// ---- L4 ----
S.L4 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const r = rng(41); s.st = []; s.sky = []; s.bld = [];
    for (let i = 0; i < 60; i++) s.st.push({ y: .42 + r() * .55, v: .25 + r() * 1.6, l: .05 + r() * .25, x: r(), k: r() < .45 ? 1 : 0, w: 1 + r() * 2.4 });
    for (let i = 0; i < 14; i++) s.sky.push({ y: .05 + r() * .3, v: .008 + r() * .03, l: .12 + r() * .3, x: r(), a: .05 + r() * .1 });
    for (let i = 0; i < 22; i++) s.bld.push({ x: r(), w: .02 + r() * .05, h: .1 + r() * .3 });
  }
  const m = Math.min(w, h), D = 8, T = t % D;
  c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
  const mat = h * 21 / 1080;
  const scene = (x, y, ww, hh, sp, grey) => {
    const lite = ww * hh < w * h * .18, stp = lite ? 2 : 1;
    c.save(); c.beginPath(); c.rect(x, y, ww, hh); c.clip();
    const g = c.createLinearGradient(0, y, 0, y + hh);
    g.addColorStop(0, grey ? '#15161a' : '#101c2e'); g.addColorStop(.55, grey ? '#23262b' : '#25344e'); g.addColorStop(1, grey ? '#0c0d0f' : '#0a0f18');
    c.fillStyle = g; c.fillRect(x, y, ww, hh);
    for (let i = 0; i < s.sky.length; i += stp) {
      const q = s.sky[i];
      const qx = x + ((q.x + t * q.v * sp) % 1.2 - .1) * ww;
      c.fillStyle = `rgba(220,225,235,${q.a})`; c.fillRect(qx, y + q.y * hh, q.l * ww, hh * .018);
    }
    for (const b of s.bld) {
      c.fillStyle = grey ? 'rgba(18,20,22,.92)' : 'rgba(10,16,26,.92)';
      c.fillRect(x + b.x * ww, y + hh * (.74 - b.h * .72), b.w * ww, b.h * hh);
      if (!lite) {
        c.fillStyle = grey ? 'rgba(160,150,130,.14)' : 'rgba(255,190,120,.16)';
        for (let wy = 0; wy < 3; wy++) c.fillRect(x + b.x * ww + b.w * ww * .2, y + hh * (.76 - b.h * .72) + wy * hh * .05, b.w * ww * .3, hh * .012);
      }
    }
    for (let i = 0; i < s.st.length; i += stp) {
      const q = s.st[i];
      const qx = ((q.x + t * q.v * sp * .12) % 1.25 - .15) * ww + x;
      const yy = y + q.y * hh, len = q.l * ww * (1 + sp * .3), th = Math.max(1, hh * .006 * q.w);
      const col = q.k ? 'rgba(217,119,47,' : 'rgba(255,214,150,';
      c.fillStyle = col + (.28 + q.w * .12) + ')'; c.fillRect(qx, yy, len, th);
      c.fillStyle = col + '.5)'; c.fillRect(qx + len, yy, ww * .012, th);
    }
    c.restore();
  };
  const st = T < 2.8 ? 0 : T < 5 ? 1 : T < 7 ? 2 : 3;
  const cellDraw = (i, x, y, cw, ch2, sp) => { scene(x, y, cw, ch2, sp, st === 3 ? 0 : (i % 3 === 2)); c.strokeStyle = 'rgba(0,0,0,.9)'; c.lineWidth = m * .009; c.strokeRect(x, y, cw, ch2); };
  if (st === 0) {
    scene(0, mat, w, h - 2 * mat, 1, 0);
    const fs = m * .1;
    c.textBaseline = 'alphabetic'; c.fillStyle = '#EDE8DF'; c.font = `300 ${fs}px ${MONO}`;
    const digs = '12800';
    for (let i = 0; i < digs.length; i++) {
      const lockT = .3 + i * .125;
      const ch = T > lockT ? digs[i] : String(Math.floor(Math.abs(nz(i, Math.floor(t * 24), 0)) * 10));
      const dy = T > lockT ? 0 : fs * .25 * Math.sin(t * 30 + i);
      c.fillStyle = T > lockT ? '#EDE8DF' : 'rgba(237,232,223,.4)';
      c.fillText(ch, w * .1 + i * fs * .62, h * .4 + dy);
    }
    const rw = ss(0, 1.6, T) * w * .28;
    c.fillStyle = '#D9772F'; c.fillRect(w * .1, h * .44, rw, 2.5);
    c.fillStyle = '#B0AAA0'; c.font = `300 ${m * .026}px ${SANS}`;
    c.fillText('日均车流 · 单向 · 2025', w * .1, h * .5);
    c.fillStyle = '#D9772F'; c.font = `300 ${m * .02}px ${MONO}`;
    c.fillText('SOURCE: 市交通委年报', w * .1, h * .545);
    const vg = c.createLinearGradient(0, h * .25, 0, h * .6);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)');
    c.fillStyle = vg; c.fillRect(0, h * .25, w * .55, h * .35);
  } else if (st === 3) {
    const gu = ss(7, 7.3, T) * m * .006;
    scene(0, mat, w / 2 - gu, h - 2 * mat, .8, 1);
    scene(w / 2 + gu, mat, w / 2 - gu, h - 2 * mat, 1.6, 0);
    c.fillStyle = '#000'; c.fillRect(w / 2 - gu, mat, gu * 2, h - 2 * mat);
    c.textAlign = 'center'; c.fillStyle = '#B0AAA0'; c.font = `300 ${m * .022}px ${SANS}`;
    c.fillText('1899 · 档案', w * .25, h * .92); c.fillText('今天 · 同机位', w * .75, h * .92);
    c.textAlign = 'left';
  } else {
    const n = st === 1 ? 2 : 3, gu = m * .009;
    const cw = (w - gu * (n - 1)) / n, ch2 = (h - 2 * mat - gu * (n - 1)) / n;
    for (let i = 0; i < n * n; i++) {
      const dly = ((i * 7) % (n * n)) * .05, u = clamp((T - (st === 1 ? 2.8 : 5) - dly) / .3, 0, 1);
      if (u <= 0) continue;
      const col = i % n, row = (i / n) | 0;
      const ew = cw * eOut(u), x0 = col * (cw + gu) + (cw - ew);
      cellDraw(i, x0, mat + row * (ch2 + gu), ew, ch2, .8 + i * .22);
    }
  }
  // 日环
  const rx = w * .9, ry = h * .83, R = m * .075, ha = -Math.PI / 2 + TAU * (T / D);
  c.strokeStyle = 'rgba(237,232,223,.4)'; c.lineWidth = 1.5;
  c.beginPath(); c.arc(rx, ry, R, 0, TAU); c.stroke();
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * TAU;
    c.beginPath(); c.moveTo(rx + Math.cos(a) * R * .86, ry + Math.sin(a) * R * .86); c.lineTo(rx + Math.cos(a) * R, ry + Math.sin(a) * R); c.stroke();
  }
  c.strokeStyle = '#D9772F'; c.lineWidth = 2.5;
  c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx + Math.cos(ha) * R * .78, ry + Math.sin(ha) * R * .78); c.stroke();
  c.beginPath(); c.arc(rx, ry, R * .62, ha - TAU * .125, ha); c.stroke();
  c.fillStyle = '#B0AAA0'; c.font = `300 ${m * .016}px ${MONO}`;
  c.fillText('DAY 24H', rx - R, ry + R * 1.45);
  // 1.85:1 遮幅
  c.fillStyle = '#000'; c.fillRect(0, 0, w, mat); c.fillRect(0, h - mat, w, mat);
};


// ---- L5 ----
S.L5 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const r = rng(51); s.ch = [];
    let v = .5;
    for (let i = 0; i < 30; i++) { v = clamp(v + (r() - .5) * .3, .1, .9); s.ch.push(v); }
  }
  const m = Math.min(w, h), D = 8, T = t % D;
  const BG = '#0B0C0E', PA = '#141619', LN = '#2E3238', TX = '#ECEAE4', SEC = '#8B9097', UN = '#4A4F57', RD = '#FF4A2E';
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  c.textBaseline = 'alphabetic';
  if (T < 4) {
    // 三栏同步格
    const flash = (t0) => Math.max(0, .55 - (T - t0) * 4) * (T >= t0 ? 1 : 0);
    c.fillStyle = TX; c.font = `700 ${m * .038}px ${SANS}`;
    c.fillText('三路来源 · 同一秒', w * .05, h * .1);
    c.fillStyle = SEC; c.font = `400 ${m * .019}px ${MONO}`;
    c.fillText('SYNC POINT 18:24:57 EST · 时区已统一', w * .05, h * .14);
    const swv = (T * .8 + 1.2).toFixed(2);
    c.fillStyle = RD; c.font = `600 ${m * .07}px ${MONO}`;
    c.textAlign = 'right'; c.fillText('T+00.' + swv.split('.')[1], w * .95, h * .12); c.textAlign = 'left';
    for (let i = 0; i < 3; i++) {
      const px = w * (.05 + i * .31), pw = w * .27, py = h * .22, phh = h * .38;
      const t0 = [.15, .8, 1.45][i];
      c.save(); c.beginPath(); c.rect(px, py, pw, phh); c.clip();
      c.fillStyle = PA; c.fillRect(px, py, pw, phh);
      if (i === 0) {
        c.fillStyle = '#c9c5ba';
        for (let l = 0; l < 12; l++) {
          c.fillStyle = l === 6 ? hex(RD, .6) : 'rgba(201,197,186,.5)';
          c.fillRect(px + pw * .1, py + phh * (.18 + l * .06), pw * (.8 - (l % 3) * .12), phh * .022);
        }
      } else if (i === 1) {
        for (let b = 0; b < 7; b++) {
          c.fillStyle = `rgba(${120 + b * 12},${118 + b * 10},${112 + b * 9},.5)`;
          c.beginPath(); c.arc(px + pw * (.2 + (b * 37 % 60) / 100), py + phh * (.25 + (b * 53 % 50) / 100), pw * .12, 0, TAU); c.fill();
        }
        c.strokeStyle = hex(RD, .9); c.lineWidth = 2;
        c.beginPath(); c.arc(px + pw * .42, py + phh * .45, pw * .1, 0, TAU * clamp((T - 2.4) / .5, 0, 1)); c.stroke();
      } else {
        for (let l = 0; l < 20; l++) {
          c.fillStyle = `rgba(150,160,170,${.12 + .1 * Math.sin(t * 6 + l)})`;
          c.fillRect(px, py + l * phh / 20, pw, phh / 40);
        }
        const bx = px + ((t * .18) % 1) * pw;
        c.fillStyle = 'rgba(220,230,240,.28)'; c.fillRect(bx, py, pw * .12, phh);
      }
      c.fillStyle = flash(t0); c.fillRect(px, py, pw, phh);
      c.restore();
      c.strokeStyle = LN; c.lineWidth = 1; c.strokeRect(px, py, pw, phh);
      c.fillStyle = i === 2 ? RD : UN; c.fillRect(px, py - m * .022, m * .012, m * .012);
      c.fillStyle = SEC; c.font = `400 ${m * .016}px ${MONO}`;
      c.fillText(['电传 · 1937-05-08', '照片 · Pasquarella', '影像 · 交通台'][i], px + m * .022, py - m * .012);
      c.fillStyle = TX; c.font = `400 ${m * .015}px ${MONO}`;
      c.fillText(['18:24:41 EST', '18:25:03 EST', '18:24:57 EST'][i], px + pw * .05, py + phh - m * .018);
    }
    if (T > 2.2) {
      c.strokeStyle = RD; c.lineWidth = 2; c.setLineDash([8, 6]);
      const sx = w * .05 + w * .31 * 1 + w * .27 * .55;
      c.beginPath(); c.moveTo(sx, h * .2); c.lineTo(sx, h * .62 * clamp((T - 2.2) / .4, 0, 1) + h * .2 * (1 - clamp((T - 2.2) / .4, 0, 1))); c.stroke();
      c.setLineDash([]);
    }
    // 底部数据图 + 播放头
    const gx0 = w * .05, gy0 = h * .68, gw2 = w * .9, gh2 = h * .16;
    c.strokeStyle = LN; c.strokeRect(gx0, gy0, gw2, gh2);
    c.beginPath();
    for (let i = 0; i < 30; i++) {
      const xx = gx0 + i / 29 * gw2, yy = gy0 + gh2 * (1 - s.ch[i]);
      i ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
    }
    c.strokeStyle = SEC; c.lineWidth = 1.6; c.stroke();
    const ph2 = ((T * .22) % 1);
    const hx = gx0 + ph2 * gw2;
    c.strokeStyle = RD; c.lineWidth = 2;
    c.beginPath(); c.moveTo(hx, gy0 - m * .012); c.lineTo(hx, gy0 + gh2 + m * .012); c.stroke();
    c.fillStyle = RD; c.font = `400 ${m * .016}px ${MONO}`;
    c.fillText('18:2' + Math.floor(ph2 * 9) + ':' + String(Math.floor(ph2 * 59)).padStart(2, '0'), hx + 6, gy0 - m * .02);
    c.fillStyle = UN; c.font = `400 ${m * .014}px ${MONO}`;
    c.fillText('风速 m/s · NWS 记录 · 事件带：风暴 / 断电', gx0, gy0 + gh2 + m * .03);
  } else {
    // 证据汇聚板
    const lt = T - 4;
    c.fillStyle = TX; c.font = `700 ${m * .038}px ${SANS}`;
    c.fillText('五路来源指向一处', w * .05, h * .1);
    const zone = { x: w * .72, y: h * .48 };
    // 示意图
    c.strokeStyle = LN; c.lineWidth = 1.5;
    c.strokeRect(w * .58, h * .2, w * .32, h * .52);
    for (let i = 1; i < 4; i++) {
      c.beginPath(); c.moveTo(w * .58, h * (.2 + i * .13)); c.lineTo(w * .9, h * (.2 + i * .13)); c.stroke();
      c.beginPath(); c.moveTo(w * (.58 + i * .08), h * .2); c.lineTo(w * (.58 + i * .08), h * .72); c.stroke();
    }
    c.fillStyle = hex(RD, .3);
    c.fillRect(zone.x - w * .035, zone.y - h * .05, w * .07, h * .1);
    c.strokeStyle = RD; c.setLineDash([6, 5]); c.strokeRect(zone.x - w * .035, zone.y - h * .05, w * .07, h * .1); c.setLineDash([]);
    c.fillStyle = SEC; c.font = `400 ${m * .015}px ${MONO}`; c.fillText('示意 SCHEMATIC · 起火点 ≈', w * .585, h * .19);
    for (let i = 0; i < 3; i++) {
      const tx = w * .05, ty = h * (.24 + i * .17), tw = w * .16, th = h * .12;
      c.fillStyle = PA; c.fillRect(tx, ty, tw, th);
      for (let l = 0; l < 5; l++) { c.fillStyle = `rgba(150,155,162,${.12 + .08 * Math.sin(t * 2 + l + i)})`; c.fillRect(tx + tw * .1, ty + th * (.2 + l * .15), tw * .8, th * .06); }
      c.strokeStyle = LN; c.strokeRect(tx, ty, tw, th);
      c.fillStyle = SEC; c.font = `400 ${m * .013}px ${MONO}`;
      c.fillText(['CCTV 机位', '手机视频', '事故报告'][i], tx, ty - m * .01);
      // 红色虚线汇聚
      const u = clamp((lt - .4 - i * .35) / .8, 0, 1);
      if (u > 0) {
        c.strokeStyle = RD; c.lineWidth = 1.6; c.setLineDash([7, 5]);
        c.beginPath(); c.moveTo(tx + tw, ty + th / 2);
        c.quadraticCurveTo(lerp(tx + tw, zone.x, .5), lerp(ty + th / 2, zone.y, u), lerp(tx + tw, zone.x, u), lerp(ty + th / 2, zone.y, u));
        c.stroke(); c.setLineDash([]);
        if (u >= 1) {
          const bt = clamp((lt - 1.5 - i * .12) * 8, 0, 1);
          if (bt > 0) {
            c.save(); c.translate(zone.x + (i - 1) * m * .05, zone.y + h * .12); c.scale(eBack(bt), eBack(bt));
            c.fillStyle = RD; c.fillRect(-m * .016, -m * .016, m * .032, m * .032);
            c.strokeStyle = '#fff'; c.lineWidth = 2.4;
            c.beginPath(); c.moveTo(-m * .008, 0); c.lineTo(-m * .002, m * .008); c.lineTo(m * .01, -m * .008); c.stroke();
            c.restore();
          }
        }
      }
    }
    if (lt > 2.3) {
      const cu = clamp((lt - 2.3) / .5, 0, 1);
      const ax = w * .13, ay = h * .3 + h * .17 + h * .06;
      c.strokeStyle = RD; c.lineWidth = 2.5;
      c.beginPath(); c.arc(ax, ay, m * .075, -Math.PI / 2, -Math.PI / 2 + TAU * eOut(cu)); c.stroke();
      if (cu > .6) {
        c.beginPath(); c.moveTo(ax + m * .075, ay); c.lineTo(ax + m * .22, ay - m * .06); c.stroke();
        c.fillStyle = RD; c.font = `700 ${m * .022}px ${SANS}`;
        c.fillText('裂纹 2.1 mm', ax + m * .23, ay - m * .06);
      }
    }
    const swv = (T * .8 + 1.2).toFixed(2);
    c.fillStyle = RD; c.font = `600 ${m * .04}px ${MONO}`;
    c.fillText('T+00.' + swv.split('.')[1], w * .05, h * .88);
    c.fillStyle = SEC; c.font = `400 ${m * .015}px ${MONO}`;
    c.fillText('已知 4 项 · 未解 2 项 · 虚线为推断', w * .2, h * .88);
  }
  // 切换白闪
  const wf = Math.max(0, .5 - Math.abs(T - 4) * 4);
  if (wf > 0) { c.fillStyle = `rgba(240,240,236,${wf})`; c.fillRect(0, 0, w, h); }
};


// ---- L6 ----
S.L6 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; s.tex = paperTex(Math.max(2, Math.round(w / 2)), Math.max(2, Math.round(h / 2)), 1, '#EDE4D0', 61);
    const r = rng(61); s.figs = [];
    for (let i = 0; i < 5; i++) s.figs.push({ x: .12 + r() * .72, sc: .8 + r() * .5 });
  }
  const m = Math.min(w, h), T = t % 4, beat = Math.floor(T), wu = T % 1;
  const RED = '#D52B1E', INK = '#141210', PAP = '#EDE4D0';
  const paper = beat % 2 === 0;
  c.fillStyle = paper ? PAP : INK; c.fillRect(0, 0, w, h);
  if (paper) { c.globalAlpha = .5; c.drawImage(s.tex, 0, 0, w, h); c.globalAlpha = 1; }
  const fg = paper ? INK : PAP;
  // 平行四边形窗口（影片）
  c.save();
  c.transform(1, 0, -0.32, 1, w * .56, h * .08);
  c.beginPath(); c.rect(0, 0, w * .34, h * .5); c.clip();
  c.fillStyle = paper ? '#4c4238' : '#2c2620'; c.fillRect(0, 0, w * .34, h * .5);
  for (let i = 0; i < 14; i++) {
    const y = ((i * .09 + t * .21) % 1.2 - .1) * h * .5;
    c.fillStyle = `rgba(${paper ? '220,205,180' : '180,160,130'},${.14 + .1 * Math.sin(t * 9 + i)})`;
    c.fillRect(-w * .1, y, w * .5, h * .035);
  }
  for (let i = 0; i < 8; i++) {
    const x = ((i * .17 + t * .1) % 1.1) * w * .34;
    c.fillStyle = 'rgba(20,16,12,.65)'; c.fillRect(x, h * .18, w * .02, h * .32);
  }
  c.restore();
  c.strokeStyle = INK; c.lineWidth = m * .008;
  c.beginPath(); c.moveTo(w * .56, h * .08); c.lineTo(w * .9, h * .08); c.lineTo(w * .9 - w * .16, h * .58); c.lineTo(w * .4, h * .58); c.closePath(); c.stroke();
  // 红色斜带（−18°）与数字
  c.save(); c.translate(w * .5, h * .58); c.rotate(-18 * Math.PI / 180);
  c.fillStyle = RED; c.fillRect(-w, -h * .1, w * 2, h * .2);
  const n = Math.round(eOut(clamp((T % 2) / 1.1, 0, 1)) * 25 / 25) * 25;
  const nn = String(Math.max(25, Math.round(eOut(clamp((T % 2) / 1.1, 0, 1)) * 2500 / 25) * 25));
  const fs = h * .17;
  c.font = `700 ${fs}px ${MONO}`; c.textBaseline = 'middle';
  for (let i = 0; i < nn.length; i++) {
    const age = T % 2 - i * .12;
    const dy = age > 0 ? 0 : -h * .02;
    c.fillStyle = age > 0 ? PAP : 'rgba(237,228,208,.4)';
    c.fillText(nn[i], -w * .28 + i * fs * .56, dy);
  }
  c.fillStyle = INK; c.fillRect(w * .06, -h * .045, w * .17, h * .09);
  c.fillStyle = PAP; c.font = `700 ${h * .055}px ${SANS}`;
  c.fillText('人 / 天', w * .085, 0);
  c.restore();
  // 竖排口号
  const slogan = '建 造 者'.split(' ');
  for (let i = 0; i < slogan.length; i++) {
    const age = T - i * .28;
    if (age < 0) continue;
    const sc = lerp(1.6, 1, eBack(clamp(age / .16, 0, 1)));
    c.save(); c.translate(w * .08, h * .12 + i * h * .13); c.scale(sc, sc);
    c.fillStyle = fg; c.font = `900 ${h * .11}px ${SANS}`; c.textBaseline = 'middle';
    c.fillText(slogan[i], 0, 0);
    c.restore();
  }
  // 剪纸人物（照片剪影 + 纸白边）
  for (const f of s.figs) {
    const x = f.x * w, y = h * .93, sc = f.sc * m * .001;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = PAP;
    c.beginPath(); c.arc(0, -64, 34, 0, TAU); c.fill();
    c.fillRect(-40, -40, 80, 120);
    c.fillStyle = INK;
    c.beginPath(); c.arc(0, -64, 26, 0, TAU); c.fill();
    c.fillRect(-32, -34, 64, 108);
    c.restore();
  }
  // 来源标签
  c.fillStyle = paper ? INK : PAP;
  c.fillRect(w * .62, h * .82, w * .3, m * .036);
  c.fillStyle = paper ? PAP : INK; c.font = `700 ${m * .018}px ${MONO}`; c.textBaseline = 'middle';
  c.fillText('FILM · 帝国大厦 · 1930', w * .63, h * .82 + m * .018);
  c.textBaseline = 'alphabetic';
  // 红色擦除换场
  if (wu < .25) {
    const u = wu / .25, ang = 72 * Math.PI / 180;
    c.save(); c.translate(w * .5, h * .5); c.rotate(ang);
    const x0 = lerp(-w, w, u);
    c.fillStyle = RED; c.fillRect(x0 - w * .12, -h, w * .22, h * 2.2);
    c.fillStyle = hex('#fff', .5); c.fillRect(x0 + w * .1, -h, w * .01, h * 2.2);
    c.restore();
  }
};


// ---- L7 ----
S.L7 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const r = rng(71); s.pl = [];
    for (let i = 0; i < 10; i++) s.pl.push({ x0: .12 + r() * .76, y0: .5 + r() * .42, vx: (r() - .5) * .02, vy: (r() - .5) * .012, team: i < 5 ? 0 : 1, ph: r() * TAU });
    s.shots = []; for (let i = 0; i < 9; i++) s.shots.push({ x: .2 + r() * .6, y: .25 + r() * .5, s: r() < .3 ? 1 : 0 });
  }
  const m = Math.min(w, h), D = 10, T = t % D;
  const YEL = '#FFD400', CYA = '#3FD8FF', RED = '#FF3B30', CH = '#F4F1E8';
  const freeze = T >= 2.6 && T < 5.9, board = T >= 7.35;
  const punch = freeze ? lerp(1.035, 1, eOut(clamp((T - 2.6) / .35, 0, 1))) * (1 + .012 * ss(3, 5.8, T)) : 1;
  const ballP = clamp(T / 2.6, 0, 1);
  const pitch = () => {
    c.save();
    c.translate(w / 2, h / 2); c.scale(punch, punch); c.translate(-w / 2, -h / 2);
    const g = c.createLinearGradient(0, h * .28, 0, h);
    g.addColorStop(0, '#1c4a2a'); g.addColorStop(.25, '#2c6a38'); g.addColorStop(1, '#173f22');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#12281c'; c.fillRect(0, 0, w, h * .3);
    for (let i = 0; i < 24; i++) {
      c.fillStyle = `rgba(220,230,240,${.05 + .04 * Math.sin(t * 4 + i)})`;
      c.fillRect(i * w / 24, h * .1, w / 24, h * .16);
    }
    c.strokeStyle = hex(CH, .8); c.lineWidth = 3;
    const hy = h * .3;
    const px0 = (f) => ({ l: lerp(-w * .15, w * .22, f), r: lerp(w * 1.15, w * .78, f), y: lerp(h * 1.02, hy, f) });
    for (const f of [.06, .3, .5, .72, .94]) {
      const q = px0(f);
      c.beginPath(); c.moveTo(q.l, q.y); c.lineTo(q.r, q.y); c.stroke();
    }
    c.beginPath(); c.moveTo(w * .22, hy); c.lineTo(w * .78, hy); c.stroke();
    c.beginPath(); c.ellipse(w * .5, lerp(h * 1.02, hy, .5), w * .13, h * .07, 0, 0, TAU); c.stroke();
    c.beginPath(); c.moveTo(w * .27, lerp(h * 1.02, hy, .18)); c.lineTo(w * .73, lerp(h * 1.02, hy, .18)); c.stroke();
    // 球员
    for (const p of s.pl) {
      const px = (p.x0 + p.vx * T + Math.sin(T * 1.4 + p.ph) * .012) * w;
      const py = (p.y0 + p.vy * T) * h;
      const k = .5 + (py / h) * .8;
      c.fillStyle = p.team ? CYA : YEL;
      c.beginPath(); c.arc(px, py, m * .012 * k, 0, TAU); c.fill();
      c.strokeStyle = hex(p.team ? CYA : YEL, .5); c.lineWidth = 2;
      c.beginPath(); c.ellipse(px, py + m * .012 * k, m * .026 * k, m * .01 * k, 0, 0, TAU); c.stroke();
    }
    // 球
    let bx, by;
    if (T < 2.6) { bx = lerp(.3, .42, ballP) * w; by = lerp(.82, .66, ballP) * h; }
    else if (T < 5.9) { bx = .42 * w; by = .66 * h; }
    else { const u = clamp((T - 5.9) / 1.1, 0, 1); bx = lerp(.42, .62, u) * w; by = lerp(.66, .38, u * u) * h; }
    glowDot(c, bx, by, m * .03, '#ffffff', .5);
    c.fillStyle = '#fff'; c.beginPath(); c.arc(bx, by, m * .012, 0, TAU); c.fill();
    // 冻结特效
    if (freeze) {
      c.fillStyle = 'rgba(120,128,138,.32)'; c.fillRect(0, 0, w, h);
      const spot = clamp((T - 2.9) / .3, 0, 1);
      if (spot > 0) {
        const g2 = c.createRadialGradient(w * .42, h * .66, m * .06, w * .42, h * .66, m * .62);
        g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(1, `rgba(4,8,10,${.5 * spot})`);
        c.fillStyle = g2; c.fillRect(0, 0, w, h);
      }
      const ru = clamp((T - 3) / .5, 0, 1);
      if (ru > 0) {
        c.strokeStyle = YEL; c.lineWidth = 5;
        c.beginPath(); c.ellipse(w * .42, h * .685, m * .075, m * .027, 0, -Math.PI / 2, -Math.PI / 2 + TAU * eOut(ru)); c.stroke();
        c.setLineDash([9, 8]); c.lineWidth = 2.5;
        c.save(); c.translate(0, 0); c.rotate(0);
        c.beginPath(); c.ellipse(w * .42, h * .685, m * .095, m * .036, 0, t * .6, t * .6 + TAU); c.stroke();
        c.restore(); c.setLineDash([]);
      }
      const su = clamp((T - 3.6) / .45, 0, 1);
      if (su > 0) {
        c.fillStyle = hex(RED, .36); c.strokeStyle = RED; c.lineWidth = 2.5; c.setLineDash([10, 7]);
        c.beginPath(); c.ellipse(w * .62, h * .56, w * .11, h * .1, 0, 0, TAU);
        c.fill(); c.stroke(); c.setLineDash([]);
      }
      const au = clamp((T - 4) / .5, 0, 1);
      if (au > 0) {
        c.strokeStyle = CYA; c.lineWidth = 4.5; c.setLineDash([16, 10]);
        c.beginPath(); c.moveTo(w * .5, h * .7);
        c.quadraticCurveTo(w * .58, h * .62, lerp(w * .5, w * .62, eOut(au)), lerp(h * .7, h * .56, eOut(au)));
        c.stroke(); c.setLineDash([]);
        if (au > .8) {
          c.fillStyle = CYA; c.beginPath();
          c.moveTo(w * .62, h * .56); c.lineTo(w * .6, h * .53); c.lineTo(w * .645, h * .535); c.closePath(); c.fill();
        }
      }
      const lu = clamp((T - 4.5) / .35, 0, 1);
      if (lu > 0) {
        const lx = w * .58, ly = h * .34, lw = w * .32, lh = m * .13;
        c.fillStyle = 'rgba(8,12,14,.9)'; c.fillRect(lx - w * .05 * (1 - eOut(lu)), ly, lw, lh);
        c.fillStyle = YEL; c.fillRect(lx - w * .05 * (1 - eOut(lu)), ly, m * .009, lh);
        c.fillStyle = CH; c.font = `900 ${m * .042}px ${SANS}`; c.textBaseline = 'middle';
        c.fillText('没人上前逼抢', lx + m * .02, ly + lh * .34);
        c.fillStyle = YEL; c.font = `600 ${m * .021}px ${MONO}`;
        c.fillText('NO PRESS', lx + m * .02, ly + lh * .74);
        c.textBaseline = 'alphabetic';
      }
    }
    c.restore();
    // 记分条 / 来源钟
    const flip = clamp((T - 5.95) / .5, 0, 1);
    const sc2 = flip > 0 && flip < 1 ? 3 : 2;
    const fb = eOut(flip);
    c.fillStyle = 'rgba(8,12,14,.9)'; c.fillRect(w * .72, h * .86, w * .25, m * .09);
    c.fillStyle = CH; c.font = `800 ${m * .05}px ${MONO}`; c.textBaseline = 'middle';
    c.fillText('主队 ' + sc2 + ' — 3 客队', w * .735, h * .86 + m * .045);
    if (flip > 0 && flip < 1) {
      c.fillStyle = hex(YEL, (1 - flip) * .8); c.fillRect(w * .72, h * .86, w * .25, m * .09);
    }
    c.textBaseline = 'alphabetic';
    if (freeze) {
      c.fillStyle = 'rgba(8,12,14,.84)'; c.fillRect(m * .05, m * .05, m * .34, m * .06);
      c.fillStyle = CH; c.font = `500 ${m * .024}px ${MONO}`;
      c.fillText('❚❚ 04.' + String(Math.floor((T * 20) % 100)).padStart(2, '0') + 's F106', m * .07, m * .09);
    }
  };
  if (board) {
    const u = clamp((T - 7.35) / .34, 0, 1);
    pitch();
    c.save(); c.beginPath(); c.rect(0, 0, w * eOut(u), h); c.clip();
    c.fillStyle = '#0C1411'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(244,241,232,.06)'; c.lineWidth = 1;
    for (let x = 0; x < w; x += m * .083) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    for (let y = 0; y < h; y += m * .083) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    const rows = [['射门位置', '大禁区外 22.4 m'], ['预期进球', '0.42 xG'], ['控球率', '61 %']];
    for (let i = 0; i < rows.length; i++) {
      const rv = clamp((T - 7.7 - i * .25) / .4, 0, 1);
      c.fillStyle = CH; c.font = `700 ${m * .038}px ${SANS}`;
      c.fillText(rows[i][0], w * .06, h * (.28 + i * .16));
      c.fillStyle = YEL; c.font = `800 ${m * .062}px ${MONO}`;
      c.fillText(rows[i][1], w * .06, h * (.28 + i * .16) + m * .075);
      c.fillStyle = 'rgba(120,140,130,.6)'; c.font = `500 ${m * .018}px ${MONO}`;
      c.fillText('FRAME COUNT · 源帧统计', w * .06, h * (.28 + i * .16) + m * .108);
    }
    // 射门图
    c.strokeStyle = CH; c.lineWidth = 2;
    c.strokeRect(w * .52, h * .16, w * .42, h * .62);
    c.beginPath(); c.moveTo(w * .73, h * .16); c.lineTo(w * .73, h * .78); c.stroke();
    c.beginPath(); c.arc(w * .73, h * .47, m * .09, 0, TAU); c.stroke();
    c.fillStyle = hex(RED, .32); c.fillRect(w * .56, h * .38, w * .12, h * .18);
    for (const q of s.shots) {
      const uu = clamp((T - 7.8 - q.x) / .3, 0, 1);
      if (uu <= 0) continue;
      c.fillStyle = q.s ? YEL : CYA;
      c.beginPath(); c.arc(w * (.52 + q.x * .42), h * (.16 + q.y * .62), (q.s ? m * .017 : m * .011) * eBack(uu), 0, TAU); c.fill();
    }
    const scanY = h * .16 + ((t * .1) % 1) * h * .62;
    const sgd = c.createLinearGradient(0, scanY - h * .05, 0, scanY + h * .05);
    sgd.addColorStop(0, 'rgba(255,212,0,0)'); sgd.addColorStop(.5, 'rgba(255,212,0,.05)'); sgd.addColorStop(1, 'rgba(255,212,0,0)');
    c.fillStyle = sgd; c.fillRect(w * .52, scanY - h * .05, w * .42, h * .1);
    c.fillStyle = YEL; c.font = `800 ${m * .09}px ${MONO}`;
    c.fillText('0.42', w * .58, h * .92);
    c.fillStyle = 'rgba(244,241,232,.7)'; c.font = `500 ${m * .022}px ${SANS}`;
    c.fillText('关键射门 · 被漏防区域', w * .72, h * .92);
    c.restore();
    if (u < 1) {
      const bx2 = w * eOut(u);
      c.fillStyle = YEL; c.fillRect(bx2 - m * .06, 0, m * .075, h);
      c.fillStyle = 'rgba(8,12,14,.9)'; c.fillRect(bx2 + m * .015, 0, m * .012, h);
    }
  } else {
    pitch();
    const fl = freeze ? Math.max(0, .55 - (T - 2.6) * 5.5) : 0;
    if (fl > 0) { c.fillStyle = `rgba(255,255,255,${fl})`; c.fillRect(0, 0, w, h); }
  }
  // 角标
  c.fillStyle = YEL; c.fillRect(w * .78, h * .05, w * .17, m * .062);
  c.fillStyle = '#080C0E'; c.font = `900 ${m * .03}px ${SANS}`; c.textBaseline = 'middle';
  c.fillText('战术眼', w * .795, h * .05 + m * .031);
  c.fillStyle = 'rgba(8,12,14,.9)'; c.fillRect(w * .78, h * .05 + m * .062, w * .17, m * .036);
  c.fillStyle = freeze ? YEL : (board ? CYA : '#FF3B30');
  c.beginPath(); c.arc(w * .795, h * .05 + m * .08, m * .008, 0, TAU); c.fill();
  c.font = `600 ${m * .018}px ${MONO}`;
  c.fillText(board ? 'REPLAY 战术板' : (freeze ? 'ANALYSIS 分析' : 'LIVE 直播'), w * .81, h * .05 + m * .081);
  c.textBaseline = 'alphabetic';
};


// ---- L8 ----
S.L8 = (c, w, h, t, s) => {
  const m = Math.min(w, h), D = 9, T = t % D;
  const INK = '#121417', INK2 = '#1B1E23', INK3 = '#22262C', ACC = '#F2CF1D', GOLD = '#D4B064', PAP = '#F4F1E8';
  const drawMain = (p, lt) => {
    c.fillStyle = INK; c.fillRect(0, 0, w, h);
    // 包装光带（持续微动）
    for (let i = 0; i < 6; i++) {
      const fx2 = ((i * .19 + t * .028) % 1.2 - .1) * w;
      const lg = c.createLinearGradient(fx2, 0, fx2 + w * .1, h);
      lg.addColorStop(0, 'rgba(242,207,29,0)'); lg.addColorStop(.5, 'rgba(242,207,29,.05)'); lg.addColorStop(1, 'rgba(242,207,29,0)');
      c.fillStyle = lg; c.fillRect(fx2, -h * .1, w * .1, h * 1.2);
    }
    if (p === 0) {
      const du = eOut(clamp(lt / .4, 0, 1));
      c.fillStyle = ACC; c.fillRect(w * .07, h * .14, w * .17, h * .3);
      c.fillStyle = INK; c.font = `800 ${m * .19}px ${MONO}`; c.textBaseline = 'middle';
      c.fillText('26', w * .105, h * .28);
      c.font = `600 ${m * .028}px ${MONO}`;
      c.fillText('NOV · W48', w * .085, h * .4);
      const rows = [['01', '大模型发布', '模型 MODELS'], ['02', '算力价格异动', '市场 MARKETS'], ['03', '监管问询函', '监管 POLICY']];
      for (let i = 0; i < 3; i++) {
        const ru = eBack(clamp((lt - .25 - i * .22) / .4, 0, 1));
        const ry = h * (.14 + i * .2) + (1 - ru) * h * .12;
        c.fillStyle = INK2; c.fillRect(w * .3, ry, w * .62, h * .17);
        c.fillStyle = ACC; c.fillRect(w * .3, ry, w * .055, h * .17);
        c.fillStyle = INK; c.font = `800 ${m * .05}px ${MONO}`;
        c.fillText(rows[i][0], w * .312, ry + h * .085);
        c.fillStyle = PAP; c.font = `900 ${m * .052}px ${SANS}`;
        c.fillText(rows[i][1], w * .385, ry + h * .07);
        c.fillStyle = GOLD; c.font = `500 ${m * .02}px ${MONO}`;
        c.fillText(rows[i][2], w * .385, ry + h * .125);
        const gl = (lt - .8 - i * .2) * 1.6;
        if (gl > 0 && gl < 1) {
          const gx = w * .3 + gl * w * .62;
          const gg = c.createLinearGradient(gx - w * .06, 0, gx + w * .06, 0);
          gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(.5, 'rgba(255,255,255,.16)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
          c.fillStyle = gg; c.fillRect(gx - w * .06, ry, w * .12, h * .17);
        }
      }
      c.textBaseline = 'alphabetic';
    } else if (p === 1) {
      const old = '0820', nw = '1150';
      for (let i = 0; i < 4; i++) {
        const fu = clamp((lt - .3 - i * .18) / .5, 0, 1);
        const tx = w * (.22 + i * .145), ty = h * .3, tw = w * .12, th = h * .22;
        c.fillStyle = INK3; c.fillRect(tx, ty, tw, th);
        const sq = Math.abs(Math.cos(fu * Math.PI));
        c.save(); c.beginPath(); c.rect(tx, ty, tw, th / 2); c.clip();
        c.fillStyle = INK; c.fillRect(tx, ty + th / 2 * (1 - sq), tw, th / 2);
        c.fillStyle = PAP; c.font = `800 ${m * .12}px ${MONO}`; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(fu < .5 ? old[i] : nw[i], tx + tw / 2, ty + th * .26 + th / 2 * (1 - sq) * .5);
        c.restore();
        c.save(); c.beginPath(); c.rect(tx, ty + th / 2, tw, th / 2); c.clip();
        c.fillStyle = INK; c.fillRect(tx, ty + th / 2, tw, th / 2 * sq);
        c.fillStyle = PAP;
        c.fillText(fu < .5 ? old[i] : nw[i], tx + tw / 2, ty + th * .76 - th / 2 * (1 - sq) * .5);
        c.restore();
        c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(tx, ty + th / 2 - 1, tw, 2);
        c.fillStyle = INK3; c.fillRect(tx, ty, tw, th); c.globalAlpha = 0; c.globalAlpha = 1;
      }
      c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      c.fillStyle = ACC; c.font = `800 ${m * .06}px ${MONO}`;
      c.fillText('+40.2%', w * .82, h * .38);
      c.fillStyle = GOLD; c.font = `500 ${m * .022}px ${MONO}`;
      c.fillText('本月算力均价', w * .82, h * .44);
      c.fillStyle = PAP; c.font = `900 ${m * .045}px ${SANS}`;
      c.fillText('推理价格 · 分/千token', w * .22, h * .25);
    } else {
      const gx0 = w * .12, gy0 = h * .2, gw2 = w * .76, gh2 = h * .5;
      c.strokeStyle = 'rgba(212,176,100,.35)'; c.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        c.beginPath(); c.moveTo(gx0, gy0 + i * gh2 / 4); c.lineTo(gx0 + gw2, gy0 + i * gh2 / 4); c.stroke();
      }
      const thr = gy0 + gh2 * .38;
      c.strokeStyle = GOLD; c.lineWidth = 2; c.setLineDash([10, 8]);
      c.beginPath(); c.moveTo(gx0, thr); c.lineTo(gx0 + gw2, thr); c.stroke(); c.setLineDash([]);
      const npt = 13, prog = clamp(lt / 1.9, 0, 1);
      const yv = (i) => gy0 + gh2 * (.85 - .6 * (i / (npt - 1)) - .12 * Math.sin(i * 1.1));
      c.strokeStyle = PAP; c.lineWidth = 3;
      c.beginPath();
      const kmax = Math.floor(prog * (npt - 1));
      for (let i = 0; i <= kmax; i++) {
        const xx = gx0 + i / (npt - 1) * gw2, yy = yv(i);
        i ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
      }
      c.stroke();
      const cross = yv(npt - 1) < thr;
      if (kmax > 1 && cross) {
        c.strokeStyle = ACC; c.lineWidth = 4;
        c.beginPath();
        for (let i = Math.max(0, kmax - 2); i <= kmax; i++) {
          const xx = gx0 + i / (npt - 1) * gw2, yy = yv(i);
          i === Math.max(0, kmax - 2) ? c.moveTo(xx, yy) : c.lineTo(xx, yy);
        }
        c.stroke();
        const hx = gx0 + kmax / (npt - 1) * gw2, hy = yv(kmax);
        const ru = clamp((lt - 1.85) / .6, 0, 1);
        if (ru > 0) {
          c.strokeStyle = ACC; c.lineWidth = 3;
          c.beginPath(); c.arc(hx, hy, m * .02 + m * .12 * eOut(ru), 0, TAU); c.globalAlpha = 1 - ru; c.stroke(); c.globalAlpha = 1;
        }
      }
      const sh = lt > 1.85 && lt < 2.3 ? Math.exp(-(lt - 1.85) * 12) * 12 : 0;
      if (sh > .2) { c.translate(nz(t * 40, 1, 0) * sh, nz(1, t * 40, 0) * sh); }
      const rp = eOut(clamp((lt - 2.1) / .4, 0, 1));
      if (rp > 0) {
        c.fillStyle = INK2; c.fillRect(w * .62 + w * .3 * (1 - rp), h * .55, w * .3, h * .17);
        c.fillStyle = ACC; c.fillRect(w * .62 + w * .3 * (1 - rp), h * .55, w * .3, m * .008);
        const headPulse = 1 + .12 * Math.sin(t * 5);
        glowDot(c, gx0 + kmax / (npt - 1) * gw2, yv(kmax), m * .05 * headPulse, '#F2CF1D', .3);
        c.fillStyle = PAP; c.font = `800 ${m * .05}px ${MONO}`;
        c.fillText('¥1 490', w * .635 + w * .3 * (1 - rp), h * .63);
        c.fillStyle = GOLD; c.font = `500 ${m * .02}px ${MONO}`;
        c.fillText('较阈值 +18%', w * .635 + w * .3 * (1 - rp), h * .685);
      }
      c.fillStyle = GOLD; c.font = `500 ${m * .02}px ${MONO}`;
      c.fillText('阈值 THRESHOLD', gx0, thr - m * .014);
    }
  };
  const phase = T < 3 ? 0 : T < 6 ? 1 : 2;
  const wu = T >= 3 && T < 3.3 ? (T - 3) / .3 : T >= 6 && T < 6.3 ? (T - 6) / .3 : -1;
  const ltOf = (p) => T - [0, 3, 6][p];
  if (wu >= 0) {
    const prev = phase === 1 ? 0 : 1;
    drawMain(prev, ltOf(prev));
    c.save(); c.beginPath(); c.rect(0, 0, w * eOut(wu), h); c.clip();
    drawMain(phase, ltOf(phase));
    c.restore();
    const bx = w * eOut(wu);
    c.fillStyle = ACC; c.fillRect(bx - m * .115, 0, m * .117, h);
    c.fillStyle = INK; c.fillRect(bx + m * .002, 0, m * .007, h);
    c.fillStyle = GOLD; c.fillRect(bx + m * .009, 0, m * .02, h);
  } else {
    drawMain(phase, ltOf(phase));
  }
  // 品牌角标
  c.save(); c.translate(w * .845, h * .055);
  c.transform(1, 0, -0.18, 1, 0, 0);
  const pg = c.createLinearGradient(0, 0, w * .12, 0);
  pg.addColorStop(0, ACC); pg.addColorStop(1, '#D8B30C');
  c.fillStyle = pg; c.fillRect(0, 0, w * .115, m * .06);
  c.fillStyle = INK; c.fillRect(0, 0, w * .012, m * .06);
  c.fillStyle = INK; c.font = `800 ${m * .026}px ${MONO}`;
  c.fillText('AI NEWS', w * .022, m * .042);
  c.restore();
  // 下三分之一带
  const cats = ['模型 MODELS', '市场 MARKETS', '监管 POLICY'];
  const words = ['新模型今日开源', '算力价格异动', '监管发出问询'];
  c.fillStyle = ACC; c.fillRect(w * .05, h * .845, w * .17, m * .05);
  c.fillStyle = INK; c.font = `700 ${m * .024}px ${SANS}`; c.textBaseline = 'middle';
  c.fillText(cats[phase], w * .065, h * .845 + m * .025);
  const flip = wu >= 0 ? eOut(wu) : 0;
  c.save(); c.beginPath(); c.rect(w * .05, h * .915, w * .65, m * .075); c.clip();
  c.fillStyle = PAP; c.fillRect(w * .05, h * .915, w * .65, m * .075);
  c.fillStyle = INK; c.font = `900 ${m * .04}px ${SANS}`;
  const oldW = words[(phase + 2) % 3], newW = words[phase];
  c.fillText(oldW, w * .07, h * .915 + m * .037 - flip * m * .075);
  c.fillText(newW, w * .07, h * .915 + m * .037 + (1 - flip) * m * .075);
  c.restore();
  c.fillStyle = INK3; c.fillRect(w * .7, h * .915, w * .075, m * .075);
  c.fillStyle = GOLD; c.font = `500 ${m * .016}px ${MONO}`;
  c.fillText('W48', w * .715, h * .915 + m * .037);
  c.textAlign = 'right'; c.fillStyle = 'rgba(244,241,232,.75)'; c.font = `500 ${m * .015}px ${MONO}`;
  c.fillText('SOURCE: 公司公告 · 交易所数据 · 2026.11.26', w * .95, h * .885);
  c.fillText('图为示意 SCHEMATIC · ' + String(Math.floor(t * 100) % 100000).padStart(5, '0'), w * .95, h * .912);
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
};


// ---- L9 ----
S.L9 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const r = rng(91); s.pat = []; s.coast = [];
    for (let i = 0; i < 42; i++) s.pat.push({ x: r() * 1.8 - .4, y: r() * 1.8 - .4, rx: .03 + r() * .13, ry: .02 + r() * .09, g: 40 + r() * 120, a: .5 + r() * .5 });
    for (let i = 0; i < 30; i++) {
      const a = i / 30 * TAU;
      s.coast.push([Math.cos(a) * (.5 + .14 * Math.sin(a * 2.3) + .07 * Math.cos(a * 3.7)), Math.sin(a) * (.38 + .12 * Math.cos(a * 1.9))]);
    }
  }
  const m = Math.min(w, h), D = 8, T = t % D;
  const GR = '#070B0E', WH = '#F2F5F6', AMB = '#FFBE55', MAPB = '#2E70CE';
  c.fillStyle = GR; c.fillRect(0, 0, w, h);
  const dive = T < 3 ? eOut(T / 3) : T < 5.6 ? 1 : 1 - eOut((T - 5.6) / 2.4) * .82;
  const z = Math.exp(dive * Math.log(4.6)) * (1 + .012 * Math.sin(t * .5));
  const fx = .12, fy = -.06;
  const cam = (x, y) => [w * .5 + (x - fx) * z * m * 1.5, h * .5 + (y - fy) * z * m * 1.5];
  // 地面
  c.fillStyle = '#2c3236';
  c.fillRect(0, 0, w, h);
  for (const p of s.pat) {
    const [sx, sy] = cam(p.x, p.y);
    const g2 = Math.round(p.g);
    c.fillStyle = `rgba(${g2},${g2 + 6},${g2 + 8},${p.a * .5})`;
    c.beginPath(); c.ellipse(sx, sy, p.rx * z * m * 1.5, p.ry * z * m * 1.5, 0, 0, TAU); c.fill();
  }
  c.beginPath();
  for (let i = 0; i < s.coast.length; i++) {
    const [sx, sy] = cam(s.coast[i][0], s.coast[i][1]);
    i ? c.lineTo(sx, sy) : c.moveTo(sx, sy);
  }
  c.closePath(); c.fillStyle = '#0d1216'; c.fill();
  c.strokeStyle = 'rgba(255,255,255,.07)'; c.lineWidth = 1;
  for (let i = -2; i <= 2; i++) {
    let [ax, ay] = cam(i * .3, -.6), [bx2, by2] = cam(i * .3, .6);
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx2, by2); c.stroke();
    [ax, ay] = cam(-.6, i * .3); [bx2, by2] = cam(.6, i * .3);
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx2, by2); c.stroke();
  }
  // 声称图层（旧地图岸线）
  const claimU = clamp((T - .8) / .8, 0, 1);
  if (claimU > 0) {
    c.strokeStyle = MAPB; c.lineWidth = 2; c.setLineDash([8, 6]);
    c.beginPath();
    for (let i = 0; i <= Math.floor(claimU * s.coast.length); i++) {
      const q = s.coast[i % s.coast.length], [sx, sy] = cam(q[0] * 1.08, q[1] * 1.08);
      i ? c.lineTo(sx, sy) : c.moveTo(sx, sy);
    }
    c.stroke(); c.setLineDash([]);
  }
  // 时间环
  const ringU = clamp((T - 3.2) / 2.2, 0, 1);
  if (ringU > 0) {
    const rings = [['1990', .16], ['2005', .22], ['2024', .28]];
    for (let i = 0; i < 3; i++) {
      const u = clamp((ringU * 3 - i) / .8, 0, 1);
      if (u <= 0) continue;
      const [sx, sy] = cam(.12, -.06);
      c.strokeStyle = hex(WH, .8); c.lineWidth = 1.6; c.setLineDash([6, 5]);
      c.beginPath(); c.ellipse(sx, sy, rings[i][1] * z * m * 1.5, rings[i][1] * .82 * z * m * 1.5, 0, -Math.PI / 2, -Math.PI / 2 + TAU * eOut(u)); c.stroke();
      c.setLineDash([]);
      c.fillStyle = hex(WH, .85); c.font = `500 ${m * .018}px ${MONO}`;
      c.fillText(rings[i][0], sx + rings[i][1] * z * m * 1.5 + 6, sy - 4);
    }
    const bandY = h * (ringU % 1) * 1.1 - h * .05;
    const bg = c.createLinearGradient(0, bandY - h * .06, 0, bandY + h * .06);
    bg.addColorStop(0, 'rgba(242,245,246,0)'); bg.addColorStop(.5, 'rgba(242,245,246,.12)'); bg.addColorStop(1, 'rgba(242,245,246,0)');
    c.fillStyle = bg; c.fillRect(0, bandY - h * .06, w, h * .12);
  }
  // 测距线
  const lineU = clamp((T - 5.7) / 1.4, 0, 1);
  const [ax, ay] = cam(-.1, .05), [bx2, by2] = cam(.32, -.18);
  if (lineU > 0) {
    const tx = lerp(ax, bx2, eOut(lineU)), ty = lerp(ay, by2, eOut(lineU));
    c.strokeStyle = '#0a0e11'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(tx, ty); c.stroke();
    c.strokeStyle = WH; c.lineWidth = 1.8;
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(tx, ty); c.stroke();
    for (let i = 0; i <= 8; i++) {
      const u = i / 8; if (u > eOut(lineU)) break;
      const qx = lerp(ax, bx2, u), qy = lerp(ay, by2, u), an = Math.atan2(by2 - ay, bx2 - ax);
      c.beginPath(); c.moveTo(qx + Math.cos(an + Math.PI / 2) * 5, qy + Math.sin(an + Math.PI / 2) * 5);
      c.lineTo(qx + Math.cos(an - Math.PI / 2) * 5, qy + Math.sin(an - Math.PI / 2) * 5); c.stroke();
    }
    c.fillStyle = WH;
    c.beginPath(); c.arc(ax, ay, 4, 0, TAU); c.fill();
    glowDot(c, tx, ty, 14, AMB, .5);
    const val = (3.4 * eOut(lineU)).toFixed(1);
    c.fillStyle = AMB; c.font = `300 ${m * .1}px ${MONO}`;
    c.fillText(val, tx + m * .03, ty - m * .02);
    c.fillStyle = hex(WH, .8); c.font = `500 ${m * .022}px ${SANS}`;
    c.fillText('公里 · 岸线后退', tx + m * .03, ty + m * .035);
  }
  // 锁定十字
  const retU = eBack(clamp((T - 2.4) / .5, 0, 1));
  const [cxp, cyp] = cam(fx, fy), br = lerp(m * .3, m * .12, retU);
  c.strokeStyle = WH; c.lineWidth = 2.4;
  for (const [sx2, sy2] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    c.beginPath();
    c.moveTo(cxp + sx2 * br - sx2 * br * .38, cyp + sy2 * br);
    c.lineTo(cxp + sx2 * br, cyp + sy2 * br);
    c.lineTo(cxp + sx2 * br, cyp + sy2 * br - sy2 * br * .38);
    c.stroke();
  }
  c.fillStyle = hex(WH, .8); c.font = `500 ${m * .016}px ${MONO}`;
  c.fillText('LOCK · 目标点', cxp + br + 8, cyp - br + 4);
  // 仪表（屏幕空间）
  c.fillStyle = hex(WH, .85); c.font = `500 ${m * .018}px ${MONO}`;
  c.fillText('ANALYST · N45.2° E6.7° · 测绘窗口', m * .04, h * .05);
  const alt = Math.exp(lerp(Math.log(800), Math.log(2), dive)).toFixed(dive > .9 ? 1 : 0);
  c.textAlign = 'right';
  c.fillText('ALT ' + alt + ' km · ZOOM ×' + z.toFixed(1), w - m * .04, h * .05);
  c.textAlign = 'left';
  const barLen = m * .16, barU = dive;
  const sv = barU < .33 ? '500 km' : barU < .6 ? '50 km' : barU < .85 ? '5 km' : '1 km';
  c.strokeStyle = WH; c.lineWidth = 2;
  c.beginPath(); c.moveTo(m * .04, h * .94); c.lineTo(m * .04 + barLen, h * .94); c.stroke();
  c.beginPath(); c.moveTo(m * .04, h * .932); c.lineTo(m * .04, h * .948); c.moveTo(m * .04 + barLen, h * .932); c.lineTo(m * .04 + barLen, h * .948); c.stroke();
  c.fillStyle = WH; c.font = `500 ${m * .018}px ${MONO}`;
  c.fillText(sv, m * .04 + barLen + 10, h * .945);
  c.textAlign = 'right'; c.fillStyle = hex(WH, .55); c.font = `500 ${m * .014}px ${MONO}`;
  c.fillText('影像 Landsat · USGS · 公共领域', w - m * .04, h * .955);
  c.textAlign = 'left';
  const subU = eOut(clamp((T - 6.4) / .3, 0, 1));
  if (subU > 0) {
    c.fillStyle = hex(WH, .9 * subU); c.fillRect(m * .04, h * .86, w * .3 * subU, 2);
    c.fillStyle = hex(WH, .92 * subU); c.font = `500 ${m * .026}px ${SANS}`;
    c.fillText('测量：岸线后退 3.4 公里', m * .04, h * .84);
  }
};


// ---- L10 ----
S.L10 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const r = rng(101); s.ghost = []; s.tags = [];
    for (let i = 0; i < 12; i++) s.ghost.push({ x: r() * 3000, y: r() * 1800, l: 120 + r() * 380, a: r() * TAU });
    s.tags.push({ x: 560, y: 420, txt: '货运' });
    s.tags.push({ x: 1150, y: 1220, txt: '水位' });
    s.tags.push({ x: 2280, y: 430, txt: '净空' });
  }
  const m = Math.min(w, h), D = 10, T = t % D;
  const keys = [[900, 760, 1.6, 0], [1750, 640, 1.65, 2.2], [2280, 880, 1.45, 4.6], [1500, 900, 0.42, 7.2], [1500, 900, 0.38, 10]];
  let k = 0; while (k + 2 < keys.length && T >= keys[k + 1][3]) k++;
  const u = ss(0, keys[k + 1][3] - keys[k][3], T - keys[k][3]);
  const cx = lerp(keys[k][0], keys[k + 1][0], u), cy = lerp(keys[k][1], keys[k + 1][1], u);
  const cz = Math.exp(lerp(Math.log(keys[k][2]), Math.log(keys[k + 1][2]), u));
  const bx = nz(t * .8, 1, 0) * 3, by = nz(1, t * .8, 0) * 3;
  c.save();
  c.translate(w / 2 + bx, h / 2 + by); c.scale(cz, cz); c.translate(-cx, -cy);
  // 珐琅白板
  c.fillStyle = vgrad(c, 1800, '#eef0e8', '#c6cabf'); c.fillRect(0, 0, 3000, 1800);
  c.save(); c.translate(1500, 900); c.rotate(-.42);
  const refl = c.createLinearGradient(-600, 0, 600, 0);
  refl.addColorStop(0, 'rgba(255,255,255,0)'); refl.addColorStop(.5, 'rgba(255,255,255,.12)'); refl.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = refl; c.fillRect(-600 + Math.sin(t * .22) * 260, -1500, 1200, 3000);
  c.restore();
  for (const g of s.ghost) {
    c.strokeStyle = 'rgba(120,128,118,.09)'; c.lineWidth = 26;
    c.beginPath(); c.moveTo(g.x, g.y); c.lineTo(g.x + Math.cos(g.a) * g.l, g.y + Math.sin(g.a) * g.l); c.stroke();
  }
  // 边框与笔槽
  c.fillStyle = '#a9ab9f'; c.fillRect(0, 1740, 3000, 60); c.fillRect(0, 0, 3000, 18); c.fillRect(0, 0, 18, 1800); c.fillRect(2982, 0, 18, 1800);
  for (let i = 0; i < 3; i++) { c.fillStyle = ['#2b2d31', '#22497a', '#a33427'][i]; c.fillRect(1250 + i * 210, 1752, 170, 26); }
  // 尺子
  c.fillStyle = 'rgba(190,192,186,.9)'; c.fillRect(320, 1520, 1200, 46);
  c.strokeStyle = '#5c5e58'; c.lineWidth = 2;
  for (let i = 0; i <= 20; i++) {
    c.beginPath(); c.moveTo(320 + i * 60, 1520); c.lineTo(320 + i * 60, 1520 + (i % 5 ? 12 : 26)); c.stroke();
  }
  // 蓝色尺寸线（自绘）
  const dimU = clamp((T - .3) / 1.5, 0, 1);
  const dimY = 780, dimX0 = 560, dimX1 = 560 + 700 * eOut(dimU);
  c.strokeStyle = '#22497a'; c.lineWidth = 5; c.lineCap = 'round';
  c.beginPath(); c.moveTo(dimX0, dimY); c.lineTo(dimX1, dimY); c.stroke();
  for (const xx of [dimX0, dimX1]) {
    c.beginPath(); c.moveTo(xx - 14, dimY - 18); c.lineTo(xx + 14, dimY + 18); c.moveTo(xx - 14, dimY + 18); c.lineTo(xx + 14, dimY - 18); c.stroke();
  }
  c.lineWidth = 3; c.setLineDash([12, 10]);
  c.beginPath(); c.moveTo(dimX0, dimY - 140); c.lineTo(dimX0, dimY + 60); c.moveTo(dimX1, dimY - 140); c.lineTo(dimX1, dimY + 60); c.stroke(); c.setLineDash([]); c.lineCap = 'butt';
  const tw = clamp((T - 1.2) / .6, 0, 1);
  c.fillStyle = '#22497a'; c.font = `700 58px ${SANS}`;
  c.fillText('净空 120 米'.slice(0, Math.ceil(5 * eOut(tw))), dimX0 + 40, dimY - 40);
  // 斜拉桥草图（马克笔，自绘）
  const strokes = [
    [[1500, 700], [2100, 700]],
    [[1720, 700], [1720, 480], [1880, 480], [1880, 700]],
    [[1650, 700], [1720, 480]], [[1950, 700], [1880, 480]],
    [[1500, 715], [2100, 715]]
  ];
  for (let si = 0; si < strokes.length; si++) {
    const su = clamp((T - 2.4 - si * .38) / .38, 0, 1);
    if (su <= 0) continue;
    c.strokeStyle = '#2b2d31'; c.lineWidth = 8; c.lineJoin = 'round';
    const pts = strokes[si];
    c.beginPath();
    for (let i = 1; i < pts.length; i++) {
      const seg = clamp(su * (pts.length - 1) - (i - 1), 0, 1);
      if (seg <= 0) break;
      const x0 = lerp(pts[i - 1][0], pts[i][0], seg), y0 = lerp(pts[i - 1][1], pts[i][1], seg);
      i === 1 ? c.moveTo(pts[0][0], pts[0][1]) : c.lineTo(pts[i - 1][0], pts[i - 1][1]);
      if (seg < 1) { c.lineTo(x0, y0); break; }
    }
    c.stroke();
    if (su > .95) {
      c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(strokes[si][0][0], strokes[si][0][1], 7, 0, TAU); c.fill();
    }
  }
  c.fillStyle = '#2b2d31'; c.font = `700 62px ${SANS}`;
  const txt2 = '方案 B · 斜拉';
  c.fillText(txt2.slice(0, Math.ceil(txt2.length * clamp((T - 4.2) / .7, 0, 1))), 1500, 830);
  // 照片剪贴
  const photos = [[2180, 640, 320, 240, -.05], [2520, 760, 280, 210, .06]];
  for (let i = 0; i < photos.length; i++) {
    const [px, py, pw2, ph2, rot] = photos[i];
    c.save(); c.translate(px, py); c.rotate(rot);
    c.fillStyle = 'rgba(90,92,86,.28)'; c.fillRect(-pw2 / 2 + 18, -ph2 / 2 + 22, pw2, ph2);
    c.fillStyle = '#e8e4d8'; c.fillRect(-pw2 / 2 - 10, -ph2 / 2 - 10, pw2 + 20, ph2 + 20);
    const g2 = c.createLinearGradient(0, -ph2 / 2, 0, ph2 / 2);
    g2.addColorStop(0, '#7d8b96'); g2.addColorStop(1, '#4c5a63');
    c.fillStyle = g2; c.fillRect(-pw2 / 2, -ph2 / 2, pw2, ph2);
    c.fillStyle = 'rgba(30,40,48,.8)';
    c.fillRect(-pw2 * .3, -ph2 * .1, pw2 * .6, ph2 * .1);
    c.fillRect(-pw2 * .12, -ph2 * .35, pw2 * .06, ph2 * .35);
    c.restore();
  }
  // 红笔圈 + 印章
  const circU = clamp((T - 5.2) / .5, 0, 1);
  if (circU > 0) {
    c.strokeStyle = '#c2352a'; c.lineWidth = 7;
    c.beginPath(); c.arc(2180, 640, 210, -Math.PI / 2, -Math.PI / 2 + TAU * eOut(circU)); c.stroke();
  }
  const stampU = clamp((T - 6.3) / .3, 0, 1);
  if (stampU > 0) {
    const sc = lerp(1.9, 1, eBack(stampU));
    c.save(); c.translate(2180, 380); c.rotate(-.14); c.scale(sc, sc);
    c.strokeStyle = '#c2352a'; c.lineWidth = 8; c.strokeRect(-160, -70, 320, 140);
    c.lineWidth = 3; c.strokeRect(-146, -56, 292, 112);
    c.fillStyle = '#c2352a'; c.font = `900 92px ${SANS}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('首选', 0, 6);
    c.restore(); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    c.strokeStyle = `rgba(194,53,42,${clamp(1 - (T - 6.3) * 2.2, 0, .8)})`; c.lineWidth = 5;
    c.beginPath(); c.arc(2180, 380, 180 + (T - 6.3) * 420, 0, TAU); c.stroke();
  }
  // 磁贴标签
  for (let i = 0; i < s.tags.length; i++) {
    const tg = s.tags[i], sw2 = Math.sin(t * 1.1 + i * 2) * .035;
    c.save(); c.translate(tg.x, tg.y); c.rotate(sw2);
    c.fillStyle = 'rgba(80,84,78,.3)'; c.fillRect(-90, -46, 180, 92);
    c.fillStyle = '#f2f0e6'; c.fillRect(-90, -52, 180, 92);
    c.fillStyle = '#2b2d31'; c.font = `700 52px ${SANS}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(tg.txt, 0, -4);
    c.restore(); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  }
  // 引线到结论
  const leadU = clamp((T - 7.4) / 1.2, 0, 1);
  if (leadU > 0) {
    c.strokeStyle = '#c2352a'; c.lineWidth = 8; c.setLineDash([]);
    const pts = [[2280, 520], [2280, 240], [1500, 240]];
    c.beginPath();
    const total = 780 + 780, want = total * eOut(leadU);
    c.moveTo(pts[0][0], pts[0][1]);
    if (want > 280) c.lineTo(pts[1][0], pts[1][1]);
    if (want > 280) c.lineTo(lerp(pts[1][0], pts[2][0], clamp((want - 280) / 780, 0, 1)), pts[2][1]);
    c.stroke();
    c.fillStyle = '#c2352a'; c.font = `900 130px ${SANS}`;
    c.fillText('船说了算', 1020, 190);
  }
  c.restore();
};


// ---- L11 ----
S.L11 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const r = rng(111); s.pts = [];
    for (let gx = -6; gx <= 6; gx++) for (let gz = -4; gz <= 4; gz++) {
      const x = gx * .55 + r() * .18, z = gz * .55 + r() * .18;
      const y = Math.sin(x * .8) * .12 + Math.cos(z * .9) * .1;
      s.pts.push({ x, y, z, c: 0, i: r() });
    }
    for (let i = 0; i < 130; i++) {
      const x = (r() - .5) * 7, z = (r() - .5) * 5;
      const y = .28 + r() * 1.05 * (.55 + .45 * Math.sin(x * 1.3 + z * .8));
      s.pts.push({ x, y, z, c: 1, i: r() });
    }
    for (let i = 0; i < 46; i++) {
      s.pts.push({ x: -2.6 + i * .12, y: .18 + .05 * Math.sin(i * .9), z: .55 + .05 * Math.sin(i * .7), c: 2, i: r() });
    }
  }
  const m = Math.min(w, h), D = 10, T = t % D;
  const BG = '#05080A', AMB = '#FFB347', FR = '#D4FFF0';
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  const A = t * .1 + .6, ca = Math.cos(A), sa = Math.sin(A);
  const pull = 1 + .16 * eOut(clamp((T - 7) / 3, 0, 1));
  const proj = (p) => {
    const xr = p.x * ca - p.z * sa, zr = p.x * sa + p.z * ca;
    const k = 1 / (1 + zr * .16);
    return { x: w * .5 + xr * k * m * .3 * pull, y: h * .62 - p.y * k * m * .34 * pull + zr * k * m * .1 * pull, k };
  };
  const frontX = lerp(-4.4, 4.4, eOut(clamp(T / 5, 0, 1)));
  const hCut = T < 4.4 ? 2 : lerp(1.7, .3, eOut(clamp((T - 4.4) / 2.6, 0, 1)));
  for (const p of s.pts) {
    const q = proj(p);
    const behind = p.x < frontX;
    let y2 = p.y, alpha = 1;
    if (p.y > hCut) {
      const lift = clamp((p.y - hCut) / 1.2, 0, 1);
      y2 = p.y + lift * .55 * (T > 4.4 ? 1 : 0); alpha = 1 - lift * .7;
    }
    const q2 = y2 === p.y ? q : proj({ x: p.x, y: y2, z: p.z });
    let col;
    if (p.c === 2 && T > 6.6) col = hex(AMB, alpha * .95);
    else if (p.c === 0) col = hex('#C8B38C', alpha * .8);
    else {
      const u2 = clamp(p.y / 1.3, 0, 1);
      col = u2 < .5 ? mixHex('#1F3F35', '#5C9A7A', u2 * 2) : mixHex('#5C9A7A', '#E2F3DC', (u2 - .5) * 2);
      col = col.replace('rgb', 'rgba').replace(')', `,${alpha * .8})`);
    }
    const sz = (behind ? 2.6 : 1.5) * q2.k * (p.c === 2 ? 1.5 : 1);
    c.fillStyle = behind ? col : hex('#31454a', alpha * .55);
    c.fillRect(q2.x - sz / 2, q2.y - sz / 2, sz, sz);
    if (behind && p.c === 1 && p.i > .93) glowDot(c, q2.x, q2.y, 8 * q2.k, '#83C495', .25);
  }
  // 扫描前缘
  const fp = proj({ x: frontX, y: 0, z: -2.4 }), fp2 = proj({ x: frontX, y: 0, z: 2.4 });
  const fg = c.createLinearGradient(fp.x - 30, 0, fp.x + 30, 0);
  fg.addColorStop(0, 'rgba(212,255,240,0)'); fg.addColorStop(.5, 'rgba(212,255,240,.35)'); fg.addColorStop(1, 'rgba(212,255,240,0)');
  c.fillStyle = fg; c.fillRect(fp.x - 30, 0, 60, h);
  c.strokeStyle = FR; c.lineWidth = 2.2;
  c.beginPath(); c.moveTo(fp.x, fp.y - m * .3); c.lineTo(fp2.x, fp2.y + m * .3); c.stroke();
  glowDot(c, fp.x, h * .5, m * .1, FR, .3);
  // 仪器
  c.fillStyle = hex('#ECEAE4', .85); c.font = `500 ${m * .019}px ${MONO}`;
  c.fillText('USGS 3DEP · 12.4 pts/m² · 叶下扫描', m * .04, h * .05);
  c.fillText('E 441 230 · N 5 412 900 · 高程基准 NAVD88', m * .04, h * .085);
  // 离地高度尺
  const rY0 = h * .2, rY1 = h * .8;
  c.strokeStyle = 'rgba(236,234,228,.4)'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(w * .955, rY0); c.lineTo(w * .955, rY1); c.stroke();
  for (let i = 0; i <= 6; i++) {
    const yy = lerp(rY1, rY0, i / 6);
    c.beginPath(); c.moveTo(w * .955, yy); c.lineTo(w * .955 + (i % 2 ? 8 : 16), yy); c.stroke();
  }
  const cutY = lerp(rY1, rY0, clamp(hCut / 1.8, 0, 1));
  c.strokeStyle = FR; c.lineWidth = 2.5;
  c.beginPath(); c.moveTo(w * .955 - 22, cutY); c.lineTo(w * .955 + 22, cutY); c.stroke();
  c.fillStyle = hex('#ECEAE4', .8); c.font = `500 ${m * .015}px ${MONO}`;
  c.fillText('离地 ' + hCut.toFixed(1) + ' m', w * .82, cutY - 8);
  // 读数（右三分之一）
  const rU = eOut(clamp((T - 6.9) / .8, 0, 1));
  if (rU > 0) {
    const val = (3.4 * eOut(clamp((T - 6.9) / .6, 0, 1))).toFixed(1);
    c.fillStyle = AMB; c.font = `300 ${m * .13}px ${MONO}`;
    c.fillText(val, w * .62, h * .36 + (1 - rU) * 16);
    c.fillStyle = hex('#ECEAE4', .85); c.font = `500 ${m * .026}px ${SANS}`;
    c.fillText('公里 · 石墙延伸', w * .62, h * .42);
    c.fillStyle = hex('#ECEAE4', .5); c.font = `500 ${m * .015}px ${MONO}`;
    c.fillText('沿墙 46 段点云拟合 · 误差 ±0.4 m', w * .62, h * .455);
    const wq = proj({ x: .3, y: .2, z: .6 }), wx = wq.x, wy = wq.y;
    c.strokeStyle = AMB; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(wx, wy); c.lineTo(w * .61, h * .34); c.stroke();
    glowDot(c, wx, wy, 12, AMB, .5);
  }
  const vg = c.createRadialGradient(w * .5, h * .5, m * .3, w * .5, h * .5, m * .95);
  vg.addColorStop(0, 'rgba(5,8,10,0)'); vg.addColorStop(1, 'rgba(5,8,10,.55)');
  c.fillStyle = vg; c.fillRect(0, 0, w, h);
};


// ---- L12 ----
S.L12 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const r = rng(121); s.blds = [];
    for (let i = 0; i < 22; i++) {
      const x = (r() - .5) * 2.3, z = (r() - .5) * 1.5;
      s.blds.push({ x, z, w: .13 + r() * .2, d: .12 + r() * .18, h: .12 + Math.pow(r(), 1.5) * .88, year: 1940 + Math.floor(r() * 84) });
    }
    s.blds.sort((a, b) => a.year - b.year);
  }
  const m = Math.min(w, h), D = 10, T = t % D;
  const BG = '#07080a', AMB = '#FFB25C';
  c.fillStyle = BG; c.fillRect(0, 0, w, h);
  const vg = c.createRadialGradient(w * .5, h * .55, m * .1, w * .5, h * .55, m * .9);
  vg.addColorStop(0, 'rgba(60,66,78,.4)'); vg.addColorStop(1, 'rgba(7,8,10,0)');
  c.fillStyle = vg; c.fillRect(0, 0, w, h);
  const A = .62 + Math.sin(t * .06) * .14, ca = Math.cos(A), sa = Math.sin(A);
  const P = (x, y, z) => {
    const xr = x * ca - z * sa, zr = x * sa + z * ca;
    return [w * .5 + xr * m * .32, h * .56 + zr * m * .17 - y * m * .34];
  };
  // 底座与台面
  c.fillStyle = '#14161b';
  c.beginPath(); c.moveTo(...P(-1.6, -.1, 1.15)); c.lineTo(...P(1.6, -.1, 1.15)); c.lineTo(...P(1.6, -.1, -1.15)); c.lineTo(...P(-1.6, -.1, -1.15)); c.closePath(); c.fill();
  c.fillStyle = '#23262c';
  c.fillRect(w * .5 - m * .42, h * .62, m * .84, m * .1);
  c.fillStyle = '#31353c';
  c.beginPath(); c.moveTo(...P(-1.35, 0, .95)); c.lineTo(...P(1.35, 0, .95)); c.lineTo(...P(1.35, 0, -.95)); c.lineTo(...P(-1.35, 0, -.95)); c.closePath(); c.fill();
  // 水面嵌件
  c.fillStyle = '#181c22';
  c.beginPath(); c.moveTo(...P(-.4, .002, .8)); c.lineTo(...P(.75, .002, .9)); c.lineTo(...P(.95, .002, .3)); c.lineTo(...P(-.2, .002, .25)); c.closePath(); c.fill();
  // 层与相位
  const yearNow = 1940 + eOut(clamp((T - 1) / 3, 0, 1)) * 84;
  const level = eOut(clamp((T - 4) / 3, 0, 1)) * 1.0;
  const sorted = s.blds.map((b, i) => ({ b, i, d: P(b.x, 0, b.z)[1] })).sort((p, q) => p.d - q.d);
  for (const { b, i } of sorted) {
    const litYear = T >= 1 && T < 4.2 && b.year <= yearNow;
    const litLevel = T >= 4.2 && T < 7 && b.h <= level + .02;
    const pick = T >= 7 && T < 9.2 && i === 8;
    const anyLit = litYear || litLevel || pick;
    let top = '#F3F3F1', side = '#c6c7c2', side2 = '#a9aaa5';
    if (T >= 1 && T < 4.2) {
      const flash = litYear && yearNow - b.year < 3 ? .5 : 0;
      top = mixHex('#F3F3F1', AMB, .75 + flash * .25); side = mixHex('#c6c7c2', '#e09a4e', .8); side2 = mixHex('#a9aaa5', '#b97f3d', .8);
    } else if (T >= 4.2 && T < 7) {
      const u2 = clamp(b.h / 1.0, 0, 1);
      if (litLevel) {
        top = mixHex('#F3F3F1', '#9fe8ff', .55); side = mixHex('#c6c7c2', '#2E70CE', .75); side2 = mixHex('#a9aaa5', '#255a9e', .75);
      } else { top = '#d9dad6'; side = '#b0b1ac'; side2 = '#95968f'; }
    } else if (T >= 7 && T < 9.2) {
      if (pick) { top = mixHex('#F3F3F1', AMB, .8); side = mixHex('#c6c7c2', '#e09a4e', .85); side2 = mixHex('#a9aaa5', '#b97f3d', .85); }
      else { top = '#c9cac6'; side = '#a3a49f'; side2 = '#88897f'; }
    }
    const hw = b.w / 2, hd = b.d / 2, H = b.h;
    const c1 = P(b.x - hw, 0, b.z + hd), c2 = P(b.x + hw, 0, b.z + hd), c3 = P(b.x + hw, 0, b.z - hd), c4 = P(b.x - hw, 0, b.z - hd);
    const t1 = P(b.x - hw, H, b.z + hd), t2 = P(b.x + hw, H, b.z + hd), t3 = P(b.x + hw, H, b.z - hd), t4 = P(b.x - hw, H, b.z - hd);
    c.fillStyle = side; c.beginPath(); c.moveTo(...c1); c.lineTo(...c2); c.lineTo(...t2); c.lineTo(...t1); c.closePath(); c.fill();
    c.fillStyle = side2; c.beginPath(); c.moveTo(...c2); c.lineTo(...c3); c.lineTo(...t3); c.lineTo(...t2); c.closePath(); c.fill();
    c.fillStyle = top; c.beginPath(); c.moveTo(...t1); c.lineTo(...t2); c.lineTo(...t3); c.lineTo(...t4); c.closePath(); c.fill();
    if (anyLit && (litYear || litLevel)) {
      const fy = litLevel ? level : H;
      c.fillStyle = 'rgba(255,255,255,.18)';
      c.beginPath(); c.moveTo(...P(b.x - hw, fy * .9, b.z + hd)); c.lineTo(...P(b.x + hw, fy * .9, b.z + hd)); c.lineTo(...P(b.x + hw, fy, b.z + hd)); c.lineTo(...P(b.x - hw, fy, b.z + hd)); c.closePath(); c.fill();
    }
  }
  // 针脚标注
  if (T >= 7 && T < 9.2) {
    const b = s.blds[8], [px, py] = P(b.x, b.h, b.z);
    const u2 = clamp((T - 7.3) / .4, 0, 1);
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(px, py); c.lineTo(px, py - m * .16 * eOut(u2)); c.lineTo(px + m * .1 * eOut(u2), py - m * .16 * eOut(u2)); c.stroke();
    if (u2 > .8) {
      c.fillStyle = 'rgba(16,18,22,.9)'; c.fillRect(px + m * .1, py - m * .22, m * .26, m * .09);
      c.fillStyle = '#F3F3F1'; c.font = `500 ${m * .024}px ${SANS}`;
      c.fillText('市立医院 · 1968', px + m * .115, py - m * .165);
    }
    glowDot(c, px, py, m * .05, AMB, .35);
  }
  // 读数（左三分之一）
  c.textBaseline = 'alphabetic';
  const layers = [
    { at: 1, until: 4.2, idx: '01', name: '建造年代', val: String(Math.round(yearNow)), unit: '年', src: '数据 3DBAG · CC BY 4.0' },
    { at: 4.2, until: 7, idx: '02', name: '建筑高度', val: (level * 128).toFixed(0), unit: 'm · 水位推演', src: '数据 模型测算 · 示意' },
    { at: 7, until: 9.2, idx: '03', name: '应急选点', val: '6', unit: '分钟步行圈', src: '数据 市应急办 · 2025' }
  ];
  for (const L of layers) {
    if (T < L.at || T >= L.until) continue;
    const u2 = eOut(clamp((T - L.at) / .5, 0, 1));
    c.fillStyle = hex('#F3F3F1', .92); c.font = `500 ${m * .02}px ${MONO}`;
    c.fillText('LAYER ' + L.idx, m * .05, h * .22);
    c.font = `300 ${m * .11}px ${MONO}`;
    c.fillText(L.val, m * .05, h * .34 + (1 - u2) * 14);
    c.fillStyle = hex('#F3F3F1', .85); c.font = `500 ${m * .032}px ${SANS}`;
    c.fillText(L.name + ' · ' + L.unit, m * .05, h * .4);
    c.fillStyle = hex('#F3F3F1', .45); c.font = `500 ${m * .016}px ${MONO}`;
    c.fillText(L.src, m * .05, h * .44);
    c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(m * .05, h * .46, m * .3, 3);
    c.fillStyle = AMB; c.fillRect(m * .05, h * .46, m * .3 * clamp((T - L.at) / (L.until - L.at), 0, 1), 3);
  }
  // 身份标签与灯效
  c.fillStyle = 'rgba(243,243,241,.5)'; c.font = `500 ${m * .015}px ${MONO}`;
  c.fillText('鹿特丹 · 1:2000 白模 · 投影数据层', m * .05, h * .06);
  if (T < 1) {
    const dark = .55 * clamp((T - .3) / .25, 0, 1);
    c.fillStyle = `rgba(4,5,7,${dark})`; c.fillRect(0, 0, w, h);
    if (T > .55 && Math.sin(t * 60) > 0) { c.fillStyle = 'rgba(220,230,255,.12)'; c.fillRect(0, 0, w, h); }
  }
  if (T >= 9.2) {
    const up = clamp((T - 9.2) / .8, 0, 1);
    c.fillStyle = `rgba(240,242,248,${.22 * up})`; c.fillRect(0, 0, w, h);
  }
};


// ---- L13 ----
S.L13 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const r = rng(131); s.A = []; s.B = [];
    for (let i = 0; i < 26; i++) s.A.push({ off: (r() - .5) * 3, v: .93 + r() * .14 });
    for (let i = 0; i < 34; i++) s.B.push({ off: (r() - .5) * 3, v: .93 + r() * .14 });
  }
  const m = Math.min(w, h), D = 10, T = t % D;
  const SWEEP = '#C4BEB4', ALU = '#C8CCD1', ACR = '#9FD3D6', BRASS = '#D2B07A', INK = '#1C1D20', ACC = '#D4521C';
  c.fillStyle = vgrad(c, h, '#cfc9bf', '#a1988b'); c.fillRect(0, 0, w, h);
  const pool = c.createRadialGradient(w * .45, h * .35, m * .1, w * .45, h * .35, m * 1.1);
  pool.addColorStop(0, 'rgba(255,250,240,.35)'); pool.addColorStop(1, 'rgba(255,250,240,0)');
  c.fillStyle = pool; c.fillRect(0, 0, w, h);
  // 相机：宏观 → 平移 → 比较 → 拉远
  const keys = [[.34, .5, 2.15, 0], [.5, .58, 1.15, 2.5], [.5, .58, 1.0, 5.5], [.5, .52, .72, 8.2], [.5, .5, .68, 10]];
  let k = 0; while (k + 2 < keys.length && T >= keys[k + 1][3]) k++;
  const u = ss(0, keys[k + 1][3] - keys[k][3], T - keys[k][3]);
  const zc = Math.exp(lerp(Math.log(keys[k][2]), Math.log(keys[k + 1][2]), u)) * (1 + .008 * Math.sin(t * .7));
  const xc = lerp(keys[k][0], keys[k + 1][0], u), yc = lerp(keys[k][1], keys[k + 1][1], u);
  c.save(); c.translate(w / 2, h / 2); c.scale(zc, zc); c.translate(-xc * w, -yc * h);
  // 基座（胡桃木 + 刻度）
  c.fillStyle = 'rgba(60,44,30,.35)';
  c.beginPath(); c.moveTo(w * .12, h * .78); c.lineTo(w * .88, h * .78); c.lineTo(w * .95, h * .88); c.lineTo(w * .05, h * .88); c.closePath(); c.fill();
  const wood = c.createLinearGradient(0, h * .74, 0, h * .86);
  wood.addColorStop(0, '#6b4f36'); wood.addColorStop(1, '#4c3722');
  c.fillStyle = wood;
  c.beginPath(); c.moveTo(w * .1, h * .74); c.lineTo(w * .9, h * .74); c.lineTo(w * .97, h * .84); c.lineTo(w * .03, h * .84); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(240,225,200,.5)'; c.lineWidth = 1.6;
  for (let i = 0; i <= 12; i++) {
    const xx = lerp(w * .12, w * .88, i / 12);
    c.beginPath(); c.moveTo(xx, h * .755); c.lineTo(xx, h * .755 + (i % 4 ? 8 : 18)); c.stroke();
  }
  c.fillStyle = 'rgba(240,225,200,.6)'; c.font = `500 ${m * .016}px ${MONO}`;
  c.fillText('2012', w * .115, h * .79); c.fillText('2024', w * .845, h * .79);
  // 两个系列堆叠
  const stacks = [
    { list: s.A, x0: w * .3, mat: ALU, edge: '#9aa0a6', t0: .15, step: .105, name: '风电', unit: 'GW' },
    { list: s.B, x0: w * .62, mat: ACR, edge: '#6fa8ad', t0: .5, step: .115, name: '光伏', unit: 'GW' }
  ];
  for (const st of stacks) {
    for (let i = 0; i < st.list.length; i++) {
      const land = st.t0 + i * st.step;
      const age = T - (land - .3);
      if (age < 0) continue;
      const drop = (1 - eOut(clamp(age / .3, 0, 1))) * m * .09;
      const py = h * .74 - i * m * .0165 - drop;
      const px = st.x0 + st.list[i].off;
      const isRuler = (i + 1) % 10 === 0;
      const mat = isRuler ? BRASS : st.mat;
      c.fillStyle = `rgba(50,40,28,${.18 * clamp(age / .3, 0, 1)})`;
      c.fillRect(px + 4, py + m * .014, m * .21, m * .008);
      c.fillStyle = mat;
      c.fillRect(px, py, m * .21 * st.list[i].v, m * .013);
      c.fillStyle = isRuler ? '#a8834e' : st.edge;
      c.fillRect(px, py + m * .013, m * .21 * st.list[i].v, m * .005);
      c.fillStyle = 'rgba(255,255,255,.35)';
      c.fillRect(px, py, m * .21 * st.list[i].v, m * .002);
    }
    // 材质高光随时间流动
    const hx = st.x0 + ((t * .06) % 1) * m * .25 - m * .06;
    const hlg = c.createLinearGradient(hx, 0, hx + m * .12, 0);
    hlg.addColorStop(0, 'rgba(255,255,255,0)'); hlg.addColorStop(.5, 'rgba(255,255,255,.12)'); hlg.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = hlg; c.fillRect(hx, h * .74 - st.list.length * m * .0165 - m * .02, m * .12, st.list.length * m * .0165 + m * .03);
  }
  c.restore();
  // 读数
  const showA = T > 2.6 && T < 8.6, showB = T > 3.4 && T < 8.6;
  const plate = (x, y, name, val, col) => {
    c.fillStyle = 'rgba(244,241,234,.86)'; c.fillRect(x, y, m * .34, m * .12);
    c.fillStyle = col; c.fillRect(x + m * .015, y + m * .02, m * .035, m * .035);
    c.fillStyle = INK; c.font = `500 ${m * .024}px ${SANS}`;
    c.fillText(name, x + m * .065, y + m * .045);
    c.font = `300 ${m * .052}px ${MONO}`;
    c.fillText(val, x + m * .015, y + m * .1);
  };
  if (showA) {
    const u2 = eOut(clamp((T - 2.6) / .4, 0, 1));
    plate(w * .06, h * .2 + (1 - u2) * 16, '风电装机', '260 GW', ALU);
  }
  if (showB) {
    const u2 = eOut(clamp((T - 3.4) / .4, 0, 1));
    plate(w * .06, h * .38 + (1 - u2) * 16, '光伏装机', '340 GW', ACR);
  }
  if (T > 6.2 && T < 8.8) {
    const u2 = eOut(clamp((T - 6.2) / .35, 0, 1));
    c.fillStyle = ACC; c.fillRect(w * .62, h * .18, m * .38, m * .1);
    c.fillStyle = '#fff'; c.font = `700 ${m * .042}px ${SANS}`;
    c.fillText('2021 反超', w * .635, h * .18 + m * .066);
    c.fillRect(w * .62, h * .18 + m * .108, m * .38 * u2, 3);
    c.fillStyle = 'rgba(28,29,32,.7)'; c.font = `500 ${m * .017}px ${MONO}`;
    c.fillText('同期对比 · 同一单位（1 片 = 10 GW）', w * .62, h * .18 + m * .145);
  }
  // 压舱物
  const puckU = clamp((T - 8.5) / .5, 0, 1);
  if (puckU > 0) {
    const py = lerp(h * .3, h * .62, eOut(puckU));
    c.fillStyle = 'rgba(60,44,28,.4)'; c.beginPath(); c.ellipse(w * .5, h * .66, m * .09, m * .026, 0, 0, TAU); c.fill();
    c.fillStyle = BRASS; c.beginPath(); c.ellipse(w * .5, py, m * .085, m * .03, 0, 0, TAU); c.fill();
    c.fillStyle = '#7c5c33'; c.beginPath(); c.ellipse(w * .5, py + m * .014, m * .085, m * .03, 0, 0, TAU); c.fill();
    c.fillStyle = '#3c2c18'; c.font = `700 ${m * .022}px ${MONO}`; c.textAlign = 'center';
    c.fillText('600 GW', w * .5, py + m * .008);
    c.textAlign = 'left';
  }
  // 来源线 + 字幕条
  c.fillStyle = 'rgba(28,29,32,.62)'; c.font = `500 ${m * .017}px ${MONO}`;
  c.fillText('数据 IRENA (2026) · 经 Our World in Data 整理 · CC BY 4.0', m * .04, h * .96);
  const subU = eOut(clamp((T - 1) / .3, 0, 1));
  c.fillStyle = `rgba(28,29,32,${.9 * subU})`; c.fillRect(0, h * .885, w * .55 * subU, 2);
  c.fillStyle = `rgba(28,29,32,${.92 * subU})`; c.font = `500 ${m * .026}px ${SANS}`;
  c.fillText('一片 = 10 GW · 两种材料，一样刻度', m * .04, h * .86);
};


// ---- L14 ----
S.L14 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const r = rng(141); s.caps = [];
    for (let row = 0; row < 4; row++) for (let col = 0; col < 13; col++) s.caps.push({ x: col, y: row, v: .92 + r() * .16 });
  }
  const m = Math.min(w, h), D = 10, T = t % D, ACC = '#ff6b3d', INK = '#f1efe9';
  const bg = c.createRadialGradient(w * .5, h * .42, m * .12, w * .5, h * .5, m * 1.05);
  bg.addColorStop(0, '#34363a'); bg.addColorStop(1, '#0d0e10');
  c.fillStyle = bg; c.fillRect(0, 0, w, h);
  const camX = Math.sin(t * .22) * m * .05, camY = Math.cos(t * .17) * m * .03, camS = 1 + .04 * Math.sin(t * .3);
  c.save(); c.translate(w * .42 + camX, h * .52 + camY); c.scale(camS, camS);
  const layers = [
    { name: '键帽', spec: 'PBT · 1.5 mm', th: .34, top: '#3a3d42', side: '#24262a', caps: 1 },
    { name: '定位板', spec: '铝合金 · 1.2 mm', th: .1, top: '#9aa0a6', side: '#6d7278' },
    { name: '轴体', spec: '热插拔 ×52', th: .2, top: '#5a4632', side: '#3c2e20', pins: 1 },
    { name: '主板', spec: 'PCB · 4 层', th: .12, top: '#1e4d3b', side: '#123126', pcb: 1 },
    { name: '底壳', spec: 'ABS · 2.0 mm', th: .16, top: '#2a2c30', side: '#191a1d' }
  ];
  const gap = m * .3;
  const eOf = (j) => {
    const open = ss(1.5 + (4 - j) * .18, 3.1 + (4 - j) * .18, T);
    const close = 1 - ss(7.6 + j * .12, 8.6 + j * .12, T);
    return Math.min(open, close);
  };
  for (let j = layers.length - 1; j >= 0; j--) {
    const L = layers[j], E = eOf(j);
    const float = E > .98 && T > 4 && T < 7.4 ? Math.sin(t * 1.1 + j * 1.3) * 2.2 : 0;
    const oy = -E * (j * gap + gap * .2) + float;
    const press = j === 0 ? (T > 9.3 && T < 9.8 ? Math.sin((T - 9.3) / .5 * Math.PI) * m * .05 : 0) : 0;
    const lw = m * (1.15 - j * .02), lh = m * .3, x0 = -lw / 2, y0 = oy - L.th * m * .5 + press;
    // 影子
    c.fillStyle = 'rgba(0,0,0,.32)';
    c.beginPath(); c.ellipse(0, y0 + L.th * m + m * .06, lw * .52, m * .045, 0, 0, TAU); c.fill();
    // 侧面
    c.fillStyle = L.side; c.fillRect(x0, y0 + lh, lw, L.th * m);
    // 顶面
    const tg = c.createLinearGradient(x0, y0, x0 + lw, y0 + lh);
    tg.addColorStop(0, L.top); tg.addColorStop(1, mixHex(L.top, '#000000', .28));
    c.fillStyle = tg;
    c.beginPath(); c.roundRect(x0, y0, lw, lh, m * .02); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1.5;
    c.beginPath(); c.roundRect(x0, y0, lw, lh, m * .02); c.stroke();
    if (L.caps) {
      for (const cp of s.caps) {
        const cxp = x0 + m * .045 + cp.x * m * .082, cyp = y0 + m * .04 + cp.y * m * .062;
        c.fillStyle = `rgba(${Math.round(58 * cp.v)},${Math.round(61 * cp.v)},${Math.round(66 * cp.v)},1)`;
        c.fillRect(cxp, cyp, m * .068, m * .05);
        c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(cxp, cyp, m * .068, m * .008);
      }
    }
    if (L.pcb) {
      c.strokeStyle = 'rgba(120,220,170,.5)'; c.lineWidth = 1.2;
      for (let i = 0; i < 10; i++) {
        c.beginPath(); c.moveTo(x0 + m * .05, y0 + m * .03 + i * m * .026);
        c.lineTo(x0 + lw * (.3 + (i % 4) * .16), y0 + m * .03 + i * m * .026);
        c.lineTo(x0 + lw * (.3 + (i % 4) * .16), y0 + m * .05 + i * m * .026);
        c.stroke();
      }
      for (let i = 0; i < 12; i++) {
        c.fillStyle = i % 3 ? '#c8b060' : '#202226';
        c.fillRect(x0 + m * .1 + (i % 6) * m * .13, y0 + m * .16 + ((i / 6) | 0) * m * .06, m * .07, m * .04);
      }
    }
    if (L.pins) {
      c.fillStyle = '#c8b060';
      for (let i = 0; i < 13; i++) c.fillRect(x0 + m * .06 + i * m * .082, y0 + lh - m * .012, m * .03, m * .03);
    }
  }
  // 引线标签
  for (let j = 0; j < 4; j++) {
    const lu = clamp((T - 4.3 - j * .55) / .8, 0, 1);
    if (lu <= 0) continue;
    const L = layers[j], E = eOf(j);
    const ay = -E * (j * gap + gap * .2) - L.th * m * .5 + m * .02;
    const ax = m * (.58 - j * .01), lx = m * .82, ly = ay - m * .04;
    c.fillStyle = ACC; c.beginPath(); c.arc(ax, ay, m * .011, 0, TAU); c.fill();
    const du = eOut(clamp(lu / .45, 0, 1));
    c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(lerp(ax, lx, du), lerp(ay, ly, du)); c.stroke();
    const tu = eOut(clamp((lu - .4) / .5, 0, 1));
    if (tu > 0) {
      c.fillStyle = ACC; c.font = `600 ${m * .017}px ${MONO}`;
      c.fillText(String(j + 1).padStart(2, '0'), lx + 6 + (1 - tu) * 10, ly - m * .016);
      c.fillStyle = INK; c.font = `500 ${m * .026}px ${SANS}`;
      c.fillText(L.name, lx + 6 + (1 - tu) * 10, ly + m * .012);
      c.fillStyle = 'rgba(241,239,233,.6)'; c.font = `500 ${m * .015}px ${MONO}`;
      c.fillText(L.spec, lx + 6 + (1 - tu) * 10, ly + m * .036);
    }
  }
  // 合拢后的尺寸线
  const dimU = clamp((T - 9.1) / .6, 0, 1);
  if (dimU > 0) {
    const y = m * .62, x0 = -m * .62, x1 = lerp(-m * .62, m * .62, eOut(dimU));
    c.strokeStyle = ACC; c.lineWidth = 1.8;
    c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y);
    c.moveTo(x0, y - m * .014); c.lineTo(x0, y + m * .014);
    c.moveTo(x1, y - m * .014); c.lineTo(x1, y + m * .014);
    c.stroke();
    if (dimU > .7) {
      c.fillStyle = 'rgba(20,22,25,.9)'; c.fillRect(-m * .13, y - m * .036, m * .26, m * .042);
      c.fillStyle = INK; c.font = `500 ${m * .02}px ${MONO}`; c.textAlign = 'center';
      c.fillText('285 mm', 0, y - m * .012);
      c.textAlign = 'left';
    }
  }
  c.restore();
  // 幽灵底面阴影 + 副标签
  c.fillStyle = 'rgba(241,239,233,.55)'; c.font = `500 ${m * .016}px ${MONO}`;
  c.fillText('开源键盘 rev.C · STEP + KiCad + BOM 实测', m * .04, h * .06);
  c.textAlign = 'right';
  c.fillText('EXPLODED VIEW · 5 层 · 总重 1 420 g', w - m * .04, h * .06);
  c.textAlign = 'left';
};


// ---- L15 ----
S.L15 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const r = rng(151); s.cells = [];
    for (let i = 0; i < 42; i++) {
      const ang = r() * TAU, rad = Math.pow(r(), .6) * 260;
      const x = 640 + Math.cos(ang) * rad * 1.3, y = 360 + Math.sin(ang) * rad * .85;
      s.cells.push({ x, y, rx: 36 + r() * 26, ry: 26 + r() * 18, a: r() * TAU, c: r() < .5 ? '#c9758a' : '#b06a86', nx: x + (r() - .5) * 16, ny: y + (r() - .5) * 12, nr: 8 + r() * 6 });
    }
    s.target = s.cells[20]; s.other = s.cells[9];
    s.pix = [];
    for (let gy = -6; gy <= 6; gy++) for (let gx = -6; gx <= 6; gx++) {
      if (gx * gx + gy * gy <= 34) s.pix.push([gx, gy, (((gx * 7 + gy * 13) % 5) + 5) % 5 < 2 ? 1 : 0]);
    }
  }
  const m = Math.min(w, h), D = 10, T = t % D;
  const BENCH0 = '#0B0D0F', BENCH1 = '#2A3036', GLASS = '#F4F1EC', MINT = 'rgb(120,240,205)';
  c.fillStyle = vgrad(c, h, BENCH1, BENCH0); c.fillRect(0, 0, w, h);
  const pool = c.createRadialGradient(w * .5, h * .45, m * .15, w * .5, h * .45, m * 1.1);
  pool.addColorStop(0, 'rgba(210,220,235,.14)'); pool.addColorStop(1, 'rgba(210,220,235,0)');
  c.fillStyle = pool; c.fillRect(0, 0, w, h);
  const u = T < 5 ? eOut(T / 5) : T < 8.5 ? 1 : 1 - eOut((T - 8.5) / 1.5);
  const breath = Math.max(0, 1 - Math.min(Math.abs(T - 2.2), Math.abs(T - 3.6)) * 2.2);
  const z = Math.exp(u * Math.log(9)) * (1 + .01 * Math.sin(t * 34) * breath) * (1 + .012 * Math.sin(t * .6));
  const tx = s.target.nx, ty = s.target.ny, kk = m / 720;
  const cam = (x, y) => [w / 2 + (x - tx) * z * kk, h / 2 + (y - ty) * z * kk];
  // 玻片与组织
  const [gx0, gy0] = cam(80, 60), [gx1, gy1] = cam(1200, 660);
  c.fillStyle = GLASS;
  c.beginPath(); c.roundRect(gx0, gy0, gx1 - gx0, gy1 - gy0, Math.max(4, 26 * z * kk)); c.fill();
  for (const cell of s.cells) {
    const [cxp, cyp] = cam(cell.x, cell.y);
    const rx = cell.rx * z * kk, ry = cell.ry * z * kk;
    if (cxp < -rx * 2 || cxp > w + rx * 2 || cyp < -ry * 2 || cyp > h + ry * 2) continue;
    c.save(); c.translate(cxp, cyp); c.rotate(cell.a);
    c.fillStyle = cell.c + 'cc';
    c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(120,60,90,.4)'; c.lineWidth = Math.max(1, 2 * z * kk);
    c.stroke();
    c.restore();
    const [nx, ny] = cam(cell.nx, cell.ny);
    c.fillStyle = 'rgba(90,58,110,.92)';
    c.beginPath(); c.ellipse(nx, ny, cell.nr * z * kk, cell.nr * .82 * z * kk, 0, 0, TAU); c.fill();
  }
  // 两个测量圆 + 计数像素
  const circles = [[s.target, 60], [s.other, 55]];
  for (let ci = 0; ci < 2; ci++) {
    const [cell, R] = circles[ci];
    const [cxp, cyp] = cam(cell.nx, cell.ny), rr = R * z * kk;
    const cu = clamp((T - 5.1 - ci * .8) / .6, 0, 1);
    if (cu <= 0) continue;
    c.strokeStyle = MINT; c.lineWidth = Math.max(1.5, 2.2 * kk);
    c.beginPath(); c.arc(cxp, cyp, rr, -Math.PI / 2, -Math.PI / 2 + TAU * eOut(cu)); c.stroke();
    for (let q = 0; q < 4; q++) {
      const a2 = q * Math.PI / 2;
      c.beginPath(); c.moveTo(cxp + Math.cos(a2) * rr * .88, cyp + Math.sin(a2) * rr * .88);
      c.lineTo(cxp + Math.cos(a2) * rr * 1.12, cyp + Math.sin(a2) * rr * 1.12); c.stroke();
    }
    if (ci === 0) {
      const scanU = clamp((T - 5.9) / 1.4, 0, 1);
      const frontX = lerp(cxp - rr, cxp + rr, eOut(scanU));
      for (const [px, py, on] of s.pix) {
        if (!on) continue;
        const sx = cxp + px / 6.5 * rr, sy = cyp + py / 6.5 * rr;
        if (sx > frontX) continue;
        const age = clamp((frontX - sx) / (rr * .4), 0, 1);
        c.fillStyle = `rgba(120,240,205,${.25 + .5 * age})`;
        const sq = Math.max(1.5, rr / 6.5 * .7);
        c.fillRect(sx - sq / 2, sy - sq / 2, sq, sq);
      }
      if (scanU > 0 && scanU < 1) {
        const sg = c.createLinearGradient(frontX - 20, 0, frontX + 20, 0);
        sg.addColorStop(0, 'rgba(120,240,205,0)'); sg.addColorStop(.5, 'rgba(120,240,205,.35)'); sg.addColorStop(1, 'rgba(120,240,205,0)');
        c.fillStyle = sg; c.fillRect(frontX - 20, cyp - rr * 1.3, 40, rr * 2.6);
      }
    }
  }
  // 对焦扫掠
  const sweepU = clamp((T - 5) / .7, 0, 1);
  if (sweepU > 0 && sweepU < 1) {
    c.save();
    c.fillStyle = `rgba(244,241,236,${.22 * (1 - sweepU)})`;
    c.beginPath();
    const yy = h * sweepU;
    c.moveTo(0, yy - h * .12); c.lineTo(w, yy + h * .06); c.lineTo(w, yy + h * .3); c.lineTo(0, yy + h * .12); c.closePath(); c.fill();
    c.restore();
  }
  // 毛玻璃面板
  const panel = (x, y, w2, h2) => { c.fillStyle = 'rgba(12,14,17,.74)'; c.fillRect(x, y, w2, h2); };
  panel(m * .03, h * .78, m * .42, h * .18);
  const barLen = m * .12;
  const sbv = z < 2.5 ? '500 µm' : z < 5 ? '200 µm' : '50 µm';
  c.strokeStyle = '#fff'; c.lineWidth = 2.4;
  c.beginPath(); c.moveTo(m * .055, h * .915); c.lineTo(m * .055 + barLen, h * .915);
  c.moveTo(m * .055, h * .905); c.lineTo(m * .055, h * .925);
  c.moveTo(m * .055 + barLen, h * .905); c.lineTo(m * .055 + barLen, h * .925); c.stroke();
  c.fillStyle = '#fff'; c.font = `300 ${m * .032}px ${MONO}`;
  c.fillText(sbv, m * .055 + barLen + 12, h * .923);
  c.font = `500 ${m * .017}px ${MONO}`; c.fillStyle = 'rgba(255,255,255,.8)';
  c.fillText('视野 ' + (1.6 / z).toFixed(2) + ' mm', m * .055, h * .83);
  const mag = Math.round(4 * z);
  c.fillText('放大 ×' + mag, m * .2, h * .83);
  // 物镜转盘
  c.save(); c.translate(m * .38, h * .845); c.rotate(Math.floor(Math.log(z) / Math.log(2)) * Math.PI / 2);
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2;
  c.beginPath(); c.arc(0, 0, m * .022, 0, TAU); c.stroke();
  c.beginPath(); c.moveTo(0, 0); c.lineTo(m * .022, 0); c.stroke();
  c.restore();
  // 读数（右侧）
  const rU = eOut(clamp((T - 6.2) / .6, 0, 1));
  if (rU > 0) {
    panel(w * .62, h * .3, m * .38, h * .26);
    c.fillStyle = 'rgba(255,255,255,.7)'; c.font = `500 ${m * .018}px ${SANS}`;
    c.fillText('蓝区 / 组织面积', w * .635, h * .35);
    const val = lerp(1, 2.4, eOut(clamp((T - 6.2) / 1, 0, 1))).toFixed(1);
    c.fillStyle = MINT; c.font = `300 ${m * .09}px ${MONO}`;
    c.fillText(val + '×', w * .635, h * .45 + (1 - rU) * 12);
    c.fillStyle = 'rgba(255,255,255,.65)'; c.font = `500 ${m * .016}px ${MONO}`;
    c.fillText('12 808 / 5 332 px · 阈值分割', w * .635, h * .5);
    c.fillText('方法：逐像素计数 · 非诊断', w * .635, h * .535);
  }
  // 角落来源
  panel(w * .78, h * .05, m * .26, h * .07);
  c.fillStyle = 'rgba(255,255,255,.8)'; c.font = `500 ${m * .015}px ${MONO}`;
  c.fillText('WSI · CDC PHIL · 公共领域', w * .795, h * .093);
};


// ---- L16 ----
S.L16 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const r = rng(1601);
    s.dust = []; for (let i = 0; i < 60; i++) s.dust.push([r(), r(), r()]);
    s.objs = [
      { x: .245, y: .46, sw: .20, sh: .30, kind: 0, id: 'NEG-1903-017', date: '1903.12.17', title: '飞行底片' },
      { x: .565, y: .30, sw: .15, sh: .21, kind: 1, id: 'LTR-1903-042', date: '1903.12.18', title: '电报原件' },
      { x: .80, y: .62, sw: .115, sh: .16, kind: 2, id: 'SLD-1903-006', date: '1903.12.19', title: '玻璃幻灯片' }
    ];
  }
  const m = Math.min(w, h), q = t % 10;
  const pan = Math.sin(t * .11) * w * .012 + Math.sin(t * .047) * w * .008, camY = Math.sin(t * .07) * h * .01;
  c.fillStyle = '#21252a'; c.fillRect(0, 0, w, h);
  const gx = w * .05, gy = h * .08, gw = w * .9, gh = h * .84;
  c.fillStyle = '#f7f9fb'; c.fillRect(gx, gy, gw, gh);
  for (const d of s.dust) { c.fillStyle = hex('#93a2b2', .04 + d[2] * .05); c.fillRect(gx + d[0] * gw, gy + d[1] * gh, 2.2, 2.2); }
  const vg = c.createRadialGradient(w / 2, h / 2, m * .12, w / 2, h / 2, m * .9);
  vg.addColorStop(0, 'rgba(255,255,255,0)'); vg.addColorStop(1, 'rgba(110,125,142,.24)');
  c.fillStyle = vg; c.fillRect(gx, gy, gw, gh);
  c.strokeStyle = '#9aa5b0'; c.lineWidth = m * .012; c.strokeRect(gx, gy, gw, gh);
  for (let oi = 0; oi < s.objs.length; oi++) {
    const o = s.objs[oi], ow = o.sw * w, oh = o.sh * h, ox = o.x * w + pan - ow / 2, oy = o.y * h + camY - oh / 2;
    c.fillStyle = 'rgba(40,52,64,.15)'; c.fillRect(ox + m * .006, oy + m * .008, ow, oh);
    if (o.kind === 0) {
      c.fillStyle = '#2c2a28'; c.fillRect(ox, oy, ow, oh);
      c.fillStyle = '#cfc8ba'; c.fillRect(ox + ow * .08, oy + oh * .1, ow * .84, oh * .8);
      c.fillStyle = '#57524a';
      c.fillRect(ox + ow * .30, oy + oh * .52, ow * .40, oh * .05);
      c.fillRect(ox + ow * .46, oy + oh * .38, ow * .06, oh * .20);
      c.fillRect(ox + ow * .22, oy + oh * .50, ow * .16, oh * .03);
      c.fillRect(ox + ow * .62, oy + oh * .50, ow * .16, oh * .03);
    } else if (o.kind === 1) {
      c.fillStyle = '#e8e0cc'; c.fillRect(ox, oy, ow, oh);
      c.fillStyle = hex('#6b5a42', .8);
      for (let li = 0; li < 6; li++) c.fillRect(ox + ow * .1, oy + oh * (.18 + li * .12), ow * (.3 + ((oi * 7 + li * 13) % 47) / 100), oh * .028);
    } else {
      c.fillStyle = '#dcd6c6'; c.fillRect(ox, oy, ow, oh);
      c.fillStyle = '#4a5462'; c.fillRect(ox + ow * .12, oy + oh * .14, ow * .76, oh * .58);
      c.fillStyle = '#8ba0b4'; c.fillRect(ox + ow * .12, oy + oh * .14, ow * .76, oh * .28);
    }
    const le = eOut(ss(oi * 1.4, oi * 1.4 + .8, q));
    if (le > 0.01) {
      const ax = ox + ow * .12, ay = oy - m * .012;
      c.strokeStyle = hex('#FF5A1F', .9 * le); c.lineWidth = Math.max(1, m * .0032);
      c.beginPath(); c.arc(ax, ay, m * .013 * le, 0, TAU); c.stroke();
      c.fillStyle = '#FF5A1F'; c.beginPath(); c.arc(ax, ay, m * .0042, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(ax, ay - m * .013); c.lineTo(ax, ay - m * .078); c.lineTo(ax + m * .1, ay - m * .078); c.stroke();
      c.fillStyle = hex('#15171A', le); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      c.font = `${(m * .021).toFixed(1)}px ${MONO}`;
      c.fillText(o.id, ax + m * .014, ay - m * .088);
      c.font = `500 ${(m * .024).toFixed(1)}px ${SANS}`;
      c.fillText(o.title + ' · ' + o.date, ax + m * .014, ay - m * .052);
    }
  }
  // 放大镜：落镜 → 镜内负片翻正 → 数字读数 → 起镜
  const land = eOut(ss(1.2, 1.9, q)) - eOut(ss(6.4, 7.1, q));
  const mv = eOut(ss(7.1, 9.6, q));
  const oA = s.objs[0], oB = s.objs[1];
  const lx = lerp(oA.x, oB.x, mv) * w + pan, ly = lerp(oA.y, oB.y, mv) * h + camY - m * .02;
  const R = m * .16 * (1.35 - .35 * land) * (1 + .012 * Math.sin(t * 2.2));
  c.fillStyle = hex('#3c4854', .18 * land);
  c.beginPath(); c.ellipse(lx + R * .22, ly + R * .3, R * 1.02, R * .82, 0, 0, TAU); c.fill();
  const flip = ss(2.4, 3.3, q);
  c.save();
  c.beginPath(); c.arc(lx, ly, R * .82, 0, TAU); c.clip();
  c.fillStyle = mixHex('#2c2a28', '#eef2f6', flip); c.fillRect(lx - R, ly - R, R * 2, R * 2);
  c.save(); c.translate(lx, ly); c.scale(2.3, 2.3); c.translate(-lx, -ly);
  c.fillStyle = mixHex('#cfc8ba', '#57524a', flip);
  c.fillRect(lx - R * .3, ly - R * .06, R * .6, R * .1);
  c.fillRect(lx - R * .06, ly - R * .3, R * .12, R * .36);
  c.fillRect(lx - R * .42, ly - R * .02, R * .3, R * .05);
  c.fillRect(lx + R * .12, ly - R * .02, R * .3, R * .05);
  const num = Math.round(lerp(57, 59, ss(3.2, 6.2, q)));
  c.fillStyle = mixHex('#e8e2d4', '#20242a', flip);
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `600 ${(m * .03).toFixed(1)}px ${MONO}`;
  c.fillText(num + ' 秒', lx, ly + R * .38);
  c.restore();
  const uw = R * .5 * eOut(ss(3.6, 4.4, q));
  c.fillStyle = '#FF5A1F'; c.fillRect(lx - uw / 2, ly + R * .52, uw, Math.max(2, R * .035));
  c.font = `500 ${(m * .02).toFixed(1)}px ${SANS}`; c.fillStyle = hex('#15171A', .85);
  c.fillText('滞空读数', lx, ly + R * .68);
  c.restore();
  c.beginPath(); c.arc(lx, ly, R * .86, 0, TAU);
  c.strokeStyle = '#14161a'; c.lineWidth = R * .17; c.stroke();
  c.beginPath(); c.arc(lx, ly, R * .955, 0, TAU);
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = R * .035; c.stroke();
  c.beginPath(); c.arc(lx, ly, R * 1.13, 0, TAU);
  c.strokeStyle = hex('#8fb0c8', .18); c.lineWidth = R * .1; c.stroke();
};


// ---- L17 ----
S.L17 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; s.pt = paperTex(w / 2, h / 2, 1, '#f4efe3', 1717);
    const r = rng(1717); s.stars = [];
    for (let i = 0; i < 20; i++) s.stars.push([.05 + r() * .9, .04 + r() * .34, r()]);
  }
  const m = Math.min(w, h), q = t % 9, bs = Math.floor(t * 12);
  const J = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.545; return (x - Math.floor(x)) - .5; };
  const stroke = (pts, col, lw, prog, seed, alpha) => {
    c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round'; c.globalAlpha = alpha == null ? .92 : alpha;
    const n = Math.max(2, Math.floor(pts.length * clamp(prog, 0, 1)));
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const x = pts[i][0] + J(i * 3 + seed, bs) * lw * .9, y = pts[i][1] + J(i * 3 + seed + 9, bs) * lw * .9;
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke(); c.globalAlpha = 1;
  };
  const zig = (x0, y0, x1, y1, step, seed, col, prog, lw, alpha) => {
    c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.globalAlpha = alpha;
    const rows = Math.max(1, Math.ceil((y1 - y0) / step)), nrow = Math.floor(rows * clamp(prog, 0, 1));
    for (let i = 0; i < nrow; i++) {
      const y = y0 + i * step + J(i + seed, bs) * 3;
      c.beginPath();
      for (let k = 0; k <= 10; k++) {
        const x = lerp(x0, x1, k / 10) + J(i * 11 + k + seed, bs) * 6;
        const yy = y + Math.sin(k * 1.7 + i * .9) * step * .32;
        k ? c.lineTo(x, yy) : c.moveTo(x, yy);
      }
      c.stroke();
    }
    c.globalAlpha = 1;
  };
  c.drawImage(s.pt, 0, 0, w, h);
  const pOut = ss(0, 1.6, q);
  // 夜空（蜡笔平涂留飞白）
  zig(w * .02, h * .03, w * .98, h * .46, m * .05, 3, '#5b6bb5', pOut, m * .013, .42);
  // 星星
  const pStar = ss(.8, 2.2, q);
  for (let i = 0; i < s.stars.length; i++) {
    const st = s.stars[i]; if (i / s.stars.length > pStar) continue;
    const sx = st[0] * w + J(i, bs) * 3, sy = st[1] * h + J(i + 40, bs) * 3, sr = m * .012 * (1 + st[2] * .8);
    c.strokeStyle = '#f2c94c'; c.lineWidth = m * .006; c.lineCap = 'round';
    c.beginPath(); c.moveTo(sx - sr, sy); c.lineTo(sx + sr, sy); c.moveTo(sx, sy - sr); c.lineTo(sx, sy + sr); c.stroke();
  }
  // 月亮：轮廓 + 黄色之字填色
  const mcx = w * .73, mcy = h * .23, mr = m * .105;
  const circ = []; for (let a = 0; a <= 26; a++) { const an = a / 26 * TAU; circ.push([mcx + Math.cos(an) * mr, mcy + Math.sin(an) * mr]); }
  stroke(circ, '#3a3f6b', m * .012, ss(.4, 2.0, q), 11, .95);
  if (q > 1.2) {
    c.save(); c.beginPath(); c.arc(mcx, mcy, mr * .92, 0, TAU); c.clip();
    zig(mcx - mr, mcy - mr, mcx + mr, mcy + mr, m * .038, 21, '#f2c94c', ss(1.2, 2.8, q), m * .014, .85);
    c.restore();
    // 腮红般的暖晕
    c.fillStyle = hex('#f2a04c', .18); c.beginPath(); c.arc(mcx - mr * .25, mcy + mr * .15, mr * .55, 0, TAU); c.fill();
  }
  // 屋顶（深蓝蜡笔带）
  const roof = [];
  for (let k = 0; k <= 14; k++) roof.push([w * (.06 + k * .07), h * (.72 - Math.sin(k * .8) * h * .012)]);
  stroke(roof, '#2e3566', m * .016, ss(1.6, 3.0, q), 31, .9);
  zig(w * .05, h * .735, w * .98, h * .92, m * .045, 41, '#2e3566', ss(2.2, 3.8, q), m * .014, .5);
  // 小女孩（圆头 + 管状身子）
  const gx = w * .33, gy = h * .62, gp = ss(2.6, 4.2, q);
  if (gp > 0) {
    const head = []; for (let a = 0; a <= 18; a++) { const an = a / 18 * TAU; head.push([gx + Math.cos(an) * m * .045, gy - m * .07 + Math.sin(an) * m * .045]); }
    stroke(head, '#3a3f6b', m * .011, gp, 51, .95);
    zig(gx - m * .042, gy - m * .02, gx + m * .042, gy + m * .085, m * .028, 61, '#e2694f', gp, m * .012, .8);
    stroke([[gx - m * .03, gy], [gx - m * .085, gy + m * .028]], '#3a3f6b', m * .009, gp, 71, .9);
    stroke([[gx + m * .03, gy], [gx + m * .088, gy - m * .012]], '#3a3f6b', m * .009, gp, 81, .9);
    stroke([[gx - m * .02, gy + m * .08], [gx - m * .028, gy + m * .15]], '#3a3f6b', m * .01, gp, 91, .9);
    stroke([[gx + m * .02, gy + m * .08], [gx + m * .03, gy + m * .15]], '#3a3f6b', m * .01, gp, 101, .9);
  }
  // 水彩夜幕（蜡笔抗染：月亮重新透亮）
  const sweep = lerp(-w * .12, w * 1.12, ss(4.4, 6.2, q));
  if (q > 4.4) {
    c.save(); c.beginPath(); c.moveTo(-w * .1, -h * .1);
    for (let k = 0; k <= 12; k++) c.lineTo(sweep + Math.sin(k * 1.3 + t * 2) * m * .02, -h * .1 + k * (h * 1.2 / 12));
    c.lineTo(-w * .1, h * 1.1); c.closePath(); c.clip();
    c.fillStyle = 'rgba(58,74,168,.26)'; c.fillRect(0, 0, w, h);
    c.restore();
    // 抗染效果：月亮与星星保持纸白偏暖
    c.fillStyle = hex('#f2c94c', .55); c.beginPath(); c.arc(mcx, mcy, mr * .88, 0, TAU); c.fill();
    for (const st of s.stars) { c.fillStyle = hex('#f6e7b0', .5); c.fillRect(st[0] * w - 1.5, st[1] * h - 1.5, 4, 4); }
    // 湿边
    c.strokeStyle = 'rgba(46,60,150,.35)'; c.lineWidth = m * .008;
    c.beginPath(); for (let k = 0; k <= 12; k++) { const x = sweep + Math.sin(k * 1.3 + t * 2) * m * .02, y = -h * .1 + k * (h * 1.2 / 12); k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  }
  // 手写书名（逐字写下，微微歪斜）
  const title = '月亮不睡觉';
  c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = 0; i < title.length; i++) {
    const p = ss(6.4 + i * .18, 6.8 + i * .18, q); if (p <= 0) continue;
    const bx = w * .5 + (i - 2) * m * .088, by = h * .87 + J(i * 7, bs) * m * .008;
    c.save(); c.translate(bx, by); c.rotate(J(i * 13, bs) * .12);
    c.font = `700 ${(m * .072 * (.6 + .4 * p)).toFixed(1)}px ${SANS}`;
    c.fillStyle = '#3a3f6b'; c.fillText(title[i], 0, 0);
    c.restore();
  }
};


// ---- L18 ----
S.L18 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; s.pt = paperTex(w / 2, h / 2, 1, '#f6ecd8', 1818);
    const r = rng(1818);
    const band = (y0, y1, k) => { const a = []; for (let i = 0; i <= 10; i++) a.push([(-.02 + i * .104) * w, lerp(y0, y1, r()) * h]); return a; };
    s.skyTop = band(.16, .30);
    s.hillL = band(.42, .52); s.hillM = band(.52, .62); s.hillR = band(.60, .70);
    s.trunk = []; for (let i = 0; i <= 8; i++) s.trunk.push([w * (.82 + i * .012 + (r() - .5) * .01), h * (.78 - i * .062)]);
    s.leaves = []; for (let i = 0; i < 22; i++) s.leaves.push([w * (.66 + r() * .26), h * (.30 + r() * .26), r() * TAU, .5 + r()]);
    s.grass = []; for (let i = 0; i < 26; i++) s.grass.push([w * (.04 + r() * .92), h * (.76 + r() * .16), r() * TAU, r()]);
  }
  const m = Math.min(w, h), q = t % 10;
  const ribbon = (pts, widths, col, alpha, prog, seed) => {
    const n = Math.max(2, Math.round(pts.length * clamp(prog, 0, 1)));
    const JX = i => pts[i][0] + Math.sin(t * 2.1 + i * .6 + seed) * m * .004, JY = i => pts[i][1] + Math.cos(t * 1.7 + i * .5 + seed) * m * .004;
    const nx = i => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };
    c.beginPath();
    for (let i = 0; i < n; i++) { const nn = nx(i), hw = widths[i] / 2; i ? c.lineTo(JX(i) + nn[0] * hw, JY(i) + nn[1] * hw) : c.moveTo(JX(i) + nn[0] * hw, JY(i) + nn[1] * hw); }
    for (let i = n - 1; i >= 0; i--) { const nn = nx(i), hw = widths[i] / 2; c.lineTo(JX(i) - nn[0] * hw, JY(i) - nn[1] * hw); }
    c.closePath(); c.globalAlpha = alpha; c.fillStyle = col; c.fill(); c.globalAlpha = 1;
    // 飞白：几根鬃毛痕
    c.strokeStyle = hex('#f6ecd8', .5); c.lineWidth = Math.max(1, widths[0] * .06);
    for (let b = 0; b < 4; b++) {
      const nn = nx(Math.min(n - 1, b + 2)), off = (b - 1.5) * widths[Math.min(n - 1, b + 2)] * .22;
      c.beginPath();
      for (let i = 0; i < n; i++) { const nn2 = nx(i); i ? c.lineTo(pts[i][0] + nn2[0] * off, pts[i][1] + nn2[1] * off) : c.moveTo(pts[i][0] + nn2[0] * off, pts[i][1] + nn2[1] * off); }
      c.setLineDash([14 + b * 5, 9 + ((seed + b * 37) % 11)]); c.lineDashOffset = -(t * 6 + b * 13);
      c.stroke();
    }
    c.setLineDash([]);
  };
  const wash = (poly, col, alpha, prog, seed) => {
    const n = Math.max(3, Math.round(poly.length * clamp(prog, 0, 1)));
    for (let p = 0; p < 3; p++) {
      c.beginPath();
      for (let i = 0; i < n; i++) {
        const jx = Math.sin((i + seed) * 2.1 + p * 5 + t * 1.3) * m * .006, jy = Math.cos((i + seed) * 1.7 + p * 3 + t * 1.1) * m * .006;
        i ? c.lineTo(poly[i][0] + jx, poly[i][1] + jy) : c.moveTo(poly[i][0] + jx, poly[i][1] + jy);
      }
      c.closePath(); c.globalAlpha = alpha / 3; c.fillStyle = col; c.fill();
    }
    c.globalAlpha = 1;
  };
  c.drawImage(s.pt, 0, 0, w, h);
  // 天空洗
  const skyPoly = s.skyTop.concat([[w * 1.02, h * .62], [w * -.02, h * .62]]);
  wash(skyPoly, '#9fbcd6', .5, ss(.2, 1.6, q), 5);
  // 太阳
  const sunP = ss(1.0, 1.8, q);
  if (sunP > 0) { c.globalAlpha = .55 * sunP; c.fillStyle = '#d98a3d'; c.beginPath(); c.arc(w * .17, h * .2, m * .075 * sunP, 0, TAU); c.fill(); c.globalAlpha = 1; }
  // 三段山（红赭 → 鼠尾草 → 深绿）
  wash(s.hillL.concat([[w * .46, h], [-w * .02, h]]), '#b4552f', .55, ss(1.4, 2.8, q), 11);
  wash(s.hillM.concat([[w * .72, h], [w * .18, h]]), '#8ea860', .55, ss(2.0, 3.4, q), 21);
  wash(s.hillR.concat([[w * 1.02, h], [w * .5, h]]), '#4e6e3c', .55, ss(2.6, 4.0, q), 31);
  // 树：干 → 枝 → 叶
  const tw = []; for (let i = 0; i < s.trunk.length; i++) tw.push(m * .028 * (1 - i / s.trunk.length * .55));
  ribbon(s.trunk, tw, '#7a5a3c', .75, ss(3.0, 4.0, q), 3);
  ribbon([[w * .825, h * .52], [w * .76, h * .46], [w * .72, h * .42]], [m * .02, m * .012, m * .006], '#7a5a3c', .7, ss(3.6, 4.3, q), 7);
  for (let i = 0; i < s.leaves.length; i++) {
    const lf = ss(4.0 + (i / s.leaves.length) * .9, 4.5 + (i / s.leaves.length) * .9, q); if (lf <= 0) continue;
    const L = s.leaves[i], swy = Math.sin(t * 1.15 + L[2]) * m * .006 + Math.sin(t * 2.7 + L[2] * 2) * m * .003;
    c.globalAlpha = .5 * lf; c.fillStyle = i % 3 ? '#6e9448' : '#4e6e3c';
    c.beginPath(); c.ellipse(L[0] + swy, L[1], m * .032 * L[3], m * .017 * L[3], L[2], 0, TAU); c.fill();
  }
  c.globalAlpha = 1;
  // 草（画完后随风摆）
  for (let i = 0; i < s.grass.length; i++) {
    const g = s.grass[i], gp = ss(4.8 + g[3], 5.5 + g[3], q); if (gp <= 0) continue;
    const sway = Math.sin(t * 1.3 + g[2]) * m * .012 + Math.sin(t * 2.9 + g[2]) * m * .005;
    c.strokeStyle = g[3] > .5 ? '#8ea860' : '#4e6e3c'; c.lineWidth = m * .007; c.lineCap = 'round'; c.globalAlpha = .7;
    c.beginPath(); c.moveTo(g[0], g[1] + m * .05); c.quadraticCurveTo(g[0] + sway * .5, g[1] + m * .01, g[0] + sway, g[1] - m * .04 * gp); c.stroke();
  }
  c.globalAlpha = 1;
  // 标注与手记
  const noteP = ss(5.6, 6.8, q);
  if (noteP > 0) {
    c.strokeStyle = hex('#5a4632', .8 * noteP); c.lineWidth = Math.max(1, m * .0035);
    c.beginPath(); c.moveTo(w * .17, h * .32); c.lineTo(w * .17, h * .38 + m * .02); c.lineTo(w * .30, h * .38 + m * .02); c.stroke();
    c.fillStyle = hex('#5a4632', .85 * noteP); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    c.font = `500 ${(m * .028).toFixed(1)}px ${MONO}`;
    c.fillText('雨量 320mm', w * .315, h * .385 + m * .026);
    c.beginPath(); c.moveTo(w * .86, h * .30); c.lineTo(w * .86, h * .36 + m * .02); c.lineTo(w * .72, h * .36 + m * .02); c.stroke();
    c.fillText('雨量 1120mm', w * .52, h * .365 + m * .026);
    c.textAlign = 'center';
    c.font = `italic 400 ${(m * .045).toFixed(1)}px Georgia,"Noto Serif SC",serif`;
    c.fillText('从腹地到海岸', w * .5, h * .9);
  }
  // 雾带抹回纸白（循环收尾）
  const mist = ss(8.6, 10, q);
  if (mist > 0) {
    const my = lerp(h * 1.15, -h * .15, mist);
    c.fillStyle = hex('#f6ecd8', .92);
    c.beginPath(); c.moveTo(-w * .05, h * 1.2);
    for (let k = 0; k <= 14; k++) c.lineTo(-w * .05 + k * (w * 1.1 / 14), my + Math.sin(k * 1.1 + t) * m * .03);
    c.lineTo(w * 1.05, h * 1.2); c.closePath(); c.fill();
  }
};


// ---- L19 ----
S.L19 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const r = rng(1919);
    s.moss = []; for (let i = 0; i < 26; i++) s.moss.push([.72 + r() * .26, .30 + r() * .42, r()]);
    s.streaks = []; for (let i = 0; i < 10; i++) s.streaks.push([r(), .62 + r() * .3, .5 + r()]);
  }
  const m = Math.min(w, h), q = t % 11;
  const ink = (pts, wArr, alpha, bris) => {
    const nx = i => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };
    c.beginPath();
    for (let i = 0; i < pts.length; i++) { const nn = nx(i), hw = wArr[i] / 2; i ? c.lineTo(pts[i][0] + nn[0] * hw, pts[i][1] + nn[1] * hw) : c.moveTo(pts[i][0] + nn[0] * hw, pts[i][1] + nn[1] * hw); }
    for (let i = pts.length - 1; i >= 0; i--) { const nn = nx(i), hw = wArr[i] / 2; c.lineTo(pts[i][0] - nn[0] * hw, pts[i][1] - nn[1] * hw); }
    c.closePath(); c.globalAlpha = alpha; c.fillStyle = '#1a1712'; c.fill(); c.globalAlpha = 1;
    if (bris) {
      c.strokeStyle = hex('#1a1712', alpha * .9); c.lineWidth = Math.max(1, wArr[0] * .1);
      for (let b = 0; b < 3; b++) {
        const off = (b - 1) * wArr[0] * .28; c.beginPath();
        for (let i = 0; i < pts.length; i++) { const nn = nx(i); i ? c.lineTo(pts[i][0] + nn[0] * off, pts[i][1] + nn[1] * off) : c.moveTo(pts[i][0] + nn[0] * off, pts[i][1] + nn[1] * off); }
        c.setLineDash([26 + b * 9, 12 + b * 7]); c.lineDashOffset = -(b * 23); c.stroke();
      }
      c.setLineDash([]);
    }
  };
  c.fillStyle = '#F2ECDE'; c.fillRect(0, 0, w, h);
  // 远山（清墨，横向扫出）
  const rev = (x0) => { c.save(); c.beginPath(); c.rect(0, 0, x0, h); c.clip(); };
  rev(w * ss(0, 2.2, q) * 1.2);
  const far = [[-w * .02, h * .52], [w * .16, h * .34], [w * .32, h * .46], [w * .5, h * .3], [w * .7, h * .47], [w * .9, h * .36], [w * 1.02, h * .5], [w * 1.02, h * .62], [-w * .02, h * .62]];
  c.fillStyle = hex('#1a1712', .17);
  c.beginPath(); far.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fill();
  const near = [[-w * .02, h * .62], [w * .2, h * .5], [w * .38, h * .58], [w * .58, h * .5], [w * .78, h * .6], [w * 1.02, h * .52], [w * 1.02, h * .7], [-w * .02, h * .7]];
  c.fillStyle = hex('#1a1712', .26);
  c.beginPath(); near.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fill();
  c.restore();
  // 近崖（浓墨 + 苔点）
  rev(w * .6 + w * ss(0, 2.4, q) * .5);
  ink([[w * .97, h * .08], [w * .88, h * .3], [w * .92, h * .52], [w * .84, h * .74], [w * .95, h * .9]],
    [m * .07, m * .12, m * .1, m * .14, m * .06], .58, true);
  for (const mo of s.moss) { c.fillStyle = hex('#1a1712', .92); c.beginPath(); c.arc(mo[0] * w, mo[1] * h, m * .006 + mo[2] * m * .007, 0, TAU); c.fill(); }
  c.restore();
  // 水面：留白 + 淡干痕
  for (const st of s.streaks) {
    const sx = ((st[0] + t * .012 * st[2]) % 1) * w;
    c.strokeStyle = hex('#1a1712', .1); c.lineWidth = m * .0045;
    c.beginPath(); c.moveTo(sx, st[1] * h); c.lineTo(sx + w * .06 * st[2], st[1] * h + m * .004); c.stroke();
  }
  // 侠客踏水（12fps 步进）+ 脚下墨圈
  const tq = Math.floor(t * 12) / 12;
  const fx = lerp(w * .18, w * .62, clamp((q - 1.2) / 5, 0, 1)), fy = h * .665 + Math.sin(tq * 12) * m * .008;
  for (let k = 0; k < 3; k++) {
    const rp = ((t * .5 + k / 3) % 1), rr = m * .02 + rp * m * .12;
    c.strokeStyle = hex('#1a1712', .22 * (1 - rp)); c.lineWidth = m * .004;
    c.beginPath(); c.ellipse(fx - m * .02 + k * m * .014, fy + m * .075, rr, rr * .3, 0, 0, TAU); c.stroke();
  }
  if (q > 1.0) {
    ink([[fx, fy - m * .1], [fx + m * .006, fy - m * .02]], [m * .032, m * .042], .34, false); // 淡身
    ink([[fx - m * .012, fy - m * .09], [fx + m * .05, fy - m * .05]], [m * .016, m * .011], .88, true); // 手臂
    ink([[fx - m * .012, fy - m * .02], [fx - m * .03, fy + m * .065]], [m * .014, m * .009], .88, true);
    ink([[fx + m * .012, fy - m * .02], [fx + m * .035, fy + m * .065]], [m * .014, m * .009], .88, true);
    c.fillStyle = hex('#1a1712', .96); c.beginPath(); c.arc(fx, fy - m * .118, m * .019, 0, TAU); c.fill();
    ink([[fx - m * .03, fy - m * .14], [fx + m * .06, fy - m * .16]], [m * .012, m * .004], .96, true); // 斗笠
  }
  // 一剑断流：快笔横过 + 水分两侧
  const sw = ss(6.1, 6.55, q) - ss(6.9, 7.3, q);
  if (sw > 0) {
    const pr = ss(6.1, 6.6, q);
    ink([[fx + m * .04, fy - m * .1], [lerp(fx, w * .96, pr), lerp(fy - m * .1, h * .42, pr)]],
      [m * .03, m * .012], .95 * sw, true);
    if (pr > .8) {
      for (let k = 0; k < 7; k++) {
        const a = k / 7 * TAU, sp = (q - 6.6) * m * .18;
        c.fillStyle = hex('#1a1712', .55 * sw);
        c.beginPath(); c.arc(w * .92 + Math.cos(a) * sp, h * .44 + Math.sin(a) * sp * .7, m * .008, 0, TAU); c.fill();
      }
    }
    for (const sgn of [-1, 1]) {
      const off = sgn * (q - 6.3) * m * .12;
      c.strokeStyle = hex('#1a1712', .3 * sw); c.lineWidth = m * .006;
      c.beginPath();
      for (let k = 0; k <= 8; k++) { const x = w * (.3 + k * .09), y = h * .6 + off + Math.sin(k * 1.4 + t * 2) * m * .012; k ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.stroke();
    }
  }
  // 云雾留白（慢移）
  for (let k = 0; k < 3; k++) {
    const my = h * (.34 + k * .12), mx = ((t * (6 + k * 2)) % (w * 1.6)) - w * .3;
    c.fillStyle = hex('#F2ECDE', .85);
    c.beginPath(); c.moveTo(mx, my);
    for (let i = 0; i <= 6; i++) c.quadraticCurveTo(mx + i * w * .09, my - m * .02 - Math.sin(i + t * .4) * m * .018, mx + (i + .5) * w * .09, my);
    c.lineTo(mx + w * .6, my + m * .05); c.lineTo(mx, my + m * .05); c.closePath(); c.fill();
  }
  // 朱砂印章 + 题跋
  const sp = eOut(ss(8.2, 8.8, q));
  if (sp > 0) {
    c.save(); c.translate(w * .845, h * .82); c.scale(1.3 - .3 * sp, 1.3 - .3 * sp);
    c.fillStyle = hex('#B02E22', .92 * sp); c.fillRect(-m * .032, -m * .032, m * .064, m * .064);
    c.fillStyle = hex('#F2ECDE', .95 * sp);
    c.fillRect(-m * .018, -m * .018, m * .012, m * .036); c.fillRect(-m * .002, -m * .018, m * .018, m * .01);
    c.fillRect(-m * .002, -m * .002, m * .018, m * .01); c.fillRect(-m * .018, m * .004, m * .034, m * .01);
    c.restore();
    const chars = '一剑断流';
    for (let i = 0; i < 4; i++) {
      const cp = ss(8.6 + i * .16, 8.9 + i * .16, q); if (cp <= 0) continue;
      c.fillStyle = hex('#1a1712', .85 * cp); c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = `400 ${(m * .05).toFixed(1)}px Georgia,"Noto Serif SC",serif`;
      c.fillText(chars[i], w * .845, h * .70 - i * m * .058);
    }
  }
};


// ---- L20 ----
S.L20 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const r = rng(2020);
    const m = Math.min(w, h);
    // 灰版与彩版各刻一版（刀触在 init 里只画一次）
    const [gC, gX] = offscreen(w, h, 1), [cC, cX] = offscreen(w, h, 1);
    gX.fillStyle = '#6a7076'; gX.fillRect(0, 0, w, h);
    cX.fillStyle = mixHex('#2e4f8f', '#c9cdd2', .18); cX.fillRect(0, 0, w, h);
    for (let i = 0; i < 64; i++) {
      const bandK = r(), y = bandK < .42 ? r() * h * .42 : bandK < .62 ? h * (.42 + r() * .2) : h * (.62 + r() * .38);
      const v = r(), x = r() * w;
      let col, gry;
      if (bandK < .42) { col = mixHex('#2e4f8f', '#e8a55c', clamp(y / (h * .42) + (r() - .5) * .3, 0, 1)); gry = mixHex('#3a4048', '#c6cad0', clamp(y / (h * .42), 0, 1)); }
      else if (bandK < .62) { col = v > .5 ? '#c99a5c' : '#a67c4a'; gry = v > .5 ? '#a9adb2' : '#7e8288'; }
      else { col = v > .72 ? '#b98a52' : v > .4 ? '#5c6672' : '#3c444e'; gry = v > .72 ? '#a0a4a9' : v > .4 ? '#70767e' : '#454b52'; }
      const l = m * (.14 + r() * .26), wv = m * (.028 + r() * .045), a = (r() - .5) * .5 + (bandK < .42 ? .06 : bandK < .62 ? .5 : 1.45);
      const dx = Math.cos(a) * l / 2, dy = Math.sin(a) * l / 2, px = -Math.sin(a) * wv / 2, py = Math.cos(a) * wv / 2;
      for (const [gxx, fill] of [[gX, gry], [cX, col]]) {
        gxx.fillStyle = fill;
        gxx.beginPath();
        gxx.moveTo(x - dx - px * .7, y - dy - py * .7);
        gxx.lineTo(x + dx - px * 1.15, y + dy - py * 1.15);
        gxx.lineTo(x + dx + px * .7, y + dy + py * .7);
        gxx.lineTo(x - dx + px * 1.15, y - dy + py * 1.15);
        gxx.closePath(); gxx.fill();
        gxx.strokeStyle = 'rgba(255,255,255,.12)'; gxx.lineWidth = Math.max(1, wv * .18);
        gxx.beginPath(); gxx.moveTo(x - dx * .8, y - dy * .8); gxx.lineTo(x + dx * .8, y + dy * .8); gxx.stroke();
      }
    }
    s.gry = gC; s.col = cC;
    s.rain = []; for (let i = 0; i < 12; i++) s.rain.push([r(), r(), .5 + r()]);
  }
  const m = Math.min(w, h), q = t % 10;
  // 色彩之波：灰世界 → 彩色世界（红伞为圆心）
  const R = (q < 9.3 ? eOut(ss(4.2, 8.0, q)) : 1 - eOut(ss(9.3, 10, q))) * Math.hypot(w, h) * .8;
  const ucx = w * .38, ucy = h * .62;
  c.drawImage(s.gry, 0, 0, w, h);
  for (let k = 1; k <= 3; k++) {
    c.save();
    c.beginPath(); c.arc(ucx, ucy, R * (k / 3), 0, TAU); c.clip();
    c.globalAlpha = .5;
    c.drawImage(s.col, 0, 0, w, h);
    c.restore();
  }
  // 雨丝
  for (const rn of s.rain) {
    const rx = ((rn[0] + t * .05 * rn[2]) % 1) * w, ry = ((rn[1] + t * .35 * rn[2]) % 1) * h;
    c.strokeStyle = hex('#dfe4ea', .3); c.lineWidth = m * .0035;
    c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - m * .02, ry + m * .09); c.stroke();
  }
  // 湿地反光：短横刀痕叠成柱
  const refl = (cx2, cy2, col, n) => {
    for (let i = 0; i < n; i++) {
      const yy = cy2 + i * m * .028 + Math.sin(t * 1.4 + i) * m * .004, ww2 = m * .12 * (1 - i / n * .7);
      c.fillStyle = hex(col, .4 * (1 - i / n * .6));
      c.fillRect(cx2 - ww2 / 2 + Math.sin(i * 2.1 + t) * m * .01, yy, ww2, m * .011);
    }
  };
  refl(ucx, ucy + m * .1, '#e8b06a', 6); refl(w * .72, h * .58, '#e8d28a', 5);
  // 红伞（先抬后撑）
  const open = eBack(ss(3.7, 4.4, q));
  if (q > 3.4) {
    const sc = clamp(open, 0, 1.12);
    c.save(); c.translate(ucx, ucy - m * .16); c.scale(sc, sc);
    for (let k = 0; k < 5; k++) {
      const a0 = Math.PI + k * (Math.PI / 5), a1 = Math.PI + (k + 1) * (Math.PI / 5);
      c.fillStyle = k % 2 ? '#c23a2e' : '#a82f24';
      c.beginPath(); c.moveTo(0, 0);
      c.lineTo(Math.cos(a0) * m * .17, Math.sin(a0) * m * .11);
      c.lineTo(Math.cos((a0 + a1) / 2) * m * .185, Math.sin((a0 + a1) / 2) * m * .115);
      c.lineTo(Math.cos(a1) * m * .17, Math.sin(a1) * m * .11);
      c.closePath(); c.fill();
    }
    c.strokeStyle = '#2c2c30'; c.lineWidth = m * .008;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(0, m * .2); c.stroke();
    c.restore();
    // 撑伞人
    c.fillStyle = '#23262b';
    c.beginPath(); c.arc(ucx, ucy - m * .1, m * .026, 0, TAU); c.fill();
    c.fillRect(ucx - m * .035, ucy - m * .075, m * .07, m * .13);
  }
  // 字幕（刀写标题）
  const tp = eOut(ss(1.2, 2.2, q));
  if (tp > 0) {
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `600 ${(m * .062).toFixed(1)}px Georgia,"Noto Serif SC",serif`;
    c.fillStyle = hex('#eef1f4', .9);
    c.fillText('雨中圆舞曲', w * .5 + (1 - tp) * m * .3, h * .9);
  }
};


// ---- L21 ----
S.L21 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; s.pt = paperTex(w / 2, h / 2, 1, '#f4efe4', 2121);
    const WP = [[.06, .70], [.16, .52], [.10, .38], [.22, .30], [.34, .42], [.28, .58], [.16, .62], [.30, .72],
    [.48, .62], [.52, .42], [.42, .28], [.58, .22], [.70, .34], [.62, .50], [.72, .62], [.86, .52],
    [.90, .36], [.78, .28], [.68, .40], [.76, .58], [.60, .70], [.44, .78], [.28, .82], [.14, .88], [.08, .78]];
    const P = i => WP[clamp(i, 0, WP.length - 1)];
    const pts = [];
    for (let i = 0; i < WP.length - 1; i++) {
      for (let k = 0; k < 10; k++) {
        const u = k / 10, p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
        const f = (a, b, cc, d) => .5 * ((2 * b) + (-a + cc) * u + (2 * a - 5 * b + 4 * cc - d) * u * u + (-a + 3 * b - 3 * cc + d) * u * u * u);
        pts.push([f(p0[0], p1[0], p2[0], p3[0]) * w, f(p0[1], p1[1], p2[1], p3[1]) * h]);
      }
    }
    pts.push([WP[WP.length - 1][0] * w, WP[WP.length - 1][1] * h]);
    let L = 0; s.cum = [0];
    for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); s.cum.push(L); }
    s.pts = pts; s.L = L;
  }
  const m = Math.min(w, h), q = t % 11, D = 9.4;
  const p = clamp(q / D, 0, 1);
  const headF = p * s.L;
  let hi = 1; while (hi < s.cum.length - 1 && s.cum[hi] < headF) hi++;
  const hp = s.pts[hi];
  // 相机轻随笔尖
  const camx = clamp(hp[0] - w / 2, -w * .18, w * .18) * .8, camy = clamp(hp[1] - h / 2, -h * .12, h * .12) * .8;
  const zoom = lerp(1.06, 1, eOut(q / D)) + (q > D ? .01 * Math.sin((q - D) * 3) : 0);
  c.drawImage(s.pt, 0, 0, w, h);
  c.save(); c.translate(w / 2, h / 2); c.scale(zoom, zoom); c.translate(-w / 2 - camx, -h / 2 - camy);
  // 墨线（填充带，速度感宽度起伏）
  const drawRibbon = (i0, i1, col) => {
    c.beginPath();
    for (let i = i0; i <= i1; i++) {
      const a = s.pts[Math.max(0, i - 1)], b = s.pts[Math.min(s.pts.length - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      const wd = m * .0075 * (1 + .45 * Math.sin(i * .12) + .18 * Math.sin(i * .53 + t * .5));
      i === i0 ? c.moveTo(s.pts[i][0] + nx * wd, s.pts[i][1] + ny * wd) : c.lineTo(s.pts[i][0] + nx * wd, s.pts[i][1] + ny * wd);
    }
    for (let i = i1; i >= i0; i--) {
      const a = s.pts[Math.max(0, i - 1)], b = s.pts[Math.min(s.pts.length - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      const wd = m * .0075 * (1 + .45 * Math.sin(i * .12) + .18 * Math.sin(i * .53 + t * .5));
      c.lineTo(s.pts[i][0] - nx * wd, s.pts[i][1] - ny * wd);
    }
    c.closePath(); c.fillStyle = col; c.fill();
  };
  const ac0 = Math.floor(s.pts.length * .42), ac1 = Math.floor(s.pts.length * .52);
  drawRibbon(0, Math.max(1, Math.min(hi, ac0)), '#1D1A17');
  if (hi > ac0) drawRibbon(ac0, Math.min(hi, ac1), '#B03A2E');
  if (hi > ac1) drawRibbon(ac1, hi, '#1D1A17');
  // 笔尖影与接触点
  if (p < 1) {
    c.fillStyle = hex('#1D1A17', .16);
    c.beginPath(); c.ellipse(hp[0] + m * .03, hp[1] + m * .045, m * .05, m * .028, .5, 0, TAU); c.fill();
    c.fillStyle = hex('#1D1A17', .95);
    c.beginPath(); c.arc(hp[0], hp[1], m * .008, 0, TAU); c.fill();
    // 停顿墨珠
    if (Math.abs(Math.sin(q * 1.7)) < .12) { c.fillStyle = hex('#1D1A17', .5); c.beginPath(); c.arc(hp[0], hp[1] + m * .012, m * .014, 0, TAU); c.fill(); }
  }
  c.restore();
  // 纸白扫过（换纸重来）
  if (q > 9.9) {
    const sw = (q - 9.9) / 1.1;
    c.fillStyle = hex('#f4efe4', .96);
    c.fillRect(0, 0, w * sw, h);
  }
};


// ---- L22 ----
S.L22 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const r = rng(2222);
    s.ghosts = []; for (let i = 0; i < 12; i++) s.ghosts.push({ x: r(), y: .08 + r() * .8, k: Math.floor(r() * 3), rot: (r() - .5) * .5 });
    const arcPts = (cx2, cy2, rad, a0, a1, n) => { const a = []; for (let i = 0; i <= n; i++) { const an = lerp(a0, a1, i / n); a.push([cx2 + Math.cos(an) * rad, cy2 + Math.sin(an) * rad]); } return a; };
    s.strokes = [
      { pts: arcPts(w * .18, h * .46, Math.min(w, h) * .15, -.4, TAU + .5, 26), col: '#23262c', lw: .012, t0: 2.0, t1: 3.2 }, // 地球（过头闭合）
      { pts: [[w * .34, h * .30], [w * .42, h * .24], [w * .46, h * .27]], col: '#2a5cb3', lw: .011, t0: 3.2, t1: 3.7 },
      { pts: [[w * .42, h * .24], [w * .40, h * .18]], col: '#2a5cb3', lw: .009, t0: 3.7, t1: 3.95 },
      { pts: [[w * .42, h * .24], [w * .47, h * .185]], col: '#2a5cb3', lw: .009, t0: 3.95, t1: 4.2 },
      { pts: [[w * .46, h * .27], [w * .30, h * .38], [w * .22, h * .40]], col: '#2a5cb3', lw: .01, t0: 4.2, t1: 4.8 },
      { pts: arcPts(w * .68, h * .42, Math.min(w, h) * .115, -.2, TAU + .4, 22), col: '#23262c', lw: .012, t0: 5.2, t1: 6.1 }, // 钟面
      { pts: [[w * .68, h * .42], [w * .68, h * .335]], col: '#23262c', lw: .010, t0: 6.1, t1: 6.35 },
      { pts: [[w * .68, h * .42], [w * .745, h * .45]], col: '#23262c', lw: .010, t0: 6.35, t1: 6.6 },
      { pts: [[w * .60, h * .62], [w * .78, h * .62]], col: '#d97757', lw: .013, t0: 7.0, t1: 7.35 },
      { pts: [[w * .60, h * .66], [w * .70, h * .66]], col: '#d97757', lw: .009, t0: 7.35, t1: 7.6 }
    ];
  }
  const m = Math.min(w, h), q = t % 10;
  const cam = eOut(ss(2.8, 3.6, q)) * (1 - eOut(ss(7.8, 8.6, q))) * w * .42;
  c.fillStyle = vgrad(c, h, '#fcfbf8', '#eaeef1'); c.fillRect(0, 0, w, h);
  // 幽灵旧痕
  for (const g of s.ghosts) {
    c.save(); c.translate(g.x * w - cam * .92, g.y * h); c.rotate(g.rot);
    c.strokeStyle = hex(g.k === 2 ? '#7fa2d8' : '#9aa2ab', .09); c.lineWidth = m * .008;
    if (g.k === 0) { c.beginPath(); c.arc(0, 0, m * .06, 0, TAU); c.stroke(); }
    else if (g.k === 1) { c.beginPath(); c.moveTo(-m * .07, 0); c.lineTo(m * .07, 0); c.lineTo(m * .045, -m * .025); c.moveTo(m * .07, 0); c.lineTo(m * .045, m * .025); c.stroke(); }
    else { c.strokeRect(-m * .08, -m * .035, m * .16, m * .07); }
    c.restore();
  }
  // 玻璃反光（慢速漂移）
  const shx = (t * m * .05 - cam * .35) % (w * 1.7) - w * .35;
  c.fillStyle = hex('#ffffff', .13);
  c.beginPath(); c.moveTo(shx, 0); c.lineTo(shx + w * .22, 0); c.lineTo(shx + w * .1, h); c.lineTo(shx - w * .12, h); c.closePath(); c.fill();
  // 手写笔画（逐段写出）
  const wob = (pts, seed) => pts.map((p, i) => [p[0] + Math.sin(i * 1.7 + seed) * m * .004, p[1] + Math.cos(i * 1.3 + seed) * m * .004]);
  for (const st of s.strokes) {
    const pr = eOut(ss(st.t0, st.t1, q)); if (pr <= 0) continue;
    const pts = wob(st.pts, st.t0 * 7);
    const n = Math.max(2, Math.round(pts.length * pr));
    c.strokeStyle = st.col; c.lineWidth = m * st.lw; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath();
    for (let i = 0; i < n; i++) i ? c.lineTo(pts[i][0] - cam, pts[i][1]) : c.moveTo(pts[i][0] - cam, pts[i][1]);
    c.stroke();
    // 起笔墨点
    c.fillStyle = hex(st.col, .85); c.beginPath(); c.arc(pts[0][0] - cam, pts[0][1], m * st.lw * .8, 0, TAU); c.fill();
    if (pr < 1) {
      const hi2 = pts[Math.max(0, n - 1)];
      // 悬浮马克笔（无手）
      c.fillStyle = hex('#23262b', .18); c.fillRect(hi2[0] - cam - m * .012, hi2[1] + m * .028, m * .05, m * .012);
      c.fillStyle = '#f2f2ee'; c.fillRect(hi2[0] - cam - m * .012, hi2[1] - m * .02, m * .024, m * .05);
      c.fillStyle = st.col; c.fillRect(hi2[0] - cam - m * .012, hi2[1] + m * .014, m * .024, m * .016);
    }
  }
  // 手写文字（逐字、微抖）
  const line = (txt, x, y, size, col, t0, per) => {
    c.textAlign = 'left'; c.textBaseline = 'middle';
    for (let i = 0; i < txt.length; i++) {
      const p2 = ss(t0 + i * per, t0 + i * per + .12, q); if (p2 <= 0) continue;
      c.font = `600 ${(size * (.7 + .3 * p2)).toFixed(1)}px ${SANS}`;
      c.fillStyle = col;
      c.fillText(txt[i], x + i * size * 1.02 - cam, y + Math.sin(i * 2.3) * size * .05);
    }
  };
  line('手机怎么知道你在哪', w * .06, h * .12, m * .062, '#23262c', .2, .13);
  line('GPS 卫星', w * .36, h * .145, m * .036, '#2a5cb3', 4.85, .1);
  line('原子钟', w * .62, h * .145, m * .036, '#2a5cb3', 6.65, .11);
  line('38 微秒', w * .58, h * .545, m * .06, '#d97757', 7.05, .12);
  line('每天多出', w * .585, h * .735, m * .032, '#23262c', 7.7, .1);
  // 磁贴（滑动 + 高光）
  const mag = (x, y, col) => {
    c.fillStyle = hex('#1c2026', .18); c.beginPath(); c.ellipse(x, y + m * .028, m * .032, m * .012, 0, 0, TAU); c.fill();
    c.fillStyle = col; c.beginPath(); c.arc(x, y, m * .032, 0, TAU); c.fill();
    c.fillStyle = hex('#ffffff', .4); c.beginPath(); c.arc(x - m * .011, y - m * .011, m * .009, 0, TAU); c.fill();
  };
  mag(w * .855 - cam * .55, h * .12, '#2a5cb3');
  mag(lerp(w * .9, w * .83, eOut(ss(5.2, 6.0, q))) - cam * .55, h * .22, '#d97757');
  // 板擦（留一点残影）
  const er = ss(8.4, 9.2, q);
  if (er > 0 && er < 1) {
    const ex = lerp(w * .02, w * .42, er) - cam * .92;
    c.fillStyle = hex('#fcfbf8', .9); c.fillRect(w * .02 - cam * .92, h * .06, ex - (w * .02 - cam * .92), m * .16);
    c.fillStyle = '#8a6f52'; c.fillRect(ex, h * .075, m * .09, m * .055);
    c.fillStyle = '#d9d4c8'; c.fillRect(ex, h * .075, m * .09, m * .018);
  }
};


// ---- L23 ----
S.L23 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; s.pt = paperTex(w / 2, h / 2, 1, '#f2e7d0', 2323);
    const r = rng(2323);
    const wobbly = (x0, y0, x1, y1, n, amp) => { const a = []; for (let i = 0; i <= n; i++) a.push([lerp(x0, x1, i / n) + (r() - .5) * amp, lerp(y0, y1, i / n) + (r() - .5) * amp]); return a; };
    s.ink = [
      { pts: wobbly(w * .04, h * .72, w * .96, h * .70, 12, Math.min(w, h) * .01), t0: .1, t1: 1.0, lw: .0035 },
      { pts: wobbly(w * .70, h * .72, w * .72, h * .30, 8, Math.min(w, h) * .012), t0: .8, t1: 1.6, lw: .005 },
      { pts: wobbly(w * .72, h * .40, w * .60, h * .30, 5, Math.min(w, h) * .01), t0: 1.3, t1: 1.8, lw: .0035 },
      { pts: wobbly(w * .72, h * .42, w * .84, h * .32, 5, Math.min(w, h) * .01), t0: 1.5, t1: 2.0, lw: .0035 },
      { pts: wobbly(w * .12, h * .66, w * .12, h * .58, 3, Math.min(w, h) * .006), t0: 1.7, t1: 2.0, lw: .004 },
      { pts: wobbly(w * .12, h * .58, w * .30, h * .575, 4, Math.min(w, h) * .006), t0: 1.9, t1: 2.2, lw: .004 },
      { pts: wobbly(w * .30, h * .58, w * .30, h * .66, 3, Math.min(w, h) * .006), t0: 2.1, t1: 2.35, lw: .004 },
      { pts: wobbly(w * .145, h * .58, w * .145, h * .50, 3, Math.min(w, h) * .005), t0: 2.2, t1: 2.45, lw: .0035 },
      { pts: wobbly(w * .275, h * .58, w * .275, h * .50, 3, Math.min(w, h) * .005), t0: 2.3, t1: 2.55, lw: .0035 }
    ];
    s.scal = []; for (let i = 0; i < 14; i++) s.scal.push([w * (.56 + r() * .3), h * (.18 + r() * .18), Math.min(w, h) * (.012 + r() * .016)]);
    s.fol = [[w * .68, h * .33, Math.min(w, h) * .10], [w * .76, h * .28, Math.min(w, h) * .085], [w * .62, h * .27, Math.min(w, h) * .07], [w * .82, h * .35, Math.min(w, h) * .075]];
  }
  const m = Math.min(w, h), q = t % 10;
  c.drawImage(s.pt, 0, 0, w, h);
  // 钢笔线（顺序画出，抖动、出头、断线）
  for (let si = 0; si < s.ink.length; si++) {
    const st = s.ink[si], pr = eOut(ss(st.t0, st.t1, q)); if (pr <= 0) continue;
    const wf = i => [st.pts[i][0] + Math.sin(t * 2.2 + i * 1.3 + si) * m * .0022, st.pts[i][1] + Math.cos(t * 1.9 + i * 1.1 + si) * m * .0022];
    const n = Math.max(2, Math.round(st.pts.length * pr));
    const f = pr * (st.pts.length - 1), i0 = Math.min(st.pts.length - 2, Math.floor(f)), fr = f - i0;
    c.strokeStyle = '#4a3520'; c.lineWidth = m * st.lw; c.lineCap = 'round';
    c.beginPath();
    for (let i = 0; i < n; i++) { const p2 = wf(i); i ? c.lineTo(p2[0], p2[1]) : c.moveTo(p2[0], p2[1]); }
    if (pr < 1) c.lineTo(lerp(st.pts[i0][0], st.pts[i0 + 1][0], fr), lerp(st.pts[i0][1], st.pts[i0 + 1][1], fr));
    c.stroke();
    if (si === 0 && pr > .5 && pr < .75) { c.beginPath(); c.moveTo(st.pts[2][0] + m * .01, st.pts[2][1]); c.lineTo(st.pts[2][0] + m * .03, st.pts[2][1] - m * .004); c.stroke(); }
  }
  // 树冠扇贝线
  const sp = ss(1.8, 2.6, q);
  if (sp > 0) {
    c.strokeStyle = hex('#4a3520', .9); c.lineWidth = m * .0032;
    c.beginPath();
    for (let i = 0; i < s.scal.length * sp; i++) {
      const sc = s.scal[i];
      c.moveTo(sc[0], sc[1]);
      c.arc(sc[0] + Math.sin(t * 1.4 + i) * m * .0018, sc[1] + Math.cos(t * 1.2 + i) * m * .0018, sc[2] * (1 + .015 * Math.sin(t * 1.6 + i)), -.6, Math.PI + .6);
    }
    c.stroke();
  }
  // 水彩色晕：草帽飞到哪，哪里才有颜色
  const hatU = clamp((q - 2.2) / 4.6, 0, 1);
  const hx = lerp(w * .18, w * .86, eOut(hatU)) + Math.sin(t * 1.3) * m * .02;
  const hy = h * .46 + Math.sin(t * 1.9) * m * .05 + Math.sin(hatU * Math.PI) * -h * .12;
  const bloom = (cx2, cy2, rad, col, t0) => {
    const p2 = eOut(ss(t0, t0 + 1.1, q)); if (p2 <= 0) return;
    c.save(); c.beginPath();
    for (let k = 0; k <= 16; k++) {
      const an = k / 16 * TAU, rr = rad * p2 * (1 + .12 * Math.sin(k * 2.3 + t * .8));
      k ? c.lineTo(cx2 + Math.cos(an) * rr, cy2 + Math.sin(an) * rr) : c.moveTo(cx2 + Math.cos(an) * rr, cy2 + Math.sin(an) * rr);
    }
    c.closePath(); c.clip();
    c.fillStyle = hex(col, .5); c.fillRect(cx2 - rad * 1.4, cy2 - rad * 1.4, rad * 2.8, rad * 2.8);
    c.restore();
    c.strokeStyle = hex(col, .32); c.lineWidth = m * .006;
    c.beginPath();
    for (let k = 0; k <= 16; k++) {
      const an = k / 16 * TAU, rr = rad * p2 * (1 + .12 * Math.sin(k * 2.3 + t * .8));
      k ? c.lineTo(cx2 + Math.cos(an) * rr, cy2 + Math.sin(an) * rr) : c.moveTo(cx2 + Math.cos(an) * rr, cy2 + Math.sin(an) * rr);
    }
    c.closePath(); c.stroke();
  };
  bloom(w * .22, h * .60, m * .28, '#c3c96f', 2.6);   // 草地
  bloom(w * .72, h * .30, m * .22, '#7fa04a', 3.2);   // 树冠
  bloom(w * .5, h * .16, m * .26, '#9fbcd6', 3.8);    // 天
  bloom(w * .21, h * .55, m * .07, '#d8c6a0', 4.6);   // 长椅
  bloom(w * .55, h * .62, m * .12, '#c3c96f', 5.2);   // 前景草
  // 草帽（主角）
  if (q > 2.1) {
    c.fillStyle = hex('#e2c273', .95);
    c.beginPath(); c.ellipse(hx, hy, m * .055, m * .028, .3, 0, TAU); c.fill();
    c.strokeStyle = '#4a3520'; c.lineWidth = m * .0035;
    c.beginPath(); c.ellipse(hx, hy, m * .055, m * .028, .3, 0, TAU); c.stroke();
    c.fillStyle = hex('#caa64f', .95);
    c.beginPath(); c.ellipse(hx - m * .004, hy - m * .018, m * .028, m * .02, .3, 0, TAU); c.fill();
    c.stroke();
    // 风的墨卷
    for (let k = 0; k < 3; k++) {
      const phase = (t * .9 + k * .33) % 1;
      c.strokeStyle = hex('#4a3520', .5 * (1 - phase)); c.lineWidth = m * .0035;
      c.beginPath();
      for (let i = 0; i <= 8; i++) {
        const px = hx - m * .08 - phase * m * .3 - i * m * .012, py = hy + Math.sin(i * 1.2 + t * 3 + k * 2) * m * .012;
        i ? c.lineTo(px, py) : c.moveTo(px, py);
      }
      c.stroke();
    }
  }
  // 角落手记
  const np = ss(6.4, 8.2, q);
  if (np > 0) {
    c.fillStyle = hex('#4a3520', .85); c.textAlign = 'left'; c.textBaseline = 'middle';
    const note = '六月二日 · 微风 · 城南公园';
    for (let i = 0; i < note.length; i++) {
      const p2 = ss(6.4 + i * .09, 6.65 + i * .09, q); if (p2 <= 0) continue;
      c.font = `500 ${(m * .032).toFixed(1)}px ${SANS}`;
      c.fillText(note[i], w * .06 + i * m * .036, h * .9 + Math.sin(i * 1.9) * m * .004);
    }
  }
  // 翻页（换一页新速写）
  if (q > 9.2) {
    const sw = (q - 9.2) / .8;
    c.fillStyle = '#f2e7d0';
    c.beginPath(); c.moveTo(w * (1 - sw) + w, 0); c.lineTo(w * (1 - sw) + w * .06, 0); c.lineTo(w * (1 - sw) + w * .12, h); c.lineTo(w * (1 - sw) + w, h); c.closePath(); c.fill();
  }
};


// ---- L24 ----
S.L24 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; s.pt = paperTex(w / 2, h / 2, 1, '#efe3c8', 2424);
  }
  const m = Math.min(w, h), q = t % 9;
  c.drawImage(s.pt, 0, 0, w, h);
  // 油灯闪烁：暖光与热斑
  const flick = 1 + .06 * Math.sin(t * 7.3) * Math.sin(t * 3.1) + .03 * Math.sin(t * 13.7);
  const lampX = w * .5, lampY = h * .58;
  const lg = c.createRadialGradient(lampX, lampY, 0, lampX, lampY, m * .85);
  lg.addColorStop(0, hex('#ffd9a0', .22 * flick)); lg.addColorStop(1, hex('#b8763a', .12 * flick));
  c.fillStyle = lg; c.fillRect(0, 0, w, h);
  const trem = k => nz(k * 1.7, k * 2.3, t * .9) * m * .004;
  const hide = (path, col, holes, alpha) => {
    c.globalCompositeOperation = 'multiply'; c.globalAlpha = alpha == null ? .88 : alpha;
    c.fillStyle = col; path(); c.fill();
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    c.strokeStyle = '#42290f'; c.lineWidth = m * .0035; path(); c.stroke();
    for (const hp of holes) { c.fillStyle = '#fff4d8'; hp(); c.fill(); }
  };
  const rivet = (x, y) => {
    c.strokeStyle = '#42290f'; c.lineWidth = m * .0035;
    c.beginPath(); c.arc(x, y, m * .011, 0, TAU); c.stroke();
    c.fillStyle = '#fff2d0'; c.beginPath(); c.arc(x, y, m * .005, 0, TAU); c.fill();
  };
  // 入场（press-on）与整组颤动
  const press = eOut(ss(0, 1.0, q));
  const bl = 1 + .3 * (1 - press);
  c.save();
  c.translate(w * .38 + trem(1), h * .52 + trem(2));
  c.scale(bl, bl); c.globalAlpha = .35 + .65 * press;
  const bob = Math.sin(Math.floor(t * 12) / 12 * 9) * m * .006;
  // 躯干
  hide(() => { c.beginPath(); c.moveTo(-m * .07, -m * .1 + bob); c.lineTo(m * .07, -m * .1 + bob); c.lineTo(m * .05, m * .12 + bob); c.lineTo(-m * .05, m * .12 + bob); c.closePath(); },
    '#c8442a', [() => { c.beginPath(); c.arc(0, m * .01 + bob, m * .022, 0, TAU); c.fill(); },
    () => { for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(-m * .03 + k * m * .03, -m * .06 + bob, m * .011, 0, TAU); c.fill(); } }]);
  // 头 + 冠
  hide(() => { c.beginPath(); c.arc(0, -m * .165 + bob, m * .052, 0, TAU); c.fill(); },
    '#d8a13e', [() => { c.beginPath(); c.arc(0, -m * .165 + bob, m * .02, 0, TAU); c.fill(); },
    () => { c.beginPath(); c.arc(-m * .016, -m * .175 + bob, m * .008, 0, TAU); c.fill(); },
    () => { c.beginPath(); c.arc(m * .016, -m * .175 + bob, m * .008, 0, TAU); c.fill(); }]);
  hide(() => { c.beginPath(); c.moveTo(-m * .06, -m * .2 + bob); c.quadraticCurveTo(0, -m * .26 + bob, m * .06, -m * .2 + bob); c.lineTo(m * .045, -m * .185 + bob); c.lineTo(-m * .045, -m * .185 + bob); c.closePath(); },
    '#4e8a6a', [() => { for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(-m * .026 + k * m * .026, -m * .215 + bob, m * .009, 0, TAU); c.fill(); } }]);
  // 手臂（抬弓）
  const armA = lerp(.7, -.35, eOut(ss(1.2, 3.4, q)));
  for (const side of [-1, 1]) {
    c.save(); c.translate(side * m * .07, -m * .075 + bob); c.rotate(side === -1 ? armA : armA * .35 + .35);
    hide(() => { c.beginPath(); c.rect(0, -m * .018, m * .13, m * .036); c.closePath(); }, '#c8442a',
      [() => { c.beginPath(); c.arc(m * .065, 0, m * .011, 0, TAU); c.fill(); }]);
    rivet(m * .13, 0);
    c.restore();
  }
  // 腿
  for (const side of [-1, 1]) {
    c.save(); c.translate(side * m * .035, m * .11 + bob); c.rotate(side * .12 + Math.sin(t * 3 + side) * .04);
    hide(() => { c.beginPath(); c.rect(0, 0, m * .032, m * .14); c.closePath(); }, '#245a8a',
      [() => { c.beginPath(); c.arc(m * .016, m * .07, m * .009, 0, TAU); c.fill(); }]);
    c.restore();
  }
  rivet(-m * .07, -m * .075 + bob); rivet(m * .07, -m * .075 + bob); rivet(0, -m * .112 + bob);
  // 弓与箭
  const draw2 = eOut(ss(2.2, 3.6, q));
  c.strokeStyle = '#5a3a16'; c.lineWidth = m * .012; c.lineCap = 'round';
  c.beginPath(); c.arc(-m * .16, -m * .06 + bob, m * .115, -1.15, 1.15); c.stroke();
  c.strokeStyle = '#42290f'; c.lineWidth = m * .0035;
  c.beginPath(); c.moveTo(-m * .16 + Math.cos(-1.15) * m * .115, -m * .06 + bob + Math.sin(-1.15) * m * .115);
  c.lineTo(-m * .16 + m * .1 * (1 - draw2 * .5), -m * .06 + bob); c.lineTo(-m * .16 + Math.cos(1.15) * m * .115, -m * .06 + bob + Math.sin(1.15) * m * .115); c.stroke();
  // 杆（颈与手）
  c.strokeStyle = hex('#6b5232', .55); c.lineWidth = m * .006;
  c.beginPath(); c.moveTo(0, -m * .12 + bob); c.lineTo(w * .06, h * .62); c.moveTo(-m * .16, -m * .06 + bob); c.lineTo(-w * .12, h * .62); c.stroke();
  c.restore();
  // 太阳（镂空火纹）→ 中箭裂开
  const sunX = w * .82, sunY = h * .18, shake = q > 4.5 && q < 6 ? Math.sin(t * 40) * m * .006 : 0;
  const crack = eOut(ss(5.2, 6.4, q));
  for (const sgn of [-1, 1]) {
    c.save(); c.translate(sunX + shake + sgn * crack * m * .09, sunY + crack * m * .02); c.rotate(sgn * crack * .5);
    hide(() => { c.beginPath(); c.arc(0, 0, m * .085, sgn > 0 ? -Math.PI / 2 : Math.PI / 2, sgn > 0 ? Math.PI / 2 : Math.PI * 1.5); c.closePath(); },
      '#d8a13e', [() => { c.beginPath(); c.arc(0, 0, m * .03, 0, TAU); c.fill(); },
      () => { for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(0, -m * .05 + k * m * .05, m * .012, 0, TAU); c.fill(); } }]);
    c.restore();
  }
  // 箭（离弦）
  const arr = clamp((q - 4.3) / 1.0, 0, 1);
  if (q > 4.2 && arr < 1) {
    const ax = lerp(w * .3, sunX, eOut(arr)), ay = lerp(h * .46, sunY, eOut(arr));
    c.strokeStyle = '#42290f'; c.lineWidth = m * .008; c.lineCap = 'round';
    c.beginPath(); c.moveTo(ax - m * .12, ay + m * .05); c.lineTo(ax, ay); c.stroke();
    c.fillStyle = '#42290f';
    c.beginPath(); c.moveTo(ax + m * .014, ay - m * .008); c.lineTo(ax - m * .012, ay - m * .018); c.lineTo(ax - m * .006, ay + m * .01); c.closePath(); c.fill();
  }
  // 亮框与暗角
  c.strokeStyle = hex('#6b3f16', .8); c.lineWidth = m * .018;
  c.strokeRect(m * .03, m * .045, w - m * .06, h - m * .09);
  const vg2 = c.createRadialGradient(w / 2, h / 2, m * .3, w / 2, h / 2, m * .95);
  vg2.addColorStop(0, 'rgba(90,50,15,0)'); vg2.addColorStop(1, 'rgba(90,50,15,.4)');
  c.fillStyle = vg2; c.fillRect(0, 0, w, h);
};


// ---- L25 ----
S.L25 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1;
    // 各色版分别制版（套色错位）
    const mk = () => offscreen(w, h, 1);
    let [sc, sx] = mk();
    for (let i = 0; i < 42; i++) {
      const x0 = i / 42 * w, ww = w / 42 + 1;
      const top = h * .34 + Math.sin(i * .37) * h * .035 + Math.sin(i * .13 + 2) * h * .025;
      const g = sx.createLinearGradient(0, 0, 0, top);
      g.addColorStop(0, '#2b4f8f'); g.addColorStop(1, '#b7cbe0');
      sx.fillStyle = g; sx.fillRect(x0, 0, ww, top);
    }
    // 水（带状蓝 + 晕色）
    for (let b = 0; b < 3; b++) {
      const y0 = h * (.72 + b * .09), g2 = sx.createLinearGradient(0, y0, 0, y0 + h * .09);
      g2.addColorStop(0, b % 2 ? '#3a63a4' : '#2b4f8f'); g2.addColorStop(1, '#8fb0d4');
      sx.fillStyle = g2; sx.fillRect(0, y0, w, h * .09);
    }
    sx.fillStyle = '#7d9cc9'; sx.fillRect(0, h * .52, w, h * .1);
    s.blue = sc;
    let [gc, gx2] = mk();
    gx2.fillStyle = '#7a8f5a';
    gx2.beginPath(); gx2.moveTo(0, h * .62);
    for (let i = 0; i <= 12; i++) gx2.lineTo(i / 12 * w, h * (.58 + Math.sin(i * 1.1) * .02));
    gx2.lineTo(w, h * .72); gx2.lineTo(0, h * .72); gx2.closePath(); gx2.fill();
    gx2.fillStyle = '#4a5f3f';
    for (let k = 0; k < 3; k++) { gx2.beginPath(); gx2.ellipse(w * (.2 + k * .3), h * (.635 + k * .012), w * .13, h * .028, 0, 0, TAU); gx2.fill(); }
    s.green = gc;
    let [rc, rx] = mk();
    rx.fillStyle = '#b5342a'; rx.beginPath(); rx.arc(w * .26, h * .17, Math.min(w, h) * .075, 0, TAU); rx.fill();
    rx.fillStyle = '#b5342a'; rx.fillRect(w * .345, h * .615, w * .018, h * .05);
    rx.fillRect(w * .06, h * .06, w * .035, h * .16);
    s.red = rc;
    let [kc, kx] = mk();
    kx.strokeStyle = '#1c1a17'; kx.lineCap = 'round';
    kx.lineWidth = Math.min(w, h) * .006;
    kx.strokeRect(w * .04, h * .045, w * .92, h * .9);
    kx.lineWidth = Math.min(w, h) * .0022;
    kx.strokeRect(w * .052, h * .058, w * .896, h * .874);
    // 远山轮廓 / 松 / 人物 / 波纹
    kx.lineWidth = Math.min(w, h) * .005;
    kx.beginPath(); kx.moveTo(0, h * .62);
    for (let i = 0; i <= 12; i++) kx.lineTo(i / 12 * w, h * (.58 + Math.sin(i * 1.1) * .02));
    kx.stroke();
    kx.lineWidth = Math.min(w, h) * .004;
    for (let k = 0; k < 3; k++) {
      kx.beginPath();
      kx.moveTo(w * (.2 + k * .3) - w * .1, h * (.635 + k * .012));
      kx.quadraticCurveTo(w * (.2 + k * .3), h * (.585 + k * .012), w * (.2 + k * .3) + w * .1, h * (.635 + k * .012));
      kx.stroke();
      kx.beginPath(); kx.moveTo(w * (.2 + k * .3), h * .63); kx.lineTo(w * (.2 + k * .3), h * .7); kx.stroke();
    }
    for (let b = 0; b < 4; b++) {
      kx.beginPath();
      for (let i = 0; i <= 10; i++) { const x = i / 10 * w, y = h * (.74 + b * .06) + Math.sin(i * 1.2 + b) * h * .008; i ? kx.lineTo(x, y) : kx.moveTo(x, y); }
      kx.stroke();
    }
    // 旅人（小，扁平）
    kx.lineWidth = Math.min(w, h) * .0035;
    kx.beginPath(); kx.arc(w * .36, h * .665, Math.min(w, h) * .016, 0, TAU); kx.stroke();
    kx.beginPath(); kx.moveTo(w * .36, h * .68); kx.lineTo(w * .36, h * .715); kx.moveTo(w * .36, h * .69); kx.lineTo(w * .345, h * .71); kx.moveTo(w * .36, h * .69); kx.lineTo(w * .375, h * .71); kx.stroke();
    // 题签（画赞）+ 印
    kx.fillStyle = '#efe6cf'; kx.fillRect(w * .855, h * .1, w * .075, h * .3);
    kx.strokeRect(w * .855, h * .1, w * .075, h * .3);
    kx.fillStyle = '#1c1a17'; kx.textAlign = 'center'; kx.textBaseline = 'middle';
    const ttl = '旅路远山';
    for (let i = 0; i < 4; i++) { kx.font = `500 ${(Math.min(w, h) * .05).toFixed(1)}px Georgia,"Noto Serif SC",serif`; kx.fillText(ttl[i], w * .8925, h * .155 + i * h * .062); }
    kx.fillStyle = '#b5342a'; kx.fillRect(w * .862, h * .345, Math.min(w, h) * .032, Math.min(w, h) * .032);
    // 木纹与砂目
    const r = rng(2525);
    kx.strokeStyle = 'rgba(28,26,24,.07)'; kx.lineWidth = 2;
    for (let k = 0; k < 8; k++) {
      kx.beginPath();
      for (let i = 0; i <= 12; i++) kx.lineTo(i / 12 * w, h * (.1 + k * .028) + Math.sin(i * .8 + k * 2) * h * .012);
      kx.stroke();
    }
    kx.fillStyle = 'rgba(28,26,24,.16)';
    for (let k = 0; k < 130; k++) kx.fillRect(r() * w, r() * h, 1.6, 1.6);
    s.key = kc;
  }
  const m = Math.min(w, h), q = t % 10;
  s.pt2 = s.pt2 || paperTex(w / 2, h / 2, 1, '#f0e7d3', 2526);
  c.drawImage(s.pt2, 0, 0, w, h);
  const blocks = [[s.key, 0, 0], [s.blue, 2, -2], [s.green, -2, 2], [s.red, 3, 3]];
  const zoom = 1 + .018 * Math.sin(t * .12);
  c.save(); c.translate(w / 2, h / 2); c.scale(zoom, zoom); c.translate(-w / 2, -h / 2);
  for (let bi = 0; bi < blocks.length; bi++) {
    const [bv, dx, dy] = blocks[bi];
    const rv = eOut(ss(.12 + bi * .38, .62 + bi * .38, q));
    const full = q > 1.75 ? 1 : rv;
    if (full <= 0) continue;
    c.save();
    if (full < 1) {
      const fw = full * 1.5;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(w * fw, 0); c.lineTo(w * fw - h * .35, h); c.lineTo(0, h); c.closePath(); c.clip();
    }
    const sl = (1 - full) * 6;
    c.drawImage(bv, dx + sl, dy - sl, w, h);
    c.restore();
    // 刷扫痕
    if (full < 1 && full > 0) {
      const ex = w * full * 1.5 - h * .35 * full;
      c.strokeStyle = hex('#1c1a17', .25); c.lineWidth = m * .012;
      c.beginPath(); c.moveTo(w * full * 1.5, 0); c.lineTo(ex, h); c.stroke();
    }
  }
  // 雨（两组细直线，12fps 步进）
  const rq = Math.floor(t * 12) / 12;
  for (let set = 0; set < 2; set++) {
    c.strokeStyle = hex('#2b3a4f', .3); c.lineWidth = m * .0028;
    for (let k = 0; k < 12; k++) {
      const x = ((k / 12 + set * .045 + rq * .05) % 1) * w, y = ((k * .17 + rq * .4) % 1) * h;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x - m * .02 - set * m * .008, y + m * .12); c.stroke();
    }
  }
  // 雾带（suyari-gasumi）慢移
  for (let k = 0; k < 2; k++) {
    const bx = Math.sin(t * .05 + k * 2) * w * .05;
    c.fillStyle = hex('#f0e7d3', .88);
    c.beginPath();
    c.moveTo(w * (.02 + k * .46) + bx, h * (.5 + k * .07));
    for (let i = 0; i <= 6; i++) c.quadraticCurveTo(w * (.05 + k * .46 + i * .06) + bx, h * (.46 + k * .07), w * (.08 + k * .46 + i * .06) + bx, h * (.5 + k * .07));
    c.lineTo(w * (.42 + k * .46) + bx, h * (.55 + k * .07)); c.lineTo(w * (.02 + k * .46) + bx, h * (.55 + k * .07)); c.closePath(); c.fill();
  }
  // 落叶
  const lf = (t * .08) % 1;
  c.save(); c.translate(w * (.5 + lf * .3), h * (.12 + lf * .55)); c.rotate(lf * 6 + t);
  c.fillStyle = '#b5342a'; c.beginPath(); c.ellipse(0, 0, m * .012, m * .006, .6, 0, TAU); c.fill();
  c.restore();
  // 印章落款
  const stp = eOut(ss(8.2, 8.6, q));
  if (stp > 0) {
    c.save(); c.translate(w * .12, h * .82); c.scale(1.35 - .35 * stp, 1.35 - .35 * stp);
    c.fillStyle = hex('#b5342a', .92); c.fillRect(-m * .026, -m * .026, m * .052, m * .052);
    c.fillStyle = '#f0e7d3';
    c.fillRect(-m * .014, -m * .016, m * .028, m * .008); c.fillRect(-m * .014, 0, m * .028, m * .008);
    c.restore();
  }
  c.restore();
};


// ---- L26 ----
S.L26 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1;
    const R = 460;
    let [wc, wx] = offscreen(R, R, 1);
    wx.translate(R / 2, R / 2);
    wx.beginPath(); wx.moveTo(0, 0); wx.arc(0, 0, R * .47, -Math.PI / 8, Math.PI / 8); wx.closePath();
    wx.fillStyle = '#d2201f'; wx.fill();
    wx.globalCompositeOperation = 'destination-out';
    wx.strokeStyle = '#000'; wx.lineCap = 'round';
    for (let k = 0; k < 3; k++) { wx.lineWidth = R * .024; wx.beginPath(); wx.arc(0, 0, R * (.16 + k * .09), -.22, .22); wx.stroke(); }
    wx.lineWidth = R * .02;
    for (let k = 0; k < 5; k++) {
      const an = -.2 + k * .1, rr = R * .34;
      wx.beginPath(); wx.arc(Math.cos(an) * rr * .5, Math.sin(an) * rr * .5, R * .028, 0, TAU); wx.fill();
    }
    // 外缘锯齿
    wx.beginPath();
    for (let k = 0; k <= 10; k++) {
      const an = lerp(-Math.PI / 8, Math.PI / 8, k / 10), rr = R * (k % 2 ? .415 : .455);
      k ? wx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr) : wx.moveTo(Math.cos(an) * rr, Math.sin(an) * rr);
    }
    for (let k = 10; k >= 0; k--) {
      const an = lerp(-Math.PI / 8, Math.PI / 8, k / 10), rr = R * (k % 2 ? .39 : .375);
      wx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr);
    }
    wx.closePath(); wx.fill();
    wx.globalCompositeOperation = 'source-over';
    let [rc2, rx2] = offscreen(R, R, 1);
    for (let k = 0; k < 8; k++) {
      rx2.save(); rx2.translate(R / 2, R / 2); rx2.rotate(k * TAU / 8); rx2.drawImage(wc, -R / 2, -R / 2, R, R); rx2.restore();
    }
    s.ros = rc2;
    const r = rng(2626);
    s.scraps = []; for (let i = 0; i < 9; i++) s.scraps.push([r(), r(), r() * TAU, r()]);
    s.gold = []; for (let i = 0; i < 7; i++) s.gold.push([r(), r(), r() * TAU, r()]);
  }
  const m = Math.min(w, h), q = t % 10;
  // 夜色剪纸地面（深靛纸层，锯齿边）
  c.fillStyle = '#182048'; c.fillRect(0, 0, w, h);
  const sawBand = (yBase, amp, col, seed) => {
    c.fillStyle = col; c.beginPath(); c.moveTo(-w * .02, h * 1.1);
    for (let k = 0; k <= 40; k++) {
      const x = -w * .02 + k * (w * 1.04 / 40), y = yBase + (k % 2 ? -amp : amp) + Math.sin(k * .7 + seed) * amp * .6;
      c.lineTo(x, y);
    }
    c.lineTo(w * 1.02, h * 1.1); c.closePath(); c.fill();
  };
  sawBand(h * .52, m * .012, '#232c5c', 1);
  sawBand(h * .68, m * .016, '#141b3e', 2);
  // 村舍（红纸房）
  for (let k = 0; k < 4; k++) {
    const hx = w * (.08 + k * .23), hy = h * .62, hw = w * .1, hh = h * .1;
    c.fillStyle = k % 2 ? '#a81c1c' : '#8f1616';
    c.fillRect(hx, hy, hw, hh);
    c.beginPath(); c.moveTo(hx - hw * .12, hy); c.lineTo(hx + hw * .5, hy - hh * .55); c.lineTo(hx + hw * 1.12, hy); c.closePath(); c.fill();
    c.fillStyle = hex('#f5c26b', .9);
    for (let wi = 0; wi < 2; wi++) c.fillRect(hx + hw * (.18 + wi * .4), hy + hh * .3, hw * .18, hh * .3);
  }
  // 灯影：窗花点亮后地面投影
  const lit = ss(2.0, 3.2, q);
  const rcx = w * .52, rcy = h * .36, rSize = m * (.62) * (eBack(ss(.2, 1.6, q)) * .35 + .65);
  if (lit > 0) {
    c.save(); c.globalCompositeOperation = 'lighter';
    c.translate(rcx, h * .8); c.scale(1, .32); c.rotate(t * .12);
    c.globalAlpha = .22 * lit;
    c.drawImage(s.ros, -rSize / 2, -rSize / 2, rSize, rSize);
    c.restore(); c.globalAlpha = 1;
    glowDot(c, rcx, rcy, m * .55 * lit, '#ffb862', .3 * lit * (1 + .1 * Math.sin(t * 3.1)));
  }
  // 年兽（锯齿红影，先看后逃）
  const flee = eOut(ss(5.0, 6.6, q));
  const bx = lerp(w * .82, w * 1.12, flee), by = h * .56;
  const bq = Math.floor(t * 12) / 12;
  c.save(); c.translate(bx + Math.sin(bq * 9) * m * .008 * (1 + flee * 2), by);
  c.fillStyle = '#7a1512';
  c.beginPath(); c.moveTo(-m * .12, m * .06);
  for (let k = 0; k <= 8; k++) c.lineTo(-m * .12 + k * m * .03, m * .06 - (k % 2 ? m * .028 : 0));
  c.lineTo(m * .12, -m * .02); c.lineTo(m * .06, -m * .09); c.lineTo(-m * .02, -m * .05); c.lineTo(-m * .1, -m * .08);
  c.closePath(); c.fill();
  c.beginPath(); c.arc(m * .09, -m * .1, m * .042, 0, TAU); c.fill();
  c.fillStyle = '#f5c26b';
  c.beginPath(); c.arc(m * .105, -m * .115, m * .009, 0, TAU); c.fill();
  c.restore();
  // 小女孩（关节红纸人，12fps 步进）
  const raise = eOut(ss(3.2, 4.4, q));
  c.save(); c.translate(w * .22, h * .585 + (bq % .16 < .08 ? 0 : -m * .006));
  const piece = (drawFn, col) => {
    c.fillStyle = col; drawFn(); c.fill();
    c.strokeStyle = hex('#f0908c', .8); c.lineWidth = m * .0022; drawFn(); c.stroke();
    c.strokeStyle = hex('#5c0c0c', .6); drawFn(); c.stroke();
  };
  piece(() => { c.beginPath(); c.rect(-m * .035, -m * .085, m * .07, m * .115); c.closePath(); }, '#c8231f');
  piece(() => { c.beginPath(); c.arc(0, -m * .13, m * .038, 0, TAU); }, '#c8231f');
  for (const sgn of [-1, 1]) {
    c.save(); c.translate(sgn * m * .035, -m * .07); c.rotate(sgn * lerp(.5, 2.4, raise));
    piece(() => { c.beginPath(); c.rect(0, -m * .011, m * .075, m * .022); c.closePath(); }, '#b31d1a');
    c.restore();
    c.save(); c.translate(sgn * m * .018, m * .028); c.rotate(sgn * .12);
    piece(() => { c.beginPath(); c.rect(0, 0, m * .022, m * .078); c.closePath(); }, '#b31d1a');
    c.restore();
    c.fillStyle = '#5c0c0c'; c.beginPath(); c.arc(sgn * m * .035, -m * .07, m * .006, 0, TAU); c.fill();
  }
  c.fillStyle = '#5c0c0c'; c.fillRect(-m * .022, -m * .138, m * .012, m * .006); c.fillRect(m * .01, -m * .138, m * .012, m * .006);
  c.restore();
  // 大团花（缓缓旋转 + 展开）
  c.save(); c.translate(rcx, rcy); c.rotate(t * .12 + Math.sin(t * .7) * .05);
  const pop = eBack(ss(.2, 1.6, q));
  c.scale(pop, pop);
  c.drawImage(s.ros, -rSize / 2, -rSize / 2, rSize, rSize);
  // 阴刻内轮廓（双线）
  c.strokeStyle = hex('#f0908c', .5); c.lineWidth = m * .0035;
  c.beginPath(); c.arc(0, 0, rSize * .3, 0, TAU); c.stroke();
  c.restore();
  // 剪纸碎屑飘落
  for (const sc of s.scraps) {
    const fy = (sc[1] + t * (.06 + sc[3] * .08)) % 1;
    c.save(); c.translate(sc[0] * w, fy * h); c.rotate(sc[2] + t * (1 + sc[3]));
    c.fillStyle = hex('#d2201f', .8);
    c.beginPath(); c.moveTo(0, -m * .012); c.lineTo(m * .01, m * .012); c.lineTo(-m * .01, m * .008); c.closePath(); c.fill();
    c.restore();
  }
  // 金箔高光（高潮一刻）
  if (q > 6.2) {
    for (const gd of s.gold) {
      const gy = (gd[1] + t * .1) % 1;
      c.save(); c.translate(gd[0] * w, gy * h); c.rotate(gd[2] + t * 2);
      c.fillStyle = hex('#f5c26b', .85 * ss(6.2, 7, q) * (q > 9 ? ss(10, 9.2, q) : 1));
      c.beginPath(); c.moveTo(0, -m * .014); c.lineTo(m * .009, 0); c.lineTo(0, m * .014); c.lineTo(-m * .009, 0); c.closePath(); c.fill();
      c.restore();
    }
  }
};


// ---- L27 ----
S.L27 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const r = rng(2727);
    s.layers = [
      { col: '#0a1330', z: 0, y: .30 },
      { col: '#6a86c2', z: .22, y: .42 },
      { col: '#3f5a92', z: .46, y: .56 },
      { col: '#243566', z: .7, y: .70 },
      { col: '#0e1532', z: 1, y: .84 }
    ];
    for (const L of s.layers) {
      L.edge = []; const n = 16;
      for (let i = 0; i <= n; i++) {
        const x = -.05 + i / n * 1.1;
        let y = L.y + Math.sin(i * 1.1 + L.z * 9) * .035;
        if (L.z === .46 && i % 4 === 2) y -= .05;   // 屋脊
        if (L.z === .7 && i % 3 === 0) y -= .045;   // 树尖
        L.edge.push([x, y]);
      }
      L.wins = [];
      const nw = Math.round(4 + L.z * 6);
      for (let i = 0; i < nw; i++) L.wins.push([.05 + r() * .9, L.y + .04 + r() * .1, r()]);
    }
  }
  const m = Math.min(w, h), q = t % 12;
  // 木盒边框
  c.fillStyle = '#241608'; c.fillRect(0, 0, w, h);
  const flick = 1 + .06 * Math.sin(t * 7.3) * Math.sin(t * 3.1) + .02 * Math.sin(t * 13.1);
  const dolly = Math.sin(t * .1) * m * .012 + Math.sin(t * .043) * m * .008;
  const driftx = Math.sin(t * .31) * m * .0022, drifty = Math.cos(t * .27) * m * .0022;
  for (let li = 0; li < s.layers.length; li++) {
    const L = s.layers[li];
    const px = (L.z - .5) * dolly + driftx * (1 + L.z), py = (L.z - .5) * dolly * .4 + drifty * (1 + L.z);
    // 投影在后一层上
    if (li > 0) {
      c.fillStyle = hex('#05070f', .3);
      c.beginPath(); c.moveTo(-w * .05 + px + m * .012, h * 1.1);
      for (const e2 of L.edge) c.lineTo(e2[0] * w + px + m * .012, e2[1] * h + py + m * .016);
      c.lineTo(w * 1.05 + px, h * 1.1); c.closePath(); c.fill();
    }
    c.fillStyle = L.col;
    c.beginPath(); c.moveTo(-w * .05 + px, h * 1.1);
    for (const e2 of L.edge) c.lineTo(e2[0] * w + px, e2[1] * h + py);
    c.lineTo(w * 1.05 + px, h * 1.1); c.closePath(); c.fill();
    // 暖顶边光 / 底边暗带
    c.strokeStyle = hex('#ffd9a0', .3 * flick * (1 - L.z * .6)); c.lineWidth = m * .005;
    c.beginPath();
    for (let i = 0; i < L.edge.length; i++) { const e2 = L.edge[i]; i ? c.lineTo(e2[0] * w + px, e2[1] * h + py) : c.moveTo(e2[0] * w + px, e2[1] * h + py); }
    c.stroke();
    c.fillStyle = hex('#05070f', .35); c.fillRect(-w * .05 + px, h * 1.02, w * 1.1, h * .08);
    // 发光窗洞
    for (let wi = 0; wi < L.wins.length; wi++) {
      const wnd = L.wins[wi], on = ss(2 + li * .5 + wi * .3, 2.5 + li * .5 + wi * .3, q) * flick;
      const wx2 = wnd[0] * w + px, wy2 = wnd[1] * h + py;
      glowDot(c, wx2, wy2, m * .055, '#ffb862', .5 * on * (1 - L.z * .45));
      c.fillStyle = hex('#ffd9a0', .9 * on * (1 - L.z * .4));
      c.fillRect(wx2 - m * .012, wy2 - m * .017, m * .024, m * .034);
    }
    // 纤维颗粒
    c.fillStyle = hex('#ffffff', .04);
    for (let k = 0; k < 10; k++) c.fillRect(px + ((k * 137 + li * 61) % 100) / 100 * w, py + L.y * h + ((k * 89) % 100) / 100 * h * .3, 2, 2);
  }
  // 月亮（远层孔洞）
  glowDot(c, w * .7 + driftx * 1.2, h * .18 + drifty, m * .22, '#ffe9c0', .8 * flick);
  c.fillStyle = hex('#fff4dc', .95 * flick);
  c.beginPath(); c.arc(w * .7 + driftx * 1.2, h * .18 + drifty, m * .055, 0, TAU); c.fill();
  // 提灯小人（一点朱红）走过中层
  const wq = Math.floor(t * 12) / 12;
  const fx = ((wq * .055) % 1) * w * .9 + w * .05, fy = h * .625 + Math.sin(wq * 11) * m * .004;
  c.fillStyle = '#c8442a';
  c.fillRect(fx - m * .011, fy - m * .028, m * .022, m * .05);
  c.beginPath(); c.arc(fx, fy - m * .042, m * .013, 0, TAU); c.fill();
  glowDot(c, fx + m * .026, fy - m * .005, m * .05, '#ffb862', .75 * flick);
  c.fillStyle = '#241608'; c.fillRect(fx + m * .012, fy - m * .022, m * .028, m * .032);
  // 暖色背光渐晕 + 暗角
  const bk = c.createRadialGradient(w * .55, h * .45, m * .1, w * .55, h * .45, m * .95);
  bk.addColorStop(0, hex('#ffca80', .1 * flick)); bk.addColorStop(1, 'rgba(10,8,16,.42)');
  c.fillStyle = bk; c.fillRect(0, 0, w, h);
  c.strokeStyle = '#3a2410'; c.lineWidth = m * .035; c.strokeRect(0, 0, w, h);
  // 画外一行小字（纸上刻字）
  const tp = ss(8.6, 9.6, q);
  if (tp > 0) {
    c.fillStyle = hex('#f3e2c2', .8 * tp); c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `500 ${(m * .038).toFixed(1)}px Georgia,"Noto Serif SC",serif`;
    c.fillText('月满中秋 · 纸灯长明', w * .5, h * .93);
  }
};


// ---- L28 ----
S.L28 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const r = rng(2828);
    s.specks = []; for (let i = 0; i < 34; i++) s.specks.push([r(), r(), r(), r()]);
    const tile = (step, rad) => {
      const [tc, tx] = offscreen(step, step, 1);
      tx.fillStyle = '#000'; tx.beginPath(); tx.arc(step / 2, step / 2, rad, 0, TAU); tx.fill();
      return tc;
    };
    s.tileY = tile(10, 2.6); s.tileB = tile(11, 3.2); s.tileP = tile(12, 3.6);
  }
  const m = Math.min(w, h), q = t % 10;
  const kick = (t % 1.6) < .4 ? Math.exp(-(t % 1.6) * 7) * Math.sin((t % 1.6) * 40) * m * .012 : 0;
  const plate = (dx, dy, drawFn) => {
    c.save(); c.translate(dx + kick, dy - kick * .6);
    drawFn();
    c.restore();
  };
  c.fillStyle = '#F4EEE2'; c.fillRect(0, 0, w, h);
  // 纸纤维
  c.fillStyle = hex('#c9b998', .25);
  for (const sp of s.specks) c.fillRect(sp[0] * w, sp[1] * h, 2 + sp[2] * 2, 1.5);
  const sweep = eOut(ss(0, 1.4, q));
  const gate = (fn) => {
    if (sweep >= 1) { fn(); return; }
    c.save(); c.beginPath(); c.moveTo(0, -h * .1); c.lineTo(w * (sweep * 1.3), -h * .1 + h * .12 * Math.sin(t * 6)); c.lineTo(w * (sweep * 1.3 - .25), h * 1.1); c.lineTo(0, h * 1.1); c.closePath(); c.clip();
    fn(); c.restore();
    c.strokeStyle = hex('#3a3126', .3); c.lineWidth = m * .02;
    c.beginPath(); c.moveTo(w * (sweep * 1.3), -h * .1 + h * .12 * Math.sin(t * 6)); c.lineTo(w * (sweep * 1.3 - .25), h * 1.1); c.stroke();
  };
  // 黄版：太阳 + 天空网点带
  plate(w * .004, -h * .004, () => gate(() => {
    c.fillStyle = '#FFE800'; c.beginPath(); c.arc(w * .26, h * .22, m * .16, 0, TAU); c.fill();
    c.save(); c.beginPath(); c.rect(0, 0, w, h * .38); c.clip();
    c.fillStyle = c.createPattern ? (c.createPattern(s.tileY, 'repeat') || '#FFE800') : '#FFE800';
    c.globalAlpha = .55; c.fillRect(0, 0, w, h * .38); c.globalAlpha = 1;
    c.restore();
  }));
  // 蓝版：城市剪影 + 河 + 骑车人（纸白抠边）
  plate(-w * .004, h * .003, () => gate(() => {
    c.fillStyle = '#0078BF';
    for (let k = 0; k < 7; k++) {
      const bx = w * (.05 + k * .14), bh = h * (.14 + ((k * 37) % 40) / 100 * .22);
      c.fillRect(bx, h * .58 - bh, w * .1, bh);
    }
    c.save(); c.beginPath(); c.rect(0, h * .68, w, h * .14); c.clip();
    c.fillStyle = c.createPattern ? (c.createPattern(s.tileB, 'repeat') || '#0078BF') : '#0078BF';
    c.globalAlpha = .8; c.fillRect(0, h * .68, w, h * .14); c.globalAlpha = 1;
    c.restore();
    // 骑车人
    const cq = Math.floor(t * 12) / 12;
    const cx = ((q * .075) % 1) * w * 1.1 - w * .05, cy = h * .64 + Math.sin(cq * 11) * m * .005;
    c.save();
    c.strokeStyle = '#F4EEE2'; c.lineWidth = m * .022; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(cx - m * .05, cy - m * .02); c.lineTo(cx + m * .02, cy - m * .08); c.lineTo(cx + m * .05, cy - m * .01); c.stroke();
    c.restore();
    c.strokeStyle = '#0078BF'; c.lineWidth = m * .011;
    c.beginPath(); c.arc(cx - m * .045, cy, m * .028, 0, TAU); c.moveTo(cx + m * .045, cy); c.arc(cx + m * .045, cy, m * .028, 0, TAU); c.stroke();
    c.beginPath(); c.moveTo(cx - m * .045, cy); c.lineTo(cx, cy - m * .035); c.lineTo(cx + m * .045, cy); c.moveTo(cx, cy - m * .035); c.lineTo(cx + m * .01, cy - m * .075); c.stroke();
    c.fillStyle = '#0078BF';
    c.beginPath(); c.arc(cx + m * .005, cy - m * .095, m * .017, 0, TAU); c.fill();
    c.fillRect(cx - m * .008, cy - m * .085, m * .026, m * .045);
    c.beginPath(); c.moveTo(cx - m * .01, cy - m * .07 + (cq % .16 < .08 ? m * .012 : -m * .006)); c.lineTo(cx - m * .032, cy - m * .03); c.lineTo(cx - m * .012, cy - m * .028); c.closePath(); c.fill();
  }));
  // 粉版：山丘与棚（叠印成紫）
  plate(w * .003, h * .003, () => gate(() => {
    c.globalCompositeOperation = 'multiply';
    c.fillStyle = '#FF48B0';
    c.beginPath(); c.moveTo(-w * .02, h * .9);
    for (let i = 0; i <= 10; i++) c.lineTo(i / 10 * w, h * (.78 + Math.sin(i * 1.2) * .035));
    c.lineTo(w * 1.02, h * .9); c.lineTo(w * 1.02, h * 1.05); c.lineTo(-w * .02, h * 1.05); c.closePath(); c.fill();
    c.fillRect(w * .68, h * .42, w * .17, h * .02);
    c.beginPath(); c.moveTo(w * .66, h * .42); c.lineTo(w * .855, h * .42); c.lineTo(w * .82, h * .36); c.lineTo(w * .7, h * .36); c.closePath(); c.fill();
    c.globalCompositeOperation = 'source-over';
    c.save(); c.beginPath(); c.rect(0, h * .72, w, h * .22); c.clip();
    c.fillStyle = c.createPattern ? (c.createPattern(s.tileP, 'repeat') || '#FF48B0') : '#FF48B0';
    c.globalAlpha = .5; c.fillRect(0, h * .72, w, h * .22); c.globalAlpha = 1;
    c.restore();
  }));
  // 印墨瑕疵：针孔与进纸痕（3Hz 重掷）
  const sk = Math.floor(t * 3);
  for (let i = 0; i < 12; i++) {
    const ph = Math.sin((i * 31 + sk * 17)) * 43758.545;
    const px = ((ph - Math.floor(ph)) * w), py2 = ((Math.sin(i * 77 + sk * 13) * 43758.545 % 1 + 1) % 1) * h;
    c.fillStyle = hex('#F4EEE2', .8); c.fillRect(px, py2, 2.4, 2.4);
  }
  c.fillStyle = hex('#3a3126', .05);
  for (let i = 0; i < 4; i++) c.fillRect(0, (i * 173 % 100) / 100 * h + Math.sin(sk + i) * 4, w, m * .004);
  // 字幕（纸白抠边条）
  c.fillStyle = '#F4EEE2'; c.fillRect(w * .18, h * .86, w * .64, h * .09);
  c.fillStyle = '#0078BF'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `700 ${(m * .05).toFixed(1)}px ${SANS}`;
  c.fillText('周日早晨 · 骑车穿城', w * .5 + kick * .5, h * .905);
};


// ---- L29 ----
S.L29 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const r = rng(2929);
    s.pt = paperTex(w / 2, h / 2, 1, '#f0e6cf', 2929);
    s.dots = []; for (let i = 0; i < 40; i++) s.dots.push([r(), r(), r()]);
    const tile = (rad, ang) => {
      const [tc, tx] = offscreen(16, 16, 1);
      tx.translate(8, 8); tx.rotate(ang); tx.fillStyle = '#000';
      tx.beginPath(); tx.arc(0, 0, rad, 0, TAU); tx.fill();
      return tc;
    };
    s.tCob = tile(3.1, .35); s.tPink = tile(2.4, 1.05); s.tYel = tile(2.0, -.5);
  }
  const m = Math.min(w, h), q = t % 12;
  const bs = Math.floor(t * 10);
  const J = (i) => { const x = Math.sin(i * 91.7 + bs * 47.3) * 43758.545; return (x - Math.floor(x)) - .5; };
  c.drawImage(s.pt, 0, 0, w, h);
  // 中缝与暗角
  c.fillStyle = hex('#8a7550', .18); c.fillRect(w * .5 - m * .004, 0, m * .008, h);
  const vg = c.createRadialGradient(w / 2, h / 2, m * .25, w / 2, h / 2, m * 1.05);
  vg.addColorStop(0, 'rgba(120,95,60,0)'); vg.addColorStop(1, 'rgba(120,95,60,.3)');
  c.fillStyle = vg; c.fillRect(0, 0, w, h);
  const cardA = q < 4.2 || q > 4.68;
  const wipe = ss(4.2, 4.68, q);
  // 点阵擦除转场
  const drawCard = () => {
    // HUD
    c.fillStyle = '#23305c'; c.textAlign = 'left'; c.textBaseline = 'middle';
    c.font = `700 ${(m * .026).toFixed(1)}px ${MONO}`;
    c.fillText(cardA ? 'CASE-1994-0207 · 物证一' : 'CASE-1994-0207 · 物证二', w * .05, h * .08);
    c.textAlign = 'right';
    c.fillText(Math.floor(t) % 2 ? 'REC ● 12:0' : 'REC ○ 12:0', w * .95, h * .08);
    // 网点背景块
    const pat = c.createPattern ? (c.createPattern(s.tCob, 'repeat') || '#3d63c8') : '#3d63c8';
    c.globalAlpha = .5; c.fillStyle = pat;
    c.fillRect(w * .04, h * .16, w * .5, h * .34);
    c.globalAlpha = 1;
    // 大标题（错位套印 + 逐字砸下）
    const head = cardA ? '立案审查' : '凌晨跑酷';
    c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    for (let i = 0; i < head.length; i++) {
      const p = eBack(ss((cardA ? .3 : 4.9) + i * .07, (cardA ? .62 : 5.22) + i * .07, q));
      const dy = (1 - clamp(p, 0, 1)) * -m * .12;
      c.font = `900 ${(m * .115 * lerp(1.25, 1, clamp(p, 0, 1))).toFixed(1)}px Georgia,"Noto Serif SC",serif`;
      c.fillStyle = '#e8548c'; c.fillText(head[i], w * .07 + i * m * .135 + m * .012, h * .36 + dy + m * .012);
      c.fillStyle = '#23305c'; c.fillText(head[i], w * .07 + i * m * .135, h * .36 + dy);
    }
    // 身高尺
    for (let k = 0; k < 9; k++) {
      c.fillStyle = hex('#23305c', .7); c.fillRect(w * .6, h * .2 + k * h * .07, w * .05 * (k % 2 ? .5 : 1), m * .006);
    }
    // 胖橘猫（粗线卡通 + 线条沸腾）
    const cx = cardA ? w * .76 : w * .52, cy = cardA ? h * .62 : h * .55;
    const jump = cardA ? 0 : Math.sin(clamp((q - 4.7) / 2.2, 0, 1) * Math.PI) * m * .12;
    c.save(); c.translate(cx, cy - jump);
    if (!cardA) c.rotate(-.18);
    const cat = (dx2) => {
      c.strokeStyle = '#23305c'; c.lineWidth = m * .017; c.lineJoin = 'round';
      c.fillStyle = '#e2883c';
      c.beginPath(); c.ellipse(J(1 + dx2) * m * .006, m * .04 + J(2 + dx2) * m * .006, m * .12, m * .085, 0, 0, TAU); c.fill(); c.stroke();
      c.beginPath(); c.arc(J(3 + dx2) * m * .006, -m * .07 + J(4 + dx2) * m * .006, m * .072, 0, TAU); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-m * .06, -m * .12); c.lineTo(-m * .042, -m * .19); c.lineTo(-m * .012, -m * .135); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(m * .06, -m * .12); c.lineTo(m * .042, -m * .19); c.lineTo(m * .012, -m * .135); c.closePath(); c.fill(); c.stroke();
    };
    cat(0);
    // 眼睛（眨眼）
    const blink = (t % 3.4) > 3.15 ? .12 : 1;
    for (const sgn of [-1, 1]) {
      c.fillStyle = '#23305c';
      c.beginPath(); c.ellipse(sgn * m * .028, -m * .082, m * .017, m * .017 * blink + m * .002, 0, 0, TAU); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(sgn * m * .028 - m * .006, -m * .088, m * .006, 0, TAU); c.fill();
      c.beginPath(); c.arc(sgn * m * .028 + m * .005, -m * .076, m * .003, 0, TAU); c.fill();
    }
    // 尾巴摆
    c.strokeStyle = '#23305c'; c.lineWidth = m * .017; c.lineCap = 'round';
    c.beginPath(); c.moveTo(m * .1, m * .06);
    c.quadraticCurveTo(m * .19, m * .02 + Math.sin(t * 2.1) * m * .03, m * .17, -m * .08 + Math.sin(t * 2.1) * m * .04);
    c.stroke();
    c.restore();
    // 说明条（关键词高亮）
    const cw = eOut(ss((cardA ? 1.4 : 5.8), (cardA ? 1.8 : 6.2), q));
    if (cw > 0) {
      c.fillStyle = '#23305c';
      c.beginPath(); c.roundRect ? c.roundRect(w * .12, h * .82, w * .76 * cw, h * .09, m * .02) : c.rect(w * .12, h * .82, w * .76 * cw, h * .09);
      c.fill();
      c.fillStyle = '#e8548c'; c.fillRect(w * .12 + m * .012, h * .82 + h * .1, w * .76 * cw, h * .02);
      c.fillStyle = '#f0e6cf'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = `700 ${(m * .045).toFixed(1)}px ${SANS}`;
      c.fillText(cardA ? '测试重力 · 结果：失败' : '凌晨跑酷 · 罪名：扰民', w * .5 * cw + w * .12 * (1 - cw) + (cw < 1 ? w * .1 : 0), h * .865);
    }
    // 展签
    c.fillStyle = '#e8548c'; c.fillRect(w * .6, h * .18, w * .12, h * .05);
    c.fillStyle = '#f0e6cf'; c.textAlign = 'center'; c.font = `700 ${(m * .028).toFixed(1)}px ${SANS}`;
    c.fillText(cardA ? '物证 A' : '物证 B', w * .66, h * .207);
  };
  drawCard();
  // 点阵转场覆盖
  if (wipe > 0 && wipe < 1) {
    const grow = wipe < .5 ? wipe * 2 : (1 - wipe) * 2;
    for (let iy = 0; iy < 7; iy++) for (let ix = 0; ix < 12; ix++) {
      const dl = clamp(grow * 1.8 - (ix + iy) / 18, 0, 1);
      if (dl <= 0) continue;
      c.fillStyle = cardA ? '#23305c' : '#f0e6cf';
      c.beginPath(); c.arc((ix + .5) / 12 * w, (iy + .5) / 7 * h, dl * m * .09, 0, TAU); c.fill();
    }
  }
  // 砸章：无罪释放
  const sp = ss(9.15, 9.24, q);
  if (sp > 0) {
    const bounce = sp < 1 ? lerp(2.6, 1, sp) : 1 + .06 * Math.exp(-(q - 9.24) * 6) * Math.cos((q - 9.24) * 22);
    const shake = sp < .5 ? Math.sin(t * 90) * m * .01 * (1 - sp) : 0;
    c.save(); c.translate(w * .64 + shake, h * .4 + shake * .7); c.rotate(-.14); c.scale(bounce, bounce);
    c.globalAlpha = .93;
    c.strokeStyle = '#c8363a'; c.lineWidth = m * .012;
    c.beginPath(); c.roundRect ? c.roundRect(-m * .22, -m * .1, m * .44, m * .2, m * .016) : c.rect(-m * .22, -m * .1, m * .44, m * .2);
    c.stroke();
    c.lineWidth = m * .005;
    c.beginPath(); c.roundRect ? c.roundRect(-m * .205, -m * .086, m * .41, m * .172, m * .012) : c.rect(-m * .205, -m * .086, m * .41, m * .172);
    c.stroke();
    c.fillStyle = '#c8363a'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `900 ${(m * .082).toFixed(1)}px Georgia,"Noto Serif SC",serif`;
    c.fillText('无罪释放', 0, 0);
    for (const d of s.dots.slice(0, 14)) c.fillRect((d[0] - .5) * m * .4, (d[1] - .5) * m * .18, m * .006, m * .006);
    c.restore(); c.globalAlpha = 1;
    if (sp < .28) { c.fillStyle = hex('#fff', (1 - sp / .28) * .4); c.fillRect(0, 0, w, h); }
  }
};


// ---- L30 ----
S.L30 = (c, w, h, t, s) => {
  if (!s.init) {
    s.init = 1; const r = rng(3030);
    s.pt = paperTex(w / 2, h / 2, 1, '#e9e0cc', 3030);
    s.cuts = [];
    // 放射刀痕（声浪）
    for (let k = 0; k < 22; k++) {
      const an = lerp(-Math.PI * .92, -Math.PI * .08, k / 21);
      const l = Math.min(w, h) * (.18 + r() * .34);
      s.cuts.push({
        x1: w * .5 + Math.cos(an) * Math.min(w, h) * .13, y1: h * .52 + Math.sin(an) * Math.min(w, h) * .13,
        x2: w * .5 + Math.cos(an) * (Math.min(w, h) * .13 + l), y2: h * .52 + Math.sin(an) * (Math.min(w, h) * .13 + l),
        wd: Math.min(w, h) * (.008 + r() * .016), t0: .15 + k * .06, ray: 1
      });
    }
    // 钟体弧线（随形）
    for (let k = 0; k < 16; k++) {
      const rr = Math.min(w, h) * (.1 + k * .012), a0 = Math.PI * (1.06 + r() * .12), a1 = a0 + .35 + r() * .4;
      const seg = [];
      for (let i = 0; i <= 5; i++) {
        const an = lerp(a0, a1, i / 5);
        seg.push([w * .5 + Math.cos(an) * rr * 1.15, h * .58 + Math.sin(an) * rr]);
      }
      for (let i = 0; i < seg.length - 1; i++)
        s.cuts.push({ x1: seg[i][0], y1: seg[i][1], x2: seg[i + 1][0], y2: seg[i + 1][1], wd: Math.min(w, h) * .005, t0: 1.4 + k * .1 + i * .05, ray: 0 });
    }
    // 地面排线
    for (let k = 0; k < 18; k++) {
      const y = h * (.82 + (k % 6) * .028), x0 = w * (.08 + (k * 37 % 60) / 100);
      s.cuts.push({ x1: x0, y1: y, x2: x0 + w * (.08 + (k * 13 % 20) / 100), y2: y + h * .006, wd: Math.min(w, h) * .0045, t0: 2.6 + k * .07, ray: 0 });
    }
    // 雪花点（stabs）
    s.snow = []; for (let k = 0; k < 26; k++) s.snow.push([r(), r(), r()]);
  }
  const m = Math.min(w, h), q = t % 11;
  c.drawImage(s.pt, 0, 0, w, h);
  // 版面（黑木块，毛边）
  const rag = k => Math.sin(k * 2.7) * m * .006;
  c.fillStyle = '#15120e';
  c.beginPath();
  c.moveTo(w * .03 + rag(1), h * .06 + rag(2));
  for (let k = 1; k <= 12; k++) c.lineTo(w * (.03 + k * .0783), h * .06 + rag(k + 2));
  for (let k = 1; k <= 8; k++) c.lineTo(w * .97 + rag(k), h * (.06 + k * .11));
  for (let k = 11; k >= 0; k--) c.lineTo(w * (.03 + k * .0783), h * .84 + rag(k + 5));
  for (let k = 7; k >= 0; k--) c.lineTo(w * .03 + rag(k + 3), h * (.06 + k * .11));
  c.closePath(); c.fill();
  // 黑影：钟与人物
  c.fillStyle = '#15120e';
  c.beginPath(); c.moveTo(w * .38, h * .78); c.quadraticCurveTo(w * .36, h * .42, w * .5, h * .38);
  c.quadraticCurveTo(w * .64, h * .42, w * .62, h * .78); c.closePath();
  c.fill();
  c.fillRect(w * .36, h * .78, w * .28, h * .03);
  c.beginPath(); c.arc(w * .5, h * .365, m * .035, 0, TAU); c.fill();
  c.beginPath(); c.arc(w * .26, h * .735, m * .032, 0, TAU); c.fill();
  c.fillRect(w * .235, h * .76, m * .052, m * .12);
  // 刀痕（刻出即亮）：先粗后细
  const rq = Math.floor(t * 12) / 12;
  for (const ct of s.cuts) {
    const pr = eOut(ss(ct.t0, ct.t0 + .3, q)); if (pr <= 0) continue;
    const x2 = lerp(ct.x1, ct.x2, pr), y2 = lerp(ct.y1, ct.y2, pr);
    const puls = ct.ray ? 1 + .12 * Math.sin(t * 2.1 + ct.x1) : 1;
    c.strokeStyle = '#e9e0cc'; c.lineWidth = ct.wd * puls; c.lineCap = 'round';
    c.beginPath(); c.moveTo(ct.x1, ct.y1); c.lineTo(x2, y2); c.stroke();
    // 铜色印版（只落在刻白处）
    const cp = ss(6.2, 7.2, q) * (1 - ss(9.2, 10, q));
    if (ct.ray && cp > 0) {
      c.strokeStyle = hex('#c4622a', .8 * cp * (.6 + .4 * Math.sin(t * 2.1 + ct.x1)));
      c.lineWidth = ct.wd * .5 * puls;
      c.beginPath(); c.moveTo(ct.x1, ct.y1); c.lineTo(x2, y2); c.stroke();
    }
  }
  // 钟口白弧（敲响的震纹）
  for (let k = 0; k < 3; k++) {
    const rp = ((t * .45 + k / 3) % 1), rr = m * .12 + rp * m * .28;
    c.strokeStyle = hex('#e9e0cc', .3 * (1 - rp)); c.lineWidth = m * .005;
    c.beginPath(); c.arc(w * .5, h * .5, rr, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
  }
  // 飞雪 / 木屑（白点刻痕）
  for (const sn of s.snow) {
    const sx = (sn[0] + Math.sin(t * .3 + sn[2] * 6) * .02) * w, sy = ((sn[1] + t * .035 * (.5 + sn[2])) % 1) * h;
    c.fillStyle = hex('#e9e0cc', .55 + sn[2] * .35);
    c.fillRect(sx, sy, m * .006 + sn[2] * m * .004, m * .006);
  }
  // 人物白晕（刀光勾边）
  c.strokeStyle = '#e9e0cc'; c.lineWidth = m * .0035;
  c.beginPath(); c.arc(w * .26, h * .735, m * .045, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
  // 下方铅字说明（活字压印）
  const cp2 = ss(.5, 1.0, q);
  if (cp2 > 0) {
    c.fillStyle = hex('#241f16', .92 * cp2); c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `400 ${(m * .04).toFixed(1)}px Georgia,"Noto Serif SC",serif`;
    c.fillText('第三十七章 · 钟声初鸣', w * .5, h * .925);
    c.fillStyle = hex('#a63224', .9 * cp2); c.fillRect(w * .82, h * .905, m * .032, m * .032);
    c.fillStyle = hex('#e9e0cc', .9); c.fillRect(w * .826, h * .912, m * .02, m * .006); c.fillRect(w * .826, h * .925, m * .02, m * .006);
  }
  // 上纸 / 滚墨：新一版（循环收尾）
  if (q > 9.9) {
    const sw = (q - 9.9) / 1.1;
    c.fillStyle = '#e9e0cc';
    c.fillRect(-w + sw * w * 2, 0, w, h);
    c.fillStyle = hex('#15120e', .25);
    c.fillRect(-w + sw * w * 2 + w - m * .02, 0, m * .02, h);
  }
};


// ---- L31 ----
S.L31 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  if (!s.init) {
    s.init = 1; const r = rng(31);
    s.paper = paperTex(w, h, 1, '#f1e8d2', 31);
    const cx = w * .5, cy = h * .42, R = m * .30;
    s.cx = cx; s.cy = cy; s.R = R;
    const fam = [[-.38, 26, 1], [.62, 20, .72], [1.38, 12, .55]];
    const lines = [];
    for (const [ang, n, ws] of fam) {
      const dx = Math.cos(ang), dy = Math.sin(ang) * .82, nx = -Math.sin(ang), ny = Math.cos(ang) * .82;
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1) * 1.84 - .92;
        const half = R * Math.sqrt(Math.max(0, 1 - u * u)) * .94;
        const px = cx + nx * u * R, py = cy + ny * u * R;
        lines.push({ x1: px - dx * half, y1: py - dy * half, x2: px + dx * half, y2: py + dy * half, ws, o: r() });
      }
    }
    lines.sort((a, b) => a.o - b.o);
    lines.forEach((L, i) => { L.st = i / lines.length * 4.2 + r() * .08; });
    s.lines = lines;
    s.wash = [[cx, cy + R * .12, R * .78, '#c98a2e', 5.3], [cx - R * .5, cy - R * .15, R * .5, '#7d94a8', 5.9], [cx + R * .52, cy - R * .12, R * .48, '#b4622f', 6.4], [cx, cy + R * .46, R * .38, '#8a7a3c', 6.9]];
    s.rag = []; for (let i = 0; i < 18; i++) s.rag.push(.82 + r() * .34);
  }
  const D = 9, q = t % D;
  c.drawImage(s.paper, 0, 0, w, h);
  c.strokeStyle = hex('#1c1510', .5); c.lineWidth = m * .004;
  c.strokeRect(w * .06, h * .07, w * .88, h * .86);
  c.strokeStyle = hex('#1c1510', .8); c.lineWidth = m * .0015;
  c.strokeRect(w * .072, h * .088, w * .856, h * .824);
  for (const [bx, by, br, col, t0] of s.wash) {
    const a = eOut(clamp((q - t0) / 1.3, 0, 1)); if (a <= 0) continue;
    const rr = br * a;
    c.beginPath();
    for (let i = 0; i <= 18; i++) {
      const an = i / 18 * TAU, rad = rr * s.rag[i % 18];
      const px = bx + Math.cos(an) * rad, py = by + Math.sin(an) * rad * .88;
      i ? c.lineTo(px, py) : c.moveTo(px, py);
    }
    c.closePath(); c.fillStyle = hex(col, .3); c.fill();
    c.strokeStyle = hex(col, .5); c.lineWidth = m * .002; c.stroke();
  }
  const of = clamp(q / 1.1, 0, 1);
  c.strokeStyle = hex('#1c1510', .92); c.lineWidth = m * .0055;
  c.beginPath(); c.ellipse(s.cx, s.cy, s.R * .34, s.R * .5, 0, -Math.PI / 2, -Math.PI / 2 + TAU * of); c.stroke();
  for (const k of [-1, 1]) {
    c.beginPath(); c.ellipse(s.cx + k * s.R * .52, s.cy - s.R * .08, s.R * .56, s.R * .34, k * .5, Math.PI * .5, Math.PI * .5 + TAU * of); c.stroke();
  }
  let hx = -1, hy = -1;
  for (const L of s.lines) {
    const f = clamp((q - L.st) / .5, 0, 1); if (f <= 0) continue;
    const sw = L.ws * m * .0026 * (.35 + .65 * Math.sin(Math.PI * f));
    c.strokeStyle = hex('#1c1510', .82); c.lineWidth = Math.max(.4, sw * 2.2);
    c.beginPath(); c.moveTo(L.x1, L.y1); c.lineTo(lerp(L.x1, L.x2, f), lerp(L.y1, L.y2, f)); c.stroke();
    if (f < 1) { hx = lerp(L.x1, L.x2, f); hy = lerp(L.y1, L.y2, f); }
  }
  if (hx > 0) { glowDot(c, hx, hy, m * .014, '#1c1510', .3); c.fillStyle = '#1c1510'; c.fillRect(hx - m * .004, hy - m * .004, m * .008, m * .008); }
  c.fillStyle = hex('#1c1510', .9); c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  c.font = `${m * .032}px Georgia, serif`;
  c.fillText('PLATE VII · 博物图版', w * .5, h * .128);
  c.font = `italic ${m * .026}px Georgia, serif`;
  c.fillText('Apis mellifera · 西方蜜蜂', w * .5, h * .885);
  c.fillStyle = hex('#e8dcc0', .85); c.fillRect(w * .38, h * .9, w * .24, h * .052);
  c.strokeStyle = hex('#1c1510', .5); c.lineWidth = 1; c.strokeRect(w * .38, h * .9, w * .24, h * .052);
  c.fillStyle = hex('#1c1510', .85); c.font = `${m * .024}px Georgia, serif`;
  c.fillText('手工水彩上色', w * .5, h * .94);
  const gs = c.createLinearGradient(0, 0, w, h);
  const ph = (t * .09) % 1.3 - .15;
  gs.addColorStop(clamp(ph, 0, 1), 'rgba(255,250,235,0)');
  gs.addColorStop(clamp(ph + .07, 0, 1), 'rgba(255,250,235,.13)');
  gs.addColorStop(clamp(ph + .16, 0, 1), 'rgba(255,250,235,0)');
  c.fillStyle = gs; c.fillRect(0, 0, w, h);
};


// ---- L32 ----
S.L32 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  if (!s.init) {
    s.init = 1; const r = rng(32);
    s.paper = paperTex(w, h, 1, '#f0e7d4', 32);
    s.ridges = [];
    for (let k = 0; k < 3; k++) {
      const pts = []; const base = h * (.36 + k * .15);
      for (let i = 0; i <= 24; i++) {
        const x = i / 24 * (w + 40) - 20;
        pts.push([x, base - (Math.abs(nz(i * .7, k * 5, 1.7)) * .5 + .12) * h * (.22 - k * .04)]);
      }
      s.ridges.push(pts);
    }
    s.glints = []; for (let i = 0; i < 7; i++) s.glints.push([.08 + r() * .84, .62 + r() * .12, .03 + r() * .1]);
    s.reg = []; for (let i = 0; i < 6; i++) s.reg.push([(r() - .5) * m * .007, (r() - .5) * m * .007]);
    s.palA = ['#f6cd98', '#ee9a73', '#9a7fa8', '#3e7079', '#1e3b3f', '#fbe6b4'];
    s.palB = ['#e8f0f2', '#7fb3c8', '#d9c7a3', '#2f6e8e', '#173247', '#e8553d'];
  }
  const D = 8, q = t % D, ci = Math.floor(t / D);
  const oldPal = ci % 2 ? s.palB : s.palA, newPal = ci % 2 ? s.palA : s.palB;
  const layer = (pal) => {
    for (let k = 0; k < 6; k++) {
      const front = clamp((q - .2 - k * .88) / .85, 0, 1); if (front <= 0) continue;
      c.save();
      if (front < 1) {
        c.beginPath(); c.moveTo(-20, -20); c.lineTo(w + 20, -20);
        for (let i = 14; i >= 0; i--) {
          const x = i / 14 * (w + 40) - 20;
          c.lineTo(x, front * h + nz(i * 1.1, k, 3) * m * .012 + (1 - front) * m * .03);
        }
        c.closePath(); c.clip();
      }
      c.translate(s.reg[k][0], s.reg[k][1]);
      if (k === 0) { c.fillStyle = pal[0]; c.fillRect(0, 0, w, h * .24); }
      if (k === 1) {
        c.fillStyle = pal[1]; c.fillRect(0, h * .24, w, h * .12);
        c.fillStyle = hex('#ffffff', .12); for (let i = 0; i < 4; i++) c.fillRect(0, h * (.245 + i * .03), w, h * .008);
      }
      if (k === 2) {
        c.fillStyle = pal[2]; c.fillRect(0, h * .36, w, h * .12);
        c.fillStyle = pal[5]; c.beginPath(); c.arc(w * .72, h * .3, m * .115, 0, TAU); c.fill();
        c.strokeStyle = pal[5]; c.lineWidth = m * .008;
        c.beginPath(); c.arc(w * .72, h * .3, m * .155, 0, TAU); c.stroke();
        c.beginPath(); c.arc(w * .72, h * .3, m * .195, 0, TAU); c.stroke();
      }
      if (k >= 3 && k <= 4) {
        const pts = s.ridges[k - 3];
        c.fillStyle = pal[k];
        c.beginPath(); c.moveTo(-20, h);
        for (const p of pts) c.lineTo(p[0], p[1]);
        c.lineTo(w + 20, h); c.closePath(); c.fill();
        c.fillStyle = hex('#ffffff', .35);
        c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
        for (const p of pts) c.lineTo(p[0], p[1]);
        for (const p of pts.slice().reverse()) c.lineTo(p[0], p[1] + m * .012);
        c.closePath(); c.fill();
      }
      if (k === 5) {
        const pts = s.ridges[2];
        c.fillStyle = pal[4];
        c.beginPath(); c.moveTo(-20, h);
        for (const p of pts) c.lineTo(p[0], p[1]);
        c.lineTo(w + 20, h); c.closePath(); c.fill();
        c.fillStyle = pal[3]; c.fillRect(0, h * .7, w, h * .12);
        c.fillStyle = hex('#ffffff', .5);
        for (const [gx, gy, gw] of s.glints) c.fillRect(gx * w, gy * h, gw * w, m * .008);
        c.fillStyle = pal[4]; c.fillRect(0, h * .82, w, h * .18);
        c.fillStyle = pal[0]; c.font = `700 ${m * .075}px ${SANS}`; c.textAlign = 'left'; c.textBaseline = 'middle';
        const tf = clamp((q - 5.2) / .6, 0, 1);
        c.save(); c.beginPath(); c.rect(w * .06, h * .83, w * .5 * eOut(tf), h * .1); c.clip();
        c.fillText('云岭步道', w * .06, h * .885); c.restore();
        c.fillStyle = pal[5]; c.font = `700 ${m * .05}px ${SANS}`;
        c.fillText('03', w * .06, h * .955);
        c.fillStyle = hex('#ffffff', .55); c.fillRect(w * .16, h * .945, w * .26, 2);
        c.fillStyle = hex('#ffffff', .8); c.font = `${m * .026}px ${SANS}`;
        const sf = clamp((q - 5.8) / .8, 0, 1);
        c.save(); c.beginPath(); c.rect(w * .46, h * .92, w * .48 * eOut(sf), h * .06); c.clip();
        c.fillText('全程 12 公里 · 爬升 800 米', w * .46, h * .952); c.restore();
      }
      c.restore();
    }
  };
  c.drawImage(s.paper, 0, 0, w, h);
  layer(oldPal);
  const rk = clamp((q - 5.9) / .9, 0, 1);
  if (rk > 0) {
    const bu = lerp(-.55, 1.7, rk);
    c.save(); c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.min(w, bu * w), 0); c.lineTo(0, Math.min(h, bu * h)); c.closePath(); c.clip();
    c.drawImage(s.paper, 0, 0, w, h);
    layer(newPal);
    c.restore();
    const bx = bu * w * .5 + (1 - bu) * h * .5 * (w / h), by = bu * h * .5;
    c.save(); c.translate(w * .5 + (bu - .5) * w * .72, h * .5 + (.5 - bu) * h * .62); c.rotate(-Math.PI / 4);
    c.fillStyle = '#2c2c30'; c.fillRect(-m * .5, -m * .022, m, m * .044);
    c.fillStyle = hex('#000000', .35); c.fillRect(-m * .5, 0, m, m * .022);
    c.fillStyle = newPal[5]; c.beginPath(); c.arc(0, 0, m * .035, 0, TAU); c.fill();
    c.restore();
  }
  c.fillStyle = hex('#000000', .12); c.fillRect(0, 0, w, h * .012);
  c.fillRect(0, h * .988, w, h * .012);
  const sh = c.createLinearGradient(0, 0, w, h);
  const sph = (t * .07) % 1.4 - .2;
  sh.addColorStop(clamp(sph, 0, 1), 'rgba(255,255,255,0)');
  sh.addColorStop(clamp(sph + .05, 0, 1), 'rgba(255,255,255,.12)');
  sh.addColorStop(clamp(sph + .12, 0, 1), 'rgba(255,255,255,0)');
  c.fillStyle = sh; c.fillRect(0, 0, w, h);
  c.fillStyle = hex('#1c1510', .4); c.font = `${m * .02}px ${MONO}`;
  c.textAlign = 'right'; c.textBaseline = 'middle';
  c.fillText('PULL ' + (Math.floor(t * 24) % 999), w - m * .03, h * .04);
};


// ---- L33 ----
S.L33 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  if (!s.init) {
    s.init = 1; const r = rng(33);
    s.bars = []; for (let i = 0; i < 5; i++) s.bars.push({ y: .16 + i * .1, w: .2 + r() * .32, sig: i === 2 });
  }
  const D = 6, q = t % D, ink = '#111111', sig = '#E30613';
  c.fillStyle = '#EAE9E5'; c.fillRect(0, 0, w, h);
  const mx = w * .06, cw = (w - mx * 2) / 12;
  c.strokeStyle = '#d8d6cf'; c.lineWidth = 1;
  for (let i = 0; i <= 12; i++) { const x = mx + i * cw; c.beginPath(); c.moveTo(x, h * .05); c.lineTo(x, h * .95); c.stroke(); }
  for (let i = 0; i < 8; i++) { const y = h * .08 + i * h * .11; c.beginPath(); c.moveTo(mx, y); c.lineTo(w - mx, y); c.stroke(); }
  const nf = eOut(clamp(q / .55, 0, 1));
  c.save(); c.beginPath(); c.rect(mx, h * .54 - h * .5 * nf, cw * 5, h * .5 * nf); c.clip();
  c.fillStyle = ink; c.font = `900 ${h * .52}px ${SANS}`; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  c.fillText('12', mx - h * .018, h * .54); c.restore();
  for (let i = 0; i < 3; i++) {
    const f = eOut(clamp((q - .7 - i * .35) / .45, 0, 1)); if (f <= 0) continue;
    const y = h * (.62 + i * .075);
    c.fillStyle = '#b9b7af'; c.fillRect(mx, y, (cw * 4.4) * f, 1);
    c.save(); c.beginPath(); c.rect(mx, y + 4, (cw * 4.4) * f, h * .05); c.clip();
    c.fillStyle = ink; c.font = `${m * .028}px ${SANS}`; c.textBaseline = 'top';
    c.fillText(['设计程序 · 五条规则', '模块 12 × 24 · 基线 24', '只打破其中一条'][i], mx, y + 8);
    c.restore();
  }
  for (let i = 0; i < s.bars.length; i++) {
    const B = s.bars[i];
    let f = eOut(clamp((q - 1.5 - i * .28) / .5, 0, 1)); if (f <= 0) continue;
    let bh = h * .052;
    if (i === 1) {
      const cut = clamp((q - 3.6) / .35, 0, 1), col = clamp((q - 3.95) / .45, 0, 1);
      bh *= (1 - col * .92);
      if (cut > 0 && col < 1) { c.fillStyle = ink; c.fillRect(mx + cw * 6.2 + (cw * 5) * cut - 1, h * B.y - 6, 2, h * .07); }
    }
    const shift = eOut(clamp((q - 4.6) / .7, 0, 1)) * cw * (i % 2 ? .8 : -.3);
    const x0 = mx + cw * 6.2 + shift, bw = (cw * 5.2) * B.w * f * 2.2;
    c.fillStyle = B.sig ? sig : ink;
    c.fillRect(x0, h * B.y, Math.min(bw, cw * 4.6), bh);
    if (B.sig) { c.fillStyle = ink; c.fillRect(x0 - m * .028, h * B.y, m * .018, bh); }
    c.fillStyle = '#8a8880'; c.font = `${m * .022}px ${MONO}`; c.textBaseline = 'alphabetic';
    c.fillText('M' + (i + 1) + ' · ' + Math.round(B.w * 24), x0, h * B.y - 6);
  }
  const ep = clamp((q - .8) / 4, 0, 1);
  const ep2 = ep < .45 ? ep / .45 * .42 : (ep < .62 ? .42 : .42 + (ep - .62) / .38 * .58);
  const ex = lerp(w * .6, w * .92, ep2), ey = lerp(h * .12, h * .52, ep2);
  c.fillStyle = sig; c.fillRect(ex, ey, m * .05, m * .05);
  c.fillStyle = ink; c.font = `${m * .022}px ${MONO}`; c.textBaseline = 'top';
  c.fillText('X ' + (104 + ep2 * 60).toFixed(1) + ' · Y ' + (63 + ep2 * 140).toFixed(1), ex + m * .07, ey);
  if (ep2 > .42) { c.fillStyle = sig; c.fillText('越界 OFF GRID', ex + m * .07, ey + m * .032); }
  const px = mx + (q / D) * (w - 2 * mx);
  c.fillStyle = hex('#111111', .55); c.fillRect(px, h * .05, 1, h * .9);
  c.beginPath(); c.moveTo(px - 5, h * .05); c.lineTo(px + 5, h * .05); c.lineTo(px, h * .075); c.closePath(); c.fill();
  c.fillStyle = '#8a8880'; c.font = `${m * .02}px ${MONO}`;
  c.textAlign = 'right'; c.textBaseline = 'alphabetic';
  c.fillText('FR ' + String(Math.floor(t * 24) % 1000).padStart(3, '0') + ' · 24FPS', w - mx, h * .955);
};


// ---- L34 ----
S.L34 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  if (!s.init) {
    s.init = 1; const r = rng(34);
    const cut = (pts, amp) => {
      const out = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(len / 14));
        for (let k = 0; k < n; k++) {
          const u = k / n, nx = -(b[1] - a[1]) / (len || 1), ny = (b[0] - a[0]) / (len || 1);
          const d = (r() - .5) * amp * 2;
          out.push([lerp(a[0], b[0], u) + nx * d, lerp(a[1], b[1], u) + ny * d]);
        }
      }
      return out;
    };
    s.head = cut([[-14, -16], [14, -16], [16, 8], [0, 18], [-16, 8]], 1.6);
    s.hat = cut([[-22, -18], [22, -18], [16, -26], [-12, -28]], 1.8);
    s.torso = cut([[-13, -2], [13, -2], [18, 34], [-16, 34]], 2.2);
    s.limb = cut([[-4, 0], [4, 0], [5, 30], [-5, 30]], 1.6);
    s.scarf = cut([[0, -4], [42, -10], [46, 2], [2, 6]], 2.2);
    s.key = cut([[-8, -26], [8, -26], [8, -6], [18, -6], [18, 2], [8, 2], [8, 12], [2, 12], [2, 2], [-8, 2]], 1.4);
    s.strips = []; for (let i = 0; i < 9; i++) s.strips.push({ y: i / 9, amp: (r() - .5) * 2, jag: [] });
    s.shards = []; for (let i = 0; i < 8; i++) {
      const cx0 = .32 + (i % 4) * .13, cy0 = i < 4 ? .38 : .6;
      s.shards.push({ x: cx0, y: cy0, from: [r() < .5 ? -.2 : 1.2, r() * 1.2 - .1], rot: (r() - .5) * 1.4, sz: .05 + r() * .05, d: i * .07 });
    }
  }
  const D = 8, q = t % D;
  const tq = Math.floor(t * 12) / 12, cam = Math.floor(t * 24) / 24;
  const ground = q < 3.6 ? '#1b1714' : (q < 5 ? '#d23a22' : '#efe4c9');
  c.fillStyle = q < 5 ? '#1b1714' : '#efe4c9'; c.fillRect(0, 0, w, h);
  const poly = (pts, col, ox, oy, sc, rot) => {
    c.save(); c.translate(ox, oy); c.rotate(rot || 0); c.fillStyle = col;
    c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0] * sc, p[1] * sc) : c.moveTo(p[0] * sc, p[1] * sc));
    c.closePath(); c.fill(); c.restore();
  };
  if (q < 5) {
    c.save();
    if (q < 3.6) c.translate(-(cam * m * .42) % (w * 1.3), 0);
    c.fillStyle = q < 3 ? '#241f1a' : '#7d1d12';
    for (let i = 0; i < 3; i++) {
      c.font = `900 ${m * .42}px ${SANS}`; c.textBaseline = 'middle';
      c.fillText('特别任务', i * w * .95 + w * .1, h * .3);
      c.font = `900 ${m * .3}px ${SANS}`;
      c.fillText('机密档案', i * w * .95 + w * .45, h * .78);
    }
    c.restore();
    c.fillStyle = '#e2a52a'; c.beginPath(); c.arc(w * .74, h * .4, m * .15, 0, TAU); c.fill();
    poly(s.key, '#1b1714', w * .74, h * .4, m * .006, 0);
    const run = q < 3 ? 1 : 0, ph = tq * TAU * 1.6;
    const bob = run ? Math.abs(Math.sin(ph)) * m * .012 : 0;
    const fx = w * .34, fy = h * .56 - bob;
    c.save(); c.translate(fx, fy); c.rotate(run ? -.14 : 0); c.translate(-fx, -fy);
    poly(s.limb, '#1b1714', fx - m * .012, fy + m * .12, m * .0075, run ? Math.sin(ph) * .8 : .18);
    poly(s.limb, '#1b1714', fx + m * .016, fy + m * .12, m * .0075, run ? -Math.sin(ph) * .8 : -.12);
    poly(s.limb, '#1b1714', fx - m * .028, fy + m * .015, m * .0062, run ? -Math.sin(ph) * .9 - .5 : -.35);
    poly(s.limb, '#1b1714', fx + m * .03, fy + m * .015, m * .0062, run ? Math.sin(ph) * .9 + .5 : .3);
    poly(s.torso, '#1b1714', fx, fy, m * .0072, 0);
    poly(s.head, '#1b1714', fx + m * .004, fy - m * .085, m * .0072, 0);
    poly(s.hat, '#1b1714', fx + m * .004, fy - m * .085, m * .0072, 0);
    poly(s.scarf, '#d23a22', fx - m * .02, fy - m * .07, m * .0075, Math.sin(tq * TAU * 2.2) * .18 - .1);
    c.restore();
    if (q >= 3 && q < 3.6) {
      c.fillStyle = hex('#efe4c9', .06 + .06 * (Math.floor(t * 6) % 2));
      c.fillRect(0, 0, w, h);
    }
    if (q >= 3.6) {
      for (let i = 0; i < 9; i++) {
        const e = eOut(clamp((q - 3.6 - i * .04) / .8, 0, 1));
        c.fillStyle = i % 2 ? '#1b1714' : '#241d16';
        const dy = (i % 2 ? -1 : 1) * e * h * .9, dx = e * w * .5;
        c.beginPath();
        c.moveTo(-20 + dx, i / 9 * h + dy);
        c.lineTo(w + 20 + dx, i / 9 * h - h * .12 + dy);
        c.lineTo(w + 20 + dx, (i + 1) / 9 * h - h * .12 + dy);
        c.lineTo(-20 + dx, (i + 1) / 9 * h + dy);
        c.closePath(); c.fill();
      }
    }
  } else {
    c.fillStyle = '#e2a52a'; c.beginPath(); c.arc(w * .5, h * .42, m * .3, 0, TAU); c.fill();
    for (const sh of s.shards) {
      const e = eOut(clamp((q - 5 - sh.d) / .9, 0, 1));
      const x = lerp(sh.from[0] * w, sh.x * w, e), y = lerp(sh.from[1] * h, sh.y * h, e);
      poly(s.head, '#1b1714', x, y, sh.sz * m / 22, lerp(sh.rot, 0, e));
    }
    c.fillStyle = '#1b1714'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const tt = '夜行';
    for (let i = 0; i < tt.length; i++) {
      const jx = (rng(340 + i)() - .5) * 3, jy = (rng(350 + i)() - .5) * 3, jr = (rng(360 + i)() - .5) * .03;
      c.save(); c.translate(w * (.42 + i * .17) + jx, h * .42 + jy); c.rotate(jr);
      c.font = `900 ${m * .34}px ${SANS}`; c.fillText(tt[i], 0, 0); c.restore();
    }
    const stand = Math.floor(t * 6) / 6;
    poly(s.torso, '#1b1714', w * .5, h * .68 + Math.sin(stand * 3) * 2, m * .006, 0);
    poly(s.head, '#1b1714', w * .5, h * .6, m * .006, 0);
    poly(s.hat, '#1b1714', w * .5, h * .6, m * .006, 0);
  }
  c.save();
  c.translate(0, 0); c.rotate(-.02);
  c.fillStyle = q < 3.6 ? '#efe4c9' : '#efe4c9';
  c.fillRect(w * .04, h * .885, w * .34, h * .075);
  c.fillStyle = '#1b1714'; c.font = `700 ${m * .038}px ${SANS}`; c.textAlign = 'left'; c.textBaseline = 'middle';
  c.fillText(q < 5 ? '◆ 追捕开始' : '◆ 片名揭晓', w * .06, h * .923);
  c.restore();
};


// ---- L35 ----
S.L35 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  if (!s.init) {
    s.init = 1; const r = rng(35);
    s.bulbs = [];
    for (let i = 0; i < 18; i++) s.bulbs.push({ x: w * (.5 + (i / 17 - .5) * .8), y: h * (.185 - Math.sin(i / 17 * Math.PI) * .08), t0: 1.1 + i * .1 });
    s.spark = []; for (let i = 0; i < 6; i++) s.spark.push([.12 + r() * .76, .16 + r() * .66, r() * TAU]);
  }
  const D = 8, q = t % D, ax = w * .5;
  c.fillStyle = vgrad(c, h, '#191008', '#120c07'); c.fillRect(0, 0, w, h);
  const g0 = c.createRadialGradient(ax, h * .85, 0, ax, h * .85, m * .9);
  g0.addColorStop(0, 'rgba(22,72,52,.45)'); g0.addColorStop(1, 'rgba(22,72,52,0)');
  c.fillStyle = g0; c.fillRect(0, 0, w, h);
  const gg = c.createLinearGradient(0, 0, 0, h);
  gg.addColorStop(0, '#5c421c'); gg.addColorStop(.32, '#d9b25c'); gg.addColorStop(.46, mixHex('#f7e7a8', '#fff6d8', .5 + .5 * Math.sin(t * 1.3)));
  gg.addColorStop(.62, '#c9a04c'); gg.addColorStop(1, '#4c3414');
  const gline = (x1, y1, x2, y2, lw) => {
    c.lineCap = 'round';
    c.strokeStyle = '#3a2a10'; c.lineWidth = lw + m * .0035;
    c.beginPath(); c.moveTo(x1, y1 + 1.5); c.lineTo(x2, y2 + 1.5); c.stroke();
    c.strokeStyle = gg; c.lineWidth = lw;
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    c.strokeStyle = hex('#fff2be', .5); c.lineWidth = Math.max(.6, lw * .28);
    c.beginPath(); c.moveTo(x1, y1 - lw * .22); c.lineTo(x2, y2 - lw * .22); c.stroke();
    c.lineCap = 'butt';
  };
  for (let i = 0; i < 24; i++) {
    const a = Math.PI * (.08 + i / 23 * .84), L = m * (1.05 + .12 * Math.sin(i * 2.1));
    c.strokeStyle = hex('#d9b25c', .1 + .16 * (.5 + .5 * Math.sin(t * 1.5 + i * .8)));
    c.lineWidth = m * .006;
    c.beginPath(); c.moveTo(ax, h * .1); c.lineTo(ax + Math.cos(a) * L, h * .1 + Math.sin(a) * L); c.stroke();
  }
  const op = eOut(clamp(q / .8, 0, 1));
  for (const sgn of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      const x1 = ax + sgn * (w * .08 + k * w * .052) * op, x2 = ax + sgn * (w * .08 + (k + 1) * w * .052) * op;
      gline(x1, h * (.2 + k * .028), x2, h * (.172 + k * .028), m * .005);
      gline(x2, h * (.172 + k * .028), x2, h * (.3 + k * .028), m * .005);
    }
  }
  const bw = w * .5 * op;
  c.fillStyle = hex('#0d0906', .9); c.fillRect(ax - bw / 2, h * .3, bw, h * .1);
  gline(ax - bw / 2, h * .3, ax + bw / 2, h * .3, m * .006);
  gline(ax - bw / 2, h * .4, ax + bw / 2, h * .4, m * .006);
  if (op > .6) {
    c.fillStyle = '#f4e8c8'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `${m * .062}px Georgia, serif`;
    const title = '金辉大饭店';
    for (let i = 0; i < title.length; i++) c.fillText(title[i], ax + (i - 2) * m * .088, h * .352);
  }
  for (const b of s.bulbs) {
    const a = q - b.t0;
    let br = a < 0 ? 0 : .78 + .85 * Math.exp(-a * 6);
    br += .5 * Math.exp(-Math.pow((b.x / w * 22) - ((q * 5.5) % 24), 2) / 2.2) * (a > 0 ? 1 : 0);
    if (br <= .02) continue;
    glowDot(c, b.x, b.y, m * .024 * br, '#ffe9b0', .55);
    c.fillStyle = hex('#fff6d8', Math.min(1, br * .8));
    c.beginPath(); c.arc(b.x, b.y, m * .009 * Math.min(1.4, br), 0, TAU); c.fill();
  }
  const dcx = ax, dcy = h * .68, dr = m * .12;
  c.strokeStyle = gg; c.lineWidth = m * .006;
  c.beginPath(); c.arc(dcx, dcy, dr, 0, TAU); c.stroke();
  c.beginPath(); c.arc(dcx, dcy, dr * .78, 0, TAU); c.stroke();
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU;
    c.beginPath(); c.moveTo(dcx + Math.cos(a) * dr * .82, dcy + Math.sin(a) * dr * .82);
    c.lineTo(dcx + Math.cos(a) * dr * .96, dcy + Math.sin(a) * dr * .96); c.stroke();
  }
  const ha = -Math.PI / 2 + ss(0, 1, q / D) * TAU;
  c.strokeStyle = '#f4e8c8'; c.lineWidth = m * .008;
  c.beginPath(); c.moveTo(dcx, dcy); c.lineTo(dcx + Math.cos(ha) * dr * .62, dcy + Math.sin(ha) * dr * .62); c.stroke();
  c.fillStyle = gg; c.beginPath(); c.arc(dcx, dcy, m * .012, 0, TAU); c.fill();
  const sw = eOut(clamp((q - 1.7) / .5, 0, 1));
  const sx0 = ax - w * .28 * sw, sx1 = ax + w * .28 * sw;
  c.fillStyle = hex('#0d0906', .92); c.fillRect(sx0, h * .795, sx1 - sx0, h * .085);
  gline(sx0, h * .795, sx1, h * .795, m * .004);
  gline(sx0, h * .88, sx1, h * .88, m * .004);
  if (sw > .5) {
    c.fillStyle = '#f4e8c8'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `${m * .036}px ${SANS}`; c.fillText('午夜前 · 送一封信', ax, h * .838);
  }
  for (const [sp, spy, ph] of s.spark) {
    const a = Math.abs(Math.sin(t * 1.6 + ph)), x = sp * w, y = spy * h, L = m * .02 * (0.5 + a);
    c.strokeStyle = hex('#f7e7a8', a * .8); c.lineWidth = m * .003;
    c.beginPath(); c.moveTo(x - L, y); c.lineTo(x + L, y); c.moveTo(x, y - L); c.lineTo(x, y + L); c.stroke();
  }
};


// ---- L36 ----
S.L36 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  if (!s.init) {
    s.init = 1; const r = rng(36);
    const [sc, sx] = offscreen(w, h, 1);
    sx.fillStyle = '#1d3f80'; sx.fillRect(0, 0, w, h);
    for (let i = 0; i < 46; i++) {
      const g = sx.createRadialGradient(r() * w, r() * h, 0, r() * w, r() * h, m * (.1 + r() * .3));
      g.addColorStop(0, r() < .5 ? 'rgba(42,88,166,.5)' : 'rgba(18,44,110,.5)');
      g.addColorStop(1, 'rgba(30,63,128,0)');
      sx.fillStyle = g; sx.fillRect(0, 0, w, h);
    }
    sx.strokeStyle = 'rgba(231,240,249,.1)'; sx.lineWidth = 1;
    for (let i = 0; i < 60; i++) { const px = r() * w, py = r() * h; sx.beginPath(); sx.moveTo(px, py); sx.lineTo(px + (r() - .5) * 40, py + (r() - .5) * 40); sx.stroke(); }
    s.sheet = sc;
  }
  const D = 8, q = t % D, ln = '#E7F0F9';
  const sx0 = w * .05, sy0 = h * .05, sw = w * .9, sh = h * .9;
  c.fillStyle = '#0d1116'; c.fillRect(0, 0, w, h);
  c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(sx0 + 8, sy0 + 10, sw, sh);
  c.drawImage(s.sheet, sx0, sy0, sw, sh);
  const gA = { x: w * .38, y: h * .58, r: m * .12, n: 10 };
  const gB = { x: w * .565, y: h * .635, r: m * .085, n: 8 };
  const tk = Math.floor(t * 8) / 8, angA = tk * .9, angB = -tk * .9 * (gA.n / gB.n) + .2;
  const LP = [
    ['ln', sx0 + sw * .5, sy0 + sh * .06, sx0 + sw * .5, sy0 + sh * .8, 0, .45, 1],
    ['ln', sx0 + sw * .12, sy0 + sh * .62, sx0 + sw * .88, sy0 + sh * .62, .05, .5, 1],
    ['rect', w * .3, h * .72, w * .4, h * .08, .5, .9, 2],
    ['circ', gA.x, gA.y, gA.r, .55, 1.1, 3],
    ['circ', gB.x, gB.y, gB.r, .8, 1.25, 3],
    ['poly', [w * .485, h * .58, w * .56, h * .48, w * .585, h * .44], 1.0, .5, 2],
    ['rect', w * .575, h * .3, w * .11, h * .16, 1.1, .8, 3],
    ['cloud', w * .66, h * .22, m * .12, 1.5, 1.1, 4],
    ['poly', [w * .615, h * .3, w * .645, h * .24, w * .69, h * .24, w * .715, h * .3], 1.8, .5, 3],
    ['hatch', w * .3, h * .72, w * .4, h * .08, 2.1, .7, 5],
    ['dim', w * .3, h * .845, w * .7, h * .845, 2.6, .7, 6],
    ['dim', w * .255, h * .58, w * .255, h * .72, 3.1, .5, 6],
    ['balloon', w * .335, h * .575, gA.x, gA.y, 3.5, .5, 7],
    ['balloon', w * .72, h * .26, w * .66, h * .24, 3.9, .5, 7]
  ];
  const stage = (a, b) => clamp((q - a) / (b - a), 0, 1);
  c.strokeStyle = ln; c.fillStyle = ln;
  for (const it of LP) {
    const f = stage(it[5], it[6]); if (f <= 0) continue;
    c.lineWidth = it[0] === 'ln' ? m * .0016 : m * .0028;
    if (it[0] === 'ln') {
      const x1 = it[1], y1 = it[2], x2 = it[3], y2 = it[4];
      c.setLineDash([m * .045, m * .012, m * .012, m * .012]);
      c.beginPath(); c.moveTo(x1, y1); c.lineTo(lerp(x1, x2, f), lerp(y1, y2, f)); c.stroke();
      c.setLineDash([]);
    } else if (it[0] === 'rect') {
      c.strokeRect(it[1], it[2], it[3] * f, it[4]);
    } else if (it[0] === 'circ') {
      c.beginPath(); c.arc(it[1], it[2], it[3], -Math.PI / 2, -Math.PI / 2 + TAU * f); c.stroke();
    } else if (it[0] === 'poly') {
      const p = it[1]; c.beginPath(); c.moveTo(p[0], p[1]);
      for (let i = 2; i < p.length; i += 2) c.lineTo(lerp(p[i - 2], p[i], f), lerp(p[i - 1], p[i + 1], f));
      c.stroke();
    } else if (it[0] === 'cloud') {
      c.beginPath();
      for (let i = 0; i <= 12; i++) {
        const a = i / 12 * TAU * f - Math.PI / 2, rr = it[3] * (1 + .16 * Math.sin(i * 2.4));
        const px = it[1] + Math.cos(a) * rr, py = it[2] + Math.sin(a) * rr * .82;
        i ? c.lineTo(px, py) : c.moveTo(px, py);
      }
      c.stroke();
    } else if (it[0] === 'hatch') {
      for (let i = 0; i < 8; i++) {
        const hh = clamp(f * 8 - i, 0, 1); if (hh <= 0) continue;
        const x = it[1] + i / 8 * it[3];
        c.beginPath(); c.moveTo(x, it[2]); c.lineTo(x + it[4] * hh * 2, it[2] + it[4] * hh * 2); c.stroke();
      }
    } else if (it[0] === 'dim') {
      const x1 = it[1], y1 = it[2], x2 = it[3], y2 = it[4];
      c.beginPath(); c.moveTo(x1, y1); c.lineTo(lerp(x1, x2, f), lerp(y1, y2, f)); c.stroke();
      if (f > .9) {
        for (const [ax0, ay0, dir] of [[x1, y1, 1], [x2, y2, -1]]) {
          c.beginPath(); c.moveTo(ax0, ay0);
          c.lineTo(ax0 + (x2 - x1 ? dir * m * .016 : -m * .006), ay0 + (y2 - y1 ? dir * m * .016 : -m * .006));
          c.lineTo(ax0 + (x2 - x1 ? dir * m * .016 : m * .006), ay0 + (y2 - y1 ? dir * m * .016 : m * .006));
          c.closePath(); c.fill();
        }
        c.font = `${m * .024}px ${MONO}`; c.textAlign = 'center'; c.textBaseline = 'bottom';
        c.fillText(y1 === y2 ? 'ø 240' : '180', (x1 + x2) / 2, (y1 + y2) / 2 - m * .012);
      }
    } else if (it[0] === 'balloon') {
      const x1 = it[1], y1 = it[2], x2 = it[3], y2 = it[4];
      c.beginPath(); c.moveTo(x1, y1); c.lineTo(lerp(x1, x2, f), lerp(y1, y2, f)); c.stroke();
      if (f > .9) {
        c.beginPath(); c.arc(x1, y1, m * .022, 0, TAU); c.stroke();
        c.font = `${m * .022}px ${MONO}`; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(x1 < w * .5 ? '1' : '2', x1, y1);
      }
    }
  }
  for (const gx of [gA, gB]) {
    const f = clamp((q - (gx === gA ? .55 : .8)) / 1, 0, 1); if (f <= .2) continue;
    const ang = gx === gA ? angA : angB;
    for (let i = 0; i < gx.n; i++) {
      const a = ang + i / gx.n * TAU;
      c.beginPath();
      c.moveTo(gx.x + Math.cos(a) * gx.r, gx.y + Math.sin(a) * gx.r);
      c.lineTo(gx.x + Math.cos(a) * gx.r * (1 + .18 * f), gx.y + Math.sin(a) * gx.r * (1 + .18 * f));
      c.stroke();
    }
  }
  c.lineWidth = m * .0012;
  c.strokeRect(w * .7, h * .855, w * .22, h * .09);
  c.font = `${m * .02}px ${MONO}`; c.textAlign = 'left'; c.textBaseline = 'top';
  c.fillText('图号 M-07 · 比例 1:20', w * .71, h * .868);
  c.fillText('接云机器 · 修订 C', w * .71, h * .902);
  c.font = `${m * .022}px ${MONO}`;
  c.fillText('注:云腔耐压 8 币', w * .08, h * .12);
  c.fillText('注:齿轮模数 2.5', w * .08, h * .155);
  const stampF = eBack(clamp((q - 6.3) / .35, 0, 1));
  if (stampF > 0) {
    c.save(); c.translate(w * .22, h * .3); c.rotate(-.2); c.scale(stampF, stampF);
    c.strokeStyle = '#c23b2e'; c.lineWidth = m * .005;
    c.beginPath(); c.arc(0, 0, m * .075, 0, TAU); c.stroke();
    c.beginPath(); c.arc(0, 0, m * .062, 0, TAU); c.stroke();
    c.fillStyle = '#c23b2e'; c.font = `700 ${m * .034}px ${SANS}`;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('已核准', 0, 0);
    c.restore();
  }
  if (q < 6.4) {
    const f = stage(0, 6.2), idx = Math.floor(f * LP.length * 1.2);
    const it = LP[Math.min(idx, LP.length - 1)];
    const nx = f * 6.2 % .5 * 2;
    glowDot(c, it[1] + Math.sin(t * 21) * 2, it[2] + Math.cos(t * 17) * 2, m * .02, '#E7F0F9', .5);
    c.fillStyle = '#ffffff'; c.fillRect(it[1] - 1.5, it[2] - 1.5, 3, 3);
  }
};


// ---- L37 ----
S.L37 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  if (!s.init) {
    s.init = 1; const r = rng(37);
    const cols = 6, rows = 4;
    s.verts = [];
    for (let j = 0; j <= rows; j++) {
      s.verts.push([]);
      for (let i = 0; i <= cols; i++) s.verts[j].push([(i / cols + (r() - .5) * .02), (j / rows + (r() - .5) * .025)]);
    }
    s.panes = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const huePick = (i + j * 2) % 7;
      s.panes.push({
        v: [s.verts[j][i], s.verts[j][i + 1], s.verts[j + 1][i + 1], s.verts[j + 1][i]],
        hue: ['#2a4bb8', '#b0242f', '#2a4bb8', '#d8a53a', '#2a4bb8', '#2f6b46', '#6b2f52'][huePick],
        cx: (i + .5) / cols
      });
    }
    s.dust = []; for (let i = 0; i < 22; i++) s.dust.push([r(), r(), r(), r()]);
    s.flags = []; for (let i = 0; i < 7; i++) s.flags.push([i / 7, r() * .04]);
  }
  const D = 10, q = t % D;
  c.fillStyle = vgrad(c, h, '#2b2521', '#171210'); c.fillRect(0, 0, w, h);
  c.fillStyle = '#3a322b';
  c.beginPath(); c.moveTo(w * .1, h * .95); c.lineTo(w * .22, h * .12); c.lineTo(w * .78, h * .12); c.lineTo(w * .9, h * .95); c.closePath(); c.fill();
  const wx0 = w * .24, wx1 = w * .76, wy0 = h * .1, wy1 = h * .72;
  const sun = q / D;
  const sunCol = sun < .35 ? mixHex('#cfe0ff', '#fff6e0', sun / .35) : (sun < .7 ? mixHex('#fff6e0', '#ffd28a', (sun - .35) / .35) : mixHex('#ffd28a', '#ff9448', (sun - .7) / .3));
  const bandX = -.25 + sun * 1.5;
  for (const P of s.panes) {
    const lit = ss(.5, 0, Math.abs(P.cx - bandX));
    const dark = mixHex(P.hue, '#241d18', .68), bright = mixHex(P.hue, '#ffffff', .2);
    c.fillStyle = mixHex(dark, bright, lit);
    c.beginPath();
    P.v.forEach((v, i) => {
      const px = wx0 + v[0] * (wx1 - wx0), py = wy0 + v[1] * (wy1 - wy0);
      i ? c.lineTo(px, py) : c.moveTo(px, py);
    });
    c.closePath(); c.fill();
    if (lit > .25) {
      c.strokeStyle = hex('#ffffff', .18 * lit); c.lineWidth = m * .002;
      c.beginPath();
      const v = P.v[0], qx = wx0 + v[0] * (wx1 - wx0), qy = wy0 + v[1] * (wy1 - wy0);
      c.moveTo(qx, qy); c.lineTo(qx + (wx1 - wx0) / 6 * .7, qy + (wy1 - wy0) / 4 * .3); c.stroke();
    }
    c.strokeStyle = '#0d0a08'; c.lineWidth = m * .0065;
    c.beginPath();
    P.v.forEach((v, i) => {
      const px = wx0 + v[0] * (wx1 - wx0), py = wy0 + v[1] * (wy1 - wy0);
      i ? c.lineTo(px, py) : c.moveTo(px, py);
    });
    c.closePath(); c.stroke();
  }
  for (const P of s.panes.slice(7, 11)) {
    c.strokeStyle = hex('#3a2413', .5); c.lineWidth = m * .003;
    const px = wx0 + P.cx * (wx1 - wx0);
    c.beginPath(); c.arc(px, wy0 + (wy1 - wy0) * .5, (wy1 - wy0) * .16, .3, Math.PI - .3); c.stroke();
    c.beginPath(); c.arc(px, wy0 + (wy1 - wy0) * .5, (wy1 - wy0) * .1, .3, Math.PI - .3); c.stroke();
  }
  c.strokeStyle = '#191411'; c.lineWidth = m * .012;
  c.beginPath(); c.moveTo(wx0, wy1); c.lineTo(wx0, wy0 + (wy1 - wy0) * .12);
  c.quadraticCurveTo((wx0 + wx1) / 2, wy0 - (wy1 - wy0) * .18, wx1, wy0 + (wy1 - wy0) * .12);
  c.lineTo(wx1, wy1); c.stroke();
  c.fillStyle = '#463c33'; c.fillRect(0, h * .72, w, h * .28);
  for (const [fx, j] of s.flags) {
    c.fillStyle = j > .02 ? '#52473c' : '#40372f';
    c.fillRect(fx * w, h * .72 + j * h, w / 7 - 3, h * .28 - j * h);
  }
  for (const P of s.panes) {
    const lit = ss(.5, 0, Math.abs(P.cx - bandX)); if (lit < .12) continue;
    const px = w * (.5 + (P.cx - .5) * 1.5) + (bandX - .5) * w * .22;
    const py = h * .8 + (1 - P.cx) * h * .06;
    const g = c.createRadialGradient(px, py, 0, px, py, m * .17);
    g.addColorStop(0, hex(mixHex(P.hue, '#ffffff', .2), .34 * lit));
    g.addColorStop(1, hex(P.hue, 0));
    c.fillStyle = g; c.beginPath(); c.arc(px, py, m * .17, 0, TAU); c.fill();
  }
  c.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 2; k++) {
    const x0 = wx0 + (k ? .34 : .08) * (wx1 - wx0) + (bandX - .5) * w * .18;
    const g = c.createLinearGradient(x0, wy1, x0 - w * .12, h);
    g.addColorStop(0, hex(sunCol, .17)); g.addColorStop(1, hex(sunCol, 0));
    c.fillStyle = g;
    c.beginPath(); c.moveTo(x0, wy1); c.lineTo(x0 + w * .1, wy1); c.lineTo(x0 - w * .02, h); c.lineTo(x0 - w * .14, h); c.closePath(); c.fill();
  }
  c.globalCompositeOperation = 'source-over';
  for (const [dx, dy, sp, ph] of s.dust) {
    const px = ((dx + t * .012 * sp) % 1) * w, py = ((dy + t * .02 * sp) % 1) * h;
    c.fillStyle = hex('#ffe8c0', .18 + .2 * Math.abs(Math.sin(t * 1.4 + ph * TAU)));
    c.fillRect(px, py, 2, 2);
  }
  const rw = w * .46, rx = w * .5 - rw / 2, ry = h * .845;
  c.fillStyle = '#e8dcbc';
  c.beginPath();
  c.moveTo(rx, ry); c.lineTo(rx + rw, ry); c.lineTo(rx + rw, ry + h * .085);
  c.quadraticCurveTo(rx + rw * .5, ry + h * .105, rx, ry + h * .085); c.closePath(); c.fill();
  c.fillStyle = '#cdbf98';
  for (const sgn of [-1, 1]) {
    c.beginPath(); c.arc(rx + (sgn < 0 ? 0 : rw), ry + h * .042, h * .026, 0, TAU); c.fill();
  }
  c.fillStyle = '#2e241a'; c.font = `${m * .036}px Georgia, serif`;
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('光走过的地方', w * .5, ry + h * .048);
};


// ---- L38 ----
S.L38 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  if (!s.init) {
    s.init = 1; const r = rng(38);
    s.cells = [];
    for (let j = 0; j < 7; j++) for (let i = 0; i < 12; i++) s.cells.push({ j, i, ty: Math.floor(r() * 7), tone: Math.floor(r() * 5), rot: Math.floor(r() * 4) });
    s.dirs = []; for (let j = 0; j < 7; j++) s.dirs.push(j % 2 ? 1 : -1);
    s.cards = [
      { hue: '#c23b2e', title: '短跑', en: 'SPRINT', pose: 0 },
      { hue: '#2e6f4e', title: '游泳', en: 'SWIM', pose: 1 },
      { hue: '#39499e', title: '击剑', en: 'FENCE', pose: 2 }
    ];
  }
  const beat = .5, D = 6, q = t % D;
  const ci = Math.floor(q / 2), card = s.cards[ci], tt = q - ci * 2;
  const tone = k => k === 0 ? mixHex(card.hue, '#101014', .58) : k === 1 ? mixHex(card.hue, '#101014', .3) : k === 2 ? card.hue : k === 3 ? mixHex(card.hue, '#ffffff', .28) : mixHex(card.hue, '#ffffff', .55);
  c.fillStyle = tone(0); c.fillRect(0, 0, w, h);
  const cell = m * .165, jump = Math.floor(t / beat) * cell * .25;
  for (const cel of s.cells) {
    const off = s.dirs[cel.j] * (t * 14 + jump);
    const x = ((cel.i * cell + off) % (cell * 13) + cell * 13) % (cell * 13) - cell, y = cel.j * cell - cell * .2;
    if (x > w + cell || y > h) continue;
    const col = tone(cel.tone);
    if (cel.ty === 0) { c.fillStyle = col; c.beginPath(); c.arc(x + cell / 2, y + cell / 2, cell * .42, 0, TAU); c.fill(); }
    else if (cel.ty === 1) { c.fillStyle = col; c.beginPath(); c.arc(x + cell / 2, y + cell / 2, cell * .44, Math.PI, TAU); c.fill(); }
    else if (cel.ty === 2) { c.fillStyle = col; c.beginPath(); c.moveTo(x + cell * .5, y + cell * .5); c.arc(x + cell * .5, y + cell * .5, cell * .44, cel.rot * Math.PI / 2, cel.rot * Math.PI / 2 + Math.PI / 2); c.closePath(); c.fill(); }
    else if (cel.ty === 3) { c.fillStyle = col; for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) if ((a + b) % 2 === 0) c.fillRect(x + a * cell * .5, y + b * cell * .5, cell * .5, cell * .5); }
    else if (cel.ty === 4) { c.fillStyle = col; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(x + cell * .25 + k * cell * .25, y + cell * .3 + (k % 2) * cell * .35, cell * .12, 0, TAU); c.fill(); } }
    else if (cel.ty === 5) { c.strokeStyle = col; c.lineWidth = cell * .07; for (let k = 1; k <= 2; k++) { c.beginPath(); c.arc(x + cell / 2, y + cell / 2, cell * .16 * k, 0, TAU); c.stroke(); } }
    else { c.fillStyle = col; c.beginPath(); c.arc(x + cell / 2, y + cell * .8, cell * .4, Math.PI, TAU); c.fill(); }
  }
  c.fillStyle = tone(1); c.beginPath(); c.arc(w * .5, h * .47, m * .3, 0, TAU); c.fill();
  c.fillStyle = hex('#ffffff', .14); c.fillRect(w * .12, h * .44, w * .76, m * .012);
  const asm = eOut(clamp(tt / .45, 0, 1));
  const bx = w * .5, by = h * .5, sc = m * .0022;
  const swing = Math.sin(t * 5.2) * (card.pose === 0 ? .8 : .3);
  const parts = [
    [0, -120, 26, 0, -120, 26, 3],
    [0, -88, 18, 0, -22, 22, 2],
    [0, -80, 12, -46, -52 - swing * 22, 14, 4],
    [0, -80, 12, 46, -52 + swing * 22, 14, 4],
    [0, -22, 12, -26, 42 + swing * 30, 16, 1],
    [0, -22, 12, 26, 42 - swing * 30, 16, 1]
  ];
  for (let band = 0; band < 5; band++) {
    c.save();
    if (asm < 1) {
      const byy = by + (band - 2) * m * .12;
      c.beginPath(); c.rect(0, byy - m * .062, w, m * .124); c.clip();
      c.translate((band % 2 ? -1 : 1) * (1 - asm) * w * .8, 0);
    }
    for (const [x1, y1, r1, x2, y2, r2, toneK] of parts) {
      c.strokeStyle = tone(toneK); c.lineWidth = r1 * 2 * sc * m / 2.2;
      c.lineCap = 'round';
      c.beginPath(); c.moveTo(bx + x1 * sc * m / 2.2, by + y1 * sc * m / 2.2); c.lineTo(bx + x2 * sc * m / 2.2, by + y2 * sc * m / 2.2); c.stroke();
    }
    c.restore();
  }
  c.lineCap = 'butt';
  const tf = eOut(clamp((tt - .15) / .4, 0, 1));
  c.save(); c.beginPath(); c.rect(w * .06, h * .06, w * .5, h * .17 * tf); c.clip();
  c.fillStyle = mixHex(card.hue, '#ffffff', .8); c.font = `900 ${m * .17}px ${SANS}`;
  c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText(card.title, w * .06, h * .06);
  c.restore();
  const ef = eOut(clamp((tt - .3) / .4, 0, 1));
  c.save(); c.beginPath(); c.rect(w * .06, h * .25, w * .5, h * .09 * ef); c.clip();
  c.fillStyle = mixHex(card.hue, '#101014', .35); c.font = `700 ${m * .062}px ${SANS}`;
  c.fillText(card.en, w * .06, h * .25); c.restore();
  c.fillStyle = hex('#ffffff', .85); c.font = `${m * .026}px ${MONO}`;
  c.fillText('0' + (ci + 7) + ' / 12', w * .06, h * .92);
  for (let i = 0; i < 12; i++) {
    c.fillStyle = i <= ci + 6 ? tone(3) : hex('#ffffff', .18);
    c.fillRect(w * .32 + i * m * .028, h * .925, m * .016, i === ci + 6 ? m * .03 : m * .016);
  }
};


// ---- L39 ----
S.L39 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  if (!s.init) {
    s.init = 1; const r = rng(39);
    s.stars = []; for (let i = 0; i < 34; i++) s.stars.push([r(), r() * .6, r()]);
    const [pc, px] = offscreen(4, 4, 1);
    px.fillStyle = 'rgba(0,0,0,0)'; px.fillRect(0, 0, 4, 4);
    px.fillStyle = 'rgba(20,10,0,.55)'; px.fillRect(0, 0, 4, 1.2);
    s.scr = pc;
    s.logs = ['唤醒序列启动', '生命维持正常', '信号捕获中', '绘制家园'];
    s.cnt = []; for (let i = 0; i < 10; i++) s.cnt.push(r());
  }
  const D = 12, q = t % D;
  c.fillStyle = '#120a02'; c.fillRect(0, 0, w, h);
  const cw = 26 + 16 * (.5 - .5 * Math.cos(q / D * TAU)), ch = cw * 1.9;
  const cols = Math.floor(w / cw), rows = Math.floor((h * .74) / ch);
  const ramp = ' .,:;-~=+*#%@';
  c.font = `${ch * .86}px ${MONO}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let ry = 0; ry < rows; ry++) {
    for (let rx = 0; rx < cols; rx++) {
      const u = rx / cols, v = ry / rows;
      let d = .05 + .05 * nz(u * 5, v * 5, t * .08);
      for (const [sx, sy, ph] of s.stars) {
        const dx = u - sx, dy = v - sy, d2 = dx * dx + dy * dy;
        if (d2 < .0012) d += (.55 + .45 * Math.sin(t * 2.2 + ph * TAU)) * (1 - d2 / .0012);
      }
      const hor = .66 + .05 * Math.sin(u * 7.5 + 1) + .025 * Math.sin(u * 13 + 2);
      if (v > hor) d = .3 + .22 * (.5 + .5 * nz(u * 7, v * 7, .5));
      const dx2 = u - .5, dy2 = (v - (hor - .012)) * 1.5, dd = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      if (dd < .21) {
        d = .5 + .3 * (1 - dd / .21);
        if (Math.abs(dd - .19) < .018) d = 1;
        if (Math.abs(dx2) < .006 && dy2 < 0 && dy2 > -.16) d = .95;
      }
      if (d <= .09) continue;
      const gi = clamp(Math.round(d * 12), 1, 12);
      c.fillStyle = hex('#ffb347', .2 + d * .78);
      c.fillText(ramp[gi], rx * cw + cw / 2, h * .05 + ry * ch + ch / 2);
    }
  }
  const pat = c.createPattern(s.scr, 'repeat');
  c.globalAlpha = .3; c.fillStyle = pat; c.fillRect(0, 0, w, h); c.globalAlpha = 1;
  c.fillStyle = hex('#ffb347', .03 + .03 * (.5 + .5 * Math.sin(t * 23))); c.fillRect(0, 0, w, h);
  c.strokeStyle = hex('#ffb347', .3); c.lineWidth = m * .006;
  c.beginPath();
  c.moveTo(m * .02, m * .04); c.lineTo(w - m * .02, m * .04);
  c.moveTo(m * .02, h - m * .04); c.lineTo(w - m * .02, h - m * .04); c.stroke();
  const ly = h * .8;
  c.fillStyle = hex('#ffb347', .22); c.fillRect(w * .03, ly, w * .94, 1);
  c.fillStyle = '#ffb347'; c.fillRect(w * .03, ly + m * .026, m * .085, m * .042);
  c.fillStyle = '#120a02'; c.font = `700 ${m * .028}px ${MONO}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('LOG', w * .03 + m * .042, ly + m * .047);
  const li = Math.floor(q / 3) % s.logs.length;
  const txt = s.logs[li], nch = clamp(Math.floor((q % 3) * 9), 0, txt.length);
  c.fillStyle = '#ffb347'; c.textAlign = 'left';
  c.font = `${m * .038}px ${MONO}`;
  c.fillText('>' + txt.slice(0, nch), w * .15, ly + m * .047);
  const cursorOn = Math.floor(t * 2.6) % 2 === 0;
  if (cursorOn) c.fillRect(w * .15 + m * .062 + nch * m * .042, ly + m * .028, m * .02, m * .04);
  c.textAlign = 'right'; c.font = `${m * .026}px ${MONO}`; c.fillStyle = hex('#ffb347', .6);
  c.fillText('REC ' + String(Math.floor(t * 7) % 1000).padStart(3, '0') + ' · ' + cols + '×' + rows, w * .96, ly + m * .047);
  const vg = c.createRadialGradient(w / 2, h / 2, m * .2, w / 2, h / 2, m * .85);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(10,5,0,.55)');
  c.fillStyle = vg; c.fillRect(0, 0, w, h);
};


// ---- L40 ----
S.L40 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  if (!s.init) {
    s.init = 1; const r = rng(40);
    s.pts = [];
    for (let i = 0; i < 30; i++) {
      const trend = i / 29;
      s.pts.push(clamp(.12 + trend * .72 + (r() - .5) * .22 + Math.sin(i * .9) * .07, .02, .98));
    }
    s.njit = []; for (let i = 0; i < 8; i++) s.njit.push([(r() - .5) * 4, (r() - .5) * 4, (r() - .5) * .1]);
    s.leader = []; for (let i = 0; i < 8; i++) s.leader.push([(r() - .5) * 18, (r() - .5) * 14]);
    const [gc, gx] = offscreen(24, 24, 1);
    gx.fillStyle = '#f2ead8'; gx.fillRect(0, 0, 24, 24);
    gx.fillStyle = 'rgba(120,100,70,.13)';
    for (let i = 0; i < 40; i++) gx.fillRect(r() * 24, r() * 24, 1, 1);
    gx.fillStyle = 'rgba(120,100,70,.1)'; gx.fillRect(11, 0, 1.5, 24); gx.fillRect(0, 11, 24, 1.5);
    s.grid = gc;
  }
  const D = 9, q = t % D;
  c.fillStyle = c.createPattern(s.grid, 'repeat'); c.fillRect(0, 0, w, h);
  const x0 = w * .14, x1 = w * .86, y0 = h * .68, y1 = h * .22;
  const ratchet = Math.floor(clamp((q - 7.1) / .12, 0, 6)) / 6;
  const yOf = v => y0 - (y0 - (y1 + (y0 - y1) * .5)) * (1 + .16 * ratchet) * 0 - (y0 - y1) * v * (1 + .16 * ratchet) * .92;
  const xOf = i => x0 + (x1 - x0) * i / 29;
  c.strokeStyle = 'rgba(90,72,50,.55)'; c.lineWidth = 1.4;
  const ax = eOut(clamp(q / .6, 0, 1)), axx = eOut(clamp((q - .35) / .6, 0, 1));
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0, y0 - (y0 - y1) * ax); c.stroke();
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + (x1 - x0) * axx, y0); c.stroke();
  c.fillStyle = 'rgba(90,72,50,.75)'; c.font = `${m * .022}px ${MONO}`;
  c.textAlign = 'right'; c.textBaseline = 'middle';
  for (let k = 0; k <= 4; k++) {
    const yy = yOf(k / 4);
    if (yy < y1 - 10) continue;
    c.beginPath(); c.moveTo(x0 - m * .008, yy); c.lineTo(x0, yy); c.stroke();
    c.fillText(((k / 4 - .5) * 4).toFixed(1), x0 - m * .018, yy);
  }
  c.textAlign = 'center'; c.textBaseline = 'top';
  for (let k = 0; k <= 4; k++) {
    const xx = xOf(k * 7.25);
    c.fillText(String(1925 + k * 25), xx, y0 + m * .014);
  }
  c.strokeStyle = hex('#2c2418', .8); c.lineWidth = 2;
  c.beginPath();
  for (let i = 0; i < 30; i++) {
    const lt = 1 + i * .13; if (q < lt) break;
    const px = xOf(i), py = yOf(s.pts[i]);
    i ? c.lineTo(px, py) : c.moveTo(px, py);
  }
  c.stroke();
  let tipx = x0, tipy = y0;
  for (let i = 0; i < 30; i++) {
    const lt = 1 + i * .13, a = q - lt; if (a < 0) continue;
    const px = xOf(i), py = yOf(s.pts[i]);
    tipx = px; tipy = py;
    const pop = 1 + .6 * Math.exp(-a * 8);
    c.fillStyle = mixHex('#3a6bc9', '#c94a3a', s.pts[i]);
    c.beginPath(); c.arc(px, py, m * .011 * pop, 0, TAU); c.fill();
    c.strokeStyle = hex('#2c2418', .75); c.lineWidth = 1.1;
    c.beginPath(); c.arc(px, py, m * .011 * pop, 0, TAU); c.stroke();
    if (a < .35) {
      c.strokeStyle = hex('#2c2418', (1 - a / .35) * .4); c.lineWidth = 1;
      c.beginPath(); c.arc(px, py, m * .012 + a * m * .14, 0, TAU); c.stroke();
    }
  }
  const bob = Math.sin(t * 6) * m * .003;
  c.save(); c.translate(tipx + bob, tipy + bob);
  c.fillStyle = 'rgba(90,72,50,.2)'; c.beginPath(); c.ellipse(m * .055, m * .045, m * .065, m * .016, .5, 0, TAU); c.fill();
  c.rotate(.55);
  c.fillStyle = '#3f5da8'; c.fillRect(0, -m * .014, m * .1, m * .014);
  c.fillStyle = '#b04438'; c.fillRect(0, 0, m * .1, m * .014);
  c.fillStyle = '#caa46a';
  c.beginPath(); c.moveTo(m * .1, -m * .014); c.lineTo(m * .165, -m * .005); c.lineTo(m * .165, m * .005); c.lineTo(m * .1, m * .014); c.closePath(); c.fill();
  c.fillStyle = '#2c2418';
  c.beginPath(); c.moveTo(m * .165, -m * .006); c.lineTo(m * .196, 0); c.lineTo(m * .165, m * .006); c.closePath(); c.fill();
  c.restore();
  const nx = xOf(21), ny = yOf(s.pts[21]);
  const nf = clamp((q - 5.2) / .9, 0, 1);
  if (nf > 0) {
    c.strokeStyle = hex('#3f5da8', .8); c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(nx + m * .1, ny - m * .12);
    for (let i = 0; i < 7; i++) c.quadraticCurveTo(nx + m * .1 + s.leader[i][0] + i * m * .028, ny - m * .12 + s.leader[i][1], nx + m * .1 + (i + 1) * m * .028, ny - m * .12 + s.leader[i + 1][1] * .5);
    c.stroke();
    c.beginPath(); c.arc(nx, ny, m * .028, .4, TAU - .7); c.stroke();
    const note = '入夜渐暖';
    c.font = `italic ${m * .038}px Georgia, serif`; c.fillStyle = '#3f5da8';
    c.textAlign = 'left'; c.textBaseline = 'middle';
    for (let i = 0; i < note.length; i++) {
      const f = clamp(nf * 5 - i, 0, 1); if (f <= 0) continue;
      const J = s.njit[i];
      c.save(); c.translate(nx + m * .12 + i * m * .05, ny - m * .16 + J[1] * .5); c.rotate(J[2]);
      c.globalAlpha = f; c.fillText(note[i], 0, 0); c.restore();
    }
  }
  c.fillStyle = '#2c2418'; c.font = `700 ${m * .042}px Georgia, serif`;
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  c.fillText('百年夏季气温', x0, h * .13);
  c.strokeStyle = 'rgba(90,72,50,.6)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(x0, h * .84); c.lineTo(w - x0, h * .84); c.stroke();
  c.font = `${m * .024}px ${MONO}`; c.fillStyle = 'rgba(90,72,50,.85)';
  c.fillText('图一 · 气温距平 1925 – 2025', x0, h * .885);
};


// ---- L41 ----
S.L41 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  if (!s.init) {
    s.init = 1; const r = rng(41);
    s.stations = [
      { x: 1, y: .8, hue: '#4a7c4e', label: '种植' },
      { x: 2.4, y: 1.5, hue: '#8a5a2e', label: '烘焙' },
      { x: 3.8, y: 1.1, hue: '#3a6a9e', label: '萃取' },
      { x: 5, y: 2.4, hue: '#c2603a', label: '出品' }
    ];
    s.route = [[.6, .5], [1, .8], [2.4, 1.5], [3.8, 1.1], [5, 2.4], [5.4, 3.2]];
    s.strata = []; for (let i = 0; i < 3; i++) s.strata.push(i);
  }
  const D = 10, q = t % D;
  c.fillStyle = '#f0ece2'; c.fillRect(0, 0, w, h);
  c.fillStyle = 'rgba(90,80,64,.14)';
  for (let j = 0; j < 9; j++) for (let i = 0; i < 11; i++) {
    const px = w * .12 + i * w * .075 + (j % 2) * w * .037, py = h * .1 + j * h * .095;
    c.fillRect(px, py, 2, 2);
  }
  const zoom = 1 + .07 * Math.sin(q / D * TAU);
  const k = m * .115 * zoom, cx = w * .5 + Math.sin(t * .16) * w * .015, cy = h * .42;
  const iso = (x, y, z) => [cx + (x - y) * .866 * k, cy + (x + y) * .5 * k - z * k];
  const face = (pts, col) => {
    c.fillStyle = col; c.beginPath();
    pts.forEach((p, i) => { const s0 = iso(p[0], p[1], p[2]); i ? c.lineTo(s0[0], s0[1]) : c.moveTo(s0[0], s0[1]); });
    c.closePath(); c.fill();
  };
  face([[0, 0, 0], [6, 0, 0], [6, 4, 0], [0, 4, 0]], '#e6dfd0');
  face([[0, 4, 0], [6, 4, 0], [6, 4, -.5], [0, 4, -.5]], '#b8ac96');
  face([[6, 0, 0], [6, 4, 0], [6, 4, -.5], [6, 0, -.5]], '#9c907c');
  for (const i of s.strata) {
    const zz = -.16 - i * .12;
    c.strokeStyle = hex('#6b5c46', .5); c.lineWidth = 1.5;
    c.beginPath();
    const a = iso(0, 4, zz), b = iso(6, 4, zz), cc = iso(6, 0, zz);
    c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(cc[0], cc[1]); c.stroke();
  }
  const blk = (st) => {
    const bx = st.x, by = st.y, sz = .62, hh = .55;
    face([[bx, by, 0], [bx + sz, by, 0], [bx + sz, by + sz, 0], [bx, by + sz, 0]], mixHex(st.hue, '#fff8ec', .22));
    face([[bx, by + sz, 0], [bx + sz, by + sz, 0], [bx + sz, by + sz, hh], [bx, by + sz, hh]], st.hue);
    face([[bx + sz, by, 0], [bx + sz, by + sz, 0], [bx + sz, by + sz, hh], [bx + sz, by, hh]], mixHex(st.hue, '#231a2c', .22));
  };
  [...s.stations].sort((a, b) => (a.x + a.y) - (b.x + b.y)).forEach(blk);
  c.strokeStyle = '#2c2418'; c.lineWidth = 2.5;
  c.beginPath();
  const routeF = clamp(q / 7, 0, 1);
  for (let i = 0; i < s.route.length; i++) {
    const f = clamp(routeF * (s.route.length - 1) - i, 0, 1); if (f <= 0) break;
    const p0 = s.route[i], p1 = s.route[Math.min(i + 1, s.route.length - 1)];
    const a = iso(lerp(p0[0], p1[0], Math.min(1, f)), lerp(p0[1], p1[1], Math.min(1, f)), .02);
    i ? c.lineTo(a[0], a[1]) : (c.moveTo(a[0], a[1]), c.lineTo(a[0], a[1]));
    if (f < 1) break;
  }
  c.stroke();
  const u = (.5 - .5 * Math.cos(q / D * TAU));
  const seg = u * (s.route.length - 1), si = Math.floor(seg), sf = eOut(seg - si);
  const vp = s.route[Math.min(si, s.route.length - 2)], vp2 = s.route[Math.min(si + 1, s.route.length - 1)];
  const vx = lerp(vp[0], vp2[0], sf), vy = lerp(vp[1], vp2[1], sf);
  face([[vx - .18, vy - .18, .02], [vx + .18, vy - .18, .02], [vx + .18, vy + .18, .02], [vx - .18, vy + .18, .02]], mixHex('#c2603a', '#fff8ec', .2));
  face([[vx - .18, vy + .18, .02], [vx + .18, vy + .18, .02], [vx + .18, vy + .18, .3], [vx - .18, vy + .18, .3]], '#c2603a');
  face([[vx + .18, vy - .18, .02], [vx + .18, vy + .18, .02], [vx + .18, vy + .18, .3], [vx + .18, vy - .18, .3]], mixHex('#c2603a', '#231a2c', .22));
  c.textAlign = 'left'; c.textBaseline = 'middle';
  for (const st of s.stations) {
    const top = iso(st.x + .3, st.y + .3, .62);
    const lx = top[0] + k * .55, ly = top[1] - k * .55;
    c.strokeStyle = '#2c2418'; c.lineWidth = 1.6;
    c.beginPath(); c.arc(top[0], top[1], 3.2, 0, TAU); c.stroke();
    c.beginPath(); c.moveTo(top[0], top[1]); c.lineTo(lx, ly); c.lineTo(lx + k * .3, ly); c.stroke();
    c.font = `700 ${m * .032}px ${SANS}`;
    c.strokeStyle = '#f0ece2'; c.lineWidth = 7; c.strokeText(st.label, lx + k * .34, ly);
    c.fillStyle = '#2c2418'; c.fillText(st.label, lx + k * .34, ly);
    c.font = `${m * .022}px ${MONO}`;
    c.strokeStyle = '#f0ece2'; c.lineWidth = 5;
    c.strokeText(['产区', '烘焙度', '水温', '上桌'][s.stations.indexOf(st)], lx + k * .34, ly + m * .034);
    c.fillStyle = 'rgba(60,50,36,.85)'; c.fillText(['产区', '烘焙度', '水温', '上桌'][s.stations.indexOf(st)], lx + k * .34, ly + m * .034);
  }
  for (let i = 0; i < 12; i++) {
    const f = eBack(clamp((q - 1 - i * .22) / .35, 0, 1)); if (f <= 0) continue;
    const ix = w * .08 + (i % 6) * m * .052, iy = h * .8 + Math.floor(i / 6) * m * .055;
    c.fillStyle = '#8a5a2e';
    c.fillRect(ix, iy - m * .03 * f, m * .03, m * .03 * f);
    c.fillRect(ix + m * .034, iy - m * .03 * f, m * .03, m * .03 * f);
    c.fillRect(ix, iy, m * .064, m * .008);
  }
  c.fillStyle = '#2c2418'; c.font = `700 ${m * .034}px ${SANS}`;
  const cnt = Math.min(12, Math.max(0, Math.floor((q - 1) / .22)));
  c.fillText('× ' + cnt, w * .08 + 6 * m * .052 + m * .01, h * .8);
  const cw2 = w * .34, cxx = w * .5 - cw2 / 2, cyy = h * .885;
  c.fillStyle = '#faf7ee'; c.fillRect(cxx, cyy, cw2, h * .08);
  c.strokeStyle = '#2c2418'; c.lineWidth = 2; c.strokeRect(cxx, cyy, cw2, h * .08);
  const wipe = eOut(clamp((q - 2) / .5, 0, 1));
  c.save(); c.beginPath(); c.rect(cxx, cyy, cw2 * wipe, h * .08); c.clip();
  c.fillStyle = '#2c2418'; c.font = `600 ${m * .036}px ${SANS}`;
  c.fillText('一杯咖啡的旅程', cxx + m * .075, cyy + h * .044);
  c.restore();
  c.fillStyle = '#8a5a2e'; c.fillRect(cxx + m * .02, cyy + h * .028, m * .03, m * .03);
};


// ---- L42 ----
S.L42 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  if (!s.init) {
    s.init = 1; const r = rng(42);
    s.cards = [];
    for (let i = 0; i < 22; i++) {
      s.cards.push({
        sx: .08 + r() * .84, sy: .16 + r() * .62, rot: (r() - .5) * .9,
        gx: .16 + (i % 6) * .132, gy: .3 + Math.floor(i / 6) * .13,
        d: r() * 1.4, bad: r() < .3, k: r()
      });
    }
  }
  const D = 9, q = t % D, acc = '#B7F34A';
  c.fillStyle = '#0a0c10'; c.fillRect(0, 0, w, h);
  const gl = c.createRadialGradient(w * .5, h * .3, 0, w * .5, h * .3, m * .9);
  gl.addColorStop(0, 'rgba(70,100,150,.16)'); gl.addColorStop(1, 'rgba(70,100,150,0)');
  c.fillStyle = gl; c.fillRect(0, 0, w, h);
  const mod = m * .067;
  c.strokeStyle = 'rgba(255,255,255,.03)'; c.lineWidth = 1;
  c.beginPath();
  for (let x = 0; x < w; x += mod) { c.moveTo(x, 0); c.lineTo(x, h); }
  for (let y = 0; y < h; y += mod) { c.moveTo(0, y); c.lineTo(w, y); }
  c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.06)';
  c.beginPath();
  for (let x = 0; x < w; x += mod * 4) { c.moveTo(x, 0); c.lineTo(x, h); }
  c.stroke();
  const click = 3.0;
  const cxp = w * .5, cyp = h * .72;
  for (let i = 0; i < s.cards.length; i++) {
    const C = s.cards[i];
    const k = eBack(ss(0, 1, clamp((q - click - C.d * 1.1) / 1.05, 0, 1)));
    const tremble = q < click ? Math.sin(t * 41 + i * 3) * 2.2 : 0;
    const bx = lerp(C.sx, C.gx, k) * w + tremble, by = lerp(C.sy, C.gy, k) * h + Math.cos(t * 37 + i) * (q < click ? 2 : 0);
    const rot = lerp(C.rot, 0, k);
    const cwid = m * .115, chei = m * .075;
    c.save(); c.translate(bx, by); c.rotate(rot);
    c.fillStyle = k > .5 ? '#141821' : '#171b24';
    c.beginPath(); c.roundRect(-cwid / 2, -chei / 2, cwid, chei, m * .008); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 1; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(-cwid / 2 + m * .012, -chei / 2 + m * .012, cwid * .28, 2.5);
    c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(-cwid / 2 + m * .012, -chei / 2 + m * .026, cwid * .62, 2);
    c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(-cwid / 2 + m * .012, -chei / 2 + m * .038, cwid * .45, 2);
    if (C.bad && q < click + .4) {
      c.fillStyle = '#e5484d';
      c.beginPath(); c.roundRect(cwid / 2 - m * .028, -chei / 2 + m * .008, m * .022, m * .016, 3); c.fill();
      if (Math.floor(t * 3 + i) % 2) { c.fillStyle = '#e5484d'; c.beginPath(); c.arc(cwid / 2 - m * .017, -chei / 2 + m * .016, m * .007, 0, TAU); c.fill(); }
    }
    if (C.k > .72 && k > .9) {
      c.fillStyle = acc; c.beginPath(); c.arc(cwid / 2 - m * .016, chei / 2 - m * .014, m * .006, 0, TAU); c.fill();
    }
    c.restore();
  }
  const bf = eOut(clamp((q - 1.2) / .5, 0, 1)) * (q > click + .3 ? 0 : 1);
  if (bf > 0) {
    const bw2 = m * .3, bh2 = m * .085;
    c.fillStyle = '#1a2029';
    c.beginPath(); c.roundRect(cxp - bw2 / 2, cyp - bh2 / 2, bw2, bh2, bh2 / 2); c.fill();
    c.strokeStyle = acc; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = acc; c.font = `600 ${m * .032}px ${SANS}`;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('一键整理', cxp, cyp);
    if (q > click - .25 && q < click + .5) {
      const rr = (q - (click - .25)) * m * .3;
      c.strokeStyle = hex('#ffffff', .5 * (1 - rr / (m * .3))); c.lineWidth = 2;
      c.beginPath(); c.arc(cxp, cyp, Math.max(1, rr), 0, TAU); c.stroke();
    }
  }
  const cur = q < 1 ? [.2, .82] : q < click ? [lerp(.2, .5, eOut((q - 1) / 1.9)), lerp(.82, .72, eOut((q - 1) / 1.9))] : [.5 + (q - click) * .02, .72 - (q - click) * .04];
  c.save(); c.translate(cur[0] * w, cur[1] * h); c.scale(m * .001, m * .001);
  c.fillStyle = '#e8ecf2';
  c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 20); c.lineTo(5, 15); c.lineTo(9, 23); c.lineTo(12, 21); c.lineTo(8, 14); c.lineTo(14, 13); c.closePath(); c.fill();
  c.strokeStyle = '#0a0c10'; c.lineWidth = 1.2; c.stroke();
  c.restore();
  const nf = clamp((q - 4.6) / 2.2, 0, 1);
  if (nf > 0) {
    const num = Math.floor(eOut(nf) * 1248);
    c.fillStyle = acc; c.font = `600 ${m * .28}px ${SANS}`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(String(num), w * .5, h * .42);
    c.fillStyle = 'rgba(255,255,255,.35)'; c.font = `500 ${m * .026}px ${MONO}`;
    c.fillText('窗口已归位 · 用时 0.8 秒', w * .5, h * .58);
    c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(w * .36, h * .62, w * .28, 3);
    c.fillStyle = acc; c.fillRect(w * .36, h * .62, w * .28 * eOut(nf), 3);
  }
  const tf = eOut(clamp((q - 5.6) / .3, 0, 1)) * (q > 8.4 ? 0 : 1);
  if (tf > 0) {
    const tw = m * .5;
    c.fillStyle = 'rgba(18,22,30,.92)';
    c.beginPath(); c.roundRect(w * .5 - tw / 2, h * .87 - m * .028 + (1 - tf) * m * .03, tw, m * .056, m * .028); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 1; c.stroke();
    c.fillStyle = '#e8ecf2'; c.font = `500 ${m * .026}px ${SANS}`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('整理完成 · 22 个窗口已归位', w * .5, h * .87 + (1 - tf) * m * .03);
    if (Math.floor(t * 2.4) % 2) { c.fillStyle = acc; c.beginPath(); c.arc(w * .5 - tw * .38, h * .87 + (1 - tf) * m * .03, m * .008, 0, TAU); c.fill(); }
  }
  const vg = c.createRadialGradient(w / 2, h / 2, m * .25, w / 2, h / 2, m * .95);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)');
  c.fillStyle = vg; c.fillRect(0, 0, w, h);
};


// ---- L43 ----
S.L43 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  if (!s.init) {
    s.init = 1; const r = rng(43);
    const [wc, wx] = offscreen(w, h, 1);
    const g = wx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#2e4a56'); g.addColorStop(1, '#1c2c36');
    wx.fillStyle = g; wx.fillRect(0, 0, w, h);
    for (let i = 0; i < 5; i++) {
      const gg = wx.createRadialGradient(r() * w, r() * h, 0, r() * w, r() * h, m * (.3 + r() * .5));
      gg.addColorStop(0, 'rgba(120,190,200,.12)'); gg.addColorStop(1, 'rgba(120,190,200,0)');
      wx.fillStyle = gg; wx.fillRect(0, 0, w, h);
    }
    s.wall = wc;
    s.sprite = [
      '..####..',
      '.#oooo#.',
      '#ooeeoo#',
      '#ooeeoo#',
      '#oooooo#',
      '.#oooo#.',
      '..####..',
      '..#..#..',
      '.##..##.'
    ];
    s.rows = ['整理桌面', '生成周报', '运行测试'];
  }
  const D = 10, q = t % D;
  c.drawImage(s.wall, 0, 0, w, h);
  const wx0 = w * .16, wy0 = h * .12, ww = w * .68, wh = h * .72;
  c.save();
  c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = m * .04; c.shadowOffsetY = m * .012;
  c.fillStyle = '#f7f8fa';
  c.beginPath(); c.roundRect(wx0, wy0, ww, wh, m * .012); c.fill();
  c.restore();
  c.fillStyle = '#eceef2';
  c.beginPath(); c.roundRect(wx0, wy0, ww, m * .055, [m * .012, m * .012, 0, 0]); c.fill();
  c.fillStyle = '#5c6570'; c.beginPath(); c.arc(wx0 + m * .022, wy0 + m * .027, m * .008, 0, TAU); c.fill();
  c.fillStyle = '#3a4048'; c.font = `600 ${m * .022}px ${SANS}`;
  c.textAlign = 'left'; c.textBaseline = 'middle';
  c.fillText('工作台 · 计划模式', wx0 + m * .042, wy0 + m * .027);
  c.fillStyle = '#f2f3f6'; c.fillRect(wx0, wy0 + m * .055, ww * .26, wh - m * .055);
  c.strokeStyle = '#e2e5ea'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(wx0 + ww * .26, wy0 + m * .055); c.lineTo(wx0 + ww * .26, wy0 + wh); c.stroke();
  for (let i = 0; i < 4; i++) {
    c.fillStyle = i === 0 ? '#dde4ee' : 'rgba(0,0,0,0)';
    if (i === 0) c.fillRect(wx0 + m * .008, wy0 + m * .075 + i * m * .05, ww * .26 - m * .016, m * .04);
    c.fillStyle = '#5c6570'; c.font = `${m * .021}px ${SANS}`;
    c.fillText(['计划', '文件', '运行', '设置'][i], wx0 + m * .024, wy0 + m * .095 + i * m * .05);
  }
  c.fillStyle = '#23262b'; c.font = `700 ${m * .032}px ${SANS}`;
  c.fillText('今日计划', wx0 + ww * .3, wy0 + m * .1);
  for (let i = 0; i < 3; i++) {
    const done = q > 4.3 + i * .32;
    const ry = wy0 + m * .14 + i * m * .062;
    c.fillStyle = '#ffffff'; c.fillRect(wx0 + ww * .3, ry, ww * .62, m * .05);
    c.strokeStyle = '#e2e5ea'; c.strokeRect(wx0 + ww * .3, ry, ww * .62, m * .05);
    c.strokeStyle = done ? '#2f9e63' : '#b8bec7'; c.lineWidth = 1.6;
    c.strokeRect(wx0 + ww * .32, ry + m * .013, m * .022, m * .022);
    if (done) {
      c.strokeStyle = '#2f9e63'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(wx0 + ww * .323, ry + m * .025); c.lineTo(wx0 + ww * .329, ry + m * .031); c.lineTo(wx0 + ww * .34, ry + m * .016); c.stroke();
    }
    c.fillStyle = '#3a4048'; c.font = `${m * .022}px ${SANS}`;
    c.fillText(s.rows[i], wx0 + ww * .36, ry + m * .027);
    if (done) { c.fillStyle = '#2f9e63'; c.font = `${m * .018}px ${MONO}`; c.fillText('✓ 完成', wx0 + ww * .82, ry + m * .027); }
  }
  const bxx = wx0 + ww * .3, byy = wy0 + m * .38;
  const pressed = q > 4.0 && q < 4.25;
  c.fillStyle = pressed ? '#2b7a4e' : '#2f9e63';
  c.beginPath(); c.roundRect(bxx, byy + (pressed ? m * .004 : 0), m * .14, m * .048, m * .01); c.fill();
  c.fillStyle = '#ffffff'; c.font = `600 ${m * .023}px ${SANS}`;
  c.fillText(q > 4.3 ? '运行中…' : '运行', bxx + m * .045, byy + m * .027 + (pressed ? m * .004 : 0));
  c.fillStyle = '#f4f5f7'; c.fillRect(wx0 + ww * .3, byy + m * .07, ww * .62, m * .1);
  c.strokeStyle = '#e2e5ea'; c.strokeRect(wx0 + ww * .3, byy + m * .07, ww * .62, m * .1);
  for (let i = 0; i < 3; i++) {
    if (q < 4.5 + i * .3) continue;
    c.fillStyle = '#7a828c'; c.font = `${m * .018}px ${MONO}`;
    c.fillText(['> 计划已生成', '> 测试通过 12/12', '> 已保存到今日'][i], wx0 + ww * .32, byy + m * .092 + i * m * .027);
  }
  const px = m * .014;
  const walk = Math.sin(t * 1.1) * .5 + .5;
  const jumpT = q > 3.85 && q < 5.0 ? (q - 3.85) : -1;
  const squash = jumpT >= 0 && jumpT < .15 ? .78 : (jumpT > .85 && jumpT < 1.0 ? .85 : 1);
  const jumpY = jumpT > .15 && jumpT < .9 ? Math.sin((jumpT - .15) / .75 * Math.PI) * m * .12 : 0;
  const mxp = Math.round((wx0 + ww * .34 + walk * ww * .3) / px) * px;
  const myp = wy0 + m * .14 - px * 9 + jumpY;
  const blink = (t % 4.2) > 3.95;
  for (let ry = 0; ry < 9; ry++) {
    for (let rx = 0; rx < 8; rx++) {
      const ch = s.sprite[ry][rx];
      if (ch === '.') continue;
      let col = ch === 'o' ? '#e8543f' : '#23262b';
      if (ch === 'e') col = blink ? '#e8543f' : '#ffffff';
      c.fillStyle = col;
      c.fillRect(mxp + rx * px, myp + ry * px * squash, px + .5, px * squash + .5);
    }
  }
  if (blink) { c.fillStyle = '#23262b'; c.fillRect(mxp + px * 2.5, myp + px * 2.5, px * 3, px * .6); }
  if (jumpT > 1.0 || jumpT < 0) {
    const ph = Math.floor(t * 6) % 2;
    c.fillStyle = '#23262b';
    c.fillRect(mxp + (ph ? px : 0), myp + px * 7 * squash, px * 1.6, px * 1.2 * squash);
    c.fillRect(mxp + px * 5 - (ph ? px : 0), myp + px * 7 * squash, px * 1.6, px * 1.2 * squash);
  }
  const cur = q < 3.6 ? [lerp(.3, .5, eOut(q / 3.6)), lerp(.75, .56, eOut(q / 3.6))] : q < 4.1 ? [.5 + (q - 3.6) * .1, .56] : [.55 + Math.sin(t * .8) * .02, .5 - (q - 4.1) * .01];
  c.save(); c.translate(cur[0] * w, cur[1] * h); c.scale(m * .0011, m * .0011);
  c.fillStyle = '#111418';
  c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 21); c.lineTo(5.5, 15.5); c.lineTo(9.5, 24); c.lineTo(12.5, 22.5); c.lineTo(8.5, 14); c.lineTo(15, 13.5); c.closePath(); c.fill();
  c.restore();
  if (q > 3.95 && q < 4.75) {
    c.fillStyle = 'rgba(30,34,40,.85)';
    c.beginPath(); c.roundRect(w * .62, h * .16, m * .17, m * .05, m * .012); c.fill();
    c.fillStyle = '#e8ecf2'; c.font = `600 ${m * .024}px ${MONO}`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('⌘ + ⏎', w * .62 + m * .085, h * .16 + m * .025);
  }
  c.fillStyle = 'rgba(255,255,255,.82)';
  c.beginPath(); c.roundRect(w * .03, h * .04, m * .24, m * .05, m * .025); c.fill();
  c.fillStyle = '#23262b'; c.font = `600 ${m * .022}px ${SANS}`;
  c.textAlign = 'left'; c.fillText('01 · 演示', w * .03 + m * .035, h * .04 + m * .025);
  const cf = eOut(clamp((q - .4) / .3, 0, 1)) * (q > 8.6 ? 0 : 1);
  if (cf > 0) {
    const cw2 = m * .52;
    c.fillStyle = 'rgba(20,24,30,.78)';
    c.beginPath(); c.roundRect(w * .5 - cw2 / 2, h * .9 + (1 - cf) * m * .04, cw2, m * .056, m * .028); c.fill();
    c.fillStyle = '#e8ecf2'; c.font = `500 ${m * .026}px ${SANS}`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('光标点击运行 · 计划逐项完成', w * .5, h * .928 + (1 - cf) * m * .04);
    if (Math.floor(t * 2.2) % 2) { c.fillStyle = '#7ac2ff'; c.beginPath(); c.arc(w * .5 - cw2 * .42, h * .928 + (1 - cf) * m * .04, m * .008, 0, TAU); c.fill(); }
  }
  const vg = c.createRadialGradient(w / 2, h / 2, m * .3, w / 2, h / 2, m * 1.05);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.32)');
  c.fillStyle = vg; c.fillRect(0, 0, w, h);
};


// ---- L44 ----
S.L44 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  if (!s.init) {
    s.init = 1; const r = rng(44);
    const E = [];
    const ring = (cx, cy, rad, n, part, z) => {
      for (let i = 0; i < n; i++) {
        const a0 = i / n * TAU, a1 = (i + 1) / n * TAU;
        E.push([cx + Math.cos(a0) * rad, cy + Math.sin(a0) * rad, z || 0, cx + Math.cos(a1) * rad, cy + Math.sin(a1) * rad, z || 0, part]);
      }
    };
    ring(-1.15, .55, .55, 12, 2, 0); ring(1.15, .55, .55, 12, 2, 0);
    for (const wx2 of [-1.15, 1.15]) for (let i = 0; i < 3; i++) {
      const a = i / 3 * TAU;
      E.push([wx2, .55, 0, wx2 + Math.cos(a) * .55, .55 + Math.sin(a) * .55, 0, 2]);
    }
    E.push([-1.15, .55, 0, -.3, 1.05, 0, -1], [-.3, 1.05, 0, .55, 1.05, 0, -1], [.55, 1.05, 0, 1.15, .55, 0, -1], [-.3, 1.05, 0, .15, .35, 0, -1], [.15, .35, 0, 1.15, .55, 0, -1]);
    const bx = .12, by = .78, bw = .3, bh = .17, bz = .13;
    const box = [[bx - bw, by - bh, -bz], [bx + bw, by - bh, -bz], [bx + bw, by + bh, -bz], [bx - bw, by + bh, -bz], [bx - bw, by - bh, bz], [bx + bw, by - bh, bz], [bx + bw, by + bh, bz], [bx - bw, by + bh, bz]];
    for (const [a, b] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) E.push([box[a][0], box[a][1], box[a][2], box[b][0], box[b][1], box[b][2], 0]);
    ring(-1.15, .55, .3, 8, 1, .18); ring(-1.15, .55, .3, 8, 1, -.18);
    for (let i = 0; i < 4; i++) {
      const a = i / 4 * TAU;
      E.push([-1.15 + Math.cos(a) * .3, .55 + Math.sin(a) * .3, -.18, -1.15 + Math.cos(a) * .3, .55 + Math.sin(a) * .3, .18, 1]);
    }
    ring(1.15, .55, .3, 10, 2, .14);
    E.push([.55, 1.05, 0, .55, 1.38, .38, -1], [.55, 1.05, 0, .55, 1.38, -.38, -1], [.55, 1.38, .38, .55, 1.38, -.38, -1]);
    s.edges = E;
    s.dots = []; for (let i = 0; i < 40; i++) s.dots.push([r(), r(), r()]);
    s.parts = [
      { id: 0, label: '电池组', val: '48V · 12Ah', axis: [0, .35, .5], cx: .12, cy: .78 },
      { id: 1, label: '电机', val: '250W', axis: [-.5, 0, 0], cx: -1.15, cy: .55 },
      { id: 2, label: '刹车', val: '180mm', axis: [.45, 0, .35], cx: 1.15, cy: .55 }
    ];
  }
  const D = 9, q = t % D, hue = '#64f0c8', acc = '#ff8a3c';
  c.fillStyle = '#04100e'; c.fillRect(0, 0, w, h);
  const bg = c.createRadialGradient(w * .5, h * .42, 0, w * .5, h * .42, m * .85);
  bg.addColorStop(0, 'rgba(50,160,140,.16)'); bg.addColorStop(1, 'rgba(50,160,140,0)');
  c.fillStyle = bg; c.fillRect(0, 0, w, h);
  const par = t * 6;
  for (const [dx, dy, ph] of s.dots) {
    const x = ((dx * w + par * (0.3 + ph * .5)) % w + w) % w, y = dy * h;
    c.fillStyle = hex(hue, .1 + .08 * ph);
    c.fillRect(x, y, 2, 2);
  }
  const yaw = t * .16 + Math.sin(t * .09) * .3, pitch = .3;
  const k = m * .22, cxp = w * .42, cyp = h * .52;
  const proj = (x, y, z) => {
    const X = x * Math.cos(yaw) + z * Math.sin(yaw), Z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
    const Y2 = y * Math.cos(pitch) - Z1 * Math.sin(pitch), Z2 = y * Math.sin(pitch) + Z1 * Math.cos(pitch);
    const sc = k * 4.2 / (4.2 + Z2 + 2.4);
    return [cxp + X * sc, cyp - Y2 * sc, Z2];
  };
  const padY = h * .82;
  for (const [rr, dash, al] of [[m * .3, [], .5], [m * .22, [6, 8], .35], [m * .1, [], .25]]) {
    c.strokeStyle = hex(hue, al); c.lineWidth = 1.4;
    c.setLineDash(dash);
    c.beginPath(); c.ellipse(cxp, padY, rr, rr * .22, 0, 0, TAU); c.stroke();
    c.setLineDash([]);
  }
  for (let i = 0; i < 20; i++) {
    const a = i / 20 * TAU + t * .1;
    c.strokeStyle = hex(hue, .3); c.lineWidth = 1;
    c.beginPath();
    c.moveTo(cxp + Math.cos(a) * m * .3, padY + Math.sin(a) * m * .3 * .22);
    c.lineTo(cxp + Math.cos(a) * m * .33, padY + Math.sin(a) * m * .33 * .22);
    c.stroke();
  }
  const scanF = clamp(q / 2, 0, 1);
  const scanY = h * .85 - scanF * h * .62;
  for (const E of s.edges) {
    const P = proj(E[0], E[1], E[2]), Q = proj(E[3], E[4], E[5]);
    const maxY = Math.max(P[1], Q[1]);
    if (scanF < 1 && maxY < scanY) continue;
    const part = E[6];
    let ext = [0, 0, 0];
    if (part >= 0) {
      const pIdx = s.parts.findIndex(pp => pp.id === part);
      const pp = s.parts[pIdx];
      const w0 = 2.2 + pIdx * 2.2;
      const ext0 = clamp((q - w0) / .7, 0, 1) * (1 - clamp((q - w0 - 1.6) / .5, 0, 1));
      ext = [pp.axis[0] * ext0 * .55, pp.axis[1] * ext0 * .55, pp.axis[2] * ext0 * .55];
    }
    const P2 = proj(E[0] + ext[0], E[1] + ext[1], E[2] + ext[2]), Q2 = proj(E[3] + ext[0], E[4] + ext[1], E[5] + ext[2]);
    const fog = clamp(.32 + (P2[2] + 2) * -.16 + .62, .22, 1);
    const hot = scanF < 1 && Math.abs(maxY - scanY) < m * .05;
    c.strokeStyle = hex(hot ? '#eafff8' : hue, hot ? .95 : fog * .85);
    c.lineWidth = hot ? 1.8 : 1.25;
    c.beginPath(); c.moveTo(P2[0], P2[1]); c.lineTo(Q2[0], Q2[1]); c.stroke();
  }
  if (scanF < 1 && scanF > 0) {
    const g = c.createLinearGradient(0, scanY - m * .05, 0, scanY + m * .02);
    g.addColorStop(0, hex(hue, 0)); g.addColorStop(1, hex(hue, .3));
    c.fillStyle = g; c.fillRect(w * .1, scanY - m * .05, w * .7, m * .07);
    c.fillStyle = hex('#eafff8', .8); c.fillRect(w * .1, scanY, w * .7, 1.4);
  }
  const frame = Math.floor(t * 24);
  const scr = j => '0123456789ABCDEF#%&'[(frame * 7 + j * 13) % 20];
  for (let pi = 0; pi < 3; pi++) {
    const pp = s.parts[pi], w0 = 2.2 + pi * 2.2;
    const lockT = w0 + .2, rollT = lockT + .7;
    if (q < w0) continue;
    const snap = eOut(clamp((q - w0) / .2, 0, 1));
    const ext0 = clamp((q - w0) / .7, 0, 1) * (1 - clamp((q - w0 - 1.6) / .5, 0, 1));
    const pc = proj(pp.cx + pp.axis[0] * ext0 * .55, pp.cy + pp.axis[1] * ext0 * .55, pp.axis[2] * ext0 * .55);
    const bw = m * .16 * lerp(1.9, 1, snap), bh = m * .12 * lerp(1.9, 1, snap);
    const rot = lerp(Math.PI / 4, 0, snap);
    c.save(); c.translate(pc[0], pc[1]); c.rotate(rot);
    c.strokeStyle = hex(q < rollT ? '#eafff8' : hue, .9); c.lineWidth = 1.5;
    c.strokeRect(-bw / 2, -bh / 2, bw, bh);
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      c.beginPath();
      c.moveTo(sx * bw / 2, sy * bh / 2 - sy * m * .02);
      c.lineTo(sx * bw / 2, sy * bh / 2);
      c.lineTo(sx * bw / 2 - sx * m * .02, sy * bh / 2);
      c.stroke();
    }
    c.restore();
    if (snap > .95 && q - w0 < .35) {
      c.fillStyle = hex('#ffffff', .22 * (1 - (q - w0) / .35));
      c.fillRect(pc[0] - bw / 2, pc[1] - bh / 2, bw, bh);
    }
    const plateX = w * .72, plateY = h * .2 + pi * h * .19;
    c.strokeStyle = hex(hue, .7); c.lineWidth = 1.2;
    c.beginPath(); c.arc(pc[0], pc[1], m * .014, 0, TAU); c.stroke();
    c.beginPath(); c.moveTo(pc[0] + m * .012, pc[1] - m * .01);
    c.lineTo(plateX - m * .1, plateY + m * .03);
    c.lineTo(plateX - m * .02, plateY + m * .03); c.stroke();
    c.fillStyle = 'rgba(4,16,14,.82)';
    c.fillRect(plateX - m * .02, plateY - m * .035, m * .3, m * .1);
    c.strokeStyle = hex(hue, .5); c.strokeRect(plateX - m * .02, plateY - m * .035, m * .3, m * .1);
    c.fillStyle = hex(hue, .8); c.font = `600 ${m * .024}px ${SANS}`;
    c.textAlign = 'left'; c.textBaseline = 'top';
    c.fillText(pp.label, plateX + m * .005, plateY - m * .022);
    let txt = '';
    for (let j = 0; j < pp.val.length; j++) {
      const lockAt = rollT + (pp.val.length - 1 - j) * .09;
      txt += q >= lockAt ? pp.val[j] : scr(j + pi * 5);
    }
    const locked = q >= rollT + pp.val.length * .09;
    c.fillStyle = locked ? acc : hex(hue, .75);
    c.font = `${m * .028}px ${MONO}`;
    c.fillText(txt, plateX + m * .005, plateY + m * .012);
    if (locked) {
      c.strokeStyle = acc; c.lineWidth = 1;
      c.beginPath(); c.moveTo(plateX + m * .005, plateY + m * .052); c.lineTo(plateX + m * .27, plateY + m * .052); c.stroke();
    }
  }
  const brackets = [[m * .03, m * .05, 1, 1], [w - m * .03, m * .05, -1, 1], [m * .03, h - m * .05, 1, -1], [w - m * .03, h - m * .05, -1, -1]];
  c.strokeStyle = hex(hue, .55); c.lineWidth = 1.6;
  for (const [bx2, by2, sx, sy] of brackets) {
    c.beginPath(); c.moveTo(bx2 + sx * m * .05, by2); c.lineTo(bx2, by2); c.lineTo(bx2, by2 + sy * m * .05); c.stroke();
  }
  for (let i = 0; i < 14; i++) {
    const yy = (i / 14 * h + yaw * 30) % h;
    c.strokeStyle = hex(hue, i % 4 === 0 ? .4 : .18); c.lineWidth = 1;
    c.beginPath(); c.moveTo(m * .028, yy); c.lineTo(m * .028 + (i % 4 === 0 ? m * .03 : m * .016), yy); c.stroke();
  }
  c.fillStyle = hex(hue, .8); c.font = `600 ${m * .022}px ${MONO}`;
  c.textAlign = 'left'; c.textBaseline = 'top';
  c.fillText('SCAN // MODEL-07', m * .05, m * .02);
  c.textAlign = 'right';
  c.fillText('LOCK 0' + Math.min(3, Math.max(1, Math.floor((q - 2) / 2.2) + 1)), w - m * .05, m * .02);
  c.textAlign = 'left'; c.fillStyle = hex(hue, .5);
  c.fillText('YAW ' + (yaw % TAU).toFixed(2) + ' · GRID ON', m * .05, h - m * .075);
  const subW = m * .62;
  c.fillStyle = 'rgba(4,16,14,.8)';
  c.fillRect(w / 2 - subW / 2, h * .895, subW, m * .07);
  c.strokeStyle = hex(hue, .5); c.lineWidth = 1; c.strokeRect(w / 2 - subW / 2, h * .895, subW, m * .07);
  c.fillStyle = '#eafff8'; c.font = `500 ${m * .028}px ${SANS}`;
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('部件扫描 · 逐级锁定', w / 2, h * .93);
  for (let i = 0; i < 6; i++) {
    const bh2 = m * .008 + Math.abs(Math.sin(t * 4 + i * .9)) * m * .02;
    c.fillStyle = hex(hue, .6);
    c.fillRect(w / 2 - subW / 2 - m * .07 + i * m * .012, h * .93 - bh2 / 2, m * .006, bh2);
  }
};


// ---- L45 ----
S.L45 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  if (!s.init) {
    s.init = 1; const r = rng(45);
    const [bc, bx] = offscreen(w, h, 1);
    bx.fillStyle = '#8f8b85'; bx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      bx.fillStyle = r() < .5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)';
      bx.beginPath(); bx.ellipse(r() * w, r() * h, m * (.06 + r() * .12), m * (.04 + r() * .08), r() * TAU, 0, TAU); bx.fill();
    }
    bx.fillStyle = 'rgba(0,0,0,.07)';
    for (let i = 0; i < 14; i++) bx.fillRect(i * w / 14, 0, w / 28, h * .62);
    bx.fillStyle = '#6e6a66'; bx.fillRect(0, h * .6, w, h * .05);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 10; i++) {
      bx.fillStyle = (i + j) % 2 ? '#7d7975' : '#5f5b58';
      bx.fillRect(i * w / 10 - w * .05, h * .65 + j * h * .1, w / 10 + 2, h * .1 + 2);
    }
    bx.strokeStyle = 'rgba(40,38,36,.5)'; bx.lineWidth = 3;
    bx.strokeRect(w * .08, h * .12, w * .2, h * .3);
    bx.fillStyle = '#a5a09a'; bx.fillRect(w * .085, h * .125, w * .19, h * .29);
    bx.fillStyle = 'rgba(0,0,0,.16)'; bx.fillRect(0, h * .58, w, h * .02);
    s.bg = bc;
    s.boil = [[0, 0], [1.3, -.9], [-1, 1.2]];
    s.dust = []; for (let i = 0; i < 40; i++) s.dust.push([r(), r(), r()]);
  }
  const D = 8, q = t % D;
  const gw = h * 4 / 3, gx0 = (w - gw) / 2;
  c.fillStyle = '#0b0a09'; c.fillRect(0, 0, w, h);
  const weaveX = Math.sin(t * .8) * 1.2 + Math.sin(t * 2.3) * .4, weaveY = Math.cos(t * 1.15) * 1.2;
  c.save();
  c.beginPath(); c.roundRect(gx0, 0, gw, h, m * .04); c.clip();
  c.translate(weaveX, weaveY);
  const br = 1 + .06 * Math.cos(TAU * t / .5);
  c.save(); c.translate(gx0 + gw / 2, h * .8); c.scale(1 + (br - 1) * .5, br); c.translate(-(gx0 + gw / 2), -h * .8);
  c.drawImage(s.bg, gx0 - 10, -6, gw + 20, h + 12);
  c.restore();
  const tq = Math.floor(t * 12) / 12, ph = tq * TAU * 1.55;
  const run = q < 5.4;
  const sugarX = gx0 + gw * (.5 + Math.sin(tq * 1.15) * .24), sugarY = h * .56;
  const cupX = sugarX - gw * (run ? .16 : .1), cupY = h * .5 - (run ? Math.abs(Math.sin(ph)) * m * .07 : 0);
  const boil = s.boil[Math.floor(t * 12) % 3];
  const tube = (x1, y1, x2, y2, lw, bend) => {
    c.strokeStyle = '#141210'; c.lineWidth = lw + 5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo((x1 + x2) / 2 + (bend || 0), (y1 + y2) / 2, x2, y2); c.stroke();
    c.strokeStyle = '#f2f0ec'; c.lineWidth = lw;
    c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo((x1 + x2) / 2 + (bend || 0), (y1 + y2) / 2, x2, y2); c.stroke();
    c.lineCap = 'butt';
  };
  const glove = (x, y, r0) => {
    c.fillStyle = '#f2f0ec'; c.strokeStyle = '#141210'; c.lineWidth = 3;
    c.beginPath(); c.arc(x, y, r0, 0, TAU); c.fill(); c.stroke();
    for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(x - r0 * .5 + i * r0 * .5, y + r0 * .6); c.lineTo(x - r0 * .5 + i * r0 * .5, y + r0 * .95); c.stroke(); }
  };
  const pieEye = (x, y, r0, look) => {
    c.fillStyle = '#f2f0ec'; c.strokeStyle = '#141210'; c.lineWidth = 3;
    c.beginPath(); c.ellipse(x, y, r0, r0 * 1.15, 0, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = '#141210';
    c.beginPath(); c.ellipse(x + r0 * .16 * look, y + r0 * .1, r0 * .58, r0 * .7, 0, 0, TAU); c.fill();
    c.fillStyle = '#f2f0ec';
    c.beginPath(); c.moveTo(x + r0 * .16 * look, y + r0 * .1);
    c.lineTo(x + r0 * .8 * look, y - r0 * .65); c.lineTo(x + r0 * .95 * look, y - r0 * .18); c.closePath(); c.fill();
  };
  const shoe = (x, y, flip) => {
    c.fillStyle = '#141210';
    c.beginPath(); c.ellipse(x, y, m * .032, m * .018, 0, 0, TAU); c.fill();
    c.fillStyle = '#f2f0ec';
    c.beginPath(); c.ellipse(x - flip * m * .012, y - m * .006, m * .009, m * .005, -.5, 0, TAU); c.fill();
  };
  // 逃跑的方糖
  c.save(); c.translate(sugarX + boil[0], sugarY + boil[1]);
  const sq = run ? 1 + .05 * Math.sin(ph * 2) : 1;
  c.scale(1 / sq, sq);
  c.fillStyle = '#e8e4dc'; c.strokeStyle = '#141210'; c.lineWidth = 4;
  c.beginPath(); c.roundRect(-m * .036, -m * .042, m * .072, m * .084, m * .008); c.fill(); c.stroke();
  c.fillStyle = '#b8b2a8';
  c.beginPath(); c.moveTo(m * .036, -m * .042); c.lineTo(m * .052, -m * .056); c.lineTo(m * .052, m * .028); c.lineTo(m * .036, m * .042); c.closePath(); c.fill(); c.stroke();
  pieEye(-m * .014, -m * .012, m * .011, 1); pieEye(m * .012, -m * .012, m * .011, 1);
  c.strokeStyle = '#141210'; c.lineWidth = 3;
  c.beginPath(); c.arc(0, m * .008, m * .014, .25, Math.PI - .25); c.stroke();
  tube(-m * .036, 0, -m * .062, m * .02 - Math.sin(ph) * m * .02, m * .011, -m * .012);
  tube(m * .05, 0, m * .076, m * .015 + Math.sin(ph) * m * .02, m * .011, m * .012);
  glove(-m * .066, m * .022 - Math.sin(ph) * m * .02, m * .014);
  glove(m * .08, m * .017 + Math.sin(ph) * m * .02, m * .014);
  tube(-m * .014, m * .042, -m * .03 - Math.sin(ph) * m * .03, m * .082, m * .013, -m * .008);
  tube(m * .014, m * .042, m * .03 + Math.sin(ph) * m * .03, m * .082, m * .013, m * .008);
  shoe(-m * .03 - Math.sin(ph) * m * .03, m * .09, -1);
  shoe(m * .03 + Math.sin(ph) * m * .03, m * .09, 1);
  c.restore();
  // 追赶的咖啡杯
  c.save(); c.translate(cupX + boil[0] * .7, cupY + boil[1] * .7);
  const csq = 1 + .05 * Math.cos(ph * 2);
  c.scale(1 / csq, csq);
  c.fillStyle = '#f2f0ec'; c.strokeStyle = '#141210'; c.lineWidth = 5;
  c.beginPath();
  c.moveTo(-m * .055, -m * .05); c.lineTo(m * .055, -m * .05);
  c.lineTo(m * .038, m * .055); c.lineTo(-m * .038, m * .055); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#9a948c';
  c.beginPath(); c.moveTo(m * .028, -m * .05); c.lineTo(m * .055, -m * .05); c.lineTo(m * .038, m * .055); c.lineTo(m * .016, m * .055); c.closePath(); c.fill();
  c.fillStyle = '#f2f0ec';
  c.beginPath(); c.ellipse(m * .068, m * .005, m * .02, m * .028, 0, -Math.PI / 2, Math.PI / 2); c.fill(); c.stroke();
  c.fillStyle = '#141210';
  c.beginPath(); c.ellipse(m * .068, m * .005, m * .011, m * .017, 0, -Math.PI / 2, Math.PI / 2); c.fill();
  pieEye(-m * .022, -m * .02, m * .013, 1); pieEye(m * .014, -m * .02, m * .013, 1);
  c.fillStyle = '#141210';
  c.beginPath(); c.ellipse(-m * .004, m * .016, m * .018, m * .014, 0, 0, TAU); c.fill();
  c.fillStyle = '#f2f0ec';
  c.beginPath(); c.ellipse(-m * .004, m * .022, m * .011, m * .006, 0, 0, TAU); c.fill();
  c.strokeStyle = '#141210'; c.lineWidth = 3.5;
  for (let k = 0; k < 2; k++) {
    c.beginPath();
    c.moveTo(-m * .018 + k * m * .03, -m * .052);
    c.quadraticCurveTo(-m * .03 + k * m * .03 + Math.sin(t * 3 + k) * m * .012, -m * .1, -m * .012 + k * m * .026, -m * .135);
    c.stroke();
  }
  tube(-m * .055, -m * .005, -m * .088, m * .03 - Math.sin(ph) * m * .025, m * .013, -m * .014);
  tube(m * .052, -m * .005, m * .09, m * .022 + Math.sin(ph) * m * .025, m * .013, m * .014);
  glove(-m * .092, m * .032 - Math.sin(ph) * m * .025, m * .016);
  glove(m * .094, m * .032 + Math.sin(ph) * m * .025, m * .016);
  tube(-m * .018, m * .055, -m * .032 + Math.sin(ph) * m * .035, m * .1, m * .015, -m * .008);
  tube(m * .018, m * .055, m * .032 - Math.sin(ph) * m * .035, m * .1, m * .015, m * .008);
  shoe(-m * .032 + Math.sin(ph) * m * .035, m * .108, -1);
  shoe(m * .032 - Math.sin(ph) * m * .035, m * .108, 1);
  c.restore();
  if (run) {
    c.strokeStyle = 'rgba(20,18,16,.5)'; c.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const ly = h * .42 + i * m * .05;
      c.beginPath(); c.moveTo(sugarX - m * .12 - i * m * .01, ly); c.lineTo(sugarX - m * .04 - Math.sin(t * 9 + i) * m * .015, ly); c.stroke();
    }
  }
  c.restore();
  // 胶片损伤
  c.save(); c.beginPath(); c.roundRect(gx0, 0, gw, h, m * .04); c.clip();
  c.fillStyle = `rgba(255,255,255,${.03 + .03 * Math.sin(t * 25)})`;
  c.fillRect(gx0, 0, gw, h);
  const fidx = Math.floor(t * 24);
  for (let i = 0; i < 3; i++) {
    const sc2 = s.dust[fidx % 40][i];
    c.fillStyle = `rgba(255,255,255,${.1 + sc2 * .12})`;
    c.fillRect(gx0 + ((sc2 * 1.7 + i * .37 + t * .01) % 1) * gw, 0, 1.4, h);
  }
  for (let i = 0; i < 5; i++) {
    const d = s.dust[(fidx * 3 + i) % 40];
    c.fillStyle = i % 2 ? 'rgba(30,28,26,.5)' : 'rgba(255,255,255,.4)';
    c.fillRect(gx0 + d[0] * gw, d[1] * h, 2.5, 2.5);
  }
  const vg = c.createRadialGradient(gx0 + gw / 2, h / 2, m * .2, gx0 + gw / 2, h / 2, m * .95);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
  c.fillStyle = vg; c.fillRect(gx0, 0, gw, h);
  c.restore();
  c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2;
  c.beginPath(); c.roundRect(gx0, 0, gw, h, m * .04); c.stroke();
  if (q > 5.2 && q < 7.4) {
    const pw = gw * .46, px2 = gx0 + gw / 2 - pw / 2, py2 = h * .8;
    c.fillStyle = '#141210'; c.fillRect(px2, py2, pw, h * .12);
    c.strokeStyle = '#f2f0ec'; c.lineWidth = 3;
    c.strokeRect(px2 + 8, py2 + 8, pw - 16, h * .12 - 16);
    c.lineWidth = 1.5;
    c.strokeRect(px2 + 14, py2 + 14, pw - 28, h * .12 - 28);
    for (const [dx2, dy2] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
      c.beginPath(); c.arc(px2 + 18 + dx2 * (pw - 36), py2 + 18 + dy2 * (h * .12 - 36), 3.2, 0, TAU); c.fill();
      c.beginPath(); c.arc(px2 + 18 + dx2 * (pw - 36), py2 + 18 + dy2 * (h * .12 - 36), 6, 0, TAU); c.stroke();
    }
    c.fillStyle = '#f2f0ec'; c.font = `${m * .042}px Georgia, serif`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('咖啡追糖记', gx0 + gw / 2, py2 + h * .06);
  }
};


// ---- L46 ----
S.L46 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 8;
  if (!s.init) {
    s.init = 1;
    const r = rng(46001);
    s.bld = [];
    for (let i = 0; i < 12; i++) {
      const wins = [];
      for (let k = 0; k < 10; k++) wins.push([r(), r(), r()]);
      s.bld.push([i * w / 9 + r() * w * .04, w * (.07 + r() * .06), h * (.22 + r() * .38), wins]);
    }
    s.rain = []; for (let i = 0; i < 42; i++) s.rain.push([r(), r(), .6 + r() * .8]);
    s.st = []; for (let i = 0; i < 16; i++) s.st.push([r(), r(), r()]);
    // CRT 叠层缓存（扫描线 + 暗角）
    const [oc, ox] = offscreen(w, h);
    for (let y = 0; y < h; y += 5) { ox.fillStyle = 'rgba(0,0,0,.15)'; ox.fillRect(0, y, w, 2); }
    const vg = ox.createRadialGradient(w / 2, h / 2, m * .3, w / 2, h / 2, m * .9);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(12,4,30,.5)');
    ox.fillStyle = vg; ox.fillRect(0, 0, w, h);
    s.post = oc;
  }
  // 画底：夜空 + 霓虹光晕
  c.fillStyle = vgrad(c, h, '#221A4C', '#5C2E70'); c.fillRect(0, 0, w, h);
  glowDot(c, w * .8, h * .2, m * .45, '#FF4FA3', .3);
  glowDot(c, w * .18, h * .28, m * .38, '#2FD8FF', .22);
  // 远景楼群（缓移）+ 窗灯
  const drift = (t * 6) % (w / 9);
  s.bld.forEach(b => {
    const bx = ((b[0] - drift) % (w * 1.2) + w * 1.2) % (w * 1.2) - w * .1;
    c.fillStyle = '#2A2052'; c.fillRect(bx, h * .72 - b[2], b[1], b[2] + h * .06);
    b[3].forEach(wn => {
      const lit = .5 + .5 * Math.sin(t * .9 + wn[2] * 9);
      c.fillStyle = wn[2] > .75 ? hex('#2FD8FF', .5 * lit) : hex('#FFC94F', .3 + .55 * lit);
      c.fillRect(bx + wn[0] * b[1] * .78 + b[1] * .1, h * .72 - b[2] + wn[1] * b[2] * .82, b[1] * .13, h * .013);
    });
  });
  // 竖版霓虹招牌
  [[.12, '#FF4FA3'], [.88, '#2FD8FF'], [.68, '#FFD24C']].forEach((n, i) => {
    const gl = .55 + .3 * Math.sin(t * 2.2 + i * 2);
    glowDot(c, w * n[0], h * .42, m * .13, n[1], gl * .5);
    c.fillStyle = hex(n[1], .85); c.fillRect(w * n[0] - m * .013, h * .28, m * .026, h * .24);
    c.fillStyle = hex('#FFFFFF', gl); c.fillRect(w * n[0] - m * .005, h * .3, m * .01, h * .2);
  });
  // 湿地面反射
  c.fillStyle = '#1A1438'; c.fillRect(0, h * .72, w, h * .28);
  s.st.forEach((d, i) => {
    c.fillStyle = hex(d[2] > .5 ? '#FF4FA3' : '#2FD8FF', .1 + .1 * Math.sin(t * 1.5 + i));
    c.fillRect(d[0] * w, h * (.74 + d[1] * .22), w * .03, h * .007);
  });
  // 雨（24fps）
  c.strokeStyle = hex('#BFE3FF', .35); c.lineWidth = m * .0022; c.beginPath();
  s.rain.forEach(d => {
    const ry = ((d[1] + t * d[2] * .35) % 1) * h, rx = d[0] * w;
    c.moveTo(rx, ry); c.lineTo(rx - m * .012, ry + m * .05);
  });
  c.stroke();
  // 赛璐璐少女骑车（12fps 步进，硬阴影 + 背光轮辉）
  const tq = Math.floor(t * 12) / 12;
  const bob = Math.sin(tq * 9) * m * .006;
  const cx0 = w * .42, cy0 = h * .62 + bob;
  c.lineWidth = m * .006; c.lineJoin = 'round'; c.strokeStyle = '#3A2B66';
  [-1, 1].forEach(sd => {
    const wx = cx0 + sd * m * .12;
    c.beginPath(); c.arc(wx, cy0 + m * .1, m * .052, 0, TAU); c.stroke();
    const a = tq * 12;
    for (let k = 0; k < 3; k++) {
      const aa = a + k * TAU / 3;
      c.beginPath(); c.moveTo(wx, cy0 + m * .1); c.lineTo(wx + Math.cos(aa) * m * .045, cy0 + m * .1 + Math.sin(aa) * m * .045); c.stroke();
    }
  });
  c.beginPath(); c.moveTo(cx0 - m * .12, cy0 + m * .1); c.lineTo(cx0, cy0 + m * .02); c.lineTo(cx0 + m * .12, cy0 + m * .1); c.stroke();
  c.fillStyle = '#E8506B';
  c.beginPath(); c.moveTo(cx0 - m * .075, cy0 - m * .02); c.quadraticCurveTo(cx0, cy0 - m * .16, cx0 + m * .075, cy0 - m * .02); c.closePath(); c.fill();
  c.fillStyle = '#B03050'; // 硬边阴影月牙
  c.beginPath(); c.moveTo(cx0 + m * .01, cy0 - m * .14); c.quadraticCurveTo(cx0 + m * .08, cy0 - m * .08, cx0 + m * .07, cy0 - m * .015); c.lineTo(cx0 + m * .035, cy0 - m * .02); c.quadraticCurveTo(cx0 + m * .04, cy0 - m * .1, cx0 + m * .01, cy0 - m * .14); c.fill();
  c.strokeStyle = '#FF9ACD'; c.lineWidth = m * .005; // 霓虹轮辉
  c.beginPath(); c.moveTo(cx0 - m * .075, cy0 - m * .02); c.quadraticCurveTo(cx0 - m * .02, cy0 - m * .155, cx0 + m * .02, cy0 - m * .15); c.stroke();
  c.fillStyle = '#F2C8A8'; c.beginPath(); c.arc(cx0, cy0 - m * .19, m * .055, 0, TAU); c.fill();
  c.fillStyle = '#3A2B66'; c.beginPath(); c.arc(cx0, cy0 - m * .2, m * .064, Math.PI * .92, TAU * 1.04); c.fill();
  c.fillStyle = '#8A6BD8'; c.beginPath(); c.ellipse(cx0 - m * .01, cy0 - m * .235, m * .032, m * .011, -.35, 0, TAU); c.fill();
  c.fillStyle = '#F2C94C'; c.fillRect(cx0 - m * .1, cy0 - m * .13, m * .062, m * .05);
  c.strokeStyle = '#3A2B66'; c.lineWidth = m * .0035; c.strokeRect(cx0 - m * .1, cy0 - m * .13, m * .062, m * .05);
  // 光带扫过定格赛璐璐
  const swp = (q / 8) % 1;
  c.save(); c.translate(w * (-.3 + swp * 1.6), 0); c.rotate(-.25);
  c.fillStyle = hex('#FFD9F0', .12); c.fillRect(-w * .06, -h * .2, w * .12, h * 1.4);
  c.restore();
  // 磁带字幕
  const fs = m * .052;
  c.font = `700 ${fs}px ${SANS}`; c.textAlign = 'center';
  c.lineWidth = fs * .18; c.strokeStyle = '#2A1030'; c.lineJoin = 'round';
  c.strokeText('磁带一定要在黎明前送到', w * .5, h * .88);
  c.fillStyle = '#FFE9A8'; c.fillText('磁带一定要在黎明前送到', w * .5, h * .88);
  c.drawImage(s.post, 0, 0, w, h);
};


// ---- L47 ----
S.L47 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 6, seg = Math.floor(q / 2) % 3;
  const pal = [
    ['#7FA893', '#5E8A76', '#E86A5E', '#F2C94C'],
    ['#E85FA0', '#A03A8C', '#9BE84C', '#FFD24C'],
    ['#D8CBA8', '#A89468', '#B89878', '#8A7458'],
  ][seg];
  const bq = Math.floor(t * 12) % 3;
  const J = k => nz(k * 1.3, bq * 2.1, 3.3) * m * .004; // 沸腾线抖动
  // 扁平色带背景（无渐变）
  c.fillStyle = pal[0]; c.fillRect(0, 0, w, h * .52);
  c.fillStyle = pal[1]; c.fillRect(0, h * .52, w, h * .48);
  c.fillStyle = hex('#000000', .18); c.fillRect(0, h * .52, w, h * .03);
  // 传送门：全片唯一发光体
  const px = w * .66, py = h * .4;
  glowDot(c, px, py, m * .3, '#B9FF5C', .35);
  const rot = t * .9;
  c.lineWidth = m * .009; c.strokeStyle = hex('#241033', .95);
  for (let k = 0; k < 3; k++) {
    c.beginPath();
    for (let i = 0; i <= 22; i++) {
      const a = rot + k * TAU / 3 + i * .22, rr = m * (.055 + i * .0042);
      const xx = px + Math.cos(a) * rr + J(i + k * 30), yy = py + Math.sin(a) * rr * .92 + J(i + 70);
      i ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
    }
    c.stroke();
  }
  c.fillStyle = hex('#EAFFC8', .8);
  c.beginPath(); c.ellipse(px, py, m * .048, m * .044, 0, 0, TAU); c.fill();
  for (let k = 0; k < 6; k++) {
    const a = rot * 1.7 + k * TAU / 6, rr = m * (.1 + .02 * Math.sin(t * 2 + k));
    c.fillStyle = '#B9FF5C';
    c.beginPath(); c.arc(px + Math.cos(a) * rr, py + Math.sin(a) * rr * .9, m * .007, 0, TAU); c.fill();
  }
  // 双人组：大白眼 + 小瞳孔 + 弹性嘴
  const guy = (gx, col, mood) => {
    const wob = Math.sin(t * 2 + mood * 2) * m * .004;
    c.fillStyle = col;
    c.beginPath(); c.moveTo(gx - m * .09, h * .88); c.quadraticCurveTo(gx + J(1), h * .56 + wob, gx + m * .09, h * .88); c.closePath(); c.fill();
    c.fillStyle = hex('#000000', .22); // 硬边阴影
    c.beginPath(); c.moveTo(gx + m * .02, h * .62); c.quadraticCurveTo(gx + m * .1, h * .72, gx + m * .09, h * .88); c.lineTo(gx + m * .04, h * .88); c.closePath(); c.fill();
    const hy = h * .5 + wob;
    c.fillStyle = '#F2E2C8'; c.beginPath(); c.arc(gx, hy, m * .085, 0, TAU); c.fill();
    c.strokeStyle = '#241033'; c.lineWidth = m * .008;
    c.beginPath(); c.arc(gx, hy, m * .085 + J(3), 0, TAU); c.stroke();
    [-1, 1].forEach(sd => {
      c.fillStyle = '#FFFFFF';
      c.beginPath(); c.ellipse(gx + sd * m * .032, hy - m * .012, m * .031, m * .036, 0, 0, TAU); c.fill();
      c.strokeStyle = '#241033'; c.lineWidth = m * .006;
      c.beginPath(); c.ellipse(gx + sd * m * .032, hy - m * .012, m * .031, m * .036, 0, 0, TAU); c.stroke();
      const look = Math.sin(t * 1.1 + mood) * m * .01;
      c.fillStyle = '#241033';
      c.beginPath(); c.arc(gx + sd * m * .032 + look, hy - m * .006, m * .0085, 0, TAU); c.fill();
    });
    const mo = (Math.floor(t * 12) % 3) * .5 + .6 + mood * .25;
    c.fillStyle = '#241033';
    c.beginPath(); c.ellipse(gx, hy + m * .042, m * .022 * mo, m * .012 * mo, 0, 0, TAU); c.fill();
  };
  guy(w * .26, pal[2], 0); guy(w * .44, pal[3], 1);
  // 终端标签与字幕
  c.font = `700 ${m * .03}px ${MONO}`; c.textAlign = 'left';
  c.fillStyle = hex('#B9FF5C', .9); c.fillText('WORLD_0' + (seg + 1) + ' >', w * .05, h * .1);
  c.font = `700 ${m * .045}px ${SANS}`; c.textAlign = 'center';
  c.lineWidth = m * .012; c.strokeStyle = '#241033'; c.lineJoin = 'round';
  const cap = ['又是买咖啡的一天', '这宇宙越来越离谱', '……还是回去上班吧'][seg];
  c.strokeText(cap, w * .5, h * .95);
  c.fillStyle = '#FFFFFF'; c.fillText(cap, w * .5, h * .95);
};


// ---- L48 ----
S.L48 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 6;
  const rg = Math.floor(t * 12);
  const jr = rng(48001 + rg * 131);
  const ox = (jr() - .5) * 4 + 3, oy = (jr() - .5) * 4 + 2; // 套色偏移（on twos 抖动）
  const ink = '#2E2A26';
  c.fillStyle = '#F4EBD6'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#E4D2A8'; c.fillRect(0, h * .62, w, h * .38);
  c.strokeStyle = ink; c.lineWidth = m * .004; c.setLineDash([m * .14, m * .05, m * .22, m * .07]);
  c.beginPath(); c.moveTo(0, h * .62); c.lineTo(w, h * .62); c.stroke();
  c.setLineDash([]);
  // 原子太阳光芒（缓转）
  c.save(); c.translate(w * .5, h * .42); c.rotate(t * .12);
  for (let i = 0; i < 22; i++) {
    c.save(); c.rotate(i * TAU / 22);
    c.fillStyle = hex('#E8A33C', .15);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(m * .55, -m * .022); c.lineTo(m * .55, m * .022); c.closePath(); c.fill();
    c.restore();
  }
  c.restore();
  // 产品（全片同一颜色）+ 偏移套色
  c.fillStyle = '#3E8C7E'; c.fillRect(w * .58 + ox, h * .42 + oy, w * .17, h * .2);
  c.strokeStyle = ink; c.lineWidth = m * .0055; c.strokeRect(w * .58, h * .42, w * .17, h * .2);
  c.fillStyle = '#F4EBD6'; c.beginPath(); c.arc(w * .665, h * .52, m * .035, 0, TAU); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(w * .665, h * .52); c.lineTo(w * .665, h * .487); c.stroke();
  c.beginPath(); c.moveTo(w * .665, h * .52); c.lineTo(w * .688, h * .53); c.stroke();
  // 主讲人：躯干是固定画，只有手臂与眼睛动
  c.fillStyle = '#D96C4B'; c.fillRect(w * .18 + ox, h * .46 + oy, w * .12, h * .32);
  c.strokeRect(w * .18, h * .46, w * .12, h * .32);
  c.fillStyle = '#F0D8B8'; c.beginPath(); c.arc(w * .24, h * .38, m * .075, 0, TAU); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(w * .24, h * .38); c.lineTo(w * .252, h * .397); c.stroke();
  const blink = (Math.floor(t * 1.2) % 5 === 0) ? .002 : .012;
  c.fillStyle = ink;
  c.beginPath(); c.ellipse(w * .225, h * .368, m * .007, m * blink, 0, 0, TAU); c.fill();
  c.beginPath(); c.ellipse(w * .253, h * .368, m * .007, m * blink, 0, 0, TAU); c.fill();
  // 手臂动作（预备-动作-收势）
  const at = (q % 3) / 3;
  const ang = lerp(-.55, -.12, eOut(clamp(at * 2.5, 0, 1))) + Math.sin(t * 2) * .025;
  c.save(); c.translate(w * .3, h * .55); c.rotate(ang);
  c.fillStyle = '#D96C4B'; c.fillRect(0, -m * .018, m * .22, m * .036);
  c.strokeRect(0, -m * .018, m * .22, m * .036);
  c.fillStyle = '#F0D8B8'; c.beginPath(); c.arc(m * .235, 0, m * .03, 0, TAU); c.fill(); c.stroke();
  c.restore();
  // 数字圆牌（back-ease 弹入）
  const pop = eBack(clamp((q - .6) / .35, 0, 1));
  if (pop > .01) {
    c.save(); c.translate(w * .46, h * .28); c.scale(pop, pop);
    c.fillStyle = ink; c.beginPath(); c.arc(0, 0, m * .075, 0, TAU); c.fill();
    c.fillStyle = '#F4EBD6'; c.beginPath(); c.arc(-2, -2, m * .062, 0, TAU); c.fill();
    c.fillStyle = ink; c.font = `700 ${m * .07}px ${SANS}`; c.textAlign = 'center'; c.fillText('2', 0, m * .026);
    c.restore();
    c.font = `500 ${m * .026}px ${SANS}`; c.fillStyle = ink;
    c.fillText('STEP 2 OF 3', w * .46, h * .28 + m * .125);
  }
  // 原子星火花
  for (let i = 0; i < 5; i++) {
    const tw = .5 + .5 * Math.sin(t * 1.6 + i * 1.7);
    c.save(); c.translate(w * (.1 + i * .19), h * (.12 + (i % 2) * .09)); c.scale(tw, tw);
    c.fillStyle = '#E8A33C';
    for (let k = 0; k < 4; k++) {
      c.save(); c.rotate(k * Math.PI / 2 + t * .2);
      c.beginPath(); c.moveTo(0, -m * .021); c.quadraticCurveTo(m * .006, 0, 0, m * .021); c.quadraticCurveTo(-m * .006, 0, 0, -m * .021); c.fill();
      c.restore();
    }
    c.restore();
  }
  // 字幕卡（墨线边框 + 偏移色板）
  c.fillStyle = '#E8A33C'; c.fillRect(w * .2 + ox, h * .8 + oy, w * .6, h * .11);
  c.fillStyle = '#F8F0DC'; c.fillRect(w * .2, h * .8, w * .6, h * .11);
  c.strokeRect(w * .2, h * .8, w * .6, h * .11);
  c.font = `600 ${m * .042}px ${SANS}`; c.textAlign = 'center'; c.fillStyle = ink;
  c.fillText('第二步 · 把它推到墙边', w * .5, h * .873);
};


// ---- L49 ----
S.L49 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 8;
  const P = Math.max(3, Math.round(m / 78)); // 像素粒
  const sn = v => Math.round(v / P) * P;
  if (!s.init) {
    s.init = 1;
    const r = rng(49001);
    s.dith = []; for (let i = 0; i < 60; i++) s.dith.push([r(), r()]);
    s.world = []; for (let i = 0; i < 9; i++) s.world.push([r(), .5 + r() * .5, r() > .5]);
  }
  const night = q > 5.2 && q < 7.2;
  // 天空分带 + Bayer 抖动
  const skyTop = night ? '#241C58' : '#3C78D8', skyBot = night ? '#6A3A8C' : '#A8D8F0';
  for (let i = 0; i < 7; i++) {
    c.fillStyle = mixHex(skyTop, skyBot, i / 6);
    c.fillRect(0, sn(i * h * .075), w, sn(h * .08));
  }
  s.dith.forEach(d => {
    c.fillStyle = hex(night ? '#F8E8C8' : '#FFFFFF', .45);
    c.fillRect(sn(d[0] * w), sn(d[1] * h * .5), P, P);
  });
  // 远山（像素多边形）+ 地面
  const scroll = Math.floor(t * 26) * P;
  c.fillStyle = night ? '#2E2A66' : '#5C90C8';
  c.beginPath(); c.moveTo(0, h * .58);
  for (let i = 0; i <= 12; i++) c.lineTo(sn(i * w / 12), sn(h * (.42 + .1 * Math.sin(i * 1.3))));
  c.lineTo(w, h * .58); c.closePath(); c.fill();
  c.fillStyle = night ? '#3A5848' : '#58A048'; c.fillRect(0, sn(h * .58), w, h * .42);
  c.fillStyle = night ? '#2A4438' : '#407838'; c.fillRect(0, sn(h * .665), w, h * .05);
  // 树（滚动视差）
  s.world.forEach(tr => {
    const tx = ((tr[0] * w - scroll * tr[1] * .4) % (w * 1.2) + w * 1.2) % (w * 1.2) - w * .1;
    const ty = sn(h * .58), th2 = sn(m * .1 * tr[1]);
    c.fillStyle = night ? '#20384C' : '#2E6848';
    c.fillRect(sn(tx), ty - th2, P * 3, th2);
    c.fillRect(sn(tx - th2 * (tr[2] ? .4 : .5)), ty - th2 * (tr[2] ? 1.35 : 1.3), sn(th2 * (tr[2] ? 1.1 : 1.2)), sn(th2 * (tr[2] ? .5 : .9)));
  });
  // 勇者精灵（8fps 行走，帽尾是剪影标记）
  const wf = Math.floor(t * 8) % 4, step = [0, P, 0, -P][wf];
  const hx = sn(w * .3), hy = sn(h * .5);
  c.fillStyle = night ? '#182848' : '#283868';
  c.fillRect(hx, hy, P * 8, P * 10);
  c.fillRect(hx + P * 2, hy - P * 6, P * 5, P * 6);
  c.fillRect(hx + P, hy - P * 7, P * 7, P * 2);
  c.fillRect(hx - P * 3, hy - P * 6, P * 4, P * 2);
  c.fillStyle = '#F8D8A8'; c.fillRect(hx + P * 3, hy - P * 4, P * 3, P * 2);
  c.fillStyle = '#181838'; c.fillRect(hx + P * 5, hy - P * 4, P, P);
  c.fillStyle = night ? '#182848' : '#283868';
  c.fillRect(hx + P, hy + P * 10, P * 2, P * 4 + step);
  c.fillRect(hx + P * 5, hy + P * 10, P * 2, P * 4 - step);
  c.fillStyle = '#D84848'; c.fillRect(hx + P * 6, hy + P * 2, P * 4, P * 2);
  // 对话框（16-bit 蓝框 + 打字 + ▼）
  const bx0 = w * .08, by0 = h * .7, bw0 = w * .84, bh0 = h * .24;
  c.fillStyle = '#101028'; c.fillRect(bx0 - P * 2, by0 - P * 2, bw0 + P * 4, bh0 + P * 4);
  c.fillStyle = '#F8F8F8'; c.fillRect(bx0 - P, by0 - P, bw0 + P * 2, bh0 + P * 2);
  c.fillStyle = '#2038A8'; c.fillRect(bx0, by0, bw0, bh0);
  for (let i = 0; i < 12; i++) { c.fillStyle = hex('#4868D8', .7); c.fillRect(sn(bx0 + s.dith[i][0] * bw0), sn(by0 + s.dith[i][1] * bh0), P, P); }
  c.fillStyle = '#F8D8A8'; c.fillRect(bx0 + P * 3, by0 + P * 3, P * 10, P * 10);
  c.fillStyle = '#181838'; c.fillRect(bx0 + P * 3, by0 + P * 2, P * 10, P * 3);
  c.fillRect(bx0 + P * 5, by0 + P * 6, P * 2, P * 2); c.fillRect(bx0 + P * 9, by0 + P * 6, P * 2, P * 2);
  const msg = '勇士在最终之门前存下了档';
  const nch = Math.max(1, Math.floor((q % 2.6) / 2.6 * msg.length));
  c.font = `700 ${P * 4}px ${MONO}`; c.textAlign = 'left'; c.fillStyle = '#F8F8F8';
  c.fillText(msg.slice(0, nch), bx0 + P * 16, by0 + P * 8);
  c.fillStyle = '#A8C8F8'; c.font = `400 ${P * 3}px ${MONO}`;
  c.fillText('冒险记录 · 第 12 章', bx0 + P * 16, by0 + P * 13);
  if (Math.floor(t * 2.5) % 2) {
    c.fillStyle = '#F8F8F8';
    c.fillRect(bx0 + bw0 - P * 6, by0 + bh0 - P * 5, P * 4, P * 2);
    c.fillRect(bx0 + bw0 - P * 5, by0 + bh0 - P * 3, P * 2, P * 2);
  }
  // 顶部状态窗
  c.fillStyle = '#101028'; c.fillRect(w * .06, h * .05, w * .3, h * .09);
  c.fillStyle = '#F8F8F8'; c.font = `700 ${P * 3.5}px ${MONO}`; c.textAlign = 'left';
  c.fillText('LV.12  勇者', w * .075, h * .095);
  for (let i = 0; i < 10; i++) {
    c.fillStyle = i < 7 ? '#E84848' : '#484858';
    c.fillRect(w * .075 + i * P * 3.2, h * .108, P * 2.6, P * 2);
  }
};


// ---- L50 ----
S.L50 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 8;
  if (!s.init) {
    s.init = 1;
    const r = rng(50001);
    s.stars = []; for (let i = 0; i < 36; i++) s.stars.push([r(), r(), r()]);
    s.rain = []; for (let i = 0; i < 34; i++) s.rain.push([r(), r(), .7 + r() * .8]);
    s.tex = []; for (let i = 0; i < 20; i++) s.tex.push([r(), r(), r()]);
  }
  const camX = Math.sin(t * .18) * m * .012, camY = Math.cos(t * .13) * m * .008;
  c.save(); c.translate(camX, camY);
  // 冷调夜空 + 星
  c.fillStyle = vgrad(c, h, '#141C3C', '#2A3A66'); c.fillRect(-m * .03, -m * .03, w + m * .06, h + m * .06);
  s.stars.forEach(st => {
    c.fillStyle = hex('#C8D8FF', .25 + .55 * Math.abs(Math.sin(t * (1 + st[2]) + st[2] * 9)));
    c.fillRect(st[0] * w, st[1] * h * .3, m * .004, m * .004);
  });
  c.fillStyle = '#20263E'; c.fillRect(-m * .03, h * .55, w + m * .06, h * .5);
  // 像素贴图肌理（色阶抖动）
  s.tex.forEach(tx => {
    c.fillStyle = hex('#3A4468', .5);
    c.fillRect(tx[0] * w, h * (.58 + tx[1] * .38), m * .008, m * .004);
  });
  // 房屋（盒体 + 发光窗 + 呼吸灯火）
  const house = (x, y, ww, hh2, roof) => {
    c.fillStyle = hex('#000000', .28); c.fillRect(x + ww * .72, y - hh2, ww * .28, hh2);
    c.fillStyle = '#4A5478'; c.fillRect(x, y - hh2, ww, hh2);
    c.fillStyle = roof;
    c.beginPath(); c.moveTo(x - ww * .08, y - hh2); c.lineTo(x + ww * .5, y - hh2 - m * .07); c.lineTo(x + ww * 1.08, y - hh2); c.closePath(); c.fill();
    for (let k = 0; k < 3; k++) {
      const fl = .7 + .3 * Math.sin(t * 1.3 + x + k * 2);
      c.fillStyle = hex('#FFC96B', .5 + .45 * fl);
      c.fillRect(x + ww * (.12 + k * .28), y - hh2 * .72, ww * .16, hh2 * .3);
      glowDot(c, x + ww * (.2 + k * .28), y - hh2 * .58, m * .05, '#FFB85C', .28 * fl);
    }
  };
  house(w * .1, h * .62, w * .16, h * .3, '#6A4A6E');
  house(w * .62, h * .58, w * .13, h * .22, '#7A5A4E');
  house(w * .82, h * .64, w * .14, h * .26, '#4A5A7E');
  // 路灯 + 长影
  const lampX = w * .42, lampY = h * .6;
  c.fillStyle = '#2A3050'; c.fillRect(lampX - m * .008, lampY - h * .26, m * .016, h * .26);
  c.fillStyle = hex('#FFE0A0', .9); c.fillRect(lampX - m * .02, lampY - h * .28, m * .04, m * .03);
  const flick = .85 + .12 * Math.sin(t * 6.3) + .05 * Math.sin(t * 17.1);
  glowDot(c, lampX, lampY - h * .26, m * .3 * flick, '#FFC978', .5);
  c.fillStyle = hex('#0A0E22', .35);
  c.beginPath(); c.moveTo(lampX, lampY); c.lineTo(lampX - m * .22, h * .88); c.lineTo(lampX + m * .12, h * .88); c.closePath(); c.fill();
  // 提灯小英雄（像素精灵 + selout）
  const wf = Math.floor(t * 8) % 2;
  const px2 = w * .47, py2 = h * .62;
  c.fillStyle = '#10162E';
  c.fillRect(px2 - m * .014, py2 - m * .06, m * .052, m * .088);
  c.fillStyle = '#E8B848'; // 唯一饱和色
  c.fillRect(px2 - m * .01, py2 - m * .056, m * .044, m * .08);
  c.fillStyle = '#10162E';
  c.fillRect(px2, py2 - m * .086, m * .03, m * .03);
  c.fillRect(px2 - m * .008, py2 + m * .028, m * .012, m * .022 + wf * m * .004);
  c.fillRect(px2 + m * .012, py2 + m * .028, m * .012, m * .022 - wf * m * .004);
  glowDot(c, px2 + m * .05, py2 - m * .03, m * .12 * flick, '#FFD9A0', .55);
  // 雨（连续帧）
  c.strokeStyle = hex('#AFC8FF', .3); c.lineWidth = m * .0022; c.beginPath();
  s.rain.forEach(d => {
    const ry = ((d[1] + t * d[2] * .4) % 1) * h, rx = d[0] * w;
    c.moveTo(rx, ry); c.lineTo(rx - m * .012, ry + m * .045);
  });
  c.stroke();
  // 雾带 + 移轴雾化（上下）
  for (let i = 0; i < 3; i++) {
    c.fillStyle = hex('#5A6A96', .1);
    c.fillRect(-m * .03 + Math.sin(t * .2 + i) * m * .02, h * (.5 + i * .1), w + m * .06, h * .06);
  }
  const hz = c.createLinearGradient(0, 0, 0, h * .28);
  hz.addColorStop(0, hex('#1A2448', .8)); hz.addColorStop(1, hex('#1A2448', 0));
  c.fillStyle = hz; c.fillRect(0, 0, w, h * .28);
  const hz2 = c.createLinearGradient(0, h * .7, 0, h);
  hz2.addColorStop(0, hex('#1A2448', 0)); hz2.addColorStop(1, hex('#1A2448', .8));
  c.fillStyle = hz2; c.fillRect(0, h * .7, w, h * .3);
  c.restore();
  // 章节标 + 对话框（打字）
  c.textAlign = 'center'; c.fillStyle = hex('#C8B890', .9);
  c.font = `400 ${m * .03}px Georgia,"Noto Serif SC",serif`;
  c.fillText('第四章 · 灯塔熄灭之夜', w * .5, h * .09);
  const bx = w * .12, by = h * .78, bw = w * .76, bh = h * .16;
  c.fillStyle = hex('#0A0E22', .88); c.fillRect(bx, by, bw, bh);
  c.strokeStyle = '#C8A860'; c.lineWidth = m * .0035; c.strokeRect(bx + m * .008, by + m * .008, bw - m * .016, bh - m * .016);
  c.fillStyle = '#C8A860'; c.fillRect(bx, by - m * .028, m * .12, m * .032);
  c.fillStyle = '#141A2E'; c.font = `700 ${m * .022}px ${SANS}`; c.fillText('小萤', bx + m * .06, by - m * .003);
  const msg = '提着最后一簇火，穿过夜林';
  const nch = Math.max(1, Math.floor((q % 3.4) / 3.4 * msg.length));
  c.fillStyle = '#EDE6D4'; c.font = `italic 400 ${m * .034}px Georgia,"Noto Serif SC",serif`;
  c.fillText(msg.slice(0, nch), w * .5, by + bh * .62);
};


// ---- L51 ----
S.L51 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 8, beat = .5, ph = (t % beat) / beat;
  if (!s.init) {
    s.init = 1;
    const r = rng(51001);
    s.blk = []; for (let i = 0; i < 8; i++) s.blk.push([r(), r(), r()]);
    s.cray = []; for (let i = 0; i < 6; i++) s.cray.push([r(), r(), r()]);
  }
  const inGame = (q >= .4 && q < 2.4) || (q >= 3.2 && q < 5.2);
  // 主舞台：深紫 + 旋转光芒
  c.fillStyle = '#2A0F5C'; c.fillRect(0, 0, w, h);
  const rot = t * (q > 6.2 ? 1.1 : .35);
  c.save(); c.translate(w * .5, h * .45); c.rotate(rot);
  for (let i = 0; i < 12; i++) {
    c.save(); c.rotate(i * TAU / 12);
    c.fillStyle = hex('#FF2E88', .13);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(m * 1.3, -m * .11); c.lineTo(m * 1.3, m * .11); c.closePath(); c.fill();
    c.restore();
  }
  c.restore();
  // 电视机框（粗描边 + 硬阴影）
  const tvx = w * .3, tvy = h * .15, tvw = w * .4, tvh = h * .54;
  c.fillStyle = '#127E82'; c.fillRect(tvx + m * .022, tvy + m * .022, tvw, tvh);
  c.fillStyle = '#FFC928'; c.fillRect(tvx, tvy, tvw, tvh);
  c.strokeStyle = '#1A0A33'; c.lineWidth = m * .013; c.strokeRect(tvx, tvy, tvw, tvh);
  const sx = tvx + m * .032, sy = tvy + m * .038, sw = tvw - m * .064, sh = tvh - m * .13;
  c.fillStyle = '#101028'; c.fillRect(sx, sy, sw, sh);
  if (q >= .4 && q < 2.4) {
    // 像素小游戏：接住方块
    const g1 = (q - .4) / 2;
    s.blk.forEach((b, i) => {
      const byy = sy + ((b[1] + g1 * (.6 + b[2])) % 1) * sh * .82;
      c.fillStyle = ['#FF6A8A', '#FFC928', '#1FD1D1'][i % 3];
      c.fillRect(sx + b[0] * sw * .8 + sw * .1, byy, m * .036, m * .036);
    });
    const bx2 = sx + sw * (.5 + .32 * Math.sin((q - .4) * 3.2));
    c.fillStyle = '#F2F2EE'; c.fillRect(bx2 - m * .05, sy + sh * .86, m * .1, m * .024);
  } else if (q >= 3.2 && q < 5.2) {
    // 蜡笔小游戏：敲中靶心
    const g2 = (q - 3.2) / 2;
    c.strokeStyle = '#F2E8D0'; c.lineWidth = m * .008; c.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const rr = m * (.02 + i * .02);
      c.beginPath();
      for (let k = 0; k <= 12; k++) {
        const a = k / 12 * TAU + i, wob = 1 + s.cray[i][2] * .18 * Math.sin(k * 2 + t * 6);
        const xx = sx + sw / 2 + Math.cos(a) * rr * wob, yy = sy + sh / 2 + Math.sin(a) * rr * wob;
        k ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
      }
      c.stroke();
    }
    const ham = Math.abs(Math.sin(g2 * TAU * 1.5));
    c.strokeStyle = '#E86A4C'; c.lineWidth = m * .014;
    c.beginPath(); c.moveTo(sx + sw * .78, sy + sh * .2 + ham * sh * .25); c.lineTo(sx + sw * .56, sy + sh * .42 + ham * sh * .18); c.stroke();
    c.fillStyle = '#E86A4C'; c.fillRect(sx + sw * .755, sy + sh * .15 + ham * sh * .25, m * .05, m * .032);
  } else {
    c.fillStyle = '#8A8AC8'; c.font = `700 ${m * .036}px ${SANS}`; c.textAlign = 'center';
    c.fillText('准备……', sx + sw / 2, sy + sh / 2);
  }
  // 指令词：砸入 → 缩成角落标签
  [[.4, '接住!'], [3.2, '敲击!'], [6.2, '加速!']].forEach(wd => {
    const dt = q - wd[0];
    if (dt > 0 && dt < 1.5) {
      const pop = eBack(clamp(dt / .18, 0, 1));
      const shr = clamp((dt - 1) / .5, 0, 1);
      const fs = m * .11 * lerp(1, .42, shr);
      c.save();
      c.translate(lerp(w * .5, w * .82, shr), lerp(h * .3, h * .15, shr));
      c.rotate(-.06 + Math.sin(dt * 30) * .012 * (1 - shr));
      c.scale(pop, pop);
      c.font = `900 ${fs}px ${SANS}`; c.textAlign = 'center';
      c.lineWidth = fs * .22; c.strokeStyle = '#1A0A33'; c.lineJoin = 'round';
      c.strokeText(wd[1], 0, 0);
      c.fillStyle = '#FFC928'; c.fillText(wd[1], 0, 0);
      c.restore();
    }
  });
  // 燃线计时器（火花逐拍跳）
  const segT = q < 2.4 ? (q - .4) / 2 : (q - 3.2) / 2;
  const fy = tvy + tvh + h * .05;
  c.strokeStyle = '#F2E2C8'; c.lineWidth = m * .007;
  c.beginPath(); c.moveTo(tvx, fy); c.lineTo(tvx + tvw, fy); c.stroke();
  for (let i = 0; i <= 4; i++) {
    c.fillStyle = '#F2E2C8';
    c.beginPath(); c.arc(tvx + tvw * i / 4, fy, m * .011, 0, TAU); c.fill();
  }
  const sparkX = tvx + tvw * clamp(segT, 0, 1);
  glowDot(c, sparkX, fy, m * .05, '#FFC928', .8);
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(sparkX, fy, m * .011, 0, TAU); c.fill();
  // 命主板 + 关卡徽章
  for (let i = 0; i < 3; i++) {
    c.fillStyle = (q >= 5.2 && i === 2) ? '#5A3A6A' : '#FF2E88';
    c.beginPath(); c.arc(w * .08 + i * m * .06, h * .1, m * .023, 0, TAU); c.fill();
    c.strokeStyle = '#1A0A33'; c.lineWidth = m * .006; c.stroke();
  }
  c.fillStyle = '#1FD1D1';
  c.beginPath(); c.roundRect(w * .06, h * .16, m * .17, m * .06, m * .014); c.fill();
  c.fillStyle = '#1A0A33'; c.font = `700 ${m * .03}px ${SANS}`; c.textAlign = 'center';
  c.fillText('第 3 关', w * .06 + m * .085, h * .16 + m * .042);
  // 主持人（每拍点睛）
  const hop = Math.sin(ph * Math.PI) * m * .02;
  c.fillStyle = '#1FD1D1';
  c.beginPath(); c.moveTo(w * .8, h * .88); c.quadraticCurveTo(w * .85, h * .6 - hop, w * .92, h * .88); c.closePath(); c.fill();
  c.fillStyle = '#FFC928'; c.beginPath(); c.arc(w * .86, h * .57 - hop, m * .055, 0, TAU); c.fill();
  c.fillStyle = '#1A0A33';
  c.beginPath(); c.arc(w * .845, h * .562 - hop, m * .009, 0, TAU); c.fill();
  c.beginPath(); c.arc(w * .878, h * .562 - hop, m * .009, 0, TAU); c.fill();
  // 判定图章
  const stamp = (txt, col, tt) => {
    const pop = eBack(clamp(tt / .2, 0, 1));
    c.save(); c.translate(w * .5, h * .55); c.rotate(-.12); c.scale(pop, pop);
    c.font = `900 ${m * .14}px ${SANS}`; c.textAlign = 'center';
    c.lineWidth = m * .022; c.strokeStyle = '#1A0A33'; c.lineJoin = 'round';
    c.strokeText(txt, 0, 0);
    c.fillStyle = col; c.fillText(txt, 0, 0);
    c.restore();
  };
  if (q > 2.5 && q < 3.15) stamp('✓', '#1FD1D1', q - 2.5);
  if (q > 5.35 && q < 6.15) stamp('✗', '#FF2E88', q - 5.35);
};


// ---- L52 ----
S.L52 = (c, w, h, t, s) => {
  const m = Math.min(w, h), beat = .5, b = t / beat, bi = Math.floor(b), ph = b - bi, q = t % 8;
  const punch = Math.exp(-ph * 7) * (bi % 4 === 0 ? .05 : .018); // 节拍重音
  c.save();
  c.translate(w / 2, h / 2); c.scale(1 + punch, 1 + punch); c.translate(-w / 2, -h / 2);
  // 糖果斜条纹（缓滚）
  c.fillStyle = '#FFB870'; c.fillRect(0, 0, w, h);
  const sh = (t * 12) % (m * .18);
  c.fillStyle = '#FFA85A';
  c.beginPath();
  for (let i = -2; i < 14; i++) {
    const x = i * m * .18 + sh;
    c.moveTo(x, 0); c.lineTo(x + m * .09, 0); c.lineTo(x + m * .09 - h, h); c.lineTo(x - h, h); c.closePath();
  }
  c.fill();
  c.fillStyle = '#E8985A'; c.fillRect(0, h * .78, w, h * .22);
  c.strokeStyle = '#221510'; c.lineWidth = m * .009;
  c.beginPath(); c.moveTo(0, h * .78); c.lineTo(w, h * .78); c.stroke();
  // 豆豆人（拍点弹跳 + 受击挤压）
  const squash = 1 - .16 * Math.exp(-ph * 6);
  const bean = (bx, col, phase) => {
    const hop = Math.abs(Math.sin((b + phase) * Math.PI)) * m * .045;
    c.save(); c.translate(bx, h * .68 - hop); c.scale(1 / squash, squash);
    c.fillStyle = '#221510';
    c.beginPath(); c.ellipse(m * .012, m * .014, m * .07, m * .085, 0, 0, TAU); c.fill();
    c.fillStyle = col;
    c.beginPath(); c.ellipse(0, 0, m * .07, m * .085, 0, 0, TAU); c.fill();
    c.strokeStyle = '#221510'; c.lineWidth = m * .009; c.stroke();
    [-1, 1].forEach(sd => {
      c.fillStyle = '#FFFFFF';
      c.beginPath(); c.ellipse(sd * m * .025, -m * .02, m * .018, m * .024, 0, 0, TAU); c.fill();
      c.fillStyle = '#221510';
      c.beginPath(); c.arc(sd * m * .025, -m * .018, m * .008, 0, TAU); c.fill();
    });
    c.fillStyle = hex('#FFFFFF', .85);
    c.beginPath(); c.ellipse(-m * .032, -m * .032, m * .006, m * .009, -.5, 0, TAU); c.fill();
    const open = (bi + Math.floor(phase * 2)) % 2 === 0;
    c.fillStyle = '#221510';
    c.beginPath(); c.ellipse(0, m * .025, m * .016, open ? m * .018 : m * .006, 0, 0, TAU); c.fill();
    c.strokeStyle = '#221510'; c.lineWidth = m * .012; c.lineCap = 'round';
    [-1, 1].forEach(sd => {
      c.beginPath(); c.moveTo(sd * m * .06, 0);
      c.lineTo(sd * m * (open ? .12 : .1), m * (open ? -.09 : .04));
      c.stroke();
    });
    c.restore();
  };
  bean(w * .26, '#4CB8E8', 0); bean(w * .5, '#E85A4C', .5); bean(w * .74, '#6BC86B', 1);
  // 回合圆卡（back-ease 弹入）
  [[0, '第一回合 · 踩点'], [4, '第二回合 · 接力']].forEach(rd => {
    const dt = q - rd[0];
    if (dt > 0 && dt < 2.2) {
      const pop = eBack(clamp(dt / .3, 0, 1)) * clamp((2.2 - dt) * 2, 0, 1);
      if (pop > .01) {
        c.save(); c.translate(w * .5, h * .2); c.scale(pop, pop);
        c.fillStyle = '#221510';
        c.beginPath(); c.roundRect(-w * .21 + m * .014, -h * .075 + m * .014, w * .42, h * .15, m * .03); c.fill();
        c.fillStyle = '#FFF6E8';
        c.beginPath(); c.roundRect(-w * .21, -h * .075, w * .42, h * .15, m * .03); c.fill();
        c.strokeStyle = '#221510'; c.lineWidth = m * .008; c.stroke();
        c.font = `800 ${m * .05}px ${SANS}`; c.textAlign = 'center'; c.fillStyle = '#221510';
        c.fillText(rd[1], 0, m * .018);
        c.restore();
      }
    }
  });
  // 判定词 + 爆炸星
  if (q > 3 && q < 4) {
    const dt = q - 3, pop = eBack(clamp(dt / .16, 0, 1));
    c.save(); c.translate(w * .5, h * .42); c.rotate(-.08); c.scale(pop, pop);
    c.fillStyle = '#FFC928';
    c.beginPath();
    for (let i = 0; i < 20; i++) {
      const a = i * TAU / 20, rr = (i % 2 ? m * .12 : m * .19) * (1 + dt * .22);
      const xx = Math.cos(a) * rr, yy = Math.sin(a) * rr;
      i ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
    }
    c.closePath(); c.fill();
    c.strokeStyle = '#221510'; c.lineWidth = m * .008; c.stroke();
    c.font = `900 ${m * .09}px ${SANS}`; c.textAlign = 'center';
    c.lineWidth = m * .016; c.strokeStyle = '#221510'; c.lineJoin = 'round';
    c.strokeText('完美!', 0, m * .032);
    c.fillStyle = '#FFFFFF'; c.fillText('完美!', 0, m * .032);
    c.restore();
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8 + .2, rr = m * (.28 + dt * .3);
      c.strokeStyle = hex('#221510', .5); c.lineWidth = m * .006;
      c.beginPath();
      c.moveTo(w * .5 + Math.cos(a) * rr * .8, h * .42 + Math.sin(a) * rr * .8);
      c.lineTo(w * .5 + Math.cos(a) * rr, h * .42 + Math.sin(a) * rr);
      c.stroke();
    }
  }
  c.restore();
};


// ---- L53 ----
S.L53 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 8, fq = Math.floor(t * 24);
  const wr = rng(53001 + fq * 17);
  const weaveX = (wr() - .5) * m * .007 + Math.sin(t * 1.1) * m * .003;
  const weaveY = (wr() - .5) * m * .007;
  // 画房：黑底 + 天鹅绒幕布 + 脚灯
  c.fillStyle = '#0C0A08'; c.fillRect(0, 0, w, h);
  const pw = Math.min(w * .7, h * 4 / 3 * .94), phh = pw * 3 / 4;
  const gx = (w - pw) / 2, gy = (h - phh) / 2;
  [-1, 1].forEach(sd => {
    const cwd = (w - pw) / 2 * .98, cx0 = sd < 0 ? 0 : w - cwd;
    c.fillStyle = vgrad(c, h, '#4A1820', '#240A10'); c.fillRect(cx0, 0, cwd, h);
    for (let i = 0; i < 5; i++) {
      const fx2 = cx0 + cwd * (i + .5) / 5;
      c.strokeStyle = hex('#6A2430', .5); c.lineWidth = m * .008;
      c.beginPath(); c.moveTo(fx2, 0); c.quadraticCurveTo(fx2 + sd * m * .02, h * .5, fx2, h); c.stroke();
    }
    glowDot(c, cx0 + cwd / 2, h * .97, m * .3, '#FFD9A0', .35);
  });
  // 4:3 画芯（门径抖动 + 描画感）
  c.save();
  c.beginPath(); c.roundRect(gx, gy, pw, phh, m * .015); c.clip();
  c.translate(weaveX, weaveY);
  const ink = '#14100C';
  const street = () => {
    c.fillStyle = vgrad(c, phh, '#D8D2C4', '#A89E8C'); c.fillRect(gx - m * .02, gy - m * .02, pw + m * .04, phh + m * .04);
    c.fillStyle = '#6A6254'; c.fillRect(gx + pw * .58, gy + phh * .08, pw * .36, phh * .64);
    c.strokeStyle = ink; c.lineWidth = m * .004;
    for (let i = 0; i < 4; i++) {
      c.beginPath(); c.moveTo(gx + pw * .62, gy + phh * (.16 + i * .13)); c.lineTo(gx + pw * .9, gy + phh * (.16 + i * .13)); c.stroke();
    }
    c.fillStyle = '#8A8272'; c.fillRect(gx - m * .02, gy + phh * .72, pw + m * .04, phh * .3);
    c.strokeStyle = hex('#14100C', .3); c.lineWidth = m * .003;
    for (let i = 0; i < 6; i++) {
      c.beginPath(); c.moveTo(gx + pw * (i / 6), gy + phh * .72); c.lineTo(gx + pw * (i / 6) - pw * .06, gy + phh); c.stroke();
    }
  };
  if (q < 2.9) {
    // 镜头 A：全景追面包（16fps 步态，表情不变）
    street();
    const roll = q / 2.9;
    const bx = gx + pw * (.25 + roll * .42), by = gy + phh * (.72 + .012 * Math.sin(roll * 20));
    c.fillStyle = '#3A3226';
    c.beginPath(); c.arc(bx, by - phh * .05, phh * .055, 0, TAU); c.fill();
    c.save(); c.translate(bx, by - phh * .05); c.rotate(roll * 26);
    c.strokeStyle = '#D8D2C4'; c.lineWidth = m * .005;
    for (let i = 0; i < 3; i++) {
      c.beginPath(); c.moveTo(-phh * .03, (i - 1) * phh * .028); c.lineTo(phh * .03, (i - 1) * phh * .028); c.stroke();
    }
    c.restore();
    const run = Math.floor(t * 16) % 4, legA = [.5, .1, -.5, -.1][run];
    const fx0 = gx + pw * (.16 + roll * .4), fy0 = gy + phh * .72;
    c.strokeStyle = ink; c.lineWidth = m * .014; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(fx0, fy0 - phh * .12); c.lineTo(fx0 + legA * phh * .1, fy0);
    c.moveTo(fx0, fy0 - phh * .12); c.lineTo(fx0 - legA * phh * .1, fy0);
    c.stroke();
    c.fillStyle = '#2A2620';
    c.beginPath(); c.moveTo(fx0 - phh * .05, fy0 - phh * .1); c.quadraticCurveTo(fx0, fy0 - phh * .3, fx0 + phh * .05, fy0 - phh * .1); c.closePath(); c.fill();
    c.fillStyle = '#C8BFA8';
    c.beginPath(); c.arc(fx0, fy0 - phh * .335, phh * .038, 0, TAU); c.fill();
    c.fillStyle = ink;
    c.fillRect(fx0 - phh * .022, fy0 - phh * .35, phh * .012, phh * .008);
    c.fillRect(fx0 + phh * .01, fy0 - phh * .35, phh * .012, phh * .008);
    c.fillRect(fx0 - phh * .038, fy0 - phh * .4, phh * .076, phh * .014);
  } else if (q < 4.6) {
    // 字幕卡（deco 边框）
    c.fillStyle = '#14100C'; c.fillRect(gx - m * .02, gy - m * .02, pw + m * .04, phh + m * .04);
    c.strokeStyle = '#D8D2C4'; c.lineWidth = m * .006;
    c.strokeRect(gx + pw * .08, gy + phh * .12, pw * .84, phh * .76);
    c.lineWidth = m * .0035;
    c.strokeRect(gx + pw * .1, gy + phh * .15, pw * .8, phh * .7);
    for (let i = 0; i < 4; i++) {
      const cxs = gx + pw * (i % 2 ? .87 : .13), cys = gy + phh * (i < 2 ? .19 : .81);
      for (let k = 0; k < 5; k++) {
        c.beginPath(); c.moveTo(cxs, cys);
        c.lineTo(cxs + Math.cos(k * .32 + (i % 2 ? Math.PI : 0)) * m * .05, cys + Math.sin(k * .32 + (i < 2 ? .7 : Math.PI - .7)) * m * .05);
        c.stroke();
      }
    }
    c.fillStyle = '#EDE6D4'; c.textAlign = 'center';
    c.font = `italic 700 ${m * .06}px Georgia,"Noto Serif SC",serif`;
    c.fillText('他追了三条街……', gx + pw / 2, gy + phh * .48);
    c.font = `italic 400 ${m * .032}px Georgia,"Noto Serif SC",serif`;
    c.fillText('而面包自有主意', gx + pw / 2, gy + phh * .62);
  } else {
    // 镜头 B：近失之抓
    street();
    const bx = gx + pw * .46, by = gy + phh * .72;
    c.fillStyle = '#3A3226';
    c.beginPath(); c.arc(bx, by - phh * .05, phh * .055, 0, TAU); c.fill();
    const grab = eOut(clamp((q - 4.6) / 1.2, 0, 1));
    c.fillStyle = '#2A2620';
    c.beginPath();
    c.moveTo(gx + pw * .3, gy + phh * (.2 - grab * .06));
    c.quadraticCurveTo(gx + pw * .5, gy + phh * .12, gx + pw * .56, gy + phh * (.45 + grab * .12));
    c.quadraticCurveTo(gx + pw * .46, gy + phh * .52, gx + pw * .34, gy + phh * .38);
    c.closePath(); c.fill();
    c.fillStyle = '#C8BFA8';
    c.beginPath(); c.arc(bx + pw * .045, by - phh * .045, phh * .045, 0, TAU); c.fill();
    // 半开虹膜（与观众分享）
    const ir = m * (.3 - .06 * Math.sin((q - 4.6) * 2));
    c.fillStyle = '#0C0A08';
    c.beginPath(); c.rect(gx - m * .02, gy - m * .02, pw + m * .04, phh + m * .04);
    c.arc(bx, by - phh * .05, ir, 0, TAU);
    c.fill('evenodd');
  }
  // 印片损伤：闪烁 / 划痕 / 灼斑 / 暗角
  const fl = .9 + wr() * .12;
  c.fillStyle = hex('#FFF8E8', (1 - fl) * 2.2);
  c.fillRect(gx - m * .02, gy - m * .02, pw + m * .04, phh + m * .04);
  for (let i = 0; i < 3; i++) {
    const scx = gx + wr() * pw;
    c.fillStyle = i === 0 ? hex('#FFFFFF', .16) : hex('#141008', .18);
    c.fillRect(scx, gy - m * .02 + wr() * phh * .2, m * .0022, phh * (.3 + wr() * .5));
  }
  const burn = c.createRadialGradient(gx + pw / 2, gy + phh / 2, m * .2, gx + pw / 2, gy + phh / 2, pw * .75);
  burn.addColorStop(0, 'rgba(40,20,10,0)'); burn.addColorStop(1, 'rgba(60,30,10,.5)');
  c.fillStyle = burn; c.fillRect(gx - m * .02, gy - m * .02, pw + m * .04, phh + m * .04);
  c.restore();
  // 虹膜转场
  [2.75, 4.42].forEach((tt, i) => {
    if (q > tt && q < tt + .3) {
      const ir = (1 - (q - tt) / .3) * m * .85;
      c.fillStyle = '#0C0A08';
      c.beginPath(); c.rect(gx, gy, pw, phh);
      c.arc(gx + pw * (i ? .46 : .5), gy + phh * .5, Math.max(.01, ir), 0, TAU);
      c.fill('evenodd');
    }
  });
  c.strokeStyle = '#1C1812'; c.lineWidth = m * .012;
  c.beginPath(); c.roundRect(gx, gy, pw, phh, m * .015); c.stroke();
};


// ---- L54 ----
S.L54 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 8, fq = Math.floor(t * 30);
  if (!s.init) {
    s.init = 1;
    const r = rng(54001);
    s.noise = []; for (let i = 0; i < 24; i++) s.noise.push([r(), r(), r()]);
  }
  const fr = rng(54002 + fq * 31); // 逐帧损伤（确定性）
  // 4:3 画幅 + 手持
  const fw = Math.min(w * .62, h * 4 / 3), fh = fw * 3 / 4;
  const fx = (w - fw) / 2, fy = (h - fh) / 2;
  const hx = Math.sin(t * 1.7) * m * .004 + Math.sin(t * 2.9) * m * .002;
  const hy = Math.sin(t * 1.3 + 1) * m * .005 + Math.sin(t * .27 * TAU) * m * .006;
  c.fillStyle = '#0A0908'; c.fillRect(0, 0, w, h);
  c.save();
  c.beginPath(); c.rect(fx, fy, fw, fh); c.clip();
  c.translate(fx + hx, fy + hy);
  // 一点透视无尽走廊
  const vpx = fw * .5, vpy = fh * .44;
  const hw = k => fw * .58 * k, fyy = k => vpy + fh * .62 * k, cyy = k => vpy - fh * .5 * k;
  c.fillStyle = '#2A2418'; c.fillRect(-m * .02, -m * .02, fw + m * .04, fh + m * .04);
  const segs = [];
  for (let i = 0; i < 8; i++) segs.push(.1 + (((i / 8 + t * .1) % 1)) * 1.1);
  segs.sort((a, b) => a - b);
  segs.forEach((k0, si) => {
    const k1 = k0 + 1.1 / 8;
    // 天花 + 灯盘（少量闪烁/坏灯）
    c.fillStyle = mixHex('#E8E0C8', '#8A8068', Math.min(1, k0));
    c.beginPath(); c.moveTo(vpx - hw(k0), cyy(k0)); c.lineTo(vpx + hw(k0), cyy(k0)); c.lineTo(vpx + hw(k1), cyy(k1)); c.lineTo(vpx - hw(k1), cyy(k1)); c.closePath(); c.fill();
    const flick = si === 5 ? (Math.sin(t * 21) > -.3 ? 1 : .18) : 1;
    c.fillStyle = hex('#FFF8E0', .5 + .5 * flick);
    c.beginPath();
    c.moveTo(vpx - hw(k0) * .32, cyy(k0)); c.lineTo(vpx + hw(k0) * .32, cyy(k0)); c.lineTo(vpx + hw(k1) * .32, cyy(k1)); c.lineTo(vpx - hw(k1) * .32, cyy(k1)); c.closePath(); c.fill();
    glowDot(c, vpx, (cyy(k0) + cyy(k1)) / 2, fw * .05 * k0 + m * .012, '#FFF4D0', .2 * flick);
    // 左右墙：芥末墙纸 + 竖纹 + 地脚潮痕
    [-1, 1].forEach(sd => {
      c.fillStyle = mixHex('#D5BD66', '#7A6438', Math.min(1, k0));
      c.beginPath();
      c.moveTo(vpx + sd * hw(k0), cyy(k0)); c.lineTo(vpx + sd * hw(k0), fyy(k0));
      c.lineTo(vpx + sd * hw(k1), fyy(k1)); c.lineTo(vpx + sd * hw(k1), cyy(k1)); c.closePath(); c.fill();
      c.strokeStyle = hex('#4D3D26', .22); c.lineWidth = m * .0032;
      for (let j = 0; j < 3; j++) {
        const kk = lerp(k0, k1, j / 2), xx = vpx + sd * hw(kk);
        c.beginPath(); c.moveTo(xx, cyy(kk)); c.lineTo(xx, fyy(kk)); c.stroke();
      }
      c.fillStyle = hex('#6A5428', .22);
      c.beginPath();
      c.moveTo(vpx + sd * hw(k0), fyy(k0) - fh * .06 * k0); c.lineTo(vpx + sd * hw(k0), fyy(k0));
      c.lineTo(vpx + sd * hw(k1), fyy(k1)); c.lineTo(vpx + sd * hw(k1), fyy(k1) - fh * .06 * k1);
      c.closePath(); c.fill();
    });
    // 地面（斑驳地毯）
    c.fillStyle = mixHex('#8C763C', '#4A3C1E', Math.min(1, k0));
    c.beginPath();
    c.moveTo(vpx - hw(k0), fyy(k0)); c.lineTo(vpx + hw(k0), fyy(k0)); c.lineTo(vpx + hw(k1), fyy(k1)); c.lineTo(vpx - hw(k1), fyy(k1)); c.closePath(); c.fill();
  });
  // 墙上的员工守则（随行走滑过）
  const dn = ((0.62 - t * .1) % 1 + 1) % 1, kn = .1 + dn * 1.1;
  const nw = fw * .2 * kn, nh = fh * .3 * kn;
  const nx = vpx + hw(kn) - nw * .15, ny = cyy(kn) + (fyy(kn) - cyy(kn)) * .22;
  c.fillStyle = '#E8DFC0';
  c.beginPath();
  c.moveTo(nx, ny); c.lineTo(nx + nw, ny - nh * .12); c.lineTo(nx + nw, ny + nh * .88); c.lineTo(nx, ny + nh); c.closePath(); c.fill();
  c.fillStyle = '#4D3D26';
  for (let i = 0; i < 5; i++) c.fillRect(nx + nw * .12, ny + nh * (.32 + i * .12), nw * (i ? .68 : .5), nh * .05);
  c.font = `700 ${nh * .17}px ${SANS}`; c.textAlign = 'left';
  c.fillText('员工守则', nx + nw * .12, ny + nh * .23);
  // OSD：REC / 时间码 / 电池
  if (Math.floor(t * 1.6) % 2) {
    c.fillStyle = '#FF3B30';
    c.beginPath(); c.arc(fw * .07, fh * .09, m * .012, 0, TAU); c.fill();
  }
  c.fillStyle = '#FFFFFF'; c.font = `700 ${m * .03}px ${MONO}`; c.textAlign = 'left';
  c.fillText('REC', fw * .095, fh * .105);
  const ss2 = String(Math.floor(t) % 60).padStart(2, '0');
  c.fillText('00:07:' + ss2, fw * .05, fh * .93);
  c.strokeStyle = '#FFFFFF'; c.lineWidth = m * .004;
  c.strokeRect(fw * .85, fh * .068, m * .05, m * .024);
  c.fillStyle = '#FFFFFF'; c.fillRect(fw * .852, fh * .072, m * .03, m * .018);
  // CEA-608 字幕
  const caps = ['[日光灯嗡鸣]', '[脚步声渐远]', '[远处传来门响]'];
  const cap = caps[Math.floor(q / 2.6) % 3];
  c.font = `600 ${m * .028}px ${MONO}`; c.textAlign = 'center';
  const cw = cap.length * m * .032;
  c.fillStyle = '#000000'; c.fillRect(fw / 2 - cw / 2, fh * .79, cw + m * .02, m * .05);
  c.fillStyle = '#FFFFFF'; c.fillText(cap, fw / 2, fh * .832);
  // VHS 损伤：噪点 / 磁头切换带 / 撕裂 / 提黑
  s.noise.forEach(d => {
    c.fillStyle = hex(fr() > .5 ? '#FFFFFF' : '#000000', .16 + fr() * .12);
    c.fillRect(d[0] * fw, d[1] * fh, m * .006 + fr() * m * .01, m * .003);
  });
  for (let i = 0; i < 3; i++) {
    c.fillStyle = hex('#C8C8C8', .2);
    c.fillRect(Math.sin(t * 30 + i) * m * .01, fh * (.955 + i * .013), fw, fh * .009);
  }
  if (q > 5 && q < 5.45) {
    for (let i = 0; i < 5; i++) {
      c.fillStyle = hex(fr() > .5 ? '#FFFFFF' : '#101010', .28);
      c.fillRect(-m * .01 + fr() * m * .02, fh * (fr() * .9 + .04), fw, fh * .03 * (0.4 + fr()));
    }
  }
  c.fillStyle = 'rgba(200,210,255,.05)'; c.fillRect(-m * .02, -m * .02, fw + m * .04, fh + m * .04);
  const vg2 = c.createRadialGradient(fw / 2, fh / 2, fh * .3, fw / 2, fh / 2, fh * .85);
  vg2.addColorStop(0, 'rgba(0,0,0,0)'); vg2.addColorStop(1, 'rgba(0,0,0,.45)');
  c.fillStyle = vg2; c.fillRect(-m * .02, -m * .02, fw + m * .04, fh + m * .04);
  c.restore();
};


// ---- L55 ----
S.L55 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 6, tq = Math.floor(t * 12) / 12;
  if (!s.init) {
    s.init = 1;
    const r = rng(55001);
    s.grain = []; for (let i = 0; i < 22; i++) s.grain.push([r(), r(), r()]);
  }
  c.save(); c.translate(Math.sin(t * .35) * m * .012, Math.cos(t * .27) * m * .008); // 微距镜头漂移
  // 木纹桌面 + 柔光箱暖光
  c.fillStyle = vgrad(c, h, '#B8895A', '#8A5E38'); c.fillRect(0, 0, w, h);
  c.strokeStyle = hex('#5E3A20', .22); c.lineWidth = m * .004;
  s.grain.forEach(g => {
    const gy = g[1] * h;
    c.beginPath(); c.moveTo(0, gy);
    c.bezierCurveTo(w * .3, gy + (g[2] - .5) * m * .03, w * .7, gy - (g[2] - .5) * m * .03, w, gy);
    c.stroke();
  });
  glowDot(c, w * .85, h * .12, m * .5, '#FFE8C0', .3);
  // 虚化的实物背景（马克杯 + 绿植）
  c.fillStyle = hex('#6A4A38', .5);
  c.beginPath(); c.roundRect(w * .72, h * .08, w * .18, h * .3, m * .03); c.fill();
  c.beginPath(); c.ellipse(w * .715, h * .23, m * .03, m * .1, 0, 0, TAU); c.fill();
  c.fillStyle = hex('#3E6A3A', .4);
  for (let i = 0; i < 4; i++) {
    c.beginPath();
    c.moveTo(w * .05 + i * w * .045, h * .38);
    c.quadraticCurveTo(w * .01 + i * w * .05, h * .16, w * .11 + i * w * .05, h * .1);
    c.quadraticCurveTo(w * .09 + i * w * .045, h * .24, w * .05 + i * w * .045, h * .38);
    c.fill();
  }
  // 底板（哑光 + 螺柱网格）
  const bpx = w * .1, bpy = h * .72, bpw = w * .66, bph = h * .15;
  c.fillStyle = hex('#000000', .22); c.fillRect(bpx + m * .01, bpy + m * .012, bpw, bph);
  c.fillStyle = '#2E7D4A'; c.fillRect(bpx, bpy, bpw, bph);
  for (let gx = 0; gx < 12; gx++) {
    for (let gy = 0; gy < 2; gy++) {
      const stx = bpx + bpw * (gx + .5) / 12, sty = bpy + bph * (gy + .5) / 2;
      c.fillStyle = '#3E9458'; c.beginPath(); c.ellipse(stx, sty, m * .012, m * .007, 0, 0, TAU); c.fill();
      c.fillStyle = hex('#FFFFFF', .35); c.beginPath(); c.ellipse(stx - m * .003, sty - m * .002, m * .006, m * .0035, 0, 0, TAU); c.fill();
    }
  }
  // 积木砖：光泽 ABS + 方形高光 + 螺柱
  const brick = (x, y, bw, bh, top, side, studs) => {
    c.fillStyle = hex('#000000', .18); c.fillRect(x + m * .006, y + m * .008, bw, bh);
    c.fillStyle = side; c.fillRect(x, y, bw, bh);
    c.fillStyle = top; c.fillRect(x, y - bh * .3, bw, bh * .3);
    c.fillStyle = hex('#000000', .15); c.fillRect(x, y + bh * .8, bw, bh * .2);
    for (let i = 0; i < studs; i++) {
      const sx = x + bw * (i + .5) / studs;
      c.fillStyle = top; c.beginPath(); c.ellipse(sx, y - bh * .3, bw / studs * .3, bh * .12, 0, 0, TAU); c.fill();
      c.fillStyle = hex('#FFFFFF', .5); c.beginPath(); c.ellipse(sx - bw * .02, y - bh * .36, bw / studs * .15, bh * .05, 0, 0, TAU); c.fill();
    }
    c.fillStyle = hex('#FFFFFF', .28);
    c.fillRect(x + bw * .12, y + bh * .12, bw * .34, bh * .18);
  };
  // 塔：底砖 + 飞入拼装（弧线 + 卡扣过冲）
  brick(w * .3, h * .66, w * .13, h * .06, '#E8C840', '#C8A428', 2);
  brick(w * .3, h * .585, w * .13, h * .06, '#D84838', '#B03428', 2);
  for (let k = 0; k < 3; k++) {
    const ft = eBack(clamp((q - .7 - k * .85) / .5, 0, 1));
    const x0 = w * (.02 + k * .33), y0 = -h * .12;
    const x1 = w * .3, y1 = h * (.51 - k * .075);
    const bxp = lerp(x0, x1, ft), byp = lerp(y0, y1, ft) - Math.sin(clamp(ft, 0, 1) * Math.PI) * m * .12;
    brick(bxp, byp, w * .13, h * .06, ['#3E78C8', '#58B858', '#F28038'][k], ['#2E5EA8', '#3E9042', '#C86428'][k], 2);
  }
  // 积木小人（12fps 摆姿势）
  const pose = Math.floor(t * 2) % 4, armA = [-.4, -.95, -1.35, -.95][pose];
  const ax = w * .62, ay = h * .66;
  brick(ax, ay, w * .035, h * .05, '#3E78C8', '#2E5EA8', 1);
  brick(ax + w * .042, ay, w * .035, h * .05, '#3E78C8', '#2E5EA8', 1);
  brick(ax - w * .004, ay - h * .075, w * .085, h * .075, '#E8C840', '#C8A428', 2);
  c.save(); c.translate(ax - w * .004, ay - h * .05); c.rotate(armA);
  brick(0, -h * .012, w * .06, h * .025, '#E8C840', '#C8A428', 1);
  c.restore();
  c.save(); c.translate(ax + w * .085, ay - h * .05); c.rotate(-armA);
  brick(-w * .06, -h * .012, w * .06, h * .025, '#E8C840', '#C8A428', 1);
  c.restore();
  // 头盔（圆砖 + 高光）
  c.fillStyle = '#F2F2EE';
  c.beginPath(); c.arc(ax + w * .04, ay - h * .135, m * .045, 0, TAU); c.fill();
  c.fillStyle = hex('#FFFFFF', .7);
  c.beginPath(); c.ellipse(ax + w * .03, ay - h * .155, m * .018, m * .01, -.5, 0, TAU); c.fill();
  c.fillStyle = '#2A3444';
  c.beginPath(); c.ellipse(ax + w * .04, ay - h * .135, m * .032, m * .026, 0, 0, TAU); c.fill();
  // 积木火焰（半透明片，12fps 抖动）
  for (let i = 0; i < 4; i++) {
    const ftq = Math.floor(tq * 12 + i * 3) % 5;
    c.fillStyle = hex(['#F8A838', '#F8D848', '#E86828'][i % 3], .5);
    c.fillRect(w * .05 + (i % 2) * m * .012, h * (.76 + i * .038) - ftq * h * .006, w * .05 - (i % 2) * m * .018, h * .045);
  }
  // 字幕药丸
  c.fillStyle = hex('#241A10', .85);
  c.beginPath(); c.roundRect(w * .25, h * .88, w * .5, h * .09, m * .022); c.fill();
  c.fillStyle = '#D84838'; c.fillRect(w * .275, h * .905, m * .03, m * .03);
  c.fillStyle = '#F5EEDD'; c.font = `600 ${m * .036}px ${SANS}`; c.textAlign = 'center';
  c.fillText('一块一块，搭出火箭', w * .52, h * .935);
  c.restore();
};


// ---- L56 ----
S.L56 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 7;
  if (!s.init) {
    s.init = 1;
    const r = rng(56001);
    s.fib = []; for (let i = 0; i < 22; i++) s.fib.push([r(), r(), r()]);
  }
  c.save(); c.translate(Math.sin(t * .3) * m * .01, Math.cos(t * .23) * m * .007); // 微距镜头漂移
  // 实木桌面 + 台灯暖光
  c.fillStyle = vgrad(c, h, '#9A6E48', '#6E4A2E'); c.fillRect(0, 0, w, h);
  glowDot(c, w * .18, h * .08, m * .8, '#FFD9A0', .3);
  c.strokeStyle = hex('#4E3018', .18); c.lineWidth = m * .004;
  s.fib.forEach(f => {
    const gy = f[1] * h;
    c.beginPath(); c.moveTo(0, gy);
    c.bezierCurveTo(w * .3, gy + (f[2] - .5) * m * .03, w * .7, gy - (f[2] - .5) * m * .03, w, gy);
    c.stroke();
  });
  // 书本（微透视双页 + 布面封皮 + 书脊阴影）
  const bx = w * .12, by = h * .3, bw = w * .76, bh = h * .52;
  c.fillStyle = hex('#000000', .3); c.fillRect(bx + m * .012, by + m * .015, bw, bh);
  c.fillStyle = '#3A5A8A'; c.fillRect(bx - m * .015, by - m * .012, bw + m * .03, bh + m * .03);
  c.fillStyle = '#F2E8CE';
  c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + bw / 2, by + m * .02); c.lineTo(bx + bw / 2, by + bh); c.lineTo(bx, by + bh - m * .02); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(bx + bw, by); c.lineTo(bx + bw / 2, by + m * .02); c.lineTo(bx + bw / 2, by + bh); c.lineTo(bx + bw, by + bh - m * .02); c.closePath(); c.fill();
  const sg = c.createLinearGradient(bx + bw / 2 - m * .05, 0, bx + bw / 2 + m * .05, 0);
  sg.addColorStop(0, 'rgba(120,90,50,0)'); sg.addColorStop(.5, 'rgba(120,90,50,.35)'); sg.addColorStop(1, 'rgba(120,90,50,0)');
  c.fillStyle = sg; c.fillRect(bx + bw / 2 - m * .05, by, m * .1, bh);
  // 纸片工艺：灰卡边 → 白边 → 彩面 → 棕墨线 → 硬月牙
  const paper = (shapeFn, col) => {
    c.save(); c.translate(m * .008, m * .012); c.fillStyle = '#A89478'; shapeFn(); c.fill(); c.restore();
    c.fillStyle = '#F5EEDD'; shapeFn(); c.fill();
    c.fillStyle = col; shapeFn(); c.fill();
    c.strokeStyle = '#5A4632'; c.lineWidth = m * .0045; shapeFn(); c.stroke();
    c.save(); shapeFn(); c.clip(); c.fillStyle = hex('#000000', .13); c.translate(m * .013, m * .013); shapeFn(); c.fill(); c.restore();
  };
  const rise = t0 => eBack(clamp((q - t0) / .7, 0, 1));
  // 背景板（立起）
  const bd = rise(.2);
  if (bd > .01) {
    c.save(); c.translate(bx + bw * .5, by + bh * .12); c.scale(1, bd);
    paper(() => {
      c.beginPath(); c.moveTo(-bw * .32, 0); c.lineTo(-bw * .27, -h * .21); c.lineTo(bw * .27, -h * .21); c.lineTo(bw * .32, 0); c.closePath();
    }, '#8FC8E8');
    c.restore();
  }
  // 丘陵（后 → 前弹起）
  const hill = (cxr, cyr, wr2, hr2, col, t0) => {
    const k = rise(t0);
    if (k < .01) return;
    c.save(); c.translate(bx + bw * cxr, by + bh * cyr); c.scale(1, k);
    paper(() => {
      c.beginPath(); c.moveTo(-wr2, 0);
      c.quadraticCurveTo(-wr2 * .5, -hr2, 0, -hr2 * .85);
      c.quadraticCurveTo(wr2 * .55, -hr2 * 1.1, wr2, 0);
      c.closePath();
    }, col);
    c.restore();
  };
  hill(.3, .56, w * .17, h * .12, '#7EC86A', .6);
  hill(.7, .54, w * .2, h * .13, '#5AA85A', 1.0);
  // 树（摇曳）
  const tree = (cxr, cyr, sc, t0) => {
    const k = rise(t0);
    if (k < .01) return;
    const sway = Math.sin(t * 1.3 + cxr * 9) * .05;
    c.save(); c.translate(bx + bw * cxr, by + bh * cyr); c.rotate(sway); c.scale(sc, sc * k);
    paper(() => {
      c.beginPath(); c.moveTo(-m * .02, 0); c.lineTo(-m * .014, -m * .05); c.lineTo(m * .014, -m * .05); c.lineTo(m * .02, 0); c.closePath();
    }, '#8A6A42');
    paper(() => {
      c.beginPath();
      c.moveTo(0, -m * .04); c.quadraticCurveTo(-m * .075, -m * .1, -m * .035, -m * .17);
      c.quadraticCurveTo(0, -m * .22, m * .035, -m * .17);
      c.quadraticCurveTo(m * .075, -m * .1, 0, -m * .04);
      c.closePath();
    }, '#4E9A4E');
    c.restore();
  };
  tree(.42, .52, 1, 1.4); tree(.58, .54, .8, 1.7);
  // 太阳拉杆（抽拉机关）
  const sk = rise(2);
  if (sk > .01) {
    c.save(); c.translate(bx + bw * .82, by + bh * .26); c.scale(1, sk);
    c.fillStyle = '#C8A038'; c.fillRect(-m * .007, -m * .02, m * .014, m * .13);
    paper(() => { c.beginPath(); c.arc(0, -m * .06, m * .055, 0, TAU); }, '#F2C24C');
    c.restore();
  }
  // 纸片角色（走路 + 跳 + scale.x 翻面）
  const wt = clamp((q - 2.4) / 2.8, 0, 1);
  const chx = bx + bw * lerp(.12, .8, wt);
  const hop = Math.abs(Math.sin(wt * Math.PI * 6)) * m * .018;
  const flip = wt > .5 ? -1 : 1;
  const blink2 = (Math.floor(t * 1.4) % 6 === 0) ? .2 : 1;
  c.save(); c.translate(chx, by + bh * .52 - hop); c.scale(flip, 1);
  paper(() => {
    c.beginPath();
    c.moveTo(-m * .035, 0); c.quadraticCurveTo(-m * .045, -m * .07, 0, -m * .075);
    c.quadraticCurveTo(m * .045, -m * .07, m * .035, 0); c.closePath();
  }, '#E86A5E');
  paper(() => { c.beginPath(); c.arc(0, -m * .105, m * .038, 0, TAU); }, '#F2D8B8');
  c.fillStyle = '#5A4632';
  c.beginPath(); c.ellipse(-m * .013, -m * .11, m * .006, m * .009 * blink2, 0, 0, TAU); c.fill();
  c.beginPath(); c.ellipse(m * .013, -m * .11, m * .006, m * .009 * blink2, 0, 0, TAU); c.fill();
  c.restore();
  // 吊牌（摆动）
  c.strokeStyle = '#8A7458'; c.lineWidth = m * .003;
  c.beginPath(); c.moveTo(w * .43, 0); c.lineTo(w * .45, h * .08); c.moveTo(w * .57, 0); c.lineTo(w * .55, h * .08); c.stroke();
  c.save(); c.translate(w * .5, h * .12); c.rotate(Math.sin(t * 1.2) * .06);
  paper(() => { c.beginPath(); c.roundRect(-w * .13, -h * .05, w * .26, h * .1, m * .012); }, '#E8D8B0');
  c.fillStyle = '#5A4632'; c.font = `700 ${m * .045}px ${SANS}`; c.textAlign = 'center';
  c.fillText('纸片世界', 0, m * .016);
  c.restore();
  // 字幕药丸
  c.fillStyle = hex('#3A2A18', .85);
  c.beginPath(); c.roundRect(w * .25, h * .87, w * .5, h * .09, m * .02); c.fill();
  c.fillStyle = '#F5EEDD'; c.font = `600 ${m * .038}px ${SANS}`; c.textAlign = 'center';
  c.fillText('翻开一页，世界就立起来', w * .5, h * .928);
  c.restore();
};


// ---- L57 ----
S.L57 = (c, w, h, t, s) => {
  const m = Math.min(w, h), tq = Math.floor(t * 8) / 8; // 延时 8Hz 抽帧
  if (!s.init) {
    s.init = 1;
    const r = rng(57001);
    s.blocks = []; for (let i = 0; i < 16; i++) s.blocks.push([r(), r(), r(), r()]);
    s.cars = []; for (let i = 0; i < 10; i++) s.cars.push([r(), r(), r()]);
    s.peds = []; for (let i = 0; i < 12; i++) s.peds.push([r(), r(), r()]);
    s.clouds = []; for (let i = 0; i < 3; i++) s.clouds.push([r(), r()]);
  }
  // 高饱和模型城（45° 俯视）
  c.fillStyle = '#7BA85C'; c.fillRect(0, 0, w, h);
  // 路网 + 白标线
  [[0, h * .36, w, h * .1], [0, h * .7, w, h * .1], [w * .44, 0, w * .1, h]].forEach(rd => {
    c.fillStyle = '#4A4E58'; c.fillRect(rd[0], rd[1], rd[2], rd[3]);
    c.fillStyle = '#F2F2EE';
    if (rd[2] > rd[3]) { for (let i = 0; i < 12; i++) c.fillRect(rd[0] + w * i / 12, rd[1] + rd[3] * .48, w * .028, m * .007); }
    else { for (let i = 0; i < 8; i++) c.fillRect(rd[0] + rd[2] * .48, rd[1] + h * i / 8, m * .007, h * .032); }
  });
  // 楼群（顶亮 + 蓝调硬影）
  s.blocks.forEach((b, i) => {
    const bx = b[0] * w, by = b[1] * h, bw = w * (.06 + b[2] * .07), bh = h * (.07 + b[3] * .08);
    if ((bx > w * .42 && bx < w * .56) || (by > h * .34 && by < h * .48) || (by > h * .68 && by < h * .82)) return;
    c.fillStyle = hex('#2E3A66', .32); c.fillRect(bx + bw * .2, by + bh * .24, bw, bh);
    c.fillStyle = ['#E8D8B0', '#D8C8A0', '#E8C898', '#F2E2C8'][i % 4]; c.fillRect(bx, by, bw, bh);
    c.fillStyle = hex('#FFFFFF', .5); c.fillRect(bx, by, bw, bh * .16);
    c.fillStyle = '#6A7890';
    for (let k = 0; k < 3; k++) c.fillRect(bx + bw * .12, by + bh * (.32 + k * .2), bw * .76, bh * .09);
  });
  // 树与行人胶囊
  s.peds.forEach((p, i) => {
    const px = p[0] * w, py = p[1] * h;
    if (py > h * .34 && py < h * .48) return;
    if (i < 6) {
      c.fillStyle = hex('#2E4A8A', .3); c.beginPath(); c.arc(px + m * .012, py + m * .012, m * .022, 0, TAU); c.fill();
      c.fillStyle = '#2E7A3E'; c.beginPath(); c.arc(px, py, m * .024, 0, TAU); c.fill();
      c.fillStyle = hex('#8AE86A', .85); c.beginPath(); c.arc(px - m * .008, py - m * .008, m * .012, 0, TAU); c.fill();
    } else {
      const dx = ((p[2] + tq * .06) % 1) * w;
      c.fillStyle = hex('#2E4A8A', .3); c.beginPath(); c.arc(dx + m * .006, py + m * .006, m * .009, 0, TAU); c.fill();
      c.fillStyle = ['#E84838', '#F2C838', '#3E68C8', '#F2F2EE'][i % 4];
      c.beginPath(); c.arc(dx, py, m * .008, 0, TAU); c.fill();
    }
  });
  // 车流（8Hz 阶跃，像上了发条）
  s.cars.forEach((car, i) => {
    const lane = i % 3, speed = .18 + car[2] * .12;
    const cx = lane === 2 ? w * (.46 + (i % 2) * .05) : ((car[0] + tq * speed) % 1) * w;
    const cy = lane === 2 ? ((car[1] + tq * speed) % 1) * h : h * (lane === 0 ? .395 : .73) + (i % 2) * h * .032;
    c.fillStyle = hex('#2E3A66', .3);
    if (lane === 2) c.fillRect(cx + m * .008, cy + m * .008, m * .024, m * .052); else c.fillRect(cx + m * .008, cy + m * .008, m * .052, m * .024);
    c.fillStyle = ['#E84838', '#F2F2EE', '#3E68C8', '#F2C838'][i % 4];
    if (lane === 2) c.fillRect(cx, cy, m * .024, m * .052); else c.fillRect(cx, cy, m * .052, m * .024);
    c.fillStyle = '#2A3040';
    if (lane === 2) c.fillRect(cx, cy + m * .014, m * .024, m * .016); else c.fillRect(cx + m * .014, cy, m * .018, m * .024);
  });
  // 云影扫过模型
  s.clouds.forEach((cl, i) => {
    const cx = ((cl[0] + t * .02 * (i + 1)) % 1.4 - .2) * w;
    c.fillStyle = hex('#3E5A8A', .15);
    c.beginPath(); c.ellipse(cx, h * (.2 + cl[1] * .6), w * .18, h * .12, .3, 0, TAU); c.fill();
  });
  // 移轴模糊带 + 暗角 + 时速牌
  const bandY = h * .48 + Math.sin(t * .1) * h * .05;
  const hz = c.createLinearGradient(0, 0, 0, bandY - h * .15);
  hz.addColorStop(0, hex('#DCEAF2', .8)); hz.addColorStop(1, hex('#DCEAF2', 0));
  c.fillStyle = hz; c.fillRect(0, 0, w, bandY - h * .15);
  const hz2 = c.createLinearGradient(0, bandY + h * .15, 0, h);
  hz2.addColorStop(0, hex('#DCEAF2', 0)); hz2.addColorStop(1, hex('#DCEAF2', .8));
  c.fillStyle = hz2; c.fillRect(0, bandY + h * .15, w, h - bandY - h * .15);
  const vg = c.createRadialGradient(w / 2, h / 2, m * .35, w / 2, h / 2, m * .95);
  vg.addColorStop(0, 'rgba(30,40,80,0)'); vg.addColorStop(1, 'rgba(30,40,80,.35)');
  c.fillStyle = vg; c.fillRect(0, 0, w, h);
  c.fillStyle = '#2A4A2E'; c.fillRect(w * .06, h * .55, w * .17, h * .07);
  c.fillStyle = '#F2F2EE'; c.font = `700 ${m * .022}px ${MONO}`; c.textAlign = 'center';
  c.fillText('×24 TIME-LAPSE', w * .145, h * .593);
};


// ---- L58 ----
S.L58 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 10;
  if (!s.init) {
    s.init = 1;
    const r = rng(58001);
    s.tiles = [];
    for (let i = 0; i < 12; i++) s.tiles.push([Math.floor(r() * 5) - 2, Math.floor(r() * 5) - 2, .5 + r(), r(), r()]);
    s.sea = []; for (let i = 0; i < 22; i++) s.sea.push([r(), r(), r()]);
    s.stars2 = []; for (let i = 0; i < 26; i++) s.stars2.push([r(), r(), r()]);
  }
  // 时间之光：昼 → 暮 → 夜
  const tod = (q / 10 + .12) % 1, night = ss(.55, .82, tod);
  const skyTop = mixHex(mixHex('#BFE3F2', '#F2B88A', ss(.3, .55, tod)), '#20244E', night);
  const skyBot = mixHex(mixHex('#EAF6FB', '#F8D8A8', ss(.3, .55, tod)), '#3A3A6E', night);
  c.fillStyle = vgrad(c, h, skyTop, skyBot); c.fillRect(0, 0, w, h);
  s.stars2.forEach(st => {
    c.fillStyle = hex('#FFFFFF', night * (.25 + .6 * Math.abs(Math.sin(t * (1 + st[2]) + st[2] * 7))));
    c.fillRect(st[0] * w, st[1] * h * .42, m * .0045, m * .0045);
  });
  // 太阳 / 月亮扫过
  const sunA = tod * Math.PI * 1.2 + .2;
  glowDot(c, w * (.5 + Math.cos(sunA) * .42), h * (.2 + Math.sin(sunA) * .12), m * .18, night > .5 ? '#C8D0F2' : '#FFE8A0', .5);
  // 棱面海 + 闪光
  c.fillStyle = mixHex('#7EC8DE', '#26305E', night);
  c.fillRect(0, h * .52, w, h * .48);
  s.sea.forEach(sf => {
    const sx = sf[0] * w, sy = h * (.55 + sf[1] * .42), tw2 = m * .055;
    c.fillStyle = hex('#FFFFFF', .05 + .12 * Math.max(0, Math.sin(t * 1.4 + sf[2] * 9)));
    c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + tw2, sy + tw2 * .28); c.lineTo(sx + tw2 * .4, sy + tw2 * .58); c.closePath(); c.fill();
  });
  // 等距六棱柱小岛（升起带弹跳）
  const tw = m * .13, th = tw * .52, cx0 = w * .5, cy0 = h * .3;
  const proj = (qq, rr) => [cx0 + (qq - rr) * tw / 2, cy0 + (qq + rr) * th / 2];
  const hexPath = (sx, sy, r2) => {
    c.beginPath();
    for (let k = 0; k < 6; k++) {
      const a = k * TAU / 6 + Math.PI / 6;
      const xx = sx + Math.cos(a) * r2, yy = sy + Math.sin(a) * r2 * .52;
      k ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
    }
    c.closePath();
  };
  s.tiles.forEach(tl => {
    const p = proj(tl[0], tl[1]), sx = p[0], sy = p[1];
    const riseT = q - (.5 + tl[4] * 4.5);
    const riseK = riseT < 0 ? 0 : 1 - Math.exp(-riseT * 2.4) * Math.cos(riseT * 5.6);
    const hh = tl[2] * m * .16 * clamp(riseK, 0, 1.3);
    if (hh <= 0) return;
    const grass = mixHex(mixHex('#8AC86A', '#E8A86A', ss(.3, .6, tod)), '#3A4A6E', night);
    c.fillStyle = mixHex(grass, '#16203C', .38); hexPath(sx, sy, tw * .5); c.fill();
    c.fillStyle = mixHex(grass, '#16203C', .55);
    hexPath(sx, sy + th * .22, tw * .5); c.fill();
    c.fillStyle = mixHex(grass, '#FFFFFF', .18); hexPath(sx, sy - hh, tw * .5); c.fill();
    // 升出水面的溅环
    if (riseT > 0 && riseT < 1.2) {
      c.strokeStyle = hex('#FFFFFF', .5 * (1 - riseT / 1.2)); c.lineWidth = m * .004;
      c.beginPath(); c.ellipse(sx, sy + th * .9, tw * (.2 + riseT * .6), th * (.1 + riseT * .3), 0, 0, TAU); c.stroke();
    }
    const y0 = sy - hh;
    if (tl[3] > .62) {
      // 盒子小屋 + 棱柱屋顶
      const bw2 = tw * .2, thq = th * .22, bh2 = m * .055;
      const wall = mixHex(mixHex('#F2E8D8', '#C8785A', tl[3] > .84 ? 1 : 0), '#26305E', night * .6);
      c.fillStyle = mixHex(wall, '#16203C', .45);
      c.beginPath(); c.moveTo(sx - bw2, y0 - bh2); c.lineTo(sx, y0 - bh2 + thq); c.lineTo(sx, y0 + thq); c.lineTo(sx - bw2, y0); c.closePath(); c.fill();
      c.fillStyle = mixHex(wall, '#16203C', .25);
      c.beginPath(); c.moveTo(sx + bw2, y0 - bh2); c.lineTo(sx, y0 - bh2 + thq); c.lineTo(sx, y0 + thq); c.lineTo(sx + bw2, y0); c.closePath(); c.fill();
      c.fillStyle = mixHex(wall, '#FFFFFF', .3);
      c.beginPath(); c.moveTo(sx, y0 - bh2 - thq); c.lineTo(sx + bw2, y0 - bh2); c.lineTo(sx, y0 - bh2 + thq); c.lineTo(sx - bw2, y0 - bh2); c.closePath(); c.fill();
      c.fillStyle = mixHex('#D85848', '#26305E', night * .5);
      c.beginPath(); c.moveTo(sx, y0 - bh2 - thq - m * .03); c.lineTo(sx + bw2 * 1.1, y0 - bh2 - thq * .2); c.lineTo(sx - bw2 * 1.1, y0 - bh2 - thq * .2); c.closePath(); c.fill();
      const lit = night > .35 ? .35 + .55 * Math.abs(Math.sin(t * 1.1 + tl[3] * 8)) : 0;
      if (lit > 0) {
        glowDot(c, sx - bw2 * .5, y0 - bh2 * .45, m * .03, '#FFC978', lit);
        glowDot(c, sx + bw2 * .5, y0 - bh2 * .45, m * .03, '#FFC978', lit * .8);
      }
    } else if (tl[3] > .3) {
      // 锥形树
      c.fillStyle = mixHex('#8A6A42', '#16203C', night * .5);
      c.fillRect(sx - m * .006, y0 - m * .02, m * .012, m * .02);
      c.fillStyle = mixHex('#4E9A5E', '#26305E', night * .55);
      c.beginPath(); c.moveTo(sx, y0 - m * .085); c.lineTo(sx + m * .035, y0 - m * .008); c.lineTo(sx - m * .035, y0 - m * .008); c.closePath(); c.fill();
      c.fillStyle = mixHex('#7EC86A', '#FFFFFF', .12);
      c.beginPath(); c.moveTo(sx, y0 - m * .085); c.lineTo(sx + m * .035, y0 - m * .008); c.lineTo(sx, y0 - m * .008); c.closePath(); c.fill();
    }
  });
  // 飞鸟 + 小船
  for (let i = 0; i < 2; i++) {
    const a = t * .5 + i * Math.PI;
    const bx2 = w * .5 + Math.cos(a) * w * .22, by2 = h * .16 + Math.sin(a * 2) * h * .03;
    c.strokeStyle = mixHex('#4A4A6E', '#FFFFFF', .35); c.lineWidth = m * .005;
    const fl = Math.sin(t * 6 + i) * m * .012;
    c.beginPath(); c.moveTo(bx2 - m * .018, by2); c.quadraticCurveTo(bx2, by2 - fl, bx2 + m * .018, by2); c.stroke();
  }
  const bobY = Math.sin(t * 1.2) * m * .008;
  c.fillStyle = mixHex('#C85838', '#26305E', night * .5);
  c.beginPath(); c.moveTo(w * .82, h * .8 + bobY); c.lineTo(w * .9, h * .8 + bobY); c.lineTo(w * .875, h * .83 + bobY); c.lineTo(w * .835, h * .83 + bobY); c.closePath(); c.fill();
  c.fillStyle = mixHex('#F2E8D8', '#26305E', night * .4);
  c.fillRect(w * .852, h * .76 + bobY, m * .006, m * .035);
  // 字幕（暖白 + 深蓝影 + 方块图标）
  c.textAlign = 'center';
  c.fillStyle = hex('#1A2444', .5); c.font = `500 ${m * .042}px ${SANS}`;
  c.fillText('每落一块，就响一个音', w * .5 + m * .006, h * .92 + m * .006);
  c.fillStyle = '#F8F4E8'; c.fillText('每落一块，就响一个音', w * .5, h * .92);
  c.fillStyle = mixHex('#8AC86A', '#3A4A6E', night);
  c.fillRect(w * .5 - m * .26, h * .9, m * .022, m * .022);
};


// ---- L59 ----
S.L59 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 8;
  if (!s.init) {
    s.init = 1;
    const r = rng(59001);
    s.dust = []; for (let i = 0; i < 22; i++) s.dust.push([r(), r(), r()]);
  }
  // 暗室：黑场 + 径向灰扫
  c.fillStyle = '#08090C'; c.fillRect(0, 0, w, h);
  glowDot(c, w * .5, h * .42, m * .8, '#252A34', .55);
  const ox = w * .5 + Math.sin(t * .12) * m * .02, oy = h * .42 + Math.cos(t * .1) * m * .012;
  // 地板焦散环（R/G/B 半径错位）
  const rr = (t % 2.4) / 2.4;
  [0, 1, 2].forEach(k => {
    c.strokeStyle = hex(['#FF6A6A', '#6AFFB0', '#6AB0FF'][k], .16 * (1 - rr));
    c.lineWidth = m * .004;
    c.beginPath(); c.ellipse(ox + (k - 1) * m * .008, h * .82, m * (.1 + rr * .5), m * (.03 + rr * .14), 0, 0, TAU); c.stroke();
  });
  // 爆炸视图：2.5s 展开 → 5s 合拢急停
  const ex = q < 2.5 ? 0 : q < 5 ? eOut(clamp((q - 2.5) / 1.1, 0, 1)) : 1 - eOut(clamp((q - 5) / .22, 0, 1));
  const drift = Math.sin(t * .4) * m * .006;
  const part = (dx, dy, pr, kind) => {
    c.save();
    c.translate(ox + dx * ex, oy + dy * ex + drift);
    c.rotate(.25 * ex * dx / m);
    if (kind === 0) {
      // 清玻璃环：白细边 + 彩虹厚边（色散只在厚边）
      const g2 = c.createLinearGradient(-pr, -pr, pr, pr);
      ['#FF6A6A', '#FFD24C', '#6AFFB0', '#6AB0FF', '#C86AFF'].forEach((col, k2) => g2.addColorStop(k2 / 4, col));
      c.lineWidth = m * .004; c.strokeStyle = hex('#FFFFFF', .55);
      c.beginPath(); c.ellipse(0, 0, pr, pr * .8, 0, 0, TAU); c.stroke();
      c.lineWidth = m * .012; c.strokeStyle = hex('#FFFFFF', .1);
      c.beginPath(); c.ellipse(0, 0, pr * .93, pr * .74, 0, 0, TAU); c.stroke();
      c.lineWidth = m * .006; c.strokeStyle = g2;
      c.beginPath(); c.ellipse(0, 0, pr * 1.03, pr * .82, 0, Math.PI * .95, Math.PI * 1.65); c.stroke();
    } else if (kind === 1) {
      // 磨砂内核：内藏冷光
      c.fillStyle = hex('#9AA4B4', .45);
      c.beginPath(); c.ellipse(0, 0, pr * .62, pr * .5, 0, 0, TAU); c.fill();
      glowDot(c, 0, 0, pr * .85, '#8FD8FF', .5);
    } else {
      // 金属环
      const g3 = c.createLinearGradient(0, -pr * .6, 0, pr * .6);
      g3.addColorStop(0, '#E8ECF2'); g3.addColorStop(.5, '#66707E'); g3.addColorStop(1, '#C8D0DA');
      c.fillStyle = g3;
      c.beginPath(); c.ellipse(0, 0, pr * .8, pr * .62, 0, 0, TAU); c.fill();
      c.fillStyle = '#14161C';
      c.beginPath(); c.ellipse(0, 0, pr * .6, pr * .44, 0, 0, TAU); c.fill();
    }
    c.restore();
  };
  const pr = m * .17;
  part(0, -m * .16, pr, 2);
  part(0, 0, pr, 0);
  part(0, m * .17, pr, 1);
  // 内部光导：彗尾脉冲沿环行走
  const pulse = (t * .55) % 1;
  for (let i = 0; i < 10; i++) {
    const u = (pulse - i * .03 + 1) % 1, a = u * TAU;
    const gx = ox + Math.cos(a) * pr * .78, gy = oy + Math.sin(a) * pr * .6 + drift;
    c.fillStyle = hex(i === 0 ? '#FFFFFF' : '#8FD8FF', (1 - i / 10) * .8);
    c.beginPath(); c.arc(gx, gy, m * (.012 - i * .0008), 0, TAU); c.fill();
  }
  glowDot(c, ox, oy + drift, m * .12, '#8FD8FF', .3 + .15 * Math.sin(t * 2.2));
  // 条形灯高光（缓慢漂移）
  c.fillStyle = hex('#FFFFFF', .16);
  c.beginPath(); c.roundRect(ox - pr * 1.2 + Math.sin(t * .22) * m * .03, oy - pr * .9, m * .03, pr * 1.7, m * .015); c.fill();
  c.fillStyle = hex('#FFFFFF', .1);
  c.beginPath(); c.roundRect(ox + pr * .8 + Math.sin(t * .19 + 2) * m * .03, oy - pr * .7, m * .016, pr * 1.3, m * .008); c.fill();
  // 尘埃
  s.dust.forEach(d => {
    c.fillStyle = hex('#C8D8FF', .1 + .12 * Math.sin(t + d[2] * 9));
    c.fillRect(d[0] * w, d[1] * h, m * .003, m * .003);
  });
  // 标题（超细宽字距 + 斜向扫光）
  c.textAlign = 'center';
  c.font = `200 ${m * .1}px "Inter Tight", ${SANS}`;
  const gt = (Math.sin(t * .5) * .5 + .5) * w;
  const gl = c.createLinearGradient(gt - m * .2, 0, gt + m * .2, 0);
  gl.addColorStop(0, 'rgba(255,255,255,.75)');
  gl.addColorStop(.5, 'rgba(255,255,255,1)');
  gl.addColorStop(1, 'rgba(255,255,255,.75)');
  c.fillStyle = gl;
  c.fillText('A U R A', w * .5, h * .17);
  c.font = `300 ${m * .024}px ${SANS}`;
  c.fillStyle = hex('#9AA4B4', .9);
  c.fillText('光 在 玻 璃 里 行 走', w * .5, h * .225);
  // 磨砂玻璃字幕条
  const by = h * .84, bh = h * .1;
  c.fillStyle = hex('#C8D4E8', .12);
  c.beginPath(); c.roundRect(w * .22, by, w * .56, bh, m * .02); c.fill();
  c.strokeStyle = hex('#FFFFFF', .25); c.lineWidth = m * .0025;
  c.beginPath(); c.roundRect(w * .22, by, w * .56, bh, m * .02); c.stroke();
  const ac = c.createLinearGradient(w * .22, 0, w * .78, 0);
  ac.addColorStop(0, '#8FD8FF'); ac.addColorStop(1, '#C86AFF');
  c.fillStyle = ac; c.fillRect(w * .22, by, w * .56, m * .004);
  c.fillStyle = '#EAF0F8'; c.font = `300 ${m * .032}px ${SANS}`;
  c.fillText('光在玻璃里行走', w * .5, by + bh * .62);
};


window.S = S;
})();
