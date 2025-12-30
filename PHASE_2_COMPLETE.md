# PHASE 2 COMPLETADA: Sistema de Roles y Permisos

## Resumen de Implementación

Se ha completado con éxito **PHASE 2** del sistema de permisos para equipos. Los creadores de equipos ahora pueden asignar y gestionar roles para otros miembros, y se han implementado restricciones de acceso basadas en roles.

---

## ✅ Características Implementadas

### 1. **Modelo de Datos - Backend**
- Agregado campo `memberRoles` a Team schema
- Array de objetos: `{ userId: ObjectId, role: String }`
- Roles disponibles: `'admin'`, `'editor'`, `'viewer'`

### 2. **Endpoints API - Backend**

#### PUT `/api/teams/:teamId/member-roles`
Actualizar roles de miembros (solo para admin)
```javascript
// Request
{
  memberRoles: [
    { userId: "id1", role: "admin" },
    { userId: "id2", role: "editor" },
    { userId: "id3", role: "viewer" }
  ]
}

// Response
{
  message: "Roles actualizados exitosamente",
  memberRoles: [...]
}

// Error Cases
403 - No es admin
400 - Creador no puede dejar de ser admin
```

#### POST `/api/teams` - Actualizado
Ahora asigna automáticamente roles:
- Creador → `'admin'`
- Otros miembros → `'viewer'`

#### PUT `/api/teams/:teamId` - Actualizado
**Cambio importante:** Ahora valida el rol, no solo si es creador
- `'admin'` y `'editor'` pueden editar
- Al agregar miembros nuevos: → `'viewer'`

#### DELETE `/api/teams/:teamId` - Actualizado
**Cambio importante:** Solo `'admin'` puede eliminar
- Valida rol del usuario antes de permitir eliminación
- Retorna 403 si no es admin

### 3. **Interfaz de Usuario - Frontend**

#### Modal de Miembros Mejorado
- Muestra rol de cada miembro en verde
- Botón "Editar roles" (solo para admins)

#### Modo Edición de Roles
- Select dropdown para cada miembro
- Opciones: Administrador, Editor, Visor
- El rol admin está deshabilitado (no se puede cambiar)
- Botones Cancelar/Guardar

#### Protección Visual Basada en Roles
- Admin: Ve y puede usar todos los botones (Miembros, Editar, Eliminar, Editar Roles)
- Editor: Ve Miembros y Editar, pero NO Eliminar
- Viewer: NO ve botones de acción, solo "Solo puedes ver este equipo"

### 4. **Lógica de Control de Acceso - Frontend**

#### Nuevas funciones en Teams.jsx:
```javascript
getUserRoleInTeam(team) - Obtiene el rol del usuario en un equipo
canEditTeam(team) - true si admin o editor
canDeleteTeam(team) - true si admin
canAddMembers(team) - true si admin o editor
```

#### Validaciones Implementadas

| Validación | Ubicación | Efecto |
|-----------|-----------|--------|
| Solo admin puede cambiar roles | Backend | 403 Forbidden |
| Creador siempre debe ser admin | Backend | 400 Bad Request |
| Solo admin/editor pueden editar | Backend | 403 Forbidden |
| Solo admin puede eliminar | Backend | 403 Forbidden |
| Nuevos miembros = viewer | Backend | Auto-assigned |
| UI muestra botones según rol | Frontend | UX mejorada |

---

## 📊 Flujo de Datos

```
[Usuario A (admin) crea equipo con B,C]
    ↓
POST /api/teams
    ↓
Backend asigna:
  - A: admin
  - B,C: viewer
    ↓
[Se guarda en DB con memberRoles]
    ↓
[Usuario B intenta editar]
    ↓
PUT /api/teams/:id
    ↓
Backend obtiene rol de B: viewer
    ↓
403 Forbidden - "No tienes permiso"
    ↓
[Frontend ya ocultaba el botón]
```

---

## 🔐 Matriz de Permisos

| Acción | Admin | Editor | Viewer |
|--------|-------|--------|--------|
| Ver equipo | ✅ | ✅ | ✅ |
| Editar nombre/descripción | ✅ | ✅ | ❌ |
| Agregar miembros | ✅ | ✅ | ❌ |
| Eliminar equipo | ✅ | ❌ | ❌ |
| Cambiar roles | ✅ | ❌ | ❌ |
| Ver roles | ✅ | ✅ | ✅ |

---

## 🔄 Próximas Fases

### PHASE 3+: Auditoría y Logs (Opcional)
- Registrar cambios de rol
- Registrar ediciones de equipo con usuario que editó
- Mostrar historial de cambios

---

## 📁 Archivos Modificados

```
backend/
├── models/Team.js                    ← Agregado memberRoles schema
└── routes/teams.js                   ← Control de acceso por rol
                                        ← Validación en PUT y DELETE

frontend/
├── src/components/TeamMembersDisplay.jsx  ← UI para editar roles
└── src/pages/Teams.jsx               
    ├── getUserRoleInTeam()           ← Nueva función
    ├── canEditTeam()                 ← Nueva función
    ├── canDeleteTeam()               ← Nueva función
    ├── canAddMembers()               ← Nueva función
    ├── handleUpdateMemberRoles()     ← Handler para API
    └── Botones condicionales         ← Basados en rol
```

---

## 🧪 Cómo Testear

Ver `PHASE_2_TEST_GUIDE.md` para guía completa de pruebas.

**Casos Críticos:**
1. ✅ Crear equipo → roles asignados correctamente
2. ✅ Admin edita equipo → funciona
3. ✅ Editor intenta eliminar → 403 Forbidden
4. ✅ Viewer intenta editar → 403 Forbidden + botones ocultos
5. ✅ Cambios de rol → se aplican inmediatamente

---

## 🔒 Seguridad

| Aspecto | Implementado | Detalles |
|--------|-------------|---------|
| Backend validation | ✅ | Valida rol en PUT y DELETE |
| Frontend validation | ✅ | Botones se ocultan según rol |
| Data persistence | ✅ | memberRoles se guardan en DB |
| API protection | ✅ | Header x-user-id validado |
| Doble validación | ✅ | Frontend + Backend |

---

## 📝 Notas de Implementación

1. **Estructura memberRoles**: Array de objetos para mejor compatibilidad.

2. **Rol Admin Obligatorio**: Cada equipo DEBE tener exactamente un admin.

3. **Default Role**: Nuevos miembros obtienen 'viewer' automáticamente.

4. **Validación Doble**: Frontend oculta UI, backend también valida.

5. **Persistencia Inmediata**: Los cambios se guardan en DB sin delay.

6. **Mensaje de Error**: Para viewers dice "Solo puedes ver este equipo" (en lugar de "Solo el creador puede editar")

---

## 🎯 Estado Actual

| Aspecto | Estado |
|--------|--------|
| PHASE 1: Restricción creator-only | ✅ COMPLETADO |
| PHASE 2: Sistema de roles completo | ✅ COMPLETADO |
| Backend control de acceso | ✅ IMPLEMENTADO |
| Frontend UI basada en roles | ✅ IMPLEMENTADO |
| PHASE 3: Auditoría | ⏳ PRÓXIMO (opcional) |

---

## 💡 Tips para el Futuro

1. **Migración de equipos existentes**: Si hay equipos sin memberRoles, ejecutar:
   ```javascript
   db.teams.updateMany(
     { memberRoles: { $exists: false } },
     [{ $set: { 
       memberRoles: {
         $map: {
           input: "$members",
           as: "memberId",
           in: {
             userId: "$$memberId",
             role: {
               $cond: [{ $eq: ["$$memberId", "$createdBy"] }, "admin", "viewer"]
             }
           }
         }
       }
     }}]
   )
   ```

2. **Expansión de roles**: Agregar nuevos roles es tan simple como:
   ```javascript
   enum: ['admin', 'editor', 'viewer', 'moderator', 'custom']
   ```

3. **Middleware de permisos**: Crear middleware reutilizable:
   ```javascript
   const requireTeamRole = (requiredRoles) => async (req, res, next) => {
     const team = await Team.findById(req.params.teamId);
     const userRole = team.memberRoles.find(mr => mr.userId === req.headers['x-user-id'])?.role;
     if (!requiredRoles.includes(userRole)) {
       return res.status(403).json({ error: 'Permission denied' });
     }
     next();
   };
   
   router.put('/:teamId', requireTeamRole(['admin', 'editor']), updateTeam);
   ```

---

**Completado:** PHASE 2 ✅  
**Control de Acceso:** Implementado ✅  
**Próximo:** PHASE 3 (Auditoría/Logs - Opcional)
