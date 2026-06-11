import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLogic } from '../_harness/logic.mjs';

const HTML = new URL('./index.html', import.meta.url).pathname;

// ---------- slice 1 — flux and band energy ----------

test('spectralFlux: sums only positive per-bin differences', () => {
  const { spectralFlux } = loadLogic(HTML);
  // bin0 +5, bin1 -3 (ignored), bin2 +2 — no bass weighting (bassBins 0)
  assert.equal(spectralFlux([10, 10, 10], [15, 7, 12], 0), 7);
});

test('spectralFlux: bins below bassBins count twice', () => {
  const { spectralFlux } = loadLogic(HTML);
  // bin0 +5 doubled, bin1 +5 doubled, bin2 +5 single → 25
  assert.equal(spectralFlux([0, 0, 0], [5, 5, 5], 2), 25);
});

test('spectralFlux: non-increasing spectrum yields zero', () => {
  const { spectralFlux } = loadLogic(HTML);
  assert.equal(spectralFlux([9, 9, 9, 9], [9, 8, 0, 9], 2), 0);
});

test('spectralFlux: identical spectra yield zero', () => {
  const { spectralFlux } = loadLogic(HTML);
  const s = [3, 1, 4, 1, 5, 9, 2, 6];
  assert.equal(spectralFlux(s, s, 3), 0);
});

test('bandEnergy: mean magnitude over [lo, hi)', () => {
  const { bandEnergy } = loadLogic(HTML);
  assert.equal(bandEnergy([10, 20, 30, 40], 1, 3), 25); // (20+30)/2
  assert.equal(bandEnergy([10, 20, 30, 40], 0, 4), 25);
});

test('bandEnergy: hi is exclusive and clamped; empty range is 0', () => {
  const { bandEnergy } = loadLogic(HTML);
  assert.equal(bandEnergy([10, 20, 30], 2, 99), 30); // clamps hi to length
  assert.equal(bandEnergy([10, 20, 30], 2, 2), 0);   // empty range
});
