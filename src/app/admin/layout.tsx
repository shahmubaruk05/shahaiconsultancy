"use client";

import type { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
