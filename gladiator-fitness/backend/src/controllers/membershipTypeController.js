const { MembershipType } = require('../models');

async function listMembershipTypes(req, res, next) {
  try {
    const types = await MembershipType.findAll({ order: [['nombre', 'ASC']] });
    res.json(types);
  } catch (err) {
    next(err);
  }
}

async function createMembershipType(req, res, next) {
  try {
    const { nombre, descripcion, duracionDias, precio } = req.body;
    if (!nombre || !duracionDias) {
      return res.status(400).json({ message: 'Nombre y duracion (dias) son obligatorios.' });
    }
    const type = await MembershipType.create({ nombre, descripcion, duracionDias, precio });
    res.status(201).json(type);
  } catch (err) {
    next(err);
  }
}

async function updateMembershipType(req, res, next) {
  try {
    const type = await MembershipType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ message: 'Tipo de membresia no encontrado.' });

    const { nombre, descripcion, duracionDias, precio, active } = req.body;
    await type.update({ nombre, descripcion, duracionDias, precio, active });
    res.json(type);
  } catch (err) {
    next(err);
  }
}

async function deleteMembershipType(req, res, next) {
  try {
    const type = await MembershipType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ message: 'Tipo de membresia no encontrado.' });

    await type.update({ active: false });
    res.json({ message: 'Tipo de membresia desactivado.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMembershipTypes,
  createMembershipType,
  updateMembershipType,
  deleteMembershipType,
};
