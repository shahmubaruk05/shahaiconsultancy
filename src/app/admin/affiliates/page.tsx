"use client";

  import { FormEvent, useEffect, useMemo, useState } from "react";
  import { useRouter } from "next/navigation";
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
  } from "firebase/firestore";
  import { app } from "@/firebase/client";

  const ADMIN_EMAILS = [
    "shahmubaruk05@gmail.com",
    "shahmubaruk.ai@gmail.com",
  ];

  interface AffiliateRow {
    id: string;
    name: string;
    email: string;
    code: string;
    commissionPercent: number;
    notes?: string;
    active: boolean;
    createdAt: Date | null;
  }

  export default function AdminAffiliatesPage() {
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [affiliates, setAffiliates] = useState<AffiliateRow[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [filter, setFilter] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
      name: "",
      email: "",
      code: "",
      commissionPercent: "20",
      notes: "",
    });

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
          const snap = await getDocs(collection(db, "affiliates"));
          const rows: AffiliateRow[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data() as any;
            let createdAt: Date | null = null;
            if (data.createdAt && data.createdAt.toDate) {
              createdAt = data.createdAt.toDate();
            }
            rows.push({
              id: docSnap.id,
              name: data.name || "",
              email: data.email || "",
              code: data.code || "",
              commissionPercent: data.commissionPercent || 20,
              notes: data.notes || "",
              active: data.active !== false,
              createdAt,
            });
          });
          rows.sort((a, b) => {
            const ta = a.createdAt?.getTime() ?? 0;
            const tb = b.createdAt?.getTime() ?? 0;
            return tb - ta;
          });
          setAffiliates(rows);
        } catch (err) {
          console.error("Failed to load affiliates", err);
          setError("Failed to load affiliates.");
        } finally {
          setLoading(false);
        }
      });

      return () => unsub();
    }, [auth, db, router]);

    const filtered = useMemo(() => {
      const q = filter.toLowerCase();
      return affiliates.filter((a) => {
        return (
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.code.toLowerCase().includes(q)
        );
      });
    }, [affiliates, filter]);

    const handleCreateAffiliate = async (e: FormEvent) => {
      e.preventDefault();
      if (!form.name || !form.email || !form.code) {
        alert("Name, email এবং affiliate code অবশ্যই লাগবে।");
        return;
      }

      try {
        setSubmitting(true);
        const commission = Number(form.commissionPercent || "20");
        const res = await addDoc(collection(db, "affiliates"), {
          name: form.name.trim(),
          email: form.email.trim(),
          code: form.code.trim(),
          commissionPercent: isNaN(commission) ? 20 : commission,
          notes: form.notes.trim() || null,
          active: true,
          createdAt: new Date(),
        });

        setAffiliates((prev) => [
          {
            id: res.id,
            name: form.name.trim(),
            email: form.email.trim(),
            code: form.code.trim(),
            commissionPercent: isNaN(commission) ? 20 : commission,
            notes: form.notes.trim() || "",
            active: true,
            createdAt: new Date(),
          },
          ...prev,
        ]);

        setForm({
          name: "",
          email: "",
          code: "",
          commissionPercent: "20",
          notes: "",
        });
      } catch (err) {
        console.error("Failed to create affiliate", err);
        alert("Affiliate create করতে সমস্যা হয়েছে।");
      } finally {
        setSubmitting(false);
      }
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
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Affiliate Program
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Create affiliate partners with unique codes, set commission rate and manage them.
          </p>
        </div>

        {/* New affiliate form */}
        <form
          onSubmit={handleCreateAffiliate}
          className="space-y-3 rounded border border-slate-200 bg-slate-50 p-3 text-xs"
        >
          <div className="font-semibold text-slate-700">
            Create new affiliate
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-[11px] text-slate-600">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] text-slate-600">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] text-slate-600">
                Affiliate code (e.g. SHAH10)
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                }
                className="w-full rounded border border-slate-300 px-2 py-1 text-xs uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] text-slate-600">
                Commission (% per sale)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.commissionPercent}
                onChange={(e) =>
                  setForm((f) => ({ ...f, commissionPercent: e.target.value }))
                }
                className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] text-slate-600">
              Notes (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              rows={2}
              className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create affiliate"}
          </button>

          <p className="text-[11px] text-slate-500">
            Later you can use this code in your pricing links or coupons for tracking.
          </p>
        </form>

        {/* List affiliates */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-semibold text-slate-700">
              Existing affiliates
            </div>
            <input
              type="text"
              placeholder="Search by name, email or code..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full max-w-xs rounded border border-slate-300 px-2 py-1 text-xs"
            />
          </div>

          {loading ? (
            <div className="py-6 text-center text-sm text-slate-500">
              Loading affiliates...
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
                      Code
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">
                      Commission
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">
                      Active
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-t last:border-b-0">
                      <td className="px-3 py-2">{a.name}</td>
                      <td className="px-3 py-2">{a.email}</td>
                      <td className="px-3 py-2 font-mono text-[11px]">
                        {a.code}
                      </td>
                      <td className="px-3 py-2">
                        {a.commissionPercent}% per sale
                      </td>
                      <td className="px-3 py-2">
                        {a.active ? (
                          <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-6 text-center text-sm text-slate-500"
                      >
                        No affiliates found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }
