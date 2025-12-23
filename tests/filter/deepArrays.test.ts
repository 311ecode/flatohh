import { describe, it, expect } from 'vitest';
import { flatFilter } from '../../src/filter';

describe('Deep Array Tunneling (The "Crate & Apple" Scenario)', () => {
  
  // Data Structure: Crates -> Boxes -> Apples
  const crates = [
    {
      id: 'Crate_1',
      boxes: [
        { id: 'B1', apples: [{ status: 'fresh' }, { status: 'fresh' }] },
        { id: 'B2', apples: [{ status: 'fresh' }] }
      ]
    },
    {
      id: 'Crate_2',
      boxes: [
        { id: 'B3', apples: [{ status: 'fresh' }, { status: 'rotten' }] }, // One bad apple!
        { id: 'B4', apples: [{ status: 'fresh' }] }
      ]
    },
    {
      id: 'Crate_3',
      boxes: [
        { id: 'B5', apples: [{ status: 'fresh' }] },
        // Deeply nested empty array edge case
        { id: 'B6', apples: [] } 
      ]
    }
  ];

  it('should find parents where deep children have a specific value', () => {
    // Find crates containing ANY rotten apple
    // Path: boxes (Array) -> apples (Array) -> status
    const result = flatFilter(crates, {
      'boxes.apples.status': 'rotten'
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('Crate_2');
  });

  it('should filter OUT parents if deep children match (using $not)', () => {
    // "Filter out any crate that has a rotten apple"
    const result = flatFilter(crates, {
      $not: {
        'boxes.apples.status': 'rotten'
      }
    });

    // Should keep Crate_1 (all fresh) and Crate_3 (fresh + empty)
    expect(result).toHaveLength(2);
    expect(result.map(c => c.id)).toEqual(['Crate_1', 'Crate_3']);
  });

  it('should handle mixed depth querying', () => {
    // Find Crate where:
    // 1. It has a box ID of 'B3' (Level 2)
    // 2. AND it has a rotten apple (Level 3)
    const result = flatFilter(crates, {
      'boxes.id': 'B3',
      'boxes.apples.status': 'rotten'
    });

    expect(result[0].id).toBe('Crate_2');
  });

  it('should handle explicit array index access (No Tunneling)', () => {
    // Only check the FIRST box of every crate.
    // Crate 2 has a rotten apple in B3 (which is index 0).
    const result = flatFilter(crates, {
      'boxes[0].apples.status': 'rotten'
    });
    
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('Crate_2');
  });

  it('should safely handle missing/empty arrays', () => {
    const data = [
      { id: 1, tags: [] },
      { id: 2, tags: [{ name: 'A' }] },
      { id: 3 } // missing tags
    ];

    // Should not crash on id:3 or id:1
    const result = flatFilter(data, {
      'tags.name': 'A'
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });
});
