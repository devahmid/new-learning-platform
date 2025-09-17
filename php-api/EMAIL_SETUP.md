# Configuration de l'envoi d'emails

## 📧 Configuration actuelle

L'API PHP est configurée pour envoyer des emails de réinitialisation de mot de passe. Par défaut, elle utilise la fonction `mail()` de PHP.

## 🔧 Configuration SMTP (Recommandée)

Pour un envoi d'emails plus fiable, configurez SMTP dans le fichier `config/email.php` :

### Pour Gmail
```php
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'votre-email@gmail.com');
define('SMTP_PASSWORD', 'votre-mot-de-passe-app'); // Mot de passe d'application
```

### Pour Hostinger
```php
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'noreply@centre-culturel-olivier.fr');
define('SMTP_PASSWORD', 'votre-mot-de-passe');
```

### Pour OVH
```php
define('SMTP_HOST', 'ssl0.ovh.net');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'noreply@centre-culturel-olivier.fr');
define('SMTP_PASSWORD', 'votre-mot-de-passe');
```

## 🧪 Test de l'envoi d'emails

### 1. Test via l'API
```bash
curl -X POST "https://centre-culturel-olivier.fr/api/users/request-password-reset" \
  -H "Content-Type: application/json" \
  -d '{"email": "ahmid.aitouali@gmail.com"}'
```

### 2. Test local (si PHP est installé)
```bash
cd php-api
php test-email.php
```

## 📋 Vérifications

1. **Vérifiez les logs du serveur** pour voir si l'email est envoyé :
   ```bash
   tail -f /var/log/apache2/error.log
   ```

2. **Vérifiez la boîte de réception** de l'email test

3. **Vérifiez les spams** si l'email n'apparaît pas

## 🔍 Dépannage

### Problème : Email non reçu
- Vérifiez la configuration SMTP
- Vérifiez les logs d'erreur PHP
- Vérifiez que l'email existe dans la base de données
- Vérifiez les spams

### Problème : Erreur SMTP
- Vérifiez les identifiants SMTP
- Vérifiez que le port 587 est ouvert
- Vérifiez que l'authentification est activée

### Problème : Fonction mail() désactivée
- Contactez votre hébergeur pour activer la fonction mail()
- Ou configurez SMTP

## 📝 Notes importantes

- L'email contient un lien valide pendant 1 heure
- Le token est unique et sécurisé
- L'email est envoyé en HTML et texte
- Le message de sécurité ne révèle pas si l'email existe

## 🎯 Prochaines étapes

1. Configurer SMTP avec votre hébergeur
2. Tester l'envoi d'emails
3. Personnaliser le template d'email si nécessaire
4. Ajouter d'autres types d'emails (bienvenue, confirmation, etc.)
