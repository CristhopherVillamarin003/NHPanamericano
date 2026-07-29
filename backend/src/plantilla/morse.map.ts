export interface PosicionNombrePaciente {
  parrafo: number;
  run_agregar: number;
  descripcion: string;
}

export const NOMBRE_PACIENTE_MORSE: PosicionNombrePaciente = {
  parrafo: 0,
  run_agregar: 1,
  descripcion: "Nombre completo del paciente — agregar run[1] después del label 'NOMBRE DEL PACIENTE:'",
};

export interface CeldaPuntaje {
  tabla: number;
  fila: number;
  celda: number;
  variable: string;
  descripcion: string;
  puntaje: number;
}

export interface CeldaLlenar {
  tabla: number;
  fila: number;
  celda: number;
  descripcion: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 12 CELDAS DE PUNTAJE — colorear fondo al seleccionar
// Todas en celda[2] de sus respectivas filas
// ─────────────────────────────────────────────────────────────────────────────

export const PUNTAJES_MORSE: CeldaPuntaje[] = [
  // ── CAÍDA PREVIA ──────────────────────────────────────────────────
  { tabla: 0, fila: 3,  celda: 2, variable: 'caida_previa', descripcion: 'no', puntaje: 0  },
  { tabla: 0, fila: 4,  celda: 2, variable: 'caida_previa', descripcion: 'si', puntaje: 25 },

  // ── COMORBILIDADES ────────────────────────────────────────────────
  { tabla: 0, fila: 5,  celda: 2, variable: 'comorbilidades', descripcion: 'no', puntaje: 0  },
  { tabla: 0, fila: 6,  celda: 2, variable: 'comorbilidades', descripcion: 'si', puntaje: 15 },

  // ── AYUDA PARA DEAMBULAR ──────────────────────────────────────────
  { tabla: 0, fila: 7,  celda: 2, variable: 'ayuda_deambular', descripcion: 'ninguna', puntaje: 0  },
  { tabla: 0, fila: 8,  celda: 2, variable: 'ayuda_deambular', descripcion: 'baston',  puntaje: 15 },
  { tabla: 0, fila: 9,  celda: 2, variable: 'ayuda_deambular', descripcion: 'muebles', puntaje: 30 },

  // ── VENOCLISIS ────────────────────────────────────────────────────
  { tabla: 0, fila: 10, celda: 2, variable: 'venoclisis', descripcion: 'no', puntaje: 0  },
  { tabla: 0, fila: 11, celda: 2, variable: 'venoclisis', descripcion: 'si', puntaje: 20 },

  // ── MARCHA ────────────────────────────────────────────────────────
  { tabla: 0, fila: 12, celda: 2, variable: 'marcha', descripcion: 'normal',   puntaje: 0  },
  { tabla: 0, fila: 13, celda: 2, variable: 'marcha', descripcion: 'debil',    puntaje: 10 },
  { tabla: 0, fila: 14, celda: 2, variable: 'marcha', descripcion: 'limitada', puntaje: 20 },

  // ── ESTADO MENTAL ─────────────────────────────────────────────────
  { tabla: 0, fila: 15, celda: 2, variable: 'estado_mental', descripcion: 'reconoce',     puntaje: 0  },
  { tabla: 0, fila: 16, celda: 2, variable: 'estado_mental', descripcion: 'sobreestima',  puntaje: 15 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 1 CELDA PUNTUACIÓN FINAL — inyectar número total calculado
// ─────────────────────────────────────────────────────────────────────────────

export const PUNTUACION_FINAL_MORSE: CeldaLlenar = {
  tabla: 0, fila: 17, celda: 1,
  descripcion: "Suma total de puntajes seleccionados",
};

// ─────────────────────────────────────────────────────────────────────────────
// 3 CELDAS DE ACCIÓN — inyectar 'X' en la fila del nivel correspondiente
// ─────────────────────────────────────────────────────────────────────────────

export const ACCIONES_MORSE = {
  bajo: {
    tabla: 0, fila: 19, celda: 3,
    descripcion: "Nivel BAJO — puntaje 0 a 24 → Cuidados bajo enfermería",
    rango: { min: 0, max: 24 },
  } as CeldaLlenar & { rango: { min: number; max: number } },

  medio: {
    tabla: 0, fila: 20, celda: 3,
    descripcion: "Nivel MEDIO — puntaje 25 a 50 → Implementación del plan de prevención",
    rango: { min: 25, max: 50 },
  } as CeldaLlenar & { rango: { min: number; max: number } },

  alto: {
    tabla: 0, fila: 21, celda: 3,
    descripcion: "Nivel ALTO — puntaje mayor a 50 → Implementación de medidas especiales",
    rango: { min: 51, max: Infinity },
  } as CeldaLlenar & { rango: { min: number; max: number } },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER — determinar nivel de riesgo dado un puntaje
// ═══════════════════════════════════════════════════════════════════════════

export function calcularNivelRiesgoMorse(puntaje: number): 'bajo' | 'medio' | 'alto' {
  if (puntaje <= 24) return 'bajo';
  if (puntaje <= 50) return 'medio';
  return 'alto';
}
