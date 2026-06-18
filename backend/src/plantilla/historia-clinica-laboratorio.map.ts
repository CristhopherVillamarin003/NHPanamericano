/**
 * Mapa de celdas para la plantilla de Historia Clínica (MSP)
 * Hoja: LABORATORIO
 */
export const HISTORIA_CLINICA_LABORATORIO_MAP: Record<string, { sheet: string; cell: string }> = {
  // ─────────────────────────────────────────────────────────────────────────
  // MAPEO DE CELDAS PARA LABORATORIO
  // PEGA AQUÍ TU MAPEO
  // Ejemplo:
  // lab_dato_ejemplo: { sheet: 'LABORATORIO', cell: 'A1' },
  // ─────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────
  // A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE
  // ─────────────────────────────────────────────────────────────────────────
  lab_institucion: { sheet: 'LABORATORIO', cell: 'A3' },
  lab_unicodigo: { sheet: 'LABORATORIO', cell: 'R3' },
  lab_establecimiento: { sheet: 'LABORATORIO', cell: 'X3' },
  lab_numero_historia_clinica: { sheet: 'LABORATORIO', cell: 'AT3' },
  lab_numero_archivo: { sheet: 'LABORATORIO', cell: 'BL3' },

  lab_primer_apellido: { sheet: 'LABORATORIO', cell: 'A6' },
  lab_segundo_apellido: { sheet: 'LABORATORIO', cell: 'P6' },
  lab_primer_nombre: { sheet: 'LABORATORIO', cell: 'AD6' },
  lab_segundo_nombre: { sheet: 'LABORATORIO', cell: 'AQ6' },
  lab_sexo: { sheet: 'LABORATORIO', cell: 'BC6' },
  lab_fecha_nacimiento: { sheet: 'LABORATORIO', cell: 'BF6' },
  lab_edad: { sheet: 'LABORATORIO', cell: 'BL6' },

  lab_condicion_edad_h: { sheet: 'LABORATORIO', cell: 'BO6' },
  lab_condicion_edad_d: { sheet: 'LABORATORIO', cell: 'BQ6' },
  lab_condicion_edad_m: { sheet: 'LABORATORIO', cell: 'BS6' },
  lab_condicion_edad_a: { sheet: 'LABORATORIO', cell: 'BU6' },

  // ─────────────────────────────────────────────────────────────────────────
  // B. SERVICIO Y PRIORIDAD DE ATENCIÓN
  // ─────────────────────────────────────────────────────────────────────────
  lab_diagnostico_1: { sheet: 'LABORATORIO', cell: 'B10' },
  lab_diagnostico_1_cie: { sheet: 'LABORATORIO', cell: 'AG10' },
  lab_diagnostico_2: { sheet: 'LABORATORIO', cell: 'B11' },
  lab_diagnostico_2_cie: { sheet: 'LABORATORIO', cell: 'AG11' },
  lab_servicio_emergencia: { sheet: 'LABORATORIO', cell: 'AW9' },
  lab_servicio_consulta: { sheet: 'LABORATORIO', cell: 'AW10' },
  lab_servicio_hosp: { sheet: 'LABORATORIO', cell: 'AW11' },
  lab_especialidad: { sheet: 'LABORATORIO', cell: 'BF9' },
  lab_sala: { sheet: 'LABORATORIO', cell: 'BF10' },
  lab_cama: { sheet: 'LABORATORIO', cell: 'BF11' },
  lab_prioridad_urgente: { sheet: 'LABORATORIO', cell: 'BU10' },
  lab_prioridad_rutina: { sheet: 'LABORATORIO', cell: 'BU11' },


  // ─────────────────────────────────────────────────────────────────────────
  // C. LISTADO DE EXÁMENES 
  // ─────────────────────────────────────────────────────────────────────────
  // Hematología
  lab_biometria_hematica: { sheet: 'LABORATORIO', cell: 'L17' },
  lab_hematocrito: { sheet: 'LABORATORIO', cell: 'L18' },
  lab_hemoglobina: { sheet: 'LABORATORIO', cell: 'L19' },
  lab_plaquetas: { sheet: 'LABORATORIO', cell: 'L20' },
  reticulocitos: { sheet: 'LABORATORIO', cell: 'L21' },
  ves: { sheet: 'LABORATORIO', cell: 'L22' }, // Velocidad de Eritrosedimentación
  hierro_serico: { sheet: 'LABORATORIO', cell: 'L23' },
  fijacion_hierro: { sheet: 'LABORATORIO', cell: 'L24' },
  porcentaje_saturacion_transferrina: { sheet: 'LABORATORIO', cell: 'L25' },
  transferrina: { sheet: 'LABORATORIO', cell: 'L26' },
  ferritina: { sheet: 'LABORATORIO', cell: 'L27' },

  // ─────────────────────────────────────────────────────────────────────────
  // Otros exámenes de Hematología (columna derecha de la sección)
  // ─────────────────────────────────────────────────────────────────────────
  fragilidad_osmotica: { sheet: 'LABORATORIO', cell: 'Y17' },
  metabisulfito: { sheet: 'LABORATORIO', cell: 'Y18' },
  hematozooario: { sheet: 'LABORATORIO', cell: 'Y19' },
  investigacion_leishmania: { sheet: 'LABORATORIO', cell: 'Y20' },
  eosinofilo_moco_nasal: { sheet: 'LABORATORIO', cell: 'Y21' },
  frotis_sangre_periferica: { sheet: 'LABORATORIO', cell: 'Y22' },
  acido_folico: { sheet: 'LABORATORIO', cell: 'Y23' },
  vitamina_b12: { sheet: 'LABORATORIO', cell: 'Y24' },

  // ─────────────────────────────────────────────────────────────────────────
  // Coagulación y Hemostasia 
  // ─────────────────────────────────────────────────────────────────────────
  tiempo_protrombina_tp: { sheet: 'LABORATORIO', cell: 'AR17' },
  tiempo_tromboplastina_ttp: { sheet: 'LABORATORIO', cell: 'AR18' },
  tiempo_trombina_tt: { sheet: 'LABORATORIO', cell: 'AR19' },
  inr: { sheet: 'LABORATORIO', cell: 'AR20' },
  factor_coagulacion_viii: { sheet: 'LABORATORIO', cell: 'AR21' },
  factor_coagulacion_ix: { sheet: 'LABORATORIO', cell: 'AR22' },
  factor_von_willebrand: { sheet: 'LABORATORIO', cell: 'AR23' },
  fibrinogeno: { sheet: 'LABORATORIO', cell: 'AR24' },
  dimero_d: { sheet: 'LABORATORIO', cell: 'AR25' },
  ind_inhibidores: { sheet: 'LABORATORIO', cell: 'AR26' },

  // ─────────────────────────────────────────────────────────────────────────
  // Química Sanguínea
  // ─────────────────────────────────────────────────────────────────────────
  glucosa_basal: { sheet: 'LABORATORIO', cell: 'BI17' },
  glucosa_post_prandial: { sheet: 'LABORATORIO', cell: 'BI18' },
  glucosa_al_azar: { sheet: 'LABORATORIO', cell: 'BI19' },
  sobrecarga_glucosa_75g: { sheet: 'LABORATORIO', cell: 'BI20' },
  test_sullivan_50g: { sheet: 'LABORATORIO', cell: 'BI21' },
  urea: { sheet: 'LABORATORIO', cell: 'BI22' },
  creatinina: { sheet: 'LABORATORIO', cell: 'BI23' },
  acido_urico: { sheet: 'LABORATORIO', cell: 'BI24' },
  fosfatasa_alcalina: { sheet: 'LABORATORIO', cell: 'BI25' },
  deshidrogenasa_lactica: { sheet: 'LABORATORIO', cell: 'BI26' },
  ast_tgo: { sheet: 'LABORATORIO', cell: 'BI27' },
  alt_tgp: { sheet: 'LABORATORIO', cell: 'BI28' },
  ggt: { sheet: 'LABORATORIO', cell: 'BI29' },
  amilasa: { sheet: 'LABORATORIO', cell: 'BI30' },
  lipasa: { sheet: 'LABORATORIO', cell: 'BI31' },
  bilirrubina_total: { sheet: 'LABORATORIO', cell: 'BI32' },
  bilirrubina_directa: { sheet: 'LABORATORIO', cell: 'BU17' },
  bilirrubina_indirecta: { sheet: 'LABORATORIO', cell: 'BU18' },
  colesterol_total: { sheet: 'LABORATORIO', cell: 'BU19' },
  hdl: { sheet: 'LABORATORIO', cell: 'BU20' },
  ldl: { sheet: 'LABORATORIO', cell: 'BU21' },
  vldl: { sheet: 'LABORATORIO', cell: 'BU22' },
  trigliceridos: { sheet: 'LABORATORIO', cell: 'BU23' },
  albumina: { sheet: 'LABORATORIO', cell: 'BU24' },
  proteinas_totales: { sheet: 'LABORATORIO', cell: 'BU25' },
  hba1c: { sheet: 'LABORATORIO', cell: 'BU26' },
  cpk_total: { sheet: 'LABORATORIO', cell: 'BU27' },
  fructosamina: { sheet: 'LABORATORIO', cell: 'BU28' },
  pcr_cuantitativo: { sheet: 'LABORATORIO', cell: 'BU29' },

  // ===================================================================
  // INMUNOLOGÍA / INFECCIOSAS
  // ===================================================================
  complemento_c3: { sheet: 'LABORATORIO', cell: 'L30' },
  complemento_c4: { sheet: 'LABORATORIO', cell: 'L31' },
  iga_total: { sheet: 'LABORATORIO', cell: 'L32' },
  ige_total: { sheet: 'LABORATORIO', cell: 'L33' },
  igg_total: { sheet: 'LABORATORIO', cell: 'L34' },
  igm_total: { sheet: 'LABORATORIO', cell: 'L35' },
  procalcitonina: { sheet: 'LABORATORIO', cell: 'L36' },
  il6: { sheet: 'LABORATORIO', cell: 'L37' },
  ana: { sheet: 'LABORATORIO', cell: 'L38' },
  anca_c: { sheet: 'LABORATORIO', cell: 'L39' },
  anca_p: { sheet: 'LABORATORIO', cell: 'L40' },
  anti_dna: { sheet: 'LABORATORIO', cell: 'L41' },
  anti_ccp: { sheet: 'LABORATORIO', cell: 'L42' },
  anti_sm: { sheet: 'LABORATORIO', cell: 'L43' },
  anti_ro: { sheet: 'LABORATORIO', cell: 'L44' },
  anti_la: { sheet: 'LABORATORIO', cell: 'L45' },
  anti_cardiolipina_igg: { sheet: 'LABORATORIO', cell: 'L46' },
  anti_cardiolipina_igm: { sheet: 'LABORATORIO', cell: 'L47' },
  antifosfolipidos_igg: { sheet: 'LABORATORIO', cell: 'L48' },
  antifosfolipidos_igm: { sheet: 'LABORATORIO', cell: 'L49' },
  factor_reumatoideo: { sheet: 'LABORATORIO', cell: 'L50' },
  sflt1: { sheet: 'LABORATORIO', cell: 'L51' },
  pigf: { sheet: 'LABORATORIO', cell: 'L52' },
  hbcag: { sheet: 'LABORATORIO', cell: 'L53' },
  hepatitis_a_igm: { sheet: 'LABORATORIO', cell: 'L54' },
  hepatitis_a_total: { sheet: 'LABORATORIO', cell: 'L55' },
  hbsag: { sheet: 'LABORATORIO', cell: 'Y30' },
  hbc_igg: { sheet: 'LABORATORIO', cell: 'Y31' },
  hbc_igm: { sheet: 'LABORATORIO', cell: 'Y32' },
  hvc: { sheet: 'LABORATORIO', cell: 'Y33' },
  vih_1_2_cualitativa: { sheet: 'LABORATORIO', cell: 'Y34' },
  vih_1_2_cuantitativa: { sheet: 'LABORATORIO', cell: 'Y35' },
  herpes_1_igg: { sheet: 'LABORATORIO', cell: 'Y36' },
  herpes_1_igm: { sheet: 'LABORATORIO', cell: 'Y37' },
  herpes_2_igg: { sheet: 'LABORATORIO', cell: 'Y38' },
  herpes_2_igm: { sheet: 'LABORATORIO', cell: 'Y39' },
  rubeola_igg: { sheet: 'LABORATORIO', cell: 'Y40' },
  rubeola_igm: { sheet: 'LABORATORIO', cell: 'Y41' },
  toxoplasma_igg: { sheet: 'LABORATORIO', cell: 'Y42' },
  toxoplasma_igm: { sheet: 'LABORATORIO', cell: 'Y43' },
  citomegalovirus_igg: { sheet: 'LABORATORIO', cell: 'Y44' },
  citomegalovirus_igm: { sheet: 'LABORATORIO', cell: 'Y45' },
  epstein_barr_igg: { sheet: 'LABORATORIO', cell: 'Y46' },
  epstein_barr_igm: { sheet: 'LABORATORIO', cell: 'Y47' },
  dengue_igg: { sheet: 'LABORATORIO', cell: 'Y48' },
  dengue_igm: { sheet: 'LABORATORIO', cell: 'Y49' },
  clamidia_iga: { sheet: 'LABORATORIO', cell: 'Y50' },
  clamidia_igg: { sheet: 'LABORATORIO', cell: 'Y51' },
  fta_abs: { sheet: 'LABORATORIO', cell: 'Y52' },

  // ===================================================================
  // ORINA
  // ===================================================================
  elemental_y_microscopico_emo: { sheet: 'LABORATORIO', cell: 'AR31' },
  gram_gota_fresca: { sheet: 'LABORATORIO', cell: 'AR32' },
  osmolaridad_urinaria: { sheet: 'LABORATORIO', cell: 'AR33' },
  sodio_orina_parcial: { sheet: 'LABORATORIO', cell: 'AR34' },
  potasio_orina_parcial: { sheet: 'LABORATORIO', cell: 'AR35' },
  cloro_orina_parcial: { sheet: 'LABORATORIO', cell: 'AR36' },
  calcio_urinario: { sheet: 'LABORATORIO', cell: 'AR37' },
  fosforo_orina_parcial: { sheet: 'LABORATORIO', cell: 'AR38' },
  magnesio_orina_parcial: { sheet: 'LABORATORIO', cell: 'AR39' },
  glucosa_orina_parcial: { sheet: 'LABORATORIO', cell: 'AR40' },
  urea_orina_parcial: { sheet: 'LABORATORIO', cell: 'AR41' },
  creatinina_orina_parcial: { sheet: 'LABORATORIO', cell: 'AR42' },
  nitrogeno_ureico_orina: { sheet: 'LABORATORIO', cell: 'AR43' },
  acido_urico_orina_parcial: { sheet: 'LABORATORIO', cell: 'AR44' },
  proteinas_orina_parcial: { sheet: 'LABORATORIO', cell: 'AR45' },
  fosforo_orina_24h: { sheet: 'LABORATORIO', cell: 'AR46' },
  potasio_orina_24h: { sheet: 'LABORATORIO', cell: 'AR47' },
  proteinas_orina_24h: { sheet: 'LABORATORIO', cell: 'AR48' },
  depuracion_creatinina_24h: { sheet: 'LABORATORIO', cell: 'AR49' },
  acido_urico_orina_24h: { sheet: 'LABORATORIO', cell: 'AR50' },
  calcio_orina_24h: { sheet: 'LABORATORIO', cell: 'AR51' },
  amilasa_orina_24h: { sheet: 'LABORATORIO', cell: 'AR52' },
  cobre_orina_24h: { sheet: 'LABORATORIO', cell: 'AR53' },
  azucares_reductores: { sheet: 'LABORATORIO', cell: 'AR54' },
  drogas_abuso_orina: { sheet: 'LABORATORIO', cell: 'AR55' },
  albuminuria: { sheet: 'LABORATORIO', cell: 'AR56' },

  // ===================================================================
  // HECES
  // ===================================================================
  coprologico_coproparasitario: { sheet: 'LABORATORIO', cell: 'BI35' },
  coproparasitario_concentracion: { sheet: 'LABORATORIO', cell: 'BI36' },
  copro_seriado: { sheet: 'LABORATORIO', cell: 'BI37' },
  pmn: { sheet: 'LABORATORIO', cell: 'BI38' },
  sangre_oculta: { sheet: 'LABORATORIO', cell: 'BI39' },
  investigacion_ph: { sheet: 'LABORATORIO', cell: 'BI40' },
  rotavirus: { sheet: 'LABORATORIO', cell: 'BI41' },
  adenovirus: { sheet: 'LABORATORIO', cell: 'BI42' },

  criptosporidium: { sheet: 'LABORATORIO', cell: 'BU35' },
  oxiuros: { sheet: 'LABORATORIO', cell: 'BU36' },
  gardia_lamblia_antigeno: { sheet: 'LABORATORIO', cell: 'BU37' },
  investigacion_grasas: { sheet: 'LABORATORIO', cell: 'BU38' },
  azucares_reductores_heces: { sheet: 'LABORATORIO', cell: 'BU39' },
  helicobacter_pylori: { sheet: 'LABORATORIO', cell: 'BU40' },

  // ===================================================================
  // MARCADORES TUMORALES
  // ===================================================================
  cea: { sheet: 'LABORATORIO', cell: 'BA45' },
  afp: { sheet: 'LABORATORIO', cell: 'BA46' },
  ca125: { sheet: 'LABORATORIO', cell: 'BA47' },
  ca153: { sheet: 'LABORATORIO', cell: 'BA48' },
  ca199: { sheet: 'LABORATORIO', cell: 'BA49' },
  ca724: { sheet: 'LABORATORIO', cell: 'BA50' },
  psa_libre: { sheet: 'LABORATORIO', cell: 'BL45' },
  psa_total: { sheet: 'LABORATORIO', cell: 'BL46' },
  b2_microglobulina: { sheet: 'LABORATORIO', cell: 'BL47' },
  anti_tpo: { sheet: 'LABORATORIO', cell: 'BL48' },
  anti_tg: { sheet: 'LABORATORIO', cell: 'BL49' },
  tiroglobulina: { sheet: 'LABORATORIO', cell: 'BL50' },
  he4: { sheet: 'LABORATORIO', cell: 'BU45' },
  b_hcg_libre: { sheet: 'LABORATORIO', cell: 'BU46' },
  b_hcg_cuantitativa: { sheet: 'LABORATORIO', cell: 'BU47' },

  // ===================================================================
  // CITOQUÍMICO Y BACTERIOLÓGICO DE LÍQUIDOS
  // ===================================================================

  cefalorraquideo: { sheet: 'LABORATORIO', cell: 'BE53' },
  articular_sinovial: { sheet: 'LABORATORIO', cell: 'BE54' },
  ascitico_peritoneal: { sheet: 'LABORATORIO', cell: 'BE55' },

  pleural: { sheet: 'LABORATORIO', cell: 'BM53' },
  pericardico: { sheet: 'LABORATORIO', cell: 'BM54' },
  liquido_amniotico: { sheet: 'LABORATORIO', cell: 'BM55' },

  // ===================================================================
  // MARCADORES CARDIACOS/VASCULARES
  // ===================================================================
  cpk_total_marcadores: { sheet: 'LABORATORIO', cell: 'L58' },
  ck_mb: { sheet: 'LABORATORIO', cell: 'L59' },
  cpk_nac: { sheet: 'LABORATORIO', cell: 'L60' },
  troponina_i: { sheet: 'LABORATORIO', cell: 'L61' },
  troponina_t: { sheet: 'LABORATORIO', cell: 'Y58' },
  nt_pro_bnp: { sheet: 'LABORATORIO', cell: 'Y59' },
  mioglobina: { sheet: 'LABORATORIO', cell: 'Y60' },

  // ===================================================================
  // NIVELES DE FÁRMACOS TERAPÉUTICAS
  // ===================================================================
  acido_valproico: { sheet: 'LABORATORIO', cell: 'BI58' },
  carbamazepina: { sheet: 'LABORATORIO', cell: 'BI59' },
  fenobarbital: { sheet: 'LABORATORIO', cell: 'BI60' },
  digoxina: { sheet: 'LABORATORIO', cell: 'BI61' },
  fenitoina_sodica: { sheet: 'LABORATORIO', cell: 'BI62' },
  vancomicina: { sheet: 'LABORATORIO', cell: 'BU59' },
  amikacina: { sheet: 'LABORATORIO', cell: 'BU60' },
  litio: { sheet: 'LABORATORIO', cell: 'BU61' },

  // ===================================================================
  // INMUNOSUPRESORES
  // ===================================================================
  ciclosporina: { sheet: 'LABORATORIO', cell: 'AI6I' },
  sirolimus: { sheet: 'LABORATORIO', cell: 'AI62' },
  tacrolimus: { sheet: 'LABORATORIO', cell: 'AI63' },
  everolimus: { sheet: 'LABORATORIO', cell: 'AR61' },

  // ===================================================================
  // HORMONAS
  // ===================================================================

  t3: { sheet: 'LABORATORIO', cell: 'L64' },
  ft3: { sheet: 'LABORATORIO', cell: 'L65' },
  t4: { sheet: 'LABORATORIO', cell: 'L66' },
  ft4: { sheet: 'LABORATORIO', cell: 'L67' },
  tsh: { sheet: 'LABORATORIO', cell: 'L68' },
  pth: { sheet: 'LABORATORIO', cell: 'L69' },
  fsh: { sheet: 'LABORATORIO', cell: 'L70' },
  androstenediona: { sheet: 'LABORATORIO', cell: 'L71' },
  factor_crecimiento_igf1: { sheet: 'LABORATORIO', cell: 'L72' },
  factor_union_igfbp3: { sheet: 'LABORATORIO', cell: 'L73' },
  b_hcg_cualitativa_h: { sheet: 'LABORATORIO', cell: 'L74' },
  b_hcg_cuantitativa_h: { sheet: 'LABORATORIO', cell: 'L75' },
  hormona_crecimiento: { sheet: 'LABORATORIO', cell: 'L76' },
  progesterona: { sheet: 'LABORATORIO', cell: 'Y64' },
  insulina: { sheet: 'LABORATORIO', cell: 'Y65' },
  acth: { sheet: 'LABORATORIO', cell: 'Y66' },
  prolactina: { sheet: 'LABORATORIO', cell: 'Y67' },
  vitamina_d: { sheet: 'LABORATORIO', cell: 'Y68' },
  estradiol_e2: { sheet: 'LABORATORIO', cell: 'Y69' },
  lh: { sheet: 'LABORATORIO', cell: 'Y70' },
  cortisol: { sheet: 'LABORATORIO', cell: 'Y71' },
  testosterona_total: { sheet: 'LABORATORIO', cell: 'Y72' },
  testosterona_libre: { sheet: 'LABORATORIO', cell: 'Y73' },
  dhea_s: { sheet: 'LABORATORIO', cell: 'Y74' },

  // ===================================================================
  // GASES Y ELECTROLITOS
  // ===================================================================
  sodio_na: { sheet: 'LABORATORIO', cell: 'AI66' },
  potasio_k: { sheet: 'LABORATORIO', cell: 'AI67' },
  cloro_cl: { sheet: 'LABORATORIO', cell: 'AI68' },
  calcio_ca: { sheet: 'LABORATORIO', cell: 'AI70' },
  calcio_ionico: { sheet: 'LABORATORIO', cell: 'AI69' },
  fosforo_p: { sheet: 'LABORATORIO', cell: 'AI71' },
  magnesio_mg: { sheet: 'LABORATORIO', cell: 'AR66' },
  litio_li: { sheet: 'LABORATORIO', cell: 'AR67' },
  gasometria_arterial: { sheet: 'LABORATORIO', cell: 'AR68' },
  gasometria_venosa: { sheet: 'LABORATORIO', cell: 'AR69' },

  // ===================================================================
  // SEROLOGIA
  // ===================================================================	
  aglutinaciones_febriles: { sheet: 'LABORATORIO', cell: 'BI65' },
  asto: { sheet: 'LABORATORIO', cell: 'BI66' },
  fr_latex: { sheet: 'LABORATORIO', cell: 'BI67' },
  dengue_pcr: { sheet: 'LABORATORIO', cell: 'BI68' },
  chlamydia_pcr: { sheet: 'LABORATORIO', cell: 'BI69' },
  pepsinogeno: { sheet: 'LABORATORIO', cell: 'BI70' },
  vdrl_manual: { sheet: 'LABORATORIO', cell: 'BI71' },
  pcr_semicuantitativa: { sheet: 'LABORATORIO', cell: 'BU65' },
  malaria_pcr: { sheet: 'LABORATORIO', cell: 'BU66' },
  sifilis_pcr: { sheet: 'LABORATORIO', cell: 'BU67' },
  helicobacter_pylori_serologia: { sheet: 'LABORATORIO', cell: 'BU68' },


  // ===================================================================
  // MEDICINA TRANSFUSIONAL
  // ===================================================================
  grupo_y_factor: { sheet: 'LABORATORIO', cell: 'AI74' },
  coombs_directo: { sheet: 'LABORATORIO', cell: 'AI75' },
  coombs_indirecto: { sheet: 'LABORATORIO', cell: 'AI76' },

  // ===================================================================
  // MICROBIOLOGÍA
  // ===================================================================
  muestra: { sheet: 'LABORATORIO', cell: 'AY74' },
  sitio_anatomico: { sheet: 'LABORATORIO', cell: 'BB75' },
  cultivo_y_antibioigrama: { sheet: 'LABORATORIO', cell: 'BA76' },
  cristalografia: { sheet: 'LABORATORIO', cell: 'BJ76' },
  gram: { sheet: 'LABORATORIO', cell: 'BO76' },
  fresco: { sheet: 'LABORATORIO', cell: 'BU76' },
  estudio_micologico_koh: { sheet: 'LABORATORIO', cell: 'BE77' },
  cultivo_micotico: { sheet: 'LABORATORIO', cell: 'BB78' },
  cultivo_micotico_1: { sheet: 'LABORATORIO', cell: 'AV79' },
  cultivo_micotico_2: { sheet: 'LABORATORIO', cell: 'AV80' },
  cultivo_micotico_3: { sheet: 'LABORATORIO', cell: 'AV81' },
  investigacion_paragonimus: { sheet: 'LABORATORIO', cell: 'BH82' },
  investigacion_histoplasma: { sheet: 'LABORATORIO', cell: 'BH83' },
  coloracion_zhiel_nielssen: { sheet: 'LABORATORIO', cell: 'BU82' },


  // ===================================================================
  // BIOLOGÍA MOLECULAR Y GENÉTICA
  // ===================================================================

  biologia_1: { sheet: 'LABORATORIO', cell: 'A79' },
  biologia_2: { sheet: 'LABORATORIO', cell: 'A80' },
  biologia_3: { sheet: 'LABORATORIO', cell: 'A81' },
  biologia_4: { sheet: 'LABORATORIO', cell: 'A82' },
  biologia_5: { sheet: 'LABORATORIO', cell: 'A83' },

  // ─────────────────────────────────────────────────────────────────────────
  // D. DATOS DEL PROFESIONAL RESPONSABLE (Página 1)
  // ─────────────────────────────────────────────────────────────────────────
  lab_fecha_generacion: { sheet: 'LABORATORIO', cell: 'A87' },
  lab_hora_generacion: { sheet: 'LABORATORIO', cell: 'L87' },
  lab_prof_primer_nombre: { sheet: 'LABORATORIO', cell: 'W87' },
  lab_prof_primer_apellido: { sheet: 'LABORATORIO', cell: 'AP87' },
  lab_prof_segundo_apellido: { sheet: 'LABORATORIO', cell: 'BH87' },

  lab_prof_documento: { sheet: 'LABORATORIO', cell: 'A89' },

  lab_fecha_toma_muestra: { sheet: 'LABORATORIO', cell: 'A914' },
  lab_hora_toma_muestra: { sheet: 'LABORATORIO', cell: 'L91' },
  lab_persona_toma_muestra: { sheet: 'LABORATORIO', cell: 'W91' },

  // ─────────────────────────────────────────────────────────────────────────
  // VIH / ITS 
  // ─────────────────────────────────────────────────────────────────────────

  prueba_rapida_vih: { sheet: 'LABORATORIO', cell: 'M95' },
  elisa_automatizada: { sheet: 'LABORATORIO', cell: 'AA95' },
  clia: { sheet: 'LABORATORIO', cell: 'AO95' },
  ifi: { sheet: 'LABORATORIO', cell: 'BA95' },
  carga_viral: { sheet: 'LABORATORIO', cell: 'BO95' },
  cd4: { sheet: 'LABORATORIO', cell: 'M96' },
  tamizaje_sifilis: { sheet: 'LABORATORIO', cell: 'AA96' },
  vdrl: { sheet: 'LABORATORIO', cell: 'AO96' },
  hepatitis_b_hbsag: { sheet: 'LABORATORIO', cell: 'BA96' },

  // ─────────────────────────────────────────────────────────────────────────
  // TUBERCULOSIS 
  // ─────────────────────────────────────────────────────────────────────────

  tb_nuevo: { sheet: 'LABORATORIO', cell: 'G101' },
  tb_recaida: { sheet: 'LABORATORIO', cell: 'O101' },
  tb_fracaso: { sheet: 'LABORATORIO', cell: 'W101' },
  tb_perdida_seguimiento: { sheet: 'LABORATORIO', cell: 'AN101' },
  tb_pvv: { sheet: 'LABORATORIO', cell: 'AU101' },
  tb_ppl: { sheet: 'LABORATORIO', cell: 'BB101' },
  tb_nino_menor_5: { sheet: 'LABORATORIO', cell: 'BN101' },
  tb_sospecha_meningitis: { sheet: 'LABORATORIO', cell: 'R103' },
  tb_alta_sospecha_bk_negativo: { sheet: 'LABORATORIO', cell: 'AQ103' },
  tb_comorbilidad: { sheet: 'LABORATORIO', cell: 'BB103' },
  tb_comorbilidad_desc: { sheet: 'LABORATORIO', cell: 'BD103' },
  tb_contacto_tbr: { sheet: 'LABORATORIO', cell: 'K104' },
  tb_sospecha_tb_ep: { sheet: 'LABORATORIO', cell: 'O105' },
  tb_talento_humano_salud: { sheet: 'LABORATORIO', cell: 'AF105' },
  irregularidad_tto: { sheet: 'LABORATORIO', cell: 'AZ105' },
  reversion: { sheet: 'LABORATORIO', cell: 'BJ105' },
  tb_embarazo: { sheet: 'LABORATORIO', cell: 'J107' },
  tb_bk_positivo_2do_mes: { sheet: 'LABORATORIO', cell: 'X107' },
  tb_condiciones_especiales: { sheet: 'LABORATORIO', cell: 'AN107' },
  tb_condiciones_desc: { sheet: 'LABORATORIO', cell: 'AP107' },
  tb_otros: { sheet: 'LABORATORIO', cell: 'BF107' },
  tb_otros_desc: { sheet: 'LABORATORIO', cell: 'BH107' },

  // ===================================================================
  // ANTECEDENTES DE TUBERCULOSIS
  // ===================================================================

  tb_sensible: { sheet: 'LABORATORIO', cell: 'J111' },
  tb_resistente: { sheet: 'LABORATORIO', cell: 'V111' },
  tb_tipo_resistencia: { sheet: 'LABORATORIO', cell: 'Y111' },

  // ===================================================================
  // TIPO DE MUESTRA
  // ===================================================================

  tb_muestra_esputo: { sheet: 'LABORATORIO', cell: 'AR111' },
  tb_muestra_otro: { sheet: 'LABORATORIO', cell: 'BA111' },
  tb_muestra_otro_desc: { sheet: 'LABORATORIO', cell: 'BD111' },

  // ===================================================================
  // SOLICITUD PARA DIAGNOSTICO
  // ===================================================================

  tb_ada: { sheet: 'LABORATORIO', cell: 'F115' },
  tb_baciloscopia_diag: { sheet: 'LABORATORIO', cell: 'Z115' },
  tb_baciloscopia_diag_no: { sheet: 'LABORATORIO', cell: 'AF115' },
  tb_control_1: { sheet: 'LABORATORIO', cell: 'X117' },
  tb_mes_1: { sheet: 'LABORATORIO', cell: 'AF117' },
  tb_cultivo_diagnostico: { sheet: 'LABORATORIO', cell: 'BG115' },
  tb_cultivo_diagnostico_no: { sheet: 'LABORATORIO', cell: 'BM115' },
  tb_control_2: { sheet: 'LABORATORIO', cell: 'BE117' },
  tb_mes_2: { sheet: 'LABORATORIO', cell: 'BM117' },
  tb_pcr_tiempo_real_xpert: { sheet: 'LABORATORIO', cell: 'L119' },
  tb_nitrato_reductasa_griess: { sheet: 'LABORATORIO', cell: 'Z119' },
  tb_cultivo_medio_liquido_mgit: { sheet: 'LABORATORIO', cell: 'AP119' },
  tb_genotipificacion: { sheet: 'LABORATORIO', cell: 'BD119' },
  tb_tipificacion: { sheet: 'LABORATORIO', cell: 'BN119' },
  tb_psd_1ra_linea_prop_solido: { sheet: 'LABORATORIO', cell: 'N122' },
  tb_psd_1ra_linea_mgit_liquido: { sheet: 'LABORATORIO', cell: 'AF122' },
  tb_psd_2da_linea_prop_solido: { sheet: 'LABORATORIO', cell: 'AV122' },
  tb_psd_2da_linea_mgit_liquido: { sheet: 'LABORATORIO', cell: 'BN122' },

  // Datos del profesional - Página 2
  lab2_fecha_generacion: { sheet: 'LABORATORIO', cell: 'A128' },
  lab2_hora_generacion: { sheet: 'LABORATORIO', cell: 'L128' },
  lab2_prof_primer_nombre: { sheet: 'LABORATORIO', cell: 'W128' },
  lab2_prof_primer_apellido: { sheet: 'LABORATORIO', cell: 'AP128' },
  lab2_prof_segundo_apellido: { sheet: 'LABORATORIO', cell: 'BD128' },

  lab2_prof_documento: { sheet: 'LABORATORIO', cell: 'A130' },

  lab2_fecha_toma_muestra: { sheet: 'LABORATORIO', cell: 'A132' },
  lab2_hora_toma_muestra: { sheet: 'LABORATORIO', cell: 'L132' },
  lab2_persona_toma_muestra: { sheet: 'LABORATORIO', cell: 'W132' },

};
