import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormLoaderComponent } from '../form-loader/form-loader.component';
import { ButtonLoaderComponent } from '../button-loader/button-loader.component';
import { ListLoaderComponent } from '../list-loader/list-loader.component';
import { SubmitButtonComponent } from '../submit-button/submit-button.component';

@Component({
  selector: 'app-loader-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormLoaderComponent,
    ButtonLoaderComponent,
    ListLoaderComponent,
    SubmitButtonComponent,
  ],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12"
    >
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            🎨 Loaders Stylés avec Tailwind
          </h1>
          <p class="text-xl text-gray-600">
            Une collection de composants de chargement élégants et modernes
          </p>
        </div>

        <!-- Grille des loaders -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Loader Principal -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Loader Principal
            </h3>
            <div class="h-32 flex items-center justify-center">
              <app-form-loader text="Chargement principal..."></app-form-loader>
            </div>
            <p class="text-sm text-gray-600 text-center">
              Pour les pages complètes
            </p>
          </div>

          <!-- Loader Compact -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Loader Compact
            </h3>
            <div class="h-32 flex items-center justify-center">
              <app-form-loader text="Chargement..."></app-form-loader>
            </div>
            <p class="text-sm text-gray-600 text-center">Pour les sections</p>
          </div>

          <!-- Loader de Bouton -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Loader de Bouton
            </h3>
            <div class="h-32 flex items-center justify-center">
              <app-button-loader text="Chargement..."></app-button-loader>
            </div>
            <p class="text-sm text-gray-600 text-center">Pour les boutons</p>
          </div>

          <!-- Loader de Liste -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Loader de Liste
            </h3>
            <div class="h-32">
              <app-list-loader [count]="2"></app-list-loader>
            </div>
            <p class="text-sm text-gray-600 text-center">Pour les listes</p>
          </div>

          <!-- Boutons de Soumission -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Boutons de Soumission
            </h3>
            <div class="space-y-3">
              <app-submit-button
                text="Ajouter un enfant"
                loadingText="Ajout en cours..."
                [loading]="false"
                icon="plus"
                variant="primary"
              >
              </app-submit-button>

              <app-submit-button
                text="Modifier"
                loadingText="Modification..."
                [loading]="true"
                icon="edit"
                variant="secondary"
              >
              </app-submit-button>

              <app-submit-button
                text="Supprimer"
                loadingText="Suppression..."
                [loading]="false"
                variant="danger"
              >
              </app-submit-button>
            </div>
          </div>

          <!-- Animations CSS -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Animations CSS
            </h3>
            <div class="space-y-4">
              <div class="flex space-x-2">
                <div
                  class="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                ></div>
                <div
                  class="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"
                  style="animation-delay: 150ms"
                ></div>
                <div
                  class="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                  style="animation-delay: 300ms"
                ></div>
              </div>

              <div
                class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"
              ></div>

              <div
                class="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse mx-auto"
              ></div>
            </div>
            <p class="text-sm text-gray-600 text-center mt-4">
              Animations Tailwind
            </p>
          </div>
        </div>

        <!-- Section d'utilisation -->
        <div class="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            📚 Comment utiliser ces loaders
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                Import des composants
              </h3>
              <pre class="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
import {{
                  '{'
                }} FormLoaderComponent, ButtonLoaderComponent, ListLoaderComponent, SubmitButtonComponent {{
                  '}'
                }} from './shared/loaders';</pre
              >
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                Utilisation dans le template
              </h3>
              <pre class="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
&lt;app-form-loader text="Chargement..."&gt;&lt;/app-form-loader&gt;
&lt;app-submit-button [loading]="isLoading" text="Soumettre"&gt;&lt;/app-submit-button&gt;</pre
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class LoaderDemoComponent {}
