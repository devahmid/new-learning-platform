# 🔧 **Endpoint Manquant pour la Modification d'Enfant**

## 📋 **Problème Identifié**

Le frontend du dashboard essaie d'accéder à un endpoint qui n'existe pas encore :

- **`PATCH /api/users/children/15`** - 404 Not Found

## ✅ **Solution Créée**

### **Endpoint `/api/users/children/{id}`**

**Fichier modifié :**

- ✅ `php-api/src/Controllers/UserController.php` - Ajout de la méthode `updateChild($childId)`

**Méthode ajoutée :**

```php
public function updateChild($childId) {
    try {
        $child = User::find($childId);

        if (!$child) {
            Response::json(['error' => 'Enfant non trouvé'], 404);
            return;
        }

        // Vérifier que c'est bien un enfant
        if ($child->type !== 'child') {
            Response::json(['error' => 'Cet utilisateur n\'est pas un enfant'], 400);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            Response::json(['error' => 'Données JSON invalides'], 400);
            return;
        }

        // Mettre à jour les champs autorisés
        $allowedFields = ['firstName', 'lastName', 'dateOfBirth', 'levelId', 'classeId'];
        foreach ($data as $key => $value) {
            if (in_array($key, $allowedFields)) {
                $child->$key = $value;
            }
        }

        if ($child->save()) {
            Response::json($child->toArray(), 200);
        } else {
            Response::json(['error' => 'Erreur lors de la mise à jour de l\'enfant'], 500);
        }

    } catch (Exception $e) {
        Response::json(['error' => 'Erreur lors de la mise à jour de l\'enfant'], 500);
    }
}
```

**Route ajoutée :**

- ✅ `PATCH /api/users/children/{id}` - Met à jour un enfant

## 📁 **Fichiers à Déployer**

### **Fichiers Modifiés**

- ✅ `php-api/src/Controllers/UserController.php`
- ✅ `php-api/src/Core/Application.php`

## 🧪 **Test de Validation**

Après déploiement, testez :

```bash
curl -X PATCH "https://centre-culturel-olivier.fr/api/users/children/15" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test Updated"}'
```

**Résultat attendu :**

```json
{
  "id": 15,
  "firstName": "Test Updated",
  "lastName": "Child",
  "type": "child",
  "parentId": 14,
  ...
}
```

## 🎯 **Résultat Final**

Après déploiement, le dashboard devrait :

- ✅ Plus d'erreur 404 pour `PATCH /api/users/children/{id}`
- ✅ Pouvoir modifier les informations des enfants
- ✅ Mettre à jour les champs autorisés (firstName, lastName, dateOfBirth, levelId, classeId)
- ✅ Retourner l'enfant mis à jour
