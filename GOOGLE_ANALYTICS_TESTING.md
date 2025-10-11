# Test de l'intégration Google Analytics 4

## Configuration requise avant les tests

### 1. Obtenir votre ID de mesure Google Analytics

1. Créez un compte Google Analytics 4
2. Récupérez votre ID de mesure (format: `G-XXXXXXXXXX`)
3. Remplacez `G-XXXXXXXXXX` dans les fichiers :
   - `frontend/src/environments/environment.ts`
   - `frontend/src/environments/environment.prod.ts`

## Tests à effectuer

### 1. Test de base - Pages vues

```bash
# Démarrer l'application
cd frontend
npm start
```

1. Ouvrir http://localhost:4200
2. Naviguer entre les pages
3. Vérifier dans les outils de développement (F12) → Network → filtrer "collect"
4. Vous devriez voir des requêtes vers google-analytics.com

### 2. Test de connexion utilisateur

1. Se connecter avec un compte existant
2. Vérifier qu'un événement `login` est envoyé
3. L'ID utilisateur devrait être configuré

### 3. Test d'inscription

1. Créer un nouveau compte
2. Vérifier qu'un événement `sign_up` est envoyé

### 4. Test des informations utilisateur

1. Au démarrage de l'application
2. Vérifier qu'un événement `user_info` est envoyé avec :
   - Adresse IP
   - User Agent
   - Langue
   - Platform
   - Résolution d'écran

## Vérification dans Google Analytics 4

### Mode Debug

1. Dans GA4, aller à **Configure** → **DebugView**
2. Modifier temporairement le service pour activer le debug :

```typescript
gtag("config", "${this.measurementId}", {
  debug_mode: true, // Ajouter cette ligne
  page_title: document.title,
  page_location: window.location.href,
});
```

3. Tester l'application
4. Les événements apparaîtront en temps réel dans DebugView

### Rapports temps réel

1. Dans GA4, aller à **Reports** → **Realtime**
2. Utiliser l'application
3. Voir les utilisateurs actifs et les événements en temps réel

## Événements personnalisés à tester

Une fois que vous avez des composants qui utilisent le service, testez :

```typescript
// Exemple dans un composant de cours
this.googleAnalytics.trackCourseView("course-1", "Mathématiques", "Education");

// Exemple dans un composant de quiz
this.googleAnalytics.trackQuizStart("quiz-1", "course-1");
this.googleAnalytics.trackQuizCompleted("quiz-1", "course-1", 85);

// Exemple d'erreur
this.googleAnalytics.trackError("Erreur de chargement", "/cours");
```

## Données collectées automatiquement

✅ **Pages vues** : Toutes les navigations Angular  
✅ **Sessions** : Durée des sessions utilisateur  
✅ **Géolocalisation** : Basée sur l'adresse IP  
✅ **Technologie** : Navigateur, OS, résolution  
✅ **Connexions** : Événements de login/signup  
✅ **Informations utilisateur** : IP, langue, plateforme

## Résolution de problèmes

### Pas d'événements envoyés

1. Vérifier que l'ID de mesure est correct
2. Vérifier que gtag est chargé (console : `typeof gtag`)
3. Vérifier les erreurs dans la console

### Événements envoyés mais pas dans GA4

1. Attendre 24-48h (les données peuvent prendre du temps)
2. Utiliser DebugView pour voir les événements en temps réel
3. Vérifier que la propriété GA4 est configurée pour le bon domaine

### Erreurs CORS

1. Google Analytics gère automatiquement les CORS
2. Si problèmes, vérifier la configuration du domaine dans GA4

## Conformité RGPD

⚠️ **Important** : Pour la production, implémenter une bannière de consentement :

```typescript
// Consentement par défaut (à ajouter au service)
gtag("consent", "default", {
  analytics_storage: "denied",
});

// Après consentement utilisateur
gtag("consent", "update", {
  analytics_storage: "granted",
});
```

## Métriques recommandées à suivre

1. **Acquisition** : D'où viennent vos utilisateurs
2. **Engagement** : Temps passé, pages par session
3. **Rétention** : Utilisateurs qui reviennent
4. **Conversion** : Inscriptions, completions de cours
5. **Performance** : Erreurs, temps de chargement

## Prochaines étapes

1. 🎯 Configurer des **Goals** dans GA4
2. 📊 Créer des **Custom Dashboards**
3. 🔔 Configurer des **Alerts** pour les métriques importantes
4. 📈 Analyser les **Funnels** d'engagement
5. 🎨 Implémenter une **bannière de consentement RGPD**

---

**Ready to go!** 🚀 Votre application dispose maintenant d'un système de métriques complet pour suivre l'engagement des utilisateurs.
