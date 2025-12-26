import React, { useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateTask from './pages/CreateTask';
import Tasks from './pages/Tasks';
import Teams from './pages/Teams';
import MainLayout from './components/MainLayout';
import { alertSuccess, alertError } from './utils/alert';
import { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';


// Leemos el client ID desde las variables de entorno de Vite
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      const reason = sessionStorage.getItem('logout_reason');
      if (reason === 'manual') {
        alertSuccess('Sesión cerrada correctamente.');
      } else if (reason === 'inactividad') {
        alertError('Tu sesión ha sido cerrada por inactividad. Por favor, inicia sesión nuevamente.');
      } else {
        alertError('Debes iniciar sesión para acceder al sistema.');
      }
      sessionStorage.removeItem('logout_reason');
      setTimeout(() => navigate('/login', { replace: true }), 300);
    }
  }, [user, loading, location, navigate]);

  if (loading) {
    return <div>Cargando...</div>;
  }
  if (!user) {
    return null; // La navegación ocurre automáticamente por el useEffect de arriba
  }

  return children;
};

function AppRoutes({ mode, toggleMode }) {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout mode={mode} toggleMode={toggleMode}>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-task"
        element={
          <ProtectedRoute>
            <MainLayout mode={mode} toggleMode={toggleMode}>
              <CreateTask />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <MainLayout mode={mode} toggleMode={toggleMode}>
              <Tasks />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout mode={mode} toggleMode={toggleMode}>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams"
        element={
          <ProtectedRoute>
            <MainLayout mode={mode} toggleMode={toggleMode}>
              <Teams />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

function App() {
    // Preferencia inicial: sistema o localStorage
    const getInitialMode = () => {
      // Si el usuario ya eligió previamente
      const saved = localStorage.getItem('themeMode');
      if (saved) return saved;
      // Si no, leemos el sistema
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
      return 'light';
    };

    const [mode, setMode] = useState(getInitialMode);

    // Guardar preferencia usuario
    useEffect(() => {
      localStorage.setItem('themeMode', mode);
    }, [mode]);

    // Tema dinámico de MUI
    const theme = useMemo(() =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark'
            ? {
                primary: { main: '#4caf50' }, // puedes personalizar más
                background: {
                  default: '#181818',
                  paper: '#222'
                }
              }
            : {
                primary: { main: '#1b8735' }
              }
          ),
        },
      }), [mode]);

    // Función para alternar
    const toggleMode = () => setMode((prev) => prev === 'light' ? 'dark' : 'light');

    if (!GOOGLE_CLIENT_ID) {
      console.warn(
        '⚠️ VITE_GOOGLE_CLIENT_ID no está definido. Configúralo en el archivo .env del frontend.'
      );
    }

    return (
      <ThemeProvider theme={theme}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ''}>
          <AuthProvider>
            <Router>
              <CssBaseline />
              <AppRoutes mode={mode} toggleMode={toggleMode} />
            </Router>
          </AuthProvider>
        </GoogleOAuthProvider>
      </ThemeProvider>
    );
  }
export default App;