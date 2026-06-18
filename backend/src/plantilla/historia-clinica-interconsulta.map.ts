/**
 * Mapa de celdas para la plantilla de Historia Clínica (MSP)
 * Hoja: INTERCONSULTA
 */
export const HISTORIA_CLINICA_INTERCONSULTA_MAP: Record<string, { sheet: string; cell: string }> = {
  // ─────────────────────────────────────────────────────────────────────────
  // A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE
  // ─────────────────────────────────────────────────────────────────────────
  inter_institucion: { sheet: 'INTERCONSULTA', cell: 'A3' },
  inter_unicodigo: { sheet: 'INTERCONSULTA', cell: 'N3' },
  inter_establecimiento: { sheet: 'INTERCONSULTA', cell: 'T3' },
  inter_numero_historia_clinica: { sheet: 'INTERCONSULTA', cell: 'AH3' },
  inter_numero_archivo: { sheet: 'INTERCONSULTA', cell: 'AZ3' },
  inter_no_hoja: { sheet: 'INTERCONSULTA', cell: 'BK3' },

  inter_primer_apellido: { sheet: 'INTERCONSULTA', cell: 'A6' },
  inter_segundo_apellido: { sheet: 'INTERCONSULTA', cell: 'R6' },
  inter_primer_nombre: { sheet: 'INTERCONSULTA', cell: 'AF6' },
  inter_segundo_nombre: { sheet: 'INTERCONSULTA', cell: 'AP6' },
  inter_sexo: { sheet: 'INTERCONSULTA', cell: 'BA6' },
  inter_edad: { sheet: 'INTERCONSULTA', cell: 'BD6' },

  inter_condicion_edad_h: { sheet: 'INTERCONSULTA', cell: 'BH6' },
  inter_condicion_edad_d: { sheet: 'INTERCONSULTA', cell: 'BJ6' },
  inter_condicion_edad_m: { sheet: 'INTERCONSULTA', cell: 'BL6' },
  inter_condicion_edad_a: { sheet: 'INTERCONSULTA', cell: 'BN6' },

  // ─────────────────────────────────────────────────────────────────────────
  // B. CARACTERÍSTICA DE LA SOLICITUD, MOTIVO Y PRIORIDAD DE ATENCIÓN
  // ─────────────────────────────────────────────────────────────────────────
  // Servicio — marcar con X en la celda editable ubicada junto al label
  inter_servicio_emergencia: { sheet: 'INTERCONSULTA', cell: 'G10' },
  inter_servicio_consulta: { sheet: 'INTERCONSULTA', cell: 'N10' },
  inter_servicio_hospitalizacion: { sheet: 'INTERCONSULTA', cell: 'W10' },

  inter_servicio_especialidad: { sheet: 'INTERCONSULTA', cell: 'Y10' },
  inter_no_cama: { sheet: 'INTERCONSULTA', cell: 'AR10' },
  inter_no_sala: { sheet: 'INTERCONSULTA', cell: 'AX10' },

  // Urgente — marcar con X en la celda editable, no en el label SI/NO
  inter_urgente_si: { sheet: 'INTERCONSULTA', cell: 'BJ10' },
  inter_urgente_no: { sheet: 'INTERCONSULTA', cell: 'BN10' },

  inter_especialidad_consultada: { sheet: 'INTERCONSULTA', cell: 'O11' },
  inter_descripcion_motivo: { sheet: 'INTERCONSULTA', cell: 'O12' },

  // ─────────────────────────────────────────────────────────────────────────
  // C. CUADRO CLÍNICO ACTUAL
  // ─────────────────────────────────────────────────────────────────────────
  inter_cuadro_clinico: { sheet: 'INTERCONSULTA', cell: 'A17' },

  // ─────────────────────────────────────────────────────────────────────────
  // D. RESULTADOS DE EXÁMENES Y PROCEDIMIENTOS DIAGNÓSTICOS RELEVANTES
  // ─────────────────────────────────────────────────────────────────────────
  inter_resultados_examenes: { sheet: 'INTERCONSULTA', cell: 'A27' },

  // ─────────────────────────────────────────────────────────────────────────
  // E. DIAGNÓSTICO
  // ─────────────────────────────────────────────────────────────────────────
  inter_diagnostico_1: { sheet: 'INTERCONSULTA', cell: 'B37' },
  inter_diagnostico_1_cie: { sheet: 'INTERCONSULTA', cell: 'AA37' },
  inter_diagnostico_1_pre: { sheet: 'INTERCONSULTA', cell: 'AE37' },
  inter_diagnostico_1_def: { sheet: 'INTERCONSULTA', cell: 'AG37' },

  inter_diagnostico_2: { sheet: 'INTERCONSULTA', cell: 'B38' },
  inter_diagnostico_2_cie: { sheet: 'INTERCONSULTA', cell: 'AA38' },
  inter_diagnostico_2_pre: { sheet: 'INTERCONSULTA', cell: 'AE38' },
  inter_diagnostico_2_def: { sheet: 'INTERCONSULTA', cell: 'AG38' },

  inter_diagnostico_3: { sheet: 'INTERCONSULTA', cell: 'B39' },
  inter_diagnostico_3_cie: { sheet: 'INTERCONSULTA', cell: 'AA39' },
  inter_diagnostico_3_pre: { sheet: 'INTERCONSULTA', cell: 'AE39' },
  inter_diagnostico_3_def: { sheet: 'INTERCONSULTA', cell: 'AG39' },

  inter_diagnostico_4: { sheet: 'INTERCONSULTA', cell: 'AJ37' },
  inter_diagnostico_4_cie: { sheet: 'INTERCONSULTA', cell: 'BH37' },
  inter_diagnostico_4_pre: { sheet: 'INTERCONSULTA', cell: 'BL37' },
  inter_diagnostico_4_def: { sheet: 'INTERCONSULTA', cell: 'BN37' },

  inter_diagnostico_5: { sheet: 'INTERCONSULTA', cell: 'AJ38' },
  inter_diagnostico_5_cie: { sheet: 'INTERCONSULTA', cell: 'BH38' },
  inter_diagnostico_5_pre: { sheet: 'INTERCONSULTA', cell: 'BL38' },
  inter_diagnostico_5_def: { sheet: 'INTERCONSULTA', cell: 'BN38' },

  inter_diagnostico_6: { sheet: 'INTERCONSULTA', cell: 'AJ39' },
  inter_diagnostico_6_cie: { sheet: 'INTERCONSULTA', cell: 'BH39' },
  inter_diagnostico_6_pre: { sheet: 'INTERCONSULTA', cell: 'BL39' },
  inter_diagnostico_6_def: { sheet: 'INTERCONSULTA', cell: 'BN39' },

  // ─────────────────────────────────────────────────────────────────────────
  // F. PLAN TERAPÉUTICO REALIZADO
  // ─────────────────────────────────────────────────────────────────────────
  inter_plan_terapeutico: { sheet: 'INTERCONSULTA', cell: 'A42' },

  // ─────────────────────────────────────────────────────────────────────────
  // G. DATOS DEL PROFESIONAL RESPONSABLE
  // ─────────────────────────────────────────────────────────────────────────
  inter_fecha: { sheet: 'INTERCONSULTA', cell: 'A57' },
  inter_hora: { sheet: 'INTERCONSULTA', cell: 'I57' },
  inter_prof_primer_nombre: { sheet: 'INTERCONSULTA', cell: 'O57' },
  inter_prof_primer_apellido: { sheet: 'INTERCONSULTA', cell: 'AI57' },
  inter_prof_segundo_apellido: { sheet: 'INTERCONSULTA', cell: 'BA57' },

  inter_prof_documento: { sheet: 'INTERCONSULTA', cell: 'A59' },
};
