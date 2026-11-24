# H7 Cartesian

- 分类：H 现成版式 · 现成版式
- 长什么样：极简留白，暖羊皮纸，墨色标题，灰褐点缀，细线

## 风格提示词

极简留白，暖羊皮纸，墨色标题，灰褐点缀，细线

下面是我们自己写的参考实现：一个绘制函数 S.H7(c, w, h, t, s)，c 是 canvas 的 2D context，w/h 是宽高，t 是秒，s 是给这个函数存状态用的空对象。公共的小工具函数在 ../A-G_代码样片/_公共函数.js 里。

```js
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
```
