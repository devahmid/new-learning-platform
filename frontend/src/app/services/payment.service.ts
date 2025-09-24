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
    return this.http.get<Payment[]>(`${API_URL}/history?userId=${userId}`);
  }

  createPaymentIntent(userId: number, amount: number) {
    return this.http.post<{ clientSecret: string }>(`${API_URL}/intent`, { userId, amount });
  }
}
