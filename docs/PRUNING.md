# Deep Pruning Guide – flatModify & `[*]`

`flatModify` lets you filter **inner arrays** without losing the parent objects. This is the key difference from `flatFilter`:

- `flatFilter`: Removes entire top-level items from the array
- `flatModify`: Removes items from nested arrays, keeping parents intact

## Basic Usage

```ts
const villages = [
  {
    name: 'Village A',
    houses: [
      { id: 'h1', status: 'good' },
      { id: 'h2', status: 'condemned' },
      { id: 'h3', status: 'good' }
    ]
  }
];

// Keep village, but remove condemned houses
const result = flatModify(villages, {
  'houses[*]': { $not: { status: 'condemned' } }
});

// Result:
// [{ name: 'Village A', houses: [{ id: 'h1', ... }, { id: 'h3', ... }] }]
```

## The `[*]` Wildcard

The `[*]` indicates which array to prune. The query after it determines which items to **keep**.

```ts
// Syntax: 'path.to.array[*]': { keepCondition }

// Keep only blue houses
flatModify(data, { 'houses[*]': { color: 'blue' } });

// Keep houses that are NOT red
flatModify(data, { 'houses[*]': { $not: { color: 'red' } } });

// Keep houses that are blue OR have good status
flatModify(data, {
  'houses[*]': {
    $or: [
      { color: 'blue' },
      { status: 'good' }
    ]
  }
});
```

## Multi-Level / Recursive Pruning

Prune arrays inside arrays using multiple `[*]` wildcards:

```ts
const villages = [
  {
    name: 'Village A',
    houses: [
      {
        id: 'h1',
        boxes: [
          { id: 'b1', status: 'fresh' },
          { id: 'b2', status: 'rotten' }
        ]
      }
    ]
  }
];

// Keep houses, but remove rotten boxes inside them
flatModify(villages, {
  'houses[*].boxes[*]': { $not: { status: 'rotten' } }
});

// Result: House h1 still exists, but only has box b1
```

### Three Levels Deep

```ts
flatModify(data, {
  'warehouses[*].shelves[*].items[*]': { $not: { damaged: true } }
});
```

## Deep Attribute Filtering

Use dot notation to filter based on nested properties:

```ts
const villages = [
  {
    name: 'Village A',
    houses: [
      { id: 'h1', boxes: [{ apples: [{ status: 'fresh' }] }] },
      { id: 'h2', boxes: [{ apples: [{ status: 'rotten' }] }] }
    ]
  }
];

// Remove houses that contain ANY rotten apple
flatModify(villages, {
  'houses[*]': { $not: { 'boxes.apples.status': 'rotten' } }
});
```

## Using $elemMatch in Pruning Rules

Since `flatModify` uses `flatFilter` internally, all query operators work:

```ts
// Keep only houses where the SAME box is both blue AND contains fresh apples
flatModify(villages, {
  'houses[*]': {
    boxes: {
      $elemMatch: {
        color: 'blue',
        'apples.status': 'fresh'
      }
    }
  }
});
```

## Multiple Rules

Apply multiple pruning rules in one call:

```ts
flatModify(data, {
  'houses[*]': { $not: { condemned: true } },
  'houses[*].rooms[*]': { $not: { flooded: true } }
});
```

**Note:** Rules are applied sequentially. The second rule operates on the result of the first.

## Common Patterns

### Remove All Matching Items

```ts
// Remove all red houses
flatModify(villages, { 'houses[*]': { $not: { color: 'red' } } });
```

### Keep Only Matching Items

```ts
// Keep only blue houses
flatModify(villages, { 'houses[*]': { color: 'blue' } });
```

### Conditional Deep Pruning

```ts
// Remove rotten items only from boxes labeled 'produce'
// (Other boxes remain untouched)
flatModify(warehouses, {
  'boxes[*]': {
    $or: [
      { label: { $not: 'produce' } },  // Keep non-produce boxes as-is
      { 'items.status': { $not: 'rotten' } }  // Produce must be fresh
    ]
  }
});
```

## Edge Cases

### Empty Arrays After Pruning

If all items are removed, the array becomes empty (not deleted):

```ts
const result = flatModify(
  [{ items: [{ bad: true }, { bad: true }] }],
  { 'items[*]': { bad: false } }
);
// → [{ items: [] }]
```

### Missing Arrays

If the target array doesn't exist, the item is left unchanged:

```ts
const result = flatModify(
  [{ name: 'A' }, { name: 'B', items: [1, 2] }],
  { 'items[*]': { value: true } }
);
// → First item unchanged (no 'items'), second filtered
```

### Invalid Path (No `[*]`)

Paths without `[*]` throw an error:

```ts
// ❌ This throws an error
flatModify(data, { 'houses.color': 'blue' });

// ✅ Correct
flatModify(data, { 'houses[*]': { color: 'blue' } });
```

## Performance Considerations

1. **Single pass per rule** - Each rule iterates once
2. **Deep cloning** - Modified objects are shallow-cloned to avoid mutation
3. **Nested rules** - `houses[*].boxes[*]` recurses, potentially slower on large data

## See Also

- [Deep Query & Filtering](./DEEP-QUERY.md) - Understanding `$elemMatch`, operators
- [Structural Rename Patterns](./RENAME.md) - Reorganize structure without pruning
