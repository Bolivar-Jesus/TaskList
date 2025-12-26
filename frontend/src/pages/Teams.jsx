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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import { alertSuccess, alertError } from '../utils/alert';
import MembersModal from '../components/MembersModal';

const Teams = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openMembersModal, setOpenMembersModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    imagePreview: null,
    members: [],
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    description: '',
  });

  // Validaciones en tiempo real
  const validateName = (value) => {
    if (!value.trim()) {
      return 'El nombre del equipo es requerido';
    }
    if (value.length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    if (value.length > 20) {
      return 'El nombre no puede exceder 20 caracteres';
    }
    return '';
  };

  const validateDescription = (value) => {
    if (!value.trim()) {
      return ''; // Es opcional
    }
    if (value.length < 5) {
      return 'La descripción debe tener al menos 5 caracteres';
    }
    if (value.length > 50) {
      return 'La descripción no puede exceder 50 caracteres';
    }
    return '';
  };

  const validateField = (name, value) => {
    let error = '';
    if (name === 'name') {
      error = validateName(value);
    } else if (name === 'description') {
      error = validateDescription(value);
    }
    return error;
  };

  // Cargar equipos
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
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
        throw new Error('Error al cargar los equipos');
      }

      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error:', error);
      // Solo mostrar alerta si hay un error real, no si simplemente no hay equipos
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (['name', 'description'].includes(name)) {
      const error = validateField(name, value);
      setFieldErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alertError('Solo se permiten archivos de imagen');
        return;
      }

      // Validar tamaño máximo (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alertError('La imagen no puede exceder 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: event.target?.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
      imagePreview: null,
    }));
  };

  const isFormValid = () => {
    return (
      !fieldErrors.name &&
      !fieldErrors.description &&
      formData.name.trim() !== '' &&
      formData.members.length > 0
    );
  };

  const handleOpenDialog = (team = null) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        name: team.name,
        description: team.description || '',
        image: null,
        imagePreview: team.image || null,
        members: team.members || [],
      });
    } else {
      setEditingTeam(null);
      setFormData({
        name: '',
        description: '',
        image: null,
        imagePreview: null,
        members: [],
      });
    }
    setFieldErrors({ name: '', description: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTeam(null);
    setFormData({ name: '', description: '', image: null, imagePreview: null, members: [] });
    setFieldErrors({ name: '', description: '' });
  };

  const handleAddMembers = (team) => {
    setSelectedTeamForMembers(team);
    setOpenMembersModal(true);
  };

  const handleSaveMembers = (newMembers) => {
    setFormData((prev) => ({
      ...prev,
      members: newMembers,
    }));
    setOpenMembersModal(false);
  };

  const handleSaveTeam = async () => {
    // Validar nombre
    const nameError = validateName(formData.name);
    if (nameError) {
      setFieldErrors({ name: nameError, description: '' });
      alertError(`❌ Nombre: ${nameError}`);
      return;
    }

    // Validar descripción
    const descriptionError = validateDescription(formData.description);
    if (descriptionError) {
      setFieldErrors({ name: '', description: descriptionError });
      alertError(`❌ Descripción: ${descriptionError}`);
      return;
    }

    // Validar miembros
    if (formData.members.length === 0) {
      setFieldErrors({ name: '', description: '' });
      alertError('❌ Debes agregar al menos un miembro al equipo');
      return;
    }

    setFieldErrors({ name: '', description: '' });
    setLoading(true);
    try {
      const url = editingTeam
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/teams/${editingTeam._id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/teams`;

      const method = editingTeam ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          image: formData.imagePreview || null,
          members: formData.members.map((m) => (typeof m === 'string' ? m : m._id)),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.error || 'Error desconocido al guardar el equipo';
        alertError(`❌ Error: ${errorMsg}`);
        return;
      }

      alertSuccess(editingTeam ? '✅ Equipo actualizado correctamente' : '✅ Equipo creado exitosamente');
      handleCloseDialog();
      fetchTeams();
    } catch (error) {
      console.error('Error:', error);
      if (error.message.includes('413')) {
        alertError('❌ La imagen es demasiado grande. Máximo 5MB');
      } else if (error.message.includes('payload')) {
        alertError('❌ Los datos son demasiado grandes. Intenta con una imagen más pequeña');
      } else {
        alertError(`❌ Error: ${error.message || 'No se pudo guardar el equipo'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/teams/${teamId}`,
        {
          method: 'DELETE',
          headers: {
            'x-user-id': user?.id,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al eliminar el equipo');
      }

      alertSuccess('Equipo eliminado correctamente');
      fetchTeams();
    } catch (error) {
      console.error('Error:', error);
      alertError('Error al eliminar el equipo');
    } finally {
      setLoading(false);
    }
  };

  if (loading && teams.length === 0) {
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
          Equipos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          {isMobile ? 'Nuevo' : 'Nuevo Equipo'}
        </Button>
      </Box>

      {teams.length === 0 ? (
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
            📋 Sin equipos aún
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
            Crea tu primer equipo para empezar a colaborar
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size="large"
          >
            Crear Primer Equipo
          </Button>
        </Box>
      ) : isMobile ? (
        // Vista móvil: Tarjetas
        <Grid container spacing={2}>
          {teams.map((team) => (
            <Grid item xs={12} key={team._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {team.image && (
                      <img
                        src={team.image}
                        alt="equipo"
                        style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                    )}
                    <Typography variant="h6">
                      {team.name}
                    </Typography>
                  </Box>
                  {team.description && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {team.description}
                    </Typography>
                  )}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary">
                      Miembros: {team.members?.length || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {team.members?.slice(0, 3).map((member) => (
                      <Chip
                        key={member._id}
                        label={member.name}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {team.members?.length > 3 && (
                      <Chip
                        label={`+${team.members.length - 3}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                    <Button
                      size="small"
                      startIcon={<PersonAddIcon />}
                      onClick={() => handleAddMembers(team)}
                    >
                      Miembros
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(team)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteTeam(team._id)}
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
                <TableCell width="5%"></TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="center">Miembros</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team._id}>
                  <TableCell width="5%">
                    {team.image && (
                      <img
                        src={team.image}
                        alt="equipo"
                        style={{ width: '35px', height: '35px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{team.name}</TableCell>
                  <TableCell>{team.description || '-'}</TableCell>
                  <TableCell align="center">{team.members?.length || 0}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<PersonAddIcon />}
                      onClick={() => handleAddMembers(team)}
                      sx={{ mr: 1 }}
                    >
                      Miembros
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(team)}
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteTeam(team._id)}
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

      {/* Diálogo para crear/editar equipo */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTeam ? 'Editar Equipo' : 'Crear Nuevo Equipo'}</DialogTitle>
        <DialogContent sx={{ pt: 2, overflow: 'visible' }}>
          <TextField
            fullWidth
            label="Nombre del Equipo"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={!!fieldErrors.name}
            helperText={fieldErrors.name}
            placeholder="Ej: Equipo de Desarrollo"
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 30 }}
          />
          
          {/* Upload de imagen */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Imagen del Equipo (opcional)
            </Typography>
            {formData.imagePreview ? (
              <Box sx={{ position: 'relative' }}>
                <img
                  src={formData.imagePreview}
                  alt="preview"
                  style={{
                    width: '100%',
                    maxHeight: '180px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '2px solid #1b8735',
                    display: 'block',
                  }}
                />
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<CloseIcon />}
                  onClick={handleRemoveImage}
                  sx={{ mt: 1.5 }}
                >
                  Eliminar imagen
                </Button>
              </Box>
            ) : (
              <Box
                component="label"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
                  border: '2px dashed #999',
                  borderRadius: '8px',
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  backgroundColor: '#fafafa',
                  '&:hover': {
                    borderColor: '#1b8735',
                    backgroundColor: '#f0f7f0',
                    borderWidth: '2px',
                  },
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 48, color: '#1b8735' }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#333', mb: 0.5 }}>
                    Haz clic o arrastra una imagen
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
                    JPG, PNG, GIF - Máximo 5MB
                  </Typography>
                </Box>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </Box>
            )}
          </Box>

          <TextField
            fullWidth
            label="Descripción (opcional)"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            error={!!fieldErrors.description}
            helperText={fieldErrors.description || '5-50 caracteres'}
            placeholder="Describe brevemente tu equipo"
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <Box sx={{ p: 2,   borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Miembros Seleccionados: {formData.members.length}
            </Typography>
            {formData.members.length > 0 ? (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {formData.members.map((member) => (
                  <Chip
                    key={member._id}
                    label={member.name}
                    onDelete={() => {
                      setFormData((prev) => ({
                        ...prev,
                        members: prev.members.filter((m) => m._id !== member._id),
                      }));
                    }}
                    sx={{
                      backgroundColor: '#424242ff',
                      '&:hover': {
                        backgroundColor: '#3a3a3aff',
                      },
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="caption" color="error">
                Debes agregar al menos un miembro
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={() => setOpenMembersModal(true)}
            variant="outlined"
            color="primary"
            startIcon={<PersonAddIcon />}
          >
            Agregar Miembros
          </Button>
          <Button
            onClick={handleSaveTeam}
            variant="contained"
            color="primary"
            disabled={loading || !isFormValid()}
          >
            {editingTeam ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para seleccionar miembros */}
      {openMembersModal && (
        <MembersModal
          open={openMembersModal}
          onClose={() => setOpenMembersModal(false)}
          onSave={handleSaveMembers}
          selectedMembers={formData.members}
        />
      )}
    </Box>
  );
};

export default Teams;