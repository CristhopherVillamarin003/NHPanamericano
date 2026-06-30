"use client";

import React, { useState, useImperativeHandle } from "react";
import { useFormAutosaveAndWarn } from "@/hooks/useFormAutosaveAndWarn";
import { Cie10DescInput, Cie10CieInput } from "./Cie10Input";
import { MedicoInput } from "./MedicoInput";
import { BotonBuscarProfesional } from "@/components/ui/BotonBuscarProfesional";
import { parseNombresMedico } from "@/lib/services/medicos";
import RichTextEpicrisis from "../ui/RichTextEpicrisis";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DatosEpicrisis {
  // A. Datos del establecimiento y paciente
  institucion: string;
  unicodigo: string;
  establecimiento: string;
  numero_historia_clinica: string;  // auto
  numero_archivo: string;
  no_hoja: string;
  primer_apellido: string;          // auto
  segundo_apellido: string;         // auto
  primer_nombre: string;            // auto
  segundo_nombre: string;           // auto
  sexo: string;                     // auto
  edad: string;                     // auto
  condicion_edad: "H" | "D" | "M" | "A"; // auto (A por defecto)

  // B. Resumen del cuadro clínico
  resumen_cuadro_clinico: string;

  // C. Resumen de evolución y complicaciones
  resumen_evolucion: string;

  // D. Hallazgos relevantes de exámenes y procedimientos diagnósticos
  hallazgos_examenes: string;

  // E. Resumen de tratamiento y procedimientos terapéuticos
  resumen_tratamiento: string;

  // F. Indicaciones de alta / egreso
  indicaciones_alta: string;

  // G. Diagnóstico de alta / egreso
  dx_principal: string;         dx_principal_cie: string;
  dx_secundario_1: string;      dx_secundario_1_cie: string;
  dx_secundario_2: string;      dx_secundario_2_cie: string;
  dx_secundario_3: string;      dx_secundario_3_cie: string;
  causa_externa: string;        causa_externa_cie: string;

  // H. Condición de alta / egreso
  condicion_vivo: boolean;
  condicion_fallecido: boolean;
  alta_medica: boolean;
  alta_asintomatico: boolean;
  alta_discapacidad: boolean;
  alta_retiro_no_autorizado: boolean;
  alta_defuncion_menos_48h: boolean;
  dias_estada: string;
  alta_voluntaria: boolean;
  alta_defuncion_mas_48h: boolean;
  dias_reposo: string;

  // I. Médicos tratantes
  medico_nombre: string;
  medico_especialidad: string;
  medico_sello_documento: string;
  medico_periodo: string;

  // J. Datos del profesional responsable
  prof_fecha: string;
  prof_hora: string;
  prof_primer_nombre: string;
  prof_primer_apellido: string;
  prof_segundo_apellido: string;
  prof_numero_documento: string;
  elaborado_por: string;
  revisado_por: string;
}

interface Props {
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
  initialData?: Partial<DatosEpicrisis>;
  onGuardar?: (datos: DatosEpicrisis) => void;
  onExportarDocx?: (datosPlano: Record<string, any>) => void;
  guardando?: boolean;
  exportando?: boolean;
  atencionId?: number;
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Lbl({ children, small = false, center = false, color = "#000" }: {
  children: React.ReactNode; small?: boolean; center?: boolean; color?: string;
}) {
  return (
    <div style={{
      fontSize: small ? "8px" : "9px", fontWeight: 700,
      padding: "2px 4px", lineHeight: 1.2, color: color,
      textAlign: center ? "center" : "left",
    }}>
      {children}
    </div>
  );
}

function TxtIn({ value, onChange, readOnly = false, center = false, placeholder = "" }: {
  value: string; onChange?: (v: string) => void;
  readOnly?: boolean; center?: boolean; placeholder?: string;
}) {
  return (
    <input type="text" value={value} readOnly={readOnly} placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      style={{
        width: "100%", border: "none", outline: "none",
        background: readOnly ? "#f0f0f0" : "#fff",
        fontSize: "10px", fontFamily: "Arial, sans-serif",
        textAlign: center ? "center" : "left",
        padding: "3px 4px", color: "#000", boxSizing: "border-box",
      }} />
  );
}

function BigTxt({ value, onChange, rows = 6, placeholder = "" }: {
  value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  const lineHeightPx = 10 * 1.5;
  const paddingPx = 8; // 4px top + 4px bottom
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
        padding: "4px 6px", boxSizing: "border-box", lineHeight: 1.5,
        background: "#fff", overflow: "hidden",
        minHeight: `${minHeight}px`,
      }}
    />
  );
}

function ChkLbl({ checked, onChange, label }: {
  checked: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: 4,
      cursor: "pointer", fontSize: "9px",
      fontFamily: "Arial, sans-serif", padding: "1px 0",
    }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        style={{ width: 11, height: 11 }} />
      <span style={{ fontWeight: 600 }}>{label}</span>
    </label>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const td: React.CSSProperties = { border: "1px solid #000", padding: 0, verticalAlign: "top" };
const tdM: React.CSSProperties = { ...td, verticalAlign: "middle" };
const tdC: React.CSSProperties = { ...td, verticalAlign: "middle", textAlign: "center" };

const secH = (bg = "#CCCCFF"): React.CSSProperties => ({
  background: bg, fontWeight: 700, fontSize: "11px",
  fontFamily: "Arial, sans-serif", padding: "4px 8px",
  border: "1px solid #000", letterSpacing: "0.02em",
});

const subH: React.CSSProperties = {
  background: "#DCE6F1", fontWeight: 700, fontSize: "9px",
  fontFamily: "Arial, sans-serif", padding: "2px 4px",
  border: "1px solid #000",
};

// Label de celda — verde claro (igual que ConsentimientoForm)
const tdLbl: React.CSSProperties = { border: "1px solid #000", padding: 0, verticalAlign: "middle", background: "#CCFFCC" };

function btnStyle(color: string): React.CSSProperties {
  return {
    background: color, color: "#fff", border: "none", borderRadius: 4,
    padding: "5px 12px", fontSize: "11px", fontWeight: 600,
    cursor: "pointer", fontFamily: "Arial, sans-serif",
  };
}

const tbl: React.CSSProperties = {
  width: "100%", minWidth: "1000px", borderCollapse: "collapse",
  tableLayout: "fixed", fontFamily: "Arial, sans-serif", fontSize: "10px",
};

// ─── Componente Principal ─────────────────────────────────────────────────────

export type EpicrisisFormHandle = {
  getDatos: () => DatosEpicrisis;
  clearAutosave?: () => void;
  isDirty?: () => boolean;
};

const EpicrisisForm = React.forwardRef<EpicrisisFormHandle, Props>(({
  paciente, initialData, onGuardar,  onExportarDocx,
  guardando = false,
  exportando = false,
  atencionId,
}, ref) => {
  const [hoja, setHoja] = useState<"ANVERSO" | "REVERSO">("ANVERSO");
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [d, setD] = useState<DatosEpicrisis>({
    // A — auto desde paciente
    institucion: paciente?.tipoPaciente ?? "PARTICULAR",
    unicodigo: "62858",
    establecimiento: "NUEVO HOSPITAL PANAMERICANO",
    numero_historia_clinica: paciente?.cedula ?? "",
    numero_archivo: "",
    no_hoja: "",
    primer_apellido: paciente?.primerApellido ?? "",
    segundo_apellido: paciente?.segundoApellido ?? "",
    primer_nombre: paciente?.primerNombre ?? "",
    segundo_nombre: paciente?.segundoNombre ?? "",
    sexo: paciente?.sexo
      ? paciente.sexo.toUpperCase().startsWith("F") ? "F" : paciente.sexo.toUpperCase().startsWith("M") ? "M" : paciente.sexo
      : "",
    // (sexo ya normalizado arriba)
    edad: paciente?.edad?.toString() ?? "",
    condicion_edad: "A",
    // B-F textos libres
    resumen_cuadro_clinico: "",
    resumen_evolucion: "",
    hallazgos_examenes: "",
    resumen_tratamiento: "",
    indicaciones_alta: "",
    // G diagnósticos
    dx_principal: "", dx_principal_cie: "",
    dx_secundario_1: "", dx_secundario_1_cie: "",
    dx_secundario_2: "", dx_secundario_2_cie: "",
    dx_secundario_3: "", dx_secundario_3_cie: "",
    causa_externa: "", causa_externa_cie: "",
    // H condición alta
    condicion_vivo: false,
    condicion_fallecido: false,
    alta_medica: false,
    alta_asintomatico: false,
    alta_discapacidad: false,
    alta_retiro_no_autorizado: false,
    alta_defuncion_menos_48h: false,
    dias_estada: "",
    alta_voluntaria: false,
    alta_defuncion_mas_48h: false,
    dias_reposo: "",
    // I médico
    medico_nombre: "",
    medico_especialidad: "",
    medico_sello_documento: "",
    medico_periodo: "",
    // J profesional
    prof_fecha: new Date().toISOString().split("T")[0],
    prof_hora: nowTime,
    prof_primer_nombre: "",
    prof_primer_apellido: "",
    prof_segundo_apellido: "",
    prof_numero_documento: "",
    elaborado_por: "",
    revisado_por: "",
    ...initialData,
  });

  const { isDirty, clearAutosave } = useFormAutosaveAndWarn({
    formId: `epicrisis_${atencionId || 'new'}_${paciente?.cedula || 'new'}`,
    initialData: initialData || {},
    currentData: d,
    onRestore: (saved) => setD(p => ({ ...p, ...saved })),
  });

  useImperativeHandle(ref, () => ({
    getDatos: () => d,
    clearAutosave: () => clearAutosave(),
    isDirty: () => isDirty,
  }), [d, clearAutosave, isDirty]);

  const s = (k: keyof DatosEpicrisis) => (v: string) => setD(p => ({ ...p, [k]: v }));
  const c = (k: keyof DatosEpicrisis) => (v: boolean) => setD(p => ({ ...p, [k]: v }));

  const diagRows: Array<{ label: string; key: keyof DatosEpicrisis; cieKey: keyof DatosEpicrisis }> = [
    { label: "DIAGNÓSTICO PRINCIPAL", key: "dx_principal", cieKey: "dx_principal_cie" },
    { label: "DIAGNÓSTICO SECUNDARIO", key: "dx_secundario_1", cieKey: "dx_secundario_1_cie" },
    { label: "DIAGNÓSTICO SECUNDARIO", key: "dx_secundario_2", cieKey: "dx_secundario_2_cie" },
    { label: "DIAGNÓSTICO SECUNDARIO", key: "dx_secundario_3", cieKey: "dx_secundario_3_cie" },
    { label: "CAUSA EXTERNA", key: "causa_externa", cieKey: "causa_externa_cie" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      {/* ── Barra de acciones ─────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px", background: "#f5f5f5", borderBottom: "1px solid #ccc", gap: 8,
      }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#1a3a5c" }}>
            SNS-MSP / HCU-form.006/2021 — Historia Clínica Única
          </span>
          <span style={{ fontSize: "10px", color: "#555", marginLeft: 10 }}>
            EPICRISIS
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => { onGuardar?.(d); clearAutosave(); }} disabled={guardando} style={btnStyle("#1a3a5c")}>
            {guardando ? "Guardando..." : "💾 Guardar"}
          </button>
          <button onClick={() => onExportarDocx?.(d)} disabled={exportando} style={btnStyle("#1e6b2e")}>
            {exportando ? "Exportando..." : "📄 Descargar Word"}
          </button>
        </div>
      </div>

      <div style={{ overflowX: "visible", overflowY: "visible", background: "#fff" }}>

        {/* ════════════════════════════════════════════════════════════════
            TABLA [0] — A, B, C, D
            ════════════════════════════════════════════════════════════════ */}
        <table style={tbl}>
          <tbody>

            {/* ── A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE ── */}
            <tr><td colSpan={20} style={secH()}>A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE</td></tr>

            {/* Labels fila 1 */}
            <tr>
              <td colSpan={4} style={tdLbl}><Lbl>INSTITUCIÓN DEL SISTEMA</Lbl></td>
              <td colSpan={2} style={tdLbl}><Lbl>UNICÓDIGO</Lbl></td>
              <td colSpan={5} style={tdLbl}><Lbl>ESTABLECIMIENTO DE SALUD</Lbl></td>
              <td colSpan={5} style={tdLbl}><Lbl>NÚMERO DE HISTORIA CLÍNICA ÚNICA</Lbl></td>
              <td colSpan={2} style={tdLbl}><Lbl>NÚMERO DE ARCHIVO</Lbl></td>
              <td colSpan={2} style={tdLbl}><Lbl small>No. HOJA</Lbl></td>
            </tr>
            {/* Valores fila 1 */}
            <tr style={{ height: 22 }}>
              <td colSpan={4} style={td}><TxtIn value={d.institucion} onChange={s("institucion")} /></td>
              <td colSpan={2} style={td}><TxtIn value={d.unicodigo} onChange={s("unicodigo")} center /></td>
              <td colSpan={5} style={td}><TxtIn value={d.establecimiento} onChange={s("establecimiento")} /></td>
              <td colSpan={5} style={td}><TxtIn value={d.numero_historia_clinica} onChange={s("numero_historia_clinica")} center /></td>
              <td colSpan={2} style={td}><TxtIn value={d.numero_archivo} onChange={s("numero_archivo")} center /></td>
              <td colSpan={2} style={td}><TxtIn value={d.no_hoja} onChange={s("no_hoja")} center /></td>
            </tr>

            {/* Labels fila 2 — paciente */}
            <tr>
              <td colSpan={3} style={tdLbl}><Lbl>PRIMER APELLIDO</Lbl></td>
              <td colSpan={3} style={tdLbl}><Lbl>SEGUNDO APELLIDO</Lbl></td>
              <td colSpan={3} style={tdLbl}><Lbl>PRIMER NOMBRE</Lbl></td>
              <td colSpan={3} style={tdLbl}><Lbl>SEGUNDO NOMBRE</Lbl></td>
              <td colSpan={1} style={tdLbl}><Lbl>SEXO</Lbl></td>
              <td colSpan={2} style={tdLbl}><Lbl>EDAD</Lbl></td>
              <td colSpan={5} style={tdLbl}>
                <Lbl small center>CONDICIÓN EDAD (MARCAR)</Lbl>
                <div style={{ display: "flex", justifyContent: "space-around", fontSize: "8px", fontWeight: 700, padding: "1px 4px" }}>
                  <span>H</span><span>D</span><span>M</span><span>A</span>
                </div>
              </td>
            </tr>
            {/* Valores fila 2 — paciente */}
            <tr style={{ height: 22 }}>
              <td colSpan={3} style={td}><TxtIn value={d.primer_apellido} onChange={s("primer_apellido")} /></td>
              <td colSpan={3} style={td}><TxtIn value={d.segundo_apellido} onChange={s("segundo_apellido")} /></td>
              <td colSpan={3} style={td}><TxtIn value={d.primer_nombre} onChange={s("primer_nombre")} /></td>
              <td colSpan={3} style={td}><TxtIn value={d.segundo_nombre} onChange={s("segundo_nombre")} /></td>
              <td colSpan={1} style={td}><TxtIn value={d.sexo} onChange={s("sexo")} center /></td>
              <td colSpan={2} style={td}><TxtIn value={d.edad} onChange={s("edad")} center /></td>
              <td colSpan={5} style={td}>
                <div style={{ display: "flex", justifyContent: "space-around", padding: "4px 4px" }}>
                  {(["H", "D", "M", "A"] as const).map(op => (
                    <input key={op} type="radio" name="epicrisis_condicion_edad" value={op}
                      checked={d.condicion_edad === op}
                      onChange={() => setD(p => ({ ...p, condicion_edad: op }))}
                      style={{ width: 11, height: 11, cursor: "pointer" }}
                      title={op === "H" ? "Horas" : op === "D" ? "Días" : op === "M" ? "Meses" : "Años"} />
                  ))}
                </div>
              </td>
            </tr>

            {/* ── B. RESUMEN DEL CUADRO CLÍNICO ── */}
            <tr><td colSpan={20} style={secH()}>B. RESUMEN DEL CUADRO CLÍNICO</td></tr>
            <tr>
              <td colSpan={20} style={td}>
                <RichTextEpicrisis value={d.resumen_cuadro_clinico} onChange={s("resumen_cuadro_clinico")} minHeight="120px"
                  placeholder="Describa el cuadro clínico al ingreso: motivo de consulta, anamnesis, signos y síntomas relevantes..." />
              </td>
            </tr>

            {/* ── C. RESUMEN DE EVOLUCIÓN Y COMPLICACIONES ── */}
            <tr><td colSpan={20} style={secH()}>C. RESUMEN DE EVOLUCIÓN Y COMPLICACIONES</td></tr>
            <tr>
              <td colSpan={20} style={td}>
                <RichTextEpicrisis value={d.resumen_evolucion} onChange={s("resumen_evolucion")} minHeight="120px"
                  placeholder="Describa la evolución del paciente durante la hospitalización, complicaciones presentadas y su manejo..." />
              </td>
            </tr>

            {/* ── D. HALLAZGOS RELEVANTES DE EXÁMENES Y PROCEDIMIENTOS DIAGNÓSTICOS ── */}
            <tr><td colSpan={20} style={secH()}>D. HALLAZGOS RELEVANTES DE EXÁMENES Y PROCEDIMIENTOS DIAGNÓSTICOS</td></tr>
            <tr>
              <td colSpan={20} style={td}>
                <RichTextEpicrisis value={d.hallazgos_examenes} onChange={s("hallazgos_examenes")} minHeight="120px"
                  placeholder="Registre los resultados relevantes de laboratorio, imagenología, biopsias y otros procedimientos diagnósticos..." />
              </td>
            </tr>

          </tbody>
        </table>

        {/* ════════════════════════════════════════════════════════════════
            TABLA [1] — E y F
            ════════════════════════════════════════════════════════════════ */}
        <table style={tbl}>
          <tbody>

            {/* ── E. RESUMEN DE TRATAMIENTO Y PROCEDIMIENTOS TERAPÉUTICOS ── */}
            <tr><td style={secH()}>E. RESUMEN DE TRATAMIENTO Y PROCEDIMIENTOS TERAPÉUTICOS</td></tr>
            <tr>
              <td style={td}>
                <RichTextEpicrisis value={d.resumen_tratamiento} onChange={s("resumen_tratamiento")} minHeight="120px"
                  placeholder="Detalle los tratamientos farmacológicos, procedimientos terapéuticos y quirúrgicos realizados durante la hospitalización..." />
              </td>
            </tr>

            {/* ── F. INDICACIONES DE ALTA / EGRESO ── */}
            <tr><td style={secH()}>F. INDICACIONES DE ALTA / EGRESO</td></tr>
            <tr>
              <td style={td}>
                <RichTextEpicrisis value={d.indicaciones_alta} onChange={s("indicaciones_alta")} minHeight="120px"
                  placeholder="Indique las instrucciones al alta: medicación, dieta, cuidados, actividad física, próximas citas de control..." />
              </td>
            </tr>

          </tbody>
        </table>

        {/* ════════════════════════════════════════════════════════════════
            TABLA [2] — G. DIAGNÓSTICO DE ALTA / EGRESO
            ════════════════════════════════════════════════════════════════ */}
        <table style={tbl}>
          <tbody>
            {/* Header: columna diagnóstico (14 cols) + columna CIE (6 cols) */}
            <tr>
              <td colSpan={14} style={secH()}>G. DIAGNÓSTICO DE ALTA / EGRESO</td>
              <td colSpan={6} style={{ ...secH(), textAlign: "center" }}>CIE</td>
            </tr>
            {/* Sub-header de columnas — alineado con las celdas de datos */}
            <tr>
              <td colSpan={6} style={{ ...tdLbl, borderRight: "none" }}><Lbl small> </Lbl></td>
              <td colSpan={8} style={tdLbl}><Lbl>DIAGNÓSTICO</Lbl></td>
              <td colSpan={6} style={tdLbl}><Lbl center>CIE-10</Lbl></td>
            </tr>
            {diagRows.map(({ label, key, cieKey }, idx) => (
              <tr key={idx} style={{ height: 28 }}>
                <td colSpan={6} style={tdLbl}>
                  <Lbl small>{label}</Lbl>
                </td>
                <td colSpan={8} style={td}>
                  <Cie10DescInput
                    cie={d[cieKey] as string}
                    descripcion={d[key] as string}
                    onChange={(cie, desc) => setD(p => ({ ...p, [key]: desc, [cieKey]: cie }))}
                  />
                </td>
                <td colSpan={6} style={td}>
                  <Cie10CieInput
                    cie={d[cieKey] as string}
                    descripcion={d[key] as string}
                    onChange={(cie, desc) => setD(p => ({ ...p, [key]: desc, [cieKey]: cie }))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ════════════════════════════════════════════════════════════════
            TABLA [3] — I. MÉDICOS TRATANTES
            (va antes de H en el Word según el mapeo)
            ════════════════════════════════════════════════════════════════ */}
        <table style={tbl}>
          <tbody>
            <tr><td colSpan={20} style={secH()}>I. MÉDICOS TRATANTES</td></tr>
            <tr>
              <td colSpan={1} style={{ ...tdLbl }}><Lbl small center>N°</Lbl></td>
              <td colSpan={7} style={{ ...tdLbl }}><Lbl>NOMBRE Y APELLIDOS</Lbl></td>
              <td colSpan={4} style={{ ...tdLbl }}><Lbl>ESPECIALIDAD</Lbl></td>
              <td colSpan={5} style={{ ...tdLbl }}><Lbl small>SELLO Y NÚMERO DE DOCUMENTO DE IDENTIFICACIÓN DEL PROFESIONAL</Lbl></td>
              <td colSpan={3} style={{ ...tdLbl }}><Lbl small>PERÍODO DE RESPONSABILIDAD</Lbl></td>
            </tr>
            <tr style={{ height: 28 }}>
              <td colSpan={1} style={tdC}><span style={{ fontSize: "10px", fontWeight: 700 }}>1.</span></td>
              <td colSpan={7} style={td}>
                <MedicoInput 
                  value={d.medico_nombre} 
                  onChangeValue={s("medico_nombre")} 
                  onSelectMedico={(m) => {
                    s("medico_nombre")(m.nombre);
                    s("medico_especialidad")(m.especialidad);
                    s("medico_sello_documento")(m.identificacion);
                  }} 
                />
              </td>
              <td colSpan={4} style={td}>
                <MedicoInput 
                  value={d.medico_especialidad} 
                  onChangeValue={s("medico_especialidad")} 
                  onSelectMedico={(m) => {
                    s("medico_nombre")(m.nombre);
                    s("medico_especialidad")(m.especialidad);
                    s("medico_sello_documento")(m.identificacion);
                  }} 
                />
              </td>
              <td colSpan={5} style={td}>
                <MedicoInput 
                  value={d.medico_sello_documento} 
                  onChangeValue={s("medico_sello_documento")} 
                  onSelectMedico={(m) => {
                    s("medico_nombre")(m.nombre);
                    s("medico_especialidad")(m.especialidad);
                    s("medico_sello_documento")(m.identificacion);
                  }} 
                />
              </td>
              <td colSpan={3} style={td}><TxtIn value={d.medico_periodo} onChange={s("medico_periodo")} placeholder="dd/mm/aaaa - dd/mm/aaaa" /></td>
            </tr>
          </tbody>
        </table>

        {/* ════════════════════════════════════════════════════════════════
            TABLA [4] — H. CONDICIÓN DE ALTA / EGRESO
            ════════════════════════════════════════════════════════════════ */}
        <table style={tbl}>
          <tbody>
            <tr><td colSpan={20} style={secH()}>H. CONDICIÓN DE ALTA / EGRESO</td></tr>

            {/* VIVO / FALLECIDO */}
            <tr>
              <td colSpan={20} style={{ ...td, padding: "6px 10px" }}>
                <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
                  <ChkLbl checked={d.condicion_vivo} onChange={c("condicion_vivo")} label="VIVO" />
                  <ChkLbl checked={d.condicion_fallecido} onChange={c("condicion_fallecido")} label="FALLECIDO" />
                </div>
              </td>
            </tr>

            {/* Sub-headers */}
            <tr>
              <td colSpan={3} style={subH}><Lbl small>TIPO DE ALTA</Lbl></td>
              <td colSpan={3} style={subH}><Lbl small>ASINTOMÁTICO</Lbl></td>
              <td colSpan={3} style={subH}><Lbl small>DISCAPACIDAD</Lbl></td>
              <td colSpan={3} style={subH}><Lbl small>RETIRO NO AUTORIZADO</Lbl></td>
              <td colSpan={4} style={subH}><Lbl small>DEFUNCIÓN</Lbl></td>
              <td colSpan={4} style={subH}><Lbl small>DÍAS</Lbl></td>
            </tr>

            {/* Fila — ALTA MÉDICA */}
            <tr style={{ height: 30 }}>
              <td colSpan={3} style={{ ...td, padding: "4px 6px" }}>
                <ChkLbl checked={d.alta_medica} onChange={c("alta_medica")} label="Alta Médica" />
              </td>
              {/* Asintomático — rowSpan 2: celda combinada */}
              <td colSpan={3} rowSpan={2} style={{ ...td, padding: "4px 6px", verticalAlign: "middle" }}>
                <ChkLbl checked={d.alta_asintomatico} onChange={c("alta_asintomatico")} label="Asintomático" />
              </td>
              {/* Discapacidad — rowSpan 2 */}
              <td colSpan={3} rowSpan={2} style={{ ...td, padding: "4px 6px", verticalAlign: "middle" }}>
                <ChkLbl checked={d.alta_discapacidad} onChange={c("alta_discapacidad")} label="Discapacidad" />
              </td>
              {/* Retiro No Autorizado — rowSpan 2 */}
              <td colSpan={3} rowSpan={2} style={{ ...td, padding: "4px 6px", verticalAlign: "middle" }}>
                <ChkLbl checked={d.alta_retiro_no_autorizado} onChange={c("alta_retiro_no_autorizado")} label="Retiro no Autorizado" />
              </td>
              <td colSpan={4} style={{ ...td, padding: "4px 6px" }}>
                <ChkLbl checked={d.alta_defuncion_menos_48h} onChange={c("alta_defuncion_menos_48h")} label="Defunción < 48h" />
              </td>
              <td colSpan={2} style={tdLbl}><Lbl small center>DÍAS DE ESTADA</Lbl></td>
              <td colSpan={2} style={td}><TxtIn value={d.dias_estada} onChange={s("dias_estada")} center /></td>
            </tr>

            {/* Fila — ALTA VOLUNTARIA */}
            <tr style={{ height: 30 }}>
              <td colSpan={3} style={{ ...td, padding: "4px 6px" }}>
                <ChkLbl checked={d.alta_voluntaria} onChange={c("alta_voluntaria")} label="Alta Voluntaria" />
              </td>
              {/* Asintomático, Discapacidad, Retiro ya ocupados por rowSpan */}
              <td colSpan={4} style={{ ...td, padding: "4px 6px" }}>
                <ChkLbl checked={d.alta_defuncion_mas_48h} onChange={c("alta_defuncion_mas_48h")} label="Defunción > 48h" />
              </td>
              <td colSpan={2} style={tdLbl}><Lbl small center>DÍAS DE REPOSO</Lbl></td>
              <td colSpan={2} style={td}><TxtIn value={d.dias_reposo} onChange={s("dias_reposo")} center /></td>
            </tr>

          </tbody>
        </table>

        {/* ════════════════════════════════════════════════════════════════
            TABLA [5] — J. DATOS DEL PROFESIONAL RESPONSABLE
            ════════════════════════════════════════════════════════════════ */}
        <table style={tbl}>
          <tbody>
            <tr>
              <td colSpan={20} style={secH()}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>J. DATOS DEL PROFESIONAL RESPONSABLE</span>
                  <BotonBuscarProfesional onSelect={(m) => {
                    const partes = parseNombresMedico(m.nombre);
                    s("prof_primer_nombre")(partes.nombres);
                    s("prof_primer_apellido")(partes.primerApellido);
                    s("prof_segundo_apellido")(partes.segundoApellido);
                    s("prof_numero_documento")(m.identificacion);
                  }} />
                </div>
              </td>
            </tr>

            {/* Labels */}
            <tr>
              <td colSpan={3} style={tdLbl}><Lbl>FECHA <span style={{ fontWeight: 400, fontSize: "8px" }}>(aaaa-mm-dd)</span></Lbl></td>
              <td colSpan={2} style={tdLbl}><Lbl>HORA <span style={{ fontWeight: 400, fontSize: "8px" }}>(hh:mm)</span></Lbl></td>
              <td colSpan={5} style={tdLbl}><Lbl>PRIMER NOMBRE</Lbl></td>
              <td colSpan={5} style={tdLbl}><Lbl>PRIMER APELLIDO</Lbl></td>
              <td colSpan={5} style={tdLbl}><Lbl>SEGUNDO APELLIDO</Lbl></td>
            </tr>
            {/* Valores */}
            <tr style={{ height: 24 }}>
              <td colSpan={3} style={td}>
                <input type="date" value={d.prof_fecha} onChange={(e) => s("prof_fecha")(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: "10px", padding: "3px", width: "100%", boxSizing: "border-box" }} />
              </td>
              <td colSpan={2} style={td}>
                <input type="time" value={d.prof_hora} onChange={(e) => s("prof_hora")(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: "10px", padding: "3px", width: "100%", boxSizing: "border-box" }} />
              </td>
              <td colSpan={5} style={td}><TxtIn value={d.prof_primer_nombre} onChange={s("prof_primer_nombre")} /></td>
              <td colSpan={5} style={td}><TxtIn value={d.prof_primer_apellido} onChange={s("prof_primer_apellido")} /></td>
              <td colSpan={5} style={td}><TxtIn value={d.prof_segundo_apellido} onChange={s("prof_segundo_apellido")} /></td>
            </tr>

            {/* Documento / Firma / Sello */}
            <tr>
              <td colSpan={6} style={tdLbl}><Lbl>NÚMERO DE DOCUMENTO DE IDENTIFICACIÓN</Lbl></td>
              <td colSpan={7} style={{ ...tdLbl, textAlign: "center" }}>
                <Lbl small center color="#aaa">FIRMA (documento impreso)</Lbl>
              </td>
              <td colSpan={7} style={{ ...tdLbl, textAlign: "center" }}>
                <Lbl small center color="#aaa">SELLO (documento impreso)</Lbl>
              </td>
            </tr>
            <tr style={{ height: 30 }}>
              <td colSpan={6} style={td}><TxtIn value={d.prof_numero_documento} onChange={s("prof_numero_documento")} /></td>
              <td colSpan={7} style={{ ...td, background: "#f8f8f8" }} />
              <td colSpan={7} style={{ ...td, background: "#f8f8f8" }} />
            </tr>

            {/* Elaborado / Revisado */}
            <tr>
              <td colSpan={2} style={tdLbl}><Lbl small>ELABORADO POR:</Lbl></td>
              <td colSpan={8} style={td}><TxtIn value={d.elaborado_por} onChange={s("elaborado_por")} /></td>
              <td colSpan={2} style={tdLbl}><Lbl small>REVISADO POR:</Lbl></td>
              <td colSpan={8} style={td}><TxtIn value={d.revisado_por} onChange={s("revisado_por")} /></td>
            </tr>

            {/* Footer */}
            <tr>
              <td colSpan={10} style={{ border: "1px solid #000", fontSize: "8px", fontWeight: 700, padding: "3px 4px" }}>
                SNS-MSP / HCU-form.006/2021
              </td>
              <td colSpan={10} style={{ border: "1px solid #000", fontSize: "10px", fontWeight: 700, textAlign: "right", padding: "3px 4px" }}>
                EPICRISIS
              </td>
            </tr>

          </tbody>
        </table>

      </div>
    </div>
  );
});

export default EpicrisisForm;