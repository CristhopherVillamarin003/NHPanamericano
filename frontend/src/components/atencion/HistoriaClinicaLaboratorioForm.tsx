"use client";

import React, { useState, useImperativeHandle } from "react";
import { Cie10DescInput, Cie10CieInput } from "./Cie10Input";
import { useFormAutosaveAndWarn } from "@/hooks/useFormAutosaveAndWarn";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface DatosLaboratorio {
  // A. Datos del establecimiento y paciente
  institucion: string;
  unicodigo: string;
  establecimiento: string;
  numero_historia_clinica: string;
  numero_archivo: string;
  primer_apellido: string;
  segundo_apellido: string;
  primer_nombre: string;
  segundo_nombre: string;
  sexo: string;
  fecha_nacimiento: string;
  edad: string;
  condicion_edad: "H" | "D" | "M" | "A";

  // B. Servicio y prioridad
  diagnostico_1: string;
  diagnostico_1_cie: string;
  diagnostico_2: string;
  diagnostico_2_cie: string;
  servicio: "EMERGENCIA" | "CONSULTA_EXTERNA" | "HOSPITALIZACION" | "";
  especialidad: string;
  sala: string;
  cama: string;
  prioridad: "URGENTE" | "RUTINA" | "";

  // C. Listado de exámenes — Hematología
  ex_biometria_hematica: boolean;
  ex_fragilidad_osmotica: boolean;
  ex_hematocrito: boolean;
  ex_metabisulfito: boolean;
  ex_hemoglobina: boolean;
  ex_hematozooario: boolean;
  ex_plaquetas: boolean;
  ex_investigacion_leishmania: boolean;
  ex_reticulocitos: boolean;
  ex_eosinofilo_moco: boolean;
  ex_velocidad_eritrosedimentacion: boolean;
  ex_frotis_sangre: boolean;
  ex_hierro_serico: boolean;
  ex_acido_folico: boolean;
  ex_fijacion_hierro: boolean;
  ex_vitamina_b12: boolean;
  ex_saturacion_transferrina: boolean;
  ex_transferrina: boolean;
  ex_ferritina: boolean;

  // Coagulación y hemostasia
  ex_tp: boolean;
  ex_ttp: boolean;
  ex_tt: boolean;
  ex_inr: boolean;
  ex_factor_viii: boolean;
  ex_factor_ix: boolean;
  ex_factor_von_willebrand: boolean;
  ex_fibrinogeno: boolean;
  ex_dimero_d: boolean;
  ex_inhibidores: boolean;

  // Química sanguínea
  ex_glucosa_basal: boolean;
  ex_glucosa_post_prandial: boolean;
  ex_glucosa_azar: boolean;
  ex_sobrecarga_glucosa: boolean;
  ex_sullivan: boolean;
  ex_urea: boolean;
  ex_creatinina: boolean;
  ex_acido_urico: boolean;
  ex_fosfatasa_alcalina: boolean;
  ex_ldh: boolean;
  ex_ast_tgo: boolean;
  ex_alt_tgp: boolean;
  ex_ggt: boolean;
  ex_amilasa: boolean;
  ex_lipasa: boolean;
  ex_bilirrubina_total: boolean;
  ex_bilirrubina_directa: boolean;
  ex_bilirrubina_indirecta: boolean;
  ex_colesterol_total: boolean;
  ex_hdl: boolean;
  ex_ldl: boolean;
  ex_vldl: boolean;
  ex_trigliceridos: boolean;
  ex_albumina: boolean;
  ex_proteinas_totales: boolean;
  ex_hba1c: boolean;
  ex_cpk_total_quim: boolean;
  ex_fructosamina: boolean;
  ex_pcr_cuantitativo: boolean;

  // Inmunología / Infecciosas
  ex_complemento_c3: boolean;
  ex_complemento_c4: boolean;
  ex_iga_total: boolean;
  ex_ige_total: boolean;
  ex_igg_total: boolean;
  ex_igm_total: boolean;
  ex_procalcitonina: boolean;
  ex_il6: boolean;
  ex_ana: boolean;
  ex_anca_c: boolean;
  ex_anca_p: boolean;
  ex_anti_dna: boolean;
  ex_anti_ccp: boolean;
  ex_anti_sm: boolean;
  ex_anti_ro: boolean;
  ex_anti_la: boolean;
  ex_anti_cardiolipina_igg: boolean;
  ex_anti_cardiolipina_igm: boolean;
  ex_antifosfolipidos_igg: boolean;
  ex_antifosfolipidos_igm: boolean;
  ex_factor_reumatoideo: boolean;
  ex_sflt1: boolean;
  ex_pigf: boolean;
  ex_anticore_igg: boolean;
  ex_hepatitis_a_igm: boolean;
  ex_hepatitis_a_total: boolean;
  ex_hbsag: boolean;
  ex_anticore_igg_hbc: boolean;
  ex_anticore_igm_hbc: boolean;
  ex_hepatitis_c: boolean;
  ex_vih_cualitativa: boolean;
  ex_vih_cuantitativa: boolean;
  ex_herpes1_igg: boolean;
  ex_herpes1_igm: boolean;
  ex_herpes2_igg: boolean;
  ex_herpes2_igm: boolean;
  ex_rubeola_igg: boolean;
  ex_rubeola_igm: boolean;
  ex_toxoplasma_igg: boolean;
  ex_toxoplasma_igm: boolean;
  ex_citomegalovirus_igg: boolean;
  ex_citomegalovirus_igm: boolean;
  ex_epstein_igg: boolean;
  ex_epstein_igm: boolean;
  ex_dengue_igg: boolean;
  ex_dengue_igm: boolean;
  ex_clamidia_iga: boolean;
  ex_clamidia_igg: boolean;
  ex_fta_abs: boolean;

  // Orina
  ex_emo: boolean;
  ex_gram_gota: boolean;
  ex_osmolaridad: boolean;
  ex_sodio_orina: boolean;
  ex_potasio_orina: boolean;
  ex_cloro_orina: boolean;
  ex_calcio_urinario: boolean;
  ex_fosforo_orina_parcial: boolean;
  ex_magnesio_orina: boolean;
  ex_glucosa_orina: boolean;
  ex_urea_orina: boolean;
  ex_creatina_orina: boolean;
  ex_nitrogeno_ureico: boolean;
  ex_acido_urico_orina: boolean;
  ex_proteinas_orina_parcial: boolean;
  ex_fosforo_orina_24h: boolean;
  ex_potasio_orina_24h: boolean;
  ex_proteinas_orina_24h: boolean;
  ex_depuracion_creatinina: boolean;
  ex_acido_urico_24h: boolean;
  ex_calcio_orina_24h: boolean;
  ex_amilasa_24h: boolean;
  ex_cobre_24h: boolean;
  ex_azucares_reductores_orina: boolean;
  ex_drogas_abuso: boolean;
  ex_albuminuria: boolean;

  // Marcadores tumorales
  ex_cea: boolean;
  ex_afp: boolean;
  ex_ca125: boolean;
  ex_ca153: boolean;
  ex_ca199: boolean;
  ex_ca724: boolean;
  ex_psa_libre: boolean;
  ex_psa_total: boolean;
  ex_b2_microglobulina: boolean;
  ex_anti_tpo: boolean;
  ex_anti_tg: boolean;
  ex_tiroglobulina: boolean;
  ex_he4: boolean;
  ex_bhcg_libre: boolean;
  ex_bhcg_cuantitativa_tm: boolean;

  // Citoquímico de líquidos
  ex_liq_cefalorraquideo: boolean;
  ex_liq_pleural: boolean;
  ex_liq_articular: boolean;
  ex_liq_pericardico: boolean;
  ex_liq_ascitico: boolean;
  ex_liq_amniotico: boolean;

  // Marcadores cardiacos
  ex_cpk_total: boolean;
  ex_ck_mb: boolean;
  ex_cpk_nac: boolean;
  ex_troponina_i: boolean;
  ex_troponina_t: boolean;
  ex_nt_probnp: boolean;
  ex_mioglobina: boolean;

  // Niveles de fármacos
  ex_acido_valproico: boolean;
  ex_carbamazepina: boolean;
  ex_fenobarbital: boolean;
  ex_digoxina: boolean;
  ex_fenitoina: boolean;
  ex_vancomicina: boolean;
  ex_amikacina: boolean;
  ex_litio: boolean;
  // Inmunosupresores
  ex_cyclosporina: boolean;
  ex_everolimus: boolean;
  ex_sirolimus: boolean;
  ex_tacrolimus: boolean;

  // Hormonas
  ex_t3: boolean;
  ex_ft3: boolean;
  ex_t4: boolean;
  ex_ft4: boolean;
  ex_tsh: boolean;
  ex_pth: boolean;
  ex_fsh: boolean;
  ex_androstenediona: boolean;
  ex_igf1: boolean;
  ex_igfbp3: boolean;
  ex_bhcg_cualitativa: boolean;
  ex_bhcg_cuantitativa: boolean;
  ex_hormona_crecimiento: boolean;
  ex_progesterona: boolean;
  ex_insulina: boolean;
  ex_acth: boolean;
  ex_prolactina: boolean;
  ex_vitamina_d: boolean;
  ex_estradiol: boolean;
  ex_lh: boolean;
  ex_cortisol: boolean;
  ex_testosterona_total: boolean;
  ex_testosterona_libre: boolean;
  ex_dhea_s: boolean;

  // Gases y electrolitos
  ex_na: boolean;
  ex_k: boolean;
  ex_cl: boolean;
  ex_ca_ion: boolean;
  ex_ca: boolean;
  ex_p: boolean;
  ex_mg: boolean;
  ex_li: boolean;
  ex_gasometria_arterial: boolean;
  ex_gasometria_venosa: boolean;

  // Serología
  ex_aglutinaciones_febriles: boolean;
  ex_asto: boolean;
  ex_fr_latex: boolean;
  ex_dengue_pcr: boolean;
  ex_chlamydia_pcr: boolean;
  ex_pepsinogeno: boolean;
  ex_vdrl_ser: boolean;
  ex_pcr_semicuantitativa: boolean;
  ex_malaria_pcr: boolean;
  ex_sifilis_pcr: boolean;
  ex_helicobacter_pcr: boolean;

  // Heces
  ex_coprologico: boolean;
  ex_coproparasitario_concentracion: boolean;
  ex_copro_seriado: boolean;
  ex_pmn: boolean;
  ex_sangre_oculta: boolean;
  ex_ph_heces: boolean;
  ex_rotavirus: boolean;
  ex_adenovirus: boolean;
  ex_criptosporidium: boolean;
  ex_oxiuros: boolean;
  ex_giardia: boolean;
  ex_grasas: boolean;
  ex_azucares_heces: boolean;
  ex_helicobacter_heces: boolean;

  // Medicina transfusional
  ex_grupo_factor: boolean;
  ex_coombs_directo: boolean;
  ex_coombs_indirecto: boolean;

  // Microbiología
  micro_muestra: string;
  micro_sitio_anatomico: string;
  ex_cultivo_antibiograma: boolean;
  ex_cristalografia: boolean;
  ex_gram: boolean;
  ex_fresco_micro: boolean;
  ex_estudio_micologico: string;
  ex_cultivo_micotico: string;
  ex_investigacion_paragonimus: boolean;
  ex_coloracion_zhiel: boolean;
  ex_investigacion_histoplasma: boolean;

  // Biología molecular y genética (campo libre)
  biologia_molecular: string;

  // D. Datos del profesional responsable (Solicitud 1)
  sol1_fecha_pedido: string;
  sol1_hora_pedido: string;
  sol1_profesional_primer_nombre: string;
  sol1_profesional_primer_apellido: string;
  sol1_profesional_segundo_apellido: string;
  sol1_documento: string;
  sol1_fecha_muestra: string;
  sol1_hora_muestra: string;
  sol1_tomador_muestra: string;

  // ── SOLICITUD 2 ────────────────────────────────────────────────────────

  // A. VIH / ITS
  vih_prueba_rapida: boolean;
  vih_elisa: boolean;
  vih_clia: boolean;
  vih_ifi: boolean;
  vih_carga_viral: boolean;
  vih_cd4: boolean;
  vih_tamizaje_sifilis: boolean;
  vih_vdrl: boolean;
  vih_hepatitis_b: boolean;

  // B. Tuberculosis
  tb_tipo_afectado_nuevo: boolean;
  tb_tipo_afectado_recaida: boolean;
  tb_tipo_afectado_fracaso: boolean;
  tb_tipo_afectado_perdida: boolean;
  tb_pvv: boolean;
  tb_ppl: boolean;
  tb_nino_5: boolean;
  tb_sospecha_meningitis: boolean;
  tb_alta_sospecha: boolean;
  tb_comorbilidad: boolean;
  tb_contacto_tbr: boolean;
  tb_sospecha_ep: boolean;
  tb_talento_humano: boolean;
  tb_irregularidad_tto: boolean;
  ex_reversion: boolean;
  tb_embarazo: boolean;
  tb_bk_2mes: boolean;
  tb_condiciones_especiales: boolean;
  tb_otros: string;
  tb_antecedentes: string;
  tb_tipo_resistencia: "SENSIBLE" | "RESISTENTE" | "";
  tb_tipo_muestra: string;
  tb_esputo: boolean;
  tb_otro_muestra: string;

  // Solicitud diagnóstico TB
  tb_ada: boolean;
  tb_baciloscopia_dx_check: boolean;
  tb_baciloscopia_dx_no: string;
  tb_cultivo_solido_dx_check: boolean;
  tb_cultivo_solido_dx_no: string;
  tb_baciloscopia_ctrl: boolean;
  tb_baciloscopia_ctrl_mes: string;
  tb_cultivo_solido_ctrl: boolean;
  tb_cultivo_solido_ctrl_mes: string;
  tb_pcr_xpert: boolean;
  tb_griess: boolean;
  tb_cultivo_mgit: boolean;
  tb_genotipificacion: boolean;
  tb_tipificacion: boolean;
  tb_psd1_proporciones: boolean;
  tb_psd1_mgit: boolean;
  tb_psd2_proporciones: boolean;
  tb_psd2_mgit: boolean;

  // C. Datos del profesional (Solicitud 2)
  sol2_fecha_pedido: string;
  sol2_hora_pedido: string;
  sol2_profesional_primer_nombre: string;
  sol2_profesional_primer_apellido: string;
  sol2_profesional_segundo_apellido: string;
  sol2_documento: string;
  sol2_fecha_muestra: string;
  sol2_hora_muestra: string;
  sol2_tomador_muestra: string;

  [key: string]: any;
}

interface Props {
  paciente?: {
    primer_nombre?: string;
    segundo_nombre?: string;
    primer_apellido?: string;
    segundo_apellido?: string;
    numero_historia_clinica?: string;
    cedula?: string;
    sexo?: string;
    fecha_nacimiento?: string;
    edad?: number;
    tipoPaciente?: string;
  };
  initialData?: Partial<DatosLaboratorio>;
  guardando?: boolean;
  exportando?: boolean;
  atencionId?: number;
}

export type HistoriaClinicaLaboratorioHandle = {
  getDatos: () => DatosLaboratorio;
  clearAutosave?: () => void;
  isDirty?: () => boolean;
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Lbl({ children, small = false }: { children: React.ReactNode; small?: boolean }) {
  return (
    <div style={{ fontSize: small ? "8px" : "9px", fontWeight: 700, padding: "2px 4px", lineHeight: 1.2, color: "#000" }}>
      {children}
    </div>
  );
}

function TxtInput({ value, onChange, readOnly = false, center = false, placeholder = "", type = "text" }: {
  value: string; onChange?: (v: string) => void; readOnly?: boolean;
  center?: boolean; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} readOnly={readOnly} placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      style={{
        width: "100%", border: "none", outline: "none", background: readOnly ? "#f0f0f0" : "#fff",
        fontSize: "10px", fontFamily: "Arial, sans-serif", textAlign: center ? "center" : "left",
        padding: "3px 4px", color: "#000", boxSizing: "border-box",
      }} />
  );
}

function ChkItem({ label, checked, onChange, bold = false }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; bold?: boolean;
}) {
  return (
    <label style={{
      display: "flex", alignItems: "flex-start", gap: 3, cursor: "pointer",
      fontSize: "9px", fontFamily: "Arial, sans-serif", padding: "1px 2px",
      lineHeight: 1.25, fontWeight: bold ? 700 : 400,
    }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        style={{ width: 10, height: 10, marginTop: 1, flexShrink: 0 }} />
      <span>{label}</span>
    </label>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const td: React.CSSProperties = { border: "1px solid #000", padding: 0, verticalAlign: "top" };
const tdM: React.CSSProperties = { ...td, verticalAlign: "middle", background: "#CCFFCC" };
const secH: React.CSSProperties = {
  background: "#CCCCFF", fontWeight: 700, fontSize: "11px",
  fontFamily: "Arial, sans-serif", padding: "4px 8px",
  border: "1px solid #000", letterSpacing: "0.02em",
};
const subH: React.CSSProperties = {
  background: "#DCE6F1", fontWeight: 700, fontSize: "10px",
  fontFamily: "Arial, sans-serif", padding: "3px 6px",
  border: "1px solid #000",
};
const subH2: React.CSSProperties = {
  background: "#DCE6F1", fontWeight: 700, fontSize: "10px",
  fontFamily: "Arial, sans-serif", padding: "3px 6px",
  border: "1px solid #000",
};
const solSep: React.CSSProperties = {
  background: "#1a3a5c", color: "#fff", fontWeight: 700, fontSize: "12px",
  fontFamily: "Arial, sans-serif", padding: "6px 10px",
  border: "2px solid #1a3a5c", textAlign: "center", letterSpacing: "0.05em",
};

// ─── Componente Principal ─────────────────────────────────────────────────────

const LaboratorioForm = React.forwardRef<HistoriaClinicaLaboratorioHandle, Props>(({
  paciente,
  initialData,
  guardando = false,
  exportando = false,
  atencionId,
}, ref) => {
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [d, setD] = useState<DatosLaboratorio>({
    institucion: paciente?.tipoPaciente ?? "PARTICULAR", unicodigo: "62858", establecimiento: "NUEVO HOSPITAL PANAMERICANO",
    numero_historia_clinica: paciente?.numero_historia_clinica ?? paciente?.cedula ?? "",
    numero_archivo: "",
    primer_apellido: paciente?.primer_apellido ?? "",
    segundo_apellido: paciente?.segundo_apellido ?? "",
    primer_nombre: paciente?.primer_nombre ?? "",
    segundo_nombre: paciente?.segundo_nombre ?? "",
    sexo: paciente?.sexo
      ? paciente.sexo.toUpperCase().startsWith("F") ? "F" : paciente.sexo.toUpperCase().startsWith("M") ? "M" : paciente.sexo
      : "",
    fecha_nacimiento: (paciente?.fecha_nacimiento ?? "").slice(0, 10),
    edad: paciente?.edad?.toString() ?? "",
    condicion_edad: "A",
    diagnostico_1: "", diagnostico_1_cie: "",
    diagnostico_2: "", diagnostico_2_cie: "",
    servicio: "", especialidad: "", sala: "", cama: "", prioridad: "",

    // Hematología
    ex_biometria_hematica: false, ex_fragilidad_osmotica: false, ex_hematocrito: false,
    ex_metabisulfito: false, ex_hemoglobina: false, ex_hematozooario: false,
    ex_plaquetas: false, ex_investigacion_leishmania: false, ex_reticulocitos: false,
    ex_eosinofilo_moco: false, ex_velocidad_eritrosedimentacion: false, ex_frotis_sangre: false,
    ex_hierro_serico: false, ex_acido_folico: false, ex_fijacion_hierro: false,
    ex_vitamina_b12: false, ex_saturacion_transferrina: false, ex_transferrina: false,
    ex_ferritina: false,
    // Coagulación
    ex_tp: false, ex_ttp: false, ex_tt: false, ex_inr: false, ex_factor_viii: false,
    ex_factor_ix: false, ex_factor_von_willebrand: false, ex_fibrinogeno: false,
    ex_dimero_d: false, ex_inhibidores: false,
    // Química
    ex_glucosa_basal: false, ex_glucosa_post_prandial: false, ex_glucosa_azar: false,
    ex_sobrecarga_glucosa: false, ex_sullivan: false, ex_urea: false, ex_creatinina: false,
    ex_acido_urico: false, ex_fosfatasa_alcalina: false, ex_ldh: false, ex_ast_tgo: false,
    ex_alt_tgp: false, ex_ggt: false, ex_amilasa: false, ex_lipasa: false,
    ex_bilirrubina_total: false, ex_bilirrubina_directa: false, ex_bilirrubina_indirecta: false,
    ex_colesterol_total: false, ex_hdl: false, ex_ldl: false, ex_vldl: false,
    ex_trigliceridos: false, ex_albumina: false, ex_proteinas_totales: false,
    ex_hba1c: false, ex_cpk_total_quim: false, ex_fructosamina: false, ex_pcr_cuantitativo: false,
    // Inmunología
    ex_complemento_c3: false, ex_complemento_c4: false, ex_iga_total: false,
    ex_ige_total: false, ex_igg_total: false, ex_igm_total: false, ex_procalcitonina: false,
    ex_il6: false, ex_ana: false, ex_anca_c: false, ex_anca_p: false, ex_anti_dna: false,
    ex_anti_ccp: false, ex_anti_sm: false, ex_anti_ro: false, ex_anti_la: false,
    ex_anti_cardiolipina_igg: false, ex_anti_cardiolipina_igm: false,
    ex_antifosfolipidos_igg: false, ex_antifosfolipidos_igm: false,
    ex_factor_reumatoideo: false, ex_sflt1: false, ex_pigf: false, ex_anticore_igg: false,
    ex_hepatitis_a_igm: false, ex_hepatitis_a_total: false, ex_hbsag: false,
    ex_anticore_igg_hbc: false, ex_anticore_igm_hbc: false, ex_hepatitis_c: false,
    ex_vih_cualitativa: false, ex_vih_cuantitativa: false,
    ex_herpes1_igg: false, ex_herpes1_igm: false, ex_herpes2_igg: false, ex_herpes2_igm: false,
    ex_rubeola_igg: false, ex_rubeola_igm: false, ex_toxoplasma_igg: false, ex_toxoplasma_igm: false,
    ex_citomegalovirus_igg: false, ex_citomegalovirus_igm: false,
    ex_epstein_igg: false, ex_epstein_igm: false,
    ex_dengue_igg: false, ex_dengue_igm: false,
    ex_clamidia_iga: false, ex_clamidia_igg: false, ex_fta_abs: false,
    // Orina
    ex_emo: false, ex_gram_gota: false, ex_osmolaridad: false,
    ex_sodio_orina: false, ex_potasio_orina: false, ex_cloro_orina: false,
    ex_calcio_urinario: false, ex_fosforo_orina_parcial: false, ex_magnesio_orina: false,
    ex_glucosa_orina: false, ex_urea_orina: false, ex_creatina_orina: false,
    ex_nitrogeno_ureico: false, ex_acido_urico_orina: false, ex_proteinas_orina_parcial: false,
    ex_fosforo_orina_24h: false, ex_potasio_orina_24h: false, ex_proteinas_orina_24h: false,
    ex_depuracion_creatinina: false, ex_acido_urico_24h: false, ex_calcio_orina_24h: false,
    ex_amilasa_24h: false, ex_cobre_24h: false, ex_azucares_reductores_orina: false,
    ex_drogas_abuso: false, ex_albuminuria: false,
    // Marcadores tumorales
    ex_cea: false, ex_afp: false, ex_ca125: false, ex_ca153: false, ex_ca199: false,
    ex_ca724: false, ex_psa_libre: false, ex_psa_total: false, ex_b2_microglobulina: false,
    ex_anti_tpo: false, ex_anti_tg: false, ex_tiroglobulina: false,
    ex_he4: false, ex_bhcg_libre: false, ex_bhcg_cuantitativa_tm: false,
    // Líquidos
    ex_liq_cefalorraquideo: false, ex_liq_pleural: false, ex_liq_articular: false,
    ex_liq_pericardico: false, ex_liq_ascitico: false, ex_liq_amniotico: false,
    // Cardiacos
    ex_cpk_total: false, ex_ck_mb: false, ex_cpk_nac: false, ex_troponina_i: false,
    ex_troponina_t: false, ex_nt_probnp: false, ex_mioglobina: false,
    // Fármacos
    ex_acido_valproico: false, ex_carbamazepina: false, ex_fenobarbital: false,
    ex_digoxina: false, ex_fenitoina: false, ex_vancomicina: false,
    ex_amikacina: false, ex_litio: false,
    ex_cyclosporina: false, ex_everolimus: false, ex_sirolimus: false, ex_tacrolimus: false,
    // Hormonas
    ex_t3: false, ex_ft3: false, ex_t4: false, ex_ft4: false, ex_tsh: false, ex_pth: false,
    ex_fsh: false, ex_androstenediona: false, ex_igf1: false, ex_igfbp3: false,
    ex_bhcg_cualitativa: false, ex_bhcg_cuantitativa: false, ex_hormona_crecimiento: false,
    ex_progesterona: false, ex_insulina: false, ex_acth: false, ex_prolactina: false,
    ex_vitamina_d: false, ex_estradiol: false, ex_lh: false, ex_cortisol: false,
    ex_testosterona_total: false, ex_testosterona_libre: false, ex_dhea_s: false,
    // Gases y electrolitos
    ex_na: false, ex_k: false, ex_cl: false, ex_ca_ion: false, ex_ca: false, ex_p: false,
    ex_mg: false, ex_li: false, ex_gasometria_arterial: false, ex_gasometria_venosa: false,
    // Serología
    ex_aglutinaciones_febriles: false, ex_asto: false, ex_fr_latex: false,
    ex_dengue_pcr: false, ex_chlamydia_pcr: false, ex_pepsinogeno: false,
    ex_vdrl_ser: false, ex_pcr_semicuantitativa: false, ex_malaria_pcr: false,
    ex_sifilis_pcr: false, ex_helicobacter_pcr: false,
    // Heces
    ex_coprologico: false, ex_coproparasitario_concentracion: false, ex_copro_seriado: false,
    ex_pmn: false, ex_sangre_oculta: false, ex_ph_heces: false,
    ex_rotavirus: false, ex_adenovirus: false, ex_criptosporidium: false,
    ex_oxiuros: false, ex_giardia: false, ex_grasas: false,
    ex_azucares_heces: false, ex_helicobacter_heces: false,
    // Medicina transfusional
    ex_grupo_factor: false, ex_coombs_directo: false, ex_coombs_indirecto: false,
    // Microbiología
    micro_muestra: "", micro_sitio_anatomico: "",
    ex_cultivo_antibiograma: false, ex_cristalografia: false, ex_gram: false, ex_fresco_micro: false,
    ex_estudio_micologico: "", ex_cultivo_micotico: "",
    ex_investigacion_paragonimus: false, ex_coloracion_zhiel: false, ex_investigacion_histoplasma: false,
    biologia_molecular: "",
    // Profesional sol1
    sol1_fecha_pedido: today, sol1_hora_pedido: nowTime,
    sol1_profesional_primer_nombre: "", sol1_profesional_primer_apellido: "",
    sol1_profesional_segundo_apellido: "", sol1_documento: "",
    sol1_fecha_muestra: today, sol1_hora_muestra: nowTime, sol1_tomador_muestra: "",
    // VIH/ITS
    vih_prueba_rapida: false, vih_elisa: false, vih_clia: false, vih_ifi: false,
    vih_carga_viral: false, vih_cd4: false, vih_tamizaje_sifilis: false,
    vih_vdrl: false, vih_hepatitis_b: false,
    // TB
    tb_tipo_afectado_nuevo: false, tb_tipo_afectado_recaida: false, tb_tipo_afectado_fracaso: false,
    tb_tipo_afectado_perdida: false, tb_pvv: false, tb_ppl: false, tb_nino_5: false,
    tb_sospecha_meningitis: false, tb_alta_sospecha: false, tb_comorbilidad: false,
    tb_contacto_tbr: false, tb_sospecha_ep: false, tb_talento_humano: false,
    tb_irregularidad_tto: false, ex_reversion: false, tb_embarazo: false,
    tb_bk_2mes: false, tb_condiciones_especiales: false, tb_otros: "",
    tb_antecedentes: "", tb_tipo_resistencia: "", tb_tipo_muestra: "",
    tb_esputo: false, tb_otro_muestra: "",
    tb_ada: false, tb_baciloscopia_dx_check: false, tb_baciloscopia_dx_no: "",
    tb_cultivo_solido_dx_check: false, tb_cultivo_solido_dx_no: "",
    tb_baciloscopia_ctrl: false, tb_baciloscopia_ctrl_mes: "",
    tb_cultivo_solido_ctrl: false, tb_cultivo_solido_ctrl_mes: "",
    tb_pcr_xpert: false, tb_griess: false, tb_cultivo_mgit: false,
    tb_genotipificacion: false, tb_tipificacion: false,
    tb_psd1_proporciones: false, tb_psd1_mgit: false,
    tb_psd2_proporciones: false, tb_psd2_mgit: false,
    // Profesional sol2
    sol2_fecha_pedido: today, sol2_hora_pedido: nowTime,
    sol2_profesional_primer_nombre: "", sol2_profesional_primer_apellido: "",
    sol2_profesional_segundo_apellido: "", sol2_documento: "",
    sol2_fecha_muestra: today, sol2_hora_muestra: nowTime, sol2_tomador_muestra: "",
    ...initialData,
  });

  const { isDirty, clearAutosave } = useFormAutosaveAndWarn({
    formId: `hc_laboratorio_${atencionId || 'new'}_${paciente?.cedula || 'new'}`,
    initialData: initialData || {},
    currentData: d,
    onRestore: (saved) => setD(p => ({ ...p, ...saved })),
  });

  useImperativeHandle(
    ref,
    () => ({
      getDatos: () => {
        const X = (v: boolean) => (v ? "X" : "");

        const flat: Record<string, any> = { ...d };

        // A. Datos del establecimiento y usuario / paciente
        flat.lab_institucion = d.institucion;
        flat.lab_unicodigo = d.unicodigo;
        flat.lab_establecimiento = d.establecimiento;
        flat.lab_numero_historia_clinica = d.numero_historia_clinica;
        flat.lab_numero_archivo = d.numero_archivo;

        flat.lab_primer_apellido = d.primer_apellido;
        flat.lab_segundo_apellido = d.segundo_apellido;
        flat.lab_primer_nombre = d.primer_nombre;
        flat.lab_segundo_nombre = d.segundo_nombre;
        flat.lab_sexo = d.sexo;
        flat.lab_fecha_nacimiento = d.fecha_nacimiento;
        flat.lab_edad = d.edad;

        flat.lab_condicion_edad_h = d.condicion_edad === "H" ? "X" : "";
        flat.lab_condicion_edad_d = d.condicion_edad === "D" ? "X" : "";
        flat.lab_condicion_edad_m = d.condicion_edad === "M" ? "X" : "";
        flat.lab_condicion_edad_a = d.condicion_edad === "A" ? "X" : "";

        // B. Servicio y prioridad
        flat.lab_diagnostico_1 = d.diagnostico_1;
        flat.lab_diagnostico_1_cie = d.diagnostico_1_cie;
        flat.lab_diagnostico_2 = d.diagnostico_2;
        flat.lab_diagnostico_2_cie = d.diagnostico_2_cie;

        flat.lab_servicio_emergencia = d.servicio === "EMERGENCIA" ? "X" : "";
        flat.lab_servicio_consulta = d.servicio === "CONSULTA_EXTERNA" ? "X" : "";
        flat.lab_servicio_hosp = d.servicio === "HOSPITALIZACION" ? "X" : "";
        flat.lab_especialidad = d.especialidad;
        flat.lab_sala = d.sala;
        flat.lab_cama = d.cama;
        flat.lab_prioridad_urgente = d.prioridad === "URGENTE" ? "X" : "";
        flat.lab_prioridad_rutina = d.prioridad === "RUTINA" ? "X" : "";

        // C. Listado de exámenes (check a "X")
        flat.lab_biometria_hematica = X(!!d.ex_biometria_hematica);
        flat.lab_hematocrito = X(!!d.ex_hematocrito);
        flat.lab_hemoglobina = X(!!d.ex_hemoglobina);
        flat.lab_plaquetas = X(!!d.ex_plaquetas);
        flat.reticulocitos = X(!!d.ex_reticulocitos);
        flat.ves = X(!!d.ex_velocidad_eritrosedimentacion);
        flat.hierro_serico = X(!!d.ex_hierro_serico);
        flat.fijacion_hierro = X(!!d.ex_fijacion_hierro);
        flat.porcentaje_saturacion_transferrina = X(!!d.ex_saturacion_transferrina);
        flat.transferrina = X(!!d.ex_transferrina);
        flat.ferritina = X(!!d.ex_ferritina);

        flat.fragilidad_osmotica = X(!!d.ex_fragilidad_osmotica);
        flat.metabisulfito = X(!!d.ex_metabisulfito);
        flat.hematozooario = X(!!d.ex_hematozooario);
        flat.investigacion_leishmania = X(!!d.ex_investigacion_leishmania);
        flat.eosinofilo_moco_nasal = X(!!d.ex_eosinofilo_moco);
        flat.frotis_sangre_periferica = X(!!d.ex_frotis_sangre);
        flat.acido_folico = X(!!d.ex_acido_folico);
        flat.vitamina_b12 = X(!!d.ex_vitamina_b12);

        flat.tiempo_protrombina_tp = X(!!d.ex_tp);
        flat.tiempo_tromboplastina_ttp = X(!!d.ex_ttp);
        flat.tiempo_trombina_tt = X(!!d.ex_tt);
        flat.inr = X(!!d.ex_inr);
        flat.factor_coagulacion_viii = X(!!d.ex_factor_viii);
        flat.factor_coagulacion_ix = X(!!d.ex_factor_ix);
        flat.factor_von_willebrand = X(!!d.ex_factor_von_willebrand);
        flat.fibrinogeno = X(!!d.ex_fibrinogeno);
        flat.dimero_d = X(!!d.ex_dimero_d);
        flat.ind_inhibidores = X(!!d.ex_inhibidores);

        flat.glucosa_basal = X(!!d.ex_glucosa_basal);
        flat.glucosa_post_prandial = X(!!d.ex_glucosa_post_prandial);
        flat.glucosa_al_azar = X(!!d.ex_glucosa_azar);
        flat.sobrecarga_glucosa_75g = X(!!d.ex_sobrecarga_glucosa);
        flat.test_sullivan_50g = X(!!d.ex_sullivan);
        flat.urea = X(!!d.ex_urea);
        flat.creatinina = X(!!d.ex_creatinina);
        flat.acido_urico = X(!!d.ex_acido_urico);
        flat.fosfatasa_alcalina = X(!!d.ex_fosfatasa_alcalina);
        flat.deshidrogenasa_lactica = X(!!d.ex_ldh);
        flat.ast_tgo = X(!!d.ex_ast_tgo);
        flat.alt_tgp = X(!!d.ex_alt_tgp);
        flat.ggt = X(!!d.ex_ggt);
        flat.amilasa = X(!!d.ex_amilasa);
        flat.lipasa = X(!!d.ex_lipasa);
        flat.bilirrubina_total = X(!!d.ex_bilirrubina_total);
        flat.bilirrubina_directa = X(!!d.ex_bilirrubina_directa);
        flat.bilirrubina_indirecta = X(!!d.ex_bilirrubina_indirecta);
        flat.colesterol_total = X(!!d.ex_colesterol_total);
        flat.hdl = X(!!d.ex_hdl);
        flat.ldl = X(!!d.ex_ldl);
        flat.vldl = X(!!d.ex_vldl);
        flat.trigliceridos = X(!!d.ex_trigliceridos);
        flat.albumina = X(!!d.ex_albumina);
        flat.proteinas_totales = X(!!d.ex_proteinas_totales);
        flat.hba1c = X(!!d.ex_hba1c);
        flat.cpk_total = X(!!d.ex_cpk_total_quim);
        flat.fructosamina = X(!!d.ex_fructosamina);
        flat.pcr_cuantitativo = X(!!d.ex_pcr_cuantitativo);

        flat.complemento_c3 = X(!!d.ex_complemento_c3);
        flat.complemento_c4 = X(!!d.ex_complemento_c4);
        flat.iga_total = X(!!d.ex_iga_total);
        flat.ige_total = X(!!d.ex_ige_total);
        flat.igg_total = X(!!d.ex_igg_total);
        flat.igm_total = X(!!d.ex_igm_total);
        flat.procalcitonina = X(!!d.ex_procalcitonina);
        flat.il6 = X(!!d.ex_il6);
        flat.ana = X(!!d.ex_ana);
        flat.anca_c = X(!!d.ex_anca_c);
        flat.anca_p = X(!!d.ex_anca_p);
        flat.anti_dna = X(!!d.ex_anti_dna);
        flat.anti_ccp = X(!!d.ex_anti_ccp);
        flat.anti_sm = X(!!d.ex_anti_sm);
        flat.anti_ro = X(!!d.ex_anti_ro);
        flat.anti_la = X(!!d.ex_anti_la);
        flat.anti_cardiolipina_igg = X(!!d.ex_anti_cardiolipina_igg);
        flat.anti_cardiolipina_igm = X(!!d.ex_anti_cardiolipina_igm);
        flat.antifosfolipidos_igg = X(!!d.ex_antifosfolipidos_igg);
        flat.antifosfolipidos_igm = X(!!d.ex_antifosfolipidos_igm);
        flat.factor_reumatoideo = X(!!d.ex_factor_reumatoideo);
        flat.sflt1 = X(!!d.ex_sflt1);
        flat.pigf = X(!!d.ex_pigf);
        flat.hbcag = X(!!d.ex_anticore_igg);
        flat.hepatitis_a_igm = X(!!d.ex_hepatitis_a_igm);
        flat.hepatitis_a_total = X(!!d.ex_hepatitis_a_total);
        flat.hbsag = X(!!d.ex_hbsag);
        flat.hbc_igg = X(!!d.ex_anticore_igg_hbc);
        flat.hbc_igm = X(!!d.ex_anticore_igm_hbc);
        flat.hvc = X(!!d.ex_hepatitis_c);
        flat.vih_1_2_cualitativa = X(!!d.ex_vih_cualitativa);
        flat.vih_1_2_cuantitativa = X(!!d.ex_vih_cuantitativa);
        flat.herpes_1_igg = X(!!d.ex_herpes1_igg);
        flat.herpes_1_igm = X(!!d.ex_herpes1_igm);
        flat.herpes_2_igg = X(!!d.ex_herpes2_igg);
        flat.herpes_2_igm = X(!!d.ex_herpes2_igm);
        flat.rubeola_igg = X(!!d.ex_rubeola_igg);
        flat.rubeola_igm = X(!!d.ex_rubeola_igm);
        flat.toxoplasma_igg = X(!!d.ex_toxoplasma_igg);
        flat.toxoplasma_igm = X(!!d.ex_toxoplasma_igm);
        flat.citomegalovirus_igg = X(!!d.ex_citomegalovirus_igg);
        flat.citomegalovirus_igm = X(!!d.ex_citomegalovirus_igm);
        flat.epstein_barr_igg = X(!!d.ex_epstein_igg);
        flat.epstein_barr_igm = X(!!d.ex_epstein_igm);
        flat.dengue_igg = X(!!d.ex_dengue_igg);
        flat.dengue_igm = X(!!d.ex_dengue_igm);
        flat.clamidia_iga = X(!!d.ex_clamidia_iga);
        flat.clamidia_igg = X(!!d.ex_clamidia_igg);
        flat.fta_abs = X(!!d.ex_fta_abs);

        flat.elemental_y_microscopico_emo = X(!!d.ex_emo);
        flat.gram_gota_fresca = X(!!d.ex_gram_gota);
        flat.osmolaridad_urinaria = X(!!d.ex_osmolaridad);
        flat.sodio_orina_parcial = X(!!d.ex_sodio_orina);
        flat.potasio_orina_parcial = X(!!d.ex_potasio_orina);
        flat.cloro_orina_parcial = X(!!d.ex_cloro_orina);
        flat.calcio_urinario = X(!!d.ex_calcio_urinario);
        flat.fosforo_orina_parcial = X(!!d.ex_fosforo_orina_parcial);
        flat.magnesio_orina_parcial = X(!!d.ex_magnesio_orina);
        flat.glucosa_orina_parcial = X(!!d.ex_glucosa_orina);
        flat.urea_orina_parcial = X(!!d.ex_urea_orina);
        flat.creatinina_orina_parcial = X(!!d.ex_creatina_orina);
        flat.nitrogeno_ureico_orina = X(!!d.ex_nitrogeno_ureico);
        flat.acido_urico_orina_parcial = X(!!d.ex_acido_urico_orina);
        flat.proteinas_orina_parcial = X(!!d.ex_proteinas_orina_parcial);
        flat.fosforo_orina_24h = X(!!d.ex_fosforo_orina_24h);
        flat.potasio_orina_24h = X(!!d.ex_potasio_orina_24h);
        flat.proteinas_orina_24h = X(!!d.ex_proteinas_orina_24h);
        flat.depuracion_creatinina_24h = X(!!d.ex_depuracion_creatinina);
        flat.acido_urico_orina_24h = X(!!d.ex_acido_urico_24h);
        flat.calcio_orina_24h = X(!!d.ex_calcio_orina_24h);
        flat.amilasa_orina_24h = X(!!d.ex_amilasa_24h);
        flat.cobre_orina_24h = X(!!d.ex_cobre_24h);
        flat.azucares_reductores = X(!!d.ex_azucares_reductores_orina);
        flat.drogas_abuso_orina = X(!!d.ex_drogas_abuso);
        flat.albuminuria = X(!!d.ex_albuminuria);

        flat.coprologico_coproparasitario = X(!!d.ex_coprologico);
        flat.coproparasitario_concentracion = X(!!d.ex_coproparasitario_concentracion);
        flat.copro_seriado = X(!!d.ex_copro_seriado);
        flat.pmn = X(!!d.ex_pmn);
        flat.sangre_oculta = X(!!d.ex_sangre_oculta);
        flat.investigacion_ph = X(!!d.ex_ph_heces);
        flat.rotavirus = X(!!d.ex_rotavirus);
        flat.adenovirus = X(!!d.ex_adenovirus);
        flat.criptosporidium = X(!!d.ex_criptosporidium);
        flat.oxiuros = X(!!d.ex_oxiuros);
        flat.gardia_lamblia_antigeno = X(!!d.ex_giardia);
        flat.investigacion_grasas = X(!!d.ex_grasas);
        flat.azucares_reductores_heces = X(!!d.ex_azucares_heces);
        flat.helicobacter_pylori = X(!!d.ex_helicobacter_heces);

        flat.cea = X(!!d.ex_cea);
        flat.afp = X(!!d.ex_afp);
        flat.ca125 = X(!!d.ex_ca125);
        flat.ca153 = X(!!d.ex_ca153);
        flat.ca199 = X(!!d.ex_ca199);
        flat.ca724 = X(!!d.ex_ca724);
        flat.psa_libre = X(!!d.ex_psa_libre);
        flat.psa_total = X(!!d.ex_psa_total);
        flat.b2_microglobulina = X(!!d.ex_b2_microglobulina);
        flat.anti_tpo = X(!!d.ex_anti_tpo);
        flat.anti_tg = X(!!d.ex_anti_tg);
        flat.tiroglobulina = X(!!d.ex_tiroglobulina);
        flat.he4 = X(!!d.ex_he4);
        flat.b_hcg_libre = X(!!d.ex_bhcg_libre);
        flat.b_hcg_cuantitativa = X(!!d.ex_bhcg_cuantitativa_tm);

        flat.cefalorraquideo = X(!!d.ex_liq_cefalorraquideo);
        flat.articular_sinovial = X(!!d.ex_liq_articular);
        flat.ascitico_peritoneal = X(!!d.ex_liq_ascitico);
        flat.pleural = X(!!d.ex_liq_pleural);
        flat.pericardico = X(!!d.ex_liq_pericardico);
        flat.liquido_amniotico = X(!!d.ex_liq_amniotico);

        flat.cpk_total_marcadores = X(!!d.ex_cpk_total);
        flat.ck_mb = X(!!d.ex_ck_mb);
        flat.cpk_nac = X(!!d.ex_cpk_nac);
        flat.troponina_i = X(!!d.ex_troponina_i);
        flat.troponina_t = X(!!d.ex_troponina_t);
        flat.nt_pro_bnp = X(!!d.ex_nt_probnp);
        flat.mioglobina = X(!!d.ex_mioglobina);

        flat.acido_valproico = X(!!d.ex_acido_valproico);
        flat.carbamazepina = X(!!d.ex_carbamazepina);
        flat.fenobarbital = X(!!d.ex_fenobarbital);
        flat.digoxina = X(!!d.ex_digoxina);
        flat.fenitoina_sodica = X(!!d.ex_fenitoina);
        flat.vancomicina = X(!!d.ex_vancomicina);
        flat.amikacina = X(!!d.ex_amikacina);
        flat.litio = X(!!d.ex_litio);

        flat.ciclosporina = X(!!d.ex_cyclosporina);
        flat.sirolimus = X(!!d.ex_sirolimus);
        flat.tacrolimus = X(!!d.ex_tacrolimus);
        flat.everolimus = X(!!d.ex_everolimus);

        flat.t3 = X(!!d.ex_t3);
        flat.ft3 = X(!!d.ex_ft3);
        flat.t4 = X(!!d.ex_t4);
        flat.ft4 = X(!!d.ex_ft4);
        flat.tsh = X(!!d.ex_tsh);
        flat.pth = X(!!d.ex_pth);
        flat.fsh = X(!!d.ex_fsh);
        flat.androstenediona = X(!!d.ex_androstenediona);
        flat.factor_crecimiento_igf1 = X(!!d.ex_igf1);
        flat.factor_union_igfbp3 = X(!!d.ex_igfbp3);
        flat.b_hcg_cualitativa_h = X(!!d.ex_bhcg_cualitativa);
        flat.b_hcg_cuantitativa_h = X(!!d.ex_bhcg_cuantitativa);
        flat.hormona_crecimiento = X(!!d.ex_hormona_crecimiento);
        flat.progesterona = X(!!d.ex_progesterona);
        flat.insulina = X(!!d.ex_insulina);
        flat.acth = X(!!d.ex_acth);
        flat.prolactina = X(!!d.ex_prolactina);
        flat.vitamina_d = X(!!d.ex_vitamina_d);
        flat.estradiol_e2 = X(!!d.ex_estradiol);
        flat.lh = X(!!d.ex_lh);
        flat.cortisol = X(!!d.ex_cortisol);
        flat.testosterona_total = X(!!d.ex_testosterona_total);
        flat.testosterona_libre = X(!!d.ex_testosterona_libre);
        flat.dhea_s = X(!!d.ex_dhea_s);

        flat.sodio_na = X(!!d.ex_na);
        flat.potasio_k = X(!!d.ex_k);
        flat.cloro_cl = X(!!d.ex_cl);
        flat.calcio_ca = X(!!d.ex_ca);
        flat.calcio_ionico = X(!!d.ex_ca_ion);
        flat.fosforo_p = X(!!d.ex_p);
        flat.magnesio_mg = X(!!d.ex_mg);
        flat.litio_li = X(!!d.ex_li);
        flat.gasometria_arterial = X(!!d.ex_gasometria_arterial);
        flat.gasometria_venosa = X(!!d.ex_gasometria_venosa);

        flat.aglutinaciones_febriles = X(!!d.ex_aglutinaciones_febriles);
        flat.asto = X(!!d.ex_asto);
        flat.fr_latex = X(!!d.ex_fr_latex);
        flat.dengue_pcr = X(!!d.ex_dengue_pcr);
        flat.chlamydia_pcr = X(!!d.ex_chlamydia_pcr);
        flat.pepsinogeno = X(!!d.ex_pepsinogeno);
        flat.vdrl_manual = X(!!d.ex_vdrl_ser);
        flat.pcr_semicuantitativa = X(!!d.ex_pcr_semicuantitativa);
        flat.malaria_pcr = X(!!d.ex_malaria_pcr);
        flat.sifilis_pcr = X(!!d.ex_sifilis_pcr);
        flat.helicobacter_pylori_serologia = X(!!d.ex_helicobacter_pcr);

        flat.grupo_y_factor = X(!!d.ex_grupo_factor);
        flat.coombs_directo = X(!!d.ex_coombs_directo);
        flat.coombs_indirecto = X(!!d.ex_coombs_indirecto);

        flat.muestra = d.micro_muestra;
        flat.sitio_anatomico = d.micro_sitio_anatomico;
        flat.cultivo_y_antibioigrama = X(!!d.ex_cultivo_antibiograma);
        flat.cristalografia = X(!!d.ex_cristalografia);
        flat.gram = X(!!d.ex_gram);
        flat.fresco = X(!!d.ex_fresco_micro);
        flat.estudio_micologico_koh = d.ex_estudio_micologico;
        flat.cultivo_micotico = d.ex_cultivo_micotico;
        flat.investigacion_paragonimus = X(!!d.ex_investigacion_paragonimus);
        flat.investigacion_histoplasma = X(!!d.ex_investigacion_histoplasma);
        flat.coloracion_zhiel_nielssen = X(!!d.ex_coloracion_zhiel);

        // Biología molecular: tu UI tiene un campo libre, el map tiene 5 filas
        flat.biologia_1 = d.biologia_molecular;
        flat.biologia_2 = "";
        flat.biologia_3 = "";
        flat.biologia_4 = "";
        flat.biologia_5 = "";

        // D. Profesional (Solicitud 1)
        flat.lab_fecha_generacion = d.sol1_fecha_pedido;
        flat.lab_hora_generacion = d.sol1_hora_pedido;
        flat.lab_prof_primer_nombre = d.sol1_profesional_primer_nombre;
        flat.lab_prof_primer_apellido = d.sol1_profesional_primer_apellido;
        flat.lab_prof_segundo_apellido = d.sol1_profesional_segundo_apellido;
        flat.lab_prof_documento = d.sol1_documento;
        flat.lab_fecha_toma_muestra = d.sol1_fecha_muestra;
        flat.lab_hora_toma_muestra = d.sol1_hora_muestra;
        flat.lab_persona_toma_muestra = d.sol1_tomador_muestra;

        // VIH / ITS
        flat.prueba_rapida_vih = X(!!d.vih_prueba_rapida);
        flat.elisa_automatizada = X(!!d.vih_elisa);
        flat.clia = X(!!d.vih_clia);
        flat.ifi = X(!!d.vih_ifi);
        flat.carga_viral = X(!!d.vih_carga_viral);
        flat.cd4 = X(!!d.vih_cd4);
        flat.tamizaje_sifilis = X(!!d.vih_tamizaje_sifilis);
        flat.vdrl = X(!!d.vih_vdrl);
        flat.hepatitis_b_hbsag = X(!!d.vih_hepatitis_b);

        // Tuberculosis
        flat.tb_nuevo = X(!!d.tb_tipo_afectado_nuevo);
        flat.tb_recaida = X(!!d.tb_tipo_afectado_recaida);
        flat.tb_fracaso = X(!!d.tb_tipo_afectado_fracaso);
        flat.tb_perdida_seguimiento = X(!!d.tb_tipo_afectado_perdida);
        flat.tb_pvv = X(!!d.tb_pvv);
        flat.tb_ppl = X(!!d.tb_ppl);
        flat.tb_nino_menor_5 = X(!!d.tb_nino_5);
        flat.tb_sospecha_meningitis = X(!!d.tb_sospecha_meningitis);
        flat.tb_alta_sospecha_bk_negativo = X(!!d.tb_alta_sospecha);
        flat.tb_comorbilidad = X(!!d.tb_comorbilidad);
        flat.tb_comorbilidad_desc = "";
        flat.tb_contacto_tbr = X(!!d.tb_contacto_tbr);
        flat.tb_sospecha_tb_ep = X(!!d.tb_sospecha_ep);
        flat.tb_talento_humano_salud = X(!!d.tb_talento_humano);
        flat.irregularidad_tto = X(!!d.tb_irregularidad_tto);
        flat.reversion = X(!!d.ex_reversion);
        flat.tb_embarazo = X(!!d.tb_embarazo);
        flat.tb_bk_positivo_2do_mes = X(!!d.tb_bk_2mes);
        flat.tb_condiciones_especiales = X(!!d.tb_condiciones_especiales);
        flat.tb_condiciones_desc = "";
        flat.tb_otros = d.tb_otros ? "X" : "";
        flat.tb_otros_desc = d.tb_otros;

        flat.tb_sensible = d.tb_tipo_resistencia === "SENSIBLE" ? "X" : "";
        flat.tb_resistente = d.tb_tipo_resistencia === "RESISTENTE" ? "X" : "";
        flat.tb_tipo_resistencia = d.tb_tipo_resistencia;

        flat.tb_muestra_esputo = X(!!d.tb_esputo);
        flat.tb_muestra_otro = d.tb_otro_muestra ? "X" : "";
        flat.tb_muestra_otro_desc = d.tb_otro_muestra;

        flat.tb_ada = X(!!d.tb_ada);
        flat.tb_baciloscopia_diag = X(!!d.tb_baciloscopia_dx_check);
        flat.tb_baciloscopia_diag_no = d.tb_baciloscopia_dx_no;
        flat.tb_cultivo_diagnostico = X(!!d.tb_cultivo_solido_dx_check);
        flat.tb_cultivo_diagnostico_no = d.tb_cultivo_solido_dx_no;
        flat.tb_control_1 = X(!!d.tb_baciloscopia_ctrl);
        flat.tb_mes_1 = d.tb_baciloscopia_ctrl_mes;
        flat.tb_control_2 = X(!!d.tb_cultivo_solido_ctrl);
        flat.tb_mes_2 = d.tb_cultivo_solido_ctrl_mes;
        flat.tb_pcr_tiempo_real_xpert = X(!!d.tb_pcr_xpert);
        flat.tb_nitrato_reductasa_griess = X(!!d.tb_griess);
        flat.tb_cultivo_medio_liquido_mgit = X(!!d.tb_cultivo_mgit);
        flat.tb_genotipificacion = X(!!d.tb_genotipificacion);
        flat.tb_tipificacion = X(!!d.tb_tipificacion);
        flat.tb_psd_1ra_linea_prop_solido = X(!!d.tb_psd1_proporciones);
        flat.tb_psd_1ra_linea_mgit_liquido = X(!!d.tb_psd1_mgit);
        flat.tb_psd_2da_linea_prop_solido = X(!!d.tb_psd2_proporciones);
        flat.tb_psd_2da_linea_mgit_liquido = X(!!d.tb_psd2_mgit);

        // Profesional (Solicitud 2)
        flat.lab2_fecha_generacion = d.sol2_fecha_pedido;
        flat.lab2_hora_generacion = d.sol2_hora_pedido;
        flat.lab2_prof_primer_nombre = d.sol2_profesional_primer_nombre;
        flat.lab2_prof_primer_apellido = d.sol2_profesional_primer_apellido;
        flat.lab2_prof_segundo_apellido = d.sol2_profesional_segundo_apellido;
        flat.lab2_prof_documento = d.sol2_documento;
        flat.lab2_fecha_toma_muestra = d.sol2_fecha_muestra;
        flat.lab2_hora_toma_muestra = d.sol2_hora_muestra;
        flat.sol2_tomador_muestra = d.sol2_tomador_muestra;

        return flat as DatosLaboratorio;
      },
      clearAutosave: () => clearAutosave(),
      isDirty: () => isDirty,
    }),
    [d, clearAutosave, isDirty]
  );

  const s = <K extends keyof DatosLaboratorio>(k: K) => (v: DatosLaboratorio[K]) =>
    setD((p) => ({ ...p, [k]: v }));
  const str = (k: keyof DatosLaboratorio) => (v: string) => s(k)(v as never);
  const chk = (k: keyof DatosLaboratorio) => (v: boolean) => s(k)(v as never);

  const tbl: React.CSSProperties = {
    width: "100%", minWidth: "1100px", borderCollapse: "collapse",
    tableLayout: "fixed", fontFamily: "Arial, sans-serif", fontSize: "10px",
  };

  // Helper: celda label + checkbox en dos columnas
  const examRow = (items: Array<[keyof DatosLaboratorio, string]>) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px 8px" }}>
      {items.map(([k, label]) => (
        <ChkItem key={k as string} label={label} checked={d[k] as boolean} onChange={chk(k)} />
      ))}
    </div>
  );

  const examCol = (items: Array<[keyof DatosLaboratorio, string]>) => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {items.map(([k, label]) => (
        <ChkItem key={k as string} label={label} checked={d[k] as boolean} onChange={chk(k)} />
      ))}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ overflowX: "visible", overflowY: "visible", background: "#fff", minHeight: "70vh" }}>

        {/* ════════════════════════════════════════════════════════════════
            ══════  SOLICITUD (1)  ══════════════════════════════════════
            ════════════════════════════════════════════════════════════════ */}
        <div style={{ ...solSep }}>LABORATORIO CLÍNICO — SOLICITUD (1)</div>

        <table style={tbl}>
          <tbody>

            {/* ── A. DATOS DEL ESTABLECIMIENTO ── */}
            <tr><td colSpan={20} style={secH}>A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE</td></tr>
            <tr>
              <td colSpan={4} style={tdM}><Lbl>INSTITUCIÓN DEL SISTEMA</Lbl></td>
              <td colSpan={2} style={tdM}><Lbl>UNICÓDIGO</Lbl></td>
              <td colSpan={7} style={tdM}><Lbl>ESTABLECIMIENTO DE SALUD</Lbl></td>
              <td colSpan={5} style={tdM}><Lbl>N° HISTORIA CLÍNICA</Lbl></td>
              <td colSpan={2} style={tdM}><Lbl>N° ARCHIVO</Lbl></td>
            </tr>
            <tr style={{ height: 22 }}>
              <td colSpan={4} style={td}><TxtInput value={d.institucion} onChange={str("institucion")} /></td>
              <td colSpan={2} style={td}><TxtInput value={d.unicodigo} onChange={str("unicodigo")} center /></td>
              <td colSpan={7} style={td}><TxtInput value={d.establecimiento} onChange={str("establecimiento")} /></td>
              <td colSpan={5} style={td}><TxtInput value={d.numero_historia_clinica} onChange={str("numero_historia_clinica")} center /></td>
              <td colSpan={2} style={td}><TxtInput value={d.numero_archivo} onChange={str("numero_archivo")} center /></td>
            </tr>
            <tr>
              <td colSpan={4} style={tdM}><Lbl>PRIMER APELLIDO</Lbl></td>
              <td colSpan={3} style={tdM}><Lbl>SEGUNDO APELLIDO</Lbl></td>
              <td colSpan={3} style={tdM}><Lbl>PRIMER NOMBRE</Lbl></td>
              <td colSpan={3} style={tdM}><Lbl>SEGUNDO NOMBRE</Lbl></td>
              <td colSpan={1} style={tdM}><Lbl>SEXO</Lbl></td>
              <td colSpan={2} style={tdM}><Lbl small>FECHA NACIMIENTO</Lbl></td>
              <td colSpan={1} style={tdM}><Lbl>EDAD</Lbl></td>
              <td colSpan={3} style={tdM}>
                <Lbl small>COND. EDAD</Lbl>
                <div style={{ display: "flex", justifyContent: "space-around", fontSize: "7px", fontWeight: 700, padding: "0 2px" }}>
                  <span>H</span><span>D</span><span>M</span><span>A</span>
                </div>
              </td>
            </tr>
            <tr style={{ height: 22 }}>
              <td colSpan={4} style={td}><TxtInput value={d.primer_apellido} onChange={str("primer_apellido")} /></td>
              <td colSpan={3} style={td}><TxtInput value={d.segundo_apellido} onChange={str("segundo_apellido")} /></td>
              <td colSpan={3} style={td}><TxtInput value={d.primer_nombre} onChange={str("primer_nombre")} /></td>
              <td colSpan={3} style={td}><TxtInput value={d.segundo_nombre} onChange={str("segundo_nombre")} /></td>
              <td colSpan={1} style={td}><TxtInput value={d.sexo} onChange={str("sexo")} center /></td>
              <td colSpan={2} style={td}>
                <input type="date" value={d.fecha_nacimiento} onChange={(e) => str("fecha_nacimiento")(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: "9px", padding: "2px", width: "100%", background: "#fff" }} />
              </td>
              <td colSpan={1} style={td}><TxtInput value={d.edad} onChange={str("edad")} center /></td>
              <td colSpan={3} style={td}>
                <div style={{ display: "flex", justifyContent: "space-around", padding: "3px 2px" }}>
                  {(["H", "D", "M", "A"] as const).map((op) => (
                    <input key={op} type="radio" name="lab_condicion_edad" value={op}
                      checked={d.condicion_edad === op}
                      onChange={() => setD(p => ({ ...p, condicion_edad: op }))}
                      style={{ width: 10, height: 10, cursor: "pointer" }} title={op} />
                  ))}
                </div>
              </td>
            </tr>

            {/* ── B. SERVICIO Y PRIORIDAD ── */}
            <tr><td colSpan={20} style={secH}>B. SERVICIO Y PRIORIDAD DE ATENCIÓN</td></tr>
            <tr>
              <td colSpan={5} style={tdM}><Lbl>DIAGNÓSTICO</Lbl></td>
              <td colSpan={2} style={tdM}><Lbl>CIE</Lbl></td>
              <td colSpan={4} style={tdM}><Lbl>SERVICIO</Lbl></td>
              <td colSpan={3} style={tdM}><Lbl>ESPECIALIDAD</Lbl></td>
              <td colSpan={2} style={tdM}><Lbl>SALA</Lbl></td>
              <td colSpan={1} style={tdM}><Lbl>CAMA</Lbl></td>
              <td colSpan={3} style={tdM}><Lbl>PRIORIDAD</Lbl></td>
            </tr>
            <tr style={{ height: 22 }}>
              <td colSpan={5} style={td}>
                <Cie10DescInput
                  cie={d.diagnostico_1_cie}
                  descripcion={d.diagnostico_1}
                  onChange={(cie, desc) => setD(p => ({ ...p, diagnostico_1: desc, diagnostico_1_cie: cie }))}
                  placeholder="Diagnóstico 1"
                />
              </td>
              <td colSpan={2} style={td}>
                <Cie10CieInput
                  cie={d.diagnostico_1_cie}
                  descripcion={d.diagnostico_1}
                  onChange={(cie, desc) => setD(p => ({ ...p, diagnostico_1: desc, diagnostico_1_cie: cie }))}
                />
              </td>
              <td colSpan={4} rowSpan={2} style={{ ...td, verticalAlign: "middle" }}>
                <div style={{ padding: "2px 4px" }}>
                  {([
                    ["EMERGENCIA", "Emergencia"],
                    ["CONSULTA_EXTERNA", "Consulta Externa"],
                    ["HOSPITALIZACION", "Hospitalización"],
                  ] as const).map(([val, lbl]) => (
                    <label key={val} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "9px", cursor: "pointer" }}>
                      <input type="radio" name="lab_servicio" value={val}
                        checked={d.servicio === val}
                        onChange={() => setD(p => ({ ...p, servicio: val }))}
                        style={{ width: 10, height: 10 }} />
                      {lbl}
                    </label>
                  ))}
                </div>
              </td>
              <td colSpan={3} rowSpan={2} style={{ ...td, verticalAlign: "middle" }}>
                <TxtInput value={d.especialidad} onChange={str("especialidad")} placeholder="Especialidad" />
              </td>
              <td colSpan={2} rowSpan={2} style={{ ...td, verticalAlign: "middle" }}>
                <TxtInput value={d.sala} onChange={str("sala")} placeholder="Sala" />
              </td>
              <td colSpan={1} rowSpan={2} style={{ ...td, verticalAlign: "middle" }}>
                <TxtInput value={d.cama} onChange={str("cama")} placeholder="" center />
              </td>
              <td colSpan={3} rowSpan={2} style={{ ...td, verticalAlign: "middle" }}>
                <div style={{ padding: "2px 4px" }}>
                  {([["URGENTE", "Urgente"], ["RUTINA", "Rutina"]] as const).map(([val, lbl]) => (
                    <label key={val} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "9px", cursor: "pointer" }}>
                      <input type="radio" name="lab_prioridad" value={val}
                        checked={d.prioridad === val}
                        onChange={() => setD(p => ({ ...p, prioridad: val }))}
                        style={{ width: 10, height: 10 }} />
                      {lbl}
                    </label>
                  ))}
                </div>
              </td>
            </tr>
            <tr style={{ height: 22 }}>
              <td colSpan={5} style={td}>
                <Cie10DescInput
                  cie={d.diagnostico_2_cie}
                  descripcion={d.diagnostico_2}
                  onChange={(cie, desc) => setD(p => ({ ...p, diagnostico_2: desc, diagnostico_2_cie: cie }))}
                  placeholder="Diagnóstico 2"
                />
              </td>
              <td colSpan={2} style={td}>
                <Cie10CieInput
                  cie={d.diagnostico_2_cie}
                  descripcion={d.diagnostico_2}
                  onChange={(cie, desc) => setD(p => ({ ...p, diagnostico_2: desc, diagnostico_2_cie: cie }))}
                />
              </td>
            </tr>

            {/* ── C. LISTADO DE EXÁMENES ── */}
            <tr><td colSpan={20} style={secH}>C. LISTADO DE EXÁMENES</td></tr>

            {/* Cabeceras de las 3 grandes columnas */}
            <tr>
              <td colSpan={6} style={subH}><Lbl>HEMATOLOGÍA</Lbl></td>
              <td colSpan={6} style={subH}><Lbl>COAGULACIÓN Y HEMOSTASIA</Lbl></td>
              <td colSpan={8} style={subH}><Lbl>QUÍMICA SANGUÍNEA</Lbl></td>
            </tr>
            <tr style={{ verticalAlign: "top" }}>
              {/* Hematología */}
              <td colSpan={6} style={td}>
                {examCol([
                  ["ex_biometria_hematica", "Biometría Hemática"],
                  ["ex_hematocrito", "Hematocrito (HCTO)"],
                  ["ex_hemoglobina", "Hemoglobina (HB)"],
                  ["ex_plaquetas", "Plaquetas"],
                  ["ex_reticulocitos", "Reticulocitos"],
                  ["ex_velocidad_eritrosedimentacion", "Velocidad de Eritrosedimentación"],
                  ["ex_hierro_serico", "Hierro Sérico"],
                  ["ex_fijacion_hierro", "Fijación Hierro"],
                  ["ex_saturacion_transferrina", "% Saturación Transferrina"],
                  ["ex_transferrina", "Transferrina"],
                  ["ex_ferritina", "Ferritina"],
                  ["ex_fragilidad_osmotica", "Fragilidad Osmótica Eritrocitaria"],
                  ["ex_metabisulfito", "Metabisulfito"],
                  ["ex_hematozooario", "Hematozooario"],
                  ["ex_investigacion_leishmania", "Investigación de Leishmania"],
                  ["ex_eosinofilo_moco", "Eosinófilo en Moco Nasal"],
                  ["ex_frotis_sangre", "Frotis Sangre Periférica"],
                  ["ex_acido_folico", "Ácido Fólico"],
                  ["ex_vitamina_b12", "Vitamina B12"],
                ])}
              </td>
              {/* Coagulación */}
              <td colSpan={6} style={td}>
                {examCol([
                  ["ex_tp", "Tiempo de Protrombina (TP)"],
                  ["ex_ttp", "Tiempo de Tromboplastina Parcial (TTP)"],
                  ["ex_tt", "Tiempo de Trombina (TT)"],
                  ["ex_inr", "INR"],
                  ["ex_factor_viii", "Factor de Coagulación VIII"],
                  ["ex_factor_ix", "Factor de Coagulación IX"],
                  ["ex_factor_von_willebrand", "Factor Von Willebrand"],
                  ["ex_fibrinogeno", "Fibrinógeno"],
                  ["ex_dimero_d", "Dímero-D"],
                  ["ex_inhibidores", "Identificación de Inhibidores"],
                ])}
              </td>
              {/* Química sanguínea */}
              <td colSpan={8} style={td}>
                {examRow([
                  ["ex_glucosa_basal", "Glucosa Basal"],
                  ["ex_bilirrubina_directa", "Bilirrubina Directa"],
                  ["ex_glucosa_post_prandial", "Glucosa Post Prandial 2h"],
                  ["ex_bilirrubina_indirecta", "Bilirrubina Indirecta"],
                  ["ex_glucosa_azar", "Glucosa al Azar"],
                  ["ex_colesterol_total", "Colesterol Total"],
                  ["ex_sobrecarga_glucosa", "Sobrecarga Glucosa 75g"],
                  ["ex_hdl", "Lipoproteína Alta Densidad (HDL)"],
                  ["ex_sullivan", "Test de Sullivan (Glucosa 50g)"],
                  ["ex_ldl", "Lipoproteína Baja Densidad (LDL)"],
                  ["ex_urea", "Urea"],
                  ["ex_vldl", "Lipoproteína Muy Baja Densidad (VLDL)"],
                  ["ex_creatinina", "Creatinina"],
                  ["ex_trigliceridos", "Triglicéridos"],
                  ["ex_acido_urico", "Ácido Úrico"],
                  ["ex_albumina", "Albúmina"],
                  ["ex_fosfatasa_alcalina", "Fosfatasa Alcalina"],
                  ["ex_proteinas_totales", "Proteínas Totales"],
                  ["ex_ldh", "Deshidrogenasa Láctica (LDH)"],
                  ["ex_hba1c", "Hemoglobina Glicosilada (HbA1c)"],
                  ["ex_ast_tgo", "Aspartato Aminotransferasa (AST/TGO)"],
                  ["ex_cpk_total_quim", "CPK Total"],
                  ["ex_alt_tgp", "Alanina Aminotransferasa (ALT/TGP)"],
                  ["ex_fructosamina", "Fructosamina"],
                  ["ex_ggt", "Gamma-Glutaril Transferasa (GGT)"],
                  ["ex_pcr_cuantitativo", "PCR Cuantitativo"],
                  ["ex_amilasa", "Amilasa"],
                  ["ex_lipasa", "Lípasa"],
                  ["ex_bilirrubina_total", "Bilirrubina Total"],
                ])}
              </td>
            </tr>

            {/* Inmunología + Orina + Marcadores tumorales */}
            <tr>
              <td colSpan={6} style={subH}><Lbl>INMUNOLOGÍA / INFECCIOSAS</Lbl></td>
              <td colSpan={6} style={subH}><Lbl>ORINA</Lbl></td>
              <td colSpan={8} style={subH}><Lbl>MARCADORES TUMORALES</Lbl></td>
            </tr>
            <tr style={{ verticalAlign: "top" }}>
              <td colSpan={6} style={td}>
                {examCol([
                  ["ex_complemento_c3", "Complemento C3"],
                  ["ex_complemento_c4", "Complemento C4"],
                  ["ex_iga_total", "IgA Total"],
                  ["ex_ige_total", "IgE Total"],
                  ["ex_igg_total", "IgG Total"],
                  ["ex_igm_total", "IgM Total"],
                  ["ex_procalcitonina", "Procalcitonina"],
                  ["ex_il6", "IL-6"],
                  ["ex_ana", "ANA"],
                  ["ex_anca_c", "ANCA-C"],
                  ["ex_anca_p", "ANCA-P"],
                  ["ex_anti_dna", "Anti-DNA"],
                  ["ex_anti_ccp", "Anti-CCP"],
                  ["ex_anti_sm", "Anti-SM"],
                  ["ex_anti_ro", "Anti-RO"],
                  ["ex_anti_la", "Anti-LA"],
                  ["ex_anti_cardiolipina_igg", "Anti Cardiolipina IgG"],
                  ["ex_anti_cardiolipina_igm", "Anti Cardiolipina IgM"],
                  ["ex_antifosfolipidos_igg", "Antifosfolípidos IgG"],
                  ["ex_antifosfolipidos_igm", "Antifosfolípidos IgM"],
                  ["ex_factor_reumatoideo", "Factor Reumatoideo (IgM)"],
                  ["ex_sflt1", "sFlt1 (Marcador Preeclampsia)"],
                  ["ex_pigf", "PlGF (Marcador Preeclampsia)"],
                  ["ex_anticore_igg", "Anticuerpos Anticore IgG (HBcAg)"],
                  ["ex_hepatitis_a_igm", "Hepatitis A (IgM)"],
                  ["ex_hepatitis_a_total", "Hepatitis A Total"],
                  ["ex_hbsag", "Antígeno Superficie Hepatitis B (HBsAg)"],
                  ["ex_anticore_igg_hbc", "Anticuerpos Anticore IgG (HBcAg)"],
                  ["ex_anticore_igm_hbc", "Anticuerpos Anticore IgM (HBcAg)"],
                  ["ex_hepatitis_c", "Hepatitis C: HVC"],
                  ["ex_vih_cualitativa", "VIH (1+2) Cualitativa"],
                  ["ex_vih_cuantitativa", "VIH (1+2) Cuantitativa"],
                  ["ex_herpes1_igg", "Herpes 1 (IgG)"],
                  ["ex_herpes1_igm", "Herpes 1 (IgM)"],
                  ["ex_herpes2_igg", "Herpes 2 (IgG)"],
                  ["ex_herpes2_igm", "Herpes 2 (IgM)"],
                  ["ex_rubeola_igg", "Rubéola (IgG)"],
                  ["ex_rubeola_igm", "Rubéola (IgM)"],
                  ["ex_toxoplasma_igg", "Toxoplasma (IgG)"],
                  ["ex_toxoplasma_igm", "Toxoplasma (IgM)"],
                  ["ex_citomegalovirus_igg", "Citomegalovirus (IgG)"],
                  ["ex_citomegalovirus_igm", "Citomegalovirus (IgM)"],
                  ["ex_epstein_igg", "Epstein Barr (IgG)"],
                  ["ex_epstein_igm", "Epstein Barr (IgM)"],
                  ["ex_dengue_igg", "Dengue (IgG)"],
                  ["ex_dengue_igm", "Dengue (IgM)"],
                  ["ex_clamidia_iga", "Clamidia (IgA)"],
                  ["ex_clamidia_igg", "Clamidia (IgG)"],
                  ["ex_fta_abs", "FTA-ABS"],
                ])}
              </td>
              <td colSpan={6} style={td}>
                {examCol([
                  ["ex_emo", "Elemental y Microscópico (EMO)"],
                  ["ex_gram_gota", "Gram Gota Fresca"],
                  ["ex_osmolaridad", "Osmolaridad Urinaria"],
                  ["ex_sodio_orina", "Sodio en Orina Parcial"],
                  ["ex_potasio_orina", "Potasio en Orina Parcial"],
                  ["ex_cloro_orina", "Cloro en Orina Parcial"],
                  ["ex_calcio_urinario", "Calcio Urinario"],
                  ["ex_fosforo_orina_parcial", "Fósforo en Orina Parcial"],
                  ["ex_magnesio_orina", "Magnesio en Orina Parcial"],
                  ["ex_glucosa_orina", "Glucosa en Orina Parcial"],
                  ["ex_urea_orina", "Urea en Orina Parcial"],
                  ["ex_creatina_orina", "Creatina en Orina Parcial"],
                  ["ex_nitrogeno_ureico", "Nitrógeno Ureico en Orina Parcial"],
                  ["ex_acido_urico_orina", "Ácido Úrico en Orina Parcial"],
                  ["ex_proteinas_orina_parcial", "Proteínas en Orina Parcial"],
                  ["ex_fosforo_orina_24h", "Fósforo en Orina 24h"],
                  ["ex_potasio_orina_24h", "Potasio en Orina 24h"],
                  ["ex_proteinas_orina_24h", "Proteínas en Orina 24h"],
                  ["ex_depuracion_creatinina", "Depuración Creatinina (Orina 24h)"],
                  ["ex_acido_urico_24h", "Ácido Úrico en Orina 24h"],
                  ["ex_calcio_orina_24h", "Calcio en Orina 24h"],
                  ["ex_amilasa_24h", "Amilasa en Orina 24h"],
                  ["ex_cobre_24h", "Cobre en Orina 24h"],
                  ["ex_azucares_reductores_orina", "Azúcares Reductores"],
                  ["ex_drogas_abuso", "Drogas de Abuso en Orina"],
                  ["ex_albuminuria", "Albuminuria"],
                ])}
              </td>
              <td colSpan={8} style={td}>
                {examRow([
                  ["ex_cea", "CEA"],
                  ["ex_psa_libre", "PSA Libre"],
                  ["ex_afp", "AFP"],
                  ["ex_psa_total", "PSA Total"],
                  ["ex_ca125", "CA 125"],
                  ["ex_b2_microglobulina", "β2-Microglobulina"],
                  ["ex_ca153", "CA 15.3"],
                  ["ex_anti_tpo", "Anti-TPO"],
                  ["ex_ca199", "CA 19.9"],
                  ["ex_anti_tg", "Anti-TG"],
                  ["ex_ca724", "CA 72.4"],
                  ["ex_tiroglobulina", "Tiroglobulina"],
                  ["ex_he4", "HE4"],
                  ["ex_bhcg_libre", "B-HCG Libre"],
                  ["ex_bhcg_cuantitativa_tm", "B-HCG Cuantitativa"],
                ])}
                {/* Citoquímico de líquidos */}
                <div style={{ ...subH, marginTop: 4, padding: "2px 4px", fontSize: "9px" }}>
                  CITOQUÍMICO Y BACTERIOLÓGICO DE LÍQUIDOS
                </div>
                {examRow([
                  ["ex_liq_cefalorraquideo", "Cefalorraquídeo"],
                  ["ex_liq_pleural", "Pleural"],
                  ["ex_liq_articular", "Articular / Sinovial"],
                  ["ex_liq_pericardico", "Pericárdico"],
                  ["ex_liq_ascitico", "Ascítico / Peritoneal"],
                  ["ex_liq_amniotico", "Líquido Amniótico"],
                ])}
              </td>
            </tr>

            {/* Marcadores cardiacos + Niveles fármacos + Inmunosupresores + Hormonas */}
            <tr>
              <td colSpan={5} style={subH}><Lbl>MARCADORES CARDIACOS / VASCULARES</Lbl></td>
              <td colSpan={5} style={subH}><Lbl>NIVELES DE FÁRMACOS TERAPÉUTICOS</Lbl></td>
              <td colSpan={4} style={subH}><Lbl>INMUNOSUPRESORES</Lbl></td>
              <td colSpan={6} style={subH}><Lbl>HORMONAS</Lbl></td>
            </tr>
            <tr style={{ verticalAlign: "top" }}>
              <td colSpan={5} style={td}>
                {examRow([
                  ["ex_cpk_total", "CPK Total"],
                  ["ex_troponina_t", "Troponina T"],
                  ["ex_ck_mb", "CK-MB"],
                  ["ex_nt_probnp", "NT-proBNP"],
                  ["ex_cpk_nac", "CPK-NAC"],
                  ["ex_mioglobina", "Mioglobina"],
                  ["ex_troponina_i", "Troponina I"],
                ])}
              </td>
              <td colSpan={5} style={td}>
                {examCol([
                  ["ex_acido_valproico", "Ácido Valproico"],
                  ["ex_carbamazepina", "Carbamazepina"],
                  ["ex_fenobarbital", "Fenobarbital"],
                  ["ex_digoxina", "Digoxina"],
                  ["ex_fenitoina", "Fenitoína Sódica"],
                  ["ex_vancomicina", "Vancomicina"],
                  ["ex_amikacina", "Amikacina"],
                  ["ex_litio", "Litio"],
                ])}
              </td>
              <td colSpan={4} style={td}>
                {examCol([
                  ["ex_cyclosporina", "Ciclosporina"],
                  ["ex_everolimus", "Everolimus"],
                  ["ex_sirolimus", "Sirolimus"],
                  ["ex_tacrolimus", "Tacrolimus"],
                ])}
              </td>
              <td colSpan={6} style={td}>
                {examRow([
                  ["ex_t3", "T3"],
                  ["ex_progesterona", "Progesterona"],
                  ["ex_ft3", "FT3"],
                  ["ex_insulina", "Insulina"],
                  ["ex_t4", "T4"],
                  ["ex_acth", "ACTH"],
                  ["ex_ft4", "FT4"],
                  ["ex_prolactina", "Prolactina"],
                  ["ex_tsh", "TSH"],
                  ["ex_vitamina_d", "Vitamina D"],
                  ["ex_pth", "PTH"],
                  ["ex_estradiol", "Estradiol (E2)"],
                  ["ex_fsh", "FSH"],
                  ["ex_lh", "LH"],
                  ["ex_androstenediona", "Androstenediona"],
                  ["ex_cortisol", "Cortisol"],
                  ["ex_igf1", "Factor de Crecimiento Insulínico (IGF-1)"],
                  ["ex_testosterona_total", "Testosterona Total"],
                  ["ex_igfbp3", "Factor de Unión IGFBP3"],
                  ["ex_testosterona_libre", "Testosterona Libre"],
                  ["ex_bhcg_cualitativa", "B-HCG Cualitativa"],
                  ["ex_dhea_s", "DHEA-S"],
                  ["ex_bhcg_cuantitativa", "B-HCG Cuantitativa"],
                  ["ex_hormona_crecimiento", "Hormona de Crecimiento"],
                ])}
              </td>
            </tr>

            {/* Gases + Serología + Heces + Medicina Transfusional */}
            <tr>
              <td colSpan={4} style={subH}><Lbl>GASES Y ELECTROLITOS</Lbl></td>
              <td colSpan={6} style={subH}><Lbl>SEROLOGÍA</Lbl></td>
              <td colSpan={5} style={subH}><Lbl>HECES</Lbl></td>
              <td colSpan={5} style={subH}><Lbl>MEDICINA TRANSFUSIONAL</Lbl></td>
            </tr>
            <tr style={{ verticalAlign: "top" }}>
              <td colSpan={4} style={td}>
                {examRow([
                  ["ex_na", "Na"],
                  ["ex_mg", "Mg"],
                  ["ex_k", "K"],
                  ["ex_li", "Li"],
                  ["ex_cl", "Cl"],
                  ["ex_gasometria_arterial", "Gasometría Arterial"],
                  ["ex_ca_ion", "Ca+"],
                  ["ex_gasometria_venosa", "Gasometría Venosa"],
                  ["ex_ca", "Ca"],
                  ["ex_p", "P"],
                ])}
              </td>
              <td colSpan={6} style={td}>
                {examRow([
                  ["ex_aglutinaciones_febriles", "Aglutinaciones Febriles"],
                  ["ex_pcr_semicuantitativa", "PCR Semicuantitativa"],
                  ["ex_asto", "ASTO"],
                  ["ex_malaria_pcr", "Malaria (PCR)"],
                  ["ex_fr_latex", "FR-Látex"],
                  ["ex_sifilis_pcr", "Sífilis (PCR)"],
                  ["ex_dengue_pcr", "Dengue (PCR)"],
                  ["ex_helicobacter_pcr", "Helicobacter Pylori"],
                  ["ex_chlamydia_pcr", "Chlamydia (PCR)"],
                  ["ex_pepsinogeno", "Pepsinógeno"],
                  ["ex_vdrl_ser", "VDRL"],
                ])}
              </td>
              <td colSpan={5} style={td}>
                {examRow([
                  ["ex_coprologico", "Coprológico / Coproparasitario"],
                  ["ex_criptosporidium", "Criptosporidium"],
                  ["ex_coproparasitario_concentracion", "Coproparasitario por Concentración"],
                  ["ex_oxiuros", "Oxiuros"],
                  ["ex_copro_seriado", "Copro Seriado"],
                  ["ex_giardia", "Giardia-Lamblia Antígeno"],
                  ["ex_pmn", "Investigación de PMN"],
                  ["ex_grasas", "Investigación de Grasas"],
                  ["ex_sangre_oculta", "Sangre Oculta"],
                  ["ex_azucares_heces", "Azúcares Reductores"],
                  ["ex_ph_heces", "Investigación de pH"],
                  ["ex_helicobacter_heces", "Helicobacter Pylori"],
                  ["ex_rotavirus", "Rotavirus"],
                  ["ex_adenovirus", "Adenovirus"],
                ])}
              </td>
              <td colSpan={5} style={td}>
                {examCol([
                  ["ex_grupo_factor", "Grupo y Factor"],
                  ["ex_coombs_directo", "Coombs Directo"],
                  ["ex_coombs_indirecto", "Coombs Indirecto"],
                ])}
              </td>
            </tr>

            {/* Microbiología */}
            <tr><td colSpan={20} style={subH}><Lbl>MICROBIOLOGÍA</Lbl></td></tr>
            <tr style={{ verticalAlign: "top" }}>
              <td colSpan={5} style={td}>
                <Lbl>MUESTRA:</Lbl>
                <TxtInput value={d.micro_muestra} onChange={str("micro_muestra")} placeholder="Tipo de muestra" />
                <Lbl>SITIO ANATÓMICO:</Lbl>
                <TxtInput value={d.micro_sitio_anatomico} onChange={str("micro_sitio_anatomico")} placeholder="Sitio anatómico" />
              </td>
              <td colSpan={4} style={td}>
                {examCol([
                  ["ex_cultivo_antibiograma", "Cultivo y Antibiograma"],
                  ["ex_cristalografia", "Cristalografía"],
                  ["ex_gram", "Gram"],
                  ["ex_fresco_micro", "Fresco"],
                ])}
              </td>
              <td colSpan={5} style={td}>
                <Lbl small>ESTUDIO MICOLÓGICO (KOH) DE:</Lbl>
                <TxtInput value={d.ex_estudio_micologico} onChange={str("ex_estudio_micologico")} />
                <Lbl small>CULTIVO MICÓTICO DE:</Lbl>
                <TxtInput value={d.ex_cultivo_micotico} onChange={str("ex_cultivo_micotico")} />
                <div style={{ marginTop: 4 }}>
                  <ChkItem label="Investigación Paragonimus spp" checked={d.ex_investigacion_paragonimus} onChange={chk("ex_investigacion_paragonimus")} />
                  <ChkItem label="Coloración Zhiel-Nielssen" checked={d.ex_coloracion_zhiel} onChange={chk("ex_coloracion_zhiel")} />
                  <ChkItem label="Investigación Histoplasma spp" checked={d.ex_investigacion_histoplasma} onChange={chk("ex_investigacion_histoplasma")} />
                </div>
              </td>
              <td colSpan={6} style={td}>
                <Lbl>BIOLOGÍA MOLECULAR Y GENÉTICA</Lbl>
                <textarea value={d.biologia_molecular} onChange={(e) => str("biologia_molecular")(e.target.value)}
                  rows={6} placeholder="Especificar examen..."
                  style={{ width: "100%", border: "none", outline: "none", fontSize: "10px", fontFamily: "Arial, sans-serif", resize: "none", padding: "3px 4px", boxSizing: "border-box" }} />
              </td>
            </tr>

            {/* ── D. DATOS DEL PROFESIONAL (Solicitud 1) ── */}
            <tr><td colSpan={20} style={secH}>D. DATOS DEL PROFESIONAL RESPONSABLE</td></tr>
            <tr>
              <td colSpan={3} style={tdM}><Lbl small>FECHA GENERACIÓN PEDIDO</Lbl></td>
              <td colSpan={2} style={tdM}><Lbl small>HORA GENERACIÓN</Lbl></td>
              <td colSpan={5} style={tdM}><Lbl>PRIMER NOMBRE</Lbl></td>
              <td colSpan={5} style={tdM}><Lbl>PRIMER APELLIDO</Lbl></td>
              <td colSpan={5} style={tdM}><Lbl>SEGUNDO APELLIDO</Lbl></td>
            </tr>
            <tr style={{ height: 22 }}>
              <td colSpan={3} style={td}>
                <input type="date" value={d.sol1_fecha_pedido} onChange={(e) => str("sol1_fecha_pedido")(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: "9px", padding: "2px", width: "100%" }} />
              </td>
              <td colSpan={2} style={td}>
                <input type="time" value={d.sol1_hora_pedido} onChange={(e) => str("sol1_hora_pedido")(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: "9px", padding: "2px", width: "100%" }} />
              </td>
              <td colSpan={5} style={td}><TxtInput value={d.sol1_profesional_primer_nombre} onChange={str("sol1_profesional_primer_nombre")} /></td>
              <td colSpan={5} style={td}><TxtInput value={d.sol1_profesional_primer_apellido} onChange={str("sol1_profesional_primer_apellido")} /></td>
              <td colSpan={5} style={td}><TxtInput value={d.sol1_profesional_segundo_apellido} onChange={str("sol1_profesional_segundo_apellido")} /></td>
            </tr>
            <tr>
              <td colSpan={5} style={tdM}><Lbl>N° DOCUMENTO DE IDENTIFICACIÓN</Lbl></td>
              <td colSpan={8} style={{ ...tdM, background: "#f8f8f8", textAlign: "center" }}>
                <span style={{ fontSize: "8px", color: "#888", fontStyle: "italic" }}>FIRMA (documento impreso)</span>
              </td>
              <td colSpan={7} style={{ ...tdM, background: "#f8f8f8", textAlign: "center" }}>
                <span style={{ fontSize: "8px", color: "#888", fontStyle: "italic" }}>SELLO (documento impreso)</span>
              </td>
            </tr>
            <tr style={{ height: 22 }}>
              <td colSpan={5} style={td}><TxtInput value={d.sol1_documento} onChange={str("sol1_documento")} /></td>
              <td colSpan={8} style={{ ...td, background: "#f8f8f8", height: 30 }} />
              <td colSpan={7} style={{ ...td, background: "#f8f8f8", height: 30 }} />
            </tr>
            <tr>
              <td colSpan={3} style={tdM}><Lbl small>FECHA TOMA DE MUESTRA</Lbl></td>
              <td colSpan={2} style={tdM}><Lbl small>HORA TOMA MUESTRA</Lbl></td>
              <td colSpan={10} style={tdM}><Lbl>NOMBRE Y APELLIDO DE LA PERSONA QUE TOMA LA MUESTRA</Lbl></td>
              <td colSpan={5} style={{ ...tdM, background: "#f8f8f8", textAlign: "center" }}>
                <span style={{ fontSize: "8px", color: "#888", fontStyle: "italic" }}>FIRMA</span>
              </td>
            </tr>
            <tr style={{ height: 22 }}>
              <td colSpan={3} style={td}>
                <input type="date" value={d.sol1_fecha_muestra} onChange={(e) => str("sol1_fecha_muestra")(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: "9px", padding: "2px", width: "100%" }} />
              </td>
              <td colSpan={2} style={td}>
                <input type="time" value={d.sol1_hora_muestra} onChange={(e) => str("sol1_hora_muestra")(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: "9px", padding: "2px", width: "100%" }} />
              </td>
              <td colSpan={10} style={td}><TxtInput value={d.sol1_tomador_muestra} onChange={str("sol1_tomador_muestra")} /></td>
              <td colSpan={5} style={{ ...td, background: "#f8f8f8" }} />
            </tr>

            {/* Footer solicitud 1 */}
            <tr>
              <td colSpan={10} style={{ border: "1px solid #000", fontSize: "8px", fontWeight: 700, padding: "3px 4px" }}>
                SNS-MSP/HCU-form.010A/2021
              </td>
              <td colSpan={10} style={{ border: "1px solid #000", fontSize: "10px", fontWeight: 700, textAlign: "right", padding: "3px 4px" }}>
                LABORATORIO CLÍNICO — SOLICITUD (1)
              </td>
            </tr>

          </tbody>
        </table>

        {/* ════════════════════════════════════════════════════════════════
            ══════  SOLICITUD (2)  ══════════════════════════════════════
            ════════════════════════════════════════════════════════════════ */}
        <div style={{ ...solSep, marginTop: 8 }}>LABORATORIO CLÍNICO — SOLICITUD (2)</div>

        <table style={tbl}>
          <tbody>

            {/* ── A. VIH / ITS ── */}
            <tr><td colSpan={20} style={secH}>A. VIH / ITS</td></tr>
            <tr>
              <td colSpan={3} style={tdM}><Lbl small>Prueba Rápida</Lbl></td>
              <td colSpan={3} style={tdM}><Lbl small>Elisa Automatizada</Lbl></td>
              <td colSpan={3} style={tdM}><Lbl small>CLIA</Lbl></td>
              <td colSpan={3} style={tdM}><Lbl small>IFI</Lbl></td>
              <td colSpan={3} style={tdM}><Lbl small>Carga Viral</Lbl></td>
              <td colSpan={5} style={tdM}><Lbl small> </Lbl></td>
            </tr>
            <tr>
              <td colSpan={3} style={{ ...td, textAlign: "center", paddingTop: 2 }}>
                <input type="checkbox" checked={d.vih_prueba_rapida} onChange={(e) => chk("vih_prueba_rapida")(e.target.checked)} style={{ width: 13, height: 13 }} />
              </td>
              <td colSpan={3} style={{ ...td, textAlign: "center", paddingTop: 2 }}>
                <input type="checkbox" checked={d.vih_elisa} onChange={(e) => chk("vih_elisa")(e.target.checked)} style={{ width: 13, height: 13 }} />
              </td>
              <td colSpan={3} style={{ ...td, textAlign: "center", paddingTop: 2 }}>
                <input type="checkbox" checked={d.vih_clia} onChange={(e) => chk("vih_clia")(e.target.checked)} style={{ width: 13, height: 13 }} />
              </td>
              <td colSpan={3} style={{ ...td, textAlign: "center", paddingTop: 2 }}>
                <input type="checkbox" checked={d.vih_ifi} onChange={(e) => chk("vih_ifi")(e.target.checked)} style={{ width: 13, height: 13 }} />
              </td>
              <td colSpan={3} style={{ ...td, textAlign: "center", paddingTop: 2 }}>
                <input type="checkbox" checked={d.vih_carga_viral} onChange={(e) => chk("vih_carga_viral")(e.target.checked)} style={{ width: 13, height: 13 }} />
              </td>
              <td colSpan={5} style={td} />
            </tr>
            <tr>
              <td colSpan={3} style={tdM}><Lbl small>CD4</Lbl></td>
              <td colSpan={4} style={tdM}><Lbl small>Tamizaje de Sífilis</Lbl></td>
              <td colSpan={3} style={tdM}><Lbl small>VDRL</Lbl></td>
              <td colSpan={5} style={tdM}><Lbl small>Hepatitis B (HBs-Ag)</Lbl></td>
              <td colSpan={5} style={tdM}><Lbl small> </Lbl></td>
            </tr>
            <tr>
              <td colSpan={3} style={{ ...td, textAlign: "center", paddingTop: 2 }}>
                <input type="checkbox" checked={d.vih_cd4} onChange={(e) => chk("vih_cd4")(e.target.checked)} style={{ width: 13, height: 13 }} />
              </td>
              <td colSpan={4} style={{ ...td, textAlign: "center", paddingTop: 2 }}>
                <input type="checkbox" checked={d.vih_tamizaje_sifilis} onChange={(e) => chk("vih_tamizaje_sifilis")(e.target.checked)} style={{ width: 13, height: 13 }} />
              </td>
              <td colSpan={3} style={{ ...td, textAlign: "center", paddingTop: 2 }}>
                <input type="checkbox" checked={d.vih_vdrl} onChange={(e) => chk("vih_vdrl")(e.target.checked)} style={{ width: 13, height: 13 }} />
              </td>
              <td colSpan={5} style={{ ...td, textAlign: "center", paddingTop: 2 }}>
                <input type="checkbox" checked={d.vih_hepatitis_b} onChange={(e) => chk("vih_hepatitis_b")(e.target.checked)} style={{ width: 13, height: 13 }} />
              </td>
              <td colSpan={5} style={td} />
            </tr>

            {/* ── B. TUBERCULOSIS ── */}
            <tr><td colSpan={20} style={secH}>B. TUBERCULOSIS</td></tr>
            <tr><td colSpan={20} style={{ ...subH2, border: "1px solid #000" }}>Tipo de afectado</td></tr>
            <tr>
              <td colSpan={20} style={{ ...td, padding: "4px 6px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 16px" }}>
                  <ChkItem label="Nuevo" checked={d.tb_tipo_afectado_nuevo} onChange={chk("tb_tipo_afectado_nuevo")} />
                  <ChkItem label="Recaída" checked={d.tb_tipo_afectado_recaida} onChange={chk("tb_tipo_afectado_recaida")} />
                  <ChkItem label="Fracaso" checked={d.tb_tipo_afectado_fracaso} onChange={chk("tb_tipo_afectado_fracaso")} />
                  <ChkItem label="Pérdida en el seguimiento" checked={d.tb_tipo_afectado_perdida} onChange={chk("tb_tipo_afectado_perdida")} />
                  <ChkItem label="PVV" checked={d.tb_pvv} onChange={chk("tb_pvv")} />
                  <ChkItem label="PPL" checked={d.tb_ppl} onChange={chk("tb_ppl")} />
                  <ChkItem label="Niño &lt; 5 años" checked={d.tb_nino_5} onChange={chk("tb_nino_5")} />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 16px", marginTop: 4 }}>
                  <ChkItem label="Sospecha de Meningitis TB" checked={d.tb_sospecha_meningitis} onChange={chk("tb_sospecha_meningitis")} />
                  <ChkItem label="Alta sospecha clínica y/o radiológica BK(-)" checked={d.tb_alta_sospecha} onChange={chk("tb_alta_sospecha")} />
                  <ChkItem label="Comorbilidad" checked={d.tb_comorbilidad} onChange={chk("tb_comorbilidad")} />
                  <ChkItem label="Contacto TBR" checked={d.tb_contacto_tbr} onChange={chk("tb_contacto_tbr")} />
                  <ChkItem label="Sospecha de TB EP" checked={d.tb_sospecha_ep} onChange={chk("tb_sospecha_ep")} />
                  <ChkItem label="Talento humano en salud" checked={d.tb_talento_humano} onChange={chk("tb_talento_humano")} />
                  <ChkItem label="Irregularidad en toma del Tto" checked={d.tb_irregularidad_tto} onChange={chk("tb_irregularidad_tto")} />
                  <ChkItem label="Reversión" checked={d.ex_reversion} onChange={chk("ex_reversion")} />
                  <ChkItem label="Embarazo" checked={d.tb_embarazo} onChange={chk("tb_embarazo")} />
                  <ChkItem label="BK (+) al 2do. mes" checked={d.tb_bk_2mes} onChange={chk("tb_bk_2mes")} />
                  <ChkItem label="Condiciones especiales" checked={d.tb_condiciones_especiales} onChange={chk("tb_condiciones_especiales")} />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                  <span style={{ fontSize: "9px", fontWeight: 700 }}>Otros:</span>
                  <TxtInput value={d.tb_otros} onChange={str("tb_otros")} placeholder="Especificar..." />
                </div>
              </td>
            </tr>

            {/* Antecedentes + tipo resistencia + tipo muestra */}
            <tr>
              <td colSpan={6} style={tdM}><Lbl>Antecedentes de tuberculosis</Lbl></td>
              <td colSpan={3} style={tdM}><Lbl>TIPO DE RESISTENCIA</Lbl></td>
              <td colSpan={3} style={td}><TxtInput value={d.tb_antecedentes} onChange={str("tb_antecedentes")} /></td>
              <td colSpan={8} style={td}>
                <div style={{ display: "flex", gap: 8, padding: "2px 4px" }}>
                  {(["SENSIBLE", "RESISTENTE"] as const).map((v) => (
                    <label key={v} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "9px", cursor: "pointer" }}>
                      <input type="radio" name="tb_resistencia" value={v} checked={d.tb_tipo_resistencia === v}
                        onChange={() => setD(p => ({ ...p, tb_tipo_resistencia: v }))} style={{ width: 10, height: 10 }} />
                      {v === "SENSIBLE" ? "TB Sensible" : "TB Resistente"}
                    </label>
                  ))}
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={6} style={tdM}><Lbl>Tipo de muestra</Lbl></td>
              <td colSpan={3} style={tdM}>
                <div style={{ display: "flex", gap: 4, padding: "2px 4px" }}>
                  <ChkItem label="Esputo" checked={d.tb_esputo} onChange={chk("tb_esputo")} />
                </div>
              </td>
              <td colSpan={2} style={tdM}><Lbl small>Otro:</Lbl></td>
              <td colSpan={9} style={td}><TxtInput value={d.tb_otro_muestra} onChange={str("tb_otro_muestra")} /></td>
            </tr>

            {/* Solicitud para diagnóstico */}
            <tr><td colSpan={20} style={{ ...subH2, border: "1px solid #000" }}>Solicitud para diagnóstico</td></tr>
            <tr>
              <td colSpan={2} style={tdM}><Lbl small>Ada</Lbl></td>
              <td colSpan={3} style={tdM}><Lbl small>Baciloscopia</Lbl></td>
              <td colSpan={2} style={tdM}><Lbl small>Diagnóstico</Lbl></td>
              <td colSpan={2} style={tdM}><Lbl small>No.</Lbl></td>
              <td colSpan={4} style={tdM}><Lbl small>Cultivo Medio Sólido (OK)</Lbl></td>
              <td colSpan={2} style={tdM}><Lbl small>Diagnóstico</Lbl></td>
              <td colSpan={5} style={tdM}><Lbl small>No.</Lbl></td>
            </tr>
            <tr style={{ height: 24 }}>
              <td colSpan={2} style={{ ...td, textAlign: "center" }}>
                <input type="checkbox" checked={d.tb_ada} onChange={(e) => chk("tb_ada")(e.target.checked)} style={{ width: 12, height: 12 }} />
              </td>
              <td colSpan={3} style={{ ...tdM, textAlign: "center" }}>
                <Lbl small>Baciloscopia</Lbl>
              </td>
              <td colSpan={2} style={{ ...td, textAlign: "center" }}>
                <input type="checkbox" checked={d.tb_baciloscopia_dx_check} onChange={(e) => chk("tb_baciloscopia_dx_check")(e.target.checked)} style={{ width: 12, height: 12 }} />
              </td>
              <td colSpan={2} style={td}><TxtInput value={d.tb_baciloscopia_dx_no} onChange={str("tb_baciloscopia_dx_no")} center /></td>
              <td colSpan={4} style={{ ...tdM, textAlign: "center" }}>
                <Lbl small>Cultivo Medio Sólido (OK)</Lbl>
              </td>
              <td colSpan={2} style={{ ...td, textAlign: "center" }}>
                <input type="checkbox" checked={d.tb_cultivo_solido_dx_check} onChange={(e) => chk("tb_cultivo_solido_dx_check")(e.target.checked)} style={{ width: 12, height: 12 }} />
              </td>
              <td colSpan={5} style={td}><TxtInput value={d.tb_cultivo_solido_dx_no} onChange={str("tb_cultivo_solido_dx_no")} center /></td>
            </tr>
            <tr>
              <td colSpan={5} style={tdM}><Lbl small> </Lbl></td>
              <td colSpan={2} style={tdM}><Lbl small>Control</Lbl></td>
              <td colSpan={2} style={tdM}><Lbl small>No. Mes</Lbl></td>
              <td colSpan={4} style={tdM}><Lbl small> </Lbl></td>
              <td colSpan={2} style={tdM}><Lbl small>Control</Lbl></td>
              <td colSpan={5} style={tdM}><Lbl small>No. Mes</Lbl></td>
            </tr>
            <tr style={{ height: 24 }}>
              <td colSpan={5} style={td} />
              <td colSpan={2} style={{ ...td, textAlign: "center" }}>
                <input type="checkbox" checked={d.tb_baciloscopia_ctrl} onChange={(e) => chk("tb_baciloscopia_ctrl")(e.target.checked)} style={{ width: 12, height: 12 }} />
              </td>
              <td colSpan={2} style={td}><TxtInput value={d.tb_baciloscopia_ctrl_mes} onChange={str("tb_baciloscopia_ctrl_mes")} center placeholder="Mes" /></td>
              <td colSpan={4} style={td} />
              <td colSpan={2} style={{ ...td, textAlign: "center" }}>
                <input type="checkbox" checked={d.tb_cultivo_solido_ctrl} onChange={(e) => chk("tb_cultivo_solido_ctrl")(e.target.checked)} style={{ width: 12, height: 12 }} />
              </td>
              <td colSpan={5} style={td}><TxtInput value={d.tb_cultivo_solido_ctrl_mes} onChange={str("tb_cultivo_solido_ctrl_mes")} center placeholder="Mes" /></td>
            </tr>

            {/* PCR / Nitrato / MGIT / Genotipificación / Tipificación */}
            <tr>
              <td colSpan={4} style={tdM}><Lbl small>PCR Tiempo Real (Xpert/MTB/RIF)</Lbl></td>
              <td colSpan={4} style={tdM}><Lbl small>Nitrato Reductasa (GRIESS)*</Lbl></td>
              <td colSpan={4} style={tdM}><Lbl small>Cultivo Medio Líquido (MGIT)</Lbl></td>
              <td colSpan={4} style={tdM}><Lbl small>Genotipificación</Lbl></td>
              <td colSpan={4} style={tdM}><Lbl small>Tipificación</Lbl></td>
            </tr>
            <tr style={{ height: 24 }}>
              {[
                ["tb_pcr_xpert", ""], ["tb_griess", ""], ["tb_cultivo_mgit", ""],
                ["tb_genotipificacion", ""], ["tb_tipificacion", ""],
              ].map(([k], i) => (
                <td key={k} colSpan={4} style={{ ...td, textAlign: "center" }}>
                  <input type="checkbox" checked={d[k as keyof DatosLaboratorio] as boolean}
                    onChange={(e) => chk(k as keyof DatosLaboratorio)(e.target.checked)}
                    style={{ width: 12, height: 12 }} />
                </td>
              ))}
            </tr>

            {/* PSD 1ra y 2da línea */}
            <tr>
              <td colSpan={5} style={tdM}><Lbl small>PSD 1ra. Línea (Proporciones-Medio sólido)</Lbl></td>
              <td colSpan={5} style={tdM}><Lbl small>PSD 1ra. Línea (MGIT-Medio líquido)</Lbl></td>
              <td colSpan={5} style={tdM}><Lbl small>PSD 2da. Línea (Proporciones-Medio sólido)</Lbl></td>
              <td colSpan={5} style={tdM}><Lbl small>PSD 2da. Línea (MGIT-Medio líquido)</Lbl></td>
            </tr>
            <tr style={{ height: 24 }}>
              {(["tb_psd1_proporciones", "tb_psd1_mgit", "tb_psd2_proporciones", "tb_psd2_mgit"] as const).map((k) => (
                <td key={k} colSpan={5} style={{ ...td, textAlign: "center" }}>
                  <input type="checkbox" checked={d[k]} onChange={(e) => chk(k)(e.target.checked)} style={{ width: 12, height: 12 }} />
                </td>
              ))}
            </tr>

            {/* ── C. DATOS DEL PROFESIONAL (Solicitud 2) ── */}
            <tr><td colSpan={20} style={secH}>C. DATOS DEL PROFESIONAL RESPONSABLE</td></tr>
            <tr>
              <td colSpan={3} style={tdM}><Lbl small>FECHA GENERACIÓN PEDIDO</Lbl></td>
              <td colSpan={2} style={tdM}><Lbl small>HORA GENERACIÓN</Lbl></td>
              <td colSpan={5} style={tdM}><Lbl>PRIMER NOMBRE</Lbl></td>
              <td colSpan={5} style={tdM}><Lbl>PRIMER APELLIDO</Lbl></td>
              <td colSpan={5} style={tdM}><Lbl>SEGUNDO APELLIDO</Lbl></td>
            </tr>
            <tr style={{ height: 22 }}>
              <td colSpan={3} style={td}>
                <input type="date" value={d.sol2_fecha_pedido} onChange={(e) => str("sol2_fecha_pedido")(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: "9px", padding: "2px", width: "100%" }} />
              </td>
              <td colSpan={2} style={td}>
                <input type="time" value={d.sol2_hora_pedido} onChange={(e) => str("sol2_hora_pedido")(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: "9px", padding: "2px", width: "100%" }} />
              </td>
              <td colSpan={5} style={td}><TxtInput value={d.sol2_profesional_primer_nombre} onChange={str("sol2_profesional_primer_nombre")} /></td>
              <td colSpan={5} style={td}><TxtInput value={d.sol2_profesional_primer_apellido} onChange={str("sol2_profesional_primer_apellido")} /></td>
              <td colSpan={5} style={td}><TxtInput value={d.sol2_profesional_segundo_apellido} onChange={str("sol2_profesional_segundo_apellido")} /></td>
            </tr>
            <tr>
              <td colSpan={5} style={tdM}><Lbl>N° DOCUMENTO DE IDENTIFICACIÓN</Lbl></td>
              <td colSpan={8} style={{ ...tdM, background: "#f8f8f8", textAlign: "center" }}>
                <span style={{ fontSize: "8px", color: "#888", fontStyle: "italic" }}>FIRMA (documento impreso)</span>
              </td>
              <td colSpan={7} style={{ ...tdM, background: "#f8f8f8", textAlign: "center" }}>
                <span style={{ fontSize: "8px", color: "#888", fontStyle: "italic" }}>SELLO (documento impreso)</span>
              </td>
            </tr>
            <tr style={{ height: 22 }}>
              <td colSpan={5} style={td}><TxtInput value={d.sol2_documento} onChange={str("sol2_documento")} /></td>
              <td colSpan={8} style={{ ...td, background: "#f8f8f8", height: 30 }} />
              <td colSpan={7} style={{ ...td, background: "#f8f8f8", height: 30 }} />
            </tr>
            <tr>
              <td colSpan={3} style={tdM}><Lbl small>FECHA TOMA DE MUESTRA</Lbl></td>
              <td colSpan={2} style={tdM}><Lbl small>HORA TOMA MUESTRA</Lbl></td>
              <td colSpan={10} style={tdM}><Lbl>NOMBRE Y APELLIDO DE LA PERSONA QUE TOMA LA MUESTRA</Lbl></td>
              <td colSpan={5} style={{ ...tdM, background: "#f8f8f8", textAlign: "center" }}>
                <span style={{ fontSize: "8px", color: "#888", fontStyle: "italic" }}>FIRMA</span>
              </td>
            </tr>
            <tr style={{ height: 22 }}>
              <td colSpan={3} style={td}>
                <input type="date" value={d.sol2_fecha_muestra} onChange={(e) => str("sol2_fecha_muestra")(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: "9px", padding: "2px", width: "100%" }} />
              </td>
              <td colSpan={2} style={td}>
                <input type="time" value={d.sol2_hora_muestra} onChange={(e) => str("sol2_hora_muestra")(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: "9px", padding: "2px", width: "100%" }} />
              </td>
              <td colSpan={10} style={td}><TxtInput value={d.sol2_tomador_muestra} onChange={str("sol2_tomador_muestra")} /></td>
              <td colSpan={5} style={{ ...td, background: "#f8f8f8" }} />
            </tr>

            {/* Footer solicitud 2 */}
            <tr>
              <td colSpan={10} style={{ border: "1px solid #000", fontSize: "8px", fontWeight: 700, padding: "3px 4px" }}>
                SNS-MSP/HCU-form.010A/2021
              </td>
              <td colSpan={10} style={{ border: "1px solid #000", fontSize: "10px", fontWeight: 700, textAlign: "right", padding: "3px 4px" }}>
                LABORATORIO CLÍNICO — SOLICITUD (2)
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
});

LaboratorioForm.displayName = "HistoriaClinicaLaboratorioForm";

export default LaboratorioForm;
