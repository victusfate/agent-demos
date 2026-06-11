# harmonograph

The Victorian drawing machine, resurrected in one HTML file. Two damped
pendulums drive a pen in x and y; the machine draws its figure in real time
with a glowing pen tip — and quietly *sings* the two frequencies it is
drawing, so you hear consonance become geometry. The pen traces about 60
seconds of simulated pendulum time over ~15 real seconds, then holds the
finished plate.

Open `index.html` in any browser — no build, no dependencies, works from
`file://`.

## Interactions

- **Ratio chips** — unison 1:1, octave 1:2, fifth 2:3, fourth 3:4,
  sixth 3:5, and **drift** (a fifth detuned to 2:3.01). Consonant ratios
  draw closed Lissajous-like figures and sound consonant; drift precesses
  like a flower and its chord beats audibly.
- **Phase knob** — the x/y phase relation of the lead pendulums. At unison,
  90° draws a circle and 0° collapses to a line.
- **Damping slider** — how fast the pendulums (and the chord) die away.
  At zero the figure becomes a perfect closed curve and the dyad sustains.
- **New pendulum swing** — re-randomizes amplitudes and phases for a fresh
  plate of the same ratio family.
- Any change restarts the draw.

Sound starts after your first click or tap (browser autoplay policy).

## Keys

| key | action |
| --- | --- |
| `s` | save the plate as PNG |
| `m` | mute / unmute |
| `n` | new pendulum swing |

## Under the hood

The pen position is the closed form
`x(t) = Σᵢ Aᵢ·sin(fᵢt + φᵢ)·e^(−dᵢt)` (same for y), two terms per axis.
The pure math (`pendulumPoint`, `makeParams`, `isClosed`, `period`,
`RATIOS`) lives in the `<script id="logic">` block and is unit-tested in
Node: `node --test 'experiments/harmonograph/*.test.mjs'`.
