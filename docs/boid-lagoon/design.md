# boid-lagoon — design

## Concept

A midnight aquarium that thinks as a flock. Sixty fish school by Reynolds'
three rules; you can feed them, and you can click to release a predator and
watch the school explode into a silver panic, reform, and forget.

## Q&A (auto-resolved)

**Q: Core interaction?** Move the pointer: fish are gently curious about it.
Press and hold: food particles sink from the pointer and fish break school to
feed. Click (quick tap) in open water: a predator spawns, hunts for ~8
seconds, then sinks away. `m` mute, `+/-` school size.

**Q: The boid model?** Classic separation / alignment / cohesion within a
neighbor radius, plus: flee(predator) with high weight, seek(food), soft
wall avoidance, speed clamp between min and max (fish never stall).

**Q: Sound?** A quiet underwater pad (filtered noise + slow sine). Feeding
makes tiny plinks; the predator entrance is a low sub swell.

**Q: What's surprising?** The school has moods — the same rules produce
lazy milling, tight torus rotation, and streaming rivers depending on what
you did last. Watching panic propagate as a wave through neighbors.

## Pure logic

- `separation(boid, neighbors)`, `alignment(boid, neighbors)`,
  `cohesion(boid, neighbors)` — steering vectors.
- `limit(v, max)` and `clampSpeed(v, min, max)`.
- `flee(boid, threat, radius)` — zero outside radius, away-vector inside.
- `stepBoid(boid, neighbors, env, weights, dt)` — combines all, returns new
  boid; env = `{food[], predator?, bounds}`.

### Tests must assert

- Cohesion steers toward the neighbor centroid; separation steers away from
  a too-close neighbor; alignment matches average heading direction.
- `clampSpeed` never returns speed outside [min, max] (and preserves
  direction for nonzero v).
- `flee` is zero beyond radius, nonzero and pointing away inside it.
- A small school stepped many times stays inside bounds and keeps
  min ≤ speed ≤ max for every fish.

## Vocabulary

| term | meaning |
| --- | --- |
| **boid** | one fish `{x, y, vx, vy, hue, wiggle}` |
| **school** | all boids; neighbor radius defines who influences whom |
| **panic wave** | flee response propagating via alignment, not scripting |
| **lagoon** | the bounded water; soft repulsion near edges, no wrapping |

## Scenarios

1. Idle → school mills in slow, shifting formations among light shafts.
2. Hold pointer → food sinks; nearest fish dart in, plink, school loosens.
3. Tap → predator (bigger, darker, red-eyed) chases nearest fish; school
   splits around it like water; predator never catches anyone — terror only.
4. `+` to 120 fish still runs at 60 fps (O(n²) is fine at this n; use a
   simple spatial grid only if needed).

## Aesthetic

Deep teal-black water, god-rays from above, fish as slim glowing chevrons
with tail wiggle; bubbles. Nightbloom-consistent serif hints.
