#!/bin/sh
set -eu

deploy_user='deploy-yyzmiao'
base='/var/www/yyzmiao-blog'
stack='/opt/app-stack'
timestamp="$(date +%Y%m%d-%H%M%S)"

if ! id "$deploy_user" >/dev/null 2>&1; then
  useradd --system --create-home --shell /bin/bash "$deploy_user"
fi

random_password="$(openssl rand -hex 48)"
password_hash="$(openssl passwd -6 "$random_password")"
usermod --password "$password_hash" "$deploy_user"
unset random_password password_hash

install -d -m 700 -o "$deploy_user" -g "$deploy_user" "/home/$deploy_user/.ssh"
install -m 600 -o "$deploy_user" -g "$deploy_user" /tmp/yyzmiao-deploy.pub "/home/$deploy_user/.ssh/authorized_keys"
install -d -m 755 -o "$deploy_user" -g "$deploy_user" "$base" "$base/releases" "$base/incoming"
install -m 755 /tmp/deploy-yyzmiao /usr/local/bin/deploy-yyzmiao
install -m 644 /tmp/sshd-deploy-yyzmiao.conf /etc/ssh/sshd_config.d/90-deploy-yyzmiao.conf
sshd -t
systemctl reload ssh

cp "$stack/docker-compose.yml" "$stack/docker-compose.yml.backup-$timestamp"
cp "$stack/nginx/conf.d/default.conf" "$stack/nginx/conf.d/default.conf.backup-$timestamp"

if ! grep -q '/var/www/yyzmiao-blog:/srv/yyzmiao:ro' "$stack/docker-compose.yml"; then
  sed -i '\|./nginx/certs:/etc/nginx/certs|a\      - /var/www/yyzmiao-blog:/srv/yyzmiao:ro' "$stack/docker-compose.yml"
fi

if ! grep -q '^      - gzctf$' "$stack/docker-compose.yml"; then
  sed -i '0,/^    restart: always$/{s/^    restart: always$/    networks:\n      - default\n      - gzctf\n    restart: always/}' "$stack/docker-compose.yml"
fi

if ! grep -q '^  gzctf:$' "$stack/docker-compose.yml"; then
  sed -i '/^volumes:/i networks:\n  gzctf:\n    external: true\n    name: gzctf_default\n' "$stack/docker-compose.yml"
fi

awk '/^server \{/{count++} count >= 2' "$stack/nginx/conf.d/default.conf" > /tmp/default-conf-tail
cat /tmp/nginx-yyzmiao.conf /tmp/default-conf-tail > /tmp/default.conf.new
install -m 644 /tmp/default.conf.new "$stack/nginx/conf.d/default.conf"

cd "$stack"
docker compose config --quiet

echo "Server prepared. Upload and activate a release before recreating nginx."
