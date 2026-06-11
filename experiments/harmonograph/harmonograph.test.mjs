import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLogic } from '../_harness/logic.mjs';

const HTML = new URL('./index.html', import.meta.url).pathname;
const TAU = Math.PI * 2;

// ---------- slice 1: ratios and period ----------

test('RATIOS: the six named ratios with their {p, q}', () => {
  const { RATIOS } = loadLogic(HTML);
  const byName = Object.fromEntries(RATIOS.map(r => [r.name, r]));
  const want = {
    unison: [1, 1], octave: [1, 2], fifth: [2, 3],
    fourth: [3, 4], sixth: [3, 5], drift: [2, 3],
  };
  for (const [name, [p, q]] of Object.entries(want)) {
    assert.ok(byName[name], `missing ratio ${name}`);
    assert.equal(byName[name].p, p, `${name}.p`);
    assert.equal(byName[name].q, q, `${name}.q`);
  }
  assert.equal(byName.drift.detune, 0.01, 'drift detune');
  for (const r of RATIOS) {
    if (r.name !== 'drift') assert.ok(!r.detune, `${r.name} must not detune`);
  }
});

test('gcd: greatest common divisor', () => {
  const { gcd } = loadLogic(HTML);
  assert.equal(gcd(2, 3), 1);
  assert.equal(gcd(2, 4), 2);
  assert.equal(gcd(12, 18), 6);
  assert.equal(gcd(7, 7), 7);
});

test('period: 2π / gcd(p, q) — pendulum frequencies are p and q on a unit base', () => {
  const { period } = loadLogic(HTML);
  // The 1:2 figure closes after the longer (slower) pendulum's full cycle.
  assert.equal(period({ p: 1, q: 2 }), TAU);
  assert.equal(period({ p: 2, q: 3 }), TAU / 1);
  assert.equal(period({ p: 2, q: 4 }), TAU / 2);
  assert.equal(period({ p: 3, q: 5 }), TAU / 1);
});
