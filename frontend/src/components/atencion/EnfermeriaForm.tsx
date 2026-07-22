"use client";

import React, { useState, useImperativeHandle, forwardRef } from "react";
import { useFormAutosaveAndWarn } from "@/hooks/useFormAutosaveAndWarn";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoNota = "NOTA POSTQUIRURGICA" | "NOTA DE LA MAÑANA" | "NOTA DE LA TARDE" | "NOTA DE LA NOCHE";
export const TIPOS: TipoNota[] = ["NOTA POSTQUIRURGICA", "NOTA DE LA MAÑANA", "NOTA DE LA TARDE", "NOTA DE LA NOCHE"];

export interface BloqueEnfermeria {
  id: string; // Útil para las keys de React
  nota_evolucion: TipoNota | string;
  nota_fecha: string;
  nota_hora: string;
  nota_descripcion: string;
}

export interface EnfermeriaData {
  nombres_completos: string;
  dni: string;
  habitacion: string;
  fecha: string;
  hora: string;
  nota_s: string;
  nota_o: string;
  nota_a: string;
  nota_p: string;
  nota_i: string;
  nota_e: string;
  bloques: BloqueEnfermeria[];
}

export const DEFAULT_ENFERMERIA_DATA: EnfermeriaData = {
  nombres_completos: '',
  dni: '',
  habitacion: '',
  fecha: '',
  hora: '',
  nota_s: '',
  nota_o: '',
  nota_a: '',
  nota_p: '',
  nota_i: '',
  nota_e: '',
  bloques: [] // Empezamos sin notas adicionales, el usuario las crea
};

interface Props {
  paciente?: any;
  initialData?: Partial<EnfermeriaData>;
  isReadOnly?: boolean;
}

export interface EnfermeriaFormRef {
  getData: () => EnfermeriaData;
  clearAutosave: () => void;
  isDirty: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function bloqueVacio(tipo: TipoNota = "NOTA DE LA MAÑANA"): BloqueEnfermeria {
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);
  return { 
    id: uid(), 
    nota_evolucion: tipo, 
    nota_fecha: today, 
    nota_hora: nowTime, 
    nota_descripcion: "" 
  };
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const border = "1px solid #000";

const tdFecha: React.CSSProperties = { border, padding: 0, verticalAlign: "top", width: 70 };
const tdHora: React.CSSProperties = { border, padding: 0, verticalAlign: "top", width: 60 };
const tdLetra: React.CSSProperties = {
  border, background: "#dce6f1", fontWeight: 900, fontSize: "14px",
  fontFamily: "Arial, sans-serif", textAlign: "center", verticalAlign: "middle",
  width: 24, color: "#1a3a5c",
};
const tdContenido: React.CSSProperties = { border, padding: 0, verticalAlign: "top" };
const tdLabel: React.CSSProperties = {
  border, background: "#eef3f9", fontWeight: 700, fontSize: "9px",
  fontFamily: "Arial, sans-serif", padding: "2px 4px",
  verticalAlign: "middle", color: "#1a3a5c",
};

const secTitleStyle = (tipo: string): React.CSSProperties => ({
  background: tipo === "NOTA POSTQUIRURGICA"
    ? "#e2e3e5"
    : tipo === "NOTA DE LA MAÑANA"
    ? "#fff3cd"
    : tipo === "NOTA DE LA TARDE"
    ? "#d4edda"
    : "#cfe2ff",
  fontWeight: 700, fontSize: "11px", fontFamily: "Arial, sans-serif",
  padding: "5px 10px", border, letterSpacing: "0.04em",
  color: "#1a3a5c",
});

const ingresoTitleStyle: React.CSSProperties = {
  background: "#dce6f1", fontWeight: 700, fontSize: "11px",
  fontFamily: "Arial, sans-serif", padding: "5px 10px",
  border, letterSpacing: "0.04em", color: "#1a3a5c",
};

const autoResize = (el: HTMLTextAreaElement, minHeight: number) => {
  el.style.height = "auto";
  el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
};

function soapArea(value: string, onChange: (v: string) => void, rows = 7, readOnly = false): React.ReactElement {
  const minHeight = 120;
  return (
    <textarea 
      value={value || ''} 
      onChange={(e) => {
        onChange(e.target.value);
        autoResize(e.target, minHeight);
      }} 
      ref={(el) => { if (el) autoResize(el, minHeight); }}
      rows={rows}
      readOnly={readOnly}
      style={{
        width: "100%", border: "none", outline: "none", resize: "none", overflow: "hidden",
        fontSize: "10px", fontFamily: "Arial, sans-serif",
        padding: "4px 6px", boxSizing: "border-box",
        lineHeight: 1.5, background: readOnly ? "#f0f0f0" : "#fff", minHeight: `${minHeight}px`
      }} 
    />
  );
}

function dateIn(value: string, onChange: (v: string) => void, readOnly = false): React.ReactElement {
  return (
    <input 
      type="date" 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      style={{
        width: "100%", border: "none", outline: "none", fontSize: "9px",
        padding: "2px 3px", fontFamily: "Arial, sans-serif",
        background: "transparent", boxSizing: "border-box", pointerEvents: readOnly ? 'none' : 'auto'
      }} 
    />
  );
}

function timeIn(value: string, onChange: (v: string) => void, readOnly = false): React.ReactElement {
  return (
    <input 
      type="time" 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      style={{
        width: "100%", border: "none", outline: "none", fontSize: "9px",
        padding: "2px 3px", fontFamily: "Arial, sans-serif",
        background: "transparent", boxSizing: "border-box", pointerEvents: readOnly ? 'none' : 'auto'
      }} 
    />
  );
}

function txtIn(value: string, onChange: (v: string) => void, readOnly = false, placeholder = ""): React.ReactElement {
  return (
    <input 
      type="text" 
      value={value || ''} 
      readOnly={readOnly} 
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%", border: "none", outline: "none",
        background: readOnly ? "#f0f0f0" : "#fff",
        fontSize: "10px", fontFamily: "Arial, sans-serif",
        padding: "3px 5px", color: "#000", boxSizing: "border-box",
      }} 
    />
  );
}

function btnStyle(bg: string, small = false): React.CSSProperties {
  return {
    background: bg, color: "#fff", border: "none", borderRadius: 4,
    padding: small ? "4px 10px" : "6px 14px",
    fontSize: small ? "10px" : "11px",
    fontWeight: 700, cursor: "pointer", fontFamily: "Arial, sans-serif",
  };
}

// ─── Bloque SOAP — solo para NOTA DE INGRESO ─────────────────────────────────

interface SoapBlockProps {
  fecha: string; onFecha: (v: string) => void;
  hora: string;  onHora:  (v: string) => void;
  nota_s: string; onS: (v: string) => void;
  nota_o: string; onO: (v: string) => void;
  nota_a: string; onA: (v: string) => void;
  nota_p: string; onP: (v: string) => void;
  nota_i: string; onI: (v: string) => void;
  nota_e: string; onE: (v: string) => void;
  titulo: React.ReactNode;
  isReadOnly?: boolean;
}

function SoapBlock({ fecha, onFecha, hora, onHora, nota_s, onS, nota_o, onO, nota_a, onA, nota_p, onP, nota_i, onI, nota_e, onE, titulo, isReadOnly = false }: SoapBlockProps) {
  const tbl: React.CSSProperties = {
    width: "100%", borderCollapse: "collapse",
    tableLayout: "fixed", fontFamily: "Arial, sans-serif", fontSize: "10px",
  };

  return (
    <table style={tbl}>
      <colgroup>
        <col style={{ width: 70 }} />
        <col style={{ width: 60 }} />
        <col style={{ width: 24 }} />
        <col />
      </colgroup>
      <tbody>
        <tr>
          <td colSpan={4} style={{ padding: 0 }}>{titulo}</td>
        </tr>
        <tr>
          <td style={tdLabel}>FECHA</td>
          <td style={tdLabel}>HORA</td>
          <td style={{ ...tdLabel, background: "#dce6f1" }}></td>
          <td style={tdLabel}></td>
        </tr>
        <tr>
          <td rowSpan={6} style={{ ...tdFecha, verticalAlign: "top", paddingTop: 2 }}>
            {dateIn(fecha, onFecha, isReadOnly)}
          </td>
          <td rowSpan={6} style={{ ...tdHora, verticalAlign: "top", paddingTop: 2 }}>
            {timeIn(hora, onHora, isReadOnly)}
          </td>
          <td style={tdLetra}>S</td>
          <td style={tdContenido}>{soapArea(nota_s, onS, 4, isReadOnly)}</td>
        </tr>
        <tr>
          <td style={tdLetra}>O</td>
          <td style={tdContenido}>{soapArea(nota_o, onO, 4, isReadOnly)}</td>
        </tr>
        <tr>
          <td style={{ ...tdLetra, verticalAlign: "middle" }}>A</td>
          <td style={tdContenido}>{soapArea(nota_a, onA, 4, isReadOnly)}</td>
        </tr>
        <tr>
          <td style={{ ...tdLetra, verticalAlign: "middle" }}>P</td>
          <td style={tdContenido}>{soapArea(nota_p, onP, 4, isReadOnly)}</td>
        </tr>
        <tr>
          <td style={{ ...tdLetra, verticalAlign: "middle" }}>I</td>
          <td style={tdContenido}>{soapArea(nota_i, onI, 4, isReadOnly)}</td>
        </tr>
        <tr>
          <td style={{ ...tdLetra, verticalAlign: "middle" }}>E</td>
          <td style={tdContenido}>{soapArea(nota_e, onE, 4, isReadOnly)}</td>
        </tr>
      </tbody>
    </table>
  );
}

// ─── Bloque compacto — para notas adicionales (sin letras SOAP) ───────────────

interface CompactBlockProps {
  b: BloqueEnfermeria;
  onFecha: (v: string) => void;
  onHora:  (v: string) => void;
  onContenido: (v: string) => void;
  onTipo: (v: string) => void;
  onEliminar: () => void;
  isReadOnly?: boolean;
}

function CompactBlock({ b, onFecha, onHora, onContenido, onTipo, onEliminar, isReadOnly = false }: CompactBlockProps) {
  const tbl: React.CSSProperties = {
    width: "100%", borderCollapse: "collapse",
    tableLayout: "fixed", fontFamily: "Arial, sans-serif", fontSize: "10px",
  };


  return (
    <table style={tbl}>
      <colgroup>
        <col style={{ width: 70 }} />
        <col style={{ width: 60 }} />
        <col style={{ width: 24 }} />
        <col />
      </colgroup>
      <tbody>
        <tr>
          <td colSpan={4} style={{ padding: 0 }}>
            <div style={secTitleStyle(b.nota_evolucion)}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <select 
                    value={b.nota_evolucion} 
                    onChange={(e) => onTipo(e.target.value)}
                    disabled={isReadOnly}
                    style={{
                      border: "1px solid #ccc", borderRadius: 3, fontSize: "10px",
                      padding: "1px 6px", fontFamily: "Arial, sans-serif",
                      background: "transparent", cursor: isReadOnly ? "default" : "pointer", fontWeight: 700,
                      color: "#1a3a5c",
                    }}>
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {!isReadOnly && (
                  <button onClick={onEliminar}
                    style={{
                      background: "#dc3545", color: "#fff", border: "none",
                      borderRadius: 3, padding: "2px 8px", fontSize: "9px",
                      cursor: "pointer", fontFamily: "Arial, sans-serif", fontWeight: 700,
                    }}>
                    ✕ Eliminar
                  </button>
                )}
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td style={tdLabel}>FECHA</td>
          <td style={tdLabel}>HORA</td>
          <td style={{ ...tdLabel, background: "#dce6f1" }}></td>
          <td style={tdLabel}></td>
        </tr>
        <tr>
          <td rowSpan={6} style={{ ...tdFecha, verticalAlign: "top", paddingTop: 2 }}>
            {dateIn(b.nota_fecha, onFecha, isReadOnly)}
          </td>
          <td rowSpan={6} style={{ ...tdHora, verticalAlign: "top", paddingTop: 2 }}>
            {timeIn(b.nota_hora, onHora, isReadOnly)}
          </td>
          <td rowSpan={6} style={{ border, background: "#dce6f1" }}></td>
          <td rowSpan={6} style={{ border, padding: 0, verticalAlign: "top" }}>
            <textarea
              value={b.nota_descripcion}
              onChange={(e) => {
                onContenido(e.target.value);
                autoResize(e.target, 120);
              }}
              ref={(el) => { if (el) autoResize(el, 120); }}
              readOnly={isReadOnly}
              rows={7}
              placeholder={isReadOnly ? "" : "Escriba la nota de enfermería..."}
              style={{
                width: "100%", border: "none", outline: "none", resize: "none", overflow: "hidden",
                fontSize: "10px", fontFamily: "Arial, sans-serif",
                padding: "4px 6px", boxSizing: "border-box",
                lineHeight: 1.6, background: isReadOnly ? "#f0f0f0" : "#fff", minHeight: 120,
              }} 
            />
          </td>
        </tr>
        <tr /><tr /><tr /><tr /><tr />
      </tbody>
    </table>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

const MAX_BLOQUES = 12;

const EnfermeriaForm = forwardRef<EnfermeriaFormRef, Props>(({ paciente, initialData, isReadOnly }, ref) => {
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [formData, setFormData] = useState<EnfermeriaData>(() => {
    // Si no hay datos, inicializamos con los valores por defecto y las fechas de hoy
    const data = { ...DEFAULT_ENFERMERIA_DATA, ...initialData };
    
    if (!data.bloques) {
      data.bloques = [];
    }

    // Si es un registro nuevo, poblar nombre completo, dni, fecha y hora
    if (!initialData?.fecha) data.fecha = today;
    if (!initialData?.hora) data.hora = nowTime;
    
    if (paciente) {
      data.nombres_completos = [
        paciente.primerNombre,
        paciente.segundoNombre,
        paciente.primerApellido,
        paciente.segundoApellido
      ].filter(Boolean).join(" ").toUpperCase();
      data.dni = paciente.cedula || '';
    }
    
    // Asegurarse de que los bloques tengan IDs únicos para renderizado
    if (data.bloques && data.bloques.length > 0) {
      data.bloques = data.bloques.map(b => ({ ...b, id: b.id || uid() }));
    }

    return data;
  });

  const { isDirty, clearAutosave } = useFormAutosaveAndWarn({
    formId: `enfermeria_${paciente?.cedula || 'new'}`,
    initialData: DEFAULT_ENFERMERIA_DATA,
    currentData: formData,
    onRestore: (saved) => {
      const savedData = saved as EnfermeriaData;
      if (!savedData.bloques) {
        savedData.bloques = [];
      } else {
        savedData.bloques = savedData.bloques.map(b => ({ ...b, id: b.id || uid() }));
      }
      setFormData(savedData);
    },
  });

  React.useEffect(() => {
    if (paciente) {
      setFormData(prev => {
        const nombresCompletos = [
          paciente.primerNombre,
          paciente.segundoNombre,
          paciente.primerApellido,
          paciente.segundoApellido
        ].filter(Boolean).join(" ").toUpperCase();
        
        const dni = paciente.cedula || '';

        if (prev.nombres_completos === nombresCompletos && prev.dni === dni) {
          return prev;
        }

        return {
          ...prev,
          nombres_completos: prev.nombres_completos || nombresCompletos,
          dni: prev.dni || dni
        };
      });
    }
  }, [paciente]);

  useImperativeHandle(ref, () => ({
    getData: () => formData,
    clearAutosave,
    isDirty,
  }));

  const s = (k: keyof EnfermeriaData) => (v: string) => setFormData(p => ({ ...p, [k]: v }));

  const agregarBloque = (tipo: TipoNota) => {
    if ((formData.bloques || []).length >= MAX_BLOQUES) return;
    setFormData(p => ({ ...p, bloques: [...(p.bloques || []), bloqueVacio(tipo)] }));
  };

  const eliminarBloque = (id: string) =>
    setFormData(p => ({ ...p, bloques: (p.bloques || []).filter(b => b.id !== id) }));

  const setBloque = (id: string, campo: keyof BloqueEnfermeria, val: string) =>
    setFormData(p => ({
      ...p,
      bloques: (p.bloques || []).map(b => b.id === id ? { ...b, [campo]: val } : b),
    }));

  return (
    <div style={{ display: "flex", flexDirection: "column" }} className={isReadOnly ? 'opacity-90 pointer-events-none' : ''}>
      <div style={{
        background: "#fff", border: "1px solid #c8d8e8",
        margin: "0 auto", borderRadius: 6,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        overflow: "hidden", minWidth: 600, maxWidth: 900, width: "100%"
      }}>

        {/* ══ ENCABEZADO ══════════════════════════════════════════════════════ */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "12px 20px 10px", borderBottom: "2px solid #1a3a5c",
          background: "#f8fafd",
        }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a3a5c", fontFamily: "Arial, sans-serif" }}>
              NUEVO HOSPITAL PANAMERICANO
            </div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "#2c5282", fontFamily: "Arial, sans-serif" }}>
              CENTRO MÉDICO DE ESPECIALIDADES
            </div>
          </div>
        </div>

        <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 0 }}>

          {/* ══ DATOS DEL PACIENTE ════════════════════════════════════════════ */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 0 }}>
            <tbody>
              <tr>
                <td style={{ ...tdLabel, width: 90 }}>PACIENTE:</td>
                <td style={{ border, padding: 0 }} colSpan={3}>
                  {txtIn(formData.nombres_completos, s("nombres_completos"), isReadOnly, "Apellidos y nombres completos")}
                </td>
              </tr>
              <tr>
                <td style={tdLabel}>CÉDULA:</td>
                <td style={{ border, padding: 0, width: 160 }}>
                  {txtIn(formData.dni, s("dni"), isReadOnly, "0000000000")}
                </td>
                <td style={{ ...tdLabel, width: 110 }}>HABITACIÓN: #</td>
                <td style={{ border, padding: 0, width: 100 }}>
                  {txtIn(formData.habitacion, s("habitacion"), isReadOnly, "Nro.")}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ══ BLOQUE FIJO — NOTA DE EVOLUCIÓN DE INGRESO ═══════════════════ */}
          <div style={{ marginTop: 10 }}>
            <SoapBlock
              fecha={formData.fecha}      onFecha={s("fecha")}
              hora={formData.hora}        onHora={s("hora")}
              nota_s={formData.nota_s}    onS={s("nota_s")}
              nota_o={formData.nota_o}    onO={s("nota_o")}
              nota_a={formData.nota_a}    onA={s("nota_a")}
              nota_p={formData.nota_p}    onP={s("nota_p")}
              nota_i={formData.nota_i}    onI={s("nota_i")}
              nota_e={formData.nota_e}    onE={s("nota_e")}
              isReadOnly={isReadOnly}
              titulo={
                <div style={ingresoTitleStyle}>
                  NOTA DE EVOLUCIÓN DE INGRESO
                </div>
              }
            />
          </div>

          {/* ══ BLOQUES ADICIONALES ═══════════════════════════════════════════ */}
          {(formData.bloques || []).map((b) => (
            <div key={b.id} style={{ marginTop: 10 }}>
              <CompactBlock
                b={b}
                onFecha={(v) => setBloque(b.id, "nota_fecha", v)}
                onHora={(v) => setBloque(b.id, "nota_hora", v)}
                onContenido={(v) => setBloque(b.id, "nota_descripcion", v)}
                onTipo={(v) => setBloque(b.id, "nota_evolucion", v)}
                onEliminar={() => eliminarBloque(b.id)}
                isReadOnly={isReadOnly}
              />
            </div>
          ))}

          {/* ══ BOTONES AGREGAR BLOQUE ════════════════════════════════════════ */}
          {!isReadOnly && (
            <div style={{
              marginTop: 14, padding: "10px 0",
              borderTop: "1px dashed #c8d8e8",
              display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
            }}>
              <span style={{ fontSize: "9px", fontWeight: 700, color: "#555", fontFamily: "Arial, sans-serif" }}>
                + Agregar nota:
              </span>
              {TIPOS.map(tipo => (
                <button key={tipo}
                  onClick={() => agregarBloque(tipo)}
                  disabled={(formData.bloques || []).length >= MAX_BLOQUES}
                  style={{
                    ...btnStyle(
                      tipo === "NOTA POSTQUIRURGICA" ? "#6c757d"
                      : tipo === "NOTA DE LA MAÑANA" ? "#856404"
                      : tipo === "NOTA DE LA TARDE" ? "#155724"
                      : "#084298",
                      true
                    ),
                    opacity: (formData.bloques || []).length >= MAX_BLOQUES ? 0.4 : 1,
                  }}>
                  {tipo === "NOTA POSTQUIRURGICA" ? "⚕️" : tipo === "NOTA DE LA MAÑANA" ? "🌅" : tipo === "NOTA DE LA TARDE" ? "☀️" : "🌙"} {tipo}
                </button>
              ))}
              {(formData.bloques || []).length > 0 && (
                <span style={{ fontSize: "9px", color: "#888", fontFamily: "Arial, sans-serif", marginLeft: 6 }}>
                  ({(formData.bloques || []).length}/{MAX_BLOQUES} notas adicionales)
                </span>
              )}
            </div>
          )}

        </div>

        {/* Pie */}
        <div style={{
          borderTop: "1px solid #dde8f0", background: "#f8fafd",
          padding: "5px 20px", display: "flex", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: "8px", color: "#aab8c8", fontFamily: "Arial, sans-serif" }}>
            Nuevo Hospital Panamericano — Notas de Enfermería
          </span>
          <span style={{ fontSize: "8px", color: "#aab8c8", fontFamily: "Arial, sans-serif" }}>
            {formData.fecha}
          </span>
        </div>
      </div>
    </div>
  );
});

EnfermeriaForm.displayName = "EnfermeriaForm";
export default EnfermeriaForm;
