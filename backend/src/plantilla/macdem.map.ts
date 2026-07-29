/**
 * Mapeo de posiciones — Plantilla
 * Archivo: plantilla-escalas-macdem.docx
 */

export interface PosicionNombrePaciente {
  parrafo: number;
  run_agregar: number;
  descripcion: string;
}

export const NOMBRE_PACIENTE_MACDEM: PosicionNombrePaciente = {
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
// 15 CELDAS DE PUNTAJE — colorear fondo al seleccionar
// Todas están en celda[2] de sus respectivas filas
// ─────────────────────────────────────────────────────────────────────────────

export const PUNTAJES_MACDEM: CeldaPuntaje[] = [
  // ── EDAD ──────────────────────────────────────────────────────────
  { tabla: 0, fila: 3,  celda: 2, variable: 'edad', descripcion: 'recien_nacido',  puntaje: 2 },
  { tabla: 0, fila: 4,  celda: 2, variable: 'edad', descripcion: 'lactante_menor', puntaje: 2 },
  { tabla: 0, fila: 5,  celda: 2, variable: 'edad', descripcion: 'lactante_mayor', puntaje: 3 },
  { tabla: 0, fila: 6,  celda: 2, variable: 'edad', descripcion: 'pre_escolar',    puntaje: 3 },
  { tabla: 0, fila: 7,  celda: 2, variable: 'edad', descripcion: 'escolar',        puntaje: 1 },

  // ── ANTECEDENTE DE CAÍDA PREVIA ───────────────────────────────────
  { tabla: 0, fila: 8,  celda: 2, variable: 'caida_previa', descripcion: 'no', puntaje: 0 },
  { tabla: 0, fila: 9,  celda: 2, variable: 'caida_previa', descripcion: 'si', puntaje: 1 },

  // ── ANTECEDENTES ──────────────────────────────────────────────────
  { tabla: 0, fila: 10, celda: 2, variable: 'antecedente', descripcion: 'hiperactividad',    puntaje: 1 },
  { tabla: 0, fila: 11, celda: 2, variable: 'antecedente', descripcion: 'neuromusculares',   puntaje: 1 },
  { tabla: 0, fila: 12, celda: 2, variable: 'antecedente', descripcion: 'convulsivo',        puntaje: 1 },
  { tabla: 0, fila: 13, celda: 2, variable: 'antecedente', descripcion: 'cerebral',          puntaje: 1 },
  { tabla: 0, fila: 14, celda: 2, variable: 'antecedente', descripcion: 'otros',             puntaje: 1 },
  { tabla: 0, fila: 15, celda: 2, variable: 'antecedente', descripcion: 'sin_antecedentes',  puntaje: 0 },

  // ── COMPROMISO DE CONCIENCIA ──────────────────────────────────────
  { tabla: 0, fila: 16, celda: 2, variable: 'conciencia', descripcion: 'no', puntaje: 0 },
  { tabla: 0, fila: 17, celda: 2, variable: 'conciencia', descripcion: 'si', puntaje: 1 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 1 CELDA PUNTUACIÓN FINAL — inyectar número total calculado
// ─────────────────────────────────────────────────────────────────────────────

export const PUNTUACION_FINAL: CeldaLlenar = {
  tabla: 0, fila: 18, celda: 1,
  descripcion: "Suma total de puntajes seleccionados (número entre 0 y 8)",
};

// ─────────────────────────────────────────────────────────────────────────────
// 3 CELDAS DE ACCIÓN — inyectar 'X' en la fila del nivel correspondiente
// ─────────────────────────────────────────────────────────────────────────────

export const ACCIONES_MACDEM = {
  bajo: {
    tabla: 0, fila: 20, celda: 3,
    descripcion: "Nivel BAJO — puntaje 0 a 1 → Cuidados bajo enfermería",
    rango: { min: 0, max: 1 },
  } as CeldaLlenar & { rango: { min: number; max: number } },

  medio: {
    tabla: 0, fila: 21, celda: 3,
    descripcion: "Nivel MEDIO — puntaje 2 a 3 → Implementación del plan de prevención",
    rango: { min: 2, max: 3 },
  } as CeldaLlenar & { rango: { min: number; max: number } },

  alto: {
    tabla: 0, fila: 22, celda: 3,
    descripcion: "Nivel ALTO — puntaje 4 a 6 → Implementación de medidas especiales",
    rango: { min: 4, max: 6 },
  } as CeldaLlenar & { rango: { min: number; max: number } },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER — determinar nivel de riesgo dado un puntaje
// ═══════════════════════════════════════════════════════════════════════════

export function calcularNivelRiesgo(puntaje: number): 'bajo' | 'medio' | 'alto' {
  if (puntaje <= 1) return 'bajo';
  if (puntaje <= 3) return 'medio';
  return 'alto';
}
