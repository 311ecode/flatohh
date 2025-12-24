import { describe, it, expect } from 'vitest';
import { flatTransform } from '../src/modify/modify';
import { flatPick, flatOmit } from '../src/modify/selection';

describe('Advanced Manipulation', () => {
  it('flatTransform should multiply nested values', () => {
    const data = { stats: { score: 10 } };
    const result = flatTransform(data, { 'stats.score': (v) => v * 2 });
    expect(result.stats.score).toBe(20);
  });

  it('flatTransform should work with wildcards', () => {
    const data = { items: [{ p: 10 }, { p: 20 }] };
    const result = flatTransform(data, { 'items[*].p': (v) => v + 5 });
    expect(result.items[0].p).toBe(15);
    expect(result.items[1].p).toBe(25);
  });

  it('flatPick should select deep paths', () => {
    const data = { a: 1, b: { c: 2, d: 3 } };
    const result = flatPick(data, ['b.c']);
    expect(result).toEqual({ b: { c: 2 } });
  });

  it('flatOmit should remove deep paths', () => {
    const data = { a: 1, b: { c: 2, d: 3 } };
    const result = flatOmit(data, ['b.d']);
    expect(result).toEqual({ a: 1, b: { c: 2 } });
  });
});
