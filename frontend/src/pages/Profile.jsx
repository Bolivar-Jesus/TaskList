import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../context/AuthContext';
import { alertSuccess, alertError } from '../utils/alert';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    timeFormat: '24h',
  });
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    if (user) {
      const data = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        timeFormat: user.timeFormat || '24h',
      };
      setFormData(data);
      setImageError(false);
    }
  }, [user]);

  // Validaciones en tiempo real
  const validateName = (value) => {
    if (!value.trim()) {
      return 'El nombre es requerido';
    }
    if (value.length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    if (value.length > 30) {
      return 'El nombre no puede exceder 30 caracteres';
    }
    // Validar que solo contenga letras, espacios y tildes
    const nameRegex = /^[a-záéíóúñ\s]+$/i;
    if (!nameRegex.test(value)) {
      return 'El nombre solo puede contener letras, espacios y tildes';
    }
    return '';
  };

  const validateEmail = (value) => {
    if (!value.trim()) {
      return 'El email es requerido';
    }
    if (value.length < 15) {
      return 'El email debe tener al menos 15 caracteres';
    }
    if (value.length > 40) {
      return 'El email no puede exceder 40 caracteres';
    }
    if (value.includes(' ')) {
      return 'El email no puede contener espacios';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'El email no es válido';
    }
    return '';
  };

  const validatePhone = (value) => {
    if (!value.trim()) {
      return ''; // El teléfono es opcional
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(value)) {
      return 'El teléfono debe contener exactamente 10 dígitos';
    }
    return '';
  };

  const validateField = (name, value) => {
    let error = '';
    if (name === 'name') {
      error = validateName(value);
    } else if (name === 'email') {
      error = validateEmail(value);
    } else if (name === 'phone') {
      error = validatePhone(value);
    }
    return error;
  };

  const handleFieldFocus = (fieldName) => {
    setEditingField(fieldName);
  };

  const handleFieldBlur = () => {
    setEditingField(null);
  };

  // Verificar si el formulario es válido
  const isFormValid = () => {
    return (
      !fieldErrors.name &&
      !fieldErrors.email &&
      !fieldErrors.phone &&
      formData.name.trim() !== '' &&
      formData.email.trim() !== ''
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validar en tiempo real
    if (['name', 'email', 'phone'].includes(name)) {
      const error = validateField(name, value);
      setFieldErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleSave = async () => {
    // Validar todos los campos
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);

    setFieldErrors({
      name: nameError,
      email: emailError,
      phone: phoneError,
    });

    // Si hay errores, no guardar
    if (nameError || emailError || phoneError) {
      alertError('Por favor, corrige los errores antes de guardar');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          timeFormat: formData.timeFormat,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el perfil');
      }

      const data = await response.json();
      console.log('Respuesta del servidor:', data.user);
      console.log('timeFormat en respuesta:', data.user.timeFormat);
      
      // Actualizar el usuario en el contexto y localStorage
      const updatedUser = {
        ...data.user,
        timeFormat: data.user.timeFormat || '24h',
      };
      
      console.log('Usuario a actualizar:', updatedUser);
      updateUser(updatedUser);
      console.log('Usuario actualizado en contexto');
      alertSuccess('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error:', error);
      alertError(error.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const getProfileImageUrl = () => {
    if (!user?.picture) return undefined;
    let pictureUrl = user.picture;
    if (pictureUrl.startsWith('http://')) {
      pictureUrl = pictureUrl.replace('http://', 'https://');
    }
    if (!pictureUrl.startsWith('https://')) {
      return undefined;
    }
    return pictureUrl;
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Encabezado */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
        <span translate="no">Mi Perfil</span>
      </Typography>

      {/* Card principal con información del usuario */}
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
            {/* Avatar y Info Básica */}
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={!imageError ? getProfileImageUrl() : undefined}
                alt={user.name}
                onError={() => setImageError(true)}
                sx={{
                  width: isMobile ? 100 : 150,
                  height: isMobile ? 100 : 150,
                  mb: 2,
                  border: '4px solid',
                  borderColor: 'primary.main',
                  fontSize: '3rem',
                  fontWeight: 700,
                }}
              >
                {(!getProfileImageUrl() || imageError) && user.name ? user.name.charAt(0).toUpperCase() : ''}
              </Avatar>
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mb: 1 }}>
                Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES')}
              </Typography>
              <Typography 
                variant="caption" 
                color="textSecondary" 
                sx={{ 
                  textAlign: 'center',
                  fontSize: '0.7rem',
                  fontStyle: 'italic',
                  maxWidth: '160px',
                  display: 'block',
                }}
              >
                Tu foto se sincroniza con tu cuenta de Google
              </Typography>
            </Grid>

            {/* Información del Usuario */}
            <Grid item xs={12} md={8} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: '100%', maxWidth: 600 }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Información Personal
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Campos de Formulario */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500, mx: 'auto' }}>
                <Box>
                  <TextField
                    label="Nombre Completo"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onFocus={() => handleFieldFocus('name')}
                    onBlur={handleFieldBlur}
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={fieldErrors.name !== ''}
                    disabled={(editingField && editingField !== 'name') || (fieldErrors.email !== '' || fieldErrors.phone !== '')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderColor: fieldErrors.name ? '#d32f2f' : 'rgba(0, 0, 0, 0.23)',
                        '&:hover fieldset': {
                          borderColor: fieldErrors.name ? '#d32f2f' : 'rgba(0, 0, 0, 0.87)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: fieldErrors.name ? '#d32f2f' : '#1976d2',
                        },
                      },
                    }}
                  />
                  {fieldErrors.name && (
                    <Typography variant="caption" sx={{ color: '#d32f2f', display: 'block', mt: 0.5 }}>
                      {fieldErrors.name}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => handleFieldFocus('email')}
                    onBlur={handleFieldBlur}
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={fieldErrors.email !== ''}
                    disabled={(editingField && editingField !== 'email') || (fieldErrors.name !== '' || fieldErrors.phone !== '')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderColor: fieldErrors.email ? '#d32f2f' : 'rgba(0, 0, 0, 0.23)',
                        '&:hover fieldset': {
                          borderColor: fieldErrors.email ? '#d32f2f' : 'rgba(0, 0, 0, 0.87)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: fieldErrors.email ? '#d32f2f' : '#1976d2',
                        },
                      },
                    }}
                  />
                  {fieldErrors.email && (
                    <Typography variant="caption" sx={{ color: '#d32f2f', display: 'block', mt: 0.5 }}>
                      {fieldErrors.email}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <TextField
                    label="Celular (Opcional)"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onFocus={() => handleFieldFocus('phone')}
                    onBlur={handleFieldBlur}
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="1234567890"
                    error={fieldErrors.phone !== ''}
                    disabled={(editingField && editingField !== 'phone') || (fieldErrors.name !== '' || fieldErrors.email !== '')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderColor: fieldErrors.phone ? '#d32f2f' : 'rgba(0, 0, 0, 0.23)',
                        '&:hover fieldset': {
                          borderColor: fieldErrors.phone ? '#d32f2f' : 'rgba(0, 0, 0, 0.87)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: fieldErrors.phone ? '#d32f2f' : '#1976d2',
                        },
                      },
                    }}
                  />
                  {fieldErrors.phone && (
                    <Typography variant="caption" sx={{ color: '#d32f2f', display: 'block', mt: 0.5 }}>
                      {fieldErrors.phone}
                    </Typography>
                  )}
                </Box>
              </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Card de Configuración */}
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Configuración
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* Formato de Hora */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Formato de Hora
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Elige cómo prefieres que se muestre la hora en la aplicación
            </Typography>

            <Box sx={{ maxWidth: 300, mx: 'auto', mb: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Selecciona un formato</InputLabel>
                <Select
                  name="timeFormat"
                  value={formData.timeFormat}
                  label="Selecciona un formato"
                  onChange={handleInputChange}
                >
                  <MenuItem value="24h">Formato 24 horas</MenuItem>
                  <MenuItem value="12h">Formato 12 horas (con AM/PM)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Previsualización */}
            <Paper
              sx={{
                p: 2,
                backgroundColor: 'action.hover',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                maxWidth: 300,
                mx: 'auto',
              }}
            >
              <Typography variant="caption" color="textSecondary" sx={{ mb: 1 }}>
                Vista Previa
              </Typography>
              <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {formData.timeFormat === '12h'
                  ? new Date().toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true,
                    })
                  : new Date().toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                {formData.timeFormat === '24h' ? 'Ej: 14:30:45' : 'Ej: 2:30:45 PM'}
              </Typography>
            </Paper>
          </Box>

          {/* Botón de Guardar */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="success"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={loading || !isFormValid()}
              size="large"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Información Adicional */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Detalles de la Cuenta
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">
                ID de Google
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {user.googleId}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">
                ID de Usuario
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {user.id}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">
                Cuenta Creada
              </Typography>
              <Typography variant="body2">
                {new Date(user.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="textSecondary">
                Última Actualización
              </Typography>
              <Typography variant="body2">
                {new Date(user.updatedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;

