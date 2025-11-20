"use client";

import { useUser } from "@/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const ADMIN_EMAILS = [
  "shahmubaruk05@gmail.com",
  "shahmubaruk.ai@gmail.com",
];

export default function AdminHomePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  if (isUserLoading) {
    return <div className="text-sm text-slate-500 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Checking admin access...</div>;
  }

  if (!user) {
    router.push("/login");
    return <div className="text-sm text-slate-500">Redirecting to login...</div>;
  }

  const isAdmin = user.email && ADMIN_EMAILS.includes(user.email);

  if (!isAdmin) {
    return <div className="text-sm font-medium text-red-600">Access denied. Admin only.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">
        Welcome, Admin 👋
      </h2>
      <p className="text-sm text-slate-600">
        এখানে শুধু Shah Mubaruk internal কাজগুলোর জন্য টুল থাকবে। 
        সাবস্ক্রিপশন / পেমেন্ট related কাজের জন্য{" "}
        <a
          href="/admin/subscriptions"
          className="font-medium text-blue-600 underline"
        >
          Subscriptions
        </a>{" "}
        পেজে যান।
      </p>
    </div>
  );
}
