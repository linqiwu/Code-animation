# M31 粘土定格 MV

- 分类：M 动态风格 · 情绪和氛围类（感受线最常用）
- 长什么样：粘土小人一帧一帧动，手作感很强。
- 适合：轻松、好玩的段落；你自己的歌也可以做成这种 MV。

## 风格提示词

做一个 [60] 秒的粘土定格动画风格的音乐视频，粘土小人有手指印和手作质感，动作一顿一顿的。顺便写一首适合这个画面的原创歌。

## 补充

### 参考

[粘土风 MV](https://prompt-motion.com/davidshulmanfl-371638)


下面是我们自己写的参考实现：一个绘制函数 S.M31(c, w, h, t, s)，c 是 canvas 的 2D context，w/h 是宽高，t 是秒，s 是给这个函数存状态用的空对象。公共的小工具函数在 ../A-G_代码样片/_公共函数.js 里。

```js
S.M31 = (c, w, h, t, s) => {
  const m = Math.min(w, h), fr = Math.floor(t * 12) / 12; // 12fps 定格
  if (!s.init) { s.init = 1; const r = rng(29); s.tex = []; for (let i = 0; i < 90; i++) s.tex.push([r(), r(), r()]); }
  c.fillStyle = '#F2D9C4'; c.fillRect(0, 0, w, h);
  // 粘土台面
  c.fillStyle = '#D9A084'; c.fillRect(0, h * .68, w, h * .32);
  // 粘土小人（一帧一顿）
  const bob = Math.sin(fr * 6) * m * .02, cx = w * .5, base = h * .68;
  const clay = (x, y, r2, col) => {
    c.fillStyle = col; c.beginPath(); c.arc(x, y, r2, 0, TAU); c.fill();
    // 指印纹理
    s.tex.forEach(tp => { const dx = (tp[0] - .5) * r2 * 1.7, dy = (tp[1] - .5) * r2 * 1.7; if (dx * dx + dy * dy < r2 * r2) { c.fillStyle = hex('#00000018', .5); c.beginPath(); c.arc(x + dx, y + dy, r2 * .08, 0, TAU); c.fill(); } });
  };
  clay(cx, base - m * .22 + bob, m * .11, '#E2725B');   // 头
  clay(cx, base - m * .02 + bob, m * .13, '#C96A50');   // 身
  clay(cx - m * .15, base - m * .06 + bob, m * .055, '#E2725B'); // 手
  clay(cx + m * .15, base - m * .06 + bob, m * .055, '#E2725B');
  // 表情
  c.fillStyle = '#3A241C';
  c.beginPath(); c.arc(cx - m * .04, base - m * .24 + bob, m * .012, 0, TAU); c.fill();
  c.beginPath(); c.arc(cx + m * .04, base - m * .24 + bob, m * .012, 0, TAU); c.fill();
  c.beginPath(); c.arc(cx, base - m * .19 + bob, m * .02, 0, Math.PI); c.stroke();
  // 踩点的心
  const beat = (t * 2) % 1;
  if (beat < .25) { const e = eBack(beat / .25); c.fillStyle = hex('#D94F6B', .8 * (1 - beat * 3)); c.font = `900 ${m * .07 * e}px ${SANS}`; c.textAlign = 'center'; c.fillText('♥', cx + m * .22, base - m * .3); }
};
```
