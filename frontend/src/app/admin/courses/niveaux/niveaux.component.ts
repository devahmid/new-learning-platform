import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../admin.service';

interface Level {
  id?: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  courseCount?: number;
}

@Component({
  selector: 'app-niveaux',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './niveaux.component.html',
  styleUrl: './niveaux.component.scss',
})
export class NiveauxComponent implements OnInit {
  levels: Level[] = [];
  newLevel: Level = { name: '', description: '' };
  editId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  hasError = false;
  errorMessage = '';
  searchTerm = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadLevels();
  }

  async loadLevels() {
    try {
      this.isLoading = true;
      this.hasError = false;

      // Charger les niveaux depuis l'API
      const levels = await this.adminService.getLevels().toPromise();
      this.levels = levels || [];
      this.totalItems = this.levels.length;
    } catch (error) {
      console.error('Erreur API, utilisation des données par défaut:', error);
      // Fallback vers les données par défaut
      this.levels = [
        {
          id: 1,
          name: 'Débutant',
          description: "Niveau d'introduction",
          courseCount: 12,
        },
        {
          id: 2,
          name: 'Intermédiaire',
          description: 'Niveau moyen',
          courseCount: 8,
        },
        { id: 3, name: 'Avancé', description: 'Niveau expert', courseCount: 5 },
      ];
      this.totalItems = this.levels.length;
      this.hasError = true;
      this.errorMessage =
        "Erreur lors du chargement depuis l'API, utilisation des données par défaut";
    } finally {
      this.isLoading = false;
    }
  }

  // 🔍 Filtrage des niveaux
  get filteredLevels(): Level[] {
    if (!this.searchTerm) return this.levels;
    return this.levels.filter(
      (level) =>
        level.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (level.description &&
          level.description
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()))
    );
  }

  // 📄 Pagination
  get paginatedLevels(): Level[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredLevels.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredLevels.length / this.itemsPerPage);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  // 💾 Sauvegarder un niveau
  async save() {
    if (!this.newLevel.name.trim()) {
      this.hasError = true;
      this.errorMessage = 'Le nom du niveau est requis';
      return;
    }

    try {
      this.isSubmitting = true;
      this.hasError = false;

      if (this.editId) {
        // Mise à jour
        await this.adminService
          .updateLevel(this.editId, this.newLevel)
          .toPromise();
        console.log('Niveau mis à jour avec succès');
      } else {
        // Création
        await this.adminService.createLevel(this.newLevel).toPromise();
        console.log('Niveau créé avec succès');
      }

      this.reset();
      await this.loadLevels();
    } catch (error) {
      this.hasError = true;
      this.errorMessage =
        'Erreur lors de la sauvegarde: ' + (error as any)?.message ||
        'Erreur inconnue';
      console.error('Erreur save:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  // ✏️ Éditer un niveau
  edit(level: Level) {
    this.newLevel = { ...level };
    this.editId = level.id!;
  }

  // 🗑️ Supprimer un niveau
  async remove(level: Level) {
    if (
      !confirm(`Êtes-vous sûr de vouloir supprimer le niveau "${level.name}" ?`)
    ) {
      return;
    }

    try {
      if (level.id) {
        await this.adminService.deleteLevel(level.id).toPromise();
        console.log('Niveau supprimé avec succès');
        await this.loadLevels();
      }
    } catch (error) {
      this.hasError = true;
      this.errorMessage =
        'Erreur lors de la suppression: ' + (error as any)?.message ||
        'Erreur inconnue';
      console.error('Erreur remove:', error);
    }
  }

  // 🔄 Réinitialiser le formulaire
  reset() {
    this.newLevel = { name: '', description: '' };
    this.editId = null;
    this.hasError = false;
    this.errorMessage = '';
  }

  // 🎨 Classes CSS pour les badges de niveau
  getLevelBadgeClass(levelName: string): string {
    switch (levelName.toLowerCase()) {
      case 'débutant':
      case 'debutant':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermédiaire':
      case 'intermediaire':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'avancé':
      case 'avance':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }

  // 📊 Helper pour la pagination
  getEndItem(): number {
    return Math.min(
      this.currentPage * this.itemsPerPage,
      this.filteredLevels.length
    );
  }
}
