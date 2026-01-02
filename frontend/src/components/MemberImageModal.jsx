import React, { useState } from 'react';
import { Box } from '@mui/material';
import ImageViewer from './ImageViewer';

const MemberImageModal = ({ imageUrl, alt, children, title = 'Miembro' }) => {
  const [openModal, setOpenModal] = useState(false);

  if (!imageUrl) {
    return <Box sx={{ display: 'inline-flex' }}>{children}</Box>;
  }

  return (
    <>
      <Box onClick={() => setOpenModal(true)} sx={{ display: 'inline-flex', cursor: 'pointer' }}>
        {children}
      </Box>
      <ImageViewer
        imageUrl={imageUrl}
        title={title}
        onClose={() => setOpenModal(false)}
        isOpen={openModal}
      />
    </>
  );
};

export default MemberImageModal;
