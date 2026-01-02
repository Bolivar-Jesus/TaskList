import React from 'react';
import { Box } from '@mui/material';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';

const NoTeamImageIcon = ({ size = 35 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '6px',
      background: 'linear-gradient(135deg, #e0e0e0 60%, #bdbdbd 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#888',
      border: '1.5px dashed #bbb',
      fontSize: size * 0.6,
      cursor: 'default',
    }}
    title="Sin imagen de equipo"
  >
    <BrokenImageIcon sx={{ fontSize: size * 0.7 }} />
  </Box>
);

export default NoTeamImageIcon;
