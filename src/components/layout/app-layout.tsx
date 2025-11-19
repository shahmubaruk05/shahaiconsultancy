
'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { DashboardLayout } from './dashboard-layout';
import { PublicLayout } from './public-layout';
import { Loader2 } from 'lucide-react';

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

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  // Redirect logic
  React.useEffect(() => {
    if (isUserLoading) return;

    const isDashboardRoute = dashboardRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/dashboard/billing');

    if (!user && isDashboardRoute) {
      // Allow access to billing page for admins even if not in main dashboard routes
      const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (pathname.startsWith('/dashboard/billing') && isAdmin) {
          // allow
      } else {
        router.push('/login');
      }
    }

    if (user && authRoutes.includes(pathname)) {
        router.push('/dashboard');
    }
  }, [user, isUserLoading, pathname, router]);

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

  const isDashboard = user && (dashboardRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/dashboard/billing'));

  if (isDashboard) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  return <PublicLayout>{children}</PublicLayout>;
}
