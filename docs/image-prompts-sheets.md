# KidQuest – prompty pro ChatGPT: 12 levelů jako 3 obrázky

Každé téma = **3 obrázky po 4 levelech** (mřížka 2×2) ve **stejném chatu**. Postava je v každém levelu **v pravém dolním rohu** a je součástí obrázku krajiny.

Proč 3 obrázky a ne 1: ChatGPT generuje nanejvýš 1536×1024. Ve 4 panelech má jeden level ~768×432 bodů (na 1600×900 se zvětší ~2×). Ve 12 panelech by to bylo jen ~384×216 a výsledek by byl rozmazaný.

## Postup

1. Pro každé téma otevři **nový chat** v ChatGPT.
2. Vlož **Prompt 1** (levely 1–4) a nech vygenerovat. Pokud postava nebo rozložení nesedí (text v obrázku, jiný počet panelů, postava jinde než vpravo dole), napiš „Try again, keep the rules exactly“ a vygeneruj znovu. Nepokračuj, dokud první obrázek není dobrý: je to šablona pro další dva.
3. **Ve stejném chatu** vlož **Prompt 2** (levely 5–8), pak **Prompt 3** (levely 9–12).
4. Ulož obrázky jako `<téma>-1.png`, `<téma>-2.png`, `<téma>-3.png` (např. `minecraft-1.png`) do složky `art-input/` v projektu.
5. Řekni mi, že jsou připravené. Rozstříhám je, ořežu na 16:9, zvětším na 1600×900, uložím jako `landscape/L01–L12.webp` + náhledy 400×225 a nahradím jimi současné kódem kreslené krajiny.

## Kontrola před uložením

- [ ] přesně 4 panely 2×2, rovné bílé mezery
- [ ] žádný text, čísla ani logo
- [ ] postava ve všech panelech vpravo dole, stejně velká
- [ ] stejný obličej a barvy jako v předchozím obrázku
- [ ] vylepšení z dřívějších levelů zůstala (např. vlk od L6 dál)
- [ ] levý dolní roh a spodní střed jsou klidné (budou tam karty aplikace)

## Dopad na aplikaci

- Krajina teď obsahuje postavu, takže pozadí dítěte = `landscape/Lxx.webp` a samostatný avatar se na pozadí nekreslí.
- V dětském pohledu musí pravý dolní roh zůstat volný (karty úkolů jen vlevo a uprostřed), jinak postavu zakryjí.
- Šatník: místo zvlášť „vzhled“ a „domov“ jen jedna volba odemčeného levelu (`selected_landscape_level`). `selected_avatar_level` se dá odstranit.
- Malý avatar v postranním panelu a horní liště: dál současné `avatar/Lxx.png`, nebo výřez z rohu panelu (s pozadím scény).

---

## ⛏️ Minecraft – Samuel (Blokový svět)
### Prompt 1 – levely 1–4 (nový chat)

```
LAYOUT (very important):
- ONE single image, landscape 3:2 format.
- A grid of 4 equal panels: 2 columns x 2 rows.
- Panels separated by straight thin pure-white gutters (about 12 px). No outer frame.
- Reading order left->right, top->bottom = Level 1, Level 2, Level 3, Level 4.
- NO text, NO numbers, NO labels, NO logos, NO watermarks anywhere.

EVERY PANEL:
- A wide game background scene that fills the whole panel edge to edge.
- The SAME character appears in every panel, full body, standing in the LOWER-RIGHT corner,
  about 40 % of the panel height, facing slightly left toward the scene.
  Same position, same size, same pose in all panels.
- Keep the lower-left and bottom-center area calm and uncluttered (app UI will be overlaid there).
- The character's face, body proportions and base colors stay IDENTICAL in all panels -
  only the listed upgrades are added, and upgrades from earlier levels are kept.
- The scenes become more impressive and magical with each level.
- Original character design. Do not draw any existing character from films, games or toys.

STYLE: voxel art, blocky 3D cubes, bright saturated colors, isometric 3/4 view, child-friendly, clean simple shapes.
CHARACTER: an original blocky boy, brown hair, brown tunic, dark trousers, cheerful face, holding a pickaxe.

Level 1: scene: sunny grassy plains with a few blocky trees | character: wooden pickaxe
Level 2: scene: the same plains + a small log cabin with a smoking chimney | character: stone pickaxe
Level 3: scene: + a cave entrance in a hill with two torches | character: iron pickaxe, a torch on his belt
Level 4: scene: + a small village and a wheat field | character: leather helmet and vest
```
### Prompt 2 – levely 5–8 (stejný chat)

```
Great. Now create the NEXT image in exactly the same layout (2x2 panels, thin white gutters,
landscape 3:2, no text), the same style and with exactly the same character as in the previous
image - same face, proportions, colors, and the same position and size in the lower-right corner.
Keep all upgrades the character already has and add the new ones listed below.
Reading order left->right, top->bottom = Level 5, Level 6, Level 7, Level 8.

Level 5: scene: + a river with a working watermill | character: golden pickaxe
Level 6: scene: dusk, dense forest, fireflies | character: full iron armor, a small blocky wolf beside him
Level 7: scene: deep mine with glowing blue crystals and a mine cart | character: diamond pickaxe, cyan armor trim
Level 8: scene: stone castle with flags on a hill above the village | character: diamond helmet and a shield
```
### Prompt 3 – levely 9–12 (stejný chat)

```
Great. Now create the NEXT image in exactly the same layout (2x2 panels, thin white gutters,
landscape 3:2, no text), the same style and with exactly the same character as in the previous
image - same face, proportions, colors, and the same position and size in the lower-right corner.
Keep all upgrades the character already has and add the new ones listed below.
Reading order left->right, top->bottom = Level 9, Level 10, Level 11, Level 12.

Level 9: scene: jungle with an ancient stone temple and vines | character: bow on his back, backpack with a map, parrot on his shoulder
Level 10: scene: lava cavern, lava rivers, glowing purple portal | character: dark armor with orange trim, glowing dark pickaxe
Level 11: scene: floating sky islands with waterfalls | character: big blocky wings
Level 12: scene: golden structure on a floating island under stars and a nebula | character: gold crown, radiant armor, tiny dragon on his arm
```
Ulož jako `art-input/minecraft-1.png`, `minecraft-2.png`, `minecraft-3.png`.

---

## ❄️ Frozen – Rebeka (Ledové království)
### Prompt 1 – levely 1–4 (nový chat)

```
LAYOUT (very important):
- ONE single image, landscape 3:2 format.
- A grid of 4 equal panels: 2 columns x 2 rows.
- Panels separated by straight thin pure-white gutters (about 12 px). No outer frame.
- Reading order left->right, top->bottom = Level 1, Level 2, Level 3, Level 4.
- NO text, NO numbers, NO labels, NO logos, NO watermarks anywhere.

EVERY PANEL:
- A wide game background scene that fills the whole panel edge to edge.
- The SAME character appears in every panel, full body, standing in the LOWER-RIGHT corner,
  about 40 % of the panel height, facing slightly left toward the scene.
  Same position, same size, same pose in all panels.
- Keep the lower-left and bottom-center area calm and uncluttered (app UI will be overlaid there).
- The character's face, body proportions and base colors stay IDENTICAL in all panels -
  only the listed upgrades are added, and upgrades from earlier levels are kept.
- The scenes become more impressive and magical with each level.
- Original character design. Do not draw any existing character from films, games or toys.

STYLE: soft painted children's book illustration, icy blues and silver, sparkling snow, simple bold shapes readable for a 4-year-old.
CHARACTER: an original little girl, chestnut hair in two pigtails, rosy cheeks, big warm smile.

Level 1: scene: cozy snowy village, warm windows, smoking chimneys, a snowman | character: blue winter coat and a knitted hat with a snowflake
Level 2: scene: the same village + a frozen lake beside it | character: snowflake-patterned scarf
Level 3: scene: + a frosted silver forest | character: small silver headband instead of the hat
Level 4: scene: skating rink on the lake with colorful lanterns | character: sparkly ice-blue dress, ice skates
```
### Prompt 2 – levely 5–8 (stejný chat)

```
Great. Now create the NEXT image in exactly the same layout (2x2 panels, thin white gutters,
landscape 3:2, no text), the same style and with exactly the same character as in the previous
image - same face, proportions, colors, and the same position and size in the lower-right corner.
Keep all upgrades the character already has and add the new ones listed below.
Reading order left->right, top->bottom = Level 5, Level 6, Level 7, Level 8.

Level 5: scene: snowy mountain pass with mist | character: long deep-blue cape
Level 6: scene: snowy forest path with a red sleigh | character: a small friendly reindeer beside her
Level 7: scene: garden of ice sculptures and ice arches | character: ice wand with swirling snowflakes
Level 8: scene: the village at night under green and purple northern lights | character: soft aurora glow around her
```
### Prompt 3 – levely 9–12 (stejný chat)

```
Great. Now create the NEXT image in exactly the same layout (2x2 panels, thin white gutters,
landscape 3:2, no text), the same style and with exactly the same character as in the previous
image - same face, proportions, colors, and the same position and size in the lower-right corner.
Keep all upgrades the character already has and add the new ones listed below.
Reading order left->right, top->bottom = Level 9, Level 10, Level 11, Level 12.

Level 9: scene: ice bridge over a snowy chasm | character: cloak with a snowflake pattern, snowy owl on her shoulder
Level 10: scene: ice palace on a mountaintop under the moon | character: crystal diadem
Level 11: scene: throne room with crystal pillars | character: long gown with a train, icicle crown
Level 12: scene: the ice palace under full northern lights and stars | character: radiant glow, tiny ice dragon around her arm
```
Ulož jako `art-input/frozen-1.png`, `frozen-2.png`, `frozen-3.png`.

---

## 🦄 Unicorn – Sára (Duhová říše)
### Prompt 1 – levely 1–4 (nový chat)

```
LAYOUT (very important):
- ONE single image, landscape 3:2 format.
- A grid of 4 equal panels: 2 columns x 2 rows.
- Panels separated by straight thin pure-white gutters (about 12 px). No outer frame.
- Reading order left->right, top->bottom = Level 1, Level 2, Level 3, Level 4.
- NO text, NO numbers, NO labels, NO logos, NO watermarks anywhere.

EVERY PANEL:
- A wide game background scene that fills the whole panel edge to edge.
- The SAME character appears in every panel, full body, standing in the LOWER-RIGHT corner,
  about 40 % of the panel height, facing slightly left toward the scene.
  Same position, same size, same pose in all panels.
- Keep the lower-left and bottom-center area calm and uncluttered (app UI will be overlaid there).
- The character's face, body proportions and base colors stay IDENTICAL in all panels -
  only the listed upgrades are added, and upgrades from earlier levels are kept.
- The scenes become more impressive and magical with each level.
- Original character design. Do not draw any existing character from films, games or toys.

STYLE: cute pastel illustration, soft glow, big shiny eyes, rainbow colors, dreamy light.
CHARACTER: an original lavender unicorn foal with a fluffy mane, big sparkly eyes, round soft shapes. It grows slightly bigger with each level.

Level 1: scene: rolling meadow with wildflowers and fluffy clouds | character: small foal, pink mane, no horn
Level 2: scene: the same meadow + a rainbow across the sky | character: pink bow in the mane
Level 3: scene: + a gentle stream with stepping stones | character: a small horn appears
Level 4: scene: + a mushroom garden | character: rainbow mane
```
### Prompt 2 – levely 5–8 (stejný chat)

```
Great. Now create the NEXT image in exactly the same layout (2x2 panels, thin white gutters,
landscape 3:2, no text), the same style and with exactly the same character as in the previous
image - same face, proportions, colors, and the same position and size in the lower-right corner.
Keep all upgrades the character already has and add the new ones listed below.
Reading order left->right, top->bottom = Level 5, Level 6, Level 7, Level 8.

Level 5: scene: + a rainbow bridge over the stream | character: rainbow tail
Level 6: scene: meadow full of butterflies | character: a butterfly friend beside her
Level 7: scene: the meadow at dusk with fireflies and the first stars | character: glowing star on the forehead
Level 8: scene: meadow high up among fluffy clouds | character: small pastel wings
```
### Prompt 3 – levely 9–12 (stejný chat)

```
Great. Now create the NEXT image in exactly the same layout (2x2 panels, thin white gutters,
landscape 3:2, no text), the same style and with exactly the same character as in the previous
image - same face, proportions, colors, and the same position and size in the lower-right corner.
Keep all upgrades the character already has and add the new ones listed below.
Reading order left->right, top->bottom = Level 9, Level 10, Level 11, Level 12.

Level 9: scene: night, big full moon behind clouds, moonbeams | character: moon saddle, soft moon glow
Level 10: scene: pastel castle on a cloud in the distance | character: large rainbow wings
Level 11: scene: close view of the rainbow castle with flower gardens | character: tiny golden crown, longer mane
Level 12: scene: the castle at golden hour with fireworks | character: radiant aura, tiny winged foal friend
```
Ulož jako `art-input/unicorn-1.png`, `unicorn-2.png`, `unicorn-3.png`.
