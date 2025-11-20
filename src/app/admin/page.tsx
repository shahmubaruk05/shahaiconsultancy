
"use client";

export default function AdminHomePage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900 mb-2">
        Admin Panel
        </h1>
        <p className="text-sm text-slate-500 mb-4">
        Internal tools for Shah Mubaruk only.
        </p>

        <div className="space-y-3 text-sm text-slate-700">
        <p>
            এখানে শুধুই Shah Mubaruk internal কাজগুলোর জন্য টুল রাখা হবে।
        </p>
        <p>
            সাবস্ক্রিপশন / payment related কাজের জন্য{" "}
            <span className="font-medium text-blue-600">Subscriptions</span>{" "}
            এবং{" "}
            <span className="font-medium text-blue-600">Payments</span> ট্যাব ব্যবহার করুন।
        </p>
        <p>
            client intake / custom order ট্র্যাক করার জন্য{" "}
            <span className="font-medium text-blue-600">Intakes</span> ট্যাব ব্যবহার করুন।
        </p>
        </div>
    </div>
  );
}
