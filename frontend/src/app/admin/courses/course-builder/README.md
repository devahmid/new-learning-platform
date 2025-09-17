# 🏗️ Constructeur de Cours Complet

## Vue d'ensemble

Le composant `CourseBuilderComponent` est un outil avancé qui permet de créer un cours complet avec toutes ses leçons et quiz en une seule fois, en se basant sur la structure existante de l'application.

## 🎯 Fonctionnalités

### ✅ Création de cours complet

- **Informations générales** : titre, description, niveau, catégorie, difficulté, durée
- **Fichiers du cours** : vidéo principale et PDF principal
- **Leçons multiples** : création de plusieurs leçons avec contenu, vidéos et fichiers
- **Quiz complets** : questions à choix multiples avec réponses correctes

### 🔧 Gestion dynamique

- Ajout/suppression de leçons à la volée
- Ajout/suppression de quiz
- Ajout/suppression de questions et réponses
- Réorganisation automatique de l'ordre des leçons

### 📱 Interface utilisateur

- Interface moderne et responsive
- Validation en temps réel des formulaires
- Aperçu des fichiers uploadés
- Navigation intuitive entre les sections

## 🚀 Utilisation

### 1. Accès au composant

- Naviguer vers `/admin/courses`
- Cliquer sur "🏗️ Constructeur de Cours Complet"

### 2. Sélection de la matière

- Choisir une matière depuis la grille des matières disponibles
- La matière sélectionnée sera mise en évidence

### 3. Remplir les informations du cours

- **Titre et description** : informations de base du cours
- **Niveau** : Débutant, Intermédiaire ou Avancé
- **Catégorie** : Vocabulaire, Grammaire, Lecture, etc.
- **Difficulté** : Facile, Moyen ou Difficile
- **Durée estimée** : en minutes (15-180)

### 4. Ajouter les fichiers du cours

- **Vidéo principale** : fichier vidéo optionnel
- **PDF principal** : document PDF optionnel

### 5. Créer les leçons

- Cliquer sur "➕ Ajouter une leçon" pour chaque nouvelle leçon
- Remplir :
  - Titre de la leçon
  - Contenu détaillé
  - URL de la vidéo (optionnel)
  - Fichier de la leçon (optionnel)
- L'ordre est automatiquement géré

### 6. Créer les quiz

- Cliquer sur "➕ Ajouter un quiz" pour chaque nouveau quiz
- Remplir :
  - Titre du quiz
  - Description (optionnel)
- **Ajouter des questions** :
  - Texte de la question
  - Réponses multiples (minimum 2, maximum illimité)
  - Sélectionner la réponse correcte avec le bouton radio

### 7. Soumettre le cours

- Cliquer sur "Créer le cours complet"
- Le système valide et crée le cours avec toutes ses composantes

## 🏗️ Architecture technique

### Composants utilisés

- `FormBuilder` : gestion des formulaires réactifs
- `FormArray` : gestion des tableaux de leçons et quiz
- `ReactiveFormsModule` : validation et gestion des formulaires
- `SubjectService` : gestion des matières
- `CoursService` : création des cours

### Structure des données

```typescript
interface CourseForm {
  title: string;
  description: string;
  level: number;
  category: string;
  difficulty: string;
  estimatedDuration: number;
  videoUrl?: string;
  pdfUrl?: string;
  lessons: LessonForm[];
  quizzes: QuizForm[];
}

interface LessonForm {
  title: string;
  content: string;
  order: number;
  videoUrl?: string;
  fileUrl?: string;
  icon: string;
  status: string;
  category: string;
}

interface QuizForm {
  title: string;
  description?: string;
  questions: QuestionForm[];
}

interface QuestionForm {
  text: string;
  type: string;
  answers: AnswerForm[];
}

interface AnswerForm {
  text: string;
  isCorrect: boolean;
}
```

## 🔒 Validation et sécurité

### Validation des formulaires

- Champs obligatoires marqués avec \*
- Validation des types de fichiers
- Vérification des formats d'URL
- Contrôle de la durée (15-180 minutes)

### Gestion des erreurs

- Messages d'erreur explicites
- Validation en temps réel
- Gestion des erreurs d'upload
- Rollback en cas d'échec

## 📱 Responsive Design

### Breakpoints

- **Mobile** : < 768px - Layout en colonne unique
- **Tablet** : 768px - 1024px - Layout en 2 colonnes
- **Desktop** : > 1024px - Layout en 3-4 colonnes

### Adaptations mobiles

- Boutons empilés verticalement
- Formulaires en pleine largeur
- Navigation tactile optimisée

## 🎨 Personnalisation

### Styles disponibles

- Classes Tailwind CSS pour la cohérence
- Animations et transitions CSS
- États visuels (hover, focus, disabled)
- Thème cohérent avec l'application

### Classes CSS personnalisées

- `.form-section` : sections du formulaire
- `.lesson-card` : cartes des leçons
- `.quiz-card` : cartes des quiz
- `.question-card` : cartes des questions

## 🚨 Dépannage

### Problèmes courants

1. **Formulaire non valide** : vérifier les champs obligatoires
2. **Upload échoué** : vérifier le format et la taille des fichiers
3. **Erreur de création** : vérifier la connexion et les permissions

### Logs et débogage

- Console du navigateur pour les erreurs JavaScript
- Logs du service pour les erreurs d'API
- Validation des données avant soumission

## 🔄 Évolutions futures

### Fonctionnalités prévues

- [ ] Modèles de cours prédéfinis
- [ ] Import/export de cours
- [ ] Prévisualisation en temps réel
- [ ] Collaboration multi-utilisateurs
- [ ] Historique des modifications

### Améliorations techniques

- [ ] Lazy loading des composants
- [ ] Cache des données
- [ ] Optimisation des performances
- [ ] Tests automatisés

## 📚 Ressources

### Documentation

- [Angular Reactive Forms](https://angular.io/guide/reactive-forms)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

### Composants liés

- `SubjectManagerComponent` : gestion des matières
- `CoursAjoutComponent` : ajout simple de cours
- `FormLoaderComponent` : indicateur de chargement
- `SubmitButtonComponent` : bouton de soumission

---

**Développé avec ❤️ pour simplifier la création de cours complets**
