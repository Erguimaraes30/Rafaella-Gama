import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distancia, indicesProximos } from './janela.js';

test('distancia sem loop é a diferença simples', () => {
  assert.equal(distancia(5, 2, 10, false), 3);
  assert.equal(distancia(0, 9, 10, false), -9);
});

test('distancia com loop dá a volta pelo lado mais curto', () => {
  assert.equal(distancia(0, 9, 10, true), 1);
  assert.equal(distancia(9, 0, 10, true), -1);
  assert.equal(distancia(3, 1.5, 10, true), 1.5);
});

test('indicesProximos com loop inclui os dois lados e dá a volta', () => {
  assert.deepEqual([...indicesProximos(0, 20, 2, true)].sort((a, b) => a - b), [0, 1, 2, 18, 19]);
});

test('indicesProximos sem loop não sai dos limites', () => {
  assert.deepEqual([...indicesProximos(0, 20, 2, false)].sort((a, b) => a - b), [0, 1, 2]);
});

test('indicesProximos com poucos cards devolve todos sem repetir', () => {
  assert.deepEqual([...indicesProximos(1, 3, 5, true)].sort((a, b) => a - b), [0, 1, 2]);
});
