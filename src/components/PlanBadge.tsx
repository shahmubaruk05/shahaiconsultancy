"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { useFirebase } from "@/firebase/provider"; 

type PlanType = "free" | "pro" | "premium";

export function PlanBadge() {
  const { user, firestore: db } = useFirebase();
  const [plan, setPlan] = useState<PlanType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      setLoading(false);
      return;
    }

    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data() || {};
      const p = (data.plan as PlanType) || "free";
      setPlan(p);
      setLoading(false);
    });

    return () => unsub();
  }, [user, db]);

  if (!user) {
    return null;
  }

  if (loading || plan === null) {
    return (
      <span className="text-xs text-muted-foreground">
        Loading plan...
      </span>
    );
  }

  let colorClass = "text-muted-foreground";
  if (plan === "pro") colorClass = "text-primary";
  if (plan === "premium") colorClass = "text-accent";

  return (
    <div className="flex items-center gap-2 text-sm">
      <span>
        Plan:{" "}
        <span className={`font-semibold uppercase ${colorClass}`}>
          {plan}
        </span>
      </span>
      <Link href="/pricing" className="text-xs underline text-primary">
        Manage Plan
      </Link>
    </div>
  );
}
