import { describe, it, expect } from 'vitest';
import { rename } from '../src/rename';

describe('rename (Structural Transformation)', () => {
  
  it('should push a property deeper (apple -> fruit.apple)', () => {
    const data = { 
      apple: 'green',
      other: 1 
    };

    const result = rename(data, {
      'apple': 'fruit.apple'
    });

    expect(result).toEqual({
      fruit: { apple: 'green' },
      other: 1
    });
  });

  it('should hoist a property up (fruit.apple -> apple)', () => {
    const data = {
      fruit: {
        apple: 'red',
        banana: 'yellow'
      }
    };

    const result = rename(data, {
      'fruit.apple': 'apple'
    });

    expect(result).toEqual({
      apple: 'red',
      fruit: {
        banana: 'yellow'
      }
    });
  });

  it('should rename deeply nested paths', () => {
    const data = {
      a: { b: { c: 'value' } }
    };

    // Move a.b.c all the way to x.y.z
    const result = rename(data, {
      'a.b.c': 'x.y.z'
    });

    // The old path 'a.b' is now empty, so it should disappear completely.
    expect(result).toEqual({
      x: { y: { z: 'value' } }
    });
  });

  it('should rename a parent object (Namespace Change)', () => {
    const data = {
      config: {
        host: 'localhost',
        port: 8080
      }
    };

    // Rename 'config' -> 'settings'
    // This should automatically move config.host -> settings.host
    const result = rename(data, {
      'config': 'settings'
    });

    expect(result).toEqual({
      settings: {
        host: 'localhost',
        port: 8080
      }
    });
  });

  it('should handle array references in renaming', () => {
    const data = {
      users: [
        { name: 'Alice' },
        { name: 'Bob' }
      ]
    };

    // Rename the array itself: users -> people
    const result = rename(data, {
      'users': 'people'
    });

    expect(result).toEqual({
      people: [
        { name: 'Alice' },
        { name: 'Bob' }
      ]
    });
  });
});
