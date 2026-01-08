import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  Avatar,
  AvatarGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Divider,
  Card,
  CardContent,
  Grid,
  useTheme,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import AdminIcon from '@mui/icons-material/SupervisedUserCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

const TeamDetailModal = ({ open, onClose, team }) => {
  const theme = useTheme();

  if (!team) {
    return null;
  }

  // Función para obtener el nombre de un rol
  const getRoleLabel = (role) => {
    switch (role) {
      case 'superadministrador':
        return '👑 Super Administrador';
      case 'administrador':
        return '🔑 Administrador';
      case 'editor':
        return '✏️ Editor';
      case 'espectador':
        return '👁️ Espectador';
      default:
        return role;
    }
  };

  // Función para obtener el color del rol
  const getRoleColor = (role) => {
    switch (role) {
      case 'superadministrador':
        return 'error';
      case 'administrador':
        return 'warning';
      case 'editor':
        return 'info';
      case 'espectador':
        return 'default';
      default:
        return 'default';
    }
  };

  // Extraer ID de MongoDB (maneja formato $oid)
  const extractId = (idField) => {
    if (!idField) return null;
    if (typeof idField === 'object' && idField.$oid) {
      return idField.$oid;
    }
    return idField.toString();
  };

  // Obtener información del equipo
  const teamId = extractId(team._id || team.id);
  const teamName = team.nombre || team.name || 'Sin nombre';
  const teamDescription = team.descripción || team.description || 'Sin descripción';
  const teamImage = team.imagen || team.image;
  const createdAt = team.creadoEn || team.createdAt ? new Date(team.creadoEn || team.createdAt).toLocaleDateString('es-ES') : 'N/A';
  const updatedAt = team.actualizadoEn || team.updatedAt ? new Date(team.actualizadoEn || team.updatedAt).toLocaleDateString('es-ES') : 'N/A';
  const members = team.miembros || team.members || [];
  const memberRoles = team['roles de miembro'] || team.memberRoles || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupIcon />
          {teamName}
        </Box>
        <Button onClick={onClose} size="small" sx={{ minWidth: 'auto' }}>
          <CloseIcon />
        </Button>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {/* Imagen y Información Básica */}
          <Grid item xs={12} sm={4}>
            {teamImage && (
              <Box
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  overflow: 'hidden',
                  backgroundColor: theme.palette.action.hover,
                  p: 2,
                }}
              >
                <img
                  src={teamImage}
                  alt={teamName}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: 1,
                  }}
                />
              </Box>
            )}
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  📋 Información
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {teamId}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    Creado
                  </Typography>
                  <Typography variant="body2">{createdAt}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Actualizado
                  </Typography>
                  <Typography variant="body2">{updatedAt}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Descripción y Miembros */}
          <Grid item xs={12} sm={8}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  📝 Descripción
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {teamDescription}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  👥 Miembros ({members.length})
                </Typography>
                {memberRoles && memberRoles.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                          <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Permisos</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {memberRoles.map((memberRole, index) => {
                          const memberIdObj = memberRole.usuarioId || memberRole.userId;
                          const memberId = extractId(memberIdObj);
                          const userIndex = members.findIndex((m) => extractId(m) === memberId);
                          const isCurrentUser = memberId ? memberId.substring(0, 8) : 'N/A';

                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip
                                    label={getRoleLabel(memberRole.role)}
                                    color={getRoleColor(memberRole.role)}
                                    size="small"
                                    icon={
                                      memberRole.role === 'superadministrador' || memberRole.role === 'administrador' ? (
                                        <AdminIcon />
                                      ) : (
                                        <VisibilityIcon />
                                      )
                                    }
                                  />
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {memberRole.permisos ? (
                                    <>
                                      {memberRole.permisos.canEditTeam && (
                                        <Chip label="✏️ Editar" size="small" variant="outlined" />
                                      )}
                                      {memberRole.permisos.puedeAñadirMiembros && (
                                        <Chip label="➕ Agregar Miembros" size="small" variant="outlined" />
                                      )}
                                      {memberRole.permisos.puedeAsignarPermisos && (
                                        <Chip label="🔐 Asignar Permisos" size="small" variant="outlined" />
                                      )}
                                      {!memberRole.permisos.canEditTeam &&
                                        !memberRole.permisos.puedeAñadirMiembros &&
                                        !memberRole.permisos.puedeAsignarPermisos && (
                                          <Chip label="📖 Solo lectura" size="small" variant="outlined" />
                                        )}
                                    </>
                                  ) : (
                                    <Chip label="📖 Solo lectura" size="small" variant="outlined" />
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : members.length > 0 ? (
                  <Box>
                    {members.map((memberId, index) => (
                      <Chip
                        key={index}
                        label={`Miembro ${index + 1}`}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No hay miembros en este equipo
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamDetailModal;
