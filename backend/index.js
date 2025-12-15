import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import { connectDB } from './config/database.js';
import User from './models/User.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.warn(
    '⚠️ Falta la variable de entorno GOOGLE_CLIENT_ID. Configúrala en el archivo .env del backend.'
  );
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Conectar a MongoDB (no bloqueamos el servidor si falla)
connectDB().catch((err) => {
  console.error('Error crítico conectando a MongoDB:', err);
});

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API TaskList funcionando 🚀' });
});

// Rutas de usuarios
app.use('/api/users', userRoutes);

// Ruta para verificar el token de Google enviado desde el frontend
app.post('/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Falta el token de Google (credential).' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Verificar si MongoDB está conectado
    if (mongoose.connection.readyState !== 1) {
      console.error('⚠️ Intento de autenticación sin conexión a MongoDB');
      return res.status(503).json({ 
        error: 'Base de datos no disponible. Por favor, verifica la conexión a MongoDB.',
        details: 'Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas y que el servidor esté corriendo.'
      });
    }

    // Buscar o crear usuario en la base de datos
    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      // Crear nuevo usuario
      user = new User({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        role: null, // Se configurará en el primer login
      });
      await user.save();
    } else {
      // Actualizar datos del usuario si han cambiado
      user.email = payload.email;
      user.name = payload.name;
      if (payload.picture) {
        user.picture = payload.picture;
      }
      await user.save();
    }

    // Devolver usuario sin el campo _id de MongoDB, usando id
    const userResponse = {
      id: user._id.toString(),
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.json({
      message: 'Usuario autenticado correctamente',
      user: userResponse,
    });
  } catch (error) {
    console.error('Error verificando token de Google:', error);
    return res.status(401).json({ error: 'Token de Google inválido o expirado.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor backend escuchando en http://localhost:${PORT}`);
});


