# ✅ Vérification étape par étape : Case à cocher "Bonne réponse"

## Étapes pour voir la case à cocher

### 1. Vérifier que vous êtes sur la bonne page
- URL : `/admin/evaluations/create` ou `/admin/evaluations/edit/:id`
- Vous devez voir le formulaire de création/modification d'évaluation

### 2. Ajouter une question
- Cliquez sur "Ajouter une question" si aucune question n'existe
- Ou utilisez une question existante

### 3. Sélectionner le bon type de question
**IMPORTANT** : La case à cocher n'apparaît QUE pour ces types :
- ✅ **Choix unique (Radio)**
- ✅ **Cases à cocher (Checkbox)**
- ✅ **Choix multiple (Multiple Choice)**

Elle n'apparaît PAS pour :
- ❌ Texte court
- ❌ Texte long
- ❌ Note (1-5)

### 4. Ajouter des options
- Une fois le type sélectionné (Radio/Checkbox), vous verrez une section "Options de réponse"
- Cliquez sur le bouton **"+ Ajouter une option"** (bouton vert)
- Une option apparaîtra avec :
  - Un champ texte pour saisir l'option
  - Une case à cocher "✓ Bonne réponse" (dans un encadré vert)
  - Un bouton "✕ Supprimer"

### 5. Vérifier visuellement
La case à cocher devrait être :
- Dans un encadré blanc avec bordure verte
- À droite du champ texte de l'option
- Avec le texte "✓ Bonne réponse" en vert à côté
- Taille : 20x20 pixels (w-5 h-5)

## Si vous ne voyez toujours pas la case à cocher

### Vérification 1 : Console du navigateur
1. Ouvrez la console (F12 ou Cmd+Option+I)
2. Regardez s'il y a des erreurs en rouge
3. Si oui, copiez-les et vérifiez-les

### Vérification 2 : Vérifier le code HTML
1. Dans la console, tapez : `document.querySelector('[formcontrolname="isCorrect"]')`
2. Si cela retourne `null`, le champ n'existe pas dans le DOM
3. Si cela retourne un élément, le problème est visuel (CSS)

### Vérification 3 : Redémarrer le serveur
```bash
# Arrêtez le serveur (Ctrl+C)
cd frontend
npm start
```

### Vérification 4 : Vider le cache
- Chrome/Edge : `Cmd+Shift+R` (Mac) ou `Ctrl+Shift+R` (Windows)
- Ou : Outils développeur → Application → Clear storage → Clear site data

### Vérification 5 : Vérifier les fichiers
Assurez-vous que ces lignes existent dans les fichiers :

**evaluation-form.component.html** (ligne ~275-283) :
```html
<input 
  type="checkbox" 
  formControlName="isCorrect" 
  [id]="'correct' + i + '_' + j"
  class="w-5 h-5 text-green-600 border-2 border-gray-400 rounded cursor-pointer">
<label [for]="'correct' + i + '_' + j">
  ✓ Bonne réponse
</label>
```

**evaluation-form.component.ts** (ligne ~309) :
```typescript
isCorrect: [false]
```

## Test rapide

1. Créez une nouvelle évaluation
2. Ajoutez une question
3. Sélectionnez "Choix unique (Radio)"
4. Cliquez sur "+ Ajouter une option"
5. **Vous DEVRIEZ voir** :
   ```
   [Champ texte]  [☐ ✓ Bonne réponse]  [✕ Supprimer]
   ```

## Si rien ne fonctionne

Essayez cette version de test avec un style encore plus visible :

```html
<div class="flex items-center gap-3 bg-yellow-100 p-4 border-2 border-yellow-500 rounded">
  <input 
    type="checkbox" 
    formControlName="isCorrect" 
    [id]="'correct' + i + '_' + j"
    style="width: 24px; height: 24px; border: 2px solid green;">
  <label [for]="'correct' + i + '_' + j" style="font-size: 16px; color: green; font-weight: bold;">
    ✓ BONNE RÉPONSE
  </label>
</div>
```

## Contact

Si après toutes ces vérifications vous ne voyez toujours pas la case à cocher :
1. Faites une capture d'écran de votre formulaire
2. Ouvrez la console (F12) et copiez les erreurs
3. Vérifiez que vous avez bien sélectionné un type Radio/Checkbox
4. Vérifiez que vous avez bien cliqué sur "+ Ajouter une option"

