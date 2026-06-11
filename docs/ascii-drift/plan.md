# ascii-drift — implementation plan

Vertical slices, pure logic first, acceptance last. Tests live in
`experiments/ascii-drift/ascii-drift.test.mjs`, loading the
`<script id="logic">` block from `experiments/ascii-drift/index.html`
via the shared harness `experiments/_harness/logic.mjs`. Each slice:
RED → GREEN → REFACTOR (if needed), one commit per phase.

## Slice 1 — seeded noise & fbm

- RED: `mulberry(seed)` returns a function producing values in [0,1),
  same seed → same sequence, different seeds differ. `makeNoise(seed)`
  is deterministic per seed and in [0,1] on a sample grid; different
  seeds give different fields. `fbm(noise, x, y, 5)` in [0,1] and smooth:
  `|fbm(x,y) − fbm(x+0.01,y)| < 0.05` across a sweep of samples.
- GREEN: implement mulberry32 PRNG, lattice value noise with smoothstep
  interpolation and hashed corners, and 5-octave fbm normalized to [0,1],
  in the logic block of a minimal `index.html`.

## Slice 2 — biome table & character ramps

- RED: `BIOMES` has the nine ids (deep-sea, sea, shore, plains, grass,
  forest, hills, mountains, snow), each with `{id, name, chars, color,
  suffixes}`. `biomeFor(h, m)` maps every (h, m) in a 0.05-step sweep over
  [0,1]² to a valid biome id; `biomeFor(0, *) === 'deep-sea'`;
  `biomeFor(1, *) === 'snow'`. `charFor(biome, h)` is deterministic and
  always a member of that biome's ramp; low/high h pick from the
  low/high end of the ramp.
- GREEN: documented threshold table (height bands, moisture splitting
  plains/grass/forest within the mid band) and ramp indexing by height
  fraction within the band.

## Slice 3 — region names

- RED: `regionName(3, 7, 'sea')` is stable across calls and across fresh
  logic loads; sea blocks get a suffix from `BIOMES['sea'].suffixes`;
  names match a pronounceability pattern (capitalized words, no 3+
  consonant runs); distinct blocks give distinct names (sampled).
- GREEN: syllable grammar (onset–vowel–coda) seeded by `mulberry`
  hashed from block coords + world seed, with biome-flavored suffix.

## Slice 4 — full visual app + acceptance

- Build the complete one-file app around the proven logic: canvas
  renderer with per-row color-segment batching (~110×50 grid), NE
  auto-drift, arrows/WASD + shift, `+`/`-` smooth zoom (font size +
  stride), `r` reseed, `p` pause, sea sparkle, region-name fade on block
  crossings, compass HUD, phosphor-night styling with scanline vignette.
- Structural RED/GREEN: test that the logic block exports the full
  documented surface with correct types.
- Acceptance (not unit tests): headless Playwright from `file://`
  exercising the PRD scenarios with zero page errors, plus a final
  screenshot.

## Out of scope for unit tests

Canvas rendering, keyboard handling, and animation timing are verified
by the Playwright acceptance run, not Node unit tests.
