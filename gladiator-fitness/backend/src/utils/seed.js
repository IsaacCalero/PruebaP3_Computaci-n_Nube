require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, MembershipType } = require('../models');

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync();

  const adminUsername = process.env.SEED_ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

  const [admin, adminCreated] = await User.findOrCreate({
    where: { username: adminUsername },
    defaults: {
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: 'admin',
      active: true,
    },
  });

  console.log(
    adminCreated
      ? `Usuario administrador creado: ${admin.username} / ${adminPassword}`
      : `Usuario administrador ya existia: ${admin.username}`
  );

  const defaultTypes = [
    { nombre: 'Mensual', descripcion: 'Membresia valida por 30 dias', duracionDias: 30, precio: 25 },
    { nombre: 'Trimestral', descripcion: 'Membresia valida por 90 dias', duracionDias: 90, precio: 65 },
    { nombre: 'Anual', descripcion: 'Membresia valida por 365 dias', duracionDias: 365, precio: 220 },
  ];

  for (const type of defaultTypes) {
    const [, created] = await MembershipType.findOrCreate({
      where: { nombre: type.nombre },
      defaults: type,
    });
    if (created) console.log(`Tipo de membresia creado: ${type.nombre}`);
  }

  console.log('Seed finalizado.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error al ejecutar el seed:', err);
  process.exit(1);
});
