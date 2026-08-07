const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Client } = require('../models');

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      clientId: user.client ? user.client.id : null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contrasena son obligatorios.' });
    }

    const user = await User.findOne({
      where: { username },
      include: [{ model: Client, as: 'client' }],
    });

    if (!user || !user.active) {
      return res.status(401).json({ message: 'Credenciales invalidas.' });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      return res.status(401).json({ message: 'Credenciales invalidas.' });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        client: user.client
          ? { id: user.client.id, nombres: user.client.nombres, apellidos: user.client.apellidos }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

// El JWT es "stateless": cerrar sesion consiste en que el cliente
// descarte el token guardado. Este endpoint existe por simetria/semantica
// de la API y como punto de extension futuro (p. ej. lista negra de tokens).
async function logout(req, res) {
  res.json({ message: 'Sesion cerrada correctamente.' });
}

async function me(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'role', 'active'],
      include: [{ model: Client, as: 'client' }],
    });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { login, logout, me };
