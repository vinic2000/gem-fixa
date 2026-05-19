import { Sequelize } from 'sequelize'

const env = process.env.NODE_ENV || 'development'

const configs: Record<string, any> = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'gem_fixa_dev',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false,
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
  },
}

const config = configs[env]

// Singleton para evitar múltiplas conexões em desenvolvimento (Next.js hot reload)
declare global {
  // eslint-disable-next-line no-var
  var sequelizeInstance: Sequelize | undefined
}

const sequelize: Sequelize =
  global.sequelizeInstance ??
  new Sequelize(config.database, config.username, config.password, config)

if (process.env.NODE_ENV !== 'production') {
  global.sequelizeInstance = sequelize
}

export default sequelize
