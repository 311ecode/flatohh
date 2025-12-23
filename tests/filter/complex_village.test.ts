import { describe, it, expect } from 'vitest';
import { flatFilter } from '../../src/filter';

describe('Complex Village Logic', () => {

  const villages = [
    {
      name: 'Doom Village', // DELETE ME
      houses: [
        { color: 'red', apples: [] },
        // Yellow house HAS rotten apples -> DELETE
        { color: 'yellow', apples: [{ status: 'rotten' }] } 
      ]
    },
    {
      name: 'Safe Village', // KEEP ME
      houses: [
        { color: 'red', apples: [] },
        // Yellow house is safe -> KEEP
        { color: 'yellow', apples: [{ status: 'fresh' }] } 
      ]
    },
    {
      name: 'Red Village Only', // KEEP ME
      houses: [
        // Has Red and Rotten, but NO Yellow house -> KEEP
        { color: 'red', apples: [{ status: 'rotten' }] } 
      ]
    }
  ];

  it('should delete village if: Has Red House AND Yellow House AND Rotten Apples', () => {
    const result = flatFilter(villages, {
      $not: {
        $and: [
          { 'houses.color': 'red' },
          { 'houses.color': 'yellow' },
          { 'houses.apples.status': 'rotten' }
        ]
      }
    });

    // Doom Village is gone.
    // Safe Village (No rotten apples) stays.
    // Red Village (No yellow house) stays.
    
    expect(result).toHaveLength(2);
    expect(result.map(v => v.name)).toEqual(['Safe Village', 'Red Village Only']);
  });
});
