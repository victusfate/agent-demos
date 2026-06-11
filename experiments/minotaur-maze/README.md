# minotaur maze — race the thread

A labyrinth carves itself before your eyes. Then fog falls, a drumbeat
sounds, and Ariadne's golden thread starts snaking toward the exit — while
you run the same maze by lantern light, remembering the way from having
watched it built. Reach the door before the thread and you walk into
daylight; lose, and the thread finds something horned waiting at its end.

One HTML file, zero dependencies, works from `file://`:

```
open experiments/minotaur-maze/index.html
```

## The loop

1. **Carving ballet (~3 s)** — a glowing chisel-head wanders and backtracks,
   carving a perfect 25×17 maze. This is your only look at the whole map.
2. **Fog falls** — the maze vanishes outside your lantern's reach.
3. **The race** — the thread animates the shortest path at a pace tuned so
   a decent run wins by a hair. It smoulders through the fog where it has
   passed; you get a one-beat head start.
4. **Verdict** — win: the door blooms gold with a victory chime. Lose: a
   red glow wakes at the exit, the fog lifts, and your path is laid bare
   against the thread's.

## Keys

| key | action |
| --- | --- |
| arrow keys | run, one cell per step (hold to sprint); walls block |
| `r` | carve a new labyrinth |
| `m` | mute / unmute |

## Seeds

The maze is seeded: the current seed shows bottom-left and lives in the URL
hash, so `index.html#seed=42` reproduces the same labyrinth every load.
Press `r` for a fresh seed.

Sound starts after your first key press or click (browser autoplay policy).

## Under the hood

All maze math — mulberry32 RNG, recursive-backtracker generation with a
carve-order trace, BFS solving, wall-bitmask movement — is pure and DOM-free
in `<script id="logic">`, unit-tested in Node:

```
node --test 'experiments/minotaur-maze/*.test.mjs'
```
