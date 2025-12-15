import React from 'react';
import { Typography, Box } from '@mui/material';

const Tasks = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Mis Tareas
      </Typography>
      <Typography variant="body1">Lista de tareas asignadas (próximamente)</Typography>
    </Box>
  );
};

export default Tasks;

