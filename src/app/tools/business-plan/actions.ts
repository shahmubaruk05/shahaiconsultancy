
"use server";

import { generateBusinessPlan } from "@/lib/business-plan-engine";
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

export async function generateBusinessPlanAction(formData: FormData) {
  const businessName = formData.get("businessName")?.toString() || "";
  const industry = formData.get("industry")?.toString() || "";
  const country = formData.get("country")?.toString() || "";
  const city = formData.get("city")?.toString() || "";
  const businessType = formData.get("businessType")?.toString() || "";
  const targetCustomer = formData.get("targetCustomer")?.toString() || "";
  const problem = formData.get("problem")?.toString() || "";
  const solution = formData.get("solution")?.toString() || "";
  const revenueModel = formData.get("revenueModel")?.toString() || "";
  const fundingNeed = formData.get("fundingNeed")?.toString() || "";
  const founderBackground = formData.get("founderBackground")?.toString() || "";
  const planDepth = formData.get("planDepth")?.toString() || "investor";

  const planText = await generateBusinessPlan({
    businessName,
    industry,
    country,
    city,
    businessType,
    targetCustomer,
    problem,
    solution,
    revenueModel,
    fundingNeed,
    founderBackground,
    planDepth,
  });

  return { planText };
}

export async function saveBusinessPlanAction(data: any, planText: string) {
    const userId = await getUserIdFromServer();
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const db = admin.firestore();
    const plansCol = collection(db, "users", userId, "businessPlans");
    const planRef = doc(plansCol);
    
    const executiveSummary = planText.split('## ')[1]?.split('\n\n')[0] || 'Summary not available';
    const previewText = markdownToPlainText(executiveSummary).substring(0, 300);

    await setDoc(planRef, {
      id: planRef.id,
      userId,
      title: data.businessName,
      type: "business-plan",
      country: data.country,
      industry: data.industry,
      depth: data.planDepth,
      previewText,
      data: { ...data, planText },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return { savedId: planRef.id };
}
    
