"use client";

import React, { forwardRef, useImperativeHandle, useState, useMemo, useEffect } from "react";
import { Paciente } from "@/types";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type EdadOpcion =
  | "recien_nacido"
  | "lactante_menor"
  | "lactante_mayor"
  | "pre_escolar"
  | "escolar"
  | null;

type CaidaPrevia = "no" | "si" | null;

type Antecedente = "hiperactividad" | "neuromusculares" | "convulsivo" | "cerebral" | "otros" | "sin_antecedentes" | null;

type Conciencia = "no" | "si" | null;

type NivelRiesgo = "bajo" | "medio" | "alto";

export interface DatosMacdem {
  tipo_escala: string;
  nombres_completos?: string; // Mantengo la prop para el DOCX
  edad: EdadOpcion;
  caida_previa: CaidaPrevia;
  antecedente: Antecedente;
  conciencia: Conciencia;
}

export interface EscalaMacdemFormRef {
  getData: () => any;
  isDirty: boolean;
  clearAutosave: () => void;
}

interface Props {
  paciente: Paciente | null;
  initialData: any;
  isReadOnly?: boolean;
}

// ─── Definición de opciones (fiel al Excel) ───────────────────────────────────

const EDAD_OPTS: Array<{ key: NonNullable<EdadOpcion>; label: string; puntaje: number }> = [
  { key: "recien_nacido",   label: "Recién Nacido",  puntaje: 2 },
  { key: "lactante_menor",  label: "Lactante Menor", puntaje: 2 },
  { key: "lactante_mayor",  label: "Lactante Mayor", puntaje: 3 },
  { key: "pre_escolar",     label: "Pre – escolar",  puntaje: 3 },
  { key: "escolar",         label: "Escolar",        puntaje: 1 },
];

const ANTECEDENTE_OPTS: Array<{ key: NonNullable<Antecedente>; label: string; puntaje: number }> = [
  { key: "hiperactividad",    label: "Hiperactividad",             puntaje: 1 },
  { key: "neuromusculares",   label: "Problemas neuromusculares",  puntaje: 1 },
  { key: "convulsivo",        label: "Síndrome convulsivo",        puntaje: 1 },
  { key: "cerebral",          label: "Daño orgánico cerebral",     puntaje: 1 },
  { key: "otros",             label: "Otros",                      puntaje: 1 },
  { key: "sin_antecedentes",  label: "Sin antecedentes",           puntaje: 0 },
];

// ─── Cálculo ──────────────────────────────────────────────────────────────────

function calcularPuntaje(d: DatosMacdem): number {
  let p = 0;
  const edadOpt = EDAD_OPTS.find(o => o.key === d.edad);
  if (edadOpt) p += edadOpt.puntaje;
  if (d.caida_previa === "si") p += 1;
  const antOpt = ANTECEDENTE_OPTS.find(o => o.key === d.antecedente);
  if (antOpt) p += antOpt.puntaje;
  if (d.conciencia === "si") p += 1;
  return p;
}

function calcularNivel(puntaje: number): NivelRiesgo {
  if (puntaje <= 1) return "bajo";
  if (puntaje <= 3) return "medio";
  return "alto";
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const COLOR_SELECCIONADO = "#FFE066";
const COLOR_NIVEL: Record<NivelRiesgo, string> = {
  bajo:  "#d4edda",
  medio: "#fff3cd",
  alto:  "#f8d7da",
};
const COLOR_NIVEL_TEXT: Record<NivelRiesgo, string> = {
  bajo:  "#155724",
  medio: "#856404",
  alto:  "#721c24",
};

const border = "1px solid #999";

const cellBase: React.CSSProperties = {
  border, fontFamily: "Arial, sans-serif", fontSize: "10px",
  padding: "4px 8px", verticalAlign: "middle",
};

const thStyle: React.CSSProperties = {
  ...cellBase,
  background: "#1a3a5c", color: "#fff",
  fontWeight: 700, textAlign: "center",
};

const tdVar: React.CSSProperties = {
  ...cellBase,
  background: "#dce6f1", fontWeight: 700,
  color: "#1a3a5c", textAlign: "center",
};

const tdDesc: React.CSSProperties = {
  ...cellBase, background: "#fff",
};

const tdPuntaje = (seleccionado: boolean, disabled: boolean): React.CSSProperties => ({
  ...cellBase,
  background: seleccionado ? COLOR_SELECCIONADO : "#fff",
  textAlign: "center", fontWeight: 700, fontSize: "12px",
  cursor: disabled ? "default" : "pointer", userSelect: "none",
  transition: "background 0.15s",
  minWidth: 50,
  opacity: disabled ? 0.7 : 1,
});

const tdAccion = (activo: boolean, nivel: NivelRiesgo): React.CSSProperties => ({
  ...cellBase,
  background: activo ? COLOR_NIVEL[nivel] : "#fff",
  textAlign: "center", fontWeight: activo ? 700 : 400,
  fontSize: activo ? "14px" : "10px",
  color: activo ? COLOR_NIVEL_TEXT[nivel] : "#666",
});

// ─── Componente Principal ─────────────────────────────────────────────────────

const EscalaMacdemForm = forwardRef<EscalaMacdemFormRef, Props>(({ paciente, initialData, isReadOnly }, ref) => {
  const nombreCompleto = paciente ? [
    paciente.primerApellido, paciente.segundoApellido,
    paciente.primerNombre, paciente.segundoNombre,
  ].filter(Boolean).join(" ").toUpperCase() : "";

  const [formData, setFormData] = useState<DatosMacdem>({
    tipo_escala: 'MACDEMS',
    nombres_completos: nombreCompleto,
    edad: null,
    caida_previa: null,
    antecedente: null,
    conciencia: null,
    ...initialData,
  });
  
  const [isDirty, setIsDirty] = useState(false);

  // ── Puntaje calculado reactivo ───────────────────────────────────────────
  const puntaje = useMemo(() => calcularPuntaje(formData), [formData]);
  const nivel = useMemo(() => calcularNivel(puntaje), [puntaje]);

  useImperativeHandle(ref, () => ({
    getData: () => {
      // Inyectamos la puntuación y el nivel calculados para que backend lo procese
      return {
        ...formData,
        puntuacion: puntaje,
        nivel: nivel
      };
    },
    isDirty,
    clearAutosave: () => {
      setIsDirty(false);
    },
  }));

  // Actualizamos state local y dirty flag
  const handleChange = (update: Partial<DatosMacdem>) => {
    if (isReadOnly) return;
    setFormData(prev => ({ ...prev, ...update }));
    setIsDirty(true);
  };

  const seleccionarEdad = (key: EdadOpcion) => {
    handleChange({ edad: formData.edad === key ? null : key });
  };

  const seleccionarCaida = (key: CaidaPrevia) => {
    handleChange({ caida_previa: formData.caida_previa === key ? null : key });
  };

  const seleccionarAntecedente = (key: Antecedente) => {
    handleChange({ antecedente: formData.antecedente === key ? null : key });
  };

  const seleccionarConciencia = (key: Conciencia) => {
    handleChange({ conciencia: formData.conciencia === key ? null : key });
  };

  const tbl: React.CSSProperties = {
    width: "100%", maxWidth: 800, borderCollapse: "collapse",
    fontFamily: "Arial, sans-serif", fontSize: "10px", margin: "0 auto"
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* ── Instrucción ───────────────────────────────────────────────────── */}
      {!isReadOnly && (
        <div style={{
          fontSize: "10px", color: "#666", fontFamily: "Arial, sans-serif",
          padding: "8px 16px", background: "#fffdf0", borderBottom: "1px solid #e8e0c0",
          textAlign: "center"
        }}>
          💡 Haga clic en el número de puntaje para seleccionarlo (se resalta en amarillo). Puede desmarcar haciendo clic nuevamente.
        </div>
      )}

      {/* ── Tabla ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: "20px 16px", overflowX: "auto" }}>
        
        {/* ── NOMBRE DEL PACIENTE ──────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 0,
          border, marginBottom: 8, maxWidth: 800, margin: "0 auto 8px",
          background: "#fff",
        }}>
          <div style={{
            padding: "8px 12px", fontWeight: 700, fontSize: "11px",
            fontFamily: "Arial, sans-serif", color: "#1a3a5c",
            background: "#dce6f1", whiteSpace: "nowrap", borderRight: border,
          }}>
            NOMBRE DEL PACIENTE:
          </div>
          <input
            type="text"
            value={formData.nombres_completos || ""}
            onChange={(e) => handleChange({ nombres_completos: e.target.value })}
            placeholder="Apellidos y nombres completos"
            readOnly={isReadOnly}
            style={{
              flex: 1, border: "none", outline: "none", padding: "8px 12px",
              fontSize: "11px", fontFamily: "Arial, sans-serif", color: "#000",
              background: isReadOnly ? "#f9f9f9" : "#fff",
            }}
          />
        </div>

        <table style={tbl}>
          <tbody>
            {/* ── TÍTULO ── */}
            <tr>
              <td colSpan={3} style={{
                ...cellBase, textAlign: "center", fontWeight: 700,
                fontSize: "13px", letterSpacing: "0.06em",
                background: "#1a3a5c", color: "#fff", padding: "10px",
              }}>
                ESCALA DE RIESGO DE CAÍDA MACDEMS
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={{
                ...cellBase, textAlign: "center", fontWeight: 700,
                fontSize: "11px", background: "#2c5282", color: "#fff", padding: "6px"
              }}>
                DE 0 A 12 AÑOS
              </td>
            </tr>

            {/* ── CABECERA COLUMNAS ── */}
            <tr>
              <th style={{ ...thStyle, width: 180, padding: "8px" }}>VARIABLES</th>
              <th style={{ ...thStyle, padding: "8px" }}>DESCRIPCIÓN</th>
              <th style={{ ...thStyle, width: 80, padding: "8px" }}>PUNTAJE</th>
            </tr>

            {/* ══════════════ EDAD ══════════════════════════════════════════ */}
            {EDAD_OPTS.map((opt, i) => (
              <tr key={opt.key}>
                {i === 0 && (
                  <td rowSpan={5} style={{ ...tdVar }}>EDAD</td>
                )}
                <td style={tdDesc}>{opt.label}</td>
                <td
                  style={tdPuntaje(formData.edad === opt.key, !!isReadOnly)}
                  onClick={() => seleccionarEdad(opt.key)}
                  title={`Seleccionar: ${opt.label} (${opt.puntaje} pts)`}
                >
                  {opt.puntaje}
                </td>
              </tr>
            ))}

            {/* ══════════════ ANTECEDENTE DE CAÍDA PREVIA ═══════════════════ */}
            <tr>
              <td rowSpan={2} style={tdVar}>ANTECEDENTE DE CAÍDA PREVIA</td>
              <td style={tdDesc}>No</td>
              <td style={tdPuntaje(formData.caida_previa === "no", !!isReadOnly)}
                onClick={() => seleccionarCaida("no")}
                title="Seleccionar: No (0 pts)">0</td>
            </tr>
            <tr>
              <td style={tdDesc}>Si</td>
              <td style={tdPuntaje(formData.caida_previa === "si", !!isReadOnly)}
                onClick={() => seleccionarCaida("si")}
                title="Seleccionar: Si (1 pt)">1</td>
            </tr>

            {/* ══════════════ ANTECEDENTES ══════════════════════════════════ */}
            {ANTECEDENTE_OPTS.map((opt, i) => (
              <tr key={opt.key}>
                {i === 0 && (
                  <td rowSpan={6} style={tdVar}>ANTECEDENTES</td>
                )}
                <td style={tdDesc}>{opt.label}</td>
                <td
                  style={tdPuntaje(formData.antecedente === opt.key, !!isReadOnly)}
                  onClick={() => seleccionarAntecedente(opt.key)}
                  title={`Seleccionar: ${opt.label} (${opt.puntaje} pts)`}
                >
                  {opt.puntaje}
                </td>
              </tr>
            ))}

            {/* ══════════════ COMPROMISO DE CONCIENCIA ══════════════════════ */}
            <tr>
              <td rowSpan={2} style={tdVar}>COMPROMISO DE CONCIENCIA</td>
              <td style={tdDesc}>No</td>
              <td style={tdPuntaje(formData.conciencia === "no", !!isReadOnly)}
                onClick={() => seleccionarConciencia("no")}
                title="Seleccionar: No (0 pts)">0</td>
            </tr>
            <tr>
              <td style={tdDesc}>Si</td>
              <td style={tdPuntaje(formData.conciencia === "si", !!isReadOnly)}
                onClick={() => seleccionarConciencia("si")}
                title="Seleccionar: Si (1 pt)">1</td>
            </tr>

            {/* ══════════════ PUNTUACIÓN FINAL ══════════════════════════════ */}
            <tr>
              <td colSpan={2} style={{
                ...cellBase, fontWeight: 700, fontSize: "11px",
                background: "#eef3f9", color: "#1a3a5c",
                letterSpacing: "0.03em", padding: "8px"
              }}>
                7. PUNTUACIÓN FINAL Y NIVEL DE RIESGO
              </td>
              <td style={{
                ...cellBase, textAlign: "center",
                background: COLOR_NIVEL[nivel],
                color: COLOR_NIVEL_TEXT[nivel],
                fontWeight: 700, fontSize: "18px", padding: "8px"
              }}>
                {puntaje}
              </td>
            </tr>

            {/* ══════════════ CABECERA TABLA DE ACCIONES ════════════════════ */}
            <tr>
              <th style={{ ...thStyle, textAlign: "center" }}>Riesgo</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Puntaje</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Acción</th>
            </tr>

            {/* ══════════════ NIVEL BAJO ════════════════════════════════════ */}
            <tr>
              <td style={{
                ...cellBase, textAlign: "center", fontWeight: 700,
                background: nivel === "bajo" ? COLOR_NIVEL.bajo : "#fff",
                color: nivel === "bajo" ? COLOR_NIVEL_TEXT.bajo : "#333",
              }}>
                {nivel === "bajo" && <span style={{ marginRight: 4 }}>✔</span>}
                BAJO
              </td>
              <td style={{ ...cellBase, textAlign: "center" }}>0 a 1</td>
              <td style={tdAccion(nivel === "bajo", "bajo")}>
                {nivel === "bajo" ? "X" : ""}
                <div style={{ fontSize: "9px", fontWeight: 400, color: "#555", marginTop: nivel === "bajo" ? 2 : 0 }}>
                  Cuidados bajo enfermería
                </div>
              </td>
            </tr>

            {/* ══════════════ NIVEL MEDIO ═══════════════════════════════════ */}
            <tr>
              <td style={{
                ...cellBase, textAlign: "center", fontWeight: 700,
                background: nivel === "medio" ? COLOR_NIVEL.medio : "#fff",
                color: nivel === "medio" ? COLOR_NIVEL_TEXT.medio : "#333",
              }}>
                {nivel === "medio" && <span style={{ marginRight: 4 }}>✔</span>}
                MEDIO
              </td>
              <td style={{ ...cellBase, textAlign: "center" }}>2 a 3</td>
              <td style={tdAccion(nivel === "medio", "medio")}>
                {nivel === "medio" ? "X" : ""}
                <div style={{ fontSize: "9px", fontWeight: 400, color: "#555", marginTop: nivel === "medio" ? 2 : 0 }}>
                  Implementación del plan de prevención
                </div>
              </td>
            </tr>

            {/* ══════════════ NIVEL ALTO ════════════════════════════════════ */}
            <tr>
              <td style={{
                ...cellBase, textAlign: "center", fontWeight: 700,
                background: nivel === "alto" ? COLOR_NIVEL.alto : "#fff",
                color: nivel === "alto" ? COLOR_NIVEL_TEXT.alto : "#333",
              }}>
                {nivel === "alto" && <span style={{ marginRight: 4 }}>✔</span>}
                ALTO
              </td>
              <td style={{ ...cellBase, textAlign: "center" }}>4 a 6</td>
              <td style={tdAccion(nivel === "alto", "alto")}>
                {nivel === "alto" ? "X" : ""}
                <div style={{ fontSize: "9px", fontWeight: 400, color: "#555", marginTop: nivel === "alto" ? 2 : 0 }}>
                  Implementación de medidas especiales
                </div>
              </td>
            </tr>

          </tbody>
        </table>

        {/* ── Resumen visual ──────────────────────────────────────────────── */}
        {puntaje > 0 && (
          <div style={{
            marginTop: 16, padding: "12px 20px",
            background: COLOR_NIVEL[nivel], border: `1px solid ${COLOR_NIVEL_TEXT[nivel]}33`,
            borderRadius: 8, maxWidth: 800, margin: "16px auto 0",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{
              fontSize: "32px", fontWeight: 900,
              color: COLOR_NIVEL_TEXT[nivel], minWidth: 48, textAlign: "center",
            }}>
              {puntaje}
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: COLOR_NIVEL_TEXT[nivel] }}>
                RIESGO {nivel.toUpperCase()}
              </div>
              <div style={{ fontSize: "12px", color: COLOR_NIVEL_TEXT[nivel], marginTop: 4 }}>
                {nivel === "bajo"  && "Cuidados bajo enfermería"}
                {nivel === "medio" && "Implementación del plan de prevención"}
                {nivel === "alto"  && "Implementación de medidas especiales"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

EscalaMacdemForm.displayName = "EscalaMacdemForm";
export default EscalaMacdemForm;
