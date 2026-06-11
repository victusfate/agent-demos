import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLogic } from '../_harness/logic.mjs';

const HTML = new URL('./index.html', import.meta.url).pathname;

// ---------- slice 1 — expand ----------

test('expand: n = 0 returns the axiom unchanged', () => {
  const { expand } = loadLogic(HTML);
  assert.equal(expand('F+F', { F: 'FF' }, 0), 'F+F');
});

test('expand: algae system lengths follow Fibonacci', () => {
  const { expand } = loadLogic(HTML);
  const rules = { A: 'AB', B: 'A' };
  // |expand('A', n)| = fib(n+1) with fib(1)=1, fib(2)=1: 1,2,3,5,8,...
  const fib = [1, 2];
  for (let i = 2; i <= 10; i++) fib.push(fib[i - 1] + fib[i - 2]);
  for (let n = 0; n <= 10; n++) {
    assert.equal(expand('A', rules, n).length, fib[n], `length at n=${n}`);
  }
});

test('expand: first algae derivations are exact', () => {
  const { expand } = loadLogic(HTML);
  const rules = { A: 'AB', B: 'A' };
  assert.equal(expand('A', rules, 1), 'AB');
  assert.equal(expand('A', rules, 2), 'ABA');
  assert.equal(expand('A', rules, 3), 'ABAAB');
  assert.equal(expand('A', rules, 4), 'ABAABABA');
});

test('expand: non-rule symbols copy through unchanged', () => {
  const { expand } = loadLogic(HTML);
  assert.equal(expand('F[+F]-f', { F: 'FF' }, 1), 'FF[+FF]-f');
  assert.equal(expand('+-[]f', {}, 3), '+-[]f');
});

test('expand: rules apply in parallel, not sequentially', () => {
  const { expand } = loadLogic(HTML);
  // sequential application of A→B then B→A would collapse; parallel swaps
  assert.equal(expand('AB', { A: 'B', B: 'A' }, 1), 'BA');
});
