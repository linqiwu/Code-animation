# H9 Coral

- 分类：H 现成版式 · 现成版式
- 长什么样：全大写 Bebas Neue 标题，奶油底珊瑚色

## 风格提示词

全大写 Bebas Neue 标题，奶油底珊瑚色

下面是我们自己写的参考实现：一个绘制函数 S.H9(c, w, h, t, s)，c 是 canvas 的 2D context，w/h 是宽高，t 是秒，s 是给这个函数存状态用的空对象。公共的小工具函数在 ../A-G_代码样片/_公共函数.js 里。

```js
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
```
