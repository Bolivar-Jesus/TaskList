# Estándares de Validación y Manejo de Errores

Este documento describe los estándares que TODOS los componentes y futuras páginas deben seguir para validación de formularios y manejo de errores.

## 1. Validación de Cambios en Edición

Cuando un componente permite **editar** datos existentes, DEBE validar que haya cambios reales antes de permitir guardar.

### Patrón a Seguir:

```javascript
// 1. Crear función para detectar cambios
const hasRealChanges = () => {
  if (!editingItem) return true; // Crear nuevo = siempre permitir
  
  const field1Changed = formData.field1 !== editingItem.field1;
  const field2Changed = formData.field2 !== editingItem.field2;
  // ... comparar más campos
  
  // Para arrays (miembros, items, etc):
  const currentIds = new Set(formData.array.map(item => item._id));
  const originalIds = new Set(editingItem.array.map(item => item._id));
  const arrayChanged = currentIds.size !== originalIds.size || 
                       Array.from(currentIds).some(id => !originalIds.has(id));
  
  return field1Changed || field2Changed || arrayChanged;
};

// 2. Incluir en validación de formulario
const isFormValid = () => {
  const basicValid = /* validaciones normales */;
  
  if (editingItem) {
    return basicValid && hasRealChanges();
  }
  return basicValid;
};

// 3. En handleSave, verificar cambios antes de enviar
const handleSave = async () => {
  // Validaciones
  if (editingItem && !hasRealChanges()) {
    alertError('❌ No hay cambios para guardar');
    return;
  }
  // ... rest del código
};

// 4. Deshabilitar botón si no hay cambios
<Button disabled={loading || !isFormValid()}>Guardar</Button>
```

## 2. Alertas de Error por Campo

TODOS los errores deben mostrar alertas específicas indicando exactamente qué está mal.

### Patrón a Seguir:

```javascript
const handleSave = async () => {
  // Validar cada campo ANTES de intentar guardar
  
  // Nombre
  const nameError = validateName(formData.name);
  if (nameError) {
    alertError(`❌ Nombre: ${nameError}`);
    return;
  }

  // Descripción
  const descError = validateDescription(formData.description);
  if (descError) {
    alertError(`❌ Descripción: ${descError}`);
    return;
  }

  // Array requerido
  if (formData.items.length === 0) {
    alertError('❌ Debes agregar al menos un item');
    return;
  }

  // ... más validaciones

  // Intentar guardar
  try {
    const response = await fetch(url, {
      method: editingItem ? 'PUT' : 'POST',
      // ... headers y body
    });

    if (!response.ok) {
      const errorData = await response.json();
      alertError(`❌ Error: ${errorData.error || 'Error desconocido'}`);
      return;
    }

    alertSuccess(editingItem ? '✅ Actualizado correctamente' : '✅ Creado exitosamente');
    handleClose();
    fetchData();
  } catch (error) {
    // Errores específicos
    if (error.message.includes('413')) {
      alertError('❌ El archivo es demasiado grande. Máximo 5MB');
    } else if (error.message.includes('payload')) {
      alertError('❌ Los datos son demasiado grandes');
    } else {
      alertError(`❌ Error: ${error.message}`);
    }
  }
};
```

## 3. Usar Funciones Helper

Para no repetir código, usa las funciones en `validationHelpers.js`:

```javascript
import {
  hasChanges,
  hasArrayChanges,
  validateStringLength,
  validateEmail,
  validateFile,
  getErrorMessage,
} from '../utils/validationHelpers';

// Detectar cambios en campos simples
const nameChanged = hasChanges(editingItem, formData, ['name', 'email']);

// Detectar cambios en arrays
const membersChanged = hasArrayChanges(editingItem.members, formData.members, '_id');

// Validar strings
const error = validateStringLength(formData.name, 2, 30, 'Nombre', true);

// Validar email
const emailError = validateEmail(formData.email);

// Validar archivos
const fileError = validateFile(file, 5, ['image/*']);

// Obtener mensaje de error por código HTTP
const message = getErrorMessage(response.status, errorData.error);
```

## 4. Tema Oscuro en Modales/Selectores

Cuando uses inputs o selectores que cambien de color en modo oscuro, importa `useTheme`:

```javascript
import { useTheme } from '@mui/material';

const MyComponent = () => {
  const theme = useTheme();

  return (
    <ListItem
      sx={{
        backgroundColor: selected
          ? theme.palette.mode === 'dark' ? '#1565c0' : '#e3f2fd'
          : 'transparent',
        '&:hover': {
          backgroundColor: selected
            ? theme.palette.mode === 'dark' ? '#0d47a1' : '#90caf9'
            : '#999999',
        },
      }}
    >
      {/* contenido */}
    </ListItem>
  );
};
```

## 5. Fetch API Error Handling

NUNCA simplemente mostrar `error.message`. Siempre procesar la respuesta del servidor:

```javascript
try {
  const response = await fetch(url, options);
  
  // Si no es ok, obtener el mensaje del servidor
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error desconocido');
  }

  const data = await response.json();
  // ... procesar data
} catch (error) {
  // Mostrar alertas específicas
  if (error.message.includes('413')) {
    alertError('❌ Archivo demasiado grande (máx 5MB)');
  } else if (error.message.includes('payload')) {
    alertError('❌ Datos demasiado grandes');
  } else if (error.message.includes('not found')) {
    alertError('❌ Recurso no encontrado');
  } else {
    alertError(`❌ Error: ${error.message}`);
  }
}
```

## 6. Validaciones en Tiempo Real

Los campos deben validarse mientras el usuario escribe:

```javascript
const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  setFormData(prev => ({
    ...prev,
    [name]: value,
  }));

  // Validar inmediatamente
  if (validatedFields.includes(name)) {
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  }
};

// En el TextField
<TextField
  name="name"
  value={formData.name}
  onChange={handleInputChange}
  error={!!fieldErrors.name}
  helperText={fieldErrors.name}
/>
```

## Checklist para Nuevas Funcionalidades

Cuando crees un nuevo formulario o página con edición, asegúrate de:

- [ ] Validación de cambios si es edición
- [ ] Botón de guardar deshabilitado si datos no son válidos O (si edita) no hay cambios
- [ ] Alertas específicas para cada tipo de error
- [ ] Validaciones en tiempo real
- [ ] Mensajes de éxito/error amigables
- [ ] Manejo de errores HTTP (413, 401, 404, 500, etc)
- [ ] Tema oscuro soportado en modales/selectores
- [ ] Función `handleClose()` limpia el estado
- [ ] Loading state mientras procesa
- [ ] No permitir múltiples clicks (loading = true)

## Ejemplo Completo

Ver `frontend/src/pages/Teams.jsx` como referencia de implementación correcta.
