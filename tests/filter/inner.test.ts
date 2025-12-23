import { describe, it, expect } from 'vitest';
import { flatFilter } from '../../src/filter';

describe('Inner Filtering (Cleaning inside the Parent)', () => {

  const villages = [
    {
      name: 'Big Village',
      houses: [
        {
          id: 'h1', // Good House
          boxes: [{ id: 'b1', apples: [{ status: 'fresh' }] }]
        },
        {
          id: 'h2', // Bad House (Rotten Apple)
          boxes: [{ id: 'b2', apples: [{ status: 'rotten' }] }]
        },
        {
          id: 'h3', // Good House
          boxes: [{ id: 'b3', apples: [{ status: 'fresh' }] }]
        }
      ]
    }
  ];

  it('should keep the Village but remove only the bad Houses', () => {
    // 1. Iterate over villages
    const result = villages.map(village => ({
      ...village,
      // 2. Filter the houses array using our deep logic
      houses: flatFilter(village.houses, {
        $not: {
          'boxes.apples.status': 'rotten'
        }
      })
    }));

    const targetVillage = result[0];

    // The Village itself is still there
    expect(targetVillage.name).toBe('Big Village');
    
    // But it now has only 2 houses (h1, h3) instead of 3
    expect(targetVillage.houses).toHaveLength(2);
    
    // Verify h2 (the bad one) is gone
    const ids = targetVillage.houses.map(h => h.id);
    expect(ids).toContain('h1');
    expect(ids).toContain('h3');
    expect(ids).not.toContain('h2');
  });
});
