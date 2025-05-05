const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
  // Gera token
  generateToken: (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  },

  // Verifica token
  verifyToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  },

  // Middleware de autenticação
  authenticate: (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Acesso não autorizado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = decoded; // Adiciona os dados do usuário à requisição
    next();
  }
};
