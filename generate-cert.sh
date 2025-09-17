#!/bin/bash

set -e

DOMAINS=(
  arrisala.fr
  www.arrisala.fr
  api.arrisala.fr
  grafana.arrisala.fr
  portainer.arrisala.fr
)

EMAIL="ton@email.com"

echo "🔄 Arrêt de tous les containers..."
docker-compose down

echo "🚀 Lancement de Nginx seul pour servir les challenges..."
docker-compose up -d nginx

echo "📡 Lancement de Certbot pour les domaines : ${DOMAINS[*]}"

CMD="certbot certonly --webroot --webroot-path=/var/www/certbot --email $EMAIL --agree-tos --no-eff-email"
for domain in "${DOMAINS[@]}"; do
  CMD+=" -d $domain"
done

docker-compose run --rm certbot $CMD

echo "🧼 Arrêt de Nginx (standalone)"
docker-compose stop nginx

echo "🧱 Redémarrage de tous les services..."
docker-compose up -d

echo "✅ Certificats générés et services relancés."
