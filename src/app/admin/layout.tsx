import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Admin Panel
            </h1>
            <p className="text-xs text-slate-500">
              Internal tools for Shah Mubaruk only.
            </p>
          </div>
          {/* ইচ্ছা করলে এখানে ছোট লোগো / “Back to site” লিংক দিতে পারো */}
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        {/* Simple side nav – future তে আর admin টুল হলে এখানেই বাড়াবে */}
        <aside className="w-48 space-y-2 text-sm">
          <div className="mb-2 font-semibold text-slate-700">Sections</div>

          <a
            href="/admin"
            className="block rounded px-2 py-1 text-slate-700 hover:bg-slate-100"
          >
            Overview
          </a>

          <a
            href="/admin/users"
            className="block rounded px-2 py-1 text-slate-700 hover:bg-slate-100"
          >
            Users
          </a>

          <a
            href="/admin/subscriptions"
            className="block rounded px-2 py-1 text-slate-700 hover:bg-slate-100"
          >
            Subscriptions
          </a>

          <a
            href="/admin/payments"
            className="block rounded px-2 py-1 text-slate-700 hover:bg-slate-100"
          >
            Payments
          </a>

          <a
            href="/admin/email-marketing"
            className="block rounded px-2 py-1 text-slate-700 hover:bg-slate-100"
          >
            Email Marketing
          </a>

          <a
            href="/admin/affiliates"
            className="block rounded px-2 py-1 text-slate-700 hover:bg-slate-100"
          >
            Affiliates
          </a>

          <a
            href="/admin/ai-usage"
            className="block rounded px-2 py-1 text-slate-700 hover:bg-slate-100"
          >
            AI Usage
          </a>
        </aside>

        <section className="flex-1 rounded-lg border bg-white p-4 shadow-sm">
          {children}
        </section>
      </main>
    </div>
  );
}
