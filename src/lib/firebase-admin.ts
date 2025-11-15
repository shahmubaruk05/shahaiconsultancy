
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // This will initialize the Admin SDK using the GOOGLE_APPLICATION_CREDENTIALS
    // environment variable in a server environment.
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (e) {
    console.error(
      'Firebase Admin SDK initialization failed. ' +
      'Make sure you have set the GOOGLE_APPLICATION_CREDENTIALS environment variable in your development environment.',
      e
    );
  }
}

const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };
