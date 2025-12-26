import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, Tab, Box, useMediaQuery, useTheme } from '@mui/material';
import CreateTaskIcon from '@mui/icons-material/AddTask';
import TaskIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';

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
    if (path === '/teams') return 3;
    if (path === '/profile') return 4;
    return false;
  };

  const handleChange = (event, newValue) => {
    const routes = ['/dashboard', '/create-task', '/tasks', '/teams', '/profile'];
    navigate(routes[newValue]);
  };

  const tabLabels = isMobile 
    ? ['Panel', 'Nueva', 'Tareas', 'Equipos', 'Perfil']
    : ['Dashboard', 'Crear Tarea', 'Mis Tareas', 'Equipos', 'Mi Perfil'];

  const tabIcons = [<DashboardIcon />, <CreateTaskIcon />, <TaskIcon />, <GroupIcon />, <PersonIcon />];

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
        <Tab icon={tabIcons[0]} iconPosition="start" label={<span translate="no">{tabLabels[0]}</span>} />
        <Tab icon={tabIcons[1]} iconPosition="start" label={tabLabels[1]} />
        <Tab icon={tabIcons[2]} iconPosition="start" label={tabLabels[2]} />
        <Tab icon={tabIcons[3]} iconPosition="start" label={tabLabels[3]} />
        <Tab icon={tabIcons[4]} iconPosition="start" label={tabLabels[4]} />
      </Tabs>
    </Box>
  );
};

export default Navigation;

