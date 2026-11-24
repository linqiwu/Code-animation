# H6 Capsule

- 分类：H 现成版式 · 现成版式
- 长什么样：胶囊形状，奶油纸，糖果配色，Bodoni 衬线标题

## 风格提示词

胶囊形状，奶油纸，糖果配色，Bodoni 衬线标题

下面是我们自己写的参考实现：一个绘制函数 S.H6(c, w, h, t, s)，c 是 canvas 的 2D context，w/h 是宽高，t 是秒，s 是给这个函数存状态用的空对象。公共的小工具函数在 ../A-G_代码样片/_公共函数.js 里。

```js
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
```
