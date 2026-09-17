#!/bin/sh
set -eu

deploy_user='deploy-yyzmiao'
random_password="$(openssl rand -hex 48)"
password_hash="$(openssl passwd -6 "$random_password")"
usermod --password "$password_hash" "$deploy_user"
unset random_password password_hash

install -m 644 /tmp/sshd-deploy-yyzmiao.conf /etc/ssh/sshd_config.d/90-deploy-yyzmiao.conf
sshd -t
systemctl reload ssh
