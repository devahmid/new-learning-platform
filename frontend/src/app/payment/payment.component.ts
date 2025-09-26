import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../services/payment.service';
import { AuthService } from '../auth/auth.service';
import { SpinnerComponent } from '../spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaypalPaymentComponent } from './components/paypal-payment.component';
import { SumupWidgetComponent } from './components/sumup-widget.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, FormsModule, PaypalPaymentComponent, SumupWidgetComponent],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">💳 Paiement sécurisé</h1>
          <p class="mt-2 text-gray-600">Choisissez votre méthode de paiement préférée</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Formulaire de paiement -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Détails du paiement</h2>
            
            <form class="space-y-6" (ngSubmit)="onSubmit()">
              <!-- Montant -->
              <div>
                <label for="amount" class="block text-sm font-medium text-gray-700 mb-2">
                  Montant (€)
                </label>
                <input
                  id="amount"
                  type="number"
                  [(ngModel)]="amount"
                  name="amount"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 25.00"
                  min="0.01"
                  step="0.01"
                  [disabled]="loading"
                  required>
              </div>

              <!-- Description -->
              <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  id="description"
                  type="text"
                  [(ngModel)]="description"
                  name="description"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Paiement cours"
                  [disabled]="loading">
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email de facturation
                  <span *ngIf="email" class="text-xs text-green-600 ml-1">(pré-rempli depuis votre compte)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre@email.com"
                  [disabled]="loading"
                  required>
                <p *ngIf="email" class="mt-1 text-xs text-gray-500">
                  Email récupéré depuis votre compte connecté
                </p>
              </div>
            </form>
          </div>

          <!-- Méthodes de paiement -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Méthodes de paiement</h2>
            
            <div class="space-y-4">
              <!-- Stripe - Paiement par carte bancaire -->
              <button 
                (click)="payWithStripe()"
                [disabled]="loading || !isFormValid()"
                class="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.274 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.407-2.354 1.407-1.852 0-4.963-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                      </svg>
                    </div>
                    <div class="text-left">
                      <div class="font-semibold text-gray-900">Carte Bancaire</div>
                      <div class="text-sm text-gray-500">Paiement sécurisé en ligne</div>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <app-spinner [loading]="loading && paymentMethod === 'stripe'"></app-spinner>
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </button>

              <!-- SumUp -->
              <button 
                (click)="payWithSumUp()"
                [disabled]="loading || !isFormValid()"
                class="w-full p-4 border-2 border-green-200 rounded-lg hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div class="text-left">
                      <div class="font-semibold text-gray-900">SumUp</div>
                      <div class="text-sm text-gray-500">Paiement par carte bancaire</div>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <app-spinner [loading]="loading && paymentMethod === 'sumup'"></app-spinner>
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </button>

              <!-- PayPal -->
              <button 
                (click)="payWithPayPal()"
                [disabled]="loading || !isFormValid()"
                class="w-full p-4 border-2 border-yellow-200 rounded-lg hover:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.105-.633c-.89-4.09-3.623-5.797-7.44-5.797H6.283a.641.641 0 0 0-.633.74l-2.41 15.3h4.644l1.12-7.106a.641.641 0 0 1 .633-.74h2.19c4.298 0 7.664-1.747 8.647-6.797.03-.149.054-.294.077-.437z"/>
                      </svg>
                    </div>
                    <div class="text-left">
                      <div class="font-semibold text-gray-900">PayPal</div>
                      <div class="text-sm text-gray-500">Paiement via PayPal</div>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <app-spinner [loading]="loading && paymentMethod === 'paypal'"></app-spinner>
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </button>
            </div>

                <!-- Widget SumUp -->
                <div *ngIf="showSumUpWidget" class="mt-6">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Finaliser avec SumUp</h3>
                  <app-sumup-widget
                    [checkoutId]="sumupCheckoutId"
                    [amount]="amount"
                    [description]="description"
                    (paymentSuccess)="onSumUpSuccess($event)"
                    (paymentError)="onSumUpError($event)"
                    (paymentCancel)="onSumUpCancel($event)">
                  </app-sumup-widget>
                </div>

                <!-- Bouton PayPal -->
                <div *ngIf="showPayPalButton" class="mt-6">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Finaliser avec PayPal</h3>
                  <app-paypal-payment
                    [amount]="amount * 100"
                    [description]="description"
                    [clientId]="paypalClientId"
                    (paymentSuccess)="onPayPalSuccess($event)"
                    (paymentError)="onPayPalError($event)"
                    (paymentCancel)="onPayPalCancel($event)">
                  </app-paypal-payment>
                </div>

            <!-- Informations de sécurité -->
            <div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
                </svg>
                <div class="text-sm text-green-800">
                  <p class="font-medium">Paiement 100% sécurisé</p>
                  <p class="mt-1">Vos données sont protégées par un cryptage SSL et nos partenaires de confiance (Stripe, SumUp, PayPal).</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Messages d'erreur -->
        <div *ngIf="errorMessage" class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex">
            <svg class="w-5 h-5 text-red-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <h3 class="text-sm font-medium text-red-800">Erreur de paiement</h3>
              <p class="mt-1 text-sm text-red-700">{{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Message de succès -->
        <div *ngIf="successMessage" class="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex">
            <svg class="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <h3 class="text-sm font-medium text-green-800">Paiement initié</h3>
              <p class="mt-1 text-sm text-green-700">{{ successMessage }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentComponent implements OnInit {
  loading = false;
  paymentMethod: string = '';
  amount: number = 0;
  description: string = 'Paiement cours';
  email: string = '';
  userId: number = 0;
  errorMessage = '';
  successMessage = '';
  paypalClientId = '';
  showPayPalButton = false;
  sumupCheckoutId = '';
  showSumUpWidget = false;

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // Récupérer les informations de l'utilisateur connecté
    this.loadUserInfo();
  }

  private loadUserInfo() {
    try {
      // Récupérer l'ID utilisateur
      this.userId = this.authService.id() || 0;
      
      // Récupérer l'email utilisateur
      const userEmail = this.authService.email();
      if (userEmail) {
        this.email = userEmail;
      }
      
      // Récupérer le nom complet pour la description
      const fullName = this.authService.fullName();
      if (fullName) {
        this.description = `Paiement cours - ${fullName}`;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des informations utilisateur:', error);
      // Valeurs par défaut en cas d'erreur
      this.userId = 0;
      this.email = '';
    }
  }

  isFormValid(): boolean {
    return this.amount > 0 && !!this.email && this.email.includes('@');
  }

  onSubmit() {
    // Cette méthode est appelée par le formulaire mais nous gérons les clics de boutons séparément
  }

  payWithStripe() {
    if (!this.isFormValid()) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.loading = true;
    this.paymentMethod = 'stripe';
    this.errorMessage = '';
    this.successMessage = '';

    // Convertir en centimes pour Stripe
    const amountInCents = Math.round(this.amount * 100);

    this.paymentService.createStripeSession(amountInCents, this.userId).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.url) {
          this.successMessage = 'Redirection vers Stripe...';
          // Rediriger vers Stripe
          setTimeout(() => {
            window.location.href = res.data.url;
          }, 1000);
        } else {
          this.errorMessage = 'Erreur lors de la création de la session Stripe.';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Erreur Stripe:', error);
        this.errorMessage = error.error?.message || 'Erreur lors du paiement Stripe.';
        this.loading = false;
      }
    });
  }

  payWithSumUp() {
    if (!this.isFormValid()) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.loading = true;
    this.paymentMethod = 'sumup';
    this.errorMessage = '';
    this.successMessage = '';

    // Convertir en euros pour SumUp (pas de centimes)
    const amountInEuros = this.amount;

    this.paymentService.createSumUpCheckout(amountInEuros, this.userId, this.description).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.checkout_id) {
          this.sumupCheckoutId = res.data.checkout_id;
          this.showSumUpWidget = true;
          this.successMessage = 'Widget de paiement SumUp initialisé.';
          this.loading = false;
        } else {
          this.errorMessage = 'Erreur lors de la création du checkout SumUp.';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Erreur SumUp:', error);
        this.errorMessage = error.error?.message || 'Erreur lors du paiement SumUp.';
        this.loading = false;
      }
    });
  }

  payWithPayPal() {
    if (!this.isFormValid()) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.loading = true;
    this.paymentMethod = 'paypal';
    this.errorMessage = '';
    this.successMessage = '';

    this.paymentService.getPayPalClientId().subscribe({
      next: ({ clientId }) => {
        this.paypalClientId = clientId;
        this.showPayPalButton = true;
        this.successMessage = 'PayPal initialisé. Cliquez sur le bouton PayPal ci-dessous.';
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur PayPal:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de l\'initialisation PayPal.';
        this.loading = false;
      }
    });
  }

  onPayPalSuccess(event: any) {
    console.log('PayPal Success:', event);
    this.loading = true;
    
    // Utiliser l'order ID de PayPal directement
    const paypalOrderId = event.orderId;
    console.log('PayPal Order ID:', paypalOrderId);
    
    if (!paypalOrderId) {
      console.error('PayPal Order ID is missing');
      this.errorMessage = 'Erreur: Order ID PayPal manquant.';
      this.loading = false;
      return;
    }
    
    // Créer un paiement en base avec l'order ID de PayPal
    this.paymentService.createPayPalOrder(this.amount, this.userId, paypalOrderId).subscribe({
      next: (orderResponse) => {
        console.log('PayPal Order created in DB:', orderResponse);
        
        // Le paiement PayPal est déjà complet, pas besoin de capture
        this.successMessage = 'Paiement PayPal réussi et enregistré !';
        this.errorMessage = '';
        this.showPayPalButton = false;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur création order PayPal:', error);
        this.errorMessage = 'Erreur lors de la création du paiement PayPal.';
        this.loading = false;
      }
    });
  }

  onPayPalError(event: any) {
    console.error('PayPal Error:', event);
    this.errorMessage = 'Erreur lors du paiement PayPal.';
    this.successMessage = '';
  }

  onPayPalCancel(event: any) {
    console.log('PayPal Cancel:', event);
    this.errorMessage = 'Paiement PayPal annulé.';
    this.successMessage = '';
  }

  onSumUpSuccess(event: any) {
    console.log('SumUp Success:', event);
    this.successMessage = 'Paiement SumUp réussi !';
    this.errorMessage = '';
    this.showSumUpWidget = false;
    // TODO: Traiter le paiement réussi
  }

  onSumUpError(event: any) {
    console.error('SumUp Error:', event);
    this.errorMessage = 'Erreur lors du paiement SumUp.';
    this.successMessage = '';
  }

  onSumUpCancel(event: any) {
    console.log('SumUp Cancel:', event);
    this.errorMessage = 'Paiement SumUp annulé.';
    this.successMessage = '';
  }
}