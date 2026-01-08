import { Resend } from 'resend';

class EmailService {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  /**
   * Enviar correo de tarea asignada
   * @param {Array} recipients - Array de objetos {email, name}
   * @param {Object} taskData - Datos de la tarea
   * @param {string} creatorName - Nombre de quien creó la tarea
   */
  async sendTaskAssignmentEmail(recipients, taskData, creatorName) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY no configurada. Los correos no se enviarán.');
      return false;
    }

    if (!recipients || recipients.length === 0) {
      console.log('No hay destinatarios para el correo');
      return false;
    }

    try {
      const dueDate = new Date(taskData.dueDate).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const priorityLabels = {
        low: '🟢 Baja',
        medium: '🟡 Media',
        high: '🟠 Alta',
        critical: '🔴 Crítica',
      };

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1b8735; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
              .task-info { background-color: white; padding: 15px; border-left: 4px solid #1b8735; margin: 15px 0; }
              .task-info p { margin: 8px 0; }
              .label { font-weight: bold; color: #1b8735; }
              .priority { display: inline-block; padding: 5px 10px; border-radius: 4px; background-color: #f0f0f0; }
              .button { display: inline-block; background-color: #1b8735; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
              .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>📋 Nueva Tarea Asignada</h2>
              </div>
              <div class="content">
                <p>¡Hola! Se te ha asignado una nueva tarea.</p>
                
                <div class="task-info">
                  <p><span class="label">Título:</span> ${taskData.title}</p>
                  <p><span class="label">Descripción:</span> ${taskData.description}</p>
                  <p><span class="label">Prioridad:</span> <span class="priority">${priorityLabels[taskData.priority]}</span></p>
                  <p><span class="label">Vencimiento:</span> ${dueDate}${taskData.startTime && taskData.endTime ? ` de ${taskData.startTime} a ${taskData.endTime}` : ''}</p>
                  <p><span class="label">Asignado por:</span> ${creatorName}</p>
                </div>

                <p>Por favor, ingresa a tu panel de control para revisar los detalles y comenzar a trabajar en esta tarea.</p>
                
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/tasks" class="button">
                  Ir a Tareas
                </a>

                <div class="footer">
                  <p>© 2024 TaskList. Este es un correo automático, por favor no respondas a este mensaje.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      // Enviar a todos los destinatarios
      const promises = recipients.map((recipient) =>
        this.resend.emails.send({
          from: process.env.SENDER_EMAIL || 'TaskList <onboarding@resend.dev>',
          to: recipient.email,
          subject: `Nueva tarea asignada: "${taskData.title}"`,
          html: htmlContent,
        })
      );

      const results = await Promise.all(promises);

      const successCount = results.filter((r) => r.id).length;
      console.log(`✅ ${successCount} correo(s) enviado(s) correctamente`);

      return successCount > 0;
    } catch (error) {
      console.error('❌ Error enviando correos:', error);
      return false;
    }
  }

  /**
   * Enviar correo de actualización de tarea
   */
  async sendTaskUpdateEmail(recipients, taskData, creatorName) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY no configurada. Los correos no se enviarán.');
      return false;
    }

    if (!recipients || recipients.length === 0) {
      return false;
    }

    try {
      const dueDate = new Date(taskData.dueDate).toLocaleDateString('es-ES');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1b8735; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
              .task-info { background-color: white; padding: 15px; border-left: 4px solid #1b8735; margin: 15px 0; }
              .task-info p { margin: 8px 0; }
              .label { font-weight: bold; color: #1b8735; }
              .button { display: inline-block; background-color: #1b8735; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
              .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>📝 Tarea Actualizada</h2>
              </div>
              <div class="content">
                <p>Una tarea ha sido actualizada.</p>
                
                <div class="task-info">
                  <p><span class="label">Título:</span> ${taskData.title}</p>
                  <p><span class="label">Descripción:</span> ${taskData.description}</p>
                  <p><span class="label">Vencimiento:</span> ${dueDate}${taskData.startTime && taskData.endTime ? ` de ${taskData.startTime} a ${taskData.endTime}` : ''}</p>
                </div>

                <p>Ingresa a tu panel para ver los cambios realizados.</p>
                
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/tasks" class="button">
                  Ver Tareas
                </a>

                <div class="footer">
                  <p>© 2024 TaskList. Este es un correo automático, por favor no respondas a este mensaje.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const promises = recipients.map((recipient) =>
        this.resend.emails.send({
          from: process.env.SENDER_EMAIL || 'TaskList <onboarding@resend.dev>',
          to: recipient.email,
          subject: `Tarea actualizada: "${taskData.title}"`,
          html: htmlContent,
        })
      );

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('❌ Error enviando correos de actualización:', error);
      return false;
    }
  }

  /**
   * Enviar correo de eliminación de tarea
   */
  async sendTaskDeleteEmail(recipients, taskTitle, creatorName) {
    if (!process.env.RESEND_API_KEY) {
      return false;
    }

    if (!recipients || recipients.length === 0) {
      return false;
    }

    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #d32f2f; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background-color: #1b8735; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
              .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>❌ Tarea Eliminada</h2>
              </div>
              <div class="content">
                <p>La tarea "<strong>${taskTitle}</strong>" ha sido eliminada.</p>
                
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/tasks" class="button">
                  Ver Tareas
                </a>

                <div class="footer">
                  <p>© 2024 TaskList. Este es un correo automático, por favor no respondas a este mensaje.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const promises = recipients.map((recipient) =>
        this.resend.emails.send({
          from: process.env.SENDER_EMAIL || 'TaskList <onboarding@resend.dev>',
          to: recipient.email,
          subject: `Tarea eliminada: "${taskTitle}"`,
          html: htmlContent,
        })
      );

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Error enviando correos de eliminación:', error);
      return false;
    }
  }
}

export default new EmailService();
