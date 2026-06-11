# pocket-orrery — implementation plan

Vertical slices, pure logic first, acceptance last. Tests live in
`experiments/pocket-orrery/pocket-orrery.test.mjs` and load the single
`<script id="logic">` block from `experiments/pocket-orrery/index.html`
via the shared harness (`experiments/_harness/logic.mjs`).

## Slice 1 — gravity and integration

- RED: tests for `gravityAccel(target, bodies, G)` — pull points toward the
  attractor, magnitude `G·M/r²` at distance r, self-attraction excluded —
  and for `stepBodies(bodies, dt, G)` — semi-implicit Euler, sun
  (`bodies[0]`, `fixed: true`) never moves, and the design's headline
  invariant: a body launched at circular speed `sqrt(G·M/r)` stays within
  ±5% of its radius over many steps (several full orbits).
- GREEN: implement both in the logic block (IIFE, exports via
  `globalThis.__logic`) inside a minimal `index.html` shell.

## Slice 2 — merging and culling

- RED: tests for `mergeBodies(a, b)` — mass sums exactly, momentum
  (`m·v`) conserved exactly in both axes, radius = k·mass^(1/3), merged
  position is the mass-weighted centroid, merging into a `fixed` body stays
  fixed — and for `stepBodies` collision handling: two overlapping bodies
  become one; a planet falling into the sun grows the sun's mass.
- GREEN: implement `mergeBodies` and overlap detection inside `stepBodies`.

## Slice 3 — winding and notes

- RED: tests for `orbitCount(prevAngle, newAngle, count)` — accumulates
  winding across small steps, counts a full revolution exactly once,
  handles the ±π wraparound seam, works in both directions — and for
  `noteForMass(mass, scale)` — monotonic (more mass → lower or equal
  note), always returns a member of the scale.
- GREEN: implement both in the logic block.

## Slice 4 — structural acceptance

- RED: test that `index.html` contains exactly one logic block, the harness
  loads it, and every documented export (`stepBodies`, `gravityAccel`,
  `mergeBodies`, `orbitCount`, `noteForMass`) exists with the right type;
  culling helper surface verified if exported.
- GREEN: wire-up fixes if any.

## After the slices — full visual app

Build the complete experience around the proven logic in the same single
file: deep-night palette, Georgia serif UI, corona-gradient sun, glowing
planets with ~200-point faded trails, drag aiming line with predicted-path
ghost, merge flash, pentatonic orbit notes and merge thumps (audio only
after first gesture), `c` clear / `m` mute.

## Out of scope for unit tests

Canvas rendering, WebAudio output, and pointer handling are verified by the
headless Playwright acceptance run (PRD Acceptance), not unit tests.
