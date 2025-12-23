type Nested = Record<string | number, any>;

export type FilterQuery = {
  $and?: FilterQuery[];
  $or?: FilterQuery[];
  $not?: FilterQuery;
  $elemMatch?: FilterQuery; // New Operator
  [key: string]: any; 
};

function parsePath(path: string): string[] {
  return path.replace(/\[(\d+)\]/g, '.$1').split('.');
}

function getRecursive(current: any, parts: string[]): any {
  if (parts.length === 0) return current;
  if (current == null) return undefined;

  const [head, ...tail] = parts;

  if (Array.isArray(current) && isNaN(Number(head))) {
    const results = current.map(item => getRecursive(item, parts));
    const flattened = results.flat(Infinity);
    return flattened.length > 0 ? flattened : undefined;
  }

  const next = current[head];
  return getRecursive(next, tail);
}

function get(obj: any, path: string): any {
  const parts = parsePath(path);
  return getRecursive(obj, parts);
}

function matches(item: any, query: FilterQuery): boolean {
  // 1. Logic Operators
  if ('$and' in query && query.$and) return query.$and.every(q => matches(item, q));
  if ('$or' in query && query.$or) return query.$or.some(q => matches(item, q));
  if ('$not' in query && query.$not) return !matches(item, query.$not);

  // 2. Key-Value Checks
  for (const key in query) {
    if (['$and', '$or', '$not'].includes(key)) continue;

    const expectedValue = query[key];
    
    // NEW: Handle $elemMatch
    // Syntax: { "houses": { $elemMatch: { "color": "yellow" } } }
    if (expectedValue && typeof expectedValue === 'object' && '$elemMatch' in expectedValue) {
      const array = get(item, key);
      
      // If the target isn't an array, it can't match an element query
      if (!Array.isArray(array)) return false;

      // Check if ANY item in that array matches the sub-query
      // We recursively call matches() on the child item
      if (!array.some(child => matches(child, expectedValue.$elemMatch))) {
        return false;
      }
      continue; // Match found, move to next key
    }

    // Standard Value Check
    const actualValue = get(item, key);

    if (Array.isArray(actualValue) && !Array.isArray(expectedValue)) {
      if (!actualValue.includes(expectedValue)) return false;
    } else {
      if (actualValue !== expectedValue) return false;
    }
  }

  return true;
}

export const flatFilter = <T>(array: T[], query: FilterQuery): T[] => {
  if (!Array.isArray(array)) {
    throw new Error('flatFilter expects an array as the first argument');
  }
  return array.filter(item => matches(item, query));
};
