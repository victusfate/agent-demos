# pocket-orrery — design

## Concept

A toy solar system in your pocket. A sun burns at the center; you fling
planets into the void and real Newtonian gravity decides whether they orbit,
collide, or escape. Each planet hums a note when it completes an orbit — a
stable system literally becomes a melody.

## Q&A (auto-resolved)

**Q: Core interaction?** Press-drag-release anywhere: press sets the spawn
point, the drag vector sets initial velocity (shown as an aiming line with a
predicted-path ghost). Release births the planet.

**Q: Real physics or faked?** Real n-body: every body attracts every body
(sun dominant). Semi-implicit Euler at fixed dt. Planets that collide merge,
conserving mass and momentum. Escapees beyond ~3× the viewport are culled.

**Q: How does sound work?** Each planet is assigned a pentatonic degree by
mass (heavier = lower). When its angle around the sun completes a full
revolution, it plays its note. Merges play a low thump.

**Q: What's surprising?** Stable two-planet resonances turn into actual
rhythmic patterns; the user composes music by doing orbital mechanics.

## Pure logic (the `<script id="logic">` surface)

- `stepBodies(bodies, dt, G)` — returns new array; mutating is fine if
  documented. Sun is `bodies[0]`, `fixed: true`.
- `gravityAccel(target, bodies, G)` — acceleration vector.
- `mergeBodies(a, b)` — mass-sum, momentum-conserving velocity, radius from
  mass^(1/3).
- `orbitCount(prevAngle, newAngle, count)` — winding detection helper.
- `noteForMass(mass, scale)` — heavier → lower degree.

### Tests must assert

- A body given the circular-orbit speed `sqrt(G*M/r)` stays within ±5% of
  its radius over many steps.
- Momentum and mass conserved exactly by `mergeBodies`.
- `noteForMass` is monotonic (more mass → lower or equal note).
- Winding detection counts a full revolution exactly once.

## Vocabulary

| term | meaning |
| --- | --- |
| **body** | `{x, y, vx, vy, mass, radius, hue, fixed}` |
| **fling** | press-drag-release gesture; drag vector × constant = v₀ |
| **ghost** | predicted path preview drawn during the drag |
| **winding** | accumulated angle around the sun; 2π = one orbit = one note |

## Scenarios

1. Drag tangentially at medium distance → near-circular orbit, steady note.
2. Drag straight at the sun → planet falls in, merges, sun grows slightly.
3. Two planets crossing paths → merge flash + thump, new heavier planet.
4. Wild fling → comet-like ellipse or escape (culled silently).

## Aesthetic

Deep-space night palette consistent with the gallery; sun with corona
gradient, planets with soft glow and faded trails (~200 points). Serif UI,
minimal: a hint line and `c` to clear, `m` to mute.
