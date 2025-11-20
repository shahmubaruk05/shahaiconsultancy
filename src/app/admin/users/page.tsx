"use client";

  import { useEffect, useMemo, useState } from "react";
  import { useRouter } from "next/navigation";
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import {
    getFirestore,
    collection,
    getDocs,
    doc,
    updateDoc,
  } from "firebase/firestore";
  import { app } from "@/firebase/client";

  const ADMIN_EMAILS = [
    "shahmubaruk05@gmail.com",
    "shahmubaruk.ai@gmail.com",
  ];

  type Plan = "free" | "pro" | "premium" | string;

  interface UserRow {
    id: string;
    name: string;
    email: string;
    plan: Plan;
    createdAt?: Date | null;
  }

  export default function AdminUsersPage() {
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<UserRow[]>([]);
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const auth = getAuth(app);
    const db = getFirestore(app);
    const router = useRouter();

    useEffect(() => {
      const unsub = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setCheckingAuth(false);
          router.push("/login");
          return;
        }

        const email = user.email ?? "";
        const admin = ADMIN_EMAILS.includes(email);
        setIsAdmin(admin);
        setCheckingAuth(false);

        if (!admin) {
          setError("Access denied. Admin only.");
          return;
        }

        try {
          setLoading(true);
          const snap = await getDocs(collection(db, "users"));
          const rows: UserRow[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data() as any;
            let createdAt: Date | null = null;
            if (data.createdAt && data.createdAt.toDate) {
              createdAt = data.createdAt.toDate();
            }
            rows.push({
              id: docSnap.id,
              name: data.name || data.fullName || "(no name)",
              email: data.email || "",
              plan: data.plan || "free",
              createdAt,
            });
          });
          setUsers(rows);
        } catch (err) {
          console.error("Failed to load users", err);
          setError("Failed to load users.");
        } finally {
          setLoading(false);
        }
      });

      return () => unsub();
    }, [auth, db, router]);

    const filtered = useMemo(() => {
      const q = search.toLowerCase();
      return users.filter((u) => {
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.plan || "").toString().toLowerCase().includes(q)
        );
      });
    }, [users, search]);

    const handleChangePlan = async (userId: string, newPlan: Plan) => {
      try {
        setUpdatingId(userId);
        await updateDoc(doc(db, "users", userId), {
          plan: newPlan,
          planUpdatedAt: new Date(),
        });
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u)),
        );
      } catch (err) {
        console.error("Failed to update plan", err);
        alert("Plan update করতে সমস্যা হয়েছে। কনসোলে error চেক করুন।");
      } finally {
        setUpdatingId(null);
      }
    };

    const handleCopyEmails = () => {
      const emails = filtered
        .map((u) => u.email)
        .filter(Boolean)
        .join(", ");
      if (!emails) return;
      navigator.clipboard.writeText(emails).then(() => {
        alert("Filtered users এর email list copy হয়ে গেছে.");
      });
    };

    const handleExportCsv = () => {
      const header = "id,name,email,plan\n";
      const rows = filtered
        .map((u) =>
          [u.id, u.name, u.email, u.plan]
            .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
            .join(","),
        )
        .join("\n");
      const csv = header + rows;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users.csv";
      a.click();
      URL.revokeObjectURL(url);
    };

    if (checkingAuth) {
      return <div className="p-4 text-sm text-slate-500">Checking admin access...</div>;
    }

    if (!isAdmin) {
      return (
        <div className="p-4 text-sm font-medium text-red-600">
          {error || "Access denied. Admin only."}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Users
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              All registered users of Shah Mubaruk – Your Startup Coach.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyEmails}
              className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Copy filtered emails
            </button>
            <button
              onClick={handleExportCsv}
              className="rounded bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by name, email or plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-1 text-sm"
          />
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Loading users...
          </div>
        ) : (
          <div className="overflow-x-auto rounded border border-slate-200">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">
                    Plan
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">
                    Change plan
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t last:border-b-0">
                    <td className="px-3 py-2">{u.name}</td>
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2 capitalize">{u.plan}</td>
                    <td className="px-3 py-2">
                      <select
                        defaultValue={u.plan}
                        onChange={(e) =>
                          handleChangePlan(u.id, e.target.value as Plan)
                        }
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="premium">Premium</option>
                      </select>
                      {updatingId === u.id && (
                        <span className="ml-2 text-[10px] text-slate-500">
                          updating...
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-6 text-center text-sm text-slate-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
