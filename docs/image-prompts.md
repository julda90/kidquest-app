# Image generation prompts — KidQuest level art

Companion to `levels-catalog.md` (chapter 3). 24 images per theme: 12 avatars + 12 landscapes.

## Workflow
1. Generate **L1** for each theme first and save it as the reference.
2. For L2–L12 upload the **previous level's image** and use the delta prompt. Always paste the style anchor too. This keeps character and style consistent.
3. If a level drifts (different face, colors, proportions), regenerate it from the previous image instead of moving on. Drift compounds over 12 steps.
4. Post-process (can be scripted): remove background on avatars → transparent PNG, crop to square, resize to 512×512; landscapes → crop 16:9, resize 1600×900, WebP ≤ 250 kB, plus 400×225 thumbnail.
5. Save to `frontend/src/assets/themes/<theme>/avatar/L01.png … L12.png` and `…/landscape/L01.webp … L12.webp` (+ `landscape/thumb/`).

Notes:
- Image models rarely output exact sizes or real transparency. Ask for a **plain flat white background** and remove it afterwards instead.
- Don't name existing characters or brands in prompts, not even as "NOT X" or "like X". Naming them pulls the model toward them. The style anchors below describe the look without names.

---

## ⛏️ Minecraft theme (Blokový svět)

**Style anchor (add to every prompt):**
> voxel art, blocky 3D cubes, bright saturated colors, isometric 3/4 view, child-friendly, clean simple shapes, original character design, no text, no logos, no watermarks

**Avatar L1 (base):**
> Full body voxel-art child character, centered on a plain flat white background, square image. Holding a wooden pickaxe, simple brown tunic and trousers, cheerful blocky face with big friendly eyes. Standing upright, arms slightly away from the body, isometric 3/4 view.

**Avatar deltas** (reference previous image each time, start with "Same character, same pose, same style, plain white background;"):
- **L2:** replace pickaxe with a stone pickaxe (grey texture)
- **L3:** iron pickaxe (silver), a torch tucked into the belt
- **L4:** add brown leather helmet and vest over the tunic
- **L5:** golden pickaxe with a glint, keep leather armor
- **L6:** full iron armor set, small blocky wolf companion sitting beside them
- **L7:** diamond pickaxe (bright cyan), diamond trim on the armor
- **L8:** diamond helmet and a shield, slightly heroic pose
- **L9:** bow across the back, explorer backpack with a rolled map sticking out, blocky parrot on the shoulder
- **L10:** dark pickaxe with an ember glow, dark fire-resistant armor with orange trim
- **L11:** large blocky wings on the back, light floating pose
- **L12:** gold crown, radiant full armor, tiny blocky dragon hatchling sitting on the arm

**Landscape L1 (base):**
> Wide 16:9 voxel landscape, no characters. Sunny grassy plains, a few blocky oak trees, bright blue sky with blocky clouds, morning light. Keep the lower third mostly flat and uncluttered for UI cards.

**Landscape deltas** (start with "Same scene, same style and camera angle, lower third uncluttered;"):
- **L2:** a small log cabin with a smoking chimney on the left
- **L3:** a dark cave entrance in the hillside with two torches flanking it
- **L4:** a small village with 3–4 houses and a wheat field
- **L5:** a river running through, a working watermill on the riverbank
- **L6:** dusk sky, a dense forest area, fireflies glowing between trees
- **L7:** new scene, same style: deep mine shaft, glowing blue crystals in stone walls, mine cart on tracks
- **L8:** back to the village view, a stone castle on a hill above it, flags on towers
- **L9:** new scene, same style: jungle, ancient stone temple with vines, torches at the entrance
- **L10:** new scene, same style: underground lava cavern, rivers of lava, a glowing purple portal in the background
- **L11:** new scene, same style: floating grass islands with waterfalls, clouds and birds
- **L12:** the highest floating island at night, stars and nebula, glowing golden structure on the island

---

## ❄️ Frozen theme (Ledové království) — Rebeka, 4

**Style anchor:**
> soft painted children's book illustration, icy blues and silver, sparkling snowflakes, warm friendly face, simple bold shapes readable for a 4-year-old, original character design, no text, no logos, no watermarks

**Avatar L1 (base):**
> Full body children's book illustration of an original little girl character, centered on a plain flat white background, square image. Cozy blue winter coat, matching knitted hat with a snowflake, rosy cheeks, warm smile. Standing pose, facing slightly to the side.

**Avatar deltas** (start with "Same character, same pose, same style, plain white background;"):
- **L2:** blue and white snowflake-patterned scarf
- **L3:** delicate silver headband
- **L4:** replace coat with a sparkling ice-blue dress, ice skates on feet
- **L5:** long flowing deep-blue cape
- **L6:** small cute reindeer companion beside her, she holds its reins
- **L7:** holding an elegant ice wand, snowflakes swirling around one hand
- **L8:** glowing aurora-colored light around the figure, hair flowing upward
- **L9:** cloak made of snowflakes, snowy owl perched on the shoulder
- **L10:** elegant crystal diadem, more regal pose
- **L11:** long queen's gown with a train, icicle crown
- **L12:** radiant magical glow, tiny friendly ice dragon coiled around her arm

**Landscape L1 (base):**
> Wide 16:9 soft illustrated winter landscape, no characters. Cozy snow-covered village, warm light in the windows, smoke from chimneys, gentle snowfall, blue-grey sky. Lower third uncluttered for UI.

**Landscape deltas** (start with "Same scene, same style, lower third uncluttered;"):
- **L2:** a frozen lake beside the village reflecting the pale sky
- **L3:** an icy forest of frosted silver trees with glittering branches
- **L4:** a skating rink on the frozen lake, colorful paper lanterns strung above it
- **L5:** new scene, same style: mountain pass, snow-capped peaks, mist in the valleys
- **L6:** new scene, same style: snowy forest path, a reindeer-drawn sleigh between the trees
- **L7:** new scene, same style: garden of ice sculptures, archways of carved ice
- **L8:** night version: ribbons of green and purple northern lights in the sky
- **L9:** new scene, same style: an ice bridge spanning a snowy chasm
- **L10:** new scene, same style: grand ice palace exterior on a mountaintop under moonlight
- **L11:** interior of the ice palace, throne room with crystal pillars
- **L12:** ice palace exterior under full northern lights and a starfield, magical glow

---

## 🦄 Unicorn theme (Duhová říše) — Sára, 7

**Style anchor:**
> cute pastel illustration, soft glow, big shiny eyes, rainbow colors, dreamy soft lighting, original unicorn character design, no text, no logos, no watermarks

**Avatar L1 (base):**
> Full body cute foal character, small and round, no horn yet, cream or soft lavender coat, big sparkly eyes, fluffy mane, small hooves. Centered on a plain flat white background, square image. Sweet, round proportions, standing side view.

**Avatar deltas** (start with "Same character, same pose, same style, plain white background;"):
- **L2:** small pink bow in the mane
- **L3:** a small rainbow-colored horn on the forehead, slightly taller
- **L4:** mane shimmers with a rainbow gradient
- **L5:** flowing rainbow tail, slightly more grown-up proportions
- **L6:** a colorful butterfly companion fluttering beside her
- **L7:** a small glowing star-shaped marking on the forehead
- **L8:** small delicate pastel wings on the back
- **L9:** crescent-moon saddle decoration, soft moonbeam glow
- **L10:** large rainbow wings, more elegant proportions
- **L11:** tiny golden crown, longer graceful mane
- **L12:** regal pose, radiant glow, tiny winged foal companion

**Landscape L1 (base):**
> Wide 16:9 soft pastel meadow illustration, no characters. Rolling green hills covered in wildflowers, pink and yellow blooms, soft blue sky, fluffy white clouds. Lower third uncluttered for UI.

**Landscape deltas** (start with "Same scene, same style, lower third uncluttered;"):
- **L2:** a vivid rainbow arching across the sky
- **L3:** a gentle stream with round stepping stones
- **L4:** a little garden with mushrooms and toadstools
- **L5:** a rainbow bridge arching over the stream
- **L6:** the meadow in full bloom, colorful butterflies everywhere
- **L7:** the same meadow at dusk, first stars, fireflies
- **L8:** new scene, same style: meadow high among fluffy clouds, cloud platforms
- **L9:** night, large full moon glowing behind clouds, moonbeams
- **L10:** a pastel castle on a cloud in the distance
- **L11:** closer view of the rainbow castle with a flower garden around it
- **L12:** the castle at golden hour, fireworks bursting above it
