export interface Payment {
    id: number;
    userId: number;
    courseId?: number;
    amount: string | number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'expired';
    paymentMethod: 'stripe' | 'paypal' | 'sumup';
    transactionId: string;
    description: string;
    metadata?: string;
    paidAt?: string;
    createdAt: string;
    updatedAt: string;
    user?: {
      id: number;
      email: string;
      phoneNumber: string;
      firstName: string;
      lastName: string;
      dateOfBirth?: string;
      type: string;
      role: string;
      status: string;
      approved_at?: string;
      approved_by?: number;
      rejection_reason?: string;
      parentId?: number;
      classeId?: number;
      createdAt: string;
      updatedAt: string;
    };
  }
  