import { Component, OnInit } from '@angular/core';
import {
  loadStripe,
  StripeElements,
  StripeCardElement,
} from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ApiPaths } from '../shared/api-paths';

@Component({
  selector: 'app-stripe-elements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4 p-4 border border-gray-200 rounded-lg shadow">
      <h3 class="text-lg font-semibold">💳 Paiement intégré</h3>

      <div id="card-element" class="border p-3 rounded-md"></div>

      <button
        (click)="submitPayment()"
        class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        [disabled]="loading"
      >
        {{ loading ? 'Traitement...' : 'Payer' }}
      </button>

      <div
        *ngIf="message"
        class="text-sm mt-2"
        [ngClass]="{ 'text-green-600': success, 'text-red-600': !success }"
      >
        {{ message }}
      </div>
    </div>
  `,
})
export class StripeElementsComponent implements OnInit {
  stripe: any;
  elements: StripeElements | null = null;
  card: StripeCardElement | null = null;
  loading = false;
  message = '';
  success = false;
  clientSecret!: string;

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    this.stripe = await loadStripe(
      'pk_test_51RAR16Lv5sG8ZzOWzitQDUqoYSkuyFWHnWg99tIEKdJ0YE4rbz1VtunpjbvUcpoOSBDsIr1oKKFN9x2vAbrpsc9L00CBEiX2Nx'
    ); // Remplace par ta clé publique Stripe

    console.log('Stripe loaded:', this.stripe);
    this.elements = this.stripe ? this.stripe.elements() : null;
    console.log('Stripe Elements created:', this.elements);
    if (!this.elements) return;
    this.card = this.elements.create('card');
    console.log('Card Element created:', this.card);
    this.card.mount('#card-element');
    console.log('Card Element mounted.');

    this.http
      .post<{ clientSecret: string }>(`${ApiPaths.payments}/intent`, {
        userId: 1,
        amount: 1000,
      })
      .subscribe(({ clientSecret }) => {
        this.clientSecret = clientSecret; // Stocker le clientSecret
      });
  }

  async submitPayment() {
    if (!this.stripe || !this.card) return;

    this.loading = true;
    this.message = '';

    const { error, paymentMethod } = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.card,
    });

    if (error) {
      this.loading = false;
      this.message =
        error.message ?? 'Erreur lors de la création du PaymentMethod.';
      return;
    }

    // Appeler votre backend avec paymentMethod.id et le clientSecret
    this.http
      .post<{ paymentIntentId: string }>(`${ApiPaths.payments}/confirm`, {
        paymentMethodId: paymentMethod!.id,
        clientSecret: this.clientSecret, // Assurez-vous d'avoir stocké le clientSecret
      })
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.success = true;
          this.message = '✅ Paiement réussi ! (via PaymentMethod)';
          // Gérer la réponse de votre backend (par exemple, redirection)
        },
        error: (err) => {
          this.loading = false;
          this.success = false;
          this.message =
            err.error.message ?? 'Erreur lors de la confirmation du paiement.';
        },
      });
  }
}
