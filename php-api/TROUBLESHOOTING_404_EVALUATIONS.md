# 🔧 Résolution de l'erreur 404 pour `/api/evaluations`

## Problème
L'endpoint `POST https://centre-culturel-olivier.com/api/evaluations` retourne une erreur **404 Not Found**.

## Causes possibles

### 1. Configuration du serveur web
Le dossier `php-api` doit être accessible via `/api/` sur votre serveur. Vérifiez :

#### Option A : Le dossier s'appelle `api` sur le serveur
Si votre structure est :
```
/var/www/html/
  └── api/
      ├── index.php
      ├── .htaccess
      └── ...
```
Alors l'URL `https://centre-culturel-olivier.com/api/evaluations` devrait fonctionner.

#### Option B : Le dossier s'appelle `php-api` sur le serveur
Si votre structure est :
```
/var/www/html/
  └── php-api/
      ├── index.php
      ├── .htaccess
      └── ...
```
Alors vous devez soit :
- Renommer le dossier en `api`
- Créer un lien symbolique : `ln -s php-api api`
- Modifier l'URL dans `environment.ts` : `https://centre-culturel-olivier.com/php-api/api/evaluations`

### 2. Vérification du module Apache mod_rewrite
Le `.htaccess` nécessite `mod_rewrite`. Vérifiez qu'il est activé :

```bash
# Sur le serveur
apache2ctl -M | grep rewrite
# ou
php -m | grep rewrite
```

Si ce n'est pas activé :
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### 3. Test du routage
Accédez à : `https://centre-culturel-olivier.com/api/test-routes.php`

Ce fichier affichera :
- Si les fichiers sont accessibles
- Si les routes sont chargées
- Si le contrôleur existe
- Les informations de débogage

### 4. Vérification des permissions
Assurez-vous que les fichiers ont les bonnes permissions :

```bash
chmod 644 index.php
chmod 644 .htaccess
chmod -R 755 src/
chmod -R 755 config/
```

### 5. Vérification des logs
Consultez les logs Apache pour voir l'erreur exacte :

```bash
tail -f /var/log/apache2/error.log
# ou
tail -f /var/log/apache2/access.log
```

### 6. Test direct du contrôleur
Créez un fichier `test-controller.php` :

```php
<?php
require_once __DIR__ . '/config/autoloader.php';
require_once __DIR__ . '/config/database.php';

$controller = new App\Controllers\EvaluationController();
echo "Controller loaded successfully!";
```

Accédez à : `https://centre-culturel-olivier.com/api/test-controller.php`

## Solutions rapides

### Solution 1 : Vérifier la structure des dossiers
```bash
# Sur le serveur
cd /var/www/html  # ou votre chemin
ls -la
# Vérifiez si vous avez un dossier 'api' ou 'php-api'
```

### Solution 2 : Créer un lien symbolique (si nécessaire)
```bash
# Si vous avez 'php-api' mais besoin de 'api'
cd /var/www/html
ln -s php-api api
```

### Solution 3 : Vérifier le .htaccess
Assurez-vous que le `.htaccess` est présent dans le dossier de l'API et qu'il contient :

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

### Solution 4 : Test avec curl
Testez directement depuis le serveur :

```bash
curl -X POST https://centre-culturel-olivier.com/api/evaluations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test","isActive":true,"questions":[]}'
```

## Vérifications effectuées ✅

- ✅ Routes définies dans `Application.php` (ligne 225)
- ✅ Contrôleur `EvaluationController` existe avec méthode `create()`
- ✅ CORS configuré pour `centre-culturel-olivier.com`
- ✅ `.htaccess` configuré correctement

## Prochaines étapes

1. **Accédez à** `https://centre-culturel-olivier.com/api/test-routes.php`
2. **Vérifiez les logs** du serveur web
3. **Testez avec curl** depuis le serveur
4. **Vérifiez la structure** des dossiers sur le serveur

## Contact support

Si le problème persiste, fournissez :
- Le résultat de `test-routes.php`
- Les logs Apache
- La structure de vos dossiers sur le serveur
- La configuration de votre VirtualHost Apache/Nginx

