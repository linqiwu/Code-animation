# M18 数学/科学讲解（3Blue1Brown 那种）

- 分类：M 动态风格 · 讲解类
- 长什么样：深色背景，公式和图形一点点变形、推导，讲得很清楚。
- 适合：感知科普线，讲原理、讲数据。

## 风格提示词

用 Manim 做一个讲 [概念] 的视频，要通俗易懂，有例子，能引人思考。配音用 edge-tts，中文。

## 补充

### 参考

[用 Manim 讲导数](https://prompt-motion.com/linearuncle-5d2bae)（原提示词就是中文的）

### 配合 skill

S4 Manim skill。


下面是我们自己写的参考实现：一个绘制函数 S.M18(c, w, h, t, s)，c 是 canvas 的 2D context，w/h 是宽高，t 是秒，s 是给这个函数存状态用的空对象。公共的小工具函数在 ../A-G_代码样片/_公共函数.js 里。

```js
S.M18 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 12;
  c.fillStyle = '#0B1020'; c.fillRect(0, 0, w, h);
  const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, m * .8);
  g.addColorStop(0, 'rgba(60,90,180,.18)'); g.addColorStop(1, 'rgba(11,16,32,0)');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  const ox = w * .5, oy = h * .58, R = m * .26;
  // 坐标轴
  c.strokeStyle = 'rgba(160,190,255,.5)'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(ox - R * 1.5, oy); c.lineTo(ox + R * 1.5, oy); c.moveTo(ox, oy - R * 1.3); c.lineTo(ox, oy + R * .5); c.stroke();
  // 正弦波→圆的变形（概念：e^{iθ}）
  const k = (Math.sin(q / 12 * TAU - Math.PI / 2) + 1) / 2;
  c.strokeStyle = '#7FB3FF'; c.lineWidth = 3; c.beginPath();
  for (let i = 0; i <= 120; i++) {
    const th = i / 120 * TAU;
    const x = lerp(ox - R * 1.3 + i / 120 * R * 2.6, ox + Math.cos(th) * R, k);
    const y = lerp(oy - Math.sin(th * 2.2) * R * .5, oy + Math.sin(th) * R, k);
    i ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.stroke();
  // 动点
  const th = q * .9;
  const px = lerp(ox - R * 1.3 + (th % (TAU)) / TAU * R * 2.6, ox + Math.cos(th) * R, k);
  const py = lerp(oy - Math.sin(th * 2.2) * R * .5, oy + Math.sin(th) * R, k);
  glowDot(c, px, py, m * .03, '#FFD866', .9);
  // 公式
  c.fillStyle = '#E8EEFF'; c.font = `500 ${m * .05}px ${MONO}`; c.textAlign = 'center';
  c.fillText('e^(iθ) = cos θ + i sin θ', w * .5, h * .14);
  c.fillStyle = 'rgba(200,215,255,.7)'; c.font = `400 ${m * .028}px ${SANS}`;
  c.fillText('从波形到圆 · 一点点变形讲清楚', w * .5, h * .88);
};
```
