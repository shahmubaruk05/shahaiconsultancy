"use client";

import { FormEvent, useState, useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useFirebase } from "@/firebase/provider";

type FormState = {
  name: string;
  email: string;
  phone: string;
  service: string;
  country: string;
  authorizedCapital: string;
  companyStage: string;
  notes: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  service: "",
  country: "Bangladesh",
  authorizedCapital: "",
  companyStage: "Idea / pre-launch",
  notes: "",
};

const serviceOptions = [
  "BD Company Formation (RJSC)",
  "USA LLC / Corporation",
  "Trademark / IP Support",
  "Tax, BIN, License & Compliance",
  "Custom Startup Consulting",
];

const stageOptions = [
  "Idea / pre-launch",
  "Early stage (0–1 year)",
  "Growing startup (1–3 years)",
  "Established business",
];

export default function IntakePage() {
  const { firestore, user } = useFirebase();
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
        setForm(prev => ({
            ...prev,
            name: user.displayName || prev.name,
            email: user.email || prev.email
        }));
    }
  }, [user]);

  const handleChange = (
    field: keyof FormState,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!firestore) return;

    // basic validation
    if (!form.name || !form.email || !form.service) {
      setError("নাম, ইমেইল এবং সার্ভিস নির্বাচন করা বাধ্যতামূলক।");
      return;
    }

    setStatus("submitting");
    setError(null);

    try {
      await addDoc(collection(firestore, "intakes"), {
        ...form,
        serviceSlug: form.service.toLowerCase().replace(/\s+/g, "-"),
        uid: user?.uid ?? null,
        status: "new", // new | in-progress | completed | closed
        source: "public-intake",
        createdAt: serverTimestamp(),
      });

      setStatus("success");
      setForm(initialForm);
    } catch (err) {
      console.error("Failed to submit intake form", err);
      setError("কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন বা সরাসরি যোগাযোগ করুন।");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">
          Startup / Company Formation Intake Form
        </h1>
        <p className="text-sm md:text-base text-slate-600 mb-6">
          নিচের formটি পূরণ করুন। আপনার দেওয়া তথ্য অনুযায়ী আমরা কাস্টম
          প্রস্তাবনা ও কোটেশন তৈরি করব। যত তাড়াতাড়ি সম্ভব ইমেইল বা WhatsApp–এ
          যোগাযোগ করা হবে।
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6 space-y-4"
        >
          {/* Name + Email */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                পূর্ণ নাম *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Rakib Hasan"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ইমেইল *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Phone + Country */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                WhatsApp / মোবাইল নম্বর
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+88017xxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Country
              </label>
              <select
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Bangladesh</option>
                <option>USA</option>
                <option>UK / Europe</option>
                <option>Middle East</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              আপনি কোন সার্ভিস চান? *
            </label>
            <select
              value={form.service}
              onChange={(e) => handleChange("service", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">-- সার্ভিস নির্বাচন করুন --</option>
              {serviceOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Authorized capital + Stage */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Authorized Capital (optional)
              </label>
              <input
                type="text"
                value={form.authorizedCapital}
                onChange={(e) =>
                  handleChange("authorizedCapital", e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 10 Lakh / 1 Crore"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Company / Startup Stage
              </label>
              <select
                value={form.companyStage}
                onChange={(e) => handleChange("companyStage", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {stageOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              আপনার প্রয়োজন / প্রশ্ন বিস্তারিত লিখুন
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="যেমন: BD + USA দু'জায়গায় কোম্পানি লাগবে, directors কয়জন, টাইমলাইন কত দিনের মধ্যে চান ইত্যাদি..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {status === "success" && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              ধন্যবাদ! আপনার তথ্য আমরা পেয়েছি। ২৪–৪৮ ঘন্টার মধ্যে ইমেইল বা
              WhatsApp–এর মাধ্যমে আপনার সাথে যোগাযোগ করা হবে।
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-500">
              এই ফর্মটি শেয়ারযোগ্য —{" "}
              <span className="font-medium">
                shahmubaruk.com/intake
              </span>{" "}
              লিংকটি আপনি ক্লায়েন্টদের পাঠাতে পারবেন।
            </p>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 px-5 py-2 text-sm font-medium text-white disabled:opacity-70"
            >
              {status === "submitting" ? "Sending..." : "Submit details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
