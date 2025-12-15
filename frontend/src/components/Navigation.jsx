import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, Tab, Box } from '@mui/material';
import CreateTaskIcon from '@mui/icons-material/AddTask';
import TaskIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabValue = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 0;
    if (path === '/create-task') return 1;
    if (path === '/tasks') return 2;
    if (path === '/profile') return 3;
    return false;
  };

  const handleChange = (event, newValue) => {
    const routes = ['/dashboard', '/create-task', '/tasks', '/profile'];
    navigate(routes[newValue]);
  };

  return (
    <Box
      sx={{
        backgroundColor: (theme) => theme.palette.background.paper,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        boxShadow: (theme) => theme.shadows[1],
      }}
    >
      <Tabs
        value={getTabValue()}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTab-root': {
            minHeight: 64,
            color: (theme) => theme.palette.text.secondary,
            fontWeight: 500,
            '&.Mui-selected': {
              color: (theme) => theme.palette.primary.main,
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: (theme) => theme.palette.primary.main,
            height: 3,
          },
        }}
      >
        <Tab icon={<DashboardIcon />} iconPosition="start" label="Dashboard" />
        <Tab icon={<CreateTaskIcon />} iconPosition="start" label="Crear Tarea" />
        <Tab icon={<TaskIcon />} iconPosition="start" label="Mis Tareas" />
        <Tab icon={<PersonIcon />} iconPosition="start" label="Mi Perfil" />
      </Tabs>
    </Box>
  );
};

export default Navigation;

