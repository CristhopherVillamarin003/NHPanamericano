/**
 * Mapa de celdas para la plantilla de Historia Clínica (MSP)
 * Hoja: ANAMNESIS
 *
 */
export const HISTORIA_CLINICA_ANAMNESIS_MAP: Record<string, { sheet: string; cell: string }> = {
  // ─────────────────────────────────────────────────────────────────────────
  // A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE
  // Filas 1-7
  // ─────────────────────────────────────────────────────────────────────────
  institucion                    : { sheet: 'ANAMNESIS', cell: 'A3' },   // merge A2:O2
  unicodigo                      : { sheet: 'ANAMNESIS', cell: 'P3' },   // merge P2:U2
  establecimiento                : { sheet: 'ANAMNESIS', cell: 'V3' },   // merge V2:AI2
  numero_historia_clinica        : { sheet: 'ANAMNESIS', cell: 'AL3' },  // merge AJ2:BA2
  numero_archivo                 : { sheet: 'ANAMNESIS', cell: 'BD3' },  // merge BB2:BJ2

  primer_apellido                : { sheet: 'ANAMNESIS', cell: 'A6' },   // merge A4:O4
  segundo_apellido               : { sheet: 'ANAMNESIS', cell: 'R6' },   // merge P4:AC4
  primer_nombre                  : { sheet: 'ANAMNESIS', cell: 'AF6' },  // merge AD4:AO4
  segundo_nombre                 : { sheet: 'ANAMNESIS', cell: 'AP6' },  // merge AP4:BA4
  sexo                           : { sheet: 'ANAMNESIS', cell: 'BA6' },  // merge BB4:BC4
  edad                           : { sheet: 'ANAMNESIS', cell: 'BD6' },  // merge BD4:BE4

  // Condición de edad (H, D, M, A) SON CHECKBOX
  condicion_edad_h               : { sheet: 'ANAMNESIS', cell: 'BH6' },
  condicion_edad_d               : { sheet: 'ANAMNESIS', cell: 'BJ6' },
  condicion_edad_m               : { sheet: 'ANAMNESIS', cell: 'BL6' },
  condicion_edad_a               : { sheet: 'ANAMNESIS', cell: 'BN6' },

  // ─────────────────────────────────────────────────────────────────────────
  // B. MOTIVO DE CONSULTA
  // Filas 8-12
  // ─────────────────────────────────────────────────────────────────────────
  motivo_consulta_1              : { sheet: 'ANAMNESIS', cell: 'B9' },
  motivo_consulta_2              : { sheet: 'ANAMNESIS', cell: 'B10' },
  motivo_consulta_3              : { sheet: 'ANAMNESIS', cell: 'B11' },
  motivo_consulta_4              : { sheet: 'ANAMNESIS', cell: 'AK9' },
  motivo_consulta_5              : { sheet: 'ANAMNESIS', cell: 'AK10' },
  motivo_consulta_6              : { sheet: 'ANAMNESIS', cell: 'AK11' },

  // ─────────────────────────────────────────────────────────────────────────
  // C. ANTECEDENTES PATOLÓGICOS PERSONALES (CHECKBOX)
  // Filas 13-29
  // ─────────────────────────────────────────────────────────────────────────
  // 1. ALERGIA A MEDICAMENTOS
  alergia_medicamentos           : { sheet: 'ANAMNESIS', cell: 'O14' },   // campo de texto
  // 2. OTRAS ALERGIAS
  otras_alergias                 : { sheet: 'ANAMNESIS', cell: 'AA14' },
  // 3. VACUNAS
  vacunas                        : { sheet: 'ANAMNESIS', cell: 'AI14' },
  // 4. PATOLOGÍAS CLÍNICAS
  patologias_clinicas            : { sheet: 'ANAMNESIS', cell: 'AT14' },
  // 5. MEDICACIÓN HABITUAL
  medicacion_habitual            : { sheet: 'ANAMNESIS', cell: 'BD14' },
  // 6. QUIRÚRGICOS
  quirurgicos                    : { sheet: 'ANAMNESIS', cell: 'BN14' },

  // 7. HÁBITOS
  habitos                        : { sheet: 'ANAMNESIS', cell: 'H15' },
  // 8. CONDICIÓN SOCIO ECONÓMICA
  condicion_socioeconomica       : { sheet: 'ANAMNESIS', cell: 'Z15' },
  // 9. DISCAPACIDAD
  discapacidad                   : { sheet: 'ANAMNESIS', cell: 'AM15' },
  // 10. RELIGIÓN
  religion                       : { sheet: 'ANAMNESIS', cell: 'AX15' },
  // 11. TIPIFICACIÓN SANGUÍNEA
  tipificacion_sanguinea         : { sheet: 'ANAMNESIS', cell: 'BN15' },

  // Gineco-Obstétricos / Andrológicos
  edad_menarquia                 : { sheet: 'ANAMNESIS', cell: 'N16' },
  edad_menopausia                : { sheet: 'ANAMNESIS', cell: 'Y16' },
  ciclos                         : { sheet: 'ANAMNESIS', cell: 'AI16' },
  edad_inicio_vida_sexual        : { sheet: 'ANAMNESIS', cell: 'AU16' },
  numero_gestas                  : { sheet: 'ANAMNESIS', cell: 'BC16' },
  numero_partos                  : { sheet: 'ANAMNESIS', cell: 'BL16' },

  numero_abortos                 : { sheet: 'ANAMNESIS', cell: 'N17' },
  numero_cesareas                : { sheet: 'ANAMNESIS', cell: 'Y17' },
  numero_hijos_vivos             : { sheet: 'ANAMNESIS', cell: 'AI17' },
  fecha_ultima_menstruacion      : { sheet: 'ANAMNESIS', cell: 'AY17' },
  fecha_ultimo_parto             : { sheet: 'ANAMNESIS', cell: 'BM17' },

  fecha_ultima_citologia         : { sheet: 'ANAMNESIS', cell: 'S18' },
  fecha_ultima_colposcopia       : { sheet: 'ANAMNESIS', cell: 'AN18' },
  fecha_ultima_mamografia        : { sheet: 'ANAMNESIS', cell: 'BH18' },

  metodo_planificacion_familiar  : { sheet: 'ANAMNESIS', cell: 'AD19' },
  terapia_hormonal               : { sheet: 'ANAMNESIS', cell: 'BF19' },

  fecha_ultimo_antigeno_prostatico : { sheet: 'ANAMNESIS', cell: 'Z20' },
  fecha_ultimo_eco_prostatico    : { sheet: 'ANAMNESIS', cell: 'BA20' },
  desc_antecedentes_personales   : { sheet: 'ANAMNESIS', cell: 'A21' },

  // ─────────────────────────────────────────────────────────────────────────
  // D. ANTECEDENTES PATOLÓGICOS FAMILIARES (CHECKBOX)
  // Fila 31
  // ─────────────────────────────────────────────────────────────────────────
  antecedentes_familiares_cardiopatia      : { sheet: 'ANAMNESIS', cell: 'F31' },
  antecedentes_familiares_hipertension     : { sheet: 'ANAMNESIS', cell: 'N31' },
  antecedentes_familiares_enf_cvascular    : { sheet: 'ANAMNESIS', cell: 'T31' },
  antecedentes_familiares_endocrino        : { sheet: 'ANAMNESIS', cell: 'AA31' },
  antecedentes_familiares_cancer           : { sheet: 'ANAMNESIS', cell: 'AG31' },
  antecedentes_familiares_tuberculosis     : { sheet: 'ANAMNESIS', cell: 'AO31' },
  antecedentes_familiares_enf_mental       : { sheet: 'ANAMNESIS', cell: 'AT31' },
  antecedentes_familiares_enf_infecciosa   : { sheet: 'ANAMNESIS', cell: 'BA31' },
  antecedentes_familiares_malformacion     : { sheet: 'ANAMNESIS', cell: 'BH31' },
  antecedentes_familiares_otro             : { sheet: 'ANAMNESIS', cell: 'BN31' },
  desc_antecedentes_familiares             : { sheet: 'ANAMNESIS', cell: 'A32' }, //texto

  // ─────────────────────────────────────────────────────────────────────────
  // E. ENFERMEDAD O PROBLEMA ACTUAL
  // Filas 36-48 (cuadro grande de texto)
  // ─────────────────────────────────────────────────────────────────────────
  enfermedad_actual                  : { sheet: 'ANAMNESIS', cell: 'A37' }, // área grande de texto

  // ─────────────────────────────────────────────────────────────────────────
  // F. REVISIÓN ACTUAL DE ÓRGANOS Y SISTEMAS (CHECKBOX)
  // Filas 49-57
  // ─────────────────────────────────────────────────────────────────────────
  revision_piel_anexos               : { sheet: 'ANAMNESIS', cell: 'M50' },
  revision_sentidos                  : { sheet: 'ANAMNESIS', cell: 'M51' },
  revision_respiratorio              : { sheet: 'ANAMNESIS', cell: 'Z50' },
  revision_cardiovascular            : { sheet: 'ANAMNESIS', cell: 'Z51' },
  revision_digestivo                 : { sheet: 'ANAMNESIS', cell: 'AM50' },
  revision_genitourinario            : { sheet: 'ANAMNESIS', cell: 'AM51' },
  revision_musculo_esqueletico       : { sheet: 'ANAMNESIS', cell: 'BB50' },
  revision_endocrino                 : { sheet: 'ANAMNESIS', cell: 'BB51' },
  revision_hemo_linatico             : { sheet: 'ANAMNESIS', cell: 'BN50' },
  revision_nervioso                  : { sheet: 'ANAMNESIS', cell: 'BN51' },
  desc_revision_organos              : { sheet: 'ANAMNESIS', cell: 'A52' },
  
  //DATOS DEL USUARIO/PACIENTE

  dato_primer_apellido               : { sheet: 'ANAMNESIS', cell: 'A63' },   
  dato_primer_nombre                 : { sheet: 'ANAMNESIS', cell: 'P63' },   
  dato_primer_edad                   : { sheet: 'ANAMNESIS', cell: 'AF63' },  
  dato_historia_clinica              : { sheet: 'ANAMNESIS', cell: 'AJ63' },  
  dato_num_archivo                   : { sheet: 'ANAMNESIS', cell: 'BD63' }, 

  // ─────────────────────────────────────────────────────────────────────────
  // G. CONSTANTES VITALES Y ANTROPOMETRÍA
  // Fila 66
  // ─────────────────────────────────────────────────────────────────────────
  temperatura                        : { sheet: 'ANAMNESIS', cell: 'A67' },
  presion_arterial                   : { sheet: 'ANAMNESIS', cell: 'I67' },
  pulso                              : { sheet: 'ANAMNESIS', cell: 'Q67' },
  frecuencia_respiratoria            : { sheet: 'ANAMNESIS', cell: 'X67' },
  peso                               : { sheet: 'ANAMNESIS', cell: 'AF67' },
  talla                              : { sheet: 'ANAMNESIS', cell: 'AM67' },
  imc                                : { sheet: 'ANAMNESIS', cell: 'AT67' },
  perimetro_cefálico                 : { sheet: 'ANAMNESIS', cell: 'AZ67' },
  pulsioximetria                     : { sheet: 'ANAMNESIS', cell: 'BG67' },
  score_mama                         : { sheet: 'ANAMNESIS', cell: 'G68' },
  constantes_otros                   : { sheet: 'ANAMNESIS', cell: 'S68' },

  // ─────────────────────────────────────────────────────────────────────────
  // H. EXAMEN FÍSICO (CHECKBOX)
  // Filas 70-87 (Regional + Sistémico)
  // ─────────────────────────────────────────────────────────────────────────
  // REGIONAL
  ef_piel_faneras                    : { sheet: 'ANAMNESIS', cell: 'K72' },
  ef_cabeza                          : { sheet: 'ANAMNESIS', cell: 'K73' },
  ef_ojos                            : { sheet: 'ANAMNESIS', cell: 'K74' },
  ef_oidos                           : { sheet: 'ANAMNESIS', cell: 'K75' },
  ef_nariz                           : { sheet: 'ANAMNESIS', cell: 'K76' },
  ef_boca                            : { sheet: 'ANAMNESIS', cell: 'W72' },
  ef_orofaringe                      : { sheet: 'ANAMNESIS', cell: 'W73' },
  ef_cuello                          : { sheet: 'ANAMNESIS', cell: 'W74' },
  ef_axilas_mamas                    : { sheet: 'ANAMNESIS', cell: 'W75' },
  ef_torax                           : { sheet: 'ANAMNESIS', cell: 'W76' },
  ef_abdomen                         : { sheet: 'ANAMNESIS', cell: 'AK72' },
  ef_columna                         : { sheet: 'ANAMNESIS', cell: 'AK73' },
  ef_ingle_perine                    : { sheet: 'ANAMNESIS', cell: 'AK74' },
  ef_miem_superiores                 : { sheet: 'ANAMNESIS', cell: 'AK75' },
  ef_miem_inferiores                 : { sheet: 'ANAMNESIS', cell: 'AK76' },

  // SISTÉMICO
  ef_sentidos                        : { sheet: 'ANAMNESIS', cell: 'AY72' },
  ef_respiratorio                    : { sheet: 'ANAMNESIS', cell: 'AY73' },
  ef_cardiovascular                  : { sheet: 'ANAMNESIS', cell: 'AY74' },
  ef_digestivo                       : { sheet: 'ANAMNESIS', cell: 'AY75' },
  ef_genital                         : { sheet: 'ANAMNESIS', cell: 'AY76' },
  ef_urinario                        : { sheet: 'ANAMNESIS', cell: 'BN72' },
  ef_musculo_esqueletico             : { sheet: 'ANAMNESIS', cell: 'BN73' },
  ef_endocrino                       : { sheet: 'ANAMNESIS', cell: 'BN74' },
  ef_hemo_linatico                   : { sheet: 'ANAMNESIS', cell: 'BN75' },
  ef_neurologico                     : { sheet: 'ANAMNESIS', cell: 'BN76' },

  desc_examen_fisico                 : { sheet: 'ANAMNESIS', cell: 'A77' },
  img_examen_fisico                  : { sheet: 'ANAMNESIS', cell: 'AN77' },

  // ─────────────────────────────────────────────────────────────────────────
  // I. ANÁLISIS
  // Filas 88-92
  // ─────────────────────────────────────────────────────────────────────────
  analisis                           : { sheet: 'ANAMNESIS', cell: 'A89' }, // cuadro grande

  // ─────────────────────────────────────────────────────────────────────────
  // J. DIAGNÓSTICO
  // Fila 94
  // ─────────────────────────────────────────────────────────────────────────
  diagnostico_1                      : { sheet: 'ANAMNESIS', cell: 'B94' },
  diagnostico_1_cie                  : { sheet: 'ANAMNESIS', cell: 'AA94' },
  diagnostico_1_pre                  : { sheet: 'ANAMNESIS', cell: 'AE94' },
  diagnostico_1_def                  : { sheet: 'ANAMNESIS', cell: 'AG94' },

  diagnostico_2                      : { sheet: 'ANAMNESIS', cell: 'B95' },
  diagnostico_2_cie                  : { sheet: 'ANAMNESIS', cell: 'AA95' },
  diagnostico_2_pre                  : { sheet: 'ANAMNESIS', cell: 'AE95' },
  diagnostico_2_def                  : { sheet: 'ANAMNESIS', cell: 'AG95' },

  diagnostico_3                      : { sheet: 'ANAMNESIS', cell: 'B96' },
  diagnostico_3_cie                  : { sheet: 'ANAMNESIS', cell: 'AA96' },
  diagnostico_3_pre                  : { sheet: 'ANAMNESIS', cell: 'AE96' },
  diagnostico_3_def                  : { sheet: 'ANAMNESIS', cell: 'AG96' },

  diagnostico_4                      : { sheet: 'ANAMNESIS', cell: 'AJ94' },
  diagnostico_4_cie                  : { sheet: 'ANAMNESIS', cell: 'BH94' },
  diagnostico_4_pre                  : { sheet: 'ANAMNESIS', cell: 'BL94' },
  diagnostico_4_def                  : { sheet: 'ANAMNESIS', cell: 'BN94' },

  diagnostico_5                      : { sheet: 'ANAMNESIS', cell: 'AJ95' },
  diagnostico_5_cie                  : { sheet: 'ANAMNESIS', cell: 'BH95' },
  diagnostico_5_pre                  : { sheet: 'ANAMNESIS', cell: 'BL95' },
  diagnostico_5_def                  : { sheet: 'ANAMNESIS', cell: 'BN95' },

  diagnostico_6                      : { sheet: 'ANAMNESIS', cell: 'AJ96' },
  diagnostico_6_cie                  : { sheet: 'ANAMNESIS', cell: 'BH96' },
  diagnostico_6_pre                  : { sheet: 'ANAMNESIS', cell: 'BL96' },
  diagnostico_6_def                  : { sheet: 'ANAMNESIS', cell: 'BN96' },

  // ─────────────────────────────────────────────────────────────────────────
  // K. PLAN DE TRATAMIENTO
  // Filas 98-117 (área grande)
  // ─────────────────────────────────────────────────────────────────────────
  plan_tratamiento                   : { sheet: 'ANAMNESIS', cell: 'A99' },

  // ─────────────────────────────────────────────────────────────────────────
  // L. DATOS DEL PROFESIONAL RESPONSABLE
  // Filas 118-122
  // ─────────────────────────────────────────────────────────────────────────
  fecha_atencion                     : { sheet: 'ANAMNESIS', cell: 'A119' },
  hora_atencion                      : { sheet: 'ANAMNESIS', cell: 'I119' },
  profesional_primer_nombre          : { sheet: 'ANAMNESIS', cell: 'O119' },
  profesional_primer_apellido        : { sheet: 'ANAMNESIS', cell: 'AI119' },
  profesional_segundo_apellido       : { sheet: 'ANAMNESIS', cell: 'BA119' },
  profesional_documento              : { sheet: 'ANAMNESIS', cell: 'A121' },

};
