# 🔧 Guía Técnica - Completar Integraciones

## Estado Actual del Proyecto

✅ **Completado:**
- Frontend: Página fusionada de Tareas con validaciones
- Backend: Rutas CRUD completas
- Modelos: Task actualizado
- Servicios: googleCalendarService.js y emailService.js creados
- Dependencias: googleapis y resend agregadas a package.json

⏳ **Pendiente:**
- Integrar servicios en las rutas
- Configurar variables de entorno
- Testing de integración

---

## 1. Google Calendar - Pasos de Configuración

### Paso 1: Crear un Proyecto en Google Cloud

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear nuevo proyecto: "TaskList"
3. Esperar a que se cree

### Paso 2: Habilitar Google Calendar API

1. En el dashboard, click "APIs and Services"
2. Click "Enable APIs and Services"
3. Buscar "Google Calendar API"
4. Click en el resultado
5. Click "Enable"

### Paso 3: Crear Credenciales OAuth 2.0

1. Ir a "Credentials" (Credenciales)
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Seleccionar tipo: "Web application"
4. Nombre: "TaskList Backend"
5. Authorized redirect URIs:
   ```
   http://localhost:4000/auth/google/callback
   ```
6. Click "Create"
7. Copiar:
   - Client ID
   - Client Secret

### Paso 4: Configurar Variables de Entorno

Crear/actualizar `.env` en `backend/`:

```env
# Google Calendar OAuth
GOOGLE_CALENDAR_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=tu-client-secret
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:4000/auth/google/callback

# Zona horaria
TIMEZONE=America/Argentina/Buenos_Aires
```

---

## 2. Resend - Configuración de Correos

### Paso 1: Crear Cuenta en Resend

1. Ir a [Resend.com](https://resend.com)
2. Click "Sign Up"
3. Crear cuenta con email
4. Verificar email

### Paso 2: Obtener API Key

1. En dashboard, ir a "API Keys"
2. Click "Create API Key"
3. Nombre: "TaskList"
4. Copiar la clave (empieza con `re_`)

### Paso 3: Configurar Dominio (Opcional para Producción)

Para producción, necesitas un dominio. En desarrollo usa el email de prueba.

### Paso 4: Variables de Entorno

Agregar a `.env` en `backend/`:

```env
# Resend Email
RESEND_API_KEY=re_tu_api_key
SENDER_EMAIL=TaskList <onboarding@resend.dev>
CLIENT_URL=http://localhost:5173
```

---

## 3. Instalar Dependencias

```bash
cd backend
npm install googleapis resend
```

---

## 4. Integrar Servicios en las Rutas

### Actualizar `backend/routes/tasks.js`

Agregar al principio:

```javascript
import googleCalendarService from '../services/googleCalendarService.js';
import emailService from '../services/emailService.js';
```

### En el Endpoint POST (Crear Tarea)

Después de `await task.save()`, agregar:

```javascript
// Crear evento en Google Calendar (si el usuario tiene token)
// TODO: Obtener access token del usuario desde sesión/BD
// const eventId = await googleCalendarService.createEvent(userAccessToken, {
//   title: task.title,
//   description: task.description,
//   dueDate: task.dueDate,
//   dueTime: task.dueTime,
// });
// if (eventId) {
//   task.googleCalendarEventId = eventId;
//   await task.save();
// }

// Enviar correos a miembros de equipos asignados
if (assignedTeams && assignedTeams.length > 0) {
  try {
    const teams = await Team.find({ _id: { $in: assignedTeams } }).populate('members', 'email name');
    const allMembers = [];
    
    teams.forEach(team => {
      team.members.forEach(member => {
        if (!allMembers.some(m => m.email === member.email)) {
          allMembers.push(member);
        }
      });
    });

    const creator = await User.findById(userId);
    
    if (allMembers.length > 0) {
      await emailService.sendTaskAssignmentEmail(
        allMembers,
        task,
        creator.name
      );
      
      task.emailSent = true;
      task.emailSentAt = new Date();
      await task.save();
    }
  } catch (error) {
    console.error('Error enviando correos:', error);
    // No bloquear la creación si falla el email
  }
}
```

### En el Endpoint PUT (Actualizar Tarea)

Después de `await task.save()`, agregar:

```javascript
// Actualizar en Google Calendar si existe
// if (task.googleCalendarEventId) {
//   await googleCalendarService.updateEvent(userAccessToken, task.googleCalendarEventId, {
//     title: task.title,
//     description: task.description,
//     dueDate: task.dueDate,
//     dueTime: task.dueTime,
//   });
// }

// Enviar correos de actualización
if (assignedTeams && assignedTeams.length > 0) {
  try {
    const teams = await Team.find({ _id: { $in: assignedTeams } }).populate('members', 'email name');
    const allMembers = [];
    
    teams.forEach(team => {
      team.members.forEach(member => {
        if (!allMembers.some(m => m.email === member.email)) {
          allMembers.push(member);
        }
      });
    });

    const creator = await User.findById(userId);
    
    if (allMembers.length > 0) {
      await emailService.sendTaskUpdateEmail(
        allMembers,
        task,
        creator.name
      );
    }
  } catch (error) {
    console.error('Error enviando correos de actualización:', error);
  }
}
```

### En el Endpoint DELETE (Eliminar Tarea)

Antes de eliminar, agregar:

```javascript
// Eliminar de Google Calendar si existe
// if (task.googleCalendarEventId) {
//   await googleCalendarService.deleteEvent(userAccessToken, task.googleCalendarEventId);
// }

// Enviar correos de eliminación
if (task.assignedTeams && task.assignedTeams.length > 0) {
  try {
    const teams = await Team.find({ _id: { $in: task.assignedTeams } }).populate('members', 'email name');
    const allMembers = [];
    
    teams.forEach(team => {
      team.members.forEach(member => {
        if (!allMembers.some(m => m.email === member.email)) {
          allMembers.push(member);
        }
      });
    });

    const creator = await User.findById(userId);
    
    if (allMembers.length > 0) {
      await emailService.sendTaskDeleteEmail(
        allMembers,
        task.title,
        creator.name
      );
    }
  } catch (error) {
    console.error('Error enviando correos de eliminación:', error);
  }
}
```

---

## 5. Manejo de Tokens de Google Calendar

**Desafío:** Los usuarios necesitan autenticarse con Google para usar Google Calendar.

### Solución Recomendada:

1. **Almacenar Access Token en BD**
   - Actualizar modelo User para incluir campo:
   ```javascript
   googleAccessToken: {
     type: String,
     default: null,
   },
   googleRefreshToken: {
     type: String,
     default: null,
   }
   ```

2. **Obtener Token en Login**
   - Cuando el usuario hace login, solicitar permiso para Google Calendar
   - Guardar tokens en la BD

3. **Usar Token en Servicios**
   ```javascript
   const user = await User.findById(userId);
   const eventId = await googleCalendarService.createEvent(
     user.googleAccessToken,
     taskData
   );
   ```

4. **Manejo de Refresh**
   - Implementar refresh de tokens cuando expiren

---

## 6. Testing de Integraciones

### Test Google Calendar

```bash
# 1. Crear tarea desde frontend
# 2. Verificar que aparece en MongoDB
# 3. Verificar que googleCalendarEventId está lleno
# 4. Ir a Google Calendar del usuario
# 5. Verificar que el evento existe
# 6. Editar tarea en frontend
# 7. Verificar que se actualiza en Google Calendar
# 8. Eliminar tarea en frontend
# 9. Verificar que se elimina de Google Calendar
```

### Test Resend

```bash
# 1. Crear tarea con equipos asignados
# 2. Verificar que se envía correo a miembros
# 3. Revisar bandeja de entrada del destinatario
# 4. Verificar que contiene los datos correctos
# 5. Editar tarea
# 6. Verificar que se envía correo de actualización
# 7. Eliminar tarea
# 8. Verificar que se envía correo de eliminación
```

### Usar MailHog para Testing Local

```bash
# Instalar MailHog (herramienta de desarrollo)
# https://github.com/mailhog/MailHog

# Ejecutar:
./MailHog

# Ver correos en: http://localhost:1025
```

---

## 7. Manejo de Errores

### En googleCalendarService.js

Los métodos NO lanzan errores. En su lugar:
- Registran el error en consola
- Devuelven null
- Permiten que la tarea se siga creando

```javascript
try {
  // operación Google Calendar
} catch (error) {
  console.error('Error en Google Calendar:', error);
  return null; // No bloquea
}
```

### En emailService.js

Similar a Google Calendar:
- Registra el error
- Continúa con la siguiente operación
- No bloquea la creación de tarea

---

## 8. Variables de Entorno Finales

`.env` en `backend/`:

```env
# Base de Datos
MONGO_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/tasklist

# Puerto
PORT=4000

# Cliente
CLIENT_URL=http://localhost:5173

# Google OAuth (Login)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# Google Calendar (Tareas)
GOOGLE_CALENDAR_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=xxx
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:4000/auth/google/callback
TIMEZONE=America/Argentina/Buenos_Aires

# Resend (Correos)
RESEND_API_KEY=re_xxx
SENDER_EMAIL=TaskList <onboarding@resend.dev>
```

---

## 9. Checklist de Implementación

### Fase 1: Configuración
- [ ] Crear proyecto en Google Cloud
- [ ] Habilitar Google Calendar API
- [ ] Crear credenciales OAuth
- [ ] Crear cuenta en Resend
- [ ] Obtener API Key de Resend
- [ ] Agregar variables de entorno

### Fase 2: Instalación
- [ ] `npm install googleapis resend` en backend
- [ ] Verificar que las librerías se instalan correctamente

### Fase 3: Integración Google Calendar
- [ ] Comentar las líneas de Google Calendar en tasks.js
- [ ] Implementar manejo de tokens de usuario
- [ ] Descomenta integración
- [ ] Testing: crear/editar/eliminar tareas
- [ ] Verificar en Google Calendar

### Fase 4: Integración Resend
- [ ] Descomenta el código de correos en tasks.js
- [ ] Testing: crear tarea con equipos
- [ ] Verificar correos recibidos
- [ ] Verificar contenido HTML
- [ ] Testing: edición y eliminación

### Fase 5: Testing Completo
- [ ] Crear 5 tareas diferentes
- [ ] Editar 3 tareas
- [ ] Eliminar 2 tareas
- [ ] Verificar Google Calendar
- [ ] Verificar correos
- [ ] Probar en diferentes dispositivos

---

## 10. Troubleshooting

### "Invalid API Key"
- Verificar que RESEND_API_KEY comience con `re_`
- Verificar que no haya espacios
- Generar nueva API Key

### "Google Calendar API not enabled"
- Ir a Google Cloud Console
- Verificar que Google Calendar API está habilitada
- Esperar 1 minuto después de habilitar

### "Redirect URI mismatch"
- Verificar que GOOGLE_CALENDAR_REDIRECT_URI coincida exactamente
- Incluir protocolo: `http://` o `https://`
- Sin trailing slash

### "Correos no se envían"
- Verificar RESEND_API_KEY
- Verificar SENDER_EMAIL
- Ver logs en servidor
- Usar MailHog para testing local

---

## 11. Recursos Útiles

- [Google Calendar API Docs](https://developers.google.com/calendar/api)
- [Resend Documentation](https://resend.com/docs)
- [Resend Emails Template](https://resend.com/docs/send-email)
- [MailHog](https://github.com/mailhog/MailHog)
- [OAuth 2.0 Flow](https://developers.google.com/identity/protocols/oauth2)

---

**Última Actualización**: 8 de Enero de 2026
**Estado**: En Desarrollo - Listo para Integración
