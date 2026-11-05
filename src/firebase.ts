import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, getDocFromServer, setDoc } from 'firebase/firestore';
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

// Direct client-to-cloud Firestore save for instant multi-device sync
export async function savePartialStoreToFirestore(fields: Record<string, any>): Promise<boolean> {
  try {
    const docRef = doc(db, 'tabas_store', 'main_store');
    await setDoc(docRef, { ...fields, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save to Firestore directly:', err);
    return false;
  }
}
