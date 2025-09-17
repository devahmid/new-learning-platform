import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parent-dashboard.component.html',
  styleUrls: ['./parent-dashboard.component.scss']
})
export class ParentDashboardComponent implements OnInit {
  loading = false;
  children: any[] = [];
  selectedChild: any = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialisation du composant
    this.loadChildren();
  }

  loadChildren(): void {
    // Charger la liste des enfants
    // Cette méthode sera implémentée selon votre logique existante
  }

  selectChild(child: any): void {
    this.selectedChild = child;
  }

  getChildInitials(child: any): string {
    return child?.firstName?.charAt(0) + child?.lastName?.charAt(0) || '??';
  }

  getChildFullName(child: any): string {
    return `${child?.firstName || ''} ${child?.lastName || ''}`.trim();
  }

  getChildAge(child: any): number {
    if (!child?.dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(child.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  getChildLevel(child: any): string {
    // Logique pour déterminer le niveau de l'enfant
    return 'Débutant';
  }

  getChildDetailedStats(child: any): any {
    // Retourner les statistiques détaillées de l'enfant
    return {
      achievements: {
        totalXP: 1250
      }
    };
  }

  /**
   * Naviguer vers le dashboard de progression détaillée
   */
  goToDetailedProgress(childId: number): void {
    this.router.navigate(['/progress/child', childId]);
  }
}
