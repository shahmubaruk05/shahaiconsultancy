import Link from 'next/link';
import { Logo } from '@/components/logo';

export function PublicFooter() {
  return (
    <footer className="border-t">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
             <Logo />
            <p className="text-sm text-muted-foreground">
              Empowering entrepreneurs with AI-powered startup solutions.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 text-center sm:items-end sm:text-right">
             <div className="flex space-x-4 text-sm font-medium">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                Contact
              </Link>
               <Link href="/intake" className="text-muted-foreground hover:text-foreground">
                Intake Form
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Shah Mubaruk – Your Startup Coach. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
