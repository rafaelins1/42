import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, getDocFromServer, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

// Validate connection on boot as mandated by the Firebase skill
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection confirmed via getDocFromServer!');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network pending.');
    }
    return false;
  }
}

// Subscribe to real-time store updates
export function subscribeToStoreData(onUpdate: (data: any) => void, onError?: (err: any) => void) {
  const docRef = doc(db, 'tabas_store', 'main_store');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data());
      }
    },
    (error) => {
      console.warn('Real-time listener notice:', error);
      if (onError) onError(error);
    }
  );
}

function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = sanitizeForFirestore(val);
    }
  }
  return clean;
}

// Direct client-to-cloud Firestore save for instant multi-device sync
export async function savePartialStoreToFirestore(fields: Record<string, any>): Promise<boolean> {
  try {
    const docRef = doc(db, 'tabas_store', 'main_store');
    const sanitized = sanitizeForFirestore({ ...fields, updatedAt: new Date().toISOString() });
    await setDoc(docRef, sanitized, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save to Firestore directly:', err);
    return false;
  }
}

// Direct fetch from Firestore on startup
export async function getStoreDataFromFirestore(): Promise<any> {
  try {
    const docRef = doc(db, 'tabas_store', 'main_store');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn('Could not read from Firestore direct:', err);
  }
  return null;
}

