type Nested = Record<string | number, any>;

// Supported operators
export type FilterQuery = {
  $and?: FilterQuery[];
  $or?: FilterQuery[];
  $not?: FilterQuery;
  [key: string]: any; // Literal path matches: "user.name": "John"
};

/**
 * Safely retrieving a deep value from an object using dot/bracket notation.
 * Returns undefined if path doesn't exist.
 */
function get(obj: any, path: string): any {
  if (obj == null) return undefined;
  
  // Clean path: "users[0].name" -> "users.0.name"
  const cleanPath = path.replace(/\[(\d+)\]/g, '.$1');
  const parts = cleanPath.split('.');
  
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}

/**
 * internal recursive matcher
 */
function matches(item: any, query: FilterQuery): boolean {
  // 1. Handle $and
  if ('$and' in query && query.$and) {
    // Every sub-query must be true
    if (!query.$and.every(subQuery => matches(item, subQuery))) {
      return false;
    }
  }

  // 2. Handle $or
  if ('$or' in query && query.$or) {
    // At least one sub-query must be true
    if (!query.$or.some(subQuery => matches(item, subQuery))) {
      return false;
    }
  }

  // 3. Handle $not
  if ('$not' in query && query.$not) {
    // The sub-query must be false
    if (matches(item, query.$not)) {
      return false;
    }
  }

  // 4. Handle direct Key-Value pairs (Implicit AND)
  // We skip the special keys ($and, $or, $not) we just handled
  for (const key in query) {
    if (key === '$and' || key === '$or' || key === '$not') continue;

    const expectedValue = query[key];
    const actualValue = get(item, key);

    // Strict equality check
    if (actualValue !== expectedValue) {
      return false;
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
