// check.mjs
console.log(`Node: ${process.version}`);
try {
  const { flatten, deflatten } = await import('./dist/index.js');
  const obj = { a: { b: 42 }, tags: [1,2] };
  const flat = flatten(obj);
  const back = deflatten(flat);
  console.log('ESM OK ✓', JSON.stringify(obj) === JSON.stringify(back));
} catch (e) { console.error('ESM fail:', e.message); }