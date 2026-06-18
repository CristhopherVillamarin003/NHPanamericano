"use client";

import React, { useState, useImperativeHandle, useEffect } from "react";
import { Cie10DescInput, Cie10CieInput } from "./Cie10Input";
import RichTextEvolucion from "../ui/RichTextEvolucion";
import { useFormAutosaveAndWarn } from "@/hooks/useFormAutosaveAndWarn";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface DatosInterconsulta {
  // A. Datos del establecimiento y paciente
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
  condicion_edad: "H" | "D" | "M" | "A";

  // B. Característica de la solicitud, motivo y prioridad
  servicio_emergencia: boolean;
  servicio_consulta: boolean;
  servicio_hospitalizacion: boolean;
  servicio_especialidad: string;
  no_cama: string;
  no_sala: string;
  urgente_si: boolean;
  urgente_no: boolean;
  especialidad_consultada: string;
  descripcion_motivo: string;

  // C. Cuadro clínico actual
  cuadro_clinico: string;

  // D. Resultados de exámenes y procedimientos diagnósticos relevantes
  resultados_examenes: string;

  // E. Diagnóstico (6 entradas)
  diagnostico_1: string; diagnostico_1_cie: string; diagnostico_1_pre: boolean; diagnostico_1_def: boolean;
  diagnostico_2: string; diagnostico_2_cie: string; diagnostico_2_pre: boolean; diagnostico_2_def: boolean;
  diagnostico_3: string; diagnostico_3_cie: string; diagnostico_3_pre: boolean; diagnostico_3_def: boolean;
  diagnostico_4: string; diagnostico_4_cie: string; diagnostico_4_pre: boolean; diagnostico_4_def: boolean;
  diagnostico_5: string; diagnostico_5_cie: string; diagnostico_5_pre: boolean; diagnostico_5_def: boolean;
  diagnostico_6: string; diagnostico_6_cie: string; diagnostico_6_pre: boolean; diagnostico_6_def: boolean;

  // F. Plan terapéutico realizado
  plan_terapeutico: string;

  // G. Datos del profesional responsable
  fecha: string;
  hora: string;
  prof_primer_nombre: string;
  prof_primer_apellido: string;
  prof_segundo_apellido: string;
  prof_documento: string;
  
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
    edad?: number;
    tipoPaciente?: string;
  };
  initialData?: Partial<DatosInterconsulta>;
  atencionId?: number;
  guardando?: boolean;
  exportando?: boolean;
}

export type HistoriaClinicaInterconsultaHandle = {
  getDatos: () => Record<string, any>;
  clearAutosave?: () => void;
  isDirty?: () => boolean;
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Lbl({ children, small = false, center = false }: {
  children: React.ReactNode; small?: boolean; center?: boolean;
}) {
  return (
    <div style={{
      fontSize: small ? "8px" : "9px", fontWeight: 700,
      padding: "2px 4px", lineHeight: 1.2, color: "#000",
      textAlign: center ? "center" : "left",
    }}>
      {children}
    </div>
  );
}

function TxtInput({ value, onChange, readOnly = false, center = false, placeholder = "" }: {
  value: string; onChange?: (v: string) => void;
  readOnly?: boolean; center?: boolean; placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      style={{
        width: "100%", border: "none", outline: "none",
        background: readOnly ? "#f0f0f0" : "#fff",
        fontSize: "10px", fontFamily: "Arial, sans-serif",
        textAlign: center ? "center" : "left",
        padding: "3px 4px", color: "#000", boxSizing: "border-box",
      }}
    />
  );
}

function BigText({ value, onChange, rows = 6, placeholder = "", note }: {
  value: string; onChange: (v: string) => void;
  rows?: number; placeholder?: string; note?: string;
}) {
  const lineHeightPx = 10 * 1.4;
  const paddingPx = 8; // padding top + bottom (4px cada uno)
  const minHeight = Math.ceil(rows * lineHeightPx + paddingPx);

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
  };

  return (
    <div style={{ position: "relative" }}>
      {note && (
        <div style={{
          position: "absolute", top: 3, right: 6,
          fontSize: "8px", color: "#c0392b", fontWeight: 700,
          fontStyle: "italic", pointerEvents: "none",
        }}>
          {note}
        </div>
      )}
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
          padding: "4px 6px", boxSizing: "border-box", lineHeight: 1.4,
          background: "#fff", overflow: "hidden",
          minHeight: `${minHeight}px`,
        }}
      />
    </div>
  );
}

function ChkLabel({ checked, onChange, label }: {
  checked: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: 4,
      cursor: "pointer", fontSize: "9px",
      fontFamily: "Arial, sans-serif", padding: "2px 0",
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 11, height: 11 }}
      />
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

// ─── Componente Principal ─────────────────────────────────────────────────────

const InterconsultaForm = React.forwardRef<HistoriaClinicaInterconsultaHandle, Props>(
  ({ paciente, initialData, atencionId }, ref) => {
    const today = new Date().toISOString().split("T")[0];
    const nowTime = new Date().toTimeString().slice(0, 5);

    const [d, setD] = useState<DatosInterconsulta>(() => ({
      institucion: paciente?.tipoPaciente ?? "PARTICULAR",
      unicodigo: "62858",
      establecimiento: "NUEVO HOSPITAL PANAMERICANO",
      numero_historia_clinica: paciente?.numero_historia_clinica ?? paciente?.cedula ?? "",
      numero_archivo: "",
      no_hoja: "",
      primer_apellido: paciente?.primer_apellido ?? "",
      segundo_apellido: paciente?.segundo_apellido ?? "",
      primer_nombre: paciente?.primer_nombre ?? "",
      segundo_nombre: paciente?.segundo_nombre ?? "",
      sexo: paciente?.sexo
        ? paciente.sexo.toUpperCase().startsWith("F") ? "F" : paciente.sexo.toUpperCase().startsWith("M") ? "M" : paciente.sexo
        : "",
      edad: paciente?.edad?.toString() ?? "",
      condicion_edad: "A",

      servicio_emergencia: false,
      servicio_consulta: false,
      servicio_hospitalizacion: false,
      servicio_especialidad: "",
      no_cama: "",
      no_sala: "",
      urgente_si: false,
      urgente_no: false,
      especialidad_consultada: "",
      descripcion_motivo: "",

      cuadro_clinico: "",
      resultados_examenes: "",

      diagnostico_1: "", diagnostico_1_cie: "", diagnostico_1_pre: false, diagnostico_1_def: false,
      diagnostico_2: "", diagnostico_2_cie: "", diagnostico_2_pre: false, diagnostico_2_def: false,
      diagnostico_3: "", diagnostico_3_cie: "", diagnostico_3_pre: false, diagnostico_3_def: false,
      diagnostico_4: "", diagnostico_4_cie: "", diagnostico_4_pre: false, diagnostico_4_def: false,
      diagnostico_5: "", diagnostico_5_cie: "", diagnostico_5_pre: false, diagnostico_5_def: false,
      diagnostico_6: "", diagnostico_6_cie: "", diagnostico_6_pre: false, diagnostico_6_def: false,

      plan_terapeutico: "",

      fecha: today,
      hora: nowTime,
      prof_primer_nombre: "",
      prof_primer_apellido: "",
      prof_segundo_apellido: "",
      prof_documento: "",

      ...initialData,
    }));

    const { isDirty, clearAutosave } = useFormAutosaveAndWarn({
      formId: `hc_interconsulta_${atencionId || 'new'}_${paciente?.cedula || 'new'}`,
      initialData: initialData || {},
      currentData: d,
      onRestore: (saved) => setD(p => ({ ...p, ...saved })),
    });

    const s = (k: keyof DatosInterconsulta) => (v: string) => {
      setD((p) => ({ ...p, [k]: v }));
      if (k === "cuadro_clinico") {
        window.dispatchEvent(new CustomEvent("sync_enfermedad_actual", { detail: { source: "interconsulta", value: v } }));
      }
    };
    const c = (k: keyof DatosInterconsulta) => (v: boolean) =>
      setD((p) => ({ ...p, [k]: v }));

    useImperativeHandle(
      ref,
      () => ({
        getDatos: () => {
          const X = (v: boolean) => (v ? "X" : "");
          const flat: Record<string, any> = { ...d };

          // A
          flat["inter_institucion"] = d.institucion;
          flat["inter_unicodigo"] = d.unicodigo;
          flat["inter_establecimiento"] = d.establecimiento;
          flat["inter_numero_historia_clinica"] = d.numero_historia_clinica;
          flat["inter_numero_archivo"] = d.numero_archivo;
          flat["inter_no_hoja"] = d.no_hoja;
          flat["inter_primer_apellido"] = d.primer_apellido;
          flat["inter_segundo_apellido"] = d.segundo_apellido;
          flat["inter_primer_nombre"] = d.primer_nombre;
          flat["inter_segundo_nombre"] = d.segundo_nombre;
          flat["inter_sexo"] = d.sexo;
          flat["inter_edad"] = d.edad;
          flat["inter_condicion_edad_h"] = d.condicion_edad === "H" ? "X" : "";
          flat["inter_condicion_edad_d"] = d.condicion_edad === "D" ? "X" : "";
          flat["inter_condicion_edad_m"] = d.condicion_edad === "M" ? "X" : "";
          flat["inter_condicion_edad_a"] = d.condicion_edad === "A" ? "X" : "";

          // B
          flat["inter_servicio_emergencia"] = X(d.servicio_emergencia);
          flat["inter_servicio_consulta"] = X(d.servicio_consulta);
          flat["inter_servicio_hospitalizacion"] = X(d.servicio_hospitalizacion);
          flat["inter_servicio_especialidad"] = d.servicio_especialidad;
          flat["inter_no_cama"] = d.no_cama;
          flat["inter_no_sala"] = d.no_sala;
          flat["inter_urgente_si"] = X(d.urgente_si);
          flat["inter_urgente_no"] = X(d.urgente_no);
          flat["inter_especialidad_consultada"] = d.especialidad_consultada;
          flat["inter_descripcion_motivo"] = d.descripcion_motivo;

          // C
          flat["inter_cuadro_clinico"] = d.cuadro_clinico;

          // D
          flat["inter_resultados_examenes"] = d.resultados_examenes;

          // E
          for (let i = 1; i <= 6; i++) {
            flat[`inter_diagnostico_${i}`] = d[`diagnostico_${i}`];
            flat[`inter_diagnostico_${i}_cie`] = d[`diagnostico_${i}_cie`];
            flat[`inter_diagnostico_${i}_pre`] = X(d[`diagnostico_${i}_pre`]);
            flat[`inter_diagnostico_${i}_def`] = X(d[`diagnostico_${i}_def`]);
          }

          // F
          flat["inter_plan_terapeutico"] = d.plan_terapeutico;

          // G
          flat["inter_fecha"] = d.fecha;
          flat["inter_hora"] = d.hora;
          flat["inter_prof_primer_nombre"] = d.prof_primer_nombre;
          flat["inter_prof_primer_apellido"] = d.prof_primer_apellido;
          flat["inter_prof_segundo_apellido"] = d.prof_segundo_apellido;
          flat["inter_prof_documento"] = d.prof_documento;

          return flat;
        },
        clearAutosave: () => clearAutosave(),
        isDirty: () => isDirty,
      }),
      [d, clearAutosave, isDirty]
    );

    useEffect(() => {
      const handleSyncEA = (e: CustomEvent) => {
        if (e.detail.source !== "interconsulta") {
          setD(p => ({ ...p, cuadro_clinico: e.detail.value }));
        }
      };
      window.addEventListener("sync_enfermedad_actual", handleSyncEA as EventListener);
      return () => {
        window.removeEventListener("sync_enfermedad_actual", handleSyncEA as EventListener);
      };
    }, []);

    const tbl: React.CSSProperties = {
      width: "100%", minWidth: "1100px", borderCollapse: "collapse",
      tableLayout: "fixed", fontFamily: "Arial, sans-serif", fontSize: "10px",
    };

    const diagRows = [1, 2, 3, 4, 5, 6] as const;

    return (
      <div style={{ display: "flex", flexDirection: "column" }}>

        {/* ── Barra de acciones ─────────────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 12px", background: "#f5f5f5",
          borderBottom: "1px solid #ccc", gap: 8,
        }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#1a3a5c" }}>
              SNS-MSP / HCU-form.007/2021 — Historia Clínica Única
            </span>
            <span style={{ fontSize: "10px", color: "#555", marginLeft: 10 }}>
              INTERCONSULTA — SOLICITUD
            </span>
          </div>
        </div>

        {/* ── Cuerpo del formulario ────────────────────────────────────────── */}
        <div style={{ overflowX: "visible", overflowY: "visible", background: "#fff", minHeight: "70vh" }}>
          <table style={tbl}>
            <tbody>

              {/* ══════════════════════════════════════════════════════════════
                  A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE
                  ══════════════════════════════════════════════════════════════ */}
              <tr>
                <td colSpan={20} style={secH}>
                  A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE
                </td>
              </tr>

              {/* Fila 1 — institución */}
              <tr>
                <td colSpan={4} style={tdM}><Lbl>INSTITUCIÓN DEL SISTEMA</Lbl></td>
                <td colSpan={2} style={tdM}><Lbl>UNICÓDIGO</Lbl></td>
                <td colSpan={6} style={tdM}><Lbl>ESTABLECIMIENTO DE SALUD</Lbl></td>
                <td colSpan={4} style={tdM}><Lbl>N° HISTORIA CLÍNICA ÚNICA</Lbl></td>
                <td colSpan={2} style={tdM}><Lbl>N° ARCHIVO</Lbl></td>
                <td colSpan={2} style={tdM}><Lbl small>No. HOJA</Lbl></td>
              </tr>
              <tr style={{ height: 22 }}>
                <td colSpan={4} style={td}><TxtInput value={d.institucion} onChange={s("institucion")} /></td>
                <td colSpan={2} style={td}><TxtInput value={d.unicodigo} onChange={s("unicodigo")} center /></td>
                <td colSpan={6} style={td}><TxtInput value={d.establecimiento} onChange={s("establecimiento")} /></td>
                <td colSpan={4} style={td}><TxtInput value={d.numero_historia_clinica} onChange={s("numero_historia_clinica")} center /></td>
                <td colSpan={2} style={td}><TxtInput value={d.numero_archivo} onChange={s("numero_archivo")} center /></td>
                <td colSpan={2} style={td}><TxtInput value={d.no_hoja} onChange={s("no_hoja")} center /></td>
              </tr>

              {/* Fila 2 — paciente */}
              <tr>
                <td colSpan={4} style={tdM}><Lbl>PRIMER APELLIDO</Lbl></td>
                <td colSpan={4} style={tdM}><Lbl>SEGUNDO APELLIDO</Lbl></td>
                <td colSpan={4} style={tdM}><Lbl>PRIMER NOMBRE</Lbl></td>
                <td colSpan={3} style={tdM}><Lbl>SEGUNDO NOMBRE</Lbl></td>
                <td colSpan={1} style={tdM}><Lbl>SEXO</Lbl></td>
                <td colSpan={1} style={tdM}><Lbl>EDAD</Lbl></td>
                <td colSpan={3} style={tdM}>
                  <Lbl small center>CONDICIÓN EDAD</Lbl>
                  <div style={{ display: "flex", justifyContent: "space-around", fontSize: "7px", fontWeight: 700, padding: "1px 2px" }}>
                    <span>H</span><span>D</span><span>M</span><span>A</span>
                  </div>
                </td>
              </tr>
              <tr style={{ height: 22 }}>
                <td colSpan={4} style={td}><TxtInput value={d.primer_apellido} onChange={s("primer_apellido")} /></td>
                <td colSpan={4} style={td}><TxtInput value={d.segundo_apellido} onChange={s("segundo_apellido")} /></td>
                <td colSpan={4} style={td}><TxtInput value={d.primer_nombre} onChange={s("primer_nombre")} /></td>
                <td colSpan={3} style={td}><TxtInput value={d.segundo_nombre} onChange={s("segundo_nombre")} /></td>
                <td colSpan={1} style={td}><TxtInput value={d.sexo} onChange={s("sexo")} center /></td>
                <td colSpan={1} style={td}><TxtInput value={d.edad} onChange={s("edad")} center /></td>
                <td colSpan={3} style={td}>
                  <div style={{ display: "flex", justifyContent: "space-around", padding: "4px 2px" }}>
                    {(["H", "D", "M", "A"] as const).map((op) => (
                      <input
                        key={op} type="radio"
                        name="inter_condicion_edad" value={op}
                        checked={d.condicion_edad === op}
                        onChange={() => setD((p) => ({ ...p, condicion_edad: op }))}
                        style={{ width: 10, height: 10, cursor: "pointer" }}
                        title={op === "H" ? "Horas" : op === "D" ? "Días" : op === "M" ? "Meses" : "Años"}
                      />
                    ))}
                  </div>
                </td>
              </tr>

              {/* ══════════════════════════════════════════════════════════════
                  B. CARACTERÍSTICA DE LA SOLICITUD, MOTIVO Y PRIORIDAD
                  ══════════════════════════════════════════════════════════════ */}
              <tr>
                <td colSpan={20} style={secH}>
                  B. CARACTERÍSTICA DE LA SOLICITUD, MOTIVO Y PRIORIDAD DE ATENCIÓN
                </td>
              </tr>

              {/* Sub-headers: SERVICIO | ESPECIALIDAD | No. CAMA | No. SALA | URGENTE */}
              <tr>
                <td colSpan={4} style={tdM}><Lbl>SERVICIO</Lbl></td>
                <td colSpan={6} style={tdM}><Lbl>ESPECIALIDAD</Lbl></td>
                <td colSpan={2} style={tdM}><Lbl small>No. CAMA</Lbl></td>
                <td colSpan={3} style={tdM}><Lbl small>No. SALA</Lbl></td>
                <td colSpan={5} style={tdM}>
                  <Lbl>URGENTE</Lbl>
                  <div style={{ display: "flex", gap: 20, padding: "0 4px", fontSize: "8px", fontWeight: 700 }}>
                    <span>SI</span><span>NO</span>
                  </div>
                </td>
              </tr>

              {/* Valores: checkboxes servicio + campos + urgente SI/NO */}
              <tr style={{ minHeight: 44 }}>
                <td colSpan={4} style={{ ...td, padding: "4px 6px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <ChkLabel checked={d.servicio_emergencia} onChange={c("servicio_emergencia")} label="Emergencia" />
                    <ChkLabel checked={d.servicio_consulta} onChange={c("servicio_consulta")} label="Consulta Externa" />
                    <ChkLabel checked={d.servicio_hospitalizacion} onChange={c("servicio_hospitalizacion")} label="Hospitalización" />
                  </div>
                </td>
                <td colSpan={6} style={td}>
                  <TxtInput value={d.servicio_especialidad} onChange={s("servicio_especialidad")} placeholder="Especialidad" />
                </td>
                <td colSpan={2} style={td}>
                  <TxtInput value={d.no_cama} onChange={s("no_cama")} center placeholder="Cama" />
                </td>
                <td colSpan={3} style={td}>
                  <TxtInput value={d.no_sala} onChange={s("no_sala")} center placeholder="Sala" />
                </td>
                <td colSpan={5} style={{ ...td, padding: "4px 8px" }}>
                  <div style={{ display: "flex", gap: 20, alignItems: "center", paddingTop: 4 }}>
                    <input
                      type="checkbox" checked={d.urgente_si}
                      onChange={(e) => c("urgente_si")(e.target.checked)}
                      style={{ width: 13, height: 13, cursor: "pointer" }}
                    />
                    <input
                      type="checkbox" checked={d.urgente_no}
                      onChange={(e) => c("urgente_no")(e.target.checked)}
                      style={{ width: 13, height: 13, cursor: "pointer" }}
                    />
                  </div>
                </td>
              </tr>

              {/* Especialidad consultada */}
              <tr>
                <td colSpan={4} style={tdM}>
                  <Lbl>ESPECIALIDAD CONSULTADA</Lbl>
                </td>
                <td colSpan={16} style={td}>
                  <TxtInput
                    value={d.especialidad_consultada}
                    onChange={s("especialidad_consultada")}
                    placeholder="Especialidad médica a la que se remite la interconsulta..."
                  />
                </td>
              </tr>

              {/* Descripción del motivo */}
              <tr>
                <td colSpan={4} style={tdM}>
                  <Lbl>DESCRIPCIÓN DEL MOTIVO</Lbl>
                </td>
                <td colSpan={16} style={td}>
                  <TxtInput
                    value={d.descripcion_motivo}
                    onChange={s("descripcion_motivo")}
                    placeholder="Motivo de la interconsulta..."
                  />
                </td>
              </tr>

              {/* ══════════════════════════════════════════════════════════════
                  C. CUADRO CLÍNICO ACTUAL
                  ══════════════════════════════════════════════════════════════ */}
              <tr>
                <td colSpan={14} style={secH}>
                  C. CUADRO CLÍNICO ACTUAL
                </td>
                <td colSpan={6} style={{
                  ...secH,
                  background: "#fce4d6",
                  fontSize: "9px",
                  textAlign: "center",
                  color: "#c0392b",
                }}>
                  ⚠ REGISTRAR DE MANERA OBLIGATORIA
                </td>
              </tr>
              <tr>
                <td colSpan={20} style={td}>
                  <RichTextEvolucion
                    value={d.cuadro_clinico}
                    onChange={s("cuadro_clinico")}
                    minHeight="120px"
                    placeholder="Describa el cuadro clínico actual del paciente (anamnesis, signos y síntomas, hallazgos relevantes)..."
                  />
                </td>
              </tr>

              {/* ══════════════════════════════════════════════════════════════
                  D. RESULTADOS DE EXÁMENES Y PROCEDIMIENTOS DIAGNÓSTICOS
                  ══════════════════════════════════════════════════════════════ */}
              <tr>
                <td colSpan={20} style={secH}>
                  D. RESULTADOS DE EXÁMENES Y PROCEDIMIENTOS DIAGNÓSTICOS RELEVANTES
                </td>
              </tr>
              <tr>
                <td colSpan={20} style={td}>
                  <RichTextEvolucion
                    value={d.resultados_examenes}
                    onChange={s("resultados_examenes")}
                    minHeight="120px"
                    placeholder="Registre los resultados de laboratorio, imagenología y otros procedimientos diagnósticos relevantes para la interconsulta..."
                  />
                </td>
              </tr>

              {/* ══════════════════════════════════════════════════════════════
                  E. DIAGNÓSTICO
                  ══════════════════════════════════════════════════════════════ */}
              <tr>
                <td colSpan={20} style={secH}>
                  E. DIAGNÓSTICO
                  <span style={{ fontSize: "9px", fontWeight: 400, marginLeft: 12, color: "#555" }}>
                    PRE = PRESUNTIVO &nbsp;&nbsp;&nbsp; DEF = DEFINITIVO
                  </span>
                </td>
              </tr>

              {/* Cabecera de columnas */}
              <tr>
                <td colSpan={1} style={{ ...tdM, background: "#DCE6F1" }}>
                  <Lbl small center>N°</Lbl>
                </td>
                <td colSpan={11} style={{ ...tdM, background: "#DCE6F1" }}>
                  <Lbl>DIAGNÓSTICO</Lbl>
                </td>
                <td colSpan={4} style={{ ...tdM, background: "#DCE6F1" }}>
                  <Lbl center>CIE-10</Lbl>
                </td>
                <td colSpan={2} style={{ ...tdM, background: "#DCE6F1" }}>
                  <Lbl center small>PRE</Lbl>
                </td>
                <td colSpan={2} style={{ ...tdM, background: "#DCE6F1" }}>
                  <Lbl center small>DEF</Lbl>
                </td>
              </tr>

              {/* 6 filas de diagnóstico */}
              {diagRows.map((n) => {
                const dk = `diagnostico_${n}` as keyof DatosInterconsulta;
                const ck = `diagnostico_${n}_cie` as keyof DatosInterconsulta;
                const pk = `diagnostico_${n}_pre` as keyof DatosInterconsulta;
                const fk = `diagnostico_${n}_def` as keyof DatosInterconsulta;
                return (
                  <tr key={n} style={{ height: 26 }}>
                    <td colSpan={1} style={{ ...td, textAlign: "center", verticalAlign: "middle", background: "#f9f9f9" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700 }}>{n}</span>
                    </td>
                    <td colSpan={11} style={td}>
                      <Cie10DescInput
                        cie={d[ck] as string}
                        descripcion={d[dk] as string}
                        onChange={(cie, desc) => setD(p => ({ ...p, [dk]: desc, [ck]: cie }))}
                      />
                    </td>
                    <td colSpan={4} style={td}>
                      <Cie10CieInput
                        cie={d[ck] as string}
                        descripcion={d[dk] as string}
                        onChange={(cie, desc) => setD(p => ({ ...p, [dk]: desc, [ck]: cie }))}
                      />
                    </td>
                    <td colSpan={2} style={{ ...td, textAlign: "center", verticalAlign: "middle" }}>
                      <input
                        type="checkbox"
                        checked={d[pk] as boolean}
                        onChange={(e) => c(pk)(e.target.checked)}
                        style={{ width: 12, height: 12 }}
                      />
                    </td>
                    <td colSpan={2} style={{ ...td, textAlign: "center", verticalAlign: "middle" }}>
                      <input
                        type="checkbox"
                        checked={d[fk] as boolean}
                        onChange={(e) => c(fk)(e.target.checked)}
                        style={{ width: 12, height: 12 }}
                      />
                    </td>
                  </tr>
                );
              })}

              {/* ══════════════════════════════════════════════════════════════
                  F. PLAN TERAPÉUTICO REALIZADO
                  ══════════════════════════════════════════════════════════════ */}
              <tr>
                <td colSpan={20} style={secH}>
                  F. PLAN TERAPÉUTICO REALIZADO
                </td>
              </tr>
              <tr>
                <td colSpan={20} style={td}>
                  <RichTextEvolucion
                    value={d.plan_terapeutico}
                    onChange={s("plan_terapeutico")}
                    minHeight="150px"
                    placeholder="Describa el plan terapéutico realizado hasta el momento y la razón de la interconsulta..."
                  />
                </td>
              </tr>

              {/* ══════════════════════════════════════════════════════════════
                  G. DATOS DEL PROFESIONAL RESPONSABLE
                  ══════════════════════════════════════════════════════════════ */}
              <tr>
                <td colSpan={20} style={secH}>
                  G. DATOS DEL PROFESIONAL RESPONSABLE
                </td>
              </tr>

              {/* Labels */}
              <tr>
                <td colSpan={2} style={tdM}><Lbl>FECHA</Lbl><Lbl small>(aaaa-mm-dd)</Lbl></td>
                <td colSpan={2} style={tdM}><Lbl>HORA</Lbl><Lbl small>(hh:mm)</Lbl></td>
                <td colSpan={5} style={tdM}><Lbl>PRIMER NOMBRE</Lbl></td>
                <td colSpan={5} style={tdM}><Lbl>PRIMER APELLIDO</Lbl></td>
                <td colSpan={6} style={tdM}><Lbl>SEGUNDO APELLIDO</Lbl></td>
              </tr>

              {/* Valores */}
              <tr style={{ height: 24 }}>
                <td colSpan={2} style={td}>
                  <input
                    type="date" value={d.fecha}
                    onChange={(e) => s("fecha")(e.target.value)}
                    style={{ border: "none", outline: "none", fontSize: "10px", padding: "3px", width: "100%", boxSizing: "border-box" }}
                  />
                </td>
                <td colSpan={2} style={td}>
                  <input
                    type="time" value={d.hora}
                    onChange={(e) => s("hora")(e.target.value)}
                    style={{ border: "none", outline: "none", fontSize: "10px", padding: "3px", width: "100%", boxSizing: "border-box" }}
                  />
                </td>
                <td colSpan={5} style={td}><TxtInput value={d.prof_primer_nombre} onChange={s("prof_primer_nombre")} /></td>
                <td colSpan={5} style={td}><TxtInput value={d.prof_primer_apellido} onChange={s("prof_primer_apellido")} /></td>
                <td colSpan={6} style={td}><TxtInput value={d.prof_segundo_apellido} onChange={s("prof_segundo_apellido")} /></td>
              </tr>

              {/* Documento / Firma / Sello */}
              <tr>
                <td colSpan={4} style={tdM}><Lbl>N° DOCUMENTO DE IDENTIFICACIÓN</Lbl></td>
                <td colSpan={9} style={{ ...tdM, background: "#f8f8f8", textAlign: "center" }}>
                  <span style={{ fontSize: "8px", color: "#aaa", fontStyle: "italic" }}>FIRMA (documento impreso)</span>
                </td>
                <td colSpan={7} style={{ ...tdM, background: "#f8f8f8", textAlign: "center" }}>
                  <span style={{ fontSize: "8px", color: "#aaa", fontStyle: "italic" }}>SELLO (documento impreso)</span>
                </td>
              </tr>
              <tr style={{ height: 28 }}>
                <td colSpan={4} style={td}><TxtInput value={d.prof_documento} onChange={s("prof_documento")} /></td>
                <td colSpan={9} style={{ ...td, background: "#f8f8f8" }} />
                <td colSpan={7} style={{ ...td, background: "#f8f8f8" }} />
              </tr>

              {/* Footer */}
              <tr>
                <td colSpan={10} style={{ border: "1px solid #000", fontSize: "8px", fontWeight: 700, padding: "3px 4px" }}>
                  SNS-MSP / HCU-form.007/2021
                </td>
                <td colSpan={10} style={{ border: "1px solid #000", fontSize: "10px", fontWeight: 700, textAlign: "right", padding: "3px 4px" }}>
                  INTERCONSULTA — SOLICITUD
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

InterconsultaForm.displayName = "HistoriaClinicaInterconsultaForm";

export default InterconsultaForm;