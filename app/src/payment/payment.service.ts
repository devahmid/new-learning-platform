import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import * as paypal from '@paypal/checkout-server-sdk';
import { Payment } from './payment.entity';
import { User } from 'src/user/user.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class PaymentService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil',
  });

  private paypalClient = new paypal.core.PayPalHttpClient(
    new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID!,
      process.env.PAYPAL_SECRET!,
    ),
    
  );

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailService: MailService,
  ) { }

  async createStripeSession(userId: number, amount: number): Promise<{ url: string }> {
    console.log('🔄 [Stripe] Création de session pour user', userId, 'montant:', amount);
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: amount,
            product_data: { name: 'Paiement utilisateur #' + userId },
          },
          quantity: 1,
        },
      ],
      metadata: { userId: String(userId) },
      success_url: 'https://arrisala.fr/mon-compte?status=success',
      cancel_url: 'https://arrisala.fr/mon-compte?status=failed',
      // success_url: 'http://localhost:4200/mon-compte?status=success',
      // cancel_url: 'http://localhost:4200/mon-compte?status=failed',

    });
    console.log('✅ [Stripe] Session créée:', session.id);
    return { url: session.url! };
  }

  async createPayPalOrder(userId: number, amount: string): Promise<any> {
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'EUR',
            value: amount,
          },
          custom_id: String(userId),
        },
      ],
    });

    const response = await this.paypalClient.execute(request);
    return response.result;
  }

  async recordPayment(userId: number, data: Partial<Payment>): Promise<Payment> {
    console.log('💾 Enregistrement du paiement pour user', userId, 'data:', data);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      console.warn('⚠️ Utilisateur non trouvé pour paiement:', userId);
      throw new NotFoundException('Utilisateur introuvable');
    }

    const payment = this.paymentRepo.create({ ...data, user });
    const saved = await this.paymentRepo.save(payment);
    await this.mailService.sendPaymentReceipt(user.email, saved);


    console.log('✅ Paiement enregistré:', saved);
    return saved;
  }

  async getUserPayments(userId: number): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async capturePayPalOrder(orderId: string): Promise<any> {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await this.paypalClient.execute(request);
    console.log('🔄 [PayPal] Capture de commande:', orderId);
    const details = response.result.purchase_units[0].payments.captures[0];
    console.log('✅ [PayPal] Capture réussie:', details);

    await this.recordPayment(+details.custom_id, {
      amount: +details.amount.value,
      provider: 'paypal',
      currency: details.amount.currency_code,
      status: 'paid',
      reference: details.id,
    });

    return response.result;
  }

  // createPaymentIntent
async createPaymentIntent(userId: number, amount: number) {
  const intent = await this.stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    metadata: { userId: String(userId) },
  });

  console.log('🧾 PaymentIntent created:', intent.id);

  return { clientSecret: intent.client_secret };
}


}
