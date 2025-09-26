import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

declare global {
  interface Window {
    SumUpCard: any;
  }
}

@Component({
  selector: 'app-sumup-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sumup-widget-container">
      <div #sumupCard id="sumup-card" class="w-full min-h-[400px] border border-gray-200 rounded-lg p-4"></div>
      
      <!-- Message de chargement -->
      <div *ngIf="loading" class="flex items-center justify-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span class="ml-2 text-gray-600">Chargement du widget de paiement...</span>
      </div>
      
      <!-- Message d'erreur -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-red-800">{{ error }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sumup-widget-container {
      width: 100%;
    }
  `]
})
export class SumupWidgetComponent implements OnInit, OnDestroy {
  @Input() checkoutId: string = '';
  @Input() amount: number = 0;
  @Input() description: string = '';
  
  @Output() paymentSuccess = new EventEmitter<any>();
  @Output() paymentError = new EventEmitter<any>();
  @Output() paymentCancel = new EventEmitter<any>();
  
  @ViewChild('sumupCard', { static: true }) sumupCard!: ElementRef;
  
  loading = true;
  error = '';
  private scriptLoaded = false;

  ngOnInit() {
    this.loadSumUpScript();
  }

  ngOnDestroy() {
    // Nettoyer le widget si nécessaire
  }

  private loadSumUpScript() {
    // Vérifier si le script est déjà chargé
    if (window.SumUpCard) {
      this.initializeWidget();
      return;
    }

    // Charger le script SumUp
    const script = document.createElement('script');
    script.src = 'https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js';
    script.async = true;
    script.onload = () => {
      this.scriptLoaded = true;
      this.initializeWidget();
    };
    script.onerror = () => {
      this.loading = false;
      this.error = 'Erreur lors du chargement du widget SumUp.';
    };
    
    document.head.appendChild(script);
  }

  private initializeWidget() {
    if (!this.checkoutId) {
      this.loading = false;
      this.error = 'ID de checkout manquant.';
      return;
    }

    try {
      // Attendre un peu pour s'assurer que le DOM est prêt
      setTimeout(() => {
        if (window.SumUpCard) {
          window.SumUpCard.mount({
            id: 'sumup-card',
            checkoutId: this.checkoutId,
            onResponse: (type: string, body: any) => {
              this.loading = false;
              
              if (type === 'success') {
                console.log('Paiement SumUp réussi:', body);
                this.paymentSuccess.emit(body);
              } else if (type === 'error') {
                console.error('Erreur paiement SumUp:', body);
                this.error = body.message || 'Erreur lors du paiement.';
                this.paymentError.emit(body);
              } else if (type === 'cancel') {
                console.log('Paiement SumUp annulé:', body);
                this.paymentCancel.emit(body);
              }
            }
          });
        } else {
          this.loading = false;
          this.error = 'Widget SumUp non disponible.';
        }
      }, 100);
      
    } catch (error) {
      console.error('Erreur initialisation widget SumUp:', error);
      this.loading = false;
      this.error = 'Erreur lors de l\'initialisation du widget.';
    }
  }
}
