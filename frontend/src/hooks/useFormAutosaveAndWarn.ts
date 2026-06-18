import { useEffect, useState, useRef } from 'react';

interface Options<T> {
  formId: string;
  initialData: T;
  currentData: T;
  onRestore: (savedData: T) => void;
  debounceMs?: number;
}

/**
 * Hook para autoguardar formularios en LocalStorage y advertir si hay cambios sin guardar.
 * @param formId Identificador único del formulario (ej. 'anamnesis_123'). Si es falsy, no hace nada.
 * @param initialData Datos iniciales (para comparar si está sucio).
 * @param currentData Datos actuales del formulario.
 * @param onRestore Función para restaurar los datos si hay un borrador guardado.
 * @param debounceMs Tiempo de espera antes de guardar en LocalStorage (por defecto 1500ms).
 */
export function useFormAutosaveAndWarn<T>({
  formId,
  initialData,
  currentData,
  onRestore,
  debounceMs = 1500,
}: Options<T>) {
  const [isDirty, setIsDirty] = useState(false);
  const isMounted = useRef(false);
  const isRestoring = useRef(false);

  // Usamos el estado inicial de currentData como nuestra línea base real.
  // Esto incluye todos los defaults que el componente formulario haya agregado.
  const [initialBaseline] = useState(() => JSON.stringify(currentData));
  const baseDataString = useRef(initialBaseline);
  
  const currentDataRef = useRef(currentData);

  useEffect(() => {
    currentDataRef.current = currentData;
  }, [currentData]);

  // 1. Restaurar datos desde LocalStorage al montar
  useEffect(() => {
    if (!formId) return;
    
    const saved = localStorage.getItem(`draft_${formId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Marcamos que estamos restaurando para no sobreescribir inmediatamente
        isRestoring.current = true;
        onRestore(parsed);
      } catch (e) {
        console.error('Error restaurando borrador', e);
      }
    }
  }, [formId]); // Dependemos de formId, asumimos que onRestore es estable o usamos ref

  // 2. Comprobar si está sucio y autoguardar con debounce
  useEffect(() => {
    if (!formId) return;

    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isRestoring.current) {
      isRestoring.current = false;
      return;
    }

    const handler = setTimeout(() => {
      const currentString = JSON.stringify(currentData);

      if (currentString !== baseDataString.current) {
        setIsDirty(true);
        localStorage.setItem(`draft_${formId}`, currentString);
      } else {
        setIsDirty(false);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [currentData, formId, debounceMs]);

  // 3. Advertencia al salir de la página o recargar (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Muestra el popup nativo del navegador
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // 4. Limpiar borrador (llamar cuando se guarda exitosamente en BD)
  const clearAutosave = () => {
    if (formId) {
      localStorage.removeItem(`draft_${formId}`);
    }
    // Después de guardar, los datos actuales se convierten en nuestra nueva "base"
    baseDataString.current = JSON.stringify(currentDataRef.current);
    setIsDirty(false);
  };

  return { isDirty, clearAutosave };
}
