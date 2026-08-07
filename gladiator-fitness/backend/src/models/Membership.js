const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const Membership = sequelize.define('Membership', {
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
  membershipTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'membership_type_id',
  },
  fechaInicio: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'fecha_inicio',
  },
  fechaVencimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'fecha_vencimiento',
  },
  // Estado calculado en tiempo real a partir de la fecha de vencimiento;
  // no se persiste para evitar que quede desactualizado.
  estado: {
    type: DataTypes.VIRTUAL,
    get() {
      const vencimiento = new Date(`${this.getDataValue('fechaVencimiento')}T00:00:00`);
      return vencimiento >= startOfToday() ? 'activa' : 'vencida';
    },
  },
}, {
  tableName: 'memberships',
});

module.exports = Membership;
