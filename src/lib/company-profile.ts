'use client';

import { firestore } from 'firebase-admin';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
  Firestore,
} from 'firebase/firestore';

export type ProfileData = {
    companyName: string;
    industry: string;
    country: string;
    depth: string;
    profileMarkdown: string;
};

/**
 * Saves a company profile document to Firestore for a specific user.
 * @param db The Firestore instance.
 * @param userId The ID of the user.
 * @param data The profile data to save.
 */
export async function saveCompanyProfile(
  db: Firestore,
  userId: string,
  data: ProfileData
) {
  if (!userId) {
    throw new Error('User ID is required to save a company profile.');
  }
  const profileRef = collection(db, `users/${userId}/companyProfiles`);
  await addDoc(profileRef, {
    userId,
    ...data,
    createdAt: serverTimestamp(),
  });
}

/**
 * Retrieves the most recent company profiles for a specific user.
 * This is a one-time fetch, not a real-time listener.
 * @param db The Firestore instance.
 * @param userId The ID of the user.
 * @param count The number of profiles to retrieve.
 * @returns A promise that resolves to an array of profile documents.
 */
export async function getRecentCompanyProfiles(
  db: Firestore,
  userId: string,
  count = 5
) {
  if (!userId) {
    return [];
  }
  const profilesRef = collection(db, `users/${userId}/companyProfiles`);
  const q = query(profilesRef, orderBy('createdAt', 'desc'), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
