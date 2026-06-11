import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLogic } from '../_harness/logic.mjs';

const HTML = new URL('./index.html', import.meta.url).pathname;

// ---------- slice 1: euclid(k, n) ----------

test('euclid(3,8) is the tresillo: x..x..x.', () => {
  const { euclid, patternString } = loadLogic(HTML);
  assert.equal(patternString(euclid(3, 8)), 'x..x..x.');
});

test('euclid(5,8) is the cinquillo: x.xx.xx.', () => {
  const { euclid, patternString } = loadLogic(HTML);
  assert.equal(patternString(euclid(5, 8)), 'x.xx.xx.');
});

test('euclid(4,4) is all hits; euclid(0,n) is all rests', () => {
  const { euclid } = loadLogic(HTML);
  assert.deepEqual(euclid(4, 4), [true, true, true, true]);
  for (const n of [1, 5, 8, 16]) {
    assert.deepEqual(euclid(0, n), new Array(n).fill(false));
  }
});

test('euclid: length n, hit count k, pattern[0] true when k > 0', () => {
  const { euclid } = loadLogic(HTML);
  for (let n = 1; n <= 16; n++) {
    for (let k = 0; k <= n; k++) {
      const p = euclid(k, n);
      assert.equal(p.length, n, `length for E(${k},${n})`);
      assert.equal(p.filter(Boolean).length, k, `count for E(${k},${n})`);
      if (k > 0) assert.equal(p[0], true, `E(${k},${n})[0] must be a hit`);
    }
  }
});

test('euclid: max-even — circular gaps between hits differ by at most 1', () => {
  const { euclid } = loadLogic(HTML);
  for (let n = 2; n <= 16; n++) {
    for (let k = 1; k <= n; k++) {
      const p = euclid(k, n);
      const idx = [];
      p.forEach((v, i) => { if (v) idx.push(i); });
      const gaps = idx.map((v, i) => {
        const next = idx[(i + 1) % idx.length];
        return ((next - v) + n) % n || n;
      });
      const min = Math.min(...gaps), max = Math.max(...gaps);
      assert.ok(max - min <= 1, `E(${k},${n}) gaps ${gaps} not max-even`);
    }
  }
});

test('patternString renders hits as x and rests as .', () => {
  const { patternString } = loadLogic(HTML);
  assert.equal(patternString([true, false, false, true]), 'x..x');
  assert.equal(patternString([]), '');
});

// ---------- slice 2: rotate + scheduleTimes ----------

test('rotate preserves hit count and round-trips at r=0 and r=n', () => {
  const { euclid, rotate } = loadLogic(HTML);
  const p = euclid(5, 16);
  assert.deepEqual(rotate(p, 0), p);
  assert.deepEqual(rotate(p, p.length), p);
  for (const r of [1, 3, 7, 15]) {
    assert.equal(rotate(p, r).filter(Boolean).length, 5, `count after r=${r}`);
  }
});

test('rotate(p, 1) moves each value one step later (circular right shift)', () => {
  const { rotate, patternString } = loadLogic(HTML);
  assert.equal(patternString(rotate([true, false, false, false], 1)), '.x..');
  assert.equal(patternString(rotate([true, true, false, false], 2)), '..xx');
});

test('rotate handles negative r and inverts positive rotation', () => {
  const { euclid, rotate } = loadLogic(HTML);
  const p = euclid(3, 8);
  assert.deepEqual(rotate(rotate(p, 3), -3), p);
  assert.deepEqual(rotate(p, -1), rotate(p, 7));
});

test('scheduleTimes lands offsets on hit indices with stepDur spacing', () => {
  const { euclid, scheduleTimes } = loadLogic(HTML);
  const p = euclid(3, 8); // hits at 0, 3, 6
  const times = scheduleTimes(p, 0.25, 10);
  assert.deepEqual(times, [10, 10.75, 11.5]);
  // spacing between consecutive hits equals (index gap) * stepDur
  assert.ok(Math.abs((times[1] - times[0]) - 3 * 0.25) < 1e-12);
  assert.ok(Math.abs((times[2] - times[1]) - 3 * 0.25) < 1e-12);
});

test('scheduleTimes: every hit index i maps to t0 + i*stepDur, ascending', () => {
  const { euclid, scheduleTimes } = loadLogic(HTML);
  const p = euclid(7, 16);
  const stepDur = 0.125, t0 = 2;
  const times = scheduleTimes(p, stepDur, t0);
  const idx = [];
  p.forEach((v, i) => { if (v) idx.push(i); });
  assert.equal(times.length, idx.length);
  idx.forEach((i, j) => {
    assert.ok(Math.abs(times[j] - (t0 + i * stepDur)) < 1e-12, `hit ${j}`);
    if (j > 0) assert.ok(times[j] > times[j - 1], 'ascending');
  });
});

test('scheduleTimes on an empty pattern is empty', () => {
  const { euclid, scheduleTimes } = loadLogic(HTML);
  assert.deepEqual(scheduleTimes(euclid(0, 8), 0.25, 0), []);
  assert.deepEqual(scheduleTimes([], 0.25, 0), []);
});
