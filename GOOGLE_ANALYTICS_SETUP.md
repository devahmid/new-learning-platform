# Google Analytics 4 - Configuration et Utilisation

## Configuration initiale

### 1. Créer un compte Google Analytics 4

1. Allez sur [Google Analytics](https://analytics.google.com/)
2. Créez un nouveau compte et une nouvelle propriété
3. Choisissez "Web" comme plateforme
4. Récupérez votre **ID de mesure** (format: `G-XXXXXXXXXX`)

### 2. Configurer l'ID de mesure dans l'application

Remplacez `G-XXXXXXXXXX` par votre véritable ID de mesure dans les fichiers suivants :

- `src/environments/environment.ts` (pour le développement)
- `src/environments/environment.prod.ts` (pour la production)

```typescript
export const environment = {
  // ... autres configurations
  googleAnalytics: {
    measurementId: "G-VOTRE-ID-MESURE",
  },
};
```

## Fonctionnalités implémentées

### 📊 Suivi automatique

- **Pages vues** : Suivi automatique de toutes les navigations
- **Connexions utilisateur** : Tracking automatique lors de la connexion
- **Inscriptions** : Tracking automatique lors de l'inscription
- **Informations utilisateur** : IP, navigateur, résolution d'écran, langue

### 📚 Suivi spécifique à l'apprentissage

Le service `GoogleAnalyticsService` inclut des méthodes spécialisées :

#### Cours et leçons

```typescript
// Voir un cours
this.googleAnalytics.trackCourseView("course-123", "Mathématiques niveau 1", "Mathématiques");

// Progression dans un cours
this.googleAnalytics.trackCourseProgress("course-123", "lesson-456", 75);

// Leçon terminée
this.googleAnalytics.trackLessonCompleted("course-123", "lesson-456");
```

#### Quiz

```typescript
// Démarrer un quiz
this.googleAnalytics.trackQuizStart("quiz-789", "course-123");

// Terminer un quiz
this.googleAnalytics.trackQuizCompleted("quiz-789", "course-123", 85);
```

#### Vidéos

```typescript
// Interactions vidéo
this.googleAnalytics.trackVideoInteraction("play", "video-123");
this.googleAnalytics.trackVideoInteraction("pause", "video-123", 30);
this.googleAnalytics.trackVideoInteraction("completed", "video-123", 100);
```

#### Recherche

```typescript
// Recherche dans l'application
this.googleAnalytics.trackSearch("mathématiques", 15);
```

#### Erreurs

```typescript
// Suivi des erreurs
this.googleAnalytics.trackError("Erreur de connexion API", "/cours");
```

### 🎯 Événements personnalisés

```typescript
// Événement personnalisé
this.googleAnalytics.trackEvent("bouton_clic", {
  category: "ui_interaction",
  label: "header_menu",
  value: 1,
  custom1: "information_supplementaire",
});
```

### 👤 Propriétés utilisateur

```typescript
// Définir des propriétés utilisateur
this.googleAnalytics.setUserProperties({
  subscription_type: "premium",
  user_level: "intermediate",
  preferred_language: "fr",
});
```

## Métriques collectées

### Automatiques

- **Adresse IP** : Géolocalisation des utilisateurs
- **User Agent** : Navigateur et OS utilisés
- **Résolution d'écran** : Informations sur les appareils
- **Langue** : Langue du navigateur
- **Pages visitées** : Navigation complète
- **Temps passé** : Durée des sessions

### Spécifiques à l'apprentissage

- **Cours consultés** : Quels cours sont les plus populaires
- **Progression** : Taux de completion des leçons
- **Performance quiz** : Scores et taux de réussite
- **Engagement vidéo** : Temps de visionnage, abandons
- **Recherches** : Termes recherchés et résultats
- **Erreurs** : Problèmes techniques rencontrés

## Visualisation des données

### Dans Google Analytics 4

1. **Rapports en temps réel** : Utilisateurs actifs actuellement
2. **Acquisition** : D'où viennent vos utilisateurs
3. **Engagement** : Comment ils interagissent avec l'app
4. **Rétention** : Combien reviennent
5. **Événements personnalisés** : Vos métriques spécifiques

### Rapports recommandés

1. **Funnel d'inscription** : Inscription → Premier cours → Premier quiz
2. **Performance des cours** : Vues, completions, abandons
3. **Engagement utilisateur** : Sessions, temps passé, pages par session
4. **Géographie** : Répartition géographique des utilisateurs
5. **Technologie** : Navigateurs, OS, résolutions d'écran

## Conformité RGPD

### Consentement utilisateur

Pour être conforme au RGPD, ajoutez une bannière de consentement :

```typescript
// Exemple d'implémentation du consentement
consentToAnalytics() {
  // Activer Google Analytics seulement après consentement
  if (typeof gtag !== 'undefined') {
    gtag('consent', 'update', {
      analytics_storage: 'granted'
    });
  }
}

refuseAnalytics() {
  if (typeof gtag !== 'undefined') {
    gtag('consent', 'update', {
      analytics_storage: 'denied'
    });
  }
}
```

### Configuration recommandée

Dans `google-analytics.service.ts`, ajoutez lors de l'initialisation :

```typescript
gtag("consent", "default", {
  analytics_storage: "denied",
  ad_storage: "denied",
});
```

## Exemples d'utilisation dans les composants

### Composant de cours

```typescript
import { GoogleAnalyticsService } from "../services/google-analytics.service";

export class CourseComponent {
  constructor(private analytics: GoogleAnalyticsService) {}

  onCourseStart(courseId: string, courseName: string) {
    this.analytics.trackCourseView(courseId, courseName, "Mathématiques");
  }

  onLessonComplete(courseId: string, lessonId: string) {
    this.analytics.trackLessonCompleted(courseId, lessonId);
  }
}
```

### Composant de quiz

```typescript
export class QuizComponent {
  constructor(private analytics: GoogleAnalyticsService) {}

  startQuiz() {
    this.analytics.trackQuizStart(this.quizId, this.courseId);
  }

  submitQuiz(score: number) {
    this.analytics.trackQuizCompleted(this.quizId, this.courseId, score);
  }
}
```

## Dépannage

### Vérifier que GA4 fonctionne

1. Ouvrez les outils de développement
2. Onglet **Network** → filtrez par "collect"
3. Vous devriez voir des requêtes vers `google-analytics.com`

### Vérifier les événements

1. Dans GA4, allez dans **Configure** → **DebugView**
2. Activez le mode debug : `gtag('config', 'G-XXXXXXXXXX', { debug_mode: true })`
3. Testez votre application en mode développement

### Tester en local

```bash
npm start
# Ouvrez http://localhost:4200
# Naviguez dans l'application
# Vérifiez les requêtes dans les outils de développement
```

## Intégrations supplémentaires possibles

- **Google Tag Manager** : Pour une gestion plus avancée
- **Enhanced Ecommerce** : Si vous ajoutez des paiements
- **Search Console** : Pour les données SEO
- **Firebase Analytics** : Pour les applications mobiles futures

## Performance

Le service est optimisé pour :

- ✅ Chargement asynchrone des scripts
- ✅ Pas d'impact sur les performances
- ✅ Gestion des erreurs
- ✅ Mode dégradé si GA4 n'est pas disponible

---

**Note importante** : N'oubliez pas de tester en mode production avant le déploiement et de configurer les goals dans Google Analytics 4 selon vos objectifs business.
