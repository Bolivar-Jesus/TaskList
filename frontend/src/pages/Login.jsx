import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { alertSuccess, alertError } from '../utils/alert';
import { useAuth } from '../context/AuthContext';
import {
    Box,
    Typography,
    Paper,
    Container,
    Grid,
    Chip,
    Stack,
    Divider,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1b8735', 
        },
        secondary: {
            main: '#0f5132',
        },
        background: {
            default: '#f3f7f4',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        allVariants: {
            textAlign: 'center',
        },
        h3: {
            fontWeight: 700,
        },
        h5: {
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 18,
    },
});

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    

    const handleSuccess = async (credentialResponse) => {
        try {
            console.log('Login Success (Google):', credentialResponse);
            const { credential } = credentialResponse;

            const response = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ credential }),
            });

            if (!response.ok) {
                const errorPayload = await response.json().catch(() => ({}));
                throw new Error(errorPayload?.error || 'Error al verificar el token en el backend');
            }

            const data = await response.json();
            console.log('Usuario autenticado en backend:', data);
            
            // Guardar usuario en el contexto
            login(data.user);

            // ALERTA DE ÉXITO
            alertSuccess('¡Bienvenido, ' + (data.user?.name || 'usuario') + '! Has iniciado sesión correctamente.');
            
            // Redirigir al dashboard
            navigate('/dashboard');
        } catch (error) {
            console.error('Error durante la autenticación:', error);
            // ALERTA DE ERROR
            alertError(
              error.message === 'Error al verificar el token en el backend'
                ? 'No se pudo verificar tu sesión en el servidor. Puede que los servicios estén caídos, tu conexión esté fallando o el token sea inválido.'
                : error.message
            );
        }
    };

    const handleError = () => {
        console.log('Login Failed');
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                        'radial-gradient(circle at top left, #a4f3c2 0, transparent 50%), radial-gradient(circle at bottom right, #d5f5e3 0, #f3f7f4 55%)',
                    py: { xs: 4, md: 6 },
                    px: { xs: 2, md: 4 },
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        overflow: 'hidden',
                        borderRadius: 5,
                        background:
                            'linear-gradient(135deg, rgba(9, 121, 44, 0.95), rgba(30, 180, 90, 0.98))',
                        color: '#ffffff',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        display: 'flex',
                    }}
                >
                    <Box sx={{ display: 'flex', width: '100%', flexWrap: 'wrap' }}>
                        {/* Columna izquierda: información del aplicativo TaskList */}
                        <Box
                            sx={{
                                width: { xs: '100%', md: '41.666%' },
                                p: { xs: 4, md: 5 },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                gap: 4,
                                borderRight: {
                                    md: '1px solid rgba(255,255,255,0.12)',
                                },
                            }}
                        >
                            <Box>
                                <Box sx={{ mb: 2, textAlign: 'left' }}>
                                    <Chip
                                        label="TaskList · Gestión de tareas"
                                        variant="outlined"
                                        sx={{
                                            borderColor: 'rgba(255,255,255,0.4)',
                                            color: 'rgba(255,255,255,0.9)',
                                            backgroundColor: 'rgba(0,0,0,0.08)',
                                            fontWeight: 500,
                                        }}
                                    />
                                </Box>
                                <Typography variant="h3" component="h1" gutterBottom>
                                    Gestiona las tareas
                                    <br />
                                    de tu equipo en un solo lugar.
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        maxWidth: 460,
                                        color: 'rgba(255,255,255,0.85)',
                                        mt: 1,
                                        mx: 'auto',
                                    }}
                                >
                                    TaskList es el panel de control para tu equipo de sistemas:
                                    centraliza tareas, incidentes y proyectos en una vista clara,
                                    colaborativa y accionable.
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="overline"
                                    sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}
                                >
                                    Pensado para equipos técnicos
                                </Typography>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={2}
                                    sx={{ mt: 1 }}
                                >
                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                        <Box
                                            sx={{
                                                mt: '2px',
                                                p: 0.8,
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(0,0,0,0.18)',
                                                display: 'inline-flex',
                                            }}
                                        >
                                            <TaskAltRoundedIcon fontSize="small" />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                Priorización visual
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{ color: 'rgba(255,255,255,0.8)' }}
                                            >
                                                Ve de un vistazo qué tareas son críticas, bloqueadas
                                                o completadas.
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                        <Box
                                            sx={{
                                                mt: '2px',
                                                p: 0.8,
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(0,0,0,0.18)',
                                                display: 'inline-flex',
                                            }}
                                        >
                                            <TimelineRoundedIcon fontSize="small" />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                Seguimiento en tiempo real
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{ color: 'rgba(255,255,255,0.8)' }}
                                            >
                                                Actualizaciones instantáneas del estado de cada
                                                tarea del equipo.
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Stack>

                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    alignItems="center"
                                    justifyContent="center"
                                    sx={{ mt: 3 }}
                                >
                                    <GroupsRoundedIcon sx={{ opacity: 0.8 }} />
                                    <Typography
                                        variant="body2"
                                        sx={{ color: 'rgba(255,255,255,0.8)' }}
                                    >
                                        Diseñado para squads de TI, soporte, desarrollo y
                                        operaciones.
                                    </Typography>
                                </Stack>
                            </Box>
                        </Box>

                        {/* Columna derecha: tarjeta de login */}
                        <Box
                            sx={{
                                width: { xs: '100%', md: '58.334%' },
                                background:
                                    'radial-gradient(circle at top, rgba(255,255,255,0.35) 0, transparent 55%), linear-gradient(145deg, #fdfefc 0, #ebf5ee 55%, #d6f6e1 100%)',
                                p: { xs: 4, md: 5 },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Box sx={{ width: 1210, maxWidth: '100%' }}>    
                                <Typography
                                    variant="h5"
                                    component="h2"  
                                    sx={{
                                        fontWeight: 700,
                                        color: '#0f5132',
                                        mb: 1,
                                    }}
                                >
                                    Inicia sesión
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#3c5546',
                                        mb: 3,
                                    }}
                                >
                                    Accede con tu cuenta corporativa de Google para empezar a
                                    organizar las tareas de tu equipo.
                                </Typography>

                                <Paper
                                    elevation={0}
                                    sx={{
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        p: 3,
                                        borderRadius: 4,
                                        border: '1px solid rgba(15,81,50,0.08)',
                                        backgroundColor: '#ffffffd9',
                                        backdropFilter: 'blur(8px)',
                                        boxShadow:
                                            '0 18px 45px rgba(11, 72, 39, 0.18), 0 1px 0 rgba(255,255,255,0.8) inset',
                                    }}
                                >
                                    <Stack spacing={2.5}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{ color: '#4b6254' }}
                                        >
                                            Autenticación segura proporcionada por Google.
                                        </Typography>

                                        <GoogleLogin
                                            onSuccess={handleSuccess}
                                            onError={handleError}
                                            useOneTap
                                        />

                                        <Divider
                                            sx={{
                                                my: 1,
                                                '&::before, &::after': {
                                                    borderColor: 'rgba(15,81,50,0.16)',
                                                },
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{ color: '#6c8475' }}
                                            >
                                                Solo lectura de tu perfil básico
                                            </Typography>
                                        </Divider>

                                        <Typography
                                            variant="caption"
                                            sx={{ color: '#6c8475', lineHeight: 1.5 }}
                                        >
                                            Usaremos tu nombre, correo y foto de perfil para
                                            identificarte dentro del panel de TaskList. No
                                            almacenamos tu contraseña ni gestionamos la
                                            autenticación directamente.
                                        </Typography>
                                    </Stack>
                                </Paper>

                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'block',
                                        mt: 3,
                                        color: '#6c8475',
                                    }}
                                >
                                    © {new Date().getFullYear()} TaskList · Plataforma interna para
                                    equipos de sistemas.
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default Login;