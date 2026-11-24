# H10 Creative Mode

- 分类：H 现成版式 · 现成版式
- 长什么样：奶油底，饱和糖果色，Archivo Black 大字

## 风格提示词

奶油底，饱和糖果色，Archivo Black 大字

下面是我们自己写的参考实现：一个绘制函数 S.H10(c, w, h, t, s)，c 是 canvas 的 2D context，w/h 是宽高，t 是秒，s 是给这个函数存状态用的空对象。公共的小工具函数在 ../A-G_代码样片/_公共函数.js 里。

```js
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
```
