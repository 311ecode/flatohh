import { describe, it, expect } from 'vitest';
import { flatFilter } from '../src/filter';

describe('flatFilter', () => {
  const users = [
    { id: 1, name: 'Alice', meta: { active: true, role: 'admin' } },
    { id: 2, name: 'Bob', meta: { active: false, role: 'user' } },
    { id: 3, name: 'Charlie', meta: { active: true, role: 'guest' } },
    { id: 4, name: 'Dave', meta: { active: false, role: 'banned' } },
    // Edge case: missing meta
    { id: 5, name: 'Eve' } 
  ];

  it('should filter by direct property match (Implicit AND)', () => {
    const result = flatFilter(users, { 'meta.active': true });
    expect(result.map(u => u.name)).toEqual(['Alice', 'Charlie']);
  });

  it('should handle $or logic', () => {
    // Get admins OR guests
    const result = flatFilter(users, {
      $or: [
        { 'meta.role': 'admin' },
        { 'meta.role': 'guest' }
      ]
    });
    expect(result.map(u => u.name)).toEqual(['Alice', 'Charlie']);
  });

  it('should handle $not logic (Simple)', () => {
    // Get users who are NOT active
    const result = flatFilter(users, {
      $not: { 'meta.active': true }
    });
    // This includes Bob (false), Dave (false), and Eve (undefined != true)
    expect(result.map(u => u.name)).toEqual(['Bob', 'Dave', 'Eve']);
  });

  it('should handle complex nesting: NOT (A OR B)', () => {
    // "Filter those out": We want users who are NOT (admin OR guest)
    const result = flatFilter(users, {
      $not: {
        $or: [
          { 'meta.role': 'admin' },
          { 'meta.role': 'guest' }
        ]
      }
    });
    // Should remove Alice (admin) and Charlie (guest)
    expect(result.map(u => u.name)).toEqual(['Bob', 'Dave', 'Eve']);
  });

  it('should handle complex nesting: NOT (A AND B)', () => {
    // Remove users who are (Inactive AND Banned)
    // Dave is inactive(false) and banned. Bob is inactive but not banned.
    const result = flatFilter(users, {
      $not: {
        $and: [
          { 'meta.active': false },
          { 'meta.role': 'banned' }
        ]
      }
    });
    // Dave should be removed. Everyone else stays.
    expect(result.find(u => u.name === 'Dave')).toBeUndefined();
    expect(result.find(u => u.name === 'Bob')).toBeDefined();
  });

  it('should handle "undefined" or missing checks', () => {
    // Find users where meta.role is undefined
    const result = flatFilter(users, {
      'meta.role': undefined
    });
    expect(result.map(u => u.name)).toEqual(['Eve']);
  });
  
  it('should handle "Not Undefined" (Exists)', () => {
    const result = flatFilter(users, {
      $not: { 'meta.role': undefined }
    });
    // Everyone except Eve
    expect(result).toHaveLength(4);
    expect(result.find(u => u.name === 'Eve')).toBeUndefined();
  });
});
