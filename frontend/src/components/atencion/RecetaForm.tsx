"use client";

import React, { useState, useImperativeHandle } from "react";
import RichTextEpicrisis from "../ui/RichTextEpicrisis";
import { useFormAutosaveAndWarn } from "@/hooks/useFormAutosaveAndWarn";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DatosReceta {
  // Datos del paciente — se auto-completan pero editables en ambas columnas
  nombre: string;
  cedula: string;
  edad: string;
  alergias: string;
  diagnostico: string;
  fecha: string;

  // Columna izquierda — RP (prescripción)
  rp_contenido: string;

  // Columna derecha — Indicaciones
  indicaciones_contenido: string;
}

interface Props {
  paciente?: {
    primerNombre?: string;
    segundoNombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    cedula?: string;
    edad?: number;
  };
  medico?: {
    nombre?: string;
    especialidad?: string;
    registro?: string;
    telefono?: string;
    direccion?: string;
  };
  establecimiento?: {
    nombre?: string;
    logo?: string; // URL o base64
    direccion?: string;
    telefono?: string;
  };
  initialData?: Partial<DatosReceta>;
  onGuardar?: (datos: DatosReceta) => void;
  onExportarDocx?: (datos: DatosReceta) => void;
  guardando?: boolean;
  exportando?: boolean;
  exportando?: boolean;
  atencionId?: number;
  isReadOnly?: boolean;
}

export type HistoriaClinicaRecetaHandle = {
  getDatos: () => DatosReceta;
  clearAutosave?: () => void;
  isDirty?: () => boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nombreCompleto(p?: Props["paciente"]): string {
  if (!p) return "";
  return [p.primerApellido, p.segundoApellido, p.primerNombre, p.segundoNombre]
    .filter(Boolean).join(" ");
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg, color: "#fff", border: "none", borderRadius: 6,
    padding: "6px 14px", fontSize: "11px", fontWeight: 700,
    cursor: "pointer", fontFamily: "'Georgia', serif", letterSpacing: "0.03em",
  };
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function FieldRow({ label, value, onChange, readOnly = false, type = "text" }: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  type?: string;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "baseline",
      borderBottom: "1px solid #ccc", marginBottom: 6, paddingBottom: 2,
    }}>
      <span style={{
        fontSize: "10px", fontWeight: 700, fontFamily: "'Georgia', serif",
        color: "#1a3a5c", whiteSpace: "nowrap", marginRight: 6, minWidth: 130,
      }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          flex: 1, border: "none", outline: "none",
          background: readOnly ? "transparent" : "#fff",
          fontSize: "10px", fontFamily: "'Georgia', serif",
          color: "#000", padding: "1px 2px", boxSizing: "border-box",
        }}
      />
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

const RecetaForm = React.forwardRef<HistoriaClinicaRecetaHandle, Props>(
  ({ paciente, medico, establecimiento, initialData, onGuardar, onExportarDocx, guardando = false, exportando = false, atencionId, isReadOnly }, ref) => {
  const today = new Date().toISOString().split("T")[0];

  const [d, setD] = useState<DatosReceta>({
    nombre: nombreCompleto(paciente),
    cedula: paciente?.cedula ?? "",
    edad: paciente?.edad?.toString() ?? "",
    alergias: "",
    diagnostico: "",
    fecha: today,
    rp_contenido: "",
    indicaciones_contenido: "",
    ...initialData,
  });

  const { isDirty, clearAutosave } = useFormAutosaveAndWarn({
    formId: `receta_${atencionId || 'new'}_${paciente?.cedula || 'new'}`,
    initialData: initialData || {},
    currentData: d,
    onRestore: (saved) => setD(p => ({ ...p, ...saved })),
  });

  const s = (k: keyof DatosReceta) => (v: string) => !isReadOnly && setD(p => ({ ...p, [k]: v }));

  useImperativeHandle(ref, () => ({
    getDatos: () => d,
    clearAutosave: () => clearAutosave(),
    isDirty: () => isDirty,
  }), [d, clearAutosave, isDirty]);

  // ── Shared patient block ───────────────────────────────────────────────────
  const renderDatosBloque = () => (
    <div style={{ marginBottom: 10 }}>
      <FieldRow label="NOMBRE:" value={d.nombre} onChange={s("nombre")} readOnly={isReadOnly} />
      <FieldRow label="CÉDULA DE IDENTIDAD:" value={d.cedula} onChange={s("cedula")} readOnly={isReadOnly} />
      <FieldRow label="EDAD:" value={d.edad} onChange={s("edad")} readOnly={isReadOnly} />
      <FieldRow label="ALERGIAS:" value={d.alergias} onChange={s("alergias")} readOnly={isReadOnly} />
      <FieldRow label="DIAGNÓSTICO:" value={d.diagnostico} onChange={s("diagnostico")} readOnly={isReadOnly} />
      <FieldRow label="FECHA:" value={d.fecha} onChange={s("fecha")} type="date" readOnly={isReadOnly} />
    </div>
  );

  const columnStyle: React.CSSProperties = {
    flex: 1, display: "flex", flexDirection: "column",
    padding: "16px 18px", boxSizing: "border-box",
  };

  const contentAreaStyle: React.CSSProperties = {
    flex: 1,
    border: "1px solid #c8d8e8",
    borderRadius: 4,
    background: "#fafcff",
    padding: "8px 10px",
    minHeight: 320,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", fontFamily: "'Georgia', serif" }}>

      {/* ── Barra de acciones ──────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 14px", background: "#f5f7fa",
        borderBottom: "1px solid #dde3ea", gap: 8,
      }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#1a3a5c", fontFamily: "'Georgia', serif" }}>
            RECETA MÉDICA
          </span>
          <span style={{ fontSize: "10px", color: "#7a8a9a", marginLeft: 10, fontFamily: "Arial, sans-serif" }}>
            SNS-MSP — Prescripción Médica
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {!isReadOnly && (
            <button onClick={() => { onGuardar?.(d); clearAutosave(); }} disabled={guardando} style={btnStyle("#1a3a5c")}>
              {guardando ? "Guardando..." : "💾 Guardar"}
            </button>
          )}
          <button onClick={() => { onExportarDocx?.(d); clearAutosave(); }} disabled={exportando} style={btnStyle("#1e6b2e")}>
            {exportando ? "Exportando..." : "📄 Descargar Word"}
          </button>
        </div>
      </div>

      {/* ── Cuerpo de la receta ────────────────────────────────────────────── */}
      <div className={isReadOnly ? 'read-only-mode' : ''} inert={isReadOnly ? true : undefined} style={{
        background: "#fff",
        border: "1px solid #c8d8e8",
        margin: "12px",
        borderRadius: 6,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        overflow: "hidden",
        minWidth: 780,
      }}>

        {/* ── Encabezado ────────────────────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center",
          padding: "14px 20px 12px",
          borderBottom: "2px solid #1a3a5c",
          background: "#f8fafd", gap: 16,
        }}>
          {/* Logo izquierda */}
          <div style={{
            width: 110, height: 70, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img
              src="/logo-receta.png"
              alt="Logo Hospital"
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
          </div>

          {/* Datos fijos del hospital — centro */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{
              fontSize: "16px", fontWeight: 700, color: "#1a3a5c",
              fontFamily: "'Georgia', serif", letterSpacing: "0.03em",
              lineHeight: 1.3,
            }}>
              NUEVO HOSPITAL PANAMERICANO
            </div>
            <div style={{
              fontSize: "12px", fontWeight: 600, color: "#2c5282",
              fontFamily: "'Georgia', serif", marginTop: 2,
            }}>
              CENTRO MÉDICO DE ESPECIALIDADES
            </div>
            <div style={{
              fontSize: "8.5px", color: "#555",
              fontFamily: "Arial, sans-serif", marginTop: 5, lineHeight: 1.5,
            }}>
              DIRECCIÓN: Juan de Arguello Oe2-157 y Pedro de Alfaro (esq.) Junto al Retén de Policía Villa Flora
            </div>
            <div style={{
              fontSize: "8.5px", color: "#555",
              fontFamily: "Arial, sans-serif", lineHeight: 1.5,
            }}>
              Telfs. 2615-687 / 2664-130 &nbsp;|&nbsp; Fax: 2663-661 &nbsp;|&nbsp; nhpanamericanovlc@gmail.com &nbsp;|&nbsp; Quito - Ecuador
            </div>
          </div>
        </div>

        {/* ── Título RECETA MÉDICA ─────────────────────────────────────────── */}
        <div style={{
          textAlign: "center", padding: "8px 0 6px",
          fontSize: "13px", fontWeight: 700, letterSpacing: "0.12em",
          color: "#1a3a5c", borderBottom: "1px solid #dde8f0",
          background: "#eef3f9",
        }}>
          RECETA MÉDICA
        </div>

        {/* ── Dos columnas ─────────────────────────────────────────────────── */}
        <div style={{ display: "flex", minHeight: 500 }}>

          {/* ════════ COLUMNA IZQUIERDA — RP ════════ */}
          <div style={{
            ...columnStyle,
            borderRight: "2px dashed #c8d8e8",
          }}>
            {/* Datos del paciente */}
            {renderDatosBloque()}

            {/* Sección RP */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{
                fontSize: "13px", fontWeight: 700, color: "#1a3a5c",
                fontFamily: "'Georgia', serif", marginBottom: 6,
                paddingBottom: 4, borderBottom: "2px solid #1a3a5c",
                letterSpacing: "0.06em",
              }}>
                RP:
              </div>
              <div style={contentAreaStyle}>
                <RichTextEpicrisis
                  value={d.rp_contenido}
                  onChange={s("rp_contenido")}
                  placeholder={"Escriba aquí la prescripción médica..."}
                  minHeight="420px"
                />
              </div>
            </div>
          </div>

          {/* ════════ COLUMNA DERECHA — INDICACIONES ════════ */}
          <div style={{ ...columnStyle }}>
            {/* Datos del paciente (copia — mismos datos) */}
            {renderDatosBloque()}

            {/* Sección Indicaciones */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{
                fontSize: "13px", fontWeight: 700, color: "#1a3a5c",
                fontFamily: "'Georgia', serif", marginBottom: 6,
                paddingBottom: 4, borderBottom: "2px solid #1a3a5c",
                letterSpacing: "0.06em",
              }}>
                INDICACIONES
              </div>
              <div style={contentAreaStyle}>
                <RichTextEpicrisis
                  value={d.indicaciones_contenido}
                  onChange={s("indicaciones_contenido")}
                  placeholder={"Escriba aquí las indicaciones médicas..."}
                  minHeight="420px"
                />
              </div>
            </div>
          </div>

        </div>

        {/* ── Pie del documento ─────────────────────────────────────────────── */}
        <div style={{
          borderTop: "1px solid #dde8f0",
          background: "#f8fafd",
          padding: "6px 20px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: "8px", color: "#aab8c8", fontFamily: "Arial, sans-serif" }}>
            Documento generado digitalmente — SNS-MSP / Receta Médica
          </span>
          <span style={{ fontSize: "8px", color: "#aab8c8", fontFamily: "Arial, sans-serif" }}>
            {d.fecha}
          </span>
        </div>

      </div>
    </div>
  );
});

RecetaForm.displayName = "HistoriaClinicaRecetaForm";

export default RecetaForm;