import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Payment } from '../models/payment.model';
import { ApiPaths } from '../shared/api-paths';

const API_URL = ApiPaths.payments;

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private http: HttpClient) { }

  getPayPalClientId() {
    return this.http.get<{ clientId: string }>(`${API_URL}/paypal-client-id`);
  }

  capturePayPal(orderId: string) {
    return this.http.post(`${API_URL}/paypal-capture`, { orderId });
  }

  createPayPalOrder(amount: number, userId: number) {
    return this.http.get<{ id: string }>(`${API_URL}/paypal?amount=${amount}&userId=${userId}`);
  }

  createStripeSession(amount: number, userId: number) {
    return this.http.post<{ success: boolean; data: { url: string; amount: number; userId: number; description: string; note?: string } }>(`${API_URL}/stripe-session`, { amount, userId });
  }

  getPaymentHistory(userId: number) {
    return this.http.get<{ success: boolean; message: string; data: Payment[] }>(`${API_URL}/history/${userId}`);
  }

  createPaymentIntent(userId: number, amount: number) {
    return this.http.post<{ clientSecret: string }>(`${API_URL}/intent`, { userId, amount });
  }

  // Méthodes SumUp
  createSumUpCheckout(amount: number, userId: number, description?: string) {
    return this.http.post<{
      success: boolean;
      message: string;
      data: {
        checkout_id: string;
        checkout_url: string;
        amount: number;
        currency: string;
        userId: number;
        description: string;
        merchant_code: string;
        status: string;
      }
    }>(`${API_URL}/sumup-checkout`, { 
      amount, 
      userId, 
      currency: 'EUR', 
      description: description || 'Paiement cours' 
    });
  }

  getSumUpCheckoutStatus(checkoutId: string) {
    return this.http.get<{
      success: boolean;
      status: string;
      data: any;
    }>(`${API_URL}/sumup-status/${checkoutId}`);
  }
}
