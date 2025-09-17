# 🎨 Frontend Angular - Plateforme d'apprentissage de l'arabe

Interface utilisateur moderne développée avec Angular 17, compatible avec les APIs NestJS et PHP.

## 🚀 Fonctionnalités

- ✅ **Angular 17** avec Standalone Components
- ✅ **PrimeNG** pour les composants UI
- ✅ **TailwindCSS** pour le styling
- ✅ **Responsive Design** mobile-first
- ✅ **Authentification JWT** complète
- ✅ **Multi-environnements** (NestJS/PHP)
- ✅ **Gestion d'état** avec signals
- ✅ **Lazy loading** des modules
- ✅ **PWA ready** (optionnel)

## 🛠️ Installation

### **Prérequis**

- Node.js >= 18
- npm ou yarn
- Angular CLI

### **Installation rapide**

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer le serveur de développement
npm start

# 3. Ouvrir dans le navigateur
# http://localhost:4200
```

## 🔧 Configuration des environnements

### **Environnement NestJS** (développement local)

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/api",
};
```

### **Environnement PHP** (production)

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: "https://centre-culturel-olivier.fr/api",
};
```

### **Changer d'API rapidement**

```bash
# Pour développement (NestJS)
ng serve --configuration=development

# Pour production (PHP)
ng build --configuration=production
```

## 📱 Structure de l'application

```
src/app/
├── 🔐 auth/                    # Authentification
│   ├── login/
│   ├── register/
│   └── auth.service.ts
├── 👑 admin/                   # Interface d'administration
│   ├── dashboard/
│   ├── exercises/              # Gestion des exercices
│   ├── courses/                # Gestion des cours
│   └── users/                  # Gestion des utilisateurs
├── 📚 cours/                   # Interface des cours
│   ├── cours-list/
│   ├── cours-detail/
│   ├── lesson-detail/
│   └── exercises/
├── 👨‍👩‍👧‍👦 user/                    # Dashboards utilisateurs
│   ├── user-dashboard/         # Dashboard parent
│   └── child-dashboard/        # Dashboard enfant
├── 🔧 services/               # Services partagés
│   ├── course.service.ts
│   ├── auth.service.ts
│   └── user.service.ts
├── 🧩 shared/                 # Composants partagés
│   ├── components/
│   ├── pipes/
│   └── guards/
└── 📄 models/                 # Modèles TypeScript
    ├── user.model.ts
    ├── course.model.ts
    └── exercise.model.ts
```

## 🎯 Fonctionnalités principales

### **🔐 Authentification**

- Connexion/Inscription
- JWT tokens
- Guards de protection
- Gestion des rôles (admin/user)
- Réinitialisation mot de passe

### **👨‍👩‍👧‍👦 Gestion des utilisateurs**

- Profils parents/enfants
- Sélection d'enfant dynamique
- Suivi des progrès
- Gestion des préférences

### **📚 Cours et Leçons**

- Navigation intuitive
- Lecteur vidéo intégré
- Téléchargement de documents
- Progression temps réel

### **🎮 Exercices interactifs**

- **Flashcards** : Mémorisation vocabulaire
- **Traduction** : Exercices de traduction
- **Écoute** : Reconnaissance audio
- **Quiz** : Questions à choix multiples

### **👑 Interface Admin**

- Dashboard avec statistiques
- CRUD complet pour tous les contenus
- Gestion des utilisateurs
- Système de notifications

## 🎨 Personnalisation

### **Thèmes**

```scss
// src/styles.scss
:root {
  --primary-color: #6ab04c;
  --secondary-color: #4a90e2;
  --accent-color: #20b2aa;
}
```

### **Composants personnalisés**

```typescript
// Exemple de composant standalone
@Component({
  selector: "app-custom",
  standalone: true,
  imports: [CommonModule],
  template: `<div>Mon composant</div>`,
})
export class CustomComponent {}
```

## 🔄 API Switching

### **Développement avec NestJS**

```bash
# 1. Démarrer l'API NestJS
cd ../nestjs-api
npm run start:dev

# 2. Démarrer le frontend
npm start
# Utilise automatiquement environment.ts (NestJS)
```

### **Test avec API PHP**

```bash
# 1. Modifier environment.ts temporairement
# apiUrl: 'https://centre-culturel-olivier.fr/api'

# 2. Démarrer le frontend
npm start
```

### **Build pour production PHP**

```bash
ng build --configuration=production
# Utilise environment.prod.ts (API PHP)
```

## 📊 Performance

### **Optimisations incluses**

- **Lazy loading** des modules
- **OnPush** change detection
- **TrackBy** functions
- **Compression** gzip
- **Tree shaking** automatique
- **Bundle splitting**

### **Métriques**

```bash
# Analyser le bundle
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run e2e

# Tests avec couverture
npm run test -- --coverage

# Tests en mode watch
npm run test -- --watch
```

## 📱 Progressive Web App

### **Activer PWA** (optionnel)

```bash
ng add @angular/pwa

# Fonctionnalités PWA :
# - Installation sur mobile
# - Mode hors ligne
# - Notifications push
# - Cache automatique
```

## 🔧 Scripts disponibles

```bash
# Développement
npm start                # Serveur de développement
npm run serve:dev        # Avec proxy API
npm run serve:prod       # Mode production local

# Build
npm run build            # Build de production
npm run build:dev        # Build de développement

# Tests et qualité
npm run test             # Tests unitaires
npm run e2e              # Tests end-to-end
npm run lint             # Vérification du code
npm run format           # Formatage automatique

# Utilitaires
npm run analyze          # Analyse du bundle
npm run extract-i18n     # Extraction des traductions
```

## 🌐 Internationalisation

### **Langues supportées**

- **Français** (par défaut)
- **Arabe** (RTL support)
- **Anglais** (optionnel)

### **Configuration i18n**

```typescript
// app.config.ts
import { LOCALE_ID } from "@angular/core";

providers: [{ provide: LOCALE_ID, useValue: "fr-FR" }];
```

## 🔗 Intégrations

### **APIs compatibles**

- ✅ **API NestJS** (`http://localhost:3000/api`)
- ✅ **API PHP** (`https://centre-culturel-olivier.fr/api`)

### **Services externes**

- **Stripe** : Paiements (optionnel)
- **Socket.io** : Temps réel
- **Google Fonts** : Typographie
- **Font Awesome** : Icônes

## 🚀 Déploiement

### **Développement**

```bash
npm start
# http://localhost:4200
```

### **Production statique**

```bash
ng build --configuration=production
# Déployer le dossier dist/ sur votre serveur web
```

### **Docker**

```bash
docker build -t angular-frontend .
docker run -p 80:80 angular-frontend
```

## 🛡️ Sécurité

- **JWT** tokens sécurisés
- **Guards** de route
- **Interceptors** HTTP
- **Sanitization** automatique
- **CSP** headers (optionnel)

## 📖 Documentation

- **Storybook** : `npm run storybook` (si configuré)
- **Compodoc** : `npm run docs` (si configuré)
- **Swagger** : Via l'API backend

## 🤝 Développement

### **Conventions**

- **Standalone components** privilégiés
- **Signals** pour la réactivité
- **OnPush** change detection
- **TypeScript strict** mode
- **ESLint** + **Prettier**

### **Architecture recommandée**

```typescript
// Structure d'un composant
@Component({
  selector: "app-feature",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./feature.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureComponent {}
```

---

**🎯 Frontend moderne et performant pour votre plateforme d'apprentissage !**
