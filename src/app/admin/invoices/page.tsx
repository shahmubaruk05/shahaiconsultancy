
'use client';

export default function AdminInvoicesPage() {
  return (
    <main className="min-h-[60vh] px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">
        Invoices
      </h1>
      <p className="text-sm text-slate-600">
        Admin invoices page (placeholder). এখানে পরে আস্তে আস্তে আসল invoice
        list আর details বসাতে পারবে।
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-slate-200 p-6 text-sm text-slate-500">
        <p>
          This is a simplified version of the admin invoices page so that the
          Vercel build can succeed. আপনার মূল public অংশগুলো (pricing, intake form,
          payment ইত্যাদি) ঠিকমতো deploy করার জন্য এতটুকুই যথেষ্ট।
        </p>
      </div>
    </main>
  );
}
