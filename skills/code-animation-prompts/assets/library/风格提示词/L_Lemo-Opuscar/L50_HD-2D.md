# L50 HD-2D

- 分类：L Lemo-Opuscar · 游戏
- 长什么样：灯塔熄灭，孙女提着最后一簇火穿过夜林、爬上风暴悬崖。
- 适合：像素加光影，有电影感

## 风格提示词

# HD-2D — Style Prompt

> Hand-made pixel sprites standing like paper cut-outs inside a lit, fogged, fully 3D diorama, shot from a high three-quarter angle through a tilt-shift lens: a toy world where every lamp throws a real shadow.
> References (grammar only): *Octopath Traveler* (Square Enix × Acquire, 2018) and its sequel (2023), the games that defined the HD-2D look. Learn the grammar: sprite-in-diorama, high 3/4 camera, tilt-shift focus band, point lights with shadows, heavy bloom and vignette, framed dialogue box. Never use their characters, places, logos, UI ornaments or music, and never name them in the film.
> Name: "HD-2D" is Square Enix's term (and trademark) for that look. The library borrows it only to describe the style; this style and its demo have no connection to Square Enix and are not endorsed by it. Don't use "HD-2D" as a title or brand in a film.

## 1. Essence, and what it is not

A **3D miniature set** of boxes and cylinders wrapped in **pixel-art textures**, populated by **flat 2D pixel sprites that receive light and cast shadows**, seen from a **high, far camera** through a **tilt-shift band** so the world reads as a tabletop model. **Light is the subject**: practicals throw sprite shadows across the floor; shafts, fog, dust or rain hang in the air; strong bloom, heavy vignette. On top, a small **RPG UI**: chapter card, framed dialogue box with typewriter text, serif subtitles.

The key contrast: characters stay **flat, low-res and stepped** while camera, light, particles and focus move smoothly every frame.

Not a voxel game (no cubic characters), not a flat 2D pixel RPG (the set is real 3D with real light), not a tilt-shift photo of a real miniature (textures are pixels, not materials).

## 2. Materials & rendering

- **Constant texel density**: surfaces drawn per pixel on small canvases, `NearestFilter`, world-space UVs at one density (e.g. 24 px/m); sprites on a similar scale (a character ~30–60 px tall).
- **Colour from ramps**: 3–6 swatches picked by brightness through a narrow 4×4 Bayer dither. Sprites get a 1 px *selout* outline (neighbour colour darkened toward the ink).
- **Boxes and cylinders** for buildings, floors, rock; **billboards** (instanced) for foliage, distant props, ridges. Windows are emissive pixel panes; fire is a pixel atlas stepping at ~10 fps; water a shader with quantized ripples and light columns toward the camera.
- **Light rig per set**: one dim shadow-casting key, a hemisphere fill, **practical point lights** with shadows (lamps, fires, windows, screens), and a **front fill** ~2 m before the hero (a billboard lit from behind stays black). An additive glow sprite on every source gives bloom something to grab.
- **Post chain, at render time**: supersampled render → physical DOF with tilt-shift in the same signed circle of confusion (above the band = far, below = near; far never bleeds over a sharp foreground) → bloom → vignette/grade → filmic tone map. No film grain.

## 3. Colour logic

- **Two temperatures**: one large ambient key (cold, or pale, or dusty) against small warm or saturated practicals. The practicals carry the story; the ambient carries the mood.
- The darkest value is a warm ink, never pure black; the brightest is the light source itself, bloomed.
- Each set owns one fog colour and one light key, so a cut to a new place reads instantly.
- The hero wears the one saturated costume colour that no set uses, so the tiny sprite is findable in a wide.
- UI is one metal (gold, silver, copper) plus one paper white over a dark translucent plate.
- Examples: night canal town (blue fog, amber windows); autumn market at dusk (violet sky, pink paper lanterns); snowy mine at noon (grey-white daylight, green mineral glow).

## 4. Type & subtitles

- An inscriptional capital serif (Cinzel, wide tracking) for chapter labels and titles; an old-style serif (Cormorant, Cormorant Garamond italic) for subtitles, dialogue, taglines. All OFL.
- **Narration subtitles**: italic serif ~46–54 px, centred low on a soft dark gradient band, one line per voice clip, in ~0.35 s before the voice.
- **On-screen speech gets a dialogue box**, not a subtitle: dark plate, thin metal border, corner ornaments, name plate on its top edge, text **typed over ~90 % of the voice**, blinking caret, soft chime on entry.
- Chapter cards and a title card belong to the grammar. Hold ≥ max(1.8 s, speech + 0.6 s). Export the `.srt` from the data that drives the overlay.

## 5. Motion quality

- **Sprites step, everything else glides.** Walk cycles 4 frames at 6–10 fps, idles alternate two frames at ~1–2 Hz, blinks every few seconds, pose changes are instant cuts between drawings. Camera, lights, particles, beams and focus update every output frame (60 fps).
- **Poses are data**: a parameter object per drawing; a new pose is a new table entry.
- **Lights breathe**: every flame flickers (a few summed sines, about ±20 %). A light's level is one value that drives the sprite drawing, the point light (intensity ∝ level^~1.3), the glow opacity and its scale together.
- **Weather is procedural**: slanted rain streaks; lightning as a scripted flash curve (strike, dip, re-strike, decay) lifting sky, fill and exposure together.
- The world never shakes except for impact; the set never moves, only the camera and what lives in it.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic. Always look **down** on the world (never at eye level); every path is a monotone spline of a few keys, no overshoot; focus is recomputed every frame from camera to the subject.

| Move | Expresses | Can serve |
|---|---|---|
| Very high, very far, slow push; band on one tiny subject | Preciousness, a whole place as a map | where we are; scale; a landmark |
| Medium-high 3/4, near-static drift | Two figures on one stage | a conversation; a handover; a choice |
| Lateral tracking, camera leading slightly, foreground passing blurred | A path through a world | travel; a process with steps; a commute |
| Dive low and close while a figure kneels or stops | The toy world suddenly personal | exhaustion; care; a secret |
| Rising pull-back, focus handed from figure to object | The act spreads outward | consequence; a system switching on |
| Orbit half-way round a building or prop | An object seen from all sides | a workshop; a machine; a monument |
| Top-down, straight overhead, tilt band as a strip | A board game, a plan | routes; a schedule; a queue |
| Rack focus between two depths in a locked frame | Attention changing hands | a memory; someone watching; before/after |
| Return to an earlier framing, changed | The rhyme shows what changed | aftermath; growth; a season later |

Framing: characters ~1/12–1/8 of frame height; the sharp band follows the subject's projected height (clamped ~.2–.8 of screen); with no character, use a fixed band height per shot. Transitions: short fades to black or cuts between sets; no wipes, no 3D spins.

## 7. Sound palette

- **Music**: chamber-fantasy or cinematic colours (harp, celesta, strings, horns, low choir, timpani) or small folk instruments (lute, recorder, hand drum). Either one piece whose own arc matches the story, **cut inside it** at downbeats, or an original score; a downbeat can land on the frame of a visual event.
- **Silence as a tool**: a hard stop into a reverb tail, a pad alone, or one heartbeat when the light nearly dies; a short breath (< 1 s) when something fails.
- **Foley follows the diorama's matter**: footsteps per surface (wood, dirt, stone, snow), fire crackle, cloth, a UI chime for dialogue boxes and menus, small bells for things switching on, thunder after each flash, a deep boom with shimmer for a big ignition; ambience beds per set, crossfaded.
- **Voice**: storybook narrator, slow (speed ~.82–.90); on-screen characters low-passed (~7 kHz) so they sit "in the world". Put invented names in the TTS `asr` field.
- **Mix**: lines compressed and RMS-matched; per-line auto-duck ~10 dB (down only); −14 LUFS via `core/render/mux.sh`, grain 0.

## 8. Native moves

A menu: use the ones your story needs.

- **Shadows jump when a light is lit.** A practical turns on next to sprites and their shadows swing across the floor. *Fits content like:* a shop opening at dawn; a server rack powering up; a teacher switching on a projector.
- **The carried light as a meter.** One small light a character carries is key light and gauge at once: its brightness rises and falls with whatever the story is measuring. *Fits content like:* a phone battery on a long trip; a patient's heart monitor; a candle vigil.
- **Tilt-shift preciousness.** An extra-wide with the band on one tiny subject. *Fits content like:* a single delivery van in a city; a newborn's room in a whole hospital; one stall in a night market.
- **Lights popping on one by one.** Windows, lamps or boats light up at a steady cadence across the map. *Fits content like:* users joining a network; a village getting electricity; a festival beginning.
- **RPG grammar.** Chapter card, named character in a dialogue box, biomes, a landmark, a title card. *Fits content like:* onboarding a new employee; a history in eras; a recipe in stages.
- **Weather passes over the diorama.** Rain, snow or lightning sweeps the tabletop with the flash curve. *Fits content like:* a market crash; a harvest threatened; a hard week at work.

## 9. Pitfalls of the medium

- **Checkerboard everywhere** → the dither band is too wide (≈ .22 on sprites, ≈ .45 on textures).
- **A light burns out the sprite that holds it** → move the light ~0.45 m toward the camera; cap sprite lighting in the shader (`min(outgoingLight, diffuse * 1.35 + emissive)`).
- **Lights behind a billboard don't light it** (front normal only) → always the front fill.
- **Cylinder beams facing the camera give NaN** that bloom spreads into black blocks → billboard beam cards that fade toward the lens, glow sprite takes over.
- **Dark scenes unreadable** → lift environment mid-tones ~×2–2.5 outside the one beat that must go dark.
- **Distant glows hidden by fog** → `depthTest = false`, higher `renderOrder`.
- **Tilt-shift with no character to track** → fixed band height per shot. **Tilt as a separate blur pass** breaks occlusion → fold it into the DOF's signed CoC.
- **Node render scripts may not exit** after `done` (server keep-alive) → `process.exit(0)`; the file is complete once `done` prints.

## 10. Engine

In `demo/`: `px.js` (pixel canvas, Bayer ramps, surfaces, lit billboards, glow), `kit.js` (world UVs, materials, houses, props, pixel fire), `fx.js` (sky, pixel sea, particles, rain, beam cards, `flick`), `chars.js` (pose-table pixel characters, `makeChar`), `post_ts.js` (`makePost`: DOF + tilt-shift + bloom + grade), `ui.js` (chapter card, dialogue box, subtitles, title), `main.js` (page contract, `?tilt=1`). Module table, parameters and a minimal new set (a lantern-lit alley): [DEMO.md § Engine reference](DEMO.md#engine-reference).

## 11. Variation space

You decide the places, the characters, the light the story turns on, the chapters, the opening, the ending, the camera path, the key temperature and the music. All far from our demo:

- Structures: **a day-cycle map** (one set, dawn to night, each hour lit by different practicals as the town's routine unfolds); **a party of three** (three short chapters, each character's biome and light, converging in one room); **a menu of places** (a top-down overworld; the camera dives into one location per topic point and pulls back to the map between).
- Openings: **in the middle of the room** (a dialogue box already typing over a close 3/4 shot); **overhead map** (straight top-down, the band as a strip, then tilt down into the 3/4 view); **daylight** (a bright noon wide with no practicals at all, so the first lamp later is an event).
- Endings: **a save point** (the hero rests at a small glowing object, the UI shows a save line, fade); **the band narrows** (the sharp strip thins onto one sprite until everything else is blur); **the party leaves frame** (a locked wide holds after the characters walk out; only ambience and flicker remain).

---

How our demo was made (story, shots, score, end card, build): [DEMO.md](DEMO.md). Read it after your treatment exists.

## 补充

### 示范片

The Lampbearer

下面是我们自己写的参考实现：一个绘制函数 S.L50(c, w, h, t, s)，c 是 canvas 的 2D context，w/h 是宽高，t 是秒，s 是给这个函数存状态用的空对象。公共的小工具函数在 ../A-G_代码样片/_公共函数.js 里。

```js
S.L50 = (c, w, h, t, s) => {
  const m = Math.min(w, h), q = t % 8;
  if (!s.init) {
    s.init = 1;
    const r = rng(50001);
    s.stars = []; for (let i = 0; i < 36; i++) s.stars.push([r(), r(), r()]);
    s.rain = []; for (let i = 0; i < 34; i++) s.rain.push([r(), r(), .7 + r() * .8]);
    s.tex = []; for (let i = 0; i < 20; i++) s.tex.push([r(), r(), r()]);
  }
  const camX = Math.sin(t * .18) * m * .012, camY = Math.cos(t * .13) * m * .008;
  c.save(); c.translate(camX, camY);
  // 冷调夜空 + 星
  c.fillStyle = vgrad(c, h, '#141C3C', '#2A3A66'); c.fillRect(-m * .03, -m * .03, w + m * .06, h + m * .06);
  s.stars.forEach(st => {
    c.fillStyle = hex('#C8D8FF', .25 + .55 * Math.abs(Math.sin(t * (1 + st[2]) + st[2] * 9)));
    c.fillRect(st[0] * w, st[1] * h * .3, m * .004, m * .004);
  });
  c.fillStyle = '#20263E'; c.fillRect(-m * .03, h * .55, w + m * .06, h * .5);
  // 像素贴图肌理（色阶抖动）
  s.tex.forEach(tx => {
    c.fillStyle = hex('#3A4468', .5);
    c.fillRect(tx[0] * w, h * (.58 + tx[1] * .38), m * .008, m * .004);
  });
  // 房屋（盒体 + 发光窗 + 呼吸灯火）
  const house = (x, y, ww, hh2, roof) => {
    c.fillStyle = hex('#000000', .28); c.fillRect(x + ww * .72, y - hh2, ww * .28, hh2);
    c.fillStyle = '#4A5478'; c.fillRect(x, y - hh2, ww, hh2);
    c.fillStyle = roof;
    c.beginPath(); c.moveTo(x - ww * .08, y - hh2); c.lineTo(x + ww * .5, y - hh2 - m * .07); c.lineTo(x + ww * 1.08, y - hh2); c.closePath(); c.fill();
    for (let k = 0; k < 3; k++) {
      const fl = .7 + .3 * Math.sin(t * 1.3 + x + k * 2);
      c.fillStyle = hex('#FFC96B', .5 + .45 * fl);
      c.fillRect(x + ww * (.12 + k * .28), y - hh2 * .72, ww * .16, hh2 * .3);
      glowDot(c, x + ww * (.2 + k * .28), y - hh2 * .58, m * .05, '#FFB85C', .28 * fl);
    }
  };
  house(w * .1, h * .62, w * .16, h * .3, '#6A4A6E');
  house(w * .62, h * .58, w * .13, h * .22, '#7A5A4E');
  house(w * .82, h * .64, w * .14, h * .26, '#4A5A7E');
  // 路灯 + 长影
  const lampX = w * .42, lampY = h * .6;
  c.fillStyle = '#2A3050'; c.fillRect(lampX - m * .008, lampY - h * .26, m * .016, h * .26);
  c.fillStyle = hex('#FFE0A0', .9); c.fillRect(lampX - m * .02, lampY - h * .28, m * .04, m * .03);
  const flick = .85 + .12 * Math.sin(t * 6.3) + .05 * Math.sin(t * 17.1);
  glowDot(c, lampX, lampY - h * .26, m * .3 * flick, '#FFC978', .5);
  c.fillStyle = hex('#0A0E22', .35);
  c.beginPath(); c.moveTo(lampX, lampY); c.lineTo(lampX - m * .22, h * .88); c.lineTo(lampX + m * .12, h * .88); c.closePath(); c.fill();
  // 提灯小英雄（像素精灵 + selout）
  const wf = Math.floor(t * 8) % 2;
  const px2 = w * .47, py2 = h * .62;
  c.fillStyle = '#10162E';
  c.fillRect(px2 - m * .014, py2 - m * .06, m * .052, m * .088);
  c.fillStyle = '#E8B848'; // 唯一饱和色
  c.fillRect(px2 - m * .01, py2 - m * .056, m * .044, m * .08);
  c.fillStyle = '#10162E';
  c.fillRect(px2, py2 - m * .086, m * .03, m * .03);
  c.fillRect(px2 - m * .008, py2 + m * .028, m * .012, m * .022 + wf * m * .004);
  c.fillRect(px2 + m * .012, py2 + m * .028, m * .012, m * .022 - wf * m * .004);
  glowDot(c, px2 + m * .05, py2 - m * .03, m * .12 * flick, '#FFD9A0', .55);
  // 雨（连续帧）
  c.strokeStyle = hex('#AFC8FF', .3); c.lineWidth = m * .0022; c.beginPath();
  s.rain.forEach(d => {
    const ry = ((d[1] + t * d[2] * .4) % 1) * h, rx = d[0] * w;
    c.moveTo(rx, ry); c.lineTo(rx - m * .012, ry + m * .045);
  });
  c.stroke();
  // 雾带 + 移轴雾化（上下）
  for (let i = 0; i < 3; i++) {
    c.fillStyle = hex('#5A6A96', .1);
    c.fillRect(-m * .03 + Math.sin(t * .2 + i) * m * .02, h * (.5 + i * .1), w + m * .06, h * .06);
  }
  const hz = c.createLinearGradient(0, 0, 0, h * .28);
  hz.addColorStop(0, hex('#1A2448', .8)); hz.addColorStop(1, hex('#1A2448', 0));
  c.fillStyle = hz; c.fillRect(0, 0, w, h * .28);
  const hz2 = c.createLinearGradient(0, h * .7, 0, h);
  hz2.addColorStop(0, hex('#1A2448', 0)); hz2.addColorStop(1, hex('#1A2448', .8));
  c.fillStyle = hz2; c.fillRect(0, h * .7, w, h * .3);
  c.restore();
  // 章节标 + 对话框（打字）
  c.textAlign = 'center'; c.fillStyle = hex('#C8B890', .9);
  c.font = `400 ${m * .03}px Georgia,"Noto Serif SC",serif`;
  c.fillText('第四章 · 灯塔熄灭之夜', w * .5, h * .09);
  const bx = w * .12, by = h * .78, bw = w * .76, bh = h * .16;
  c.fillStyle = hex('#0A0E22', .88); c.fillRect(bx, by, bw, bh);
  c.strokeStyle = '#C8A860'; c.lineWidth = m * .0035; c.strokeRect(bx + m * .008, by + m * .008, bw - m * .016, bh - m * .016);
  c.fillStyle = '#C8A860'; c.fillRect(bx, by - m * .028, m * .12, m * .032);
  c.fillStyle = '#141A2E'; c.font = `700 ${m * .022}px ${SANS}`; c.fillText('小萤', bx + m * .06, by - m * .003);
  const msg = '提着最后一簇火，穿过夜林';
  const nch = Math.max(1, Math.floor((q % 3.4) / 3.4 * msg.length));
  c.fillStyle = '#EDE6D4'; c.font = `italic 400 ${m * .034}px Georgia,"Noto Serif SC",serif`;
  c.fillText(msg.slice(0, nch), w * .5, by + bh * .62);
};

```
