import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminFeedbackService, FeedbackRow } from './admin-feedback.service';

type MetricKey =
  | 'overall'
  | 'navigation'
  | 'clarity'
  | 'design'
  | 'mobile'
  | 'speed'
  | 'trust';

type Metric = { key: MetricKey; label: string; color: string };

type Distribution = Record<1 | 2 | 3 | 4 | 5, number>;

@Component({
  selector: 'app-admin-feedback',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-feedback.component.html',
  styleUrl: './admin-feedback.component.scss',
})
export class AdminFeedbackComponent implements OnInit {
  isLoading = false;
  hasError = false;
  errorMessage = '';

  items: FeedbackRow[] = [];

  readonly buckets: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5];

  readonly metrics: Metric[] = [
    { key: 'overall', label: 'Global', color: 'from-emerald-500 to-emerald-600' },
    { key: 'navigation', label: 'Navigation', color: 'from-blue-500 to-blue-600' },
    { key: 'clarity', label: 'Clarté', color: 'from-indigo-500 to-indigo-600' },
    { key: 'design', label: 'Design', color: 'from-purple-500 to-purple-600' },
    { key: 'mobile', label: 'Mobile', color: 'from-teal-500 to-teal-600' },
    { key: 'speed', label: 'Rapidité', color: 'from-amber-500 to-amber-600' },
    { key: 'trust', label: 'Confiance', color: 'from-rose-500 to-rose-600' },
  ];

  constructor(private feedback: AdminFeedbackService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.feedback.list().subscribe({
      next: (rows) => {
        this.items = (rows ?? []).slice().sort((a, b) => {
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage =
          "Impossible de charger les avis pour le moment. Réessayez plus tard.";
      },
    });
  }

  get total(): number {
    return this.items.length;
  }

  avg(key: MetricKey): number {
    const values = this.items.map((i) => i[key]).filter((v) => typeof v === 'number');
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }

  avgLabel(value: number): string {
    if (!value) return '—';
    if (value >= 4.6) return 'Excellent';
    if (value >= 4.0) return 'Très bien';
    if (value >= 3.3) return 'Bien';
    if (value >= 2.6) return 'Moyen';
    if (value >= 2.0) return 'Faible';
    return 'Critique';
  }

  distribution(key: MetricKey): Distribution {
    const dist: Distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of this.items) {
      const v = row[key] as number;
      if (v >= 1 && v <= 5) dist[v as 1 | 2 | 3 | 4 | 5] += 1;
    }
    return dist;
  }

  pct(count: number): number {
    if (!this.total) return 0;
    return (count / this.total) * 100;
  }

  get npsCount(): number {
    return this.items.filter((i) => i.nps !== null && i.nps !== undefined).length;
  }

  get npsPromoters(): number {
    return this.items.filter((i) => i.nps !== null && i.nps >= 9).length;
  }

  get npsPassives(): number {
    return this.items.filter((i) => i.nps !== null && i.nps >= 7 && i.nps <= 8).length;
  }

  get npsDetractors(): number {
    return this.items.filter((i) => i.nps !== null && i.nps <= 6).length;
  }

  get npsScore(): number {
    if (!this.npsCount) return 0;
    const promotersPct = (this.npsPromoters / this.npsCount) * 100;
    const detractorsPct = (this.npsDetractors / this.npsCount) * 100;
    return Math.round(promotersPct - detractorsPct);
  }

  get insights(): string[] {
    if (!this.total) return [];

    const entries = this.metrics.map((m) => ({ m, avg: this.avg(m.key) }));
    const sorted = entries.slice().sort((a, b) => a.avg - b.avg);
    const worst = sorted[0];
    const best = sorted[sorted.length - 1];

    const insights: string[] = [];
    insights.push(
      `Point fort : ${best.m.label} (${best.avg.toFixed(1)}/5 — ${this.avgLabel(best.avg)}).`
    );
    insights.push(
      `Priorité d’amélioration : ${worst.m.label} (${worst.avg.toFixed(1)}/5 — ${this.avgLabel(worst.avg)}).`
    );

    if (this.npsCount >= 5) {
      insights.push(
        `Recommandation (NPS) : ${this.npsScore} (sur ${this.npsCount} réponses).`
      );
    }

    const commentCount = this.items.filter((i) => (i.improvement ?? '').trim()).length;
    if (commentCount) {
      insights.push(
        `${commentCount} avis contiennent un commentaire “amélioration prioritaire”.`
      );
    }
    return insights;
  }

  latestComments(limit = 8): FeedbackRow[] {
    return this.items
      .filter((i) => (i.improvement ?? '').trim().length > 0)
      .slice(0, limit);
  }
}

