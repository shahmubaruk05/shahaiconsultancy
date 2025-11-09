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
  Building2,
  ClipboardList,
  Flame,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useUser } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tools/ask-shah', label: 'Ask Shah', icon: MessageCircle },
  { href: '/tools/startup-validator', label: 'Startup Validator', icon: FlaskConical },
  { href: '/tools/business-strategy', label: 'Business Strategy', icon: Target },
  { href: '/tools/business-plan', label: 'Business Plan', icon: ClipboardList },
  { href: '/tools/pitch-deck', label: 'Pitch Deck Assistant', icon: FileText },
  { href: '/tools/company-profile', label: 'Company Profile', icon: Building2 },
  { href: '/tools/company-formation', label: 'Company Formation', icon: Library },
  { href: '/tools', label: 'All Tools', icon: Flame },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();

  const userProfile = user ? {
    name: user.displayName || user.email || 'Anonymous',
    email: user.email || 'anonymous',
    avatarUrl: user.photoURL || PlaceHolderImages.find(p => p.id === 'user-avatar')?.imageUrl || 'https://picsum.photos/seed/user-avatar/100/100',
  } : null;
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2 p-2">
            <Logo className="w-8 h-8" />
            <span className="text-xl font-semibold">Shah Mubaruk</span>
          </Link>
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
          {userProfile && <UserNav user={userProfile} />}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 md:justify-end">
          <SidebarTrigger className="md:hidden" />
           {userProfile && <UserNav user={userProfile} isMobile={true} />}
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
