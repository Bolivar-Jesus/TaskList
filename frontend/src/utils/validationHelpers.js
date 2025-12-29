/**
 * Validación y comparación de cambios para formularios
 * Reutilizable en todos los componentes que necesiten validación de cambios
 */

/**
 * Detecta si hay cambios reales entre los datos originales y los actuales
 * @param {Object} originalData - Datos originales del servidor
 * @param {Object} currentData - Datos actuales del formulario
 * @param {Array<string>} fieldsToCompare - Campos a comparar (ej: ['name', 'email', 'description'])
 * @returns {boolean} true si hay cambios, false si no
 */
export const hasChanges = (originalData, currentData, fieldsToCompare = []) => {
  if (!originalData) return true; // Crear nuevo = siempre permitir

  for (const field of fieldsToCompare) {
    const original = originalData[field];
    const current = currentData[field];

    // Manejo especial para strings (trim)
    if (typeof original === 'string' || typeof current === 'string') {
      const originalTrimmed = (original || '').trim();
      const currentTrimmed = (current || '').trim();
      if (originalTrimmed !== currentTrimmed) return true;
    }
    // Comparación directa
    else if (original !== current) {
      return true;
    }
  }

  return false;
};

/**
 * Detecta cambios en arrays de objetos (para miembros, items, etc.)
 * @param {Array<Object>} originalArray - Array original
 * @param {Array<Object>} currentArray - Array actual
 * @param {string} idField - Campo que identifica el objeto (ej: '_id', 'id')
 * @returns {boolean} true si hay cambios
 */
export const hasArrayChanges = (originalArray = [], currentArray = [], idField = '_id') => {
  const getIds = (arr) =>
    new Set(arr.map((item) => (typeof item === 'string' ? item : item[idField])));

  const originalIds = getIds(originalArray);
  const currentIds = getIds(currentArray);

  if (originalIds.size !== currentIds.size) return true;

  return Array.from(currentIds).some((id) => !originalIds.has(id));
};

/**
 * Validación genérica para strings con rango de caracteres
 * @param {string} value - Valor a validar
 * @param {number} min - Mínimo de caracteres
 * @param {number} max - Máximo de caracteres
 * @param {string} fieldName - Nombre del campo para el mensaje
 * @param {boolean} required - Si es requerido
 * @returns {string} Mensaje de error o vacío si es válido
 */
export const validateStringLength = (
  value,
  min,
  max,
  fieldName = 'Campo',
  required = true
) => {
  const trimmedValue = value.trim();

  if (!trimmedValue && required) {
    return `${fieldName} es requerido`;
  }

  if (!trimmedValue) return ''; // Optional y vacío es válido

  if (trimmedValue.length < min) {
    return `${fieldName} debe tener al menos ${min} caracteres`;
  }

  if (trimmedValue.length > max) {
    return `${fieldName} no puede exceder ${max} caracteres`;
  }

  return '';
};

/**
 * Validación de email
 * @param {string} email - Email a validar
 * @returns {string} Mensaje de error o vacío si es válido
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return 'El email es requerido';
  if (!emailRegex.test(email)) return 'El email no es válido';
  return '';
};

/**
 * Valida archivos (tamaño y tipo)
 * @param {File} file - Archivo a validar
 * @param {number} maxSizeMB - Tamaño máximo en MB
 * @param {Array<string>} allowedTypes - Tipos MIME permitidos (ej: ['image/*', 'application/pdf'])
 * @returns {string} Mensaje de error o vacío si es válido
 */
export const validateFile = (file, maxSizeMB = 5, allowedTypes = ['image/*']) => {
  if (!file) return '';

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `El archivo debe pesar menos de ${maxSizeMB}MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
  }

  const isAllowed = allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      const baseType = type.split('/')[0];
      return file.type.startsWith(baseType);
    }
    return file.type === type;
  });

  if (!isAllowed) {
    return `Tipo de archivo no permitido. Tipos aceptados: ${allowedTypes.join(', ')}`;
  }

  return '';
};

/**
 * Genera mensaje de error específico basado en el código de error HTTP
 * @param {number} statusCode - Código de estado HTTP
 * @param {string} customMessage - Mensaje personalizado del servidor
 * @returns {string} Mensaje de error amigable
 */
export const getErrorMessage = (statusCode, customMessage = '') => {
  const errorMessages = {
    400: 'Datos inválidos. Por favor revisa los campos.',
    401: 'No autorizado. Inicia sesión nuevamente.',
    403: 'No tienes permiso para realizar esta acción.',
    404: 'El recurso no fue encontrado.',
    409: 'Conflicto: ese elemento ya existe.',
    413: 'La imagen o archivo es demasiado grande. Máximo 5MB.',
    415: 'Tipo de contenido no soportado.',
    422: 'Datos inválidos. Verifica los campos requeridos.',
    500: 'Error del servidor. Intenta más tarde.',
    503: 'Servicio no disponible. Intenta más tarde.',
  };

  if (customMessage) return customMessage;
  return errorMessages[statusCode] || 'Ocurrió un error. Intenta nuevamente.';
};

/**
 * Patrón recomendado para usar en todas las ediciones
 * Usar como: const canSave = shouldAllowSave(editing, isValid, hasChanges);
 */
export const shouldAllowSave = (isEditing, isFormValid, hasRealChanges) => {
  // Si es nuevo, solo necesita ser válido
  if (!isEditing) return isFormValid;
  // Si está editando, debe ser válido Y tener cambios
  return isFormValid && hasRealChanges;
};
