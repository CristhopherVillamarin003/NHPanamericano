import { useState, useRef, useEffect, useCallback } from "react";

export function useFormHistory<T>(initialState: T | (() => T)) {
  const [state, _setState] = useState<T>(initialState);
  
  const historyRef = useRef<T[]>([state]);
  const pointerRef = useRef<number>(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setState = useCallback((valOrFn: React.SetStateAction<T>) => {
    _setState(prev => {
      const next = typeof valOrFn === 'function' ? (valOrFn as any)(prev) : valOrFn;
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
         const currentHistory = historyRef.current;
         const currentPointer = pointerRef.current;
         
         // Only save if it's actually different from the current pointed state
         if (JSON.stringify(next) !== JSON.stringify(currentHistory[currentPointer])) {
            const newHistory = currentHistory.slice(0, currentPointer + 1);
            newHistory.push(next);
            if (newHistory.length > 50) newHistory.shift();
            historyRef.current = newHistory;
            pointerRef.current = newHistory.length - 1;
         }
      }, 500); // 500ms debounce
      
      return next;
    });
  }, []);

  // For immediate saves like Paste
  const saveSnapshot = useCallback((snapshot: T) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    const currentHistory = historyRef.current;
    const currentPointer = pointerRef.current;
    if (JSON.stringify(snapshot) !== JSON.stringify(currentHistory[currentPointer])) {
       const newHistory = currentHistory.slice(0, currentPointer + 1);
       newHistory.push(snapshot);
       if (newHistory.length > 50) newHistory.shift();
       historyRef.current = newHistory;
       pointerRef.current = newHistory.length - 1;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept Ctrl+Z globally
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
           // Redo
           e.preventDefault();
           if (pointerRef.current < historyRef.current.length - 1) {
              pointerRef.current++;
              _setState(historyRef.current[pointerRef.current]);
           }
        } else {
           // Undo
           e.preventDefault();
           if (pointerRef.current > 0) {
              pointerRef.current--;
              _setState(historyRef.current[pointerRef.current]);
           }
        }
      }
      // Ctrl+Y for Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
         e.preventDefault();
         if (pointerRef.current < historyRef.current.length - 1) {
            pointerRef.current++;
            _setState(historyRef.current[pointerRef.current]);
         }
      }
    };
    
    // Use capture phase to prevent other inputs from handling it natively
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  return [state, setState, saveSnapshot] as const;
}
