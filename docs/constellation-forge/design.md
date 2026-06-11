# constellation-forge — design

## Concept

A star chart with empty mythology. Connect any stars you like; when you
finish, the forge names your constellation — a plausible, pronounceable
star-name — and writes its myth in three solemn sentences. Cartography as a
creative act.

## Q&A (auto-resolved)

**Q: Core interaction?** A seeded field of ~140 stars (varied magnitude,
slight twinkle). Click a star to start a thread; subsequent clicks extend
the line star-to-star (click snaps to the nearest star within a radius).
Click the last star again — or press Enter — to seal the figure. The forge
then engraves: name, designation (e.g. "δ Ophelia Borealis"), and a
three-sentence myth, all derived deterministically from the figure itself
(which stars, how many, total span). `n` starts a fresh sky (new seed),
`s` saves a PNG of chart + caption.

**Q: Where do names come from?** A syllable grammar (onset+vowel+coda pools
mixed Latin/Greek flavor) seeded by the figure hash, so the same drawing on
the same sky always forges the same legend. Myths come from a template
grammar with slots (hero, beast, gift, betrayal, celestial reward) filled
from word pools by the same RNG.

**Q: What's surprising?** That it *names what you drew*: figure properties
steer the myth — many stars ⇒ "a long pursuit", a closed loop ⇒ "a crown",
a long span ⇒ "a river". The text feels weirdly apt.

## Pure logic

- `mulberry(seed)` — RNG.
- `makeSky(seed, w, h, n)` — deterministic star list `{x, y, mag}`.
- `nearestStar(stars, x, y, maxR)` — index or −1.
- `figureHash(indices)` — order-sensitive integer hash.
- `forgeName(rng)` — capitalized, 2–4 syllables, pronounceable
  (alternates consonant/vowel clusters from pools).
- `forgeMyth(rng, traits)` — traits = `{stars, closed, spanRatio}`; returns
  three sentences; must mention the forged name and reflect at least one
  trait via its template choice.
- `figureTraits(indices, stars, w, h)` — computes the traits object.

### Tests must assert

- Same seed ⇒ identical sky; stars within bounds; mags in range.
- `nearestStar` exact on a crafted layout; −1 beyond maxR.
- `figureHash` differs for reversed order and for different figures.
- `forgeName` deterministic per rng seed, matches `/^[A-Z][a-z]+$/` -ish
  pronounceability pattern (no 3+ consonant runs).
- `forgeMyth` deterministic, three sentences, contains the name; closed
  figures select crown/ring templates (assert via trait-dependent marker).
- `figureTraits.closed` true iff first index === last index.

## Vocabulary

| term | meaning |
| --- | --- |
| **sky** | the seeded star field |
| **thread** | the in-progress polyline of chosen stars |
| **seal** | finishing the figure (re-click last star / Enter) |
| **engrave** | rendering name + designation + myth on the chart card |
| **traits** | `{stars, closed, spanRatio}` — figure → myth steering |

## Scenarios

1. Connect five stars in an arc, seal → "Vessara — the Oar of the Drowned
   King" style result with a 3-sentence myth.
2. Close a loop → crown/ring-flavored myth.
3. Seal, then start a new thread on the same sky → both figures stay
   engraved; the chart accumulates a personal mythology.
4. `n` → fresh sky, engravings cleared.

## Aesthetic

Parchment-on-night: chart lines in faded gold, star glints, the caption in
a serif card like a museum label. Lines draw with a slow luminous sweep.
