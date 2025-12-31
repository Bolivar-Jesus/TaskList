# Guía del Sistema de Permisos - Phase 2

## Descripción General

El sistema de permisos ha sido completamente implementado con tres niveles de roles:

1. **Superadministrador** - El creador del equipo
2. **Administrador** - Con permisos selectivos
3. **Visor** - Solo lectura

---

## Cómo Usar

### Paso 1: Crear un Equipo
1. Ve a la sección de "Equipos"
2. Haz clic en "Crear Equipo"
3. Rellena los datos (nombre, descripción, imagen)
4. Selecciona al menos un miembro
5. El creador automáticamente se convierte en **Superadministrador**
6. Otros miembros se asignan como **Visor** por defecto

### Paso 2: Gestionar Roles y Permisos
1. En la tabla de equipos, busca la columna "Miembros"
2. Haz clic en el botón **👥** (azul) para abrir el modal de miembros
3. Si eres el **Superadministrador**, verás un botón **"Editar roles"**
4. Haz clic en "Editar roles"

### Paso 3: Asignar Roles
En el modal de edición:

#### Para cambiar a Superadministrador
- No puedes cambiar el rol del creador (está deshabilitado)
- Otros miembros pueden cambiar a Superadministrador (tendrá todos los permisos)

#### Para cambiar a Administrador
- Selecciona "Administrador" del dropdown
- Aparecerán **3 checkboxes** con los permisos disponibles:
  - ☑ **Editar equipo** (cambiar foto, nombre, descripción)
  - ☑ **Agregar/Remover miembros** (gestionar la lista de miembros)
  - ☑ **Asignar permisos a otros** (cambiar roles de otros miembros)
- **IMPORTANTE**: Un administrador DEBE tener al menos 1 permiso (mínimo obligatorio)
- Si intentas guardar sin permisos, verás un error: "Los admins deben tener al menos un permiso"

#### Para cambiar a Visor
- El visor no tiene permisos, solo puede ver el equipo
- Es el rol más restrictivo

### Paso 4: Guardar los Cambios
1. Después de asignar roles y permisos, haz clic en **"Guardar"**
2. El sistema validará:
   - El creador sigue siendo Superadministrador
   - Los Administradores tienen al menos 1 permiso
   - Todos los datos sean válidos
3. Si todo es correcto, verás: "✅ Roles actualizados correctamente"
4. Si hay error, verás el mensaje específico del problema

### Paso 5: Verificar Permisos en Acción
Una vez guardados los roles, los permisos se aplican inmediatamente:

- Si un **Admin** tiene permiso "Editar equipo": puede cambiar nombre/descripción/foto
- Si un **Admin** tiene permiso "Agregar miembros": puede ver el botón "Miembros"
- Si un **Admin** tiene permiso "Asignar permisos": puede ver el botón "Editar roles"
- Si es **Visor**: solo ve el equipo, no puede hacer nada
- Si es **Superadmin**: puede hacer todo (edit, add members, assign permissions, delete)

---

## Roles y Permisos Detallado

### 🔴 Superadministrador
- ✅ Editar equipo (foto, nombre, descripción)
- ✅ Agregar/Remover miembros
- ✅ Asignar permisos a otros miembros
- ✅ Eliminar el equipo
- **Nota**: Solo el creador puede ser superadmin, no se puede cambiar

### 🟡 Administrador
**Debe tener MÍNIMO 1 permiso de estos:**
- ✅ Editar equipo (foto, nombre, descripción) - OPCIONAL
- ✅ Agregar/Remover miembros - OPCIONAL
- ✅ Asignar permisos a otros - OPCIONAL

**Ejemplos válidos:**
- Solo editar: ✅ Admin con 1 permiso
- Solo agregar miembros: ✅ Admin con 1 permiso
- Solo asignar permisos: ✅ Admin con 1 permiso
- Editar + agregar: ✅ Admin con 2 permisos
- Editar + agregar + asignar: ✅ Admin con 3 permisos (casi Superadmin)

**Ejemplo INVÁLIDO:**
- Sin permisos: ❌ NO PERMITIDO - debe tener al menos 1

### 🟢 Visor
- ✅ Ver el equipo
- ✅ Ver miembros
- ✅ Ver descripción
- ❌ NO puede editar
- ❌ NO puede agregar miembros
- ❌ NO puede asignar permisos
- ❌ NO puede eliminar

---

## Estructura en Base de Datos

Cada equipo tiene un array `memberRoles` con esta estructura:

```json
{
  "memberRoles": [
    {
      "userId": "64abc123def456",
      "role": "superadmin",
      "permissions": {
        "canEditTeam": true,
        "canAddMembers": true,
        "canAssignPermissions": true
      }
    },
    {
      "userId": "64xyz789abc123",
      "role": "admin",
      "permissions": {
        "canEditTeam": true,
        "canAddMembers": false,
        "canAssignPermissions": false
      }
    },
    {
      "userId": "64pqr456uvw789",
      "role": "viewer",
      "permissions": {
        "canEditTeam": false,
        "canAddMembers": false,
        "canAssignPermissions": false
      }
    }
  ]
}
```

---

## Compatibilidad con Equipos Antiguos

Si tienes equipos creados ANTES de esta actualización:
- ✅ El creador automáticamente se considera Superadministrador
- ✅ Otros miembros se consideran Visor
- ✅ Puedes empezar a asignar roles nuevos sin problemas
- ✅ No se pierden datos, es totalmente compatible

---

## Validaciones Implementadas

### Frontend (Antes de enviar)
- ✅ Valida que Admin tenga mínimo 1 permiso
- ✅ Valida que el creador siga siendo Superadmin
- ✅ Muestra mensajes de error si falta algo

### Backend (Servidor)
- ✅ Valida que solo el Superadmin pueda cambiar roles
- ✅ Valida que el creador no pierda su rol
- ✅ Valida que Admin tenga mínimo 1 permiso
- ✅ Rechaza cambios inválidos con error 403 o 400

---

## Errores Comunes

### ❌ "Los admins deben tener al menos un permiso"
**Causa**: Intentaste guardar un Admin sin marcar ningún checkbox
**Solución**: Marca al menos UNO de los 3 checkboxes de permisos

### ❌ "El creador debe mantener el rol de superadministrador"
**Causa**: Intentaste cambiar el rol del creador (que no debería ser posible)
**Solución**: El creador no se puede cambiar, es siempre Superadmin

### ❌ "Solo el superadministrador del equipo puede cambiar los roles"
**Causa**: No eres el creador del equipo
**Solución**: Solo el Superadmin puede asignar roles

---

## Flujos de Prueba Recomendados

### Prueba 1: Crear equipo y asignar roles básicos
1. Crea un equipo con 3 miembros
2. Abre el modal de miembros (botón 👥)
3. Haz clic en "Editar roles"
4. Cambia el segundo miembro a Admin con permiso "Editar equipo"
5. Cambia el tercer miembro a Visor
6. Guarda los cambios

### Prueba 2: Verificar permisos del Admin
1. Intenta editar el equipo como Admin (debe funcionar si tiene ese permiso)
2. Intenta agregar miembros como Admin (debe fallar si no tiene ese permiso)
3. Intenta asignar permisos (debe fallar si no tiene ese permiso)

### Prueba 3: Validación de Admin sin permisos
1. Abre el modal de edición
2. Cambia un miembro a Admin
3. NO marques ningún checkbox
4. Intenta guardar
5. Debe mostrar error: "Los admins deben tener al menos un permiso"

### Prueba 4: Admin con múltiples permisos
1. Crea un Admin con los 3 permisos activados
2. Verifica que puede editar, agregar miembros y asignar permisos
3. Luego quita un permiso y guarda
4. Verifica que la acción correspondiente ahora falla

---

## Archivos Modificados

- `/backend/models/Team.js` - Schema actualizado con memberRoles
- `/backend/routes/teams.js` - Endpoints actualizados con validaciones
- `/frontend/src/pages/Teams.jsx` - Funciones de permisos agregadas
- `/frontend/src/components/TeamMembersDisplay.jsx` - Modal con checkboxes de permisos

---

## Estado Actual (✅ COMPLETADO)

- ✅ Backend: Schema y validaciones implementadas
- ✅ Backend: Endpoints con verificación de permisos
- ✅ Frontend: Funciones de cálculo de permisos
- ✅ Frontend: Modal con interfaz de edición de roles
- ✅ Frontend: Checkboxes de permisos selectivos
- ✅ Frontend: Validación de mínimo 1 permiso para Admin
- ✅ UI: Botón 👥 para abrir modal
- ✅ UI: Botón "Editar roles" solo para Superadmin
- ✅ Compatibilidad: Soporte para equipos antiguos sin memberRoles

---

**Versión**: Phase 2 - Sistema de Permisos Granulares
**Fecha**: 31 de Diciembre de 2025
**Estado**: ✅ 100% Funcional
