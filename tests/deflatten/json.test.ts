import { describe, it, expect } from 'vitest';
import { deflatten, flatten } from '../../src/flatten';
import { testData } from '../utils/testData';

describe('deflatten (JSON)', () => {
  it('should deflatten from JSON string correctly', () => {
    const flattened = flatten(testData);
    const flatJson = JSON.stringify(flattened);
    const result = deflatten(flatJson);
    expect(result).toEqual(testData);
  });

  it('should deflatten to JSON using toJson', () => {
    const flattened = flatten(testData);
    const jsonStr = deflatten.toJson(flattened);
    expect(jsonStr).toBe(JSON.stringify(testData));
  });

  it('should deflatten to JSON from JSON string using toJson', () => {
    const flattened = flatten(testData);
    const flatJson = JSON.stringify(flattened);
    const jsonStr = deflatten.toJson(flatJson);
    expect(jsonStr).toBe(JSON.stringify(testData));
  });

  it('should throw error for invalid JSON string', () => {
    expect(() => deflatten('invalid json')).toThrow('Invalid JSON string provided to deflatten');
  });
});