# 📋 Guía Completa - Nueva Tab de Tareas Fusionada

## 🎯 Descripción General

Se ha fusionado la tab "Crear Tarea" con "Mis Tareas" en una sola página llamada "**Tareas**". Ahora todas las operaciones de tareas se realizan en un mismo lugar con un diseño mejorado y moderno.

## 🚀 Cambios Principales

### 1. Nueva Estructura de Navegación
```
Antes:
- Dashboard
- 📝 Crear Tarea
- 📋 Mis Tareas
- 👥 Equipos
- 👤 Mi Perfil

Ahora:
- Dashboard
- 📋 Tareas (TODO: crear/listar/editar/eliminar)
- 👥 Equipos
- 👤 Mi Perfil
```

### 2. Interfaz de Tareas Unificada

#### En la Vista Principal:
- **Lista de Tareas** con opciones de:
  - ✅ Marcar como completada
  - ✏️ Editar
  - 🗑️ Eliminar
- **Botón "Nueva Tarea"** en la esquina superior derecha
- Diseño responsivo: Tabla en desktop, Tarjetas en móvil

#### Al Hacer Click en "Nueva Tarea":
- Se abre un **modal elegante** con el formulario
- Mismo modal para crear como para editar
- Campos organizados en secciones con divisores

### 3. Validaciones Implementadas

#### En Tiempo Real:
- **Título**: 
  - Rojo si tiene menos de 2 caracteres
  - Rojo si excede 20 caracteres
  - Muestra contador: `0/20`
- **Descripción**:
  - Rojo si tiene menos de 5 caracteres
  - Rojo si excede 50 caracteres
  - Muestra contador: `0/50`
- **Prioridad**: 
  - Obligatorio seleccionar
  - Se valida antes de guardar
- **Fecha de Vencimiento**:
  - No permite fechas pasadas
  - No permite fechas mayor a 90 días
  - Campo con restricciones de rango
- **Hora** (Opcional):
  - Validación de formato HH:mm
  - No permite horas pasadas del día actual
  - Sin error si se deja vacío

#### Validaciones de Cambios:
- Al editar, solo permite guardar si hay cambios reales
- Detecta cambios en todos los campos incluyendo equipos asignados

## 📱 Características del Formulario

### Campos Disponibles:

**1. Título (Obligatorio)**
- Mínimo 2 caracteres
- Máximo 20 caracteres
- Ejemplo: "Implementar login"

**2. Descripción (Obligatorio)**
- Mínimo 5 caracteres
- Máximo 50 caracteres
- Multiline
- Ejemplo: "Configurar autenticación con Google"

**3. Prioridad (Obligatorio)**
- 🟢 Baja
- 🟡 Media
- 🟠 Alta
- 🔴 Crítica

**4. Estado (Solo en Edición)**
- ⏱️ Pendiente
- ⏳ En Progreso
- ✅ Completada

**5. Fecha de Vencimiento (Obligatorio)**
- Rango: Hoy hasta 90 días posteriores
- Formato: YYYY-MM-DD
- Campos con restricciones de entrada

**6. Hora (Opcional)**
- Formato: HH:mm (24 horas)
- Ej: 14:30, 09:15
- Validación: No pasada del día actual
- Se muestra junto a la fecha en la tabla

**7. Equipos Asignados (Opcional)**
- Selector modal con búsqueda avanzada
- Selección múltiple
- Visualización de equipos seleccionados con chips
- Opción para quitar equipos directamente

## 🎨 Diseño y UX

### Componentes Visuales:
- **Cards**: Presentación moderna
- **Grid Layout**: Responsivo
- **Chips**: Para prioridades, estados y equipos
- **Emojis**: Indicadores visuales rápidos
- **Dividers**: Separación clara de secciones
- **Icons**: Buttons con iconos descriptivos

### Colores:
- Primario: Verde (de la aplicación)
- Rojo: Errores
- Amarillo: Advertencias
- Verde: Completado

### Responsive:
- **Desktop**: Tabla con todas las columnas
- **Tablet**: Tabla con scroll horizontal
- **Móvil**: Tarjetas stacked

## 🔄 Flujos de Trabajo

### Crear Nueva Tarea:
1. Click en botón "+ Nueva Tarea"
2. Se abre modal vacío
3. Rellenar campos (validación en tiempo real)
4. Click "Crear"
5. Tarea aparece en lista
6. Modal se cierra

### Editar Tarea:
1. Click en botón "Editar" en la tarea
2. Se abre modal con datos pre-llenados
3. Modificar campos necesarios
4. Sistema detecta cambios
5. Botón "Actualizar" habilitado solo si hay cambios
6. Click "Actualizar"
7. Tarea se actualiza
8. Modal se cierra

### Eliminar Tarea:
1. Click en botón "Eliminar"
2. Confirmación: "¿Estás seguro?"
3. Si acepta → Tarea eliminada
4. Si cancela → Se mantiene la tarea

### Marcar como Completada:
1. Click en botón "Completar"
2. Estado cambia a "✅ Completada"
3. Se actualiza en la lista

## 🔄 Integración con Equipos

### Seleccionar Equipos:
1. En el formulario, ir a sección "Equipos Asignados"
2. Click botón "Seleccionar"
3. Se abre modal de equipos
4. Buscar equipos (búsqueda por nombre/descripción)
5. Hacer click en checkboxes para seleccionar
6. Click "Guardar"
7. Los equipos aparecen como chips en el formulario

### Opciones de Equipos:
- Búsqueda en tiempo real
- Selección múltiple
- Ver todos los equipos disponibles
- Deseleccionar haciendo click en el chip con X

## 🎯 Casos de Uso

### Caso 1: Crear tarea para un equipo
```
1. Click "Nueva Tarea"
2. Título: "Revisar código frontend"
3. Descripción: "Hacer code review de los cambios en Auth"
4. Prioridad: Alta
5. Fecha: 15/01/2026
6. Hora: 14:00
7. Equipos: "Desarrollo", "QA"
8. Click "Crear"
```

### Caso 2: Editar prioridad de tarea existente
```
1. En la tabla, click "Editar" en la tarea
2. Cambiar prioridad de Media a Crítica
3. Sistema detecta el cambio
4. Click "Actualizar"
5. La tarea se actualiza
```

### Caso 3: Cambiar fecha de vencimiento
```
1. Click "Editar"
2. Cambiar fecha
3. Cambiar hora si es necesario
4. Validación: Verifica que sea válida
5. Click "Actualizar"
```

## ⚠️ Restricciones y Limitaciones

### Fechas:
- ❌ No puedes seleccionar fechas pasadas
- ❌ No puedes seleccionar más de 90 días en el futuro
- ✅ Puedes seleccionar hoy

### Horas:
- ❌ No puedes seleccionar horas pasadas del día actual
- ✅ Mañana puedes seleccionar cualquier hora
- ✅ Dejar en blanco es permitido

### Caracteres:
- Título: exactamente 2-20
- Descripción: exactamente 5-50

### Permisos:
- ✅ Puedes crear tareas
- ✅ Puedes editar tus propias tareas
- ✅ Puedes eliminar tus propias tareas
- ✅ Puedes ver todas las tareas que creaste

## 🔐 Seguridad

- Las validaciones ocurren en cliente (UX)
- Las validaciones también ocurren en servidor (seguridad)
- Solo el creador puede editar/eliminar
- Headers incluyen verificación de usuario

## 🚀 Próximas Funcionalidades (En Desarrollo)

### Google Calendar
- Cuando crees una tarea, se agrega a tu Google Calendar
- Se sincroniza automáticamente
- Cambios en la tarea actualizan el evento

### Correos Automáticos
- Cuando asignas tareas a equipos, se envía correo a los miembros
- Incluye detalles: título, descripción, vencimiento
- Link directo al panel de tareas

### Historial de Cambios
- Registro de quién modificó qué y cuándo
- Auditoría completa de cambios

### Filtros Avanzados
- Por prioridad
- Por estado
- Por fecha
- Por equipo

## 💡 Tips y Trucos

1. **Guardado Rápido**: La validación en tiempo real te permite saber si hay errores antes de intentar guardar

2. **Contador de Caracteres**: Mira el contador para ver cuántos caracteres falta/sobra

3. **Emojis Rápidos**: Los emojis en prioridades y estados hacen fácil identificar a primera vista

4. **Búsqueda de Equipos**: Puedes buscar equipos por nombre parcial en el modal

5. **Edición Segura**: Solo puedes guardar si hay cambios reales, esto evita actualizaciones innecesarias

## 🐛 Reporte de Problemas

Si encuentras algún problema:
1. Anota los pasos para reproducir
2. Toma una captura de pantalla
3. Incluye el navegador y dispositivo
4. Comparte con el equipo de desarrollo

## 📞 Soporte

Para preguntas o problemas, contacta al equipo de desarrollo.

---

**Versión**: 1.0 (8 de Enero de 2026)
**Estado**: ✅ Producción
