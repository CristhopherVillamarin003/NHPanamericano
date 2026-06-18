/**
 * Mapa de celdas para la plantilla de Historia Clínica (MSP)
 * Hoja: IMAGENOLOGIA
 */
export const HISTORIA_CLINICA_IMAGENOLOGIA_MAP: Record<string, { sheet: string; cell: string }> = {

  img1_institucion                : { sheet: 'IMAGENOLOGIA', cell: 'A3'  },
  img1_unicodigo                  : { sheet: 'IMAGENOLOGIA', cell: 'P3'  },
  img1_establecimiento            : { sheet: 'IMAGENOLOGIA', cell: 'V3'  },
  img1_numero_historia_clinica    : { sheet: 'IMAGENOLOGIA', cell: 'AN3' },
  img1_numero_archivo             : { sheet: 'IMAGENOLOGIA', cell: 'BF3' },

  img1_primer_apellido            : { sheet: 'IMAGENOLOGIA', cell: 'A6'  },
  img1_segundo_apellido           : { sheet: 'IMAGENOLOGIA', cell: 'P6'  },
  img1_primer_nombre              : { sheet: 'IMAGENOLOGIA', cell: 'AC6' },
  img1_segundo_nombre             : { sheet: 'IMAGENOLOGIA', cell: 'AP6' },
  img1_sexo                       : { sheet: 'IMAGENOLOGIA', cell: 'AZ6' },
  img1_fecha_nacimiento           : { sheet: 'IMAGENOLOGIA', cell: 'BC6' },
  img1_edad                       : { sheet: 'IMAGENOLOGIA', cell: 'BI6' },

  img1_condicion_edad_h           : { sheet: 'IMAGENOLOGIA', cell: 'BL6' },
  img1_condicion_edad_d           : { sheet: 'IMAGENOLOGIA', cell: 'BN6' },
  img1_condicion_edad_m           : { sheet: 'IMAGENOLOGIA', cell: 'BP6' },
  img1_condicion_edad_a           : { sheet: 'IMAGENOLOGIA', cell: 'BR6' },

  // B. SERVICIO Y PRIORIDAD DE ATENCIÓN
  img1_servicio_emergencia        : { sheet: 'IMAGENOLOGIA', cell: 'F10' },
  img1_servicio_consulta          : { sheet: 'IMAGENOLOGIA', cell: 'O10' },
  img1_servicio_hospitalizacion   : { sheet: 'IMAGENOLOGIA', cell: 'X10' },
  img1_servicio_especialidad      : { sheet: 'IMAGENOLOGIA', cell: 'Z10' },
  img1_servicio_cama              : { sheet: 'IMAGENOLOGIA', cell: 'AQ10' },
  img1_servicio_sala              : { sheet: 'IMAGENOLOGIA', cell: 'AW10' },
  img1_prioridad_urgente          : { sheet: 'IMAGENOLOGIA', cell: 'BG10' },
  img1_prioridad_rutina           : { sheet: 'IMAGENOLOGIA', cell: 'BL10' },
  img1_prioridad_control          : { sheet: 'IMAGENOLOGIA', cell: 'BR10' },

  // C. ESTUDIO DE IMAGENOLOGÍA SOLICITADO
  img1_rx_convencional            : { sheet: 'IMAGENOLOGIA', cell: 'G13' },
  img1_rx_portatil                : { sheet: 'IMAGENOLOGIA', cell: 'M13' },
  img1_tomografia                 : { sheet: 'IMAGENOLOGIA', cell: 'U13' },
  img1_resonancia                 : { sheet: 'IMAGENOLOGIA', cell: 'AB13' },
  img1_ecografia                  : { sheet: 'IMAGENOLOGIA', cell: 'AI13' },
  img1_mamografia                 : { sheet: 'IMAGENOLOGIA', cell: 'AQ13' },
  img1_procedimiento              : { sheet: 'IMAGENOLOGIA', cell: 'AZ13' },
  img1_otro                       : { sheet: 'IMAGENOLOGIA', cell: 'BE13' },
  img1_sedacion_si                : { sheet: 'IMAGENOLOGIA', cell: 'BN13' },
  img1_sedacion_no                : { sheet: 'IMAGENOLOGIA', cell: 'BR13' },

  img1_descripcion_estudio        : { sheet: 'IMAGENOLOGIA', cell: 'I14' },

  // D. MOTIVO DE LA SOLICITUD
  img1_fum                        : { sheet: 'IMAGENOLOGIA', cell: 'K19' },
  img1_paciente_contaminado_si    : { sheet: 'IMAGENOLOGIA', cell: 'AM19' },
  img1_paciente_contaminado_no    : { sheet: 'IMAGENOLOGIA', cell: 'AQ19' },
  img1_paciente_contaminado_desc  : { sheet: 'IMAGENOLOGIA', cell: 'A20' },

  // E. RESUMEN CLÍNICO ACTUAL
  img1_resumen_clinico            : { sheet: 'IMAGENOLOGIA', cell: 'A25' },

  // F. DIAGNÓSTICO
  img1_diagnostico_1              : { sheet: 'IMAGENOLOGIA', cell: 'B33' },
  img1_diagnostico_1_cie          : { sheet: 'IMAGENOLOGIA', cell: 'AC33' },
  img1_diagnostico_1_pre          : { sheet: 'IMAGENOLOGIA', cell: 'AG33' },
  img1_diagnostico_1_def          : { sheet: 'IMAGENOLOGIA', cell: 'AI33' },

  img1_diagnostico_2              : { sheet: 'IMAGENOLOGIA', cell: 'B34' },
  img1_diagnostico_2_cie          : { sheet: 'IMAGENOLOGIA', cell: 'AC34' },
  img1_diagnostico_2_pre          : { sheet: 'IMAGENOLOGIA', cell: 'AG34' },
  img1_diagnostico_2_def          : { sheet: 'IMAGENOLOGIA', cell: 'AI34' },

  img1_diagnostico_3              : { sheet: 'IMAGENOLOGIA', cell: 'B35' },
  img1_diagnostico_3_cie          : { sheet: 'IMAGENOLOGIA', cell: 'AC35' },
  img1_diagnostico_3_pre          : { sheet: 'IMAGENOLOGIA', cell: 'AG35' },
  img1_diagnostico_3_def          : { sheet: 'IMAGENOLOGIA', cell: 'AI35' },

  img1_diagnostico_4              : { sheet: 'IMAGENOLOGIA', cell: 'AL33' },
  img1_diagnostico_4_cie          : { sheet: 'IMAGENOLOGIA', cell: 'BL33' },
  img1_diagnostico_4_pre          : { sheet: 'IMAGENOLOGIA', cell: 'BP33' },
  img1_diagnostico_4_def          : { sheet: 'IMAGENOLOGIA', cell: 'BR33' },

  img1_diagnostico_5              : { sheet: 'IMAGENOLOGIA', cell: 'AL34' },
  img1_diagnostico_5_cie          : { sheet: 'IMAGENOLOGIA', cell: 'BL34' },
  img1_diagnostico_5_pre          : { sheet: 'IMAGENOLOGIA', cell: 'BP34' },
  img1_diagnostico_5_def          : { sheet: 'IMAGENOLOGIA', cell: 'BR34' },

  img1_diagnostico_6              : { sheet: 'IMAGENOLOGIA', cell: 'AL35' },
  img1_diagnostico_6_cie          : { sheet: 'IMAGENOLOGIA', cell: 'BL35' },
  img1_diagnostico_6_pre          : { sheet: 'IMAGENOLOGIA', cell: 'BP35' },
  img1_diagnostico_6_def          : { sheet: 'IMAGENOLOGIA', cell: 'BR35' },

  // G. DATOS DEL PROFESIONAL RESPONSABLE
  img1_fecha                      : { sheet: 'IMAGENOLOGIA', cell: 'A39' },
  img1_hora                       : { sheet: 'IMAGENOLOGIA', cell: 'I39' },
  img1_prof_primer_nombre         : { sheet: 'IMAGENOLOGIA', cell: 'P39' },
  img1_prof_primer_apellido       : { sheet: 'IMAGENOLOGIA', cell: 'AK39' },
  img1_prof_segundo_apellido      : { sheet: 'IMAGENOLOGIA', cell: 'BD39' },

  img1_prof_documento             : { sheet: 'IMAGENOLOGIA', cell: 'A41' },

  // ─────────────────────────────────────────────────────────────────────────
  // BLOQUE 2 (Segundo formulario - Filas 48-90)
  // ─────────────────────────────────────────────────────────────────────────
  img2_institucion                : { sheet: 'IMAGENOLOGIA', cell: 'A50' },
  img2_unicodigo                  : { sheet: 'IMAGENOLOGIA', cell: 'P50' },
  img2_establecimiento            : { sheet: 'IMAGENOLOGIA', cell: 'V50' },
  img2_numero_historia_clinica    : { sheet: 'IMAGENOLOGIA', cell: 'AN50' },
  img2_numero_archivo             : { sheet: 'IMAGENOLOGIA', cell: 'BF50' },

  img2_primer_apellido            : { sheet: 'IMAGENOLOGIA', cell: 'A53' },
  img2_segundo_apellido           : { sheet: 'IMAGENOLOGIA', cell: 'P53' },
  img2_primer_nombre              : { sheet: 'IMAGENOLOGIA', cell: 'AC53' },
  img2_segundo_nombre             : { sheet: 'IMAGENOLOGIA', cell: 'AP53' },
  img2_sexo                       : { sheet: 'IMAGENOLOGIA', cell: 'AZ53' },
  img2_fecha_nacimiento           : { sheet: 'IMAGENOLOGIA', cell: 'BC53' },
  img2_edad                       : { sheet: 'IMAGENOLOGIA', cell: 'BI53' },

  img2_condicion_edad_h           : { sheet: 'IMAGENOLOGIA', cell: 'BL53' },
  img2_condicion_edad_d           : { sheet: 'IMAGENOLOGIA', cell: 'BN53' },
  img2_condicion_edad_m           : { sheet: 'IMAGENOLOGIA', cell: 'BP53' },
  img2_condicion_edad_a           : { sheet: 'IMAGENOLOGIA', cell: 'BR53' },

  // B. SERVICIO Y PRIORIDAD DE ATENCIÓN
  img2_servicio_emergencia        : { sheet: 'IMAGENOLOGIA', cell: 'F57' },
  img2_servicio_consulta          : { sheet: 'IMAGENOLOGIA', cell: 'O57' },
  img2_servicio_hospitalizacion   : { sheet: 'IMAGENOLOGIA', cell: 'X57' },
  img2_servicio_especialidad      : { sheet: 'IMAGENOLOGIA', cell: 'Z57' },
  img2_servicio_cama              : { sheet: 'IMAGENOLOGIA', cell: 'AQ57' },
  img2_servicio_sala              : { sheet: 'IMAGENOLOGIA', cell: 'AW57' },
  img2_prioridad_urgente          : { sheet: 'IMAGENOLOGIA', cell: 'BG57' },
  img2_prioridad_rutina           : { sheet: 'IMAGENOLOGIA', cell: 'BL57' },
  img2_prioridad_control          : { sheet: 'IMAGENOLOGIA', cell: 'BR57' },

  // C. ESTUDIO DE IMAGENOLOGÍA SOLICITADO
  img2_rx_convencional            : { sheet: 'IMAGENOLOGIA', cell: 'G60' },
  img2_rx_portatil                : { sheet: 'IMAGENOLOGIA', cell: 'M60' },
  img2_tomografia                 : { sheet: 'IMAGENOLOGIA', cell: 'U60' },
  img2_resonancia                 : { sheet: 'IMAGENOLOGIA', cell: 'AB60' },
  img2_ecografia                  : { sheet: 'IMAGENOLOGIA', cell: 'AI60' },
  img2_mamografia                 : { sheet: 'IMAGENOLOGIA', cell: 'AQ60' },
  img2_procedimiento              : { sheet: 'IMAGENOLOGIA', cell: 'AZ60' },
  img2_otro                       : { sheet: 'IMAGENOLOGIA', cell: 'BE60' },
  img2_sedacion_si                : { sheet: 'IMAGENOLOGIA', cell: 'BN60' },
  img2_sedacion_no                : { sheet: 'IMAGENOLOGIA', cell: 'BR60' },

  img2_descripcion_estudio        : { sheet: 'IMAGENOLOGIA', cell: 'I61' },

  // D. MOTIVO DE LA SOLICITUD
  img2_fum                        : { sheet: 'IMAGENOLOGIA', cell: 'K66' },
  img2_paciente_contaminado_si    : { sheet: 'IMAGENOLOGIA', cell: 'AM66' },
  img2_paciente_contaminado_no    : { sheet: 'IMAGENOLOGIA', cell: 'AQ66' },
  img2_paciente_contaminado_desc  : { sheet: 'IMAGENOLOGIA', cell: 'A67' },

  // E. RESUMEN CLÍNICO ACTUAL
  img2_resumen_clinico            : { sheet: 'IMAGENOLOGIA', cell: 'A72' },

  // F. DIAGNÓSTICO
  img2_diagnostico_1              : { sheet: 'IMAGENOLOGIA', cell: 'B80' },
  img2_diagnostico_1_cie          : { sheet: 'IMAGENOLOGIA', cell: 'AC80' },
  img2_diagnostico_1_pre          : { sheet: 'IMAGENOLOGIA', cell: 'AG80' },
  img2_diagnostico_1_def          : { sheet: 'IMAGENOLOGIA', cell: 'AI80' },

  img2_diagnostico_2              : { sheet: 'IMAGENOLOGIA', cell: 'B81' },
  img2_diagnostico_2_cie          : { sheet: 'IMAGENOLOGIA', cell: 'AC81' },
  img2_diagnostico_2_pre          : { sheet: 'IMAGENOLOGIA', cell: 'AG81' },
  img2_diagnostico_2_def          : { sheet: 'IMAGENOLOGIA', cell: 'AI81' },

  img2_diagnostico_3              : { sheet: 'IMAGENOLOGIA', cell: 'B82' },
  img2_diagnostico_3_cie          : { sheet: 'IMAGENOLOGIA', cell: 'AC82' },
  img2_diagnostico_3_pre          : { sheet: 'IMAGENOLOGIA', cell: 'AG82' },
  img2_diagnostico_3_def          : { sheet: 'IMAGENOLOGIA', cell: 'AI82' },

  img2_diagnostico_4              : { sheet: 'IMAGENOLOGIA', cell: 'AL80' },
  img2_diagnostico_4_cie          : { sheet: 'IMAGENOLOGIA', cell: 'BL80' },
  img2_diagnostico_4_pre          : { sheet: 'IMAGENOLOGIA', cell: 'BP80' },
  img2_diagnostico_4_def          : { sheet: 'IMAGENOLOGIA', cell: 'BR80' },

  img2_diagnostico_5              : { sheet: 'IMAGENOLOGIA', cell: 'AL81' },
  img2_diagnostico_5_cie          : { sheet: 'IMAGENOLOGIA', cell: 'BL81' },
  img2_diagnostico_5_pre          : { sheet: 'IMAGENOLOGIA', cell: 'BP81' },
  img2_diagnostico_5_def          : { sheet: 'IMAGENOLOGIA', cell: 'BR81' },

  img2_diagnostico_6              : { sheet: 'IMAGENOLOGIA', cell: 'AL82' },
  img2_diagnostico_6_cie          : { sheet: 'IMAGENOLOGIA', cell: 'BL82' },
  img2_diagnostico_6_pre          : { sheet: 'IMAGENOLOGIA', cell: 'BP82' },
  img2_diagnostico_6_def          : { sheet: 'IMAGENOLOGIA', cell: 'BR82' },

  // G. DATOS DEL PROFESIONAL RESPONSABLE
  img2_fecha                      : { sheet: 'IMAGENOLOGIA', cell: 'A86' },
  img2_hora                       : { sheet: 'IMAGENOLOGIA', cell: 'I86' },
  img2_prof_primer_nombre         : { sheet: 'IMAGENOLOGIA', cell: 'P86' },
  img2_prof_primer_apellido       : { sheet: 'IMAGENOLOGIA', cell: 'AK86' },
  img2_prof_segundo_apellido      : { sheet: 'IMAGENOLOGIA', cell: 'BD86' },

  img2_prof_documento             : { sheet: 'IMAGENOLOGIA', cell: 'A88' },

};
