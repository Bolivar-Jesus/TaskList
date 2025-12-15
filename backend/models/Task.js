import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 50,
      default: '',
    },
    image: {
      type: String, // URL de la imagen almacenada
      default: null,
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
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    dueDate: {
      type: Date,
      required: true,
    },
    dueTimeStart: {
      type: String, // Formato HH:mm
      default: null,
    },
    dueTimeEnd: {
      type: String, // Formato HH:mm
      default: null,
    },
    completedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
        completionNote: {
          type: String,
          trim: true,
          maxlength: 200,
        },
        completionImages: [
          {
            type: String, // URLs de imágenes
          },
        ],
      },
    ],
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
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });

export default mongoose.model('Task', taskSchema);

