
"use server";

import { generateBusinessPlan } from "@/lib/business-plan-engine";
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

  // Optional: save plan for logged-in users
  let savedId: string | null = null;
  const userId = await getUserIdFromServer();

  if (userId) {
    const db = admin.firestore();
    const plansCol = collection(db, "users", userId, "businessPlans");
    const planRef = doc(plansCol);
    await setDoc(planRef, {
      id: planRef.id,
      userId: userId,
      businessName,
      industry,
      country,
      createdAt: new Date().toISOString(),
      executiveSummary: planText.split('## ')[1]?.split('\n\n')[0] || 'Summary not available',
      // Storing other fields from the form if needed
      targetAudience: targetCustomer,
      problem,
      solution,
      revenueModel,
      fundingNeed,
      // Storing parts of the plan text for quick display
      marketAnalysis: planText.split('## Market Opportunity')[1]?.split('## ')[0] || '',
      marketingPlan: planText.split('## Marketing Strategy')[1]?.split('## ')[0] || '',
      operationsPlan: planText.split('## Operations & Team Plan')[1]?.split('## ')[0] || '',
      financialOverview: planText.split('## 3–5 Year Financial Projection')[1]?.split('## ')[0] || '',
      nextSteps: (planText.split('## Roadmap & Milestones')[1] || '').split('\n').filter(line => line.startsWith('- ')),
      planText,
    });
    savedId = planRef.id;
  }

  return {
    planText,
    savedId,
  };
}

    