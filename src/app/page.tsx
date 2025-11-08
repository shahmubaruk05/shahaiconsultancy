import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { QuickLinks } from "@/components/dashboard/quick-links";
import { LatestItems } from "@/components/dashboard/latest-items";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <WelcomeHeader />
      <QuickLinks />
      <LatestItems />
    </div>
  );
}
