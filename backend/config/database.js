import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Limpiar y obtener la URI de MongoDB
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasklist';

// Debug: mostrar qué se está leyendo (solo los primeros caracteres por seguridad)
if (MONGODB_URI) {
  console.log('🔍 URI detectada:', MONGODB_URI.substring(0, 30) + '...');
}

// Eliminar espacios y comillas si las hay
MONGODB_URI = MONGODB_URI.trim().replace(/^["']|["']$/g, '');

// Si la URI contiene "MONGODB_URI=" al inicio, hay un error en el .env
if (MONGODB_URI.startsWith('MONGODB_URI=')) {
  console.error('❌ Error: El archivo .env tiene un formato incorrecto.');
  console.error('❌ La línea debe ser: MONGODB_URI=mongodb+srv://...');
  console.error('❌ No debe tener espacios ni caracteres extra alrededor del =');
  MONGODB_URI = 'mongodb://localhost:27017/tasklist'; // Usar valor por defecto
}

export const connectDB = async () => {
  try {
    // Verificar que la URI tenga el formato correcto
    if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
      throw new Error(`URI inválida. Debe empezar con "mongodb://" o "mongodb+srv://". URI recibida: ${MONGODB_URI.substring(0, 20)}...`);
    }
    
    console.log('🔄 Intentando conectar a MongoDB...');
    console.log('🔗 URI (sin credenciales):', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
    
    // Intentar conectar con opciones más permisivas
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // 30 segundos de timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority',
    });
    
    console.log('✅ MongoDB conectado correctamente');
    console.log('📊 Estado de conexión:', mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado');
    console.log('📦 Base de datos:', mongoose.connection.db?.databaseName || 'N/A');
    
    // Escuchar eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de MongoDB:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB desconectado');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconectado');
    });
    
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    console.error('📋 Detalles del error:', error.name);
    
    if (error.message.includes('whitelist') || error.message.includes('IP')) {
      console.error('');
      console.error('🔴 PROBLEMA: Tu IP no está en la whitelist de MongoDB Atlas');
      console.error('📝 SOLUCIÓN:');
      console.error('   1. Ve a MongoDB Atlas → Security → Network Access');
      console.error('   2. Haz clic en "Add IP Address"');
      console.error('   3. Selecciona "Allow Access from Anywhere" (0.0.0.0/0)');
      console.error('   4. Espera 2-3 minutos y reinicia el servidor');
      console.error('');
    }
    
    console.warn('⚠️ El servidor continuará funcionando, pero las operaciones de base de datos fallarán.');
    console.warn('⚠️ Reinicia el servidor después de corregir el problema.');
  }
};

