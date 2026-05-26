import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegistrationService } from '../../services/registration.service';
import { Child, ParentRegistration } from '../../models/parent-registration.model';

interface ChildFlatRow {
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  requestType?: string;
  schoolYear?: string;
  status?: string;
  childFirstName: string;
  childLastName: string;
  childBirthDate: string;
  childArabicLevel: number | null;
  childActivityDetails: string;
  [key: string]: string | number | null | undefined;
}

@Component({
  selector: 'app-reinscription-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reinscription-admin.component.html',
  styleUrls: ['./reinscription-admin.component.scss']
})
export class ReinscriptionAdminComponent implements OnInit {
  reinscriptions: ParentRegistration[] = [];
  filtered: ParentRegistration[] = [];
  schoolYears: string[] = [];
  search = '';
  filterStatus = '';
  filterYear = '';
  filterRequestType = '';
  filterLevel = '';
  viewMode: 'parents' | 'children' = 'parents';

  childrenFlat: ChildFlatRow[] = [];
  filteredChildren: ChildFlatRow[] = [];
  childSortKey = '';
  childSortDir = 1;

  totalParents = 0;
  totalChildren = 0;
  pendingCount = 0;
  levels: string[] = [];
  childrenByLevel: Record<string, { parents: number; children: number }> = {};
  levelCapacity: Record<string, number> = {};
  defaultCapacity = 12;
  levelStats: Array<{ level: string; parents: number; children: number; capacity: number; percent: number; cls: string }> = [];

  private expandedIds = new Set<number>();

  constructor(private registrationService: RegistrationService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.registrationService.getAll().subscribe(data => {
      this.reinscriptions = data.map(r => ({
        ...r,
        children: r.children ?? []
      }));
      this.schoolYears = [
        ...new Set(
          this.reinscriptions
            .map(r => r.schoolYear)
            .filter((y): y is string => !!y)
        )
      ].sort();
      this.computeStats();
      this.buildChildrenFlat();
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const s = this.search.trim().toLowerCase();
    this.filtered = this.reinscriptions.filter(r => {
      if (this.filterStatus && r.status !== this.filterStatus) return false;
      if (this.filterYear && r.schoolYear !== this.filterYear) return false;
      if (this.filterRequestType && r.requestType !== this.filterRequestType) return false;
      if (this.filterLevel) {
        const lvl = Number(this.filterLevel);
        if (!r.children?.some(c => (c.arabicLevel ?? 0) === lvl)) return false;
      }
      if (!s) return true;
      const hay = [r.fullName, r.email, r.phone, r.notes ?? ''].join(' ').toLowerCase();
      if (hay.includes(s)) return true;
      return !!r.children?.some(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(s)
      );
    });
    this.applyChildFilters();
  }

  applyChildFilters(): void {
    const s = this.search.trim().toLowerCase();
    this.filteredChildren = this.childrenFlat.filter(c => {
      if (this.filterStatus && c.status !== this.filterStatus) return false;
      if (this.filterYear && c.schoolYear !== this.filterYear) return false;
      if (this.filterRequestType && c.requestType !== this.filterRequestType) return false;
      if (this.filterLevel) {
        const lvl = Number(this.filterLevel);
        if ((c.childArabicLevel ?? 0) !== lvl) return false;
      }
      if (!s) return true;
      const hay = [c.parentName, c.parentEmail, c.parentPhone, c.childFirstName, c.childLastName]
        .join(' ')
        .toLowerCase();
      return hay.includes(s);
    });
    if (this.childSortKey) {
      const key = this.childSortKey;
      const dir = this.childSortDir;
      this.filteredChildren.sort((a, b) => {
        const A = (a[key] ?? '').toString();
        const B = (b[key] ?? '').toString();
        return A.localeCompare(B) * dir;
      });
    }
  }

  sortChildren(key: string): void {
    if (this.childSortKey === key) {
      this.childSortDir = -this.childSortDir;
    } else {
      this.childSortKey = key;
      this.childSortDir = 1;
    }
    this.applyChildFilters();
  }

  clearFilters(): void {
    this.search = '';
    this.filterStatus = '';
    this.filterYear = '';
    this.filterRequestType = '';
    this.applyFilters();
  }

  toggleExpand(id: number): void {
    if (this.expandedIds.has(id)) {
      this.expandedIds.delete(id);
    } else {
      this.expandedIds.add(id);
    }
  }

  isExpanded(id: number): boolean {
    return this.expandedIds.has(id);
  }

  setStatus(id: number, status: string): void {
    const item = this.reinscriptions.find(r => r.id === id);
    if (item) {
      item.status = status;
      this.buildChildrenFlat();
      this.applyFilters();
      this.computeStats();
    }
  }

  exportCSV(): void {
    if (this.viewMode === 'children') {
      this.downloadCsv(
        'reinscriptions_children.csv',
        this.filteredChildren.map(c => this.childRowToCsv(c))
      );
      return;
    }

    const rows: string[][] = [];
    this.filtered.forEach(r => {
      if (r.children?.length) {
        r.children.forEach(c => rows.push(this.parentChildRowToCsv(r, c)));
      } else {
        rows.push(this.parentChildRowToCsv(r, null));
      }
    });
    this.downloadCsv('reinscriptions.csv', rows);
  }

  exportChildren(): void {
    this.buildChildrenFlat();
    this.applyChildFilters();
    const prev = this.viewMode;
    this.viewMode = 'children';
    try {
      this.exportCSV();
    } finally {
      this.viewMode = prev;
    }
  }

  private buildChildrenFlat(): void {
    this.childrenFlat = [];
    for (const r of this.reinscriptions) {
      for (const c of r.children ?? []) {
        this.childrenFlat.push(this.toChildFlat(r, c));
      }
    }
  }

  private computeStats(): void {
    this.totalParents = this.reinscriptions.length;
    this.totalChildren = this.reinscriptions.reduce(
      (sum, r) => sum + (r.children?.length ?? 0),
      0
    );
    this.pendingCount = this.reinscriptions.filter(r => r.status === 'pending').length;

    const levelSet = new Set<string>();
    this.childrenByLevel = {};

    for (const r of this.reinscriptions) {
      const levelsInParent = new Set<number>();
      for (const c of r.children ?? []) {
        const key = String(c.arabicLevel ?? 0);
        levelSet.add(key);
        if (!this.childrenByLevel[key]) {
          this.childrenByLevel[key] = { parents: 0, children: 0 };
        }
        this.childrenByLevel[key].children++;
        levelsInParent.add(c.arabicLevel ?? 0);
      }
      for (const lvl of levelsInParent) {
        const key = String(lvl);
        if (!this.childrenByLevel[key]) {
          this.childrenByLevel[key] = { parents: 0, children: 0 };
        }
        this.childrenByLevel[key].parents++;
      }
    }

    this.levels = [...levelSet].sort((a, b) => Number(a) - Number(b));
    this.levelStats = this.levels.map(level => {
      const info = this.childrenByLevel[level] ?? { parents: 0, children: 0 };
      const capacity = this.levelCapacity[level] ?? this.defaultCapacity;
      const percent = capacity > 0
        ? Math.min(100, Math.round((info.children / capacity) * 100))
        : 0;
      let cls = 'low';
      if (percent >= 90) cls = 'full';
      else if (percent >= 70) cls = 'high';
      else if (percent >= 40) cls = 'mid';
      return {
        level,
        parents: info.parents,
        children: info.children,
        capacity,
        percent,
        cls
      };
    });
  }

  private toChildFlat(r: ParentRegistration, c: Child): ChildFlatRow {
    return {
      parentName: r.fullName,
      parentEmail: r.email,
      parentPhone: r.phone,
      requestType: r.requestType,
      schoolYear: r.schoolYear,
      status: r.status,
      childFirstName: c.firstName,
      childLastName: c.lastName,
      childBirthDate: c.birthDate,
      childArabicLevel: c.arabicLevel ?? null,
      childActivityDetails: c.activityDetails
    };
  }

  private parentChildRowToCsv(r: ParentRegistration, c: Child | null): string[] {
    return [
      r.fullName ?? '',
      r.email ?? '',
      r.phone ?? '',
      r.requestType ?? '',
      r.schoolYear ?? '',
      r.status ?? '',
      c?.firstName ?? '',
      c?.lastName ?? '',
      c?.birthDate ?? '',
      c?.arabicLevel != null ? String(c.arabicLevel) : '',
      c?.activityDetails ?? ''
    ];
  }

  private childRowToCsv(c: ChildFlatRow): string[] {
    return [
      c.parentName,
      c.parentEmail,
      c.parentPhone,
      c.requestType ?? '',
      c.schoolYear ?? '',
      c.status ?? '',
      c.childFirstName,
      c.childLastName,
      c.childBirthDate,
      c.childArabicLevel != null ? String(c.childArabicLevel) : '',
      c.childActivityDetails
    ];
  }

  private downloadCsv(filename: string, rows: string[][]): void {
    const headers = [
      'Parent', 'Email', 'Phone', 'RequestType', 'SchoolYear', 'Status',
      'ChildFirstName', 'ChildLastName', 'ChildBirthDate', 'ChildArabicLevel', 'ChildActivityDetails'
    ];
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${(cell ?? '').toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
