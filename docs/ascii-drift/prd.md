# ascii-drift — PRD

## Problem

Show that an infinite, explorable world can be rendered entirely as text —
a living map where the map is the territory — in one dependency-free HTML
file, with all generative math proven by unit tests before any pixels exist.

## Goals

1. An endless seeded landscape of characters (`▲ ♣ . ~`) that drifts
   beneath the viewer at 60 fps on a ~110×50 character grid.
2. Zoom (`+`/`-`) swaps font size *and* sampling stride so zooming out
   reveals continental shapes made of the same text — the signature surprise.
3. Deterministic region names from a syllable grammar, fading in on block
   crossings.
4. Zero dependencies, zero build, zero network: works from `file://`.
5. All pure logic (noise, biomes, chars, names) unit-tested in Node via
   the shared logic-block harness.

## Non-goals

- Persistence, sharing, minimap, mobile-specific UI, sound.
- True simplex/perlin noise — seeded value noise + fbm is sufficient.
- Pathfinding, entities, or any simulation beyond the drifting camera.

## Functional requirements

- **FR1 — terrain:** seeded 2D value noise + fbm (5 octaves) gives height;
  a second channel gives moisture. `(height, moisture)` maps to one of nine
  biomes: deep sea, sea, shore, plains, grass, forest, hills, mountains,
  snow. The mapping totally covers `[0,1]²`. Same world coordinate → same
  character, always (world-stable).
- **FR2 — rendering:** canvas `fillText`, one draw call per same-colored
  row segment (per-row segment batching by color). Grid ~110×50 sized to
  fit the window. 60 fps target.
- **FR3 — drift & steering:** camera auto-drifts slowly northeast. Arrow
  keys / WASD steer; holding shift accelerates. `p` pauses, `r` reseeds
  (new world, new names, same physics).
- **FR4 — zoom:** `+`/`-` steps through zoom levels, changing font size
  and sampling stride together, animated smoothly. At far zoom the region
  name shown is the block under the viewport center.
- **FR5 — region names:** every 48×48 world-cell block gets a deterministic
  name from a syllable grammar seeded by block coords; the suffix is
  flavored by the block's dominant biome (sea blocks get nautical
  suffixes). Names are pronounceable (no 3+ consonant runs, capitalized)
  and fade in when the viewport center crosses a block boundary.
- **FR6 — sea sparkle:** sea characters alternate `~`/`≈` driven by world
  coords + time — animated yet deterministic for a given (coord, time).
- **FR7 — HUD:** a compass rose and the current region name sit in a
  corner; serif type for names, monospace for the world.
- **FR8 — testability:** `mulberry`, `makeNoise`, `fbm`, `biomeFor`,
  `charFor`, `regionName`, and the `BIOMES` table are exported from
  `<script id="logic">` via `globalThis.__logic`.

## Quality requirements

- Phosphor-terminal night aesthetic: each biome its own muted glow color
  (deep sea blue → snow pale violet), subtle scanline vignette.
- Unit tests deterministic and fast (< 10 s total), no network.
- No console errors in a headless Chromium run.
- `node --test 'experiments/ascii-drift/*.test.mjs'` passes.

## Acceptance

Headless Playwright run from `file://`: the world drifts by default;
shift+arrow visibly accelerates; `+`/`-` zooms both ways; `r` reseeds to a
different world; a region name is rendered; zero page errors.
