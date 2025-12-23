# flatohh

> The "Fletó" of flattening utilities. A lightweight TypeScript utility for deeply flattening, unflattening, and filtering nested JavaScript objects and arrays.

[![npm version](https://img.shields.io/npm/v/flatohh.svg)](https://www.npmjs.com/package/flatohh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why?

Transform deeply nested objects into flat, dot-notation key-value pairs (and back again). Perfect for:

- 🔍 Searching through complex nested structures
- ⚡ **Deep Filtering & Chaining**
- 📝 Working with form data and dot-notation paths
- 🗄️ Storing hierarchical data in flat databases
- 🔄 Converting between different data formats
- 📊 Processing API responses with deep nesting

## Quick Start

```bash
npm install flatohh

```

```typescript
import { flatten, deflatten, flatChain } from 'flatohh';

// 1. Flattening
const user = { name: "Ferenc", skills: { dancing: true } };
const flat = flatten(user); 
// { "name": "Ferenc", "skills.dancing": true }

// 2. Piping / Filtering
const data = [
  { id: 1, meta: { active: true, role: 'admin' } },
  { id: 2, meta: { active: false, role: 'user' } }
];

const admins = flatChain(data)
  .filter({ 'meta.active': true })
  .filter({ 'meta.role': 'admin' })
  .value();

```

## Features

✨ **Simple API** - `flatten`, `deflatten`, `flatFilter`, and `flatChain`

🔒 **Type-safe** - Full TypeScript support

📦 **Flexible Input** - Accepts objects or JSON strings

🎯 **Smart Notation** - Dot notation for objects, bracket notation for arrays

⚡ **Zero Dependencies** - Lightweight and fast

🔍 **Deep Query Engine** - MongoDB-style logic (`$and`, `$or`, `$not`) for arrays

⛓️ **Smart Chaining** - Lazy execution piping that optimizes multiple filters into a single pass

## Installation

```bash
npm install flatohh

```

```bash
yarn add flatohh

```

```bash
pnpm add flatohh

```

## Usage

### Importing

```typescript
// ESM
import { flatten, deflatten, flatFilter, flatChain } from 'flatohh';

// CommonJS
const { flatten, deflatten, flatFilter, flatChain } = require('flatohh');

```

### Flatten

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

### Deflatten

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
//   address: {
//     city: 'NYC',
//     zip: '10001'
//   }
// }

```

#### Reconstructing Arrays

```typescript
const flat = {
  'items[0].name': 'Apple',
  'items[0].price': 1.50,
  'items[1].name': 'Orange',
  'items[1].price': 2.00
};

const nested = deflatten(flat);
// {
//   items: [
//     { name: 'Apple', price: 1.50 },
//     { name: 'Orange', price: 2.00 }
//   ]
// }

```

#### Direct to JSON

```typescript
const flat = { 'name': 'Alice', 'age': 25 };
const jsonStr = deflatten.toJson(flat);
// '{"name":"Alice","age":25}'

```

### Filter Arrays (`flatFilter`)

Filter arrays of nested objects without flattening them first. Supports dot-notation and logical operators.

#### Basic Filtering (Implicit AND)

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

```

#### Logical Operators (`$or`, `$not`)

```typescript
// Keep users who are either admins OR guests
const result = flatFilter(users, {
  $or: [
    { 'meta.role': 'admin' },
    { 'meta.role': 'guest' }
  ]
});

// "Filter Out": Keep users who are NOT inactive
const activeUsers = flatFilter(users, {
  $not: { 'meta.active': false }
});

```

#### Advanced: Deep Array Tunneling

`flatohh` automatically tunnels through arrays. If you have `Parents -> Children -> Toys`:

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

### Piping (`flatChain`)

Chain multiple filtering steps together efficiently. The chain uses **Lazy Execution**: it combines all your filters into a single pass for maximum performance.

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
  
  // Step 3: Execute and get result
  .value();

```

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
