import React, { useState, forwardRef, useImperativeHandle } from "react";
import { useFormAutosaveAndWarn } from "@/hooks/useFormAutosaveAndWarn";
"use client";
import { Cie10DescInput, Cie10CieInput } from "./Cie10Input";
import { BotonBuscarProfesional } from "@/components/ui/BotonBuscarProfesional";
import { parseNombresMedico } from "@/lib/services/medicos";

// ─── Tipos ────────────────────────────────────────────────────────────────────


interface LabRow {
  hora: string; ph: string; po2: string; pco2: string; hco3: string;
  eb: string; sat02: string; lactato: string; glucosa: string;
  na: string; k: string; cl: string; hcto: string; hb: string; otro: string;
}
interface DatosAnestesia {
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
  edad: string;
  condicion_edad: "H" | "D" | "M" | "A";

  // B. Registro de valoración preanestésica
  b_diagnostico: string;
  b_cie: string;
  b_procedimiento: string;
  b_diagnostico_2?: string;
  b_cie_2?: string;
  b_procedimiento_2?: string;
  b_efectiva: boolean;
  b_emergencia: boolean;
  b_urgencia: boolean;
  b_riesgo_bajo: boolean;
  b_riesgo_moderado: boolean;
  b_riesgo_alto: boolean;

  // C. Anamnesis — Antecedentes patológicos personales (10 filas)
  antecedentes: Array<{ diagnostico: string; tiempo: string; tratamiento: string }>;

  // C. Anamnesis — bloques de antecedentes
  anestesicos: string[];    // 3 líneas
  quirurgicos: string[];    // 3 líneas
  alergicos: string[];      // 3 líneas
  transfusiones: string[];  // 3 líneas
  habitos: string[];        // 3 líneas

  // C. Antecedentes patológicos familiares
  ant_familiares: string[]; // 3 líneas

  // D. Examen físico — Constantes vitales
  d_ta: string;
  d_fc: string;
  d_fr: string;
  d_temperatura: string;
  d_sat02: string;
  d_glasgow: string;

  // D. Antropometría
  d_peso: string;
  d_talla: string;
  d_imc: string;

  // D. Vía aérea
  d_apertura_bucal: "<2" | "2-2.5" | "2.6-3" | ">3" | "";
  d_distancia_tiromentoaneana: "<6" | "6-6.5" | ">6.5" | "";
  d_mallampati: "I" | "II" | "III" | "IV" | "";
  d_protusion_mandibular: "<0" | "0" | ">0" | "";
  d_perimetro_cervical: "<40" | ">40" | "";
  d_movilidad_cervical: "<35" | ">35" | "";
  d_historia_intubacion_dificil_si: boolean;
  d_historia_intubacion_dificil_no: boolean;
  d_patologia_intubacion_dificil_si: boolean;
  d_patologia_intubacion_dificil_no: boolean;

  // D. Examen por sistemas
  d_torax: string;
  d_corazon: string;
  d_pulmones: string;
  d_abdomen: string;
  d_extremidades: string;
  d_sistema_nervioso: string;
  d_equivalente_metabolico: string;

  // E. Resultados de exámenes — Hemograma
  e_hcto: string; e_hb: string; e_plaquetas: string;
  e_tp: string; e_ttp: string; e_inr: string; e_leucocitos: string;
  e_ekg: string; e_rx_torax: string; e_espirometria: string; e_otros: string;
  // Tipificación
  e_grupo: string; e_factor: string;
  e_quimica: string; e_glucosa: string; e_urea: string; e_creatinina: string;
  // Perfil hepático
  e_ast: string; e_alt: string; e_fa: string; e_ldh: string;
  e_bt: string; e_bd: string; e_bi: string;
  // Ionograma
  e_na: string; e_k: string; e_cl: string; e_ca: string; e_mg: string;
  // Gasometría
  e_ph: string; e_po2: string; e_pco2: string; e_hco3: string;
  e_eb: string; e_sat02_gas: string; e_lactato: string;
  // Hormonas
  e_t4: string; e_tsh: string;
  e_prueba_embarazo_si: boolean; e_prueba_embarazo_no: boolean;
  // Orina
  e_ph_orina: string; e_densidad: string; e_bacterias: string;
  e_leucocitos_orina: string; e_piocitos: string; e_hematies: string; e_glucosa_orina: string;

  // F. Escalas e índices
  f_asa: "I" | "II" | "III" | "IV" | "V" | "VI" | "";
  f_riesgo_cardiaco: string;
  f_riesgo_pulmonar: string;
  f_riesgo_tromboembolico: string;
  f_otros: string;

  // F. Tiempo de última ingesta
  f_liquidos_claros: string;
  f_leche_materna: string;
  f_leche_formula: string;
  f_solidos: string;

  // G. Indicaciones (8 líneas)
  indicaciones: string[];

  // H. Plan anestésico
  plan_anestesico: string;

  // I. Observaciones
  observaciones: string;

  // J. Datos del profesional
  j_fecha: string;
  j_hora: string;
  j_primer_nombre: string;
  j_primer_apellido: string;
  j_segundo_apellido: string;
  j_documento: string;

  // ── TRANSANASTÉSICO ─────────────────────────────────────────────
  fecha: string; imc: string;
  talla: string; peso: string; grupo_factor: string;
  consentimiento_informado_si: boolean; consentimiento_informado_no: boolean;
  b_diagnostico_prequirurgico: string; b_diagnostico_postquirurgico: string;
  b_anestesiologo: string; b_ayudante_anestesia: string;
  b_cirujano: string; b_cirujano2: string;
  b_cirugia_propuesta: string; b_cirugia_realizada: string;
  b_instrumentista: string; b_circulante: string; b_especialidad: string; b_quirofano: string;
  b_prioridad_electiva: boolean; b_prioridad_urgencia: boolean; b_prioridad_emergencia: boolean;
  b_ambito_ambulatorio: boolean; b_ambito_internacion: boolean; b_otros: string;
  c_cabeza: boolean; c_cuello: boolean; c_torax: boolean; c_columna: boolean; c_organos: boolean;
  c_abdomen: boolean; c_pelvis: boolean; c_extremidades_superiores: boolean;
  c_extremidades_inferiores: boolean; c_perineal: boolean; c_otros: string;
  d_agente_inhalatorio: string; d_onda_delta: string; d_saturacion_co2: string; d_capnometria: string;
  d_relajacion_neuromuscular: string; d_profundidad_anestesica: string;
  d_inicio_anestesia: string; d_induccion: string; d_inicio_cirugia: string;
  d_fin_cirugia: string; d_fin_anestesia: string; d_sin_negatias: boolean;
  d_grid: Record<string, string>;
  drogas: Array<{ numero: string; droga: string; dosis: string }>;
  f_sistema_abierto: boolean; f_sistema_semiabierto: boolean; f_sistema_cerrado: boolean;
  f_circuito_circular: boolean; f_unidireccional: boolean; f_mascara_facial: boolean; f_traqueotomia: boolean;
  f_intubacion_nasal: boolean; f_intubacion_oral: boolean; f_intubacion_submentoniana: boolean;
  f_vision_directa: boolean; f_a_ciegas: boolean; f_tubo_convencional: boolean;
  f_tubo_preformado_oral: boolean; f_tubo_preformado_nasal: boolean; f_tubo_reforzado: boolean;
  f_tubo_doble_luz: boolean; f_tubo_diametro: string; f_tubo_balon_si: boolean; f_tubo_balon_no: boolean;
  f_taponamiento_si: boolean; f_taponamiento_no: boolean;
  f_cormack_1: boolean; f_cormack_2: boolean; f_cormack_3: boolean; f_cormack_4: boolean; f_numero_intentos: string;
  f_induccion_inhalatoria: boolean; f_induccion_intravenosa: boolean;
  f_mantenimiento_inhalatoria: boolean; f_mantenimiento_intravenosa: boolean; f_mantenimiento_balanceada: boolean;
  
  f_asepsia_con: string; f_habon_con: string; f_local_asistida: string; f_intravenosa_reg: string;
  f_bloqueo_nervio: string; f_bloqueo_plexo: string; f_anestesico_local: string; f_coadyuvante: string;
  f_tipo_aguja: string; f_equipo_reg: string;
  
  f_regional_raquidea: boolean; f_regional_epidural: boolean; f_regional_caudal: boolean;
  f_cateter_si: boolean; f_cateter_no: boolean;
  f_tipo_aguja_raquiz: string; f_numero_de_aguja: string; f_numero_intentos_reg: string;
  f_numero_intentos_nervio: string; f_numero_intentos_plexo: string;
  f_barbotaje_si: boolean; f_barbotaje_no: boolean; f_acceso_medial: boolean; f_acceso_lateral: boolean;
  f_sitio_puncion: string; f_dermatoma: string; f_posicion: string;
  
  f_sedo_analgesia_notas: string; f_escala_ramsay: string; f_supraglotica: boolean;
  g_vias: Array<{ tipo: string; calibre: string; sitio: string }>;
  g_intra_arterial: string; g_otros: string;
  h_dextrosa_5: string; h_dextrosa_10: string; h_dextrosa_50: string;
  h_destilada_0_9: string; h_lactato_ringer: string; h_expansores: string; h_otros_h: string; h_total: string;
  h_dextrosa_en_ss: string; h_ss_0_9: string; h_sangre: string; h_plasma: string; h_plaquetas: string; h_crioprecipitados: string;
  i_sangrado: string; i_orina: string; i_otros_i: string; i_total_i: string; i_balance: string;
  j_feto_muerto: boolean; j_apgar_1min: string; j_apgar_5min: string; j_apgar_10min: string;
  
  k_duracion_anestesia: string; k_duracion_cirugia: string;
  
  l_hemodilucion: boolean; l_autotransfusion: boolean; l_hipotension: boolean;
  l_hipotermia: boolean; l_circulacion_extracorporea: boolean;
  m_manta_termica: boolean; m_calentamiento_fluidos: boolean; m_otros: string;
  n_actividad_electrica_sin_pulso: boolean; n_arritmia: boolean; n_asistolia: boolean;
  n_bradicardia_inestable: boolean; n_tromboembolia_pulmonar: boolean; n_hipertermia_maligna: boolean;
  n_anafilaxia: boolean; n_isquemia_miocardica: boolean; n_hipoxemia: boolean;
  n_neumotorax: boolean; n_broncoespasmo: boolean; n_despertar_prolongado: boolean;
  n_embolia_aerea_venosa: boolean; n_reaccion_transfusion: boolean; n_laringoespasmo: boolean;
  n_dificultad_tecnica: boolean; n_otros: string;
  lab_rows: LabRow[];
  observaciones_2: string[];
  r_condiciones_al_salir: string; r_extubado: boolean; r_intubado: boolean;
  r_conducido_a: string; r_unidad_cuidados_post: boolean; r_unidad_cuidados_intensivos: boolean;
  r_criticos_emergencia: boolean; r_morgue: boolean;
  r_constantes_ta: string; r_constantes_fc: string; r_constantes_fr: string;
  r_constantes_sat02: string; r_constantes_temperatura: string;
  s_hora: string; s_nombre_apellido: string; s_sello_codigo: string;

}


interface Props {
  atencionId?: number;
  paciente?: {
    primerNombre?: string; segundoNombre?: string;
    primerApellido?: string; segundoApellido?: string;
    cedula?: string;
    numero_historia_clinica?: string;
    sexo?: string; edad?: number;
    tipoPaciente?: string;
  };
  initialData?: Partial<DatosAnestesia>;
  onGuardar?: (datos: DatosAnestesia) => void;
  onExportarExcel?: (datos: DatosAnestesia) => void;
  guardando?: boolean;
  exportando?: boolean;
}

// ─── Estilos base ─────────────────────────────────────────────────────────────

const B  = "1px solid #5b8db8";
const BL = "1px solid #a8c4d8";

const secH = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: "#cfe2f3", fontWeight: 700, fontSize: "9.5px",
  fontFamily: "Arial, sans-serif", padding: "3px 7px",
  border: B, letterSpacing: "0.03em", color: "#1a3a5c",
  ...extra,
});

const thC: React.CSSProperties = {
  background: "#ddeef8", fontWeight: 700, fontSize: "8px",
  fontFamily: "Arial, sans-serif", padding: "2px 4px",
  border: B, textAlign: "center", color: "#1a3a5c",
  verticalAlign: "middle", whiteSpace: "nowrap",
};

const tdL: React.CSSProperties = {
  border: B, padding: "2px 4px", fontSize: "8px", verticalAlign: "middle", fontFamily: "Arial, sans-serif"
};

const tdC: React.CSSProperties = {
  ...tdL, textAlign: "center"
};

const tdLbl: React.CSSProperties = {
  border: B, padding: "2px 5px",
  background: "#ddeef8", fontWeight: 700,
  fontSize: "8px", fontFamily: "Arial, sans-serif",
  color: "#1a3a5c", whiteSpace: "nowrap", verticalAlign: "middle",
};

const tbl: React.CSSProperties = {
  width: "100%", borderCollapse: "collapse",
  fontFamily: "Arial, sans-serif", fontSize: "10px",
};

function area(value: string, onChange: (v: string) => void, rows = 3, placeholder = ""): React.ReactElement {
  const lineHeightPx = 10 * 1.5;
  const paddingPx = 6;
  const minHeight = Math.ceil(rows * lineHeightPx + paddingPx);

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
  };

  return (
    <textarea 
      value={value} 
      rows={rows}
      placeholder={placeholder}
      ref={(el) => { if (el) autoResize(el); }}
      onChange={(e) => {
        onChange(e.target.value);
        autoResize(e.target);
      }}
      style={{
        width: "100%", border: "none", outline: "none", resize: "none",
        fontSize: "10px", fontFamily: "Arial, sans-serif",
        padding: "3px 5px", boxSizing: "border-box", lineHeight: 1.5,
        background: "#fff", overflow: "hidden",
        minHeight: `${minHeight}px`,
      }} 
    />
  );
}

function TxtIn({ value, onChange, center = false, readOnly = false, placeholder = "", small = false }: {
  value: string; onChange?: (v: string) => void;
  center?: boolean; readOnly?: boolean; placeholder?: string; small?: boolean;
}) {
  return (
    <input type="text" value={value} readOnly={readOnly} placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      style={{
        width: "100%", border: "none", outline: "none",
        background: readOnly ? "#f0f4f8" : "#fff",
        fontSize: small ? "9px" : "10px", fontFamily: "Arial, sans-serif",
        textAlign: center ? "center" : "left",
        padding: "2px 4px", color: "#000", boxSizing: "border-box",
      }} />
  );
}

function RadioCell({ label, checked, onCheck, small = false }: {
  label: string; checked: boolean; onCheck: () => void; small?: boolean;
}) {
  return (
    <td style={{ ...tdL, textAlign: "center", cursor: "pointer", background: checked ? "#cfe2f3" : "#fff", padding: "2px 4px" }}
      onClick={onCheck}>
      <div style={{ fontSize: small ? "8px" : "9px", fontWeight: checked ? 700 : 400, fontFamily: "Arial, sans-serif", color: "#1a3a5c" }}>
        {checked ? "✔ " : ""}{label}
      </div>
    </td>
  );
}

function LabelRightCheck({ label, checked, onCheck }: { label: string; checked: boolean; onCheck: () => void }) {
  return (
    <label style={{ display: "flex", gap: 4, alignItems: "center", fontSize: "8px", fontFamily: "Arial, sans-serif", fontWeight: 700, color: "#1a3a5c", cursor: "pointer", padding: "0 4px" }}>
      {label}
      <input type="checkbox" checked={checked} onChange={onCheck} style={{ width: 10, height: 10, margin: 0, cursor: "pointer" }} />
    </label>
  );
}

function ChkCell({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <td style={{ ...tdL, textAlign: "center", verticalAlign: "middle" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        style={{ width: 12, height: 12 }} />
    </td>
  );
}

function SiNo({ si, no, onSi, onNo }: { si: boolean; no: boolean; onSi: () => void; onNo: () => void }) {
  return (
    <div style={{ display: "flex", gap: 6, padding: "2px 4px" }}>
      <label style={{ display: "flex", alignItems: "center", gap: 2, fontSize: "8px", cursor: "pointer", fontFamily: "Arial, sans-serif" }}>
        <input type="radio" checked={si} onChange={onSi} style={{ width: 10, height: 10 }} /> SI
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 2, fontSize: "8px", cursor: "pointer", fontFamily: "Arial, sans-serif" }}>
        <input type="radio" checked={no} onChange={onNo} style={{ width: 10, height: 10 }} /> NO
      </label>
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg, color: "#fff", border: "none", borderRadius: 4,
    padding: "6px 14px", fontSize: "11px", fontWeight: 700,
    cursor: "pointer", fontFamily: "Arial, sans-serif",
  };
}

// ─── Componente Principal ─────────────────────────────────────────────────────

const AnestesiologiaForm = forwardRef<{ getDatos: () => DatosAnestesia; clearAutosave: () => void; isDirty: () => boolean }, Props>(
  ({ atencionId, paciente, initialData, onGuardar, onExportarExcel, guardando = false, exportando = false }, ref) => {
  const today = new Date().toISOString().split("T")[0];
  
  
  useImperativeHandle(ref, () => ({
    getDatos: () => d,
    clearAutosave: () => clearAutosave(),
    isDirty: () => isDirty,
  }));

  const nowTime = new Date().toTimeString().slice(0, 5);

  const [d, setD] = useState<DatosAnestesia>({
    institucion: paciente?.tipoPaciente ? paciente.tipoPaciente.toUpperCase() : "PARTICULAR", unicodigo: "35865", establecimiento: "NUEVO HOSPITAL PANAMERICANO",
    numero_historia_clinica: paciente?.numero_historia_clinica ?? paciente?.cedula ?? "",
    numero_archivo: "",
    primer_apellido: paciente?.primerApellido ?? "", segundo_apellido: paciente?.segundoApellido ?? "",
    primer_nombre: paciente?.primerNombre ?? "", segundo_nombre: paciente?.segundoNombre ?? "",
    sexo: paciente?.sexo ?? "", edad: paciente?.edad?.toString() ?? "", condicion_edad: "A",
    b_diagnostico: "", b_cie: "", b_procedimiento: "",
    b_diagnostico_2: "", b_cie_2: "", b_procedimiento_2: "",
    b_efectiva: false, b_emergencia: false, b_urgencia: false,
    b_riesgo_bajo: false, b_riesgo_moderado: false, b_riesgo_alto: false,
    antecedentes: Array(10).fill(null).map(() => ({ diagnostico: "", tiempo: "", tratamiento: "" })),
    anestesicos: ["", "", ""], quirurgicos: ["", "", ""],
    alergicos: ["", "", ""], transfusiones: ["", "", ""], habitos: ["", "", ""],
    ant_familiares: ["", "", ""],
    d_ta: "", d_fc: "", d_fr: "", d_temperatura: "", d_sat02: "", d_glasgow: "",
    d_peso: "", d_talla: "", d_imc: "",
    d_apertura_bucal: "", d_distancia_tiromentoaneana: "", d_mallampati: "",
    d_protusion_mandibular: "", d_perimetro_cervical: "", d_movilidad_cervical: "",
    d_historia_intubacion_dificil_si: false, d_historia_intubacion_dificil_no: false,
    d_patologia_intubacion_dificil_si: false, d_patologia_intubacion_dificil_no: false,
    d_torax: "", d_corazon: "", d_pulmones: "", d_abdomen: "",
    d_extremidades: "", d_sistema_nervioso: "", d_equivalente_metabolico: "",
    e_hcto: "", e_hb: "", e_plaquetas: "", e_tp: "", e_ttp: "", e_inr: "", e_leucocitos: "",
    e_ekg: "", e_rx_torax: "", e_espirometria: "", e_otros: "",
    e_grupo: "", e_factor: "", e_quimica: "", e_glucosa: "", e_urea: "", e_creatinina: "",
    e_ast: "", e_alt: "", e_fa: "", e_ldh: "", e_bt: "", e_bd: "", e_bi: "",
    e_na: "", e_k: "", e_cl: "", e_ca: "", e_mg: "",
    e_ph: "", e_po2: "", e_pco2: "", e_hco3: "", e_eb: "", e_sat02_gas: "", e_lactato: "",
    e_t4: "", e_tsh: "", e_prueba_embarazo_si: false, e_prueba_embarazo_no: false,
    e_ph_orina: "", e_densidad: "", e_bacterias: "", e_leucocitos_orina: "",
    e_piocitos: "", e_hematies: "", e_glucosa_orina: "",
    f_asa: "", f_riesgo_cardiaco: "", f_riesgo_pulmonar: "", f_riesgo_tromboembolico: "", f_otros: "",
    f_liquidos_claros: "", f_leche_materna: "", f_leche_formula: "", f_solidos: "",
    indicaciones: Array(8).fill(""),
    plan_anestesico: "", observaciones: "",
    j_fecha: today, j_hora: nowTime,
    j_primer_nombre: "", j_primer_apellido: "", j_segundo_apellido: "", j_documento: "",
    // TRANSANASTÉSICO
    fecha: today, imc: "",
    talla: "", peso: "", grupo_factor: "",
    consentimiento_informado_si: false, consentimiento_informado_no: false,
    b_diagnostico_prequirurgico: "", b_diagnostico_postquirurgico: "",
    b_anestesiologo: "", b_ayudante_anestesia: "",
    b_cirujano: "", b_cirujano2: "",
    b_cirugia_propuesta: "", b_cirugia_realizada: "",
    b_instrumentista: "", b_circulante: "", b_especialidad: "", b_quirofano: "",
    b_prioridad_electiva: false, b_prioridad_urgencia: false, b_prioridad_emergencia: false,
    b_ambito_ambulatorio: false, b_ambito_internacion: false, b_otros: "",
    c_cabeza: false, c_cuello: false, c_torax: false, c_columna: false, c_organos: false,
    c_abdomen: false, c_pelvis: false, c_extremidades_superiores: false,
    c_extremidades_inferiores: false, c_perineal: false, c_otros: "",
    d_agente_inhalatorio: "", d_onda_delta: "", d_saturacion_co2: "", d_capnometria: "",
    d_relajacion_neuromuscular: "", d_profundidad_anestesica: "",
    d_inicio_anestesia: "", d_induccion: "", d_inicio_cirugia: "",
    d_fin_cirugia: "", d_fin_anestesia: "", d_sin_negatias: false,
    d_grid: {},
    drogas: Array(24).fill(null).map((_, i) => ({ numero: String(i + 1), droga: "", dosis: "" })),
    f_sistema_abierto: false, f_sistema_semiabierto: false, f_sistema_cerrado: false,
    f_circuito_circular: false, f_unidireccional: false,
    f_mascara_facial: false, f_traqueotomia: false,
    f_intubacion_nasal: false, f_intubacion_oral: false, f_intubacion_submentoniana: false,
    f_vision_directa: false, f_a_ciegas: false,
    f_tubo_convencional: false, f_tubo_preformado_oral: false, f_tubo_preformado_nasal: false,
    f_tubo_reforzado: false, f_tubo_doble_luz: false, f_tubo_diametro: "",
    f_tubo_balon_si: false, f_tubo_balon_no: false,
    f_taponamiento_si: false, f_taponamiento_no: false,
    f_cormack_1: false, f_cormack_2: false, f_cormack_3: false, f_cormack_4: false, f_numero_intentos: "",
    f_induccion_inhalatoria: false, f_induccion_intravenosa: false,
    f_mantenimiento_inhalatoria: false, f_mantenimiento_intravenosa: false, f_mantenimiento_balanceada: false,
    
    f_asepsia_con: "", f_habon_con: "", f_local_asistida: "", f_intravenosa_reg: "",
    f_bloqueo_nervio: "", f_bloqueo_plexo: "", f_anestesico_local: "", f_coadyuvante: "",
    f_tipo_aguja: "", f_equipo_reg: "",
    
    f_regional_raquidea: false, f_regional_epidural: false, f_regional_caudal: false,
    f_cateter_si: false, f_cateter_no: false,
    f_tipo_aguja_raquiz: "", f_numero_de_aguja: "", f_numero_intentos_reg: "",
    f_numero_intentos_nervio: "", f_numero_intentos_plexo: "",
    f_barbotaje_si: false, f_barbotaje_no: false, f_acceso_medial: false, f_acceso_lateral: false,
    f_sitio_puncion: "", f_dermatoma: "", f_posicion: "",
    
    f_sedo_analgesia_notas: "", f_escala_ramsay: "", f_supraglotica: false,
    g_vias: [
      { tipo: "IV PERIFÉRICO 1", calibre: "", sitio: "" },
      { tipo: "IV PERIFÉRICO 2", calibre: "", sitio: "" },
      { tipo: "IV PERIFÉRICO 3", calibre: "", sitio: "" },
      { tipo: "IV CENTRAL",      calibre: "", sitio: "" },
      { tipo: "INTRA ARTERIAL",  calibre: "", sitio: "" },
      { tipo: "OTRO",            calibre: "", sitio: "" },
    ],
    g_intra_arterial: "", g_otros: "",
    h_dextrosa_5: "", h_dextrosa_10: "", h_dextrosa_50: "",
    h_destilada_0_9: "", h_lactato_ringer: "", h_expansores: "",
    h_otros_h: "", h_total: "",
    h_dextrosa_en_ss: "", h_ss_0_9: "", h_sangre: "", h_plasma: "", h_plaquetas: "", h_crioprecipitados: "",
    i_sangrado: "", i_orina: "", i_otros_i: "", i_total_i: "", i_balance: "",
    j_feto_muerto: false, j_apgar_1min: "", j_apgar_5min: "", j_apgar_10min: "",
    k_duracion_anestesia: "", k_duracion_cirugia: "",
    l_hemodilucion: false, l_autotransfusion: false, l_hipotension: false, l_hipotermia: false, l_circulacion_extracorporea: false,
    m_manta_termica: false, m_calentamiento_fluidos: false, m_otros: "",
    n_actividad_electrica_sin_pulso: false, n_arritmia: false, n_asistolia: false, n_bradicardia_inestable: false, n_tromboembolia_pulmonar: false, n_hipertermia_maligna: false, n_anafilaxia: false, n_isquemia_miocardica: false, n_hipoxemia: false, n_neumotorax: false, n_broncoespasmo: false, n_despertar_prolongado: false, n_embolia_aerea_venosa: false, n_reaccion_transfusion: false, n_laringoespasmo: false, n_dificultad_tecnica: false, n_otros: "",
    lab_rows: [], observaciones_2: [], r_condiciones_al_salir: "", r_extubado: false, r_intubado: false, r_conducido_a: "", r_unidad_cuidados_post: false, r_unidad_cuidados_intensivos: false, r_criticos_emergencia: false, r_morgue: false, r_constantes_ta: "", r_constantes_fc: "", r_constantes_fr: "", r_constantes_sat02: "", r_constantes_temperatura: "", s_hora: "", s_nombre_apellido: "", s_sello_codigo: "",
    ...initialData,
  });
  
  const [hoja, setHoja] = useState<"PRE ANESTÉSICO" | "TRANSANASTÉSICO" | "TRANSANASTÉSICO (2)">("PRE ANESTÉSICO");

  const { isDirty, clearAutosave } = useFormAutosaveAndWarn({
    formId: `hc_anestesiologia_${atencionId || 'new'}_${paciente?.cedula || 'new'}`,
    initialData: initialData || {},
    currentData: d,
    onRestore: (saved) => setD((p) => ({ ...p, ...saved })),
  });
  
  useImperativeHandle(ref, () => ({
    getDatos: () => d,
    clearAutosave: () => clearAutosave(),
    isDirty: () => isDirty,
  }));


  const handlePrint = () => { window.print(); };

  const s = (k: keyof DatosAnestesia) => (v: string) => setD(p => ({ ...p, [k]: v }));

  const setAnt = (i: number, campo: "diagnostico" | "tiempo" | "tratamiento", v: string) =>
    setD(p => { const a = [...p.antecedentes]; a[i] = { ...a[i], [campo]: v }; return { ...p, antecedentes: a }; });

  const setLines = (k: "anestesicos" | "quirurgicos" | "alergicos" | "transfusiones" | "habitos" | "ant_familiares" | "indicaciones", i: number, v: string) =>
    setD(p => { const arr = [...(p[k] as string[])]; arr[i] = v; return { ...p, [k]: arr }; });

  const rowH = 20;
  const ROW_H = 20;



  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      {/* Barra de acciones */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 14px", background: "#f5f7fa", borderBottom: "1px solid #dde3ea", gap: 8,
      }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#1a3a5c", fontFamily: "Arial, sans-serif" }}>
          SNS-MSP / HCU-form.018/2021 — {hoja}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => { onGuardar?.(d); clearAutosave(); }} disabled={guardando} style={btnStyle("#1a3a5c")}>
            {guardando ? "Guardando..." : "💾 Guardar"}
          </button>
          
        </div>
      </div>

      {/* ── Pestañas ─────────────────────────────────────── */}
      <div className="no-print" style={{ display: "flex", borderBottom: "2px solid #000", background: "#e8e8e8" }}>
        {(["PRE ANESTÉSICO", "TRANSANASTÉSICO", "TRANSANASTÉSICO (2)"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setHoja(tab)}
            style={{
              padding: "8px 20px",
              fontSize: "11px",
              fontWeight: 700,
              fontFamily: "Arial, sans-serif",
              border: "none",
              borderRight: "1px solid #999",
              cursor: "pointer",
              background: hoja === tab ? "#fff" : "#d0d0d0",
              borderBottom: hoja === tab ? "2px solid #fff" : "none",
              marginBottom: "-2px",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ overflowX: "visible", overflowY: "visible", background: "#fff", display: hoja === "PRE ANESTÉSICO" ? "block" : "none" }}>
        <div style={{ padding: "6px 10px 10px", minWidth: 900 }}>

          {/* ══ A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE ═══════════ */}
          <div style={secH({ marginTop: 6 })}>A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE</div>
          <table style={{ ...tbl, tableLayout: "fixed" }}>
            <tbody>
              {/* Fila base oculta para forzar 20 columnas (5% cada una) */}
              <tr style={{ height: 0, visibility: "hidden" }}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <td key={i} style={{ padding: 0, border: "none" }}></td>
                ))}
              </tr>

              <tr>
                <td colSpan={4} style={tdLbl}>INSTITUCIÓN DEL SISTEMA</td>
                <td colSpan={2} style={tdLbl}>UNICÓDIGO</td>
                <td colSpan={8} style={tdLbl}>ESTABLECIMIENTO DE SALUD</td>
                <td colSpan={4} style={{ ...tdLbl, textAlign: "center" }}>NÚMERO DE HISTORIA CLÍNICA</td>
                <td colSpan={2} style={{ ...tdLbl, textAlign: "center" }}>NÚMERO DE ARCHIVO</td>
              </tr>
              <tr style={{ height: 24 }}>
                <td colSpan={4} style={tdL}><TxtIn value={d.institucion} onChange={s("institucion")} /></td>
                <td colSpan={2} style={tdL}><TxtIn value={d.unicodigo} onChange={s("unicodigo")} center /></td>
                <td colSpan={8} style={tdL}><TxtIn value={d.establecimiento} onChange={s("establecimiento")} /></td>
                <td colSpan={4} style={tdL}><TxtIn value={d.numero_historia_clinica} onChange={s("numero_historia_clinica")} center /></td>
                <td colSpan={2} style={tdL}><TxtIn value={d.numero_archivo} onChange={s("numero_archivo")} center /></td>
              </tr>
              <tr>
                <td colSpan={3} style={tdLbl}>PRIMER APELLIDO</td>
                <td colSpan={3} style={tdLbl}>SEGUNDO APELLIDO</td>
                <td colSpan={3} style={tdLbl}>PRIMER NOMBRE</td>
                <td colSpan={3} style={tdLbl}>SEGUNDO NOMBRE</td>
                <td colSpan={2} style={{ ...tdLbl, textAlign: "center" }}>SEXO</td>
                <td colSpan={2} style={{ ...tdLbl, textAlign: "center" }}>EDAD</td>
                <td colSpan={4} style={{ ...tdLbl, textAlign: "center" }}>
                  CONDICIÓN EDAD
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 1, fontSize: "7px" }}>
                    <span>H</span><span>D</span><span>M</span><span>A</span>
                  </div>
                </td>
              </tr>
              <tr style={{ height: 24 }}>
                <td colSpan={3} style={tdL}><TxtIn value={d.primer_apellido} onChange={s("primer_apellido")} /></td>
                <td colSpan={3} style={tdL}><TxtIn value={d.segundo_apellido} onChange={s("segundo_apellido")} /></td>
                <td colSpan={3} style={tdL}><TxtIn value={d.primer_nombre} onChange={s("primer_nombre")} /></td>
                <td colSpan={3} style={tdL}><TxtIn value={d.segundo_nombre} onChange={s("segundo_nombre")} /></td>
                <td colSpan={2} style={tdL}><TxtIn value={d.sexo} onChange={s("sexo")} center /></td>
                <td colSpan={2} style={tdL}><TxtIn value={d.edad} onChange={s("edad")} center /></td>
                <td colSpan={4} style={tdL}>
                  <div style={{ display: "flex", gap: 14, justifyContent: "center", padding: "2px" }}>
                    {(["H","D","M","A"] as const).map(op => (
                      <input key={op} type="radio" name="anest_condicion_edad" value={op}
                        checked={d.condicion_edad === op}
                        onChange={() => setD(p => ({ ...p, condicion_edad: op }))}
                        style={{ width: 11, height: 11, cursor: "pointer", margin: 0 }} />
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ══ B. REGISTRO DE VALORACIÓN PREANESTÉSICA ═════════════════════ */}
          <div style={secH({ marginTop: 5 })}>B. REGISTRO DE VALORACIÓN PREANESTÉSICA</div>
          <table style={{ ...tbl, tableLayout: "fixed" }}>
            <tbody>
              <tr style={{ height: 0, visibility: "hidden" }}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <td key={i} style={{ padding: 0, border: "none" }}></td>
                ))}
              </tr>
              <tr style={{ height: rowH }}>
                <td rowSpan={2} colSpan={3} style={tdLbl}>DIAGNÓSTICO</td>
                <td colSpan={13} style={tdL}>
                  <Cie10DescInput
                    descripcion={d.b_diagnostico}
                    cie={d.b_cie}
                    onChange={(cie, descripcion) => {
                      s("b_diagnostico")(descripcion);
                      s("b_cie")(cie);
                    }}
                  />
                </td>
                <td rowSpan={2} colSpan={1} style={{ ...tdLbl, textAlign: "center" }}>CIE</td>
                <td colSpan={3} style={tdL}>
                  <Cie10CieInput
                    descripcion={d.b_diagnostico}
                    cie={d.b_cie}
                    onChange={(cie, descripcion) => {
                      s("b_diagnostico")(descripcion);
                      s("b_cie")(cie);
                    }}
                  />
                </td>
              </tr>
              <tr style={{ height: rowH }}>
                <td colSpan={13} style={tdL}>
                  <Cie10DescInput
                    descripcion={d.b_diagnostico_2 ?? ""}
                    cie={d.b_cie_2 ?? ""}
                    onChange={(cie, descripcion) => {
                      s("b_diagnostico_2")(descripcion);
                      s("b_cie_2")(cie);
                    }}
                  />
                </td>
                <td colSpan={3} style={tdL}>
                  <Cie10CieInput
                    descripcion={d.b_diagnostico_2 ?? ""}
                    cie={d.b_cie_2 ?? ""}
                    onChange={(cie, descripcion) => {
                      s("b_diagnostico_2")(descripcion);
                      s("b_cie_2")(cie);
                    }}
                  />
                </td>
              </tr>
              <tr style={{ height: rowH }}>
                <td rowSpan={2} colSpan={6} style={tdLbl}>PROCEDIMIENTO/S PROPUESTO /S:</td>
                <td colSpan={14} style={tdL}><TxtIn value={d.b_procedimiento} onChange={s("b_procedimiento")} /></td>
              </tr>
              <tr style={{ height: rowH }}>
                <td colSpan={14} style={tdL}><TxtIn value={d.b_procedimiento_2 ?? ""} onChange={s("b_procedimiento_2")} /></td>
              </tr>
              <tr style={{ height: 28 }}>
                <td colSpan={3} style={{ ...tdL, padding: "0 6px" }}>
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", fontSize: "9px", fontFamily: "Arial, sans-serif", fontWeight: 700, color: "#1a3a5c", cursor: "pointer" }}>
                    EFECTIVA
                    <input type="checkbox" checked={d.b_efectiva} onChange={(e) => setD(p => ({ ...p, b_efectiva: e.target.checked }))} style={{ width: 12, height: 12, margin: 0, cursor: "pointer" }} />
                  </label>
                </td>
                <td colSpan={3} style={{ ...tdL, padding: "0 6px" }}>
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", fontSize: "9px", fontFamily: "Arial, sans-serif", fontWeight: 700, color: "#1a3a5c", cursor: "pointer" }}>
                    EMERGENCIA
                    <input type="checkbox" checked={d.b_emergencia} onChange={(e) => setD(p => ({ ...p, b_emergencia: e.target.checked }))} style={{ width: 12, height: 12, margin: 0, cursor: "pointer" }} />
                  </label>
                </td>
                <td colSpan={3} style={{ ...tdL, padding: "0 6px" }}>
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", fontSize: "9px", fontFamily: "Arial, sans-serif", fontWeight: 700, color: "#1a3a5c", cursor: "pointer" }}>
                    URGENCIA
                    <input type="checkbox" checked={d.b_urgencia} onChange={(e) => setD(p => ({ ...p, b_urgencia: e.target.checked }))} style={{ width: 12, height: 12, margin: 0, cursor: "pointer" }} />
                  </label>
                </td>
                <td colSpan={4} style={{ ...tdLbl, textAlign: "center" }}>RIESGO QUIRÚRGICO</td>
                <td colSpan={2} style={{ ...tdL, padding: "0 6px" }}>
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", fontSize: "9px", fontFamily: "Arial, sans-serif", fontWeight: 700, color: "#1a3a5c", cursor: "pointer" }}>
                    BAJO
                    <input type="checkbox" checked={d.b_riesgo_bajo} onChange={(e) => setD(p => ({ ...p, b_riesgo_bajo: e.target.checked }))} style={{ width: 12, height: 12, margin: 0, cursor: "pointer" }} />
                  </label>
                </td>
                <td colSpan={3} style={{ ...tdL, padding: "0 6px" }}>
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", fontSize: "9px", fontFamily: "Arial, sans-serif", fontWeight: 700, color: "#1a3a5c", cursor: "pointer" }}>
                    MODERADO
                    <input type="checkbox" checked={d.b_riesgo_moderado} onChange={(e) => setD(p => ({ ...p, b_riesgo_moderado: e.target.checked }))} style={{ width: 12, height: 12, margin: 0, cursor: "pointer" }} />
                  </label>
                </td>
                <td colSpan={2} style={{ ...tdL, padding: "0 6px" }}>
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", fontSize: "9px", fontFamily: "Arial, sans-serif", fontWeight: 700, color: "#1a3a5c", cursor: "pointer" }}>
                    ALTO
                    <input type="checkbox" checked={d.b_riesgo_alto} onChange={(e) => setD(p => ({ ...p, b_riesgo_alto: e.target.checked }))} style={{ width: 12, height: 12, margin: 0, cursor: "pointer" }} />
                  </label>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ══ C. ANAMNESIS ════════════════════════════════════════════════ */}
          <div style={secH({ marginTop: 5 })}>C. ANAMNESIS</div>

          {/* Antecedentes patológicos personales — 10 filas */}
          <div style={{ ...secH(), background: "#ddeef8", textAlign: "center", fontSize: "8.5px" }}>
            ANTECEDENTES PATOLÓGICOS PERSONALES
          </div>
          <table style={tbl}>
            <tbody>
              <tr>
                <td style={{ ...thC, width: 28 }}></td>
                <td style={{ ...thC, width: "25%" }}>DIAGNÓSTICO</td>
                <td style={{ ...thC, width: "20%" }}>TIEMPO DE EVALUACIÓN</td>
                <td style={thC}>TRATAMIENTO</td>
              </tr>
              {d.antecedentes.map((row, i) => (
                <tr key={i} style={{ height: rowH }}>
                  <td style={{ ...tdLbl, textAlign: "center", fontSize: "8px" }}>{i + 1}.</td>
                  <td style={tdL}><TxtIn value={row.diagnostico} onChange={(v) => setAnt(i, "diagnostico", v)} small /></td>
                  <td style={tdL}><TxtIn value={row.tiempo} onChange={(v) => setAnt(i, "tiempo", v)} small center /></td>
                  <td style={tdL}><TxtIn value={row.tratamiento} onChange={(v) => setAnt(i, "tratamiento", v)} small /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bloques: ANESTÉSICOS, QUIRÚRGICOS, ALÉRGICOS, TRANSFUSIONES, HÁBITOS */}
          {([
            { key: "anestesicos" as const,  label: "ANESTÉSICOS" },
            { key: "quirurgicos" as const,   label: "QUIRÚRGICOS" },
            { key: "alergicos" as const,     label: "ALÉRGICOS" },
            { key: "transfusiones" as const, label: "TRANSFUSIONES" },
            { key: "habitos" as const,       label: "HÁBITOS" },
          ]).map(({ key, label }) => (
            <table key={key} style={{ ...tbl, marginTop: 0 }}>
              <tbody>
                {[0, 1, 2].map(i => (
                  <tr key={i} style={{ height: rowH }}>
                    {i === 0 && (
                      <td rowSpan={3} style={{ ...tdLbl, width: 90, textAlign: "center", verticalAlign: "middle" }}>
                        {label}
                      </td>
                    )}
                    <td style={tdL}>
                      <TxtIn value={(d[key] as string[])[i]} onChange={(v) => setLines(key, i, v)} small />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}

          {/* Antecedentes patológicos familiares */}
          <div style={{ ...secH(), background: "#ddeef8", textAlign: "center", fontSize: "8.5px", marginTop: 3 }}>
            ANTECEDENTES PATOLÓGICOS FAMILIARES
          </div>
          <table style={tbl}>
            <tbody>
              {[0, 1, 2].map(i => (
                <tr key={i} style={{ height: rowH }}>
                  <td style={tdL}>
                    <TxtIn value={d.ant_familiares[i]} onChange={(v) => setLines("ant_familiares", i, v)} small />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Separador hoja 1 */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderTop: B, marginTop: 6 }}>
            <span style={{ fontSize: "8px", color: "#555", fontFamily: "Arial, sans-serif" }}>SNS-MSP/HCU-form.018/2021</span>
            <span style={{ fontSize: "9px", fontWeight: 700, color: "#1a3a5c", fontFamily: "Arial, sans-serif" }}>PRE ANESTÉSICO (1)</span>
          </div>

          {/* ══ D. EXAMEN FÍSICO ════════════════════════════════════════════ */}
          <div style={secH({ marginTop: 8 })}>D. EXAMEN FÍSICO</div>

          {/* Constantes vitales */}
          <table style={tbl}>
            <tbody>
              <tr>
                <td style={tdLbl}>CONSTANTES VITALES</td>
                <td style={thC}>TA</td><td style={{ ...tdL, width: 80 }}><TxtIn value={d.d_ta} onChange={s("d_ta")} center small /></td>
                <td style={thC}>FC</td><td style={{ ...tdL, width: 70 }}><TxtIn value={d.d_fc} onChange={s("d_fc")} center small /></td>
                <td style={thC}>FR</td><td style={{ ...tdL, width: 70 }}><TxtIn value={d.d_fr} onChange={s("d_fr")} center small /></td>
                <td style={thC}>T°</td><td style={{ ...tdL, width: 70 }}><TxtIn value={d.d_temperatura} onChange={s("d_temperatura")} center small /></td>
                <td style={thC}>SAT 02</td><td style={{ ...tdL, width: 70 }}><TxtIn value={d.d_sat02} onChange={s("d_sat02")} center small /></td>
                <td style={thC}>GLASGOW</td><td style={{ ...tdL, width: 70 }}><TxtIn value={d.d_glasgow} onChange={s("d_glasgow")} center small /></td>
              </tr>
              <tr>
                <td style={tdLbl}>ANTROPOMETRÍA</td>
                <td colSpan={2} style={thC}>PESO (kg)</td>
                <td colSpan={2} style={tdL}><TxtIn value={d.d_peso} onChange={s("d_peso")} center small /></td>
                <td colSpan={2} style={thC}>TALLA (cm)</td>
                <td colSpan={2} style={tdL}><TxtIn value={d.d_talla} onChange={s("d_talla")} center small /></td>
                <td colSpan={2} style={thC}>IMC (kg/m2)</td>
                <td colSpan={2} style={tdL}><TxtIn value={d.d_imc} onChange={s("d_imc")} center small /></td>
              </tr>
            </tbody>
          </table>

          {/* VÍA AÉREA */}
          <table style={tbl}>
            <tbody>
              <tr>
                <td rowSpan={4} style={{ ...tdLbl, textAlign: "center", verticalAlign: "middle", width: 60 }}>VÍA AÉREA</td>
                {/* APERTURA BUCAL */}
                <td colSpan={4} style={{ ...thC }}>APERTURA BUCAL (cm)</td>
                <td colSpan={3} style={{ ...thC }}>DISTANCIA TIROMENTONEANA (cm)</td>
                <td colSpan={4} style={{ ...thC }}>MALLAMPATI</td>
              </tr>
              <tr style={{ height: 24 }}>
                <td colSpan={4} style={tdL}>
                  <div style={{ display: "flex", width: "100%", justifyContent: "space-around" }}>
                    {(["<2","2-2.5","2.6-3",">3"] as const).map(v => (
                       <LabelRightCheck key={v} label={v} checked={d.d_apertura_bucal === v} onCheck={() => setD(p => ({ ...p, d_apertura_bucal: p.d_apertura_bucal === v ? "" : v }))} />
                    ))}
                  </div>
                </td>
                <td colSpan={3} style={tdL}>
                  <div style={{ display: "flex", width: "100%", justifyContent: "space-around" }}>
                    {(["<6","6-6.5",">6.5"] as const).map(v => (
                       <LabelRightCheck key={v} label={v} checked={d.d_distancia_tiromentoaneana === v} onCheck={() => setD(p => ({ ...p, d_distancia_tiromentoaneana: p.d_distancia_tiromentoaneana === v ? "" : v }))} />
                    ))}
                  </div>
                </td>
                <td colSpan={4} style={tdL}>
                  <div style={{ display: "flex", width: "100%", justifyContent: "space-around" }}>
                    {(["I","II","III","IV"] as const).map(v => (
                       <LabelRightCheck key={v} label={v} checked={d.d_mallampati === v} onCheck={() => setD(p => ({ ...p, d_mallampati: p.d_mallampati === v ? "" : v }))} />
                    ))}
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan={3} style={thC}>PROTRUSIÓN MANDIBULAR</td>
                <td colSpan={2} style={thC}>PERÍMETRO CERVICAL (cm)</td>
                <td colSpan={2} style={thC}>MOVILIDAD CERVICAL (°)</td>
                <td colSpan={2} style={thC}>HISTORIA DE INTUBACIÓN DIFÍCIL</td>
                <td colSpan={2} style={thC}>PATOLOGÍA ASOCIADA A INTUBACIÓN DIFÍCIL</td>
              </tr>
              <tr style={{ height: 24 }}>
                <td colSpan={3} style={tdL}>
                  <div style={{ display: "flex", width: "100%", justifyContent: "space-around" }}>
                    {(["<0","0",">0"] as const).map(v => (
                       <LabelRightCheck key={v} label={v} checked={d.d_protusion_mandibular === v} onCheck={() => setD(p => ({ ...p, d_protusion_mandibular: p.d_protusion_mandibular === v ? "" : v }))} />
                    ))}
                  </div>
                </td>
                <td colSpan={2} style={tdL}>
                  <div style={{ display: "flex", width: "100%", justifyContent: "space-around" }}>
                    {(["<40",">40"] as const).map(v => (
                       <LabelRightCheck key={v} label={v} checked={d.d_perimetro_cervical === v} onCheck={() => setD(p => ({ ...p, d_perimetro_cervical: p.d_perimetro_cervical === v ? "" : v }))} />
                    ))}
                  </div>
                </td>
                <td colSpan={2} style={tdL}>
                  <div style={{ display: "flex", width: "100%", justifyContent: "space-around" }}>
                    {(["<35",">35"] as const).map(v => (
                       <LabelRightCheck key={v} label={v} checked={d.d_movilidad_cervical === v} onCheck={() => setD(p => ({ ...p, d_movilidad_cervical: p.d_movilidad_cervical === v ? "" : v }))} />
                    ))}
                  </div>
                </td>
                <td colSpan={2} style={tdL}>
                  <div style={{ display: "flex", width: "100%", justifyContent: "space-around" }}>
                    <LabelRightCheck label="Si" checked={d.d_historia_intubacion_dificil_si} onCheck={() => setD(p => ({ ...p, d_historia_intubacion_dificil_si: true, d_historia_intubacion_dificil_no: false }))} />
                    <LabelRightCheck label="No" checked={d.d_historia_intubacion_dificil_no} onCheck={() => setD(p => ({ ...p, d_historia_intubacion_dificil_no: true, d_historia_intubacion_dificil_si: false }))} />
                  </div>
                </td>
                <td colSpan={2} style={tdL}>
                  <div style={{ display: "flex", width: "100%", justifyContent: "space-around" }}>
                    <LabelRightCheck label="Si" checked={d.d_patologia_intubacion_dificil_si} onCheck={() => setD(p => ({ ...p, d_patologia_intubacion_dificil_si: true, d_patologia_intubacion_dificil_no: false }))} />
                    <LabelRightCheck label="No" checked={d.d_patologia_intubacion_dificil_no} onCheck={() => setD(p => ({ ...p, d_patologia_intubacion_dificil_no: true, d_patologia_intubacion_dificil_si: false }))} />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Examen por sistemas */}
          <table style={tbl}>
            <tbody>
              {([
                { key: "d_torax" as const,               label: "TÓRAX" },
                { key: "d_corazon" as const,             label: "CORAZÓN" },
                { key: "d_pulmones" as const,            label: "PULMONES" },
                { key: "d_abdomen" as const,             label: "ABDOMEN" },
                { key: "d_extremidades" as const,        label: "EXTREMIDADES" },
                { key: "d_sistema_nervioso" as const,    label: "SISTEMA NERVIOSO CENTRAL" },
                { key: "d_equivalente_metabolico" as const, label: "EQUIVALENTE METABÓLICO (METS)" },
              ]).map(({ key, label }) => (
                <tr key={key} style={{ height: rowH }}>
                  <td style={{ ...tdLbl, width: 180 }}>{label}</td>
                  <td style={tdL}><TxtIn value={d[key] as string} onChange={s(key)} small /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ E. RESULTADOS DE EXÁMENES ═══════════════════════════════════ */}
          <div style={{ ...secH({ marginTop: 5 }), display: "flex", alignItems: "center" }}>
            <span>E. RESULTADOS DE EXÁMENES DE LABORATORIO, GABINETE E IMAGEN</span>
            <span style={{ marginLeft: "auto", fontSize: "7px", fontWeight: 400, fontStyle: "italic" }}>(REGISTRAR LO QUE APLIQUE)</span>
          </div>
          <table style={tbl}>
            <tbody>
              {/* Cabeceras de grupos */}
              <tr>
                <td colSpan={2} style={thC}>HEMOGRAMA</td>
                <td colSpan={2} style={thC}>TIPIFICACIÓN</td>
                <td colSpan={2} style={thC}>PERFIL HEPÁTICO</td>
                <td colSpan={2} style={thC}>IONOGRAMA</td>
                <td colSpan={2} style={thC}>GASOMETRÍA</td>
                <td colSpan={2} style={thC}>HORMONAS</td>
                <td colSpan={2} style={thC}>ORINA</td>
              </tr>
              {/* Fila 1 */}
              <tr style={{ height: rowH }}>
                <td style={thC}>HCTO</td><td style={tdL}><TxtIn value={d.e_hcto} onChange={s("e_hcto")} small center /></td>
                <td style={thC}>GRUPO</td><td style={tdL}><TxtIn value={d.e_grupo} onChange={s("e_grupo")} small center /></td>
                <td style={thC}>AST</td><td style={tdL}><TxtIn value={d.e_ast} onChange={s("e_ast")} small center /></td>
                <td style={thC}>Na</td><td style={tdL}><TxtIn value={d.e_na} onChange={s("e_na")} small center /></td>
                <td style={thC}>pH</td><td style={tdL}><TxtIn value={d.e_ph} onChange={s("e_ph")} small center /></td>
                <td style={thC}>T4</td><td style={tdL}><TxtIn value={d.e_t4} onChange={s("e_t4")} small center /></td>
                <td style={thC}>pH</td><td style={tdL}><TxtIn value={d.e_ph_orina} onChange={s("e_ph_orina")} small center /></td>
              </tr>
              {/* Fila 2 */}
              <tr style={{ height: rowH }}>
                <td style={thC}>HB</td><td style={tdL}><TxtIn value={d.e_hb} onChange={s("e_hb")} small center /></td>
                <td style={thC}>FACTOR</td><td style={tdL}><TxtIn value={d.e_factor} onChange={s("e_factor")} small center /></td>
                <td style={thC}>ALT</td><td style={tdL}><TxtIn value={d.e_alt} onChange={s("e_alt")} small center /></td>
                <td style={thC}>K</td><td style={tdL}><TxtIn value={d.e_k} onChange={s("e_k")} small center /></td>
                <td style={thC}>Po2</td><td style={tdL}><TxtIn value={d.e_po2} onChange={s("e_po2")} small center /></td>
                <td style={thC}>TSH</td><td style={tdL}><TxtIn value={d.e_tsh} onChange={s("e_tsh")} small center /></td>
                <td style={thC}>DENSIDAD</td><td style={tdL}><TxtIn value={d.e_densidad} onChange={s("e_densidad")} small center /></td>
              </tr>
              {/* Fila 3 */}
              <tr style={{ height: rowH }}>
                <td style={thC}>PLAQUETAS</td><td style={tdL}><TxtIn value={d.e_plaquetas} onChange={s("e_plaquetas")} small center /></td>
                <td style={thC}>QUÍMICA SANGUÍNEA</td><td style={tdL}><TxtIn value={d.e_quimica} onChange={s("e_quimica")} small center /></td>
                <td style={thC}>FA</td><td style={tdL}><TxtIn value={d.e_fa} onChange={s("e_fa")} small center /></td>
                <td style={thC}>Cl</td><td style={tdL}><TxtIn value={d.e_cl} onChange={s("e_cl")} small center /></td>
                <td style={thC}>PCO2</td><td style={tdL}><TxtIn value={d.e_pco2} onChange={s("e_pco2")} small center /></td>
                <td colSpan={2} style={{ ...tdLbl, textAlign: "center" }}>PRUEBA EMBARAZO</td>
                <td style={thC}>BACTERIAS</td><td style={tdL}><TxtIn value={d.e_bacterias} onChange={s("e_bacterias")} small center /></td>
              </tr>
              {/* Fila 4 */}
              <tr style={{ height: rowH }}>
                <td style={thC}>TP</td><td style={tdL}><TxtIn value={d.e_tp} onChange={s("e_tp")} small center /></td>
                <td style={thC}>GLUCOSA</td><td style={tdL}><TxtIn value={d.e_glucosa} onChange={s("e_glucosa")} small center /></td>
                <td style={thC}>LDH</td><td style={tdL}><TxtIn value={d.e_ldh} onChange={s("e_ldh")} small center /></td>
                <td style={thC}>Ca</td><td style={tdL}><TxtIn value={d.e_ca} onChange={s("e_ca")} small center /></td>
                <td style={thC}>HCO3</td><td style={tdL}><TxtIn value={d.e_hco3} onChange={s("e_hco3")} small center /></td>
                <td colSpan={2} style={tdL}>
                  <SiNo si={d.e_prueba_embarazo_si} no={d.e_prueba_embarazo_no}
                    onSi={() => setD(p => ({ ...p, e_prueba_embarazo_si: true, e_prueba_embarazo_no: false }))}
                    onNo={() => setD(p => ({ ...p, e_prueba_embarazo_no: true, e_prueba_embarazo_si: false }))} />
                </td>
                <td style={thC}>LEUCOCITOS</td><td style={tdL}><TxtIn value={d.e_leucocitos_orina} onChange={s("e_leucocitos_orina")} small center /></td>
              </tr>
              {/* Fila 5 */}
              <tr style={{ height: rowH }}>
                <td style={thC}>TTP</td><td style={tdL}><TxtIn value={d.e_ttp} onChange={s("e_ttp")} small center /></td>
                <td style={thC}>UREA</td><td style={tdL}><TxtIn value={d.e_urea} onChange={s("e_urea")} small center /></td>
                <td style={thC}>BT</td><td style={tdL}><TxtIn value={d.e_bt} onChange={s("e_bt")} small center /></td>
                <td style={thC}>Mg</td><td style={tdL}><TxtIn value={d.e_mg} onChange={s("e_mg")} small center /></td>
                <td style={thC}>EB</td><td style={tdL}><TxtIn value={d.e_eb} onChange={s("e_eb")} small center /></td>
                <td colSpan={2} style={{ ...tdL }}></td>
                <td style={thC}>PIOCITOS</td><td style={tdL}><TxtIn value={d.e_piocitos} onChange={s("e_piocitos")} small center /></td>
              </tr>
              {/* Fila 6 */}
              <tr style={{ height: rowH }}>
                <td style={thC}>INR</td><td style={tdL}><TxtIn value={d.e_inr} onChange={s("e_inr")} small center /></td>
                <td style={thC}>CREATININA</td><td style={tdL}><TxtIn value={d.e_creatinina} onChange={s("e_creatinina")} small center /></td>
                <td style={thC}>BD</td><td style={tdL}><TxtIn value={d.e_bd} onChange={s("e_bd")} small center /></td>
                <td colSpan={2} style={tdL}></td>
                <td style={thC}>SAT.02</td><td style={tdL}><TxtIn value={d.e_sat02_gas} onChange={s("e_sat02_gas")} small center /></td>
                <td colSpan={2} style={tdL}></td>
                <td style={thC}>HEMATÍES</td><td style={tdL}><TxtIn value={d.e_hematies} onChange={s("e_hematies")} small center /></td>
              </tr>
              {/* Fila 7 */}
              <tr style={{ height: rowH }}>
                <td style={thC}>LEUCOCITOS</td><td style={tdL}><TxtIn value={d.e_leucocitos} onChange={s("e_leucocitos")} small center /></td>
                <td style={thC}>OTROS:</td><td style={tdL}><TxtIn value={d.e_quimica} onChange={s("e_quimica")} small /></td>
                <td style={thC}>BI</td><td style={tdL}><TxtIn value={d.e_bi} onChange={s("e_bi")} small center /></td>
                <td colSpan={2} style={tdL}></td>
                <td style={thC}>LACTATO</td><td style={tdL}><TxtIn value={d.e_lactato} onChange={s("e_lactato")} small center /></td>
                <td colSpan={2} style={tdL}></td>
                <td style={thC}>GLUCOSA</td><td style={tdL}><TxtIn value={d.e_glucosa_orina} onChange={s("e_glucosa_orina")} small center /></td>
              </tr>
              {/* EKG, RX TÓRAX, ESPIROMETRÍA, OTROS */}
              {([
                { key: "e_ekg" as const, label: "EKG" },
                { key: "e_rx_torax" as const, label: "RX TÓRAX" },
                { key: "e_espirometria" as const, label: "ESPIROMETRÍA" },
                { key: "e_otros" as const, label: "OTROS" },
              ]).map(({ key, label }) => (
                <tr key={key} style={{ height: rowH }}>
                  <td colSpan={2} style={tdLbl}>{label}</td>
                  <td colSpan={12} style={tdL}><TxtIn value={d[key] as string} onChange={s(key)} small /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ F. ESCALAS E ÍNDICES ════════════════════════════════════════ */}
          <div style={{ ...secH({ marginTop: 5 }), display: "flex", alignItems: "center" }}>
            <span>F. ESCALAS E ÍNDICES</span>
            <span style={{ marginLeft: "auto", fontSize: "7px", fontWeight: 400, fontStyle: "italic" }}>(REGISTRAR LO QUE APLIQUE)</span>
          </div>
          <table style={tbl}>
            <tbody>
              <tr style={{ height: 26 }}>
                <td style={tdLbl}>ESTADO FÍSICO ASA</td>
                <td colSpan={6} style={tdL}>
                  <div style={{ display: "flex", width: "100%", justifyContent: "space-around" }}>
                    {(["I","II","III","IV","V","VI"] as const).map(v => (
                      <LabelRightCheck key={v} label={v} checked={d.f_asa === v} onCheck={() => setD(p => ({ ...p, f_asa: p.f_asa === v ? "" : v }))} />
                    ))}
                  </div>
                </td>
                <td style={tdLbl}>RIESGO CARDÍACO</td>
                <td style={tdL}><TxtIn value={d.f_riesgo_cardiaco} onChange={s("f_riesgo_cardiaco")} small /></td>
              </tr>
              <tr style={{ height: 26 }}>
                <td style={tdLbl}>RIESGO PULMONAR</td>
                <td colSpan={6} style={tdL}><TxtIn value={d.f_riesgo_pulmonar} onChange={s("f_riesgo_pulmonar")} small /></td>
                <td style={tdLbl}>RIESGO TROMBOEMBÓLICO</td>
                <td style={tdL}><TxtIn value={d.f_riesgo_tromboembolico} onChange={s("f_riesgo_tromboembolico")} small /></td>
              </tr>
              <tr style={{ height: 26 }}>
                <td style={tdLbl}>OTROS</td>
                <td colSpan={8} style={tdL}><TxtIn value={d.f_otros} onChange={s("f_otros")} small /></td>
              </tr>
            </tbody>
          </table>

          {/* ══ F. TIEMPO DE ÚLTIMA INGESTA ═════════════════════════════════ */}
          <div style={secH({ marginTop: 5 })}>F. TIEMPO DE ÚLTIMA INGESTA</div>
          <table style={tbl}>
            <tbody>
              <tr style={{ height: rowH }}>
                <td style={tdLbl}>LÍQUIDOS CLAROS</td>
                <td style={tdL}><TxtIn value={d.f_liquidos_claros} onChange={s("f_liquidos_claros")} small /></td>
                <td style={tdLbl}>LECHE DE FÓRMULA</td>
                <td style={tdL}><TxtIn value={d.f_leche_formula} onChange={s("f_leche_formula")} small /></td>
              </tr>
              <tr style={{ height: rowH }}>
                <td style={tdLbl}>LECHE MATERNA</td>
                <td style={tdL}><TxtIn value={d.f_leche_materna} onChange={s("f_leche_materna")} small /></td>
                <td style={tdLbl}>SÓLIDOS</td>
                <td style={tdL}><TxtIn value={d.f_solidos} onChange={s("f_solidos")} small /></td>
              </tr>
            </tbody>
          </table>

          {/* ══ G. INDICACIONES ═════════════════════════════════════════════ */}
          <div style={secH({ marginTop: 5 })}>G. INDICACIONES</div>
          <table style={tbl}>
            <tbody>
              {d.indicaciones.map((val, i) => (
                <tr key={i} style={{ height: rowH }}>
                  <td style={{ ...tdLbl, width: 22, textAlign: "center" }}>{i + 1}.</td>
                  <td style={tdL}><TxtIn value={val} onChange={(v) => setLines("indicaciones", i, v)} small /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ H. PLAN ANESTÉSICO ══════════════════════════════════════════ */}
          <div style={secH({ marginTop: 5 })}>H. PLAN ANESTÉSICO</div>
          <div style={{ border: B, minHeight: 56 }}>
            {area(d.plan_anestesico, s("plan_anestesico"), 3)}
          </div>

          {/* ══ I. OBSERVACIONES ════════════════════════════════════════════ */}
          <div style={secH({ marginTop: 5 })}>I. OBSERVACIONES</div>
          <div style={{ border: B, minHeight: 48 }}>
            {area(d.observaciones, s("observaciones"), 3)}
          </div>

          {/* ══ J. DATOS DEL PROFESIONAL RESPONSABLE ════════════════════════ */}
          <div style={{ ...secH({ marginTop: 5 }), display: "flex", alignItems: "center", gap: 8 }}>
            <span>J. DATOS DEL PROFESIONAL RESPONSABLE</span>
            <BotonBuscarProfesional onSelect={(m) => {
              const partes = parseNombresMedico(m.nombre);
              s("j_primer_nombre")(partes.nombres);
              s("j_primer_apellido")(partes.primerApellido);
              s("j_segundo_apellido")(partes.segundoApellido);
              s("j_documento")(m.identificacion);
            }} />
          </div>
          <table style={tbl}>
            <tbody>
              <tr>
                <td style={{ ...tdLbl, width: 110 }}>FECHA (aaaa-mm-dd)</td>
                <td style={{ ...tdLbl, width: 80 }}>HORA (hh:mm)</td>
                <td style={tdLbl}>PRIMER NOMBRE</td>
                <td style={tdLbl}>PRIMER APELLIDO</td>
                <td style={tdLbl}>SEGUNDOAPELLIDO</td>
              </tr>
              <tr style={{ height: rowH }}>
                <td style={tdL}>
                  <input type="date" value={d.j_fecha} onChange={(e) => s("j_fecha")(e.target.value)}
                    style={{ border: "none", outline: "none", fontSize: "9px", padding: "2px 3px", width: "100%", fontFamily: "Arial, sans-serif" }} />
                </td>
                <td style={tdL}>
                  <input type="time" value={d.j_hora} onChange={(e) => s("j_hora")(e.target.value)}
                    style={{ border: "none", outline: "none", fontSize: "9px", padding: "2px 3px", width: "100%", fontFamily: "Arial, sans-serif" }} />
                </td>
                <td style={tdL}><TxtIn value={d.j_primer_nombre} onChange={s("j_primer_nombre")} small /></td>
                <td style={tdL}><TxtIn value={d.j_primer_apellido} onChange={s("j_primer_apellido")} small /></td>
                <td style={tdL}><TxtIn value={d.j_segundo_apellido} onChange={s("j_segundo_apellido")} small /></td>
              </tr>
              <tr>
                <td style={tdLbl}>NÚMERO DE DOCUMENTO DE IDENTIFICACIÓN</td>
                <td colSpan={2} style={{ ...tdLbl, textAlign: "center" }}>FIRMA</td>
                <td colSpan={2} style={{ ...tdLbl, textAlign: "center" }}>SELLO</td>
              </tr>
              <tr style={{ height: 36 }}>
                <td style={tdL}><TxtIn value={d.j_documento} onChange={s("j_documento")} small /></td>
                <td colSpan={2} style={{ ...tdL, background: "#f8f8f8", textAlign: "center" }}>
                  <span style={{ fontSize: "8px", color: "#aaa", fontStyle: "italic" }}>(firma en documento impreso)</span>
                </td>
                <td colSpan={2} style={{ ...tdL, background: "#f8f8f8", textAlign: "center" }}>
                  <span style={{ fontSize: "8px", color: "#aaa", fontStyle: "italic" }}>(sello en documento impreso)</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Pie hoja 2 */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderTop: B, marginTop: 6 }}>
            <span style={{ fontSize: "8px", color: "#555", fontFamily: "Arial, sans-serif" }}>SNS-MSP/HCU-form.018/2021</span>
            <span style={{ fontSize: "9px", fontWeight: 700, color: "#1a3a5c", fontFamily: "Arial, sans-serif" }}>PRE ANESTÉSICO (2)</span>
          </div>

        </div>
      </div>

      <div style={{ overflowX: "visible", overflowY: "visible", background: "#fff", display: hoja === "TRANSANASTÉSICO" ? "block" : "none" }}>
        <TransanestesicoForm d={d} setD={setD} />
      </div>

      <div style={{ overflowX: "visible", overflowY: "visible", background: "#fff", display: hoja === "TRANSANASTÉSICO (2)" ? "block" : "none" }}>
        <TransanestesicoForm2 d={d} setD={setD} />
      </div>

    </div>
  );
});
AnestesiologiaForm.displayName = "AnestesiologiaForm";
export default AnestesiologiaForm;

const ROW_H = 20;

function Chk({ checked, onChange, label }: {
  checked: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 2, cursor: "pointer", fontSize: "7.5px", fontFamily: "Arial, sans-serif", whiteSpace: "nowrap" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 9, height: 9 }} />
      {label}
    </label>
  );
}

function RadioBtn({ checked, onCheck, label }: { checked: boolean; onCheck: () => void; label: string }) {
  return (
    <td style={{ ...tdL, textAlign: "center", cursor: "pointer", background: checked ? "#b8d4ec" : "#fff", padding: "1px 4px" }}
      onClick={onCheck}>
      <span style={{ fontSize: "7.5px", fontWeight: checked ? 700 : 400, fontFamily: "Arial, sans-serif" }}>
        {checked ? "✔ " : ""}{label}
      </span>
    </td>
  );
}

export function TransanestesicoForm({ d, setD }: { d: DatosAnestesia, setD: React.Dispatch<React.SetStateAction<DatosAnestesia>> }) {
  const s = (k: string) => (v: string) => setD((p: any) => ({ ...p, [k]: v }));
  const c = (k: string) => (v: boolean) => setD((p: any) => ({ ...p, [k]: v }));
  const toggle = (k: string) => () => setD((p: any) => ({ ...p, [k]: !p[k] }));

  const setDroga = (i: number, campo: "droga" | "dosis", v: string) =>
    setD((p: any) => { 
      const dr = [...(p.drogas || [])]; 
      dr[i] = { numero: String(i + 1), droga: "", dosis: "", ...(dr[i] || {}), [campo]: v }; 
      return { ...p, drogas: dr }; 
    });

  const setVia = (i: number, tipoLabel: string, campo: "calibre" | "sitio", v: string) =>
    setD((p: any) => { 
      const vias = [...(p.g_vias || [])]; 
      vias[i] = { tipo: tipoLabel, calibre: "", sitio: "", ...(vias[i] || {}), [campo]: v }; 
      return { ...p, g_vias: vias }; 
    });

  // Grilla temporal (columnas de tiempo cada ~5 min, 45 columnas)
  const TIME_COLS = 45;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      {/* ── Formulario — orientación horizontal ────────────────────────── */}
      <div style={{ overflowX: "auto", background: "#fff" }}>
        <div style={{ padding: "6px 8px", minWidth: 1300, fontFamily: "Arial, sans-serif" }}>

          {/* ══ A. DATOS DEL ESTABLECIMIENTO Y USUARIO ════════════════════ */}
          <div style={secH()}>A. DATOS DEL ESTABLECIMIENTO Y USUARIO</div>
          <table style={tbl}>
            <tbody>
              <tr>
                <td style={tdLbl}>INSTITUCIÓN DEL SISTEMA</td>
                <td colSpan={3} style={tdLbl}>ESTABLECIMIENTO DE SALUD</td>
                <td colSpan={2} style={tdLbl}>NÚMERO DE HISTORIA CLÍNICA ÚNICA</td>
                <td style={tdLbl}>NÚMERO DE ARCHIVO</td>
              </tr>
              <tr style={{ height: ROW_H }}>
                <td style={{ ...tdL, width: 120 }}><TxtIn value={d.institucion} onChange={s("institucion")} /></td>
                <td colSpan={3} style={tdL}><TxtIn value={d.establecimiento} onChange={s("establecimiento")} /></td>
                <td colSpan={2} style={{ ...tdL, width: 180 }}><TxtIn value={d.numero_historia_clinica} onChange={s("numero_historia_clinica")} center /></td>
                <td style={{ ...tdL, width: 120 }}><TxtIn value={d.numero_archivo} onChange={s("numero_archivo")} center /></td>
              </tr>
              <tr>
                <td style={tdLbl}>PRIMER APELLIDO</td>
                <td style={tdLbl}>SEGUNDO APELLIDO</td>
                <td style={tdLbl}>PRIMER NOMBRE</td>
                <td style={tdLbl}>SEGUNDO NOMBRE</td>
                <td style={tdLbl}>SEXO</td>
                <td style={tdLbl}>EDAD</td>
                <td style={{ ...tdLbl, textAlign: "center" }}>CONDICIÓN EDAD</td>
              </tr>
              <tr style={{ height: ROW_H }}>
                <td style={tdL}><TxtIn value={d.primer_apellido} onChange={s("primer_apellido")} /></td>
                <td style={tdL}><TxtIn value={d.segundo_apellido} onChange={s("segundo_apellido")} /></td>
                <td style={tdL}><TxtIn value={d.primer_nombre} onChange={s("primer_nombre")} /></td>
                <td style={tdL}><TxtIn value={d.segundo_nombre} onChange={s("segundo_nombre")} /></td>
                <td style={{ ...tdL, width: 50 }}><TxtIn value={d.sexo} onChange={s("sexo")} center /></td>
                <td style={{ ...tdL, width: 50 }}><TxtIn value={d.edad} onChange={s("edad")} center /></td>
                <td style={tdL}>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", padding: "2px" }}>
                    {(["H","D","M","A"] as const).map(op => (
                      <label key={op} style={{ display: "flex", alignItems: "center", gap: 1, fontSize: "7.5px", cursor: "pointer", fontFamily: "Arial, sans-serif" }}>
                        <input type="radio" name="trans_condicion_edad" value={op}
                          checked={d.condicion_edad === op}
                          onChange={() => setD(p => ({ ...p, condicion_edad: op }))}
                          style={{ width: 9, height: 9 }} />
                        {op}
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
              <tr>
                <td style={tdLbl}>FECHA</td>
                <td style={tdLbl}>TALLA (cm)</td>
                <td style={tdLbl}>PESO (kg)</td>
                <td style={tdLbl}>IMC</td>
                <td colSpan={2} style={tdLbl}>GRUPO Y FACTOR</td>
                <td style={tdLbl}>CONSENTIMIENTO INFORMADO</td>
              </tr>
              <tr style={{ height: ROW_H }}>
                <td style={tdL}>
                  <input type="date" value={d.fecha} onChange={(e) => s("fecha")(e.target.value)}
                    style={{ border: "none", outline: "none", fontSize: "9px", padding: "1px 3px", width: "100%", fontFamily: "Arial, sans-serif" }} />
                </td>
                <td style={tdL}><TxtIn value={d.talla} onChange={s("talla")} center /></td>
                <td style={tdL}><TxtIn value={d.peso} onChange={s("peso")} center /></td>
                <td style={tdL}><TxtIn value={d.imc} onChange={s("imc")} center /></td>
                <td colSpan={2} style={tdL}><TxtIn value={d.grupo_factor} onChange={s("grupo_factor")} center /></td>
                <td style={tdL}>
                  <SiNo si={d.consentimiento_informado_si} no={d.consentimiento_informado_no}
                    onSi={() => setD(p => ({ ...p, consentimiento_informado_si: true, consentimiento_informado_no: false }))}
                    onNo={() => setD(p => ({ ...p, consentimiento_informado_no: true, consentimiento_informado_si: false }))} />
                </td>
              </tr>
            </tbody>
          </table>

          {/* ══ B. SERVICIO Y PRIORIDAD DE ATENCIÓN ══════════════════════ */}
          <div style={secH({ marginTop: 4 })}>B. SERVICIO Y PRIORIDAD DE ATENCIÓN</div>
          {/* Sub-tabla 1: Diagnósticos y Cirugías */}
          <table style={{ ...tbl, borderBottom: "none", tableLayout: "fixed" }}>
            <tbody>
              <tr style={{ height: ROW_H }}>
                <td style={{ ...tdLbl, width: "16%" }}>DIAGNÓSTICO PREOPERATORIO</td>
                <td style={{ ...tdL, width: "17%" }}>
                  <Cie10DescInput
                    descripcion={d.b_diagnostico_prequirurgico}
                    cie={d.b_cie}
                    onChange={(cie, descripcion) => {
                      s("b_diagnostico_prequirurgico")(descripcion);
                      s("b_cie")(cie);
                    }}
                  />
                </td>
                <td style={{ ...tdLbl, width: "4%" }}>CIE</td>
                <td style={{ ...tdL, width: "6%" }}>
                  <Cie10CieInput
                    descripcion={d.b_diagnostico_prequirurgico}
                    cie={d.b_cie}
                    onChange={(cie, descripcion) => {
                      s("b_diagnostico_prequirurgico")(descripcion);
                      s("b_cie")(cie);
                    }}
                  />
                </td>
                <td style={{ ...tdLbl, width: "13%" }}>CIRUGÍA PROPUESTA</td>
                <td style={{ ...tdL, width: "15%" }}><TxtIn value={d.b_cirugia_propuesta} onChange={s("b_cirugia_propuesta")} /></td>
                <td style={{ ...tdLbl, width: "10%" }}>ESPECIALIDAD</td>
                <td style={{ ...tdL, width: "10%" }}><TxtIn value={d.b_especialidad} onChange={s("b_especialidad")} /></td>
                <td style={{ ...tdLbl, width: "6%" }}>EMERGENTE</td>
                <td style={{ ...tdL, width: "3%", textAlign: "center" }}>
                  <input type="checkbox" checked={d.b_prioridad_emergencia} onChange={(e) => c("b_prioridad_emergencia")(e.target.checked)} style={{ margin: 0, cursor: "pointer" }} />
                </td>
              </tr>
              <tr style={{ height: ROW_H }}>
                <td style={tdLbl}>DIAGNÓSTICO POSTOPERATORIO</td>
                <td style={tdL}>
                  <Cie10DescInput
                    descripcion={d.b_diagnostico_postquirurgico}
                    cie={d.b_cie_2 || ""}
                    onChange={(cie, descripcion) => {
                      s("b_diagnostico_postquirurgico")(descripcion);
                      s("b_cie_2")(cie);
                    }}
                  />
                </td>
                <td style={tdLbl}>CIE</td>
                <td style={tdL}>
                  <Cie10CieInput
                    descripcion={d.b_diagnostico_postquirurgico}
                    cie={d.b_cie_2 || ""}
                    onChange={(cie, descripcion) => {
                      s("b_diagnostico_postquirurgico")(descripcion);
                      s("b_cie_2")(cie);
                    }}
                  />
                </td>
                <td style={tdLbl}>CIRUGÍA REALIZADA</td>
                <td style={tdL}><TxtIn value={d.b_cirugia_realizada} onChange={s("b_cirugia_realizada")} /></td>
                <td style={tdLbl}>QUIRÓFANO</td>
                <td style={tdL}><TxtIn value={d.b_quirofano} onChange={s("b_quirofano")} /></td>
                <td style={tdLbl}>URGENTE</td>
                <td style={{ ...tdL, textAlign: "center" }}>
                  <input type="checkbox" checked={d.b_prioridad_urgencia} onChange={(e) => c("b_prioridad_urgencia")(e.target.checked)} style={{ margin: 0, cursor: "pointer" }} />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Sub-tabla 2: Personal */}
          <table style={{ ...tbl, borderTop: "none", borderBottom: "none", tableLayout: "fixed" }}>
            <tbody>
              <tr style={{ height: ROW_H }}>
                <td style={{ ...tdLbl, width: "12%", borderTop: "none" }}>ANESTESIÓLOGO</td>
                <td style={{ ...tdL, width: "14%", borderTop: "none" }}><TxtIn value={d.b_anestesiologo} onChange={s("b_anestesiologo")} /></td>
                <td style={{ ...tdLbl, width: "10%", borderTop: "none" }}>AYUDANTE (S)</td>
                <td style={{ ...tdL, width: "25%", borderTop: "none" }}><TxtIn value={d.b_ayudante_anestesia} onChange={s("b_ayudante_anestesia")} /></td>
                <td style={{ ...tdLbl, width: "12%", borderTop: "none" }}>INSTRUMENTISTA</td>
                <td style={{ ...tdL, width: "14%", borderTop: "none" }}><TxtIn value={d.b_instrumentista} onChange={s("b_instrumentista")} /></td>
                <td rowSpan={2} style={{ ...tdLbl, width: "5%", textAlign: "center", borderTop: "none" }}>PRIORIDAD</td>
                <td style={{ ...tdLbl, width: "5%", borderTop: "none" }}>ELECTIVO</td>
                <td style={{ ...tdL, width: "3%", textAlign: "center", borderTop: "none" }}>
                  <input type="checkbox" checked={d.b_prioridad_electiva} onChange={(e) => c("b_prioridad_electiva")(e.target.checked)} style={{ margin: 0, cursor: "pointer" }} />
                </td>
              </tr>
              <tr style={{ height: ROW_H }}>
                <td style={tdLbl}>CIRUJANO</td>
                <td style={tdL}><TxtIn value={d.b_cirujano} onChange={s("b_cirujano")} /></td>
                <td style={tdLbl}>AYUDANTE (S)</td>
                <td style={tdL}><TxtIn value={d.b_cirujano2} onChange={s("b_cirujano2")} /></td>
                <td style={tdLbl}>CIRCULANTE</td>
                <td style={tdL}><TxtIn value={d.b_circulante} onChange={s("b_circulante")} /></td>
                <td colSpan={2} style={tdL}></td>
              </tr>
            </tbody>
          </table>

          {/* Sub-tabla 3: OTROS */}
          <table style={{ ...tbl, borderTop: "none", tableLayout: "fixed" }}>
            <tbody>
              <tr style={{ height: ROW_H }}>
                <td style={{ ...tdLbl, width: "12%", borderTop: "none" }}>OTROS</td>
                <td style={{ ...tdL, width: "88%", borderTop: "none" }}><TxtIn value={d.b_otros} onChange={s("b_otros")} /></td>
              </tr>
            </tbody>
          </table>

          {/* ══ C. REGIÓN OPERATORIA ══════════════════════════════════════ */}
          <div style={secH({ marginTop: 4 })}>C. REGIÓN OPERATORIA</div>
          <table style={tbl}>
            <tbody>
              <tr style={{ height: ROW_H }}>
                {[
                  { key: "c_cabeza" as const,                  label: "CABEZA" },
                  { key: "c_organos" as const,                 label: "ÓRGANOS" },
                  { key: "c_cuello" as const,                  label: "CUELLO" },
                  { key: "c_columna" as const,                 label: "COLUMNA" },
                  { key: "c_torax" as const,                   label: "TÓRAX" },
                  { key: "c_abdomen" as const,                 label: "ABDOMEN" },
                  { key: "c_pelvis" as const,                  label: "PELVIS" },
                  { key: "c_extremidades_superiores" as const, label: "EXTREMIDADES SUPERIORES" },
                  { key: "c_extremidades_inferiores" as const, label: "EXTREMIDADES INFERIORES" },
                  { key: "c_perineal" as const,                label: "PERINEAL" },
                ].map(({ key, label }) => (
                  <td key={key} style={{ ...tdL, textAlign: "center", padding: "2px 4px" }}>
                    <Chk checked={d[key] as boolean} onChange={c(key)} label={label} />
                  </td>
                ))}
              </tr>
              <tr style={{ height: ROW_H }}>
                <td style={{ ...tdLbl, width: "10%", textAlign: "center" }}>OTROS</td>
                <td colSpan={9} style={tdL}>
                  <TxtIn value={d.c_otros} onChange={s("c_otros")} />
                </td>
              </tr>
            </tbody>
          </table>

          {/* ══ D. REGISTRO TRANSANESTÉSICO ═══════════════════════════════ */}
          <div style={secH({ marginTop: 4 })}>D. REGISTRO TRANSANESTÉSICO</div>

          <div style={{ overflowX: "auto", border: B }}>
            <table style={{ ...tbl, tableLayout: "fixed", width: "100%", minWidth: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {/* 0. DUMMY ROW FOR EXACT COLUMN WIDTHS */}
                <tr style={{ height: 0, visibility: "hidden" }}>
                  <td style={{ width: 180, padding: 0, border: "none" }} />
                  <td style={{ width: 12, padding: 0, border: "none" }} />
                  <td style={{ width: 12, padding: 0, border: "none" }} />
                  <td style={{ width: 14, padding: 0, border: "none" }} />
                  {Array(108).fill(0).map((_, i) => <td key={i} style={{ padding: 0, border: "none" }} />)}
                </tr>

                {/* 1. AGENTE INHALATORIO */}
                <tr style={{ height: 14 }}>
                  <td colSpan={4} style={{ ...tdLbl, borderRight: B, fontSize: "7px" }}>AGENTE INHALATORIO / INFUSIÓN CONTINUA</td>
                  <td colSpan={108} style={{ padding: 0, borderBottom: B }}>
                    <div style={{ display: "flex", width: "100%", height: "100%" }}>
                      {Array(36).fill(0).map((_, i) => {
                        let num = "";
                        if (i % 4 === 0) num = "15";
                        else if (i % 4 === 1) num = "30";
                        else if (i % 4 === 2) num = "45";
                        return (
                          <div key={i} style={{ flex: 1, position: "relative" }}>
                            {num && <span style={{ position: "absolute", right: 0, bottom: -2, transform: "translateX(50%)", fontSize: "6px", color: "#1a3a5c", fontWeight: "bold" }}>{num}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
                {[1, 2, 3, 4, 5, 6].map(r => (
                  <tr key={`agente_${r}`} style={{ height: 14 }}>
                    <td colSpan={4} style={{ ...tdL, borderRight: B }}>
                      <input type="text" value={(d.d_grid || {})[`agente_txt_${r}`] || ""} onChange={(e) => {
                        const v = e.target.value;
                        setD(p => ({ ...p, d_grid: { ...(p.d_grid || {}), [`agente_txt_${r}`]: v } }));
                      }} style={{ width: "100%", height: "100%", border: "none", outline: "none", fontSize: "7px", background: "transparent" }} />
                    </td>
                    {Array(36).fill(0).map((_, i) => {
                      const k = `agente_${r}_${i}`;
                      const active = (d.d_grid || {})[k];
                      return (
                        <td key={i} colSpan={3} onClick={() => {
                          setD(p => {
                            const grid = { ...(p.d_grid || {}) };
                            if (grid[k]) delete grid[k]; else grid[k] = "1";
                            return { ...p, d_grid: grid };
                          });
                        }} style={{ ...tdL, cursor: "pointer", background: active ? "#1a3a5c" : "transparent", borderRight: (i % 4 === 3) ? "1.5px solid #1a3a5c" : B }} />
                      );
                    })}
                  </tr>
                ))}

                {/* 2. PARAMETROS DE MONITOREO */}
                <tr style={{ height: 14, borderTop: "1.5px solid #1a3a5c" }}>
                  <td colSpan={4} style={{ ...tdLbl, borderRight: B, fontSize: "7px" }}>PARAMETROS DE MONITOREO ANESTESICO</td>
                  <td colSpan={108} style={{ ...tdL, background: "#fff", borderRight: B }}></td>
                </tr>
                {["ONDA DELTA PP", "SATURACIÓN O2", "CAPNOMETRÍA", "RELAJACIÓN NEUROMUSCULAR", "PROFUNDIDAD ANESTÉSICA"].map((lbl, r) => (
                  <tr key={`param_${r+1}`} style={{ height: 14 }}>
                    <td colSpan={4} style={{ ...tdLbl, borderRight: B, textAlign: "right", paddingRight: 4, fontSize: "6.5px" }}>{lbl}</td>
                    {Array(36).fill(0).map((_, i) => {
                      const k = `param_${r+1}_${i}`;
                      const active = (d.d_grid || {})[k];
                      return (
                        <td key={i} colSpan={3} onClick={() => {
                          setD(p => {
                            const grid = { ...(p.d_grid || {}) };
                            if (grid[k]) delete grid[k]; else grid[k] = "1";
                            return { ...p, d_grid: grid };
                          });
                        }} style={{ ...tdL, cursor: "pointer", background: active ? "#1a3a5c" : "transparent", borderRight: (i % 4 === 3) ? "1.5px solid #1a3a5c" : B }} />
                      );
                    })}
                  </tr>
                ))}

                {/* 3. SIMBOLOGÍA / ESCALAS HEADER */}
                <tr style={{ height: 14, borderTop: "1.5px solid #1a3a5c" }}>
                  <td rowSpan={28} style={{ borderRight: B, verticalAlign: "top", padding: "2px 4px", background: "#fff" }}>
                    <div style={{ ...secH({ border: "none", background: "transparent" }), textAlign: "center", marginBottom: 4, fontSize: "8px" }}>SISMOLOGÍA</div>
                    
                    <div style={{ display: "flex", fontSize: "6px" }}>
                       <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                          {[
                            "INICIO ANESTESIA",
                            "INDUCCIÓN",
                            "INICIO CIRUGÍA",
                            "FIN DE CIRUGÍA",
                            "FIN DE ANESTESIA",
                            "TAS",
                            "TAD",
                            "TAM",
                            "FRECUENCIA CARDÍACA",
                            "TEMPERATURA",
                            "PVC",
                            "RESPIRACIÓN ESPONTÁNEA",
                            "RESPIRACIÓN ASISTIDA",
                            "RESPIRACIÓN CONTROLADA",
                            "TORNIQUETE",
                            "FETO"
                          ].map((name, idx) => (
                            <div key={idx} style={{ display: "flex", fontWeight: 700 }}>
                              <span>{name}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  </td>
                  <td style={{ ...tdC, borderRight: B, fontSize: "5px", padding: 0 }}>Tº</td>
                  <td style={{ ...tdC, borderRight: B, fontSize: "5px", padding: 0 }}>PV</td>
                  <td style={{ ...tdC, borderRight: B, fontSize: "4.5px", lineHeight: "5px", padding: 0 }}>TA /<br/>P /<br/>R</td>
                  <td colSpan={108} style={{ padding: 0, borderBottom: B }}>
                    <div style={{ display: "flex", width: "100%", height: "100%" }}>
                      {Array(36).fill(0).map((_, i) => {
                        let num = "";
                        if (i % 4 === 0) num = "15";
                        else if (i % 4 === 1) num = "30";
                        else if (i % 4 === 2) num = "45";
                        return (
                          <div key={i} style={{ flex: 1, position: "relative" }}>
                            {num && <span style={{ position: "absolute", right: 0, bottom: -2, transform: "translateX(50%)", fontSize: "6px", color: "#1a3a5c", fontWeight: "bold" }}>{num}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>

                {Array.from({ length: 27 }).map((_, r) => {
                  const scaleTA = ["240", "", "220", "", "200", "", "180", "", "160", "", "140", "", "120", "", "100", "", "80", "", "60", "", "40", "", "20", "", "0", "", ""];
                  const scalePV = ["", "", "", "", "", "", "", "17", "", "15", "", "13", "", "11", "", "9", "", "7", "", "5", "", "3", "", "1", "", "", ""];
                  const scaleT  = ["", "", "", "", "", "", "", "", "", "42", "", "41", "", "40", "", "39", "", "38", "", "37", "", "36", "", "35", "", "", ""];
                  
                  return (
                    <tr key={`sismo_${r}`} style={{ height: 12 }}>
                      <td style={{ ...tdC, borderRight: B, fontSize: "5px", padding: 0 }}>{scaleT[r]}</td>
                      <td style={{ ...tdC, borderRight: B, fontSize: "5px", padding: 0 }}>{scalePV[r]}</td>
                      <td style={{ ...tdC, borderRight: B, fontSize: "5px", padding: 0 }}>{scaleTA[r]}</td>
                      {Array(108).fill(0).map((_, i) => {
                        const k = `sismo_${r}_${i}`;
                        const active = (d.d_grid || {})[k];
                        return (
                          <td key={i} onClick={() => {
                            setD(p => {
                              const grid = { ...(p.d_grid || {}) };
                              if (grid[k]) delete grid[k]; else grid[k] = "1";
                              return { ...p, d_grid: grid };
                            });
                          }} style={{ ...tdL, cursor: "pointer", background: active ? "#1a3a5c" : "transparent", borderRight: (i % 12 === 11) ? "1.5px solid #1a3a5c" : B, borderBottom: r === 14 ? "1.5px solid #1a3a5c" : B }} />
                        );
                      })}
                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>

          {/* ══ E. DROGAS ADMINISTRADAS (listado) ════════════════════════ */}
          <div style={secH({ marginTop: 4 })}>E. DROGAS ADMINISTRADAS</div>
          <div style={{ display: "grid", gridTemplateRows: "repeat(4, 1fr)", gridAutoFlow: "column", gap: 0, border: B, borderRight: "none", borderBottom: "none" }}>
            {Array.from({ length: 24 }).map((_, i) => {
              const dr = d.drogas?.[i] || { droga: "" };
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", borderRight: B, borderBottom: B }}>
                  <span style={{ ...tdLbl, border: "none", minWidth: 18, textAlign: "center", borderRight: B }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <TxtIn value={dr.droga} onChange={(v) => setDroga(i, "droga", v)} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ══ F. TÉCNICA ANESTÉSICA ═════════════════════════════════════ */}
          <div style={secH({ marginTop: 4 })}>F. TÉCNICA ANESTÉSICA</div>
          <div style={{ display: "flex", gap: 0, border: B }}>
            
            {/* ===================== GENERAL ===================== */}
            <div style={{ borderRight: B, flex: "0 0 42%", display: "flex", flexDirection: "column" }}>
              <div style={{ ...thC, textAlign: "center", borderBottom: B }}>GENERAL</div>
              
              {/* SISTEMA / APARATO Header */}
              <div style={{ display: "flex", borderBottom: B }}>
                <div style={{ ...thC, flex: "0 0 55%", textAlign: "center", borderRight: B }}>SISTEMA</div>
                <div style={{ ...thC, flex: "0 0 45%", textAlign: "center" }}>APARATO</div>
              </div>
              
              {/* SISTEMA / APARATO Content */}
              <div style={{ display: "flex", borderBottom: B }}>
                <div style={{ flex: "0 0 55%", display: "flex", borderRight: B }}>
                  <div style={{ flex: 1, ...tdL, padding: "1px 2px", borderRight: B, textAlign: "center" }}><Chk checked={d.f_sistema_abierto} onChange={c("f_sistema_abierto")} label="ABIERTO" /></div>
                  <div style={{ flex: 1, ...tdL, padding: "1px 2px", borderRight: B, textAlign: "center" }}><Chk checked={d.f_sistema_semiabierto} onChange={c("f_sistema_semiabierto")} label="SEMICERRADO" /></div>
                  <div style={{ flex: 1, ...tdL, padding: "1px 2px", textAlign: "center" }}><Chk checked={d.f_sistema_cerrado} onChange={c("f_sistema_cerrado")} label="CERRADO" /></div>
                </div>
                <div style={{ flex: "0 0 45%", display: "flex" }}>
                  <div style={{ flex: 1, ...tdL, padding: "1px 2px", borderRight: B, textAlign: "center" }}><Chk checked={d.f_circuito_circular} onChange={c("f_circuito_circular")} label="CIRCUITO CIRCULAR" /></div>
                  <div style={{ flex: 1, ...tdL, padding: "1px 2px", textAlign: "center" }}><Chk checked={d.f_unidireccional} onChange={c("f_unidireccional")} label="UNIDIRECCIONAL" /></div>
                </div>
              </div>

              {/* MANEJO DE VIA AEREA Header */}
              <div style={{ ...thC, textAlign: "center", borderBottom: B }}>MANEJO DE VIA AEREA</div>
              
              {/* MANEJO DE VIA AEREA Content */}
              <div style={{ display: "flex", borderBottom: B }}>
                <div style={{ flex: 1, ...tdL, padding: "1px 2px", borderRight: B, textAlign: "center" }}><Chk checked={d.f_mascara_facial} onChange={c("f_mascara_facial")} label="MASCARA FACIAL" /></div>
                <div style={{ flex: 1, ...tdL, padding: "1px 2px", borderRight: B, textAlign: "center" }}><Chk checked={d.f_supraglotica} onChange={c("f_supraglotica")} label="SUPRAGLOTICA" /></div>
                <div style={{ flex: 1, ...tdL, padding: "1px 2px", textAlign: "center" }}><Chk checked={d.f_traqueotomia} onChange={c("f_traqueotomia")} label="TRAQUEOTOMO" /></div>
              </div>

              {/* INTUBACION Header */}
              <div style={{ ...thC, textAlign: "center", borderBottom: B }}>INTUBACION</div>

              {/* INTUBACION Content */}
              <div style={{ display: "flex", borderBottom: B }}>
                <div style={{ flex: 1, ...tdL, padding: "1px 2px", borderRight: B, textAlign: "center" }}><Chk checked={d.f_intubacion_nasal} onChange={c("f_intubacion_nasal")} label="NASAL" /></div>
                <div style={{ flex: 1, ...tdL, padding: "1px 2px", borderRight: B, textAlign: "center" }}><Chk checked={d.f_intubacion_oral} onChange={c("f_intubacion_oral")} label="ORAL" /></div>
                <div style={{ flex: 1, ...tdL, padding: "1px 2px", borderRight: B, textAlign: "center" }}><Chk checked={d.f_intubacion_submentoniana} onChange={c("f_intubacion_submentoniana")} label="SUBMENTONEANA" /></div>
                <div style={{ flex: 1, ...tdL, padding: "1px 2px", borderRight: B, textAlign: "center" }}><Chk checked={d.f_vision_directa} onChange={c("f_vision_directa")} label="VISION DIRECTA" /></div>
                <div style={{ flex: 1, ...tdL, padding: "1px 2px", textAlign: "center" }}><Chk checked={d.f_a_ciegas} onChange={c("f_a_ciegas")} label="A CIEGAS" /></div>
              </div>

              {/* TIPO DE TUBO Header */}
              <div style={{ ...thC, textAlign: "center", borderBottom: B }}>TIPO DE TUBO</div>

              {/* TIPO DE TUBO Content */}
              <div style={{ display: "flex", borderBottom: B }}>
                <div style={{ flex: 1, ...tdL, padding: "1px 2px", borderRight: B, textAlign: "center" }}><Chk checked={d.f_tubo_convencional} onChange={c("f_tubo_convencional")} label="CONVENCIONAL" /></div>
                <div style={{ flex: 1.2, ...tdL, padding: "1px 2px", borderRight: B, textAlign: "center" }}><Chk checked={d.f_tubo_preformado_oral} onChange={c("f_tubo_preformado_oral")} label="PREFORMADO ORAL" /></div>
                <div style={{ flex: 1.2, ...tdL, padding: "1px 2px", borderRight: B, textAlign: "center" }}><Chk checked={d.f_tubo_preformado_nasal} onChange={c("f_tubo_preformado_nasal")} label="PREFORMADO NASAL" /></div>
                <div style={{ flex: 1, ...tdL, padding: "1px 2px", textAlign: "center" }}><Chk checked={d.f_tubo_reforzado} onChange={c("f_tubo_reforzado")} label="REFORZADO" /></div>
              </div>
              
              <div style={{ display: "flex", borderBottom: B }}>
                <div style={{ flex: 1, ...tdL, padding: "1px 2px", borderRight: B, textAlign: "center" }}><Chk checked={d.f_tubo_doble_luz} onChange={c("f_tubo_doble_luz")} label="DOBLE LUMEN" /></div>
                <div style={{ flex: 1.2, ...tdL, padding: "1px 2px", borderRight: B, display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: "7px", fontWeight: "bold", color: "#1a3a5c", marginRight: 4 }}>DIAMETRO</span>
                  <div style={{ flex: 1 }}><TxtIn value={d.f_tubo_diametro} onChange={s("f_tubo_diametro")} center /></div>
                </div>
                <div style={{ flex: 1, ...tdL, padding: "1px 2px", borderRight: B, display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: "7px", fontWeight: "bold", color: "#1a3a5c", marginRight: 4 }}>BALON</span>
                  <div style={{ flex: 1, display: "flex", gap: 4 }}>
                    <Chk checked={d.f_tubo_balon_si} onChange={c("f_tubo_balon_si")} label="SI" />
                    <Chk checked={d.f_tubo_balon_no} onChange={c("f_tubo_balon_no")} label="NO" />
                  </div>
                </div>
                <div style={{ flex: 1, ...tdL, padding: "1px 2px", display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: "7px", fontWeight: "bold", color: "#1a3a5c", marginRight: 4 }}>TAPONAMIENTO</span>
                  <div style={{ flex: 1, display: "flex", gap: 4 }}>
                    <Chk checked={d.f_taponamiento_si} onChange={c("f_taponamiento_si")} label="SI" />
                    <Chk checked={d.f_taponamiento_no} onChange={c("f_taponamiento_no")} label="NO" />
                  </div>
                </div>
              </div>

              {/* EQUIPO PARA INTUBACION */}
              <div style={{ ...thC, textAlign: "center", borderBottom: B }}>EQUIPO PARA INTUBACION</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", borderBottom: B }}>
                  <div style={{ flex: "0 0 20%", ...tdL, borderRight: B, textAlign: "center" }}>
                    <span style={{ fontSize: "7px", fontWeight: "bold", color: "#1a3a5c" }}>CORMACK</span>
                  </div>
                  <div style={{ flex: 1, display: "flex" }}>
                    <div style={{ flex: 1, ...tdL, borderRight: B, textAlign: "center" }}><Chk checked={d.f_cormack_1} onChange={c("f_cormack_1")} label="I" /></div>
                    <div style={{ flex: 1, ...tdL, borderRight: B, textAlign: "center" }}><Chk checked={d.f_cormack_2} onChange={c("f_cormack_2")} label="II" /></div>
                    <div style={{ flex: 1, ...tdL, borderRight: B, textAlign: "center" }}><Chk checked={d.f_cormack_3} onChange={c("f_cormack_3")} label="III" /></div>
                    <div style={{ flex: 1, ...tdL, borderRight: B, textAlign: "center" }}><Chk checked={d.f_cormack_4} onChange={c("f_cormack_4")} label="IV" /></div>
                    <div style={{ flex: 2, ...tdL, display: "flex", alignItems: "center", paddingLeft: 4 }}>
                      <span style={{ fontSize: "7px", fontWeight: "bold", color: "#1a3a5c", marginRight: 4 }}>NUMERO DE INTENTOS</span>
                      <div style={{ flex: 1, borderLeft: BL }}><TxtIn value={d.f_numero_intentos} onChange={s("f_numero_intentos")} center /></div>
                    </div>
                  </div>
                </div>
                {/* INDUCCION / MANTENIMIENTO */}
                <div style={{ display: "flex" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: B }}>
                    <div style={{ ...thC, textAlign: "center", borderBottom: B }}>INDUCCION</div>
                    <div style={{ display: "flex", flex: 1 }}>
                      <div style={{ flex: 1, ...tdL, borderRight: B, textAlign: "center" }}><Chk checked={d.f_induccion_inhalatoria} onChange={c("f_induccion_inhalatoria")} label="INHALATORIA" /></div>
                      <div style={{ flex: 1, ...tdL, textAlign: "center" }}><Chk checked={d.f_induccion_intravenosa} onChange={c("f_induccion_intravenosa")} label="INTRAVENOSA" /></div>
                    </div>
                  </div>
                  <div style={{ flex: 1.5, display: "flex", flexDirection: "column" }}>
                    <div style={{ ...thC, textAlign: "center", borderBottom: B }}>MANTENIMIENTO</div>
                    <div style={{ display: "flex", flex: 1 }}>
                      <div style={{ flex: 1, ...tdL, borderRight: B, textAlign: "center" }}><Chk checked={d.f_mantenimiento_inhalatoria} onChange={c("f_mantenimiento_inhalatoria")} label="INHALATORIA" /></div>
                      <div style={{ flex: 1, ...tdL, borderRight: B, textAlign: "center" }}><Chk checked={d.f_mantenimiento_intravenosa} onChange={c("f_mantenimiento_intravenosa")} label="INTRAVENOSA" /></div>
                      <div style={{ flex: 1, ...tdL, textAlign: "center" }}><Chk checked={d.f_mantenimiento_balanceada} onChange={c("f_mantenimiento_balanceada")} label="BALANCEADA" /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===================== REGIONAL ===================== */}
            <div style={{ borderRight: B, flex: "0 0 42%", display: "flex", flexDirection: "column" }}>
              <div style={{ ...thC, textAlign: "center", borderBottom: B }}>REGIONAL</div>
              
              {/* ASEPSIA / HABON */}
              <div style={{ display: "flex", borderBottom: B }}>
                <div style={{ flex: 1, display: "flex" }}>
                  <div style={{ width: 80, ...thC, borderRight: B }}>ASEPSIA CON</div>
                  <div style={{ flex: 1, ...tdL, borderRight: B }}><TxtIn value={d.f_asepsia_con} onChange={s("f_asepsia_con")} /></div>
                </div>
                <div style={{ flex: 1, display: "flex" }}>
                  <div style={{ width: 80, ...thC, borderRight: B }}>HABON CON</div>
                  <div style={{ flex: 1, ...tdL }}><TxtIn value={d.f_habon_con} onChange={s("f_habon_con")} /></div>
                </div>
              </div>
              
              {/* LOCAL ASISTIDA / INTRAVENOSA */}
              <div style={{ display: "flex", borderBottom: B }}>
                <div style={{ flex: 1, display: "flex" }}>
                  <div style={{ width: 80, ...thC, borderRight: B }}>LOCAL ASISTIDA</div>
                  <div style={{ flex: 1, ...tdL, borderRight: B }}><TxtIn value={d.f_local_asistida} onChange={s("f_local_asistida")} /></div>
                </div>
                <div style={{ flex: 1, display: "flex" }}>
                  <div style={{ width: 80, ...thC, borderRight: B }}>INTRAVENOSA</div>
                  <div style={{ flex: 1, ...tdL }}><TxtIn value={d.f_intravenosa_reg} onChange={s("f_intravenosa_reg")} /></div>
                </div>
              </div>

              {/* TRONCULAR HEADER */}
              <div style={{ ...thC, textAlign: "center", borderBottom: B }}>TRONCULAR</div>

              {/* BLOQUEO DE NERVIO / No INTENTOS */}
              <div style={{ display: "flex", borderBottom: B }}>
                <div style={{ flex: 2, display: "flex" }}>
                  <div style={{ width: 120, ...thC, borderRight: B }}>BLOQUEO DE NERVIO</div>
                  <div style={{ flex: 1, ...tdL, borderRight: B }}><TxtIn value={d.f_bloqueo_nervio} onChange={s("f_bloqueo_nervio")} /></div>
                </div>
                <div style={{ flex: 1, display: "flex" }}>
                  <div style={{ width: 80, ...thC, borderRight: B }}>No. INTENTOS</div>
                  <div style={{ flex: 1, ...tdL }}><TxtIn value={d.f_numero_intentos_nervio} onChange={s("f_numero_intentos_nervio")} center /></div>
                </div>
              </div>

              {/* BLOQUEO DEL PLEXO */}
              <div style={{ display: "flex", borderBottom: B }}>
                <div style={{ flex: 2, display: "flex" }}>
                  <div style={{ width: 120, ...thC, borderRight: B }}>BLOQUEO DEL PLEXO</div>
                  <div style={{ flex: 1, ...tdL, borderRight: B }}><TxtIn value={d.f_bloqueo_plexo} onChange={s("f_bloqueo_plexo")} /></div>
                </div>
                <div style={{ flex: 1, display: "flex" }}>
                  <div style={{ width: 80, ...thC, borderRight: B }}>No. INTENTOS</div>
                  <div style={{ flex: 1, ...tdL }}><TxtIn value={d.f_numero_intentos_plexo} onChange={s("f_numero_intentos_plexo")} center /></div>
                </div>
              </div>
              
              {/* ANESTESICO LOCAL / COADYUVANTE */}
              <div style={{ display: "flex", borderBottom: B }}>
                <div style={{ flex: 1, display: "flex" }}>
                  <div style={{ width: 100, ...thC, borderRight: B }}>ANESTESICO LOCAL</div>
                  <div style={{ flex: 1, ...tdL, borderRight: B }}><TxtIn value={d.f_anestesico_local} onChange={s("f_anestesico_local")} /></div>
                </div>
                <div style={{ flex: 1, display: "flex" }}>
                  <div style={{ width: 80, ...thC, borderRight: B }}>COADYUVANTE</div>
                  <div style={{ flex: 1, ...tdL }}><TxtIn value={d.f_coadyuvante} onChange={s("f_coadyuvante")} /></div>
                </div>
              </div>
              
              {/* TIPO DE AGUJA / EQUIPO */}
              <div style={{ display: "flex", borderBottom: B }}>
                <div style={{ flex: 1, display: "flex" }}>
                  <div style={{ width: 100, ...thC, borderRight: B }}>TIPO DE AGUJA</div>
                  <div style={{ flex: 1, ...tdL, borderRight: B }}><TxtIn value={d.f_tipo_aguja} onChange={s("f_tipo_aguja")} /></div>
                </div>
                <div style={{ flex: 1, display: "flex" }}>
                  <div style={{ width: 80, ...thC, borderRight: B }}>EQUIPO</div>
                  <div style={{ flex: 1, ...tdL }}><TxtIn value={d.f_equipo_reg} onChange={s("f_equipo_reg")} /></div>
                </div>
              </div>

              {/* RAQUIDEA / EPIDURAL / CAUDAL / CATETER */}
              <div style={{ display: "flex", borderBottom: B }}>
                <div style={{ flex: 1, ...tdL, padding: "1px 2px", borderRight: B, textAlign: "center" }}><Chk checked={d.f_regional_raquidea} onChange={c("f_regional_raquidea")} label="RAQUIDEA" /></div>
                <div style={{ flex: 1, ...tdL, padding: "1px 2px", borderRight: B, textAlign: "center" }}><Chk checked={d.f_regional_epidural} onChange={c("f_regional_epidural")} label="EPIDURAL" /></div>
                <div style={{ flex: 1, ...tdL, padding: "1px 2px", borderRight: B, textAlign: "center" }}><Chk checked={d.f_regional_caudal} onChange={c("f_regional_caudal")} label="CAUDAL" /></div>
                <div style={{ flex: 1.5, ...tdL, padding: "1px 2px", display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: "7px", fontWeight: "bold", color: "#1a3a5c", marginRight: 6 }}>CATETER</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Chk checked={d.f_cateter_si} onChange={c("f_cateter_si")} label="SI" />
                    <Chk checked={d.f_cateter_no} onChange={c("f_cateter_no")} label="NO" />
                  </div>
                </div>
              </div>

              {/* TIPO AGUJA / NUMERO DE AGUJA / No INTENTOS */}
              <div style={{ display: "flex", borderBottom: B }}>
                <div style={{ flex: 1.2, display: "flex", borderRight: B }}>
                  <div style={{ width: 65, ...thC, borderRight: B }}>TIPO AGUJA</div>
                  <div style={{ flex: 1, ...tdL }}><TxtIn value={d.f_tipo_aguja_raquiz} onChange={s("f_tipo_aguja_raquiz")} /></div>
                </div>
                <div style={{ flex: 1.2, display: "flex", borderRight: B }}>
                  <div style={{ width: 85, ...thC, borderRight: B }}>NUMERO DE AGUJA</div>
                  <div style={{ flex: 1, ...tdL }}><TxtIn value={d.f_numero_de_aguja} onChange={s("f_numero_de_aguja")} /></div>
                </div>
                <div style={{ flex: 1, display: "flex" }}>
                  <div style={{ width: 65, ...thC, borderRight: B }}>No. INTENTOS</div>
                  <div style={{ flex: 1, ...tdL }}><TxtIn value={d.f_numero_intentos_reg} onChange={s("f_numero_intentos_reg")} center /></div>
                </div>
              </div>
              
              {/* BARBOTAJE / ACCESO / SITIO DE PUNCION */}
              <div style={{ display: "flex", borderBottom: B }}>
                <div style={{ flex: 1, display: "flex", borderRight: B, alignItems: "center", paddingLeft: 4 }}>
                  <span style={{ fontSize: "7px", fontWeight: "bold", color: "#1a3a5c", marginRight: 4 }}>BARBOTAJE</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <Chk checked={d.f_barbotaje_si} onChange={c("f_barbotaje_si")} label="SI" />
                    <Chk checked={d.f_barbotaje_no} onChange={c("f_barbotaje_no")} label="NO" />
                  </div>
                </div>
                <div style={{ flex: 1.5, display: "flex", borderRight: B, alignItems: "center", paddingLeft: 4 }}>
                  <span style={{ fontSize: "7px", fontWeight: "bold", color: "#1a3a5c", marginRight: 4 }}>ACCESO</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <Chk checked={d.f_acceso_medial} onChange={c("f_acceso_medial")} label="MEDIAL" />
                    <Chk checked={d.f_acceso_lateral} onChange={c("f_acceso_lateral")} label="LATERAL" />
                  </div>
                </div>
                <div style={{ flex: 1.5, display: "flex" }}>
                  <div style={{ width: 90, ...thC, borderRight: B }}>SITIO DE PUNCION</div>
                  <div style={{ flex: 1, ...tdL }}><TxtIn value={d.f_sitio_puncion} onChange={s("f_sitio_puncion")} /></div>
                </div>
              </div>
              
              {/* DERMATOMA / POSICION */}
              <div style={{ display: "flex", flex: 1 }}>
                <div style={{ flex: 1, display: "flex", borderRight: B }}>
                  <div style={{ width: 70, ...thC, borderRight: B }}>DERMATOMA</div>
                  <div style={{ flex: 1, ...tdL }}><TxtIn value={d.f_dermatoma} onChange={s("f_dermatoma")} /></div>
                </div>
                <div style={{ flex: 1, display: "flex" }}>
                  <div style={{ width: 60, ...thC, borderRight: B }}>POSICION</div>
                  <div style={{ flex: 1, ...tdL }}><TxtIn value={d.f_posicion} onChange={s("f_posicion")} /></div>
                </div>
              </div>
            </div>

            {/* ===================== SEDO - ANALGESIA ===================== */}
            <div style={{ flex: "0 0 16%", display: "flex", flexDirection: "column" }}>
              <div style={{ ...thC, textAlign: "center", borderBottom: B }}>SEDO - ANALGESIA</div>
              
              <div style={{ flex: 1, ...tdL, padding: 0 }}>
                <textarea 
                  value={d.f_sedo_analgesia_notas || ""} 
                  onChange={(e) => s("f_sedo_analgesia_notas")(e.target.value)}
                  style={{ width: "100%", height: "100%", border: "none", resize: "none", fontSize: "8px", outline: "none", fontFamily: "Arial, sans-serif", background: "transparent", lineHeight: "1.5", padding: "4px" }}
                />
              </div>

              <div style={{ ...thC, textAlign: "center", borderTop: B, borderBottom: B }}>ESCALA DE RAMSAY</div>
              <div style={{ display: "flex", gap: 0 }}>
                {["1","2","3","4","5","6"].map(v => (
                  <div key={v}
                    onClick={() => setD(p => ({ ...p, f_escala_ramsay: p.f_escala_ramsay === v ? "" : v }))}
                    style={{
                      flex: 1, borderRight: v !== "6" ? B : "none", textAlign: "center", padding: "1px 0",
                      cursor: "pointer", fontSize: "8px", fontWeight: 700,
                      background: d.f_escala_ramsay === v ? "#FFE066" : "#fff",
                      fontFamily: "Arial, sans-serif",
                    }}>
                    {v}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ══ G / H / I en fila ═════════════════════════════════════════ */}
          <div style={{ display: "flex", gap: 0, marginTop: 4, border: B }}>

            {/* G. ACCESOS VASCULARES */}
            <div style={{ borderRight: B, flex: "0 0 35%", display: "flex", flexDirection: "column" }}>
              <div style={secH({ border: "none", borderBottom: B })}>G. ACCESOS VASCULARES</div>
              <div style={{ display: "flex", borderBottom: B }}>
                <div style={{ flex: "0 0 30%", ...tdLbl, borderRight: B }}>TIPO</div>
                <div style={{ flex: "0 0 15%", ...tdLbl, borderRight: B }}>CALIBRE</div>
                <div style={{ flex: 1, ...tdLbl }}>SITIO</div>
              </div>
              {[
                "IV PERIFERICO 1",
                "IV PERIFERICO 2",
                "IV PERIFERICO 3",
                "IV CENTRAL",
                "INTRA ARTERIAL",
                "OTRO"
              ].map((tipoLabel, i) => {
                const via = d.g_vias?.[i] || { calibre: "", sitio: "" };
                return (
                  <div key={i} style={{ display: "flex", borderBottom: i === 5 ? "none" : B }}>
                    <div style={{ flex: "0 0 30%", ...tdLbl, fontWeight: 400, borderRight: B, borderBottom: "none" }}>{tipoLabel}</div>
                    <div style={{ flex: "0 0 15%", ...tdL, borderRight: B, borderBottom: "none" }}><TxtIn value={via.calibre} onChange={(v) => setVia(i, tipoLabel, "calibre", v)} center /></div>
                    <div style={{ flex: 1, ...tdL, borderBottom: "none" }}><TxtIn value={via.sitio} onChange={(v) => setVia(i, tipoLabel, "sitio", v)} /></div>
                  </div>
                );
              })}
            </div>

            {/* H. REPOSICIÓN VOLÉMICA */}
            <div style={{ borderRight: B, flex: "0 0 40%", display: "flex", flexDirection: "column" }}>
              <div style={secH({ border: "none", borderBottom: B })}>H. REPOSICION VOLEMICA (ml)</div>
              <div style={{ display: "flex", flex: 1 }}>
                
                {/* Columna 1 */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: B }}>
                  {[
                    { key: "h_dextrosa_5" as const,    label: "DEXTROSA 5%" },
                    { key: "h_dextrosa_10" as const,   label: "DEXTROSA 10%" },
                    { key: "h_dextrosa_50" as const,   label: "DEXTROSA 50%" },
                    { key: "h_dextrosa_en_ss" as const,label: "DEXTROSA EN SS" },
                    { key: "h_ss_0_9" as const,        label: "SS 0.9%" },
                    { key: "h_lactato_ringer" as const,label: "LACTATO RINGER" },
                    { key: "h_expansores" as const,    label: "EXPANSORES" },
                  ].map(({ key, label }, idx) => (
                    <div key={key} style={{ display: "flex", borderBottom: idx === 6 ? "none" : B, flex: 1 }}>
                      <div style={{ flex: "0 0 50%", ...tdLbl, borderRight: B, borderBottom: "none" }}>{label}</div>
                      <div style={{ flex: 1, ...tdL, borderBottom: "none" }}><TxtIn value={d[key] as string} onChange={s(key)} center /></div>
                    </div>
                  ))}
                </div>

                {/* Columna 2 */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  {[
                    { key: "h_sangre" as const,           label: "SANGRE" },
                    { key: "h_plasma" as const,           label: "PLASMA" },
                    { key: "h_plaquetas" as const,        label: "PLAQUETAS" },
                    { key: "h_crioprecipitados" as const, label: "CRIOPRECIPITADOS" },
                    { key: "h_otros_h" as const,          label: "OTROS" },
                    { key: "h_total" as const,            label: "TOTAL" },
                    { key: "empty" as const,              label: "" }, // empty row to match height
                  ].map(({ key, label }, idx) => (
                    <div key={key} style={{ display: "flex", borderBottom: idx === 6 ? "none" : B, flex: 1 }}>
                      <div style={{ flex: "0 0 50%", ...tdLbl, borderRight: B, borderBottom: "none" }}>{label}</div>
                      <div style={{ flex: 1, ...tdL, borderBottom: "none" }}>{key !== "empty" && <TxtIn value={d[key as keyof typeof d] as string} onChange={s(key)} center />}</div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* I. PÉRDIDAS */}
            <div style={{ flex: "0 0 25%", display: "flex", flexDirection: "column" }}>
              <div style={secH({ border: "none", borderBottom: B })}>I. PERDIDAS</div>
              {[
                { key: "i_sangrado" as const, label: "SANGRADO" },
                { key: "i_orina" as const,    label: "DIURESIS" },
                { key: "i_otros_i" as const,  label: "OTROS" },
                { key: "i_total_i" as const,  label: "TOTAL" },
                { key: "empty1" as const,     label: "" },
                { key: "empty2" as const,     label: "" },
                { key: "i_balance" as const,  label: "BALANCE" },
              ].map(({ key, label }, idx) => (
                <div key={key} style={{ display: "flex", borderBottom: idx === 6 ? "none" : B, flex: 1 }}>
                  <div style={{ flex: "0 0 45%", ...tdLbl, borderRight: B, borderBottom: "none" }}>{label}</div>
                  <div style={{ flex: 1, ...tdL, borderBottom: "none" }}>
                    {!key.startsWith("empty") && <TxtIn value={d[key as keyof typeof d] as string} onChange={s(key)} center />}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* ══ J + K en fila ════════════════════════════════════════════ */}
          <div style={{ display: "flex", gap: 0, marginTop: 4, border: B }}>

            {/* J. Datos del recién nacido / APGAR */}
            <div style={{ borderRight: B, flex: 1 }}>
              <div style={secH({ border: "none", borderBottom: B })}>J. DATOS DEL RECIÉN NACIDO</div>
              <table style={tbl}>
                <tbody>
                  <tr style={{ height: ROW_H }}>
                    <td rowSpan={2} style={{ ...tdLbl, width: 60, textAlign: "center", verticalAlign: "middle" }}>APGAR</td>
                    <td style={{ ...tdLbl, width: 80 }}>FETO MUERTO</td>
                    <td style={{ ...tdL, width: 40, textAlign: "center", cursor: "pointer" }} onClick={toggle("j_feto_muerto")}>
                      <span style={{ fontSize: "8px", fontWeight: "bold" }}>{d.j_feto_muerto ? "X" : ""}</span>
                    </td>
                    <td style={{ ...tdLbl, width: 70 }}>5 MINUTOS</td>
                    <td style={tdL}><TxtIn value={d.j_apgar_5min} onChange={s("j_apgar_5min")} center /></td>
                  </tr>
                  <tr style={{ height: ROW_H }}>
                    <td style={{ ...tdLbl, width: 80 }}>1 MINUTO</td>
                    <td style={{ ...tdL, width: 40 }}><TxtIn value={d.j_apgar_1min} onChange={s("j_apgar_1min")} center /></td>
                    <td style={{ ...tdLbl, width: 70 }}>10 MINUTOS</td>
                    <td style={tdL}><TxtIn value={d.j_apgar_10min} onChange={s("j_apgar_10min")} center /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* K. Tiempos transcurridos */}
            <div style={{ flex: 1 }}>
              <div style={secH({ border: "none", borderBottom: B })}>K. TIEMPOS TRANSCURRIDOS</div>
              <table style={tbl}>
                <tbody>
                  <tr style={{ height: ROW_H }}>
                    <td style={tdLbl}>DURACIÓN ANESTESIA</td>
                    <td style={tdL}><TxtIn value={d.k_duracion_anestesia} onChange={s("k_duracion_anestesia")} center placeholder="hh:mm" /></td>
                    <td style={tdLbl}>DURACIÓN DE CIRUGÍA</td>
                    <td style={tdL}><TxtIn value={d.k_duracion_cirugia} onChange={s("k_duracion_cirugia")} center placeholder="hh:mm" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pie de página */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderTop: B, marginTop: 6 }}>
            <span style={{ fontSize: "8px", color: "#555", fontFamily: "Arial, sans-serif" }}>SNS-MSP / HCU-form.018A/2021</span>
            <span style={{ fontSize: "9px", fontWeight: 700, color: "#1a3a5c", fontFamily: "Arial, sans-serif" }}>TRANSANESTÉSICO (1)</span>
          </div>

        </div>
      </div>
    </div>
  );
}


function emptyLabRow(): LabRow {
  return { hora: "", ph: "", po2: "", pco2: "", hco3: "", eb: "", sat02: "", lactato: "", glucosa: "", na: "", k: "", cl: "", hcto: "", hb: "", otro: "" };
}

function ChkBox({ checked, onChange, label }: {
  checked: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 3, cursor: "pointer", fontSize: "8px", fontFamily: "Arial, sans-serif", padding: "2px 4px", whiteSpace: "nowrap" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 10, height: 10, flexShrink: 0 }} />
      {label}
    </label>
  );
}

export function TransanestesicoForm2({ d, setD }: { d: DatosAnestesia, setD: React.Dispatch<React.SetStateAction<DatosAnestesia>> }) {
  const s = (k: keyof DatosAnestesia) => (v: string) => setD(p => ({ ...p, [k]: v }));
  const c = (k: keyof DatosAnestesia) => (v: boolean) => setD(p => ({ ...p, [k]: v }));

  const setLab = (i: number, campo: keyof LabRow, v: string) =>
    setD(p => {
      const rows = [...(p.lab_rows || [])];
      rows[i] = { ...(rows[i] || emptyLabRow()), [campo]: v };
      return { ...p, lab_rows: rows };
    });

  const setObs = (i: number, v: string) =>
    setD(p => {
      const obs = [...(p.observaciones_2 || [])];
      obs[i] = v;
      return { ...p, observaciones_2: obs };
    });

  const LAB_COLS: Array<{ key: keyof LabRow; label: string; w?: number }> = [
    { key: "hora",    label: "HORA",    w: 55 },
    { key: "ph",      label: "pH",      w: 40 },
    { key: "po2",     label: "Po2",     w: 40 },
    { key: "pco2",    label: "PCO2",    w: 40 },
    { key: "hco3",    label: "HCO3",    w: 40 },
    { key: "eb",      label: "EB",      w: 40 },
    { key: "sat02",   label: "SAT. O2", w: 45 },
    { key: "lactato", label: "LACTATO", w: 50 },
    { key: "glucosa", label: "GLUCOSA", w: 50 },
    { key: "na",      label: "Na",      w: 35 },
    { key: "k",       label: "K",       w: 30 },
    { key: "cl",      label: "Cl",      w: 30 },
    { key: "hcto",    label: "HCTO",    w: 40 },
    { key: "hb",      label: "HB",      w: 35 },
    { key: "otro",    label: "OTRO",    w: 50 },
  ];

  const currentLabRows = Array.from({ length: 10 }).map((_, i) => (d.lab_rows && d.lab_rows[i]) ? d.lab_rows[i] : emptyLabRow());
  const currentObs = Array.from({ length: 12 }).map((_, i) => (d.observaciones_2 && d.observaciones_2[i] != null) ? d.observaciones_2[i] : "");

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ overflowX: "auto", background: "#fff" }}>
        <div style={{ padding: "8px 12px 12px", minWidth: 900, fontFamily: "Arial, sans-serif" }}>

          {/* -- L. TÉCNICAS ESPECIALES ---------------------------------------- */}
          <div style={secH()}>L. TÉCNICAS ESPECIALES</div>
          <table style={tbl}>
            <tbody>
              <tr style={{ height: ROW_H }}>
                <td style={tdL}>
                  <ChkBox checked={!!d.l_hemodilucion} onChange={c("l_hemodilucion")} label="HEMODILUCIÓN" />
                </td>
                <td style={tdL}>
                  <ChkBox checked={!!d.l_autotransfusion} onChange={c("l_autotransfusion")} label="AUTOTRANSFUSIÓN" />
                </td>
                <td style={tdL}>
                  <ChkBox checked={!!d.l_hipotension} onChange={c("l_hipotension")} label="HIPOTENSIÓN" />
                </td>
                <td style={tdL}>
                  <ChkBox checked={!!d.l_hipotermia} onChange={c("l_hipotermia")} label="HIPOTERMIA" />
                </td>
                <td style={tdL}>
                  <ChkBox checked={!!d.l_circulacion_extracorporea} onChange={c("l_circulacion_extracorporea")} label="CIRCULACIÓN EXTRACORPÓREA" />
                </td>
              </tr>
            </tbody>
          </table>

          {/* -- M. MANTENIMIENTO TEMPERATURA CORPORAL ------------------------ */}
          <div style={secH({ marginTop: 4 })}>M. MANTENIMIENTO TEMPERATURA CORPORAL</div>
          <table style={tbl}>
            <tbody>
              <tr style={{ height: ROW_H }}>
                <td style={{ ...tdL, width: "22%" }}>
                  <ChkBox checked={!!d.m_manta_termica} onChange={c("m_manta_termica")} label="MANTA TÉRMICA" />
                </td>
                <td style={{ ...tdL, width: "28%" }}>
                  <ChkBox checked={!!d.m_calentamiento_fluidos} onChange={c("m_calentamiento_fluidos")} label="CALENTAMIENTO DE FLUIDOS" />
                </td>
                <td style={tdLbl}>OTROS:</td>
                <td style={tdL}>
                  <TxtIn value={d.m_otros || ""} onChange={s("m_otros")} />
                </td>
              </tr>
            </tbody>
          </table>

          {/* -- N. INCIDENTES -------------------------------------------------- */}
          <div style={secH({ marginTop: 4 })}>N. INCIDENTES</div>
          <table style={tbl}>
            <tbody>
              {/* Fila 1 */}
              <tr style={{ height: ROW_H }}>
                <td style={{ ...tdL, width: "20%" }}>
                  <ChkBox checked={!!d.n_actividad_electrica_sin_pulso} onChange={c("n_actividad_electrica_sin_pulso")} label="ACTIVIDAD ELÉCTRICA SIN PULSO" />
                </td>
                <td style={{ ...tdL, width: "14%" }}>
                  <ChkBox checked={!!d.n_arritmia} onChange={c("n_arritmia")} label="ARRITMIA" />
                </td>
                <td style={{ ...tdL, width: "14%" }}>
                  <ChkBox checked={!!d.n_asistolia} onChange={c("n_asistolia")} label="ASISTOLIA" />
                </td>
                <td style={{ ...tdL, width: "20%" }}>
                  <ChkBox checked={!!d.n_bradicardia_inestable} onChange={c("n_bradicardia_inestable")} label="BRADICARDIA INESTABLE" />
                </td>
                <td style={tdL}>
                  <ChkBox checked={!!d.n_tromboembolia_pulmonar} onChange={c("n_tromboembolia_pulmonar")} label="TROMBOEMBOLIA PULMONAR" />
                </td>
              </tr>
              {/* Fila 2 */}
              <tr style={{ height: ROW_H }}>
                <td style={tdL}>
                  <ChkBox checked={!!d.n_hipertermia_maligna} onChange={c("n_hipertermia_maligna")} label="HIPERTERMIA MALIGNA" />
                </td>
                <td style={tdL}>
                  <ChkBox checked={!!d.n_anafilaxia} onChange={c("n_anafilaxia")} label="ANAFILAXIA" />
                </td>
                <td style={tdL}>
                  <ChkBox checked={!!d.n_isquemia_miocardica} onChange={c("n_isquemia_miocardica")} label="ISQUEMIA MIOCÁRDICA" />
                </td>
                <td style={tdL}>
                  <ChkBox checked={!!d.n_hipoxemia} onChange={c("n_hipoxemia")} label="HIPOXEMIA" />
                </td>
                <td style={tdL}>
                  <ChkBox checked={!!d.n_neumotorax} onChange={c("n_neumotorax")} label="NEUMOTÓRAX" />
                </td>
              </tr>
              {/* Fila 3 */}
              <tr style={{ height: ROW_H }}>
                <td style={tdL}>
                  <ChkBox checked={!!d.n_broncoespasmo} onChange={c("n_broncoespasmo")} label="BRONCOESPASMO" />
                </td>
                <td style={tdL}>
                  <ChkBox checked={!!d.n_despertar_prolongado} onChange={c("n_despertar_prolongado")} label="DESPERTAR PROLONGADO" />
                </td>
                <td style={tdL}>
                  <ChkBox checked={!!d.n_embolia_aerea_venosa} onChange={c("n_embolia_aerea_venosa")} label="EMBOLIA AÉREA VENOSA" />
                </td>
                <td style={tdL}>
                  <ChkBox checked={!!d.n_reaccion_transfusion} onChange={c("n_reaccion_transfusion")} label="REACCIÓN A LA TRANSFUSIÓN" />
                </td>
                <td style={tdL}>
                  <ChkBox checked={!!d.n_laringoespasmo} onChange={c("n_laringoespasmo")} label="LARINGOESPASMO" />
                </td>
              </tr>
              {/* Fila 4 */}
              <tr style={{ height: ROW_H }}>
                <td style={tdL}>
                  <ChkBox checked={!!d.n_dificultad_tecnica} onChange={c("n_dificultad_tecnica")} label="DIFICULTAD DE LA TÉCNICA" />
                </td>
                <td colSpan={2} style={tdLbl}>OTROS:</td>
                <td colSpan={2} style={tdL}>
                  <TxtIn value={d.n_otros || ""} onChange={s("n_otros")} />
                </td>
              </tr>
            </tbody>
          </table>

          {/* -- O. RESULTADO DE EXÁMENES DE LABORATORIO ---------------------- */}
          <div style={secH({ marginTop: 4 })}>O. RESULTADO DE EXÁMENES DE LABORATORIO</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ ...tbl, minWidth: 820 }}>
              <tbody>
                {/* Cabecera */}
                <tr>
                  <td style={{ ...thC, width: 22 }}></td>
                  {LAB_COLS.map(col => (
                    <td key={col.key} style={{ ...thC, width: col.w }}>{col.label}</td>
                  ))}
                </tr>
                {/* 10 filas de datos */}
                {currentLabRows.map((row, i) => (
                  <tr key={i} style={{ height: ROW_H }}>
                    <td style={{ ...tdLbl, textAlign: "center", padding: "1px" }}>{i + 1}</td>
                    {LAB_COLS.map(col => (
                      <td key={col.key} style={tdL}>
                        <TxtIn
                          value={row[col.key]}
                          onChange={(v) => setLab(i, col.key, v)}
                          center
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* -- P. OBSERVACIONES ---------------------------------------------- */}
          <div style={secH({ marginTop: 4 })}>P. OBSERVACIONES</div>
          <div style={{ border: B }}>
            {currentObs.map((line, i) => (
              <div key={i} style={{ borderBottom: i < currentObs.length - 1 ? BL : "none" }}>
                <TxtIn value={line} onChange={(v) => setObs(i, v)} placeholder="" />
              </div>
            ))}
          </div>

                    {/* -- R. CONDICIÓN DE EGRESO ---------------------------------------- */}
          <div style={secH({ marginTop: 4 })}>R. CONDICIÓN DE EGRESO</div>
          <table style={tbl}>
            <tbody>
              <tr style={{ height: 0, visibility: "hidden" }}>
                <td style={{ width: "13%", padding: 0, border: "none" }}></td>
                <td style={{ width: "7%", padding: 0, border: "none" }}></td>
                <td style={{ width: "3%", padding: 0, border: "none" }}></td>
                <td style={{ width: "3%", padding: 0, border: "none" }}></td>
                <td style={{ width: "9%", padding: 0, border: "none" }}></td>
                <td style={{ width: "3%", padding: 0, border: "none" }}></td>
                <td style={{ width: "9%", padding: 0, border: "none" }}></td>
                <td style={{ width: "3%", padding: 0, border: "none" }}></td>
                <td style={{ width: "3%", padding: 0, border: "none" }}></td>
                <td style={{ width: "9%", padding: 0, border: "none" }}></td>
                <td style={{ width: "3%", padding: 0, border: "none" }}></td>
                <td style={{ width: "4%", padding: 0, border: "none" }}></td>
                <td style={{ width: "8%", padding: 0, border: "none" }}></td>
                <td style={{ width: "3%", padding: 0, border: "none" }}></td>
                <td style={{ width: "3%", padding: 0, border: "none" }}></td>
                <td style={{ width: "6%", padding: 0, border: "none" }}></td>
                <td style={{ width: "3%", padding: 0, border: "none" }}></td>
              </tr>
              <tr>
                <td rowSpan={2} style={{ ...tdLbl, verticalAlign: "middle", textAlign: "center", whiteSpace: "normal" }}>
                  CONDICIONES AL SALIR
                </td>
                <td style={{ ...tdLbl, textAlign: "center" }}>EXTUBADO</td>
                <td style={{ ...tdL, textAlign: "center", verticalAlign: "middle" }}>
                  <input type="radio" checked={!!d.r_extubado} onChange={() => setD(p => ({ ...p, r_extubado: true, r_intubado: false }))} style={{ width: 10, height: 10, cursor: "pointer" }} />
                </td>
                <td colSpan={2} rowSpan={2} style={{ ...tdL, verticalAlign: "top" }}>
                  <div style={{ padding: "2px 4px" }}>
                    <div style={{ fontSize: "7.5px", fontWeight: 700, color: "#1a3a5c", marginBottom: 1 }}>CONDUCIDO A:</div>
                    <TxtIn value={d.r_conducido_a || ""} onChange={s("r_conducido_a")} />
                  </div>
                </td>
                <td colSpan={2} rowSpan={2} style={{ ...tdLbl, textAlign: "center", whiteSpace: "normal" }}>
                  UNIDAD DE CUIDADOS POST ANESTÉSICOS
                </td>
                <td rowSpan={2} style={{ ...tdL, textAlign: "center", verticalAlign: "middle" }}>
                  <input type="checkbox" checked={!!d.r_unidad_cuidados_post} onChange={(e) => c("r_unidad_cuidados_post")(e.target.checked)} style={{ width: 10, height: 10, cursor: "pointer" }} />
                </td>
                <td colSpan={2} rowSpan={2} style={{ ...tdLbl, textAlign: "center", whiteSpace: "normal" }}>
                  UNIDAD CUIDADOS INTENSIVOS
                </td>
                <td rowSpan={2} style={{ ...tdL, textAlign: "center", verticalAlign: "middle" }}>
                  <input type="checkbox" checked={!!d.r_unidad_cuidados_intensivos} onChange={(e) => c("r_unidad_cuidados_intensivos")(e.target.checked)} style={{ width: 10, height: 10, cursor: "pointer" }} />
                </td>
                <td colSpan={2} rowSpan={2} style={{ ...tdLbl, textAlign: "center", whiteSpace: "normal" }}>
                  CRÍTICOS DE EMERGENCIA
                </td>
                <td rowSpan={2} style={{ ...tdL, textAlign: "center", verticalAlign: "middle" }}>
                  <input type="checkbox" checked={!!d.r_criticos_emergencia} onChange={(e) => c("r_criticos_emergencia")(e.target.checked)} style={{ width: 10, height: 10, cursor: "pointer" }} />
                </td>
                <td colSpan={2} rowSpan={2} style={{ ...tdLbl, textAlign: "center", whiteSpace: "normal" }}>
                  MORGUE
                </td>
                <td rowSpan={2} style={{ ...tdL, textAlign: "center", verticalAlign: "middle" }}>
                  <input type="checkbox" checked={!!d.r_morgue} onChange={(e) => c("r_morgue")(e.target.checked)} style={{ width: 10, height: 10, cursor: "pointer" }} />
                </td>
              </tr>
              <tr style={{ height: ROW_H }}>
                <td style={{ ...tdLbl, textAlign: "center" }}>INTUBADO</td>
                <td style={{ ...tdL, textAlign: "center", verticalAlign: "middle" }}>
                  <input type="radio" checked={!!d.r_intubado} onChange={() => setD(p => ({ ...p, r_intubado: true, r_extubado: false }))} style={{ width: 10, height: 10, cursor: "pointer" }} />
                </td>
              </tr>
              <tr style={{ height: ROW_H }}>
                <td colSpan={3} style={{ ...tdLbl, textAlign: "left" }}>CONSTANTES VITALES DE ENTREGA</td>
                <td style={tdLbl}>TA</td>
                <td style={tdL}><TxtIn value={d.r_constantes_ta || ""} onChange={s("r_constantes_ta")} center /></td>
                <td style={tdLbl}>FC</td>
                <td colSpan={2} style={tdL}><TxtIn value={d.r_constantes_fc || ""} onChange={s("r_constantes_fc")} center /></td>
                <td style={tdLbl}>FR</td>
                <td colSpan={2} style={tdL}><TxtIn value={d.r_constantes_fr || ""} onChange={s("r_constantes_fr")} center /></td>
                <td style={tdLbl}>SAT. O2</td>
                <td colSpan={2} style={tdL}><TxtIn value={d.r_constantes_sat02 || ""} onChange={s("r_constantes_sat02")} center /></td>
                <td style={tdLbl}>T°</td>
                <td colSpan={2} style={tdL}><TxtIn value={d.r_constantes_temperatura || ""} onChange={s("r_constantes_temperatura")} center /></td>
              </tr>
            </tbody>
          </table>

{/* -- S. DATOS DEL PROFESIONAL RESPONSABLE ------------------------- */}
          <div style={secH({ marginTop: 4 })}>S. DATOS DEL PROFESIONAL RESPONSABLE</div>
          <table style={tbl}>
            <tbody>
              <tr>
                <td style={{ ...tdLbl, width: 80 }}>HORA</td>
                <td style={tdLbl}>NOMBRE Y APELLIDO DEL PROFESIONAL</td>
                <td style={{ ...tdLbl, textAlign: "center" }}>FIRMA</td>
                <td style={{ ...tdLbl, textAlign: "center", width: 130 }}>SELLO Y CÓDIGO</td>
              </tr>
              <tr style={{ height: 40 }}>
                <td style={tdL}>
                  <input type="time" value={d.s_hora || ""} onChange={(e) => s("s_hora")(e.target.value)}
                    style={{ border: "none", outline: "none", fontSize: "9px", padding: "2px 3px", width: "100%", fontFamily: "Arial, sans-serif" }} />
                </td>
                <td style={tdL}>
                  <TxtIn value={d.s_nombre_apellido || ""} onChange={s("s_nombre_apellido")} />
                </td>
                <td style={{ ...tdL, background: "#f8f8f8", textAlign: "center", height: 40 }}>
                  <span style={{ fontSize: "8px", color: "#aaa", fontStyle: "italic" }}>(firma en documento impreso)</span>
                </td>
                <td style={{ ...tdL, background: "#f8f8f8", textAlign: "center" }}>
                  <TxtIn value={d.s_sello_codigo || ""} onChange={s("s_sello_codigo")} center placeholder="Código" />
                </td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}
