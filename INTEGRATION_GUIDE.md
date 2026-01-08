# Guía de Integración: Google Calendar y Correos

Este documento describe cómo configurar las integraciones de Google Calendar y envío de correos para el sistema de tareas.

## 1. Integración Google Calendar

### Requisitos
- Google Cloud Project configurado
- OAuth 2.0 credenciales (Client ID y Client Secret)
- Librerías necesarias: `googleapis`

### Instalación

```bash
cd backend
npm install googleapis
```

### Configuración

1. **En Google Cloud Console:**
   - Crear un nuevo proyecto
   - Habilitar la API de Google Calendar
   - Crear credenciales OAuth 2.0 (tipo: Aplicación web)
   - Agregar `http://localhost:4000/auth/google/callback` a los URIs autorizados

2. **Configurar variables de entorno en `.env` del backend:**
   ```
   GOOGLE_CALENDAR_CLIENT_ID=tu-client-id.apps.googleusercontent.com
   GOOGLE_CALENDAR_CLIENT_SECRET=tu-client-secret
   GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:4000/auth/google/callback
   ```

### Implementación en el Backend

El servicio de Google Calendar se integrará en:
- `backend/services/googleCalendarService.js` (nuevo archivo)
- `backend/routes/tasks.js` (actualizado)

Funcionalidades:
- Crear evento en Google Calendar cuando se crea una tarea
- Actualizar evento cuando se modifica una tarea
- Eliminar evento cuando se elimina una tarea

### Flujo de Integración

```javascript
// Cuando se crea una tarea
1. Validar datos de la tarea
2. Guardar tarea en MongoDB
3. Crear evento en Google Calendar usando googleCalendarService
4. Guardar googleCalendarEventId en la tarea
5. Devolver tarea creada
```

## 2. Envío de Correos

### Opciones Recomendadas (Gratuitas y Fáciles)

#### Opción 1: Resend (RECOMENDADO)
- **Ventajas:** Gratis hasta 100 correos/día, interfaz simple, soporte para TypeScript
- **Precio:** Gratuito para desarrollo, planes pagos desde $20/mes
- **Sitio:** https://resend.com

```bash
npm install resend
```

#### Opción 2: SendGrid
- **Ventajas:** Gratis 100 correos/día (nivel free), documentación excelente
- **Precio:** Gratuito hasta 100/día, planes pagos desde $9.95/mes
- **Sitio:** https://sendgrid.com

```bash
npm install @sendgrid/mail
```

#### Opción 3: Mailgun
- **Ventajas:** Gratis 50,000 correos/mes para pruebas, flexible
- **Precio:** Gratuito para pruebas, planes desde $25/mes
- **Sitio:** https://www.mailgun.com

### Instalación Recomendada (Resend)

```bash
cd backend
npm install resend
```

### Configuración (Resend)

1. **Crear cuenta en resend.com**
2. **Obtener API Key**
3. **Agregar a `.env` del backend:**
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   SENDER_EMAIL=noreply@tudominio.com
   ```

### Implementación en el Backend

```javascript
// backend/services/emailService.js (nuevo archivo)
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendTaskAssignmentEmail = async (teamMembers, taskTitle, dueDate) => {
  for (const member of teamMembers) {
    try {
      await resend.emails.send({
        from: process.env.SENDER_EMAIL,
        to: member.email,
        subject: `Nueva tarea asignada: ${taskTitle}`,
        html: `
          <h2>Nueva tarea asignada</h2>
          <p><strong>Título:</strong> ${taskTitle}</p>
          <p><strong>Vencimiento:</strong> ${new Date(dueDate).toLocaleDateString('es-ES')}</p>
          <p>Ingresa a tu panel para ver más detalles.</p>
        `,
      });
    } catch (error) {
      console.error(`Error enviando correo a ${member.email}:`, error);
    }
  }
};
```

### Flujo de Envío de Correos

```javascript
// Cuando se crea una tarea
1. Obtener miembros de los equipos asignados
2. Para cada miembro:
   - Construir contenido del correo
   - Enviar mediante Resend
   - Guardar estado en la tarea (emailSent: true)
3. Registrar log de envío
```

## 3. Actualización de Rutas

Las rutas de tareas en `backend/routes/tasks.js` incluyen:

- `POST /api/tasks` - Crear tarea (incluyendo Google Calendar y correos)
- `PUT /api/tasks/:taskId` - Actualizar tarea
- `DELETE /api/tasks/:taskId` - Eliminar tarea (eliminar de Google Calendar)
- `GET /api/tasks` - Listar tareas del usuario

## 4. Estructura de Archivos a Crear

```
backend/
├── services/
│   ├── googleCalendarService.js (nuevo)
│   └── emailService.js (nuevo)
└── routes/
    └── tasks.js (actualizado)
```

## 5. Variables de Entorno Necesarias

```env
# Google Calendar
GOOGLE_CALENDAR_CLIENT_ID=xxx
GOOGLE_CALENDAR_CLIENT_SECRET=xxx
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:4000/auth/google/callback

# Correos (Resend)
RESEND_API_KEY=re_xxx
SENDER_EMAIL=noreply@tudominio.com
```

## 6. Testing

### Test Local
```bash
# Crear una tarea desde el frontend
# Verificar que se cree en MongoDB
# Verificar que se cree en Google Calendar
# Verificar que se envíe correo a miembros del equipo
```

### Test de Correos
- Usar direcciones de correo reales o de prueba
- Verificar carpeta de spam
- Usar herramientas como MailHog para desarrollo local

## 7. Próximos Pasos

1. Instalar dependencias (googleapis, resend)
2. Crear archivos de servicios
3. Actualizar rutas de tareas con lógica de integraciones
4. Configurar variables de entorno
5. Testing e implementación en producción
