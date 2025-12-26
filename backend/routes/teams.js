import express from 'express';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { verifyUserId } from '../middleware/auth.js';

const router = express.Router();

// Middleware para verificar usuario
router.use(verifyUserId);

// GET todos los equipos del usuario
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(400).json({ error: 'Se requiere el header x-user-id' });
    }

    const teams = await Team.find({ createdBy: userId })
      .populate('members', 'name email picture')
      .populate('createdBy', 'name email picture')
      .sort({ createdAt: -1 });

    res.json({ teams });
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    res.status(500).json({ error: 'Error al obtener equipos' });
  }
});

// POST crear nuevo equipo
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { name, description, image, members } = req.body;

    // Validaciones
    if (!name || name.trim().length < 2 || name.length > 30) {
      return res.status(400).json({ error: 'El nombre debe tener entre 2 y 30 caracteres' });
    }

    if (description && (description.length < 5 || description.length > 50)) {
      return res.status(400).json({ error: 'La descripción debe tener entre 5 y 50 caracteres' });
    }

    if (!members || members.length === 0) {
      return res.status(400).json({ error: 'El equipo debe tener al menos un miembro' });
    }

    // Verificar que los miembros existan
    const validMembers = await User.find({ _id: { $in: members } });
    if (validMembers.length !== members.length) {
      return res.status(400).json({ error: 'Uno o más miembros no existen' });
    }

    const newTeam = new Team({
      name: name.trim(),
      description: description ? description.trim() : null,
      image: image || null,
      members,
      createdBy: userId,
    });

    await newTeam.save();
    await newTeam.populate('members', 'name email picture');
    await newTeam.populate('createdBy', 'name email picture');

    res.status(201).json({
      message: 'Equipo creado exitosamente',
      team: newTeam,
    });
  } catch (error) {
    console.error('Error al crear equipo:', error);
    res.status(500).json({ error: 'Error al crear el equipo' });
  }
});

// PUT actualizar equipo
router.put('/:teamId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { teamId } = req.params;
    const { name, description, image, members } = req.body;

    // Verificar que el equipo existe y pertenece al usuario
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    if (team.createdBy.toString() !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para editar este equipo' });
    }

    // Validaciones
    if (name && (name.trim().length < 2 || name.length > 30)) {
      return res.status(400).json({ error: 'El nombre debe tener entre 2 y 30 caracteres' });
    }

    if (description && (description.length < 5 || description.length > 50)) {
      return res.status(400).json({ error: 'La descripción debe tener entre 5 y 50 caracteres' });
    }

    if (members && (members.length === 0)) {
      return res.status(400).json({ error: 'El equipo debe tener al menos un miembro' });
    }

    // Verificar que los miembros existan
    if (members) {
      const validMembers = await User.find({ _id: { $in: members } });
      if (validMembers.length !== members.length) {
        return res.status(400).json({ error: 'Uno o más miembros no existen' });
      }
      team.members = members;
    }

    if (name) team.name = name.trim();
    if (description !== undefined) team.description = description ? description.trim() : null;
    if (image !== undefined) team.image = image || null;

    await team.save();
    await team.populate('members', 'name email picture');
    await team.populate('createdBy', 'name email picture');

    res.json({
      message: 'Equipo actualizado exitosamente',
      team,
    });
  } catch (error) {
    console.error('Error al actualizar equipo:', error);
    res.status(500).json({ error: 'Error al actualizar el equipo' });
  }
});

// DELETE eliminar equipo
router.delete('/:teamId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { teamId } = req.params;

    // Verificar que el equipo existe y pertenece al usuario
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    if (team.createdBy.toString() !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este equipo' });
    }

    await Team.findByIdAndDelete(teamId);

    res.json({ message: 'Equipo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar equipo:', error);
    res.status(500).json({ error: 'Error al eliminar el equipo' });
  }
});

export default router;
