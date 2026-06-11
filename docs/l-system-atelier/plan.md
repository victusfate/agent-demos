# l-system-atelier — implementation plan

Pure logic first, acceptance last. Tests live in
`experiments/l-system-atelier/l-system-atelier.test.mjs` and load the
single `<script id="logic">` block from
`experiments/l-system-atelier/index.html` via
`experiments/_harness/logic.mjs`. Each slice is RED → GREEN → (REFACTOR).

## Slice 1 — expand: parallel string rewriting

- RED: algae system (`A→AB`, `B→A`) lengths follow Fibonacci:
  `|expand('A', rules, n)| === fib(n)` for n = 0..10; non-rule symbols
  (`+`, `-`, `[`, `]`) copy through unchanged; n = 0 returns the axiom.
- GREEN: implement `expand(axiom, rules, n)` in the logic block (IIFE,
  exports via `globalThis.__logic`).

## Slice 2 — interpret: turtle walk to segments + bounds

- RED: Koch curve `F→F+F-F+F` gives 4ⁿ segments after n derivations;
  segments chain (each starts where the previous ended on an unbracketed
  path); `F[+F]F` yields 3 segments and the post-pop segment continues
  from the pre-push position; `f` moves without emitting; depth equals
  bracket nesting; bounds contain every segment endpoint with no slack.
- GREEN: implement `interpret(s, { angle, step })` — pure trig, no canvas.

## Slice 3 — validate + mutate

- RED: `validate` rejects unbalanced brackets, empty axiom, and oversized
  derivations, accepts good input; `mutate(rules, rng)` with a seeded rng
  returns rules that differ textually from the input and still expand
  without throwing (run across many seeds, deterministically).
- GREEN: implement `validate(axiom, rules, n, maxSymbols)` and
  `mutate(rules, rng)` (swap a turn sign, or duplicate a bracketed clause).

## Slice 4 — PRESETS: six shipped systems

- RED: `PRESETS` has exactly Fern, Weed, Bush, Snowflake, Dragon, Sparse;
  each `{axiom, rules, angle, iterations}` expands and interprets without
  error at its shipped iteration count, produces ≥ 1 and ≤ 60k segments,
  and yields finite bounds.
- GREEN: tune the six systems until all pass.

## Slice 5 — acceptance: full visual app

- Build the app script around the proven logic in `index.html`: night
  canvas, progressive growth replay (eased, ~4 s), teal-to-amber depth
  ramp with width taper, dark glass rule panel bottom-left (Georgia
  serif), preset chips, angle/iteration controls, mutate + back with rule
  diff highlight, inline errors keeping the last good plant, `s` saves
  PNG.
- Verify: all unit tests green, then headless Playwright from `file://`
  exercising the PRD scenarios with zero page errors and a final
  screenshot after a full grow.

## Out of scope for unit tests

Canvas rendering, animation timing, and DOM input handling are covered by
the Playwright acceptance run, not unit tests.
