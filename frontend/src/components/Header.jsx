import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Avatar, Box, Button, useMediaQuery, useTheme } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';

const Header = ({ toggleMode, mode }) => {
  const { user, logout } = useAuth();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
    const timeFormat = user?.timeFormat || '24h';
    console.log('Formato actual:', timeFormat); // Log para debugging
    
    if (timeFormat === '12h') {
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    }
    
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Asegurar que la URL de la imagen sea HTTPS
  const getProfileImageUrl = () => {
    if (!user.picture) return undefined;
    let pictureUrl = user.picture;
    if (pictureUrl.startsWith('http://')) {
      pictureUrl = pictureUrl.replace('http://', 'https://');
    }
    if (!pictureUrl.startsWith('https://')) {
      return undefined;
    }
    return pictureUrl;
  };

  if (!user) return null;

  // VERSIÓN MÓVIL/TABLET (hasta breakpoint md)
  if (isMobile) {
    return (
      <AppBar
        position="static"
        sx={{
          backgroundColor: '#1b8735',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 1,
          py: 1,
          px: 1.5,
        }}>
          {/* Fila única: Avatar + Info centrada + Botones */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            width: '100%',
          }}>
            {/* Avatar pequeño a la izquierda */}
            <Avatar
              src={!imageError ? getProfileImageUrl() : undefined}
              alt={user.name}
              onError={() => setImageError(true)}
              sx={{ 
                width: 36, 
                height: 36, 
                border: '2px solid rgba(255,255,255,0.3)',
                bgcolor: getProfileImageUrl() && !imageError ? 'transparent' : 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                flexShrink: 0,
              }}
            >
              {(!getProfileImageUrl() || imageError) && user.name ? user.name.charAt(0).toUpperCase() : ''}
            </Avatar>

            {/* Botones a la derecha */}
            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
              <Button
                variant="contained"
                size="small"
                sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%',
                  p: 0,
                  minWidth: 32,
                  backgroundColor: (t) => t.palette.mode === 'dark' ? '#E5E5E5' : '#1a1a1a',
                  color: (t) => t.palette.mode === 'dark' ? '#000000' : '#ffffff',
                  '&:hover': {
                    backgroundColor: (t) => t.palette.mode === 'dark' ? '#FFFFFF' : '#333333',
                  }
                }}
                onClick={toggleMode}
                title={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
              </Button>
              
              <Button
                variant="contained"
                color="error"
                size="small"
                sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%',
                  p: 0,
                  minWidth: 32,
                }}
                onClick={() => {
                  sessionStorage.setItem('logout_reason', 'manual');
                  logout();
                  navigate('/login');
                }}
                title="Cerrar sesión"
              >
                <LogoutIcon fontSize="small" />
              </Button>
            </Box>
          </Box>

          {/* Nombre centrado */}
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 700,
              textAlign: 'center',
              width: '100%',
              fontSize: '0.95rem',
            }}
          >
            {user.name}
          </Typography>

          {/* Email centrado y pequeño */}
          <Typography 
            variant="caption" 
            sx={{ 
              opacity: 0.85,
              textAlign: 'center',
              width: '100%',
              fontSize: '0.65rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user.email}
          </Typography>

          {/* TaskList centrado grande */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontFamily: "'Inter', 'Poppins', 'Roboto', system-ui, -apple-system, sans-serif",
              fontWeight: 800,
              fontSize: '1.4rem',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.95) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              userSelect: 'none',
              textAlign: 'center',
              width: '100%',
              mt: 0.5,
            }}
          >
            <span translate="no">TaskList</span>
          </Typography>

          {/* Fecha y hora centradas */}
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 500, 
                fontSize: '0.65rem',
                display: 'block',
              }}
            >
              {formatDate(currentDateTime)}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                opacity: 0.85,
                fontSize: '0.65rem',
              }}
            >
              {formatTime(currentDateTime)}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  // VERSIÓN DESKTOP (md y superior) - ORIGINAL
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
              bgcolor: user.picture && !imageError ? 'transparent' : 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              fontWeight: 600,
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
              fontSize: { md: '2rem', lg: '2.5rem' },
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.95) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 2px 8px rgba(0,0,0,0.1)',
              userSelect: 'none',
            }}
          >
            <span translate="no">TaskList</span>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              sx={{ 
                minWidth: 40, 
                width: 40, 
                height: 40, 
                borderRadius: '50%',
                p: 0,
                backgroundColor: (t) => t.palette.mode === 'dark' ? '#E5E5E5' : '#1a1a1a',
                color: (t) => t.palette.mode === 'dark' ? '#000000' : '#ffffff',
                '&:hover': {
                  backgroundColor: (t) => t.palette.mode === 'dark' ? '#FFFFFF' : '#333333',
                }
              }}
              onClick={toggleMode}
              title={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </Button>
            
            <Button
              variant="contained"
              color="error"
              sx={{ minWidth: 40, width: 40, height: 40, borderRadius: '50%', p: 0 }}
              onClick={() => {
                sessionStorage.setItem('logout_reason', 'manual');
                logout();
                navigate('/login');
              }}
              title="Cerrar sesión"
            >
              <LogoutIcon />
            </Button>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;