import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var paypal: any;

@Component({
  selector: 'app-paypal-payment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="paypal-container">
      <div #paypalButtonContainer class="paypal-button-container"></div>
    </div>
  `,
  styles: [`
    .paypal-container {
      width: 100%;
    }
    .paypal-button-container {
      width: 100%;
    }
  `]
})
export class PaypalPaymentComponent implements OnInit, OnDestroy {
  @Input() amount: number = 0;
  @Input() description: string = 'Paiement';
  @Input() clientId: string = '';
  @Input() disabled: boolean = false;
  
  @Output() paymentSuccess = new EventEmitter<any>();
  @Output() paymentError = new EventEmitter<any>();
  @Output() paymentCancel = new EventEmitter<any>();

  private paypalButton: any = null;

  ngOnInit() {
    this.loadPayPalScript();
  }

  ngOnDestroy() {
    if (this.paypalButton) {
      this.paypalButton.close();
    }
  }

  private loadPayPalScript() {
    if (typeof paypal !== 'undefined') {
      this.initializePayPal();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=' + this.clientId + '&currency=EUR';
    script.async = true;
    script.onload = () => {
      this.initializePayPal();
    };
    script.onerror = () => {
      this.paymentError.emit({ message: 'Erreur lors du chargement de PayPal' });
    };
    document.head.appendChild(script);
  }

  private initializePayPal() {
    if (typeof paypal === 'undefined') {
      this.paymentError.emit({ message: 'PayPal SDK non disponible' });
      return;
    }

    paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal'
      },
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: (this.amount / 100).toFixed(2), // Convertir de centimes en euros
              currency_code: 'EUR'
            },
            description: this.description
          }]
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          this.paymentSuccess.emit({
            orderId: data.orderID,
            details: details
          });
        });
      },
      onError: (err: any) => {
        this.paymentError.emit(err);
      },
      onCancel: (data: any) => {
        this.paymentCancel.emit(data);
      }
    }).render('.paypal-button-container');
  }
}
