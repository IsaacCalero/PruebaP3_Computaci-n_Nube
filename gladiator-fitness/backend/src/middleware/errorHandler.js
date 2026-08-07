const { ValidationError, UniqueConstraintError } = require('sequelize');

function notFoundHandler(req, res) {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      message: 'Ya existe un registro con esos datos.',
      errors: err.errors?.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      message: 'Datos invalidos.',
      errors: err.errors?.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor.',
  });
}

module.exports = { notFoundHandler, errorHandler };
