import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, Tab, Box, useMediaQuery, useTheme } from '@mui/material';
import CreateTaskIcon from '@mui/icons-material/AddTask';
import TaskIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
        backgroundColor: (t) => t.palette.background.paper,
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
        boxShadow: (t) => t.shadows[1],
      }}
    >
      <Tabs
        value={getTabValue()}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTab-root': {
            minHeight: isMobile ? 56 : 64,
            minWidth: isMobile ? 'auto' : 'unset',
            px: isMobile ? 1 : 2,
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            color: (t) => t.palette.text.secondary,
            fontWeight: 500,
            '&.Mui-selected': {
              color: (t) => t.palette.primary.main,
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: (t) => t.palette.primary.main,
            height: 3,
          },
        }}
      >
        {isMobile ? (
          <>
            <Tab icon={<DashboardIcon />} iconPosition="start" label="Panel" />
            <Tab icon={<CreateTaskIcon />} iconPosition="start" label="Nueva" />
            <Tab icon={<TaskIcon />} iconPosition="start" label="Tareas" />
            <Tab icon={<PersonIcon />} iconPosition="start" label="Perfil" />
          </>
        ) : (
          <>
            <Tab icon={<DashboardIcon />} iconPosition="start" label="Dashboard" />
            <Tab icon={<CreateTaskIcon />} iconPosition="start" label="Crear Tarea" />
            <Tab icon={<TaskIcon />} iconPosition="start" label="Mis Tareas" />
            <Tab icon={<PersonIcon />} iconPosition="start" label="Mi Perfil" />
          </>
        )}
      </Tabs>
    </Box>
  );
};

export default Navigation;

