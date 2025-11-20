
'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { DashboardLayout } from './dashboard-layout';
import { PublicLayout } from './public-layout';
import { Loader2 } from 'lucide-react';
import AdminLayout from '@/app/admin/layout';

const authRoutes = ['/login', '/signup', '/forgot-password'];
const dashboardRoutes = [
    '/dashboard',
    '/academy',
    '/tools/ask-shah',
    '/tools/business-plan',
    '/tools/business-strategy',
    '/tools/company-formation',
    '/tools/company-profile',
    '/tools/pitch-deck',
    '/tools/startup-validator'
];

const adminRoutes = ['/admin'];


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // Redirect logic
  React.useEffect(() => {
    if (isUserLoading) return;

    const isDashboardRoute = dashboardRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/dashboard/billing') || isAdminRoute;

    if (!user && isDashboardRoute) {
      router.push('/login');
    }

    if (user && authRoutes.includes(pathname)) {
        router.push('/dashboard');
    }
  }, [user, isUserLoading, pathname, router, isAdminRoute]);

  // Loading state
  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Auth pages have no layout
  if (authRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  if (isAdminRoute) {
    // We assume the admin layout is self-contained and does not need the Firebase provider at this level.
    // If it does, this structure might need rethinking to wrap AdminLayout in a provider.
    return <AdminLayout>{children}</AdminLayout>;
  }

  const isDashboard = user && (dashboardRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/dashboard/billing'));

  if (isDashboard) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  return <PublicLayout>{children}</PublicLayout>;
}
