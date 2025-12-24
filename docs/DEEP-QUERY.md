# Deep Query & Filtering Guide

This document explains the advanced querying capabilities of `flatFilter` and `flatChain`.

## Basic Query Syntax

### Implicit $and

Multiple keys in a query object are combined with AND logic:

```ts
// Both conditions must be true
flatFilter(users, {
  'meta.active': true,
  'meta.role': 'admin'
});
```

### Explicit Operators

```ts
// $and - all conditions must match
flatFilter(users, {
  $and: [
    { 'meta.active': true },
    { 'meta.role': 'admin' }
  ]
});

// $or - any condition matches
flatFilter(users, {
  $or: [
    { 'meta.role': 'admin' },
    { 'meta.role': 'guest' }
  ]
});

// $not - negation
flatFilter(users, {
  $not: { 'meta.active': false }
});
```

## Existence Checks

```ts
// Find items where a property is missing or undefined
flatFilter(users, { 'profile': undefined });

// Find items where a property EXISTS (has any value)
flatFilter(users, { $not: { 'profile': undefined } });

// Combine with other conditions
flatFilter(users, {
  'meta.active': true,
  $not: { 'profile': undefined }  // must have profile
});
```

## $elemMatch – Correlated Array Conditions

This is the most powerful operator for querying arrays.

### The Problem

**Without** `$elemMatch`, conditions on array items are **independent**:

```ts
const villages = [
  {
    name: 'Mixed Village',
    houses: [
      { color: 'yellow', apples: [{ status: 'fresh' }] },
      { color: 'blue', apples: [{ status: 'rotten' }] }
    ]
  }
];

// This MATCHES Mixed Village!
// Because: SOME house is yellow AND SOME house has rotten apples
// (they don't need to be the same house)
flatFilter(villages, {
  'houses.color': 'yellow',
  'houses.apples.status': 'rotten'
});
```

### The Solution

**With** `$elemMatch`, all conditions must be true **on the same array element**:

```ts
// This does NOT match Mixed Village
// Because: No single house is BOTH yellow AND has rotten apples
flatFilter(villages, {
  houses: {
    $elemMatch: {
      color: 'yellow',
      'apples.status': 'rotten'
    }
  }
});
```

### Nested $elemMatch

You can nest `$elemMatch` for deeply correlated queries:

```ts
flatFilter(warehouses, {
  shelves: {
    $elemMatch: {
      section: 'A',
      boxes: {
        $elemMatch: {
          label: 'fragile',
          'items.status': 'damaged'
        }
      }
    }
  }
});
```

## Deep Array Tunneling

Query through multiple nested arrays without explicit wildcards:

```ts
const crates = [
  {
    id: 'Crate_1',
    boxes: [
      { id: 'B1', apples: [{ status: 'fresh' }] },
      { id: 'B2', apples: [{ status: 'fresh' }] }
    ]
  },
  {
    id: 'Crate_2',
    boxes: [
      { id: 'B3', apples: [{ status: 'rotten' }] }
    ]
  }
];

// Automatically tunnels: crates → boxes[] → apples[] → status
flatFilter(crates, { 'boxes.apples.status': 'rotten' });
// → [Crate_2]
```

### Mixed Depth Querying

```ts
// Find crates where:
// 1. Some box has id 'B3' (depth 1)
// 2. AND some apple is rotten (depth 2)
flatFilter(crates, {
  'boxes.id': 'B3',
  'boxes.apples.status': 'rotten'
});
```

### Explicit Index Access

Use bracket notation to query specific array indices:

```ts
// Only check the FIRST box of each crate
flatFilter(crates, { 'boxes[0].apples.status': 'rotten' });
```

## Complex Logical Combinations

### NOT (A OR B)

```ts
// Exclude admins and guests
flatFilter(users, {
  $not: {
    $or: [
      { 'meta.role': 'admin' },
      { 'meta.role': 'guest' }
    ]
  }
});
```

### NOT (A AND B)

```ts
// Exclude users who are BOTH inactive AND banned
flatFilter(users, {
  $not: {
    $and: [
      { 'meta.active': false },
      { 'meta.role': 'banned' }
    ]
  }
});
```

### Complex Village Example

```ts
// Delete village if:
// - Has a red house
// - AND has a yellow house with rotten apples (correlated!)
flatFilter(villages, {
  $not: {
    $and: [
      { 'houses.color': 'red' },
      {
        houses: {
          $elemMatch: {
            color: 'yellow',
            'apples.status': 'rotten'
          }
        }
      }
    ]
  }
});
```

## Edge Cases

### Empty Arrays

Empty arrays don't match any value queries:

```ts
const data = [
  { id: 1, tags: [] },
  { id: 2, tags: [{ name: 'A' }] }
];

flatFilter(data, { 'tags.name': 'A' });
// → [{ id: 2, ... }]  (id: 1 is excluded)
```

### Missing Properties

Missing properties return `undefined` and can be explicitly queried:

```ts
const data = [
  { id: 1, meta: { role: 'admin' } },
  { id: 2 }  // no meta
];

flatFilter(data, { 'meta.role': undefined });
// → [{ id: 2 }]
```

## Performance Tips

1. **Use `flatChain` for multiple filters** - combines into single pass
2. **Put most restrictive conditions first** - reduces iterations
3. **Avoid deep tunneling when possible** - explicit paths are faster
4. **Use `$elemMatch` only when correlation is needed** - simpler queries are faster

## See Also

- [Deep Pruning with `[*]`](./PRUNING.md) - Modify instead of filter
- [Structural Rename Patterns](./RENAME.md) - Transform structure
