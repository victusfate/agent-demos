# minotaur-maze — design

## Concept

A labyrinth builds itself before your eyes, then Ariadne's golden thread
snakes through the fog to the exit. You can race the thread with the arrow
keys — through fog of war that only your lantern pushes back.

## Q&A (auto-resolved)

**Q: The loop?** On load (and on `r`): a maze carves itself animated
(recursive backtracker, you watch the head wander and backtrack). When done,
fog falls and two things happen at once: the golden thread starts animating
the BFS solution slowly, and the player (lantern dot) appears at the
entrance under user control. Reach the exit before the thread does → a
flourish; lose → the thread completes and the minotaur (a red glow) is
revealed at the exit. Either way, `r` re-rolls.

**Q: Maze representation?** Grid cells with wall bitmasks (N=1, E=2, S=4,
W=8). Entrance top-left, exit bottom-right. ~25×17 cells, seeded RNG so a
seed in the URL hash reproduces a maze.

**Q: What's surprising?** The race itself — the thread's pace is tuned so a
decent human wins by a hair. And the fog: the full maze is never shown
after carving; you remember it from watching it being built.

## Pure logic

- `mulberry(seed)` — deterministic RNG.
- `generateMaze(w, h, seed)` — `{walls: Uint8Array, w, h}` via recursive
  backtracker; also returns `carveOrder` (cell indices in carve sequence)
  for the build animation.
- `solve(maze, start, end)` — BFS shortest path as an array of cell indices.
- `canMove(maze, cell, dir)` — wall test used by both player and tests.
- `neighbors(maze, cell)` — open neighbors.

### Tests must assert

- Perfection: a w×h maze has exactly w·h−1 carved openings (tree), and BFS
  from cell 0 reaches every cell.
- Determinism: same seed ⇒ identical walls; different seed ⇒ different.
- `solve` path starts/ends correctly, each hop is between open neighbors,
  and no cell repeats.
- `canMove` symmetric: open N from cell ⇔ open S from northern neighbor.
- `carveOrder` visits every cell at least once, first entry is the start.

## Vocabulary

| term | meaning |
| --- | --- |
| **carve** | removing a wall pair during generation |
| **thread** | the animated BFS solution polyline (Ariadne's) |
| **lantern** | player's light radius; fog is alpha outside it |
| **race** | thread animation vs. arrow-key player, same start time |

## Scenarios

1. Load → 3-second carving ballet → fog falls → race begins (a quiet
   drumbeat marks the start).
2. Arrow keys move cell-by-cell, blocked by walls; lantern reveals ~2 cells.
3. Win → thread halts, exit blooms gold, victory chime.
4. Lose → red glow + low note; the path you took is shown vs. the thread.
5. `#seed=42` in the URL → same maze every time.

## Aesthetic

Stone-dark blues, golden thread, warm lantern light, fog as soft vignette.
Serif overlay for win/lose lines — give them mythic flavor text.
