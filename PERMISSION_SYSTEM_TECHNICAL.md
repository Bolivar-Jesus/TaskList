# Localización del Sistema de Permisos - Implementación Completa

## 📍 Backend - Node.js/Express

### 1. **Modelo de Datos** (`/backend/models/Team.js`)
```
Líneas: 24-42
Estructura memberRoles:
- userId: ObjectId referencia al usuario
- role: 'superadmin' | 'admin' | 'viewer'
- permissions: { canEditTeam, canAddMembers, canAssignPermissions }
```

### 2. **Endpoints API** (`/backend/routes/teams.js`)

#### POST /api/teams (Crear equipo)
- **Líneas**: 100-165
- **Función**: Crea equipo con rol superadmin para creador
- **Validación**: 
  - Nombre 2-30 caracteres
  - Descripción 5-50 caracteres
  - Miembros deben existir

#### PUT /api/teams/:teamId/member-roles (Actualizar roles)
- **Líneas**: 167-211
- **Función**: Actualiza roles y permisos de miembros
- **Restricción**: Solo superadmin del equipo
- **Validaciones**:
  - Creador siempre superadmin
  - Admins mínimo 1 permiso
  - 403 si no es superadmin
  - 400 si validación falla

#### PUT /api/teams/:teamId (Editar equipo)
- **Líneas**: 213-308
- **Función**: Edita datos del equipo
- **Restricción**: Valida canEditTeam y canAddMembers
- **Fallback**: Creador en equipos sin memberRoles

#### DELETE /api/teams/:teamId (Eliminar equipo)
- **Líneas**: 341-378
- **Función**: Elimina equipo
- **Restricción**: Solo superadmin
- **Fallback**: Creador en equipos sin memberRoles

---

## 📍 Frontend - React/Material-UI

### 1. **Funciones de Permisos** (`/frontend/src/pages/Teams.jsx`)

#### getUserRoleInTeam(team)
- **Líneas**: 139-148
- **Retorna**: 'superadmin' | 'admin' | 'viewer' | null
- **Fallback**: Creador es superadmin si no hay memberRoles
- **Uso**: Determinar el rol del usuario actual en equipo

#### getUserPermissionsInTeam(team)
- **Líneas**: 150-194
- **Retorna**: {canEditTeam, canAddMembers, canAssignPermissions, canDeleteTeam}
- **Lógica**:
  - Superadmin: todos true
  - Admin: según permiso almacenado
  - Viewer: todos false
- **Fallback**: Creador tiene todos si no hay memberRoles

#### canEditTeam(team)
- **Líneas**: 196-200
- **Retorna**: boolean
- **Uso**: Mostrar/ocultar opción de editar

#### canDeleteTeam(team)
- **Líneas**: 202-206
- **Retorna**: boolean
- **Uso**: Mostrar/ocultar botón delete

#### canAddMembers(team)
- **Líneas**: 196-200
- **Retorna**: boolean
- **Uso**: Mostrar/ocultar botón "Miembros"

#### canAssignPermissions(team)
- **Líneas**: 209-212
- **Retorna**: boolean
- **Uso**: Mostrar/ocultar botón "Editar roles"

### 2. **Modal de Edición de Roles** (`/frontend/src/components/TeamMembersDisplay.jsx`)

#### Estado Local
- **Líneas**: 25-29
- **Variables**:
  - `openMembersModal`: bool - controla visibilidad modal
  - `editingRoles`: bool - modo edición vs lectura
  - `tempRoles`: array - roles temporales durante edición

#### Funciones Principales

##### handleRoleChange(memberId, newRole)
- **Líneas**: 63-69
- **Función**: Cambia rol y resetea permisos
- **Nota**: Al cambiar a admin, todos los permisos quedan false

##### handlePermissionChange(memberId, permission)
- **Líneas**: 71-85
- **Función**: Toggle individual de permisos
- **Parámetro**: 'canEditTeam' | 'canAddMembers' | 'canAssignPermissions'

##### handleSaveRoles()
- **Líneas**: 87-108
- **Función**: Valida y guarda roles
- **Validaciones**:
  - Admins deben tener mínimo 1 permiso
  - Alerta si falta permiso
  - Llama API PUT /member-roles
- **Cierre**: Cierra modal y recarga equipos

#### Interfaz de Usuario

##### Botón para abrir modal
- **Líneas**: 168-181
- **Elemento**: IconButton con emoji 👥
- **Color**: Azul (primary)
- **Visibilidad**: Siempre visible si hay miembros

##### Botón "Editar roles"
- **Líneas**: 207-219
- **Visibilidad**: Solo si isSuperAdmin === true
- **Acción**: Activa editingRoles y copia memberRoles

##### Modal de miembros (Dialog)
- **Líneas**: 184-458
- **Contenido**: Lista de miembros con avatares
- **Titulo**: "Miembros de {teamName}"

##### Selector de rol (Select)
- **Líneas**: 309-326
- **Opciones**: 
  - Superadministrador (deshabilitado si es creador)
  - Administrador
  - Usuario
- **Visible**: Solo en editingRoles === true

##### Checkboxes de permisos
- **Líneas**: 328-370
- **Visible**: Solo cuando rol === 'admin'
- **Opciones**:
  1. Editar equipo
  2. Agregar/Remover miembros
  3. Asignar permisos a otros
- **Etiqueta**: "Permisos (mínimo 1):"

##### Display de permisos (lectura)
- **Líneas**: 372-395
- **Visible**: Cuando editingRoles === false
- **Muestra**: 
  - Rol en verde
  - Lista de permisos como bullets (•)

#### Props del Componente
```jsx
members: Array          // Lista de miembros
teamName: String        // Nombre del equipo
memberRoles: Array      // Roles actuales
isSuperAdmin: boolean   // Es superadmin?
canAssignPermissions: boolean  // Puede asignar?
teamId: String         // ID del equipo
onRolesUpdate: Function // Callback al guardar
```

---

## 📍 Flujo Completo de Datos

### Creación de Equipo
```
1. Frontend: handleCreateTeam()
2. POST /api/teams (memberRoles con superadmin)
3. Backend: Crea Team con memberRoles[]
4. Frontend: Recibe equipo con memberRoles
5. Props: isSuperAdmin={true} para creador
```

### Edición de Roles
```
1. Frontend: Click en botón 👥
2. Modal abre: openMembersModal=true
3. Click en "Editar roles": editingRoles=true
4. Cambios: handleRoleChange/handlePermissionChange
5. Click "Guardar": handleSaveRoles
6. PUT /api/teams/:id/member-roles
7. Backend: Valida y actualiza
8. Frontend: Recarga equipos
9. Cambios visibles inmediatamente
```

### Restricción de Acciones
```
1. Sistema chequea canEditTeam/canAddMembers/canAssignPermissions
2. En Frontend: Muestra/oculta botones según permisos
3. En Backend: Rechaza cambios no autorizados (403)
4. Doble validación para seguridad
```

---

## ✅ Checklist de Implementación

### Backend
- ✅ Schema Team.js actualizado con memberRoles
- ✅ POST crea superadmin para creador
- ✅ PUT /member-roles con validaciones
- ✅ PUT /:id chequea canEditTeam y canAddMembers
- ✅ DELETE chequea solo superadmin
- ✅ Fallback para equipos sin memberRoles

### Frontend
- ✅ getUserRoleInTeam() retorna rol correcto
- ✅ getUserPermissionsInTeam() retorna permisos correctos
- ✅ canEditTeam() funciona
- ✅ canDeleteTeam() funciona
- ✅ canAddMembers() funciona
- ✅ canAssignPermissions() funciona
- ✅ handleRoleChange() funciona
- ✅ handlePermissionChange() funciona
- ✅ handleSaveRoles() valida y guarda
- ✅ Modal se abre con botón 👥
- ✅ Botón "Editar roles" solo para superadmin
- ✅ Checkboxes solo aparecen para admin
- ✅ Validación mínimo 1 permiso para admin
- ✅ Display de permisos en lectura
- ✅ Sin errores de compilación
- ✅ Interfaz responsive y funcional

---

## 🧪 Cómo Probar Cada Funcionalidad

### Test 1: Crear equipo
1. Ir a Equipos → Crear
2. Llenar datos y seleccionar miembros
3. Verificar que creador tiene role='superadmin'

### Test 2: Abrir modal
1. En tabla de equipos, buscar columna Miembros
2. Click en botón 👥 (azul)
3. Modal abre mostrando lista de miembros

### Test 3: Editar roles (como superadmin)
1. En modal, click en "Editar roles"
2. Cambiar rol de usuario a "Administrador"
3. Verificar que aparecen 3 checkboxes de permisos

### Test 4: Validación de admin sin permisos
1. Cambiar a Admin
2. No marcar ningún checkbox
3. Click Guardar → Error: "Los admins deben tener..."

### Test 5: Guardar cambios
1. Cambiar a Admin y marcar 1+ checkbox
2. Click Guardar → "✅ Roles actualizados"
3. Recargar página → Cambios persisten

### Test 6: Verificar permisos en acción
1. Admin con canEditTeam=true → Puede editar
2. Admin con canEditTeam=false → Botón editar desaparece
3. Admin con canAddMembers=true → Puede agregar
4. Visor → No puede hacer nada (sin botones)

---

## 📋 Requisitos Cumplidos

✅ **Superadmin (creador)**
- Tiene todos los permisos
- Solo él puede cambiar roles
- Solo él puede eliminar equipo
- Rol no puede cambiar

✅ **Admin (con permisos selectivos)**
- 1-3 permisos elegibles
- Mínimo 1 permiso obligatorio
- Puede editar, agregar miembros, asignar permisos (según permisos)
- No puede eliminar equipo

✅ **Visor (lectura)**
- Solo ve el equipo
- No puede hacer nada
- Rol más restrictivo

✅ **Modal con checkboxes**
- Interfaz clara y intuitiva
- Checkboxes solo para admin
- Validación antes de guardar

✅ **Compatibilidad**
- Equipos antiguos siguen funcionando
- Creador automáticamente superadmin
- Miembros automáticamente visor

---

## 🐛 Debugging

Si algo no funciona:

1. **Modal no abre**: Verifica que TeamMembersDisplay recibe `members`
2. **Botón "Editar roles" no aparece**: Verifica `isSuperAdmin={true}`
3. **Checkboxes no aparecen**: Verifica que rol es 'admin'
4. **Error "mínimo 1 permiso"**: Marca al menos 1 checkbox
5. **Permisos no se aplican**: Recarga página (fetch trae datos nuevos)
6. **Backend rechaza cambios**: Verifica headers 'x-user-id'

---

**Documentación Generada**: 31 de Diciembre de 2025
**Sistema**: Phase 2 - Permisos Granulares
**Estado**: ✅ 100% Funcional y Documentado
