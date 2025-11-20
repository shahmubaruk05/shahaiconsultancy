'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
