import { flatFilter, FilterQuery } from '../filter/filter';

/**
 * Modifies an array of objects by filtering nested arrays based on wildcard paths.
 * * @param data The array to modify (deep pruning)
 * @param rules Object where keys are paths with [*] and values are filter queries.
 * Example: { 'houses[*]': { $not: { 'color': 'red' } } }
 */
export const flatModify = <T>(data: T[], rules: Record<string, FilterQuery>): T[] => {
  // 1. Create a shallow copy of the array so we can map over it safely
  // Note: We will clone objects as we modify them to avoid mutating the original
  const result = data.map(item => ({ ...item }));

  for (const [path, query] of Object.entries(rules)) {
    // 2. Parse the path to find the first Array Wildcard [*]
    // Matches: "houses[*]" or "houses[*].boxes[*]"
    // Group 1: "houses"
    // Group 2: ".boxes[*]" (Remainder)
    const match = path.match(/^(.*?)\[\*\](.*)$/);

    if (!match) {
      throw new Error(`flatModify rule key must contain [*] to indicate an array. Invalid key: "${path}"`);
    }

    const [, arrayPath, remainder] = match;

    // 3. Iterate over the main result set to apply changes
    for (let i = 0; i < result.length; i++) {
      const item = result[i] as any;
      
      // Navigate to the array (e.g., item.houses)
      // We support dot notation for the path leading up to the [*]
      const parts = arrayPath.split('.');
      let current = item;
      let targetArray: any[] | undefined;
      let parentOfArray: any = item;
      let keyOfArray: string = parts[parts.length - 1];

      // Walk to the parent of the array
      for (let j = 0; j < parts.length - 1; j++) {
        parentOfArray = parentOfArray[parts[j]];
        if (!parentOfArray) break;
      }
      
      if (parentOfArray) {
        targetArray = parentOfArray[keyOfArray];
      }

      // If the target array doesn't exist or isn't an array, skip
      if (!Array.isArray(targetArray)) continue;

      // 4. ACTION TIME
      if (!remainder || remainder === '') {
        // Case A: End of chain (e.g., "houses[*]")
        // -> Apply the Filter Query directly to this array
        parentOfArray[keyOfArray] = flatFilter(targetArray, query);
      } else {
        // Case B: Nested Chain (e.g., "houses[*].boxes[*]")
        // -> Recurse! 
        // We strip the leading dot from remainder: ".boxes[*]" -> "boxes[*]"
        const nextRule = { [remainder.slice(1)]: query };
        
        // Recursively modify the inner array
        parentOfArray[keyOfArray] = flatModify(targetArray, nextRule);
      }
    }
  }

  return result;
};
