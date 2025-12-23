import { describe, it, expect } from 'vitest';
import { flatFilter } from '../../src/filter';

describe('Village Logic (Top Level Filtering)', () => {

  const data = [
    {
      name: 'Clean Village',
      houses: [
        {
          id: 'h1',
          boxes: [
            { id: 'b1', apples: [{ status: 'fresh' }, { status: 'fresh' }] }
          ]
        },
        {
          id: 'h2',
          boxes: [
            { id: 'b2', apples: [{ status: 'fresh' }] }
          ]
        }
      ]
    },
    {
      name: 'Dirty Village',
      houses: [
        {
          id: 'h3',
          boxes: [
            { id: 'b3', apples: [{ status: 'fresh' }] },
            // This single rotten apple ruins the whole village
            { id: 'b4', apples: [{ status: 'rotten' }] } 
          ]
        }
      ]
    },
    {
      name: 'Mixed Village',
      houses: [
        {
          id: 'h4',
          boxes: [
             // Even if mostly fresh, one rotten apple is enough to fail
            { id: 'b5', apples: [{ status: 'fresh' }, { status: 'rotten' }] }
          ]
        }
      ]
    }
  ];

  it('should delete the entire village if ANY apple deep down is rotten', () => {
    // Logic: Keep villages where there is NOT a rotten apple anywhere inside
    const safeVillages = flatFilter(data, {
      $not: {
        'houses.boxes.apples.status': 'rotten'
      }
    });

    // Dirty Village: Removed (Has a rotten apple in b4)
    // Mixed Village: Removed (Has a rotten apple in b5)
    // Clean Village: Kept (All apples are fresh)

    expect(safeVillages).toHaveLength(1);
    expect(safeVillages[0].name).toBe('Clean Village');
  });

});
