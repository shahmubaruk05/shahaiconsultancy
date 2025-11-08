import { PitchDeckForm } from '@/components/tools/pitch-deck-form';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PitchDeckPage() {
  return (
    <div className="space-y-8">
      <Card className="bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Pitch Deck Assistant</CardTitle>
          <CardDescription>
            Answer the following questions about your business, and our AI will generate a structured pitch deck outline with content suggestions for each slide.
          </CardDescription>
        </CardHeader>
      </Card>
      <PitchDeckForm />
    </div>
  );
}
