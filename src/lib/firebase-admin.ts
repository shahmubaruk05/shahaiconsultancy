
import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

if (!admin.apps.length) {
  try {
    // This will initialize the Admin SDK using the GOOGLE_APPLICATION_CREDENTIALS
    // environment variable in a server environment.
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (e: any) {
    console.error(
      'Firebase Admin SDK initialization failed. ' +
      'Make sure you have set the GOOGLE_APPLICATION_CREDENTIALS environment variable in your development environment. Error: ' + e.message
    );
  }
}

// Only get the db and auth instances if the app has been initialized
if (admin.apps.length > 0) {
    db = admin.firestore();
    auth = admin.auth();
} else {
    // Provide dummy objects or throw a more specific error if initialization fails
    // This prevents the app from crashing on module load.
    console.error("Firebase Admin SDK not initialized. Firestore and Auth services will not be available in server actions.");
    // Assigning temporary non-functional objects to satisfy TypeScript
    db = {} as admin.firestore.Firestore;
    auth = {} as admin.auth.Auth;
}

export { admin, db, auth };
