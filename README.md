# flatohh

> The "Fletó" of flattening utilities. A lightweight TypeScript utility for deeply flattening, unflattening, filtering, and restructuring nested JavaScript objects and arrays.

[![npm version](https://img.shields.io/npm/v/flatohh.svg)](https://www.npmjs.com/package/flatohh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why?

Transform deeply nested objects into flat, dot-notation key-value pairs (and back again). Perfect for:

- 🔍 Searching through complex nested structures
- 📝 Working with form data and dot-notation paths
- 🗄️ Storing hierarchical data in flat databases
- 🔄 Converting between different data formats
- ⚡ **Deep Filtering & Chaining**
- 🛠️ **Structural Renaming (Hoisting/Nesting)**

## Quick Start

```bash
npm install flatohh

```

```typescript
import { flatten, deflatten, flatChain, rename } from 'flatohh';

// 1. The Classic Flatten
const ferenc = { name: "Ferenc", attributes: { nickname: "Fletó" } };
const flat = flatten(ferenc);
// { "name": "Ferenc", "attributes.nickname": "Fletó" }

// 2. The New Power Features (Renaming & Filtering)
const data = [
  { id: 1, meta: { active: true, role: 'admin' } },
  { id: 2, meta: { active: false, role: 'user' } }
];

const admins = flatChain(data)
  .filter({ 'meta.active': true })
  .value();

```

## Features

✨ **Simple API** - `flatten`, `deflatten`, `rename`, `flatFilter`, `flatChain`

🔒 **Type-safe** - Full TypeScript support

📦 **Flexible Input** - Accepts objects or JSON strings

🎯 **Smart Notation** - Dot notation for objects, bracket notation for arrays

⚡ **Zero Dependencies** - Lightweight and fast

🛠️ **Structure Shifting** - Move data deeper or pull it up using `rename`

🔍 **Deep Query Engine** - MongoDB-style logic (`$and`, `$or`, `$not`) for arrays

## Installation

```bash
npm install flatohh

```

```bash
yarn add flatohh

```

## Usage

### Importing

```typescript
// ESM
import { flatten, deflatten, rename, flatFilter, flatChain } from 'flatohh';

// CommonJS
const { flatten, deflatten, rename, flatFilter, flatChain } = require('flatohh');

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

### 5. Piping (`flatChain`)

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

## API Reference

### `flatten(obj, prefix?, result?)`

Converts a nested object into a flat structure.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `obj` | `object | string` | required | Object to flatten or JSON string |
| `prefix` | `string` | `''` | Optional prefix for all keys |
| `result` | `object` | `{}` | Existing object to mutate (advanced) |

**Returns:** `Record<string, any>` - Flat object with dot/bracket notation keys

### `deflatten(flatObj)`

Reconstructs a nested object from a flat structure.

| Parameter | Type | Description |
| --- | --- | --- |
| `flatObj` | `object | string` | Flat object or JSON string |

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
| `query` | `object` | The filter criteria with dot-paths or `$and`/`$or`/`$not` |

**Returns:** `Array<any>` - A new array containing only items that match the query.

### `flatChain(array)`

Creates a fluent chain for piping operations.

| Method | Description |
| --- | --- |
| `.filter(query)` | Adds a deep filter step to the pipe. |
| `.value()` | Executes the optimized pipe and returns the result. |

## License

MIT © [Imre Toth]
