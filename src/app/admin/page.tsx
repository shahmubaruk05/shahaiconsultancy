"use client";

export default function AdminHomePage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900 mb-2">
        Admin Panel
      </h1>
      <p className="text-sm text-slate-500 mb-3">
        Internal tools for Shah Mubaruk only.
      </p>

      <div className="space-y-2 text-sm text-slate-700">
        <p>
          এখানে থেকে সাবস্ক্রিপশন, পেমেন্ট, intake form, blog ইত্যাদি manage করবেন।
        </p>
        <p>
          শুরু করতে চাইলে বাম পাশের মেনু থেকে{" "}
          <span className="font-medium text-blue-600">Subscriptions</span>,{" "}
          <span className="font-medium text-blue-600">Intakes</span> বা{" "}
          <span className="font-medium text-blue-600">Payments</span> এ যান।
        </p>
      </div>
    </div>
  );
}
