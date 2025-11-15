'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const navItems = [
  { href: '/', label: 'Home' },
  { href: '/academy', label: 'Academy' },
  { href: '/tools', label: 'Tools' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const servicesItems = [
    { href: '/services/company-formation', label: 'Company Formation (BD)'},
]

export function PublicHeader() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Logo />
          <nav className="flex items-center space-x-6 text-sm font-medium ml-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                {item.label}
              </Link>
            ))}
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={cn(
                  'transition-colors hover:text-foreground/80 px-0',
                  pathname.startsWith('/services') ? 'text-foreground' : 'text-foreground/60'
                )}>Services</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {servicesItems.map(item => (
                    <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
        
        {/* Mobile Nav */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div onClick={() => setIsSheetOpen(false)} className='p-2'>
              <Logo />
            </div>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSheetOpen(false)}
                    className={cn(
                      'transition-colors hover:text-foreground/80',
                       pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <p className='font-medium'>Services</p>
                {servicesItems.map(item => (
                    <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSheetOpen(false)}
                    className={cn(
                      'transition-colors hover:text-foreground/80 pl-4',
                       pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
             <div className="pl-6">
                <Button asChild>
                  {user ? <Link href="/dashboard">Dashboard</Link> : <Link href="/login">Log In</Link>}
                </Button>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center md:hidden">
            <Logo />
        </div>


        <div className="flex flex-1 items-center justify-end space-x-2">
            {user ? (
                 <Button asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </Button>
            ) : (
                <Button asChild>
                    <Link href="/login">Login</Link>
                </Button>
            )}
        </div>
      </div>
    </header>
  );
}
