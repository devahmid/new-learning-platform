export interface Payment {
    id: number;
    amount: number;
    currency: string;
    provider: 'stripe' | 'paypal';
    status: string;
    createdAt: string;
  }
  