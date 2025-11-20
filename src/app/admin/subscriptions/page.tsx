"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFirebase } from "@/firebase";

type Plan = "free" | "pro" | "premium";

interface UserRow {
  id: string;
  name: string;
  email: string;
  plan: Plan;
}

export default function AdminSubscriptionsPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const ADMIN_EMAILS = [
    "shahmubaruk05@gmail.com",
    "shahmubaruk.ai@gmail.com",
  ];

  useEffect(() => {
    if (isUserLoading) {
      return;
    }
    if (!user) {
      router.push("/login");
      return;
    }

    const isAdmin = user.email && ADMIN_EMAILS.includes(user.email);
    if (!isAdmin) {
      setError("Access denied. Admin only.");
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        if (!firestore) {
          setError("Firestore is not available.");
          setLoading(false);
          return;
        }
        const { getDocs, collection } = await import("firebase/firestore");
        const snap = await getDocs(collection(firestore, "users"));
        const rows: UserRow[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          rows.push({
            id: docSnap.id,
            name: data.name || data.fullName || "(no name)",
            email: data.email || "",
            plan: (data.plan as Plan) || "free",
          });
        });
        setUsers(rows);
      } catch (err) {
        console.error("Failed to load users", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();

  }, [isUserLoading, user, router, firestore]);

  const handleChangePlan = async (userId: string, newPlan: Plan) => {
    if (!firestore) return;
    try {
      const { doc, updateDoc } = await import("firebase/firestore");
      setUpdatingId(userId);
      await updateDoc(doc(firestore, "users", userId), {
        plan: newPlan,
        updatedAt: new Date(),
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u))
      );
    } catch (err) {
      console.error("Failed to update plan", err);
      alert("Plan update করতে সমস্যা হয়েছে। কনসোলে error চেক করুন।");
    } finally {
      setUpdatingId(null);
    }
  };

  if (isUserLoading) {
    return (
      <div className="p-4 text-sm text-slate-500">
        Checking admin access...
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="p-4 text-sm font-medium text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">
        Subscription Admin – Manual Plan Update
      </h2>
      <p className="text-xs text-slate-600">
        PayPal / bKash এ payment confirm করার পর এখানে এসে সংশ্লিষ্ট ইউজারের{" "}
        <span className="font-semibold">plan = Pro / Premium</span> করে দাও।
      </p>

      {loading ? (
        <div className="py-10 text-center text-slate-500">Loading users...</div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Current plan</th>
                <th className="px-4 py-2 text-left">Change plan</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-b-0">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2 capitalize">{u.plan}</td>
                  <td className="px-4 py-2">
                    <select
                      defaultValue={u.plan}
                      onChange={(e) =>
                        handleChangePlan(u.id, e.target.value as Plan)
                      }
                      className="rounded border px-2 py-1 text-sm"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="premium">Premium</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    {updatingId === u.id && (
                      <span className="text-xs text-slate-500">
                        Updating...
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 text-[11px] text-slate-500">
        টিপস: PayPal / bKash dashboard থেকে payment ইমেইল দেখে এখানে browser
        search (Ctrl+F) দিয়ে সেই ইউজারকে খুঁজে নিয়ে plan আপডেট করো।
      </div>
    </div>
  );
}
