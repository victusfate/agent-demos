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
