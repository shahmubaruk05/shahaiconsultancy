
'use client';

import { useState, useMemo } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

type ProjectType = 'business-plan' | 'pitch-deck' | 'company-profile' | 'all';

export default function ProjectsPage() {
    const { firestore, user, isUserLoading } = useFirebase();
    const [filter, setFilter] = useState<ProjectType>('all');

    const businessPlansQuery = useMemoFirebase(() =>
        user ? query(collection(firestore, `users/${user.uid}/businessPlans`), orderBy('createdAt', 'desc')) : null,
    [user, firestore]);
    const { data: businessPlans, isLoading: plansLoading } = useCollection(businessPlansQuery);

    const pitchDecksQuery = useMemoFirebase(() =>
        user ? query(collection(firestore, `users/${user.uid}/pitchDecks`), orderBy('createdAt', 'desc')) : null,
    [user, firestore]);
    const { data: pitchDecks, isLoading: decksLoading } = useCollection(pitchDecksQuery);

    const companyProfilesQuery = useMemoFirebase(() =>
        user ? query(collection(firestore, `users/${user.uid}/companyProfiles`), orderBy('createdAt', 'desc')) : null,
    [user, firestore]);
    const { data: companyProfiles, isLoading: profilesLoading } = useCollection(companyProfilesQuery);
    
    const isLoading = plansLoading || decksLoading || profilesLoading;

    const allProjects = useMemo(() => {
        if (isLoading) return [];
        const plans = (businessPlans || []).map((p: any) => ({ ...p, type: 'Business Plan', href: `/tools/business-plan?projectId=${p.id}` }));
        const decks = (pitchDecks || []).map((p: any) => ({ ...p, type: 'Pitch Deck', title: p.startupName, href: `/tools/pitch-deck?projectId=${p.id}` }));
        const profiles = (companyProfiles || []).map((p: any) => ({ ...p, type: 'Company Profile', title: p.companyName, href: `/tools/company-profile?projectId=${p.id}`}));
        return [...plans, ...decks, ...profiles].sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
    }, [businessPlans, pitchDecks, companyProfiles, isLoading]);

    const filteredProjects = useMemo(() => {
        if (filter === 'all') return allProjects;
        if (filter === 'business-plan') return allProjects.filter(p => p.type === 'Business Plan');
        if (filter === 'pitch-deck') return allProjects.filter(p => p.type === 'Pitch Deck');
        if (filter === 'company-profile') return allProjects.filter(p => p.type === 'Company Profile');
        return [];
    }, [allProjects, filter]);


    if (isUserLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (!user) {
        return (
             <Card className="m-auto mt-12 max-w-lg text-center p-8">
                <CardTitle>Please Log In</CardTitle>
                <CardDescription className="mt-2 mb-4">You need to be logged in to view your projects.</CardDescription>
                <Button asChild>
                    <Link href="/login">Log In</Link>
                </Button>
            </Card>
        );
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">My Saved Projects</h1>
            
            <div className="flex flex-wrap gap-2">
                <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
                <Button variant={filter === 'business-plan' ? 'default' : 'outline'} onClick={() => setFilter('business-plan')}>Business Plans</Button>
                <Button variant={filter === 'pitch-deck' ? 'default' : 'outline'} onClick={() => setFilter('pitch-deck')}>Pitch Decks</Button>
                <Button variant={filter === 'company-profile' ? 'default' : 'outline'} onClick={() => setFilter('company-profile')}>Company Profiles</Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : filteredProjects.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredProjects.map((project: any) => (
                                <Card key={project.id}>
                                    <CardHeader>
                                        <CardTitle className="truncate">{project.title || 'Untitled Project'}</CardTitle>
                                        <CardDescription>{project.type}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground line-clamp-2 h-10">{project.previewText}</p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Saved {project.createdAt ? formatDistanceToNow(project.createdAt.toDate(), { addSuffix: true }) : 'recently'}
                                        </p>
                                    </CardContent>
                                    <CardContent>
                                        <Button asChild className="w-full">
                                            <Link href={project.href}>Open Project <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-12">
                            No projects found for this filter.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

