
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    // credentials are automatically sourced from the environment
  });
}

const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };
