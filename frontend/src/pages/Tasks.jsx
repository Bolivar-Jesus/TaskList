import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
  Divider,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupIcon from '@mui/icons-material/Group';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAuth } from '../context/AuthContext';
import { alertSuccess, alertError } from '../utils/alert';
import TeamsModal from '../components/TeamsModal';
import TeamDetailModal from '../components/TeamDetailModal';

const Tasks = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openTeamsModal, setOpenTeamsModal] = useState(false);
  const [openTeamDetail, setOpenTeamDetail] = useState(false);
  const [selectedTeamDetail, setSelectedTeamDetail] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    startTime: '',
    endTime: '',
    isAllDay: false,
    assignedTeams: [],
  });

  const [fieldErrors, setFieldErrors] = useState({
    title: '',
    description: '',
    priority: '',
    dueDate: '',
    startTime: '',
    endTime: '',
  });

  // ============================================
  // VALIDACIONES
  // ============================================

  const validateTitle = (value) => {
    if (!value.trim()) {
      return 'El título de la tarea es requerido';
    }
    if (value.trim().length < 2) {
      return 'El título debe tener al menos 2 caracteres';
    }
    if (value.trim().length > 20) {
      return 'El título no puede exceder 20 caracteres';
    }
    return '';
  };

  const validateDescription = (value) => {
    if (!value.trim()) {
      return 'La descripción es requerida';
    }
    if (value.trim().length < 5) {
      return 'La descripción debe tener al menos 5 caracteres';
    }
    if (value.trim().length > 50) {
      return 'La descripción no puede exceder 50 caracteres';
    }
    return '';
  };

  const validatePriority = (value) => {
    if (!value) {
      return 'Debes seleccionar una prioridad';
    }
    return '';
  };

  const validateDueDate = (value) => {
    if (!value) {
      return 'La fecha de vencimiento es requerida';
    }
    const selectedDate = new Date(value + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return 'La fecha no puede ser anterior a hoy';
    }
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    maxDate.setHours(23, 59, 59, 999);
    if (selectedDate > maxDate) {
      return 'La fecha no puede ser más de 90 días a partir de hoy';
    }
    return '';
  };

  const validateStartTime = (value, isAllDay = false) => {
    if (isAllDay) return '';
    if (!value) return 'La hora de inicio es requerida';
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) return 'Formato de hora de inicio inválido (HH:mm)';
    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate.getTime() === today.getTime()) {
        const [hours, minutes] = value.split(':').map(Number);
        const selectedTime = new Date();
        selectedTime.setHours(hours, minutes, 0, 0);
        const now = new Date();
        if (selectedTime < now) return 'La hora de inicio no puede ser pasada del día actual';
      }
    }
    return '';
  };

  const validateEndTime = (value, isAllDay = false) => {
    if (isAllDay) return '';
    if (!value) return 'La hora de fin es requerida';
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) return 'Formato de hora de fin inválido (HH:mm)';
    if (formData.startTime && value <= formData.startTime) return 'La hora de fin debe ser posterior a la de inicio';
    return '';
  };

  const hasRealChanges = () => {
    if (!editingTask) return true; // Crear nuevo = siempre permitir

    const titleChanged = formData.title.trim() !== (editingTask.title || '').trim();
    const descriptionChanged =
      formData.description.trim() !== (editingTask.description || '').trim();
    const priorityChanged = formData.priority !== (editingTask.priority || 'medium');
    const statusChanged = formData.status !== (editingTask.status || 'pending');
    const dueDateChanged = formData.dueDate !== (editingTask.dueDate ? editingTask.dueDate.split('T')[0] : '');
    const startTimeChanged = formData.startTime !== (editingTask.startTime || '');
    const endTimeChanged = formData.endTime !== (editingTask.endTime || '');
    const isAllDayChanged = formData.isAllDay !== (!editingTask.startTime && !editingTask.endTime);

    // Comparar equipos asignados
    const currentTeamIds = new Set(formData.assignedTeams.map((t) => (typeof t === 'string' ? t : t._id)));
    const originalTeamIds = new Set((editingTask.assignedTeams || []).map((t) => (typeof t === 'string' ? t : t._id)));
    const teamsChanged =
      currentTeamIds.size !== originalTeamIds.size ||
      Array.from(currentTeamIds).some((id) => !originalTeamIds.has(id));

    return (
      titleChanged ||
      descriptionChanged ||
      priorityChanged ||
      statusChanged ||
      dueDateChanged ||
      startTimeChanged ||
      endTimeChanged ||
      isAllDayChanged ||
      teamsChanged
    );
  };

  const isFormValid = () => {
    const titleError = validateTitle(formData.title);
    const descriptionError = validateDescription(formData.description);
    const priorityError = validatePriority(formData.priority);
    const dueDateError = validateDueDate(formData.dueDate);
    const startTimeError = validateStartTime(formData.startTime, formData.isAllDay);
    const endTimeError = validateEndTime(formData.endTime, formData.isAllDay);

    if (editingTask) {
      return !titleError && !descriptionError && !priorityError && !dueDateError && !startTimeError && !endTimeError && hasRealChanges();
    }

    return (
      !titleError &&
      !descriptionError &&
      !priorityError &&
      !dueDateError &&
      !startTimeError &&
      !endTimeError &&
      formData.title.trim() !== '' &&
      formData.description.trim() !== '' &&
      formData.dueDate !== ''
    );
  };

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validar en tiempo real
    if (name === 'title') {
      setFieldErrors((prev) => ({
        ...prev,
        title: validateTitle(value),
      }));
    } else if (name === 'description') {
      setFieldErrors((prev) => ({
        ...prev,
        description: validateDescription(value),
      }));
    } else if (name === 'priority') {
      setFieldErrors((prev) => ({
        ...prev,
        priority: validatePriority(value),
      }));
    } else if (name === 'dueDate') {
      setFieldErrors((prev) => ({
        ...prev,
        dueDate: validateDueDate(value),
        startTime: validateStartTime(formData.startTime),
      }));
    } else if (name === 'startTime') {
      setFieldErrors((prev) => ({
        ...prev,
        startTime: validateStartTime(value, formData.isAllDay),
      }));
    } else if (name === 'endTime') {
      setFieldErrors((prev) => ({
        ...prev,
        endTime: validateEndTime(value, formData.isAllDay),
      }));
    } else if (name === 'isAllDay') {
      if (value) {
        setFormData((prev) => ({
          ...prev,
          isAllDay: value,
          startTime: '',
          endTime: '',
        }));
        setFieldErrors((prev) => ({
          ...prev,
          startTime: '',
          endTime: '',
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          isAllDay: value,
        }));
      }
    }
  };

  const handleOpenTeamsModal = () => {
    setOpenTeamsModal(true);
  };

  const handleCloseTeamsModal = () => {
    setOpenTeamsModal(false);
  };

  const handleSaveTeams = (selectedTeams) => {
    setFormData((prev) => ({
      ...prev,
      assignedTeams: selectedTeams,
    }));
    setOpenTeamsModal(false);
  };

  // Cargar tareas
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/tasks`,
        {
          headers: {
            'x-user-id': user?.id,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Error al cargar las tareas';
        alertError(`❌ Error: ${errorMsg}`);
        return;
      }

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      alertError(`❌ Error: ${error.message || 'No se pudieron cargar las tareas'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        startTime: task.startTime || '',
        endTime: task.endTime || '',
        isAllDay: !task.startTime && !task.endTime,
        assignedTeams: task.assignedTeams || [],
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        dueDate: '',
        startTime: '',
        endTime: '',
        isAllDay: false,
        assignedTeams: [],
      });
    }
    setFieldErrors({
      title: '',
      description: '',
      priority: '',
      dueDate: '',
      startTime: '',
      endTime: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      dueDate: '',
      startTime: '',
      endTime: '',
      isAllDay: false,
      assignedTeams: [],
    });
    setFieldErrors({
      title: '',
      description: '',
      priority: '',
      dueDate: '',
      startTime: '',
      endTime: '',
    });
  };

  const handleSaveTask = async () => {
    // Validar todos los campos
    const titleError = validateTitle(formData.title);
    const descriptionError = validateDescription(formData.description);
    const priorityError = validatePriority(formData.priority);
    const dueDateError = validateDueDate(formData.dueDate);
    const startTimeError = validateStartTime(formData.startTime, formData.isAllDay);
    const endTimeError = validateEndTime(formData.endTime, formData.isAllDay);

    setFieldErrors({
      title: titleError,
      description: descriptionError,
      priority: priorityError,
      dueDate: dueDateError,
      startTime: startTimeError,
      endTime: endTimeError,
    });

    if (titleError) {
      alertError(`❌ Título: ${titleError}`);
      return;
    }
    if (descriptionError) {
      alertError(`❌ Descripción: ${descriptionError}`);
      return;
    }
    if (priorityError) {
      alertError(`❌ Prioridad: ${priorityError}`);
      return;
    }
    if (dueDateError) {
      alertError(`❌ Fecha de vencimiento: ${dueDateError}`);
      return;
    }
    if (startTimeError) {
      alertError(`❌ Hora de inicio: ${startTimeError}`);
      return;
    }
    if (endTimeError) {
      alertError(`❌ Hora de fin: ${endTimeError}`);
      return;
    }

    if (editingTask && !hasRealChanges()) {
      alertError('❌ No hay cambios para guardar');
      return;
    }

    setLoading(true);
    try {
      const url = editingTask
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/tasks/${editingTask._id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/tasks`;

      const method = editingTask ? 'PUT' : 'POST';

      const requestBody = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate,
        startTime: formData.isAllDay ? null : (formData.startTime || null),
        endTime: formData.isAllDay ? null : (formData.endTime || null),
        assignedTeams: formData.assignedTeams.map((t) => (typeof t === 'string' ? t : t._id)),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Error desconocido al guardar la tarea';
        alertError(`❌ Error: ${errorMsg}`);
        return;
      }

      alertSuccess(
        editingTask ? '✅ Tarea actualizada correctamente' : '✅ Tarea creada exitosamente'
      );
      handleCloseDialog();
      fetchTasks();
    } catch (error) {
      alertError(`❌ Error: ${error.message || 'No se pudo guardar la tarea'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/tasks/${taskId}`,
        {
          method: 'DELETE',
          headers: {
            'x-user-id': user?.id,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Error al eliminar la tarea';
        alertError(`❌ Error: ${errorMsg}`);
        return;
      }

      alertSuccess('✅ Tarea eliminada correctamente');
      fetchTasks();
    } catch (error) {
      alertError(`❌ Error: ${error.message || 'No se pudo eliminar la tarea'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/tasks/${taskId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id,
          },
          body: JSON.stringify({ status: 'completed' }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Error al completar la tarea';
        alertError(`❌ Error: ${errorMsg}`);
        return;
      }

      alertSuccess('✅ Tarea marcada como completada');
      fetchTasks();
    } catch (error) {
      alertError(`❌ Error: ${error.message || 'No se pudo completar la tarea'}`);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'success';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'critical':
        return '🔴 Crítica';
      case 'high':
        return '🟠 Alta';
      case 'medium':
        return '🟡 Media';
      case 'low':
        return '🟢 Baja';
      default:
        return priority;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return '✅ Completada';
      case 'in_progress':
        return '⏳ En Progreso';
      case 'pending':
        return '⏱️ Pendiente';
      default:
        return status;
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          📋 Tareas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {isMobile ? '+ Nueva' : '+ Nueva Tarea'}
        </Button>
      </Box>

      {/* Content */}
      {tasks.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 10,
            px: 3,
            backgroundColor: (t) => t.palette.background.paper,
            borderRadius: 2,
            border: (t) => `2px dashed ${t.palette.primary.main}`,
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, color: (t) => t.palette.primary.main, fontWeight: 600 }}>
            📝 Sin tareas aún
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
            Crea tu primera tarea para empezar a organizar tu trabajo
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size="large"
            sx={{ borderRadius: 2 }}
          >
            Crear Primera Tarea
          </Button>
        </Box>
      ) : isMobile ? (
        // Vista móvil: Tarjetas
        <Grid container spacing={2}>
          {tasks.map((task) => (
            <Grid item xs={12} key={task._id}>
              <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {task.title}
                    </Typography>
                    <Chip
                      label={getStatusLabel(task.status)}
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {task.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={getPriorityLabel(task.priority)}
                      color={getPriorityColor(task.priority)}
                      size="small"
                    />
                    <Chip
                      label={`📅 ${new Date(task.dueDate).toLocaleDateString('es-ES')}`}
                      size="small"
                      variant="outlined"
                    />
                    {task.startTime && task.endTime && (
                      <Chip
                        label={`⏰ ${task.startTime} - ${task.endTime}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {!task.startTime && !task.endTime && (
                      <Chip
                        label="📅 Todo el día"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  {task.assignedTeams && task.assignedTeams.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary">
                        Equipos asignados:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                        {task.assignedTeams.map((team) => (
                          <Chip
                            key={typeof team === 'string' ? team : team._id}
                            label={typeof team === 'string' ? team : team.name}
                            size="small"
                            icon={<GroupIcon />}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleCompleteTask(task._id)}
                      disabled={task.status === 'completed'}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Completar
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(task)}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteTask(task._id)}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Eliminar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        // Vista escritorio: Tabla
        <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ backgroundColor: theme.palette.background.default }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Título</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Descripción</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  Prioridad
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  Estado
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Vencimiento</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Equipos</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task._id} sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{task.title}</TableCell>
                  <TableCell>{task.description?.substring(0, 30)}...</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getPriorityLabel(task.priority)}
                      color={getPriorityColor(task.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getStatusLabel(task.status)}
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(task.dueDate).toLocaleDateString('es-ES')}
                    {task.startTime && task.endTime && ` - ${task.startTime} a ${task.endTime}`}
                    {!task.startTime && !task.endTime && ' - Todo el día'}
                  </TableCell>
                  <TableCell>
                    {task.assignedTeams && task.assignedTeams.length > 0 ? (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {task.assignedTeams.slice(0, 2).map((team) => (
                          <Chip
                            key={typeof team === 'string' ? team : team._id}
                            label={typeof team === 'string' ? team : team.name}
                            size="small"
                            icon={<GroupIcon />}
                          />
                        ))}
                        {task.assignedTeams.length > 2 && (
                          <Chip label={`+${task.assignedTeams.length - 2}`} size="small" />
                        )}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        Sin equipos
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleCompleteTask(task._id)}
                      disabled={task.status === 'completed'}
                      sx={{ mr: 1, fontSize: '0.75rem' }}
                    >
                      Completar
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(task)}
                      sx={{ mr: 1, fontSize: '0.75rem' }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteTask(task._id)}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog para crear/editar tarea */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem' }}>
          {editingTask ? '✏️ Editar Tarea' : 'Nueva Tarea'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            {/* Título */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={!!fieldErrors.title}
                helperText={fieldErrors.title || `${formData.title.length}/20`}
                placeholder="Ej: Implementar autenticación"
                inputProps={{ maxLength: 20 }}
                variant="outlined"
                InputLabelProps={{ 
                  shrink: formData.title !== '' || document.activeElement?.name === 'title'
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                  },
                  '& .MuiInputLabel-shrink': {
                    transform: 'translate(14px, -9px) scale(0.75)',
                  },
                }}
              />
            </Grid>

            {/* Descripción */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={!!fieldErrors.description}
                helperText={fieldErrors.description || `${formData.description.length}/50`}
                placeholder="Describe los detalles de la tarea..."
                multiline
                rows={4}
                inputProps={{ maxLength: 50 }}
                variant="outlined"
                InputLabelProps={{ 
                  shrink: formData.description !== '' || document.activeElement?.name === 'description'
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                  },
                  '& .MuiInputLabel-shrink': {
                    transform: 'translate(14px, -9px) scale(0.75)',
                  },
                  width: '100%',
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Prioridad */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!fieldErrors.priority}>
                <InputLabel>Prioridad *</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  label="Prioridad *"
                  onChange={handleInputChange}
                >
                  <MenuItem value="low">🟢 Baja</MenuItem>
                  <MenuItem value="medium">🟡 Media</MenuItem>
                  <MenuItem value="high">🟠 Alta</MenuItem>
                  <MenuItem value="critical">🔴 Crítica</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Estado (solo si está editando) */}
            {editingTask && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    label="Estado"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="pending">⏱️ Pendiente</MenuItem>
                    <MenuItem value="in_progress">⏳ En Progreso</MenuItem>
                    <MenuItem value="completed">✅ Completada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Fecha de vencimiento */}
            <Grid item xs={12} sm={6} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Fecha de Vencimiento *"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleInputChange}
                error={!!fieldErrors.dueDate}
                helperText={fieldErrors.dueDate}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                inputProps={{
                  min: new Date().toISOString().split('T')[0],
                  max: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                }}
              />
            </Grid>

            {/* Hora de inicio */}
            <Grid item xs={12} sm={6} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Hora de inicio *"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleInputChange}
                error={!!fieldErrors.startTime}
                helperText={fieldErrors.startTime || 'Formato: HH:mm'}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                disabled={formData.isAllDay}
                inputProps={{ step: 60 }}
              />
            </Grid>
            {/* Hora de fin */}
            <Grid item xs={12} sm={6} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Hora de fin *"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleInputChange}
                error={!!fieldErrors.endTime}
                helperText={fieldErrors.endTime || 'Formato: HH:mm'}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                disabled={formData.isAllDay}
                inputProps={{ step: 60 }}
              />
            </Grid>

            {/* Checkbox "Todo el día" */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isAllDay"
                    checked={formData.isAllDay}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        isAllDay: e.target.checked,
                        startTime: e.target.checked ? '' : prev.startTime,
                        endTime: e.target.checked ? '' : prev.endTime,
                      }));
                      setFieldErrors((prev) => ({
                        ...prev,
                        startTime: '',
                        endTime: '',
                      }));
                    }}
                  />
                }
                label="📅 Todo el día - Alarma cada hora hasta completar"
                sx={{ mb: 1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Equipos */}
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: theme.palette.action.hover,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Equipos Asignados
                  </Typography>
                  <Button
                    size="small"
                    color="primary"
                    onClick={handleOpenTeamsModal}
                    sx={{ textTransform: 'none' }}
                    variant="outlined"
                  >
                    + Agregar
                  </Button>
                </Box>
                {formData.assignedTeams.length > 0 ? (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {formData.assignedTeams.map((team) => (
                      <Chip
                        key={typeof team === 'string' ? team : team._id}
                        label={typeof team === 'string' ? team : team.name}
                        onClick={() => {
                          setSelectedTeamDetail(team);
                          setOpenTeamDetail(true);
                        }}
                        onDelete={() => {
                          setFormData((prev) => ({
                            ...prev,
                            assignedTeams: prev.assignedTeams.filter(
                              (t) => (typeof t === 'string' ? t : t._id) !== (typeof team === 'string' ? team : team._id)
                            ),
                          }));
                        }}
                        icon={<GroupIcon />}
                        clickable
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8,
                          },
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="caption" color="textSecondary">
                    No hay equipos seleccionados
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveTask}
            variant="contained"
            color="primary"
            disabled={loading || !isFormValid()}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {loading ? 'Guardando...' : editingTask ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Equipos */}
      <TeamsModal
        open={openTeamsModal}
        onClose={handleCloseTeamsModal}
        onSave={handleSaveTeams}
        selectedTeams={formData.assignedTeams}
      />

      {/* Modal de Detalles del Equipo */}
      <TeamDetailModal
        open={openTeamDetail}
        onClose={() => setOpenTeamDetail(false)}
        team={selectedTeamDetail}
      />
    </Box>
  );
};

export default Tasks;

