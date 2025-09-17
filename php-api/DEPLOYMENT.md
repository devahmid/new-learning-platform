# 🚀 Guide de Déploiement - API PHP

## 📋 Étapes de déploiement sur centre-culturel-olivier.fr

### **1. Préparation des fichiers**

Uploadez **TOUS** les fichiers du dossier `php-api/` vers votre serveur dans le dossier `api/` :

```
centre-culturel-olivier.fr/
├── index.html (votre site actuel)
├── assets/
└── api/                    ← Créer ce dossier
    ├── index.php          ← Point d'entrée principal
    ├── .htaccess          ← Configuration Apache
    ├── .user.ini          ← Configuration PHP
    ├── cors-test.php      ← Fichier de test CORS
    ├── config/
    │   ├── autoloader.php
    │   ├── database.php   ← IMPORTANT: Configurer BDD
    │   └── jwt.php
    ├── src/
    │   ├── Core/
    │   ├── Controllers/
    │   ├── Models/
    │   └── Utils/
    └── database/
        └── schema.sql     ← Script de création BDD
```

### **2. Configuration de la base de données**

#### **A. Créer la base de données**

Dans votre panel d'hébergement (cPanel, hPanel, etc.) :

1. **Créer une nouvelle base de données** :
   - Nom : `u281164575_centre` ✅ (déjà configuré)
   - Utilisateur : `u281164575_omar` ✅ (déjà configuré)
   - Mot de passe : `Elodie14061990@` ✅ (déjà configuré)

#### **B. Importer le schéma**

1. **Via phpMyAdmin** (recommandé) :

   - Connectez-vous à phpMyAdmin
   - Sélectionnez la base `u281164575_centre`
   - Onglet "Importer"
   - Choisir le fichier `database/schema.sql`
   - Cliquer "Exécuter"

2. **Via ligne de commande** (si disponible) :
   ```bash
   mysql -u u281164575_omar -p u281164575_centre < database/schema.sql
   ```

### **3. Configuration des permissions**

Après upload, configurez les permissions via FTP ou File Manager :

```bash
chmod 755 api/
chmod 644 api/.htaccess
chmod 644 api/.user.ini
chmod 644 api/index.php
chmod 755 api/config/
chmod 644 api/config/*
chmod 755 api/src/
chmod -R 644 api/src/
```

### **4. Tests de fonctionnement**

#### **A. Test CORS**

```bash
curl -X OPTIONS https://centre-culturel-olivier.fr/api/cors-test.php \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Résultat attendu** : Status 200 avec headers CORS

#### **B. Test API Health**

```bash
curl -X GET https://centre-culturel-olivier.fr/api/health
```

**Résultat attendu** :

```json
{
  "success": true,
  "message": "API is running",
  "data": {
    "status": "OK",
    "timestamp": "2025-09-02 21:54:00",
    "version": "1.0.0",
    "php_version": "8.x",
    "database": "connected"
  }
}
```

#### **C. Test authentification**

```bash
curl -X POST https://centre-culturel-olivier.fr/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmid.aitouali@gmail.com","password":"password"}'
```

#### **D. Test exercices**

```bash
curl -X GET "https://centre-culturel-olivier.fr/api/admin/exercises?page=1&limit=5"
```

### **5. Vérification depuis le navigateur**

Ouvrez la console de votre navigateur et testez :

```javascript
// Test CORS
fetch("https://centre-culturel-olivier.fr/api/cors-test.php")
  .then((response) => response.json())
  .then((data) => console.log("✅ CORS OK:", data))
  .catch((error) => console.error("❌ CORS Error:", error));

// Test API
fetch("https://centre-culturel-olivier.fr/api/health")
  .then((response) => response.json())
  .then((data) => console.log("✅ API OK:", data))
  .catch((error) => console.error("❌ API Error:", error));
```

### **6. Résolution des problèmes courants**

#### **Erreur 500 (Internal Server Error)**

- Vérifier les permissions des fichiers
- Vérifier la configuration PHP dans `.user.ini`
- Consulter les logs d'erreur de l'hébergeur

#### **Erreur de base de données**

- Vérifier les identifiants dans `config/database.php`
- Vérifier que la base de données existe
- Vérifier que le schéma SQL a été importé

#### **Erreurs CORS persistantes**

- Vérifier que `.htaccess` est bien uploadé
- Vérifier que le serveur supporte les headers Apache
- Tester avec le fichier `cors-test.php`

### **7. Configuration production**

Une fois que tout fonctionne :

1. **Changer la clé JWT** dans `config/jwt.php` :

   ```php
   const SECRET_KEY = 'votre-nouvelle-cle-super-secrete-et-longue-pour-production';
   ```

2. **Désactiver l'affichage des erreurs** dans `.user.ini` :

   ```ini
   display_errors = Off
   ```

3. **Réactiver l'authentification** dans les contrôleurs admin si nécessaire

### **8. Test final depuis Angular**

Votre frontend Angular devrait maintenant pouvoir se connecter à l'API sans erreur CORS !

## 🆘 Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs** de votre hébergeur
2. **Testez chaque étape** individuellement avec curl
3. **Vérifiez la configuration** de la base de données
4. **Contactez le support** de votre hébergeur si nécessaire

Une fois l'API déployée, toutes les erreurs CORS disparaîtront ! 🎉
