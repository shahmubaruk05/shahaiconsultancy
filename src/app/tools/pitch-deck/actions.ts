"use server";

import { generatePitchDeck } from "@/lib/pitch-deck-engine";
import { admin } from "@/lib/firebase-admin";
import { collection, doc, setDoc } from "firebase/firestore";
import { headers } from "next/headers";


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

export async function generatePitchDeckAction(formData: FormData) {
  const data = {
    startupName: formData.get("startupName")?.toString() || "",
    oneLiner: formData.get("oneLiner")?.toString() || "",
    industry: formData.get("industry")?.toString() || "",
    country: formData.get("country")?.toString() || "",
    targetAudience: formData.get("targetAudience")?.toString() || "",
    problem: formData.get("problem")?.toString() || "",
    solution: formData.get("solution")?.toString() || "",
    traction: formData.get("traction")?.toString() || "",
    revenueModel: formData.get("revenueModel")?.toString() || "",
    competitors: formData.get("competitors")?.toString() || "",
    fundingNeed: formData.get("fundingNeed")?.toString() || "",
    team: formData.get("team")?.toString() || "",
  };

  const output = await generatePitchDeck(data);

  // Save for logged-in users
  let savedId = null;
  const userId = await getUserIdFromServer();

  if (userId) {
    const db = admin.firestore();
    const col = collection(db, "users", userId, "pitchDecks");
    const ref = doc(col);
    await setDoc(ref, {
      id: ref.id,
      createdAt: new Date().toISOString(),
      ...data,
      output,
    });
    savedId = ref.id;
  }

  return { output, savedId };
}
