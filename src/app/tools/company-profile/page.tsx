
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
            Tell us about your company, and we’ll generate a polished, investor-friendly profile you can download and share with clients or partners.
          </CardDescription>
        </CardHeader>
      </Card>
      <CompanyProfileForm />
    </div>
  );
}

    