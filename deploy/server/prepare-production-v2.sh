#!/bin/sh
set -eu

stack='/opt/app-stack'
timestamp="$(date +%Y%m%d-%H%M%S)"
cd "$stack"

cp docker-compose.yml "docker-compose.yml.backup-$timestamp"
cp nginx/conf.d/default.conf "nginx/conf.d/default.conf.backup-$timestamp"

if ! grep -q '/var/www/yyzmiao-blog:/srv/yyzmiao:ro' docker-compose.yml; then
  sed -i '\|./nginx/certs:/etc/nginx/certs|a\      - /var/www/yyzmiao-blog:/srv/yyzmiao:ro' docker-compose.yml
fi

if ! grep -q '^      - gzctf$' docker-compose.yml; then
  sed -i '0,/^    restart: always$/{s/^    restart: always$/    networks:\n      - default\n      - gzctf\n    restart: always/}' docker-compose.yml
fi

if ! grep -q '^  gzctf:$' docker-compose.yml; then
  sed -i '/^volumes:/i networks:\n  gzctf:\n    external: true\n    name: gzctf_default\n' docker-compose.yml
fi

awk '/^server \{/{count++} count >= 2' nginx/conf.d/default.conf > /tmp/default-conf-tail
cat /tmp/nginx-yyzmiao.conf /tmp/default-conf-tail > /tmp/default.conf.new
install -m 644 /tmp/default.conf.new nginx/conf.d/default.conf

docker compose config --quiet
docker compose up -d --force-recreate --no-deps nginx

attempt=0
while [ "$attempt" -lt 15 ]; do
  if curl -fsS -H 'Host: yyzmiao.top' http://127.0.0.1/ | grep -q 'Built with Astro'; then
    docker exec app-stack-nginx-1 nginx -t
    curl -fsS -H 'Host: note.yyzmiao.top' http://127.0.0.1/ >/dev/null
    curl -fsS -H 'Host: tustctf.top' http://127.0.0.1/ >/dev/null
    echo 'Astro site is live; dependent routes passed health checks.'
    exit 0
  fi
  attempt=$((attempt + 1))
  sleep 1
done

cp "docker-compose.yml.backup-$timestamp" docker-compose.yml
cp "nginx/conf.d/default.conf.backup-$timestamp" nginx/conf.d/default.conf
docker compose up -d --force-recreate --no-deps nginx
docker network connect gzctf_default app-stack-nginx-1 2>/dev/null || true
echo 'Health check failed; restored WordPress proxy.' >&2
exit 1
