import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  loadDatabase,
  saveDatabase,
  getDatabaseSynced,
  getActiveDatabaseType,
  getDatabaseConnectionError
} from './database-adapter';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));

// API Endpoints
app.get('/api/db', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  const db = await getDatabaseSynced();
  res.json(db);
});

app.post('/api/db/products', async (req, res) => {
  const { products } = req.body;
  if (!Array.isArray(products)) {
    return res.status(400).json({ error: 'Invalid products array' });
  }
  const db = await getDatabaseSynced();
  db.products = products;
  await saveDatabase(db);
  res.json({ success: true, products: db.products });
});

app.post('/api/db/categories', async (req, res) => {
  const { categories } = req.body;
  if (!Array.isArray(categories)) {
    return res.status(400).json({ error: 'Invalid categories array' });
  }
  const db = await getDatabaseSynced();
  db.categories = categories;
  await saveDatabase(db);
  res.json({ success: true, categories: db.categories });
});

app.post('/api/db/settings', async (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Invalid settings object' });
  }
  const db = await getDatabaseSynced();
  db.settings = settings;
  await saveDatabase(db);
  res.json({ success: true, settings: db.settings });
});

app.post('/api/db/passcode', async (req, res) => {
  const { passcode } = req.body;
  if (typeof passcode !== 'string' || passcode.length !== 8) {
    return res.status(400).json({ error: 'Passcode must be an 8-digit string' });
  }
  const db = await getDatabaseSynced();
  db.passcode = passcode;
  await saveDatabase(db);
  res.json({ success: true, passcode: db.passcode });
});

app.post('/api/db/orders', async (req, res) => {
  const { orders } = req.body;
  if (!Array.isArray(orders)) {
    return res.status(400).json({ error: 'Invalid orders array' });
  }
  const db = await getDatabaseSynced();
  db.orders = orders;
  await saveDatabase(db);
  res.json({ success: true, orders: db.orders });
});

app.post('/api/db/orders/add', async (req, res) => {
  const { order } = req.body;
  if (!order || typeof order !== 'object') {
    return res.status(400).json({ error: 'Invalid order object' });
  }
  const db = await getDatabaseSynced();
  db.orders = [order, ...db.orders];
  await saveDatabase(db);
  res.json({ success: true, order });
});

// Sync Status API endpoints
app.get('/api/db/sync-status', async (req, res) => {
  const activeType = getActiveDatabaseType();
  const connError = getDatabaseConnectionError();
  res.json({
    enabled: activeType !== 'Local' && !connError,
    lastSynced: new Date().toISOString(),
    activeDatabase: activeType,
    mongoConfigured: !!process.env.MONGODB_URI,
    firebaseConfigured: !!process.env.FIREBASE_SERVICE_ACCOUNT,
    bucketId: activeType,
    cloudUrl: activeType === 'MongoDB' ? 'MongoDB Atlas Cluster' : activeType === 'Firestore' ? 'Google Cloud Firestore' : 'Armazenamento Local',
    connectionError: connError,
    message: connError
      ? `Falha na Conexão: ${connError}`
      : activeType === 'Local'
        ? 'Executando em modo de armazenamento local temporário. Para persistência definitiva, adicione a variável MONGODB_URI ou FIREBASE_SERVICE_ACCOUNT nos Secrets da barra lateral.'
        : `Conectado com sucesso ao seu próprio banco de dados (${activeType})!`
  });
});

app.post('/api/db/sync-status/toggle', (req, res) => {
  res.json({ success: true, enabled: getActiveDatabaseType() !== 'Local' });
});

app.post('/api/db/sync/force-pull', async (req, res) => {
  const db = await loadDatabase();
  res.json({ success: true, message: `Dados atualizados com sucesso de seu banco ${getActiveDatabaseType()}!`, db });
});

app.post('/api/db/sync/force-push', async (req, res) => {
  const db = await getDatabaseSynced();
  const success = await saveDatabase(db);
  if (success) {
    res.json({ success: true, message: `Dados enviados com sucesso para seu banco ${getActiveDatabaseType()}!` });
  } else {
    res.status(500).json({ error: 'Erro ao enviar dados.' });
  }
});

// Vite middleware configuration for serving the client-side files
async function startServer() {
  // Load data from Cloud Database on startup to ensure persistence
  console.log('Synchronizing database with cloud storage...');
  await loadDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
