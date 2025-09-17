import { Controller, Inject, Post, Req, Res } from '@nestjs/common';
import { PaymentService } from 'src/payment/payment.service';
import Stripe from 'stripe';
import { Request, Response } from 'express';

@Controller('webhook')
export class WebhookController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil',
  });

  constructor(
    @Inject(PaymentService)
    private readonly paymentService: PaymentService
  ) {}
  
  @Post('stripe')
async handleStripeWebhook(@Req() req: Request, @Res() res: Response) {
  console.log('📩 Webhook Stripe reçu');
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    // 👇 ici Stripe attend un `Buffer`, pas un JSON
    event = this.stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('❌ Erreur webhook Stripe:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('💰 [Stripe] Paiement complété - session ID:', session.id);
      console.log('📎 Metadata:', session.metadata);
      const userId = +session.metadata.userId;
  
      await this.paymentService.recordPayment(userId, {
        amount: session.amount_total! / 100,
        provider: 'stripe',
        currency: session.currency,
        status: 'paid',
        reference: session.id,
      });
  
      console.log('✅ Paiement Stripe enregistré pour user', userId);
    }
  
    res.status(200).json({ received: true });
  }

  @Post('paypal')
async handlePayPalWebhook(@Req() req, @Res() res) {
  const event = req.body;

  if (event.event_type === 'CHECKOUT.ORDER.APPROVED') {
    const orderId = event.resource.id;
    console.log('✅ Paiement PayPal approuvé:', orderId);
    // Tu peux ici valider ou stocker ce paiement
  }

  res.status(200).send('OK');
}

}
