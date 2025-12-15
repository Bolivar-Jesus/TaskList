import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Avatar, Box, Chip, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { alertSuccess } from '../utils/alert';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';

const Header = ({ toggleMode, mode }) => {
  const { user, logout } = useAuth();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Resetear error de imagen cuando cambie el usuario
  useEffect(() => {
    setImageError(false);
  }, [user?.picture]);

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (!user) return null;

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#1b8735',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Avatar
            src={user.picture && !imageError ? user.picture : undefined}
            alt={user.name}
            onError={() => setImageError(true)}
            sx={{ 
              width: 40, 
              height: 40, 
              border: '2px solid rgba(255,255,255,0.3)',
              bgcolor: user.picture && !imageError ? 'transparent' : 'rgba(255,255,255,0.2)'
            }}
          >
            {(!user.picture || imageError) && user.name ? user.name.charAt(0).toUpperCase() : ''}
          </Avatar>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {user.name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {user.email}
            </Typography>
          </Box>
        </Box>

        {/* Título centrado: TaskList */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h4"
            component="div"
            sx={{
              fontFamily: "'Inter', 'Poppins', 'Roboto', system-ui, -apple-system, sans-serif",
              fontWeight: 800,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.95) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 2px 8px rgba(0,0,0,0.1)',
              userSelect: 'none',
            }}
          >
            TaskList
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1, justifyContent: 'flex-end' }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
              {formatDate(currentDateTime)}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {formatTime(currentDateTime)}
            </Typography>
          </Box>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap:1 }}>
            <Button
            variant="contained"
            color="error"
            sx={{ ml: 3, minWidth: 40, width: 40, height: 40, borderRadius: '50%' }}
            onClick={() => {
              sessionStorage.setItem('logout_reason', 'manual');
              logout();
              navigate('/login');
            }}
            title="Cerrar sesión"
          >
            <LogoutIcon />
          </Button>
          
          <Button
            variant="contained"
            sx={{ 
              ml: 2, 
              minWidth: 40, 
              width: 40, 
              height: 40, 
              borderRadius: '50%',
              backgroundColor: (theme) => 
                theme.palette.mode === 'dark' 
                  ? '#E5E5E5' // Color claro (amarillo/dorado) en modo oscuro
                  : '#1a1a1a', // Color oscuro en modo claro
              color: (theme) => 
                theme.palette.mode === 'dark' 
                  ? '#000000' 
                  : '#ffffff', 
              '&:hover': {
                backgroundColor: (theme) => 
                  theme.palette.mode === 'dark' 
                    ? '#FFFFFF'
                    : '#333333', 
              }
            }}
            onClick={toggleMode}
            title={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </Button> 
    </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;