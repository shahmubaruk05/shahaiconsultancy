import { StartupValidatorForm } from '@/components/tools/startup-validator-form';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StartupValidatorPage() {
  return (
    <div className="space-y-8">
      <Card className="bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Startup Idea Validator</CardTitle>
          <CardDescription>
            Got a business idea? Describe it below and let our AI analyze its potential. Get a viability score, a summary, potential risks, and actionable recommendations.
          </CardDescription>
        </CardHeader>
      </Card>
      <StartupValidatorForm />
    </div>
  );
}
