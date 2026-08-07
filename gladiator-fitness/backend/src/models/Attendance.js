const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
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
    allowNull: true,
    field: 'membership_id',
  },
  fechaHora: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'fecha_hora',
  },
  resultado: {
    type: DataTypes.ENUM('permitido', 'denegado'),
    allowNull: false,
  },
  motivo: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'attendances',
  updatedAt: false,
});

module.exports = Attendance;
