"use client";

import React, { useState, useImperativeHandle, useEffect } from "react";
import RichTextEvolucion from "../ui/RichTextEvolucion";
import { useFormAutosaveAndWarn } from "@/hooks/useFormAutosaveAndWarn";

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Un solo bloque de evolución (A + B). La hoja repite este bloque 5 veces. */
interface BloqueEvolucion {
  institucion: string;
  unicodigo: string;
  establecimiento: string;
  numero_historia_clinica: string;
  numero_archivo: string;
  numero_hoja: string;
  primer_apellido: string;
  segundo_apellido: string;
  primer_nombre: string;
  segundo_nombre: string;
  sexo: string;
  edad: string;
  condicion_edad: "H" | "D" | "M" | "A";
  fecha: string;
  hora: string;
  notas_evolucion: string;
  farmacoterapia: string;
  administrar_farmacos: string;
}

export interface DatosEvolucion {
  bloques: BloqueEvolucion[];
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
  initialData?: Partial<DatosEvolucion>;
  guardando?: boolean;
  exportando?: boolean;
  atencionId?: number;
}

export type HistoriaClinicaEvolucionHandle = {
  getDatos: () => DatosEvolucion;
  clearAutosave?: () => void;
  isDirty?: () => boolean;
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function CeldaLabel({ children, small = false }: { children: React.ReactNode; small?: boolean }) {
  return (
    <div style={{
      fontSize: small ? "8px" : "9px",
      fontWeight: 700,
      textAlign: "center",
      padding: "3px 4px 2px",
      letterSpacing: "0.03em",
      color: "#000",
      lineHeight: 1.2,
    }}>
      {children}
    </div>
  );
}

function CeldaInput({
  value,
  onChange,
  readOnly = false,
  center = false,
  multiline = false,
  rows = 3,
  placeholder = "",
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  center?: boolean;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  const base: React.CSSProperties = {
    width: "100%",
    border: "none",
    outline: "none",
    background: readOnly ? "#f0f0f0" : "#fff",
    fontSize: "11px",
    fontFamily: "Arial, sans-serif",
    textAlign: center ? "center" : "left",
    padding: "3px 4px",
    color: "#000",
    resize: "none",
    lineHeight: 1.3,
    boxSizing: "border-box",
  };
  if (multiline) {
    const lineHeightPx = 11 * 1.3;
    const paddingPx = 6;
    const minHeight = Math.ceil(rows * lineHeightPx + paddingPx);

    const autoResize = (el: HTMLTextAreaElement) => {
      el.style.height = "auto";
      el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
    };

    return (
      <textarea
        rows={rows}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        ref={(el) => {
          if (el) autoResize(el);
        }}
        onChange={(e) => {
          onChange?.(e.target.value);
          autoResize(e.target);
        }}
        style={{
          ...base,
          display: "block",
          overflow: "hidden",
          minHeight: `${minHeight}px`,
        }}
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      style={base}
    />
  );
}

// ─── Estilos base ─────────────────────────────────────────────────────────────

const tdBase: React.CSSProperties = { border: "1px solid #000", padding: 0, verticalAlign: "top" };
const tdLabel: React.CSSProperties = { ...tdBase, background: "#CCFFCC", verticalAlign: "middle" };

const sectionHeader: React.CSSProperties = {
  background: "#CCCCFF",
  fontWeight: 700,
  fontSize: "11px",
  fontFamily: "Arial, sans-serif",
  padding: "4px 8px",
  borderBottom: "1px solid #000",
  letterSpacing: "0.02em",
};

const noteHeader: React.CSSProperties = {
  background: "#fff3cd",
  fontWeight: 600,
  fontSize: "9px",
  fontFamily: "Arial, sans-serif",
  padding: "3px 6px",
  color: "#7a5c00",
  fontStyle: "italic",
};

// ─── Bloque único (A + B) ─────────────────────────────────────────────────────

function EvolucionBloque({
  numero,
  bloque,
  onChange,
}: {
  numero: number;
  bloque: BloqueEvolucion;
  onChange: (campo: keyof BloqueEvolucion, valor: string) => void;
}) {
  const tableStyle: React.CSSProperties = {
    width: "100%",
    minWidth: "900px",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    fontFamily: "Arial, sans-serif",
    fontSize: "11px",
  };

  return (
    <div style={{ marginBottom: 0 }}>
      <table style={tableStyle}>
        <tbody>

          {/* ── A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE ── */}
          <tr>
            <td
              colSpan={20}
              style={{
                ...sectionHeader,
                border: "1px solid #000",
                borderTop: numero === 1 ? "1px solid #000" : "2px solid #1a3a5c",
              }}
            >
              {numero > 1 && (
                <span style={{ fontSize: "9px", opacity: 0.7, marginRight: 8 }}>
                  #{numero}
                </span>
              )}
              A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE
            </td>
          </tr>

          {/* Labels fila institución */}
          <tr>
            <td colSpan={4} style={tdLabel}><CeldaLabel>INSTITUCIÓN DEL SISTEMA</CeldaLabel></td>
            <td colSpan={2} style={tdLabel}><CeldaLabel>UNICÓDIGO</CeldaLabel></td>
            <td colSpan={6} style={tdLabel}><CeldaLabel>ESTABLECIMIENTO DE SALUD</CeldaLabel></td>
            <td colSpan={5} style={tdLabel}><CeldaLabel>NÚMERO DE HISTORIA CLÍNICA ÚNICA</CeldaLabel></td>
            <td colSpan={2} style={tdLabel}><CeldaLabel>N° ARCHIVO</CeldaLabel></td>
            <td colSpan={1} style={tdLabel}><CeldaLabel small>N° HOJA</CeldaLabel></td>
          </tr>
          <tr style={{ height: 22 }}>
            <td colSpan={4} style={tdBase}>
              <CeldaInput value={bloque.institucion} onChange={(v) => onChange("institucion", v)} />
            </td>
            <td colSpan={2} style={tdBase}>
              <CeldaInput value={bloque.unicodigo} onChange={(v) => onChange("unicodigo", v)} center />
            </td>
            <td colSpan={6} style={tdBase}>
              <CeldaInput value={bloque.establecimiento} onChange={(v) => onChange("establecimiento", v)} />
            </td>
            <td colSpan={5} style={tdBase}>
              <CeldaInput value={bloque.numero_historia_clinica} onChange={(v) => onChange("numero_historia_clinica", v)} center />
            </td>
            <td colSpan={2} style={tdBase}>
              <CeldaInput value={bloque.numero_archivo} onChange={(v) => onChange("numero_archivo", v)} center />
            </td>
            <td colSpan={1} style={tdBase}>
              <CeldaInput value={bloque.numero_hoja} onChange={(v) => onChange("numero_hoja", v)} center />
            </td>
          </tr>

          {/* Labels fila paciente */}
          <tr>
            <td colSpan={4} style={tdLabel}><CeldaLabel>PRIMER APELLIDO</CeldaLabel></td>
            <td colSpan={4} style={tdLabel}><CeldaLabel>SEGUNDO APELLIDO</CeldaLabel></td>
            <td colSpan={4} style={tdLabel}><CeldaLabel>PRIMER NOMBRE</CeldaLabel></td>
            <td colSpan={3} style={tdLabel}><CeldaLabel>SEGUNDO NOMBRE</CeldaLabel></td>
            <td colSpan={2} style={tdLabel}><CeldaLabel>SEXO</CeldaLabel></td>
            <td colSpan={1} style={tdLabel}><CeldaLabel>EDAD</CeldaLabel></td>
            <td colSpan={2} style={tdLabel}>
              <CeldaLabel small>COND. EDAD</CeldaLabel>
              <div style={{ display: "flex", justifyContent: "space-around", fontSize: "7px", fontWeight: 700 }}>
                <span>H</span><span>D</span><span>M</span><span>A</span>
              </div>
            </td>
          </tr>
          <tr style={{ height: 22 }}>
            <td colSpan={4} style={tdBase}><CeldaInput value={bloque.primer_apellido} onChange={(v) => onChange("primer_apellido", v)} /></td>
            <td colSpan={4} style={tdBase}><CeldaInput value={bloque.segundo_apellido} onChange={(v) => onChange("segundo_apellido", v)} /></td>
            <td colSpan={4} style={tdBase}><CeldaInput value={bloque.primer_nombre} onChange={(v) => onChange("primer_nombre", v)} /></td>
            <td colSpan={3} style={tdBase}><CeldaInput value={bloque.segundo_nombre} onChange={(v) => onChange("segundo_nombre", v)} /></td>
            <td colSpan={2} style={tdBase}><CeldaInput value={bloque.sexo} onChange={(v) => onChange("sexo", v)} center /></td>
            <td colSpan={1} style={tdBase}><CeldaInput value={bloque.edad} onChange={(v) => onChange("edad", v)} center /></td>
            <td colSpan={2} style={tdBase}>
              <div style={{ display: "flex", justifyContent: "space-around", padding: "3px 2px" }}>
                {(["H", "D", "M", "A"] as const).map((op) => (
                  <input
                    key={op}
                    type="radio"
                    name={`condicion_edad_${numero}`}
                    value={op}
                    checked={bloque.condicion_edad === op}
                    onChange={() => onChange("condicion_edad", op)}
                    style={{ width: 10, height: 10, cursor: "pointer" }}
                    title={op === "H" ? "Horas" : op === "D" ? "Días" : op === "M" ? "Meses" : "Años"}
                  />
                ))}
              </div>
            </td>
          </tr>

          {/* ── B. EVOLUCIÓN Y PRESCRIPCIONES ── */}
          <tr>
            <td colSpan={20} style={{ ...sectionHeader, border: "1px solid #000" }}>
              B. EVOLUCIÓN Y PRESCRIPCIONES
            </td>
          </tr>

          {/* Avisos reglamentarios */}
          <tr>
            <td colSpan={12} style={{ ...noteHeader, border: "1px solid #ccc" }}>
              ✍️ FIRMAR AL PIE DE CADA EVOLUCIÓN Y PRESCRIPCIÓN
            </td>
            <td colSpan={8} style={{ ...noteHeader, border: "1px solid #ccc", color: "#c0392b" }}>
              🔴 REGISTRAR CON ROJO LA ADMINISTRACIÓN DE FÁRMACOS Y COLOCACIÓN DE DISPOSITIVOS MÉDICOS
            </td>
          </tr>

          {/* Sub-encabezados 1. EVOLUCIÓN / 2. PRESCRIPCIONES */}
          <tr>
            <td
              colSpan={12}
              style={{
                ...tdBase,
                background: "#DCE6F1",
                fontWeight: 700,
                fontSize: "10px",
                padding: "3px 6px",
                verticalAlign: "middle",
              }}
            >
              1. EVOLUCIÓN
            </td>
            <td
              colSpan={8}
              style={{
                ...tdBase,
                background: "#DCE6F1",
                fontWeight: 700,
                fontSize: "10px",
                padding: "3px 6px",
                verticalAlign: "middle",
              }}
            >
              2. PRESCRIPCIONES
            </td>
          </tr>

          {/* Labels fecha / hora / notas / farmacoterapia */}
          <tr>
            <td colSpan={3} style={tdLabel}><CeldaLabel>FECHA (aaaa-mm-dd)</CeldaLabel></td>
            <td colSpan={2} style={tdLabel}><CeldaLabel>HORA (hh:mm)</CeldaLabel></td>
            <td colSpan={7} style={tdLabel}><CeldaLabel>NOTAS DE EVOLUCIÓN</CeldaLabel></td>
            {/* Columna prescripciones: label superior dividido en dos partes */}
            <td colSpan={8} style={tdLabel}>
              <CeldaLabel>FARMACOTERAPIA E INDICACIONES</CeldaLabel>
              <div style={{ fontSize: "8px", fontWeight: 400, color: "#555", textAlign: "center" }}>
                (Para enfermería y otro profesional de salud)
              </div>
            </td>
          </tr>

          {/* Área de contenido principal */}
          <tr style={{ height: 160 }}>
            <td colSpan={3} style={{ ...tdBase, verticalAlign: "top" }}>
              <input
                type="date"
                value={bloque.fecha}
                onChange={(e) => onChange("fecha", e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  fontSize: "11px",
                  padding: "4px",
                  fontFamily: "Arial, sans-serif",
                  boxSizing: "border-box",
                }}
              />
            </td>
            <td colSpan={2} style={{ ...tdBase, verticalAlign: "top" }}>
              <input
                type="time"
                value={bloque.hora}
                onChange={(e) => onChange("hora", e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  fontSize: "11px",
                  padding: "4px",
                  fontFamily: "Arial, sans-serif",
                  boxSizing: "border-box",
                }}
              />
            </td>
            <td colSpan={7} style={tdBase}>
              <RichTextEvolucion
                value={bloque.notas_evolucion}
                onChange={(v) => onChange("notas_evolucion", v)}
                minHeight="140px"
                placeholder="Escriba las notas de evolución del paciente..."
              />
            </td>
            <td colSpan={8} style={tdBase}>
              <RichTextEvolucion
                value={bloque.farmacoterapia}
                onChange={(v) => onChange("farmacoterapia", v)}
                minHeight="140px"
                placeholder="Farmacoterapia e indicaciones..."
              />
            </td>
          </tr>

          {/* Footer del bloque */}
          <tr>
            <td
              colSpan={12}
              style={{ border: "1px solid #000", fontSize: "8px", fontWeight: 700, padding: "3px 4px" }}
            >
              SNS-MSP / HCU-form.005/2021
            </td>
            <td
              colSpan={8}
              style={{
                border: "1px solid #000",
                fontSize: "10px",
                fontWeight: 700,
                textAlign: "right",
                padding: "3px 4px",
              }}
            >
              EVOLUCIÓN Y PRESCRIPCIONES &nbsp;({numero})
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  );
}

// ─── Plantillas de Notas de Evolución ─────────────────────────────────────────

const PLANTILLA_INGRESO = `<p><strong>NOTA DE INGRESO </strong></p>
<p><strong>CIRUGIA GENERAL</strong></p>
<p><strong>INGRESO: </strong></p>
<p><strong>HABITACION:  </strong></p>
<p><strong>DH: </strong></p>
<p><strong>SEGURO: </strong></p>
<p><strong>APP: </strong></p>
<p><strong>MEDICACION: </strong></p>
<p><strong>AGO: </strong></p>
<p><strong>APF: </strong></p>
<p><strong>AQX: </strong></p>
<p><strong>INMUNIZACIONES: </strong></p>
<p><strong>ALERGIAS: </strong></p>
<p><strong>HABITOS: </strong></p>
<p><strong>MOTIVO DE CONSULTA: </strong></p>
<p><strong>ENFERMEDAD ACTUAL: </strong></p>
<p><strong>EXAMEN FISICO: </strong></p>
<p><strong>SIGNOS VITALES:</strong></p>
<p><strong>TA: </strong></p>
<p><strong>T°: </strong></p>
<p><strong>PLAN:</strong></p>
<p><strong>DIAGNOSTICO: </strong></p>`;

const PLANTILLA_POSTQUIRURGICA = `<p><strong>NOTA POSTQUIRURGICA</strong></p>
<p><strong>CIRUGIA GENERAL</strong></p>
<p><strong>INGRESO: </strong></p>
<p><strong>HABITACION: </strong></p>
<p><strong>DH: </strong></p>
<p><strong>SEGURO:  </strong></p>
<p><strong>DIAGNOSTICO PREOPERATORIO: </strong></p>
<p><strong>DIAGNOSTICO POSTOPERATORIO: </strong></p>
<p><strong>CIRUGIA PROYECTADA: </strong></p>
<p><strong>CIRUGIA REALIZADA: </strong></p>
<p><strong>HALLAZGOS:</strong></p>
<p><strong>TEAM:  </strong></p>
<p><strong>CIRUJANO 1: </strong></p>
<p><strong>AYUDANTE: </strong></p>
<p><strong>ANESTESIOLOGO: </strong></p>
<p><strong>INSTRUMENTISTA: </strong></p>
<p><strong>COMPLICACIONES: </strong></p>
<p><strong>DRENAJE: </strong></p>
<p><strong>HISTOPATOLOGICO: </strong></p>
<p><strong>SANGRADO: </strong></p>`;

const PLANTILLA_EVOLUCION = `<p><strong>NOTA DE EVOLUCIÓN</strong></p>
<p><strong>CIRUGIA GENERAL</strong></p>
<p><strong>INGRESO: </strong></p>
<p><strong>HABITACION: </strong></p>
<p><strong>DH: </strong></p>
<p><strong>SEGURO:</strong></p>
<p><strong>DIAGNOSTICO POSTOPERATORIO: </strong></p>
<p><strong>DIAGNOSTICOS SECUNDARIOS:</strong></p>
<p><strong>PROCEDIMIENTO REALIZADO: </strong></p>
<p><strong>SUBJETIVO: </strong></p>
<p><strong>OBJETIVO: </strong></p>
<p><strong>SIGNOS VITALES: </strong></p>
<p><strong>TA: </strong></p>
<p><strong>T°: </strong></p>
<p><strong>EXAMEN FISICO:</strong></p>
<p><strong>ANALISIS: </strong></p>
<p><strong>PLAN: </strong></p>`;

const PLANTILLA_ALTA = `<p><strong>NOTA DE ALTA</strong></p>
<p><strong>CIRUGIA GENERAL</strong></p>
<p><strong>INGRESO: </strong></p>
<p><strong>HABITACION: </strong></p>
<p><strong>DH: </strong></p>
<p><strong>SEGURO: </strong></p>
<p><strong>DIAGNOSTICO POSTOPERATORIO: </strong></p>
<p><strong>PROCEDIMIENTO REALIZADO: </strong></p>
<p><strong>AL EXAMEN FISICO: </strong></p>`;

export type TipoNota = "INGRESO" | "POSTQUIRURGICA" | "EVOLUCION" | "ALTA";

function getPlantillaNota(tipo: TipoNota): string {
  switch (tipo) {
    case "INGRESO": return PLANTILLA_INGRESO;
    case "POSTQUIRURGICA": return PLANTILLA_POSTQUIRURGICA;
    case "EVOLUCION": return PLANTILLA_EVOLUCION;
    case "ALTA": return PLANTILLA_ALTA;
    default: return "";
  }
}

// ─── Componente Principal ─────────────────────────────────────────────────────

function crearBloqueVacio(paciente?: Props["paciente"], tipoNota: TipoNota = "INGRESO"): BloqueEvolucion {
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);
  return {
    institucion: paciente?.tipoPaciente ?? "PARTICULAR",
    unicodigo: "62858",
    establecimiento: "NUEVO HOSPITAL PANAMERICANO",
    numero_historia_clinica: paciente?.numero_historia_clinica ?? paciente?.cedula ?? "",
    numero_archivo: "",
    numero_hoja: "",
    primer_apellido: paciente?.primer_apellido ?? "",
    segundo_apellido: paciente?.segundo_apellido ?? "",
    primer_nombre: paciente?.primer_nombre ?? "",
    segundo_nombre: paciente?.segundo_nombre ?? "",
    sexo: paciente?.sexo
      ? paciente.sexo.toUpperCase().startsWith("F") ? "F" : paciente.sexo.toUpperCase().startsWith("M") ? "M" : paciente.sexo
      : "",
    edad: paciente?.edad?.toString() ?? "",
    condicion_edad: "A",
    fecha: today,
    hora: nowTime,
    notas_evolucion: getPlantillaNota(tipoNota),
    farmacoterapia: "",
    administrar_farmacos: "",
  };
}

const EvolucionForm = React.forwardRef<HistoriaClinicaEvolucionHandle, Props>(
  ({ paciente, initialData, guardando = false, exportando = false, atencionId }, ref) => {
    
    const [datos, setDatos] = useState<DatosEvolucion>(() => {
      if (initialData?.bloques && initialData.bloques.length > 0) {
        return { bloques: [...initialData.bloques] };
      }
      return { bloques: [crearBloqueVacio(paciente)] };
    });

    const { isDirty, clearAutosave } = useFormAutosaveAndWarn({
      formId: `hc_evolucion_${atencionId || 'new'}_${paciente?.cedula || 'new'}`,
      initialData: initialData || { bloques: [crearBloqueVacio(paciente)] },
      currentData: datos,
      onRestore: (saved) => setDatos(p => ({ ...p, ...saved })),
    });

    const handleAddBloque = (tipoNota: TipoNota) => {
      setDatos((prev) => ({
        bloques: [...prev.bloques, crearBloqueVacio(paciente, tipoNota)],
      }));
    };

    const handleRemoveBloque = (idx: number) => {
      if (datos.bloques.length <= 1) return;
      setDatos((prev) => ({
        bloques: prev.bloques.filter((_, i) => i !== idx),
      }));
    };

    /** Actualiza un campo de un bloque específico */
    const handleChange = (
      idx: number,
      campo: keyof BloqueEvolucion,
      valor: string
    ) => {
      setDatos((prev) => {
        const bloques = [...prev.bloques];
        bloques[idx] = { ...bloques[idx], [campo]: valor };
        return { bloques };
      });
      if (idx === 0 && campo === "farmacoterapia") {
        window.dispatchEvent(new CustomEvent("sync_plan_tratamiento", { detail: { source: "evolucion", value: valor } }));
      }
    };

    useEffect(() => {
      const handleSync = (e: CustomEvent) => {
        if (e.detail.source !== "evolucion") {
          setDatos(prev => {
            const nuevos = [...prev.bloques];
            if (nuevos.length > 0) {
              nuevos[0] = { ...nuevos[0], farmacoterapia: e.detail.value };
            }
            return { ...prev, bloques: nuevos };
          });
        }
      };
      window.addEventListener("sync_plan_tratamiento", handleSync as EventListener);
      return () => window.removeEventListener("sync_plan_tratamiento", handleSync as EventListener);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        getDatos: () => {
          // Ya no necesitamos aplanar a ev1_... porque el backend calculará las celdas matemáticamente.
          // Solo devolvemos la data estructurada en bloques.
          return { bloques: datos.bloques };
        },
        clearAutosave: () => clearAutosave(),
        isDirty: () => isDirty,
      }),
      [datos, clearAutosave, isDirty]
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {/* ── Bloques de evolución ─────────────────────────────────── */}
        <div style={{ overflowY: "visible", overflowX: "visible", background: "#fff", minHeight: "70vh" }}>
          {datos.bloques.map((bloque, idx) => (
            <div key={idx} style={{ position: "relative", marginBottom: "20px" }}>
              <EvolucionBloque
                numero={idx + 1}
                bloque={bloque}
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

          <div style={{ display: "flex", justifyContent: "center", gap: "12px", padding: "16px", borderTop: "2px dashed #ccc", marginTop: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => handleAddBloque("POSTQUIRURGICA")}
              style={{
                background: "#eff6ff",
                color: "#3b82f6",
                border: "1px solid #bfdbfe",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              + NOTA POSTQUIRURGICA
            </button>
            <button
              type="button"
              onClick={() => handleAddBloque("EVOLUCION")}
              style={{
                background: "#f0fdf4",
                color: "#16a34a",
                border: "1px solid #bbf7d0",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              + NOTA DE EVOLUCIÓN
            </button>
            <button
              type="button"
              onClick={() => handleAddBloque("ALTA")}
              style={{
                background: "#fef2f2",
                color: "#dc2626",
                border: "1px solid #fecaca",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              + NOTA DE ALTA
            </button>
          </div>
        </div>
      </div>
    );
  }
);

EvolucionForm.displayName = "HistoriaClinicaEvolucionForm";

export default EvolucionForm;
