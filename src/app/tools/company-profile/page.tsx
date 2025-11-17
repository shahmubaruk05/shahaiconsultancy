
'use client';

import { CompanyProfileForm } from '@/components/tools/company-profile-form';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CompanyProfilePage() {
  return (
    <div className="space-y-8">
      <Card className="bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Company Profile Creator</CardTitle>
          <CardDescription>
            Fill out your company details, and our AI will generate a complete, professional company profile for you.
          </CardDescription>
        </CardHeader>
      </Card>
      <CompanyProfileForm />
    </div>
  );
}
