import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLogic } from '../_harness/logic.mjs';

const HTML = new URL('./index.html', import.meta.url).pathname;

// ---------- slice 1 — rule parsing ----------

test('parseRule: Life B3/S23 round-trips to birth {3}, survive {2,3}', () => {
  const { parseRule } = loadLogic(HTML);
  const r = parseRule('B3/S23');
  assert.deepEqual([...r.birth].sort(), [3]);
  assert.deepEqual([...r.survive].sort(), [2, 3]);
});

test('parseRule: Seeds B2/S has an empty survive set', () => {
  const { parseRule } = loadLogic(HTML);
  const r = parseRule('B2/S');
  assert.deepEqual([...r.birth], [2]);
  assert.equal(r.survive.size, 0);
});

test('parseRule: tolerant of lowercase and mixed case', () => {
  const { parseRule } = loadLogic(HTML);
  const r = parseRule('b36/s23');
  assert.deepEqual([...r.birth].sort(), [3, 6]);
  assert.deepEqual([...r.survive].sort(), [2, 3]);
});

test('parseRule: rejects malformed input with a clear error', () => {
  const { parseRule } = loadLogic(HTML);
  for (const bad of ['banana', '', 'B3', 'S23/B3', 'B3/S23/X', 'B9/S2']) {
    assert.throws(() => parseRule(bad), Error, `expected throw for ${JSON.stringify(bad)}`);
  }
});

test('PRESETS: six temperament-labeled rules, all parseable', () => {
  const { parseRule, PRESETS } = loadLogic(HTML);
  assert.equal(PRESETS.length, 6);
  const rules = new Set(PRESETS.map(p => p.rule.toUpperCase()));
  for (const want of ['B3/S23', 'B36/S23', 'B2/S', 'B3678/S34678', 'B3/S12345', 'B3/S45678']) {
    assert.ok(rules.has(want), `missing preset ${want}`);
  }
  const labels = new Set();
  for (const p of PRESETS) {
    assert.equal(typeof p.name, 'string');
    assert.equal(typeof p.temperament, 'string');
    assert.doesNotThrow(() => parseRule(p.rule));
    labels.add(p.temperament);
  }
  assert.equal(labels.size, 6, 'temperament labels must be unique');
});
