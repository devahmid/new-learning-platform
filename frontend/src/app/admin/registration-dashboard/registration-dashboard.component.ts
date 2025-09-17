import { Component, OnInit } from '@angular/core';
import { RegistrationService } from '../../services/registration.service';
import { ParentRegistration } from '../../models/parent-registration.model';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


@Component({
  selector: 'app-registration-dashboard',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule,],
  templateUrl: './registration-dashboard.component.html',
  styleUrl: './registration-dashboard.component.scss'
})
export class RegistrationDashboardComponent implements OnInit {
  registrations: ParentRegistration[] = [];

  arabicLevelsMap: Record<number, string> = {
    1: '1 : Débutant (ne sait ni lire ni écrire)',
    2: '2 : Commence à lire',
    3: '3 : Sait lire et écrire, apprend du vocabulaire',
    4: '4 : Apprend la grammaire et du nouveau vocabulaire',
    5: '5 : Lit et écrit couramment, apprend la grammaire et du nouveau vocabulaire',
  };



  constructor(private registrationService: RegistrationService) { }

  ngOnInit(): void {
    this.registrationService.getAll().subscribe(data => {
      this.registrations = data;
    });
  }


  exportPDF() {
    const doc = new jsPDF();

    const data = this.registrations.map(reg => [
      reg.fullName,
      reg.email,
      reg.phone,
      reg.children.map(c => `${c.firstName} ${c.lastName} (${this.arabicLevelsMap[c.arabicLevel]})`).join('\n'),
      reg.acceptedConditions ? '✔️' : '❌',
    ]);

    autoTable(doc, {
      head: [['Parent', 'Email', 'Téléphone', 'Enfants', 'Conditions']],
      body: data,
    });

    doc.save('inscriptions.pdf');
  }

  exportCSV() {
    const headers = ['Parent', 'Email', 'Téléphone', 'Enfants', 'Conditions'];
    const rows = this.registrations.map(reg => [
      reg.fullName,
      reg.email,
      reg.phone,
      reg.children.map(c => `${c.firstName} ${c.lastName} (${this.arabicLevelsMap[c.arabicLevel]})`).join('; '),
      reg.acceptedConditions ? 'Oui' : 'Non'
    ]);

    const csvContent = [headers, ...rows].map(e => e.map(x => `"${x}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'inscriptions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getChildrenStatsByLevel(): { level: number; label: string; count: number }[] {
    const uniqueChildren = new Map<string, any>();

    this.registrations.forEach(reg => {
      reg.children.forEach(child => {
        const key = `${child.firstName.trim().toLowerCase()}-${child.lastName.trim().toLowerCase()}-${child.birthDate}`;
        if (!uniqueChildren.has(key)) {
          uniqueChildren.set(key, child);
        }
      });
    });

    const grouped = new Map<number, number>();

    Array.from(uniqueChildren.values()).forEach(child => {
      grouped.set(child.arabicLevel, (grouped.get(child.arabicLevel) || 0) + 1);
    });

    return Object.entries(this.arabicLevelsMap).map(([level, label]) => ({
      level: +level,
      label,
      count: grouped.get(+level) || 0
    }));
  }


  getChildrenTotalCount(): number {
    return this.getChildrenStatsByLevel().reduce((sum, stat) => sum + stat.count, 0);
  }


}
