# H8 Cobalt Grid

- 分类：H 现成版式 · 现成版式
- 长什么样：羊皮纸加钴蓝网格，Newsreader 标题

## 风格提示词

羊皮纸加钴蓝网格，Newsreader 标题

下面是我们自己写的参考实现：一个绘制函数 S.H8(c, w, h, t, s)，c 是 canvas 的 2D context，w/h 是宽高，t 是秒，s 是给这个函数存状态用的空对象。公共的小工具函数在 ../A-G_代码样片/_公共函数.js 里。

```js
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
```
