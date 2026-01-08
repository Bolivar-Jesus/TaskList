import express from 'express';
import Task from '../models/Task.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { verifyUserId } from '../middleware/auth.js';

const router = express.Router();

// Middleware para verificar usuario
router.use(verifyUserId);

// GET todas las tareas del usuario (creadas por él)
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(400).json({ error: 'Se requiere el header x-user-id' });
    }

    const tasks = await Task.find({ createdBy: userId })
      .populate('assignedTeams', 'name')
      .sort({ dueDate: 1, createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

// POST crear nueva tarea
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { title, description, priority, dueDate, startTime, endTime, assignedTeams } = req.body;

    // Validaciones
    if (!title || title.trim().length < 2 || title.trim().length > 20) {
      return res.status(400).json({ error: 'El título debe tener entre 2 y 20 caracteres' });
    }

    if (!description || description.trim().length < 5 || description.trim().length > 50) {
      return res.status(400).json({ error: 'La descripción debe tener entre 5 y 50 caracteres' });
    }

    if (!priority || !['low', 'medium', 'high', 'critical'].includes(priority)) {
      return res.status(400).json({ error: 'Prioridad inválida' });
    }

    if (!dueDate) {
      return res.status(400).json({ error: 'La fecha de vencimiento es requerida' });
    }

    const selectedDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({ error: 'La fecha no puede ser anterior a hoy' });
    }

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    maxDate.setHours(23, 59, 59, 999);

    if (selectedDate > maxDate) {
      return res.status(400).json({ error: 'La fecha no puede ser más de 90 días a partir de hoy' });
    }

    // Validar horas si se proporcionan
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (startTime) {
      if (!timeRegex.test(startTime)) {
        return res.status(400).json({ error: 'Formato de hora de inicio inválido (HH:mm)' });
      }
      if (selectedDate.getTime() === today.getTime()) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const selectedTime = new Date();
        selectedTime.setHours(hours, minutes, 0, 0);
        const now = new Date();
        if (selectedTime < now) {
          return res.status(400).json({ error: 'La hora de inicio no puede ser pasada del día actual' });
        }
      }
    }
    if (endTime) {
      if (!timeRegex.test(endTime)) {
        return res.status(400).json({ error: 'Formato de hora de fin inválido (HH:mm)' });
      }
      if (startTime && endTime <= startTime) {
        return res.status(400).json({ error: 'La hora de fin debe ser posterior a la de inicio' });
      }
    }

    // Crear tarea
    const task = new Task({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: selectedDate,
      startTime: startTime || null,
      endTime: endTime || null,
      createdBy: userId,
      assignedTeams: assignedTeams || [],
    });

    await task.save();
    await task.populate('assignedTeams', 'name');

    // TODO: Integrar con Google Calendar
    // TODO: Enviar correos a los equipos asignados

    res.status(201).json({
      message: 'Tarea creada exitosamente',
      task,
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
});

// PUT actualizar tarea
router.put('/:taskId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { taskId } = req.params;
    const { title, description, priority, status, dueDate, startTime, endTime, assignedTeams } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    if (task.createdBy.toString() !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta tarea' });
    }

    // Validaciones solo si se envían estos campos
    if (title) {
      if (title.trim().length < 2 || title.trim().length > 20) {
        return res.status(400).json({ error: 'El título debe tener entre 2 y 20 caracteres' });
      }
      task.title = title.trim();
    }

    if (description) {
      if (description.trim().length < 5 || description.trim().length > 50) {
        return res.status(400).json({ error: 'La descripción debe tener entre 5 y 50 caracteres' });
      }
      task.description = description.trim();
    }

    if (priority) {
      if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
        return res.status(400).json({ error: 'Prioridad inválida' });
      }
      task.priority = priority;
    }

    if (status) {
      if (!['pending', 'in_progress', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }
      task.status = status;
    }

    if (dueDate) {
      const selectedDate = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        return res.status(400).json({ error: 'La fecha no puede ser anterior a hoy' });
      }

      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 90);
      maxDate.setHours(23, 59, 59, 999);

      if (selectedDate > maxDate) {
        return res.status(400).json({ error: 'La fecha no puede ser más de 90 días a partir de hoy' });
      }

      task.dueDate = selectedDate;
    }

    if (startTime !== undefined) {
      if (startTime) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(startTime)) {
          return res.status(400).json({ error: 'Formato de hora de inicio inválido (HH:mm)' });
        }
        // Si la fecha es hoy, validar que la hora no sea pasada
        const taskDate = task.dueDate;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (taskDate.getTime() === today.getTime()) {
          const [hours, minutes] = startTime.split(':').map(Number);
          const selectedTime = new Date();
          selectedTime.setHours(hours, minutes, 0, 0);
          const now = new Date();
          if (selectedTime < now) {
            return res.status(400).json({ error: 'La hora de inicio no puede ser pasada del día actual' });
          }
        }
        task.startTime = startTime;
      } else {
        task.startTime = null;
      }
    }
    if (endTime !== undefined) {
      if (endTime) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(endTime)) {
          return res.status(400).json({ error: 'Formato de hora de fin inválido (HH:mm)' });
        }
        if (task.startTime && endTime <= task.startTime) {
          return res.status(400).json({ error: 'La hora de fin debe ser posterior a la de inicio' });
        }
        task.endTime = endTime;
      } else {
        task.endTime = null;
      }
    }

    if (assignedTeams !== undefined) {
      task.assignedTeams = assignedTeams || [];
    }

    task.updatedAt = new Date();
    await task.save();
    await task.populate('assignedTeams', 'name');

    res.json({
      message: 'Tarea actualizada exitosamente',
      task,
    });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
});

// DELETE eliminar tarea
router.delete('/:taskId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    if (task.createdBy.toString() !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta tarea' });
    }

    // TODO: Eliminar del Google Calendar si existe

    await Task.findByIdAndDelete(taskId);

    res.json({ message: 'Tarea eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
});

// GET tarea por ID
router.get('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId).populate('assignedTeams', 'name');

    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({ error: 'Error al obtener la tarea' });
  }
});

export default router;
