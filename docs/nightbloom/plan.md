# nightbloom — implementation plan

The visual prototype already exists (`experiments/nightbloom/index.html`).
These slices retrofit the testable-logic architecture and prove the pure
math under test, using the shared harness at `experiments/_harness/logic.mjs`.

Each slice is vertical: test (RED) → logic-block export (GREEN) → refactor
if needed. Tests live in `experiments/nightbloom/nightbloom.test.mjs`.

## Slice 1 — moon phase math

- RED: tests for `moonPhase(date)` — known new moon (2000-01-06 18:14 UTC)
  → ~0; one synodic month later → ~0; half a synodic month → ~0.5; result
  always in [0, 1).
- GREEN: extract `moonPhase` (and constants) into `<script id="logic">`
  exporting `globalThis.__logic`; app script consumes it.

## Slice 2 — color and easing utilities

- RED: tests for `hexA('#ff0080', .5) === 'rgba(255,0,128,0.5)'`; `clamp`
  bounds; `ease(0)=0`, `ease(1)=1`, monotonic; `pop(1)=1` and overshoots
  above 1 somewhere in (0,1).
- GREEN: move `hexA`, `clamp`, `ease`, `pop` into the logic block.

## Slice 3 — musical scale and palettes

- RED: tests for `freq(0)=220`, `freq(12)=440`, `SCALE` is ascending
  A-minor-pentatonic offsets; `PALETTES` has 6 entries, each with ≥3
  `#rrggbb` petals and a heart color.
- GREEN: move `freq`, `SCALE`, `PALETTES` into the logic block.

## Slice 4 — structural acceptance

- RED: test that `index.html` contains exactly one logic block, that the
  harness loads it, and that every documented export exists and is the
  right type.
- GREEN: wire-up fixes if any.

## Out of scope for tests

Canvas rendering, audio output, and input handling stay verified by the
headless Playwright acceptance run (see PRD), not unit tests.
