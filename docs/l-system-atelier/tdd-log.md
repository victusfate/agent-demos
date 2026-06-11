# l-system-atelier — TDD log

Tests: `experiments/l-system-atelier/l-system-atelier.test.mjs` (26 tests)
loading the `<script id="logic">` block via `experiments/_harness/logic.mjs`.

## Slice 1 — expand: parallel string rewriting — DONE

- RED: 5 tests — algae Fibonacci lengths, exact early derivations, n=0
  identity, copy-through of non-rule symbols, parallel (not sequential)
  application. Failed with `expand is not a function`.
- GREEN: `expand(axiom, rules, n)` — per-pass character map. 5/5.
- REFACTOR: none needed.

## Slice 2 — interpret: turtle walk — DONE

- RED: 9 tests — Koch 4ⁿ count, start heading up, chaining, ±angle turn,
  `F[+F]F` push/pop continuation, depth = bracket nesting, `f` gap,
  silent symbols, tight bounds. Failed: `interpret is not a function`.
- GREEN: pure-trig turtle returning `{segments, bounds}`. 14/14.
- REFACTOR: none needed.

## Slice 3 — validate + mutate — DONE

- RED: 8 tests — validate accepts good systems, rejects empty axiom /
  unbalanced brackets / budget blowups; mutate differs textually, leaves
  input untouched, stays expandable across 50 seeds, deterministic per
  seed. Failed: functions missing.
- GREEN: `validate` counts symbols per derivation (no string built) so
  runaway systems abort cheaply; `mutate` flips a turn sign or duplicates
  a bracketed clause, with a graft fallback for featureless rules. 22/22.
- REFACTOR: none needed.

## Slice 4 — PRESETS — DONE

- RED: 4 tests — exactly the six named systems, well-formed shapes that
  validate, 1..60k segments with finite non-degenerate bounds, distinct
  rule sets. Failed: `PRESETS` missing.
- GREEN: classic systems tuned per preset (Fern n=7 → 24,384 segments,
  Dragon n=13 → 8,192, others 3–4k). One mid-slice fix: `validate`
  originally budgeted total symbols at 60k, but the design caps
  *segments*; the Fern's derivation string is ~100k symbols yet only 24k
  segments. `validate` now budgets drawn `F` count at `maxSegments` with
  a generous total-symbol safety cap (≥1M). 26/26.
- REFACTOR: none beyond the budget fix (landed inside the green commit).

## Slice 5 — full visual app + acceptance — DONE

Built around the proven logic: night-sky canvas with twinkling stars and
vignette, persistent plant layer (each frame strokes only newly revealed
segments, so 24k-segment ferns replay smoothly), eased growth replay
(1.8–4.6 s scaled to segment count), ember sparks riding the newest tips,
breathing additive glow once grown, dark glass rule panel bottom-left
(Georgia serif), preset chips, angle slider, iteration stepper, mutate
with highlighted rule diff, one-level back, gentle inline errors, `s`
saves PNG.

Acceptance (headless Chromium via Playwright, `file://`, 1280×800,
pageerror + console-error listeners): all design scenarios pass —

- load → Fern active, 24,384 segments · 4.6 s grow
- all six preset chips derive without error
- angle 25°→90° rederives instantly; chip deselects on custom edit
- mutate ×3 from Bush changes rules with highlighted diff; back restores
- unbalanced-bracket rule → gentle inline error, canvas keeps the last
  good plant, error clears when brackets balance
- full grow completes, canvas verifiably lit, zero page/console errors
- final screenshot saved to `/tmp/exp-l-system-atelier.png`

## Deviations from design.md

- **Segment budget location:** the design's "≤ 60k segments" is enforced
  in `validate` against drawn-segment count (plus a ≥1M total-symbol
  safety cap), not raw string length — matches the design's intent.
- **Depth color ramp normalization:** the ramp normalizes depth against
  the 85th-percentile depth rather than the absolute max, so the canopy
  visibly reaches amber instead of hoarding it in a few deepest tips.
  Bracketless systems (Dragon, Snowflake) ramp along the path index.
- **Mutation side-by-side:** the rule diff is shown as a highlighted
  before → after line in the panel (old span struck rose, new span amber)
  rather than two plants rendered side by side; the lineage comparison
  works through mutate/back replay.
- Everything else (symbol set, pure-logic surface, scenarios, palette,
  panel placement, `s` key) follows the design as written.
