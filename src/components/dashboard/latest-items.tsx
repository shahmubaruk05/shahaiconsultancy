
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Lightbulb, Target, Building2, ClipboardList, Loader2 } from 'lucide-react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

function formatTimestamp(timestamp: any) {
  if (!timestamp) return 'Just now';
  const date = timestamp.toDate();
  return formatDistanceToNow(date, { addSuffix: true });
}

export function LatestItems() {
  const { firestore, user } = useFirebase();

  const ideasQuery = useMemoFirebase(() => 
    user && firestore 
      ? query(collection(firestore, `users/${user.uid}/startupIdeas`), orderBy('createdAt', 'desc'), limit(3))
      : null, 
    [firestore, user]
  );
  const { data: ideas, isLoading: ideasLoading } = useCollection(ideasQuery);
  
  const strategiesQuery = useMemoFirebase(() => 
    user && firestore 
      ? query(collection(firestore, `users/${user.uid}/businessStrategies`), orderBy('createdAt', 'desc'), limit(3))
      : null, 
    [firestore, user]
  );
  const { data: strategies, isLoading: strategiesLoading } = useCollection(strategiesQuery);
  
  const plansQuery = useMemoFirebase(() => 
    user && firestore 
      ? query(collection(firestore, `users/${user.uid}/businessPlans`), orderBy('createdAt', 'desc'), limit(3))
      : null, 
    [firestore, user]
  );
  const { data: plans, isLoading: plansLoading } = useCollection(plansQuery);

  const decksQuery = useMemoFirebase(() => 
    user && firestore 
      ? query(collection(firestore, `users/${user.uid}/pitchDecks`), orderBy('createdAt', 'desc'), limit(3))
      : null, 
    [firestore, user]
  );
  const { data: decks, isLoading: decksLoading } = useCollection(decksQuery);

  const profilesQuery = useMemoFirebase(() =>
    user && firestore
      ? query(collection(firestore, `users/${user.uid}/companyProfiles`), orderBy('createdAt', 'desc'), limit(3))
      : null,
    [firestore, user]
  );
  const { data: profiles, isLoading: profilesLoading } = useCollection(profilesQuery);


  const isLoading = ideasLoading || strategiesLoading || decksLoading || profilesLoading || plansLoading;

  if (!user || !firestore) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Latest Work</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground p-8">
                { !user ? (
                    <div>
                        <p>Please log in to see your work.</p>
                        <Link href="/login" className="text-primary underline mt-2 inline-block">Log In</Link>
                    </div>
                ) : (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                ) }
            </CardContent>
        </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Latest Work</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading your latest work...</p>
        ) : (
        <Tabs defaultValue="ideas">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="ideas">Ideas</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="decks">Decks</TabsTrigger>
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
          </TabsList>
          <TabsContent value="ideas" className="mt-4">
            <div className="space-y-4">
              {ideas && ideas.length > 0 ? ideas.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex items-center gap-4">
                    <Lightbulb className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium truncate">{item.input}</p>
                      <p className="text-sm text-muted-foreground">Validated {formatTimestamp(item.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="font-semibold text-primary">{item.score}</p>
                     <p className="text-sm text-muted-foreground">Score</p>
                  </div>
                </div>
              )) : <p className="text-muted-foreground text-sm text-center py-4">No ideas validated yet.</p>}
            </div>
          </TabsContent>
          <TabsContent value="strategies" className="mt-4">
             <div className="space-y-4">
              {strategies && strategies.length > 0 ? strategies.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex items-center gap-4">
                    <Target className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{item.businessModel}</p>
                      <p className="text-sm text-muted-foreground">Generated {formatTimestamp(item.createdAt)}</p>
                    </div>
                  </div>
                </div>
              )) : <p className="text-muted-foreground text-sm text-center py-4">No strategies generated yet.</p>}
            </div>
          </TabsContent>
          <TabsContent value="plans" className="mt-4">
             <div className="space-y-4">
              {plans && plans.length > 0 ? plans.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex items-center gap-4">
                    <ClipboardList className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{item.businessName}</p>
                      <p className="text-sm text-muted-foreground">Generated {formatTimestamp(item.createdAt)}</p>
                    </div>
                  </div>
                   <div className="text-right">
                     <p className="font-semibold text-primary truncate">{item.industry}</p>
                     <p className="text-sm text-muted-foreground">Industry</p>
                  </div>
                </div>
              )) : <p className="text-muted-foreground text-sm text-center py-4">No business plans generated yet.</p>}
            </div>
          </TabsContent>
          <TabsContent value="decks" className="mt-4">
             <div className="space-y-4">
              {decks && decks.length > 0 ? decks.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{item.input.businessName}</p>
                      <p className="text-sm text-muted-foreground">Created {formatTimestamp(item.createdAt)}</p>
                    </div>
                  </div>
                </div>
              )) : <p className="text-muted-foreground text-sm text-center py-4">No pitch decks created yet.</p>}
            </div>
          </TabsContent>
           <TabsContent value="profiles" className="mt-4">
            <div className="space-y-4">
              {profiles && profiles.length > 0 ? profiles.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex items-center gap-4">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{item.companyName}</p>
                      <p className="text-sm text-muted-foreground">Created {formatTimestamp(item.createdAt)}</p>
                    </div>
                  </div>
                   <div className="text-right">
                     <p className="font-semibold text-primary truncate">{item.industry}</p>
                     <p className="text-sm text-muted-foreground">Industry</p>
                  </div>
                </div>
              )) : <p className="text-muted-foreground text-sm text-center py-4">No company profiles created yet.</p>}
            </div>
          </TabsContent>
        </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
    