import { BusinessStrategyForm } from '@/components/tools/business-strategy-form';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BusinessStrategyPage() {
  return (
    <div className="space-y-8">
      <Card className="bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Business Strategy Generator</CardTitle>
          <CardDescription>
            Define your business model, unique selling proposition, pricing, and marketing channels to generate a comprehensive business strategy and a 90-day action plan.
          </CardDescription>
        </CardHeader>
      </Card>
      <BusinessStrategyForm />
    </div>
  );
}
