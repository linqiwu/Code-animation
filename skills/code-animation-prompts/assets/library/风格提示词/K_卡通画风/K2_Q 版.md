# K2 Q 版

- 分类：K 卡通画风 · 适合做"我"的
- 长什么样：大头小身子，短手短脚，大眼睛，颜色软

## 风格提示词

Q 版，大头小身，短四肢，大眼睛，柔和配色 / chibi, big head small body, pastel

下面是我们自己写的参考实现：一个绘制函数 S.K2(c, w, h, t, s)，c 是 canvas 的 2D context，w/h 是宽高，t 是秒，s 是给这个函数存状态用的空对象。公共的小工具函数在 ../A-G_代码样片/_公共函数.js 里。

```js
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
```
