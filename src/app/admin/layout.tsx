
'use client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // এখানে কোন sidebar রেন্ডার করবো না।
  // Root layout-এর sidebar-টাই ব্যবহার হবে।
  return <>{children}</>;
}
