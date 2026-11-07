import { saveDatabase, loadDatabase } from '../database-adapter';
import { initialProducts, initialCategories, defaultSettings } from '../src/data/mockProducts';

async function sync() {
  console.log('Syncing official products to database and Firestore...');
  const currentDb = await loadDatabase();
  
  const updatedDb = {
    ...currentDb,
    products: initialProducts,
    categories: initialCategories,
    settings: {
      ...defaultSettings,
      ...(currentDb.settings || {})
    }
  };

  const success = await saveDatabase(updatedDb);
  console.log('Sync completed with status:', success);
  console.log(`Saved ${initialProducts.length} products and ${initialCategories.length} categories.`);
  process.exit(0);
}

sync().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
