
"use server";

import { generatePitchDeck } from "@/lib/pitch-deck-engine";
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
  return { output };
}


export async function savePitchDeckAction(data: any, deckMarkdown: string) {
    const userId = await getUserIdFromServer();
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const db = admin.firestore();
    const decksCol = collection(db, "users", userId, "pitchDecks");
    const deckRef = doc(decksCol);

    const previewText = markdownToPlainText(deckMarkdown).substring(0, 300);

    await setDoc(deckRef, {
        id: deckRef.id,
        userId,
        title: data.startupName,
        type: "pitch-deck",
        country: data.country,
        industry: data.industry,
        previewText,
        data: { ...data, deckMarkdown },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    return { savedId: deckRef.id };
}

