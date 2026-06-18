/**
 * Mapeo de posiciones — Plantilla MSP
 * Formulario: SNS-MSP / HCU-form.006/2021
 * Archivo:    plantilla-epicrisis.docx
 *
 * CÓMO FUNCIONA:
 * Word no tiene coordenadas como Excel. El script de Python analiza
 * el documento y asigna índices reales a cada tabla, fila y celda,
 * ignorando las celdas combinadas (merged) que apuntan al mismo elemento.
 *
 * ESTRUCTURA:
 *   tabla[t] → fila[f] → celda[c]
 *
 * REGLA CHECKBOXES:
 *   Escribir 'X' en la celda correspondiente según selección del doctor.
 *
 * CAMPOS READONLY (auto desde hospital.paciente):
 *   primer_apellido, segundo_apellido, primer_nombre, segundo_nombre,
 *   sexo, edad, condicion_edad, numero_historia_clinica
 */

export interface PosicionDocx {
  tabla: number;
  fila: number;
  celda: number;
}

export const MAPEO_006_EPICRISIS: Record<string, PosicionDocx> = {

  // ─────────────────────────────────────────────────────────────────────────
  // TABLA [0] — A. DATOS DEL ESTABLECIMIENTO Y USUARIO/PACIENTE
  // ─────────────────────────────────────────────────────────────────────────

  // Fila [2] — campos del establecimiento (fila [1] son los labels)
  institucion:              { tabla: 0, fila: 2, celda: 0 },
  unicodigo:                { tabla: 0, fila: 2, celda: 1 },
  establecimiento:          { tabla: 0, fila: 2, celda: 2 },
  numero_historia_clinica:  { tabla: 0, fila: 2, celda: 3 }, // (auto)
  numero_archivo:           { tabla: 0, fila: 2, celda: 4 },
  no_hoja:                  { tabla: 0, fila: 2, celda: 5 },

  // Fila [5] — datos del paciente (filas [3] y [4] son los labels)
  primer_apellido:          { tabla: 0, fila: 5, celda: 0 }, // (auto)
  segundo_apellido:         { tabla: 0, fila: 5, celda: 1 }, // (auto)
  primer_nombre:            { tabla: 0, fila: 5, celda: 2 }, // (auto)
  segundo_nombre:           { tabla: 0, fila: 5, celda: 3 }, // (auto)
  sexo:                     { tabla: 0, fila: 5, celda: 4 }, // (auto)
  edad:                     { tabla: 0, fila: 5, celda: 5 }, // (auto)

  // Condición edad — escribir 'X' en la que corresponda
  // Fila [4] tiene los labels H/D/M/A, fila [5] tiene las celdas vacías
  condicion_edad_h:         { tabla: 0, fila: 5, celda: 6 }, // H = horas
  condicion_edad_d:         { tabla: 0, fila: 5, celda: 7 }, // D = días
  condicion_edad_m:         { tabla: 0, fila: 5, celda: 8 }, // M = meses
  condicion_edad_a:         { tabla: 0, fila: 5, celda: 9 }, // A = años  (auto)

  // Fila [7] — B. RESUMEN DEL CUADRO CLÍNICO (texto libre, celda crece)
  resumen_cuadro_clinico:   { tabla: 0, fila: 7, celda: 0 },

  // Fila [9] — C. RESUMEN DE EVOLUCIÓN Y COMPLICACIONES (texto libre)
  resumen_evolucion:        { tabla: 0, fila: 9, celda: 0 },

  // Fila [11] — D. HALLAZGOS RELEVANTES DE EXÁMENES (texto libre)
  hallazgos_examenes:       { tabla: 0, fila: 11, celda: 0 },

  // ─────────────────────────────────────────────────────────────────────────
  // TABLA [1] — E. RESUMEN DE TRATAMIENTO / F. INDICACIONES DE ALTA
  // ─────────────────────────────────────────────────────────────────────────

  // Fila [1] — E. RESUMEN DE TRATAMIENTO Y PROCEDIMIENTOS (texto libre)
  resumen_tratamiento:      { tabla: 1, fila: 1, celda: 0 },

  // Fila [3] — F. INDICACIONES DE ALTA / EGRESO (texto libre)
  indicaciones_alta:        { tabla: 1, fila: 3, celda: 0 },

  // ─────────────────────────────────────────────────────────────────────────
  // TABLA [2] — G. DIAGNÓSTICO DE ALTA / EGRESO
  // Estructura: label | campo_descripcion | campo_cie
  // ─────────────────────────────────────────────────────────────────────────

  dx_principal:             { tabla: 2, fila: 1, celda: 1 },
  dx_principal_cie:         { tabla: 2, fila: 1, celda: 2 },

  dx_secundario_1:          { tabla: 2, fila: 2, celda: 1 },
  dx_secundario_1_cie:      { tabla: 2, fila: 2, celda: 2 },

  dx_secundario_2:          { tabla: 2, fila: 3, celda: 1 },
  dx_secundario_2_cie:      { tabla: 2, fila: 3, celda: 2 },

  dx_secundario_3:          { tabla: 2, fila: 4, celda: 1 },
  dx_secundario_3_cie:      { tabla: 2, fila: 4, celda: 2 },

  causa_externa:            { tabla: 2, fila: 5, celda: 1 },
  causa_externa_cie:        { tabla: 2, fila: 5, celda: 2 },

  // ─────────────────────────────────────────────────────────────────────────
  // TABLA [3] — I. MÉDICOS TRATANTES
  // Fila [2]: celda[0]=número, celda[1]=nombre, celda[2]=especialidad,
  //           celda[3]=sello/doc, celda[4]=período
  // ─────────────────────────────────────────────────────────────────────────

  medico_nombre:            { tabla: 3, fila: 2, celda: 1 },
  medico_especialidad:      { tabla: 3, fila: 2, celda: 2 },
  medico_sello_documento:   { tabla: 3, fila: 2, celda: 3 },
  medico_periodo:           { tabla: 3, fila: 2, celda: 4 },

  // ─────────────────────────────────────────────────────────────────────────
  // TABLA [4] — H. CONDICIÓN DE ALTA / EGRESO
  // Checkboxes: escribir 'X' en la celda vacía junto al label correspondiente
  //
  // Fila [0]: label "VIVO" celda[1]=check_vivo | label "FALLECIDO" celda[4]=check_fallecido
  // Fila [1]: ALTA MÉDICA[1] | ASINTOMÁTICO[3] | DISCAPACIDAD[5] |
  //           RETIRO NO AUTORIZADO[7] | DEFUNCIÓN <48H[9] | DÍAS ESTADA[11]
  // Fila [2]: ALTA VOLUNTARIA[1] | ASINTOMÁTICO[3] | DISCAPACIDAD[5] |
  //           RETIRO NO AUTORIZADO[7] | DEFUNCIÓN >48H[9] | DÍAS REPOSO[11]
  // ─────────────────────────────────────────────────────────────────────────

  condicion_vivo:              { tabla: 4, fila: 0, celda: 2 }, // checkbox X
  condicion_fallecido:         { tabla: 4, fila: 0, celda: 4 }, // checkbox X

  alta_medica:                 { tabla: 4, fila: 1, celda: 1 }, // checkbox X
  alta_asintomatico:           { tabla: 4, fila: 1, celda: 3 }, // checkbox X
  alta_discapacidad:           { tabla: 4, fila: 1, celda: 5 }, // checkbox X
  alta_retiro_no_autorizado:   { tabla: 4, fila: 1, celda: 7 }, // checkbox X
  alta_defuncion_menos_48h:    { tabla: 4, fila: 1, celda: 9 }, // checkbox X
  dias_estada:                 { tabla: 4, fila: 1, celda: 11 },

  alta_voluntaria:             { tabla: 4, fila: 2, celda: 1 }, // checkbox X
  // Nota: asintomático/discapacidad/retiro se repiten en fila 2 (alta voluntaria)
  alta_voluntaria_asintomatico:  { tabla: 4, fila: 2, celda: 3 },
  alta_voluntaria_discapacidad:  { tabla: 4, fila: 2, celda: 5 },
  alta_voluntaria_retiro:        { tabla: 4, fila: 2, celda: 7 },
  alta_defuncion_mas_48h:        { tabla: 4, fila: 2, celda: 9 }, // checkbox X
  dias_reposo:                   { tabla: 4, fila: 2, celda: 11 },

  // ─────────────────────────────────────────────────────────────────────────
  // TABLA [5] — J. DATOS DEL PROFESIONAL RESPONSABLE
  // Fila [2]: campos de datos (fila [1] son los labels)
  // Fila [4]: número documento | firma (física) | sello (físico)
  // Fila [5]: elaborado_por | revisado_por
  // ─────────────────────────────────────────────────────────────────────────

  prof_fecha:               { tabla: 5, fila: 2, celda: 0 },
  prof_hora:                { tabla: 5, fila: 2, celda: 1 },
  prof_primer_nombre:       { tabla: 5, fila: 2, celda: 2 },
  prof_primer_apellido:     { tabla: 5, fila: 2, celda: 3 },
  prof_segundo_apellido:    { tabla: 5, fila: 2, celda: 4 },

  prof_numero_documento:    { tabla: 5, fila: 4, celda: 0 },
  // celda[1] = FIRMA (física en documento impreso — no se inyecta texto)
  // celda[2] = SELLO (físico en documento impreso — no se inyecta texto)

  elaborado_por:            { tabla: 5, fila: 5, celda: 1 },
  revisado_por:             { tabla: 5, fila: 5, celda: 3 },
};

/**
 * CAMPOS QUE SE AUTO-COMPLETAN DESDE hospital.paciente
 *
 *   primer_apellido         ← paciente.primer_apellido
 *   segundo_apellido        ← paciente.segundo_apellido
 *   primer_nombre           ← paciente.primer_nombre
 *   segundo_nombre          ← paciente.segundo_nombre
 *   sexo                    ← paciente.sexo
 *   edad                    ← paciente.edad
 *   condicion_edad_a        ← si edad en años (caso más común)
 *   numero_historia_clinica ← paciente.cedula
 *
 * CAMPOS QUE LLENA EL DOCTOR:
 *   institucion, establecimiento, unicodigo
 *   resumen_cuadro_clinico      ← texto libre, celda crece automáticamente
 *   resumen_evolucion           ← texto libre, celda crece automáticamente
 *   hallazgos_examenes          ← texto libre, celda crece automáticamente
 *   resumen_tratamiento         ← texto libre, celda crece automáticamente
 *   indicaciones_alta           ← texto libre, celda crece automáticamente
 *   dx_principal + cie
 *   dx_secundario_1/2/3 + cie
 *   causa_externa + cie
 *   medico_nombre, medico_especialidad, medico_periodo
 *   condicion_vivo / condicion_fallecido  ← 'X'
 *   alta_medica / alta_voluntaria         ← 'X'
 *   dias_estada, dias_reposo
 *   prof_fecha, prof_hora, prof_primer_nombre, prof_primer_apellido
 *   prof_segundo_apellido, prof_numero_documento
 */