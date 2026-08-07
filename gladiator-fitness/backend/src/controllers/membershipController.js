const { Op } = require('sequelize');
const { sequelize, Membership, MembershipType, Client, Payment } = require('../models');

function addDays(dateStr, days) {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + Number(days));
  return date.toISOString().slice(0, 10);
}

async function listMemberships(req, res, next) {
  try {
    const { estado } = req.query;
    // Un cliente solo puede consultar sus propias membresias, sin importar
    // que envie otro clientId por query string.
    const clientId = req.user.role === 'cliente' ? req.user.clientId : req.query.clientId;
    const where = {};
    if (clientId) where.clientId = clientId;

    const today = new Date().toISOString().slice(0, 10);
    if (estado === 'activa') where.fechaVencimiento = { [Op.gte]: today };
    if (estado === 'vencida') where.fechaVencimiento = { [Op.lt]: today };

    const memberships = await Membership.findAll({
      where,
      include: [
        { model: MembershipType, as: 'membershipType' },
        { model: Client, as: 'client', attributes: ['id', 'nombres', 'apellidos', 'cedula'] },
        { model: Payment, as: 'payment' },
      ],
      order: [['fechaVencimiento', 'DESC']],
    });

    res.json(memberships);
  } catch (err) {
    next(err);
  }
}

// Asigna una membresia a un cliente y registra el pago correspondiente en
// una sola transaccion. La fecha de vencimiento se calcula automaticamente
// a partir de la duracion del tipo de membresia, salvo que se envie una
// fecha de vencimiento explicita. El monto del pago toma por defecto el
// precio del tipo de membresia, pero puede sobreescribirse (p. ej. descuentos).
async function createMembership(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const {
      clientId, membershipTypeId, fechaInicio, fechaVencimiento,
      monto, metodoPago, estadoPago,
    } = req.body;

    if (!clientId || !membershipTypeId || !fechaInicio) {
      await t.rollback();
      return res.status(400).json({
        message: 'clientId, membershipTypeId y fechaInicio son obligatorios.',
      });
    }

    const client = await Client.findByPk(clientId);
    if (!client || !client.active) {
      await t.rollback();
      return res.status(404).json({ message: 'Cliente no encontrado o inactivo.' });
    }

    const type = await MembershipType.findByPk(membershipTypeId);
    if (!type || !type.active) {
      await t.rollback();
      return res.status(404).json({ message: 'Tipo de membresia no encontrado o inactivo.' });
    }

    const vencimiento = fechaVencimiento || addDays(fechaInicio, type.duracionDias);

    const membership = await Membership.create({
      clientId,
      membershipTypeId,
      fechaInicio,
      fechaVencimiento: vencimiento,
    }, { transaction: t });

    await Payment.create({
      clientId,
      membershipId: membership.id,
      monto: monto ?? type.precio,
      metodoPago: metodoPago || 'efectivo',
      estado: estadoPago || 'pagado',
      fechaPago: fechaInicio,
    }, { transaction: t });

    await t.commit();

    const created = await Membership.findByPk(membership.id, {
      include: [
        { model: MembershipType, as: 'membershipType' },
        { model: Client, as: 'client', attributes: ['id', 'nombres', 'apellidos', 'cedula'] },
        { model: Payment, as: 'payment' },
      ],
    });

    res.status(201).json(created);
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

module.exports = { listMemberships, createMembership };
