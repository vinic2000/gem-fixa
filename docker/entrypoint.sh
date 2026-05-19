#!/bin/sh
set -e

echo "▶ Aguardando banco de dados..."
until node -e "
const { Client } = require('pg');
const c = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
c.connect().then(() => { c.end(); process.exit(0); }).catch(() => process.exit(1));
" 2>/dev/null; do
  echo "  banco indisponível, tentando novamente em 2s..."
  sleep 2
done

echo "✔ Banco de dados disponível."

echo "▶ Executando migrations..."
node_modules/.bin/sequelize-cli db:migrate
echo "✔ Migrations concluídas."

echo "▶ Executando seeders..."
# Ignora erro caso os seeds já tenham sido executados (ex: violação de unique constraint)
node_modules/.bin/sequelize-cli db:seed:all || echo "⚠ Seeders ignorados (já executados anteriormente)."
echo "✔ Seeders concluídos."

echo "▶ Iniciando aplicação..."
exec node server.js
