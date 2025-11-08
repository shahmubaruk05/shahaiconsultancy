import { CompanyFormationContent } from '@/components/tools/company-formation-content';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CompanyFormationPage() {
  return (
    <div className="space-y-8">
      <Card className="bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Company Formation Guide</CardTitle>
          <CardDescription>
            Step-by-step guides, document checklists, and important notes for forming a company in the USA and Bangladesh.
          </CardDescription>
        </CardHeader>
      </Card>
      <CompanyFormationContent />
    </div>
  );
}
