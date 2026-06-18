/**
 * Mapa de celdas para la plantilla de Protocolo
 * Hojas: ANVERSO y REVERSO
 */
export const PROTOCOLO_MAP: Record<string, { sheet: string; cell: string }> = {
// ─────────────────────────────────────────────────────────────────────────
  // 017 ANVERSO
  // A. DATOS DE ESTABLECIMIENTO Y USUARIO / PACIENTE
  // ─────────────────────────────────────────────────────────────────────────
  prot_institucion               : { sheet: '017 ANVERSO', cell: 'A3'  },
  prot_unicodigo                 : { sheet: '017 ANVERSO', cell: 'O3'  },
  prot_establecimiento           : { sheet: '017 ANVERSO', cell: 'U3'  },
  prot_numero_historia_clinica   : { sheet: '017 ANVERSO', cell: 'AJ3' },
  prot_numero_archivo            : { sheet: '017 ANVERSO', cell: 'BB3' },

  prot_primer_apellido           : { sheet: '017 ANVERSO', cell: 'A6'  },
  prot_segundo_apellido          : { sheet: '017 ANVERSO', cell: 'O6'  },
  prot_primer_nombre             : { sheet: '017 ANVERSO', cell: 'AB6' },
  prot_segundo_nombre            : { sheet: '017 ANVERSO', cell: 'AM6' },
  prot_sexo                      : { sheet: '017 ANVERSO', cell: 'AY6' },
  prot_edad                      : { sheet: '017 ANVERSO', cell: 'BB6' },

  prot_condicion_edad_h          : { sheet: '017 ANVERSO', cell: 'BE6' },
  prot_condicion_edad_d          : { sheet: '017 ANVERSO', cell: 'BG6' },
  prot_condicion_edad_m          : { sheet: '017 ANVERSO', cell: 'BI6' },
  prot_condicion_edad_a          : { sheet: '017 ANVERSO', cell: 'BK6' },

  // B. DIAGNÓSTICOS
  prot_diagnostico_pre1          : { sheet: '017 ANVERSO', cell: 'I9'  },
  prot_diag_pre_cie1             : { sheet: '017 ANVERSO', cell: 'BH9' },
  prot_diagnostico_pre2          : { sheet: '017 ANVERSO', cell: 'I10' },
  prot_diag_pre_cie2             : { sheet: '017 ANVERSO', cell: 'BH10'},
  prot_diagnostico_pre3          : { sheet: '017 ANVERSO', cell: 'I11' },
  prot_diag_pre_cie3             : { sheet: '017 ANVERSO', cell: 'BH11'},

  prot_diagnostico_post1         : { sheet: '017 ANVERSO', cell: 'I12' },
  prot_diag_post_cie1            : { sheet: '017 ANVERSO', cell: 'BH12'},
  prot_diagnostico_post2         : { sheet: '017 ANVERSO', cell: 'I13' },
  prot_diag_post_cie2            : { sheet: '017 ANVERSO', cell: 'BH13'},
  prot_diagnostico_post3         : { sheet: '017 ANVERSO', cell: 'I14' },
  prot_diag_post_cie3            : { sheet: '017 ANVERSO', cell: 'BH14'},

  // C. PROCEDIMIENTO
  prot_electiva                  : { sheet: '017 ANVERSO', cell: 'AV16'},
  prot_emergencia                : { sheet: '017 ANVERSO', cell: 'BD16'},
  prot_urgencia                  : { sheet: '017 ANVERSO', cell: 'BK16'},

  prot_procedimiento_proyectado  : { sheet: '017 ANVERSO', cell: 'G17' },
  prot_procedimiento_realizado   : { sheet: '017 ANVERSO', cell: 'G19' },

  // D. INTEGRANTES DEL EQUIPO QUIRÚRGICO
  prot_cirujano1                 : { sheet: '017 ANVERSO', cell: 'G23' },
  prot_cirujano2                 : { sheet: '017 ANVERSO', cell: 'G24' },
  prot_primer_ayudante           : { sheet: '017 ANVERSO', cell: 'J25' },
  prot_segundo_ayudante          : { sheet: '017 ANVERSO', cell: 'J26' },
  prot_tercer_ayudante           : { sheet: '017 ANVERSO', cell: 'J27' },

  prot_instrumentista            : { sheet: '017 ANVERSO', cell: 'AP23'},
  prot_circulante                : { sheet: '017 ANVERSO', cell: 'AP24'},
  prot_anestesiologo             : { sheet: '017 ANVERSO', cell: 'AR25'},
  prot_ayudante_anestesia        : { sheet: '017 ANVERSO', cell: 'AR26'},
  prot_otros                     : { sheet: '017 ANVERSO', cell: 'AM27'},

  // E. TIPO DE ANESTESIA
  prot_anestesia_general         : { sheet: '017 ANVERSO', cell: 'AP29'},
  prot_anestesia_regional        : { sheet: '017 ANVERSO', cell: 'AX29'},
  prot_anestesia_sedacion        : { sheet: '017 ANVERSO', cell: 'BF29'},
  prot_anestesia_otros           : { sheet: '017 ANVERSO', cell: 'BK29'},

  // F. TIEMPOS QUIRÚRGICOS
  prot_fecha_operacion_dia       : { sheet: '017 ANVERSO', cell: 'U33' },
  prot_fecha_operacion_mes       : { sheet: '017 ANVERSO', cell: 'AB33'},
  prot_fecha_operacion_año       : { sheet: '017 ANVERSO', cell: 'AI33'},
  prot_hora_inicio               : { sheet: '017 ANVERSO', cell: 'AO33'},
  prot_hora_terminacion          : { sheet: '017 ANVERSO', cell: 'AY33'},

  prot_dieresis_1                : { sheet: '017 ANVERSO', cell: 'A35' },
  prot_dieresis_2                : { sheet: '017 ANVERSO', cell: 'A36' },
  prot_dieresis_3                : { sheet: '017 ANVERSO', cell: 'A37' },
  prot_dieresis_4                : { sheet: '017 ANVERSO', cell: 'A38' },
  prot_dieresis_5                : { sheet: '017 ANVERSO', cell: 'A39' },

  prot_exposicion_exploracion    : { sheet: '017 ANVERSO', cell: 'A41' },

  prot_hallazgos_quirurgicos_1   : { sheet: '017 ANVERSO', cell: 'A43' },
  prot_hallazgos_quirurgicos_2   : { sheet: '017 ANVERSO', cell: 'A44' },
  prot_hallazgos_quirurgicos_3   : { sheet: '017 ANVERSO', cell: 'A45' },
  prot_hallazgos_quirurgicos_4   : { sheet: '017 ANVERSO', cell: 'A46' },
  prot_hallazgos_quirurgicos_5   : { sheet: '017 ANVERSO', cell: 'A47' },

  prot_proced_quirurgico_1       : { sheet: '017 ANVERSO', cell: 'A49' },
  prot_proced_quirurgico_2       : { sheet: '017 ANVERSO', cell: 'A50' },
  prot_proced_quirurgico_3       : { sheet: '017 ANVERSO', cell: 'A51' },
  prot_proced_quirurgico_4       : { sheet: '017 ANVERSO', cell: 'A52' },
  prot_proced_quirurgico_5       : { sheet: '017 ANVERSO', cell: 'A53' },
  prot_proced_quirurgico_6       : { sheet: '017 ANVERSO', cell: 'A54' },
  prot_proced_quirurgico_7       : { sheet: '017 ANVERSO', cell: 'A55' },
  prot_proced_quirurgico_8       : { sheet: '017 ANVERSO', cell: 'A56' },
  prot_proced_quirurgico_9       : { sheet: '017 ANVERSO', cell: 'A57' },
  prot_proced_quirurgico_10      : { sheet: '017 ANVERSO', cell: 'A58' },
  prot_proced_quirurgico_11      : { sheet: '017 ANVERSO', cell: 'A59' },
  prot_proced_quirurgico_12      : { sheet: '017 ANVERSO', cell: 'A60' },
  prot_proced_quirurgico_13      : { sheet: '017 ANVERSO', cell: 'A61' },
  prot_proced_quirurgico_14      : { sheet: '017 ANVERSO', cell: 'A62' },
  prot_proced_quirurgico_15      : { sheet: '017 ANVERSO', cell: 'A63' },
  prot_proced_quirurgico_16      : { sheet: '017 ANVERSO', cell: 'A64' },

  // ─────────────────────────────────────────────────────────────────────────
  // 017 REVERSO
  // Continuación del Procedimiento Quirúrgico
  // ─────────────────────────────────────────────────────────────────────────
  prot_procedimiento_quirurgico_cont_1       : { sheet: '017 REVERSO', cell: 'A2' },
  prot_procedimiento_quirurgico_cont_2       : { sheet: '017 REVERSO', cell: 'A3' },
  prot_procedimiento_quirurgico_cont_3       : { sheet: '017 REVERSO', cell: 'A4' },
  prot_procedimiento_quirurgico_cont_4       : { sheet: '017 REVERSO', cell: 'A5' },
  prot_procedimiento_quirurgico_cont_5       : { sheet: '017 REVERSO', cell: 'A6' },
  prot_procedimiento_quirurgico_cont_6       : { sheet: '017 REVERSO', cell: 'A7' },
  prot_procedimiento_quirurgico_cont_7       : { sheet: '017 REVERSO', cell: 'A8' },
  prot_procedimiento_quirurgico_cont_8       : { sheet: '017 REVERSO', cell: 'A9' },
  prot_procedimiento_quirurgico_cont_9       : { sheet: '017 REVERSO', cell: 'A10'},
  prot_procedimiento_quirurgico_cont_10      : { sheet: '017 REVERSO', cell: 'A11'},
  prot_procedimiento_quirurgico_cont_11      : { sheet: '017 REVERSO', cell: 'A12'},
  prot_procedimiento_quirurgico_cont_12      : { sheet: '017 REVERSO', cell: 'A13'},
  prot_procedimiento_quirurgico_cont_13      : { sheet: '017 REVERSO', cell: 'A14'},
  prot_procedimiento_quirurgico_cont_14      : { sheet: '017 REVERSO', cell: 'A15'},
  prot_procedimiento_quirurgico_cont_15      : { sheet: '017 REVERSO', cell: 'A16'},
  prot_procedimiento_quirurgico_cont_16      : { sheet: '017 REVERSO', cell: 'A17'},
  prot_procedimiento_quirurgico_cont_17      : { sheet: '017 REVERSO', cell: 'A18'},
  prot_procedimiento_quirurgico_cont_18      : { sheet: '017 REVERSO', cell: 'A19'},
  prot_procedimiento_quirurgico_cont_19      : { sheet: '017 REVERSO', cell: 'A20'},
  prot_procedimiento_quirurgico_cont_20      : { sheet: '017 REVERSO', cell: 'A21'},

  // G. COMPLICACIONES DEL PROCEDIMIENTO QUIRÚRGICO
  prot_complicaciones            : { sheet: '017 REVERSO', cell: 'A24' },

  prot_perdida_sanguinea_total   : { sheet: '017 REVERSO', cell: 'M30' },
  prot_sangrado_aproximado       : { sheet: '017 REVERSO', cell: 'AI30'},
  prot_uso_material_protesico_si : { sheet: '017 REVERSO', cell: 'BE30'},
  prot_uso_material_protesico_no : { sheet: '017 REVERSO', cell: 'BI30'},

  prot_descripcion_complicaciones: { sheet: '017 REVERSO', cell: 'M32' },

  // H. EXÁMENES HISTOPATOLÓGICOS
  prot_transquirurgico           : { sheet: '017 REVERSO', cell: 'J36' },
  prot_biopsia_congelacion_si    : { sheet: '017 REVERSO', cell: 'N38' },
  prot_biopsia_congelacion_no    : { sheet: '017 REVERSO', cell: 'S38' },
  prot_resultado_biopsia         : { sheet: '017 REVERSO', cell: 'AB38'},
  prot_patologo_reporta          : { sheet: '017 REVERSO', cell: 'AB40'},

  prot_histopatologico_si        : { sheet: '017 REVERSO', cell: 'N42' },
  prot_histopatologico_no        : { sheet: '017 REVERSO', cell: 'S42' },
  prot_muestra_histopatologico   : { sheet: '017 REVERSO', cell: 'AB42'},

  // I. DIAGRAMA DEL PROCEDIMIENTO
  prot_diagrama                  : { sheet: '017 REVERSO', cell: 'A47' },

  // J. DATOS DEL PROFESIONAL RESPONSABLE
  prot_prof_nombre_apellidos_1   : { sheet: '017 REVERSO', cell: 'A64' },
  prot_prof_especialidad_1       : { sheet: '017 REVERSO', cell: 'P64' },
  prot_prof_firma_1              : { sheet: '017 REVERSO', cell: 'AJ64'},
  prot_prof_sello_documento_1    : { sheet: '017 REVERSO', cell: 'AW64'},

  prot_prof_nombre_apellidos_2   : { sheet: '017 REVERSO', cell: 'A65' },
  prot_prof_especialidad_2       : { sheet: '017 REVERSO', cell: 'P65' },
  prot_prof_firma_2              : { sheet: '017 REVERSO', cell: 'AJ65'},
  prot_prof_sello_documento_2    : { sheet: '017 REVERSO', cell: 'AW65'},

  prot_prof_nombre_apellidos_3   : { sheet: '017 REVERSO', cell: 'A66' },
  prot_prof_especialidad_3       : { sheet: '017 REVERSO', cell: 'P66' },
  prot_prof_firma_3              : { sheet: '017 REVERSO', cell: 'AJ66'},
  prot_prof_sello_documento_3    : { sheet: '017 REVERSO', cell: 'AW66'},

  prot_prof_nombre_apellidos_4   : { sheet: '017 REVERSO', cell: 'A67' },
  prot_prof_especialidad_4       : { sheet: '017 REVERSO', cell: 'P67' },
  prot_prof_firma_4              : { sheet: '017 REVERSO', cell: 'AJ67'},
  prot_prof_sello_documento_4    : { sheet: '017 REVERSO', cell: 'AW67'},
};
