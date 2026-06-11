# ascii-drift — design

## Concept

An infinite landscape made entirely of text. Mountains `▲`, forests `♣`,
plains `.` and seas `~` scroll forever beneath you, generated from seeded
value noise — a flight over a world that is nothing but characters, with
place names drifting past like a living map.

## Q&A (auto-resolved)

**Q: Core interaction?** Auto-drift: the camera glides slowly northeast.
Arrow keys / WASD steer; shift accelerates. `r` reseeds the world, `p`
pauses. A compass rose and current "region name" sit in a corner. The
viewport is a character grid (~110×50, sized to fit) drawn on canvas with
`fillText` per row (rows are strings — one fillText per row, colored by
row-segment batching; keep it 60 fps).

**Q: How is terrain made?** Seeded 2D value noise + fbm (5 octaves) for
height; a second noise channel for moisture. (height, moisture) → biome:
deep sea, sea, shore, plains, grass, forest, hills, mountains, snow — each
biome has a char ramp and a color. Heights are world-stable: the same
world coordinate always renders the same character.

**Q: Region names?** Every 48×48 world-cell block gets a deterministic name
from a syllable grammar seeded by block coords ("Vel Maren", "The Korrin
Steppe" — suffix chosen by the block's dominant biome). The name fades in
when you cross a block boundary.

**Q: What's surprising?** Zoom: `+`/`-` swaps the font size *and* the
sampling stride, so zooming out reveals continental shapes made of the same
text — the map is the territory all the way down.

## Pure logic

- `mulberry(seed)`, `makeNoise(seed)` — deterministic value noise in [0,1].
- `fbm(noise, x, y, octaves)` — [0,1].
- `biomeFor(h, m)` — biome id from height/moisture thresholds (documented
  table; total cover of [0,1]²).
- `charFor(biome, h, rng?)` — character from the biome's ramp (vary within
  ramp by height fraction, deterministic — no rng in render path).
- `regionName(bx, by, dominantBiome)` — deterministic name; biome-flavored
  suffix.
- `BIOMES` — `{id, name, chars, color, suffixes}` table.

### Tests must assert

- Noise/fbm deterministic per seed and within [0,1] on a sample grid.
- Smoothness: |fbm(x,y) − fbm(x+0.01,y)| small (< 0.05) across samples.
- `biomeFor` covers the full square: every (h, m) in a 0.05-step sweep maps
  to a valid biome; deep sea at h≈0, snow at h≈1.
- `charFor` deterministic and always a member of the biome's ramp.
- `regionName(3, 7, 'sea')` stable across calls; sea blocks get nautical
  suffixes (assert via the BIOMES suffix table); names match a
  pronounceability pattern (no 3+ consonant runs, capitalized).

## Vocabulary

| term | meaning |
| --- | --- |
| **world coordinate** | float position in noise space; 1 unit = 1 cell |
| **stride** | world units per character cell (zoom changes stride) |
| **biome ramp** | ordered chars for one biome, low→high intensity |
| **block** | 48×48-cell naming unit |
| **drift** | the slow default camera motion |

## Scenarios

1. Load → mid-zoom world drifting NE; a region name fades in.
2. Hold shift+→ → coastline streams by; sea sparkles (animated `~`/`≈`
   alternation driven by world coords + time, still deterministic).
3. `-` twice → continent-scale text map; names switch to larger blocks?
   No — names stay per-block; at far zoom the name shown is the block under
   the crosshair center.
4. `r` → new world, new names, same physics.

## Aesthetic

Phosphor-terminal night: each biome its own muted glow color (sea deep
blue, snow pale violet, forest teal-green); subtle scanline vignette; serif
UI for names, monospace for the world.
