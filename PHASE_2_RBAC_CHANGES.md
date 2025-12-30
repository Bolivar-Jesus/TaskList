# PHASE 2: Control de Acceso Basado en Roles - Resumen de Cambios

## Resumen Ejecutivo

Se ha completado la implementación de **control de acceso basado en roles (RBAC)** en el sistema de equipos. Los usuarios ahora tienen permisos diferenciados según su rol en cada equipo.

---

## 🔄 Cambios en Backend

### `/backend/routes/teams.js`

#### 1. **PUT `/api/teams/:teamId` - Validación de Rol (Antes: Solo creador)**

**Antes:**
```javascript
if (team.createdBy.toString() !== userId) {
  return res.status(403).json({ error: 'No tienes permiso para editar este equipo' });
}
```

**Ahora:**
```javascript
const userMemberRole = team.memberRoles?.find(mr => mr.userId.toString() === userId);
const userRole = userMemberRole?.role;

// Solo admin y editor pueden editar
if (!userRole || !['admin', 'editor'].includes(userRole)) {
  return res.status(403).json({ error: 'No tienes permiso para editar este equipo' });
}
```

**Impacto:** Usuarios con rol 'editor' ahora pueden editar equipos

---

#### 2. **DELETE `/api/teams/:teamId` - Validación de Rol (Antes: Solo creador)**

**Antes:**
```javascript
if (team.createdBy.toString() !== userId) {
  return res.status(403).json({ error: 'No tienes permiso para eliminar este equipo' });
}
```

**Ahora:**
```javascript
const userMemberRole = team.memberRoles?.find(mr => mr.userId.toString() === userId);
const userRole = userMemberRole?.role;

if (userRole !== 'admin') {
  return res.status(403).json({ error: 'Solo el administrador del equipo puede eliminarlo' });
}
```

**Impacto:** Solo users con rol 'admin' pueden eliminar (editors NO pueden)

---

## 🎨 Cambios en Frontend

### `/frontend/src/pages/Teams.jsx`

#### 1. **Nuevas funciones de validación de permisos**

```javascript
// Obtiene el rol del usuario actual en un equipo
const getUserRoleInTeam = (team) => {
  if (!team.memberRoles) return null;
  const roleObj = team.memberRoles.find(mr => 
    (typeof mr.userId === 'string' ? mr.userId : mr.userId._id) === user?.id
  );
  return roleObj?.role || null;
};

// Valida si el usuario puede editar
const canEditTeam = (team) => {
  const role = getUserRoleInTeam(team);
  return role === 'admin' || role === 'editor';
};

// Valida si el usuario puede eliminar
const canDeleteTeam = (team) => {
  const role = getUserRoleInTeam(team);
  return role === 'admin';
};

// Valida si el usuario puede agregar miembros
const canAddMembers = (team) => {
  const role = getUserRoleInTeam(team);
  return role === 'admin' || role === 'editor';
};
```

#### 2. **Botones condicionales en tabla de escritorio**

**Antes:**
```jsx
{isTeamCreator(team) ? (
  <>
    <Button>Miembros</Button>
    <Button>Editar</Button>
    <Button>Eliminar</Button>
  </>
) : (
  <Typography>Solo el creador puede editar</Typography>
)}
```

**Ahora:**
```jsx
{canEditTeam(team) || canDeleteTeam(team) ? (
  <>
    {canAddMembers(team) && <Button>Miembros</Button>}
    {canEditTeam(team) && <Button>Editar</Button>}
    {canDeleteTeam(team) && <Button>Eliminar</Button>}
  </>
) : (
  <Typography>Solo puedes ver este equipo</Typography>
)}
```

**Impacto:** 
- Admin: Ve todos los botones
- Editor: Ve Miembros y Editar (NO Eliminar)
- Viewer: NO ve botones de acción

#### 3. **Botones condicionales en tarjetas móviles**

**Antes:** Todos los botones para creador, nada para otros

**Ahora:** Botones mostrados según permisos con `flexWrap: 'wrap'` para mejor layout

```jsx
{canAddMembers(team) && <Button>Miembros</Button>}
{canEditTeam(team) && <Button>Editar</Button>}
{canDeleteTeam(team) && <Button>Eliminar</Button>}
```

---

## 🔐 Matriz de Cambios de Permisos

### Antes (PHASE 1)
| Acción | Creator | No Creator |
|--------|---------|-----------|
| Editar | ✅ | ❌ |
| Eliminar | ✅ | ❌ |
| Agregar Miembros | ✅ | ❌ |

### Ahora (PHASE 2)
| Acción | Admin | Editor | Viewer |
|--------|-------|--------|--------|
| Ver equipo | ✅ | ✅ | ✅ |
| Editar | ✅ | ✅ | ❌ |
| Eliminar | ✅ | ❌ | ❌ |
| Agregar Miembros | ✅ | ✅ | ❌ |
| Cambiar Roles | ✅ | ❌ | ❌ |

---

## 🧪 Escenarios de Prueba

### Escenario 1: Admin edita equipo ✅
```
1. Usuario A (admin) crea equipo
2. Usuario A edita nombre del equipo
3. PUT /api/teams/:id
4. Backend verifica: userRole === 'admin' ✓
5. Edición permitida
```

### Escenario 2: Editor edita equipo ✅
```
1. Usuario A (admin) cambia B a editor
2. Usuario B edita descripción
3. PUT /api/teams/:id
4. Backend verifica: userRole === 'editor' ✓
5. Edición permitida
```

### Escenario 3: Editor intenta eliminar ❌
```
1. Usuario B (editor) hace clic en "Eliminar"
2. Botón no está visible (oculto por canDeleteTeam)
3. Si bypasea frontend: DELETE /api/teams/:id
4. Backend verifica: userRole === 'admin' ✗
5. 403 Forbidden retornado
```

### Escenario 4: Viewer intenta editar ❌
```
1. Usuario C (viewer) intenta editar
2. Botones no están visibles
3. Si bypasea frontend: PUT /api/teams/:id
4. Backend verifica: !['admin', 'editor'].includes(userRole)
5. 403 Forbidden retornado
```

---

## 🔍 Detalles Técnicos

### Flujo de Validación (Dual Layer)

```
[Usuario intenta acción]
  ↓
[Frontend chequea permiso]
  ├─ No permitido → Botón oculto (UX)
  ├─ Permitido → Botón visible
  ↓
[Usuario hace clic]
  ↓
[API call enviado]
  ↓
[Backend chequea permiso]
  ├─ No permitido → 403 Forbidden (Seguridad)
  ├─ Permitido → Acción ejecutada
  ↓
[Response retornado]
  ↓
[Frontend actualiza estado]
```

### Estructura de memberRoles en DB

```javascript
{
  _id: ObjectId("team123"),
  name: "Proyecto A",
  members: [ObjectId("userA"), ObjectId("userB"), ObjectId("userC")],
  memberRoles: [
    { userId: ObjectId("userA"), role: "admin" },
    { userId: ObjectId("userB"), role: "editor" },
    { userId: ObjectId("userC"), role: "viewer" }
  ],
  // ... otros campos
}
```

---

## 📊 Impacto en UX

### Tabla de Escritorio

**Admin:**
```
[Miembros] [Editar] [Eliminar]
```

**Editor:**
```
[Miembros] [Editar]
```

**Viewer:**
```
Solo puedes ver este equipo
```

### Tarjetas Móviles

**Admin:**
```
[Miembros] [Editar] [Eliminar]
```

**Editor:**
```
[Miembros] [Editar]
```

**Viewer:**
```
(Sin botones)
```

---

## 🛡️ Validaciones de Seguridad

### Backend Validations
- ✅ `PUT /api/teams/:id` requiere role 'admin' o 'editor'
- ✅ `DELETE /api/teams/:id` requiere role 'admin'
- ✅ Header `x-user-id` siempre validado
- ✅ memberRoles array verificado antes de acceso

### Frontend Validations
- ✅ `canEditTeam()` verifica rol antes de mostrar botón
- ✅ `canDeleteTeam()` verifica rol antes de mostrar botón
- ✅ `canAddMembers()` verifica rol antes de mostrar botón
- ✅ Mensajes de error claros si permiso denegado

---

## 🚀 Performance

**Sin cambios significativos:**
- GET requests igual (sin nuevos queries)
- PUT requests igual (valida memberRoles que ya existe)
- DELETE requests igual (valida memberRoles que ya existe)

**Optimizaciones posibles en futuro:**
- Cachear rol del usuario en contexto global
- Usar índices en memberRoles para queries más rápidos

---

## 🔄 Rollback (Si es necesario)

Para revertir a PHASE 1 (solo creador):

```javascript
// Backend teams.js PUT
if (team.createdBy.toString() !== userId) {
  return res.status(403).json({ error: 'No tienes permiso para editar este equipo' });
}

// Backend teams.js DELETE
if (team.createdBy.toString() !== userId) {
  return res.status(403).json({ error: 'No tienes permiso para eliminar este equipo' });
}

// Frontend Teams.jsx
{isTeamCreator(team) ? (
  <> ... botones ... </>
) : (
  <Typography>Solo el creador puede editar</Typography>
)}
```

---

## 📚 Referencias

- Documentación PHASE 2: `PHASE_2_COMPLETE.md`
- Guía de pruebas: `PHASE_2_TEST_GUIDE.md`
- Modelo de datos: `/backend/models/Team.js`
- Rutas API: `/backend/routes/teams.js`
- Páginas: `/frontend/src/pages/Teams.jsx`

---

**Estado:** ✅ Implementado y Testeado  
**Fecha:** 30 de Diciembre de 2025  
**Próximo Paso:** PHASE 3 (Auditoría/Logs - Opcional)
