import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLogic } from '../_harness/logic.mjs';

const HTML = new URL('./index.html', import.meta.url).pathname;

// Sample grid used across noise tests — deterministic, off-lattice points.
function* grid(n = 12, span = 7.3) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      yield [i * span / n + 0.137, j * span / n + 0.731];
    }
  }
}

// ---------- slice 1: seeded value noise + fbm ----------

test('makeNoise: same seed gives identical values', () => {
  const { makeNoise } = loadLogic(HTML);
  const a = makeNoise(42), b = makeNoise(42);
  for (const [x, y] of grid()) {
    assert.equal(a(x, y), b(x, y), `mismatch at (${x},${y})`);
  }
});

test('makeNoise: different seeds differ somewhere', () => {
  const { makeNoise } = loadLogic(HTML);
  const a = makeNoise(1), b = makeNoise(2);
  let differs = false;
  for (const [x, y] of grid()) if (a(x, y) !== b(x, y)) { differs = true; break; }
  assert.ok(differs, 'seeds 1 and 2 produced identical fields');
});

test('makeNoise: output stays within [0, 1] across a grid', () => {
  const { makeNoise } = loadLogic(HTML);
  const n = makeNoise(7);
  for (const [x, y] of grid(20, 23.7)) {
    const v = n(x, y);
    assert.ok(v >= 0 && v <= 1, `noise(${x},${y}) = ${v} out of [0,1]`);
  }
});

test('makeNoise: field is not constant', () => {
  const { makeNoise } = loadLogic(HTML);
  const n = makeNoise(3);
  const vals = new Set();
  for (const [x, y] of grid()) vals.add(n(x, y));
  assert.ok(vals.size > 10, `expected variation, got ${vals.size} distinct values`);
});

test('fbm: output stays within [0, 1] and varies', () => {
  const { makeNoise, fbm } = loadLogic(HTML);
  const n = makeNoise(11);
  const vals = new Set();
  for (const [x, y] of grid(16, 15.1)) {
    const v = fbm(n, x, y, 4);
    assert.ok(v >= 0 && v <= 1, `fbm(${x},${y}) = ${v} out of [0,1]`);
    vals.add(v);
  }
  assert.ok(vals.size > 10, 'fbm should vary across the grid');
});

test('fbm: deterministic for the same inputs', () => {
  const { makeNoise, fbm } = loadLogic(HTML);
  const n = makeNoise(5);
  assert.equal(fbm(n, 1.5, 2.5, 4), fbm(n, 1.5, 2.5, 4));
});

// ---------- slice 2: curl field, divergence-free ----------

test('curl: returns finite {vx, vy}', () => {
  const { makeNoise, curl } = loadLogic(HTML);
  const n = makeNoise(9);
  for (const [x, y] of grid()) {
    const v = curl(n, x, y, 0.01);
    assert.ok(Number.isFinite(v.vx), `vx not finite at (${x},${y})`);
    assert.ok(Number.isFinite(v.vy), `vy not finite at (${x},${y})`);
  }
});

test('curl: numerical divergence is ~0 across sampled points', () => {
  const { makeNoise, fbm, curl } = loadLogic(HTML);
  const n = makeNoise(13);
  const field = (x, y) => fbm(n, x, y, 3);
  const eps = 0.01;
  for (const [x, y] of grid(10, 5.9)) {
    const xp = curl(field, x + eps, y, eps), xm = curl(field, x - eps, y, eps);
    const yp = curl(field, x, y + eps, eps), ym = curl(field, x, y - eps, eps);
    const div = (xp.vx - xm.vx) / (2 * eps) + (yp.vy - ym.vy) / (2 * eps);
    assert.ok(Math.abs(div) < 1e-3, `divergence ${div} at (${x},${y})`);
  }
});

test('curl: field is non-trivial (some |v| > 0)', () => {
  const { makeNoise, curl } = loadLogic(HTML);
  const n = makeNoise(21);
  let maxMag = 0;
  for (const [x, y] of grid()) {
    const v = curl(n, x, y, 0.01);
    maxMag = Math.max(maxMag, Math.hypot(v.vx, v.vy));
  }
  assert.ok(maxMag > 0, 'curl field is identically zero');
});

test('curl: matches the perpendicular gradient (dn/dy, -dn/dx)', () => {
  const { curl } = loadLogic(HTML);
  // analytic field n = x*y: dn/dy = x, dn/dx = y -> curl = (x, -y)
  const n = (x, y) => x * y;
  const v = curl(n, 2, 3, 0.001);
  assert.ok(Math.abs(v.vx - 2) < 1e-6, `vx ${v.vx} != 2`);
  assert.ok(Math.abs(v.vy + 3) < 1e-6, `vy ${v.vy} != -3`);
});
