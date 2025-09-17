import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { loadStripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../services/payment.service';

@Component({
  selector: 'app-payment-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-popup.component.html'
})
export class PaymentPopupComponent implements AfterViewInit {
  private stripePromise = loadStripe('pk_test_51RAR16Lv5sG8ZzOWzitQDUqoYSkuyFWHnWg99tIEKdJ0YE4rbz1VtunpjbvUcpoOSBDsIr1oKKFN9x2vAbrpsc9L00CBEiX2Nx'); // mets ta clé publique ici
  stripe: StripeElements | null = null;
  card!: StripeCardElement;
  clientSecret!: string;

  loading = false;
  message = '';
  paymentService = inject(PaymentService);

  async ngAfterViewInit() {
    const stripe = await this.stripePromise;
    if (!stripe) return;

    this.stripe = stripe.elements();
    this.card = this.stripe.create('card');

    const cardElement = document.getElementById('card-element');
    console.log('cardElement in ngAfterViewInit:', cardElement);

    if (cardElement) {
      this.card.mount(cardElement);
      const result = await this.paymentService.createPaymentIntent(1, 1000).toPromise();
      this.clientSecret = result?.clientSecret!;
    } else {
      console.error('Error: #card-element not found in the DOM.');
    }
  }

  async pay() {
    if (!this.stripe || !this.clientSecret || !this.card) return;

    const stripeInstance = await this.stripePromise;
    if (!stripeInstance) return;

    this.loading = true;
    const result = await stripeInstance.confirmCardPayment(this.clientSecret, {
      payment_method: {
        card: this.card,
      },
    });

    if (result.error) {
      this.message = '❌ Paiement échoué : ' + result.error.message;
    } else if (result.paymentIntent?.status === 'succeeded') {
      this.message = '✅ Paiement réussi';
      // facultatif : appeler un endpoint pour enregistrer si t’as pas de webhook
    }

    this.loading = false;
  }
}