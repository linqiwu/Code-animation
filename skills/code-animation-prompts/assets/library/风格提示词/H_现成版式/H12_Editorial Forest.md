# H12 Editorial Forest

- 分类：H 现成版式 · 现成版式
- 长什么样：绿、粉、奶油的杂志配色，衬线标题，细线

## 风格提示词

绿、粉、奶油的杂志配色，衬线标题，细线

下面是我们自己写的参考实现：一个绘制函数 S.H12(c, w, h, t, s)，c 是 canvas 的 2D context，w/h 是宽高，t 是秒，s 是给这个函数存状态用的空对象。公共的小工具函数在 ../A-G_代码样片/_公共函数.js 里。

```js
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
```
