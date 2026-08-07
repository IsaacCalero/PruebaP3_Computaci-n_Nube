const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'client_id',
  },
  membershipId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'membership_id',
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  metodoPago: {
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia'),
    allowNull: false,
    defaultValue: 'efectivo',
    field: 'metodo_pago',
  },
  fechaPago: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'fecha_pago',
  },
  estado: {
    type: DataTypes.ENUM('pagado', 'pendiente'),
    allowNull: false,
    defaultValue: 'pagado',
  },
}, {
  tableName: 'payments',
  updatedAt: false,
});

module.exports = Payment;
