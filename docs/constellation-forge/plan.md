# constellation-forge — implementation plan

Vertical slices over the pure logic first, the visual app and structural
acceptance last. Tests live in
`experiments/constellation-forge/constellation-forge.test.mjs` and load
`experiments/constellation-forge/index.html` through the shared harness
(`experiments/_harness/logic.mjs`). The logic block is an IIFE exporting
via `globalThis.__logic`, per convention.

## Slice 1 — sky generation & star picking

- RED: `mulberry(seed)` is deterministic per seed and emits values in
  [0, 1); `makeSky(seed, w, h, n)` returns n stars, same seed ⇒ identical
  sky, different seed ⇒ different sky, all stars within bounds, mags in
  [0.2, 1]; `nearestStar(stars, x, y, maxR)` returns the exact index on a
  crafted layout and −1 beyond maxR or on an empty list.
- GREEN: implement all three in `<script id="logic">` inside a minimal
  `index.html` shell.

## Slice 2 — figure identity

- RED: `figureHash(indices)` is a deterministic integer, differs for
  reversed order and for different figures; `figureTraits(indices, stars,
  w, h)` returns `{stars, closed, spanRatio}` with `closed` true iff first
  index === last index, `stars` counting distinct stars, and `spanRatio`
  = max pairwise star distance / chart diagonal (0 for a single star).
- GREEN: implement both in the logic block.

## Slice 3 — the forge (names & myths)

- RED: `forgeName(rng)` deterministic per rng seed, matches
  `/^[A-Z][a-z]+$/`, 4–14 chars, never 3+ consecutive consonants, varies
  across seeds; `forgeMyth(rng, traits, name)` deterministic, exactly
  three `.`-terminated sentences, contains the name, closed figures always
  contain a crown/ring marker, wide-span (non-closed) figures a river
  marker, many-star figures a pursuit marker; `forgeLegend(seed, traits)`
  returns `{name, designation, myth}` with designation of the form
  `<greek letter> <Name> <Latin epithet>`, fully deterministic per seed.
- GREEN: syllable grammar for names, designation pools, and the myth
  template grammar with trait-steered families and rich solemn word pools.

## Slice 4 — structural acceptance & full app

- RED: structural test — exactly one logic block, harness loads it, every
  documented export (`mulberry`, `makeSky`, `nearestStar`, `figureHash`,
  `figureTraits`, `forgeName`, `forgeMyth`, `forgeLegend`) exists with the
  right type.
- GREEN: build the full visual app around the proven logic — parchment-on-
  night canvas, twinkling seeded stars, thread drawing, luminous seal
  sweep, museum-label engraving cards, accumulation, keys (`Enter`,
  `Escape`, `n`, `s`).

## Out of scope for unit tests

Canvas rendering, the sweep animation, and input handling are verified by
the headless Playwright acceptance run (see PRD), not unit tests.
