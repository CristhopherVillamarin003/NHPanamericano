"use client";

import React, { useState, useImperativeHandle } from "react";
import { useFormAutosaveAndWarn } from "@/hooks/useFormAutosaveAndWarn";
import { MedicoInput } from "./MedicoInput";
import type { Medico } from "@/lib/services/medicos";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DatosCertificado {
  // Fecha del certificado
  fecha_certificado: string;        // "QUITO, 24 DE MAYO DEL 2026"
  fecha_certificado_raw: string;    // date input para generar la parte de fecha
  fecha_certificado_ciudad: string; // ciudad editable (ej: "QUITO")

  // Datos del paciente — P[03]
  nombre_paciente: string;
  cedula_paciente: string;

  // Reposo — P[05], P[06], P[07]
  dias_reposo_num: string;          // número ingresado por el usuario
  dias_reposo_letras: string;       // generado automáticamente: "10 (DIEZ)"
  desde_fecha_raw: string;          // date input
  desde_fecha_letras: string;       // generado automáticamente
  hasta_fecha_raw: string;          // date input
  hasta_fecha_letras: string;       // generado automáticamente

  // Tabla clínica
  casa_de_salud: string;
  fecha_ingreso: string;            // generado automáticamente en letras
  fecha_ingreso_raw: string;        // date input
  fecha_procedimiento: string;      // generado automáticamente en letras
  fecha_procedimiento_raw: string;  // date input
  fecha_alta: string;               // generado automáticamente en letras
  fecha_alta_raw: string;           // date input
  numero_historia: string;
  servicio: string;
  procedimiento: string;
  diagnostico: string;
  codigo_cie10: string;
  cuadro_clinico: string;
  tipo_contingencia: string;
  direccion_paciente: string;
  telefono_paciente: string;
  institucion_empresa: string;
  ocupacion: string;

  // Datos del doctor — modificables
  nombre_doctor: string;
  especialidad_doctor: string;
  ci_doctor: string;
  correo_doctor: string;
}

interface Props {
  paciente?: {
    // camelCase (desde el tipo Paciente de la app)
    primerNombre?: string;
    segundoNombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    // snake_case (compatibilidad legacy)
    primer_nombre?: string;
    segundo_nombre?: string;
    primer_apellido?: string;
    segundo_apellido?: string;
    cedula?: string;
    numeroHistoriaClinica?: string;
    numero_historia_clinica?: string;
    edad?: number;
    direccion?: string;
    telefono?: string;
  };
  medico?: {
    nombre?: string;
    especialidad?: string;
    cedula?: string;
    correo?: string;
    registro?: string;
  };
  initialData?: Partial<DatosCertificado>;
  onGuardar?: (datos: DatosCertificado) => void;
  onExportarDocx?: (datos: DatosCertificado) => void;
  guardando?: boolean;
  exportando?: boolean;
  atencionId?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MESES = [
  "ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO",
  "JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE",
];

// Convierte un número entero (0–9999) a palabras en español (mayúsculas)
function numeroALetras(n: number): string {
  if (n === 0) return "CERO";
  const unidades = ["","UNO","DOS","TRES","CUATRO","CINCO","SEIS","SIETE","OCHO","NUEVE",
    "DIEZ","ONCE","DOCE","TRECE","CATORCE","QUINCE","DIECISÉIS","DIECISIETE","DIECIOCHO","DIECINUEVE",
    "VEINTE","VEINTIUNO","VEINTIDÓS","VEINTITRÉS","VEINTICUATRO","VEINTICINCO","VEINTISÉIS","VEINTISIETE","VEINTIOCHO","VEINTINUEVE"];
  const decenas = ["","","VEINTE","TREINTA","CUARENTA","CINCUENTA","SESENTA","SETENTA","OCHENTA","NOVENTA"];
  const centenas = ["","CIEN","DOSCIENTOS","TRESCIENTOS","CUATROCIENTOS","QUINIENTOS","SEISCIENTOS","SETECIENTOS","OCHOCIENTOS","NOVECIENTOS"];

  if (n < 30) return unidades[n];
  if (n < 100) {
    const d = Math.floor(n / 10);
    const u = n % 10;
    return u === 0 ? decenas[d] : `${decenas[d]} Y ${unidades[u]}`;
  }
  if (n === 100) return "CIEN";
  if (n < 1000) {
    const c = Math.floor(n / 100);
    const resto = n % 100;
    const prefC = c === 1 ? "CIENTO" : centenas[c];
    return resto === 0 ? prefC : `${prefC} ${numeroALetras(resto)}`;
  }
  if (n < 2000) {
    const resto = n % 1000;
    return resto === 0 ? "MIL" : `MIL ${numeroALetras(resto)}`;
  }
  if (n < 10000) {
    const miles = Math.floor(n / 1000);
    const resto = n % 1000;
    return resto === 0 ? `${numeroALetras(miles)} MIL` : `${numeroALetras(miles)} MIL ${numeroALetras(resto)}`;
  }
  return String(n);
}

// Genera "VEINTE Y TRES DE MAYO DEL DOS MIL VEINTE Y SEIS (23/05/2026)"
function fechaCompletaConLetras(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const dia = parseInt(d, 10);
  const mes = parseInt(m, 10);
  const anio = parseInt(y, 10);
  const diaLetras = numeroALetras(dia);
  const mesNombre = MESES[mes - 1];
  const anioLetras = numeroALetras(anio);
  const fechaCorta = `${String(dia).padStart(2,"0")}/${String(mes).padStart(2,"0")}/${y}`;
  return `${diaLetras} DE ${mesNombre} DEL ${anioLetras} (${fechaCorta})`;
}

// Genera "10 (DIEZ)" a partir de un número ingresado como string
function reposoConLetras(numStr: string): string {
  const n = parseInt(numStr, 10);
  if (isNaN(n) || numStr.trim() === "") return numStr;
  return `${n} (${numeroALetras(n)})`;
}

// Genera la parte de fecha para el certificado: "13 DE MAYO DEL 2026"
function fechaParaCertificado(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${parseInt(d, 10)} DE ${MESES[parseInt(m, 10) - 1]} DEL ${y}`;
}

// Construye el texto completo del certificado: "QUITO, 13 DE MAYO DEL 2026"
function buildFechaCertificado(ciudad: string, iso: string): string {
  const fechaParte = fechaParaCertificado(iso);
  if (!fechaParte) return ciudad ? ciudad.toUpperCase() : "";
  return `${ciudad.toUpperCase()}, ${fechaParte}`;
}

function nombreCompleto(p?: Props["paciente"]): string {
  if (!p) return "";
  const apellido1 = p.primerApellido  ?? p.primer_apellido  ?? "";
  const apellido2 = p.segundoApellido ?? p.segundo_apellido ?? "";
  const nombre1   = p.primerNombre    ?? p.primer_nombre    ?? "";
  const nombre2   = p.segundoNombre   ?? p.segundo_nombre   ?? "";
  return [apellido1, apellido2, nombre1, nombre2]
    .filter(Boolean).join(" ").toUpperCase();
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function FieldInline({ label, value, onChange, readOnly = false, placeholder = "", width }: {
  label: string; value: string; onChange?: (v: string) => void;
  readOnly?: boolean; placeholder?: string; width?: string;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 4, width }}>
      {label && (
        <span style={{ fontSize: "10px", fontFamily: "'Georgia', serif", whiteSpace: "nowrap" }}>
          {label}
        </span>
      )}
      <span style={{
        display: "inline-block", borderBottom: "1px solid #555",
        flex: 1, minWidth: 60,
      }}>
        <input type="text" value={value} readOnly={readOnly} placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          style={{
            width: "100%", border: "none", outline: "none",
            background: "transparent", fontSize: "10px",
            fontFamily: "'Georgia', serif", padding: "0 2px",
            color: "#000", boxSizing: "border-box",
          }} />
      </span>
    </span>
  );
}

function TableField({ label, value, onChange, readOnly = false, placeholder = "", multiline = false }: {
  label: string; value: string; onChange?: (v: string) => void;
  readOnly?: boolean; placeholder?: string; multiline?: boolean;
}) {
  return (
    <tr>
      <td style={{
        border: "1px solid #999", padding: "4px 8px",
        background: "#f0f4f8", whiteSpace: "nowrap", verticalAlign: "top",
        fontWeight: 700, fontSize: "9px", fontFamily: "Arial, sans-serif",
        color: "#1a3a5c", width: 200,
      }}>
        {label}
      </td>
      <td style={{ border: "1px solid #999", padding: "2px 4px", verticalAlign: "top" }}>
        {multiline ? (
          <textarea value={value} readOnly={readOnly} placeholder={placeholder}
            onChange={(e) => onChange?.(e.target.value)}
            rows={3}
            style={{
              width: "100%", border: "none", outline: "none", resize: "vertical",
              fontSize: "10px", fontFamily: "'Georgia', serif", padding: "2px 4px",
              background: readOnly ? "#f9f9f9" : "#fff", boxSizing: "border-box",
            }} />
        ) : (
          <input type="text" value={value} readOnly={readOnly} placeholder={placeholder}
            onChange={(e) => onChange?.(e.target.value)}
            style={{
              width: "100%", border: "none", outline: "none",
              fontSize: "10px", fontFamily: "'Georgia', serif", padding: "3px 4px",
              background: readOnly ? "#f9f9f9" : "#fff", boxSizing: "border-box",
            }} />
        )}
      </td>
    </tr>
  );
}

function DoctorField({ label, value, onChange, onSelectMedico }: {
  label: string; value: string; onChange: (v: string) => void;
  onSelectMedico?: (m: Medico) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
      {label && (
        <span style={{ fontSize: "9px", color: "#555", fontFamily: "Arial, sans-serif", whiteSpace: "nowrap" }}>
          {label}
        </span>
      )}
      <MedicoInput value={value} onChangeValue={onChange} onSelectMedico={onSelectMedico || (() => {})}
        style={{
          border: "none", borderBottom: "1px dashed #aaa", outline: "none",
          background: "transparent", fontSize: "10px", fontFamily: "'Georgia', serif",
          fontWeight: 700, color: "#1a3a5c", padding: "1px 3px",
          textAlign: "center", width: "100%", boxSizing: "border-box",
        }} />
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg, color: "#fff", border: "none", borderRadius: 6,
    padding: "6px 14px", fontSize: "11px", fontWeight: 700,
    cursor: "pointer", fontFamily: "Arial, sans-serif",
  };
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export type CertificadoMedicoFormHandle = {
  getDatos: () => DatosCertificado;
  clearAutosave?: () => void;
  isDirty?: () => boolean;
};

const CertificadoMedicoForm = React.forwardRef<CertificadoMedicoFormHandle, Props>(({
  paciente, medico, initialData,
  onGuardar, onExportarDocx,
  guardando = false,
  exportando = false,
  atencionId,
}, ref) => {
  const today = new Date().toISOString().split("T")[0];

  const [d, setD] = useState<DatosCertificado>(() => {
    const base: DatosCertificado = {
      fecha_certificado_raw: today,
      fecha_certificado_ciudad: "QUITO",
      fecha_certificado: buildFechaCertificado("QUITO", today),
      nombre_paciente: nombreCompleto(paciente),
      cedula_paciente: paciente?.cedula ?? "",
      dias_reposo_num: "",
      dias_reposo_letras: "",
      desde_fecha_raw: today,
      desde_fecha_letras: fechaCompletaConLetras(today),
      hasta_fecha_raw: "",
      hasta_fecha_letras: "",
      casa_de_salud: "NUEVO HOSPITAL PANAMERICANO",
      fecha_ingreso_raw: "",
      fecha_ingreso: "",
      fecha_procedimiento_raw: "",
      fecha_procedimiento: "",
      fecha_alta_raw: "",
      fecha_alta: "",
      numero_historia: paciente?.numeroHistoriaClinica ?? paciente?.numero_historia_clinica ?? paciente?.cedula ?? "",
      servicio: "",
      procedimiento: "",
      diagnostico: "",
      codigo_cie10: "",
      cuadro_clinico: "",
      tipo_contingencia: "",
      direccion_paciente: paciente?.direccion ?? "",
      telefono_paciente: paciente?.telefono ?? "",
      institucion_empresa: "",
      ocupacion: "",
      nombre_doctor: medico?.nombre ?? "DR. JOSE SANTIAGO CAMPUZANO TUBAY",
      especialidad_doctor: medico?.especialidad ?? "CIRUGIA GENERAL Y LAPAROSCOPICA",
      ci_doctor: `CI: ${medico?.cedula ?? "1305173237"}`,
      correo_doctor: medico?.correo ?? "nhpanamericano.vlc@gmail.com",
      ...initialData,
    };

    // Recalcular siempre los campos de letras a partir de los _raw,
    // para que datos guardados con formato viejo se muestren correctamente.
    const ciudad = base.fecha_certificado_ciudad || "QUITO";
    base.fecha_certificado = buildFechaCertificado(ciudad, base.fecha_certificado_raw);
    base.desde_fecha_letras = base.desde_fecha_raw ? fechaCompletaConLetras(base.desde_fecha_raw) : "";
    base.hasta_fecha_letras = base.hasta_fecha_raw ? fechaCompletaConLetras(base.hasta_fecha_raw) : "";
    base.fecha_ingreso = base.fecha_ingreso_raw ? fechaCompletaConLetras(base.fecha_ingreso_raw) : "";
    base.fecha_procedimiento = base.fecha_procedimiento_raw ? fechaCompletaConLetras(base.fecha_procedimiento_raw) : "";
    base.fecha_alta = base.fecha_alta_raw ? fechaCompletaConLetras(base.fecha_alta_raw) : "";
    base.dias_reposo_letras = base.dias_reposo_num ? reposoConLetras(base.dias_reposo_num) : "";

    return base;
  });

  const { isDirty, clearAutosave } = useFormAutosaveAndWarn({
    formId: `certificado_${atencionId || 'new'}_${paciente?.cedula || 'new'}`,
    initialData: initialData || {},
    currentData: d,
    onRestore: (saved) => setD(p => ({ ...p, ...saved })),
  });

  useImperativeHandle(ref, () => ({
    getDatos: () => d,
    clearAutosave: () => clearAutosave(),
    isDirty: () => isDirty,
  }), [d, clearAutosave, isDirty]);

  const s = (k: keyof DatosCertificado) => (v: string) => setD(p => ({ ...p, [k]: v }));

  // Fecha del certificado: ciudad editable
  const onCiudad = (v: string) => setD(p => ({
    ...p,
    fecha_certificado_ciudad: v.toUpperCase(),
    fecha_certificado: buildFechaCertificado(v, p.fecha_certificado_raw),
  }));

  // Fecha del certificado: calendario
  const onFechaCert = (v: string) => setD(p => ({
    ...p,
    fecha_certificado_raw: v,
    fecha_certificado: buildFechaCertificado(p.fecha_certificado_ciudad, v),
  }));

  // Desde / Hasta reposo
  const onDesde = (v: string) => setD(p => ({
    ...p, desde_fecha_raw: v, desde_fecha_letras: fechaCompletaConLetras(v),
  }));
  const onHasta = (v: string) => setD(p => ({
    ...p, hasta_fecha_raw: v, hasta_fecha_letras: fechaCompletaConLetras(v),
  }));

  // Fechas de tabla clínica
  const onFechaIngreso = (v: string) => setD(p => ({
    ...p, fecha_ingreso_raw: v, fecha_ingreso: fechaCompletaConLetras(v),
  }));
  const onFechaProcedimiento = (v: string) => setD(p => ({
    ...p, fecha_procedimiento_raw: v, fecha_procedimiento: fechaCompletaConLetras(v),
  }));
  const onFechaAlta = (v: string) => setD(p => ({
    ...p, fecha_alta_raw: v, fecha_alta: fechaCompletaConLetras(v),
  }));

  const docStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #c8d8e8",
    borderRadius: 6,
    boxShadow: "0 2px 14px rgba(0,0,0,0.08)",
    overflow: "hidden",
    width: "100%",
    fontFamily: "'Georgia', serif",
  };

  const bodyPad: React.CSSProperties = { padding: "20px 32px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>

      {/* ── Barra de acciones ──────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 14px", background: "#f5f7fa",
        borderBottom: "1px solid #dde3ea", gap: 8,
      }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#1a3a5c", fontFamily: "Arial, sans-serif" }}>
            CERTIFICADO MÉDICO
          </span>
          <span style={{ fontSize: "10px", color: "#7a8a9a", marginLeft: 10, fontFamily: "Arial, sans-serif" }}>
            Nuevo Hospital Panamericano
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

      {/* ── Documento ─────────────────────────────────────────────────────── */}
      <div style={docStyle}>

        {/* ══ ENCABEZADO ══════════════════════════════════════════════════ */}
        <div style={{
          display: "flex", alignItems: "center",
          padding: "14px 24px 12px",
          borderBottom: "2px solid #1a3a5c",
          background: "#f8fafd", gap: 16,
        }}>
          {/* Logo */}
          <div style={{
            width: 100, height: 64, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img
              src="/logo-receta.png"
              alt="Logo Hospital"
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
          </div>

          {/* Datos hospital centro */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a3a5c", letterSpacing: "0.03em" }}>
              NUEVO HOSPITAL PANAMERICANO
            </div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#2c5282", marginTop: 2 }}>
              CENTRO MÉDICO DE ESPECIALIDADES
            </div>
            <div style={{ fontSize: "8px", color: "#555", marginTop: 5, lineHeight: 1.6 }}>
              DIRECCIÓN: Juan de Arguello Oe2-157 y Pedro de Alfaro (esq.) Junto al Retén de Policía Villa Flora
            </div>
            <div style={{ fontSize: "8px", color: "#555", lineHeight: 1.6 }}>
              Telfs. 2615-687 / 2664-130 &nbsp;|&nbsp; Fax: 2663-661 &nbsp;|&nbsp; nhpanamericanovlc@gmail.com &nbsp;|&nbsp; Quito - Ecuador
            </div>
          </div>
        </div>

        <div style={bodyPad}>

          {/* ══ FECHA DEL CERTIFICADO ══════════════════════════════════════ */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20, gap: 6, alignItems: "center" }}>
            {/* Ciudad editable */}
            <input
              type="text"
              value={d.fecha_certificado_ciudad}
              onChange={(e) => onCiudad(e.target.value)}
              style={{
                border: "none", borderBottom: "1px solid #aaa", outline: "none",
                fontSize: "10px", padding: "1px 4px", color: "#333",
                background: "transparent", fontFamily: "'Georgia', serif",
                width: 70, textAlign: "center", fontStyle: "italic",
              }}
            />
            <span style={{ fontSize: "10px", fontStyle: "italic", color: "#333", fontFamily: "'Georgia', serif" }}>,</span>
            {/* Selector de fecha */}
            <input type="date" value={d.fecha_certificado_raw} onChange={(e) => onFechaCert(e.target.value)}
              style={{
                border: "none", borderBottom: "1px solid #aaa", outline: "none",
                fontSize: "9px", padding: "1px 4px", color: "#666",
                background: "transparent", fontFamily: "Arial, sans-serif",
              }} />
            {/* Fecha generada en letras */}
            <span style={{
              fontSize: "10px", fontStyle: "italic", color: "#333",
              borderBottom: "1px solid #555", padding: "1px 6px", minWidth: 180, textAlign: "center",
              fontFamily: "'Georgia', serif",
            }}>
              {fechaParaCertificado(d.fecha_certificado_raw)}
            </span>
          </div>

          {/* ══ TÍTULO ════════════════════════════════════════════════════ */}
          <div style={{
            textAlign: "center", fontSize: "15px", fontWeight: 700,
            letterSpacing: "0.1em", marginBottom: 20, color: "#1a3a5c",
            fontFamily: "'Georgia', serif",
          }}>
            CERTIFICADO MÉDICO
          </div>

          {/* ══ CUERPO DEL CERTIFICADO ════════════════════════════════════ */}

          {/* P[03] — nombre + cédula */}
          <div style={{
            fontSize: "10px", lineHeight: 2, marginBottom: 14,
            fontFamily: "'Georgia', serif", textAlign: "justify",
          }}>
            <span>Certifico que el paciente&nbsp;</span>
            <FieldInline label="" value={d.nombre_paciente} onChange={s("nombre_paciente")}
              placeholder="NOMBRE COMPLETO DEL PACIENTE" width="260px" />
            <span>&nbsp;portador de la cédula de identidad&nbsp;</span>
            <FieldInline label="" value={d.cedula_paciente} onChange={s("cedula_paciente")}
              placeholder="0000000000" width="130px" />
            <span>, fue atendido en esta casa de salud.</span>
          </div>

          {/* ══ TABLA CLÍNICA ═════════════════════════════════════════════ */}
          <table style={{
            width: "100%", borderCollapse: "collapse",
            marginBottom: 18, fontSize: "10px",
          }}>
            <tbody>
              <TableField label="CASA DE SALUD:"
                value={d.casa_de_salud} onChange={s("casa_de_salud")} />
              <tr>
                <td style={{
                  border: "1px solid #999", padding: "4px 8px",
                  background: "#f0f4f8", verticalAlign: "top",
                  fontWeight: 700, fontSize: "9px", fontFamily: "Arial, sans-serif",
                  color: "#1a3a5c", width: 200,
                }}>
                  <div style={{ height: 30, display: "flex", alignItems: "center" }}>FECHA DE INGRESO:</div>
                  <div style={{ height: 30, display: "flex", alignItems: "center" }}>FECHA DE PROCEDIMIENTO:</div>
                  <div style={{ height: 30, display: "flex", alignItems: "center" }}>FECHA DE ALTA:</div>
                  <div style={{ height: 26, display: "flex", alignItems: "center" }}>NÚMERO DE HISTORIA:</div>
                </td>
                <td style={{ border: "1px solid #999", padding: "0 4px", verticalAlign: "top" }}>
                  {/* Fecha de ingreso */}
                  <div style={{ minHeight: 30, display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid #f0f0f0", padding: "2px 0" }}>
                    <input type="date" value={d.fecha_ingreso_raw} onChange={(e) => onFechaIngreso(e.target.value)}
                      style={{ border: "none", outline: "none", fontSize: "9px", padding: "1px 3px", fontFamily: "Arial, sans-serif", background: "transparent", color: "#555", flexShrink: 0 }} />
                    {d.fecha_ingreso && (
                      <span style={{ fontSize: "10px", fontFamily: "'Georgia', serif", color: "#222" }}>{d.fecha_ingreso}</span>
                    )}
                  </div>
                  {/* Fecha de procedimiento */}
                  <div style={{ minHeight: 30, display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid #f0f0f0", padding: "2px 0" }}>
                    <input type="date" value={d.fecha_procedimiento_raw} onChange={(e) => onFechaProcedimiento(e.target.value)}
                      style={{ border: "none", outline: "none", fontSize: "9px", padding: "1px 3px", fontFamily: "Arial, sans-serif", background: "transparent", color: "#555", flexShrink: 0 }} />
                    {d.fecha_procedimiento && (
                      <span style={{ fontSize: "10px", fontFamily: "'Georgia', serif", color: "#222" }}>{d.fecha_procedimiento}</span>
                    )}
                  </div>
                  {/* Fecha de alta */}
                  <div style={{ minHeight: 30, display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid #f0f0f0", padding: "2px 0" }}>
                    <input type="date" value={d.fecha_alta_raw} onChange={(e) => onFechaAlta(e.target.value)}
                      style={{ border: "none", outline: "none", fontSize: "9px", padding: "1px 3px", fontFamily: "Arial, sans-serif", background: "transparent", color: "#555", flexShrink: 0 }} />
                    {d.fecha_alta && (
                      <span style={{ fontSize: "10px", fontFamily: "'Georgia', serif", color: "#222" }}>{d.fecha_alta}</span>
                    )}
                  </div>
                  {/* Número de historia */}
                  <div style={{ height: 26, display: "flex", alignItems: "center", borderBottom: "1px solid #f0f0f0" }}>
                    <input type="text" value={d.numero_historia} onChange={(e) => s("numero_historia")(e.target.value)}
                      style={{ border: "none", outline: "none", fontSize: "10px", padding: "2px 4px", fontFamily: "'Georgia', serif", width: "100%", background: "transparent" }} />
                  </div>
                </td>
              </tr>
              <TableField label="SERVICIO:"
                value={d.servicio} onChange={s("servicio")} placeholder="Ej: CIRUGÍA GENERAL" />
              <TableField label="PROCEDIMIENTO:"
                value={d.procedimiento} onChange={s("procedimiento")} placeholder="Ej: HERNIOPLASTIA UMBILICAL" />
              <tr>
                <td style={{
                  border: "1px solid #999", padding: "4px 8px",
                  background: "#f0f4f8", verticalAlign: "top",
                  fontWeight: 700, fontSize: "9px", fontFamily: "Arial, sans-serif",
                  color: "#1a3a5c", width: 200,
                }}>
                  <div style={{ height: 26, display: "flex", alignItems: "center" }}>DIAGNÓSTICO:</div>
                  <div style={{ height: 26, display: "flex", alignItems: "center" }}>CÓDIGO DE DIAGNÓSTICO (CIE10):</div>
                  <div style={{ height: 26, display: "flex", alignItems: "center" }}>CUADRO CLÍNICO:</div>
                  <div style={{ height: 26, display: "flex", alignItems: "center" }}>TIPO DE CONTINGENCIA:</div>
                  <div style={{ height: 26, display: "flex", alignItems: "center" }}>DIRECCIÓN:</div>
                  <div style={{ height: 26, display: "flex", alignItems: "center" }}>TELÉFONO DEL PACIENTE:</div>
                  <div style={{ height: 26, display: "flex", alignItems: "center" }}>INSTITUCIÓN / EMPRESA:</div>
                </td>
                <td style={{ border: "1px solid #999", padding: "0 4px", verticalAlign: "top" }}>
                  {[
                    { k: "diagnostico" as const, ph: "Ej: HERNIA UMBILICAL CON OBSTRUCCIÓN, SIN GANGRENA" },
                    { k: "codigo_cie10" as const, ph: "Ej: K420" },
                    { k: "cuadro_clinico" as const, ph: "Descripción del cuadro clínico..." },
                    { k: "tipo_contingencia" as const, ph: "ENFERMEDAD / ACCIDENTE / MATERNIDAD" },
                    { k: "direccion_paciente" as const, ph: "Dirección de domicilio" },
                    { k: "telefono_paciente" as const, ph: "0999999999" },
                    { k: "institucion_empresa" as const, ph: "Empresa u organización" },
                  ].map(({ k, ph }) => (
                    <div key={k} style={{ height: 26, display: "flex", alignItems: "center", borderBottom: "1px solid #f0f0f0" }}>
                      <input type="text" value={d[k]} onChange={(e) => s(k)(e.target.value)}
                        placeholder={ph}
                        style={{
                          width: "100%", border: "none", outline: "none", fontSize: "10px",
                          fontFamily: "'Georgia', serif", padding: "2px 4px",
                          background: "transparent", boxSizing: "border-box",
                        }} />
                    </div>
                  ))}
                </td>
              </tr>
              <TableField label="OCUPACIÓN / CARGO:"
                value={d.ocupacion} onChange={s("ocupacion")} placeholder="Ej: DOCENTE" />
            </tbody>
          </table>

          {/* ══ REPOSO Y FECHAS — P[05], P[06], P[07] ════════════════════ */}
          {/* Va después de la tabla, antes del cierre */}
          <div style={{
            fontSize: "10px", lineHeight: 2, marginBottom: 8,
            fontFamily: "'Georgia', serif", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.04em",
          }}>
            PACIENTE REQUIERE REPOSO MÉDICO ABSOLUTO DE&nbsp;
            <input
              type="number" min="0" max="365"
              value={d.dias_reposo_num}
              onChange={(e) => {
                const v = e.target.value;
                setD(p => ({ ...p, dias_reposo_num: v, dias_reposo_letras: reposoConLetras(v) }));
              }}
              placeholder="0"
              style={{
                border: "none", borderBottom: "1px solid #555", outline: "none",
                background: "transparent", fontSize: "10px", fontFamily: "'Georgia', serif",
                fontWeight: 700, width: 44, textAlign: "center", padding: "0 2px",
              }}
            />
            {d.dias_reposo_letras && (
              <span style={{ borderBottom: "1px solid #555", padding: "0 4px", marginLeft: 4 }}>
                {d.dias_reposo_letras}
              </span>
            )}
            &nbsp;DÍAS
          </div>

          <div style={{ fontSize: "10px", lineHeight: 2, marginBottom: 4, fontFamily: "'Georgia', serif" }}>
            <span style={{ fontWeight: 700 }}>DESDE EL DÍA:&nbsp;</span>
            <input type="date" value={d.desde_fecha_raw} onChange={(e) => onDesde(e.target.value)}
              style={{
                border: "none", borderBottom: "1px solid #aaa", outline: "none",
                fontSize: "9px", padding: "0 3px", background: "transparent",
                fontFamily: "Arial, sans-serif", color: "#555", marginRight: 6,
              }} />
            {d.desde_fecha_letras && (
              <span style={{
                fontSize: "10px", fontFamily: "'Georgia', serif", color: "#222",
                borderBottom: "1px solid #555", padding: "0 4px",
              }}>
                {d.desde_fecha_letras}
              </span>
            )}
          </div>

          <div style={{ fontSize: "10px", lineHeight: 2, marginBottom: 18, fontFamily: "'Georgia', serif" }}>
            <span style={{ fontWeight: 700 }}>HASTA EL DÍA:&nbsp;</span>
            <input type="date" value={d.hasta_fecha_raw} onChange={(e) => onHasta(e.target.value)}
              style={{
                border: "none", borderBottom: "1px solid #aaa", outline: "none",
                fontSize: "9px", padding: "0 3px", background: "transparent",
                fontFamily: "Arial, sans-serif", color: "#555", marginRight: 6,
              }} />
            {d.hasta_fecha_letras && (
              <span style={{
                fontSize: "10px", fontFamily: "'Georgia', serif", color: "#222",
                borderBottom: "1px solid #555", padding: "0 4px",
              }}>
                {d.hasta_fecha_letras}
              </span>
            )}
          </div>
          <div style={{
            fontSize: "10px", lineHeight: 1.8, marginBottom: 30,
            fontFamily: "'Georgia', serif", fontStyle: "italic",
          }}>
            PARA LOS FINES PERTINENTES SE EXTIENDE EL PRESENTE CERTIFICADO.
          </div>

          <div style={{ fontSize: "10px", marginBottom: 50, fontFamily: "'Georgia', serif" }}>
            Atentamente:
          </div>

          {/* ══ DATOS DEL DOCTOR ══════════════════════════════════════════ */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            borderTop: "1px solid #1a3a5c", paddingTop: 10,
          }}>
            <div style={{
              fontSize: "8px", color: "#aaa", fontFamily: "Arial, sans-serif",
              marginBottom: 6, fontStyle: "italic",
            }}>
              (campos editables — se exportan al documento)
            </div>
            <div style={{ width: "100%", maxWidth: 500 }}>
              <DoctorField label="" value={d.nombre_doctor} onChange={s("nombre_doctor")} 
                onSelectMedico={(m) => { s("nombre_doctor")(m.nombre); s("especialidad_doctor")(m.especialidad); s("ci_doctor")(m.identificacion); s("correo_doctor")(m.correo); }} />
              <DoctorField label="" value={d.especialidad_doctor} onChange={s("especialidad_doctor")}
                onSelectMedico={(m) => { s("nombre_doctor")(m.nombre); s("especialidad_doctor")(m.especialidad); s("ci_doctor")(m.identificacion); s("correo_doctor")(m.correo); }} />
              <DoctorField label="" value={d.ci_doctor} onChange={s("ci_doctor")}
                onSelectMedico={(m) => { s("nombre_doctor")(m.nombre); s("especialidad_doctor")(m.especialidad); s("ci_doctor")(m.identificacion); s("correo_doctor")(m.correo); }} />
              <DoctorField label="" value={d.correo_doctor} onChange={s("correo_doctor")}
                onSelectMedico={(m) => { s("nombre_doctor")(m.nombre); s("especialidad_doctor")(m.especialidad); s("ci_doctor")(m.identificacion); s("correo_doctor")(m.correo); }} />
            </div>
          </div>

        </div>

        {/* ══ PIE ══════════════════════════════════════════════════════════ */}
        <div style={{
          borderTop: "1px solid #dde8f0", background: "#f8fafd",
          padding: "6px 24px", display: "flex", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: "8px", color: "#aab8c8", fontFamily: "Arial, sans-serif" }}>
            Nuevo Hospital Panamericano — Certificado Médico
          </span>
          <span style={{ fontSize: "8px", color: "#aab8c8", fontFamily: "Arial, sans-serif" }}>
            {d.fecha_certificado}
          </span>
        </div>

      </div>
    </div>
  );
});

export default CertificadoMedicoForm;