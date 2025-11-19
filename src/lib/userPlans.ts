'use server';

import { admin } from './firebase-admin';

/**
 * Finds a user by email and updates their plan in Firestore.
 * Also logs the payment event for auditing purposes.
 * If no user is found, the payment is logged for manual review.
 *
 * @param email The payer's email from PayPal.
 * @param plan The plan purchased ('pro' or 'premium').
 * @param paypalId The PayPal transaction or order ID.
 */
export async function applyPaidPlanForEmail(
  email: string,
  plan: 'pro' | 'premium',
  paypalId: string
) {
  const db = admin.firestore();
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();

  const now = new Date();

  // If no user exists with the PayPal email, log it for manual matching.
  if (snapshot.empty) {
    await db.collection('unmatched_paypal_payments').add({
      email: email.toLowerCase(),
      plan,
      paypalId,
      createdAt: now,
      status: 'unmatched',
    });
    return;
  }

  // User found, update their plan.
  const userDoc = snapshot.docs[0];
  await userDoc.ref.set(
    {
      plan,
      paypalPayerEmail: email.toLowerCase(),
      planUpdatedAt: now,
    },
    { merge: true }
  );

  // Log the successful payment for our records.
  await db.collection('payments').add({
    userId: userDoc.id,
    email: email.toLowerCase(),
    plan,
    source: 'paypal',
    paypalId,
    createdAt: now,
  });
}
