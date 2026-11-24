# H3 Blue Professional

- 分类：H 现成版式 · 现成版式
- 长什么样：羊皮纸底，钴蓝主色，Space Grotesk 标题

## 风格提示词

羊皮纸底，钴蓝主色，Space Grotesk 标题

下面是我们自己写的参考实现：一个绘制函数 S.H3(c, w, h, t, s)，c 是 canvas 的 2D context，w/h 是宽高，t 是秒，s 是给这个函数存状态用的空对象。公共的小工具函数在 ../A-G_代码样片/_公共函数.js 里。

```js
S.H3 = (c, w, h, t, s) => {
  const PAPER = '#F2ECD9', COB = '#2453E0', NAVY = '#16233F';
  const GRO = `"Space Grotesk",${SANS}`;
  const u = Math.min(w / 1920, h / 1080), tm = t % 6;
  c.fillStyle = PAPER; c.fillRect(0, 0, w, h);
  if (!s.tex) s.tex = paperTex(1920, 1080, 1, PAPER, 3);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.drawImage(s.tex, 0, 0, 1920, 1080);
  c.fillStyle = COB; c.fillRect(0, 0, 1920 * eOut(tm / .7), 16);
  const lab = eOut(ss(.4, 1.2, tm));
  c.fillStyle = hex(COB, lab); c.font = `28px ${GRO}`;
  c.fillText('PROFESSIONAL SERIES — Q4 REPORT', 120, 170);
  const t1 = eOut(ss(.7, 1.5, tm)), t2 = eOut(ss(1.0, 1.8, tm));
  c.fillStyle = hex(NAVY, t1); c.font = `600 140px ${GRO}`;
  c.fillText('Blue', 120, 380 + 26 * (1 - t1));
  c.fillStyle = hex(COB, t2); c.fillText('Professional', 120, 530 + 26 * (1 - t2));
  c.fillStyle = hex(COB, t2); c.fillRect(120, 556, 760 * t2, 12);
  c.fillStyle = hex(NAVY, eOut(ss(1.4, 2.2, tm))); c.font = `36px ${GRO}`;
  c.fillText('清晰的层级、克制的配色、可靠的数据。', 120, 640);
  c.fillText('Clear hierarchy · restrained palette · reliable data.', 120, 700);
  const bars = [.45, .72, .58, .92], bw = 110, gap = 60, x0 = 1180, base = 860;
  const ae = eOut(ss(1.2, 1.8, tm));
  c.lineWidth = 3; c.strokeStyle = hex(NAVY, ae);
  c.beginPath(); c.moveTo(x0 - 40, base); c.lineTo(1820, base); c.stroke();
  for (let i = 0; i < 4; i++) {
    const e = eOut(ss(1.4 + i * .18, 2.2 + i * .18, tm)), bh = bars[i] * 380 * e;
    c.fillStyle = i === 3 ? COB : hex(COB, .35 + .25 * i);
    c.fillRect(x0 + i * (bw + gap), base - bh, bw, bh);
    c.fillStyle = hex(NAVY, e); c.font = `24px ${GRO}`;
    c.fillText(['Q1', 'Q2', 'Q3', 'Q4'][i], x0 + i * (bw + gap) + 28, base + 44);
  }
  const ba = eOut(ss(2.4, 3.2, tm));
  if (ba > 0) {
    c.strokeStyle = hex(COB, ba); c.lineWidth = 4;
    c.beginPath(); c.arc(1700, 280, 120, -Math.PI / 2, -Math.PI / 2 + TAU * ba); c.stroke();
    c.fillStyle = hex(NAVY, ba); c.font = `600 34px ${GRO}`; c.textAlign = 'center';
    c.fillText('2026', 1700, 295); c.textAlign = 'left';
  }
  c.restore();
};
```
