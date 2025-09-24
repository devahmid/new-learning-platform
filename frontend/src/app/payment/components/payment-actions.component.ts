// import { ChangeDetectorRef, Component, EventEmitter, inject, Output, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { PaymentService } from '../../payment.service';
// import { AuthService } from '../../auth/auth.service';
// import { SpinnerComponent } from '../../spinner/spinner.component';
// import { MessageService } from 'primeng/api';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// declare var paypal: any;
// @Component({
//   selector: 'app-payment-actions',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
//   templateUrl: './payment-actions.component.html',
// })
// export class PaymentActionsComponent {
//   loading = false;
//   paypalVisible = signal(false);
//   @Output() paymentCompleted = new EventEmitter<void>();
//   private auth = inject(AuthService);
//   private paymentService = inject(PaymentService);
//   private messageService = inject(MessageService);
//   private fb = inject(FormBuilder);
//   private cdr = inject(ChangeDetectorRef);


//   form: FormGroup = this.fb.group({
//     amount: [null, [Validators.required, Validators.min(1)]]
//   });

//   get amount() {
//     return this.form.get('amount')?.value;
//   }

//   get isAmountValid() {
//     return this.form.valid;
//   }
//   isMobile(): boolean {
//     return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
//   }


//   payWithStripe() {
//     if (!this.isAmountValid) return;
//     this.loading = true;

//     this.paymentService.createStripeSession(this.amount * 100, this.auth.id()!).subscribe({
//       next: (res) => window.location.href = res.url,
//       error: () => this.loading = false,
//     });
//   }

//   showPaypalButton() {
//     return this.paypalVisible();
//   }

//   // payWithPayPal() {
//   //   this.loading = true;
//   //   this.paymentService.getPayPalClientId().subscribe({
//   //     next: ({ clientId }) => {
//   //       this.loading = false;
//   //       // À compléter avec PayPal JS SDK si tu veux le faire propre
//   //     },
//   //     error: () => (this.loading = false),
//   //   });
//   // }

//   // payWithPayPal() {
//   //   this.loading = true;
//   //   const userId = this.auth.id();


//   //   if (!userId) return;

//   //   this.paymentService.createPayPalOrder(1, userId).subscribe({
//   //     next: (order) => {
//   //       this.loading = false;

//   //       this.paypalVisible.set(true);
//   //       // 🧠 Render PayPal button
//   //       setTimeout(() => {
//   //         paypal.Buttons({
//   //           createOrder: () => order.id,
//   //           onApprove: (data: { orderID: string; }) => {
//   //             this.loading = true;
//   //             this.paymentService.capturePayPal(data.orderID).subscribe({
//   //               next: () => {
//   //                 this.messageService.add({
//   //                   severity: 'success',
//   //                   summary: 'Paiement validé ✅',
//   //                   detail: 'Votre paiement a été enregistré avec succès.',
//   //                 });

//   //                 this.loading = false;
//   //                 this.paypalVisible.set(false); 
//   //                 this.paymentCompleted.emit();  
//   //               },
//   //               error: () => {
//   //                 this.messageService.add({
//   //                   severity: 'error',
//   //                   summary: 'Paiement échoué ❌',
//   //                   detail: 'Le paiement a échoué ou a été annulé.',
//   //                 });

//   //                 this.loading = false;
//   //               },
//   //             });
//   //           },
//   //         }).render('#paypal-button-container');
//   //       });
//   //     },
//   //     error: () => (this.loading = false),
//   //   });
//   // }


//   // payWithPayPal() {
//   //   if (!this.isAmountValid) return;

//   //   const amount = this.amount.toFixed(2); // PayPal veut un string "12.50"
//   //   const userId = this.auth.id();
//   //   if (!userId) return;

//   //   this.loading = true;

//   //   this.paymentService.createPayPalOrder(amount, userId).subscribe({
//   //     next: (order) => {
//   //       this.loading = false;
//   //       this.paypalVisible.set(true);

//   //       setTimeout(() => {
//   //         paypal.Buttons({
//   //           createOrder: () => order.id,

//   //           onApprove: (data: { orderID: string }) => {
//   //             this.loading = true;
//   //             this.paymentService.capturePayPal(data.orderID).subscribe({
//   //               next: () => {
//   //                 this.messageService.add({
//   //                   severity: 'success',
//   //                   summary: 'Paiement validé ✅',
//   //                   detail: 'Votre paiement a été enregistré avec succès.',
//   //                 });
//   //                 this.loading = false;
//   //                 this.paypalVisible.set(false);
//   //                 this.paymentCompleted.emit();
//   //               },
//   //               error: () => {
//   //                 this.messageService.add({
//   //                   severity: 'error',
//   //                   summary: 'Paiement échoué ❌',
//   //                   detail: 'Le paiement a échoué ou a été annulé.',
//   //                 });
//   //                 this.loading = false;
//   //               },
//   //             });
//   //           },

//   //           onCancel: () => {
//   //             this.messageService.add({
//   //               severity: 'warn',
//   //               summary: 'Paiement annulé ❌',
//   //               detail: 'Vous avez fermé la fenêtre PayPal sans valider.',
//   //             });
//   //             this.paypalVisible.set(false);
//   //           },

//   //           onError: (err: any) => {
//   //             console.error('PayPal SDK Error:', err);
//   //             this.messageService.add({
//   //               severity: 'error',
//   //               summary: 'Erreur PayPal',
//   //               detail: 'Une erreur est survenue avec PayPal.',
//   //             });
//   //             this.paypalVisible.set(false);
//   //           }
//   //         }).render('#paypal-button-container');
//   //       });
//   //     },
//   //     error: () => {
//   //       this.loading = false;
//   //       this.messageService.add({
//   //         severity: 'error',
//   //         summary: 'Erreur',
//   //         detail: 'Impossible de créer une commande PayPal.',
//   //       });
//   //     },
//   //   });
//   // }

//   // payWithPayPal() {
//   //   if (!this.isAmountValid) return;

//   //   const amount = this.amount.toFixed(2);
//   //   const userId = this.auth.id();
//   //   if (!userId) return;

//   //   this.loading = true;

//   //   this.paymentService.createPayPalOrder(amount, userId).subscribe({
//   //     next: (order) => {
//   //       this.loading = false;

//   //       if (this.isMobile()) {
//   //         // 🚀 Redirection full screen sur mobile
//   //         window.location.href = `https://www.paypal.com/checkoutnow?token=${order.id}`;
//   //         return;
//   //       }

//   //       // 🖥 Desktop → bouton intégré
//   //       this.paypalVisible.set(true);
//   //       this.cdr.detectChanges(); // 💡 forcer Angular à détecter le DOM

//   //       setTimeout(() => {
//   //         paypal.Buttons({
//   //           createOrder: () => order.id,
//   //           onApprove: (data: { orderID: string }) => {
//   //             this.loading = true;
//   //             this.paymentService.capturePayPal(data.orderID).subscribe({
//   //               next: () => {
//   //                 this.messageService.add({
//   //                   severity: 'success',
//   //                   summary: 'Paiement validé ✅',
//   //                   detail: 'Votre paiement a été enregistré avec succès.',
//   //                 });
//   //                 this.loading = false;
//   //                 this.paypalVisible.set(false);
//   //                 this.paymentCompleted.emit();
//   //               },
//   //               error: () => {
//   //                 this.messageService.add({
//   //                   severity: 'error',
//   //                   summary: 'Paiement échoué ❌',
//   //                   detail: 'Le paiement a échoué ou a été annulé.',
//   //                 });
//   //                 this.loading = false;
//   //               },
//   //             });
//   //           },
//   //           onCancel: () => {
//   //             this.messageService.add({
//   //               severity: 'warn',
//   //               summary: 'Paiement annulé ❌',
//   //               detail: 'Vous avez fermé la fenêtre PayPal sans valider.',
//   //             });
//   //             this.paypalVisible.set(false);
//   //           },
//   //           onError: (err: any) => {
//   //             console.error('PayPal SDK Error:', err);
//   //             this.messageService.add({
//   //               severity: 'error',
//   //               summary: 'Erreur PayPal',
//   //               detail: 'Une erreur est survenue avec PayPal.',
//   //             });
//   //             this.paypalVisible.set(false);
//   //           },
//   //         }).render('#paypal-button-container');
//   //       });
//   //     },
//   //     error: () => {
//   //       this.loading = false;
//   //       this.messageService.add({
//   //         severity: 'error',
//   //         summary: 'Erreur',
//   //         detail: 'Impossible de créer une commande PayPal.',
//   //       });
//   //     },
//   //   });
//   // }
//   payWithPayPal() {
//     if (!this.isAmountValid) return;

//     const amount = this.amount.toFixed(2); // format PayPal : "12.00"
//     const userId = this.auth.id();
//     if (!userId) return;

//     this.loading = true;

//     this.paymentService.createPayPalOrder(amount, userId).subscribe({
//       next: (order) => {
//         this.loading = false;

//         // 👉 Fallback pour mobile : redirection
//         if (this.isMobile()) {
//           setTimeout(() => {
//             window.location.href = `https://www.paypal.com/checkoutnow?token=${order.id}`;
//           }, 100); // Délai de 100ms
//           return;
//         }

//         // 👉 Desktop : affichage bouton intégré
//         this.paypalVisible.set(true);

//         setTimeout(() => {
//           const container = document.getElementById('paypal-button-container');
//           if (!container) {
//             console.warn('⚠️ paypal-button-container introuvable');
//             return;
//           }

//           paypal.Buttons({
//             createOrder: () => order.id,

//             onApprove: (data: { orderID: string }) => {
//               this.loading = true;
//               return this.paymentService.capturePayPal(data.orderID).toPromise().then(() => {
//                 this.messageService.add({
//                   severity: 'success',
//                   summary: 'Paiement validé ✅',
//                   detail: 'Votre paiement a été enregistré avec succès.',
//                 });
//                 this.loading = false;
//                 this.paypalVisible.set(false);
//                 this.paymentCompleted.emit();
//               }).catch(() => {
//                 this.messageService.add({
//                   severity: 'error',
//                   summary: 'Paiement échoué ❌',
//                   detail: 'Le paiement a échoué ou a été annulé.',
//                 });
//                 this.loading = false;
//               });
//             }
//             ,

//             onCancel: () => {
//               this.messageService.add({
//                 severity: 'warn',
//                 summary: 'Paiement annulé ❌',
//                 detail: 'Vous avez fermé PayPal avant de valider.',
//               });
//               this.paypalVisible.set(false);
//             },

//             onError: (err: any) => {
//               console.error('PayPal SDK Error:', err);
//               this.messageService.add({
//                 severity: 'error',
//                 summary: 'Erreur PayPal',
//                 detail: 'Une erreur est survenue avec PayPal.',
//               });
//               this.paypalVisible.set(false);
//             }

//           }).render('#paypal-button-container');
//         });
//       },
//       error: () => {
//         this.loading = false;
//         this.messageService.add({
//           severity: 'error',
//           summary: 'Erreur',
//           detail: 'Impossible de créer une commande PayPal.',
//         });
//       }
//     });
//   }

// }
import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../auth/auth.service';
import { SpinnerComponent } from '../../spinner/spinner.component';
import { MessageService } from 'primeng/api';

declare const paypal: any;

@Component({
  selector: 'app-payment-actions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './payment-actions.component.html'
})
export class PaymentActionsComponent {
  loading = false;
  paypalVisible = signal(false);
  @Output() paymentCompleted = new EventEmitter<void>();
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private paymentService = inject(PaymentService);
  private messageService = inject(MessageService);

  form: FormGroup = this.fb.group({
    amount: [null, [Validators.required, Validators.min(1)]],
  });

  get amount() {
    return this.form.get('amount')?.value;
  }

  get isAmountValid() {
    return this.form.valid;
  }

  payWithStripe() {
    if (!this.isAmountValid) return;
    this.loading = true;

    const userId = this.auth.id();
    const amountCents = Math.round(this.amount * 100);

    this.paymentService.createStripeSession(amountCents, userId!).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.url) {
          window.location.href = res.data.url;
        } else {
          this.loading = false;
        }
      },
      error: () => this.loading = false,
    });
  }

  payWithPayPal() {
    if (!this.isAmountValid) return;
    this.loading = true;

    const userId = this.auth.id();
    const amountStr = this.amount.toFixed(2); // PayPal veut un string

    this.paymentService.createPayPalOrder(amountStr, userId!).subscribe({
      next: (order) => {
        this.paypalVisible.set(true);
        setTimeout(() => this.renderPayPalButton(order.id), 0);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur PayPal',
          detail: 'Impossible de créer la commande',
        });
      },
    });
  }

  // ... tout ton code au-dessus ne bouge pas

  private isMobile() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  private isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  private renderPayPalButton(orderId: string) {
    const container = document.getElementById('paypal-button-container');
    if (!container) return;

    container.innerHTML = ''; // Reset si re-cliqué

    paypal.Buttons({
      createOrder: () => orderId,

      onApprove: (data: { orderID: string }) => {
        this.loading = true;
        this.paymentService.capturePayPal(data.orderID).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Paiement réussi',
              detail: 'Votre paiement a été enregistré.',
            });
            this.loading = false;
            this.paypalVisible.set(false);
            this.paymentCompleted.emit();
          },
          error: () => {
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur PayPal',
              detail: 'Le paiement a échoué.',
            });
          },
        });
      },

      onCancel: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Paiement annulé',
          detail: 'Vous avez fermé la fenêtre.',
        });
        this.paypalVisible.set(false);
      },

      onError: (err: any) => {
        console.error('💥 PayPal SDK Error:', err);
        if (this.isMobile() || this.isSafari()) {
          // 🔁 Redirection fallback si Safari mobile
          window.location.href = `https://www.paypal.com/checkoutnow?token=${orderId}`;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur PayPal',
            detail: 'Une erreur est survenue.',
          });
        }
        this.loading = false;
        this.paypalVisible.set(false);
      }
    }).render('#paypal-button-container');
  }

}
