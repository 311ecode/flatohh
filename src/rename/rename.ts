import { flatten } from '../flatten/flatten';
import { deflatten } from '../flatten/deflatten';

/**
 * Renames keys in a nested object structure.
 * Can move properties deeper (apple -> fruit.apple) or hoist them up (fruit.apple -> apple).
 * * @param obj The source object (nested or flat)
 * @param mapping Key-value pairs of { oldPath: newPath }
 */
export const rename = (obj: any, mapping: Record<string, string>): any => {
  // 1. Work on the flat structure so we don't worry about nesting depth
  const flat = flatten(obj);
  const result: Record<string, any> = {};

  // 2. Iterate over every single flat key (e.g., "user.name", "items[0].id")
  for (const currentKey of Object.keys(flat)) {
    let newKey = currentKey;
    let matchFound = false;

    // 3. Check against all mapping rules
    for (const [oldPath, targetPath] of Object.entries(mapping)) {
      // Case A: Exact Match (e.g., "user.name" -> "fullName")
      if (currentKey === oldPath) {
        newKey = targetPath;
        matchFound = true;
        break;
      }

      // Case B: Namespace/Prefix Match (e.g., "settings" -> "config")
      // Matches "settings.theme", "settings[0]", etc.
      // We must ensure we match a full path segment (followed by . or [)
      const prefixDot = oldPath + '.';
      const prefixBrace = oldPath + '[';

      if (currentKey.startsWith(prefixDot) || currentKey.startsWith(prefixBrace)) {
        // Replace the start of the string
        newKey = targetPath + currentKey.slice(oldPath.length);
        matchFound = true;
        break;
      }
    }

    result[newKey] = flat[currentKey];
  }

  // 4. Reconstruct the object
  return deflatten(result);
};
