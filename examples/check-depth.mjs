import { 
  flatten, 
  deflatten, 
  flatFilter, 
  flatModify, 
  flatChain, 
  rename 
} from '../dist/index.js';

console.log('--- Flatohh Deep ESM Compatibility Check ---');
console.log(`Node Version: ${process.version}`);
console.log(`Platform: ${process.platform} (${process.arch})`);

try {
  console.log('\nLibrary loaded via ESM import. Starting deep checks...\n');

  // 1. Test Deep Nesting (Flatten/Deflatten)
  process.stdout.write('[1/5] Deep Nesting (Flatten/Deflatten)... ');
  const deepObj = { 
    level1: { 
      level2: { 
        level3: { 
          array: [{ id: 1 }, { id: 2 }] 
        } 
      } 
    } 
  };
  const flat = flatten(deepObj);
  const back = deflatten(flat);
  
  if (
    flat['level1.level2.level3.array[0].id'] === 1 && 
    JSON.stringify(deepObj) === JSON.stringify(back)
  ) {
    console.log('✓ OK');
  } else {
    throw new Error('Deep flatten/deflatten mismatch');
  }

  // 2. Test Flat Filter (Deep Arrays)
  process.stdout.write('[2/5] Deep Filtering (flatFilter)... ');
  const users = [
    { id: 1, meta: { settings: { notifications: { email: true } } } },
    { id: 2, meta: { settings: { notifications: { email: false } } } }
  ];
  const emailUsers = flatFilter(users, { 
    'meta.settings.notifications.email': true 
  });
  
  if (emailUsers.length === 1 && emailUsers[0].id === 1) {
    console.log('✓ OK');
  } else {
    throw new Error(`Filter failed. Expected 1 user, got ${emailUsers.length}`);
  }

  // 3. Test Deep Modification (Pruning)
  process.stdout.write('[3/5] Deep Modification (flatModify)... ');
  const villages = [
    { name: 'A', houses: [{ id: 1, safe: true }, { id: 2, safe: false }] }
  ];
  const safeVillages = flatModify(villages, {
    'houses[*]': { safe: true }
  });
  
  if (
    safeVillages[0].houses.length === 1 && 
    safeVillages[0].houses[0].id === 1
  ) {
    console.log('✓ OK');
  } else {
    throw new Error('Modify failed to prune array correctly');
  }

  // 4. Test Chaining
  process.stdout.write('[4/5] Chaining (flatChain)... ');
  const items = [
    { type: 'A', status: 'active' },
    { type: 'A', status: 'pending' },
    { type: 'B', status: 'active' }
  ];
  const chainResult = flatChain(items)
    .filter({ type: 'A' })
    .filter({ status: 'active' })
    .value();

  if (chainResult.length === 1 && chainResult[0].type === 'A') {
    console.log('✓ OK');
  } else {
    throw new Error('Chain logic failed');
  }

  // 5. Test Rename (Hoisting)
  process.stdout.write('[5/5] Structural Rename... ');
  const config = { app: { port: 3000 } };
  const renamed = rename(config, { 'app.port': 'server.port' });
  
  if (renamed.server && renamed.server.port === 3000 && !renamed.app) {
    console.log('✓ OK');
  } else {
    throw new Error('Rename failed to move property');
  }

  console.log('\nStatus: PASSED');
  console.log(`The ESM build is fully operational on Node ${process.version}`);
  process.exit(0);

} catch (err) {
  console.error('\nStatus: FAILED');
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
}
