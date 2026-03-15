import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export { signInAnonymously, GoogleAuthProvider, signInWithPopup };

// Test connection as per critical directive
import { doc, getDocFromCache, getDocFromServer } from 'firebase/firestore';
async function testConnection() {
  try {
    // Tenta buscar um documento inexistente apenas para testar a rota com o servidor
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firestore connection test: Success (Server reachable)");
  } catch (error: any) {
    if (error.message && error.message.includes('the client is offline')) {
      console.error("Firestore connection test: Failed (Client is offline). Check Firebase Console provisioning.");
    } else {
      console.warn("Firestore connection test: Note:", error.message);
    }
  }
}
testConnection();

// Helper for Firestore errors as per critical directive
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
