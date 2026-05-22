/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config()

// SSL é desativado por padrão em ambientes Docker internos.
// Defina DB_SSL=true nas variáveis de ambiente para habilitar.
const sslEnabled = process.env.DB_SSL === 'true'

const sslOptions = sslEnabled
  ? { ssl: { require: true, rejectUnauthorized: false } }
  : {}

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'gem_fixa_dev',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: console.log,
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME_TEST || 'gem_fixa_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ...sslOptions,
    },
  },
}
