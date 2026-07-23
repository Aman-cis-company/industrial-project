const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;
const useSqlite = process.env.USE_SQLITE === 'true' || process.env.NODE_ENV === 'test';

if (useSqlite) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './pmo_erp_db.sqlite',
    logging: false
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'pmo_erp_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      dialectOptions: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production' ? {
        ssl: {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: false
        }
      } : {},
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

module.exports = sequelize;
