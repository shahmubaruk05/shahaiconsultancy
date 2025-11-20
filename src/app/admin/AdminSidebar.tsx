"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

export default function AdminSidebar() {
  const pathname = usePathname();

  const sections = [
    { name: "Overview", href: "/admin" },
    { name: "Intakes", href: "/admin/intakes" },
    { name: "Invoices", href: "/admin/invoices" },
    { name: "Payments", href: "/admin/payments" },
    { name: "Users", href: "/admin/users" },
    { name: "Subscriptions", href: "/admin/subscriptions" },
    { name: "Blog", href: "/admin/blog" },
    { name: "Email Marketing", href: "/admin/email-marketing" },
    { name: "Affiliates", href: "/admin/affiliates" },
    { name: "AI Usage", href: "/admin/ai-usage" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white border-r p-4 sticky top-0">
      <div className="mb-6">
        <Logo />
      </div>
      <nav className="space-y-1">
        {sections.map((section) => (
          <Link
            key={section.name}
            href={section.href}
            className={cn(
              "block rounded px-3 py-2 text-sm text-slate-700 hover:bg-slate-100",
              pathname === section.href && "bg-slate-100 font-semibold"
            )}
          >
            {section.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}