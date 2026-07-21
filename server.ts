import express from 'express';
import path from 'path';
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
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    const db = await getDatabaseSynced();
    res.json(db);
  } catch (err: any) {
    console.error('Error in GET /api/db:', err);
    res.status(500).json({ error: err?.message || 'Erro ao carregar banco de dados' });
  }
});

app.post('/api/db/products', async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: 'Invalid products array' });
    }
    const db = await getDatabaseSynced();
    db.products = products;
    await saveDatabase(db);
    res.json({ success: true, products: db.products });
  } catch (err: any) {
    console.error('Error in POST /api/db/products:', err);
    res.status(500).json({ error: err?.message || 'Erro ao salvar produtos' });
  }
});

app.post('/api/db/categories', async (req, res) => {
  try {
    const { categories } = req.body;
    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: 'Invalid categories array' });
    }
    const db = await getDatabaseSynced();
    db.categories = categories;
    await saveDatabase(db);
    res.json({ success: true, categories: db.categories });
  } catch (err: any) {
    console.error('Error in POST /api/db/categories:', err);
    res.status(500).json({ error: err?.message || 'Erro ao salvar categorias' });
  }
});

app.post('/api/db/settings', async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings object' });
    }
    const db = await getDatabaseSynced();
    db.settings = settings;
    await saveDatabase(db);
    res.json({ success: true, settings: db.settings });
  } catch (err: any) {
    console.error('Error in POST /api/db/settings:', err);
    res.status(500).json({ error: err?.message || 'Erro ao salvar configurações' });
  }
});

app.post('/api/db/passcode', async (req, res) => {
  try {
    const { passcode } = req.body;
    if (typeof passcode !== 'string' || passcode.length !== 8) {
      return res.status(400).json({ error: 'Passcode must be an 8-digit string' });
    }
    const db = await getDatabaseSynced();
    db.passcode = passcode;
    await saveDatabase(db);
    res.json({ success: true, passcode: db.passcode });
  } catch (err: any) {
    console.error('Error in POST /api/db/passcode:', err);
    res.status(500).json({ error: err?.message || 'Erro ao salvar senha' });
  }
});

app.post('/api/db/orders', async (req, res) => {
  try {
    const { orders } = req.body;
    if (!Array.isArray(orders)) {
      return res.status(400).json({ error: 'Invalid orders array' });
    }
    const db = await getDatabaseSynced();
    db.orders = orders;
    await saveDatabase(db);
    res.json({ success: true, orders: db.orders });
  } catch (err: any) {
    console.error('Error in POST /api/db/orders:', err);
    res.status(500).json({ error: err?.message || 'Erro ao salvar pedidos' });
  }
});

app.post('/api/db/orders/add', async (req, res) => {
  try {
    const { order } = req.body;
    if (!order || typeof order !== 'object') {
      return res.status(400).json({ error: 'Invalid order object' });
    }
    const db = await getDatabaseSynced();
    db.orders = [order, ...db.orders];
    await saveDatabase(db);
    res.json({ success: true, order });
  } catch (err: any) {
    console.error('Error in POST /api/db/orders/add:', err);
    res.status(500).json({ error: err?.message || 'Erro ao adicionar pedido' });
  }
});

// Sync Status API endpoints
app.get('/api/db/sync-status', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
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
  } catch (err: any) {
    console.error('Error in GET /api/db/sync-status:', err);
    res.status(500).json({ error: err?.message || 'Erro ao checar status de sincronização' });
  }
});

app.post('/api/db/sync-status/toggle', (req, res) => {
  res.json({ success: true, enabled: getActiveDatabaseType() !== 'Local' });
});

app.post('/api/db/sync/force-pull', async (req, res) => {
  try {
    const db = await loadDatabase();
    res.json({ success: true, message: `Dados atualizados com sucesso de seu banco ${getActiveDatabaseType()}!`, db });
  } catch (err: any) {
    console.error('Error in POST /api/db/sync/force-pull:', err);
    res.status(500).json({ error: err?.message || 'Erro ao buscar dados do banco' });
  }
});

app.post('/api/db/sync/force-push', async (req, res) => {
  try {
    const db = await getDatabaseSynced();
    const success = await saveDatabase(db);
    if (success) {
      res.json({ success: true, message: `Dados enviados com sucesso para seu banco ${getActiveDatabaseType()}!` });
    } else {
      res.status(500).json({ error: 'Erro ao enviar dados.' });
    }
  } catch (err: any) {
    console.error('Error in POST /api/db/sync/force-push:', err);
    res.status(500).json({ error: err?.message || 'Erro ao enviar dados para o banco' });
  }
});

// Vite middleware configuration for serving the client-side files
async function startServer() {
  // Load data from Cloud Database on startup to ensure persistence
  console.log('Synchronizing database with cloud storage...');
  await loadDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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

// Only start persistent Express server if NOT running on Vercel as a Serverless Function
if (!process.env.VERCEL) {
  startServer();
}

export default app;
