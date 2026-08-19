"use client";
import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Cie10DescInput, Cie10CieInput } from "./Cie10Input";
import { BotonBuscarProfesional } from "@/components/ui/BotonBuscarProfesional";
import { parseNombresMedico } from "@/lib/services/medicos";

import { useFormAutosaveAndWarn } from "@/hooks/useFormAutosaveAndWarn";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface DatosConsultaExterna {
  institucion: string;
  unicodigo: string;
  establecimiento: string;
  numero_historia_clinica: string;
  numero_archivo: string;
  no_hoja: string;
  primer_apellido: string;
  segundo_apellido: string;
  primer_nombre: string;
  segundo_nombre: string;
  sexo: string;
  edad: string;

  // B. MOTIVO DE CONSULTA
  motivo_primera: boolean;
  motivo_subsecuente: boolean;
  motivo_texto: string;

  // C. ANTECEDENTES PERSONALES Y FAMILIARES
  ant_p_cardiopatia: string; ant_p_hipertension: string; ant_p_enf_cardiovascular: string;
  ant_p_endocrino_metabolico: string; ant_p_cancer: string; ant_p_tuberculosis: string;
  ant_p_enf_mental: string; ant_p_enf_infecciosa: string; ant_p_mal_formacion: string;
  ant_p_otro: string; ant_p_datos_clinicos: string;

  ant_f_cardiopatia: string; ant_f_hipertension: string; ant_f_enf_cardiovascular: string;
  ant_f_endocrino_metabolico: string; ant_f_cancer: string; ant_f_tuberculosis: string;
  ant_f_enf_mental: string; ant_f_enf_infecciosa: string; ant_f_mal_formacion: string;
  ant_f_otro: string; ant_f_descripcion: string;

  // D. ENFERMEDAD O PROBLEMA ACTUAL
  enfermedad_actual: string;

  // F. CONSTANTES VITALES Y ANTROPOMETRÍA
  fecha_cv: string; hora_cv: string; temperatura: string; presion_arterial: string;
  pulso: string; frecuencia_respiratoria: string; peso: string; talla: string;
  imc: string; perimetro_abdominal: string; hemoglobina_capilar: string;
  glucosa_capilar: string; pulsioximetria: string;

  // G. REVISIÓN ACTUAL DE ÓRGANOS Y SISTEMAS
  rev_piel_anexos: boolean; rev_sentidos: boolean; rev_respiratorio: boolean;
  rev_cardiovascular: boolean; rev_digestivo: boolean; rev_genito_urinario: boolean;
  rev_musculo_esqueletico: boolean; rev_endocrino: boolean; rev_hemo_linfatico: boolean;
  rev_nervioso: boolean; rev_descripcion: string;

  // H. EXAMEN FÍSICO — REGIONAL
  ef_piel_faneras: boolean; ef_cabeza: boolean; ef_ojos: boolean; ef_oidos: boolean;
  ef_nariz: boolean; ef_boca: boolean; ef_orofaringe: boolean; ef_cuello: boolean;
  ef_axilas_mamas: boolean; ef_torax: boolean; ef_abdomen: boolean;
  ef_columna_vertebral: boolean; ef_ingle_perine: boolean; ef_miembros_superiores: boolean;
  ef_miembros_inferiores: boolean;
  // H. EXAMEN FÍSICO — SISTÉMICO
  ef_organos_sentidos: boolean; ef_respiratorio: boolean; ef_cardio_vascular: boolean;
  ef_digestivo: boolean; ef_genital: boolean; ef_urinario: boolean;
  ef_musculo_esqueletico: boolean; ef_endocrino: boolean; ef_hemo_linfatico: boolean;
  ef_neurologico: boolean; ef_descripcion: string;

  // I. DIAGNÓSTICO
  dx1: string; dx1_cie: string; dx1_pre: boolean; dx1_def: boolean;
  dx2: string; dx2_cie: string; dx2_pre: boolean; dx2_def: boolean;
  dx3: string; dx3_cie: string; dx3_pre: boolean; dx3_def: boolean;
  dx4: string; dx4_cie: string; dx4_pre: boolean; dx4_def: boolean;
  dx5: string; dx5_cie: string; dx5_pre: boolean; dx5_def: boolean;
  dx6: string; dx6_cie: string; dx6_pre: boolean; dx6_def: boolean;

  // J. PLAN DE TRATAMIENTO
  plan_tratamiento: string;

  // K. DATOS DEL PROFESIONAL
  prof_fecha: string;
  prof_hora: string;
  prof_primer_nombre: string;
  prof_primer_apellido: string;
  prof_segundo_apellido: string;
  prof_documento: string;
}

interface Props {
  atencionId?: number;
  paciente?: {
    primerNombre?: string;
    segundoNombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    cedula?: string;
    sexo?: string;
    edad?: number;
    tipoPaciente?: string;
  };
  initialData?: Partial<DatosConsultaExterna>;
  onGuardar?: (datos: DatosConsultaExterna) => void;
  guardando?: boolean;
}

// ─── Estilos base ─────────────────────────────────────────────────────────────

const B = "1px solid #5b8db8";
const BL = "1px solid #a8c4d8";

const secTitle: React.CSSProperties = {
  background: "#cfe2f3", fontWeight: 700, fontSize: "9.5px",
  fontFamily: "Arial, sans-serif", padding: "3px 6px",
  border: B, letterSpacing: "0.04em", color: "#1a3a5c",
  textTransform: "uppercase",
};

const colHeader: React.CSSProperties = {
  background: "#ddeef8", fontWeight: 700, fontSize: "7.5px",
  fontFamily: "Arial, sans-serif", padding: "2px 3px",
  border: B, textAlign: "center", color: "#1a3a5c",
  lineHeight: 1.2, verticalAlign: "bottom",
};

const tdL: React.CSSProperties = {
  border: BL, padding: 0, verticalAlign: "middle",
};

const tdLbl: React.CSSProperties = {
  border: B, padding: "2px 4px",
  background: "#ddeef8", fontWeight: 700,
  fontSize: "8px", fontFamily: "Arial, sans-serif",
  color: "#1a3a5c", whiteSpace: "nowrap", verticalAlign: "middle",
};

const tdLblSm: React.CSSProperties = {
  ...tdLbl, fontSize: "7px",
};

function inp(value: string, onChange: (v: string) => void, center = false, _readOnly = false, placeholder = ""): React.ReactElement {
  return (
    <input type="text" value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%", border: "none", outline: "none",
        background: "#fff",
        fontSize: "10px", fontFamily: "Arial, sans-serif",
        textAlign: center ? "center" : "left",
        padding: "2px 4px", color: "#000", boxSizing: "border-box",
      }} />
  );
}

function area(value: string, onChange: (v: string) => void, rows = 3, placeholder = ""): React.ReactElement {
  const lineHeightPx = 10 * 1.5;
  const paddingPx = 6; // 3px top + 3px bottom
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
      ref={(el) => {
        if (el) autoResize(el);
      }}
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

function chkX(checked: boolean, onChange: (v: boolean) => void, label: string, small = false): React.ReactElement {
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: 3,
      cursor: "pointer", fontSize: small ? "7.5px" : "8.5px",
      fontFamily: "Arial, sans-serif", padding: "1px 3px",
      lineHeight: 1.2,
    }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        style={{ width: 10, height: 10, flexShrink: 0 }} />
      <span>{label}</span>
    </label>
  );
}

function dateIn(value: string, onChange: (v: string) => void): React.ReactElement {
  return (
    <input type="date" value={value} onChange={(e) => onChange(e.target.value)}
      style={{
        border: "none", outline: "none", fontSize: "9px", padding: "2px 3px",
        width: "100%", fontFamily: "Arial, sans-serif", boxSizing: "border-box",
      }} />
  );
}

function timeIn(value: string, onChange: (v: string) => void): React.ReactElement {
  return (
    <input type="time" value={value} onChange={(e) => onChange(e.target.value)}
      style={{
        border: "none", outline: "none", fontSize: "9px", padding: "2px 3px",
        width: "100%", fontFamily: "Arial, sans-serif", boxSizing: "border-box",
      }} />
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg, color: "#fff", border: "none", borderRadius: 4,
    padding: "6px 14px", fontSize: "11px", fontWeight: 700,
    cursor: "pointer", fontFamily: "Arial, sans-serif",
  };
}

const tbl: React.CSSProperties = {
  width: "100%", minWidth: "1000px", borderCollapse: "collapse",
  fontFamily: "Arial, sans-serif", fontSize: "10px",
};

// ─── Antecedentes row helper ──────────────────────────────────────────────────

const ANT_COLS = [
  { key: "cardiopatia",         label: "1.\nCARDIOPATÍA" },
  { key: "hipertension",        label: "2.\nHIPERTENSIÓN" },
  { key: "enf_cardiovascular",  label: "3. ENF. C.\nVASCULAR" },
  { key: "endocrino_metabolico",label: "4. ENDÓCRINO\nMETABÓLICO" },
  { key: "cancer",              label: "5. CÁNCER" },
  { key: "tuberculosis",        label: "6. TUBERCULOSIS" },
  { key: "enf_mental",         label: "7. ENF.\nMENTAL" },
  { key: "enf_infecciosa",      label: "8. ENF.\nINFECCIOSA" },
  { key: "mal_formacion",       label: "9. MAL\nFORMACIÓN" },
  { key: "otro",                label: "10. OTRO" },
];

// ─── Componente Principal ─────────────────────────────────────────────────────

export type ConsultaExternaFormHandle = {
  getDatos: () => DatosConsultaExterna;
  clearAutosave?: () => void;
  isDirty?: () => boolean;
};

const ConsultaExternaForm = forwardRef<ConsultaExternaFormHandle, Props>(({
  atencionId, paciente, initialData, onGuardar, guardando = false,
}, ref) => {
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [d, setD] = useState<DatosConsultaExterna>({
    institucion: paciente?.tipoPaciente ?? "PARTICULAR",
    unicodigo: "35865",
    establecimiento: "NUEVO HOSPITAL PANAMERICANO",
    numero_historia_clinica: paciente?.cedula ?? "",
    numero_archivo: "",
    no_hoja: "",
    primer_apellido: paciente?.primerApellido ?? "",
    segundo_apellido: paciente?.segundoApellido ?? "",
    primer_nombre: paciente?.primerNombre ?? "",
    segundo_nombre: paciente?.segundoNombre ?? "",
    sexo: paciente?.sexo ?? "",
    edad: paciente?.edad?.toString() ?? "",

    motivo_primera: false, motivo_subsecuente: false, motivo_texto: "",

    ant_p_cardiopatia: "", ant_p_hipertension: "", ant_p_enf_cardiovascular: "",
    ant_p_endocrino_metabolico: "", ant_p_cancer: "", ant_p_tuberculosis: "",
    ant_p_enf_mental: "", ant_p_enf_infecciosa: "", ant_p_mal_formacion: "",
    ant_p_otro: "", ant_p_datos_clinicos: "",

    ant_f_cardiopatia: "", ant_f_hipertension: "", ant_f_enf_cardiovascular: "",
    ant_f_endocrino_metabolico: "", ant_f_cancer: "", ant_f_tuberculosis: "",
    ant_f_enf_mental: "", ant_f_enf_infecciosa: "", ant_f_mal_formacion: "",
    ant_f_otro: "", ant_f_descripcion: "",

    enfermedad_actual: "",
    fecha_cv: today, hora_cv: nowTime,
    temperatura: "", presion_arterial: "", pulso: "", frecuencia_respiratoria: "",
    peso: "", talla: "", imc: "", perimetro_abdominal: "",
    hemoglobina_capilar: "", glucosa_capilar: "", pulsioximetria: "",
    rev_piel_anexos: false, rev_sentidos: false, rev_respiratorio: false,
    rev_cardiovascular: false, rev_digestivo: false, rev_genito_urinario: false,
    rev_musculo_esqueletico: false, rev_endocrino: false, rev_hemo_linfatico: false,
    rev_nervioso: false, rev_descripcion: "",
    ef_piel_faneras: false, ef_cabeza: false, ef_ojos: false, ef_oidos: false,
    ef_nariz: false, ef_boca: false, ef_orofaringe: false, ef_cuello: false,
    ef_axilas_mamas: false, ef_torax: false, ef_abdomen: false,
    ef_columna_vertebral: false, ef_ingle_perine: false,
    ef_miembros_superiores: false, ef_miembros_inferiores: false,
    ef_organos_sentidos: false, ef_respiratorio: false, ef_cardio_vascular: false,
    ef_digestivo: false, ef_genital: false, ef_urinario: false,
    ef_musculo_esqueletico: false, ef_endocrino: false,
    ef_hemo_linfatico: false, ef_neurologico: false, ef_descripcion: "",
    dx1: "", dx1_cie: "", dx1_pre: false, dx1_def: false,
    dx2: "", dx2_cie: "", dx2_pre: false, dx2_def: false,
    dx3: "", dx3_cie: "", dx3_pre: false, dx3_def: false,
    dx4: "", dx4_cie: "", dx4_pre: false, dx4_def: false,
    dx5: "", dx5_cie: "", dx5_pre: false, dx5_def: false,
    dx6: "", dx6_cie: "", dx6_pre: false, dx6_def: false,
    plan_tratamiento: "",
    prof_fecha: today, prof_hora: nowTime,
    prof_primer_nombre: "", prof_primer_apellido: "", prof_segundo_apellido: "",
  prof_documento: "",
    ...initialData,
  });

  const { isDirty, clearAutosave } = useFormAutosaveAndWarn({
    formId: `consulta_${atencionId || 'new'}_${paciente?.cedula || 'new'}`,
    initialData: initialData || {},
    currentData: d,
    onRestore: (saved) => setD(p => ({ ...p, ...saved })),
  });

  const handlePrint = () => {
    const originalTitle = document.title;
    const patientName = paciente ? `${paciente.primerNombre ?? ''} ${paciente.primerApellido ?? ''}`.trim() : 'Paciente';
    document.title = `Consulta - ${patientName}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  useImperativeHandle(ref, () => ({
    getDatos: () => d,
    clearAutosave: () => clearAutosave(),
    isDirty: () => isDirty,
  }), [d, clearAutosave, isDirty]);

  const s = (k: keyof DatosConsultaExterna) => (v: string) => setD(p => ({ ...p, [k]: v }));
  const c = (k: keyof DatosConsultaExterna) => (v: boolean) => setD(p => ({ ...p, [k]: v }));

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <style>{`
        @media print {
          /* Ocultar botones, el sidebar de navegación y el encabezado principal de la página */
          button, .no-print, .app-sidebar, .form-page-container > div:first-child {
            display: none !important;
          }
          /* Desactivar contenedores flex/scroll globales para que el navegador dimensione las páginas correctamente */
          html, body, .dashboard-layout, .dashboard-main, .form-page-container, .form-page-body {
            overflow: visible !important;
            height: auto !important;
            min-height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            width: 100% !important;
          }
          /* Checkboxes estilo "X" */
          input[type="checkbox"] {
            -webkit-appearance: none;
            appearance: none;
            width: 12px;
            height: 12px;
            border: 1px solid #000 !important;
            display: inline-block;
            position: relative;
            background: #fff !important;
            margin: 0;
            vertical-align: middle;
            border-radius: 0;
          }
          input[type="checkbox"]:checked::before {
            content: "X";
            position: absolute;
            top: -2px;
            left: 2px;
            font-size: 12px;
            font-weight: bold;
            color: #000;
          }
          /* Quitar el outline de los inputs/textareas e imprimir tal cual el texto */
          input[type="text"], input[type="date"], input[type="time"], textarea {
            border: none !important;
            background: transparent !important;
          }
          /* Configuración de color para forzar fondos en la tabla */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          /* Evitar cortes feos y forzar a que el formulario quepa en la hoja A4 */
          table { 
            page-break-inside: avoid;
            min-width: 0 !important;
            width: 100% !important;
          }
          /* Mostrar el encabezado del hospital solo en impresión */
          .print-only-header {
            display: block !important;
          }
        }
      `}</style>

      {/* ── Encabezado del Hospital (Solo visible en PDF) ─────────────────── */}
      <div className="print-only-header" style={{ display: "none", textAlign: "center", color: "#3065a3", fontFamily: "Arial, sans-serif", padding: "10px 0 15px 0" }}>
        <div style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "0.5px" }}>NUEVO HOSPITAL PANAMERICANO</div>
        <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.5px", marginTop: "2px" }}>CENTRO MEDICO DE ESPECIALIDADES</div>
        <div style={{ fontSize: "10px", marginTop: "4px" }}>
          Juan de Arguello Oe2-157 y Pedro de Alfaro (Esq.) junto al Retén de Policía Villa Flora - Quito<br/>
          Telfs.: 2612 802 / 2617 984 / 099 700 6406 / 099 416 8380 • e-mail: nhpanamericano.vlc@gmail.com
        </div>
      </div>

      {/* ── Barra acciones ──────────────────────────────────────────────────── */}
      <div className="no-print" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 14px", background: "#f5f7fa",
        borderBottom: "1px solid #dde3ea", gap: 8,
      }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#1a3a5c", fontFamily: "Arial, sans-serif" }}>
            SNS-MSP / HCU-form.002 / 2021 — CONSULTA EXTERNA
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => { onGuardar?.(d); clearAutosave(); }} disabled={guardando} style={btnStyle("#1a3a5c")}>
            {guardando ? "Guardando..." : "💾 Guardar"}
          </button>
          <button onClick={handlePrint} style={btnStyle("#b91c1c")}>
            📄 Descargar PDF
          </button>
        </div>
      </div>

      <div style={{ overflowX: "visible", overflowY: "visible", background: "#fff" }}>



        <div style={{ padding: "6px 10px 10px" }}>

          {/* ══ A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE ═════════════ */}
          <div style={secTitle}>A. DATOS DEL ESTABLECIMIENTO Y USARIO / PACIENTE</div>
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
                <td colSpan={7} style={tdLbl}>ESTABLECIMIENTO DE SALUD</td>
                <td colSpan={4} style={{ ...tdLbl, textAlign: "center" }}>NÚMERO DE CLÍNICA ÚNICA</td>
                <td colSpan={2} style={{ ...tdLbl, textAlign: "center" }}>NÚMERO DE ARCHIVO</td>
                <td colSpan={1} style={{ ...tdLbl, textAlign: "center" }}>No. HOJA</td>
              </tr>
              <tr style={{ height: 24 }}>
                <td colSpan={4} style={tdL}>{inp(d.institucion, s("institucion"))}</td>
                <td colSpan={2} style={tdL}>{inp(d.unicodigo, s("unicodigo"), true)}</td>
                <td colSpan={7} style={tdL}>{inp(d.establecimiento, s("establecimiento"))}</td>
                <td colSpan={4} style={tdL}>{inp(d.numero_historia_clinica, s("numero_historia_clinica"), true)}</td>
                <td colSpan={2} style={tdL}>{inp(d.numero_archivo, s("numero_archivo"), true)}</td>
                <td colSpan={1} style={tdL}>{inp(d.no_hoja, s("no_hoja"), true)}</td>
              </tr>
              <tr>
                <td colSpan={4} style={tdLbl}>PRIMER APELLIDO</td>
                <td colSpan={4} style={tdLbl}>SEGUNDO APELLIDO</td>
                <td colSpan={4} style={tdLbl}>PRIMER NOMBRE</td>
                <td colSpan={4} style={tdLbl}>SEGUNDO NOMBRE</td>
                <td colSpan={2} style={{ ...tdLbl, textAlign: "center" }}>SEXO</td>
                <td colSpan={2} style={{ ...tdLbl, textAlign: "center" }}>EDAD (Años)</td>
              </tr>
              <tr style={{ height: 24 }}>
                <td colSpan={4} style={tdL}>{inp(d.primer_apellido, s("primer_apellido"))}</td>
                <td colSpan={4} style={tdL}>{inp(d.segundo_apellido, s("segundo_apellido"))}</td>
                <td colSpan={4} style={tdL}>{inp(d.primer_nombre, s("primer_nombre"))}</td>
                <td colSpan={4} style={tdL}>{inp(d.segundo_nombre, s("segundo_nombre"))}</td>
                <td colSpan={2} style={tdL}>{inp(d.sexo, s("sexo"), true)}</td>
                <td colSpan={2} style={tdL}>{inp(d.edad, s("edad"), true)}</td>
              </tr>
            </tbody>
          </table>

          {/* ══ B. MOTIVO DE CONSULTA ══════════════════════════════════════════ */}
          <div style={{ ...secTitle, marginTop: 4, display: "flex", alignItems: "center", gap: 12 }}>
            <span>B. MOTIVO DE CONSULTA</span>
            <div style={{ display: "flex", gap: 16, marginLeft: "auto" }}>
              {chkX(d.motivo_primera, c("motivo_primera"), "PRIMERA")}
              {chkX(d.motivo_subsecuente, c("motivo_subsecuente"), "SUBSECUENTE")}
            </div>
          </div>
          <div style={{ border: B, minHeight: 48 }}>
            {area(d.motivo_texto, s("motivo_texto"), 3)}
          </div>

          {/* ══ C. ANTECEDENTES PATOLÓGICOS PERSONALES ════════════════════════ */}
          <div style={{ ...secTitle, marginTop: 4, display: "flex", alignItems: "center" }}>
            <span>C. ANTECEDENTES PATOLÓGICOS PERSONALES</span>
            <span style={{ marginLeft: "auto", fontSize: "7px", fontWeight: 400, fontStyle: "italic" }}>
              DATOS CLÍNICO - QUIRÚRGICOS, OBSTÉTRICOS, ALÉRGICOS RELEVANTES
            </span>
          </div>
          <table style={tbl}>
            <tbody>
              {/* Headers de los 10 ítems */}
              <tr>
                {ANT_COLS.map(col => (
                  <td key={col.key} style={{ ...colHeader, whiteSpace: "pre-line" }}>{col.label}</td>
                ))}
              </tr>
              {/* Fila de checkboxes — solo marcar */}
              <tr style={{ height: 32 }}>
                {ANT_COLS.map(col => (
                  <td key={col.key} style={{ ...tdL, textAlign: "center", verticalAlign: "middle" }}>
                    <input
                      type="checkbox"
                      checked={(d[`ant_p_${col.key}` as keyof DatosConsultaExterna] as string) === "X"}
                      onChange={(e) => s(`ant_p_${col.key}` as keyof DatosConsultaExterna)(e.target.checked ? "X" : "")}
                      style={{ width: 13, height: 13 }}
                    />
                  </td>
                ))}
              </tr>
              {/* Descripción — ancho completo */}
              <tr>
                <td colSpan={10} style={tdL}>
                  {area(d.ant_p_datos_clinicos, s("ant_p_datos_clinicos"), 3, "Descripción...")}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ══ D. ANTECEDENTES PATOLÓGICOS FAMILIARES ════════════════════════ */}
          <div style={{ ...secTitle, marginTop: 4 }}>D. ANTECEDENTES PATOLÓGICOS FAMILIARES</div>
          <table style={tbl}>
            <tbody>
              {/* Headers de los 10 ítems */}
              <tr>
                {ANT_COLS.map(col => (
                  <td key={col.key} style={{ ...colHeader, whiteSpace: "pre-line" }}>{col.label}</td>
                ))}
              </tr>
              {/* Fila de checkboxes — solo marcar */}
              <tr style={{ height: 32 }}>
                {ANT_COLS.map(col => (
                  <td key={col.key} style={{ ...tdL, textAlign: "center", verticalAlign: "middle" }}>
                    <input
                      type="checkbox"
                      checked={(d[`ant_f_${col.key}` as keyof DatosConsultaExterna] as string) === "X"}
                      onChange={(e) => s(`ant_f_${col.key}` as keyof DatosConsultaExterna)(e.target.checked ? "X" : "")}
                      style={{ width: 13, height: 13 }}
                    />
                  </td>
                ))}
              </tr>
              {/* Descripción — ancho completo */}
              <tr>
                <td colSpan={10} style={tdL}>
                  {area(d.ant_f_descripcion, s("ant_f_descripcion"), 3, "Descripción...")}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ══ E. ENFERMEDAD O PROBLEMA ACTUAL ═══════════════════════════════ */}
          <div style={{ ...secTitle, marginTop: 4, display: "flex", alignItems: "center" }}>
            <span>E. ENFERMEDAD O PROBLEMA ACTUAL</span>
            <span style={{ marginLeft: "auto", fontSize: "7px", fontWeight: 400, fontStyle: "italic" }}>
              CRONOLOGÍA - LOCALIZACIÓN - CARACTERÍSTICAS - INTENSIDAD - FRECUENCIA - FACTORES AGRAVANTES
            </span>
          </div>
          <div style={{ border: B, minHeight: 100 }}>
            {area(d.enfermedad_actual, s("enfermedad_actual"), 6)}
          </div>

          {/* ══ F. CONSTANTES VITALES Y ANTROPOMETRÍA ═════════════════════════ */}
          <div style={{ ...secTitle, marginTop: 4 }}>F. CONSTANTES VITALES Y ANTROPOMETRÍA</div>
          <table style={tbl}>
            <tbody>
              <tr>
                <td style={colHeader}>FECHA</td>
                <td style={colHeader}>HORA</td>
                <td style={{ ...colHeader, writingMode: "vertical-rl", transform: "rotate(180deg)", height: 70 }}>Temperatura (°C)</td>
                <td style={{ ...colHeader, writingMode: "vertical-rl", transform: "rotate(180deg)", height: 70 }}>Presión Arterial (mmHg)</td>
                <td style={{ ...colHeader, writingMode: "vertical-rl", transform: "rotate(180deg)", height: 70 }}>Pulso / min</td>
                <td style={{ ...colHeader, writingMode: "vertical-rl", transform: "rotate(180deg)", height: 70 }}>Frecuencia Respiratoria /min</td>
                <td style={{ ...colHeader, writingMode: "vertical-rl", transform: "rotate(180deg)", height: 70 }}>Peso (Kg)</td>
                <td style={{ ...colHeader, writingMode: "vertical-rl", transform: "rotate(180deg)", height: 70 }}>Talla (cm)</td>
                <td style={{ ...colHeader, writingMode: "vertical-rl", transform: "rotate(180deg)", height: 70 }}>IMC (Kg / m)</td>
                <td style={{ ...colHeader, writingMode: "vertical-rl", transform: "rotate(180deg)", height: 70 }}>Perímetro Abdominal (cm)</td>
                <td style={{ ...colHeader, writingMode: "vertical-rl", transform: "rotate(180deg)", height: 70 }}>Hemoglobina capilar (g/dl)</td>
                <td style={{ ...colHeader, writingMode: "vertical-rl", transform: "rotate(180deg)", height: 70 }}>Glucosa capilar (mg/ dl)</td>
                <td style={{ ...colHeader, writingMode: "vertical-rl", transform: "rotate(180deg)", height: 70 }}>Pulsioximetría a (%)</td>
              </tr>
              <tr style={{ height: 26 }}>
                <td style={{ ...tdL, minWidth: 100 }}>{dateIn(d.fecha_cv, s("fecha_cv"))}</td>
                <td style={{ ...tdL, minWidth: 70 }}>{timeIn(d.hora_cv, s("hora_cv"))}</td>
                {([
                  "temperatura","presion_arterial","pulso","frecuencia_respiratoria",
                  "peso","talla","imc","perimetro_abdominal",
                  "hemoglobina_capilar","glucosa_capilar","pulsioximetria",
                ] as (keyof DatosConsultaExterna)[]).map(k => (
                  <td key={k as string} style={{ ...tdL, minWidth: 42 }}>
                    {inp(d[k] as string, s(k), true)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* ══ G. REVISIÓN ACTUAL DE ÓRGANOS Y SISTEMAS ══════════════════════ */}
          <div style={{ ...secTitle, marginTop: 4, display: "flex", alignItems: "center" }}>
            <span>G. REVISIÓN ACTUAL DE ÓRGANOS Y SISTEMAS</span>
            <span style={{ marginLeft: "auto", fontSize: "7px", fontWeight: 400, fontStyle: "italic" }}>
              MARCAR "X" CUANDO PRESENTE PATOLOGÍA Y DESCRIBA
            </span>
          </div>
          <table style={tbl}>
            <tbody>
              <tr>
                <td style={{ ...tdL, padding: "2px 0", width: "20%" }}>{chkX(d.rev_piel_anexos, c("rev_piel_anexos"), "1 PIEL - ANEXOS")}</td>
                <td style={{ ...tdL, padding: "2px 0", width: "20%" }}>{chkX(d.rev_respiratorio, c("rev_respiratorio"), "3 RESPIRATORIO")}</td>
                <td style={{ ...tdL, padding: "2px 0", width: "20%" }}>{chkX(d.rev_digestivo, c("rev_digestivo"), "5 DIGESTIVO")}</td>
                <td style={{ ...tdL, padding: "2px 0", width: "20%" }}>{chkX(d.rev_musculo_esqueletico, c("rev_musculo_esqueletico"), "7 MÚSCULO - ESQUELÉTICO")}</td>
                <td style={{ ...tdL, padding: "2px 0", width: "20%" }}>{chkX(d.rev_hemo_linfatico, c("rev_hemo_linfatico"), "9 HEMO - LINFÁTICO")}</td>
              </tr>
              <tr>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.rev_sentidos, c("rev_sentidos"), "2 SENTIDOS")}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.rev_cardiovascular, c("rev_cardiovascular"), "4 CARDIO - VASCULAR")}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.rev_genito_urinario, c("rev_genito_urinario"), "6 GENITO - URINARIO")}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.rev_endocrino, c("rev_endocrino"), "8 ENDÓCRINO")}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.rev_nervioso, c("rev_nervioso"), "10 NERVIOSO")}</td>
              </tr>
              <tr>
                <td colSpan={5} style={tdL}>
                  {area(d.rev_descripcion, s("rev_descripcion"), 2, "Descripción...")}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ══ SEPARADOR HOJA 2 ═══════════════════════════════════════════════ */}
          <div style={{
            marginTop: 8, marginBottom: 6,
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 8px", background: "#1a3a5c", borderRadius: 3,
          }}>
            <span style={{ fontSize: "8px", fontWeight: 700, color: "#fff", fontFamily: "Arial, sans-serif" }}>
              SNS-MSP / HCU-form.002 / 2021
            </span>
            <span style={{ fontSize: "9px", fontWeight: 700, color: "#fff", fontFamily: "Arial, sans-serif" }}>
              CONSULTA EXTERNA - ANAMNESIS (1)
            </span>
          </div>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 8px", background: "#2c5282", borderRadius: 3, marginBottom: 6,
          }}>
            <span style={{ fontSize: "8px", fontWeight: 700, color: "#fff", fontFamily: "Arial, sans-serif" }}>
              SNS-MSP / HCU-form.002 / 2021
            </span>
            <span style={{ fontSize: "9px", fontWeight: 700, color: "#fff", fontFamily: "Arial, sans-serif" }}>
              CONSULTA EXTERNA - EXAMEN FÍSICO Y PRESCRIPCIONES (2)
            </span>
          </div>

          {/* ══ H. EXAMEN FÍSICO (REGIONAL + SISTÉMICO) ═══════════════════════ */}
          <div style={{ ...secTitle, display: "flex", alignItems: "center" }}>
            <span>H. ENFERMEDAD O PROBLEMA ACTUAL</span>
            <span style={{ marginLeft: "auto", fontSize: "7px", fontWeight: 400, fontStyle: "italic" }}>
              MARCAR "X" CUANDO PRESENTE PATOLOGÍA Y DESCRIBA
            </span>
          </div>
          <table style={tbl}>
            <tbody>
              {/* Sub-headers REGIONAL / SISTÉMICO */}
              <tr>
                <td colSpan={3} style={{ ...colHeader, background: "#c8dff0", textAlign: "center", fontSize: "9px" }}>REGIONAL</td>
                <td colSpan={2} style={{ ...colHeader, background: "#c8dff0", textAlign: "center", fontSize: "9px" }}>SISTÉMICO</td>
              </tr>
              {/* Fila 1 */}
              <tr>
                <td style={{ ...tdL, padding: "2px 0", width: "13%" }}>{chkX(d.ef_piel_faneras, c("ef_piel_faneras"), "1R PIEL - FANERAS", true)}</td>
                <td style={{ ...tdL, padding: "2px 0", width: "13%" }}>{chkX(d.ef_boca, c("ef_boca"), "6R BOCA", true)}</td>
                <td style={{ ...tdL, padding: "2px 0", width: "13%" }}>{chkX(d.ef_abdomen, c("ef_abdomen"), "11R ABDOMEN", true)}</td>
                <td style={{ ...tdL, padding: "2px 0", width: "13%" }}>{chkX(d.ef_organos_sentidos, c("ef_organos_sentidos"), "1S ÓRGANOS DE LOS SENTIDOS", true)}</td>
                <td style={{ ...tdL, padding: "2px 0", width: "13%" }}>{chkX(d.ef_urinario, c("ef_urinario"), "6S URINARIO", true)}</td>
              </tr>
              {/* Fila 2 */}
              <tr>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_cabeza, c("ef_cabeza"), "2R CABEZA", true)}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_orofaringe, c("ef_orofaringe"), "7R OROFARINGE", true)}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_columna_vertebral, c("ef_columna_vertebral"), "12R COLUMNA VERTEBRAL", true)}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_respiratorio, c("ef_respiratorio"), "2S RESPIRATORIO", true)}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_musculo_esqueletico, c("ef_musculo_esqueletico"), "7S MÚSCULO - ESQUELÉTICO", true)}</td>
              </tr>
              {/* Fila 3 */}
              <tr>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_ojos, c("ef_ojos"), "3R OJOS", true)}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_cuello, c("ef_cuello"), "8R CUELLO", true)}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_ingle_perine, c("ef_ingle_perine"), "13R INGLE - PERINÉ", true)}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_cardio_vascular, c("ef_cardio_vascular"), "3S CARDIO - VASCULAR", true)}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_endocrino, c("ef_endocrino"), "8S ENDÓCRINO", true)}</td>
              </tr>
              {/* Fila 4 */}
              <tr>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_oidos, c("ef_oidos"), "4R OÍDOS", true)}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_axilas_mamas, c("ef_axilas_mamas"), "9R AXILAS - MAMAS", true)}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_miembros_superiores, c("ef_miembros_superiores"), "14R MIEMBROS SUPERIORES", true)}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_digestivo, c("ef_digestivo"), "4S DIGESTIVO", true)}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_hemo_linfatico, c("ef_hemo_linfatico"), "9S HEMO - LINFÁTICO", true)}</td>
              </tr>
              {/* Fila 5 */}
              <tr>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_nariz, c("ef_nariz"), "5R NARIZ", true)}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_torax, c("ef_torax"), "10R TÓRAX", true)}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_miembros_inferiores, c("ef_miembros_inferiores"), "15R MIEMBROS INFERIORES", true)}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_genital, c("ef_genital"), "5S GENITAL", true)}</td>
                <td style={{ ...tdL, padding: "2px 0" }}>{chkX(d.ef_neurologico, c("ef_neurologico"), "10S NEUROLÓGICO", true)}</td>
              </tr>
              {/* Descripción */}
              <tr>
                <td colSpan={5} style={tdL}>
                  {area(d.ef_descripcion, s("ef_descripcion"), 4, "Descripción...")}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ══ I. DIAGNÓSTICO ═════════════════════════════════════════════════ */}
          <div style={{ ...secTitle, marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
            <span>I. DIAGNÓSTICO</span>
            <span style={{ fontSize: "7px", fontWeight: 400 }}>PRE= PRESUNTIVO &nbsp; DEF= DEFINITIVO</span>
          </div>
          <table style={tbl}>
            <tbody>
              <tr>
                <td style={{ ...tdLblSm, width: "30%" }}>DIAGNÓSTICO</td>
                <td style={{ ...tdLblSm, width: "6%", textAlign: "center" }}>CIE</td>
                <td style={{ ...tdLblSm, width: "4%", textAlign: "center" }}>PRE</td>
                <td style={{ ...tdLblSm, width: "4%", textAlign: "center" }}>DEF</td>
                <td style={{ ...tdLblSm, width: "30%" }}>DIAGNÓSTICO</td>
                <td style={{ ...tdLblSm, width: "6%", textAlign: "center" }}>CIE</td>
                <td style={{ ...tdLblSm, width: "4%", textAlign: "center" }}>PRE</td>
                <td style={{ ...tdLblSm, width: "4%", textAlign: "center" }}>DEF</td>
              </tr>
              {([1, 2, 3] as const).map(n => (
                <tr key={n} style={{ height: 24 }}>
                  <td style={tdL}>
                    <Cie10DescInput
                      descripcion={(d[`dx${n}` as keyof DatosConsultaExterna] as string) ?? ""}
                      cie={(d[`dx${n}_cie` as keyof DatosConsultaExterna] as string) ?? ""}
                      onChange={(cie, descripcion) => {
                        s(`dx${n}` as keyof DatosConsultaExterna)(descripcion);
                        s(`dx${n}_cie` as keyof DatosConsultaExterna)(cie);
                      }}
                    />
                  </td>
                  <td style={{ ...tdL, textAlign: "center" }}>
                    <Cie10CieInput
                      descripcion={(d[`dx${n}` as keyof DatosConsultaExterna] as string) ?? ""}
                      cie={(d[`dx${n}_cie` as keyof DatosConsultaExterna] as string) ?? ""}
                      onChange={(cie, descripcion) => {
                        s(`dx${n}` as keyof DatosConsultaExterna)(descripcion);
                        s(`dx${n}_cie` as keyof DatosConsultaExterna)(cie);
                      }}
                    />
                  </td>
                  <td style={{ ...tdL, textAlign: "center" }}>
                    <input type="checkbox" checked={!!d[`dx${n}_pre` as keyof DatosConsultaExterna]}
                      onChange={(e) => c(`dx${n}_pre` as keyof DatosConsultaExterna)(e.target.checked)}
                      style={{ width: 12, height: 12 }} />
                  </td>
                  <td style={{ ...tdL, textAlign: "center" }}>
                    <input type="checkbox" checked={!!d[`dx${n}_def` as keyof DatosConsultaExterna]}
                      onChange={(e) => c(`dx${n}_def` as keyof DatosConsultaExterna)(e.target.checked)}
                      style={{ width: 12, height: 12 }} />
                  </td>
                  <td style={tdL}>
                    <Cie10DescInput
                      descripcion={(d[`dx${n + 3}` as keyof DatosConsultaExterna] as string) ?? ""}
                      cie={(d[`dx${n + 3}_cie` as keyof DatosConsultaExterna] as string) ?? ""}
                      onChange={(cie, descripcion) => {
                        s(`dx${n + 3}` as keyof DatosConsultaExterna)(descripcion);
                        s(`dx${n + 3}_cie` as keyof DatosConsultaExterna)(cie);
                      }}
                    />
                  </td>
                  <td style={{ ...tdL, textAlign: "center" }}>
                    <Cie10CieInput
                      descripcion={(d[`dx${n + 3}` as keyof DatosConsultaExterna] as string) ?? ""}
                      cie={(d[`dx${n + 3}_cie` as keyof DatosConsultaExterna] as string) ?? ""}
                      onChange={(cie, descripcion) => {
                        s(`dx${n + 3}` as keyof DatosConsultaExterna)(descripcion);
                        s(`dx${n + 3}_cie` as keyof DatosConsultaExterna)(cie);
                      }}
                    />
                  </td>
                  <td style={{ ...tdL, textAlign: "center" }}>
                    <input type="checkbox" checked={!!d[`dx${n + 3}_pre` as keyof DatosConsultaExterna]}
                      onChange={(e) => c(`dx${n + 3}_pre` as keyof DatosConsultaExterna)(e.target.checked)}
                      style={{ width: 12, height: 12 }} />
                  </td>
                  <td style={{ ...tdL, textAlign: "center" }}>
                    <input type="checkbox" checked={!!d[`dx${n + 3}_def` as keyof DatosConsultaExterna]}
                      onChange={(e) => c(`dx${n + 3}_def` as keyof DatosConsultaExterna)(e.target.checked)}
                      style={{ width: 12, height: 12 }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ J. PLAN DE TRATAMIENTO ══════════════════════════════════════════ */}
          <div style={{ ...secTitle, marginTop: 4, display: "flex", alignItems: "center" }}>
            <span>J. PLAN DE TRATAMIENTO</span>
            <span style={{ marginLeft: "auto", fontSize: "7px", fontWeight: 400, fontStyle: "italic" }}>
              DIAGNÓSTICO, TERAPÉUTICO Y EDUCACIONAL
            </span>
          </div>
          <div style={{ border: B, minHeight: 140 }}>
            {area(d.plan_tratamiento, s("plan_tratamiento"), 9, "Escriba el plan de tratamiento...")}
          </div>

          {/* ══ K. DATOS DEL PROFESIONAL RESPONSABLE ═════════════════════════ */}
          <div style={{ ...secTitle, marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
            <span>K. DATOS DEL PROFESIONAL RESPONSABLE</span>
            <BotonBuscarProfesional onSelect={(m) => {
              const partes = parseNombresMedico(m.nombre);
              s("prof_primer_nombre")(partes.nombres);
              s("prof_primer_apellido")(partes.primerApellido);
              s("prof_segundo_apellido")(partes.segundoApellido);
              s("prof_documento")(m.identificacion);
            }} />
          </div>
          <table style={tbl}>
            <tbody>
              <tr>
                <td style={{ ...tdLblSm, width: 110 }}>FECHA (aaaa-mm-dd)</td>
                <td style={{ ...tdLblSm, width: 80 }}>HORA (hh:mm)</td>
                <td style={tdLblSm}>PRIMER NOMBRE</td>
                <td style={tdLblSm}>PRIMER APELLIDO</td>
                <td style={tdLblSm}>SEGUNDO APELLIDO</td>
              </tr>
              <tr style={{ height: 24 }}>
                <td style={tdL}>{dateIn(d.prof_fecha, s("prof_fecha"))}</td>
                <td style={tdL}>{timeIn(d.prof_hora, s("prof_hora"))}</td>
                <td style={tdL}>{inp(d.prof_primer_nombre, s("prof_primer_nombre"))}</td>
                <td style={tdL}>{inp(d.prof_primer_apellido, s("prof_primer_apellido"))}</td>
                <td style={tdL}>{inp(d.prof_segundo_apellido, s("prof_segundo_apellido"))}</td>
              </tr>
              <tr>
                <td style={tdLblSm}>NÚMERO DE DOCUMENTO DE IDENTIFICACIÓN</td>
                <td colSpan={2} style={{ ...tdLblSm, textAlign: "center" }}>FIRMA</td>
                <td colSpan={2} style={{ ...tdLblSm, textAlign: "center" }}>SELLO</td>
              </tr>
              <tr style={{ height: 34 }}>
                <td style={tdL}>{inp(d.prof_documento, s("prof_documento"))}</td>
                <td colSpan={2} style={{ ...tdL, background: "#f8f8f8", textAlign: "center" }}>
                  <span style={{ fontSize: "8px", color: "#aaa", fontStyle: "italic" }}>(firma en documento impreso)</span>
                </td>
                <td colSpan={2} style={{ ...tdL, background: "#f8f8f8", textAlign: "center" }}>
                  <span style={{ fontSize: "8px", color: "#aaa", fontStyle: "italic" }}>(sello en documento impreso)</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Pie */}
          <div style={{
            marginTop: 8, display: "flex", justifyContent: "space-between",
            padding: "3px 0", borderTop: B,
          }}>
            <span style={{ fontSize: "8px", color: "#555", fontFamily: "Arial, sans-serif" }}>
              SNS-MSP / HCU-form.002 / 2021
            </span>
            <span style={{ fontSize: "9px", fontWeight: 700, color: "#1a3a5c", fontFamily: "Arial, sans-serif" }}>
              CONSULTA EXTERNA - EXAMEN FÍSICO Y PRESCRIPCIONES (2)
            </span>
          </div>

        </div>
      </div>
    </div>
  );
});

export default ConsultaExternaForm;
