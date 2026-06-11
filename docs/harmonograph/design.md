# harmonograph — design

## Concept

The Victorian drawing machine, resurrected. Two damped pendulums drive a pen
in x and y; a third sways the table. The machine draws its figure in real
time with a glowing pen — and quietly *sings* the two frequencies it is
drawing, so you hear consonance become geometry.

## Q&A (auto-resolved)

**Q: The model?** Classic harmonograph:
`x(t) = Σᵢ Aᵢ·sin(fᵢt + φᵢ)·e^(−dᵢt)` for the x-pendulums, same form for y.
Ship with 2 pendulums per axis (4 total terms). Rational frequency ratios
(1:2, 2:3, 3:4, 5:6…) give closed Lissajous-like figures; tiny detunings
give the precessing spirograph look that makes harmonographs famous.

**Q: Core interaction?** A control card: ratio chips (unison 1:1, octave
1:2, fifth 2:3, fourth 3:4, sixth 3:5, "drift" = 2:3.01), phase knob,
damping slider, and a "new pendulum swing" button that re-randomizes
amplitudes/phases tastefully. The pen draws ~60 s of simulated time over
~15 real seconds, then holds the finished plate. Any change restarts the
draw. `s` saves PNG, `m` mutes.

**Q: The sound?** Two very quiet sines at audio-scaled f₁ and f₂ (e.g.
×110 Hz), with the same exponential decay as the pendulums — the figure
and the chord fade together. Consonant ratios sound consonant; "drift"
beats audibly while its figure precesses. That's the surprise: you *hear*
why the pretty ones are pretty.

## Pure logic

- `pendulumPoint(t, params)` — `{x, y}` for
  `params = {xTerms: [{A, f, phi, d}…], yTerms: […]}`.
- `makeParams(ratio, opts, rng)` — builds tasteful terms for a named ratio;
  deterministic given rng.
- `isClosed(params, T, eps)` — with zero damping, does the figure return to
  its start after period T?
- `period(ratio)` — fundamental period `2π / gcd-frequency` for rational
  `{p, q}` ratios.
- `RATIOS` — the named ratio list with `{p, q}` (drift expressed as
  `{p: 2, q: 3, detune: 0.01}`).

### Tests must assert

- At t=0 with zero phases, x = ΣAᵢ·sin(φᵢ)=0; with φ=π/2 x = ΣAᵢ.
- Envelope decays: |point(t)| amplitude bound is non-increasing in t for
  pure single-term params with d > 0.
- `isClosed` true for undamped 2:3 at T = period(2:3), false at T/2.
- `period({p:1,q:2})` = 2π (for unit base frequency) — i.e., the figure
  closes after the longer pendulum's full cycle; assert exact relation
  `period = 2π·p·q / gcd(p,q)` convention chosen and documented.
- `makeParams` deterministic per seed; respects the requested ratio
  (f-quotient of the two x terms equals p/q ± detune).

## Vocabulary

| term | meaning |
| --- | --- |
| **term** | one damped sinusoid `{A, f, phi, d}` |
| **plate** | a finished drawing held on screen |
| **ratio** | rational frequency relation between the two main pendulums |
| **drift** | a deliberately detuned ratio causing precession + beating |
| **swing** | one re-randomization of amplitudes and phases |

## Scenarios

1. Load → fifth (2:3) draws itself over ~15 s, a soft just-intonation dyad
   fading with the ink.
2. Chip "drift" → the figure precesses like a flower; the chord beats.
3. Damping → 0 → figure becomes a perfect closed curve, chord sustains.
4. "New swing" 5× → five different plates of the same ratio family.

## Aesthetic

Ivory ink line (with subtle hue shift along its length) on near-black;
the pen tip is a small bright bead with a faint glow. Control card bottom
left, serif, unobtrusive.
