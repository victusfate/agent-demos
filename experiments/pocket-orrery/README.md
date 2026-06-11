# pocket orrery

A toy solar system in one HTML file. A sun burns at the center; you fling
planets into the void and real Newtonian n-body gravity decides whether they
orbit, collide, or escape. Every completed revolution hums a pentatonic note
— a stable system literally becomes a melody, and resonant orbits become
rhythm.

## Run

Open `index.html` in any modern browser. No build, no dependencies, no
network — `file://` works.

## Interactions

- **Press–drag–release** anywhere: the press sets the spawn point, the drag
  vector sets the launch velocity. While dragging you see an aiming line and
  a predicted-path ghost simulated with the same integrator.
- **Tangential drag** at medium distance → a near-circular orbit and a
  steady note, once per revolution (heavier planets sing lower).
- **Drag straight at the sun** → the planet falls in and merges; the sun
  flares, grows slightly, and a low thump sounds.
- **Crossing paths** → planets merge, conserving mass and momentum exactly;
  the survivor is heavier, bigger (volume-conserving radius), and lower-
  voiced.
- **Wild fling** → a comet-like ellipse, or escape (culled silently beyond
  ~3× the viewport).

## Keys

| key | action |
| --- | --- |
| `c` | clear all planets |
| `m` | mute / unmute |

Audio starts only after your first press (browser autoplay policy).

## Under the hood

The pure physics and music mapping (`stepBodies`, `gravityAccel`,
`mergeBodies`, `orbitCount`, `noteForMass`, `SCALE`) live in the
`<script id="logic">` block and are unit-tested in Node:

```
node --test experiments/pocket-orrery/
```
