type Nested = Record<string | number, any>;

// Supported operators
export type FilterQuery = {
  $and?: FilterQuery[];
  $or?: FilterQuery[];
  $not?: FilterQuery;
  [key: string]: any; 
};

/**
 * Splits path into parts, handling array notation "items[0].name" -> ["items", "0", "name"]
 */
function parsePath(path: string): string[] {
  return path.replace(/\[(\d+)\]/g, '.$1').split('.');
}

/**
 * Recursive Deep Get with Array Tunneling
 */
function getRecursive(current: any, parts: string[]): any {
  if (parts.length === 0) return current;
  if (current == null) return undefined;

  const [head, ...tail] = parts;

  // Case 1: Current is Array and Head is NOT an index -> Tunnel
  // We apply the FULL remaining path to every item in the array
  if (Array.isArray(current) && isNaN(Number(head))) {
    const results = current.map(item => getRecursive(item, parts));
    // Flatten to ensure we have a single list of values at the end
    const flattened = results.flat(Infinity);
    
    // FIX: If the tunnel yields no values (empty array), return undefined.
    // This allows checks like { 'path': undefined } to match empty parents.
    return flattened.length > 0 ? flattened : undefined;
  }

  // Case 2: Standard Access (Object key or Array specific index)
  const next = current[head];
  return getRecursive(next, tail);
}

/**
 * Public wrapper for getRecursive
 */
function get(obj: any, path: string): any {
  const parts = parsePath(path);
  return getRecursive(obj, parts);
}

/**
 * Internal recursive matcher
 */
function matches(item: any, query: FilterQuery): boolean {
  // 1. Handle $and
  if ('$and' in query && query.$and) {
    return query.$and.every(subQuery => matches(item, subQuery));
  }

  // 2. Handle $or
  if ('$or' in query && query.$or) {
    return query.$or.some(subQuery => matches(item, subQuery));
  }

  // 3. Handle $not
  if ('$not' in query && query.$not) {
    return !matches(item, query.$not);
  }

  // 4. Handle direct Key-Value pairs
  for (const key in query) {
    if (key === '$and' || key === '$or' || key === '$not') continue;

    const expectedValue = query[key];
    const actualValue = get(item, key);

    // If actualValue is an array (from tunneling) and we expect a primitive,
    // check if the array INCLUDES the expected value.
    if (Array.isArray(actualValue) && !Array.isArray(expectedValue)) {
      if (!actualValue.includes(expectedValue)) {
        return false;
      }
    } else {
      // Standard strict equality
      // Note: If actualValue became undefined (due to empty tunnel fix), this handles it correctly.
      if (actualValue !== expectedValue) {
        return false;
      }
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
