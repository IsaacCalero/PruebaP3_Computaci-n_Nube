const { Payment, Client, Membership, MembershipType } = require('../models');

async function listPayments(req, res, next) {
  try {
    // Un cliente solo puede consultar sus propios pagos, sin importar
    // que envie otro clientId por query string.
    const clientId = req.user.role === 'cliente' ? req.user.clientId : req.query.clientId;
    const where = {};
    if (clientId) where.clientId = clientId;

    const payments = await Payment.findAll({
      where,
      include: [
        { model: Client, as: 'client', attributes: ['id', 'nombres', 'apellidos', 'cedula'] },
        { model: Membership, as: 'membership', include: [{ model: MembershipType, as: 'membershipType' }] },
      ],
      order: [['fechaPago', 'DESC']],
    });

    res.json(payments);
  } catch (err) {
    next(err);
  }
}

module.exports = { listPayments };
