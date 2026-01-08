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
  Chip,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from '../context/AuthContext';
import { alertError } from '../utils/alert';
import TeamDetailModal from './TeamDetailModal';

const TeamsModal = ({ open, onClose, onSave, selectedTeams = [] }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openTeamDetail, setOpenTeamDetail] = useState(false);
  const [selectedTeamDetail, setSelectedTeamDetail] = useState(null);

  // Extraer el ID de MongoDB (maneja formato $oid)
  const extractId = (idField) => {
    if (!idField) return null;
    if (typeof idField === 'object' && idField.$oid) {
      return idField.$oid;
    }
    return idField.toString();
  };

  const [selectedTeamIds, setSelectedTeamIds] = useState(
    selectedTeams.map((t) => {
      if (typeof t === 'string') return t;
      const id = t._id || t.id;
      return extractId(id);
    })
  );

  // Cargar equipos
  useEffect(() => {
    if (open) {
      fetchTeams();
    }
  }, [open]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      // Equipos creados por el usuario
      const createdResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/teams`,
        {
          headers: {
            'x-user-id': user?.id,
          },
        }
      );

      // Equipos donde el usuario es miembro
      const memberResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/teams/member/${user?.id}`,
        {
          headers: {
            'x-user-id': user?.id,
          },
        }
      );

      if (!createdResponse.ok || !memberResponse.ok) {
        throw new Error('Error al cargar los equipos');
      }

      const createdData = await createdResponse.json();
      const memberData = await memberResponse.json();

      // Combinar equipos (evitar duplicados)
      const allTeams = [...(createdData.teams || []), ...(memberData.teams || [])];
      const uniqueTeams = Array.from(
        new Map(allTeams.map((t) => [extractId(t._id), t])).values()
      );

      // Procesar equipos para normalizar el formato
      const processedTeams = uniqueTeams.map((t) => ({
        ...t,
        _id: extractId(t._id),
        id: extractId(t._id),
      }));

      setTeams(processedTeams);
    } catch (error) {
      alertError('No se pudieron cargar los equipos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar equipos basado en búsqueda
  const filteredTeams = teams.filter((t) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (t.name && t.name.toLowerCase().includes(searchLower)) ||
      (t.description && t.description.toLowerCase().includes(searchLower))
    );
  });

  const handleToggleTeam = (teamId) => {
    setSelectedTeamIds((prev) => {
      if (prev.includes(teamId)) {
        return prev.filter((id) => id !== teamId);
      } else {
        return [...prev, teamId];
      }
    });
  };

  const handleSave = () => {
    const selectedTeamObjects = teams.filter((t) =>
      selectedTeamIds.includes(t._id || t.id)
    );
    onSave(selectedTeamObjects);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Seleccionar Equipos</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar equipos..."
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
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredTeams.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              {teams.length === 0 ? 'No hay equipos disponibles' : 'No se encontraron equipos'}
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredTeams.map((team) => (
              <ListItem
                key={team._id}
                onClick={() => handleToggleTeam(team._id)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: selectedTeamIds.includes(team._id)
                    ? theme.palette.action.selected
                    : 'transparent',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Checkbox
                    edge="start"
                    checked={selectedTeamIds.includes(team._id)}
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <GroupIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={team.name}
                    secondary={team.description || 'Sin descripción'}
                  />
                </Box>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTeamDetail(team);
                    setOpenTeamDetail(true);
                  }}
                  sx={{ ml: 1 }}
                  title="Ver detalles"
                >
                  <InfoIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}

        {selectedTeamIds.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="textSecondary">
              {selectedTeamIds.length} equipo(s) seleccionado(s)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {teams
                .filter((t) => selectedTeamIds.includes(t._id))
                .map((t) => (
                  <Chip
                    key={t._id}
                    label={t.name}
                    onDelete={() => handleToggleTeam(t._id)}
                    size="small"
                  />
                ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          Guardar
        </Button>
      </DialogActions>
      <TeamDetailModal
        open={openTeamDetail}
        onClose={() => setOpenTeamDetail(false)}
        team={selectedTeamDetail}
      />
    </Dialog>
  );
};

export default TeamsModal;
