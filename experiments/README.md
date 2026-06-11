# experiments 🎪

A growing cabinet of self-contained browser toys. Every experiment follows
the same contract:

- **One directory, one world.** `experiments/<slug>/index.html` is the whole
  app — zero dependencies, zero build, works from `file://`.
- **Pure logic is testable.** Each `index.html` keeps its DOM-free math in a
  `<script id="logic">` block that exports `globalThis.__logic`. The shared
  harness (`_harness/logic.mjs`) extracts and evals that block in Node.
- **Tests sit next to the app**: `experiments/<slug>/<slug>.test.mjs`, run
  with `npm run test:experiments` (plain `node --test`).
- **Docs live in `/docs/<slug>/`**: design.md → prd.md → plan.md → tdd-log.md.

## Browse

Open `experiments/index.html` — the gallery — or serve the repo and navigate:

```
npx http-server .          # then visit /experiments/
```

(When served over http, the gallery dims experiments whose branches haven't
merged yet.)

## Adding an experiment

1. Write `docs/<slug>/design.md`, then PRD, then a sliced plan.
2. TDD the logic block: RED test → GREEN export → refactor.
3. Build the visuals around the proven logic. Keep the night aesthetic.
4. Add a card to `experiments/index.html`.
5. Branch per experiment, PR per branch.
