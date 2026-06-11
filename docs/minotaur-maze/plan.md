# minotaur-maze — implementation plan

Vertical slices, pure logic first, acceptance last. Tests live in
`experiments/minotaur-maze/minotaur-maze.test.mjs` and load the logic block
from `experiments/minotaur-maze/index.html` via the shared harness at
`experiments/_harness/logic.mjs`. Each slice: RED → GREEN → refactor if
needed.

## Slice 1 — seeded RNG and maze generation

- RED: tests for `mulberry(seed)` — deterministic sequence for the same
  seed, different sequences for different seeds, outputs in [0, 1).
  Tests for `generateMaze(w, h, seed)` — returns `{walls: Uint8Array(w·h),
  w, h, carveOrder}`; perfection: exactly w·h−1 carved openings (each
  opening clears one bit on each side, so total cleared bits = 2(w·h−1));
  determinism: same seed ⇒ identical walls and carveOrder, different seed
  ⇒ different walls; carveOrder visits every cell at least once and its
  first entry is the start cell.
- GREEN: stub `experiments/minotaur-maze/index.html` with the
  `<script id="logic">` IIFE exporting `mulberry` and `generateMaze`
  (recursive backtracker, iterative stack) via `globalThis.__logic`.

## Slice 2 — movement and solving

- RED: tests for `canMove(maze, cell, dir)` — blocked by walls at edges
  and interior; symmetry: open N from a cell ⇔ open S from its northern
  neighbor (all four directions, every cell). `neighbors(maze, cell)`
  returns exactly the open-adjacent cells. `solve(maze, start, end)` —
  BFS from cell 0 reaches every cell (tree connectivity); path starts at
  `start`, ends at `end`, each hop is between open neighbors, no cell
  repeats.
- GREEN: add `canMove`, `neighbors`, `solve`, and the `DIRS` constants to
  the logic block.

## Slice 3 — structural acceptance of the logic surface

- RED: test that `index.html` holds exactly one logic block, the harness
  loads it, and every documented export (`mulberry`, `generateMaze`,
  `solve`, `canMove`, `neighbors`, `DIRS`) exists with the right type;
  default-size maze (25×17) generates, solves, and the solution length is
  sane (≥ w + h − 1).
- GREEN: wire-up fixes if any.

## Slice 4 — full visual app (no new unit tests)

Build the app script around the proven logic, one file, file://-safe:

- Carving ballet: animate `carveOrder` with a glowing head, walls fading
  in as carved; ~3 s total.
- Fog falls; race starts with a quiet drumbeat. Golden thread animates
  the `solve` path at a pace tuned to the path length so a decent human
  barely wins. Player lantern at entrance, arrow keys via `canMove`.
- Fog of war: lantern radius ~2 cells, soft falloff; thread glows through
  fog where it has passed.
- Win: thread halts, exit blooms gold, chime, serif mythic line. Lose:
  red minotaur glow at exit, low note, player path vs thread revealed.
- `r` re-roll, `m` mute, `#seed=N` hash support with seed displayed.
- Aesthetic: stone-dark blues, golden thread, warm lantern, serif overlay
  — consistent with nightbloom.

Existing unit tests stay green (logic block unchanged in behavior).

## Slice 5 — headless acceptance

Playwright from `file://` with pageerror/console-error listeners: wait
through carving; blocked arrow key does not move the player, open one
does; `#seed=42` identical walls across two loads; `r` re-rolls; capture a
mid-race screenshot at 1280×800. Fix and re-run until clean. Document in
`tdd-log.md`.
