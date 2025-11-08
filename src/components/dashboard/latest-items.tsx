import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Lightbulb, Target } from 'lucide-react';

const mockLatest = {
  strategies: [
    { id: 1, name: 'SaaS for Artisans', date: '2 days ago' },
    { id: 2, name: 'Eco-friendly Packaging', date: '1 week ago' },
  ],
  ideas: [
    { id: 1, name: 'AI-Powered Meal Planner', date: '4 hours ago', score: 85 },
    { id: 2, name: 'Subscription Box for Pets', date: '3 days ago', score: 72 },
  ],
  decks: [
    { id: 1, name: 'Fintech App Pitch', date: '5 days ago' },
  ],
};

export function LatestItems() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Latest Work</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ideas">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ideas">Ideas</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="decks">Decks</TabsTrigger>
          </TabsList>
          <TabsContent value="ideas" className="mt-4">
            <div className="space-y-4">
              {mockLatest.ideas.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex items-center gap-4">
                    <Lightbulb className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Validated {item.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="font-semibold text-primary">{item.score}</p>
                     <p className="text-sm text-muted-foreground">Score</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="strategies" className="mt-4">
             <div className="space-y-4">
              {mockLatest.strategies.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex items-center gap-4">
                    <Target className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Generated {item.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="decks" className="mt-4">
             <div className="space-y-4">
              {mockLatest.decks.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Created {item.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
