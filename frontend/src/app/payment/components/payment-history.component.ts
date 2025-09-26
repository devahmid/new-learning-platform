import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { PaymentService } from '../../services/payment.service';
import { BadgeModule }  from 'primeng/badge';


@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, BadgeModule ],
  template: `
    <div class="p-6 bg-white rounded-xl shadow-md border border-gray-100">
  <h2 class="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
    <i class="pi pi-wallet text-xl text-emerald-500"></i>
    Historique des paiements
  </h2>

  <ul *ngIf="payments().length > 0; else empty" class="space-y-3">
    <li
      *ngFor="let p of payments()"
      class="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3 hover:bg-gray-100 transition-colors"
    >
      <!-- Provider + montant -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-2">
        <span class="text-sm font-medium text-gray-800">{{ p.paymentMethod }}</span>
        <span class="text-sm text-gray-600">
          {{ p.amount.toFixed(2) }} {{ p.currency.toUpperCase() }}
        </span>
      </div>

      <!-- Date + badge statut -->
      <div class="flex items-center gap-4">
        <span class="text-xs text-gray-500">
          {{ p.createdAt | date:'dd/MM/yyyy' }}
        </span>
        <p-badge
          [value]="p.status === 'completed' ? '✅' : p.status === 'pending' ? '⏳' : '❌'"
          [severity]="
            p.status === 'completed' ? 'success' :
            p.status === 'pending' ? 'warning' :
            'danger'
          "
          class="text-xs"
        ></p-badge>
      </div>
    </li>
  </ul>

  <ng-template #empty>
    <div class="flex flex-col items-center justify-center py-10">
      <i class="pi pi-clock text-3xl text-gray-300 mb-3"></i>
      <p class="text-gray-500 italic">Aucun paiement trouvé.</p>
    </div>
  </ng-template>
</div>

  `
})
export class PaymentHistoryComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private auth = inject(AuthService);

  payments = signal<any[]>([]);

  ngOnInit() {
    this.refresh();
  }
  refresh() {
    const userId = this.auth.id();
    if (!userId) return;

    this.paymentService.getPaymentHistory(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.payments.set(response.data);
        } else {
          console.error('Erreur récupération paiements:', response.message);
          this.payments.set([]);
        }
      },
      error: (error) => {
        console.error('Erreur récupération paiements:', error);
        this.payments.set([]);
      },
    });
  }

}
