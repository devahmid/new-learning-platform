# Guide d'hébergement et migration — Plateforme Darsi

Document de référence pour sortir de l'hébergement mutualisé et déployer une infrastructure adaptée à Angular + API + médias (PDF, vidéos).

**Dernière mise à jour :** 14 juillet 2026  
**Contexte :** Production actuelle sur hébergement mutualisé (`centre-culturel-olivier.fr`) avec API PHP + MySQL. Retours parents : note 4,4/5 mais navigation faible (3,9/5) et signalements « le site ne fonctionne pas toujours bien ».

---

## Table des matières

1. [Diagnostic : pourquoi le mutualisé ne convient pas](#1-diagnostic--pourquoi-le-mutualisé-ne-convient-pas)
2. [Ce qu'il ne faut PAS changer](#2-ce-quil-ne-faut-pas-changer)
3. [Architecture cible recommandée](#3-architecture-cible-recommandée)
4. [Stack technique](#4-stack-technique)
5. [Configuration serveur](#5-configuration-serveur)
6. [Hébergeurs recommandés](#6-hébergeurs-recommandés)
7. [Deux chemins de migration](#7-deux-chemins-de-migration)
8. [Exemple de configuration Nginx](#8-exemple-de-configuration-nginx)
9. [Stockage des médias (PDF, vidéos)](#9-stockage-des-médias-pdf-vidéos)
10. [Lien avec les retours parents](#10-lien-avec-les-retours-parents)
11. [Plan d'action étape par étape](#11-plan-daction-étape-par-étape)
12. [Budget mensuel estimé](#12-budget-mensuel-estimé)
13. [Checklist de migration](#13-checklist-de-migration)
14. [Fichiers du projet concernés](#14-fichiers-du-projet-concernés)

---

## 1. Diagnostic : pourquoi le mutualisé ne convient pas

| Limite du mutualisé | Impact sur la plateforme |
|---------------------|--------------------------|
| CPU / RAM partagés | Lenteurs, timeouts, comportement imprévisible |
| Apache + `.htaccess` | Routes API fragiles (ex. `/api/feedback` → 404 si `Application.php` pas à jour) |
| Peu de workers PHP | Blocages quand plusieurs utilisateurs se connectent en même temps |
| Uploads limités | PDF, vidéos, images de cours difficiles à gérer |
| Pas de cache (Redis) | Chaque requête tape la base de données |
| Logs quasi inexistants | Impossible de diagnostiquer « ça ne marche pas toujours » |
| MySQL partagé | Performances variables selon la charge du serveur |

**Conclusion :** le problème n'est pas Angular. En production, Angular = fichiers statiques (`index.html`, JS, CSS) qui peuvent être très rapides. Ce qui ralentit et instabilise, c'est l'**API + base de données + fichiers lourds** sur un serveur partagé.

---

## 2. Ce qu'il ne faut PAS changer

- **Angular** — déjà en place, bien structuré, compatible multi-API
- **Le frontend** — pas besoin de réécrire l'interface
- **La logique métier** — déjà dupliquée entre PHP (prod) et NestJS (dev)

Le vrai changement = **l'infrastructure**, pas le framework frontend.

---

## 3. Architecture cible recommandée

```
                         Internet
                             │
                    Cloudflare (CDN + SSL + cache)
                             │
                   ┌─────────┴─────────┐
                   │   VPS (Nginx)       │
                   │ centre-culturel-    │
                   │ olivier.fr          │
                   └─────────┬───────────┘
              ┌──────────────┼──────────────┐
              │              │              │
        Angular (static)   API NestJS    PostgreSQL
        /var/www/frontend  :3000         :5432
              │
        Fichiers lourds → Cloudflare R2 / Backblaze B2
        (PDF, vidéos, images de cours)
```

### Rôles de chaque couche

| Couche | Rôle |
|--------|------|
| **Cloudflare** | CDN, cache des assets, protection DDoS, SSL |
| **Nginx** | Reverse proxy, sert Angular, route `/api` vers NestJS |
| **Angular (build)** | Interface utilisateur (fichiers statiques) |
| **NestJS** | API REST, authentification JWT, uploads |
| **PostgreSQL** | Base de données relationnelle |
| **R2 / B2** | Stockage objet pour PDF et vidéos (hors VPS) |

---

## 4. Stack technique

| Couche | Technologie | Statut dans le projet |
|--------|-------------|----------------------|
| Frontend | Angular 17 + PrimeNG + Tailwind | ✅ `frontend/` |
| Serveur web | Nginx | ✅ `frontend/Dockerfile`, `docker-compose.yml` |
| API (cible) | NestJS + TypeORM | ✅ `app/`, `nestjs-api/` |
| API (actuelle prod) | PHP + PDO + MySQL | ✅ `php-api/` |
| Base de données (cible) | PostgreSQL 15 | ✅ `docker-compose.yml` |
| Base de données (actuelle) | MySQL | ✅ `php-api/config/database.php` |
| Conteneurisation | Docker Compose | ✅ `docker-compose.yml` |
| SSL | Let's Encrypt + Certbot | ✅ `certbot/` |
| Monitoring (optionnel) | Grafana + Loki | ✅ prévu dans `docker-compose.yml` |
| Stockage médias | Cloudflare R2 ou Backblaze B2 | ❌ à mettre en place |

---

## 5. Configuration serveur

### Specs minimales (50–200 familles)

| Ressource | Minimum | Confortable |
|-----------|---------|-------------|
| vCPU | 2 | 2–4 |
| RAM | 4 Go | 8 Go |
| Disque | 40 Go SSD | 80 Go SSD |
| OS | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS |
| Bande passante | 20 To/mois | 20 To/mois |

### Logiciels à installer sur le VPS

```bash
# Ubuntu 24.04
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx
sudo usermod -aG docker $USER
```

---

## 6. Hébergeurs recommandés

| Hébergeur | Offre | Prix ~/mois | Note |
|-----------|-------|-------------|------|
| **Hetzner** | CX22 (2 vCPU, 4 Go) | ~5 € | ⭐ Meilleur rapport qualité/prix pour Docker |
| **OVH** | VPS Essential | ~6–10 € | Français, support FR |
| **Scaleway** | DEV1-M | ~8 € | Simple, datacenter EU |
| **DigitalOcean** | Droplet 2 Go | ~12 $ | Très documenté, idéal débutants |

### À éviter pour cette application

- Hébergement mutualisé (Hostinger, OVH Web, etc.) — même offre « premium »
- Hébergement sans accès root / Docker
- Serveur < 2 Go RAM avec vidéos en local

---

## 7. Deux chemins de migration

### Option A — Rapide (1–2 jours) : VPS + garder PHP

Déplacer l'existant sans réécrire l'API.

```
Nginx
├── /          → Angular (build dist/)
├── /api/*     → PHP-FPM (php-api actuel)
└── /uploads/* → stockage local ou R2
```

| Avantages | Inconvénients |
|-----------|---------------|
| Migration rapide | Deux codebases à maintenir (PHP + NestJS) |
| MySQL peut rester | Dette technique prolongée |
| Peu de risque fonctionnel | Pas de gain dev long terme |

**Quand choisir :** urgence de stabilité, pas le temps de migrer l'API tout de suite.

---

### Option B — Recommandée (1–2 semaines) : VPS + NestJS + PostgreSQL

Activer la stack déjà présente dans `docker-compose.yml`.

```
docker-compose up -d
├── frontend  → Nginx + Angular
├── backend   → NestJS (app/)
└── db        → PostgreSQL
```

| Avantages | Inconvénients |
|-----------|---------------|
| Une seule API (dev = prod) | Migration BDD MySQL → PostgreSQL |
| Plus stable et maintenable | 1–2 semaines de travail |
| Fini les `.htaccess` et routes fragiles | Tests de non-régression nécessaires |

**Quand choisir :** objectif long terme, maintenance simplifiée.

---

## 8. Exemple de configuration Nginx

Fichier de référence : `frontend/nginx/default.conf` (à adapter sur le VPS).

```nginx
server {
    listen 80;
    server_name centre-culturel-olivier.fr www.centre-culturel-olivier.fr;

    # Redirection HTTPS (après Certbot)
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name centre-culturel-olivier.fr www.centre-culturel-olivier.fr;

    # SSL (géré par Certbot)
    ssl_certificate /etc/letsencrypt/live/centre-culturel-olivier.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/centre-culturel-olivier.fr/privkey.pem;

    # Frontend Angular (SPA)
    location / {
        root /var/www/frontend;
        try_files $uri $uri/ /index.html;

        # Cache long pour assets hashés
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API NestJS
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        client_max_body_size 50M;
    }

    # Médias (PDF, vidéos) — local ou redirect R2
    location /media/ {
        alias /var/www/media/;
        expires 7d;
        add_header Cache-Control "public";
    }
}
```

---

## 9. Stockage des médias (PDF, vidéos)

Les parents demandent explicitement :
- PDF des cours téléchargeables après les cours
- Vidéos par chapitre, rejouables à volonté

### Pourquoi ne pas stocker sur le VPS

- Disque limité
- Bande passante consommée
- Téléchargements lents pour les familles
- Sauvegardes plus lourdes

### Solution recommandée : stockage objet + CDN

| Service | Usage | Coût départ |
|---------|-------|-------------|
| **Cloudflare R2** | PDF, vidéos, images | Quasi gratuit (< 10 Go) |
| **Backblaze B2** | Alternative | ~0,005 $/Go/mois |
| **Cloudflare CDN** | Cache devant le site | Gratuit (plan Free) |

### Intégration côté API

1. Upload admin → API NestJS → envoi vers R2/B2
2. URL publique ou signée retournée à Angular
3. Bouton « Télécharger le PDF » sur chaque leçon

---

## 10. Lien avec les retours parents

Données du sondage (11 réponses, juillet 2026) :

| Indicateur | Valeur | Action infra associée |
|------------|--------|----------------------|
| Note globale | 4,4/5 | Globalement bon — pas de refonte UI urgente |
| NPS | 55 (0 détracteur) | Confiance élevée |
| Navigation | 3,9/5 (point faible) | Nginx + routing propre, audit UX navigation |
| « Ne fonctionne pas toujours » | 2 mentions | VPS + logs + monitoring |
| PDF téléchargeables | 2 demandes | R2/B2 + endpoint download |
| Vidéos par chapitre | 1 demande | Stockage objet + player stable |

### Priorités produit post-migration

1. **PDF téléchargeables** par leçon/chapitre
2. **Stabilité** — logs, monitoring, tests mobile
3. **Navigation** — audit parcours parent → cours
4. **Vidéos rejouables** — accessibles par chapitre

### Parents à recontacter (consentement donné)

- `Mmerabti1312@gmail.com` — demander à quel moment précis le site « ne fonctionne pas »
- `ttchoutch@gmail.com` — idem + intérêt pour les PDF

---

## 11. Plan d'action étape par étape

### Phase 0 — Préparation (avant achat VPS)

- [ ] Sauvegarder la BDD MySQL actuelle (export phpMyAdmin)
- [ ] Sauvegarder les fichiers uploadés (`uploads/`, médias cours)
- [ ] Lister toutes les variables d'environnement (JWT, SMTP, BDD)
- [ ] Tester `docker-compose up` en local et vérifier que tout démarre

### Phase 1 — Mise en place VPS (jour 1)

- [ ] Créer un VPS (Hetzner CX22 recommandé)
- [ ] Configurer le DNS : pointer `centre-culturel-olivier.fr` vers l'IP du VPS
- [ ] Installer Docker + Docker Compose
- [ ] Cloner / déployer le repo sur le serveur
- [ ] Configurer `.env` (secrets, BDD, JWT)

### Phase 2 — Déploiement (jours 2–3)

**Si Option A (PHP rapide) :**
- [ ] Déployer `php-api/` + configurer PHP-FPM
- [ ] Build Angular : `cd frontend && npm run build`
- [ ] Configurer Nginx (static + proxy PHP)
- [ ] Tester toutes les routes API

**Si Option B (NestJS recommandé) :**
- [ ] `docker-compose up -d` (frontend + backend + db)
- [ ] Migrer MySQL → PostgreSQL
- [ ] Build et déployer le frontend
- [ ] Mettre à jour `environment.prod.ts` : `apiUrl: 'https://centre-culturel-olivier.fr/api'`
- [ ] Tests de non-régression (auth, cours, paiements, feedback, uploads)

### Phase 3 — SSL et CDN (jour 3–4)

- [ ] Certbot : `sudo certbot --nginx -d centre-culturel-olivier.fr`
- [ ] Ajouter le domaine sur Cloudflare (plan Free)
- [ ] Activer le proxy Cloudflare (orange cloud)
- [ ] Vérifier HTTPS et redirections

### Phase 4 — Médias (semaine 2)

- [ ] Créer un bucket Cloudflare R2
- [ ] Configurer l'upload API vers R2
- [ ] Ajouter bouton « Télécharger PDF » sur les leçons
- [ ] Migrer les fichiers existants vers R2

### Phase 5 — Monitoring et bascule finale

- [ ] Activer Grafana/Loki (optionnel)
- [ ] Tester depuis mobile (iOS + Android)
- [ ] Basculer le DNS définitivement
- [ ] Garder l'ancien mutualisé 1 semaine en backup
- [ ] Couper l'ancien hébergement

---

## 12. Budget mensuel estimé

| Poste | Coût estimé |
|-------|-------------|
| VPS Hetzner CX22 | ~5 €/mois |
| Cloudflare (CDN + DNS) | Gratuit |
| Cloudflare R2 (< 10 Go) | ~0–1 €/mois |
| Domaine (déjà possédé) | — |
| **Total** | **~6–8 €/mois** |

Comparé à un mutualisé « premium » (~8–15 €/mois) : même budget, bien meilleures performances.

---

## 13. Checklist de migration

### Avant la bascule

- [ ] Export BDD MySQL complet
- [ ] Backup fichiers uploadés
- [ ] `environment.prod.ts` pointe vers la bonne URL API
- [ ] Toutes les routes testées en local avec Docker
- [ ] Emails SMTP configurés sur le VPS

### Tests post-déploiement

- [ ] `GET /api/health` → 200
- [ ] Login / logout
- [ ] Liste des cours et leçons
- [ ] Lecture vidéo
- [ ] Upload admin (image, PDF)
- [ ] Paiements / inscriptions
- [ ] Sondage avis (`/avis` + `/api/feedback`)
- [ ] Admin feedback (`/admin/feedback`)
- [ ] Navigation mobile

### Rollback (si problème)

- [ ] Remettre le DNS vers l'ancien mutualisé
- [ ] L'ancien site reste accessible pendant la période de transition

---

## 14. Fichiers du projet concernés

| Fichier / dossier | Rôle |
|-------------------|------|
| `docker-compose.yml` | Orchestration prod (Nginx + NestJS + PostgreSQL) |
| `frontend/Dockerfile` | Build et serve Angular |
| `frontend/nginx/default.conf` | Config Nginx |
| `frontend/src/environments/environment.prod.ts` | URL API production |
| `app/` ou `nestjs-api/` | API NestJS |
| `php-api/` | API PHP actuelle (Option A ou transition) |
| `certbot/` | Certificats SSL Let's Encrypt |
| `php-api/DEPLOYMENT.md` | Guide déploiement PHP actuel |
| `SWITCH_GUIDE.md` | Bascule NestJS ↔ PHP en dev |
| `QUICK_START.md` | Démarrage local |

---

## Résumé en une phrase

> **Garder Angular, migrer vers un VPS avec Nginx + NestJS + PostgreSQL + Cloudflare, et externaliser PDF/vidéos sur R2.**

---

## Notes personnelles

_Espace pour tes notes au fil de la migration :_

```
Date :
VPS choisi :
IP :
Décisions prises :
Blocages rencontrés :
```
