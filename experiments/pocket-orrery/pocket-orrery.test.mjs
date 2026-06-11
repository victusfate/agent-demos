import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLogic } from '../_harness/logic.mjs';

const HTML = new URL('./index.html', import.meta.url).pathname;
const TAU = Math.PI * 2;

const sun = (mass = 1e6, radius = 26) =>
  ({ x: 0, y: 0, vx: 0, vy: 0, mass, radius, hue: 45, fixed: true });
const planet = (over = {}) =>
  ({ x: 200, y: 0, vx: 0, vy: 0, mass: 8, radius: 6, hue: 200, fixed: false, ...over });

// ---------- slice 1 — gravity and integration ----------

test('gravityAccel: pull points toward the attractor', () => {
  const { gravityAccel } = loadLogic(HTML);
  const bodies = [sun(), planet({ x: 200, y: 0 })];
  const a = gravityAccel(bodies[1], bodies, 1);
  assert.ok(a.ax < 0, `ax should point at the sun, got ${a.ax}`);
  assert.ok(Math.abs(a.ay) < Math.abs(a.ax) * 1e-9, 'pure radial pull has no tangential part');
});

test('gravityAccel: magnitude is ~G*M/r^2 at moderate distance', () => {
  const { gravityAccel } = loadLogic(HTML);
  const G = 1, M = 1e6, r = 200;
  const bodies = [sun(M), planet({ x: r, y: 0 })];
  const a = gravityAccel(bodies[1], bodies, G);
  const mag = Math.hypot(a.ax, a.ay);
  const expected = G * M / (r * r);
  assert.ok(Math.abs(mag - expected) / expected < 0.01,
    `|a|=${mag}, expected ~${expected} (softening must be negligible at r=${r})`);
});

test('gravityAccel: a body does not attract itself', () => {
  const { gravityAccel } = loadLogic(HTML);
  const lone = planet({ x: 50, y: -30, mass: 100 });
  const a = gravityAccel(lone, [lone], 1);
  assert.equal(a.ax, 0);
  assert.equal(a.ay, 0);
});

test('stepBodies: the fixed sun never moves', () => {
  const { stepBodies } = loadLogic(HTML);
  let bodies = [sun(), planet({ x: 120, y: 80, vx: 30, vy: -40 })];
  for (let i = 0; i < 500; i++) bodies = stepBodies(bodies, 0.01, 1);
  assert.equal(bodies[0].x, 0);
  assert.equal(bodies[0].y, 0);
  assert.equal(bodies[0].vx, 0);
  assert.equal(bodies[0].vy, 0);
});

test('stepBodies: a free body accelerates toward the sun', () => {
  const { stepBodies } = loadLogic(HTML);
  let bodies = [sun(), planet({ x: 200, y: 0, vx: 0, vy: 0 })];
  bodies = stepBodies(bodies, 0.01, 1);
  assert.ok(bodies[1].vx < 0, 'gains inward velocity');
  assert.ok(bodies[1].x < 200, 'moves inward (semi-implicit: x uses updated v)');
});

test('stepBodies: circular-orbit speed sqrt(G*M/r) holds radius within ±5% over 3 orbits', () => {
  const { stepBodies } = loadLogic(HTML);
  const G = 1, M = 1e6, r = 200;
  const v = Math.sqrt(G * M / r);
  let bodies = [sun(M), planet({ x: r, y: 0, vx: 0, vy: v })];
  const dt = 0.005;
  const period = TAU * r / v;
  const steps = Math.ceil(3 * period / dt);
  for (let i = 0; i < steps; i++) {
    bodies = stepBodies(bodies, dt, G);
    const rr = Math.hypot(bodies[1].x, bodies[1].y);
    assert.ok(Math.abs(rr - r) / r < 0.05, `radius ${rr} drifted >5% from ${r} at step ${i}`);
  }
});
