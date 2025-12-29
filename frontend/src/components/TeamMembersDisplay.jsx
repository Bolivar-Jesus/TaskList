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
} from '@mui/material';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

const TeamMembersDisplay = ({ members = [], teamName = '' }) => {
  const theme = useTheme();
  const [openMembersModal, setOpenMembersModal] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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

  const handleImageClick = (e, imageUrl) => {
    if (imageUrl) {
      e.stopPropagation();
      setSelectedImage(imageUrl);
      setOpenImageModal(true);
    }
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
        <DialogTitle sx={{ color: theme.palette.text.primary }}>
          Miembros de {teamName}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#ffffff' }}>
          <List sx={{ pt: 0 }}>
            {members.map((member) => {
              const imageUrl = getProfileImageUrl(member.picture);
              return (
                <ListItem
                  key={member._id}
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    pb: 2,
                    borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#555' : '#eee'}`,
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
                        {member.name}
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
