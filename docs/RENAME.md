# Structural Rename / Hoist / Nest Guide

`rename(obj, mapping)` moves properties or entire subtrees within an object structure. It works by flattening the object, transforming keys, then deflattening.

## Basic Operations

### Hoist Deep Value to Root

Move a nested property up to the top level:

```ts
const data = { user: { profile: { id: 123 } } };

rename(data, { 'user.profile.id': 'id' });
// → { id: 123, user: { profile: {} } }
```

### Nest Root Value Deeper

Move a top-level property into a nested structure:

```ts
const data = { id: 123, name: 'Alice' };

rename(data, { 'id': 'meta.userId' });
// → { meta: { userId: 123 }, name: 'Alice' }
```

### Simple Rename (Same Level)

```ts
const data = { firstName: 'Alice' };

rename(data, { 'firstName': 'name' });
// → { name: 'Alice' }
```

## Namespace / Subtree Moves

When you rename a parent key, **all children move with it**:

```ts
const data = {
  config: {
    host: 'localhost',
    port: 8080,
    ssl: { enabled: true }
  }
};

rename(data, { 'config': 'settings' });
// → {
//     settings: {
//       host: 'localhost',
//       port: 8080,
//       ssl: { enabled: true }
//     }
//   }
```

This works because internally:
1. `config.host` → `settings.host`
2. `config.port` → `settings.port`
3. `config.ssl.enabled` → `settings.ssl.enabled`

## Array Handling

Arrays and their contents can be renamed:

```ts
// Rename the array itself
const data = { users: [{ name: 'Alice' }, { name: 'Bob' }] };

rename(data, { 'users': 'people' });
// → { people: [{ name: 'Alice' }, { name: 'Bob' }] }
```

```ts
// Rename a specific array element's property
const data = { items: [{ oldKey: 'value' }] };

rename(data, { 'items[0].oldKey': 'items[0].newKey' });
// → { items: [{ newKey: 'value' }] }
```

## Multiple Renames

Apply multiple transformations at once:

```ts
const data = {
  user_id: 123,
  user_name: 'Alice',
  config: { theme: 'dark' }
};

rename(data, {
  'user_id': 'id',
  'user_name': 'profile.name',
  'config': 'settings'
});
// → {
//     id: 123,
//     profile: { name: 'Alice' },
//     settings: { theme: 'dark' }
//   }
```

## Empty Parent Cleanup

When all children are moved out, empty parents remain as empty objects:

```ts
const data = { wrapper: { value: 42 } };

rename(data, { 'wrapper.value': 'value' });
// → { value: 42, wrapper: {} }
```

To fully remove empty parents, you may need a cleanup step:

```ts
function removeEmpty(obj) {
  return JSON.parse(JSON.stringify(obj, (k, v) => 
    v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0 
      ? undefined 
      : v
  ));
}

const result = rename(data, { 'wrapper.value': 'value' });
const cleaned = removeEmpty(result);
// → { value: 42 }
```

## Common Patterns

### API Response Transformation

```ts
// Convert snake_case API response to camelCase nested structure
const apiResponse = {
  user_id: 1,
  user_email: 'alice@example.com',
  account_settings_theme: 'dark',
  account_settings_notifications: true
};

rename(apiResponse, {
  'user_id': 'user.id',
  'user_email': 'user.email',
  'account_settings_theme': 'settings.theme',
  'account_settings_notifications': 'settings.notifications'
});
// → {
//     user: { id: 1, email: 'alice@example.com' },
//     settings: { theme: 'dark', notifications: true }
//   }
```

### Flattening for Storage

```ts
// Prepare nested data for flat storage
const nested = {
  user: { name: 'Alice', prefs: { theme: 'dark' } }
};

rename(nested, {
  'user.name': 'userName',
  'user.prefs.theme': 'userTheme'
});
// → { userName: 'Alice', userTheme: 'dark', user: { prefs: {} } }
```

### Reorganizing Config

```ts
// Split one namespace into multiple
const config = {
  app: { dbHost: 'localhost', dbPort: 5432, cacheHost: 'redis' }
};

rename(config, {
  'app.dbHost': 'database.host',
  'app.dbPort': 'database.port',
  'app.cacheHost': 'cache.host'
});
// → {
//     database: { host: 'localhost', port: 5432 },
//     cache: { host: 'redis' },
//     app: {}
//   }
```

## Edge Cases

### Non-Existent Source Paths

If the source path doesn't exist, nothing happens (no error):

```ts
const data = { a: 1 };

rename(data, { 'b': 'c' });
// → { a: 1 }  (unchanged)
```

### Overlapping Renames

Be careful with overlapping paths:

```ts
const data = { a: { b: 1, c: 2 } };

// ⚠️ This might not work as expected
rename(data, {
  'a': 'x',        // Moves a.b and a.c to x.b and x.c
  'a.b': 'y.b'     // This key no longer exists after first rename!
});
```

**Solution:** Order matters. More specific paths should be processed first, or use separate calls:

```ts
let result = rename(data, { 'a.b': 'y.b' });
result = rename(result, { 'a': 'x' });
```

### Circular Moves

Don't create circular references:

```ts
// ❌ Don't do this
rename(data, {
  'a': 'b',
  'b': 'a'
});
```

## How It Works

1. **Flatten** the input object to dot/bracket notation
2. **Transform keys** according to the mapping:
   - Exact matches: `oldPath` → `newPath`
   - Prefix matches: `oldPath.child` → `newPath.child`
3. **Deflatten** back to nested structure

This means `rename` is non-destructive to values – it only changes structure.

## See Also

- [Deep Query & Filtering](./DEEP-QUERY.md) - Filter before renaming
- [Deep Pruning](./PRUNING.md) - Remove items before restructuring
