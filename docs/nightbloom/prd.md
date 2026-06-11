# nightbloom — PRD

## Problem

Demonstrate that a delightful, audio-visual generative toy can ship as one
dependency-free HTML file, and establish the repo's pattern for testable
single-file experiments.

## Goals

1. A night garden the user grows by clicking; every interaction is rewarded
   visually and musically within 100 ms.
2. Zero dependencies, zero build, zero network: `open index.html` is the
   entire install story.
3. Pure logic is unit-testable in Node via the shared logic-block harness.

## Non-goals

- Persistence, sharing, mobile-specific UI, settings, accessibility audit.
- Photoreal rendering or physics; this is a mood piece.

## Functional requirements

- **FR1 — planting:** pointer press at `y >= horizon` creates a plant at the
  press point (clamped just below the horizon). Plants animate growth.
- **FR2 — meteors:** pointer press at `y < horizon` spawns a shooting star
  with a trail and a descending whoosh.
- **FR3 — blooms:** every branch tip blooms exactly one flower; the bloom
  fires once (sparkles + chime), then the flower breathes and glows.
- **FR4 — moon:** the moon shows the real current phase, computed from the
  synodic month anchored at the 2000-01-06 new moon, rendered as a clipped
  shadow disc.
- **FR5 — sound:** continuous low drone; pentatonic chimes (A-minor
  pentatonic from A3) on plant and bloom; all through a feedback-delay wet
  bus. `m` toggles the master bus.
- **FR6 — keys:** `m` mute, `s` save PNG, `c` fade all plants out.
- **FR7 — cap:** at 50 plants, the oldest non-fading plant starts fading.
- **FR8 — testability:** `moonPhase`, `hexA`, `clamp`, `ease`, `pop`,
  `freq`/`SCALE`, and `PALETTES` are exported from the logic block via
  `globalThis.__logic`.

## Quality requirements

- 60 fps target on a mid-size window; particle counts bounded (≤36 fireflies,
  sparkle/meteor arrays self-pruning).
- No console errors in a headless Chromium run.
- `node --test experiments/nightbloom/` passes.

## Acceptance

Headless Playwright run: 5 ground clicks + 1 sky click produce 5 plants,
≥5 fired flowers, a meteor, an AudioContext, and no page errors.
