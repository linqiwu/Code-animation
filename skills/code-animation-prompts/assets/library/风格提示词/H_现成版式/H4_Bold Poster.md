# H4 Bold Poster

- 分类：H 现成版式 · 现成版式
- 长什么样：倾斜的花体大字，奶油底红色强调，杂志封面感

## 风格提示词

倾斜的花体大字，奶油底红色强调，杂志封面感

下面是我们自己写的参考实现：一个绘制函数 S.H4(c, w, h, t, s)，c 是 canvas 的 2D context，w/h 是宽高，t 是秒，s 是给这个函数存状态用的空对象。公共的小工具函数在 ../A-G_代码样片/_公共函数.js 里。

```js
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
```
