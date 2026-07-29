"use client";

import React, { forwardRef, useImperativeHandle, useState, useMemo, useEffect } from "react";
import { Paciente } from "@/types";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type CaidaPrevia = "no" | "si" | null;
type Comorbilidades = "no" | "si" | null;
type AyudaDeambular = "ninguna" | "baston" | "muebles" | null;
type Venoclisis = "no" | "si" | null;
type Marcha = "normal" | "debil" | "limitada" | null;
type EstadoMental = "reconoce" | "sobreestima" | null;

type NivelRiesgo = "bajo" | "medio" | "alto";

export interface DatosMorse {
  tipo_escala: string;
  nombres_completos?: string; // Mantengo la prop para el DOCX
  caida_previa: CaidaPrevia;
  comorbilidades: Comorbilidades;
  ayuda_deambular: AyudaDeambular;
  venoclisis: Venoclisis;
  marcha: Marcha;
  estado_mental: EstadoMental;
}

export interface EscalaMorseFormRef {
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

const AYUDA_DEAMBULAR_OPTS: Array<{ key: NonNullable<AyudaDeambular>; label: string; puntaje: number }> = [
  { key: "ninguna", label: "Ninguna / Reposo en cama / Asistencia", puntaje: 0 },
  { key: "baston",  label: "Bastón / Muleta / Caminador",           puntaje: 15 },
  { key: "muebles", label: "Se apoya en los muebles",               puntaje: 30 },
];

const MARCHA_OPTS: Array<{ key: NonNullable<Marcha>; label: string; puntaje: number }> = [
  { key: "normal",   label: "Normal / Reposo en cama / Silla de ruedas", puntaje: 0 },
  { key: "debil",    label: "Débil",                                     puntaje: 10 },
  { key: "limitada", label: "Limitada",                                  puntaje: 20 },
];

const ESTADO_MENTAL_OPTS: Array<{ key: NonNullable<EstadoMental>; label: string; puntaje: number }> = [
  { key: "reconoce",    label: "Reconoce sus limitaciones",             puntaje: 0 },
  { key: "sobreestima", label: "Sobreestima u olvida sus limitaciones", puntaje: 15 },
];

// ─── Cálculo ──────────────────────────────────────────────────────────────────

function calcularPuntaje(d: DatosMorse): number {
  let p = 0;
  if (d.caida_previa === "si") p += 25;
  if (d.comorbilidades === "si") p += 15;
  
  const ayudaOpt = AYUDA_DEAMBULAR_OPTS.find(o => o.key === d.ayuda_deambular);
  if (ayudaOpt) p += ayudaOpt.puntaje;
  
  if (d.venoclisis === "si") p += 20;

  const marchaOpt = MARCHA_OPTS.find(o => o.key === d.marcha);
  if (marchaOpt) p += marchaOpt.puntaje;

  const estadoOpt = ESTADO_MENTAL_OPTS.find(o => o.key === d.estado_mental);
  if (estadoOpt) p += estadoOpt.puntaje;

  return p;
}

function calcularNivel(puntaje: number): NivelRiesgo {
  if (puntaje <= 24) return "bajo";
  if (puntaje <= 50) return "medio";
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

const EscalaMorseForm = forwardRef<EscalaMorseFormRef, Props>(({ paciente, initialData, isReadOnly }, ref) => {
  const nombreCompleto = paciente ? [
    paciente.primerApellido, paciente.segundoApellido,
    paciente.primerNombre, paciente.segundoNombre,
  ].filter(Boolean).join(" ").toUpperCase() : "";

  const [formData, setFormData] = useState<DatosMorse>({
    tipo_escala: 'MORSE',
    nombres_completos: nombreCompleto,
    caida_previa: null,
    comorbilidades: null,
    ayuda_deambular: null,
    venoclisis: null,
    marcha: null,
    estado_mental: null,
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
  const handleChange = (update: Partial<DatosMorse>) => {
    if (isReadOnly) return;
    setFormData(prev => ({ ...prev, ...update }));
    setIsDirty(true);
  };

  const seleccionarCaida = (key: CaidaPrevia) => {
    handleChange({ caida_previa: formData.caida_previa === key ? null : key });
  };

  const seleccionarComorbilidades = (key: Comorbilidades) => {
    handleChange({ comorbilidades: formData.comorbilidades === key ? null : key });
  };

  const seleccionarAyuda = (key: AyudaDeambular) => {
    handleChange({ ayuda_deambular: formData.ayuda_deambular === key ? null : key });
  };

  const seleccionarVenoclisis = (key: Venoclisis) => {
    handleChange({ venoclisis: formData.venoclisis === key ? null : key });
  };

  const seleccionarMarcha = (key: Marcha) => {
    handleChange({ marcha: formData.marcha === key ? null : key });
  };

  const seleccionarEstadoMental = (key: EstadoMental) => {
    handleChange({ estado_mental: formData.estado_mental === key ? null : key });
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
                ESCALA DE RIESGO DE CAÍDA DE MORSE
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={{
                ...cellBase, textAlign: "center", fontWeight: 700,
                fontSize: "11px", background: "#2c5282", color: "#fff", padding: "6px"
              }}>
                DE 13 A 18 AÑOS Y ADULTOS
              </td>
            </tr>

            {/* ── CABECERA COLUMNAS ── */}
            <tr>
              <th style={{ ...thStyle, width: 180, padding: "8px" }}>VARIABLES</th>
              <th style={{ ...thStyle, padding: "8px" }}>DESCRIPCIÓN</th>
              <th style={{ ...thStyle, width: 80, padding: "8px" }}>PUNTAJE</th>
            </tr>

            {/* ══════════════ 1. CAÍDA PREVIA ═════════════════════════════════ */}
            <tr>
              <td rowSpan={2} style={tdVar}>1. CAÍDA PREVIA</td>
              <td style={tdDesc}>No</td>
              <td style={tdPuntaje(formData.caida_previa === "no", !!isReadOnly)}
                onClick={() => seleccionarCaida("no")}
                title="Seleccionar: No (0 pts)">0</td>
            </tr>
            <tr>
              <td style={tdDesc}>Si</td>
              <td style={tdPuntaje(formData.caida_previa === "si", !!isReadOnly)}
                onClick={() => seleccionarCaida("si")}
                title="Seleccionar: Si (25 pts)">25</td>
            </tr>

            {/* ══════════════ 2. COMORBILIDADES ════════════════════════════════ */}
            <tr>
              <td rowSpan={2} style={tdVar}>2. COMORBILIDADES</td>
              <td style={tdDesc}>No</td>
              <td style={tdPuntaje(formData.comorbilidades === "no", !!isReadOnly)}
                onClick={() => seleccionarComorbilidades("no")}
                title="Seleccionar: No (0 pts)">0</td>
            </tr>
            <tr>
              <td style={tdDesc}>Si</td>
              <td style={tdPuntaje(formData.comorbilidades === "si", !!isReadOnly)}
                onClick={() => seleccionarComorbilidades("si")}
                title="Seleccionar: Si (15 pts)">15</td>
            </tr>

            {/* ══════════════ 3. AYUDA PARA DEAMBULAR ═══════════════════════════ */}
            {AYUDA_DEAMBULAR_OPTS.map((opt, i) => (
              <tr key={opt.key}>
                {i === 0 && (
                  <td rowSpan={3} style={tdVar}>3. AYUDA PARA DEAMBULAR</td>
                )}
                <td style={tdDesc}>{opt.label}</td>
                <td
                  style={tdPuntaje(formData.ayuda_deambular === opt.key, !!isReadOnly)}
                  onClick={() => seleccionarAyuda(opt.key)}
                  title={`Seleccionar: ${opt.label} (${opt.puntaje} pts)`}
                >
                  {opt.puntaje}
                </td>
              </tr>
            ))}

            {/* ══════════════ 4. VENOCLISIS ════════════════════════════════════ */}
            <tr>
              <td rowSpan={2} style={tdVar}>4. VENOCLISIS</td>
              <td style={tdDesc}>No</td>
              <td style={tdPuntaje(formData.venoclisis === "no", !!isReadOnly)}
                onClick={() => seleccionarVenoclisis("no")}
                title="Seleccionar: No (0 pts)">0</td>
            </tr>
            <tr>
              <td style={tdDesc}>Si</td>
              <td style={tdPuntaje(formData.venoclisis === "si", !!isReadOnly)}
                onClick={() => seleccionarVenoclisis("si")}
                title="Seleccionar: Si (20 pts)">20</td>
            </tr>

            {/* ══════════════ 5. MARCHA ════════════════════════════════════════ */}
            {MARCHA_OPTS.map((opt, i) => (
              <tr key={opt.key}>
                {i === 0 && (
                  <td rowSpan={3} style={tdVar}>5. MARCHA</td>
                )}
                <td style={tdDesc}>{opt.label}</td>
                <td
                  style={tdPuntaje(formData.marcha === opt.key, !!isReadOnly)}
                  onClick={() => seleccionarMarcha(opt.key)}
                  title={`Seleccionar: ${opt.label} (${opt.puntaje} pts)`}
                >
                  {opt.puntaje}
                </td>
              </tr>
            ))}

            {/* ══════════════ 6. ESTADO MENTAL ═════════════════════════════════ */}
            {ESTADO_MENTAL_OPTS.map((opt, i) => (
              <tr key={opt.key}>
                {i === 0 && (
                  <td rowSpan={2} style={tdVar}>6. ESTADO MENTAL</td>
                )}
                <td style={tdDesc}>{opt.label}</td>
                <td
                  style={tdPuntaje(formData.estado_mental === opt.key, !!isReadOnly)}
                  onClick={() => seleccionarEstadoMental(opt.key)}
                  title={`Seleccionar: ${opt.label} (${opt.puntaje} pts)`}
                >
                  {opt.puntaje}
                </td>
              </tr>
            ))}

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
              <td style={{ ...cellBase, textAlign: "center" }}>0 a 24</td>
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
              <td style={{ ...cellBase, textAlign: "center" }}>25 a 50</td>
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
              <td style={{ ...cellBase, textAlign: "center" }}>mayor a 50</td>
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

        {isReadOnly && (
          <div style={{ marginTop: 16, padding: 12, background: "#e6f2ff", color: "#004085", border: "1px solid #b8daff", borderRadius: 8, fontSize: "12px", textAlign: "center" }}>
            Estás viendo esta escala en modo solo lectura.
          </div>
        )}

      </div>
    </div>
  );
});

EscalaMorseForm.displayName = "EscalaMorseForm";

export default EscalaMorseForm;
