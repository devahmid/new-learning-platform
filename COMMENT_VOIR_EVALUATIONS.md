# 📋 Comment voir et prendre les évaluations côté frontend

## Pour les utilisateurs (élèves/parents)

### Méthode 1 : Depuis la page d'un cours ✅
1. **Accédez à un cours** : `/cours/:id`
2. **Faites défiler** jusqu'à la section **"Évaluations"**
3. **Cliquez sur "Commencer l'évaluation"** pour une évaluation
4. Vous serez redirigé vers `/evaluations/:id` pour prendre l'évaluation

### Méthode 2 : URL directe
- **URL** : `/evaluations/:id` (où `:id` est l'ID de l'évaluation)
- Exemple : `/evaluations/1` pour l'évaluation avec l'ID 1

## Pour les administrateurs

### Voir la liste des évaluations
1. **Accédez au dashboard admin** : `/admin`
2. **Cliquez sur "Gérer les évaluations"** dans les actions rapides
   - Ou accédez directement à : `/admin/evaluations`
3. Vous verrez toutes les évaluations avec :
   - Le titre
   - La description
   - Le nombre de questions
   - Le nombre de sections
   - Le statut (Active/Inactive)
   - Les boutons Modifier et Supprimer

### Créer une nouvelle évaluation
1. **Depuis la liste** : Cliquez sur **"Créer une évaluation"**
2. **URL directe** : `/admin/evaluations/create`
3. Remplissez le formulaire avec :
   - Titre et description
   - Instructions détaillées (HTML possible)
   - Instructions spéciales
   - Cours/Leçon associé(e) (optionnel)
   - Sections (optionnel)
   - Questions avec leurs options

### Modifier une évaluation
1. **Depuis la liste** : Cliquez sur **"Modifier"** sur une évaluation
2. **URL directe** : `/admin/evaluations/edit/:id`

## Fonctionnalités disponibles

### Pour les utilisateurs
- ✅ Voir les évaluations actives d'un cours
- ✅ Prendre une évaluation avec :
  - Instructions détaillées (HTML)
  - Instructions spéciales
  - Sections organisées
  - Différents types de questions :
    - Choix unique (Radio)
    - Cases à cocher
    - Texte court
    - Texte long
    - Note (1-5)
- ✅ Barre de progression
- ✅ Navigation entre les questions
- ✅ Soumission des réponses

### Pour les administrateurs
- ✅ Liste de toutes les évaluations
- ✅ Création d'évaluations avec sections
- ✅ Modification d'évaluations
- ✅ Suppression d'évaluations
- ✅ Association aux cours/leçons
- ✅ Gestion des statuts (Active/Inactive)

## Routes disponibles

### Routes utilisateur
- `/evaluations/:id` - Prendre une évaluation

### Routes admin
- `/admin/evaluations` - Liste des évaluations
- `/admin/evaluations/create` - Créer une évaluation
- `/admin/evaluations/edit/:id` - Modifier une évaluation

## Liens dans l'interface

### Dashboard Admin
- **Actions rapides** → "Gérer les évaluations" → `/admin/evaluations`

### Page Cours Admin
- **Cours** → "Évaluations" → `/admin/evaluations`

### Page de détail d'un cours (utilisateur)
- **Section "Évaluations"** → Bouton "Commencer l'évaluation" → `/evaluations/:id`

## Notes importantes

1. **Les évaluations doivent être actives** pour apparaître dans la liste des utilisateurs
2. **Les évaluations peuvent être liées à un cours** ou à une leçon spécifique
3. **Les sections permettent d'organiser** les questions par thème
4. **Les instructions HTML** sont supportées pour un formatage avancé

## Dépannage

### Je ne vois pas les évaluations dans un cours
- Vérifiez que l'évaluation est **active** (`isActive: true`)
- Vérifiez que l'évaluation est **liée au bon cours** (`courseId`)
- Vérifiez que vous êtes **inscrit au cours**

### L'évaluation ne se charge pas
- Vérifiez l'ID de l'évaluation dans l'URL
- Vérifiez la console du navigateur pour les erreurs
- Vérifiez que l'API backend fonctionne (`/api/evaluations/:id`)

### Je ne peux pas créer/modifier une évaluation
- Vérifiez que vous êtes connecté en tant qu'**administrateur**
- Vérifiez les permissions dans le backend
- Vérifiez que le token JWT est valide

