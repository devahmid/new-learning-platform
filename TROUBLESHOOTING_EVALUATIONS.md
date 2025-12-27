# Dépannage - Erreur de chargement des modules d'évaluations

## Erreur : "Failed to fetch dynamically imported module"

Cette erreur peut survenir lors du lazy loading des composants. Voici les solutions :

### Solution 1 : Redémarrer le serveur de développement

1. Arrêtez le serveur Angular (Ctrl+C)
2. Supprimez le cache :
   ```bash
   cd frontend
   rm -rf .angular dist node_modules/.cache
   ```
3. Redémarrez le serveur :
   ```bash
   npm start
   # ou
   ng serve
   ```

### Solution 2 : Vider le cache du navigateur

1. Ouvrez les outils de développement (F12)
2. Clic droit sur le bouton de rafraîchissement
3. Sélectionnez "Vider le cache et effectuer une actualisation forcée"
4. Ou utilisez Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)

### Solution 3 : Vérifier les routes

Assurez-vous que les routes sont correctement configurées dans `app.routes.ts` :

```typescript
{
  path: 'admin/evaluations',
  loadComponent: () =>
    import('./admin/evaluations/evaluation-list/evaluation-list.component').then(
      (m) => m.EvaluationListComponent
    ),
}
```

### Solution 4 : Vérifier les exports

Tous les composants doivent exporter leur classe :

```typescript
export class EvaluationListComponent implements OnInit { ... }
export class EvaluationFormComponent implements OnInit { ... }
export class EvaluationTakeComponent implements OnInit { ... }
```

### Solution 5 : Vérifier les dépendances PrimeNG

Assurez-vous que PrimeNG est installé :

```bash
cd frontend
npm install primeng primeicons
```

### Solution 6 : Vérifier les providers

Les composants qui utilisent `MessageService` doivent l'avoir dans leurs providers :

```typescript
@Component({
  providers: [MessageService],
  // ...
})
```

## Vérification rapide

1. ✅ Les fichiers existent dans les bons dossiers
2. ✅ Les exports sont corrects
3. ✅ Les routes sont configurées
4. ✅ Les providers sont ajoutés
5. ✅ Le cache est vidé
6. ✅ Le serveur est redémarré

## Si le problème persiste

1. Vérifiez la console du navigateur pour plus de détails
2. Vérifiez les logs du serveur Angular
3. Vérifiez que tous les modules PrimeNG sont importés correctement
4. Essayez de compiler en mode production pour voir s'il y a d'autres erreurs

