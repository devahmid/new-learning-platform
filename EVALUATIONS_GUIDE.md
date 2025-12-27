# Guide d'utilisation du système d'évaluations

## Vue d'ensemble

Le système d'évaluations permet de créer des formulaires d'évaluation directement sur votre site web, similaire à Google Forms. Vous pouvez créer des évaluations avec différents types de questions et les associer à des cours ou des leçons.

## Installation

### 1. Créer les tables de base de données

Exécutez la migration SQL pour créer les tables nécessaires :

```bash
mysql -u votre_utilisateur -p votre_base_de_donnees < php-api/migrations/create_evaluations_tables.sql
```

Ou exécutez le fichier SQL directement dans votre gestionnaire de base de données.

### 2. Vérifier les routes

Les routes ont été ajoutées dans `php-api/src/Core/Application.php`. Assurez-vous que le fichier est à jour.

## Types de questions disponibles

1. **Choix multiple** (`multiple_choice`) : Plusieurs options, une seule réponse possible
2. **Choix unique** (`radio`) : Boutons radio, une seule réponse possible
3. **Cases à cocher** (`checkbox`) : Plusieurs réponses possibles
4. **Texte court** (`text`) : Champ texte d'une ligne
5. **Texte long** (`textarea`) : Zone de texte multiligne
6. **Note** (`rating`) : Système de notation (étoiles)

## Utilisation côté admin

### Créer une évaluation

1. Accédez à `/admin/evaluations/create` (à ajouter dans votre routing)
2. Remplissez les informations générales :
   - Titre (obligatoire)
   - Description (optionnel)
   - Cours associé (optionnel)
   - Leçon associée (optionnel)
   - Dates de début et fin (optionnel)
   - Options d'activation

3. Ajoutez des questions :
   - Cliquez sur "Ajouter une question"
   - Choisissez le type de question
   - Remplissez le texte de la question
   - Pour les questions à choix multiples, ajoutez les options
   - Marquez la question comme obligatoire si nécessaire

4. Cliquez sur "Créer" pour sauvegarder

### Modifier une évaluation

1. Accédez à `/admin/evaluations/edit/{id}`
2. Modifiez les informations nécessaires
3. Cliquez sur "Mettre à jour"

## Utilisation côté utilisateur

### Passer une évaluation

1. Accédez à `/evaluations/{id}` où `{id}` est l'ID de l'évaluation
2. Répondez aux questions une par une
3. Utilisez la navigation pour passer d'une question à l'autre
4. La barre de progression montre votre avancement
5. Cliquez sur "Soumettre l'évaluation" une fois terminé

## API Endpoints

### Récupérer toutes les évaluations
```
GET /api/evaluations
```

### Récupérer une évaluation par ID
```
GET /api/evaluations/{id}
```

### Récupérer les évaluations d'un cours
```
GET /api/evaluations/course/{courseId}
```

### Récupérer les évaluations d'une leçon
```
GET /api/evaluations/lesson/{lessonId}
```

### Créer une évaluation (Admin)
```
POST /api/evaluations
Body: {
  "title": "Titre de l'évaluation",
  "description": "Description",
  "courseId": 1,
  "lessonId": 1,
  "isActive": true,
  "allowMultipleSubmissions": false,
  "showResults": true,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "questions": [
    {
      "text": "Question 1",
      "type": "multiple_choice",
      "required": true,
      "order": 0,
      "options": [
        {"text": "Option 1", "order": 0},
        {"text": "Option 2", "order": 1}
      ]
    }
  ]
}
```

### Mettre à jour une évaluation (Admin)
```
PUT /api/evaluations/{id}
Body: (même structure que POST)
```

### Supprimer une évaluation (Admin)
```
DELETE /api/evaluations/{id}
```

### Soumettre une réponse
```
POST /api/evaluations/{id}/submit
Body: {
  "responses": [
    {
      "questionId": 1,
      "value": "réponse",
      "textValue": "réponse texte" // pour les questions texte
    }
  ]
}
```

### Récupérer les réponses d'une évaluation (Admin)
```
GET /api/evaluations/{id}/responses
```

### Récupérer la réponse d'un utilisateur
```
GET /api/evaluations/{id}/responses/user
GET /api/evaluations/{id}/responses/user/{userId}
```

## Structure des données

### Evaluation
```typescript
{
  id: number;
  title: string;
  description?: string;
  courseId?: number;
  lessonId?: number;
  isActive: boolean;
  allowMultipleSubmissions: boolean;
  showResults: boolean;
  startDate?: Date;
  endDate?: Date;
  questions: EvaluationQuestion[];
}
```

### EvaluationQuestion
```typescript
{
  id: number;
  evaluationId: number;
  text: string;
  type: 'multiple_choice' | 'text' | 'checkbox' | 'radio' | 'textarea' | 'rating';
  required: boolean;
  order: number;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  minRating?: number;
  maxRating?: number;
  options?: EvaluationOption[];
}
```

## Intégration dans votre application

### Ajouter les routes Angular

Ajoutez ces routes dans votre fichier de routing :

```typescript
{
  path: 'admin/evaluations',
  component: EvaluationsListComponent // À créer
},
{
  path: 'admin/evaluations/create',
  component: EvaluationFormComponent
},
{
  path: 'admin/evaluations/edit/:id',
  component: EvaluationFormComponent
},
{
  path: 'evaluations/:id',
  component: EvaluationTakeComponent
}
```

### Ajouter un lien dans le menu admin

Ajoutez un lien vers la création d'évaluations dans votre menu admin :

```html
<a routerLink="/admin/evaluations/create">Créer une évaluation</a>
```

## Notes importantes

1. Les évaluations peuvent être associées à un cours ou une leçon, ou être indépendantes
2. Les dates de début et fin permettent de limiter la période de disponibilité
3. L'option `allowMultipleSubmissions` permet ou non aux utilisateurs de soumettre plusieurs fois
4. Les questions obligatoires doivent être remplies avant la soumission
5. Les réponses sont stockées dans la base de données et peuvent être consultées par l'admin

## Prochaines étapes

- Créer un composant de liste des évaluations pour l'admin
- Ajouter des statistiques sur les réponses
- Implémenter l'export des réponses en CSV/Excel
- Ajouter des notifications lors de la soumission
- Créer un tableau de bord pour visualiser les résultats

