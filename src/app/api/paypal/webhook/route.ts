import { NextRequest, NextResponse } from 'next/server';
import { applyPaidPlanForEmail } from '@/lib/userPlans';
import { admin } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = body.event_type;
    const resource = body.resource;

    // TODO: Add PayPal webhook signature verification here for production security.
    // This involves verifying the signature from the request headers using your webhook ID.

    // Store raw event for debugging and auditing purposes.
    const db = admin.firestore();
    await db.collection('paypal_webhooks').add({
      eventType,
      raw: body,
      receivedAt: new Date(),
    });

    // Only process successful payment events.
    // "CHECKOUT.ORDER.APPROVED" for one-time payments via smart buttons.
    // "PAYMENT.CAPTURE.COMPLETED" is a robust fallback for various payment types.
    if (
      eventType !== 'CHECKOUT.ORDER.APPROVED' &&
      eventType !== 'PAYMENT.CAPTURE.COMPLETED'
    ) {
      return NextResponse.json({
        ok: true,
        message: `Skipped event: ${eventType}`,
      });
    }

    // Extract payer email from the webhook payload.
    const payer = resource?.payer || {};
    const payerEmail = payer.email_address || null;

    if (!payerEmail) {
      return NextResponse.json({ ok: true, message: 'No payer email found.' });
    }

    // Detect which plan was purchased by inspecting the description.
    // This relies on the item name/description set in your PayPal payment links.
    const purchaseUnit = resource?.purchase_units?.[0];
    const description = (
      purchaseUnit?.description ||
      purchaseUnit?.items?.[0]?.name ||
      ''
    ).toLowerCase();

    let plan: 'pro' | 'premium' | null = null;
    if (description.includes('pro')) {
      plan = 'pro';
    } else if (description.includes('premium')) {
      plan = 'premium';
    }

    if (!plan) {
      return NextResponse.json({ ok: true, message: 'Could not determine product from webhook.' });
    }

    // Get a unique transaction ID.
    const paypalId = resource?.id || 'unknown_id';

    // Apply the plan upgrade to the user.
    await applyPaidPlanForEmail(payerEmail.toLowerCase(), plan, paypalId);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('PayPal webhook processing error:', err.message);
    return NextResponse.json(
      { ok: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
