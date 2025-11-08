import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usaGuide, bangladeshGuide, Guide } from '@/lib/company-formation-data';

function GuideSection({ title, content }: { title: string; content: string[] | string }) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      {Array.isArray(content) ? (
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          {content.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">{content}</p>
      )}
    </div>
  );
}

function GuideDisplay({ guide }: { guide: Guide }) {
    return (
        <div className="space-y-6">
            <GuideSection title="Formation Steps" content={guide.formationSteps} />
            <GuideSection title="Document Checklist" content={guide.documentChecklist} />
            <GuideSection title="Important Notes" content={guide.notes} />
        </div>
    );
}

export function CompanyFormationContent() {
  return (
    <Card>
      <CardContent className="p-0">
        <Tabs defaultValue="usa" className="w-full">
          <div className="border-b">
            <TabsList className="m-4">
              <TabsTrigger value="usa">USA</TabsTrigger>
              <TabsTrigger value="bangladesh">Bangladesh</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="usa" className="p-6">
            <GuideDisplay guide={usaGuide} />
          </TabsContent>
          <TabsContent value="bangladesh" className="p-6">
            <GuideDisplay guide={bangladeshGuide} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
