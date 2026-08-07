const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sequelize, Client, User } = require('../models');

async function listClients(req, res, next) {
  try {
    const { q, active } = req.query;
    const where = {};

    if (q) {
      where[Op.or] = [
        { nombres: { [Op.iLike]: `%${q}%` } },
        { apellidos: { [Op.iLike]: `%${q}%` } },
        { cedula: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
      ];
    }

    if (active !== undefined) {
      where.active = active === 'true';
    }

    const clients = await Client.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'active'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json(clients);
  } catch (err) {
    next(err);
  }
}

async function getClient(req, res, next) {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'active'] }],
    });
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado.' });
    res.json(client);
  } catch (err) {
    next(err);
  }
}

async function createClient(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const {
      cedula, nombres, apellidos, email, telefono, fechaNacimiento, direccion,
      username, password,
    } = req.body;

    if (!cedula || !nombres || !apellidos) {
      await t.rollback();
      return res.status(400).json({ message: 'Cedula, nombres y apellidos son obligatorios.' });
    }

    // Credenciales de acceso del cliente: si no se especifican, se generan
    // a partir de la cedula para que el cliente pueda iniciar sesion.
    const finalUsername = username || cedula;
    const finalPassword = password || cedula;
    const passwordHash = await bcrypt.hash(finalPassword, 10);

    const user = await User.create({
      username: finalUsername,
      passwordHash,
      role: 'cliente',
      active: true,
    }, { transaction: t });

    const client = await Client.create({
      userId: user.id,
      cedula,
      nombres,
      apellidos,
      email,
      telefono,
      fechaNacimiento,
      direccion,
      active: true,
    }, { transaction: t });

    await t.commit();

    const created = await Client.findByPk(client.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'active'] }],
    });

    res.status(201).json(created);
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

async function updateClient(req, res, next) {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado.' });

    const { cedula, nombres, apellidos, email, telefono, fechaNacimiento, direccion } = req.body;

    await client.update({ cedula, nombres, apellidos, email, telefono, fechaNacimiento, direccion });

    res.json(client);
  } catch (err) {
    next(err);
  }
}

// Baja logica: en vez de borrar el historial de membresias/asistencias,
// se desactiva al cliente y su usuario para bloquear el ingreso.
async function deactivateClient(req, res, next) {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado.' });

    await client.update({ active: false });
    if (client.userId) {
      await User.update({ active: false }, { where: { id: client.userId } });
    }

    res.json({ message: 'Cliente desactivado correctamente.' });
  } catch (err) {
    next(err);
  }
}

async function activateClient(req, res, next) {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado.' });

    await client.update({ active: true });
    if (client.userId) {
      await User.update({ active: true }, { where: { id: client.userId } });
    }

    res.json({ message: 'Cliente activado correctamente.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listClients,
  getClient,
  createClient,
  updateClient,
  deactivateClient,
  activateClient,
};
