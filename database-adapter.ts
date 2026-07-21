import { MongoClient, Db } from 'mongodb';
import { Firestore } from '@google-cloud/firestore';
import fs from 'fs';
import path from 'path';
import { initialProducts, initialCategories, defaultSettings } from './src/data/mockProducts';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

// Memory cache to avoid reading database constantly
let memoryCache: any = null;

// Fallback defaults
function getDefaults() {
  return {
    products: initialProducts,
    categories: initialCategories,
    settings: defaultSettings,
    passcode: '20132013',
    orders: []
  };
}

// ------------------
// MongoDB Provider (Lazy Initialized)
// ------------------
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let lastConnectionError: string | null = null;
let connectedUri: string | null = null;

export function cleanMongoUri(uri: string): string {
  if (!uri) return uri;
  
  // Trim any whitespace
  let cleaned = uri.trim();
  
  // Also strip any literal quotes that might have been pasted
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // Find protocol
  let protocol = '';
  if (cleaned.startsWith('mongodb+srv://')) {
    protocol = 'mongodb+srv://';
  } else if (cleaned.startsWith('mongodb://')) {
    protocol = 'mongodb://';
  } else {
    return cleaned;
  }

  const rest = cleaned.substring(protocol.length);
  
  // Separate credentials from host
  let boundary = rest.length;
  const firstSlash = rest.indexOf('/');
  const firstQuestion = rest.indexOf('?');
  if (firstSlash !== -1 && firstSlash < boundary) boundary = firstSlash;
  if (firstQuestion !== -1 && firstQuestion < boundary) boundary = firstQuestion;
  
  const beforeBoundary = rest.substring(0, boundary);
  const afterBoundary = rest.substring(boundary);
  
  const lastAt = beforeBoundary.lastIndexOf('@');
  if (lastAt === -1) {
    return cleaned;
  }
  
  const credentials = beforeBoundary.substring(0, lastAt);
  const hostPart = beforeBoundary.substring(lastAt + 1) + afterBoundary;
  
  const firstColon = credentials.indexOf(':');
  if (firstColon === -1) {
    return cleaned;
  }
  
  const username = credentials.substring(0, firstColon);
  let password = credentials.substring(firstColon + 1).trim();
  
  // 1. Strip outer "<" and ">" if present
  if (password.startsWith('<') && password.endsWith('>')) {
    password = password.slice(1, -1).trim();
  }
  
  // 2. Also strip escaped HTML-like brackets if pasted
  if (password.startsWith('&lt;') && password.endsWith('&gt;')) {
    password = password.slice(4, -4).trim();
  }
  
  // 3. Percent-encode the password to escape special characters like '@', ':', '/', etc.
  let decodedPassword = password;
  try {
    decodedPassword = decodeURIComponent(password);
  } catch (e) {
    // ignore
  }
  
  const encodedPassword = encodeURIComponent(decodedPassword);
  return `${protocol}${username}:${encodedPassword}@${hostPart}`;
}

export function getDatabaseConnectionError(): string | null {
  const uri = process.env.MONGODB_URI;
  if (uri && (uri.includes('<db_password>') || uri.includes('<password>') || uri.includes('<db-password>') || uri.includes('<dbPassword>') || uri.includes('<senha>'))) {
    return "Você precisa substituir o marcador de posição '<db_password>' por sua senha real que você definiu no painel do MongoDB Atlas (lembre-se de remover também os sinais de menor/maior '<' e '>').";
  }
  return lastConnectionError;
}

async function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  if (mongoClient && connectedUri === uri) {
    return mongoClient;
  }

  // If the URI changed, close previous client and clear cache
  if (mongoClient && connectedUri !== uri) {
    console.log('MONGODB_URI changed. Re-initializing MongoDB Atlas client...');
    try {
      await mongoClient.close();
    } catch (e) {
      // ignore
    }
    mongoClient = null;
    mongoDb = null;
    lastConnectionError = null;
  }

  // Validate placeholder before attempting connection
  if (uri.includes('<db_password>') || uri.includes('<password>') || uri.includes('<db-password>') || uri.includes('<dbPassword>') || uri.includes('<senha>')) {
    lastConnectionError = "Você precisa substituir o marcador de posição '<db_password>' por sua senha real que você definiu no painel do MongoDB Atlas (lembre-se de remover também os sinais de menor/maior '<' e '>').";
    console.error(lastConnectionError);
    return null;
  }

  const cleanedUri = cleanMongoUri(uri);

  try {
    console.log('Connecting to user-managed MongoDB Atlas with cleaned URI...');
    mongoClient = new MongoClient(cleanedUri, {
      connectTimeoutMS: 4000,
      socketTimeoutMS: 4000,
      serverSelectionTimeoutMS: 4000,
    });
    await mongoClient.connect();
    
    // Parse Database Name from URI, default to 'tabas_db'
    let dbName = 'tabas_db';
    if (cleanedUri.includes('mongodb.net/')) {
      const parts = cleanedUri.split('mongodb.net/');
      if (parts[1]) {
        dbName = parts[1].split('?')[0] || 'tabas_db';
      }
    }
    
    mongoDb = mongoClient.db(dbName);
    console.log(`Connected to MongoDB Atlas successfully! Database: ${dbName}`);
    lastConnectionError = null; // Clear any previous error
    connectedUri = uri; // Save successfully connected URI
    return mongoClient;
  } catch (error: any) {
    console.error('Failed to connect to MongoDB Atlas:', error);
    let rawMsg = error?.message || String(error);
    if (rawMsg.includes('bad auth') || rawMsg.includes('Authentication failed') || rawMsg.includes('auth failed')) {
      lastConnectionError = 'Falha de Autenticação: O usuário ou a senha informados na MONGODB_URI estão incorretos. Verifique se atualizou a senha do usuário no MongoDB Atlas e colou o link correto nos Secrets.';
    } else if (rawMsg.includes('querySrv') || rawMsg.includes('ENOTFOUND') || rawMsg.includes('EBADNAME')) {
      lastConnectionError = 'Endereço do Cluster Inexistente: O link do MongoDB possui um nome de servidor/cluster incorreto. Verifique a MONGODB_URI obtida no botão "Connect" do MongoDB Atlas.';
    } else if (rawMsg.includes('selection timed out') || rawMsg.includes('ETIMEDOUT') || rawMsg.includes('connect ETIMEDOUT')) {
      lastConnectionError = 'Bloqueio de IP / Tempo Esgotado: O MongoDB Atlas não permitiu a conexão. Certifique-se de ir em "Network Access" no Atlas, adicionar "0.0.0.0/0" e clicar no botão verde "Confirm". (Pode levar até 2 minutos para aplicar).';
    } else {
      lastConnectionError = `Erro no MongoDB Atlas: ${rawMsg}`;
    }
    mongoClient = null;
    mongoDb = null;
    connectedUri = null;
    return null;
  }
}

// ------------------
// Firestore Provider (Lazy Initialized)
// ------------------
let firestoreDb: Firestore | null = null;

function getFirestoreClient() {
  const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountStr) return null;
  if (firestoreDb) return firestoreDb;

  try {
    console.log('Initializing user-managed Firebase Firestore...');
    const serviceAccount = JSON.parse(serviceAccountStr);
    
    // Ensure the private key has correct newline characters
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    firestoreDb = new Firestore({
      projectId: serviceAccount.project_id,
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
      }
    });
    console.log('Firebase Firestore client initialized successfully!');
    return firestoreDb;
  } catch (error) {
    console.error('Failed to initialize Firebase Firestore client:', error);
    firestoreDb = null;
    return null;
  }
}

// ------------------
// Core DB Operations
// ------------------

/**
 * Loads the entire database from MongoDB, Firestore, or local db.json fallback
 */
export async function loadDatabase(): Promise<any> {
  // 1. Try MongoDB Atlas if MONGODB_URI is provided
  if (process.env.MONGODB_URI) {
    try {
      const client = await getMongoClient();
      if (client && mongoDb) {
        const collection = mongoDb.collection('store_data');
        const doc = await collection.findOne({ _id: 'main_store' as any });
        if (doc) {
          const { _id, ...rest } = doc;
          memoryCache = { ...getDefaults(), ...rest };
          return memoryCache;
        } else {
          console.log('No existing document in MongoDB. Creating with defaults...');
          const defaults = getDefaults();
          await collection.updateOne(
            { _id: 'main_store' as any },
            { $set: defaults },
            { upsert: true }
          );
          memoryCache = defaults;
          return memoryCache;
        }
      }
    } catch (err) {
      console.error('Error loading database from MongoDB Atlas, falling back to local file:', err);
    }
  }

  // 2. Try Firestore if FIREBASE_SERVICE_ACCOUNT is provided
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const db = getFirestoreClient();
      if (db) {
        const docRef = db.collection('tabas_config').doc('main_store');
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          memoryCache = { ...getDefaults(), ...docSnap.data() };
          return memoryCache;
        } else {
          console.log('No existing document in Firestore. Creating with defaults...');
          const defaults = getDefaults();
          await docRef.set(defaults);
          memoryCache = defaults;
          return memoryCache;
        }
      }
    } catch (err) {
      console.error('Error loading database from Firestore, falling back to local file:', err);
    }
  }

  // 3. Fallback to local JSON file
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      memoryCache = { ...getDefaults(), ...JSON.parse(data) };
      return memoryCache;
    }
  } catch (err) {
    console.error('Error reading local db.json file:', err);
  }

  // Create default db.json if not exists
  console.log('No local db.json found. Creating default local database...');
  const defaults = getDefaults();
  const dir = path.dirname(DB_PATH);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(defaults, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write default db.json on read-only filesystem:', err);
  }
  memoryCache = defaults;
  return memoryCache;
}

/**
 * Saves the entire database to MongoDB, Firestore, or local db.json fallback
 */
export async function saveDatabase(db: any): Promise<boolean> {
  memoryCache = db;

  // 1. Save to MongoDB Atlas
  if (process.env.MONGODB_URI) {
    try {
      const client = await getMongoClient();
      if (client && mongoDb) {
        const collection = mongoDb.collection('store_data');
        await collection.updateOne(
          { _id: 'main_store' as any },
          { $set: db },
          { upsert: true }
        );
        return true;
      }
    } catch (err) {
      console.error('Failed to save to MongoDB Atlas:', err);
    }
  }

  // 2. Save to Firestore
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const client = getFirestoreClient();
      if (client) {
        const docRef = client.collection('tabas_config').doc('main_store');
        await docRef.set(db, { merge: true });
        return true;
      }
    } catch (err) {
      console.error('Failed to save to Firestore:', err);
    }
  }

  // 3. Save to local file
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to write to local db.json:', err);
    return false;
  }
}

/**
 * Helper to get the current loaded or cached database
 */
export async function getDatabaseSynced(): Promise<any> {
  // Always load fresh data from cloud database in serverless/multi-device environments
  if (process.env.MONGODB_URI || process.env.FIREBASE_SERVICE_ACCOUNT) {
    return loadDatabase();
  }
  if (memoryCache) {
    return memoryCache;
  }
  return loadDatabase();
}

/**
 * Returns which database type is currently active
 */
export function getActiveDatabaseType(): 'MongoDB' | 'Firestore' | 'Local' {
  if (process.env.MONGODB_URI) return 'MongoDB';
  if (process.env.FIREBASE_SERVICE_ACCOUNT) return 'Firestore';
  return 'Local';
}
