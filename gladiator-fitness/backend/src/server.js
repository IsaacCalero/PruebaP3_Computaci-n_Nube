require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Conexion a la base de datos establecida.');

    // Crea/actualiza las tablas automaticamente en desarrollo. Cuando el
    // proyecto se conecte a la base de datos definitiva en AWS, esto puede
    // sustituirse por migraciones formales de Sequelize sin cambiar el
    // resto del codigo.
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Modelos sincronizados con la base de datos.');

    app.listen(PORT, () => {
      console.log(`Gladiator Fitness API escuchando en el puerto ${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err);
    process.exit(1);
  }
}

start();
