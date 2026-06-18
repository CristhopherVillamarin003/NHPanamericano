"use client";

import React, { useState, useImperativeHandle, useEffect } from "react";
import { Cie10DescInput, Cie10CieInput } from "./Cie10Input";
import RichTextEvolucion from "../ui/RichTextEvolucion";
import { useFormAutosaveAndWarn } from "@/hooks/useFormAutosaveAndWarn";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface BloqueImagenologia {
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
  servicio_emergencia: boolean;
  servicio_consulta: boolean;
  servicio_hospitalizacion: boolean;
  servicio_especialidad: string;
  servicio_cama: string;
  servicio_sala: string;
  prioridad_urgente: boolean;
  prioridad_rutina: boolean;
  prioridad_control: boolean;

  // C. Estudio de imagenología solicitado
  rx_convencional: boolean;
  rx_portatil: boolean;
  tomografia: boolean;
  resonancia: boolean;
  ecografia: boolean;
  mamografia: boolean;
  procedimiento: boolean;
  otro: boolean;
  sedacion_si: boolean;
  sedacion_no: boolean;
  descripcion_estudio: string;

  // D. Motivo de la solicitud
  fum: string;
  paciente_contaminado_si: boolean;
  paciente_contaminado_no: boolean;
  paciente_contaminado_desc: string;

  // E. Resumen clínico actual
  resumen_clinico: string;

  // F. Diagnóstico (6 entradas)
  diagnostico_1: string; diagnostico_1_cie: string; diagnostico_1_pre: boolean; diagnostico_1_def: boolean;
  diagnostico_2: string; diagnostico_2_cie: string; diagnostico_2_pre: boolean; diagnostico_2_def: boolean;
  diagnostico_3: string; diagnostico_3_cie: string; diagnostico_3_pre: boolean; diagnostico_3_def: boolean;
  diagnostico_4: string; diagnostico_4_cie: string; diagnostico_4_pre: boolean; diagnostico_4_def: boolean;
  diagnostico_5: string; diagnostico_5_cie: string; diagnostico_5_pre: boolean; diagnostico_5_def: boolean;
  diagnostico_6: string; diagnostico_6_cie: string; diagnostico_6_pre: boolean; diagnostico_6_def: boolean;

  // G. Datos del profesional responsable
  fecha: string;
  hora: string;
  prof_primer_nombre: string;
  prof_primer_apellido: string;
  prof_segundo_apellido: string;
  prof_documento: string;
}

export interface DatosImagenologia {
  bloques: BloqueImagenologia[];
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
  initialData?: Partial<DatosImagenologia>;
  atencionId?: number;
  guardando?: boolean;
  exportando?: boolean;
}

const MAX_BLOQUES_IMAGENOLOGIA = 15;

export type HistoriaClinicaImagenologiaHandle = {
  getDatos: () => DatosImagenologia;
  clearAutosave?: () => void;
  isDirty?: () => boolean;
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Lbl({ children, small = false }: { children: React.ReactNode; small?: boolean }) {
  return (
    <div style={{
      fontSize: small ? "8px" : "9px", fontWeight: 700,
      padding: "2px 4px", lineHeight: 1.2, color: "#000",
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

function ChkBox({ checked, onChange, label }: {
  checked: boolean; onChange: (v: boolean) => void; label?: string;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 3, cursor: "pointer", fontSize: "9px", fontFamily: "Arial, sans-serif" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        style={{ width: 11, height: 11 }} />
      {label && <span>{label}</span>}
    </label>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const td: React.CSSProperties = { border: "1px solid #000", padding: 0, verticalAlign: "top" };
const tdM: React.CSSProperties = { ...td, verticalAlign: "middle", background: "#CCFFCC" };
const secH = (bg = "#CCCCFF"): React.CSSProperties => ({
  background: bg, fontWeight: 700, fontSize: "11px",
  fontFamily: "Arial, sans-serif", padding: "4px 8px",
  border: "1px solid #000", letterSpacing: "0.02em",
});
const subH: React.CSSProperties = {
  background: "#DCE6F1", fontWeight: 700, fontSize: "10px",
  fontFamily: "Arial, sans-serif", padding: "3px 6px", border: "1px solid #000",
};
const dateInput = (val: string, onChange: (v: string) => void): React.ReactElement => (
  <input type="date" value={val}
    onChange={(e) => onChange(e.target.value)}
    style={{
      border: "none", outline: "none", fontSize: "9px", padding: "2px",
      width: "100%", background: "#fff",
      fontFamily: "Arial, sans-serif", boxSizing: "border-box",
    }} />
);
const timeInput = (val: string, onChange: (v: string) => void): React.ReactElement => (
  <input type="time" value={val} onChange={(e) => onChange(e.target.value)}
    style={{
      border: "none", outline: "none", fontSize: "9px", padding: "2px",
      width: "100%", fontFamily: "Arial, sans-serif", boxSizing: "border-box",
    }} />
);

// ─── Bloque único (A → G) ────────────────────────────────────────────────────

function ImagenologiaBloque({
  numero,
  b,
  onChange,
}: {
  numero: number;
  b: BloqueImagenologia;
  onChange: <K extends keyof BloqueImagenologia>(campo: K, valor: BloqueImagenologia[K]) => void;
}) {
  const s = (k: keyof BloqueImagenologia) => (v: string) => onChange(k, v as never);
  const c = (k: keyof BloqueImagenologia) => (v: boolean) => onChange(k, v as never);

  const tbl: React.CSSProperties = {
    width: "100%", minWidth: "1100px", borderCollapse: "collapse",
    tableLayout: "fixed", fontFamily: "Arial, sans-serif", fontSize: "10px",
  };

  const diagRows = [1, 2, 3, 4, 5, 6] as const;

  return (
    <div style={{ marginBottom: 0 }}>
      <table style={tbl}>
        <tbody>

          {/* ── A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE ── */}
          <tr>
            <td colSpan={20} style={{
              ...secH(numero === 1 ? "#CCCCFF" : "#CCCCFF"),
              borderTop: numero > 1 ? "3px solid #1a3a5c" : "1px solid #000",
            }}>
              {numero > 1 && <span style={{ fontSize: "9px", opacity: 0.6, marginRight: 8 }}>#{numero}</span>}
              A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE
            </td>
          </tr>
          {/* Fila 1 — institución */}
          <tr>
            <td colSpan={4} style={tdM}><Lbl>INSTITUCIÓN DEL SISTEMA</Lbl></td>
            <td colSpan={2} style={tdM}><Lbl>UNICÓDIGO</Lbl></td>
            <td colSpan={7} style={tdM}><Lbl>ESTABLECIMIENTO DE SALUD</Lbl></td>
            <td colSpan={5} style={tdM}><Lbl>N° HISTORIA CLÍNICA ÚNICA</Lbl></td>
            <td colSpan={2} style={tdM}><Lbl>N° ARCHIVO</Lbl></td>
          </tr>
          <tr style={{ height: 22 }}>
            <td colSpan={4} style={td}><TxtInput value={b.institucion} onChange={s("institucion")} /></td>
            <td colSpan={2} style={td}><TxtInput value={b.unicodigo} onChange={s("unicodigo")} center /></td>
            <td colSpan={7} style={td}><TxtInput value={b.establecimiento} onChange={s("establecimiento")} /></td>
            <td colSpan={5} style={td}><TxtInput value={b.numero_historia_clinica} onChange={s("numero_historia_clinica")} center /></td>
            <td colSpan={2} style={td}><TxtInput value={b.numero_archivo} onChange={s("numero_archivo")} center /></td>
          </tr>
          {/* Fila 2 — paciente */}
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
            <td colSpan={4} style={td}><TxtInput value={b.primer_apellido} onChange={s("primer_apellido")} /></td>
            <td colSpan={3} style={td}><TxtInput value={b.segundo_apellido} onChange={s("segundo_apellido")} /></td>
            <td colSpan={3} style={td}><TxtInput value={b.primer_nombre} onChange={s("primer_nombre")} /></td>
            <td colSpan={3} style={td}><TxtInput value={b.segundo_nombre} onChange={s("segundo_nombre")} /></td>
            <td colSpan={1} style={td}><TxtInput value={b.sexo} onChange={s("sexo")} center /></td>
            <td colSpan={2} style={td}>{dateInput(b.fecha_nacimiento, s("fecha_nacimiento"))}</td>
            <td colSpan={1} style={td}><TxtInput value={b.edad} onChange={s("edad")} center /></td>
            <td colSpan={3} style={td}>
              <div style={{ display: "flex", justifyContent: "space-around", padding: "4px 2px" }}>
                {(["H", "D", "M", "A"] as const).map((op) => (
                  <input key={op} type="radio"
                    name={`img${numero}_condicion_edad`} value={op}
                    checked={b.condicion_edad === op}
                    onChange={() => onChange("condicion_edad", op)}
                    style={{ width: 10, height: 10, cursor: "pointer" }} title={op === "H" ? "Horas" : op === "D" ? "Días" : op === "M" ? "Meses" : "Años"} />
                ))}
              </div>
            </td>
          </tr>

          {/* ── B. SERVICIO Y PRIORIDAD ── */}
          <tr><td colSpan={20} style={secH()}>B. SERVICIO Y PRIORIDAD DE ATENCIÓN</td></tr>
          <tr>
            <td colSpan={5} style={tdM}><Lbl>SERVICIO</Lbl></td>
            <td colSpan={5} style={tdM}><Lbl>ESPECIALIDAD</Lbl></td>
            <td colSpan={3} style={tdM}><Lbl>CAMA</Lbl></td>
            <td colSpan={3} style={tdM}><Lbl>SALA</Lbl></td>
            <td colSpan={4} style={tdM}><Lbl>PRIORIDAD</Lbl></td>
          </tr>
          <tr style={{ minHeight: 44 }}>
            {/* Servicio — 3 checkboxes apilados */}
            <td colSpan={5} style={{ ...td, padding: "4px 6px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <ChkBox checked={b.servicio_emergencia} onChange={c("servicio_emergencia")} label="Emergencia" />
                <ChkBox checked={b.servicio_consulta} onChange={c("servicio_consulta")} label="Consulta Externa" />
                <ChkBox checked={b.servicio_hospitalizacion} onChange={c("servicio_hospitalizacion")} label="Hospitalización" />
              </div>
            </td>
            <td colSpan={5} style={td}><TxtInput value={b.servicio_especialidad} onChange={s("servicio_especialidad")} placeholder="Especialidad" /></td>
            <td colSpan={3} style={td}><TxtInput value={b.servicio_cama} onChange={s("servicio_cama")} center placeholder="Cama" /></td>
            <td colSpan={3} style={td}><TxtInput value={b.servicio_sala} onChange={s("servicio_sala")} center placeholder="Sala" /></td>
            {/* Prioridad — 3 checkboxes apilados */}
            <td colSpan={4} style={{ ...td, padding: "4px 6px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <ChkBox checked={b.prioridad_urgente} onChange={c("prioridad_urgente")} label="Urgente" />
                <ChkBox checked={b.prioridad_rutina} onChange={c("prioridad_rutina")} label="Rutina" />
                <ChkBox checked={b.prioridad_control} onChange={c("prioridad_control")} label="Control" />
              </div>
            </td>
          </tr>

          {/* ── C. ESTUDIO DE IMAGENOLOGÍA SOLICITADO ── */}
          <tr><td colSpan={20} style={secH()}>C. ESTUDIO DE IMAGENOLOGÍA SOLICITADO</td></tr>
          {/* Row de tipos de estudio */}
          <tr>
            <td colSpan={2} style={tdM}><Lbl small>RX Convencional</Lbl></td>
            <td colSpan={2} style={tdM}><Lbl small>RX Portátil</Lbl></td>
            <td colSpan={2} style={tdM}><Lbl small>Tomografía</Lbl></td>
            <td colSpan={2} style={tdM}><Lbl small>Resonancia Magnética</Lbl></td>
            <td colSpan={2} style={tdM}><Lbl small>Ecografía</Lbl></td>
            <td colSpan={2} style={tdM}><Lbl small>Mamografía</Lbl></td>
            <td colSpan={2} style={tdM}><Lbl small>Procedimiento</Lbl></td>
            <td colSpan={2} style={tdM}><Lbl small>Otro</Lbl></td>
            <td colSpan={4} style={tdM}>
              <Lbl small>SEDACIÓN</Lbl>
              <div style={{ display: "flex", gap: 12, padding: "0 4px", fontSize: "8px", fontWeight: 700 }}>
                <span>SI</span><span>NO</span>
              </div>
            </td>
          </tr>
          <tr style={{ height: 24 }}>
            {([
              "rx_convencional", "rx_portatil", "tomografia", "resonancia",
              "ecografia", "mamografia", "procedimiento", "otro",
            ] as const).map((k) => (
              <td key={k} colSpan={2} style={{ ...td, textAlign: "center", verticalAlign: "middle" }}>
                <input type="checkbox" checked={b[k]} onChange={(e) => c(k)(e.target.checked)}
                  style={{ width: 12, height: 12 }} />
              </td>
            ))}
            {/* Sedación SI/NO */}
            <td colSpan={2} style={{ ...td, textAlign: "center", verticalAlign: "middle" }}>
              <input type="checkbox" checked={b.sedacion_si} onChange={(e) => c("sedacion_si")(e.target.checked)}
                style={{ width: 12, height: 12 }} />
            </td>
            <td colSpan={2} style={{ ...td, textAlign: "center", verticalAlign: "middle" }}>
              <input type="checkbox" checked={b.sedacion_no} onChange={(e) => c("sedacion_no")(e.target.checked)}
                style={{ width: 12, height: 12 }} />
            </td>
          </tr>
          {/* Descripción del estudio */}
          <tr>
            <td colSpan={3} style={tdM}><Lbl>DESCRIPCIÓN DEL ESTUDIO SOLICITADO</Lbl></td>
            <td colSpan={17} style={td}>
              <textarea value={b.descripcion_estudio}
                onChange={(e) => {
                  s("descripcion_estudio")(e.target.value);
                  const el = e.target;
                  el.style.height = "auto";
                  el.style.height = `${Math.max(el.scrollHeight, 57)}px`;
                }}
                ref={(el) => {
                  if (el) { el.style.height = "auto"; el.style.height = `${Math.max(el.scrollHeight, 57)}px`; }
                }}
                rows={3}
                placeholder="Describa el estudio solicitado, región anatómica, proyecciones, contraste, etc."
                style={{
                  width: "100%", border: "none", outline: "none", resize: "none",
                  fontSize: "10px", fontFamily: "Arial, sans-serif", padding: "3px 4px",
                  boxSizing: "border-box", lineHeight: 1.3, overflow: "hidden",
                  minHeight: "57px",
                }} />
            </td>
          </tr>

          {/* ── D. MOTIVO DE LA SOLICITUD ── */}
          <tr><td colSpan={20} style={secH()}>D. MOTIVO DE LA SOLICITUD</td></tr>
          <tr>
            <td colSpan={3} style={tdM}><Lbl small>F.U.M. (Fecha Última Menstruación)</Lbl></td>
            <td colSpan={4} style={td}>{dateInput(b.fum, s("fum"))}</td>
            <td colSpan={6} style={tdM}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 4px" }}>
                <span style={{ fontSize: "9px", fontWeight: 700 }}>PACIENTE CONTAMINADO:</span>
                <ChkBox checked={b.paciente_contaminado_si} onChange={c("paciente_contaminado_si")} label="SI" />
                <ChkBox checked={b.paciente_contaminado_no} onChange={c("paciente_contaminado_no")} label="NO" />
              </div>
            </td>
            <td colSpan={7} style={td}>
              <TxtInput value={b.paciente_contaminado_desc}
                onChange={s("paciente_contaminado_desc")}
                placeholder="Descripción / tipo de contaminación..." />
            </td>
          </tr>

          {/* ── E. RESUMEN CLÍNICO ACTUAL ── */}
          <tr><td colSpan={20} style={secH()}>E. RESUMEN CLÍNICO ACTUAL</td></tr>
          <tr>
            <td colSpan={20} style={td}>
              <RichTextEvolucion value={b.resumen_clinico} onChange={s("resumen_clinico")} minHeight="101px" placeholder="Resumen clínico del paciente relevante para el estudio solicitado..." />
            </td>
          </tr>

          {/* ── F. DIAGNÓSTICO ── */}
          <tr><td colSpan={20} style={secH()}>F. DIAGNÓSTICO</td></tr>
          <tr>
            <td colSpan={1} style={{ ...tdM, background: "#eef3f9" }}><Lbl small>N°</Lbl></td>
            <td colSpan={12} style={{ ...tdM, ...subH }}><Lbl>DIAGNÓSTICO</Lbl></td>
            <td colSpan={4} style={{ ...tdM, ...subH }}><Lbl>CIE-10</Lbl></td>
            <td colSpan={2} style={{ ...tdM, ...subH }}><Lbl small>PRE</Lbl></td>
            <td colSpan={1} style={{ ...tdM, ...subH }}><Lbl small>DEF</Lbl></td>
          </tr>
          {diagRows.map((n) => {
            const dk = `diagnostico_${n}` as keyof BloqueImagenologia;
            const ck = `diagnostico_${n}_cie` as keyof BloqueImagenologia;
            const pk = `diagnostico_${n}_pre` as keyof BloqueImagenologia;
            const fk = `diagnostico_${n}_def` as keyof BloqueImagenologia;
            return (
              <tr key={n} style={{ height: 24 }}>
                <td colSpan={1} style={{ ...td, textAlign: "center", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700 }}>{n}</span>
                </td>
                <td colSpan={12} style={td}>
                  <Cie10DescInput
                    cie={b[ck] as string}
                    descripcion={b[dk] as string}
                    onChange={(cie, desc) => {
                      s(dk)(desc as never);
                      s(ck)(cie as never);
                    }}
                  />
                </td>
                <td colSpan={4} style={td}>
                  <Cie10CieInput
                    cie={b[ck] as string}
                    descripcion={b[dk] as string}
                    onChange={(cie, desc) => {
                      s(dk)(desc as never);
                      s(ck)(cie as never);
                    }}
                  />
                </td>
                <td colSpan={2} style={{ ...td, textAlign: "center", verticalAlign: "middle" }}>
                  <input type="checkbox" checked={b[pk] as boolean}
                    onChange={(e) => c(pk)(e.target.checked)} style={{ width: 12, height: 12 }} />
                </td>
                <td colSpan={1} style={{ ...td, textAlign: "center", verticalAlign: "middle" }}>
                  <input type="checkbox" checked={b[fk] as boolean}
                    onChange={(e) => c(fk)(e.target.checked)} style={{ width: 12, height: 12 }} />
                </td>
              </tr>
            );
          })}

          {/* ── G. DATOS DEL PROFESIONAL RESPONSABLE ── */}
          <tr><td colSpan={20} style={secH()}>G. DATOS DEL PROFESIONAL RESPONSABLE</td></tr>
          <tr>
            <td colSpan={2} style={tdM}><Lbl>FECHA</Lbl></td>
            <td colSpan={2} style={tdM}><Lbl>HORA</Lbl></td>
            <td colSpan={5} style={tdM}><Lbl>PRIMER NOMBRE</Lbl></td>
            <td colSpan={5} style={tdM}><Lbl>PRIMER APELLIDO</Lbl></td>
            <td colSpan={6} style={tdM}><Lbl>SEGUNDO APELLIDO</Lbl></td>
          </tr>
          <tr style={{ height: 22 }}>
            <td colSpan={2} style={td}>{dateInput(b.fecha, s("fecha"))}</td>
            <td colSpan={2} style={td}>{timeInput(b.hora, s("hora"))}</td>
            <td colSpan={5} style={td}><TxtInput value={b.prof_primer_nombre} onChange={s("prof_primer_nombre")} /></td>
            <td colSpan={5} style={td}><TxtInput value={b.prof_primer_apellido} onChange={s("prof_primer_apellido")} /></td>
            <td colSpan={6} style={td}><TxtInput value={b.prof_segundo_apellido} onChange={s("prof_segundo_apellido")} /></td>
          </tr>
          <tr>
            <td colSpan={5} style={tdM}><Lbl>N° DOCUMENTO DE IDENTIFICACIÓN / CÓDIGO</Lbl></td>
            <td colSpan={9} style={{ ...tdM, background: "#f8f8f8", textAlign: "center" }}>
              <span style={{ fontSize: "8px", color: "#aaa", fontStyle: "italic" }}>FIRMA (documento impreso)</span>
            </td>
            <td colSpan={6} style={{ ...tdM, background: "#f8f8f8", textAlign: "center" }}>
              <span style={{ fontSize: "8px", color: "#aaa", fontStyle: "italic" }}>SELLO (documento impreso)</span>
            </td>
          </tr>
          <tr style={{ height: 28 }}>
            <td colSpan={5} style={td}><TxtInput value={b.prof_documento} onChange={s("prof_documento")} /></td>
            <td colSpan={9} style={{ ...td, background: "#f8f8f8" }} />
            <td colSpan={6} style={{ ...td, background: "#f8f8f8" }} />
          </tr>

          {/* Footer del bloque */}
          <tr>
            <td colSpan={10} style={{ border: "1px solid #000", fontSize: "8px", fontWeight: 700, padding: "3px 4px" }}>
              SNS-MSP / HCU-form.009/2021
            </td>
            <td colSpan={10} style={{ border: "1px solid #000", fontSize: "10px", fontWeight: 700, textAlign: "right", padding: "3px 4px" }}>
              IMAGENOLOGÍA — SOLICITUD ({numero})
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  );
}

// ─── Bloque vacío por defecto ─────────────────────────────────────────────────

function crearBloqueVacio(paciente?: Props["paciente"]): BloqueImagenologia {
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);
  return {
    institucion: paciente?.tipoPaciente ?? "PARTICULAR",
    unicodigo: "62858",
    establecimiento: "NUEVO HOSPITAL PANAMERICANO",
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

    servicio_emergencia: false,
    servicio_consulta: false,
    servicio_hospitalizacion: false,
    servicio_especialidad: "",
    servicio_cama: "",
    servicio_sala: "",
    prioridad_urgente: false,
    prioridad_rutina: false,
    prioridad_control: false,

    rx_convencional: false,
    rx_portatil: false,
    tomografia: false,
    resonancia: false,
    ecografia: false,
    mamografia: false,
    procedimiento: false,
    otro: false,
    sedacion_si: false,
    sedacion_no: false,
    descripcion_estudio: "",

    fum: "",
    paciente_contaminado_si: false,
    paciente_contaminado_no: false,
    paciente_contaminado_desc: "",

    resumen_clinico: "",

    diagnostico_1: "", diagnostico_1_cie: "", diagnostico_1_pre: false, diagnostico_1_def: false,
    diagnostico_2: "", diagnostico_2_cie: "", diagnostico_2_pre: false, diagnostico_2_def: false,
    diagnostico_3: "", diagnostico_3_cie: "", diagnostico_3_pre: false, diagnostico_3_def: false,
    diagnostico_4: "", diagnostico_4_cie: "", diagnostico_4_pre: false, diagnostico_4_def: false,
    diagnostico_5: "", diagnostico_5_cie: "", diagnostico_5_pre: false, diagnostico_5_def: false,
    diagnostico_6: "", diagnostico_6_cie: "", diagnostico_6_pre: false, diagnostico_6_def: false,

    fecha: today,
    hora: nowTime,
    prof_primer_nombre: "",
    prof_primer_apellido: "",
    prof_segundo_apellido: "",
    prof_documento: "",
  };
}

// ─── Componente Principal ─────────────────────────────────────────────────────

const ImagenologiaForm = React.forwardRef<HistoriaClinicaImagenologiaHandle, Props>(
  ({ paciente, initialData, atencionId }, ref) => {
    const [datos, setDatos] = useState<DatosImagenologia>(() => {
      if (initialData?.bloques && initialData.bloques.length > 0) {
        return { bloques: [...initialData.bloques] };
      }
      return { bloques: [crearBloqueVacio(paciente)] };
    });

    const { isDirty, clearAutosave } = useFormAutosaveAndWarn({
      formId: `hc_imagenologia_${atencionId || 'new'}_${paciente?.cedula || 'new'}`,
      initialData: initialData || { bloques: [crearBloqueVacio(paciente)] },
      currentData: datos,
      onRestore: (saved) => setDatos(p => ({ ...p, ...saved })),
    });

    const handleAddBloque = () => {
      if (datos.bloques.length >= MAX_BLOQUES_IMAGENOLOGIA) return;
      setDatos((prev) => ({
        bloques: [...prev.bloques, crearBloqueVacio(paciente)],
      }));
    };

    const handleRemoveBloque = (idx: number) => {
      if (datos.bloques.length <= 1) return;
      setDatos((prev) => ({
        bloques: prev.bloques.filter((_, i) => i !== idx),
      }));
    };

    const handleChange = <K extends keyof BloqueImagenologia>(
      idx: number,
      campo: K,
      valor: BloqueImagenologia[K]
    ) => {
      setDatos((prev) => {
        const bloques = [...prev.bloques];
        bloques[idx] = { ...bloques[idx], [campo]: valor };
        return { bloques };
      });
    };

    useEffect(() => {
      const handleSyncEA = (e: CustomEvent) => {
        setDatos((prev) => {
          const nuevosBloques = prev.bloques.map((b) => {
            if (b.institucion.trim().toUpperCase() === "SPPAT") {
              return { ...b, resumen_clinico: e.detail.value };
            }
            return b;
          });
          return { ...prev, bloques: nuevosBloques };
        });
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
            const prefix = `img${idx + 1}_`;

            flat[`${prefix}institucion`] = b.institucion;
            flat[`${prefix}unicodigo`] = b.unicodigo;
            flat[`${prefix}establecimiento`] = b.establecimiento;
            flat[`${prefix}numero_historia_clinica`] = b.numero_historia_clinica;
            flat[`${prefix}numero_archivo`] = b.numero_archivo;
            flat[`${prefix}primer_apellido`] = b.primer_apellido;
            flat[`${prefix}segundo_apellido`] = b.segundo_apellido;
            flat[`${prefix}primer_nombre`] = b.primer_nombre;
            flat[`${prefix}segundo_nombre`] = b.segundo_nombre;
            flat[`${prefix}sexo`] = b.sexo;
            flat[`${prefix}fecha_nacimiento`] = b.fecha_nacimiento;
            flat[`${prefix}edad`] = b.edad;
            flat[`${prefix}condicion_edad_h`] = b.condicion_edad === "H" ? "X" : "";
            flat[`${prefix}condicion_edad_d`] = b.condicion_edad === "D" ? "X" : "";
            flat[`${prefix}condicion_edad_m`] = b.condicion_edad === "M" ? "X" : "";
            flat[`${prefix}condicion_edad_a`] = b.condicion_edad === "A" ? "X" : "";

            flat[`${prefix}servicio_emergencia`] = X(b.servicio_emergencia);
            flat[`${prefix}servicio_consulta`] = X(b.servicio_consulta);
            flat[`${prefix}servicio_hospitalizacion`] = X(b.servicio_hospitalizacion);
            flat[`${prefix}servicio_especialidad`] = b.servicio_especialidad;
            flat[`${prefix}servicio_cama`] = b.servicio_cama;
            flat[`${prefix}servicio_sala`] = b.servicio_sala;
            flat[`${prefix}prioridad_urgente`] = X(b.prioridad_urgente);
            flat[`${prefix}prioridad_rutina`] = X(b.prioridad_rutina);
            flat[`${prefix}prioridad_control`] = X(b.prioridad_control);

            flat[`${prefix}rx_convencional`] = X(b.rx_convencional);
            flat[`${prefix}rx_portatil`] = X(b.rx_portatil);
            flat[`${prefix}tomografia`] = X(b.tomografia);
            flat[`${prefix}resonancia`] = X(b.resonancia);
            flat[`${prefix}ecografia`] = X(b.ecografia);
            flat[`${prefix}mamografia`] = X(b.mamografia);
            flat[`${prefix}procedimiento`] = X(b.procedimiento);
            flat[`${prefix}otro`] = X(b.otro);
            flat[`${prefix}sedacion_si`] = X(b.sedacion_si);
            flat[`${prefix}sedacion_no`] = X(b.sedacion_no);
            flat[`${prefix}descripcion_estudio`] = b.descripcion_estudio;

            flat[`${prefix}fum`] = b.fum;
            flat[`${prefix}paciente_contaminado_si`] = X(b.paciente_contaminado_si);
            flat[`${prefix}paciente_contaminado_no`] = X(b.paciente_contaminado_no);
            flat[`${prefix}paciente_contaminado_desc`] = b.paciente_contaminado_desc;

            flat[`${prefix}resumen_clinico`] = b.resumen_clinico;

            for (let i = 1; i <= 6; i++) {
              flat[`${prefix}diagnostico_${i}`] = b[`diagnostico_${i}` as keyof BloqueImagenologia];
              flat[`${prefix}diagnostico_${i}_cie`] = b[`diagnostico_${i}_cie` as keyof BloqueImagenologia];
              flat[`${prefix}diagnostico_${i}_pre`] = X(b[`diagnostico_${i}_pre` as keyof BloqueImagenologia] as boolean);
              flat[`${prefix}diagnostico_${i}_def`] = X(b[`diagnostico_${i}_def` as keyof BloqueImagenologia] as boolean);
            }

            flat[`${prefix}fecha`] = b.fecha;
            flat[`${prefix}hora`] = b.hora;
            flat[`${prefix}prof_primer_nombre`] = b.prof_primer_nombre;
            flat[`${prefix}prof_primer_apellido`] = b.prof_primer_apellido;
            flat[`${prefix}prof_segundo_apellido`] = b.prof_segundo_apellido;
            flat[`${prefix}prof_documento`] = b.prof_documento;
          });

          return flat as DatosImagenologia;
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
              <ImagenologiaBloque
                numero={idx + 1}
                b={b}
                onChange={(campo, valor) => handleChange(idx, campo, valor)}
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
                  X Eliminar Bloque
                </button>
              )}
            </div>
          ))}

          <div style={{ padding: "16px", textAlign: "center", borderTop: "2px dashed #ccc", marginTop: "10px" }}>
            <button
              type="button"
              onClick={handleAddBloque}
              disabled={datos.bloques.length >= MAX_BLOQUES_IMAGENOLOGIA}
              style={{
                background: datos.bloques.length >= MAX_BLOQUES_IMAGENOLOGIA ? "#f3f4f6" : "#eff6ff",
                color: datos.bloques.length >= MAX_BLOQUES_IMAGENOLOGIA ? "#9ca3af" : "#3b82f6",
                border: `1px solid ${datos.bloques.length >= MAX_BLOQUES_IMAGENOLOGIA ? "#e5e7eb" : "#bfdbfe"}`,
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: datos.bloques.length >= MAX_BLOQUES_IMAGENOLOGIA ? "not-allowed" : "pointer",
              }}
            >
              + Añadir Nueva Solicitud de Imagenología
              {datos.bloques.length >= MAX_BLOQUES_IMAGENOLOGIA && " (máx. 15)"}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ImagenologiaForm.displayName = "HistoriaClinicaImagenologiaForm";

export default ImagenologiaForm;
