import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    description: {
      type: String,
      trim: true,
      minlength: 5,
      maxlength: 50,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    memberRoles: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['superadmin', 'admin', 'viewer'],
          default: 'viewer',
        },
        // Permisos específicos para role 'admin'
        permissions: {
          canEditTeam: { type: Boolean, default: false }, // Editar nombre, descripción, foto
          canAddMembers: { type: Boolean, default: false }, // Agregar/remover miembros
          canAssignPermissions: { type: Boolean, default: false }, // Dar permisos a otros admins
        },
      },
    ],
    image: {
      type: String, // URL o base64 de la imagen
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

export default mongoose.model('Team', teamSchema);
