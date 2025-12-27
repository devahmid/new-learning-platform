# 🔧 Dépannage : Option "✓ Bonne réponse" non visible

## Vérifications à faire

### 1. Vérifier que vous avez le bon type de question

L'option "✓ Bonne réponse" n'apparaît **QUE** pour les questions de type :
- ✅ **Choix unique (Radio)**
- ✅ **Cases à cocher (Checkbox)**
- ✅ **Choix multiple (Multiple Choice)**

Elle n'apparaît **PAS** pour :
- ❌ Texte court
- ❌ Texte long
- ❌ Note (1-5)

### 2. Redémarrer le serveur Angular

Le code a été modifié, il faut redémarrer le serveur :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis redémarrez :
cd frontend
npm start
```

### 3. Vider le cache du navigateur

- **Chrome/Edge** : `Cmd+Shift+R` (Mac) ou `Ctrl+Shift+R` (Windows)
- Ou : Outils développeur → Clic droit sur rafraîchir → "Vider le cache et actualiser"

### 4. Vérifier la console du navigateur

Ouvrez la console (F12) et vérifiez s'il y a des erreurs :
- Erreurs JavaScript
- Erreurs de chargement de modules
- Erreurs PrimeNG

### 5. Vérifier que vous avez ajouté des options

L'option "✓ Bonne réponse" apparaît **seulement** si :
1. Vous avez sélectionné un type de question avec options (Radio/Checkbox)
2. Vous avez cliqué sur "+ Ajouter une option"
3. Au moins une option existe dans la liste

## Test rapide

1. **Créez une nouvelle évaluation** : `/admin/evaluations/create`
2. **Ajoutez une question**
3. **Sélectionnez le type** : "Choix unique (Radio)" ou "Cases à cocher"
4. **Cliquez sur "+ Ajouter une option"**
5. **Vous devriez voir** : 
   - Un champ texte pour l'option
   - Une case à cocher "✓ Bonne réponse"
   - Un bouton ✕ pour supprimer

## Si ça ne fonctionne toujours pas

### Vérifier les fichiers modifiés

Assurez-vous que ces fichiers ont bien été modifiés :

1. **`evaluation-form.component.html`** (ligne ~275-282)
   ```html
   <p-checkbox 
     formControlName="isCorrect" 
     [inputId]="'correct' + i + '_' + j"
     [binary]="true"></p-checkbox>
   <label [for]="'correct' + i + '_' + j">
     ✓ Bonne réponse
   </label>
   ```

2. **`evaluation-form.component.ts`** (ligne ~251 et ~309)
   ```typescript
   isCorrect: [option.isCorrect || false]  // Ligne ~251
   isCorrect: [false]  // Ligne ~309
   ```

3. **`evaluation.model.ts`** (ligne ~6)
   ```typescript
   isCorrect?: boolean;
   ```

### Vérifier les imports

Dans `evaluation-form.component.ts`, vérifiez que `CheckboxModule` est importé :

```typescript
import { CheckboxModule } from 'primeng/checkbox';

// Et dans les imports du @Component :
imports: [
  // ...
  CheckboxModule,
  // ...
]
```

## Solution alternative (si PrimeNG ne fonctionne pas)

Si le `p-checkbox` de PrimeNG ne s'affiche pas, vous pouvez utiliser une checkbox HTML native :

```html
<div class="flex items-center space-x-2">
  <input 
    type="checkbox" 
    formControlName="isCorrect" 
    [id]="'correct' + i + '_' + j"
    class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500">
  <label [for]="'correct' + i + '_' + j" 
    class="text-sm text-green-700 font-medium cursor-pointer whitespace-nowrap">
    ✓ Bonne réponse
  </label>
</div>
```

## Vérification finale

1. ✅ Type de question = Radio/Checkbox/Multiple Choice
2. ✅ Au moins une option ajoutée
3. ✅ Serveur Angular redémarré
4. ✅ Cache du navigateur vidé
5. ✅ Pas d'erreurs dans la console
6. ✅ CheckboxModule importé

Si après toutes ces vérifications ça ne fonctionne toujours pas, vérifiez les logs du serveur Angular pour voir s'il y a des erreurs de compilation.

