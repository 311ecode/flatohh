import { flatten } from '../flatten/flatten';
import { deflatten } from '../flatten/deflatten';

/**
 * Returns a new object containing only the specified paths.
 */
export const flatPick = (obj: any, paths: string[]): any => {
  const flat = flatten(obj);
  const result: Record<string, any> = {};

  for (const path of paths) {
    if (path.includes('[*]')) {
      const regex = new RegExp('^' + path.replace(/\[\*\]/g, '\\[\\d+\\]').replace(/\./g, '\\.') + '($|\\.)');
      for (const key of Object.keys(flat)) {
        if (regex.test(key)) result[key] = flat[key];
      }
    } else if (path in flat) {
      result[path] = flat[path];
    } else {
      // Handle namespace pick
      const prefix = path + '.';
      for (const key of Object.keys(flat)) {
        if (key.startsWith(prefix)) result[key] = flat[key];
      }
    }
  }
  return deflatten(result);
};

/**
 * Returns a new object excluding the specified paths.
 */
export const flatOmit = (obj: any, paths: string[]): any => {
  const flat = flatten(obj);
  
  for (const path of paths) {
    if (path.includes('[*]')) {
      const regex = new RegExp('^' + path.replace(/\[\*\]/g, '\\[\\d+\\]').replace(/\./g, '\\.') + '($|\\.)');
      for (const key of Object.keys(flat)) {
        if (regex.test(key)) delete flat[key];
      }
    } else {
      delete flat[path];
      const prefix = path + '.';
      for (const key of Object.keys(flat)) {
        if (key.startsWith(prefix)) delete flat[key];
      }
    }
  }
  return deflatten(flat);
};
