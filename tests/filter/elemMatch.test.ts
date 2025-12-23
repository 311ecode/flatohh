import { describe, it, expect } from 'vitest';
import { flatFilter } from '../../src/filter';

describe('elemMatch (Correlated Sub-queries)', () => {

  const villages = [
    {
      name: 'Doom Village', // DELETE ME
      houses: [
        { color: 'red', apples: [] },
        // This is the killer: Yellow AND Rotten in the SAME house
        { color: 'yellow', boxes: [{ apples: [{ status: 'rotten' }] }] }
      ]
    },
    {
      name: 'Confusing Village', // KEEP ME
      houses: [
        { color: 'red', apples: [] },
        { color: 'yellow', boxes: [{ apples: [{ status: 'fresh' }] }] }, // Yellow is safe
        { color: 'blue', boxes: [{ apples: [{ status: 'rotten' }] }] }   // Blue is rotten
      ]
      // Explanation: 
      // Has Red? Yes. 
      // Has Yellow? Yes. 
      // Has Rotten? Yes.
      // BUT: It does NOT have a "Yellow Rotten House". So we keep it.
    }
  ];

  it('should distinguish between correlated properties ($elemMatch) and global properties', () => {
    const result = flatFilter(villages, {
      $not: {
        $and: [
          // 1. Must have a red house somewhere
          { 'houses.color': 'red' },
          
          // 2. Must specifically have a Yellow House that is Rotten
          { 
            'houses': {
              $elemMatch: {
                'color': 'yellow',
                'boxes.apples.status': 'rotten'
              }
            }
          }
        ]
      }
    });

    // Doom Village matches both conditions -> Deleted ($not)
    // Confusing Village matches Red, but fails the elemMatch (Yellow is fresh) -> Kept
    
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Confusing Village');
  });
});
