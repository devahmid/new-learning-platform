import { Component } from '@angular/core';
import { PaymentService } from '../services/payment.service';
import { SpinnerComponent } from '../spinner/spinner.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  template: `
    <app-spinner [loading]="loading" />

    <div class="p-6 space-y-4">
      <h2 class="text-2xl font-bold">Paiement</h2>

      <button class="bg-blue-600 text-white px-4 py-2 rounded" (click)="payWithStripe()">Payer avec Stripe</button>
      <button class="bg-yellow-500 text-white px-4 py-2 rounded" (click)="payWithPayPal()">Payer avec PayPal</button>
    </div>
  `
})
export class PaymentComponent {
  loading = false;

  constructor(private paymentService: PaymentService) { }

  payWithStripe() {
    this.loading = true;
    const userId = 1; // ou récupère dynamiquement

    this.paymentService.createStripeSession(1000, userId).subscribe({
      next: (res) => window.location.href = res.url,
      error: () => (this.loading = false)
    });
  }


  payWithPayPal() {
    this.loading = true;
    this.paymentService.getPayPalClientId().subscribe({
      next: ({ clientId }) => {
        // tu intègres ici PayPal JS SDK
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }
}
