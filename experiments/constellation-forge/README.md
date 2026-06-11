# constellation forge

A star chart with empty mythology. Connect any stars you like; when you
seal the figure, the forge names your constellation — a plausible,
pronounceable star-name with a designation like *δ Ophelia Borealis* —
and engraves its myth in three solemn sentences on a museum-label card.

The legend is forged deterministically from the figure itself: the same
drawing on the same sky always yields the same name and myth. The figure's
traits steer the story — close a loop and the myth turns to crowns and
rings; span the whole sky and a river runs through it; thread many stars
and the tale becomes a long pursuit.

Figures accumulate: seal one, start another, and the chart fills with a
personal mythology until you forge a new sky.

## Run it

Open `index.html` in any browser. One file, zero dependencies, works from
`file://`.

Reproducible skies: add `?seed=1234` to the URL.

## Interactions

- **Click a star** — start a thread (clicks snap to the nearest star).
- **Click more stars** — extend the figure star-to-star; a dashed ghost
  line follows the cursor.
- **Click the last star again** — seal the open figure.
- **Click the first star** — close the loop and seal (expect a crown).

## Keys

| key | action |
| --- | --- |
| `Enter` | seal the current figure |
| `Esc` | abandon the current thread |
| `n` | forge a fresh sky (new seed, engravings cleared) |
| `s` | save a PNG of chart + caption |

## Tests

```
node --test experiments/constellation-forge/
```

Pure logic (`mulberry`, `makeSky`, `nearestStar`, `figureHash`,
`figureTraits`, `forgeName`, `forgeMyth`, `forgeLegend`) lives in
`<script id="logic">` and is unit-tested in Node via
`experiments/_harness/logic.mjs` — no browser needed.
