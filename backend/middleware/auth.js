import User from '../models/User.js';

// Middleware para verificar que se proporcione el ID del usuario (verificación básica)
export const verifyUserId = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'No se proporcionó ID de usuario.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error en middleware de verificación:', error);
    return res.status(401).json({ error: 'Error de autenticación.' });
  }
};

// Middleware para verificar que el usuario esté autenticado
export const authenticateUser = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'No se proporcionó ID de usuario.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(401).json({ error: 'Error de autenticación.' });
  }
};

