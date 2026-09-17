#!/bin/sh
set -eu

stack='/opt/app-stack'
cd "$stack"

rollback() {
  previous_compose="$(ls -1t docker-compose.yml.backup-* | head -n 1)"
  previous_nginx="$(ls -1t nginx/conf.d/default.conf.backup-* | head -n 1)"
  cp "$previous_compose" docker-compose.yml
  cp "$previous_nginx" nginx/conf.d/default.conf
  docker compose up -d --force-recreate --no-deps nginx
}

docker compose config --quiet
if ! docker compose up -d --force-recreate --no-deps nginx; then
  rollback
  exit 1
fi

attempt=0
while [ "$attempt" -lt 15 ]; do
  if curl -fsS -H 'Host: yyzmiao.top' http://127.0.0.1/ | grep -q 'Built with Astro'; then
    break
  fi
  attempt=$((attempt + 1))
  sleep 1
done

if [ "$attempt" -ge 15 ]; then
  rollback
  echo 'New site health check failed; restored WordPress proxy.' >&2
  exit 1
fi

curl -fsS -H 'Host: note.yyzmiao.top' http://127.0.0.1/ >/dev/null
docker exec app-stack-nginx-1 nginx -t
echo 'Astro site is live; WordPress containers remain running for rollback.'
