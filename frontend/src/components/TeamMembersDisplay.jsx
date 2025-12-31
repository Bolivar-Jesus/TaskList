import React, { useState } from 'react';
import {
  Box,
  Avatar,
  AvatarGroup,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  Typography,
  useTheme,
  Modal,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
} from '@mui/material';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { showSimpleAlert } from '../utils/alert';

const TeamMembersDisplay = ({ members = [], teamName = '', memberRoles = [], createdById = null, isSuperAdmin = false, canAssignPermissions = false, teamId = null, onRolesUpdate = null, onAlert = null, onError = null }) => {
  const theme = useTheme();
  const [openMembersModal, setOpenMembersModal] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingRoles, setEditingRoles] = useState(false);
  const [tempRoles, setTempRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!members || members.length === 0) {
    return <Typography color="textSecondary">Sin miembros</Typography>;
  }

  const displayMembers = members.slice(0, 3);
  const hasMore = members.length > 3;

  const getProfileImageUrl = (picture) => {
    if (!picture) return undefined;
    let pictureUrl = picture;
    if (pictureUrl.startsWith('http://')) {
      pictureUrl = pictureUrl.replace('http://', 'https://');
    }
    if (!pictureUrl.startsWith('https://')) {
      return undefined;
    }
    return pictureUrl;
  };

  const getMemberRole = (memberId) => {
    const roleObj = memberRoles.find(mr => mr.userId === memberId || mr.userId._id === memberId);
    if (roleObj) {
      return roleObj.role;
    }
    // Fallback: si no hay memberRoles, el creador es superadmin
    if (createdById && (createdById === memberId || createdById._id === memberId)) {
      return 'superadmin';
    }
    return 'viewer';
  };

  const handleImageClick = (e, imageUrl) => {
    if (imageUrl) {
      e.stopPropagation();
      setSelectedImage(imageUrl);
      setOpenImageModal(true);
    }
  };

  const handleRoleChange = (memberId, newRole) => {
    setTempRoles(tempRoles.map(mr => 
      (mr.userId === memberId || mr.userId._id === memberId) 
        ? { ...mr, role: newRole, permissions: { canEditTeam: false, canAddMembers: false, canAssignPermissions: false } }
        : mr
    ));
  };

  const handlePermissionChange = (memberId, permission) => {
    setTempRoles(tempRoles.map(mr => {
      if (mr.userId === memberId || mr.userId._id === memberId) {
        const currentPermissions = mr.permissions || { canEditTeam: false, canAddMembers: false, canAssignPermissions: false };
        return {
          ...mr,
          permissions: {
            ...currentPermissions,
            [permission]: !currentPermissions[permission],
          },
        };
      }
      return mr;
    }));
  };

  const handleSaveRoles = async () => {
    if (onRolesUpdate && teamId) {
      // Validar que admins tengan al menos un permiso
      for (const mr of tempRoles) {
        if (mr.role === 'admin') {
          const hasPermission = mr.permissions?.canEditTeam || mr.permissions?.canAddMembers || mr.permissions?.canAssignPermissions;
          if (!hasPermission) {
            alert('Los admins deben tener al menos un permiso');
            return;
          }
        }
      }

      setIsLoading(true);
      try {
        const formattedRoles = tempRoles.map(mr => ({
          userId: typeof mr.userId === 'object' ? mr.userId._id : mr.userId,
          role: mr.role,
          permissions: mr.permissions || { canEditTeam: false, canAddMembers: false, canAssignPermissions: false },
        }));
        const success = await onRolesUpdate(teamId, formattedRoles);
        // Solo cierra el modal si la actualización fue exitosa
        if (success) {
          // Cierra el modal primero
          setEditingRoles(false);
          // Luego muestra la alerta
          setTimeout(() => {
            showSimpleAlert('✅ Roles y permisos actualizados correctamente', 'success', 2300);
          }, 100);
        }
      } catch (error) {
        if (onError) {
          await onError(`❌ Error: ${error.message || 'No se pudo actualizar los roles'}`);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      'superadmin': 'Superadministrador',
      'admin': 'Administrador',
      'viewer': 'Usuario',
    };
    return labels[role] || role;
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AvatarGroup
          max={3}
          sx={{
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              fontSize: '0.75rem',
              cursor: 'pointer',
              border: `2px solid ${theme.palette.background.paper}`,
              '&:hover': {
                opacity: 0.8,
              },
            },
          }}
        >
          {displayMembers.map((member) => {
            const imageUrl = getProfileImageUrl(member.picture);
            return (
              <Avatar
                key={member._id}
                src={imageUrl}
                alt={member.name}
                onClick={(e) => handleImageClick(e, imageUrl)}
                sx={{
                  bgcolor: imageUrl ? 'transparent' : '#1b8735',
                  color: '#ffffff',
                  fontWeight: 600,
                }}
              >
                {!imageUrl && member.name?.charAt(0).toUpperCase()}
              </Avatar>
            );
          })}
        </AvatarGroup>

        {hasMore && (
          <IconButton
            size="small"
            onClick={() => setOpenMembersModal(true)}
            sx={{
              width: 32,
              height: 32,
              fontSize: '0.75rem',
              bgcolor: theme.palette.mode === 'dark' ? '#555' : '#e0e0e0',
              color: theme.palette.text.primary,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? '#666' : '#d0d0d0',
              },
            }}
          >
            +{members.length - 3}
          </IconButton>
        )}
        
        <IconButton
          size="small"
          onClick={() => setOpenMembersModal(true)}
          title="Ver/Gestionar miembros"
          sx={{
            width: 32,
            height: 32,
            bgcolor: theme.palette.primary.main,
            color: '#ffffff',
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
          }}
        >
          👥
        </IconButton>
      </Box>

      {/* Modal de lista completa de miembros */}
      <Dialog
        open={openMembersModal}
        onClose={() => setOpenMembersModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#ffffff',
          },
        }}
      >
        <DialogTitle sx={{ color: theme.palette.text.primary, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Miembros de {teamName}</span>
          {isSuperAdmin && !editingRoles && (
            <button
              onClick={() => {
                setEditingRoles(true);
                // Si memberRoles está vacío, inicializar con fallback
                let rolesToEdit = memberRoles && memberRoles.length > 0 
                  ? memberRoles 
                  : members.map(m => ({
                      userId: m._id,
                      role: createdById && (createdById === m._id || createdById._id === m._id) ? 'superadmin' : 'viewer',
                      permissions: { canEditTeam: false, canAddMembers: false, canAssignPermissions: false }
                    }));
                setTempRoles(rolesToEdit);
              }}
              style={{
                padding: '4px 12px',
                backgroundColor: theme.palette.primary.main,
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Editar roles
            </button>
          )}
          {editingRoles && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {isLoading && <CircularProgress size={20} />}
              <button
                onClick={() => setEditingRoles(false)}
                disabled={isLoading}
                style={{
                  padding: '4px 12px',
                  backgroundColor: theme.palette.mode === 'dark' ? '#555' : '#ccc',
                  color: theme.palette.text.primary,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRoles}
                disabled={isLoading}
                style={{
                  padding: '4px 12px',
                  backgroundColor: '#4caf50',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                Guardar
              </button>
            </Box>
          )}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#ffffff' }}>
          <List sx={{ pt: 0 }}>
            {members.slice().sort((a, b) => {
              // Mostrar superadmin primero
              const findRole = (memberId) => {
                if (editingRoles && tempRoles.length > 0) {
                  const found = tempRoles.find(mr => 
                    mr.userId === memberId || 
                    mr.userId._id === memberId ||
                    mr.userId?.toString() === memberId?.toString()
                  );
                  return found?.role || 'viewer';
                }
                return getMemberRole(memberId);
              };
              
              const roleA = findRole(a._id);
              const roleB = findRole(b._id);
              
              if (roleA === 'superadmin') return -1;
              if (roleB === 'superadmin') return 1;
              return 0;
            }).map((member) => {
              const imageUrl = getProfileImageUrl(member.picture);
              const currentRole = editingRoles && tempRoles.length > 0
                ? tempRoles.find(mr => 
                    mr.userId === member._id || 
                    mr.userId._id === member._id ||
                    mr.userId?.toString() === member._id?.toString()
                  )?.role || 'viewer'
                : getMemberRole(member._id);
              const isSuperadmin = currentRole === 'superadmin';
              
              return (
                <ListItem
                  key={member._id}
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    pb: 2,
                    borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#555' : '#eee'}`,
                    backgroundColor: isSuperadmin && editingRoles ? (theme.palette.mode === 'dark' ? '#333' : '#f9f9f9') : 'transparent',
                    opacity: isSuperadmin && editingRoles ? 0.7 : 1,
                    '&:last-child': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', mb: 1 }}>
                    <ListItemAvatar sx={{ minWidth: 'auto', mr: 2 }}>
                      <Avatar
                        src={imageUrl}
                        alt={member.name}
                        onClick={(e) => handleImageClick(e, imageUrl)}
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: imageUrl ? 'transparent' : '#1b8735',
                          color: '#ffffff',
                          fontWeight: 600,
                          cursor: imageUrl ? 'pointer' : 'default',
                          '&:hover': imageUrl ? { opacity: 0.8 } : {},
                        }}
                      >
                        {!imageUrl && member.name?.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <Box sx={{ ml: 1, flex: 1 }}>
                      <Typography sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 0.5 }}>
                        {member.name} {isSuperadmin && <span style={{ color: theme.palette.primary.main, fontSize: '0.85em' }}>(superadmin)</span>}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: theme.palette.text.secondary, mb: 0.25 }}>
                        {member.email}
                      </Typography>
                      {member.phone && (
                        <Typography variant="caption" sx={{ display: 'block', color: theme.palette.text.secondary, mb: 0.25 }}>
                          {member.phone}
                        </Typography>
                      )}
                      {member.createdAt && (
                        <Typography variant="caption" sx={{ display: 'block', color: theme.palette.text.secondary, mt: 0.5 }}>
                          Se unió: {new Date(member.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </Typography>
                      )}
                      {editingRoles && (
                        <Box sx={{ width: '100%' }}>
                          {isSuperadmin ? (
                            <Box sx={{ 
                              p: 1, 
                              backgroundColor: theme.palette.mode === 'dark' ? '#2a5a2a' : '#e8f5e9',
                              borderRadius: '4px',
                              border: '1px solid #4caf50',
                              mt: 1
                            }}>
                              <Typography variant="caption" sx={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#2e7d32', fontWeight: 600 }}>
                                Superadministrador - No se puede cambiar
                              </Typography>
                            </Box>
                          ) : (
                            <FormControl size="small" sx={{ mt: 1, minWidth: 180 }}>
                              <Select
                                value={currentRole}
                                onChange={(e) => handleRoleChange(member._id, e.target.value)}
                                sx={{
                                  backgroundColor: theme.palette.mode === 'dark' ? '#555' : '#f5f5f5',
                                  color: theme.palette.text.primary,
                                }}
                              >
                                <MenuItem value="admin">Administrador</MenuItem>
                                <MenuItem value="viewer">Usuario</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                          
                          {currentRole === 'admin' && !isSuperadmin && (
                            <Box sx={{ mt: 1, pl: 1, borderLeft: `3px solid ${theme.palette.primary.main}` }}>
                              <Typography variant="caption" sx={{ color: theme.palette.text.primary, fontWeight: 600, display: 'block', mb: 0.5 }}>
                                Permisos (mínimo 1):
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={tempRoles.find(mr => mr.userId === member._id || mr.userId._id === member._id)?.permissions?.canEditTeam || false}
                                    onChange={() => handlePermissionChange(member._id, 'canEditTeam')}
                                    style={{ marginRight: '8px', cursor: 'pointer' }}
                                  />
                                  <Typography variant="caption">Editar equipo</Typography>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={tempRoles.find(mr => mr.userId === member._id || mr.userId._id === member._id)?.permissions?.canAddMembers || false}
                                    onChange={() => handlePermissionChange(member._id, 'canAddMembers')}
                                    style={{ marginRight: '8px', cursor: 'pointer' }}
                                  />
                                  <Typography variant="caption">Agregar/Remover miembros</Typography>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={tempRoles.find(mr => mr.userId === member._id || mr.userId._id === member._id)?.permissions?.canAssignPermissions || false}
                                    onChange={() => handlePermissionChange(member._id, 'canAssignPermissions')}
                                    style={{ marginRight: '8px', cursor: 'pointer' }}
                                  />
                                  <Typography variant="caption">Asignar permisos a otros</Typography>
                                </label>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      )}
                      {!editingRoles && (
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" sx={{ display: 'block', color: '#4caf50', fontWeight: 500 }}>
                            {getRoleLabel(currentRole)}
                          </Typography>
                          {currentRole === 'admin' && memberRoles.find(mr => mr.userId === member._id || mr.userId._id === member._id)?.permissions && (
                            <Box sx={{ mt: 0.3 }}>
                              {memberRoles.find(mr => mr.userId === member._id || mr.userId._id === member._id)?.permissions?.canEditTeam && (
                                <Typography variant="caption" sx={{ display: 'block', color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
                                  • Editar equipo
                                </Typography>
                              )}
                              {memberRoles.find(mr => mr.userId === member._id || mr.userId._id === member._id)?.permissions?.canAddMembers && (
                                <Typography variant="caption" sx={{ display: 'block', color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
                                  • Agregar miembros
                                </Typography>
                              )}
                              {memberRoles.find(mr => mr.userId === member._id || mr.userId._id === member._id)?.permissions?.canAssignPermissions && (
                                <Typography variant="caption" sx={{ display: 'block', color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
                                  • Asignar permisos
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
      </Dialog>

      {/* Modal de imagen ampliada */}
      <Modal
        open={openImageModal}
        onClose={() => setOpenImageModal(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.8)',
        }}
      >
        <Box
          sx={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Ampliada"
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: 200,
                height: 200,
                bgcolor: '#1b8735',
                fontSize: '4rem',
                fontWeight: 600,
                color: '#ffffff',
              }}
            >
              ?
            </Avatar>
          )}
          <IconButton
            onClick={() => setOpenImageModal(false)}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: '#ffffff',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.8)',
              },
            }}
          >
            <ZoomOutIcon />
          </IconButton>
        </Box>
      </Modal>
    </>
  );
};

export default TeamMembersDisplay;
