import { MongoClient, Db } from 'mongodb';
import { Firestore } from '@google-cloud/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, Firestore as ClientFirestore } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { initialProducts, initialCategories, defaultSettings } from './src/data/mockProducts';
import defaultAppletConfig from './firebase-applet-config.json';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');
const FIREBASE_CONFIG_PATH = path.join(process.cwd(), 'firebase-applet-config.json');

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
// Firebase Firestore Client (via firebase-applet-config.json)
// ------------------
let appletFirestore: ClientFirestore | null = null;

function getAppletFirestore(): ClientFirestore | null {
  if (appletFirestore) return appletFirestore;
  try {
    let config: any = null;
    if (process.env.FIREBASE_CONFIG) {
      try {
        config = JSON.parse(process.env.FIREBASE_CONFIG);
      } catch (e) {}
    }
    if (!config && defaultAppletConfig && (defaultAppletConfig as any).projectId) {
      config = defaultAppletConfig;
    }
    if (!config && fs.existsSync(FIREBASE_CONFIG_PATH)) {
      const configRaw = fs.readFileSync(FIREBASE_CONFIG_PATH, 'utf-8');
      config = JSON.parse(configRaw);
    }
    if (config && config.projectId && config.apiKey) {
      const app = getApps().length === 0 ? initializeApp(config) : getApp();
      appletFirestore = getFirestore(app, config.firestoreDatabaseId || undefined);
      console.log(`Firebase Firestore initialized for project: ${config.projectId}`);
      return appletFirestore;
    }
  } catch (err) {
    console.error('Failed to initialize Firestore from firebase-applet-config.json:', err);
  }
  return null;
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
  
  let cleaned = uri.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  let protocol = '';
  if (cleaned.startsWith('mongodb+srv://')) {
    protocol = 'mongodb+srv://';
  } else if (cleaned.startsWith('mongodb://')) {
    protocol = 'mongodb://';
  } else {
    return cleaned;
  }

  const rest = cleaned.substring(protocol.length);
  let boundary = rest.length;
  const firstSlash = rest.indexOf('/');
  const firstQuestion = rest.indexOf('?');
  if (firstSlash !== -1 && firstSlash < boundary) boundary = firstSlash;
  if (firstQuestion !== -1 && firstQuestion < boundary) boundary = firstQuestion;
  
  const beforeBoundary = rest.substring(0, boundary);
  const afterBoundary = rest.substring(boundary);
  
  const lastAt = beforeBoundary.lastIndexOf('@');
  if (lastAt === -1) return cleaned;
  
  const credentials = beforeBoundary.substring(0, lastAt);
  const hostPart = beforeBoundary.substring(lastAt + 1) + afterBoundary;
  
  const firstColon = credentials.indexOf(':');
  if (firstColon === -1) return cleaned;
  
  const username = credentials.substring(0, firstColon);
  let password = credentials.substring(firstColon + 1).trim();
  
  if (password.startsWith('<') && password.endsWith('>')) {
    password = password.slice(1, -1).trim();
  }
  if (password.startsWith('&lt;') && password.endsWith('&gt;')) {
    password = password.slice(4, -4).trim();
  }
  
  let decodedPassword = password;
  try {
    decodedPassword = decodeURIComponent(password);
  } catch (e) {}
  
  const encodedPassword = encodeURIComponent(decodedPassword);
  return `${protocol}${username}:${encodedPassword}@${hostPart}`;
}

export function getDatabaseConnectionError(): string | null {
  const uri = process.env.MONGODB_URI;
  if (uri && (uri.includes('<db_password>') || uri.includes('<password>') || uri.includes('<db-password>') || uri.includes('<dbPassword>') || uri.includes('<senha>'))) {
    return "Você precisa substituir o marcador de posição '<db_password>' por sua senha real que você definiu no painel do MongoDB Atlas.";
  }
  return lastConnectionError;
}

async function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  if (mongoClient && connectedUri === uri) {
    return mongoClient;
  }

  if (mongoClient && connectedUri !== uri) {
    try {
      await mongoClient.close();
    } catch (e) {}
    mongoClient = null;
    mongoDb = null;
    lastConnectionError = null;
  }

  if (uri.includes('<db_password>') || uri.includes('<password>') || uri.includes('<db-password>') || uri.includes('<dbPassword>') || uri.includes('<senha>')) {
    lastConnectionError = "Você precisa substituir o marcador de posição '<db_password>' por sua senha real no MongoDB Atlas.";
    return null;
  }

  const cleanedUri = cleanMongoUri(uri);

  try {
    mongoClient = new MongoClient(cleanedUri, {
      connectTimeoutMS: 4000,
      socketTimeoutMS: 4000,
      serverSelectionTimeoutMS: 4000,
    });
    await mongoClient.connect();
    
    let dbName = 'tabas_db';
    if (cleanedUri.includes('mongodb.net/')) {
      const parts = cleanedUri.split('mongodb.net/');
      if (parts[1]) {
        dbName = parts[1].split('?')[0] || 'tabas_db';
      }
    }
    
    mongoDb = mongoClient.db(dbName);
    lastConnectionError = null;
    connectedUri = uri;
    return mongoClient;
  } catch (error: any) {
    console.error('Failed to connect to MongoDB Atlas:', error);
    lastConnectionError = `Erro no MongoDB Atlas: ${error?.message || error}`;
    mongoClient = null;
    mongoDb = null;
    connectedUri = null;
    return null;
  }
}

// ------------------
// Service Account Firestore Provider (Fallback if provided)
// ------------------
let serviceAccountFirestore: Firestore | null = null;

function getServiceAccountFirestore() {
  const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountStr) return null;
  if (serviceAccountFirestore) return serviceAccountFirestore;

  try {
    const serviceAccount = JSON.parse(serviceAccountStr);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    serviceAccountFirestore = new Firestore({
      projectId: serviceAccount.project_id,
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
      }
    });
    return serviceAccountFirestore;
  } catch (error) {
    console.error('Failed to initialize Service Account Firestore:', error);
    serviceAccountFirestore = null;
    return null;
  }
}

// ------------------
// Core DB Operations
// ------------------

/**
 * Loads the entire database from Firebase Firestore, MongoDB, or local db.json fallback
 */
export async function loadDatabase(): Promise<any> {
  // 1. Primary: Firebase Firestore provisioned via AI Studio
  const appletDb = getAppletFirestore();
  if (appletDb) {
    try {
      const docRef = doc(appletDb, 'tabas_store', 'main_store');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        memoryCache = { ...getDefaults(), ...cloudData };
        // Sync local file as offline mirror
        try {
          fs.writeFileSync(DB_PATH, JSON.stringify(memoryCache, null, 2), 'utf-8');
        } catch (e) {}
        return memoryCache;
      } else {
        console.log('No existing document in Firestore tabas_store/main_store. Seeding data...');
        let initialData = getDefaults();
        if (fs.existsSync(DB_PATH)) {
          try {
            const localData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
            initialData = { ...initialData, ...localData };
          } catch (e) {}
        }
        await setDoc(docRef, initialData);
        memoryCache = initialData;
        return memoryCache;
      }
    } catch (err) {
      console.error('Error loading database from Applet Firestore:', err);
    }
  }

  // 2. Secondary: Firestore via Service Account
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const db = getServiceAccountFirestore();
      if (db) {
        const docRef = db.collection('tabas_store').doc('main_store');
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          memoryCache = { ...getDefaults(), ...docSnap.data() };
          return memoryCache;
        } else {
          const defaults = getDefaults();
          await docRef.set(defaults);
          memoryCache = defaults;
          return memoryCache;
        }
      }
    } catch (err) {
      console.error('Error loading database from Service Account Firestore:', err);
    }
  }

  // 3. Tertiary: MongoDB Atlas
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
      console.error('Error loading database from MongoDB Atlas:', err);
    }
  }

  // 4. Fallback to local JSON file
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      memoryCache = { ...getDefaults(), ...JSON.parse(data) };
      return memoryCache;
    }
  } catch (err) {
    console.error('Error reading local db.json file:', err);
  }

  const defaults = getDefaults();
  const dir = path.dirname(DB_PATH);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(defaults, null, 2), 'utf-8');
  } catch (err) {}
  memoryCache = defaults;
  return memoryCache;
}

/**
 * Saves the entire database to Firestore, MongoDB, or local fallback
 */
export async function saveDatabase(db: any): Promise<boolean> {
  memoryCache = db;

  // 1. Primary: Save to Firebase Firestore
  const appletDb = getAppletFirestore();
  if (appletDb) {
    try {
      const docRef = doc(appletDb, 'tabas_store', 'main_store');
      await setDoc(docRef, db);
      // Keep local file in sync
      try {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
      } catch (e) {}
      return true;
    } catch (err) {
      console.error('Failed to save to Applet Firestore:', err);
    }
  }

  // 2. Secondary: Firestore Service Account
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const client = getServiceAccountFirestore();
      if (client) {
        const docRef = client.collection('tabas_store').doc('main_store');
        await docRef.set(db, { merge: true });
        return true;
      }
    } catch (err) {
      console.error('Failed to save to Service Account Firestore:', err);
    }
  }

  // 3. Tertiary: Save to MongoDB Atlas
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

  // 4. Local file fallback
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
  if (process.env.FIREBASE_CONFIG || (defaultAppletConfig && (defaultAppletConfig as any).projectId) || fs.existsSync(FIREBASE_CONFIG_PATH) || process.env.FIREBASE_SERVICE_ACCOUNT || process.env.MONGODB_URI) {
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
export function getActiveDatabaseType(): 'Firestore' | 'MongoDB' | 'Local' {
  if (process.env.FIREBASE_CONFIG || (defaultAppletConfig && (defaultAppletConfig as any).projectId) || fs.existsSync(FIREBASE_CONFIG_PATH) || process.env.FIREBASE_SERVICE_ACCOUNT) return 'Firestore';
  if (process.env.MONGODB_URI) return 'MongoDB';
  return 'Local';
}
