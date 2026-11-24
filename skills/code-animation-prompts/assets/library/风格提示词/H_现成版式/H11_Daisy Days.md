# H11 Daisy Days

- 分类：H 现成版式 · 现成版式
- 长什么样：阳光花园粉彩，3px 炭灰描边，硬投影，圆体字

## 风格提示词

阳光花园粉彩，3px 炭灰描边，硬投影，圆体字

下面是我们自己写的参考实现：一个绘制函数 S.H11(c, w, h, t, s)，c 是 canvas 的 2D context，w/h 是宽高，t 是秒，s 是给这个函数存状态用的空对象。公共的小工具函数在 ../A-G_代码样片/_公共函数.js 里。

```js
S.H11 = (c, w, h, t, s) => {
  const CREAM = '#FDF6E3', CH = '#3A3A3A', PINK = '#F7C8D8', MINT = '#C9E8D2', BUT = '#F9E6A7', YOL = '#F6C445';
  const ROUND = `700 130px "Quicksand","Varela Round",${SANS}`;
  const u = Math.min(w / 1920, h / 1080), tm = t % 7;
  c.fillStyle = CREAM; c.fillRect(0, 0, w, h);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  const card = (x, y, cw, ch, col, e) => {
    if (e <= 0) return;
    c.save(); c.translate(x, y); c.scale(Math.min(1.05, e), Math.min(1.05, e));
    c.fillStyle = CH; c.fillRect(14, 14, cw, ch);
    c.fillStyle = col; c.fillRect(0, 0, cw, ch);
    c.lineWidth = 6; c.strokeStyle = CH; c.strokeRect(0, 0, cw, ch);
    c.restore();
  };
  card(140, 180, 460, 320, PINK, eBack(ss(.2, 1.0, tm)));
  card(140, 580, 460, 320, MINT, eBack(ss(.5, 1.3, tm)));
  card(1360, 180, 420, 720, BUT, eBack(ss(.8, 1.6, tm)));
  const daisy = (x, y, r, rot, e) => {
    if (e <= 0) return;
    c.save(); c.translate(x, y); c.scale(Math.min(1.05, e), Math.min(1.05, e)); c.rotate(rot);
    c.lineWidth = 4; c.strokeStyle = CH;
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU;
      c.fillStyle = '#FFFFFF';
      c.beginPath(); c.ellipse(Math.cos(a) * r * .62, Math.sin(a) * r * .62, r * .42, r * .22, a, 0, TAU); c.fill(); c.stroke();
    }
    c.fillStyle = YOL; c.beginPath(); c.arc(0, 0, r * .3, 0, TAU); c.fill(); c.stroke();
    c.restore();
  };
  daisy(370, 340, 120, t * .35, eBack(ss(1.2, 2.0, tm)));
  daisy(370, 740, 120, -t * .28, eBack(ss(1.5, 2.3, tm)));
  daisy(1570, 380, 150, t * .22, eBack(ss(1.8, 2.6, tm)));
  daisy(1150, 880, 90, -t * .4, eBack(ss(2.0, 2.8, tm)));
  const se = eBack(ss(.6, 1.4, tm));
  if (se > 0) {
    c.save(); c.translate(1180, 130); c.scale(se, se); c.rotate(t * .1);
    c.lineWidth = 5; c.strokeStyle = CH;
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c.beginPath(); c.moveTo(Math.cos(a) * 70, Math.sin(a) * 70); c.lineTo(Math.cos(a) * 105, Math.sin(a) * 105); c.stroke(); }
    c.fillStyle = YOL; c.beginPath(); c.arc(0, 0, 60, 0, TAU); c.fill(); c.stroke();
    c.restore();
  }
  const tt = eBack(ss(2.2, 3.0, tm));
  if (tt > 0) {
    c.save(); c.globalAlpha *= Math.min(1, tt); c.translate(960, 470); c.scale(tt, tt);
    c.font = ROUND; c.textAlign = 'center';
    c.fillStyle = CH; c.fillText('Daisy Days', 12, 12);
    c.fillStyle = '#FFFFFF'; c.fillText('Daisy Days', 0, 0);
    c.lineWidth = 8; c.strokeStyle = CH; c.strokeText('Daisy Days', 0, 0);
    c.fillStyle = CH; c.fillRect(-330, 140, 680, 120);
    c.fillStyle = '#FFFFFF'; c.fillRect(-340, 130, 680, 120);
    c.lineWidth = 6; c.strokeStyle = CH; c.strokeRect(-340, 130, 680, 120);
    c.font = `44px ${SANS}`; c.fillStyle = CH;
    c.fillText('阳光花园 · 粉彩 · 硬投影', 0, 212);
    c.textAlign = 'left';
    c.restore();
  }
  c.restore();
};
```
