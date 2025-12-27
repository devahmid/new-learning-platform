# 🔗 Relations des évaluations

## À quoi peut être liée une évaluation ?

Une évaluation peut être liée à **deux types d'entités** (les deux sont **optionnels**) :

### 1. 📚 **Cours** (`courseId`)
- **Lien** : Une évaluation peut être associée à un **cours spécifique**
- **Effet** : L'évaluation apparaîtra dans la page de détail de ce cours
- **Utilisation** : Tous les élèves inscrits au cours peuvent voir et prendre l'évaluation
- **Exemple** : Évaluation de fin de module "Arabe Niveau 1"

### 2. 📖 **Leçon** (`lessonId`)
- **Lien** : Une évaluation peut être associée à une **leçon spécifique**
- **Effet** : L'évaluation sera liée à cette leçon précise
- **Utilisation** : Plus spécifique qu'une évaluation de cours
- **Exemple** : Quiz de compréhension après une leçon sur "Les bases de la grammaire"

### 3. 🌐 **Indépendante** (aucun lien)
- **Aucun cours ni leçon** : `courseId = null` et `lessonId = null`
- **Effet** : Évaluation globale, accessible depuis une liste générale
- **Utilisation** : Évaluations générales, tests de niveau, etc.

## Structure dans la base de données

```sql
CREATE TABLE evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    courseId INT NULL,        -- ✅ Optionnel : lien vers un cours
    lessonId INT NULL,         -- ✅ Optionnel : lien vers une leçon
    ...
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (lessonId) REFERENCES lessons(id) ON DELETE SET NULL
);
```

## Comportement selon le type de lien

### Évaluation liée à un cours (`courseId` rempli)
```
Cours "Arabe Niveau 1"
  └── Évaluation "Test de fin de module"
      └── Visible dans : /cours/:courseId
      └── Accessible par : Tous les élèves du cours
```

### Évaluation liée à une leçon (`lessonId` rempli)
```
Cours "Arabe Niveau 1"
  └── Leçon "Les bases de la grammaire"
      └── Évaluation "Quiz de compréhension"
          └── Visible dans : La leçon spécifique
          └── Accessible par : Les élèves ayant accès à cette leçon
```

### Évaluation indépendante (aucun lien)
```
Évaluation "Test de niveau général"
  └── Visible dans : Liste générale des évaluations
  └── Accessible par : Tous les utilisateurs (selon les permissions)
```

## Comment créer une évaluation avec un lien

### Dans le formulaire admin (`/admin/evaluations/create`)

1. **Sélectionner un cours** (optionnel)
   - Dropdown "Cours" → Choisir un cours
   - Si vous sélectionnez un cours, les leçons de ce cours apparaîtront

2. **Sélectionner une leçon** (optionnel)
   - Dropdown "Leçon" → Choisir une leçon
   - ⚠️ **Note** : Vous devez d'abord sélectionner un cours pour voir ses leçons

3. **Laisser vide** pour une évaluation indépendante
   - Ne rien sélectionner dans les deux dropdowns

## Règles de priorité

### Si les deux sont remplis
- L'évaluation est liée à **la leçon** (plus spécifique)
- Elle apparaîtra dans le contexte de la leçon

### Si seulement `courseId` est rempli
- L'évaluation apparaît dans la page du cours
- Accessible à tous les élèves du cours

### Si seulement `lessonId` est rempli
- ⚠️ **Cas rare** : Normalement, une leçon appartient à un cours
- L'évaluation sera liée uniquement à la leçon

## API Endpoints pour récupérer les évaluations

### Par cours
```http
GET /api/evaluations/course/:courseId
```
Retourne toutes les évaluations liées à un cours spécifique.

### Par leçon
```http
GET /api/evaluations/lesson/:lessonId
```
Retourne toutes les évaluations liées à une leçon spécifique.

### Toutes les évaluations
```http
GET /api/evaluations
```
Retourne toutes les évaluations (avec ou sans lien).

## Exemples d'utilisation

### Exemple 1 : Évaluation de fin de module
```json
{
  "title": "Évaluation classes (A) - Arabe Niveau 1",
  "courseId": 5,
  "lessonId": null,
  "isActive": true
}
```
→ Visible dans la page du cours "Arabe Niveau 1"

### Exemple 2 : Quiz après une leçon
```json
{
  "title": "Quiz : Les bases de la grammaire",
  "courseId": 5,
  "lessonId": 23,
  "isActive": true
}
```
→ Visible dans la leçon spécifique

### Exemple 3 : Test de niveau général
```json
{
  "title": "Test de niveau - Placement",
  "courseId": null,
  "lessonId": null,
  "isActive": true
}
```
→ Évaluation indépendante, accessible globalement

## Affichage dans l'interface

### Page de détail d'un cours (`/cours/:id`)
- ✅ Affiche les évaluations où `courseId` correspond au cours
- ✅ Section "Évaluations" avec liste des évaluations actives

### Page de détail d'une leçon (`/lecons/:id`)
- ⚠️ **À implémenter** : Afficher les évaluations où `lessonId` correspond à la leçon

### Liste admin (`/admin/evaluations`)
- ✅ Affiche toutes les évaluations
- ✅ Indique le cours/leçon associé(e) si présent(e)

## Notes importantes

1. **Les deux liens sont optionnels** : Une évaluation peut exister sans être liée à quoi que ce soit
2. **Cascade** : Si un cours ou une leçon est supprimé, l'évaluation reste mais le lien est mis à `NULL`
3. **Priorité** : Si les deux sont remplis, la leçon a la priorité (plus spécifique)
4. **Filtrage** : Seules les évaluations **actives** (`isActive: true`) sont affichées aux utilisateurs

