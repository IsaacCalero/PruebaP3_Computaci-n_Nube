const sequelize = require('../config/database');
const User = require('./User');
const Client = require('./Client');
const MembershipType = require('./MembershipType');
const Membership = require('./Membership');
const Attendance = require('./Attendance');
const Payment = require('./Payment');

// Usuario (login) <-> Cliente (perfil), relacion 1 a 1
User.hasOne(Client, { foreignKey: 'userId', as: 'client' });
Client.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Cliente 1 a N Membresias
Client.hasMany(Membership, { foreignKey: 'clientId', as: 'memberships' });
Membership.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Tipo de membresia 1 a N Membresias
MembershipType.hasMany(Membership, { foreignKey: 'membershipTypeId', as: 'memberships' });
Membership.belongsTo(MembershipType, { foreignKey: 'membershipTypeId', as: 'membershipType' });

// Cliente 1 a N Asistencias
Client.hasMany(Attendance, { foreignKey: 'clientId', as: 'attendances' });
Attendance.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Membresia 1 a N Asistencias (referencia a la membresia usada en el ingreso)
Membership.hasMany(Attendance, { foreignKey: 'membershipId', as: 'attendances' });
Attendance.belongsTo(Membership, { foreignKey: 'membershipId', as: 'membership' });

// Membresia 1 a 1 Pago (el pago se registra al asignar la membresia)
Membership.hasOne(Payment, { foreignKey: 'membershipId', as: 'payment' });
Payment.belongsTo(Membership, { foreignKey: 'membershipId', as: 'membership' });

// Cliente 1 a N Pagos
Client.hasMany(Payment, { foreignKey: 'clientId', as: 'payments' });
Payment.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

module.exports = {
  sequelize,
  User,
  Client,
  MembershipType,
  Membership,
  Attendance,
  Payment,
};
