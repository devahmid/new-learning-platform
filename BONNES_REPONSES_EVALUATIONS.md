# ✅ Système de bonnes réponses pour les évaluations

## Fonctionnalité ajoutée

Vous pouvez maintenant **marquer les bonnes réponses** lors de la création/modification d'une évaluation. Cela permet de :
- ✅ Identifier automatiquement les bonnes réponses lors de la correction
- ✅ Afficher les bonnes réponses aux élèves (si `showResults` est activé)
- ✅ Calculer automatiquement les scores

## Migration de la base de données

**⚠️ IMPORTANT** : Exécutez d'abord la migration SQL pour ajouter le champ `isCorrect` :

```sql
-- Fichier : php-api/migrations/add_correct_answer_to_evaluations.sql
ALTER TABLE evaluation_question_options 
ADD COLUMN isCorrect BOOLEAN DEFAULT FALSE AFTER `text`;

CREATE INDEX idx_correct ON evaluation_question_options(questionId, isCorrect);
```

## Comment marquer les bonnes réponses

### Dans le formulaire admin (`/admin/evaluations/create` ou `/edit/:id`)

1. **Créez ou modifiez une évaluation**
2. **Ajoutez une question** de type :
   - Choix unique (Radio)
   - Cases à cocher (Checkbox)
   - Choix multiples (Multiple Choice)
3. **Ajoutez des options** de réponse
4. **Cochez la case "✓ Bonne réponse"** à côté de chaque option correcte

### Exemple

Pour une question "Quelle est la traduction de 'Assalamu alaykum' ?" :

```
Option 1: "Paix sur vous"          [✓ Bonne réponse] ✓
Option 2: "Bonjour"                [  Bonne réponse]
Option 3: "Au revoir"              [  Bonne réponse]
```

## Structure des données

### Modèle TypeScript

```typescript
export interface EvaluationOption {
  id?: number;
  text: string;
  order?: number;
  isCorrect?: boolean; // ✅ Nouveau champ
}
```

### Base de données

```sql
CREATE TABLE evaluation_question_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    questionId INT NOT NULL,
    text VARCHAR(500) NOT NULL,
    `order` INT DEFAULT 0,
    isCorrect BOOLEAN DEFAULT FALSE, -- ✅ Nouveau champ
    ...
);
```

## Utilisation dans le code

### Récupérer les bonnes réponses

```php
// Dans EvaluationController.php
$optionsSql = "SELECT * FROM evaluation_question_options 
               WHERE questionId = ? AND isCorrect = 1 
               ORDER BY `order` ASC";
```

### Vérifier si une réponse est correcte

```typescript
// Dans le frontend
const question = evaluation.questions.find(q => q.id === questionId);
const correctOptions = question.options.filter(opt => opt.isCorrect);
const userAnswer = response.value;

// Pour les questions radio (une seule bonne réponse)
const isCorrect = correctOptions.some(opt => opt.text === userAnswer);

// Pour les questions checkbox (plusieurs bonnes réponses)
const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
const correctAnswers = correctOptions.map(opt => opt.text);
const isCorrect = userAnswers.length === correctAnswers.length && 
                  userAnswers.every(ans => correctAnswers.includes(ans));
```

## Affichage des bonnes réponses

### Pour les administrateurs (correction)

Lors de la correction d'une évaluation, vous pouvez :
1. Voir les réponses de l'élève
2. Comparer avec les bonnes réponses marquées
3. Calculer automatiquement le score

### Pour les élèves (si activé)

Si `showResults: true` dans l'évaluation :
- Les élèves peuvent voir leurs résultats après soumission
- Les bonnes réponses sont affichées en vert ✓
- Les mauvaises réponses sont affichées en rouge ✗

## Notes importantes

1. **Questions à choix unique (Radio)** : Une seule option peut être marquée comme correcte
2. **Questions à cases à cocher (Checkbox)** : Plusieurs options peuvent être marquées comme correctes
3. **Questions texte/textarea** : Pas de système de bonne réponse automatique (correction manuelle)
4. **Questions de notation (Rating)** : Pas de bonne réponse (évaluation subjective)

## Prochaines étapes (à implémenter)

### Interface de correction automatique
- [ ] Créer une page `/admin/evaluations/:id/responses` pour voir toutes les réponses
- [ ] Afficher les bonnes réponses en vert
- [ ] Calculer automatiquement les scores
- [ ] Exporter les résultats en PDF/Excel

### Affichage des résultats aux élèves
- [ ] Page de résultats après soumission
- [ ] Comparaison avec les bonnes réponses
- [ ] Statistiques de performance

## Exemple d'utilisation complète

### 1. Créer une évaluation avec bonnes réponses

```json
{
  "title": "Test de vocabulaire arabe",
  "questions": [
    {
      "text": "Quelle est la traduction de 'Assalamu alaykum' ?",
      "type": "radio",
      "required": true,
      "options": [
        { "text": "Paix sur vous", "isCorrect": true },
        { "text": "Bonjour", "isCorrect": false },
        { "text": "Au revoir", "isCorrect": false }
      ]
    },
    {
      "text": "Sélectionnez les salutations islamiques",
      "type": "checkbox",
      "required": true,
      "options": [
        { "text": "Assalamu alaykum", "isCorrect": true },
        { "text": "Bonjour", "isCorrect": false },
        { "text": "Barakallahu fik", "isCorrect": true },
        { "text": "Au revoir", "isCorrect": false }
      ]
    }
  ]
}
```

### 2. Vérifier les réponses lors de la correction

```php
// Dans EvaluationController.php - Méthode à créer
public function getCorrectAnswers($evaluationId) {
    $evaluation = Evaluation::find($evaluationId);
    $correctAnswers = [];
    
    foreach ($evaluation->questions() as $question) {
        if (in_array($question['type'], ['radio', 'checkbox', 'multiple_choice'])) {
            $correctOptions = array_filter($question['options'], function($opt) {
                return $opt['isCorrect'] == 1;
            });
            $correctAnswers[$question['id']] = array_map(function($opt) {
                return $opt['text'];
            }, $correctOptions);
        }
    }
    
    return $correctAnswers;
}
```

## Migration

Pour appliquer les changements :

```bash
# 1. Exécuter la migration SQL
mysql -u username -p database_name < php-api/migrations/add_correct_answer_to_evaluations.sql

# 2. Redémarrer le serveur PHP si nécessaire
# 3. Vider le cache du navigateur
```

## Support

Si vous avez des questions ou rencontrez des problèmes :
1. Vérifiez que la migration SQL a été exécutée
2. Vérifiez que le champ `isCorrect` existe dans la table `evaluation_question_options`
3. Vérifiez la console du navigateur pour les erreurs JavaScript
4. Vérifiez les logs PHP pour les erreurs serveur

