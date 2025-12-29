import React, { useState } from 'react';
import {
  Box,
  Modal,
  IconButton,
  useTheme,
} from '@mui/material';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

const TeamImageModal = ({ imageUrl, teamName }) => {
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);

  if (!imageUrl) return null;

  return (
    <>
      <Box
        onClick={() => setOpenModal(true)}
        sx={{
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.8,
          },
        }}
      >
        <img
          src={imageUrl}
          alt={teamName}
          style={{ width: '35px', height: '35px', borderRadius: '6px', objectFit: 'cover' }}
        />
      </Box>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1300,
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
          <img
            src={imageUrl}
            alt={teamName}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
          <IconButton
            onClick={() => setOpenModal(false)}
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

export default TeamImageModal;
