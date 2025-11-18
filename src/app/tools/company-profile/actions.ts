
"use server";

import { admin } from "@/lib/firebase-admin";
import { collection, doc, setDoc } from "firebase/firestore";
import { headers } from "next/headers";
import { markdownToPlainText } from "@/lib/utils";

async function getUserIdFromServer() {
  const headersList = headers();
  const authorization = headersList.get('Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }
  const idToken = authorization.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return null;
  }
}


export async function saveCompanyProfileAction(data: any, profileMarkdown: string) {
    const userId = await getUserIdFromServer();
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const db = admin.firestore();
    const profilesCol = collection(db, "users", userId, "companyProfiles");
    const profileRef = doc(profilesCol);

    const previewText = markdownToPlainText(profileMarkdown).substring(0, 300);

    await setDoc(profileRef, {
        id: profileRef.id,
        userId,
        title: data.companyName,
        type: "company-profile",
        country: data.country,
        industry: data.industry,
        depth: data.depth,
        previewText,
        data: { ...data, profileMarkdown },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    return { savedId: profileRef.id };
}

