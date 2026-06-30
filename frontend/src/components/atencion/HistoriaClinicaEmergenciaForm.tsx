"use client";

import React, { useImperativeHandle, useState, useEffect } from "react";
import { BotonBuscarProfesional } from "@/components/ui/BotonBuscarProfesional";
import { parseNombresMedico } from "@/lib/services/medicos";
import Cie10Autocomplete from "./Cie10Autocomplete";
import RichTextEvolucion from "../ui/RichTextEvolucion";
import { useFormAutosaveAndWarn } from "@/hooks/useFormAutosaveAndWarn";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Tratamiento {
  medicamento: string;
  via: string;
  dosis: string;
  posologia: string;
  dias: string;
  descripcion: string;
}

interface DatosEmergencia {
  institucion: string;
  unicodigo: string;
  establecimiento: string;
  numero_historia_clinica: string;
  numero_archivo: string;
  fecha_admision: string;
  nombre_admisionista: string;
  hc_establecimiento: "SI" | "NO" | "";
  primer_apellido: string;
  segundo_apellido: string;
  primer_nombre: string;
  segundo_nombre: string;
  tipo_doc: "CC/CI" | "PAS" | "CARNE" | "SD" | "";
  estado_civil: "SOL" | "CAS" | "DIV" | "VIU" | "UN" | "UH" | "NA" | "";
  sexo: string;
  telefono_fijo: string;
  telefono_celular: string;
  fecha_nacimiento: string;
  lugar_nacimiento: string;
  nacionalidad: string;
  edad: string;
  condicion_edad: "H" | "D" | "M" | "A" | "";
  grupo_prioritario: "SI" | "NO" | "";
  grupo_prioritario_especifique: string;
  autoidentificacion_etnica: string;
  nacionalidad_etnica: string;
  pueblos: string;
  nivel_educacion: string;
  estado_nivel_educacion: string;
  tipo_empresa_trabajo: string;
  ocupacion_profesion: string;
  seguro_salud: "IESS_G" | "IESS_C" | "ISSPOL" | "ISSFA" | "PRIV" | "NING" | "";
  provincia: string;
  canton: string;
  parroquia: string;
  barrio_sector: string;
  calle_principal: string;
  calle_secundaria: string;
  referencia_domicilio: string;
  nombre_contacto: string;
  parentesco_contacto: string;
  direccion_contacto: string;
  telefono_contacto: string;
  forma_llegada: "AMBULATORIO" | "AMBULANCIA" | "OTRO" | "";
  fuente_informacion: string;
  institucion_entrega: string;
  telefono_institucion: string;
  fecha_inicio_atencion: string;
  hora_inicio_atencion: string;
  condicion_llegada: "ESTABLE" | "INESTABLE" | "FALLECIDO" | "";
  motivo_atencion: string;
  fecha_evento: string;
  hora_evento: string;
  lugar_evento: string;
  direccion_evento: string;
  custodia_policial: "SI" | "NO" | "";
  tipo_accidente: string[];
  tipo_violencia: string[];
  notificacion: "SI" | "NO" | "";
  tipo_intoxicacion: string[];
  observaciones_accidente: string;
  aliento_alcoholico: boolean;
  antecedentes: string[];
  antecedentes_no_aplica: boolean;
  antecedentes_descripcion: string;
  enfermedad_actual: string;
  sin_constantes_vitales: boolean;
  presion_arterial: string;
  pulso: string;
  frecuencia_respiratoria: string;
  pulsioximetria: string;
  perimetro_cefalico: string;
  peso: string;
  talla: string;
  glicemia_capilar: string;
  glasgow_ocular: string;
  glasgow_verbal: string;
  glasgow_motora: string;
  reaccion_pupila_der: string;
  reaccion_pupila_izq: string;
  llenado_capilar: string;
  examen_items: string[];
  examen_fisico_descripcion: string;
  examen_trauma_critico: string;
  embarazo_no_aplica: boolean;
  numero_gestas: string;
  numero_partos: string;
  numero_abortos: string;
  numero_cesareas: string;
  fum: string;
  semanas_gestacion: string;
  movimiento_fetal: string;
  frecuencia_cardiaca_fetal: string;
  ruptura_membranas: string;
  tiempo_ruptura: string;
  afu: string;
  presentacion: string;
  dilatacion: string;
  borramiento: string;
  plano: string;
  pelvis_viable: string;
  sangrado_vaginal: string;
  contracciones: string;
  score_mama: string;
  examenes_no_aplica: boolean;
  examenes: string[];
  examenes_resultados: string;
  dx_presuntivos: { descripcion: string; cie: string }[];
  dx_definitivos: { descripcion: string; cie: string }[];
  tratamientos: Tratamiento[];
  egreso_condicion: string[];
  egreso_establecimiento: string;
  observaciones_egreso: string;
  dias_reposo: string;
  prof_fecha: string;
  prof_hora: string;
  prof_primer_nombre: string;
  prof_primer_apellido: string;
  prof_segundo_apellido: string;
  prof_numero_documento: string;
}

interface Props {
  paciente?: {
    primer_nombre?: string;
    segundo_nombre?: string;
    primer_apellido?: string;
    segundo_apellido?: string;
    cedula?: string;
    edad?: number;
    sexo?: string;
    fecha_nacimiento?: string;
    telefono_celular?: string;
    tipoPaciente?: string;
  };
  initialData?: Partial<DatosEmergencia>;
  onGuardar?: (datos: DatosEmergencia) => void;
  onExportarExcel?: (datos: DatosEmergencia) => void;
  guardando?: boolean;
  exportando?: boolean;
  atencionId?: number;
}

export type HistoriaClinicaEmergenciaHandle = {
  getDatos: () => DatosEmergencia;
  clearAutosave?: () => void;
  isDirty?: () => boolean;
};

// ─── Colores exactos extraídos de la plantilla ───────────────────────────────
const C = {
  seccionA:   "#CCCCFF", // A. DATOS DEL ESTABLECIMIENTO (lila/azul claro)
  labelVerde: "#CCFFCC", // labels fila 2 (verde claro)
  seccion:    "#CCCCFF", // encabezados B-P (azul claro, igual que sección A)
  sub:        "#DCE6F1", // sub-encabezados internos (azul suave)
  lbl:        "#CCFFCC", // fondo de labels de campo (verde claro)
  ro:         "#F0F0F0", // campos readonly (auto desde BD)
  borde:      "#000000",
};

// ─── Catálogos ────────────────────────────────────────────────────────────────

const ACCIDENTES = [
  { key: "transito",       label: "ACCIDENTE DE TRÁNSITO" },
  { key: "caida",          label: "CAÍDA" },
  { key: "quemadura",      label: "QUEMADURA" },
  { key: "mordedura",      label: "MORDEDURA / PICADURA" },
  { key: "ahogamiento",    label: "AHOGAMIENTO / SUMERSIÓN" },
  { key: "cuerpo_extrano", label: "CUERPO EXTRAÑO" },
  { key: "aplastamiento",  label: "APLASTAMIENTO" },
  { key: "otro",           label: "OTRO ACCIDENTE" },
];

const VIOLENCIAS = [
  { key: "arma_fuego",    label: "VIOLENCIA: ARMA DE FUEGO" },
  { key: "arma_punzante", label: "VIOLENCIA: ARMA CORTO PUNZANTE" },
  { key: "rina",          label: "VIOLENCIA: RIÑA" },
  { key: "familiar",      label: "VIOLENCIA FAMILIAR" },
  { key: "fisica",        label: "PRESUNTA VIOLENCIA FÍSICA" },
  { key: "psicologica",   label: "PRESUNTA VIOLENCIA PSICOLÓGICA" },
  { key: "sexual",        label: "PRESUNTA VIOLENCIA SEXUAL" },
];

const INTOXICACIONES = [
  { key: "alcoholica",     label: "INTOX. ALCOHÓLICA" },
  { key: "alimentaria",    label: "INTOX. ALIMENTARIA" },
  { key: "drogas",         label: "INTOX. DROGAS" },
  { key: "gases",          label: "INHALACIÓN GASES" },
  { key: "otra",           label: "OTRA INTOXICACIÓN" },
  { key: "picadura",       label: "PICADURA / MORDEDURA" },
  { key: "envenenamiento", label: "ENVENENAMIENTO" },
  { key: "anafilaxia",     label: "ANAFILAXIA" },
];

const ANTECEDENTES = [
  { key: "alergicos",       label: "1. ALÉRGICOS" },
  { key: "clinicos",        label: "2. CLÍNICOS" },
  { key: "ginecologicos",   label: "3. GINECOLÓGICOS" },
  { key: "traumatologicos", label: "4. TRAUMATOLÓGICOS" },
  { key: "pediatricos",     label: "5. PEDIÁTRICOS" },
  { key: "quirurgicos",     label: "6. QUIRÚRGICOS" },
  { key: "farmacologicos",  label: "7. FARMACOLÓGICOS" },
  { key: "habitos",         label: "8. HÁBITOS" },
  { key: "familiares",      label: "9. FAMILIARES" },
  { key: "otros",           label: "10. OTROS" },
];

const EXAMENES_FISICOS = [
  { key: "piel_faneras",  label: "1. PIEL - FANERAS" },
  { key: "oidos",         label: "4. OÍDOS" },
  { key: "oro_faringe",   label: "7. ORO FARINGE" },
  { key: "torax",         label: "10. TÓRAX" },
  { key: "ingle_perine",  label: "13. INGLE-PERINÉ" },
  { key: "cabeza",        label: "2. CABEZA" },
  { key: "nariz",         label: "5. NARIZ" },
  { key: "cuello",        label: "8. CUELLO" },
  { key: "abdomen",       label: "11. ABDOMEN" },
  { key: "miembros_sup",  label: "14. MIEMBROS SUPERIORES" },
  { key: "ojos",          label: "3. OJOS" },
  { key: "boca",          label: "6. BOCA" },
  { key: "axilas_mamas",  label: "9. AXILAS - MAMAS" },
  { key: "columna",       label: "12. COLUMNA VERTEBRAL" },
  { key: "miembros_inf",  label: "15. MIEMBROS INFERIORES" },
];

const EXAMENES_COMP = [
  { key: "biometria",         label: "1. BIOMETRÍA HEMÁTICA" },
  { key: "uroanalisis",       label: "2. UROANÁLISIS" },
  { key: "quimica_sanguinea", label: "3. QUÍMICA SANGUÍNEA" },
  { key: "electrolitos",      label: "4. ELECTROLITOS" },
  { key: "gasometria",        label: "5. GASOMETRÍA" },
  { key: "electrocardiograma",label: "6. ELECTROCARDIOGRAMA" },
  { key: "endoscopia",        label: "7. ENDOSCOPÍA" },
  { key: "rx_torax",          label: "8. RX TÓRAX" },
  { key: "rx_abdomen",        label: "9. RX ABDOMEN" },
  { key: "rx_osea",           label: "10. RX ÓSEA" },
  { key: "eco_abdomen",       label: "11. ECO. ABDOMEN" },
  { key: "eco_pelvica",       label: "12. ECO. PÉLVICA" },
  { key: "tomografia",        label: "13. TOMOGRAFÍA" },
  { key: "resonancia",        label: "14. RESONANCIA" },
  { key: "interconsulta",     label: "15. INTERCONSULTA" },
  { key: "otros",             label: "16. OTROS" },
];

const EGRESO_OPCIONES = [
  { key: "vivo",             label: "VIVO" },
  { key: "estable",          label: "ESTABLE" },
  { key: "inestable",        label: "INESTABLE" },
  { key: "fallecido",        label: "FALLECIDO" },
  { key: "alta_definitiva",  label: "ALTA DEFINITIVA" },
  { key: "consulta_externa", label: "CONSULTA EXTERNA" },
  { key: "observacion",      label: "OBSERVACIÓN EMERGENCIA" },
  { key: "hospitalizacion",  label: "HOSPITALIZACIÓN" },
  { key: "referencia",       label: "REFERENCIA" },
  { key: "ref_inversa",      label: "REFERENCIA INVERSA" },
  { key: "derivacion",       label: "DERIVACIÓN" },
];

// ─── Estilos base ─────────────────────────────────────────────────────────────

const B: React.CSSProperties = { border: `1px solid ${C.borde}`, padding: 0, verticalAlign: "top" };
const BM: React.CSSProperties = { ...B, verticalAlign: "middle" };
const FONT = "Arial, sans-serif";

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SecBar({ letra, titulo, bg = C.seccion, rightComponent }: { letra: string; titulo: string; bg?: string; rightComponent?: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={12} style={{ ...B, background: bg, fontWeight: 700, fontSize: "9px", fontFamily: FONT, padding: "3px 6px", borderTop: "2px solid #000", letterSpacing: "0.04em" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{letra}. {titulo}</span>
          {rightComponent}
        </div>
      </td>
    </tr>
  );
}

function SubBar({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={12} style={{ ...B, background: C.sub, fontWeight: 700, fontSize: "8px", fontFamily: FONT, padding: "2px 6px" }}>
        {children}
      </td>
    </tr>
  );
}

function Lbl({ children, bg = C.lbl }: { children: React.ReactNode; bg?: string }) {
  return (
    <div style={{ fontSize: "7px", fontWeight: 700, padding: "2px 3px 1px", background: bg, color: "#000", lineHeight: 1.2, textAlign: "center", fontFamily: FONT }}>
      {children}
    </div>
  );
}

function Inp({ value, onChange, readOnly = false, center = false, placeholder = "", type = "text" }:
  { value: string; onChange?: (v: string) => void; readOnly?: boolean; center?: boolean; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value} readOnly={readOnly} placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      style={{ width: "100%", border: "none", outline: "none", background: readOnly ? C.ro : "transparent", fontSize: "9px", fontFamily: FONT, padding: "2px 3px", color: "#000", textAlign: center ? "center" : "left", boxSizing: "border-box" }} />
  );
}

function Txt({ value, onChange, rows = 2 }: { value: string; onChange?: (v: string) => void; rows?: number }) {
  const lineHeightPx = 9 * 1.4;
  const paddingPx = 4; // 2px top + 2px bottom
  const minHeight = Math.ceil(rows * lineHeightPx + paddingPx);

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
  };

  return (
    <textarea
      rows={rows}
      value={value}
      ref={(el) => {
        if (el) autoResize(el);
      }}
      onChange={(e) => {
        onChange?.(e.target.value);
        autoResize(e.target);
      }}
      style={{
        width: "100%", border: "none", outline: "none", background: "transparent",
        fontSize: "9px", fontFamily: FONT, padding: "2px 3px", resize: "none",
        color: "#000", lineHeight: 1.4, boxSizing: "border-box",
        overflow: "hidden", minHeight: `${minHeight}px`,
      }}
    />
  );
}

function RadioSiNo({ value, onChange, name }: { value: string; onChange: (v: "SI" | "NO") => void; name: string }) {
  return (
    <div style={{ display: "flex", gap: 8, padding: "3px 5px", alignItems: "center" }}>
      {(["SI", "NO"] as const).map((op) => (
        <label key={op} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "8px", fontFamily: FONT, cursor: "pointer" }}>
          <input type="radio" name={name} checked={value === op} onChange={() => onChange(op)} style={{ width: 10, height: 10 }} />
          {op}
        </label>
      ))}
    </div>
  );
}

function CkGrid({ opciones, selected, onChange, cols = 4 }: { opciones: { key: string; label: string }[]; selected: string[]; onChange: (s: string[]) => void; cols?: number }) {
  const toggle = (k: string) => onChange(selected.includes(k) ? selected.filter((x) => x !== k) : [...selected, k]);
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {opciones.map((op) => (
        <label key={op.key} style={{ display: "flex", alignItems: "center", gap: 3, padding: "3px 5px", fontSize: "8px", fontFamily: FONT, cursor: "pointer", borderRight: "1px solid #ddd" }}>
          <input type="checkbox" checked={selected.includes(op.key)} onChange={() => toggle(op.key)} style={{ width: 9, height: 9, flexShrink: 0 }} />
          {op.label}
        </label>
      ))}
    </div>
  );
}

function FirmaArea({ label }: { label: string }) {
  return (
    <div style={{ padding: "4px 6px", minHeight: 38, background: "#fafafa" }}>
      <div style={{ fontSize: "7px", color: "#888", textAlign: "center", fontFamily: FONT }}>{label}</div>
      <div style={{ borderBottom: "1px solid #bbb", marginTop: 18 }} />
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

const EmergenciaForm008 = React.forwardRef<HistoriaClinicaEmergenciaHandle, Props>(
  ({ paciente, initialData, onGuardar, onExportarExcel, guardando = false, exportando = false, atencionId }, ref) => {

  const hoy = new Date().toISOString().split("T")[0];
  const hora = new Date().toTimeString().slice(0, 5);

  const [d, setD] = useState<DatosEmergencia>({
    institucion: paciente?.tipoPaciente ?? "PARTICULAR", unicodigo: "62858", establecimiento: "NUEVO HOSPITAL PANAMERICANO",
    numero_historia_clinica: paciente?.cedula ?? "", numero_archivo: "",
    fecha_admision: hoy, nombre_admisionista: "", hc_establecimiento: "",
    primer_apellido: paciente?.primer_apellido ?? "", segundo_apellido: paciente?.segundo_apellido ?? "",
    primer_nombre: paciente?.primer_nombre ?? "", segundo_nombre: paciente?.segundo_nombre ?? "",
    tipo_doc: "CC/CI", estado_civil: "",
    sexo: paciente?.sexo
      ? paciente.sexo.toUpperCase().startsWith("F") ? "F" : paciente.sexo.toUpperCase().startsWith("M") ? "M" : paciente.sexo
      : "", telefono_fijo: "", telefono_celular: paciente?.telefono_celular ?? "",
    fecha_nacimiento: (paciente?.fecha_nacimiento ?? "").slice(0, 10),
    lugar_nacimiento: "", nacionalidad: "ECUATORIANA",
    edad: paciente?.edad?.toString() ?? "", condicion_edad: "A",
    grupo_prioritario: "", grupo_prioritario_especifique: "",
    autoidentificacion_etnica: "", nacionalidad_etnica: "", pueblos: "", nivel_educacion: "",
    estado_nivel_educacion: "", tipo_empresa_trabajo: "", ocupacion_profesion: "", seguro_salud: "",
    provincia: "", canton: "", parroquia: "", barrio_sector: "", calle_principal: "", calle_secundaria: "", referencia_domicilio: "",
    nombre_contacto: "", parentesco_contacto: "", direccion_contacto: "", telefono_contacto: "",
    forma_llegada: "", fuente_informacion: "", institucion_entrega: "", telefono_institucion: "",
    fecha_inicio_atencion: hoy, hora_inicio_atencion: hora, condicion_llegada: "", motivo_atencion: "",
    fecha_evento: "", hora_evento: "", lugar_evento: "", direccion_evento: "",
    custodia_policial: "", tipo_accidente: [], tipo_violencia: [], notificacion: "", tipo_intoxicacion: [],
    observaciones_accidente: "", aliento_alcoholico: false,
    antecedentes: [], antecedentes_no_aplica: false, antecedentes_descripcion: "",
    enfermedad_actual: "",
    sin_constantes_vitales: false, presion_arterial: "", pulso: "", frecuencia_respiratoria: "",
    pulsioximetria: "", perimetro_cefalico: "", peso: "", talla: "", glicemia_capilar: "",
    glasgow_ocular: "", glasgow_verbal: "", glasgow_motora: "",
    reaccion_pupila_der: "", reaccion_pupila_izq: "", llenado_capilar: "",
    examen_items: [], examen_fisico_descripcion: "", examen_trauma_critico: "",
    embarazo_no_aplica: false, numero_gestas: "", numero_partos: "", numero_abortos: "", numero_cesareas: "",
    fum: "", semanas_gestacion: "", movimiento_fetal: "", frecuencia_cardiaca_fetal: "",
    ruptura_membranas: "", tiempo_ruptura: "", afu: "", presentacion: "",
    dilatacion: "", borramiento: "", plano: "", pelvis_viable: "", sangrado_vaginal: "", contracciones: "", score_mama: "",
    examenes_no_aplica: false, examenes: [], examenes_resultados: "",
    dx_presuntivos: [{ descripcion: "", cie: "" }, { descripcion: "", cie: "" }, { descripcion: "", cie: "" }],
    dx_definitivos: [{ descripcion: "", cie: "" }, { descripcion: "", cie: "" }, { descripcion: "", cie: "" }],
    tratamientos: Array(5).fill(null).map(() => ({ medicamento: "", via: "", dosis: "", posologia: "", dias: "", descripcion: "" })),
    egreso_condicion: [], egreso_establecimiento: "", observaciones_egreso: "", dias_reposo: "",
    prof_fecha: hoy, prof_hora: hora, prof_primer_nombre: "", prof_primer_apellido: "", prof_segundo_apellido: "", prof_numero_documento: "",
    ...initialData,
  });

  const { isDirty, clearAutosave } = useFormAutosaveAndWarn({
    formId: `hc_emergencia_${atencionId || 'new'}_${paciente?.cedula || 'new'}`,
    initialData: initialData || {},
    currentData: d,
    onRestore: (saved) => setD(p => ({ ...p, ...saved })),
  });

  const sv = <K extends keyof DatosEmergencia>(k: K) => (v: DatosEmergencia[K]) => setD((p) => ({ ...p, [k]: v }));
  const st = (k: keyof DatosEmergencia) => (v: string) => {
    setD((p) => ({ ...p, [k]: v }));
    if (k === "antecedentes_descripcion") {
      window.dispatchEvent(new CustomEvent("sync_antecedentes", { detail: { source: "emergencia", value: v } }));
    }
    if (k === "enfermedad_actual") {
      window.dispatchEvent(new CustomEvent("sync_enfermedad_actual", { detail: { source: "emergencia", value: v } }));
    }
    if (k === "examen_fisico_descripcion") {
      window.dispatchEvent(new CustomEvent("sync_examen_fisico", { detail: { source: "emergencia", value: v } }));
    }
    if (["presion_arterial", "pulso", "frecuencia_respiratoria", "pulsioximetria", "perimetro_cefalico", "peso", "talla"].includes(k as string)) {
      window.dispatchEvent(new CustomEvent("sync_constante_vital", { detail: { source: "emergencia", field: k, value: v } }));
    }
  };
  const updDx = (t: "dx_presuntivos" | "dx_definitivos", i: number, f: "descripcion" | "cie", v: string) =>
    setD((p) => { const a = [...p[t]]; a[i] = { ...a[i], [f]: v }; return { ...p, [t]: a }; });
  const updTx = (i: number, f: keyof Tratamiento, v: string) =>
    setD((p) => { const a = [...p.tratamientos]; a[i] = { ...a[i], [f]: v }; return { ...p, tratamientos: a }; });

  const tbl: React.CSSProperties = { width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontFamily: FONT, fontSize: "9px" };

  useImperativeHandle(ref, () => ({
    getDatos: () => d,
    clearAutosave: () => clearAutosave(),
    isDirty: () => isDirty,
  }), [d, clearAutosave, isDirty]);

  useEffect(() => {
    const handleSyncAnt = (e: CustomEvent) => {
      if (e.detail.source !== "emergencia") {
        setD(p => ({ ...p, antecedentes_descripcion: e.detail.value }));
      }
    };
    const handleSyncEA = (e: CustomEvent) => {
      if (e.detail.source !== "emergencia") {
        setD(p => ({ ...p, enfermedad_actual: e.detail.value }));
      }
    };
    const handleSyncEF = (e: CustomEvent) => {
      if (e.detail.source !== "emergencia") {
        setD(p => ({ ...p, examen_fisico_descripcion: e.detail.value }));
      }
    };
    const handleSyncConstante = (e: CustomEvent) => {
      if (e.detail.source !== "emergencia") {
        setD(p => ({ ...p, [e.detail.field]: e.detail.value }));
      }
    };
    window.addEventListener("sync_antecedentes", handleSyncAnt as EventListener);
    window.addEventListener("sync_enfermedad_actual", handleSyncEA as EventListener);
    window.addEventListener("sync_examen_fisico", handleSyncEF as EventListener);
    window.addEventListener("sync_constante_vital", handleSyncConstante as EventListener);
    return () => {
      window.removeEventListener("sync_antecedentes", handleSyncAnt as EventListener);
      window.removeEventListener("sync_enfermedad_actual", handleSyncEA as EventListener);
      window.removeEventListener("sync_examen_fisico", handleSyncEF as EventListener);
      window.removeEventListener("sync_constante_vital", handleSyncConstante as EventListener);
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      <div style={{ overflowY: "visible", overflowX: "visible", background: "#fff" }}>
        <table style={tbl}>
          <tbody>

            {/* ══ A. DATOS DEL ESTABLECIMIENTO — lila #CCCCFF ══════════════ */}
            <tr>
              <td colSpan={12} style={{ ...B, background: C.seccionA, fontWeight: 700, fontSize: "9px", fontFamily: FONT, padding: "3px 6px" }}>
                A. DATOS DEL ESTABLECIMIENTO
              </td>
            </tr>
            <tr>
              {/* Labels con fondo verde claro #CCFFCC */}
              <td colSpan={3} style={{ ...B, background: C.labelVerde }}><Lbl bg={C.labelVerde}>INSTITUCIÓN DEL SISTEMA</Lbl></td>
              <td colSpan={1} style={{ ...B, background: C.labelVerde }}><Lbl bg={C.labelVerde}>UNICÓDIGO</Lbl></td>
              <td colSpan={4} style={{ ...B, background: C.labelVerde }}><Lbl bg={C.labelVerde}>ESTABLECIMIENTO DE SALUD</Lbl></td>
              <td colSpan={2} style={{ ...B, background: C.labelVerde }}><Lbl bg={C.labelVerde}>NÚMERO DE HISTORIA CLÍNICA ÚNICA</Lbl></td>
              <td colSpan={2} style={{ ...B, background: C.labelVerde }}><Lbl bg={C.labelVerde}>NÚMERO DE ARCHIVO</Lbl></td>
            </tr>
            <tr style={{ height: 20 }}>
              <td colSpan={3} style={B}><Inp value={d.institucion} onChange={st("institucion")} center /></td>
              <td colSpan={1} style={B}><Inp value={d.unicodigo} onChange={st("unicodigo")} center /></td>
              <td colSpan={4} style={B}><Inp value={d.establecimiento} onChange={st("establecimiento")} /></td>
              <td colSpan={2} style={B}><Inp value={d.numero_historia_clinica} onChange={st("numero_historia_clinica")} center /></td>
              <td colSpan={2} style={B}><Inp value={d.numero_archivo} onChange={st("numero_archivo")} center /></td>
            </tr>

            {/* ══ B. REGISTRO DE ADMISIÓN ═══════════════════════════════════ */}
            <SecBar letra="B" titulo="REGISTRO DE ADMISIÓN" />
            <tr>
              <td colSpan={4} style={B}><Lbl>FECHA DE ADMISIÓN (aaaa-mm-dd)</Lbl></td>
              <td colSpan={5} style={B}><Lbl>NOMBRE Y APELLIDO DEL ADMISIONISTA</Lbl></td>
              <td colSpan={3} style={B}><Lbl>HISTORIA CLÍNICA EN ESTE ESTABLECIMIENTO</Lbl></td>
            </tr>
            <tr style={{ height: 20 }}>
              <td colSpan={4} style={B}><Inp type="date" value={d.fecha_admision} onChange={st("fecha_admision")} /></td>
              <td colSpan={5} style={B}><Inp value={d.nombre_admisionista} onChange={st("nombre_admisionista")} /></td>
              <td colSpan={3} style={BM}><RadioSiNo value={d.hc_establecimiento} onChange={sv("hc_establecimiento")} name="hc_est" /></td>
            </tr>

            {/* Apellidos / Nombres — readonly desde BD */}
            <tr>
              <td colSpan={3} style={B}><Lbl>PRIMER APELLIDO</Lbl></td>
              <td colSpan={3} style={B}><Lbl>SEGUNDO APELLIDO</Lbl></td>
              <td colSpan={3} style={B}><Lbl>PRIMER NOMBRE</Lbl></td>
              <td colSpan={3} style={B}><Lbl>SEGUNDO NOMBRE</Lbl></td>
            </tr>
            <tr style={{ height: 20 }}>
              <td colSpan={3} style={B}><Inp value={d.primer_apellido} onChange={st("primer_apellido")} /></td>
              <td colSpan={3} style={B}><Inp value={d.segundo_apellido} onChange={st("segundo_apellido")} /></td>
              <td colSpan={3} style={B}><Inp value={d.primer_nombre} onChange={st("primer_nombre")} /></td>
              <td colSpan={3} style={B}><Inp value={d.segundo_nombre} onChange={st("segundo_nombre")} /></td>
            </tr>

            {/* Tipo de documento */}
            <tr>
              <td colSpan={12} style={B}>
                <Lbl>TIPO DE DOCUMENTO DE IDENTIFICACIÓN</Lbl>
                <div style={{ display: "flex", gap: 20, padding: "3px 8px" }}>
                  {[["CC/CI", "CC / CI"], ["PAS", "PASAPORTE"], ["CARNE", "CARNÉ"], ["SD", "S/D"]].map(([val, lbl]) => (
                    <label key={val} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "8px", fontFamily: FONT, cursor: "pointer" }}>
                      <input type="radio" name="tipo_doc" checked={d.tipo_doc === val} onChange={() => sv("tipo_doc")(val as any)} style={{ width: 10, height: 10 }} />
                      {lbl}
                    </label>
                  ))}
                </div>
              </td>
            </tr>

            {/* Estado civil / Sexo / Teléfonos */}
            <tr>
              <td colSpan={4} style={B}><Lbl>ESTADO CIVIL</Lbl></td>
              <td colSpan={2} style={B}><Lbl>SEXO</Lbl></td>
              <td colSpan={3} style={B}><Lbl>Nº TELÉFONO FIJO</Lbl></td>
              <td colSpan={3} style={B}><Lbl>Nº TELÉFONO CELULAR</Lbl></td>
            </tr>
            <tr style={{ height: 26 }}>
              <td colSpan={4} style={B}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "2px 4px" }}>
                  {[["SOL","SOL"],["CAS","CAS"],["DIV","DIV"],["VIU","VIU"],["UN","UN"],["UH","U-H"],["NA","N/A"]].map(([val, lbl]) => (
                    <label key={val} style={{ display: "flex", alignItems: "center", gap: 2, fontSize: "8px", fontFamily: FONT, cursor: "pointer" }}>
                      <input type="radio" name="estado_civil" checked={d.estado_civil === val} onChange={() => sv("estado_civil")(val as any)} style={{ width: 9, height: 9 }} />
                      {lbl}
                    </label>
                  ))}
                </div>
              </td>
              <td colSpan={2} style={B}><Inp value={d.sexo} onChange={st("sexo")} center /></td>
              <td colSpan={3} style={B}><Inp value={d.telefono_fijo} onChange={st("telefono_fijo")} /></td>
              <td colSpan={3} style={B}><Inp value={d.telefono_celular} onChange={st("telefono_celular")} /></td>
            </tr>

            {/* Fecha nacimiento / Lugar / Nacionalidad / Edad / Condición / Grupo prioritario */}
            <tr>
              <td colSpan={3} style={B}><Lbl>FECHA DE NACIMIENTO (aaaa-mm-dd)</Lbl></td>
              <td colSpan={3} style={B}><Lbl>LUGAR DE NACIMIENTO</Lbl></td>
              <td colSpan={2} style={B}><Lbl>NACIONALIDAD</Lbl></td>
              <td colSpan={1} style={B}><Lbl>EDAD</Lbl></td>
              <td colSpan={2} style={B}><Lbl>CONDICIÓN EDAD</Lbl></td>
              <td colSpan={1} style={B}><Lbl>GRUPO PRIORITARIO</Lbl></td>
            </tr>
            <tr style={{ height: 24 }}>
              <td colSpan={3} style={B}><Inp value={d.fecha_nacimiento} onChange={st("fecha_nacimiento")} center /></td>
              <td colSpan={3} style={B}><Inp value={d.lugar_nacimiento} onChange={st("lugar_nacimiento")} /></td>
              <td colSpan={2} style={B}><Inp value={d.nacionalidad} onChange={st("nacionalidad")} /></td>
              <td colSpan={1} style={B}><Inp value={d.edad} onChange={st("edad")} center /></td>
              <td colSpan={2} style={BM}>
                <div style={{ display: "flex", justifyContent: "space-around", padding: "2px" }}>
                  {(["H","D","M","A"] as const).map((op) => (
                    <label key={op} style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: "7px", fontFamily: FONT, cursor: "pointer", gap: 1 }}>
                      <input type="radio" name="cond_edad" checked={d.condicion_edad === op} onChange={() => sv("condicion_edad")(op)} style={{ width: 9, height: 9 }} />
                      {op}
                    </label>
                  ))}
                </div>
              </td>
              <td colSpan={1} style={BM}><RadioSiNo value={d.grupo_prioritario} onChange={sv("grupo_prioritario")} name="grupo_p" /></td>
            </tr>
            {d.grupo_prioritario === "SI" && (
              <tr style={{ height: 18 }}>
                <td colSpan={12} style={B}><Lbl>ESPECIFIQUE GRUPO PRIORITARIO</Lbl><Inp value={d.grupo_prioritario_especifique} onChange={st("grupo_prioritario_especifique")} /></td>
              </tr>
            )}

            {/* Etnia / Educación */}
            <tr>
              <td colSpan={3} style={B}><Lbl>AUTOIDENTIFICACIÓN ÉTNICA</Lbl></td>
              <td colSpan={3} style={B}><Lbl>NACIONALIDAD ÉTNICA</Lbl></td>
              <td colSpan={3} style={B}><Lbl>*PUEBLOS</Lbl></td>
              <td colSpan={3} style={B}><Lbl>NIVEL DE EDUCACIÓN</Lbl></td>
            </tr>
            <tr style={{ height: 20 }}>
              <td colSpan={3} style={B}><Inp value={d.autoidentificacion_etnica} onChange={st("autoidentificacion_etnica")} /></td>
              <td colSpan={3} style={B}><Inp value={d.nacionalidad_etnica} onChange={st("nacionalidad_etnica")} /></td>
              <td colSpan={3} style={B}><Inp value={d.pueblos} onChange={st("pueblos")} /></td>
              <td colSpan={3} style={B}><Inp value={d.nivel_educacion} onChange={st("nivel_educacion")} /></td>
            </tr>

            {/* Estado educación / Empresa / Ocupación / Seguro */}
            <tr>
              <td colSpan={3} style={B}><Lbl>ESTADO DEL NIVEL DE EDUCACIÓN</Lbl></td>
              <td colSpan={3} style={B}><Lbl>TIPO DE EMPRESA DE TRABAJO</Lbl></td>
              <td colSpan={3} style={B}><Lbl>OCUPACIÓN / PROFESIÓN</Lbl></td>
              <td colSpan={3} style={B}><Lbl>SEGURO DE SALUD PRINCIPAL</Lbl></td>
            </tr>
            <tr style={{ height: 26 }}>
              <td colSpan={3} style={B}><Inp value={d.estado_nivel_educacion} onChange={st("estado_nivel_educacion")} /></td>
              <td colSpan={3} style={B}><Inp value={d.tipo_empresa_trabajo} onChange={st("tipo_empresa_trabajo")} /></td>
              <td colSpan={3} style={B}><Inp value={d.ocupacion_profesion} onChange={st("ocupacion_profesion")} /></td>
              <td colSpan={3} style={B}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3, padding: "2px 3px" }}>
                  {[["IESS_G","IESS-G"],["IESS_C","IESS-C"],["ISSPOL","ISSPOL"],["ISSFA","ISSFA"],["PRIV","PRIV."],["NING","NING."]].map(([val,lbl]) => (
                    <label key={val} style={{ display: "flex", alignItems: "center", gap: 2, fontSize: "7.5px", fontFamily: FONT, cursor: "pointer" }}>
                      <input type="radio" name="seguro" checked={d.seguro_salud === val} onChange={() => sv("seguro_salud")(val as any)} style={{ width: 9, height: 9 }} />
                      {lbl}
                    </label>
                  ))}
                </div>
              </td>
            </tr>

            {/* Residencia */}
            <SubBar>RESIDENCIA HABITUAL</SubBar>
            <tr>
              <td colSpan={2} style={B}><Lbl>PROVINCIA</Lbl></td>
              <td colSpan={2} style={B}><Lbl>CANTÓN</Lbl></td>
              <td colSpan={2} style={B}><Lbl>PARROQUIA</Lbl></td>
              <td colSpan={3} style={B}><Lbl>BARRIO O SECTOR</Lbl></td>
              <td colSpan={3} style={B}><Lbl>CALLE PRINCIPAL</Lbl></td>
            </tr>
            <tr style={{ height: 20 }}>
              <td colSpan={2} style={B}><Inp value={d.provincia} onChange={st("provincia")} /></td>
              <td colSpan={2} style={B}><Inp value={d.canton} onChange={st("canton")} /></td>
              <td colSpan={2} style={B}><Inp value={d.parroquia} onChange={st("parroquia")} /></td>
              <td colSpan={3} style={B}><Inp value={d.barrio_sector} onChange={st("barrio_sector")} /></td>
              <td colSpan={3} style={B}><Inp value={d.calle_principal} onChange={st("calle_principal")} /></td>
            </tr>
            <tr>
              <td colSpan={4} style={B}><Lbl>CALLE SECUNDARIA / NÚMERO</Lbl></td>
              <td colSpan={8} style={B}><Lbl>REFERENCIA</Lbl></td>
            </tr>
            <tr style={{ height: 20 }}>
              <td colSpan={4} style={B}><Inp value={d.calle_secundaria} onChange={st("calle_secundaria")} /></td>
              <td colSpan={8} style={B}><Inp value={d.referencia_domicilio} onChange={st("referencia_domicilio")} /></td>
            </tr>

            {/* Contacto de emergencia */}
            <tr>
              <td colSpan={4} style={B}><Lbl>EN CASO NECESARIO LLAMAR A (NOMBRE Y APELLIDO)</Lbl></td>
              <td colSpan={2} style={B}><Lbl>PARENTESCO</Lbl></td>
              <td colSpan={4} style={B}><Lbl>DIRECCIÓN</Lbl></td>
              <td colSpan={2} style={B}><Lbl>Nº TELÉFONO</Lbl></td>
            </tr>
            <tr style={{ height: 20 }}>
              <td colSpan={4} style={B}><Inp value={d.nombre_contacto} onChange={st("nombre_contacto")} /></td>
              <td colSpan={2} style={B}><Inp value={d.parentesco_contacto} onChange={st("parentesco_contacto")} /></td>
              <td colSpan={4} style={B}><Inp value={d.direccion_contacto} onChange={st("direccion_contacto")} /></td>
              <td colSpan={2} style={B}><Inp value={d.telefono_contacto} onChange={st("telefono_contacto")} /></td>
            </tr>

            {/* Forma de llegada / Fuente / Institución */}
            <tr>
              <td colSpan={3} style={B}><Lbl>FORMA DE LLEGADA</Lbl></td>
              <td colSpan={3} style={B}><Lbl>FUENTE DE INFORMACIÓN</Lbl></td>
              <td colSpan={4} style={B}><Lbl>INSTITUCIÓN O PERSONA QUE ENTREGA AL PACIENTE</Lbl></td>
              <td colSpan={2} style={B}><Lbl>Nº TELÉFONO</Lbl></td>
            </tr>
            <tr style={{ height: 30 }}>
              <td colSpan={3} style={B}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: "3px 5px" }}>
                  {[["AMBULATORIO","AMBULATORIO"],["AMBULANCIA","AMBULANCIA"],["OTRO","OTRO TRANSPORTE"]].map(([val,lbl]) => (
                    <label key={val} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "8px", fontFamily: FONT, cursor: "pointer" }}>
                      <input type="radio" name="forma_llegada" checked={d.forma_llegada === val} onChange={() => sv("forma_llegada")(val as any)} style={{ width: 9, height: 9 }} />
                      {lbl}
                    </label>
                  ))}
                </div>
              </td>
              <td colSpan={3} style={B}><Inp value={d.fuente_informacion} onChange={st("fuente_informacion")} /></td>
              <td colSpan={4} style={B}><Inp value={d.institucion_entrega} onChange={st("institucion_entrega")} /></td>
              <td colSpan={2} style={B}><Inp value={d.telefono_institucion} onChange={st("telefono_institucion")} /></td>
            </tr>

            {/* Footer pág 1 */}
            <tr>
              <td colSpan={6} style={{ ...B, fontSize: "8px", fontWeight: 700, fontFamily: FONT, padding: "2px 4px" }}>SNS-MSP/HCU-form.008/2021</td>
              <td colSpan={6} style={{ ...B, fontSize: "9px", fontWeight: 700, fontFamily: FONT, textAlign: "right", padding: "2px 4px" }}>EMERGENCIA (1)</td>
            </tr>

            {/* ══ C. INICIO DE ATENCIÓN ════════════════════════════════════ */}
            <SecBar letra="C" titulo="INICIO DE ATENCIÓN" />
            <tr>
              <td colSpan={3} style={B}><Lbl>FECHA (aaaa-mm-dd)</Lbl></td>
              <td colSpan={2} style={B}><Lbl>HORA (hh:mm)</Lbl></td>
              <td colSpan={3} style={B}><Lbl>CONDICIÓN DE LLEGADA</Lbl></td>
              <td colSpan={4} style={B}><Lbl>MOTIVO DE ATENCIÓN</Lbl></td>
            </tr>
            <tr style={{ height: 32 }}>
              <td colSpan={3} style={B}><Inp type="date" value={d.fecha_inicio_atencion} onChange={st("fecha_inicio_atencion")} /></td>
              <td colSpan={2} style={B}><Inp type="time" value={d.hora_inicio_atencion} onChange={st("hora_inicio_atencion")} /></td>
              <td colSpan={3} style={BM}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: "3px 5px" }}>
                  {[["ESTABLE","ESTABLE"],["INESTABLE","INESTABLE"],["FALLECIDO","FALLECIDO"]].map(([val,lbl]) => (
                    <label key={val} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "8px", fontFamily: FONT, cursor: "pointer" }}>
                      <input type="radio" name="cond_llegada" checked={d.condicion_llegada === val} onChange={() => sv("condicion_llegada")(val as any)} style={{ width: 9, height: 9 }} />
                      {lbl}
                    </label>
                  ))}
                </div>
              </td>
              <td colSpan={4} style={B}><Txt value={d.motivo_atencion} onChange={st("motivo_atencion")} rows={3} /></td>
            </tr>

            {/* ══ D. ACCIDENTE, VIOLENCIA, INTOXICACIÓN ═══════════════════ */}
            <SecBar letra="D" titulo="ACCIDENTE, VIOLENCIA, INTOXICACIÓN" />
            <tr>
              <td colSpan={2} style={B}><Lbl>FECHA (aaaa-mm-dd)</Lbl></td>
              <td colSpan={2} style={B}><Lbl>HORA (hh:mm)</Lbl></td>
              <td colSpan={3} style={B}><Lbl>LUGAR DEL EVENTO</Lbl></td>
              <td colSpan={4} style={B}><Lbl>DIRECCIÓN DEL EVENTO</Lbl></td>
              <td colSpan={1} style={B}><Lbl>CUSTODIA POLICIAL</Lbl></td>
            </tr>
            <tr style={{ height: 22 }}>
              <td colSpan={2} style={B}><Inp type="date" value={d.fecha_evento} onChange={st("fecha_evento")} /></td>
              <td colSpan={2} style={B}><Inp type="time" value={d.hora_evento} onChange={st("hora_evento")} /></td>
              <td colSpan={3} style={B}><Inp value={d.lugar_evento} onChange={st("lugar_evento")} /></td>
              <td colSpan={4} style={B}><Inp value={d.direccion_evento} onChange={st("direccion_evento")} /></td>
              <td colSpan={1} style={BM}><RadioSiNo value={d.custodia_policial} onChange={sv("custodia_policial")} name="custodia" /></td>
            </tr>

            <SubBar>TIPO DE ACCIDENTE</SubBar>
            <tr><td colSpan={12} style={B}><CkGrid opciones={ACCIDENTES} selected={d.tipo_accidente} onChange={sv("tipo_accidente")} cols={4} /></td></tr>

            <SubBar>TIPO DE VIOLENCIA</SubBar>
            <tr>
              <td colSpan={10} style={B}><CkGrid opciones={VIOLENCIAS} selected={d.tipo_violencia} onChange={sv("tipo_violencia")} cols={4} /></td>
              <td colSpan={2} style={BM}>
                <div style={{ padding: "3px 5px" }}>
                  <div style={{ fontSize: "7px", fontWeight: 700, fontFamily: FONT, marginBottom: 3 }}>NOTIFICACIÓN</div>
                  <RadioSiNo value={d.notificacion} onChange={sv("notificacion")} name="notif" />
                </div>
              </td>
            </tr>

            <SubBar>TIPO DE INTOXICACIÓN</SubBar>
            <tr><td colSpan={12} style={B}><CkGrid opciones={INTOXICACIONES} selected={d.tipo_intoxicacion} onChange={sv("tipo_intoxicacion")} cols={4} /></td></tr>

            <tr>
              <td colSpan={10} style={B}><Lbl>OBSERVACIONES</Lbl><Txt value={d.observaciones_accidente} onChange={st("observaciones_accidente")} rows={2} /></td>
              <td colSpan={2} style={BM}>
                <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px", cursor: "pointer" }}>
                  <input type="checkbox" checked={d.aliento_alcoholico} onChange={(e) => sv("aliento_alcoholico")(e.target.checked)} style={{ width: 11, height: 11 }} />
                  <span style={{ fontSize: "7.5px", fontFamily: FONT, textAlign: "center" }}>SUGESTIVO DE ALIENTO ALCOHÓLICO</span>
                </label>
              </td>
            </tr>

            {/* ══ E. ANTECEDENTES PATOLÓGICOS ═════════════════════════════ */}
            <SecBar letra="E" titulo="ANTECEDENTES PATOLÓGICOS PERSONALES Y FAMILIARES" />
            <tr>
              <td colSpan={12} style={B}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 5px" }}>
                  <span style={{ fontSize: "7px", color: "#555", fontFamily: FONT }}>MARCAR CON X EL NÚMERO CORRESPONDIENTE Y DESCRIBA SEÑALANDO EL NÚMERO</span>
                  <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "8px", fontFamily: FONT, cursor: "pointer" }}>
                    <input type="checkbox" checked={d.antecedentes_no_aplica} onChange={(e) => sv("antecedentes_no_aplica")(e.target.checked)} style={{ width: 9, height: 9 }} />
                    NO APLICA
                  </label>
                </div>
                <CkGrid opciones={ANTECEDENTES} selected={d.antecedentes} onChange={sv("antecedentes")} cols={5} />
              </td>
            </tr>
            <tr>
              <td colSpan={12} style={B}><Lbl>DESCRIPCIÓN (señalar el número correspondiente)</Lbl><RichTextEvolucion value={d.antecedentes_descripcion} onChange={st("antecedentes_descripcion")} minHeight="80px" /></td>
            </tr>

            {/* ══ F. ENFERMEDAD O PROBLEMA ACTUAL ═════════════════════════ */}
            <SecBar letra="F" titulo="ENFERMEDAD O PROBLEMA ACTUAL" />
            <tr>
              <td colSpan={12} style={B}>
                <div style={{ fontSize: "7px", color: "#555", fontFamily: FONT, padding: "2px 5px" }}>CRONOLOGÍA — LOCALIZACIÓN — CARACTERÍSTICAS — INTENSIDAD — FRECUENCIA</div>
                <RichTextEvolucion value={d.enfermedad_actual} onChange={st("enfermedad_actual")} minHeight="95px" />
              </td>
            </tr>

            {/* Footer pág 2 */}
            <tr>
              <td colSpan={6} style={{ ...B, fontSize: "8px", fontWeight: 700, fontFamily: FONT, padding: "2px 4px" }}>SNS-MSP/HCU-form.008/2021</td>
              <td colSpan={6} style={{ ...B, fontSize: "9px", fontWeight: 700, fontFamily: FONT, textAlign: "right", padding: "2px 4px" }}>EMERGENCIA (2)</td>
            </tr>

            {/* ══ G. CONSTANTES VITALES Y ANTROPOMETRÍA ═══════════════════ */}
            <SecBar letra="G" titulo="CONSTANTES VITALES Y ANTROPOMETRÍA" />
            <tr>
              <td colSpan={12} style={B}>
                <label style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", cursor: "pointer", fontSize: "8px", fontFamily: FONT }}>
                  <input type="checkbox" checked={d.sin_constantes_vitales} onChange={(e) => sv("sin_constantes_vitales")(e.target.checked)} style={{ width: 10, height: 10 }} />
                  SIN CONSTANTES VITALES
                </label>
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={B}><Lbl>PRESIÓN ARTERIAL (mmHg)</Lbl></td>
              <td colSpan={2} style={B}><Lbl>PULSO / min</Lbl></td>
              <td colSpan={2} style={B}><Lbl>FREC. RESP. / min</Lbl></td>
              <td colSpan={2} style={B}><Lbl>PULSIOXIMETRÍA (%)</Lbl></td>
              <td colSpan={2} style={B}><Lbl>PERÍMETRO CEFÁLICO (cm)</Lbl></td>
              <td colSpan={1} style={B}><Lbl>PESO (kg)</Lbl></td>
              <td colSpan={1} style={B}><Lbl>TALLA (cm)</Lbl></td>
            </tr>
            <tr style={{ height: 20 }}>
              <td colSpan={2} style={B}><Inp value={d.presion_arterial} onChange={st("presion_arterial")} center /></td>
              <td colSpan={2} style={B}><Inp value={d.pulso} onChange={st("pulso")} center /></td>
              <td colSpan={2} style={B}><Inp value={d.frecuencia_respiratoria} onChange={st("frecuencia_respiratoria")} center /></td>
              <td colSpan={2} style={B}><Inp value={d.pulsioximetria} onChange={st("pulsioximetria")} center /></td>
              <td colSpan={2} style={B}><Inp value={d.perimetro_cefalico} onChange={st("perimetro_cefalico")} center /></td>
              <td colSpan={1} style={B}><Inp value={d.peso} onChange={st("peso")} center /></td>
              <td colSpan={1} style={B}><Inp value={d.talla} onChange={st("talla")} center /></td>
            </tr>
            <tr>
              <td colSpan={2} style={B}><Lbl>GLICEMIA CAPILAR (mg/dl)</Lbl></td>
              <td colSpan={2} style={B}><Lbl>GLASGOW OCULAR (4)</Lbl></td>
              <td colSpan={2} style={B}><Lbl>VERBAL (5)</Lbl></td>
              <td colSpan={2} style={B}><Lbl>MOTORA (6)</Lbl></td>
              <td colSpan={2} style={B}><Lbl>REACCIÓN PUPILA DER.</Lbl></td>
              <td colSpan={2} style={B}><Lbl>REACCIÓN PUPILA IZQ.</Lbl></td>
            </tr>
            <tr style={{ height: 20 }}>
              <td colSpan={2} style={B}><Inp value={d.glicemia_capilar} onChange={st("glicemia_capilar")} center /></td>
              <td colSpan={2} style={B}><Inp value={d.glasgow_ocular} onChange={st("glasgow_ocular")} center /></td>
              <td colSpan={2} style={B}><Inp value={d.glasgow_verbal} onChange={st("glasgow_verbal")} center /></td>
              <td colSpan={2} style={B}><Inp value={d.glasgow_motora} onChange={st("glasgow_motora")} center /></td>
              <td colSpan={2} style={B}><Inp value={d.reaccion_pupila_der} onChange={st("reaccion_pupila_der")} center /></td>
              <td colSpan={2} style={B}><Inp value={d.reaccion_pupila_izq} onChange={st("reaccion_pupila_izq")} center /></td>
            </tr>
            <tr style={{ height: 20 }}>
              <td colSpan={2} style={B}><Lbl>T. LLENADO CAPILAR</Lbl></td>
              <td colSpan={10} style={B}><Inp value={d.llenado_capilar} onChange={st("llenado_capilar")} /></td>
            </tr>

            {/* ══ H. EXAMEN FÍSICO ═════════════════════════════════════════ */}
            <SecBar letra="H" titulo='EXAMEN FÍSICO — MARCAR "X" CUANDO PRESENTE PATOLOGÍA Y DESCRIBA' />
            <tr><td colSpan={12} style={B}><CkGrid opciones={EXAMENES_FISICOS} selected={d.examen_items} onChange={sv("examen_items")} cols={5} /></td></tr>
            <tr>
              <td colSpan={12} style={B}><Lbl>DESCRIPCIÓN DEL EXAMEN FÍSICO</Lbl><RichTextEvolucion value={d.examen_fisico_descripcion} onChange={st("examen_fisico_descripcion")} minHeight="80px" /></td>
            </tr>

            {/* ══ I. EXAMEN FÍSICO TRAUMA / CRÍTICO ═══════════════════════ */}
            <SecBar letra="I" titulo="EXAMEN FÍSICO DE TRAUMA / CRÍTICO" />
            <tr>
              <td colSpan={12} style={B}><RichTextEvolucion value={d.examen_trauma_critico} onChange={st("examen_trauma_critico")} minHeight="80px" /></td>
            </tr>

            {/* ══ J. EMBARAZO - PARTO ══════════════════════════════════════ */}
            <SecBar letra="J" titulo="EMBARAZO - PARTO" />
            <tr>
              <td colSpan={12} style={B}>
                <label style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", cursor: "pointer", fontSize: "8px", fontFamily: FONT }}>
                  <input type="checkbox" checked={d.embarazo_no_aplica} onChange={(e) => sv("embarazo_no_aplica")(e.target.checked)} style={{ width: 10, height: 10 }} />
                  NO APLICA
                </label>
              </td>
            </tr>
            {!d.embarazo_no_aplica && (<>
              <tr>
                <td colSpan={2} style={B}><Lbl>N° GESTAS</Lbl></td>
                <td colSpan={2} style={B}><Lbl>N° PARTOS</Lbl></td>
                <td colSpan={2} style={B}><Lbl>N° ABORTOS</Lbl></td>
                <td colSpan={2} style={B}><Lbl>N° CESÁREAS</Lbl></td>
                <td colSpan={2} style={B}><Lbl>FUM</Lbl></td>
                <td colSpan={2} style={B}><Lbl>SEM. GESTACIÓN</Lbl></td>
              </tr>
              <tr style={{ height: 20 }}>
                <td colSpan={2} style={B}><Inp value={d.numero_gestas} onChange={st("numero_gestas")} center /></td>
                <td colSpan={2} style={B}><Inp value={d.numero_partos} onChange={st("numero_partos")} center /></td>
                <td colSpan={2} style={B}><Inp value={d.numero_abortos} onChange={st("numero_abortos")} center /></td>
                <td colSpan={2} style={B}><Inp value={d.numero_cesareas} onChange={st("numero_cesareas")} center /></td>
                <td colSpan={2} style={B}><Inp value={d.fum} onChange={st("fum")} center /></td>
                <td colSpan={2} style={B}><Inp value={d.semanas_gestacion} onChange={st("semanas_gestacion")} center /></td>
              </tr>
              <tr>
                <td colSpan={2} style={B}><Lbl>MOV. FETAL</Lbl></td>
                <td colSpan={2} style={B}><Lbl>FC FETAL</Lbl></td>
                <td colSpan={2} style={B}><Lbl>RUPTURA MEMBRANAS</Lbl></td>
                <td colSpan={2} style={B}><Lbl>TIEMPO RUPTURA</Lbl></td>
                <td colSpan={2} style={B}><Lbl>AFU</Lbl></td>
                <td colSpan={2} style={B}><Lbl>PRESENTACIÓN</Lbl></td>
              </tr>
              <tr style={{ height: 20 }}>
                <td colSpan={2} style={B}><Inp value={d.movimiento_fetal} onChange={st("movimiento_fetal")} center /></td>
                <td colSpan={2} style={B}><Inp value={d.frecuencia_cardiaca_fetal} onChange={st("frecuencia_cardiaca_fetal")} center /></td>
                <td colSpan={2} style={B}><Inp value={d.ruptura_membranas} onChange={st("ruptura_membranas")} center /></td>
                <td colSpan={2} style={B}><Inp value={d.tiempo_ruptura} onChange={st("tiempo_ruptura")} center /></td>
                <td colSpan={2} style={B}><Inp value={d.afu} onChange={st("afu")} center /></td>
                <td colSpan={2} style={B}><Inp value={d.presentacion} onChange={st("presentacion")} center /></td>
              </tr>
              <tr>
                <td colSpan={2} style={B}><Lbl>DILATACIÓN</Lbl></td>
                <td colSpan={2} style={B}><Lbl>BORRAMIENTO</Lbl></td>
                <td colSpan={2} style={B}><Lbl>PLANO</Lbl></td>
                <td colSpan={2} style={B}><Lbl>PELVIS VIABLE</Lbl></td>
                <td colSpan={2} style={B}><Lbl>SANGRADO VAGINAL</Lbl></td>
                <td colSpan={2} style={B}><Lbl>CONTRACCIONES</Lbl></td>
              </tr>
              <tr style={{ height: 20 }}>
                <td colSpan={2} style={B}><Inp value={d.dilatacion} onChange={st("dilatacion")} center /></td>
                <td colSpan={2} style={B}><Inp value={d.borramiento} onChange={st("borramiento")} center /></td>
                <td colSpan={2} style={B}><Inp value={d.plano} onChange={st("plano")} center /></td>
                <td colSpan={2} style={B}><Inp value={d.pelvis_viable} onChange={st("pelvis_viable")} center /></td>
                <td colSpan={2} style={B}><Inp value={d.sangrado_vaginal} onChange={st("sangrado_vaginal")} center /></td>
                <td colSpan={2} style={B}><Inp value={d.contracciones} onChange={st("contracciones")} center /></td>
              </tr>
              <tr style={{ height: 20 }}>
                <td colSpan={2} style={B}><Lbl>SCORE MAMÁ</Lbl></td>
                <td colSpan={10} style={B}><Inp value={d.score_mama} onChange={st("score_mama")} /></td>
              </tr>
            </>)}

            {/* Footer pág 3 */}
            <tr>
              <td colSpan={6} style={{ ...B, fontSize: "8px", fontWeight: 700, fontFamily: FONT, padding: "2px 4px" }}>SNS-MSP/HCU-form.008/2021</td>
              <td colSpan={6} style={{ ...B, fontSize: "9px", fontWeight: 700, fontFamily: FONT, textAlign: "right", padding: "2px 4px" }}>EMERGENCIA (3)</td>
            </tr>

            {/* ══ K. EXÁMENES COMPLEMENTARIOS ══════════════════════════════ */}
            <SecBar letra="K" titulo="EXÁMENES COMPLEMENTARIOS" />
            <tr>
              <td colSpan={12} style={B}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 5px" }}>
                  <span style={{ fontSize: "7px", color: "#555", fontFamily: FONT }}>MARCAR CON X LOS QUE CORRESPONDAN</span>
                  <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "8px", fontFamily: FONT, cursor: "pointer" }}>
                    <input type="checkbox" checked={d.examenes_no_aplica} onChange={(e) => sv("examenes_no_aplica")(e.target.checked)} style={{ width: 9, height: 9 }} />
                    NO APLICA
                  </label>
                </div>
                <CkGrid opciones={EXAMENES_COMP} selected={d.examenes} onChange={sv("examenes")} cols={4} />
              </td>
            </tr>
            <tr>
              <td colSpan={12} style={B}><Lbl>RESULTADOS / DESCRIPCIÓN</Lbl><Txt value={d.examenes_resultados} onChange={st("examenes_resultados")} rows={4} /></td>
            </tr>

            {/* ══ L + M. DIAGNÓSTICOS ══════════════════════════════════════ */}
            <tr>
              <td colSpan={6} style={{ ...B, background: C.seccion, fontWeight: 700, fontSize: "9px", fontFamily: FONT, padding: "3px 6px", borderTop: "2px solid #000" }}>L. DIAGNÓSTICOS PRESUNTIVOS</td>
              <td colSpan={6} style={{ ...B, background: C.seccion, fontWeight: 700, fontSize: "9px", fontFamily: FONT, padding: "3px 6px", borderTop: "2px solid #000" }}>M. DIAGNÓSTICOS DEFINITIVOS</td>
            </tr>
            <tr>
              <td colSpan={5} style={B}><Lbl>DIAGNÓSTICO</Lbl></td>
              <td colSpan={1} style={B}><Lbl>CIE</Lbl></td>
              <td colSpan={5} style={B}><Lbl>DIAGNÓSTICO</Lbl></td>
              <td colSpan={1} style={B}><Lbl>CIE</Lbl></td>
            </tr>
            {[0, 1, 2].map((i) => (
              <tr key={i} style={{ height: 22 }}>
                <Cie10Autocomplete
                  cie={d.dx_presuntivos[i].cie}
                  descripcion={d.dx_presuntivos[i].descripcion}
                  onChange={(cie, desc) => {
                    updDx("dx_presuntivos", i, "cie", cie);
                    updDx("dx_presuntivos", i, "descripcion", desc);
                  }}
                  placeholderDesc={`${i + 1}.`}
                  colSpanDesc={5}
                  colSpanCie={1}
                  cellStyle={B}
                />
                <Cie10Autocomplete
                  cie={d.dx_definitivos[i].cie}
                  descripcion={d.dx_definitivos[i].descripcion}
                  onChange={(cie, desc) => {
                    updDx("dx_definitivos", i, "cie", cie);
                    updDx("dx_definitivos", i, "descripcion", desc);
                  }}
                  placeholderDesc={`${i + 1}.`}
                  colSpanDesc={5}
                  colSpanCie={1}
                  cellStyle={B}
                />
              </tr>
            ))}

            {/* ══ N. PLAN DE TRATAMIENTO ═══════════════════════════════════ */}
            <SecBar letra="N" titulo="PLAN DE TRATAMIENTO" />
            <tr>
              <td colSpan={5} style={B}><Lbl>MEDICAMENTOS</Lbl></td>
              <td colSpan={2} style={B}><Lbl>VÍA</Lbl></td>
              <td colSpan={2} style={B}><Lbl>DOSIS</Lbl></td>
              <td colSpan={2} style={B}><Lbl>POSOLOGÍA</Lbl></td>
              <td colSpan={1} style={B}><Lbl>DÍAS</Lbl></td>
            </tr>
            {d.tratamientos.map((tx, i) => (
              <tr key={`tx-${i}`} style={{ height: 20 }}>
                <td colSpan={5} style={B}><Inp value={tx.medicamento} onChange={(v) => updTx(i, "medicamento", v)} placeholder={`${i + 1}.`} /></td>
                <td colSpan={2} style={B}><Inp value={tx.via} onChange={(v) => updTx(i, "via", v)} center /></td>
                <td colSpan={2} style={B}><Inp value={tx.dosis} onChange={(v) => updTx(i, "dosis", v)} center /></td>
                <td colSpan={2} style={B}><Inp value={tx.posologia} onChange={(v) => updTx(i, "posologia", v)} center /></td>
                <td colSpan={1} style={B}><Inp value={tx.dias} onChange={(v) => updTx(i, "dias", v)} center /></td>
              </tr>
            ))}
            {d.tratamientos.map((tx, i) => (
              <tr key={`desc-${i}`} style={{ height: 18 }}>
                <td colSpan={12} style={{ ...B, background: "#fafafa" }}>
                  <Inp value={tx.descripcion} onChange={(v) => updTx(i, "descripcion", v)} placeholder={`Descripción adicional — tratamiento ${i + 1}`} />
                </td>
              </tr>
            ))}

            {/* ══ O. CONDICIÓN AL EGRESO ═══════════════════════════════════ */}
            <SecBar letra="O" titulo="CONDICIÓN AL EGRESO DE EMERGENCIA" />
            <tr><td colSpan={12} style={B}><CkGrid opciones={EGRESO_OPCIONES} selected={d.egreso_condicion} onChange={sv("egreso_condicion")} cols={4} /></td></tr>
            <tr>
              <td colSpan={5} style={B}><Lbl>NOMBRE ESTABLECIMIENTO (referencia / derivación)</Lbl></td>
              <td colSpan={5} style={B}><Lbl>OBSERVACIONES</Lbl></td>
              <td colSpan={2} style={B}><Lbl>DÍAS DE REPOSO</Lbl></td>
            </tr>
            <tr style={{ height: 22 }}>
              <td colSpan={5} style={B}><Inp value={d.egreso_establecimiento} onChange={st("egreso_establecimiento")} /></td>
              <td colSpan={5} style={B}><Inp value={d.observaciones_egreso} onChange={st("observaciones_egreso")} /></td>
              <td colSpan={2} style={B}><Inp value={d.dias_reposo} onChange={st("dias_reposo")} center /></td>
            </tr>

            {/* ══ P. DATOS DEL PROFESIONAL RESPONSABLE ════════════════════ */}
            <SecBar 
              letra="P" 
              titulo="DATOS DEL PROFESIONAL RESPONSABLE" 
              rightComponent={
                <BotonBuscarProfesional onSelect={(m) => {
                  const partes = parseNombresMedico(m.nombre);
                  setD(p => ({
                    ...p,
                    prof_primer_nombre: partes.nombres,
                    prof_primer_apellido: partes.primerApellido,
                    prof_segundo_apellido: partes.segundoApellido,
                    prof_numero_documento: m.identificacion
                  }));
                }} />
              }
            />
            <tr>
              <td colSpan={2} style={B}><Lbl>FECHA (aaaa-mm-dd)</Lbl></td>
              <td colSpan={1} style={B}><Lbl>HORA (hh:mm)</Lbl></td>
              <td colSpan={3} style={B}><Lbl>PRIMER NOMBRE</Lbl></td>
              <td colSpan={3} style={B}><Lbl>PRIMER APELLIDO</Lbl></td>
              <td colSpan={3} style={B}><Lbl>SEGUNDO APELLIDO</Lbl></td>
            </tr>
            <tr style={{ height: 22 }}>
              <td colSpan={2} style={B}><Inp type="date" value={d.prof_fecha} onChange={st("prof_fecha")} /></td>
              <td colSpan={1} style={B}><Inp type="time" value={d.prof_hora} onChange={st("prof_hora")} /></td>
              <td colSpan={3} style={B}><Inp value={d.prof_primer_nombre} onChange={st("prof_primer_nombre")} /></td>
              <td colSpan={3} style={B}><Inp value={d.prof_primer_apellido} onChange={st("prof_primer_apellido")} /></td>
              <td colSpan={3} style={B}><Inp value={d.prof_segundo_apellido} onChange={st("prof_segundo_apellido")} /></td>
            </tr>
            <tr>
              <td colSpan={3} style={B}><Lbl>N° DOCUMENTO DE IDENTIFICACIÓN</Lbl></td>
              <td colSpan={4} style={B}><FirmaArea label="FIRMA DEL PROFESIONAL DE SALUD" /></td>
              <td colSpan={5} style={B}><FirmaArea label="SELLO Y CÓDIGO DEL PROFESIONAL DE SALUD" /></td>
            </tr>
            <tr style={{ height: 26 }}>
              <td colSpan={3} style={B}><Inp value={d.prof_numero_documento} onChange={st("prof_numero_documento")} center /></td>
              <td colSpan={4} style={{ ...B, background: "#fafafa" }} />
              <td colSpan={5} style={{ ...B, background: "#fafafa" }} />
            </tr>

            {/* Footer final */}
            <tr>
              <td colSpan={6} style={{ ...B, fontSize: "8px", fontWeight: 700, fontFamily: FONT, padding: "2px 4px" }}>SNS-MSP/HCU-form.008/2021</td>
              <td colSpan={6} style={{ ...B, fontSize: "9px", fontWeight: 700, fontFamily: FONT, textAlign: "right", padding: "2px 4px" }}>EMERGENCIA (4)</td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
);
});

EmergenciaForm008.displayName = 'HistoriaClinicaEmergenciaForm';

export default EmergenciaForm008;