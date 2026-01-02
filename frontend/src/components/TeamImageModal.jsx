import React, { useState } from 'react';
import { Box } from '@mui/material';
import ImageViewer from './ImageViewer';

const TeamImageModal = ({ imageUrl, teamName }) => {
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

      <ImageViewer
        imageUrl={imageUrl}
        title={teamName}
        onClose={() => setOpenModal(false)}
        isOpen={openModal}
      >
        <div />
      </ImageViewer>
    </>
  );
};

export default TeamImageModal;
