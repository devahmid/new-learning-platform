import { Component, ViewChild } from '@angular/core';
import { PaymentHistoryComponent } from './payment-history.component';
import { PaymentActionsComponent } from './payment-actions.component';


@Component({
    selector: 'app-payment-page',
    standalone:true,
    imports: [PaymentActionsComponent, PaymentHistoryComponent],
    template: `
    <div class="max-w-3xl mx-auto mt-10 space-y-10">
      <app-payment-actions (paymentCompleted)="onPaymentDone()"></app-payment-actions>
      <app-payment-history></app-payment-history>
    </div>
  `
})
export class PaymentPageComponent {
  @ViewChild(PaymentHistoryComponent) historyComp!: PaymentHistoryComponent;

onPaymentDone() {
  this.historyComp.refresh();
}
}
