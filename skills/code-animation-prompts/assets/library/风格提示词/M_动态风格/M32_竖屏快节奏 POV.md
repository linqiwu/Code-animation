# M32 竖屏快节奏 POV

- 分类：M 动态风格 · 节奏和快剪类
- 长什么样：竖屏，节奏很快、很碎，第一人称视角，动作和音效都很满。
- 适合：竖屏版的开头 3 秒，抓住人。

## 风格提示词

竖屏 9:16，快节奏碎剪，第一人称视角，讲 [主题]，动作和音效都要做得很好，加一点你自己的性格。

## 补充

### 参考

[AI 视角的快剪](https://prompt-motion.com/kloss-xyz-15182a)


下面是我们自己写的参考实现：一个绘制函数 S.M32(c, w, h, t, s)，c 是 canvas 的 2D context，w/h 是宽高，t 是秒，s 是给这个函数存状态用的空对象。公共的小工具函数在 ../A-G_代码样片/_公共函数.js 里。

```js
S.M32 = (c, w, h, t, s) => {
  const m = Math.min(w, h);
  // 竖屏 9:16 快节奏 POV（内容画在中间竖条里）
  const pw = Math.min(w * .92, h * 9 / 16 * .92), phh = pw * 16 / 9;
  c.fillStyle = '#0B0B0E'; c.fillRect(0, 0, w, h);
  c.save(); c.beginPath(); c.rect(w / 2 - pw / 2, h / 2 - phh / 2, pw, phh); c.clip();
  const shot = Math.floor(t * 2) % 4, f = (t * 2) % 1, z = 1 + .12 * (1 - f); // 每0.5s一刀，刀刀推近
  c.save(); c.translate(w / 2, h / 2); c.scale(z, z); c.translate(-w / 2, -h / 2);
  const bx = w / 2 - pw / 2, by = h / 2 - phh / 2;
  if (shot === 0) { c.fillStyle = '#FF6B35'; c.fillRect(bx, by, pw, phh); c.fillStyle = '#fff'; c.font = `900 ${pw * .12}px ${SANS}`; c.textAlign = 'center'; c.fillText('出发!', w / 2, h / 2); }
  else if (shot === 1) { c.fillStyle = '#12263A'; c.fillRect(bx, by, pw, phh); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = pw * .012; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t * 6; c.beginPath(); c.moveTo(w / 2, h / 2); c.lineTo(w / 2 + Math.cos(a) * pw, h / 2 + Math.sin(a) * pw); c.stroke(); } }
  else if (shot === 2) { c.fillStyle = '#F5EFE0'; c.fillRect(bx, by, pw, phh); c.fillStyle = '#0B0B0E'; c.font = `900 ${pw * .1}px ${SANS}`; c.textAlign = 'center'; c.fillText('跟上节奏', w / 2, h / 2); }
  else { c.fillStyle = '#241528'; c.fillRect(bx, by, pw, phh); c.fillStyle = '#FFD866'; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t * 2; c.fillRect(w / 2 + Math.cos(a) * pw * .3 - pw * .03, h / 2 + Math.sin(a) * pw * .3 - pw * .03, pw * .06, pw * .06); } }
  c.restore();
  // POV 手
  c.fillStyle = '#E8B088'; c.beginPath(); c.ellipse(w / 2, h / 2 + phh * .42, pw * .16, pw * .1, 0, 0, TAU); c.fill();
  c.restore();
  // 画幅说明
  c.fillStyle = 'rgba(255,255,255,.35)'; c.font = `400 ${m * .022}px ${MONO}`; c.textAlign = 'center';
  c.fillText('9:16 · 快切 · POV', w / 2, h * .96);
};
```
