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
      dialect: 'mysql',
      logging: false,
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
