
"use client";

  import { useEffect, useMemo, useState } from "react";
  import { useRouter } from "next/navigation";
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import { getFirestore, collection, getDocs } from "firebase/firestore";
  import { initializeFirebase } from "@/firebase";

  const { auth: fbAuth, firestore: db } = initializeFirebase();

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
  }

  export default function AdminEmailMarketingPage() {
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<UserRow[]>([]);
    const [planFilter, setPlanFilter] = useState<"all" | Plan>("all");
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
      const unsub = onAuthStateChanged(fbAuth, async (user) => {
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
            rows.push({
              id: docSnap.id,
              name: data.name || data.fullName || "(no name)",
              email: data.email || "",
              plan: data.plan || "free",
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
    }, [fbAuth, db, router]);

    const filtered = useMemo(() => {
      const q = search.toLowerCase();
      return users.filter((u) => {
        if (planFilter !== "all" && u.plan !== planFilter) return false;
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
        );
      });
    }, [users, planFilter, search]);

    const combinedEmails = filtered
      .map((u) => u.email)
      .filter(Boolean)
      .join(", ");

    const handleCopyEmails = () => {
      if (!combinedEmails) return;
      navigator.clipboard.writeText(combinedEmails).then(() => {
        alert("Selected users এর email list copy হয়ে গেছে.");
      });
    };

    const handleExportCsv = () => {
      const header = "name,email,plan\n";
      const rows = filtered
        .map((u) =>
          [u.name, u.email, u.plan]
            .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
            .join(","),
        )
        .join("\n");
      const csv = header + rows;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "email-marketing-users.csv";
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
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Email Marketing
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Filter users by plan, copy email list or export CSV for Mailchimp, SendGrid, etc.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600">Plan:</span>
            <select
              value={planFilter}
              onChange={(e) =>
                setPlanFilter(e.target.value as "all" | Plan)
              }
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="all">All</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs rounded border border-slate-300 px-3 py-1 text-sm"
          />

          <button
            onClick={handleCopyEmails}
            className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Copy email list
          </button>

          <button
            onClick={handleExportCsv}
            className="rounded bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
          >
            Export CSV
          </button>
        </div>

        <div className="rounded border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600">
          <div className="font-semibold mb-1">Tip</div>
          <p>
            এই email list টা Mailchimp / SendGrid / অন্যান্য email marketing tool–এ
            audience হিসেবে import করে automated campaign চালাতে পারবেন।
          </p>
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
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t last:border-b-0">
                    <td className="px-3 py-2">{u.name}</td>
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2 capitalize">{u.plan}</td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-6 text-center text-sm text-slate-500"
                    >
                      No users found for this filter.
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
