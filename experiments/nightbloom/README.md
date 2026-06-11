# nightbloom 🌙

A bioluminescent night garden that lives in a single HTML file.
No dependencies, no build step, no network — just open it.

```
open nightbloom/index.html        # macOS
xdg-open nightbloom/index.html    # Linux
```

Or serve it if you prefer:

```
npx serve nightbloom
```

## What it does

- **Click the earth** (below the horizon) to plant a seed. A luminous plant
  grows in real time — stems branch, leaves unfurl, and every branch tip
  blooms into a glowing flower with a soft pentatonic chime.
- **Click the sky** and a shooting star streaks across with a falling whoosh.
- **Fireflies** wander the meadow and drift toward your flowers.
- **The moon shows tonight's actual phase**, computed from the real date.
- A quiet generative **ambient drone** hums underneath; every bloom plays a
  small arpeggio through a feedback-delay shimmer. All synthesized live with
  the Web Audio API — there are no audio files.
- Gentle **wind** sways every stem, leaf, and petal.

## Keys

| key | action |
| --- | --- |
| `m` | mute / unmute |
| `s` | save the current garden as a PNG |
| `c` | put the garden to sleep (fade everything out) |

## Notes

Six bloom palettes (ember, orchid, lagoon, frost, sunfall, spirit) are chosen
per plant, so no two gardens look alike. Sound starts on your first click —
browsers require a user gesture before audio can play.

Built as an autonomous prototype. Plant something.
