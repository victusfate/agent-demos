import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLogic } from '../_harness/logic.mjs';

const HTML = new URL('./index.html', import.meta.url).pathname;

// ---------- slice 1: seeded RNG and maze generation ----------

test('mulberry: same seed yields an identical sequence', () => {
  const { mulberry } = loadLogic(HTML);
  const a = mulberry(42), b = mulberry(42);
  for (let i = 0; i < 100; i++) assert.equal(a(), b());
});

test('mulberry: different seeds yield different sequences', () => {
  const { mulberry } = loadLogic(HTML);
  const a = mulberry(1), b = mulberry(2);
  let same = true;
  for (let i = 0; i < 20; i++) if (a() !== b()) same = false;
  assert.ok(!same, 'seeds 1 and 2 produced identical 20-value prefixes');
});

test('mulberry: outputs stay in [0, 1)', () => {
  const { mulberry } = loadLogic(HTML);
  const r = mulberry(7);
  for (let i = 0; i < 1000; i++) {
    const v = r();
    assert.ok(v >= 0 && v < 1, `value ${v} out of range`);
  }
});

test('generateMaze: returns walls Uint8Array of w*h plus dimensions', () => {
  const { generateMaze } = loadLogic(HTML);
  const m = generateMaze(9, 7, 3);
  assert.ok(m.walls instanceof Uint8Array);
  assert.equal(m.walls.length, 9 * 7);
  assert.equal(m.w, 9);
  assert.equal(m.h, 7);
  assert.ok(Array.isArray(m.carveOrder));
});

test('generateMaze: perfection — exactly w*h-1 carved openings', () => {
  const { generateMaze } = loadLogic(HTML);
  for (const [w, h, seed] of [[5, 5, 1], [25, 17, 42], [12, 9, 99]]) {
    const m = generateMaze(w, h, seed);
    // each carved opening clears one bit on each of the two cells it joins
    let cleared = 0;
    for (const cell of m.walls) {
      for (const bit of [1, 2, 4, 8]) if (!(cell & bit)) cleared++;
    }
    assert.equal(cleared, 2 * (w * h - 1), `maze ${w}x${h} seed ${seed} is not a tree`);
  }
});

test('generateMaze: same seed reproduces identical walls and carveOrder', () => {
  const { generateMaze } = loadLogic(HTML);
  const a = generateMaze(25, 17, 42);
  const b = generateMaze(25, 17, 42);
  assert.deepEqual(Array.from(a.walls), Array.from(b.walls));
  assert.deepEqual(a.carveOrder, b.carveOrder);
});

test('generateMaze: different seeds produce different walls', () => {
  const { generateMaze } = loadLogic(HTML);
  const a = generateMaze(25, 17, 1);
  const b = generateMaze(25, 17, 2);
  assert.notDeepEqual(Array.from(a.walls), Array.from(b.walls));
});

test('generateMaze: carveOrder visits every cell, starting at cell 0', () => {
  const { generateMaze } = loadLogic(HTML);
  const m = generateMaze(10, 8, 5);
  assert.equal(m.carveOrder[0], 0, 'carve must start at the entrance');
  const seen = new Set(m.carveOrder);
  assert.equal(seen.size, 10 * 8, 'carveOrder must visit every cell at least once');
});
