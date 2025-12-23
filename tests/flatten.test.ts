import { describe, it, expect } from 'vitest';
import { flatten } from '../src/flatten';
import { testData } from './utils/testData';

describe('flatten', () => {
  it('should flatten nested object correctly', () => {
    const result = flatten(testData);
    expect(result).toEqual({
      'name': 'John',
      'age': 30,
      'address.street': '123 Main St',
      'address.city': 'New York',
      'address.coordinates.lat': 40.7128,
      'address.coordinates.lng': -74.006,
      'hobbies[0]': 'reading',
      'hobbies[1]': 'swimming',
      'hobbies[2]': 'coding',
      'stuff[0].keyToo': 'value1',
      'stuff[0].another': 'test',
      'stuff[1].keyToo': 'value2',
      'stuff[1].number': 42,
      'active': true,
      'score': null
    });
  });

  it('should handle custom prefix', () => {
    const result = flatten(testData, 'root');
    expect(result).toEqual({
      'root.name': 'John',
      'root.age': 30,
      'root.address.street': '123 Main St',
      'root.address.city': 'New York',
      'root.address.coordinates.lat': 40.7128,
      'root.address.coordinates.lng': -74.006,
      'root.hobbies[0]': 'reading',
      'root.hobbies[1]': 'swimming',
      'root.hobbies[2]': 'coding',
      'root.stuff[0].keyToo': 'value1',
      'root.stuff[0].another': 'test',
      'root.stuff[1].keyToo': 'value2',
      'root.stuff[1].number': 42,
      'root.active': true,
      'root.score': null
    });
  });

  it('should flatten from JSON string', () => {
    const jsonStr = JSON.stringify(testData);
    const result = flatten(jsonStr);
    expect(result).toEqual({
      'name': 'John',
      'age': 30,
      'address.street': '123 Main St',
      'address.city': 'New York',
      'address.coordinates.lat': 40.7128,
      'address.coordinates.lng': -74.006,
      'hobbies[0]': 'reading',
      'hobbies[1]': 'swimming',
      'hobbies[2]': 'coding',
      'stuff[0].keyToo': 'value1',
      'stuff[0].another': 'test',
      'stuff[1].keyToo': 'value2',
      'stuff[1].number': 42,
      'active': true,
      'score': null
    });
  });

  it('should throw error for invalid JSON string', () => {
    expect(() => flatten('invalid json')).toThrow('Invalid JSON string provided to flatten');
  });
});