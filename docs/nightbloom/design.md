# nightbloom — design

## Concept

A bioluminescent night garden in a single zero-dependency HTML file. Clicking
the earth plants a procedural glowing flower; clicking the sky launches a
shooting star. A generative Web Audio score accompanies every interaction.

## Q&A (auto-resolved — prototype built in auto mode)

**Q: What is the core interaction?**
A: One pointer press. Below the horizon it plants a seed; above it spawns a
meteor. No menus, no modes.

**Q: How does a plant grow?**
A: Geometry is generated up front (recursive branches with jitter and an
upward pull), then revealed over time by each branch's `startAge`/`growDur`.
Every branch tip earns exactly one flower.

**Q: Where does sound come from?**
A: Synthesized live — no audio files. A low drone pad plays continuously;
planting and blooming trigger pentatonic chimes routed through a
feedback-delay shimmer. Audio starts on first gesture (browser autoplay rules).

**Q: What makes it surprising?**
A: The moon renders tonight's *actual* phase from the system date; the sky
click is undocumented in the UI ("click the sky and see what happens").

**Q: How is a canvas app tested?**
A: Pure logic lives in a `<script id="logic">` block that exports via
`globalThis.__logic`. A shared harness extracts and evals that block in Node,
so moon-phase math, color helpers, easings, and the musical scale are unit
tested without a DOM.

**Q: Dependencies / build?**
A: None. Open `index.html` from disk. This constraint is a feature.

## Decisions

- Single file, inline script, no modules (works over `file://`).
- Cap of 50 plants; the oldest fades when the cap is hit.
- Plant cap, growth speed, palette count are constants, not settings.
- Keys: `m` mute, `s` save PNG, `c` clear. No other chrome.

## Canonical vocabulary

| term | meaning |
| --- | --- |
| **horizon** | y-coordinate splitting sky (meteors) from earth (plants), 72% of height |
| **plant** | one click's worth of branches, leaves, and flowers |
| **branch** | a polyline grown over `growDur` seconds starting at `startAge` |
| **bloom** | the moment a flower's `bloomAge` passes; fires sparkles + chime |
| **palette** | one of six named petal color sets (ember, orchid, lagoon, frost, sunfall, spirit) |
| **logic block** | the `<script id="logic">` element holding pure, Node-testable functions |
| **sway** | wind displacement, a function of height above the plant base and time |

## Scenarios

1. First visit → title overlay; first click fades it, starts audio, plants or
   launches depending on horizon.
2. Click below horizon → plant grows ~1–3 s, flowers pop with easeOutBack,
   chime arpeggio per bloom.
3. Click above horizon → meteor streaks with trail and a falling whoosh.
4. 51st plant → oldest plant fades out over 1.5 s.
5. `s` → PNG of the current canvas downloads.
