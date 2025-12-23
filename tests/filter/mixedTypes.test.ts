import { describe, it, expect } from 'vitest';
import { flatFilter } from '../../src/filter';

describe('Mixed Deep Arrays (Houses & Boxes)', () => {

  const people = [
    {
      id: 'Person_A',
      houses: [
        { color: 'blue' },
        { color: 'yellow' } // Has Yellow House
      ],
      boxes: [
        { id: 'b1', apples: [{ status: 'fresh' }, { status: 'rotten' }] } // Has Rotten Apple
      ]
    },
    {
      id: 'Person_B',
      houses: [
        { color: 'yellow' } // Has Yellow House
      ],
      boxes: [
        { id: 'b2', apples: [{ status: 'fresh' }, { status: 'fresh' }] } // No Rotten Apple
      ]
    },
    {
      id: 'Person_C',
      houses: [
        { color: 'red' } // No Yellow House
      ],
      boxes: [
        { id: 'b3', apples: [{ status: 'rotten' }] } // Has Rotten Apple
      ]
    },
    {
      id: 'Person_D',
      houses: [
        { color: 'yellow' } // Has Yellow House
      ]
      // No boxes at all!
    }
  ];

  it('should filter for (Yellow Houses) AND (Rotten Apples)', () => {
    // "I want people with yellow houses where we also have rotten apples"
    const result = flatFilter(people, {
      'houses.color': 'yellow',
      'boxes.apples.status': 'rotten'
    });

    // Person A: Yellow House (Yes) + Rotten Apple (Yes) -> MATCH
    // Person B: Yellow House (Yes) + Rotten Apple (No)  -> FAIL
    // Person C: Yellow House (No)  + Rotten Apple (Yes) -> FAIL
    // Person D: Yellow House (Yes) + Boxes (Missing)    -> FAIL
    
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('Person_A');
  });

  it('should filter for (Yellow Houses) AND (NO Rotten Apples)', () => {
    // "Yellow houses, but make sure they DONT have rotten apples"
    const result = flatFilter(people, {
      'houses.color': 'yellow',
      $not: {
        'boxes.apples.status': 'rotten'
      }
    });

    // Person B: Yellow House + All Fresh -> MATCH
    // Person D: Yellow House + No Boxes (so no rotten apples) -> MATCH
    
    expect(result.map(p => p.id)).toEqual(['Person_B', 'Person_D']);
  });

  it('should filter for (Yellow Houses) AND (Has Boxes but NO Rotten Apples)', () => {
    // This is stricter: Must HAVE boxes, but none can be rotten.
    // We achieve this by explicitly checking boxes exist via $not undefined.
    const result = flatFilter(people, {
      'houses.color': 'yellow',
      $and: [
        { $not: { 'boxes': undefined } },       // Must have boxes
        { $not: { 'boxes.apples.status': 'rotten' } } // No rotten apples
      ]
    });

    // Person D is excluded now because they have no boxes
    expect(result.map(p => p.id)).toEqual(['Person_B']);
  });
});
