# flatohh

> The "Fletó" of flattening utilities. A lightweight TypeScript utility for deeply flattening, unflattening, filtering, pruning, and restructuring nested JavaScript objects and arrays.

[![npm version](https://img.shields.io/npm/v/flatohh.svg)](https://www.npmjs.com/package/flatohh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://img.shields.io/badge/Node.js-%3E%3D7.0-green)](https://nodejs.org/)

## Why?

Transform deeply nested objects into flat, dot-notation key-value pairs (and back again). Perfect for:

- 🔍 Searching through complex nested structures
- 📝 Working with form data and dot-notation paths
- 🗄️ Storing hierarchical data in flat databases
- 🔄 Converting between different data formats
- ⚡ **Deep Filtering & Chaining**
- ✂️ **Deep Pruning (Modifying Inner Arrays)**
- 🛠️ **Structural Renaming (Hoisting/Nesting)**
- 🪄 **Deep Transformation & Selection (Pick/Omit)**

## 📦 Universal Compatibility

`flatohh` is built to work **everywhere** out of the box.

- ✅ **CommonJS (CJS):** Fully supported for Node.js (legacy & modern).
- ✅ **ES Modules (ESM/MJS):** Native support for modern stack (Vite, Next.js, etc.).
- ✅ **TypeScript:** First-class citizen. Includes native `.d.ts` type definitions.
- ✅ **Legacy Support:** Compiles down to ES5, compatible with **Node.js 7+**.

## Quick Start

```bash
npm install flatohh

```

```typescript
import { flatten, deflatten, flatChain, rename, flatTransform, flatPick, flatOmit } from 'flatohh';

// 1. The Classic Flatten
const ferenc = { name: "Ferenc", attributes: { nickname: "Fletó" } };
const flat = flatten(ferenc);
// { "name": "Ferenc", "attributes.nickname": "Fletó" }

// 2. The New Power Features (Renaming & Filtering)
const data = [
  { id: 1, meta: { active: true, role: 'admin', sensitive: 'secret' } },
  { id: 2, meta: { active: false, role: 'user', sensitive: 'hidden' } }
];

const admins = flatChain(data)
  .filter({ 'meta.active': true })
  .value();

// 3. Transformation & Selection
// Apply 10% tax, pick specific fields, and remove sensitive data
const taxed = flatTransform(data, { 'meta.price': (p) => p * 1.1 });
const picked = flatPick(taxed, ['id', 'meta.*']);
const safe = flatOmit(picked, ['meta.sensitive']);

```

## Features

✨ **Simple API** - `flatten`, `deflatten`, `rename`, `flatFilter`, `flatModify`, `flatChain`, `flatTransform`, `flatPick`, `flatOmit`

🔒 **Type-safe** - Full TypeScript support

📦 **Flexible Input** - Accepts objects or JSON strings

🎯 **Smart Notation** - Dot notation for objects, bracket notation for arrays

⚡ **Zero Dependencies** - Lightweight and fast

✂️ **Deep Pruning** - Modify inner arrays using wildcard `houses[*]` syntax

🛠️ **Structure Shifting** - Move data deeper or pull it up using `rename`

🔍 **Deep Query Engine** - MongoDB-style logic (`$and`, `$or`, `$not`, `$elemMatch`) for arrays

## Installation

```bash
npm install flatohh

```

```bash
yarn add flatohh

```

## Usage

### Importing

**ES Modules / TypeScript**

```typescript
import { flatten, deflatten, flatTransform, flatPick, flatOmit } from 'flatohh';

```

**CommonJS (Node.js)**

```javascript
const { flatten, deflatten, flatTransform, flatPick, flatOmit } = require('flatohh');

```

---

### 1. Flatten

Convert nested structures to flat key-value pairs.

#### Basic Example

```typescript
const data = {
  user: {
    name: 'John',
    age: 30,
    settings: {
      theme: 'dark',
      notifications: true
    }
  }
};

const flat = flatten(data);
// {
//   'user.name': 'John',
//   'user.age': 30,
//   'user.settings.theme': 'dark',
//   'user.settings.notifications': true
// }

```

#### With Arrays

```typescript
const data = {
  users: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]
};

const flat = flatten(data);
// {
//   'users[0].id': 1,
//   'users[0].name': 'Alice',
//   'users[1].id': 2,
//   'users[1].name': 'Bob'
// }

```

#### With Custom Prefix

```typescript
const data = { name: 'Alice', age: 25 };
const flat = flatten(data, 'user');
// {
//   'user.name': 'Alice',
//   'user.age': 25
// }

```

#### From JSON String

```typescript
const jsonStr = '{"name":"Alice","address":{"city":"NYC"}}';
const flat = flatten(jsonStr);
// Automatically parses and flattens

```

---

### 2. Deflatten

Reconstruct nested objects from flat structures.

#### Basic Example

```typescript
const flat = {
  'name': 'Alice',
  'address.city': 'NYC',
  'address.zip': '10001'
};

const nested = deflatten(flat);
// {
//   name: 'Alice',
//   address: { city: 'NYC', zip: '10001' }
// }

```

#### Reconstructing Arrays

```typescript
const flat = {
  'items[0].name': 'Apple',
  'items[1].name': 'Orange'
};

const nested = deflatten(flat);
// {
//   items: [
//     { name: 'Apple' },
//     { name: 'Orange' }
//   ]
// }

```

#### Direct to JSON

```typescript
const flat = { 'name': 'Alice', 'age': 25 };
const jsonStr = deflatten.toJson(flat);
// '{"name":"Alice","age":25}'

```

---

### 3. Rename (Restructuring)

Structurally transform objects by moving properties to new paths.

```typescript
const data = {
  userId: 123,
  config: { theme: 'dark' }
};

const result = rename(data, {
  // Push 'userId' deeper into a 'meta' object
  'userId': 'meta.id',
  
  // Rename 'config' object to 'settings' (moves all children automatically)
  'config': 'settings'
});

// Result:
// {
//   meta: { id: 123 },
//   settings: { theme: 'dark' }
// }

```

---

### 4. Filter Arrays (`flatFilter`)

Filter arrays of nested objects without flattening them first.

#### Basic & Logical Filtering

```typescript
const users = [
  { id: 1, meta: { active: true, role: 'admin' } },
  { id: 2, meta: { active: false, role: 'user' } }
];

// Keep users where active is true AND role is admin
const admins = flatFilter(users, {
  'meta.active': true,
  'meta.role': 'admin'
});

// Logical Operators
const result = flatFilter(users, {
  $or: [
    { 'meta.role': 'admin' },
    { 'meta.role': 'guest' }
  ]
});

```

#### Deep Array Tunneling

Automatically check deeply nested arrays (e.g., Parent -> Children -> Toys).

```typescript
// Find parents who have ANY child with a broken toy
flatFilter(parents, {
  'children.toys.status': 'broken'
});

```

#### Checking for Existence (`undefined`)

Check if a nested key is missing or undefined.

```typescript
// Find users missing a profile
const incomplete = flatFilter(users, {
  'user.profile': undefined
});

// Find users who HAVE a profile (Not Undefined)
const complete = flatFilter(users, {
  $not: { 'user.profile': undefined }
});

```

#### Advanced: Correlated Sub-queries (`$elemMatch`)

By default, checks are "Global" (Does the parent have *any* red house and *any* rotten apple?). Use `$elemMatch` to enforce that multiple conditions must be met by the **same** sub-object.

```typescript
// Delete the village ONLY if it has a house that is BOTH Yellow AND has Rotten Apples
const safeVillages = flatFilter(villages, {
  $not: {
    'houses': {
      $elemMatch: {
        'color': 'yellow',
        'boxes.apples.status': 'rotten'
      }
    }
  }
});

```

---

### 5. Deep Pruning (`flatModify`)

Modify inner arrays without writing nested loops. Use the `[*]` wildcard to target an array for filtering.

#### Pruning Child Arrays

Remove items from a child array based on deep logic.

```typescript
const villages = [
  { name: 'Village A', houses: [{ id: 1, bad: false }, { id: 2, bad: true }] }
];

// Keep the village, but remove the bad houses inside it
const cleanVillages = flatModify(villages, {
  'houses[*]': {
    $not: { 'bad': true }
  }
});
// Result: Village A remains, but now has only House 1.

```

#### Recursive Pruning

Go deeper! Modify the grandchildren.

```typescript
// Don't delete the house. Just delete the rotten box INSIDE the house.
const result = flatModify(villages, {
  'houses[*].boxes[*]': {
    $not: { 'apples.status': 'rotten' }
  }
});

```

---

### 6. Piping (`flatChain`)

Chain multiple filtering steps together efficiently. Uses **Lazy Execution** to optimize into a single pass.

```typescript
const result = flatChain(data)
  // Step 1: Filter by deep property
  .filter({ 'attributes.color': 'red' })
  
  // Step 2: Filter by logic
  .filter({ 
    $or: [
      { status: 'active' },
      { status: 'pending' }
    ]
  })
  .value();

```

---

### 7. Deep Transformation (`flatTransform`)

Modify values at specific deep paths (including within arrays) using mapper functions.

```typescript
const products = [
  { id: 1, info: { price: 100, name: 'Apple' } },
  { id: 2, info: { price: 200, name: 'Banana' } }
];

// Apply 10% tax to all prices across nested structures
const taxed = flatTransform(products, {
  'info.price': (p) => p * 1.1
});
// Result: Prices are now 110 and 220

```

#### Transforming Nested Arrays

Use the `[*]` wildcard to apply transformations to every item in a nested list.

```typescript
flatTransform(orders, {
  'items[*].qty': (q) => q * 2 // Double the quantity of all items
});

```

---

### 8. Selection (`flatPick` / `flatOmit`)

Surgical property selection using dot-notation. This is safer than standard picking because it understands nested structures and arrays.

```typescript
const user = {
  id: 1,
  profile: { name: 'Alice', age: 30, internalId: 'SECRET' },
  tags: ['admin', 'verified']
};

// Pick only what you need (Whitelist)
const publicUser = flatPick(user, ['id', 'profile.name', 'tags[*]']);
// -> { id: 1, profile: { name: 'Alice' }, tags: [...] }

// Omit sensitive fields (Blacklist)
const safeUser = flatOmit(user, ['profile.internalId', 'profile.age']);
// -> { id: 1, profile: { name: 'Alice' }, ... }

```

---

## API Reference

### `flatten(obj, prefix?, result?)`

Converts a nested object into a flat structure.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `obj` | `object | string` | required |
| `prefix` | `string` | `''` | Optional prefix for all keys |
| `result` | `object` | `{}` | Existing object to mutate (advanced) |

**Returns:** `Record<string, any>` - Flat object with dot/bracket notation keys

### `deflatten(flatObj)`

Reconstructs a nested object from a flat structure.

| Parameter | Type | Description |
| --- | --- | --- |
| `flatObj` | `object | string` |

**Returns:** `Record<string, any>` - Nested object structure

### `rename(obj, mapping)`

Structurally transforms the object.

| Parameter | Type | Description |
| --- | --- | --- |
| `obj` | `object` | The source object |
| `mapping` | `Record<string, string>` | Map of `{ oldPath: newPath }` |

**Returns:** `object` - The restructured object.

> **Note:** This acts as a "Move" operation. If moving a property leaves its parent object empty, the parent is automatically removed from the result.

### `flatFilter(array, query)`

Filters an array of objects using deep dot-notation paths and logical operators.

| Parameter | Type | Description |
| --- | --- | --- |
| `array` | `Array<any>` | The array of objects to filter |
| `query` | `object` | The filter criteria with dot-paths or `$and`/`$or`/`$not`/`$elemMatch` |

**Returns:** `Array<any>` - A new array containing only items that match the query.

### `flatModify(array, rules)`

Modifies deeply nested arrays in place (returned as new copy).

| Parameter | Type | Description |
| --- | --- | --- |
| `array` | `Array<any>` | The root array |
| `rules` | `Record<string, Query>` | Map of `path[*]` -> `FilterQuery` |

**Returns:** `Array<any>` - The modified structure.

### `flatChain(array)`

Creates a fluent chain for piping operations.

| Method | Description |
| --- | --- |
| `.filter(query)` | Adds a deep filter step to the pipe. |
| `.value()` | Executes the optimized pipe and returns the result. |

### `flatTransform(data, mapping)`

Transforms values at specific paths.

| Parameter | Type | Description |
| --- | --- | --- |
| `data` | `object | Array` |
| `mapping` | `Record<string, Function>` | Map of `path` -> `MapperFunction(value) => newValue` |

**Returns:** `object | Array` - The transformed data (structure preserved).

### `flatPick(obj, paths)`

Returns a new object containing **only** the specified paths.

| Parameter | Type | Description |
| --- | --- | --- |
| `obj` | `object` | Source object |
| `paths` | `string[]` | Array of dot-notation paths to keep. Supports `[*]` |

### `flatOmit(obj, paths)`

Returns a new object **excluding** the specified paths.

| Parameter | Type | Description |
| --- | --- | --- |
| `obj` | `object` | Source object |
| `paths` | `string[]` | Array of dot-notation paths to remove. Supports `[*]` |

## License

MIT © [Imre Toth]
