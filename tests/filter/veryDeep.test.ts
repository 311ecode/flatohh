import { describe, it, expect } from 'vitest';
import { flatFilter } from '../../src/filter';

describe('Very Deep Nesting (Inception Logic)', () => {

  const villages = [
    {
      name: 'Happy Village',
      houses: [
        {
          id: 'h1',
          color: 'yellow',
          boxes: [
            { id: 'b1', apples: [{ status: 'fresh' }] }
          ]
        },
        {
          id: 'h2',
          color: 'blue',
          boxes: [
            { id: 'b2', apples: [{ status: 'fresh' }, { status: 'fresh' }] }
          ]
        }
      ]
    },
    {
      name: 'Rotten Village',
      houses: [
        {
          id: 'h3',
          color: 'red',
          boxes: [
            // This box is "contained in the house" and has a bad apple
            { id: 'b3', apples: [{ status: 'rotten' }] } 
          ]
        }
      ]
    },
    {
      name: 'Empty Village',
      houses: [
        {
          id: 'h4',
          color: 'yellow',
          boxes: [] // House exists, but no boxes
        }
      ]
    }
  ];

  it('should tunnel through 3 layers of arrays (houses -> boxes -> apples)', () => {
    // Logic: 
    // 1. Enter Houses Array
    // 2. Enter Boxes Array (inside each house)
    // 3. Enter Apples Array (inside each box)
    // 4. Check status
    
    const result = flatFilter(villages, {
      'houses.boxes.apples.status': 'rotten'
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Rotten Village');
  });

  it('should filter by specific House attributes AND deep Apple attributes', () => {
    // "Find a village with RED houses that also has ROTTEN apples"
    const result = flatFilter(villages, {
      'houses.color': 'red',
      'houses.boxes.apples.status': 'rotten'
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Rotten Village');
  });

  it('should NOT find village if House matches but Apple does not', () => {
    // "Find a village with YELLOW houses that has ROTTEN apples"
    // Happy Village has Yellow houses (Fresh apples)
    // Rotten Village has Red houses (Rotten apples)
    // Neither is strictly "Yellow House AND Rotten Apple" in the same village context?
    // ACTUALLY: 'Happy Village' has Yellow houses. But no rotten apples. -> Fail.
    // 'Rotten Village' has Rotten apples. But no Yellow houses. -> Fail.
    
    const result = flatFilter(villages, {
      'houses.color': 'yellow',
      'houses.boxes.apples.status': 'rotten'
    });

    expect(result).toHaveLength(0);
  });

  it('should handle "Container" logic: Filter out if NO boxes exist', () => {
    // "Find villages that definitely have boxes in their houses"
    // We do this by checking if 'houses.boxes' is NOT undefined/empty
    // Note: Empty arrays usually flatten to [], so we might need a length check or existence check.
    
    // Simplest check: Do we have any box IDs?
    const result = flatFilter(villages, {
      $not: { 'houses.boxes.id': undefined }
    });

    // Happy Village (Has boxes) -> Keep
    // Rotten Village (Has boxes) -> Keep
    // Empty Village (No boxes) -> Drop
    
    expect(result.map(v => v.name)).toEqual(['Happy Village', 'Rotten Village']);
  });
});
