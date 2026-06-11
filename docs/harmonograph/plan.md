# harmonograph — implementation plan

Vertical slices, pure logic first, acceptance last. Tests live in
`experiments/harmonograph/harmonograph.test.mjs` and load the logic block
from `experiments/harmonograph/index.html` via the shared harness
(`experiments/_harness/logic.mjs`). Each slice: RED → GREEN → (REFACTOR).

## Slice 1 — ratios and period

- RED: `RATIOS` contains unison/octave/fifth/fourth/sixth/drift with the
  right `{p, q}` (drift `{p:2, q:3, detune:0.01}`); `gcd` on a few pairs;
  `period({p:1, q:2}) = 2π`; `period = 2π / gcd(p, q)` exactly for 2:3,
  2:4, 3:5 (convention: pendulum angular frequencies are `p` and `q` on a
  unit base — documented in the PRD).
- GREEN: create `experiments/harmonograph/index.html` skeleton with the
  IIFE logic block exporting `RATIOS`, `gcd`, `period`.

## Slice 2 — pendulumPoint and the decay envelope

- RED: at t=0 with zero phases, `x = ΣAᵢ·sin(0) = 0` (y too); with all
  `φ = π/2`, `x = ΣAᵢ`; for a pure single-term param with `d > 0`, the
  amplitude bound `A·e^(−d·t)` is non-increasing — assert
  `|x(t)| ≤ A·e^(−d·t)` and that the bound decreases over sampled t.
- GREEN: implement `pendulumPoint(t, params)`.

## Slice 3 — closure

- RED: undamped 2:3 params close at `T = period(2:3)` and do **not** close
  at `T/2`; damped params do not close at T. `isClosed` must check several
  sample offsets, not only t=0.
- GREEN: implement `isClosed(params, T, eps)`.

## Slice 4 — makeParams and the exported surface

- RED: `makeParams(ratio, opts, rng)` with `mulberry32(seed)` is
  deterministic per seed and differs across seeds; the f-quotient of the
  two x terms equals `p / (q + detune)` (fifth and drift cases); damping
  from `opts` lands on every term; amplitudes positive and bounded;
  structural test that the logic block exports the full documented
  surface.
- GREEN: implement `makeParams` and `mulberry32`; export everything.

## Slice 5 — acceptance (visual app)

- Build the full app around the proven logic in the same file: plate
  canvas + live pen bead, ivory ink with subtle hue shift, control card
  (chips, phase knob, damping slider, new swing), dyad audio with matching
  exponential decay, keys `s`/`m`/`n`.
- Verified by the headless Playwright run from the PRD's Acceptance
  section (page errors, scenario clicks, screenshot) — not unit tests.

## Out of scope for unit tests

Canvas rendering, WebAudio output, and input handling — covered by the
acceptance run.
