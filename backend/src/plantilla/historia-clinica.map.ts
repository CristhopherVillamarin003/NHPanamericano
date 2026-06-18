/**
 * Mapa de celdas para la plantilla de Historia Clínica (MSP)
 * Hoja: EMERGENCIA
 */
export const HISTORIA_CLINICA_MAP: Record<string, { sheet: string; cell: string }> = {


  // ─────────────────────────────────────────────────────────────────────────
  // A. DATOS DEL ESTABLECIMIENTO
  // Filas 1-4
  // ─────────────────────────────────────────────────────────────────────────
  institucion                    : { sheet: 'EMERGENCIA', cell: 'A3' },   // merge A3:O3    — INSTITUCIÓN DEL SISTEMA   (auto)
  unicodigo                      : { sheet: 'EMERGENCIA', cell: 'P3' },   // merge P2:U2    — UNICÓDIGO
  establecimiento                : { sheet: 'EMERGENCIA', cell: 'V3' },   // merge V2:AJ2   — ESTABLECIMIENTO DE SALUD
  numero_historia_clinica        : { sheet: 'EMERGENCIA', cell: 'AK3' },  // merge AK2:BB2  — NÚMERO DE HISTORIA CLÍNICA ÚNICA (auto)
  numero_archivo                 : { sheet: 'EMERGENCIA', cell: 'BC3' },  // merge BC2:BM2  — NÚMERO DE ARCHIVO

  // ─────────────────────────────────────────────────────────────────────────
  // B. REGISTRO DE ADMISIÓN
  // Filas 5-30
  // ─────────────────────────────────────────────────────────────────────────
  fecha_admision                 : { sheet: 'EMERGENCIA', cell: 'A7' },   // merge A7:AC7   — FECHA DE ADMISIÓN (aaaa-mm-dd)
  nombre_admisionista            : { sheet: 'EMERGENCIA', cell: 'AD7' },  // merge AD7:BC7  — NOMBRE Y APELLIDO DEL ADMISIONISTA

  // Historia clínica en establecimiento — CHECKBOX (escribir 'X')
  hc_establecimiento_si          : { sheet: 'EMERGENCIA', cell: 'BF7' },  // merge BD7:BE7  — SI
  hc_establecimiento_no          : { sheet: 'EMERGENCIA', cell: 'BK7' },  // merge BI7:BJ7  — NO

  // Datos del paciente (auto desde hospital.paciente)
  primer_apellido                : { sheet: 'EMERGENCIA', cell: 'A10' },   // merge A8:O9    (auto)
  segundo_apellido               : { sheet: 'EMERGENCIA', cell: 'P10' },   // merge P8:AC9   (auto)
  primer_nombre                  : { sheet: 'EMERGENCIA', cell: 'AD10' },  // merge AD8:AO9  (auto)
  segundo_nombre                 : { sheet: 'EMERGENCIA', cell: 'AP10' },  // merge AP8:BA9  (auto)

  // Tipo de documento — CHECKBOX (escribir 'X' en el que corresponda)
  tipo_doc_cc_ci                 : { sheet: 'EMERGENCIA', cell: 'BB10' },  // merge BB9:BD9  — CC/CI
  tipo_doc_pas                   : { sheet: 'EMERGENCIA', cell: 'BE10' },  // merge BE9:BG9  — PAS.
  tipo_doc_carne                 : { sheet: 'EMERGENCIA', cell: 'BH10' },  // merge BH9:BJ9  — CARNÉ
  tipo_doc_sd                    : { sheet: 'EMERGENCIA', cell: 'BK10' },  // merge BK9:BM9  — S/D

  // Estado civil — CHECKBOX (escribir 'X' en el que corresponda)
  estado_civil_sol               : { sheet: 'EMERGENCIA', cell: 'A13' },  // merge A12:B12  — SOL (soltero)
  estado_civil_cas               : { sheet: 'EMERGENCIA', cell: 'C13' },  // merge C12:D12  — CAS (casado)
  estado_civil_div               : { sheet: 'EMERGENCIA', cell: 'E13' },  // merge E12:F12  — DIV (divorciado)
  estado_civil_viu               : { sheet: 'EMERGENCIA', cell: 'G13' },  // merge G12:H12  — VIU (viudo)
  estado_civil_un                : { sheet: 'EMERGENCIA', cell: 'I13' },  // merge I12:J12  — UN  (unión libre)
  estado_civil_uh                : { sheet: 'EMERGENCIA', cell: 'K13' },  // merge K12:L12  — U-H (unión de hecho)
  estado_civil_na                : { sheet: 'EMERGENCIA', cell: 'M13' },  // merge M12:N12  — NA  (no aplica)

  sexo                           : { sheet: 'EMERGENCIA', cell: 'O13' },  // merge O11:S12  — SEXO                      (auto)
  telefono_fijo                  : { sheet: 'EMERGENCIA', cell: 'T13' },  // merge T11:AE12 — Nº TELÉFONO FIJO
  telefono_celular               : { sheet: 'EMERGENCIA', cell: 'AF13' }, // merge AF11:AT12 — Nº TELÉFONO CELULAR
  fecha_nacimiento               : { sheet: 'EMERGENCIA', cell: 'AU13' }, // merge AU11:BM12 — FECHA DE NACIMIENTO       (auto)

  lugar_nacimiento               : { sheet: 'EMERGENCIA', cell: 'A16' },  // merge A14:Q15  — LUGAR DE NACIMIENTO
  nacionalidad                   : { sheet: 'EMERGENCIA', cell: 'R16' },  // merge R14:AG15 — NACIONALIDAD
  edad                           : { sheet: 'EMERGENCIA', cell: 'AH16' }, // merge AH14:AL15 — EDAD                     (auto)

  // Condición edad — CHECKBOX (escribir 'X' en el que corresponda)
  condicion_edad_h               : { sheet: 'EMERGENCIA', cell: 'AM16' }, // merge AM15:AN15 — H (horas)
  condicion_edad_d               : { sheet: 'EMERGENCIA', cell: 'AO16' }, // merge AO15:AP15 — D (días)
  condicion_edad_m               : { sheet: 'EMERGENCIA', cell: 'AQ16' }, // merge AQ15:AR15 — M (meses)
  condicion_edad_a               : { sheet: 'EMERGENCIA', cell: 'AS16' }, // merge AS15:AT15 — A (años)

  // Grupo prioritario — CHECKBOX
  grupo_prioritario_si           : { sheet: 'EMERGENCIA', cell: 'BH14' }, // merge BF14:BG14 — SI
  grupo_prioritario_no           : { sheet: 'EMERGENCIA', cell: 'BL14' }, // merge BJ14:BK14 — NO
  grupo_prioritario_especifique  : { sheet: 'EMERGENCIA', cell: 'BA15' },

  autoidentificacion_etnica      : { sheet: 'EMERGENCIA', cell: 'A18' }, // merge A17:N17  — AUTOIDENTIFICACIÓN ÉTNICA
  nacionalidad_etnica            : { sheet: 'EMERGENCIA', cell: 'O18' },  // merge O17:AG17 — NACIONALIDAD ÉTNICA
  pueblos                        : { sheet: 'EMERGENCIA', cell: 'AH18' }, // merge AH17:AW17 — *PUEBLOS
  nivel_educacion                : { sheet: 'EMERGENCIA', cell: 'AX18' }, // merge AX17:BM17 — NIVEL DE EDUCACIÓN

  estado_nivel_educacion         : { sheet: 'EMERGENCIA', cell: 'A21' },  // merge A19:O20  — ESTADO DEL NIVEL DE EDUCACIÓN
  tipo_empresa_trabajo           : { sheet: 'EMERGENCIA', cell: 'P21' },  // merge P19:AD20 — TIPO DE EMPRESA DE TRABAJO
  ocupacion_profesion            : { sheet: 'EMERGENCIA', cell: 'AE21' }, // merge AE19:AU20 — OCUPACIÓN / PROFESIÓN

  // Seguro de salud — CHECKBOX (escribir 'X' en el que corresponda)
  seguro_iess_g                  : { sheet: 'EMERGENCIA', cell: 'AV21' }, // merge AV20:AX20 — IESS-G
  seguro_iess_c                  : { sheet: 'EMERGENCIA', cell: 'AY21' }, // merge AY20:BA20 — IESS-C
  seguro_isspol                  : { sheet: 'EMERGENCIA', cell: 'BB21' }, // merge BB20:BD20 — ISSPOL
  seguro_issfa                   : { sheet: 'EMERGENCIA', cell: 'BE21' }, // merge BE20:BG20 — ISSFA
  seguro_priv                    : { sheet: 'EMERGENCIA', cell: 'BH21' }, // merge BH20:BJ20 — PRIV.
  seguro_ning                    : { sheet: 'EMERGENCIA', cell: 'BK21' }, // merge BK20:BM20 — NING.

  // Residencia
  provincia                      : { sheet: 'EMERGENCIA', cell: 'G23' },  // merge G22:V22  — PROVINCIA
  canton                         : { sheet: 'EMERGENCIA', cell: 'W23' },  // merge W22:AH22 — CANTÓN
  parroquia                      : { sheet: 'EMERGENCIA', cell: 'AI23' }, // merge AI22:AS22 — PARROQUIA
  barrio_sector                  : { sheet: 'EMERGENCIA', cell: 'AT23' }, // merge AT22:BM22 — BARRIO O SECTOR
  calle_principal                : { sheet: 'EMERGENCIA', cell: 'G25' },  // merge G24:Y24  — CALLE PRINCIPAL
  calle_secundaria               : { sheet: 'EMERGENCIA', cell: 'Z25' },  // merge Z24:AR24 — CALLE SECUNDARIA
  referencia_domicilio           : { sheet: 'EMERGENCIA', cell: 'AS25' }, // merge AS24:BM24 — REFERENCIA

  // En caso necesario llamar a
  nombre_contacto                : { sheet: 'EMERGENCIA', cell: 'A27' },  // merge A27:U27  — (nombre del contacto)
  parentesco_contacto            : { sheet: 'EMERGENCIA', cell: 'V27' },  // merge V26:AD26 — PARENTESCO
  direccion_contacto             : { sheet: 'EMERGENCIA', cell: 'AE27' }, // merge AE26:BA26 — DIRECCIÓN
  telefono_contacto              : { sheet: 'EMERGENCIA', cell: 'BB27' }, // merge BB26:BM26 — Nº TELÉFONO

  // Forma de llegada — CHECKBOX (escribir 'X' en el que corresponda)
  llegada_ambulatorio            : { sheet: 'EMERGENCIA', cell: 'G29' },  // merge A29:F29  — AMBULATORIO
  llegada_ambulancia             : { sheet: 'EMERGENCIA', cell: 'O29' },  // merge I29:N29  — AMBULANCIA
  llegada_otro                   : { sheet: 'EMERGENCIA', cell: 'V29' },  // merge Q29:U29  — OTRO TRANSPORTE

  fuente_informacion             : { sheet: 'EMERGENCIA', cell: 'X29' },  // merge X28:AJ28 — FUENTE DE INFORMACIÓN
  institucion_entrega            : { sheet: 'EMERGENCIA', cell: 'AK29' }, // merge AK28:BB28 — INSTITUCIÓN O PERSONA QUE ENTREGA
  telefono_institucion           : { sheet: 'EMERGENCIA', cell: 'BC29' }, // merge BC28:BM28 — Nº TELÉFONO

  // ─────────────────────────────────────────────────────────────────────────
  // C. INICIO DE ATENCIÓN
  // Filas 31-34
  // ─────────────────────────────────────────────────────────────────────────
  fecha_inicio_atencion          : { sheet: 'EMERGENCIA', cell: 'H32' },  // merge A32:G32  — FECHA (aaaa-mm-dd)
  hora_inicio_atencion           : { sheet: 'EMERGENCIA', cell: 'W32' },  // merge R32:V32  — HORA (hh:mm)

  // Condición de llegada — CHECKBOX (escribir 'X')
  condicion_estable              : { sheet: 'EMERGENCIA', cell: 'AR32' }, // merge AM32:AQ32 — ESTABLE
  condicion_inestable            : { sheet: 'EMERGENCIA', cell: 'BA32' }, // merge AT32:AZ32 — INESTABLE
  condicion_fallecido            : { sheet: 'EMERGENCIA', cell: 'BL32' }, // merge BC32:BK32 — FALLECIDO

  motivo_atencion                : { sheet: 'EMERGENCIA', cell: 'H33' },  // merge H33:BM33 — MOTIVO DE ATENCIÓN

  // ─────────────────────────────────────────────────────────────────────────
  // D. ACCIDENTE, VIOLENCIA, INTOXICACIÓN
  // Filas 35-44
  // ─────────────────────────────────────────────────────────────────────────
  fecha_evento                   : { sheet: 'EMERGENCIA', cell: 'A37' },  // merge A36:G36  — FECHA (aaaa-mm-dd)
  hora_evento                    : { sheet: 'EMERGENCIA', cell: 'H37' },  // merge H36:N36  — HORA (hh:mm)
  lugar_evento                   : { sheet: 'EMERGENCIA', cell: 'O37' },  // merge O36:AD36 — LUGAR DEL EVENTO
  direccion_evento               : { sheet: 'EMERGENCIA', cell: 'AE37' }, // merge AE36:BE36 — DIRECCIÓN DEL EVENTO

  // Custodia policial — CHECKBOX
  custodia_policial_si           : { sheet: 'EMERGENCIA', cell: 'BH37' }, // merge BF37:BG37 — SI
  custodia_policial_no           : { sheet: 'EMERGENCIA', cell: 'BL37' }, // merge BJ37:BK37 — NO

  // Tipo de accidente — CHECKBOX (escribir 'X')
  accidente_transito             : { sheet: 'EMERGENCIA', cell: 'G38' },  // merge A38:F38
  accidente_caida                : { sheet: 'EMERGENCIA', cell: 'O38' },  // merge I38:N38
  accidente_quemadura            : { sheet: 'EMERGENCIA', cell: 'W38' },  // merge Q38:V38
  accidente_mordedura            : { sheet: 'EMERGENCIA', cell: 'AE38' },  // merge Y38:AD38
  accidente_ahogamiento          : { sheet: 'EMERGENCIA', cell: 'AM38' }, // merge AG38:AL38
  accidente_cuerpo_extrano       : { sheet: 'EMERGENCIA', cell: 'AU38' }, // merge AO38:AT38
  accidente_aplastamiento        : { sheet: 'EMERGENCIA', cell: 'BD38' }, // merge AW38:BC38
  accidente_otro                 : { sheet: 'EMERGENCIA', cell: 'BL38' }, // merge BF38:BK38

  // Tipo de violencia — CHECKBOX
  violencia_arma_fuego           : { sheet: 'EMERGENCIA', cell: 'G39' },  // merge A39:F40
  violencia_arma_punzante        : { sheet: 'EMERGENCIA', cell: 'O39' },  // merge I39:N40
  violencia_rina                 : { sheet: 'EMERGENCIA', cell: 'W39' },  // merge Q39:V40
  violencia_familiar             : { sheet: 'EMERGENCIA', cell: 'AE39' },  // merge Y39:AD40
  violencia_fisica               : { sheet: 'EMERGENCIA', cell: 'AM39' }, // merge AG39:AL40
  violencia_psicologica          : { sheet: 'EMERGENCIA', cell: 'AU39' }, // merge AO39:AT40
  violencia_sexual               : { sheet: 'EMERGENCIA', cell: 'BD39' }, // merge AW39:BC40

  // Notificación — CHECKBOX
  notificacion_si                : { sheet: 'EMERGENCIA', cell: 'BH40' }, // merge BF40:BG40 — SI
  notificacion_no                : { sheet: 'EMERGENCIA', cell: 'BL40' }, // merge BJ40:BK40 — NO

  // Tipo de intoxicación — CHECKBOX
  intox_alcoholica               : { sheet: 'EMERGENCIA', cell: 'G41' },  // merge A41:F41
  intox_alimentaria              : { sheet: 'EMERGENCIA', cell: 'O41' },  // merge I41:N41
  intox_drogas                   : { sheet: 'EMERGENCIA', cell: 'W41' },  // merge Q41:V41
  intox_gases                    : { sheet: 'EMERGENCIA', cell: 'AE41' },  // merge Y41:AD41
  intox_otra                     : { sheet: 'EMERGENCIA', cell: 'AM41' }, // merge AG41:AL41
  intox_picadura                 : { sheet: 'EMERGENCIA', cell: 'AU41' }, // merge AO41:AT41
  intox_envenenamiento           : { sheet: 'EMERGENCIA', cell: 'BD41' }, // merge AW41:BC41
  intox_anafilaxia               : { sheet: 'EMERGENCIA', cell: 'BL41' }, // merge BF41:BK41

  observaciones_accidente        : { sheet: 'EMERGENCIA', cell: 'I42' },  // merge I42:BM42 — OBSERVACIONES
  aliento_alcoholico             : { sheet: 'EMERGENCIA', cell: 'BL44' }, // merge BC44:BK44 — SUGESTIVO DE ALIENTO ALCOHÓLICO (checkbox)

  // ─────────────────────────────────────────────────────────────────────────
  // E. ANTECEDENTES PATOLÓGICOS PERSONALES Y FAMILIARES
  // Filas 46-57
  // Nota: Son 10 checkboxes numerados + área libre de descripción
  // ─────────────────────────────────────────────────────────────────────────
  antecedente_1_alergicos        : { sheet: 'EMERGENCIA', cell: 'J47' },  // merge A47:I47   — 1. ALÉRGICOS       (checkbox X)
  antecedente_2_clinicos         : { sheet: 'EMERGENCIA', cell: 'J48' },  // merge A48:I48   — 2. CLÍNICOS        (checkbox X)
  antecedente_3_ginecologicos    : { sheet: 'EMERGENCIA', cell: 'V47' },  // merge L47:U47   — 3. GINECOLÓGICOS   (checkbox X)
  antecedente_4_traumatologicos  : { sheet: 'EMERGENCIA', cell: 'V48' }, // merge L48:U48   — 4. TRAUMATOLÓGICOS (checkbox X)
  antecedente_5_pediatricos      : { sheet: 'EMERGENCIA', cell: 'AJ47' },  // merge X47:AI47  — 5. PEDIÁTRICOS     (checkbox X)
  antecedente_6_quirurgicos      : { sheet: 'EMERGENCIA', cell: 'AJ48' },  // merge X48:AI48  — 6. QUIRÚRGICOS     (checkbox X)
  antecedente_7_farmacologicos   : { sheet: 'EMERGENCIA', cell: 'AY47' }, // merge AL47:AX47 — 7. FARMACOLÓGICOS  (checkbox X)
  antecedente_8_habitos          : { sheet: 'EMERGENCIA', cell: 'AY48' }, // merge AL48:AX48 — 8. HÁBITOS         (checkbox X)
  antecedente_9_familiares       : { sheet: 'EMERGENCIA', cell: 'BL47' }, // merge BA47:BK47 — 9. FAMILIARES      (checkbox X)
  antecedente_10_otros           : { sheet: 'EMERGENCIA', cell: 'BL48' }, // merge BA48:BK48 — 10. OTROS          (checkbox X)
  antecedentes_no_aplica         : { sheet: 'EMERGENCIA', cell: 'BL46' }, // merge BI46:BK46 — NO APLICA          (checkbox X)
  // Área de descripción de antecedentes (filas 49-57, texto libre)
  antecedentes_descripcion       : { sheet: 'EMERGENCIA', cell: 'A49' },  // merge A49:BM49  — área de descripción

  // ─────────────────────────────────────────────────────────────────────────
  // F. ENFERMEDAD O PROBLEMA ACTUAL
  // Filas 58-64
  // ─────────────────────────────────────────────────────────────────────────
  enfermedad_actual              : { sheet: 'EMERGENCIA', cell: 'A59' },  // merge A59:BM59 — descripción texto libre
  // Referencia: CRONOLOGÍA - LOCALIZACIÓN - CARACTERÍSTICAS - INTENSIDAD - FRECUENCIA

  // ─────────────────────────────────────────────────────────────────────────
  // G. CONSTANTES VITALES Y ANTROPOMETRÍA
  // Filas 68-72
  // ─────────────────────────────────────────────────────────────────────────
  sin_constantes_vitales         : { sheet: 'EMERGENCIA', cell: 'L69' },  // merge A69:K69  — SIN CONSTANTES VITALES (checkbox X)
  presion_arterial               : { sheet: 'EMERGENCIA', cell: 'W69' },  // merge W69:AE69 — PRESIÓN ARTERIAL (mmHg)
  pulso                          : { sheet: 'EMERGENCIA', cell: 'AO69' }, // merge AF69:AN69 — PULSO / min
  frecuencia_respiratoria        : { sheet: 'EMERGENCIA', cell: 'BG69' }, // merge AU69:BF69 — FRECUENCIA RESPIRATORIA / min
  pulsioximetria                 : { sheet: 'EMERGENCIA', cell: 'K70' },  // merge A70:J70  — PULSIOXIMETRÍA (%)
  perimetro_cefalico             : { sheet: 'EMERGENCIA', cell: 'W70' },  // merge W70:AE70 — PERÍMETRO CEFÁLICO (cm)
  peso                           : { sheet: 'EMERGENCIA', cell: 'AJ70' }, // merge AF70:AI70 — PESO (kg)
  talla                          : { sheet: 'EMERGENCIA', cell: 'AR70' }, // merge AO70:AQ70 — TALLA (cm)
  glicemia_capilar               : { sheet: 'EMERGENCIA', cell: 'BG70' }, // merge AZ70:BF70 — GLICEMIA CAPILAR (mg/dl)

  // Glasgow
  glasgow_ocular                 : { sheet: 'EMERGENCIA', cell: 'L71' },  // merge H71:K71  — OCULAR (4)
  glasgow_verbal                 : { sheet: 'EMERGENCIA', cell: 'V71' },  // merge R71:U71  — VERBAL (5)
  glasgow_motora                 : { sheet: 'EMERGENCIA', cell: 'AF71' }, // merge AB71:AE71 — MOTORA (6)
  reaccion_pupila_der            : { sheet: 'EMERGENCIA', cell: 'AQ71' }, // merge AL71:AP71 — REACCIÓN PUPILA DER.
  reaccion_pupila_izq            : { sheet: 'EMERGENCIA', cell: 'AY71' }, // merge AT71:AX71 — REACCIÓN PUPILA IZQ.
  llenado_capilar                : { sheet: 'EMERGENCIA', cell: 'BG71' }, // merge BB71:BF71 — T. LLENADO CAPILAR

  // ─────────────────────────────────────────────────────────────────────────
  // H. EXAMEN FÍSICO
  // Filas 73-82
  // Cada ítem: escribir 'X' si presenta patología y describir en el área
  // ─────────────────────────────────────────────────────────────────────────
  examen_piel_faneras            : { sheet: 'EMERGENCIA', cell: 'K74' },  // merge C74:J74  — 1. PIEL - FANERAS   (checkbox X)
  examen_oidos                   : { sheet: 'EMERGENCIA', cell: 'W74' },  // merge O74:V74  — 4. OÍDOS            (checkbox X)
  examen_oro_faringe             : { sheet: 'EMERGENCIA', cell: 'AJ74' }, // merge AA74:AI74 — 7. ORO FARINGE     (checkbox X)
  examen_torax                   : { sheet: 'EMERGENCIA', cell: 'AW74' }, // merge AN74:AV74 — 10. TÓRAX          (checkbox X)
  examen_ingle_perine            : { sheet: 'EMERGENCIA', cell: 'BL74' }, // merge BA74:BK74 — 13. INGLE-PERINÉ   (checkbox X)
  examen_cabeza                  : { sheet: 'EMERGENCIA', cell: 'K75' },  // merge C75:J75  — 2. CABEZA           (checkbox X)
  examen_nariz                   : { sheet: 'EMERGENCIA', cell: 'W75' },  // merge O75:V75  — 5. NARIZ            (checkbox X)
  examen_cuello                  : { sheet: 'EMERGENCIA', cell: 'AJ75' }, // merge AA75:AI75 — 8. CUELLO          (checkbox X)
  examen_abdomen                 : { sheet: 'EMERGENCIA', cell: 'AW75' }, // merge AN75:AV75 — 11. ABDOMEN        (checkbox X)
  examen_miembros_sup            : { sheet: 'EMERGENCIA', cell: 'BL75' }, // merge BA75:BK75 — 14. MIEMBROS SUP.  (checkbox X)
  examen_ojos                    : { sheet: 'EMERGENCIA', cell: 'K76' },  // merge C76:J76  — 3. OJOS             (checkbox X)
  examen_boca                    : { sheet: 'EMERGENCIA', cell: 'W76' },  // merge O76:V76  — 6. BOCA             (checkbox X)
  examen_axilas_mamas            : { sheet: 'EMERGENCIA', cell: 'AJ76' }, // merge AA76:AI76 — 9. AXILAS-MAMAS    (checkbox X)
  examen_columna                 : { sheet: 'EMERGENCIA', cell: 'AW76' }, // merge AN76:AV76 — 12. COLUMNA VERT.  (checkbox X)
  examen_miembros_inf            : { sheet: 'EMERGENCIA', cell: 'BL76' }, // merge BA76:BK76 — 15. MIEMBROS INF.  (checkbox X)
  // Área de descripción examen físico (filas 77-82, texto libre)
  examen_fisico_descripcion      : { sheet: 'EMERGENCIA', cell: 'A77' }, // merge A77:BM77

  // ─────────────────────────────────────────────────────────────────────────
  // I. EXAMEN FÍSICO DE TRAUMA / CRÍTICO
  // Filas 83-87 (área libre)
  // ─────────────────────────────────────────────────────────────────────────
  examen_trauma_critico          : { sheet: 'EMERGENCIA', cell: 'A84' },  // merge A84:BM84

  // ─────────────────────────────────────────────────────────────────────────
  // J. EMBARAZO - PARTO
  // Filas 88-95
  // ─────────────────────────────────────────────────────────────────────────
  embarazo_no_aplica             : { sheet: 'EMERGENCIA', cell: 'BL88' }, // merge BC88:BK88 — NO APLICA (checkbox X)
  numero_gestas                  : { sheet: 'EMERGENCIA', cell: 'F89' },  // merge A89:E89
  numero_partos                  : { sheet: 'EMERGENCIA', cell: 'O89' },  // merge J89:N89
  numero_abortos                 : { sheet: 'EMERGENCIA', cell: 'W89' },  // merge S89:V89
  numero_cesareas                : { sheet: 'EMERGENCIA', cell: 'AF89' }, // merge AA89:AE89
  fum                            : { sheet: 'EMERGENCIA', cell: 'AO89' }, // merge AJ89:AN89 — FUM (fecha última menstruación)
  semanas_gestacion              : { sheet: 'EMERGENCIA', cell: 'AY89' }, // merge AS89:AX89
  movimiento_fetal               : { sheet: 'EMERGENCIA', cell: 'BJ89' }, // merge BC89:BI89
  frecuencia_cardiaca_fetal      : { sheet: 'EMERGENCIA', cell: 'J90' }, // merge A90:I90
  ruptura_membranas              : { sheet: 'EMERGENCIA', cell: 'W90' },  // merge O90:V90
  tiempo_ruptura                 : { sheet: 'EMERGENCIA', cell: 'AF90' }, // merge AA90:AE90
  afu                            : { sheet: 'EMERGENCIA', cell: 'AO90' }, // merge AJ90:AN90
  presentacion                   : { sheet: 'EMERGENCIA', cell: 'AZ90' }, // merge AS90:AY90
  dilatacion                     : { sheet: 'EMERGENCIA', cell: 'J91' },  // merge A91:I91
  borramiento                    : { sheet: 'EMERGENCIA', cell: 'W91' },  // merge O91:V91
  plano                          : { sheet: 'EMERGENCIA', cell: 'AF91' }, // merge AA91:AE91
  pelvis_viable                  : { sheet: 'EMERGENCIA', cell: 'AO91' }, // merge AJ91:AN91
  sangrado_vaginal               : { sheet: 'EMERGENCIA', cell: 'AX91' }, // merge AS91:AW91
  contracciones                  : { sheet: 'EMERGENCIA', cell: 'BJ91' }, // merge BB91:BI91
  score_mama                     : { sheet: 'EMERGENCIA', cell: 'J92' },  // merge J92:BM92

  // ─────────────────────────────────────────────────────────────────────────
  // K. EXÁMENES COMPLEMENTARIOS
  // Filas 96-100
  // Checkboxes: escribir 'X' en los que correspondan
  // ─────────────────────────────────────────────────────────────────────────
  examenes_no_aplica             : { sheet: 'EMERGENCIA', cell: 'BH96' }, // merge BH96:BK96
  exam_biometria                 : { sheet: 'EMERGENCIA', cell: 'G97' },  // merge A97:F97
  exam_uroanalisis               : { sheet: 'EMERGENCIA', cell: 'G98' },  // merge A98:F98
  exam_quimica_sanguinea         : { sheet: 'EMERGENCIA', cell: 'O97' },  // merge I97:N97
  exam_electrolitos              : { sheet: 'EMERGENCIA', cell: 'O98' },  // merge I98:N98
  exam_gasometria                : { sheet: 'EMERGENCIA', cell: 'W97' },  // merge Q97:V97
  exam_electrocardiograma        : { sheet: 'EMERGENCIA', cell: 'W98' },  // merge Q98:V98
  exam_endoscopia                : { sheet: 'EMERGENCIA', cell: 'AE97' },  // merge Y97:AD97
  exam_rx_torax                  : { sheet: 'EMERGENCIA', cell: 'AE98' },  // merge Y98:AD98
  exam_rx_abdomen                : { sheet: 'EMERGENCIA', cell: 'AL97' }, // merge AG97:AK97
  exam_rx_osea                   : { sheet: 'EMERGENCIA', cell: 'AL98' }, // merge AG98:AK98
  exam_eco_abdomen               : { sheet: 'EMERGENCIA', cell: 'AT97' }, // merge AN97:AS97
  exam_eco_pelvica               : { sheet: 'EMERGENCIA', cell: 'AT98' }, // merge AN98:AS98
  exam_tomografia                : { sheet: 'EMERGENCIA', cell: 'BC97' }, // merge AV97:BB97
  exam_resonancia                : { sheet: 'EMERGENCIA', cell: 'BC98' }, // merge AV98:BB98
  exam_interconsulta             : { sheet: 'EMERGENCIA', cell: 'BL97' }, // merge BE97:BK97
  exam_otros                     : { sheet: 'EMERGENCIA', cell: 'BL98' }, // merge BE98:BK98
  // Área de resultados (filas 99-101, texto libre)
  examenes_resultados            : { sheet: 'EMERGENCIA', cell: 'A99' },  // merge A99:BM99 — descripción/resultados

  // ─────────────────────────────────────────────────────────────────────────
  // L. DIAGNÓSTICOS PRESUNTIVOS
  // Filas 102-106
  // ─────────────────────────────────────────────────────────────────────────
  dx_presuntivo_1                : { sheet: 'EMERGENCIA', cell: 'B103' }, // merge B103:AB103 — diagnóstico 1
  dx_presuntivo_1_cie            : { sheet: 'EMERGENCIA', cell: 'AC103' },// merge AC103:AF103 — CIE
  dx_presuntivo_2                : { sheet: 'EMERGENCIA', cell: 'B104' }, // merge B104:AB104 — diagnóstico 2
  dx_presuntivo_2_cie            : { sheet: 'EMERGENCIA', cell: 'AC104' },// merge AC104:AF104 — CIE
  dx_presuntivo_3                : { sheet: 'EMERGENCIA', cell: 'B105' }, // merge B105:AB105 — diagnóstico 3
  dx_presuntivo_3_cie            : { sheet: 'EMERGENCIA', cell: 'AC105' },// merge AC105:AF105 — CIE

  // ─────────────────────────────────────────────────────────────────────────
  // M. DIAGNÓSTICOS DEFINITIVOS
  // Filas 102-106
  // ─────────────────────────────────────────────────────────────────────────
  dx_definitivo_1                : { sheet: 'EMERGENCIA', cell: 'AI103' },// merge AI103:BI103 — diagnóstico 1
  dx_definitivo_1_cie            : { sheet: 'EMERGENCIA', cell: 'BJ103' },// merge BJ103:BM103 — CIE
  dx_definitivo_2                : { sheet: 'EMERGENCIA', cell: 'AI104' },// merge AI104:BI104 — diagnóstico 2
  dx_definitivo_2_cie            : { sheet: 'EMERGENCIA', cell: 'BJ104' },// merge BJ104:BM104 — CIE
  dx_definitivo_3                : { sheet: 'EMERGENCIA', cell: 'AI105' },// merge AI105:BI105 — diagnóstico 3
  dx_definitivo_3_cie            : { sheet: 'EMERGENCIA', cell: 'BJ105' },// merge BJ105:BM105 — CIE

  // ─────────────────────────────────────────────────────────────────────────
  // N. PLAN DE TRATAMIENTO
  // Filas 107-119
  // ─────────────────────────────────────────────────────────────────────────
  // Cada fila: medicamento | vía | dosis | posología | días
  tratamiento_1_medicamento      : { sheet: 'EMERGENCIA', cell: 'B109' },  // merge B109:AG109
  tratamiento_1_via              : { sheet: 'EMERGENCIA', cell: 'AH109' }, // merge AH109:AN109
  tratamiento_1_dosis            : { sheet: 'EMERGENCIA', cell: 'AO109' }, // merge AO109:AU109
  tratamiento_1_posologia        : { sheet: 'EMERGENCIA', cell: 'AV109' }, // merge AV109:BF109
  tratamiento_1_dias             : { sheet: 'EMERGENCIA', cell: 'BG109' }, // merge BG109:BM109

  tratamiento_2_medicamento      : { sheet: 'EMERGENCIA', cell: 'B110' },  // merge B110:AG110
  tratamiento_2_via              : { sheet: 'EMERGENCIA', cell: 'AH110' }, // merge AH110:AN110
  tratamiento_2_dosis            : { sheet: 'EMERGENCIA', cell: 'AO110' }, // merge AO110:AU110
  tratamiento_2_posologia        : { sheet: 'EMERGENCIA', cell: 'AV110' }, // merge AV110:BF110
  tratamiento_2_dias             : { sheet: 'EMERGENCIA', cell: 'BG110' }, // merge BG110:BM110

  tratamiento_3_medicamento      : { sheet: 'EMERGENCIA', cell: 'B111' },  // merge B111:AG111
  tratamiento_3_via              : { sheet: 'EMERGENCIA', cell: 'AH111' }, // merge AH111:AN111
  tratamiento_3_dosis            : { sheet: 'EMERGENCIA', cell: 'AO111' }, // merge AO111:AU111
  tratamiento_3_posologia        : { sheet: 'EMERGENCIA', cell: 'AV111' }, // merge AV111:BF111
  tratamiento_3_dias             : { sheet: 'EMERGENCIA', cell: 'BG111' }, // merge BG111:BM111

  tratamiento_4_medicamento      : { sheet: 'EMERGENCIA', cell: 'B112' },  // merge B112:AG112
  tratamiento_4_via              : { sheet: 'EMERGENCIA', cell: 'AH112' }, // merge AH112:AN112
  tratamiento_4_dosis            : { sheet: 'EMERGENCIA', cell: 'AO112' }, // merge AO112:AU112
  tratamiento_4_posologia        : { sheet: 'EMERGENCIA', cell: 'AV112' }, // merge AV112:BF112
  tratamiento_4_dias             : { sheet: 'EMERGENCIA', cell: 'BG112' }, // merge BG112:BM112

  tratamiento_5_medicamento      : { sheet: 'EMERGENCIA', cell: 'B113' },  // merge B113:AG113
  tratamiento_5_via              : { sheet: 'EMERGENCIA', cell: 'AH113' }, // merge AH113:AN113
  tratamiento_5_dosis            : { sheet: 'EMERGENCIA', cell: 'AO113' }, // merge AO113:AU113
  tratamiento_5_posologia        : { sheet: 'EMERGENCIA', cell: 'AV113' }, // merge AV113:BF113
  tratamiento_5_dias             : { sheet: 'EMERGENCIA', cell: 'BG113' }, // merge BG113:BM113
  tratamiento_descripcion_1      : { sheet: 'EMERGENCIA', cell: 'A114' },
  tratamiento_descripcion_2      : { sheet: 'EMERGENCIA', cell: 'A115' },
  tratamiento_descripcion_3      : { sheet: 'EMERGENCIA', cell: 'A116' },
  tratamiento_descripcion_4      : { sheet: 'EMERGENCIA', cell: 'A117' },
  tratamiento_descripcion_5      : { sheet: 'EMERGENCIA', cell: 'A118' },

  // ─────────────────────────────────────────────────────────────────────────
  // O. CONDICIÓN AL EGRESO DE EMERGENCIA
  // Filas 120-125
  // ─────────────────────────────────────────────────────────────────────────
  // Condición del paciente — CHECKBOX (escribir 'X')
  egreso_vivo                    : { sheet: 'EMERGENCIA', cell: 'I121' },  // merge A121:H121
  egreso_estable                 : { sheet: 'EMERGENCIA', cell: 'R121' },  // merge L121:Q121
  egreso_inestable               : { sheet: 'EMERGENCIA', cell: 'AA121' },  // merge U121:Z121
  egreso_fallecido               : { sheet: 'EMERGENCIA', cell: 'AJ121' }, // merge AD121:AI121
  egreso_alta_definitiva         : { sheet: 'EMERGENCIA', cell: 'AR121' }, // merge AM121:AQ121
  egreso_consulta_externa        : { sheet: 'EMERGENCIA', cell: 'AZ121' }, // merge AU121:AY121
  egreso_observacion             : { sheet: 'EMERGENCIA', cell: 'BK121' }, // merge BC121:BJ121
  egreso_hospitalizacion         : { sheet: 'EMERGENCIA', cell: 'I122' },  // merge A122:H122
  egreso_referencia              : { sheet: 'EMERGENCIA', cell: 'R122' },  // merge L122:Q122
  egreso_ref_inversa             : { sheet: 'EMERGENCIA', cell: 'AA122' },  // merge U122:Z122
  egreso_derivacion              : { sheet: 'EMERGENCIA', cell: 'AJ122' }, // merge AD122:AI122
  egreso_establecimiento         : { sheet: 'EMERGENCIA', cell: 'AU122' }, // merge AM122:AT122 — nombre del establecimiento

  observaciones_egreso           : { sheet: 'EMERGENCIA', cell: 'J123' },  // merge J123:BH123
  dias_reposo                    : { sheet: 'EMERGENCIA', cell: 'BI124' }, // merge BI123:BM123

  // ─────────────────────────────────────────────────────────────────────────
  // P. DATOS DEL PROFESIONAL RESPONSABLE
  // Filas 126-131
  // ─────────────────────────────────────────────────────────────────────────
  prof_fecha                     : { sheet: 'EMERGENCIA', cell: 'A128' },  // merge A127:H127 — FECHA (aaaa-mm-dd)
  prof_hora                      : { sheet: 'EMERGENCIA', cell: 'I128' },  // merge I127:N127 — HORA (hh:mm)
  prof_primer_nombre             : { sheet: 'EMERGENCIA', cell: 'O128' },  // merge O127:AG127 — PRIMER NOMBRE
  prof_primer_apellido           : { sheet: 'EMERGENCIA', cell: 'AH128' }, // merge AH127:AX127 — PRIMER APELLIDO
  prof_segundo_apellido          : { sheet: 'EMERGENCIA', cell: 'AY128' }, // merge AY127:BM127 — SEGUNDO APELLIDO
  prof_numero_documento          : { sheet: 'EMERGENCIA', cell: 'A130' },  // merge A129:N129 — NÚMERO DE DOCUMENTO
  // prof_firma y prof_sello son campos de firma física — no se inyectan texto
};
