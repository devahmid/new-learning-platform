import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-12"
    >
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            🎓 Administration des Cours
          </h1>
          <p class="text-xl text-gray-600">
            Interface complète de gestion des cours avec exemples
          </p>
        </div>

        <!-- Navigation rapide -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <!-- Gestion des cours -->
          <div
            class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div class="text-center mb-4">
              <span class="text-4xl">📚</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Gestion des Cours
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Créez, modifiez et gérez tous vos cours
            </p>
            <button
              (click)="router.navigate(['/admin/courses'])"
              class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Accéder
            </button>
          </div>

          <!-- Cours populaires -->
          <div
            class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div class="text-center mb-4">
              <span class="text-4xl">⭐</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Cours Populaires
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Analysez les cours les plus suivis
            </p>
            <button
              (click)="router.navigate(['/admin/courses/populaires'])"
              class="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
            >
              Accéder
            </button>
          </div>

          <!-- Ajout de cours -->
          <div
            class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div class="text-center mb-4">
              <span class="text-4xl">➕</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Nouveau Cours
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Créez un nouveau cours avec leçons et quiz
            </p>
            <button
              (click)="router.navigate(['/admin/courses/ajout'])"
              class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Créer
            </button>
          </div>
        </div>

        <!-- Fonctionnalités principales -->
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            🚀 Fonctionnalités Principales
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Gestion des cours -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                📚 Gestion des Cours
              </h3>
              <ul class="space-y-2 text-sm text-gray-600">
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Création et modification de cours
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Gestion des catégories et niveaux
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Ajout de leçons et quiz
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Suivi des inscriptions
                </li>
              </ul>
            </div>

            <!-- Analytics et statistiques -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                📊 Analytics et Statistiques
              </h3>
              <ul class="space-y-2 text-sm text-gray-600">
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Cours les plus populaires
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Taux de complétion
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Notes et évaluations
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Tendances des inscriptions
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Exemples de cours -->
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            📖 Exemples de Cours Disponibles
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Cours Arabe -->
            <div
              class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div class="flex items-center mb-4">
                <div
                  class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3"
                >
                  <span class="text-2xl">📖</span>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">Arabe Classique</h4>
                  <p class="text-sm text-gray-600">Niveau Débutant</p>
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-4">
                Apprenez les bases de l'arabe classique avec des leçons
                progressives.
              </p>
              <div
                class="flex items-center justify-between text-sm text-gray-500"
              >
                <span>👥 156 élèves</span>
                <span>⭐ 4.8/5</span>
              </div>
            </div>

            <!-- Cours Religion -->
            <div
              class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div class="flex items-center mb-4">
                <div
                  class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3"
                >
                  <span class="text-2xl">🕌</span>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">Fiqh Islamique</h4>
                  <p class="text-sm text-gray-600">Niveau Avancé</p>
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-4">
                Étudiez les principes de la jurisprudence islamique.
              </p>
              <div
                class="flex items-center justify-between text-sm text-gray-500"
              >
                <span>👥 87 élèves</span>
                <span>⭐ 4.9/5</span>
              </div>
            </div>

            <!-- Cours Calligraphie -->
            <div
              class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div class="flex items-center mb-4">
                <div
                  class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-3"
                >
                  <span class="text-2xl">✒️</span>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">
                    Calligraphie Arabe
                  </h4>
                  <p class="text-sm text-gray-600">Niveau Débutant</p>
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-4">
                Découvrez l'art de la calligraphie arabe.
              </p>
              <div
                class="flex items-center justify-between text-sm text-gray-500"
              >
                <span>👥 134 élèves</span>
                <span>⭐ 4.7/5</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Instructions d'utilisation -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            📚 Comment Utiliser l'Interface
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                1. Navigation
              </h3>
              <p class="text-sm text-gray-600 mb-4">
                Utilisez les boutons ci-dessus pour accéder aux différentes
                sections de gestion des cours.
              </p>

              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                2. Création de Cours
              </h3>
              <p class="text-sm text-gray-600 mb-4">
                Cliquez sur "Nouveau Cours" pour créer un nouveau cours avec
                leçons et quiz.
              </p>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                3. Gestion des Cours
              </h3>
              <p class="text-sm text-gray-600 mb-4">
                Consultez la liste des cours, modifiez-les ou supprimez-les
                selon vos besoins.
              </p>

              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                4. Analytics
              </h3>
              <p class="text-sm text-gray-600 mb-4">
                Analysez les performances de vos cours avec les statistiques et
                tendances.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class AdminDemoComponent {
  constructor(public router: Router) {}
}
