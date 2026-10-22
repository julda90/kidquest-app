# Level art generator

Procedural SVG art for the 12 levels of each theme (see `docs/levels-catalog.md`).
Each level is code: `*_avatar.py` builds the character, `*_land.py` builds the landscape.
Edit a level in its `build(L)` function and run `python tools/level-art/build_all.py`.

Placeholder-quality art: consistent and complete, but simple. Replace any file in
`frontend/src/assets/themes/` with hand-drawn or AI-generated art later (same name, same size).
