import { flatFilter, FilterQuery } from '../filter/filter';

/**
 * Modifies an array of objects by filtering nested arrays based on wildcard paths.
 * * @param data The array to modify (deep pruning)
 * @param rules Object where keys are paths with [*] and values are filter queries.
 * Example: { 'houses[*]': { $not: { 'color': 'red' } } }
 */
export const flatModify = <T>(data: T[], rules: Record<string, FilterQuery>): T[] => {
  const result = data.map(item => ({ ...item }));

  for (const [path, query] of Object.entries(rules)) {
    const match = path.match(/^(.*?)\[\*\](.*)$/);

    if (!match) {
      throw new Error(`flatModify rule key must contain [*] to indicate an array. Invalid key: "${path}"`);
    }

    const [, arrayPath, remainder] = match;

    for (let i = 0; i < result.length; i++) {
      const item = result[i] as any;
      const parts = arrayPath.split('.');
      let parentOfArray: any = item;
      let keyOfArray: string = parts[parts.length - 1];

      for (let j = 0; j < parts.length - 1; j++) {
        parentOfArray = parentOfArray[parts[j]];
        if (!parentOfArray) break;
      }
      
      if (!parentOfArray || !Array.isArray(parentOfArray[keyOfArray])) continue;
      const targetArray = parentOfArray[keyOfArray];

      if (!remainder || remainder === '') {
        parentOfArray[keyOfArray] = flatFilter(targetArray, query);
      } else {
        const nextRule = { [remainder.slice(1)]: query };
        parentOfArray[keyOfArray] = flatModify(targetArray, nextRule);
      }
    }
  }

  return result;
};

/**
 * Transforms values at specific paths using a mapper function.
 * Supports [*] wildcard for arrays.
 */
export const flatTransform = <T>(data: T | T[], transforms: Record<string, (val: any) => any>): T | T[] => {
  const isArray = Array.isArray(data);
  const items = isArray ? (data as T[]) : [data as T];
  
  const result = items.map(item => {
    const cloned = JSON.parse(JSON.stringify(item));
    for (const [path, mapper] of Object.entries(transforms)) {
      applyTransform(cloned, path, mapper);
    }
    return cloned;
  });

  return isArray ? result : result[0];
};

function applyTransform(obj: any, path: string, mapper: (val: any) => any) {
  if (!path.includes('[*]')) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) return;
      current = current[parts[i]];
    }
    const lastKey = parts[parts.length - 1];
    if (lastKey in current) {
      current[lastKey] = mapper(current[lastKey]);
    }
    return;
  }

  const match = path.match(/^(.*?)\[\*\](.*)$/);
  if (!match) return;
  const [, arrayPath, remainder] = match;
  
  const parts = arrayPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (!current[part]) return;
    current = current[part];
  }

  if (Array.isArray(current)) {
    current.forEach(item => {
      if (!remainder) {
        // Direct array item transform if path was "tags[*]"
        // This is complex for primitives, usually used for objects
      } else {
        applyTransform(item, remainder.slice(1), mapper);
      }
    });
  }
}
