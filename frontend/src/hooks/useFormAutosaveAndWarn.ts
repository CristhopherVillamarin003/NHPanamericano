'use client';

import { useEffect, useState, useRef } from 'react';

interface Options<T> {
  formId: string;
  initialData: T;
  currentData: T;
  onRestore: (savedData: T) => void;
  debounceMs?: number;
}

const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 horas

interface DraftPayload<T> {
  _savedAt: number;
  data: T;
}

/**
 * Limpia proactivamente cualquier borrador huérfano o caducado (>24h) en localStorage.
 */
export function cleanupExpiredDrafts() {
  if (typeof window === 'undefined') return;
  try {
    const now = Date.now();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('draft_')) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const parsed = JSON.parse(item);
            if (parsed && typeof parsed === 'object' && '_savedAt' in parsed) {
              if (now - parsed._savedAt > DRAFT_MAX_AGE_MS) {
                localStorage.removeItem(key);
              }
            } else {
              // Formato antiguo sin fecha de guardado:
              // Se elimina para evitar desincronizaciones con datos viejos.
              localStorage.removeItem(key);
            }
          } catch {
            localStorage.removeItem(key);
          }
        }
      }
    }
  } catch (e) {
    // Ignorar errores en contextos restringidos
  }
}

/**
 * Hook para autoguardar formularios en LocalStorage y advertir si hay cambios sin guardar.
 * Mantiene protección de borrador por un máximo de 24 horas en caso de cortes de luz o cierres accidentales.
 * @param formId Identificador único del formulario (ej. 'anamnesis_123'). Si es falsy, no hace nada.
 * @param initialData Datos iniciales (para comparar si está sucio).
 * @param currentData Datos actuales del formulario.
 * @param onRestore Función para restaurar los datos si hay un borrador guardado y vigente (< 24h).
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

  // Limpieza inicial de borradores expirados al montar
  useEffect(() => {
    cleanupExpiredDrafts();
  }, []);

  // 1. Restaurar datos desde LocalStorage al montar si tiene menos de 24 horas
  useEffect(() => {
    if (!formId) return;
    
    const saved = localStorage.getItem(`draft_${formId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Comprobar formato con timestamp
        if (parsed && typeof parsed === 'object' && '_savedAt' in parsed && 'data' in parsed) {
          const age = Date.now() - parsed._savedAt;
          if (age <= DRAFT_MAX_AGE_MS) {
            // Borrador vigente (menos de 24h): restaurar
            isRestoring.current = true;
            onRestore(parsed.data);
          } else {
            // Borrador expirado: eliminar
            localStorage.removeItem(`draft_${formId}`);
          }
        } else {
          // Borrador antiguo sin fecha: eliminar para prevenir desincronizaciones
          localStorage.removeItem(`draft_${formId}`);
        }
      } catch (e) {
        console.error('Error restaurando borrador', e);
        localStorage.removeItem(`draft_${formId}`);
      }
    }
  }, [formId]);

  // 2. Comprobar si está sucio y autoguardar con debounce (incluyendo timestamp de 24h)
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
        const payload: DraftPayload<T> = {
          _savedAt: Date.now(),
          data: currentData,
        };
        localStorage.setItem(`draft_${formId}`, JSON.stringify(payload));
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
