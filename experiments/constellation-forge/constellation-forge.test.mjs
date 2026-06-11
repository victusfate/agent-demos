import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLogic } from '../_harness/logic.mjs';

const HTML = new URL('./index.html', import.meta.url).pathname;

// ---------- slice 1: sky generation & star picking ----------

test('mulberry: deterministic per seed, values in [0, 1)', () => {
  const { mulberry } = loadLogic(HTML);
  const a = mulberry(42), b = mulberry(42), c = mulberry(7);
  const seqA = Array.from({ length: 50 }, () => a());
  const seqB = Array.from({ length: 50 }, () => b());
  assert.deepEqual(seqA, seqB, 'same seed must replay the same sequence');
  for (const v of seqA) assert.ok(v >= 0 && v < 1, `value ${v} out of [0,1)`);
  const seqC = Array.from({ length: 50 }, () => c());
  assert.notDeepEqual(seqA, seqC, 'different seeds must diverge');
});

test('makeSky: same seed => identical sky, different seed => different sky', () => {
  const { makeSky } = loadLogic(HTML);
  const s1 = makeSky(123, 800, 600, 140);
  const s2 = makeSky(123, 800, 600, 140);
  const s3 = makeSky(999, 800, 600, 140);
  assert.deepEqual(s1, s2, 'same seed must produce the identical star list');
  assert.notDeepEqual(s1, s3, 'different seeds must produce different skies');
});

test('makeSky: n stars, all within bounds, mags in [0.2, 1]', () => {
  const { makeSky } = loadLogic(HTML);
  const w = 1280, h = 800, n = 140;
  const stars = makeSky(5, w, h, n);
  assert.equal(stars.length, n);
  for (const s of stars) {
    assert.ok(s.x >= 0 && s.x <= w, `x ${s.x} out of bounds`);
    assert.ok(s.y >= 0 && s.y <= h, `y ${s.y} out of bounds`);
    assert.ok(s.mag >= 0.2 && s.mag <= 1, `mag ${s.mag} out of [0.2, 1]`);
  }
});

test('nearestStar: exact index on a crafted layout', () => {
  const { nearestStar } = loadLogic(HTML);
  const stars = [
    { x: 10, y: 10, mag: 1 },
    { x: 100, y: 100, mag: 1 },
    { x: 102, y: 98, mag: 1 },
    { x: 500, y: 500, mag: 1 },
  ];
  assert.equal(nearestStar(stars, 11, 9, 30), 0);
  assert.equal(nearestStar(stars, 99, 101, 30), 1);
  assert.equal(nearestStar(stars, 103, 97, 30), 2);
  assert.equal(nearestStar(stars, 501, 502, 30), 3);
});

test('nearestStar: -1 beyond maxR and on an empty list', () => {
  const { nearestStar } = loadLogic(HTML);
  const stars = [{ x: 10, y: 10, mag: 1 }];
  assert.equal(nearestStar(stars, 200, 200, 30), -1);
  assert.equal(nearestStar(stars, 10 + 31, 10, 30), -1, 'just outside radius');
  assert.equal(nearestStar(stars, 10 + 29, 10, 30), 0, 'just inside radius');
  assert.equal(nearestStar([], 0, 0, 1e9), -1);
});

// ---------- slice 2: figure identity ----------

test('figureHash: deterministic integer, order-sensitive, figure-sensitive', () => {
  const { figureHash } = loadLogic(HTML);
  const fig = [3, 17, 42, 8, 99];
  const h = figureHash(fig);
  assert.equal(typeof h, 'number');
  assert.ok(Number.isInteger(h), 'hash must be an integer');
  assert.equal(figureHash(fig), h, 'same figure must hash identically');
  assert.notEqual(figureHash([...fig].reverse()), h, 'reversed order must differ');
  assert.notEqual(figureHash([3, 17, 42, 8, 100]), h, 'different figure must differ');
  assert.notEqual(figureHash([3, 17, 42, 8]), h, 'prefix figure must differ');
});

test('figureTraits: closed iff first index === last index', () => {
  const { figureTraits, makeSky } = loadLogic(HTML);
  const stars = makeSky(1, 800, 600, 20);
  assert.equal(figureTraits([0, 5, 9, 0], stars, 800, 600).closed, true);
  assert.equal(figureTraits([0, 5, 9, 4], stars, 800, 600).closed, false);
  assert.equal(figureTraits([2], stars, 800, 600).closed, false, 'single star is not a loop');
});

test('figureTraits: stars counts distinct stars', () => {
  const { figureTraits, makeSky } = loadLogic(HTML);
  const stars = makeSky(1, 800, 600, 20);
  assert.equal(figureTraits([0, 5, 9, 0], stars, 800, 600).stars, 3);
  assert.equal(figureTraits([0, 5, 9, 4], stars, 800, 600).stars, 4);
});

test('figureTraits: spanRatio = max pairwise distance over chart diagonal', () => {
  const { figureTraits } = loadLogic(HTML);
  const w = 300, h = 400; // diagonal 500
  const stars = [
    { x: 0, y: 0, mag: 1 },
    { x: 300, y: 400, mag: 1 },
    { x: 150, y: 200, mag: 1 },
  ];
  const t = figureTraits([0, 2, 1], stars, w, h);
  assert.ok(Math.abs(t.spanRatio - 1) < 1e-9, `corner-to-corner should be ~1, got ${t.spanRatio}`);
  const tiny = figureTraits([2], stars, w, h);
  assert.equal(tiny.spanRatio, 0, 'a single star spans nothing');
  const half = figureTraits([0, 2], stars, w, h);
  assert.ok(Math.abs(half.spanRatio - 0.5) < 1e-9, `half-diagonal should be ~0.5, got ${half.spanRatio}`);
});
