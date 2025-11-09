'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '@/firebase';

import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { QuickLinks } from "@/components/dashboard/quick-links";
import { LatestItems } from "@/components/dashboard/latest-items";

type PlanType = "free" | "pro" | "premium";

export default function DashboardPage() {
  const { user, firestore } = useFirebase();
  const [plan, setPlan] = useState<PlanType | null>(null);

  useEffect(() => {
    if (!user || !firestore) return;
    const ref = doc(firestore, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data() || {};
      const p = (data.plan as PlanType) || "free";
      setPlan(p);
    });
    return () => unsub();
  }, [user, firestore]);

  return (
    <div className="flex flex-col gap-8">
      <WelcomeHeader />
      <QuickLinks />
      <LatestItems />
    </div>
  );
}
