# nightbloom — TDD log

## Slice 1 — moon phase math
- Status: done (4 tests)
- Notes: RED exposed a spec bug in the tests themselves — phase is cyclic, so
  "one synodic month later" returns 0.9999998, not 0. Tests now assert
  circular distance. Also fixed `node --test` discovery (directory arg
  silently matched nothing; quoted glob works).

## Slice 2 — color and easing utilities
- Status: done (4 tests)
- Notes: `hexA`, `clamp`, `ease`, `pop` moved to the logic block; duplicate
  `hexA` removed from the app script.

## Slice 3 — musical scale and palettes
- Status: done (3 tests)
- Notes: `freq`, `SCALE`, `PALETTES` moved to the logic block. Pentatonic
  membership asserted modulo 12 so octave extensions stay honest.

## Slice 4 — structural export surface
- Status: done (1 test)
- Notes: never went red — slices 1–3 plus the harness's "exactly one logic
  block" check already satisfied it. Kept as a regression guard.

## Acceptance (Playwright, headless Chromium)
- Status: done
- Notes: caught a real browser-only bug the unit tests could not — top-level
  function declarations in the logic block collide with `const`
  destructuring in the app script (shared global scope). Fixed by
  IIFE-wrapping the logic block; convention documented in
  `experiments/_harness/logic.mjs`. Final state: 5 plants, 25 fired blooms,
  live AudioContext, zero page errors. 12/12 unit tests green.

## Deviations from plan
- Slice 4 needed no implementation (expected — wired correctly in 1–3).
- `/code-quality-review` skipped in this auto run to keep the multi-PR batch
  tractable; flagged for reviewer attention in the PR body.
