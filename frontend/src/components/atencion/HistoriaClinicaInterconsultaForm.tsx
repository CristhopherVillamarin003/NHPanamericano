"use client";

import React, { useState, useImperativeHandle, useEffect } from "react";
import { Cie10DescInput, Cie10CieInput } from "./Cie10Input";
import { BotonBuscarProfesional } from "@/components/ui/BotonBuscarProfesional";
import { parseNombresMedico } from "@/lib/services/medicos";
import RichTextEvolucion from "../ui/RichTextEvolucion";
import { useFormAutosaveAndWarn } from "@/hooks/useFormAutosaveAndWarn";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface BloqueInterconsulta {
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
}

export interface DatosInterconsulta {
  bloques: BloqueInterconsulta[];
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

export const MAX_BLOQUES_INTERCONSULTA = 11;

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
        width: "100%",
        border: "none",
        outline: "none",
        background: readOnly ? "#f0f0f0" : "#fff",
        fontSize: "10px",
        fontFamily: "Arial, sans-serif",
        textAlign: center ? "center" : "left",
        padding: "3px 4px",
        color: "#000",
        boxSizing: "border-box",
      }}
    />
  );
}

function ChkLabel({ checked, onChange, label }: {
  checked: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 3, cursor: "pointer", fontSize: "9px", fontFamily: "Arial, sans-serif" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 11, height: 11, cursor: "pointer" }}
      />
      {label}
    </label>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const td: React.CSSProperties = {
  border: "1px solid #000",
  padding: 0,
  verticalAlign: "top",
};

const tdM: React.CSSProperties = {
  ...td,
  verticalAlign: "middle",
  background: "#CCFFCC",
};

const secH: React.CSSProperties = {
  background: "#CCCCFF",
  fontWeight: 700,
  fontSize: "11px",
  fontFamily: "Arial, sans-serif",
  padding: "4px 8px",
  border: "1px solid #000",
  letterSpacing: "0.02em",
};

// ─── Bloque único (A → G) ────────────────────────────────────────────────────

function InterconsultaBloque({
  numero,
  b,
  onChange,
  onDiagnosticoChange,
}: {
  numero: number;
  b: BloqueInterconsulta;
  onChange: <K extends keyof BloqueInterconsulta>(campo: K, valor: BloqueInterconsulta[K]) => void;
  onDiagnosticoChange: (n: number, cie: string, desc: string) => void;
}) {
  const s = (k: keyof BloqueInterconsulta) => (v: string) => onChange(k, v as never);
  const c = (k: keyof BloqueInterconsulta) => (v: boolean) => onChange(k, v as never);

  const tbl: React.CSSProperties = {
    width: "100%",
    minWidth: "1100px",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    fontFamily: "Arial, sans-serif",
    fontSize: "10px",
  };

  const diagRows = [1, 2, 3, 4, 5, 6] as const;

  return (
    <div style={{ marginBottom: 0 }}>
      <table style={tbl}>
        <tbody>
          {/* Fila oculta de calibración (20 columnas exactas) */}
          <tr style={{ height: 0, visibility: "hidden" }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <td key={i} style={{ width: "5%", padding: 0, border: "none" }} />
            ))}
          </tr>

          {/* ══════════════════════════════════════════════════════════════
              A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE
              ══════════════════════════════════════════════════════════════ */}
          <tr>
            <td colSpan={20} style={{
              ...secH,
              borderTop: numero > 1 ? "3px solid #1a3a5c" : "1px solid #000",
            }}>
              {numero > 1 && <span style={{ fontSize: "9px", opacity: 0.7, marginRight: 8 }}>#{numero}</span>}
              A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE
            </td>
          </tr>

          {/* Headers Fila 1 */}
          <tr>
            <td colSpan={5} style={tdM}><Lbl>INSTITUCIÓN DEL SISTEMA</Lbl></td>
            <td colSpan={2} style={tdM}><Lbl center>UNICÓDIGO</Lbl></td>
            <td colSpan={7} style={tdM}><Lbl>ESTABLECIMIENTO DE SALUD</Lbl></td>
            <td colSpan={3} style={tdM}><Lbl center small>NÚMERO DE HISTORIA CLÍNICA</Lbl></td>
            <td colSpan={2} style={tdM}><Lbl center small>NÚMERO DE ARCHIVO</Lbl></td>
            <td colSpan={1} style={tdM}><Lbl center small>No. HOJA</Lbl></td>
          </tr>

          {/* Inputs Fila 1 */}
          <tr style={{ height: 24 }}>
            <td colSpan={5} style={td}><TxtInput value={b.institucion} onChange={s("institucion")} /></td>
            <td colSpan={2} style={td}><TxtInput value={b.unicodigo} onChange={s("unicodigo")} center /></td>
            <td colSpan={7} style={td}><TxtInput value={b.establecimiento} onChange={s("establecimiento")} /></td>
            <td colSpan={3} style={td}><TxtInput value={b.numero_historia_clinica} onChange={s("numero_historia_clinica")} center /></td>
            <td colSpan={2} style={td}><TxtInput value={b.numero_archivo} onChange={s("numero_archivo")} center /></td>
            <td colSpan={1} style={td}><TxtInput value={b.no_hoja} onChange={s("no_hoja")} center /></td>
          </tr>

          {/* Headers Fila 2 */}
          <tr>
            <td colSpan={4} style={tdM}><Lbl>PRIMER APELLIDO</Lbl></td>
            <td colSpan={4} style={tdM}><Lbl>SEGUNDO APELLIDO</Lbl></td>
            <td colSpan={4} style={tdM}><Lbl>PRIMER NOMBRE</Lbl></td>
            <td colSpan={3} style={tdM}><Lbl>SEGUNDO NOMBRE</Lbl></td>
            <td colSpan={1} style={tdM}><Lbl center>SEXO</Lbl></td>
            <td colSpan={1} style={tdM}><Lbl center>EDAD</Lbl></td>
            <td colSpan={3} style={tdM}>
              <Lbl center small>CONDICIÓN EDAD</Lbl>
              <div style={{ display: "flex", justifyContent: "space-around", fontSize: "7px", fontWeight: 700, padding: "0 2px" }}>
                <span>H</span><span>D</span><span>M</span><span>A</span>
              </div>
            </td>
          </tr>

          {/* Inputs Fila 2 */}
          <tr style={{ height: 24 }}>
            <td colSpan={4} style={td}><TxtInput value={b.primer_apellido} onChange={s("primer_apellido")} /></td>
            <td colSpan={4} style={td}><TxtInput value={b.segundo_apellido} onChange={s("segundo_apellido")} /></td>
            <td colSpan={4} style={td}><TxtInput value={b.primer_nombre} onChange={s("primer_nombre")} /></td>
            <td colSpan={3} style={td}><TxtInput value={b.segundo_nombre} onChange={s("segundo_nombre")} /></td>
            <td colSpan={1} style={td}><TxtInput value={b.sexo} onChange={s("sexo")} center /></td>
            <td colSpan={1} style={td}><TxtInput value={b.edad} onChange={s("edad")} center /></td>
            <td colSpan={3} style={{ ...td, padding: "2px 4px", verticalAlign: "middle" }}>
              <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                {(["H", "D", "M", "A"] as const).map((op) => (
                  <input
                    key={op} type="radio"
                    name={`inter_condicion_edad_${numero}`} value={op}
                    checked={b.condicion_edad === op}
                    onChange={() => onChange("condicion_edad", op)}
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
                <ChkLabel checked={b.servicio_emergencia} onChange={c("servicio_emergencia")} label="Emergencia" />
                <ChkLabel checked={b.servicio_consulta} onChange={c("servicio_consulta")} label="Consulta Externa" />
                <ChkLabel checked={b.servicio_hospitalizacion} onChange={c("servicio_hospitalizacion")} label="Hospitalización" />
              </div>
            </td>
            <td colSpan={6} style={td}>
              <TxtInput value={b.servicio_especialidad} onChange={s("servicio_especialidad")} placeholder="Especialidad" />
            </td>
            <td colSpan={2} style={td}>
              <TxtInput value={b.no_cama} onChange={s("no_cama")} center placeholder="Cama" />
            </td>
            <td colSpan={3} style={td}>
              <TxtInput value={b.no_sala} onChange={s("no_sala")} center placeholder="Sala" />
            </td>
            <td colSpan={5} style={{ ...td, padding: "4px 8px" }}>
              <div style={{ display: "flex", gap: 20, alignItems: "center", paddingTop: 4 }}>
                <input
                  type="checkbox" checked={b.urgente_si}
                  onChange={(e) => c("urgente_si")(e.target.checked)}
                  style={{ width: 13, height: 13, cursor: "pointer" }}
                />
                <input
                  type="checkbox" checked={b.urgente_no}
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
                value={b.especialidad_consultada}
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
                value={b.descripcion_motivo}
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
                value={b.cuadro_clinico}
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
                value={b.resultados_examenes}
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
            const dk = `diagnostico_${n}` as keyof BloqueInterconsulta;
            const ck = `diagnostico_${n}_cie` as keyof BloqueInterconsulta;
            const pk = `diagnostico_${n}_pre` as keyof BloqueInterconsulta;
            const fk = `diagnostico_${n}_def` as keyof BloqueInterconsulta;
            return (
              <tr key={n} style={{ height: 26 }}>
                <td colSpan={1} style={{ ...td, textAlign: "center", verticalAlign: "middle", background: "#f9f9f9" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700 }}>{n}</span>
                </td>
                <td colSpan={11} style={td}>
                  <Cie10DescInput
                    cie={b[ck] as string}
                    descripcion={b[dk] as string}
                    onChange={(cie, desc) => onDiagnosticoChange(n, cie, desc)}
                  />
                </td>
                <td colSpan={4} style={td}>
                  <Cie10CieInput
                    cie={b[ck] as string}
                    descripcion={b[dk] as string}
                    onChange={(cie, desc) => onDiagnosticoChange(n, cie, desc)}
                  />
                </td>
                <td colSpan={2} style={{ ...td, textAlign: "center", verticalAlign: "middle" }}>
                  <input
                    type="checkbox"
                    checked={b[pk] as boolean}
                    onChange={(e) => c(pk)(e.target.checked)}
                    style={{ width: 12, height: 12 }}
                  />
                </td>
                <td colSpan={2} style={{ ...td, textAlign: "center", verticalAlign: "middle" }}>
                  <input
                    type="checkbox"
                    checked={b[fk] as boolean}
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
                value={b.plan_terapeutico}
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>G. DATOS DEL PROFESIONAL RESPONSABLE</span>
                <BotonBuscarProfesional onSelect={(m) => {
                  const partes = parseNombresMedico(m.nombre);
                  onChange("prof_primer_nombre", partes.nombres);
                  onChange("prof_primer_apellido", partes.primerApellido);
                  onChange("prof_segundo_apellido", partes.segundoApellido);
                  onChange("prof_documento", m.identificacion);
                }} />
              </div>
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
                type="date" value={b.fecha}
                onChange={(e) => s("fecha")(e.target.value)}
                style={{ border: "none", outline: "none", fontSize: "10px", padding: "3px", width: "100%", boxSizing: "border-box" }}
              />
            </td>
            <td colSpan={2} style={td}>
              <input
                type="time" value={b.hora}
                onChange={(e) => s("hora")(e.target.value)}
                style={{ border: "none", outline: "none", fontSize: "10px", padding: "3px", width: "100%", boxSizing: "border-box" }}
              />
            </td>
            <td colSpan={5} style={td}><TxtInput value={b.prof_primer_nombre} onChange={s("prof_primer_nombre")} /></td>
            <td colSpan={5} style={td}><TxtInput value={b.prof_primer_apellido} onChange={s("prof_primer_apellido")} /></td>
            <td colSpan={6} style={td}><TxtInput value={b.prof_segundo_apellido} onChange={s("prof_segundo_apellido")} /></td>
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
            <td colSpan={4} style={td}><TxtInput value={b.prof_documento} onChange={s("prof_documento")} /></td>
            <td colSpan={9} style={{ ...td, background: "#f8f8f8" }} />
            <td colSpan={7} style={{ ...td, background: "#f8f8f8" }} />
          </tr>

          {/* Footer */}
          <tr>
            <td colSpan={10} style={{ border: "1px solid #000", fontSize: "8px", fontWeight: 700, padding: "3px 4px" }}>
              SNS-MSP / HCU-form.007/2021
            </td>
            <td colSpan={10} style={{ border: "1px solid #000", fontSize: "10px", fontWeight: 700, textAlign: "right", padding: "3px 4px" }}>
              INTERCONSULTA — SOLICITUD ({numero})
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  );
}

// ─── Helpers de Creación y Migración ──────────────────────────────────────────

function crearBloqueVacio(paciente?: Props["paciente"], numeroHoja = 1): BloqueInterconsulta {
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);
  return {
    institucion: paciente?.tipoPaciente ?? "PARTICULAR",
    unicodigo: "35865",
    establecimiento: "NUEVO HOSPITAL PANAMERICANO",
    numero_historia_clinica: paciente?.numero_historia_clinica ?? paciente?.cedula ?? "",
    numero_archivo: "",
    no_hoja: String(numeroHoja),

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
  };
}

function migrarDatosAntiguos(data: any, paciente?: Props["paciente"]): BloqueInterconsulta {
  const base = crearBloqueVacio(paciente, 1);
  if (!data || typeof data !== "object") return base;

  return {
    ...base,
    institucion: data.institucion ?? data.inter_institucion ?? base.institucion,
    unicodigo: data.unicodigo ?? data.inter_unicodigo ?? base.unicodigo,
    establecimiento: data.establecimiento ?? data.inter_establecimiento ?? base.establecimiento,
    numero_historia_clinica: data.numero_historia_clinica ?? data.inter_numero_historia_clinica ?? base.numero_historia_clinica,
    numero_archivo: data.numero_archivo ?? data.inter_numero_archivo ?? base.numero_archivo,
    no_hoja: data.no_hoja ?? data.inter_no_hoja ?? "1",

    primer_apellido: data.primer_apellido ?? data.inter_primer_apellido ?? base.primer_apellido,
    segundo_apellido: data.segundo_apellido ?? data.inter_segundo_apellido ?? base.segundo_apellido,
    primer_nombre: data.primer_nombre ?? data.inter_primer_nombre ?? base.primer_nombre,
    segundo_nombre: data.segundo_nombre ?? data.inter_segundo_nombre ?? base.segundo_nombre,
    sexo: data.sexo ?? data.inter_sexo ?? base.sexo,
    edad: data.edad ? String(data.edad) : (data.inter_edad ? String(data.inter_edad) : base.edad),
    condicion_edad: data.condicion_edad ?? data.inter_condicion_edad ?? (data.inter_condicion_edad_h ? "H" : data.inter_condicion_edad_d ? "D" : data.inter_condicion_edad_m ? "M" : "A"),

    servicio_emergencia: !!(data.servicio_emergencia ?? data.inter_servicio_emergencia),
    servicio_consulta: !!(data.servicio_consulta ?? data.inter_servicio_consulta),
    servicio_hospitalizacion: !!(data.servicio_hospitalizacion ?? data.inter_servicio_hospitalizacion),
    servicio_especialidad: data.servicio_especialidad ?? data.inter_servicio_especialidad ?? "",
    no_cama: data.no_cama ?? data.inter_no_cama ?? "",
    no_sala: data.no_sala ?? data.inter_no_sala ?? "",
    urgente_si: !!(data.urgente_si ?? data.inter_urgente_si),
    urgente_no: !!(data.urgente_no ?? data.inter_urgente_no),
    especialidad_consultada: data.especialidad_consultada ?? data.inter_especialidad_consultada ?? "",
    descripcion_motivo: data.descripcion_motivo ?? data.inter_descripcion_motivo ?? "",

    cuadro_clinico: data.cuadro_clinico ?? data.inter_cuadro_clinico ?? "",
    resultados_examenes: data.resultados_examenes ?? data.inter_resultados_examenes ?? "",

    diagnostico_1: data.diagnostico_1 ?? data.inter_diagnostico_1 ?? "",
    diagnostico_1_cie: data.diagnostico_1_cie ?? data.inter_diagnostico_1_cie ?? "",
    diagnostico_1_pre: !!(data.diagnostico_1_pre ?? data.inter_diagnostico_1_pre),
    diagnostico_1_def: !!(data.diagnostico_1_def ?? data.inter_diagnostico_1_def),

    diagnostico_2: data.diagnostico_2 ?? data.inter_diagnostico_2 ?? "",
    diagnostico_2_cie: data.diagnostico_2_cie ?? data.inter_diagnostico_2_cie ?? "",
    diagnostico_2_pre: !!(data.diagnostico_2_pre ?? data.inter_diagnostico_2_pre),
    diagnostico_2_def: !!(data.diagnostico_2_def ?? data.inter_diagnostico_2_def),

    diagnostico_3: data.diagnostico_3 ?? data.inter_diagnostico_3 ?? "",
    diagnostico_3_cie: data.diagnostico_3_cie ?? data.inter_diagnostico_3_cie ?? "",
    diagnostico_3_pre: !!(data.diagnostico_3_pre ?? data.inter_diagnostico_3_pre),
    diagnostico_3_def: !!(data.diagnostico_3_def ?? data.inter_diagnostico_3_def),

    diagnostico_4: data.diagnostico_4 ?? data.inter_diagnostico_4 ?? "",
    diagnostico_4_cie: data.diagnostico_4_cie ?? data.inter_diagnostico_4_cie ?? "",
    diagnostico_4_pre: !!(data.diagnostico_4_pre ?? data.inter_diagnostico_4_pre),
    diagnostico_4_def: !!(data.diagnostico_4_def ?? data.inter_diagnostico_4_def),

    diagnostico_5: data.diagnostico_5 ?? data.inter_diagnostico_5 ?? "",
    diagnostico_5_cie: data.diagnostico_5_cie ?? data.inter_diagnostico_5_cie ?? "",
    diagnostico_5_pre: !!(data.diagnostico_5_pre ?? data.inter_diagnostico_5_pre),
    diagnostico_5_def: !!(data.diagnostico_5_def ?? data.inter_diagnostico_5_def),

    diagnostico_6: data.diagnostico_6 ?? data.inter_diagnostico_6 ?? "",
    diagnostico_6_cie: data.diagnostico_6_cie ?? data.inter_diagnostico_6_cie ?? "",
    diagnostico_6_pre: !!(data.diagnostico_6_pre ?? data.inter_diagnostico_6_pre),
    diagnostico_6_def: !!(data.diagnostico_6_def ?? data.inter_diagnostico_6_def),

    plan_terapeutico: data.plan_terapeutico ?? data.inter_plan_terapeutico ?? "",

    fecha: data.fecha ?? data.inter_fecha ?? base.fecha,
    hora: data.hora ?? data.inter_hora ?? base.hora,
    prof_primer_nombre: data.prof_primer_nombre ?? data.inter_prof_primer_nombre ?? "",
    prof_primer_apellido: data.prof_primer_apellido ?? data.inter_prof_primer_apellido ?? "",
    prof_segundo_apellido: data.prof_segundo_apellido ?? data.inter_prof_segundo_apellido ?? "",
    prof_documento: data.prof_documento ?? data.inter_prof_documento ?? "",
  };
}

// ─── Componente Principal ─────────────────────────────────────────────────────

const InterconsultaForm = React.forwardRef<HistoriaClinicaInterconsultaHandle, Props>(
  ({ paciente, initialData, atencionId }, ref) => {
    const [datos, setDatos] = useState<DatosInterconsulta>(() => {
      if (initialData?.bloques && initialData.bloques.length > 0) {
        return { bloques: [...initialData.bloques] };
      }
      if (initialData && Object.keys(initialData).length > 0) {
        return { bloques: [migrarDatosAntiguos(initialData, paciente)] };
      }
      return { bloques: [crearBloqueVacio(paciente, 1)] };
    });

    const { isDirty, clearAutosave } = useFormAutosaveAndWarn({
      formId: `hc_interconsulta_${atencionId || 'new'}_${paciente?.cedula || 'new'}`,
      initialData: initialData || { bloques: [crearBloqueVacio(paciente, 1)] },
      currentData: datos,
      onRestore: (saved) => setDatos(p => ({ ...p, ...saved })),
    });

    const handleAddBloque = () => {
      if (datos.bloques.length >= MAX_BLOQUES_INTERCONSULTA) return;
      setDatos((prev) => {
        const firstBlock = prev.bloques[0];
        const nextHoja = prev.bloques.length + 1;
        const newBlock: BloqueInterconsulta = firstBlock
          ? {
              ...crearBloqueVacio(paciente, nextHoja),
              institucion: firstBlock.institucion,
              unicodigo: firstBlock.unicodigo,
              establecimiento: firstBlock.establecimiento,
              numero_historia_clinica: firstBlock.numero_historia_clinica,
              numero_archivo: firstBlock.numero_archivo,
              no_hoja: String(nextHoja),
              primer_apellido: firstBlock.primer_apellido,
              segundo_apellido: firstBlock.segundo_apellido,
              primer_nombre: firstBlock.primer_nombre,
              segundo_nombre: firstBlock.segundo_nombre,
              sexo: firstBlock.sexo,
              edad: firstBlock.edad,
              condicion_edad: firstBlock.condicion_edad,
              servicio_emergencia: firstBlock.servicio_emergencia,
              servicio_consulta: firstBlock.servicio_consulta,
              servicio_hospitalizacion: firstBlock.servicio_hospitalizacion,
              servicio_especialidad: firstBlock.servicio_especialidad,
              no_cama: firstBlock.no_cama,
              no_sala: firstBlock.no_sala,
            }
          : crearBloqueVacio(paciente, nextHoja);

        return {
          bloques: [...prev.bloques, newBlock],
        };
      });
    };

    const handleRemoveBloque = (idx: number) => {
      if (datos.bloques.length <= 1) return;
      setDatos((prev) => ({
        bloques: prev.bloques.filter((_, i) => i !== idx),
      }));
    };

    const handleChange = <K extends keyof BloqueInterconsulta>(
      idx: number,
      campo: K,
      valor: BloqueInterconsulta[K]
    ) => {
      setDatos((prev) => {
        const bloques = [...prev.bloques];
        bloques[idx] = { ...bloques[idx], [campo]: valor };
        return { bloques };
      });

      if (campo === "cuadro_clinico" && idx === 0) {
        window.dispatchEvent(
          new CustomEvent("sync_enfermedad_actual", {
            detail: { source: "interconsulta", value: valor },
          })
        );
      }
    };

    const handleDiagnosticoChange = (idx: number, n: number, cie: string, desc: string) => {
      const nextBloques = [...datos.bloques];
      nextBloques[idx] = {
        ...nextBloques[idx],
        [`diagnostico_${n}`]: desc,
        [`diagnostico_${n}_cie`]: cie,
      };
      setDatos(prev => ({ ...prev, bloques: nextBloques }));

      if (paciente?.tipoPaciente?.toUpperCase() === 'SPPAT') {
        const diagnosticos = [];
        for (let i = 1; i <= 6; i++) {
          const descVal = nextBloques[idx][`diagnostico_${i}` as keyof BloqueInterconsulta] as string;
          const cieVal = nextBloques[idx][`diagnostico_${i}_cie` as keyof BloqueInterconsulta] as string;
          if (descVal || cieVal) {
            diagnosticos.push({ descripcion: descVal, cie: cieVal });
          }
        }

        window.dispatchEvent(
          new CustomEvent("sync_diagnosticos", {
            detail: { source: "interconsulta", diagnosticos },
          })
        );
      }
    };

    // Sincronizaciones SPPAT
    useEffect(() => {
      const handleSyncDiagnosticos = (e: CustomEvent) => {
        if (e.detail.source !== "interconsulta") {
          const diagnosticos = e.detail.diagnosticos || [];
          setDatos(p => {
            const updates: any = {};
            for (let i = 0; i < 6; i++) {
              const num = i + 1;
              if (diagnosticos[i]) {
                updates[`diagnostico_${num}`] = diagnosticos[i].descripcion;
                updates[`diagnostico_${num}_cie`] = diagnosticos[i].cie;
                updates[`diagnostico_${num}_def`] = true;
                updates[`diagnostico_${num}_pre`] = false;
              } else {
                updates[`diagnostico_${num}`] = "";
                updates[`diagnostico_${num}_cie`] = "";
                updates[`diagnostico_${num}_def`] = false;
                updates[`diagnostico_${num}_pre`] = false;
              }
            }
            if (p.bloques.length > 0) {
              const newBloques = [...p.bloques];
              newBloques[0] = { ...newBloques[0], ...updates };
              return { ...p, bloques: newBloques };
            }
            return p;
          });
        }
      };

      if (paciente?.tipoPaciente?.toUpperCase() === 'SPPAT') {
        window.addEventListener("sync_diagnosticos", handleSyncDiagnosticos as EventListener);
        return () => {
          window.removeEventListener("sync_diagnosticos", handleSyncDiagnosticos as EventListener);
        };
      }
    }, [paciente?.tipoPaciente]);

    useEffect(() => {
      const handleSyncEA = (e: CustomEvent) => {
        if (e.detail.source !== "interconsulta") {
          setDatos((prev) => {
            const nuevosBloques = prev.bloques.map((b) => {
              if (b.institucion.trim().toUpperCase() === "SPPAT") {
                return { ...b, cuadro_clinico: e.detail.value };
              }
              return b;
            });
            return { ...prev, bloques: nuevosBloques };
          });
        }
      };
      window.addEventListener("sync_enfermedad_actual", handleSyncEA as EventListener);
      return () => {
        window.removeEventListener("sync_enfermedad_actual", handleSyncEA as EventListener);
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        getDatos: () => {
          const X = (v: boolean) => (v ? "X" : "");
          const flat: Record<string, any> = { bloques: datos.bloques };

          datos.bloques.forEach((b, idx) => {
            const prefix = `inter${idx + 1}_`;

            flat[`${prefix}institucion`] = b.institucion;
            flat[`${prefix}unicodigo`] = b.unicodigo;
            flat[`${prefix}establecimiento`] = b.establecimiento;
            flat[`${prefix}numero_historia_clinica`] = b.numero_historia_clinica;
            flat[`${prefix}numero_archivo`] = b.numero_archivo;
            flat[`${prefix}no_hoja`] = b.no_hoja;
            flat[`${prefix}primer_apellido`] = b.primer_apellido;
            flat[`${prefix}segundo_apellido`] = b.segundo_apellido;
            flat[`${prefix}primer_nombre`] = b.primer_nombre;
            flat[`${prefix}segundo_nombre`] = b.segundo_nombre;
            flat[`${prefix}sexo`] = b.sexo;
            flat[`${prefix}edad`] = b.edad;
            flat[`${prefix}condicion_edad_h`] = b.condicion_edad === "H" ? "X" : "";
            flat[`${prefix}condicion_edad_d`] = b.condicion_edad === "D" ? "X" : "";
            flat[`${prefix}condicion_edad_m`] = b.condicion_edad === "M" ? "X" : "";
            flat[`${prefix}condicion_edad_a`] = b.condicion_edad === "A" ? "X" : "";

            flat[`${prefix}servicio_emergencia`] = X(b.servicio_emergencia);
            flat[`${prefix}servicio_consulta`] = X(b.servicio_consulta);
            flat[`${prefix}servicio_hospitalizacion`] = X(b.servicio_hospitalizacion);
            flat[`${prefix}servicio_especialidad`] = b.servicio_especialidad;
            flat[`${prefix}no_cama`] = b.no_cama;
            flat[`${prefix}no_sala`] = b.no_sala;
            flat[`${prefix}urgente_si`] = X(b.urgente_si);
            flat[`${prefix}urgente_no`] = X(b.urgente_no);
            flat[`${prefix}especialidad_consultada`] = b.especialidad_consultada;
            flat[`${prefix}descripcion_motivo`] = b.descripcion_motivo;

            flat[`${prefix}cuadro_clinico`] = b.cuadro_clinico;
            flat[`${prefix}resultados_examenes`] = b.resultados_examenes;

            for (let i = 1; i <= 6; i++) {
              flat[`${prefix}diagnostico_${i}`] = b[`diagnostico_${i}` as keyof BloqueInterconsulta];
              flat[`${prefix}diagnostico_${i}_cie`] = b[`diagnostico_${i}_cie` as keyof BloqueInterconsulta];
              flat[`${prefix}diagnostico_${i}_pre`] = X(b[`diagnostico_${i}_pre` as keyof BloqueInterconsulta] as boolean);
              flat[`${prefix}diagnostico_${i}_def`] = X(b[`diagnostico_${i}_def` as keyof BloqueInterconsulta] as boolean);
            }

            flat[`${prefix}plan_terapeutico`] = b.plan_terapeutico;

            flat[`${prefix}fecha`] = b.fecha;
            flat[`${prefix}hora`] = b.hora;
            flat[`${prefix}prof_primer_nombre`] = b.prof_primer_nombre;
            flat[`${prefix}prof_primer_apellido`] = b.prof_primer_apellido;
            flat[`${prefix}prof_segundo_apellido`] = b.prof_segundo_apellido;
            flat[`${prefix}prof_documento`] = b.prof_documento;

            // Compatibilidad para bloque 1 con claves legadas inter_
            if (idx === 0) {
              flat["inter_institucion"] = b.institucion;
              flat["inter_unicodigo"] = b.unicodigo;
              flat["inter_establecimiento"] = b.establecimiento;
              flat["inter_numero_historia_clinica"] = b.numero_historia_clinica;
              flat["inter_numero_archivo"] = b.numero_archivo;
              flat["inter_no_hoja"] = b.no_hoja;
              flat["inter_primer_apellido"] = b.primer_apellido;
              flat["inter_segundo_apellido"] = b.segundo_apellido;
              flat["inter_primer_nombre"] = b.primer_nombre;
              flat["inter_segundo_nombre"] = b.segundo_nombre;
              flat["inter_sexo"] = b.sexo;
              flat["inter_edad"] = b.edad;
              flat["inter_condicion_edad_h"] = b.condicion_edad === "H" ? "X" : "";
              flat["inter_condicion_edad_d"] = b.condicion_edad === "D" ? "X" : "";
              flat["inter_condicion_edad_m"] = b.condicion_edad === "M" ? "X" : "";
              flat["inter_condicion_edad_a"] = b.condicion_edad === "A" ? "X" : "";
              flat["inter_servicio_emergencia"] = X(b.servicio_emergencia);
              flat["inter_servicio_consulta"] = X(b.servicio_consulta);
              flat["inter_servicio_hospitalizacion"] = X(b.servicio_hospitalizacion);
              flat["inter_servicio_especialidad"] = b.servicio_especialidad;
              flat["inter_no_cama"] = b.no_cama;
              flat["inter_no_sala"] = b.no_sala;
              flat["inter_urgente_si"] = X(b.urgente_si);
              flat["inter_urgente_no"] = X(b.urgente_no);
              flat["inter_especialidad_consultada"] = b.especialidad_consultada;
              flat["inter_descripcion_motivo"] = b.descripcion_motivo;
              flat["inter_cuadro_clinico"] = b.cuadro_clinico;
              flat["inter_resultados_examenes"] = b.resultados_examenes;
              for (let i = 1; i <= 6; i++) {
                flat[`inter_diagnostico_${i}`] = b[`diagnostico_${i}` as keyof BloqueInterconsulta];
                flat[`inter_diagnostico_${i}_cie`] = b[`diagnostico_${i}_cie` as keyof BloqueInterconsulta];
                flat[`inter_diagnostico_${i}_pre`] = X(b[`diagnostico_${i}_pre` as keyof BloqueInterconsulta] as boolean);
                flat[`inter_diagnostico_${i}_def`] = X(b[`diagnostico_${i}_def` as keyof BloqueInterconsulta] as boolean);
              }
              flat["inter_plan_terapeutico"] = b.plan_terapeutico;
              flat["inter_fecha"] = b.fecha;
              flat["inter_hora"] = b.hora;
              flat["inter_prof_primer_nombre"] = b.prof_primer_nombre;
              flat["inter_prof_primer_apellido"] = b.prof_primer_apellido;
              flat["inter_prof_segundo_apellido"] = b.prof_segundo_apellido;
              flat["inter_prof_documento"] = b.prof_documento;
            }
          });

          return flat;
        },
        clearAutosave: () => clearAutosave(),
        isDirty: () => isDirty,
      }),
      [datos, clearAutosave, isDirty]
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ overflowX: "visible", overflowY: "visible", background: "#fff", minHeight: "70vh" }}>
          {datos.bloques.map((b, idx) => (
            <div key={idx} style={{ position: "relative", marginBottom: "20px" }}>
              <InterconsultaBloque
                numero={idx + 1}
                b={b}
                onChange={(campo, valor) => handleChange(idx, campo, valor)}
                onDiagnosticoChange={(n, cie, desc) => handleDiagnosticoChange(idx, n, cie, desc)}
              />
              {datos.bloques.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveBloque(idx)}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background: "#fee2e2",
                    color: "#ef4444",
                    border: "1px solid #fca5a5",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    zIndex: 10,
                  }}
                  title="Eliminar este bloque"
                >
                  ✕ Eliminar Bloque
                </button>
              )}
            </div>
          ))}

          <div style={{ padding: "16px", textAlign: "center", borderTop: "2px dashed #ccc", marginTop: "10px" }}>
            <button
              type="button"
              onClick={handleAddBloque}
              disabled={datos.bloques.length >= MAX_BLOQUES_INTERCONSULTA}
              style={{
                background: datos.bloques.length >= MAX_BLOQUES_INTERCONSULTA ? "#f3f4f6" : "#eff6ff",
                color: datos.bloques.length >= MAX_BLOQUES_INTERCONSULTA ? "#9ca3af" : "#3b82f6",
                border: `1px solid ${datos.bloques.length >= MAX_BLOQUES_INTERCONSULTA ? "#e5e7eb" : "#bfdbfe"}`,
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: datos.bloques.length >= MAX_BLOQUES_INTERCONSULTA ? "not-allowed" : "pointer",
              }}
            >
              + Añadir Nueva Solicitud de Interconsulta
              {datos.bloques.length >= MAX_BLOQUES_INTERCONSULTA && " (máx. 11)"}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

InterconsultaForm.displayName = "HistoriaClinicaInterconsultaForm";

export default InterconsultaForm;