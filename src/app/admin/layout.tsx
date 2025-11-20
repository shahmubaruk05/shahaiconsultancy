
'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      
      {/* LEFT SIDEBAR — only once */}
      <div className="w-64 border-r bg-white">
        <AdminSidebar />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-6">
        {children}
      </div>

    </div>
  );
}
