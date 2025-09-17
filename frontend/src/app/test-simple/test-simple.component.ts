import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NativeButtonComponent } from '../shared/components/native-button/native-button.component';
import { NativeInputComponent } from '../shared/components/native-input/native-input.component';

@Component({
  selector: 'app-test-simple',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NativeButtonComponent,
    NativeInputComponent,
  ],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <h2 class="text-3xl font-bold mb-6 text-center text-gray-800">
        🧪 Test des Composants Natifs
      </h2>

      <div class="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <!-- Section Input -->
        <div class="space-y-4">
          <h3 class="text-xl font-semibold text-gray-700">
            📝 Composant Input
          </h3>

          <app-native-input
            id="name-input"
            label="Nom complet"
            placeholder="Entrez votre nom..."
            [(ngModel)]="formData.name"
            [required]="true"
            hint="Votre nom complet sera affiché"
          ></app-native-input>

          <app-native-input
            id="email-input"
            label="Email"
            placeholder="exemple@email.com"
            inputType="email"
            [(ngModel)]="formData.email"
            [required]="true"
            [error]="formData.emailError"
          ></app-native-input>
        </div>

        <!-- Section Boutons -->
        <div class="space-y-4">
          <h3 class="text-xl font-semibold text-gray-700">
            🔘 Composant Button
          </h3>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <app-native-button
              buttonType="primary"
              size="md"
              label="Primaire"
              (click)="onButtonClick('primary')"
            ></app-native-button>

            <app-native-button
              buttonType="success"
              size="md"
              label="Succès"
              (click)="onButtonClick('success')"
            ></app-native-button>

            <app-native-button
              buttonType="danger"
              size="md"
              label="Danger"
              (click)="onButtonClick('danger')"
            ></app-native-button>

            <app-native-button
              buttonType="warning"
              size="md"
              label="Attention"
              (click)="onButtonClick('warning')"
            ></app-native-button>
          </div>
        </div>

        <!-- Section Résultats -->
        <div class="space-y-4">
          <h3 class="text-xl font-semibold text-gray-700">📊 Résultats</h3>

          <div class="bg-gray-50 rounded-lg p-4 space-y-2">
            <p>
              <strong>Nom :</strong>
              <span class="text-blue-600">{{
                formData.name || 'Non renseigné'
              }}</span>
            </p>
            <p>
              <strong>Email :</strong>
              <span class="text-blue-600">{{
                formData.email || 'Non renseigné'
              }}</span>
            </p>
            <p>
              <strong>Dernier clic :</strong>
              <span class="text-green-600">{{
                lastClick || 'Aucun clic'
              }}</span>
            </p>
            <p>
              <strong>Nombre de clics :</strong>
              <span class="text-purple-600">{{ clickCount }}</span>
            </p>
          </div>
        </div>

        <!-- Section Actions -->
        <div class="flex justify-center space-x-4">
          <app-native-button
            buttonType="success"
            size="lg"
            label="Valider le formulaire"
            (click)="validateForm()"
          ></app-native-button>

          <app-native-button
            buttonType="secondary"
            size="lg"
            label="Réinitialiser"
            (click)="resetForm()"
          ></app-native-button>
        </div>
      </div>
    </div>
  `,
})
export class TestSimpleComponent {
  formData = {
    name: '',
    email: '',
    emailError: '',
  };

  lastClick = '';
  clickCount = 0;

  onButtonClick(type: string) {
    this.lastClick = `${type} - ${new Date().toLocaleTimeString()}`;
    this.clickCount++;
    console.log(`Bouton cliqué : ${type}`);

    // Validation email en temps réel
    if (this.formData.email && !this.isValidEmail(this.formData.email)) {
      this.formData.emailError = "Format d'email invalide";
    } else {
      this.formData.emailError = '';
    }
  }

  validateForm() {
    if (!this.formData.name) {
      alert('Le nom est requis !');
      return;
    }

    if (!this.formData.email) {
      alert("L'email est requis !");
      return;
    }

    if (!this.isValidEmail(this.formData.email)) {
      alert("Format d'email invalide !");
      return;
    }

    alert('Formulaire valide ! 🎉');
    console.log('Données du formulaire :', this.formData);
  }

  resetForm() {
    this.formData = {
      name: '',
      email: '',
      emailError: '',
    };
    this.lastClick = '';
    this.clickCount = 0;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
