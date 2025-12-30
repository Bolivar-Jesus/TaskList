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
      .populate({
        path: 'members',
      })
      .populate('createdBy', 'name email picture')
      .sort({ createdAt: -1 });

    // Asegurar que todos los campos estén presentes
    const teamsWithFullMembers = teams.map(team => {
      return {
        ...team.toObject(),
        createdBy: team.createdBy, // Incluir información del creador
        members: team.members.map(member => {
          if (typeof member === 'object' && member._id) {
            return {
              _id: member._id,
              name: member.name,
              email: member.email,
              picture: member.picture,
              phone: member.phone || null,
              createdAt: member.createdAt,
            };
          }
          return member;
        })
      };
    });

    res.json({ teams: teamsWithFullMembers });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener equipos' });
  }
});

// GET equipos donde el usuario es miembro
router.get('/member/:userId', async (req, res) => {
  try {
    const currentUserId = req.headers['x-user-id'];
    const { userId } = req.params;

    if (!currentUserId) {
      return res.status(400).json({ error: 'Se requiere el header x-user-id' });
    }

    // Buscar equipos donde el usuario es miembro
    const teams = await Team.find({ members: userId })
      .populate({
        path: 'members',
      })
      .populate('createdBy', 'name email picture')
      .sort({ createdAt: -1 });

    // Asegurar que todos los campos estén presentes
    const teamsWithFullMembers = teams.map(team => {
      return {
        ...team.toObject(),
        createdBy: team.createdBy,
        members: team.members.map(member => {
          if (typeof member === 'object' && member._id) {
            return {
              _id: member._id,
              name: member.name,
              email: member.email,
              picture: member.picture,
              phone: member.phone || null,
              createdAt: member.createdAt,
            };
          }
          return member;
        })
      };
    });

    res.json({ teams: teamsWithFullMembers });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener equipos del miembro' });
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

    // Crear roles: superadmin para el creador, viewer para otros miembros
    const memberRoles = members.map(memberId => ({
      userId: memberId,
      role: memberId === userId ? 'superadmin' : 'viewer',
      permissions: {
        canEditTeam: false,
        canAddMembers: false,
        canAssignPermissions: false,
      },
    }));

    const newTeam = new Team({
      name: name.trim(),
      description: description ? description.trim() : null,
      image: image || null,
      members,
      memberRoles,
      createdBy: userId,
    });

    await newTeam.save();
    await newTeam.populate('members');
    await newTeam.populate('createdBy', 'name email picture');

    // Asegurar que todos los campos estén presentes
    const teamObj = newTeam.toObject();
    const teamWithFullMembers = {
      ...teamObj,
      members: teamObj.members.map(member => ({
        _id: member._id,
        name: member.name,
        email: member.email,
        picture: member.picture,
        phone: member.phone || null,
        createdAt: member.createdAt,
      }))
    };

    res.status(201).json({
      message: 'Equipo creado exitosamente',
      team: teamWithFullMembers,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el equipo' });
  }
});

// PUT actualizar roles y permisos de miembros (solo el superadmin puede)
router.put('/:teamId/member-roles', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { teamId } = req.params;
    const { memberRoles } = req.body;

    // Verificar que el equipo existe
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    // Solo el superadmin (creador) puede cambiar los roles
    if (team.createdBy.toString() !== userId) {
      return res.status(403).json({ error: 'Solo el superadministrador del equipo puede cambiar los roles' });
    }

    // Validar que el creador siempre tenga rol 'superadmin'
    const creatorRoleValid = memberRoles.some(
      mr => mr.userId.toString() === userId && mr.role === 'superadmin'
    );
    if (!creatorRoleValid) {
      return res.status(400).json({ error: 'El creador debe mantener el rol de superadministrador' });
    }

    // Validar que admins tengan al menos un permiso
    for (const mr of memberRoles) {
      if (mr.role === 'admin') {
        const hasPermission = mr.permissions?.canEditTeam || mr.permissions?.canAddMembers || mr.permissions?.canAssignPermissions;
        if (!hasPermission) {
          return res.status(400).json({ error: 'Los admins deben tener al menos un permiso' });
        }
      }
    }

    // Actualizar los roles
    team.memberRoles = memberRoles;
    await team.save();

    res.json({
      message: 'Roles y permisos actualizados exitosamente',
      memberRoles: team.memberRoles,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar los roles' });
  }
});

// PUT actualizar equipo
router.put('/:teamId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { teamId } = req.params;
    const { name, description, image, members } = req.body;

    // Verificar que el equipo existe
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    // Verificar el rol del usuario en el equipo
    let userRole = null;
    
    // Si memberRoles existe, obtener rol de ahí
    if (team.memberRoles && team.memberRoles.length > 0) {
      const userMemberRole = team.memberRoles.find(mr => mr.userId.toString() === userId);
      userRole = userMemberRole?.role;
    } else {
      // Fallback: si no hay memberRoles, solo el creador es admin
      if (team.createdBy.toString() === userId) {
        userRole = 'admin';
      }
    }

    // Solo admin y editor pueden editar
    if (!userRole || !['admin', 'editor'].includes(userRole)) {
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

      // Actualizar miembros y sus roles
      const currentMemberIds = team.members.map(m => m.toString());
      const newMembers = members.filter(m => !currentMemberIds.includes(m.toString()));

      team.members = members;

      // Mantener roles existentes y agregar 'viewer' a nuevos miembros
      const newMemberRoles = team.memberRoles.filter(mr =>
        members.some(m => m.toString() === mr.userId.toString())
      );

      newMembers.forEach(memberId => {
        newMemberRoles.push({
          userId: memberId,
          role: 'viewer',
        });
      });

      team.memberRoles = newMemberRoles;
    }

    if (name) team.name = name.trim();
    if (description !== undefined) team.description = description ? description.trim() : null;
    if (image !== undefined) team.image = image || null;

    await team.save();
    await team.populate('members');
    await team.populate('createdBy', 'name email picture');

    // Asegurar que todos los campos estén presentes
    const teamObj = team.toObject();
    const teamWithFullMembers = {
      ...teamObj,
      members: teamObj.members.map(member => ({
        _id: member._id,
        name: member.name,
        email: member.email,
        picture: member.picture,
        phone: member.phone || null,
        createdAt: member.createdAt,
      }))
    };

    res.json({
      message: 'Equipo actualizado exitosamente',
      team: teamWithFullMembers,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el equipo' });
  }
});

// DELETE eliminar equipo
router.delete('/:teamId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { teamId } = req.params;

    // Verificar que el equipo existe
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    // Solo el admin puede eliminar
    let userRole = null;
    
    // Si memberRoles existe, obtener rol de ahí
    if (team.memberRoles && team.memberRoles.length > 0) {
      const userMemberRole = team.memberRoles.find(mr => mr.userId.toString() === userId);
      userRole = userMemberRole?.role;
    } else {
      // Fallback: si no hay memberRoles, solo el creador es admin
      if (team.createdBy.toString() === userId) {
        userRole = 'admin';
      }
    }

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Solo el administrador del equipo puede eliminarlo' });
    }

    await Team.findByIdAndDelete(teamId);

    res.json({ message: 'Equipo eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el equipo' });
  }
});

export default router;
