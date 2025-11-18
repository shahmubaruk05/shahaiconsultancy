
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Lightbulb, Target, Building2, ClipboardList, Loader2, ArrowRight } from 'lucide-react';
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
                <CardTitle>My Saved Projects</CardTitle>
                <CardDescription>Your recent work will appear here once you log in and start creating.</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground p-8">
                <div>
                    <p>Please log in to see your saved projects.</p>
                    <Button asChild variant="link" className="mt-2">
                        <Link href="/login">Log In to View Projects</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
  }

  const allProjects = [
    ...(plans || []).map((p: any) => ({ ...p, type: 'Business Plan', href: `/tools/business-plan?projectId=${p.id}`, icon: ClipboardList })),
    ...(decks || []).map((p: any) => ({ ...p, type: 'Pitch Deck', title: p.startupName, href: `/tools/pitch-deck?projectId=${p.id}`, icon: FileText })),
    ...(profiles || []).map((p: any) => ({ ...p, type: 'Company Profile', title: p.companyName, href: `/tools/company-profile?projectId=${p.id}`, icon: Building2 })),
  ].sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
  

  const recentProjects = allProjects.slice(0, 5);


  return (
    <Card>
      <CardHeader>
        <CardTitle>My Saved Projects</CardTitle>
        <CardDescription>Your 5 most recently saved projects. View all to see more.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        ) : recentProjects.length > 0 ? (
            <div className="space-y-4">
                {recentProjects.map((item: any) => {
                    const Icon = item.icon || FileText;
                    return (
                        <Link href={item.href} key={item.id} className="block border rounded-lg p-4 hover:bg-secondary transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium truncate">{item.title || 'Untitled Project'}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Saved {formatTimestamp(item.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-primary">{item.type}</p>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-8">
            You haven't saved any projects yet. Use a tool and click "Save to My Projects".
          </p>
        )}
      </CardContent>
      <CardFooter>
          <Button asChild variant="secondary" className="ml-auto">
              <Link href="/dashboard/projects">
                  View all projects <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
          </Button>
      </CardFooter>
    </Card>
  );
}
    