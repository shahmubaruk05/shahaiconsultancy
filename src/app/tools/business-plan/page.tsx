
"use client";

import { BusinessPlanForm } from '@/components/tools/business-plan-form';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';

export default function BusinessPlanPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  
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
      <BusinessPlanForm projectId={projectId} />
    </div>
  );
}
    
