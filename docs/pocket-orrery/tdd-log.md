# pocket-orrery — TDD log

Tests: `experiments/pocket-orrery/pocket-orrery.test.mjs` (24 tests) against
the `<script id="logic">` block of `experiments/pocket-orrery/index.html`
via `experiments/_harness/logic.mjs`. Full run: ~150 ms, deterministic, no
network.

## Slice 1 — gravity and integration — DONE

- RED: 6 tests — pull direction, G·M/r² magnitude (softening negligible at
  r=200), no self-attraction, fixed sun pinned over 500 steps, semi-implicit
  ordering (x uses updated v), circular orbit `sqrt(G·M/r)` within ±5% over
  3 full orbits. Failed with `TypeError: ... is not a function`.
- GREEN: `gravityAccel` (softening² = 4 px²) and `stepBodies`
  (semi-implicit Euler, accelerations computed from pre-step positions).
- REFACTOR: none needed.

## Slice 2 — merging and culling — DONE

- RED: 9 tests — exact mass sum, exact momentum conservation both axes,
  volume-conserving radius (∝ mass^(1/3)), mass-weighted centroid, fixed
  partner stays pinned with zero velocity, overlapping pair merges in
  `stepBodies`, sun absorbs a faller and grows, `opts.onMerge` fires once,
  `opts.cullRadius` drops escapees but never the sun.
- GREEN: `mergeBodies` + overlap loop (repeat until stable) + culling pass
  inside `stepBodies`, both behind an optional `opts` argument so the
  design's 3-arg signature still works.
- REFACTOR: none needed.

## Slice 3 — winding and notes — DONE

- RED: 7 tests — full CCW revolution counts exactly once, ±π seam wraps
  cleanly, clockwise winds negative, wiggle cancels, `noteForMass`
  monotonic non-increasing, always a scale member, spans ≥3 degrees across
  the mass range with light above heavy.
- GREEN: `orbitCount` returns a fractional-revolution accumulator with
  deltas wrapped to (-π, π]; `noteForMass` maps log(mass) across
  [2, 4000] onto the scale, inverted (heavier → lower).
- Note: during GREEN the "counts exactly once" test was corrected — 100
  exact 1/100-turn increments sum to 0.9999999999999999 in floating point,
  so the integer floor never crosses at exactly 1.0. The test now sweeps
  1.25 revolutions (as any real orbit overshoots 2π) and asserts exactly
  one crossing. Behavior under test is unchanged.

## Slice 4 — structural acceptance — DONE

- RED: 2 tests — exactly one loadable logic block; full documented surface
  (`stepBodies`, `gravityAccel`, `mergeBodies`, `orbitCount`,
  `noteForMass`) plus an ascending `SCALE`. Failed on the missing `SCALE`
  export.
- GREEN: exported `SCALE` (A minor pentatonic, semitones 0–24).

## Full prototype

Built around the proven logic in the same single file: world coordinates
with the sun pinned at the origin, fixed 1/120 s physics substeps, ~200
point per-planet trails (sampled every 3rd substep), corona-gradient sun
with flare on feeding, sunlit-limb planet shading, merge-flash and
orbit-pulse rings, aiming line + predicted-path ghost forward-simulated
with the same `stepBodies`, WebAudio (pentatonic orbit notes from A2,
low merge thumps, fling swish, faint solar drone) created only on the
first pointer gesture, `c` clear / `m` mute, Georgia serif UI that fades
after the first fling.

## Acceptance (headless Chromium via Playwright, file://, 1280×800)

Throwaway script (not committed, per plan): drives the four design
scenarios with mouse gestures.

- Tangential drag (r=160, circular speed) → sustained orbiter. PASS
- Second orbiter, opposite winding at r=230. PASS
- Wild tangential fling above escape velocity → comet arc away. PASS
- Radial drag at the sun → planet falls in, sun mass 3200 → ~3204–3226
  (spawn mass is random), body count returns to baseline. PASS
- ≥1 completed orbit observed (5 total in the final run). PASS
- Zero pageerror / console-error events. PASS
- Final screenshot with developed trails and a held drag showing the
  aiming line + ghost: `/tmp/exp-pocket-orrery.png`.

Two earlier acceptance failures were scene-setup bugs in the throwaway
script, not app bugs: (1) an "escape" fling was accidentally aimed dead at
the sun and merged; (2) a 0.9× circular second orbiter dipped to
perihelion ~156 px, crossing the first orbiter's ring counter-rotating and
merging — scenario 3 working as designed, just not what the count
assertion expected. Both re-aimed.

## Deviations from design.md

- `stepBodies` takes an optional fourth `opts` argument
  (`{ cullRadius, onMerge }`) so the app can cull escapees and react to
  merges without polling; the documented 3-arg form is unchanged.
- `orbitCount` accumulates in revolutions (integer crossings = completed
  orbits) rather than raw radians — same winding semantics, friendlier
  units.
- A read-only `globalThis.__orrery` debug handle (bodies, totalOrbits)
  exists solely for headless acceptance probing.
