import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        <span translate="no">Dashboard</span>
      </Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body1">
          Bienvenido al panel de control de TaskList. Aquí podrás ver un resumen de tus tareas.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;

