-- Cria o banco de dados de testes caso não exista
SELECT 'CREATE DATABASE gem_fixa_test'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'gem_fixa_test'
)\gexec
