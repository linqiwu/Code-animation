# H5 Broadside

- 分类：H 现成版式 · 现成版式
- 长什么样：工业报纸海报，奶油色配墨色，火橙色点缀

## 风格提示词

工业报纸海报，奶油色配墨色，火橙色点缀

下面是我们自己写的参考实现：一个绘制函数 S.H5(c, w, h, t, s)，c 是 canvas 的 2D context，w/h 是宽高，t 是秒，s 是给这个函数存状态用的空对象。公共的小工具函数在 ../A-G_代码样片/_公共函数.js 里。

```js
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
```
