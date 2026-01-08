import { google } from 'googleapis';

const calendar = google.calendar('v3');

class GoogleCalendarService {
  constructor() {
    // Inicializar OAuth2 client
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      process.env.GOOGLE_CALENDAR_REDIRECT_URI
    );
  }

  /**
   * Obtener calendario del usuario usando access token
   */
  async getCalendar(accessToken) {
    try {
      this.auth.setCredentials({ access_token: accessToken });
      return calendar;
    } catch (error) {
      console.error('Error configurando Google Calendar:', error);
      throw error;
    }
  }

  /**
   * Crear evento en Google Calendar
   * @param {string} accessToken - Token de acceso del usuario
   * @param {Object} taskData - Datos de la tarea
   * @returns {string} - ID del evento creado en Google Calendar
   */
  async createEvent(accessToken, taskData) {
    try {
      if (!accessToken) {
        console.warn('No access token disponible para Google Calendar');
        return null;
      }

      this.auth.setCredentials({ access_token: accessToken });

      const eventBody = {
        summary: `[Tarea] ${taskData.title}`,
        description: taskData.description,
        start: {
          dateTime: new Date(taskData.dueDate),
          timeZone: 'America/Argentina/Buenos_Aires', // Ajustar según región
        },
        end: {
          dateTime: new Date(new Date(taskData.dueDate).getTime() + 60 * 60 * 1000), // +1 hora
          timeZone: 'America/Argentina/Buenos_Aires',
        },
      };

      // Si hay hora especificada
      if (taskData.startTime && taskData.endTime) {
        const [startHours, startMinutes] = taskData.startTime.split(':').map(Number);
        const [endHours, endMinutes] = taskData.endTime.split(':').map(Number);
        
        const startDate = new Date(taskData.dueDate);
        startDate.setHours(startHours, startMinutes, 0, 0);
        
        const endDate = new Date(taskData.dueDate);
        endDate.setHours(endHours, endMinutes, 0, 0);

        eventBody.start.dateTime = startDate;
        eventBody.end.dateTime = endDate;
      }

      const response = await calendar.events.insert({
        auth: this.auth,
        calendarId: 'primary',
        resource: eventBody,
      });

      console.log(`✅ Evento creado en Google Calendar: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      console.error('Error creando evento en Google Calendar:', error);
      // No lanzar error, solo registrar para que no bloquee la creación de tarea
      return null;
    }
  }

  /**
   * Actualizar evento en Google Calendar
   * @param {string} accessToken - Token de acceso del usuario
   * @param {string} eventId - ID del evento en Google Calendar
   * @param {Object} taskData - Datos actualizados de la tarea
   */
  async updateEvent(accessToken, eventId, taskData) {
    try {
      if (!accessToken || !eventId) {
        console.warn('No access token o event ID disponible para actualizar Google Calendar');
        return;
      }

      this.auth.setCredentials({ access_token: accessToken });

      const eventBody = {
        summary: `[Tarea] ${taskData.title}`,
        description: taskData.description,
        start: {
          dateTime: new Date(taskData.dueDate),
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        end: {
          dateTime: new Date(new Date(taskData.dueDate).getTime() + 60 * 60 * 1000),
          timeZone: 'America/Argentina/Buenos_Aires',
        },
      };

      // Si hay hora especificada
      if (taskData.startTime && taskData.endTime) {
        const [startHours, startMinutes] = taskData.startTime.split(':').map(Number);
        const [endHours, endMinutes] = taskData.endTime.split(':').map(Number);
        
        const startDate = new Date(taskData.dueDate);
        startDate.setHours(startHours, startMinutes, 0, 0);
        
        const endDate = new Date(taskData.dueDate);
        endDate.setHours(endHours, endMinutes, 0, 0);

        eventBody.start.dateTime = startDate;
        eventBody.end.dateTime = endDate;
      }

      await calendar.events.update({
        auth: this.auth,
        calendarId: 'primary',
        eventId,
        resource: eventBody,
      });

      console.log(`✅ Evento actualizado en Google Calendar: ${eventId}`);
    } catch (error) {
      console.error('Error actualizando evento en Google Calendar:', error);
      // No lanzar error, solo registrar
    }
  }

  /**
   * Eliminar evento en Google Calendar
   * @param {string} accessToken - Token de acceso del usuario
   * @param {string} eventId - ID del evento en Google Calendar
   */
  async deleteEvent(accessToken, eventId) {
    try {
      if (!accessToken || !eventId) {
        console.warn('No access token o event ID disponible para eliminar de Google Calendar');
        return;
      }

      this.auth.setCredentials({ access_token: accessToken });

      await calendar.events.delete({
        auth: this.auth,
        calendarId: 'primary',
        eventId,
      });

      console.log(`✅ Evento eliminado de Google Calendar: ${eventId}`);
    } catch (error) {
      console.error('Error eliminando evento de Google Calendar:', error);
      // No lanzar error, solo registrar
    }
  }
}

export default new GoogleCalendarService();