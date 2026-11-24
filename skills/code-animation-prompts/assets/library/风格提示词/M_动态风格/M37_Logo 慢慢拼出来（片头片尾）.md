# M37 Logo 慢慢拼出来（片头片尾）

- 分类：M 动态风格 · 结构和镜头类（用来把不同风格串起来）
- 长什么样：碎片慢慢聚拢，拼成 logo。
- 适合：每期的片头或片尾，做一次以后反复用。

## 风格提示词

做一段慢慢揭示的转场：碎片一点点聚拢，最后拼出你的 logo。

## 补充

### 参考

[Logo 揭示](https://prompt-motion.com/tdinh-me-815acb)


下面是我们自己写的参考实现：一个绘制函数 S.M37(c, w, h, t, s)，c 是 canvas 的 2D context，w/h 是宽高，t 是秒，s 是给这个函数存状态用的空对象。公共的小工具函数在 ../A-G_代码样片/_公共函数.js 里。

```js
S.M37 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 10, f = eOut(clamp(q / 3.2, 0, 1));
  c.fillStyle = '#101418'; c.fillRect(0, 0, w, h);
  if (!s.init) { s.init = 1; const r = rng(53); s.frags = []; for (let i = 0; i < 26; i++) s.frags.push({ a: r() * TAU, d: .5 + r() * .8, rot: r() * TAU, sz: .02 + r() * .035 }); }
  const cx = w / 2, cy = h / 2, R = m * .17;
  // 碎片聚拢拼成六边形 logo
  s.frags.forEach((fg, i) => {
    const ang = i / s.frags.length * TAU;
    const tx = cx + Math.cos(ang) * R * .62, ty = cy + Math.sin(ang) * R * .62;
    const x = lerp(cx + Math.cos(fg.a) * m * .7 * fg.d, tx, f), y = lerp(cy + Math.sin(fg.a) * m * .7 * fg.d, ty, f);
    c.save(); c.translate(x, y); c.rotate(lerp(fg.rot, 0, f));
    c.fillStyle = mixHex('#3E5C8A', '#7FD1AE', f);
    c.fillRect(-m * fg.sz / 2, -m * fg.sz / 2, m * fg.sz, m * fg.sz); c.restore();
  });
  // 中心 logo 形（拼好后亮起）
  if (f > .85) {
    const glow = .5 + .5 * Math.sin(t * 2);
    c.strokeStyle = hex('#7FD1AE', .5 + glow * .4); c.lineWidth = m * .012;
    c.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU - Math.PI / 2; const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); c.stroke();
    c.fillStyle = '#E8E3D6'; c.font = `900 ${m * .09}px ${SANS}`; c.textAlign = 'center'; c.fillText('LOGO', cx, cy + m * .032);
    glowDot(c, cx, cy, m * .3 * glow, '#7FD1AE', .12);
  }
};
```
