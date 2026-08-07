const { Op } = require('sequelize');
const { Attendance, Membership, MembershipType, Client } = require('../models');

// Busca la membresia vigente del cliente en la fecha actual:
// fechaInicio <= hoy <= fechaVencimiento. Si tiene varias, toma la de
// vencimiento mas lejano.
async function findActiveMembership(clientId) {
  const today = new Date().toISOString().slice(0, 10);
  return Membership.findOne({
    where: {
      clientId,
      fechaInicio: { [Op.lte]: today },
      fechaVencimiento: { [Op.gte]: today },
    },
    include: [{ model: MembershipType, as: 'membershipType' }],
    order: [['fechaVencimiento', 'DESC']],
  });
}

// Registra el intento de ingreso. Valida de forma estricta que exista una
// membresia activa; si esta vencida o no existe, se rechaza el ingreso y
// de todas formas se deja constancia del intento (resultado = denegado)
// para trazabilidad.
async function checkIn(req, res, next) {
  try {
    const { clientId } = req.body;
    if (!clientId) {
      return res.status(400).json({ message: 'clientId es obligatorio.' });
    }

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }

    if (!client.active) {
      const attendance = await Attendance.create({
        clientId,
        resultado: 'denegado',
        motivo: 'Cliente inactivo/desactivado.',
      });
      return res.status(403).json({
        message: 'Ingreso denegado: el cliente esta inactivo.',
        attendance,
      });
    }

    const activeMembership = await findActiveMembership(clientId);

    if (!activeMembership) {
      const attendance = await Attendance.create({
        clientId,
        resultado: 'denegado',
        motivo: 'Membresia vencida o inexistente.',
      });
      return res.status(403).json({
        message: 'Ingreso denegado: la membresia esta vencida o no existe.',
        attendance,
      });
    }

    const attendance = await Attendance.create({
      clientId,
      membershipId: activeMembership.id,
      resultado: 'permitido',
    });

    res.status(201).json({
      message: 'Ingreso registrado correctamente.',
      attendance,
      membership: activeMembership,
    });
  } catch (err) {
    next(err);
  }
}

async function listAttendances(req, res, next) {
  try {
    const { from, to, resultado } = req.query;
    // Un cliente solo puede consultar sus propias asistencias, sin importar
    // que envie otro clientId por query string.
    const clientId = req.user.role === 'cliente' ? req.user.clientId : req.query.clientId;
    const where = {};
    if (clientId) where.clientId = clientId;
    if (resultado) where.resultado = resultado;
    if (from || to) {
      where.fechaHora = {};
      if (from) where.fechaHora[Op.gte] = new Date(`${from}T00:00:00`);
      if (to) where.fechaHora[Op.lte] = new Date(`${to}T23:59:59`);
    }

    const attendances = await Attendance.findAll({
      where,
      include: [
        { model: Client, as: 'client', attributes: ['id', 'nombres', 'apellidos', 'cedula'] },
        { model: Membership, as: 'membership', include: [{ model: MembershipType, as: 'membershipType' }] },
      ],
      order: [['fechaHora', 'DESC']],
    });

    res.json(attendances);
  } catch (err) {
    next(err);
  }
}

module.exports = { checkIn, listAttendances };
