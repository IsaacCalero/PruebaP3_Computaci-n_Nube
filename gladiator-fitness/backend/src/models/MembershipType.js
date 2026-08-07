const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MembershipType = sequelize.define('MembershipType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(80),
    allowNull: false,
    unique: true,
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  duracionDias: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'duracion_dias',
    validate: { min: 1 },
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'membership_types',
});

module.exports = MembershipType;
