# 🔧 Résolution de l'erreur "Outdated Optimize Dep" avec Vite

## Problème
L'erreur `ERR_ABORTED 504 (Outdated Optimize Dep)` et `Failed to fetch dynamically imported module` se produit lorsque le cache Vite est obsolète après l'ajout de nouveaux composants ou dépendances.

## Solution

### 1. Nettoyer le cache (DÉJÀ FAIT ✅)
```bash
cd frontend
rm -rf .angular node_modules/.vite dist
```

### 2. Redémarrer le serveur de développement
**IMPORTANT** : Arrêtez complètement le serveur actuel (Ctrl+C) puis :

```bash
cd frontend
npm start
```

### 3. Vider le cache du navigateur
- **Chrome/Edge** : `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)
- Ou : Outils développeur → Clic droit sur rafraîchir → "Vider le cache et actualiser"

### 4. Si le problème persiste

#### Option A : Réinstaller les dépendances
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

#### Option B : Forcer la réoptimisation Vite
```bash
cd frontend
rm -rf .angular/cache/17.3.17/vite
npm start
```

## Explication technique

Angular 17+ utilise Vite en interne pour le développement. Quand vous ajoutez de nouveaux composants avec lazy loading (comme les évaluations), Vite doit optimiser les dépendances PrimeNG. Si le cache est obsolète, il essaie de charger des fichiers qui n'existent plus ou qui ont changé.

Le nettoyage du cache force Vite à :
1. Réanalyser toutes les dépendances
2. Réoptimiser les modules PrimeNG
3. Régénérer les chunks de code

## Vérification

Après redémarrage, vérifiez dans la console du navigateur :
- ✅ Pas d'erreurs `ERR_ABORTED 504`
- ✅ Pas d'erreurs `Failed to fetch dynamically imported module`
- ✅ Les composants se chargent correctement

## Composants concernés

Les composants suivants utilisent PrimeNG et nécessitent une optimisation Vite :
- `EvaluationListComponent` (TagModule, ConfirmDialogModule)
- `EvaluationFormComponent` (ToastModule, DropdownModule, etc.)
- `EvaluationTakeComponent` (RatingModule, ProgressBarModule, etc.)

