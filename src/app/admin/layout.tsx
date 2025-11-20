"use client";

import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        {children}
      </div>
    </div>
  );
}
