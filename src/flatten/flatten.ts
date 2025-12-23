type Nested = Record<string | number, any>;

interface FlattenFn {
  <T extends Record<string, any>>(obj: T | string, prefix?: string, result?: Record<string, any>): Record<string, any>;
}

export const flatten: FlattenFn = function <T extends Record<string, any>>(obj: T | string, prefix: string = '', result: Record<string, any> = {}) {
  let actualObj: T;
  if (typeof obj === 'string') {
    try {
      actualObj = JSON.parse(obj) as T;
    } catch (e) {
      throw new Error('Invalid JSON string provided to flatten');
    }
  } else {
    actualObj = obj;
  }

  for (const key in actualObj) {
    if (Object.prototype.hasOwnProperty.call(actualObj, key)) {
      const value = actualObj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value === null || value === undefined) {
        result[newKey] = value;
      } else if (Array.isArray(value)) {
        value.forEach((item: any, index: number) => {
          const arrayKey = `${newKey}[${index}]`;
          if (item !== null && typeof item === 'object') {
            flatten(item as Nested, arrayKey, result);
          } else {
            result[arrayKey] = item;
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        flatten(value as Nested, newKey, result);
      } else {
        result[newKey] = value;
      }
    }
  }
  return result;
};