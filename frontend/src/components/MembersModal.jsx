import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Checkbox,
  CircularProgress,
  Box,
  Typography,
  Button,
  InputAdornment,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../context/AuthContext';
import { alertError } from '../utils/alert';

const MembersModal = ({ open, onClose, onSave, selectedMembers = [] }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Función para extraer el ID de MongoDB (maneja formato $oid)
  const extractId = (idField) => {
    if (!idField) return null;
    // Si es un objeto con $oid, extrae el valor
    if (typeof idField === 'object' && idField.$oid) {
      return idField.$oid;
    }
    // Si es una cadena, devolverla tal cual
    return idField.toString();
  };

  const [selectedUsers, setSelectedUsers] = useState(
    selectedMembers.map((m) => {
      if (typeof m === 'string') return m;
      // Extraer ID en caso de formato $oid
      const id = m._id || m.id;
      return extractId(id);
    })
  );

  // Cargar usuarios
  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/users`,
        {
          headers: {
            'x-user-id': user?.id,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar los usuarios');
      }

      const data = await response.json();
      // Procesar usuarios para normalizar el formato
      const processedUsers = (data.users || []).map((u) => ({
        ...u,
        _id: extractId(u._id),
        id: extractId(u._id),
      }));
      setUsers(processedUsers);
    } catch (error) {
      console.error('Error:', error);
      alertError('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios basado en búsqueda
  const filteredUsers = users.filter((u) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(searchLower)) ||
      (u.email && u.email.toLowerCase().includes(searchLower))
    );
  });

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = () => {
    const selectedUserObjects = users.filter((u) => selectedUsers.includes(u._id || u.id));
    onSave(selectedUserObjects);
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u._id || u.id));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar Miembros al Equipo</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">
              {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
            </Typography>
          </Box>
        ) : (
          <>
            {/* Opción "Seleccionar todos" */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
              <Checkbox
                checked={
                  filteredUsers.length > 0 &&
                  selectedUsers.length === filteredUsers.length
                }
                indeterminate={
                  selectedUsers.length > 0 &&
                  selectedUsers.length < filteredUsers.length
                }
                onChange={handleSelectAll}
              />
              <Typography variant="subtitle2" sx={{ ml: 1 }}>
                Seleccionar todos ({filteredUsers.length})
              </Typography>
            </Box>

            <List
              sx={{
                maxHeight: '400px',
                overflow: 'auto',
              }}
            >
              {filteredUsers.map((u) => (
                <ListItem
                  key={u._id || u.id}
                  onClick={() => handleSelectUser(u._id || u.id)}
                  sx={{
                    backgroundColor: selectedUsers.includes(u._id || u.id)
                      ? theme.palette.mode === 'dark' ? '#1565c0' : '#e3f2fd'
                      : 'transparent',
                    cursor: 'pointer',
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': {
                      backgroundColor: selectedUsers.includes(u._id || u.id)
                        ? theme.palette.mode === 'dark' ? '#0d47a1' : '#90caf9'
                        : '#999999',
                    },
                  }}
                >
                  <Checkbox
                    edge="start"
                    checked={selectedUsers.includes(u._id || u.id)}
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemAvatar>
                    <Avatar
                      src={u.picture && u.picture.startsWith('http') ? u.picture : ''}
                      sx={{ width: 40, height: 40 }}
                    >
                      {u.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={u.name}
                    secondary={u.email}
                    primaryTypographyProps={{ sx: { fontWeight: 500 } }}
                  />
                </ListItem>
              ))}
            </List>

            {selectedUsers.length > 0 && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  {selectedUsers.length} usuario(s) seleccionado(s)
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={selectedUsers.length === 0}
        >
          Agregar ({selectedUsers.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MembersModal;
