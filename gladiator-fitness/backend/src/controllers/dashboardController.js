const { Op } = require('sequelize');
const { Client, Membership, Attendance, Payment } = require('../models');

async function getMetrics(req, res, next) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalClientes,
      clientesActivos,
      membresiasActivas,
      membresiasVencidas,
      asistenciasHoy,
      asistenciasTotal,
      totalRecaudado,
    ] = await Promise.all([
      Client.count(),
      Client.count({ where: { active: true } }),
      Membership.count({ where: { fechaVencimiento: { [Op.gte]: today } } }),
      Membership.count({ where: { fechaVencimiento: { [Op.lt]: today } } }),
      Attendance.count({
        where: { resultado: 'permitido', fechaHora: { [Op.between]: [startOfDay, endOfDay] } },
      }),
      Attendance.count({ where: { resultado: 'permitido' } }),
      Payment.sum('monto', { where: { estado: 'pagado' } }),
    ]);

    res.json({
      totalClientes,
      clientesActivos,
      membresiasActivas,
      membresiasVencidas,
      asistenciasHoy,
      asistenciasTotal,
      totalRecaudado: totalRecaudado || 0,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMetrics };
