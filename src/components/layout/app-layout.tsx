'use client';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/layout/user-nav';
import {
  LayoutDashboard,
  FlaskConical,
  Target,
  FileText,
  Library,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { getUser } from '@/lib/auth';
import React from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tools/startup-validator', label: 'Startup Validator', icon: FlaskConical },
  { href: '/tools/business-strategy', label: 'Business Strategy', icon: Target },
  { href: '/tools/pitch-deck', label: 'Pitch Deck Assistant', icon: FileText },
  { href: '/tools/company-formation', label: 'Company Formation', icon: Library },
  { href: '/tools/ask-shah', label: 'Ask Shah', icon: MessageCircle },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = React.useState<Awaited<ReturnType<typeof getUser>> | null>(null);

  React.useEffect(() => {
    getUser().then(setUser);
  }, []);


  // Render a loading state or nothing on auth pages
  if (pathname === '/login' || pathname === '/signup') {
    return <>{children}</>;
  }
  
  if (!user) {
     // Or a loading spinner
    if (typeof window !== 'undefined') {
        const nonAuthRoutes = ['/login', '/signup'];
        if (!nonAuthRoutes.includes(window.location.pathname)) {
            window.location.href = '/login';
        }
    }
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Logo className="w-8 h-8" />
            <span className="text-xl font-semibold">BizSpark</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <UserNav user={user} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 md:justify-end">
          <SidebarTrigger className="md:hidden" />
          <UserNav user={user} />
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
