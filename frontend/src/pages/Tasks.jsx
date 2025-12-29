import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
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
  TextField,
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { alertSuccess, alertError } from '../utils/alert';

const Tasks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
  });

  const [fieldErrors, setFieldErrors] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

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
      console.error('Error:', error);
      alertError(`❌ Error: ${error.message || 'No se pudieron cargar las tareas'}`);
    } finally {
      setLoading(false);
    }
  };

  const validateTitle = (value) => {
    if (!value.trim()) {
      return 'El título de la tarea es requerido';
    }
    if (value.length < 3) {
      return 'El título debe tener al menos 3 caracteres';
    }
    if (value.length > 50) {
      return 'El título no puede exceder 50 caracteres';
    }
    return '';
  };

  const validateDescription = (value) => {
    if (!value.trim()) {
      return 'La descripción es requerida';
    }
    if (value.length < 5) {
      return 'La descripción debe tener al menos 5 caracteres';
    }
    if (value.length > 200) {
      return 'La descripción no puede exceder 200 caracteres';
    }
    return '';
  };

  const validateDueDate = (value) => {
    if (!value) {
      return 'La fecha de vencimiento es requerida';
    }
    return '';
  };

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
    } else if (name === 'dueDate') {
      setFieldErrors((prev) => ({
        ...prev,
        dueDate: validateDueDate(value),
      }));
    }
  };

  const isFormValid = () => {
    return (
      !fieldErrors.title &&
      !fieldErrors.description &&
      !fieldErrors.dueDate &&
      formData.title.trim() !== '' &&
      formData.description.trim() !== '' &&
      formData.dueDate !== ''
    );
  };

  const handleOpenDialog = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        dueDate: '',
      });
    }
    setFieldErrors({ title: '', description: '', dueDate: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
    setFormData({ title: '', description: '', priority: 'medium', status: 'pending', dueDate: '' });
    setFieldErrors({ title: '', description: '', dueDate: '' });
  };

  const handleSaveTask = async () => {
    // Validar todos los campos
    const titleError = validateTitle(formData.title);
    const descriptionError = validateDescription(formData.description);
    const dueDateError = validateDueDate(formData.dueDate);

    setFieldErrors({
      title: titleError,
      description: descriptionError,
      dueDate: dueDateError,
    });

    if (titleError || descriptionError || dueDateError) {
      alertError('❌ Por favor, corrige los errores antes de guardar');
      return;
    }

    setLoading(true);
    try {
      const url = editingTask
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/tasks/${editingTask._id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/tasks`;

      const method = editingTask ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: formData.status,
          dueDate: formData.dueDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Error desconocido al guardar la tarea';
        alertError(`❌ Error: ${errorMsg}`);
        return;
      }

      alertSuccess(editingTask ? '✅ Tarea actualizada correctamente' : '✅ Tarea creada exitosamente');
      handleCloseDialog();
      fetchTasks();
    } catch (error) {
      console.error('Error:', error);
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
      console.error('Error:', error);
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
      console.error('Error:', error);
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

  if (loading && tasks.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Mis Tareas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/create-task')}
          disabled={loading}
        >
          {isMobile ? 'Nueva' : 'Nueva Tarea'}
        </Button>
      </Box>

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
            onClick={() => navigate('/create-task')}
            size="large"
          >
            Crear Primera Tarea
          </Button>
        </Box>
      ) : isMobile ? (
        // Vista móvil: Tarjetas
        <Grid container spacing={2}>
          {tasks.map((task) => (
            <Grid item xs={12} key={task._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6">{task.title}</Typography>
                    <Chip
                      label={task.status}
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {task.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={task.priority}
                      color={getPriorityColor(task.priority)}
                      size="small"
                    />
                    <Chip
                      label={`Vence: ${new Date(task.dueDate).toLocaleDateString('es-ES')}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleCompleteTask(task._id)}
                      disabled={task.status === 'completed'}
                    >
                      Completar
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(task)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteTask(task._id)}
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="center">Prioridad</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell>Vencimiento</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task._id}>
                  <TableCell sx={{ fontWeight: 600 }}>{task.title}</TableCell>
                  <TableCell>{task.description?.substring(0, 30)}...</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={task.priority}
                      color={getPriorityColor(task.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={task.status}
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(task.dueDate).toLocaleDateString('es-ES')}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleCompleteTask(task._id)}
                      disabled={task.status === 'completed'}
                      sx={{ mr: 1 }}
                    >
                      Completar
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(task)}
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteTask(task._id)}
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

      {/* Diálogo para editar tarea */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Editar Tarea' : 'Crear Nueva Tarea'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Título de la Tarea"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            error={!!fieldErrors.title}
            helperText={fieldErrors.title}
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 50 }}
          />
          <TextField
            fullWidth
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            error={!!fieldErrors.description}
            helperText={fieldErrors.description}
            multiline
            rows={3}
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 200 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Prioridad</InputLabel>
            <Select
              name="priority"
              value={formData.priority}
              label="Prioridad"
              onChange={handleInputChange}
            >
              <MenuItem value="low">Baja</MenuItem>
              <MenuItem value="medium">Media</MenuItem>
              <MenuItem value="high">Alta</MenuItem>
              <MenuItem value="critical">Crítica</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              name="status"
              value={formData.status}
              label="Estado"
              onChange={handleInputChange}
            >
              <MenuItem value="pending">Pendiente</MenuItem>
              <MenuItem value="in_progress">En Progreso</MenuItem>
              <MenuItem value="completed">Completada</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Fecha de Vencimiento"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleInputChange}
            error={!!fieldErrors.dueDate}
            helperText={fieldErrors.dueDate}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSaveTask}
            variant="contained"
            color="primary"
            disabled={loading || !isFormValid()}
          >
            {loading ? 'Guardando...' : editingTask ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;

