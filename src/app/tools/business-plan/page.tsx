
import { BusinessPlanForm } from '@/components/tools/business-plan-form';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BusinessPlanPage() {
  return (
    <div className="space-y-8">
      <Card className="bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Business Plan Generator</CardTitle>
          <CardDescription>
            Fill out the form below to generate a structured business plan, including an executive summary, market analysis, marketing plan, and more.
          </CardDescription>
        </CardHeader>
      </Card>
      <BusinessPlanForm />
    </div>
  );
}
    