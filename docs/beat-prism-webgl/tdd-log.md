# TDD log: beat-prism-webgl

## Slice 1 — pass plan core (order, gating, minimal plan)
- Status: done
- Notes: `buildPassPlan` + `passLive` in `__logic`; fold passes carry a
  `members` array (observable gating without uniform math, which lands in
  slice 2). 82 tests green.
