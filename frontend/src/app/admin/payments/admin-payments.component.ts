import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiPaths } from '../../shared/api-paths';
import { Payment } from '../../models/payment.model';

interface AdminPaymentListResponse {
  success: boolean;
  message: string;
  data: {
    items: Payment[];
    pagination: { total: number; page: number; limit: number; pages: number };
  };
}

interface AdminPaymentStatsResponse {
  success: boolean;
  message: string;
  data: {
    counts: { total: number; completed: number; pending: number };
    revenue: { completed: number };
    byMethod: { paymentMethod: string; c: string | number; s: string | number }[];
  };
}

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-payments.component.html',
  styleUrl: './admin-payments.component.scss'
})
export class AdminPaymentsComponent implements OnInit {
  // Filters
  status: string = '';
  method: string = '';
  userId: string = '';
  from: string = '';
  to: string = '';
  page = 1;
  limit = 25;

  // Data
  payments: Payment[] = [];
  total = 0;
  pages = 0;
  loading = false;
  error: string | null = null;

  // Stats
  stats: AdminPaymentStatsResponse['data'] | null = null;
  statsLoading = false;

  updatingStatus: { [id: number]: boolean } = {};

  readonly statuses = ['pending','completed','failed','cancelled','expired','refunded'];
  readonly methods = ['stripe','paypal','sumup'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPayments();
    this.fetchStats();
  }

  buildQuery(): string {
    const params: string[] = [];
    if (this.status) params.push(`status=${encodeURIComponent(this.status)}`);
    if (this.method) params.push(`method=${encodeURIComponent(this.method)}`);
    if (this.userId) params.push(`userId=${encodeURIComponent(this.userId)}`);
    if (this.from) params.push(`from=${encodeURIComponent(this.from)}`);
    if (this.to) params.push(`to=${encodeURIComponent(this.to)}`);
    params.push(`page=${this.page}`);
    params.push(`limit=${this.limit}`);
    return params.join('&');
  }

  fetchPayments(): void {
    this.loading = true;
    this.error = null;
    
    console.log('Récupération des paiements via le nouvel endpoint admin');
    
    this.http.get<any>(`https://centre-culturel-olivier.fr/api/admin/payments?${this.buildQuery()}`)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.payments = response.data.items || [];
            this.total = response.data.pagination?.total || 0;
            this.pages = response.data.pagination?.pages || 1;
            this.loading = false;
            console.log(`✅ ${this.payments.length} paiements récupérés sur ${this.total} total`);
          } else {
            this.error = response.message || 'Erreur lors de la récupération des paiements';
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des paiements:', error);
          this.error = 'Erreur lors de la récupération des paiements';
          this.loading = false;
        }
      });
  }

  fetchStats(): void {
    this.statsLoading = true;
    
    console.log('Récupération des statistiques via le nouvel endpoint admin');
    
    const params = [];
    if (this.from) params.push(`from=${this.from}`);
    if (this.to) params.push(`to=${this.to}`);
    
    this.http.get<any>(`https://centre-culturel-olivier.fr/api/admin/payments/stats?${params.join('&')}`)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.stats = response.data;
            this.statsLoading = false;
            console.log('✅ Statistiques récupérées:', this.stats);
          } else {
            console.error('Erreur lors de la récupération des statistiques:', response.message);
            this.statsLoading = false;
          }
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des statistiques:', error);
          this.statsLoading = false;
        }
      });
  }

  resetFilters(): void {
    this.status=''; this.method=''; this.userId=''; this.from=''; this.to=''; this.page=1; this.fetchPayments(); this.fetchStats();
  }

  changePage(p: number) { if (p>=1 && p<=this.pages){ this.page = p; this.fetchPayments(); } }

  updateStatus(payment: Payment, newStatus: string) {
    if (!payment || payment.status === newStatus) return;
    this.updatingStatus[payment.id] = true;
    this.http.patch(`https://centre-culturel-olivier.fr/api/admin/payments/${payment.id}/status`, { status: newStatus })
      .subscribe({
        next: (res: any) => {
          if (res.success) payment.status = res.data.status || newStatus;
          this.updatingStatus[payment.id] = false;
        },
        error: err => { console.error(err); this.updatingStatus[payment.id] = false; }
      });
  }

  formatAmount(a: string|number): string { const n = typeof a==='string'? parseFloat(a): a; return n.toFixed(2)+' €'; }
  formatDate(d?: string) { return d ? new Date(d).toLocaleString('fr-FR') : '—'; }
}
