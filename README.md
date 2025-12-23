# flatohh

> The "Fletó" of flattening utilities. A lightweight TypeScript utility for deeply flattening and unflattening nested JavaScript objects and arrays.

[![npm version](https://img.shields.io/npm/v/flatohh.svg)](https://www.npmjs.com/package/flatohh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why?

Transform deeply nested objects into flat, dot-notation key-value pairs (and back again). Perfect for:

- 🔍 Searching through complex nested structures
- 📝 Working with form data and dot-notation paths
- 🗄️ Storing hierarchical data in flat databases
- 🔄 Converting between different data formats
- 📊 Processing API responses with deep nesting

## Quick Start

```bash
npm install flatohh

```

```typescript
import { flatten, deflatten } from 'flatohh';

// The "Fletó" Example
const ferenc = {
  name: "Ferenc",
  attributes: {
    nickname: "Fletó",
    skills: {
      dancing: true,
      cooking: false
    }
  }
};

const flat = flatten(ferenc);
// {
//   "name": "Ferenc",
//   "attributes.nickname": "Fletó",
//   "attributes.skills.dancing": true,
//   "attributes.skills.cooking": false
// }

const original = deflatten(flat);
// Back to the original nested structure!

```

## Features

✨ **Simple API** - Just two main functions: `flatten()` and `deflatten()`

🔒 **Type-safe** - Full TypeScript support with type declarations

📦 **Flexible Input** - Accepts objects or JSON strings

🎯 **Smart Notation** - Dot notation for objects, bracket notation for arrays

⚡ **Zero Dependencies** - Lightweight and fast

🔄 **Lossless Round-trips** - Perfect reconstruction of original data

📚 **ESM & CommonJS** - Works everywhere

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
import { flatten, deflatten } from 'flatohh';

// CommonJS
const { flatten, deflatten } = require('flatohh');

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

## API Reference

### `flatten(obj, prefix?, result?)`

Converts a nested object into a flat structure.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `obj` | `object | string` | required | Object to flatten or JSON string |
| `prefix` | `string` | `''` | Optional prefix for all keys |
| `result` | `object` | `{}` | Existing object to mutate (advanced) |

**Returns:** `Record<string, any>` - Flat object with dot/bracket notation keys

**Throws:** Error if JSON string is invalid

### `deflatten(flatObj)`

Reconstructs a nested object from a flat structure.

| Parameter | Type | Description |
| --- | --- | --- |
| `flatObj` | `object | string` | Flat object or JSON string |

**Returns:** `Record<string, any>` - Nested object structure

**Throws:** Error if JSON string is invalid

### `deflatten.toJson(flatObj)`

Convenience method to deflatten and return as JSON string.

| Parameter | Type | Description |
| --- | --- | --- |
| `flatObj` | `object | string` | Flat object or JSON string |

**Returns:** `string` - JSON string of the nested object

## License

MIT © [Imre Toth]
