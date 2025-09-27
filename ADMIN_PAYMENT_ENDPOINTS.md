# 📊 Documentation - Endpoints Admin de Gestion des Paiements

## 🎯 Vue d'ensemble

Ces endpoints permettent aux administrateurs de gérer tous les paiements de l'application avec une vue complète des utilisateurs et leurs transactions.

## 🔐 Authentification

**Tous les endpoints nécessitent un rôle `admin`** via JWT.

## 📋 Endpoints Disponibles

### 1. 📊 Lister tous les paiements avec utilisateurs

**Endpoint :** `GET /api/admin/payments`

**Description :** Récupère tous les paiements avec les informations des utilisateurs associés.

**Paramètres de requête :**
- `status` (optionnel) : Filtrer par statut (`completed`, `pending`, `failed`)
- `method` (optionnel) : Filtrer par méthode de paiement
- `userId` (optionnel) : Filtrer par ID utilisateur
- `from` (optionnel) : Date de début (format YYYY-MM-DD)
- `to` (optionnel) : Date de fin (format YYYY-MM-DD)
- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre d'éléments par page (défaut: 25)

**Exemple de réponse :**
```json
{
    "success": true,
    "message": "Success",
    "data": {
        "items": [
            {
                "id": 45,
                "userId": 14,
                "courseId": null,
                "amount": 10,
                "currency": "EUR",
                "status": "completed",
                "paymentMethod": null,
                "transactionId": "test",
                "description": "test",
                "metadata": null,
                "paidAt": "2025-09-27 11:42:00",
                "createdAt": "2025-09-27 11:41:47",
                "updatedAt": "2025-09-27 11:42:00",
                "user": {
                    "id": 14,
                    "email": "ahmid.aitouali@gmail.com",
                    "phoneNumber": "+33695421608",
                    "firstName": "AHMID",
                    "lastName": "AIT OUALI",
                    "type": "parent",
                    "role": "admin",
                    "status": "approved"
                }
            }
        ],
        "pagination": {
            "total": 1,
            "page": 1,
            "limit": 25,
            "pages": 1
        }
    }
}
```

### 2. 🔄 Mettre à jour le statut d'un paiement

**Endpoint :** `PATCH /api/admin/payments/{id}/status`

**Description :** Met à jour le statut d'un paiement spécifique.

**Paramètres :**
- `id` (requis) : ID du paiement à modifier

**Body (JSON) :**
```json
{
    "status": "completed"
}
```

**Statuts possibles :** `pending`, `completed`, `failed`, `cancelled`

**Exemple de réponse :**
```json
{
    "success": true,
    "message": "Statut mis à jour avec succès",
    "data": {
        "id": 45,
        "status": "completed",
        "updatedAt": "2025-09-27 11:42:00"
    }
}
```

### 3. 📈 Récupérer les statistiques des paiements

**Endpoint :** `GET /api/admin/payments/stats`

**Description :** Récupère les statistiques complètes des paiements.

**Paramètres de requête :**
- `from` (optionnel) : Date de début pour les statistiques
- `to` (optionnel) : Date de fin pour les statistiques

**Exemple de réponse :**
```json
{
    "success": true,
    "message": "Success",
    "data": {
        "counts": {
            "total": 1,
            "completed": 1,
            "pending": 0,
            "failed": 0
        },
        "revenue": {
            "total": 10,
            "completed": 10,
            "pending": 0,
            "failed": 0
        },
        "byStatus": [
            {
                "status": "completed",
                "count": 1,
                "total_amount": "10.00"
            }
        ],
        "byMethod": [
            {
                "paymentMethod": null,
                "count": 1,
                "total_amount": "10.00"
            }
        ]
    }
}
```

## 🎨 Interface Frontend

**Route :** `/admin/payments`

**Fonctionnalités :**
- ✅ Liste complète des paiements avec pagination
- ✅ Filtres par statut, méthode, utilisateur, dates
- ✅ Mise à jour du statut en temps réel
- ✅ Statistiques en temps réel
- ✅ Affichage des informations utilisateur
- ✅ Interface responsive et moderne

## 🔧 Configuration Technique

### Backend (PHP)
- **Fichier :** `php-api/src/Controllers/PaymentController.php`
- **Méthodes :** `getAllPaymentsWithUsers()`, `updatePaymentStatus()`, `getPaymentStats()`
- **Routes :** Configurées dans `php-api/src/Core/Application.php`

### Frontend (Angular)
- **Service :** `frontend/src/app/services/payment.service.ts`
- **Composant :** `frontend/src/app/admin/payments/admin-payments.component.ts`
- **URLs :** `https://centre-culturel-olivier.com/api/admin/payments`

## 🚀 Utilisation

1. **Accéder à l'interface :** Aller sur `/admin/payments`
2. **Consulter les paiements :** La liste se charge automatiquement
3. **Filtrer :** Utiliser les filtres en haut de page
4. **Modifier un statut :** Cliquer sur le dropdown de statut
5. **Voir les stats :** Les statistiques s'affichent en temps réel

## 🔒 Sécurité

- ✅ Authentification JWT requise
- ✅ Vérification du rôle `admin`
- ✅ Validation des paramètres d'entrée
- ✅ Gestion des erreurs sécurisée

## 📝 Notes de Maintenance

- Les endpoints sont optimisés pour de gros volumes de données
- La pagination est gérée côté serveur
- Les jointures SQL sont optimisées pour les performances
- Les erreurs sont loggées pour le debugging

---

**Dernière mise à jour :** 27 septembre 2025  
**Version :** 1.0  
**Statut :** ✅ Opérationnel
