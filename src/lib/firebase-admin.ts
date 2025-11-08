
import * as admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

if (!admin.apps.length) {
  try {
    // Try to initialize with service account credentials from environment variables
    // (for production environments like Google Cloud Run)
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (e) {
    console.warn(
      'Admin SDK initialization with applicationDefault failed. This is expected in local development. Falling back to client-side config for auth emulation, but some admin features might not work.'
    );
    // Fallback for local development where service account keys might not be set.
    // This allows server actions to work, but with client-level permissions.
    // For full admin access locally, set up GOOGLE_APPLICATION_CREDENTIALS.
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
      // Note: Using client-side config for Admin SDK is not standard,
      // but it's a workaround for this specific dev environment error.
    });
  }
}

const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };
