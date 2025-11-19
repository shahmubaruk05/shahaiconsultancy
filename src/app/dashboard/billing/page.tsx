
'use client';

import { useState, useEffect } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, serverTimestamp, setDoc, orderBy } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

type Payment = {
    id: string;
    name: string;
    email: string;
    phone: string;
    trxId: string;
    plan: 'pro' | 'premium';
    amount: string;
    status: 'pending' | 'verified' | 'rejected';
    uid?: string;
    createdAt: any;
};

export default function BillingAdminPage() {
    const { firestore, user, isUserLoading } = useFirebase();
    const { toast } = useToast();
    const [verifyingId, setVerifyingId] = useState<string | null>(null);

    const pendingPaymentsQuery = useMemoFirebase(() => 
        firestore ? query(collection(firestore, 'bkashPayments'), where('status', '==', 'pending'), orderBy('createdAt', 'desc')) : null,
        [firestore]
    );

    const { data: payments, isLoading, error } = useCollection<Payment>(pendingPaymentsQuery);

    const handleVerify = async (payment: Payment) => {
        if (!firestore || !user) return;
        if (!confirm(`Are you sure you want to verify payment from ${payment.name} (${payment.trxId})?`)) return;
        
        setVerifyingId(payment.id);
        try {
            const paymentRef = doc(firestore, 'bkashPayments', payment.id);
            await updateDoc(paymentRef, {
                status: 'verified',
                verifiedAt: serverTimestamp(),
                verifiedBy: user.uid,
            });

            if (payment.uid) {
                const userRef = doc(firestore, 'users', payment.uid);
                await setDoc(userRef, { plan: payment.plan, planUpdatedAt: serverTimestamp() }, { merge: true });
                toast({ title: 'Payment Verified & User Upgraded!' });
            } else {
                toast({ title: 'Payment Verified!', description: 'User account was not linked, upgrade must be manual.' });
            }
        } catch (error: any) {
            console.error("Verification failed:", error);
            toast({ variant: 'destructive', title: 'Verification Failed', description: error.message });
        } finally {
            setVerifyingId(null);
        }
    };
    
    // A simple check for admin. In a real app, use custom claims.
    const isAdmin = user && user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (isUserLoading || isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    if (!isAdmin) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                    <CardDescription>You do not have permission to view this page.</CardDescription>
                </CardHeader>
            </Card>
        );
    }
    
    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='text-destructive'>Error Loading Payments</CardTitle>
                    <CardDescription className='text-destructive/80'>There was a problem fetching the pending payments. This is often a permission issue.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <pre className="bg-muted p-4 rounded-md text-xs whitespace-pre-wrap">{error.message}</pre>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pending bKash Payments</CardTitle>
                <CardDescription>Review and verify manual bKash payments. Check Trx ID with Merchant Portal.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Trx ID</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments && payments.length > 0 ? (
                            payments.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.createdAt ? formatDistanceToNow(p.createdAt.toDate(), { addSuffix: true }) : 'N/A'}</TableCell>
                                    <TableCell>
                                        <div>{p.name}</div>
                                        <div className="text-xs text-muted-foreground">{p.email} | {p.phone}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={p.plan === 'premium' ? 'default' : 'secondary'}>{p.plan}</Badge>
                                        <div className='text-xs'>{p.amount}</div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{p.trxId}</TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            onClick={() => handleVerify(p)}
                                            disabled={verifyingId === p.id}
                                        >
                                            {verifyingId === p.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Verify & Upgrade
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">No pending payments.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
