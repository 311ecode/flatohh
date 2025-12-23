// check.cjs
console.log(`Node: ${process.version}`);
try {
  const { flatten, deflatten } = require('./dist/index.cjs');
  const obj = { a: { b: 42 }, tags: [1,2] };
  const flat = flatten(obj);
  const back = deflatten(flat);
  console.log('CJS OK ✓', JSON.stringify(obj) === JSON.stringify(back));
} catch (e) { console.error('CJS fail:', e.message); }