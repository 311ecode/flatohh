import { describe, it, expect } from 'vitest';
import { deflatten, flatten } from '../../src/flatten';
import { testData } from '../utils/testData';

describe('deflatten (non-JSON)', () => {
  it('should deflatten object correctly', () => {
    const flattened = flatten(testData);
    const result = deflatten(flattened);
    expect(result).toEqual(testData);
  });
});