# H2 BlockFrame

- 分类：H 现成版式 · 现成版式
- 长什么样：新粗野主义，粗黑边框，硬投影，糖果色点缀

## 风格提示词

新粗野主义，粗黑边框，硬投影，糖果色点缀

下面是我们自己写的参考实现：一个绘制函数 S.H2(c, w, h, t, s)，c 是 canvas 的 2D context，w/h 是宽高，t 是秒，s 是给这个函数存状态用的空对象。公共的小工具函数在 ../A-G_代码样片/_公共函数.js 里。

```js
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
```
