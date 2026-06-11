# minotaur-maze — PRD

## Problem

Demonstrate a dramatic, replayable race-against-the-clock toy as one
dependency-free HTML file: a labyrinth carves itself before your eyes, then
you race Ariadne's golden thread to the exit through fog of war. Extends the
repo's single-file experiment pattern (nightbloom) with seeded, fully
testable maze logic.

## Goals

1. The race is the heart: thread pace tuned so a decent human wins by a
   hair. Win and lose both land with mythic weight.
2. Zero dependencies, zero build, zero network: `open index.html` from
   `file://` is the entire install story.
3. All maze math (RNG, generation, solving, movement) is pure, DOM-free,
   and unit-tested in Node via the shared logic-block harness.
4. Seeded reproducibility: `#seed=42` in the URL hash reproduces the maze
   exactly across loads.

## Non-goals

- Mobile/touch controls, difficulty settings, persistence, scoring,
  multiple levels, accessibility audit.
- A literal minotaur sprite — the minotaur is a red glow at the exit,
  revealed only on loss.

## Functional requirements

- **FR1 — generation:** `generateMaze(w, h, seed)` produces a perfect maze
  (spanning tree) over a w×h grid via recursive backtracker. Cells store
  wall bitmasks (N=1, E=2, S=4, W=8) in a `Uint8Array`. It also returns
  `carveOrder` — the sequence of cell indices visited during carving —
  for the build animation. Default grid ~25×17, entrance cell 0 (top-left),
  exit cell w·h−1 (bottom-right).
- **FR2 — determinism:** `mulberry(seed)` is a deterministic RNG; the same
  seed yields byte-identical walls and carveOrder, a different seed yields
  different walls. The seed comes from `#seed=N` in the URL hash, else
  random; the active seed is shown so a run can be shared.
- **FR3 — solving:** `solve(maze, start, end)` returns the BFS shortest
  path as an array of cell indices; `canMove(maze, cell, dir)` is the wall
  test; `neighbors(maze, cell)` lists open neighbors. Player movement and
  thread animation both use these.
- **FR4 — the loop:** on load (and on `r`): carving ballet (~3 s, the head
  visibly wanders and backtracks) → fog falls → race begins with a quiet
  drumbeat: the golden thread animates the BFS solution at a tuned pace
  while the player (lantern dot) moves cell-by-cell with arrow keys from
  the entrance.
- **FR5 — fog of war / lantern:** after carving, the full maze is never
  shown; walls are visible only within the lantern radius (~2 cells, soft
  falloff). The thread glows through the fog along cells it has claimed.
- **FR6 — win:** player reaches the exit first → thread halts, exit blooms
  gold, victory chime, serif mythic flavor line. **Lose:** thread arrives
  first → red glow (the minotaur) at the exit, low note, the player's
  actual path is revealed alongside the thread's, mythic flavor line.
- **FR7 — keys:** arrow keys move (blocked by walls), `r` re-rolls a new
  random maze (works any time), `m` mutes. Audio starts only after the
  first user gesture.
- **FR8 — testability:** `mulberry`, `generateMaze`, `solve`, `canMove`,
  `neighbors` and the direction constants are exported from a single
  `<script id="logic">` IIFE via `globalThis.__logic`.

## Quality requirements

- Unit tests assert, at minimum: maze perfection (exactly w·h−1 carved
  openings; BFS from cell 0 reaches every cell), seed determinism, solve
  path validity (correct endpoints, every hop an open neighbor, no repeats),
  `canMove` wall symmetry, and carveOrder coverage (every cell visited,
  first entry is the start).
- Tests deterministic and fast (<10 s total); no network anywhere.
- No console errors in a headless Chromium run from `file://`.
- 60 fps target at 1280×800; fog rendered as alpha, not per-pixel work.

## Aesthetic requirements

Stone-dark blues consistent with nightbloom's night palette; carving shown
as a glowing chisel-head ballet; golden Ariadne's thread; warm lantern
glow; fog as a soft vignette; Georgia/serif overlays with mythic flavor
text for title, win, and lose states.

## Acceptance

Headless Playwright run from `file://`: wait through the carving ballet;
arrow-key moves respect walls (a blocked direction does not change the
player cell, an open one does); `#seed=42` produces identical walls across
two loads; `r` re-rolls to a different maze; no page errors or console
errors; a mid-race screenshot shows thread and lantern.
