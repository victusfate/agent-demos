# ascii-drift — TDD log

Tests: `experiments/ascii-drift/ascii-drift.test.mjs` (21 tests, all green,
~125 ms) against the `<script id="logic">` block of
`experiments/ascii-drift/index.html` via `experiments/_harness/logic.mjs`.

## Slice 1 — seeded noise & fbm — DONE

- RED: 7 tests — mulberry determinism/range/seed-divergence, makeNoise
  determinism/range/seed-divergence, fbm range/determinism/smoothness
  (|Δ| < 0.05 for a 0.01 step across 300 samples). Failed with TypeError
  (functions missing).
- GREEN: mulberry32 PRNG, hashed-corner lattice value noise with
  smoothstep interpolation, 5-octave fbm normalized to [0,1].
- REFACTOR: `latticeHash` inlined to be allocation-free (identical output,
  verified by the same tests) — the render path makes ~10^5 calls/frame.

## Slice 2 — biome table & character ramps — DONE

- RED: 6 tests — BIOMES shape (nine ids, name/chars/color/suffixes),
  `biomeFor` total coverage of [0,1]² at 0.05 step, deep-sea at h=0 /
  snow at h=1, all nine biomes reachable, `charFor` deterministic and
  in-ramp, ramp ends hit at h=0 / h=1.
- GREEN: documented height bands (deep-sea < 0.28 … snow ≥ 0.88), moisture
  splitting the 0.45–0.62 mid band into plains/grass/forest, ramp indexing
  by clamped height fraction within the biome's band.

## Slice 3 — region names — DONE

- RED: 5 tests — stability across calls and fresh loads, nautical suffix
  for sea blocks (asserted against the BIOMES table), pronounceability
  (capitalized words, no 3+ consonant runs), distinctness across 60
  blocks, seed sensitivity.
- GREEN: onset–vowel(–final-coda) syllable grammar over a mulberry rng
  hashed from block coords + world seed; biome-flavored suffix; optional
  "The" article. Fix during green: removed the multi-consonant 'mar'
  onset (could form a 3-run mid-word); single-letter words get a coda.

## Slice 4 — sea sparkle, structure, full app — DONE

- RED: 3 tests — `sparkleChar` deterministic / always `~` or `≈` /
  animates over time and varies over space; structural test that the
  logic block exports the full documented surface.
- GREEN (full prototype commit): deterministic sin-hash phase per cell;
  the complete one-file app — canvas renderer with per-row same-color
  segment batching, NE auto-drift, arrows/WASD + shift (5×), smooth
  `+`/`-` zoom easing font size and stride together (log2 stride in
  [-2, 3]), `r` reseed, `p` pause, 48-cell block naming with serif
  fade-in label, compass rose, scanline + vignette CRT overlay.

## Acceptance (headless Chromium via Playwright, file://)

15/15 checks, zero page/console errors:

- default drift moves the camera northeast (5.5 cells/s);
- shift+ArrowRight accelerates to 27.5 cells/s and steers due east;
- `-` ×2: stride 1 → 4 with font 19.3 → 15.0 px; `+` ×3: stride 0.5,
  font 22 px (zoom works both ways, smoothly eased);
- `r` changes the seed and renames the region;
- region name rendered and faded in ("The Bumaind Gulf");
- `p` freezes the camera; 60 fps at mid and far zoom (1280×800).

Final screenshot (coastline → forest → mountain → snow cross-section,
sea sparkling): `/tmp/exp-ascii-drift.png`.

## Deviations from design.md

- `BIOMES` is an object keyed by biome id (not an array) — same table
  fields, O(1) lookup in the render loop.
- `charFor(biome, h)` drops the design's optional `rng?` argument
  entirely, per the design's own "no rng in render path" constraint.
- `regionName` gained an optional 4th `seed` parameter (default 0) so
  scenario 4 ("`r` → new world, new names") holds; the 3-arg form from
  the design's test list is unchanged.
- `sparkleChar(x, y, t)` was promoted from a scenario note into the
  tested pure surface (slice 4) rather than living untested in the app.
- Noise frequencies (height 0.014, moisture 0.008 per world cell) and
  the contrast shaping (×1.9 around 0.5) live in the app script as
  presentation tuning; the start camera sits on a coastal window where
  all nine biomes are in frame for the default seed.
