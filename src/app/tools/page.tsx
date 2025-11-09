import { QuickLinks } from "@/components/dashboard/quick-links";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ToolsPage() {
    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight">AI-Powered Startup Tools</h1>
                <p className="text-lg text-muted-foreground mt-2">Everything you need to validate your idea, build your strategy, and create investor-ready documents.</p>
            </div>
            <QuickLinks />
        </div>
    );
}
