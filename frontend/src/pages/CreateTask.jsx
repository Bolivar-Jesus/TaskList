import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { alertSuccess, alertError } from '../utils/alert';

const CreateTask = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    team: '',
  });

  const [fieldErrors, setFieldErrors] = useState({
    title: '',
    description: '',
    dueDate: '',
    team: '',
  });

  const [teams, setTeams] = useState([]);

  // Cargar equipos cuando se monta el componente
  React.useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/teams`,
        {
          headers: {
            'x-user-id': user?.id,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Error al cargar los equipos';
        alertError(`❌ Error: ${errorMsg}`);
        return;
      }

      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error:', error);
      alertError(`❌ Error: ${error.message || 'No se pudieron cargar los equipos'}`);
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
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return 'La fecha de vencimiento no puede ser anterior a hoy';
    }
    return '';
  };

  const validateTeam = (value) => {
    if (!value) {
      return 'Debes seleccionar un equipo';
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
    } else if (name === 'team') {
      setFieldErrors((prev) => ({
        ...prev,
        team: validateTeam(value),
      }));
    }
  };

  const isFormValid = () => {
    return (
      !fieldErrors.title &&
      !fieldErrors.description &&
      !fieldErrors.dueDate &&
      !fieldErrors.team &&
      formData.title.trim() !== '' &&
      formData.description.trim() !== '' &&
      formData.dueDate !== '' &&
      formData.team !== ''
    );
  };

  const handleSaveTask = async () => {
    // Validar todos los campos
    const titleError = validateTitle(formData.title);
    const descriptionError = validateDescription(formData.description);
    const dueDateError = validateDueDate(formData.dueDate);
    const teamError = validateTeam(formData.team);

    setFieldErrors({
      title: titleError,
      description: descriptionError,
      dueDate: dueDateError,
      team: teamError,
    });

    if (titleError || descriptionError || dueDateError || teamError) {
      alertError('❌ Por favor, corrige los errores antes de crear la tarea');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/tasks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id,
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            dueDate: formData.dueDate,
            teamId: formData.team,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Error desconocido al crear la tarea';
        alertError(`❌ Error: ${errorMsg}`);
        return;
      }

      alertSuccess('✅ Tarea creada exitosamente');
      navigate('/tasks');
    } catch (error) {
      console.error('Error:', error);
      alertError(`❌ Error: ${error.message || 'No se pudo crear la tarea'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/tasks');
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
        Crear Nueva Tarea
      </Typography>

      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* Título */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título de la Tarea"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={!!fieldErrors.title}
                helperText={fieldErrors.title}
                placeholder="Ej: Implementar autenticación"
                inputProps={{ maxLength: 50 }}
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
                helperText={fieldErrors.description}
                placeholder="Describe los detalles de la tarea..."
                multiline
                rows={4}
                inputProps={{ maxLength: 200 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Prioridad */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
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
            </Grid>

            {/* Fecha de vencimiento */}
            <Grid item xs={12} sm={6}>
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
            </Grid>

            {/* Equipo */}
            <Grid item xs={12}>
              <FormControl fullWidth error={!!fieldErrors.team}>
                <InputLabel>Equipo</InputLabel>
                <Select
                  name="team"
                  value={formData.team}
                  label="Equipo"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">Selecciona un equipo</MenuItem>
                  {teams.map((team) => (
                    <MenuItem key={team._id} value={team._id}>
                      {team.name}
                    </MenuItem>
                  ))}
                </Select>
                {fieldErrors.team && (
                  <Typography variant="caption" sx={{ color: '#d32f2f', mt: 0.5 }}>
                    {fieldErrors.team}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Botones */}
            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSaveTask}
                  disabled={loading || !isFormValid()}
                >
                  {loading ? 'Creando...' : 'Crear Tarea'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateTask;

