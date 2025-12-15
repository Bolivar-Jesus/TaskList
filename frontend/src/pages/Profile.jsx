import React from 'react';
import { Typography, Box } from '@mui/material';

const Profile = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Mi Perfil
      </Typography>
      <Typography variant="body1">Configuración de perfil (próximamente)</Typography>
    </Box>
  );
};

export default Profile;

