require('dotenv').config();
const { Sequelize } = require('sequelize');

const sslEnabled = String(process.env.DB_SSL).toLowerCase() === 'true';

const commonOptions = {
  dialect: process.env.DB_DIALECT || 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: sslEnabled
    ? {
        ssl: {
          require: true,
          // RDS usa certificados validos por una CA publica; en la mayoria
          // de casos de examen/practica se deja en false para evitar
          // problemas con la cadena de certificados.
          rejectUnauthorized: false,
        },
      }
    : {},
  define: {
    underscored: true,
    timestamps: true,
  },
};

// Si el companero de AWS entrega una cadena de conexion unica (RDS,
// por ejemplo) se usa esa. En caso contrario se arma la conexion con
// las variables individuales definidas en .env
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, commonOptions)
  : new Sequelize(
      process.env.DB_NAME || 'gladiator_fitness',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'postgres',
      {
        ...commonOptions,
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
      }
    );

module.exports = sequelize;
