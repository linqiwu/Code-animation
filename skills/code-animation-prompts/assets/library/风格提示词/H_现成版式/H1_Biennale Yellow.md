# H1 Biennale Yellow

- 分类：H 现成版式 · 现成版式
- 长什么样：暖羊皮纸底，太阳黄光晕，衬线大标题，靛蓝墨色，细线

## 风格提示词

> 这一条的提示词是重新写过的详细版：画面规则、颜色、时间轴都写死了，DeepSeek 和 Opus 5.5 都能直接用。{{ }} 里是要你自己填的内容。

你是一位前端动效工程师。请写**一个完整的 index.html 文件**：只用原生 HTML + JavaScript + Canvas，不要任何外部库、字体文件或图片。做一张"艺术双年展杂志封面"风格的动画标题卡。

## 内容

- 大标题（两行）：{{第一行，例：Biennale}} / {{第二行，例：Yellow}}（第二行用斜体）
- 页眉左：{{例：THE TWELFTH BIENNALE · EDITORIAL SERIES}}；页眉右：{{例：N° 01}}
- 页脚左（中文）：{{一句话说明}}；页脚右：{{编号}}
- 总时长：{{秒，默认 6}}

## 输出要求（必须照做）

1. 只输出一个 html 代码块，不要解释。代码必须完整可运行：不要用省略号，不要写"其余同上""此处略"。
2. canvas 固定 1920×1080，用 CSS 等比缩放居中，多出来的部分是黑边。
3. 所有画面由函数 `draw(t)` 决定（`t` 是秒）。不要用 `Math.random`；纸纹用带种子的 mulberry32(seed)。
4. 默认循环；空格暂停/继续；网址带 `?t=3` 时只显示第 3 秒那一帧。

## 颜色和线（只准用这些）

- 底色 paper = #F2E9D2；加纸纹：5000 个 1–3px 的小方点，一半 #8C7A55、一半 #FFFAF0，透明度 0.045–0.095。纸纹只画一次，缓存到离屏 canvas。
- 唯一的强调色 sun = #F6C23E。
- 字和所有线都用 ink = #1D2A68，线宽 1.6–1.8px。

## 字体

`font-family: Georgia, "Times New Roman", "Noto Serif SC", "Songti SC", serif`。全片只用衬线体。大标题约 214px，`letterSpacing = '-4px'`；页眉 26px，大写，`letterSpacing = '6px'`；页脚中文 34px。（canvas 的 `ctx.letterSpacing` 在新版浏览器里可用；不支持就逐字绘制。）

## 版面（坐标按 1920×1080）

1. 外框：`strokeRect(64, 64, 1792, 952)`；再画两道横线：y=148 和 y=932，从 x=64 到 x=1856。
2. 太阳，圆心 (1380, 470)：
   - 光晕：径向渐变，半径 20→560，从 `rgba(246,194,62,1)` 到 `rgba(246,194,62,0.92)`（38% 处），再到 `rgba(246,214,120,0.35)`（70% 处），到 `rgba(246,214,120,0)`（100%）；
   - 实心圆：半径 250，颜色 sun；
   - 三道同心细圈：半径 250、330、410（ink，透明度 0.9、0.45、0.45）；
   - 刻度环：半径 410 到 421（每 5 条一条长的，到 432），一共 120 条，ink，透明度 0.85。
3. 大标题：左边 x=100，第一行基线 y=560，第二行（斜体）基线 y=770。注意标题的右端不要碰到刻度环（最左端约 x=948）。
4. 页眉两行小字基线 y=118（左 x=104，右 x=1650）；页脚中文基线 y=980（左 x=104），编号右对齐到 x=1816。

## 动起来

- 0–0.8 秒：外框和两道横线从四角向中间"画出来"（用 `setLineDash` 或按进度截取）；
- 0.4–1.8 秒：太阳从下方 300px 处升到位（ease-out），光晕透明度 0→1；
- 1.0–2.4 秒：标题两行依次从下方 24px 处淡入，字距从 +20px 收到 −4px；
- 2.0–2.8 秒：页眉页脚淡入；刻度环以每秒 1° 顺时针慢转；
- 结尾 0.5 秒：整体淡出到纸色，然后循环。

## 不要

渐变色块、阴影、圆角卡片、第二种强调色、无衬线大标题、发光、粒子。

## 写完后自己过一遍（不要输出）

- 全片是否只有 sun 一个强调色？
- 标题是否碰到了刻度环？
- 同一个 `t` 刷新两次，画面是否一模一样？

下面是我们自己写的参考实现：一个绘制函数 S.H1(c, w, h, t, s)，c 是 canvas 的 2D context，w/h 是宽高，t 是秒，s 是给这个函数存状态用的空对象。公共的小工具函数在 ../A-G_代码样片/_公共函数.js 里。

```js
S.H1 = (c, w, h, t, s) => {
  const P = '#F2E9D2', SUN = '#F6C23E', INK = '#1D2A68';
  const SERIF = 'Georgia,"Times New Roman","Noto Serif SC","Songti SC",serif';
  const u = Math.min(w / 1920, h / 1080), tm = t % 6.5;
  c.fillStyle = P; c.fillRect(0, 0, w, h);
  if (!s.tex) s.tex = paperTex(1920, 1080, 1, P, 2026);
  c.save(); c.translate((w - 1920 * u) / 2, (h - 1080 * u) / 2); c.scale(u, u);
  c.drawImage(s.tex, 0, 0, 1920, 1080);
  c.globalAlpha = 1 - ss(6.0, 6.5, tm);
  const fr = eOut(tm / .8);
  c.strokeStyle = INK; c.lineWidth = 1.8; c.setLineDash([5200 * fr, 5200]); c.strokeRect(64, 64, 1792, 952); c.setLineDash([]);
  c.lineWidth = 1.6;
  for (const y of [148, 932]) { c.beginPath(); c.moveTo(64, y); c.lineTo(64 + 1792 * fr, y); c.stroke(); }
  const sy = lerp(770, 470, eOut(ss(.4, 1.8, tm))), ha = eOut(ss(.4, 1.8, tm));
  const g = c.createRadialGradient(1380, sy, 20, 1380, sy, 560);
  g.addColorStop(0, hex(SUN, ha)); g.addColorStop(.38, hex(SUN, .92 * ha));
  g.addColorStop(.7, `rgba(246,214,120,${.35 * ha})`); g.addColorStop(1, 'rgba(246,214,120,0)');
  c.fillStyle = g; c.beginPath(); c.arc(1380, sy, 560, 0, TAU); c.fill();
  c.fillStyle = hex(SUN, ha); c.beginPath(); c.arc(1380, sy, 250, 0, TAU); c.fill();
  c.lineWidth = 1.7;
  for (const [r, a] of [[250, .9], [330, .45], [410, .45]]) { c.strokeStyle = hex(INK, a * ha); c.beginPath(); c.arc(1380, sy, r, 0, TAU); c.stroke(); }
  const rot = t * Math.PI / 180;
  c.strokeStyle = hex(INK, .85 * ha);
  for (let i = 0; i < 120; i++) { const a = rot + i / 120 * TAU, r2 = i % 5 ? 421 : 432; c.beginPath(); c.moveTo(1380 + Math.cos(a) * 410, sy + Math.sin(a) * 410); c.lineTo(1380 + Math.cos(a) * r2, sy + Math.sin(a) * r2); c.stroke(); }
  const t1 = eOut(ss(1.0, 1.9, tm)), t2 = eOut(ss(1.3, 2.4, tm));
  c.fillStyle = hex(INK, t1); c.font = `214px ${SERIF}`; c.letterSpacing = '-4px';
  c.fillText('Biennale', 100, 560 + 24 * (1 - t1));
  c.fillStyle = hex(INK, t2); c.font = `italic 214px ${SERIF}`;
  c.fillText('Yellow', 100, 770 + 24 * (1 - t2));
  const hd = eOut(ss(2.0, 2.8, tm));
  c.fillStyle = hex(INK, hd); c.font = `26px ${SERIF}`; c.letterSpacing = '6px';
  c.fillText('THE TWELFTH BIENNALE · EDITORIAL SERIES', 104, 118);
  c.fillText('N° 01', 1650, 118);
  c.letterSpacing = '0px';
  c.font = `34px ${SERIF}`; c.fillText('示例页脚：把想法排成版面', 104, 980);
  c.textAlign = 'right'; c.fillText('NO. 012', 1816, 980); c.textAlign = 'left';
  c.restore();
};
```
