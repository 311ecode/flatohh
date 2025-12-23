import { describe, it, expect } from 'vitest';
import { flatModify } from '../src/modify';

describe('flatModify (Deep Pruning)', () => {

  const villages = [
    {
      name: 'Village A',
      houses: [
        { id: 'h1', color: 'blue', boxes: [{ id: 'b1', status: 'fresh' }] },
        { id: 'h2', color: 'red', boxes: [{ id: 'b2', status: 'rotten' }] }, // Bad house
        { id: 'h3', color: 'blue', boxes: [{ id: 'b3', status: 'fresh' }] }
      ]
    },
    {
      name: 'Village B',
      houses: [
        { id: 'h4', color: 'red', boxes: [{ id: 'b4', status: 'fresh' }] }
      ]
    }
  ];

  it('should filter an inner array using [*] syntax', () => {
    // "Remove RED houses from all villages"
    const result = flatModify(villages, {
      'houses[*]': {
        $not: { color: 'red' }
      }
    });

    // Village A originally had 3 houses. h2 was red. Should have 2 left.
    expect(result[0].houses).toHaveLength(2);
    expect(result[0].houses.map(h => h.id)).toEqual(['h1', 'h3']);
    
    // Village B had 1 red house. Should now have 0.
    expect(result[1].houses).toHaveLength(0);
  });

  it('should filter using deep attributes (The Rotten Apple Scenario)', () => {
    // "Remove houses that contain a rotten apple box"
    // Note: We are filtering HOUSES based on their boxes.
    const result = flatModify(villages, {
      'houses[*]': {
        $not: { 'boxes.status': 'rotten' }
      }
    });

    // Village A: h2 has the rotten box. It should be removed.
    expect(result[0].houses).toHaveLength(2);
    expect(result[0].houses.map(h => h.id)).toEqual(['h1', 'h3']);
  });

  it('should recurse deeply with multiple wildcards [*]', () => {
    // Scenario: Don't delete the house. Just delete the BAD BOXES inside the house.
    // Path: villages -> houses[*] -> boxes[*] -> filter
    
    const result = flatModify(villages, {
      'houses[*].boxes[*]': {
        $not: { status: 'rotten' }
      }
    });

    // Village A -> h2 (Red House)
    // Previously h2 was deleted. Now h2 should STAY, but its rotten box should be gone.
    const villageA = result[0];
    const redHouse = villageA.houses.find(h => h.id === 'h2');
    
    expect(redHouse).toBeDefined(); // House exists
    expect(redHouse?.boxes).toHaveLength(0); // Box is gone
  });
});
