# Guía de Manejo de Errores - TaskList

## Descripción
Este documento establece el patrón estándar para el manejo de errores en toda la aplicación. Todos los apartados del aplicativo deben seguir este patrón.

---

## Patrón General

### 1. **Importar la función de alerta**
```jsx
import { alertSuccess, alertError } from '../utils/alert';
```

### 2. **Estructura básica de un fetch con manejo de errores**

```jsx
const handleFunctionName = async () => {
  setLoading(true);
  try {
    // Hacer la petición
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/endpoint`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id,
        },
        body: JSON.stringify(data),
      }
    );

    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      // Obtener el mensaje de error del servidor
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error || 'Error desconocido al realizar la acción';
      
      // Mostrar alerta de error con emoji
      alertError(`❌ Error: ${errorMsg}`);
      return;
    }

    // Procesar la respuesta exitosa
    const data = await response.json();
    
    // Mostrar alerta de éxito con emoji
    alertSuccess('✅ Acción realizada exitosamente');
    
    // Realizar acciones adicionales (actualizar estado, navegar, etc.)
    
  } catch (error) {
    console.error('Error:', error);
    
    // Mostrar alerta de error con mensaje específico o genérico
    alertError(`❌ Error: ${error.message || 'No se pudo realizar la acción'}`);
  } finally {
    setLoading(false);
  }
};
```

---

## Reglas Importantes

### ✅ **SIEMPRE hacer esto:**

1. **Mostrar alertas detalladas**: Incluir el mensaje de error específico del servidor cuando esté disponible
   ```jsx
   const errorData = await response.json().catch(() => ({}));
   const errorMsg = errorData.error || 'Error desconocido';
   alertError(`❌ Error: ${errorMsg}`);
   ```

2. **Usar emojis en las alertas**: 
   - `❌` para errores
   - `✅` para éxito
   ```jsx
   alertError(`❌ Error: ${errorMsg}`);
   alertSuccess('✅ Acción completada correctamente');
   ```

3. **Manejar errores de JSON parsing**:
   ```jsx
   const errorData = await response.json().catch(() => ({}));
   ```

4. **Verificar `response.ok`**: Siempre verificar si la respuesta fue exitosa
   ```jsx
   if (!response.ok) {
     // Mostrar error y retornar
     alertError(`❌ Error: ${errorMsg}`);
     return;
   }
   ```

5. **Usar `finally`**: Para limpiar el estado de loading siempre
   ```jsx
   finally {
     setLoading(false);
   }
   ```

### ❌ **NUNCA hacer esto:**

1. **No ignorar errores silenciosamente**:
   ```jsx
   // ❌ MALO
   try {
     const response = await fetch(...);
     if (!response.ok) throw new Error('...');
   } catch (error) {
     console.error('Error:', error); // Solo loguear sin mostrar alerta
   }
   ```

2. **No usar mensajes de error genéricos sin contexto**:
   ```jsx
   // ❌ MALO
   alertError('Error');
   ```

3. **No olvidar setLoading(false)**:
   ```jsx
   // ❌ MALO
   catch (error) {
     alertError(error.message);
     // Se olvida de setLoading(false)
   }
   ```

---

## Ejemplos Implementados

### Profile.jsx
- ✅ Actualizar perfil con validaciones y manejo de errores
- ✅ Alertas con mensajes específicos del servidor

### Teams.jsx
- ✅ Cargar equipos con alerta de error si falla
- ✅ Crear/editar equipo con validación y manejo de errores
- ✅ Eliminar equipo con alerta de error específica

### CreateTask.jsx
- ✅ Crear tarea con validación de campos
- ✅ Manejo de errores en la petición POST
- ✅ Cargar equipos con manejo de errores

### Tasks.jsx
- ✅ Listar tareas con alerta de error si falla la carga
- ✅ Crear/editar/eliminar tareas con manejo de errores
- ✅ Marcar tareas como completadas con alerta de error

### Login.jsx
- ✅ Autenticación con Google con manejo de errores detallado
- ✅ Alertas sobre problemas de servidor/conexión

---

## Validación de Formularios

### Patrón de validación en tiempo real:

```jsx
const validateField = (name, value) => {
  if (name === 'fieldName') {
    if (!value.trim()) return 'El campo es requerido';
    if (value.length < 3) return 'Mínimo 3 caracteres';
    if (value.length > 50) return 'Máximo 50 caracteres';
  }
  return '';
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  // Actualizar estado
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  // Validar en tiempo real
  if (name === 'fieldName') {
    const error = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }
};
```

### Al guardar, validar todos los campos:

```jsx
const handleSave = async () => {
  // Validar todos los campos
  const errors = {
    field1: validateField1(formData.field1),
    field2: validateField2(formData.field2),
  };

  setFieldErrors(errors);

  // Si hay errores, mostrar alerta y retornar
  if (errors.field1 || errors.field2) {
    alertError('❌ Por favor, corrige los errores antes de guardar');
    return;
  }

  // Continuar con el guardado...
};
```

---

## Para Futuras Funcionalidades

Cuando crees nuevas funcionalidades que hagan peticiones HTTP:

1. **Siempre** usar el patrón de manejo de errores mostrado arriba
2. **Siempre** mostrar alertas de error cuando algo falla
3. **Siempre** incluir el mensaje específico del servidor en la alerta
4. **Siempre** validar campos del formulario antes de enviar
5. **Siempre** usar emojis en las alertas para mejor UX
6. **Siempre** usar `finally` para limpiar el estado de loading

---

## Resumen de Emojis

| Emoji | Uso |
|-------|-----|
| ✅ | Éxito o acción completada |
| ❌ | Error o fallo |
| 📋 | Información, listas vacías |
| 📝 | Tareas o formularios |
| 👥 | Equipos o usuarios |
| 💾 | Guardar datos |
| 🔍 | Búsqueda o validación |
| ⚠️ | Advertencia |

---

## Funciones de Alerta Disponibles

### En `src/utils/alert.js`:

```jsx
// Para mostrar éxito
alertSuccess(text, title = '¡Éxito!')

// Para mostrar error
alertError(text, title = 'Ups...')

// Para mostrar alerta personalizada
showAlert({ 
  title, 
  text, 
  icon, 
  timer, 
  showConfirmButton,
  ...rest 
})
```

---

**Última actualización:** 27 de Diciembre de 2025
**Versión:** 1.0
