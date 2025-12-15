import express from 'express';
import User from '../models/User.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Obtener perfil del usuario autenticado
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');

    const userResponse = {
      id: user._id.toString(),
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.json({ user: userResponse });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    return res.status(500).json({ error: 'Error al obtener el perfil del usuario.' });
  }
});

// Actualizar perfil del usuario
router.put('/me', authenticateUser, async (req, res) => {
  try {
    const { name, email, picture, role } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Validar role si se proporciona
    if (role && !['gives_orders', 'receives_orders', 'both'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido.' });
    }

    // Actualizar campos si se proporcionan
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (picture !== undefined) user.picture = picture;
    if (role !== undefined) user.role = role;

    await user.save();

    const userResponse = {
      id: user._id.toString(),
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.json({
      message: 'Perfil actualizado correctamente',
      user: userResponse,
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'El email ya está en uso.' });
    }
    return res.status(500).json({ error: 'Error al actualizar el perfil.' });
  }
});

// Obtener lista de usuarios (para asignar tareas)
router.get('/list', authenticateUser, async (req, res) => {
  try {
    const currentUser = req.user;
    const users = await User.find({}).select('_id name email picture role').sort({ name: 1 });

    // Formatear respuesta incluyendo el usuario actual como "Yo"
    const usersList = users.map((user) => ({
      id: user._id.toString(),
      name: user._id.toString() === currentUser._id.toString() ? 'Yo' : user.name,
      email: user.email,
      picture: user.picture,
      role: user.role,
      isCurrentUser: user._id.toString() === currentUser._id.toString(),
    }));

    return res.json({ users: usersList });
  } catch (error) {
    console.error('Error obteniendo lista de usuarios:', error);
    return res.status(500).json({ error: 'Error al obtener la lista de usuarios.' });
  }
});

export default router;

