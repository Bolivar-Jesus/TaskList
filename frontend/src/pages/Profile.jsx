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
    bio: '',
    timeFormat: '24h',
  });
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const data = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        timeFormat: user.timeFormat || '24h',
      };
      setFormData(data);
      setImageError(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    // Validaciones
    if (!formData.name.trim()) {
      alertError('El nombre es requerido');
      return;
    }

    if (!formData.email.trim()) {
      alertError('El email es requerido');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alertError('Por favor ingresa un email válido');
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
          bio: formData.bio || null,
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
          <Grid container spacing={3}>
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
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
                Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES')}
              </Typography>
            </Grid>

            {/* Información del Usuario */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Información Personal
              </Typography>

              <Divider sx={{ mb: 2 }} />

              {/* Campos de Formulario */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Nombre Completo"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                />

                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                />

                <TextField
                  label="Teléfono (Opcional)"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="+1 (555) 000-0000"
                />

                <TextField
                  label="Biografía (Opcional)"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  multiline
                  rows={3}
                  placeholder="Cuéntanos sobre ti..."
                />
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
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Formato de Hora
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Elige cómo prefieres que se muestre la hora en la aplicación
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
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
            </Grid>

            {/* Previsualización */}
            <Grid item xs={12} sm={6}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: 'action.hover',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
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
            </Grid>
          </Grid>

          {/* Botón de Guardar */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="success"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={loading}
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

