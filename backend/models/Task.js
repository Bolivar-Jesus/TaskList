import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 20,
    },
    description: {
      type: String,
      trim: true,
      minlength: 5,
      maxlength: 50,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTeams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],
    dueDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // Formato HH:mm
      default: null,
    },
    endTime: {
      type: String, // Formato HH:mm
      default: null,
    },
    googleCalendarEventId: {
      type: String, // ID del evento en Google Calendar
      default: null,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para búsquedas eficientes
taskSchema.index({ createdBy: 1 });
taskSchema.index({ assignedTeams: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });

export default mongoose.model('Task', taskSchema);

