type Nested = Record<string | number, any>;

interface DeflattenFn {
  (flatObj: Record<string, any> | string): Record<string, any>;
  toJson(flatObj: Record<string, any> | string): string;
}

export const deflatten: DeflattenFn = function (flatObj: Record<string, any> | string): Record<string, any> {
  let actualFlat: Record<string, any>;
  if (typeof flatObj === 'string') {
    try {
      actualFlat = JSON.parse(flatObj);
    } catch (e) {
      throw new Error('Invalid JSON string provided to deflatten');
    }
  } else {
    actualFlat = flatObj;
  }

  const result: Nested = {};
  
  for (const key in actualFlat) {
    if (Object.prototype.hasOwnProperty.call(actualFlat, key)) {
      const value = actualFlat[key];
      const parts = key.split(/\.|\[(\d+)\]/g).filter(Boolean);
      let current: Nested = result;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;

        if (part.match(/^\d+$/)) {
          const index = parseInt(part, 10);
          if (isLast) {
            current[index] = value;
          } else {
            const nextIsArray = Boolean(parts[i + 1]?.match(/^\d+$/));
            current[index] = (current[index] || (nextIsArray ? [] : {})) as Nested;
            current = current[index] as Nested;
          }
        } else {
          if (isLast) {
            current[part] = value;
          } else {
            const nextIsArray = Boolean(parts[i + 1]?.match(/^\d+$/));
            current[part] = (current[part] || (nextIsArray ? [] : {})) as Nested;
            current = current[part] as Nested;
          }
        }
      }
    }
  }
  return result;
};

deflatten.toJson = function (flatObj: Record<string, any> | string): string {
  const result = deflatten(flatObj);
  return JSON.stringify(result);
};