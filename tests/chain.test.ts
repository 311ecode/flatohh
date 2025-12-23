import { describe, it, expect } from 'vitest';
import { flatChain } from '../src/chain';

describe('flatChain (Piping)', () => {
  const inventory = [
    { id: 1, type: 'fruit', details: { name: 'apple', condition: 'good' } },
    { id: 2, type: 'fruit', details: { name: 'banana', condition: 'bad' } },
    { id: 3, type: 'veg', details: { name: 'carrot', condition: 'good' } },
    { id: 4, type: 'fruit', details: { name: 'apple', condition: 'bad' } },
  ];

  it('should chain multiple filters correctly', () => {
    const result = flatChain(inventory)
      .filter({ type: 'fruit' })               // Step 1: Keep only fruits
      .filter({ 'details.condition': 'good' }) // Step 2: Keep only good ones
      .value();

    // Should only have item 1 (Good Apple)
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('should be order independent (logically)', () => {
    // Filtering "Good" then "Fruits" should be same as "Fruits" then "Good"
    const result = flatChain(inventory)
      .filter({ 'details.condition': 'good' })
      .filter({ type: 'fruit' })
      .value();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('should handle complex mixed queries in the chain', () => {
    const result = flatChain(inventory)
      .filter({ $not: { type: 'veg' } }) // No veggies
      .filter({ 
        $or: [
          { 'details.name': 'banana' }, 
          { 'details.condition': 'bad' }
        ] 
      }) // Must be banana OR bad
      .value();

    // Item 1 (Apple/Good): Fail (Neither banana nor bad)
    // Item 2 (Banana/Bad): Pass
    // Item 3 (Veg): Fail (Filtered out first)
    // Item 4 (Apple/Bad): Pass
    
    expect(result.map(i => i.id)).toEqual([2, 4]);
  });

  it('should return original array if no filters added', () => {
    const result = flatChain(inventory).value();
    expect(result).toEqual(inventory); // Reference equality might fail, but structure same
    expect(result).toBe(inventory);    // Our optimization returns the exact same array instance
  });
});
