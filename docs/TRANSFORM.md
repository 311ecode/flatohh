# Deep Transformation & Selection

This guide covers `flatTransform`, `flatPick`, and `flatOmit` for surgical data manipulation.

## flatTransform(data, mapping)

Modify values at specific deep paths (including within arrays) using mapper functions.

```ts
import { flatTransform } from 'flatohh';

const products = [
  { id: 1, info: { price: 100, name: 'Apple' } },
  { id: 2, info: { price: 200, name: 'Banana' } }
];

// Apply 10% tax to all prices
const taxed = flatTransform(products, {
  'info.price': (p) => p * 1.1
});

```

### Transforming within Arrays

Use the `[*]` wildcard to apply logic to every element in a nested array.

```ts
const orders = [{
  id: 'ORD-1',
  items: [{ sku: 'A1', qty: 2 }, { sku: 'B2', qty: 5 }]
}];

// Double the quantity of all items in all orders
flatTransform(orders, {
  'items[*].qty': (q) => q * 2
});

```

## flatPick & flatOmit

Surgical property selection using dot-notation and wildcards.

### flatPick(obj, paths)

```ts
const user = {
  id: 1,
  profile: { name: 'Alice', age: 30, internalId: 'SECRET' },
  tags: ['admin', 'verified']
};

// Only keep public info
flatPick(user, ['id', 'profile.name', 'tags']);
// → { id: 1, profile: { name: 'Alice' }, tags: ['admin', 'verified'] }

```

### flatOmit(obj, paths)

```ts
// Remove sensitive data
flatOmit(user, ['profile.internalId', 'id']);
// → { profile: { name: 'Alice', age: 30 }, tags: [...] }

```

### Wildcard Selection

You can use `[*]` in pick/omit to target specific fields inside array objects.

```ts
// Omit prices from an array of items
flatOmit(order, ['items[*].price']);

```

