# ascii-drift

An infinite landscape made entirely of text. Mountains `▲`, forests `♣`,
plains `.` and seas `~` scroll forever beneath you, generated from seeded
value noise — a slow flight over a world that is nothing but characters,
with place names drifting past like a living map.

Open `index.html` in a browser. No build, no dependencies, no network —
it works straight from `file://`.

## What you'll see

A phosphor-terminal night: a ~110×50 character grid drawn on canvas, each
of the nine biomes glowing in its own muted color (deep-sea blue → snow
pale violet). The camera drifts gently northeast. The sea sparkles
(`~`/`≈`), region names fade in as you cross 48×48-cell blocks, and a
compass rose tracks your heading.

The surprise is the zoom: `+`/`-` swap the font size *and* the sampling
stride together, so zooming out reveals continental shapes made of the
same text — the map is the territory all the way down.

## Keys

| key | action |
| --- | --- |
| arrows / WASD | steer (release to resume the northeast drift) |
| shift (hold) | hurry — 5× speed |
| `+` / `=` | zoom in (bigger glyphs, finer stride) |
| `-` / `_` | zoom out (smaller glyphs, coarser stride — continents) |
| `r` | reseed — a brand-new world with new names |
| `p` | pause the drift (the sea keeps sparkling) |

## How it works

All world math lives in `<script id="logic">` and is unit-tested in Node
(no browser needed) via `experiments/_harness/logic.mjs`:

- `mulberry(seed)` — mulberry32 PRNG; `makeNoise(seed)` — seeded lattice
  value noise; `fbm(noise, x, y, octaves)` — fractal Brownian motion.
- `biomeFor(h, m)` — height/moisture thresholds covering all of `[0,1]²`;
  `charFor(biome, h)` — deterministic ramp character.
- `regionName(bx, by, biome, seed)` — syllable-grammar names with
  biome-flavored suffixes ("The Bumaind Gulf", "Korrin Steppe").
- `sparkleChar(x, y, t)` — deterministic sea glint.

The renderer batches each row into same-colored segments — one `fillText`
per segment — to hold 60 fps. Heights are world-stable: the same world
coordinate always renders the same character, at every zoom.

Run the tests:

```sh
node --test 'experiments/ascii-drift/*.test.mjs'
```
