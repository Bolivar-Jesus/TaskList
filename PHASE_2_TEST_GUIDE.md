# Pruebas del Sistema de Roles y Permisos - PHASE 2

## Guía de Prueba Manual

### Escenario 1: Crear un equipo con miembros y roles
**Pasos:**
1. Inicia sesión como Usuario A (creador)
2. Ve a la página Teams
3. Clic en "Crear equipo"
4. Llena formulario:
   - Nombre: "Equipo Test Roles"
   - Descripción: "Testing roles"
   - Miembros: Usuario B, Usuario C
5. Guarda el equipo

**Resultado Esperado:**
- Equipo creado exitosamente
- Usuario A tiene rol 'admin'
- Usuario B y Usuario C tienen rol 'viewer'

---

### Escenario 2: Ver lista de miembros con roles (Usuario A)
**Pasos:**
1. Como Usuario A, en la página Teams
2. Clic en el botón "+X" en la columna Miembros del equipo creado
3. Se abre modal con lista de miembros

**Resultado Esperado:**
- Modal muestra:
  - Usuario A - Administrador (verde)
  - Usuario B - Visor (verde)
  - Usuario C - Visor (verde)
- Aparece botón "Editar roles" en esquina superior derecha

---

### Escenario 3: Editar roles (como creador)
**Pasos:**
1. Como Usuario A en modal de miembros
2. Clic en "Editar roles"
3. Cambia rol de Usuario B a "Editor"
4. Mantén Usuario C como "Visor"
5. Clic en "Guardar"

**Resultado Esperado:**
- Modal cierra
- Se muestra "✅ Roles actualizados correctamente"
- Al volver a abrir modal:
  - Usuario B ahora es "Editor"
  - Usuario C sigue siendo "Visor"

---

### Escenario 4: No puede editar otro sin permisos (Usuario B)
**Pasos:**
1. Cierra sesión de Usuario A
2. Inicia sesión como Usuario B
3. Ve a la página Teams
4. Busca el equipo "Equipo Test Roles" (debe aparecer en "Mis Equipos")
5. Clic en "+X" para ver miembros

**Resultado Esperado:**
- Modal muestra los miembros
- NO aparece botón "Editar roles" (porque Usuario B no es creador)
- Se pueden ver los roles pero no editarlos

---

### Escenario 5: Verificar persistencia de datos
**Pasos:**
1. Como Usuario A, recarga la página
2. Ve a Teams y abre el modal de miembros del equipo

**Resultado Esperado:**
- Los roles editados persisten:
  - Usuario B: Editor
  - Usuario C: Visor
- Los cambios no se perdieron

---

### Escenario 6: Agregar nuevo miembro a equipo existente
**Pasos:**
1. Como Usuario A, edita el equipo
2. Clic en "Agregar miembros"
3. Selecciona Usuario D (nuevo)
4. Guarda

**Resultado Esperado:**
- Usuario D se agrega al equipo
- Usuario D automáticamente obtiene rol 'viewer'
- Al abrir modal de miembros:
  - A: Administrador
  - B: Editor
  - C: Visor
  - D: Visor (nuevo)

---

## Verificaciones Técnicas

### Backend
```javascript
// Verificar que el campo memberRoles existe en la BD
db.teams.findOne({ name: "Equipo Test Roles" })
// Debe tener:
{
  _id: ObjectId,
  name: "Equipo Test Roles",
  members: [idA, idB, idC],
  memberRoles: [
    { userId: idA, role: "admin" },
    { userId: idB, role: "editor" },
    { userId: idC, role: "viewer" }
  ],
  ...
}
```

### Endpoints Testear
```bash
# Crear equipo (POST)
POST /api/teams
Headers: x-user-id: userA_id
Body: {
  name: "Test",
  members: [idB, idC]
}
Response: memberRoles should auto-populate

# Actualizar roles (PUT)
PUT /api/teams/:teamId/member-roles
Headers: x-user-id: userA_id
Body: {
  memberRoles: [
    { userId: idA, role: "admin" },
    { userId: idB, role: "editor" }
  ]
}
Response: 200 OK

# Intento como no-admin (debe fallar)
PUT /api/teams/:teamId/member-roles
Headers: x-user-id: userB_id
Response: 403 Forbidden
```

---

## Checklist de Validación

- [ ] Equipo se crea con memberRoles automáticamente
- [ ] Creador siempre tiene rol 'admin'
- [ ] Otros miembros iniciales tienen rol 'viewer'
- [ ] Solo creador puede ver botón "Editar roles"
- [ ] Cambios de rol se guardan correctamente
- [ ] Nuevos miembros agregados obtienen rol 'viewer'
- [ ] No se puede remover rol 'admin' del creador
- [ ] Los roles persisten después de recargar página
- [ ] Los no-creadores NO pueden editar roles (403 en API)
- [ ] Mensajes de éxito/error aparecen correctamente
