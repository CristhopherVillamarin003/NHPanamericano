"use client";

import React, { useState, useImperativeHandle } from "react";
import { useFormAutosaveAndWarn } from "@/hooks/useFormAutosaveAndWarn";
import { Cie10DescInput, Cie10CieInput } from "./Cie10Input";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DatosAnverso {
  institucion: string;
  establecimiento: string;
  numero_historia_clinica: string;
  numero_archivo: string;
  primer_apellido: string;
  segundo_apellido: string;
  primer_nombre: string;
  segundo_nombre: string;
  sexo: string;
  edad: string;
  condicion_edad: "H" | "D" | "M" | "A";
  consentimiento_para: string;
  servicio: string;
  tipo_atencion: "AMBULATORIO" | "HOSPITALIZACION" | "";
  diagnostico: string;
  cie10: string;
  nombre_procedimiento: string;
  en_que_consiste: string;
  como_se_realiza: string;
  duracion_estimada: string;
  beneficios: string;
  riesgos_frecuentes: string;
  riesgos_graves: string;
  riesgos_especificos: string;
  alternativas: string;
  manejo_posterior: string;
  consecuencias_si_no: string;
  graficos: string[]; // Array de Base64 de imágenes del gráfico
}

interface DatosReverso {
  fecha_consentimiento: string;
  hora_consentimiento: string;
  nombre_paciente_firma: string;
  cedula_paciente_firma: string;
  nombre_profesional: string;
  nombre_representante_c: string;
  cedula_representante_c: string;
  parentesco_c: string;
  fecha_negativa: string;
  nombre_paciente_negativa: string;
  cedula_paciente_negativa: string;
  nombre_profesional_neg: string;
  nombre_representante_d: string;
  cedula_representante_d: string;
  parentesco_d: string;
  nombre_testigo: string;
  cedula_testigo: string;
  nombre_paciente_rev: string;
  cedula_paciente_rev: string;
  nombre_profesional_rev: string;
  nombre_representante_e: string;
  cedula_representante_e: string;
  parentesco_e: string;
}

interface Props {
  /** Datos del paciente precargados desde la BD */
  paciente?: {
    primer_nombre?: string;
    segundo_nombre?: string;
    primer_apellido?: string;
    segundo_apellido?: string;
    cedula?: string;
    edad?: number;
    sexo?: string;
    numero_historia_clinica?: string;
    tipoPaciente?: string;
  };
  /** Datos previamente guardados (modo edición) */
  initialData?: { anverso?: Partial<DatosAnverso>; reverso?: Partial<DatosReverso> };
  onGuardar?: (datos: { anverso: DatosAnverso; reverso: DatosReverso }) => void;
  onExportarExcel?: (datos: { anverso: DatosAnverso; reverso: DatosReverso }) => void;
  guardando?: boolean;
  exportando?: boolean;
  consentimientoId?: number;
  isTemplateMode?: boolean;
}

// ─── Sub-componentes de celda ─────────────────────────────────────────────────

function CeldaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: "9px",
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
  fontSize = "9px",
  multiline = false,
  rows = 2,
  placeholder = "",
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  center?: boolean;
  fontSize?: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  const base: React.CSSProperties = {
    width: "100%",
    border: "none",
    outline: "none",
    background: readOnly ? "#f0f0f0" : "#fff",
    fontSize: fontSize === "9px" ? "11px" : fontSize,
    fontFamily: "Arial, sans-serif",
    textAlign: center ? "center" : "left",
    padding: "3px 4px",
    color: "#000",
    resize: "none",
    lineHeight: 1.3,
  };

  if (multiline) {
    return (
      <textarea
        rows={rows}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ ...base, display: "block" }}
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

// ─── Estilos de celda de la tabla ────────────────────────────────────────────

const tdBase: React.CSSProperties = {
  border: "1px solid #000",
  padding: 0,
  verticalAlign: "top",
};

const tdLabel: React.CSSProperties = {
  ...tdBase,
  background: "#CCFFCC",
  verticalAlign: "middle",
};

const sectionHeader: React.CSSProperties = {
  background: "#CCCCFF",
  fontWeight: 700,
  fontSize: "12px",
  fontFamily: "Arial, sans-serif",
  padding: "4px 8px",
  borderBottom: "1px solid #000",
  letterSpacing: "0.02em",
};

const subSectionHeader: React.CSSProperties = {
  background: "#DCE6F1",
  fontWeight: 700,
  fontSize: "10px",
  fontFamily: "Arial, sans-serif",
  padding: "4px 8px",
  borderBottom: "1px solid #000",
  letterSpacing: "0.02em",
};

// ─── Componente Principal ─────────────────────────────────────────────────────

export type ConsentimientoFormHandle = {
  getDatos: () => { anverso: DatosAnverso; reverso: DatosReverso };
  clearAutosave?: () => void;
  isDirty?: () => boolean;
};

const ConsentimientoForm024 = React.forwardRef<ConsentimientoFormHandle, Props>(({
  paciente,
  initialData,
  onGuardar,
  onExportarExcel,
  guardando = false,
  exportando = false,
  consentimientoId,
  isTemplateMode = false,
}, ref) => {
  const [hoja, setHoja] = useState<"ANVERSO" | "REVERSO">("ANVERSO");

  const [anverso, setAnverso] = useState<DatosAnverso>({
    institucion: (initialData?.anverso?.institucion) || paciente?.tipoPaciente || "PARTICULAR",
    establecimiento: initialData?.anverso?.establecimiento || "NUEVO HOSPITAL PANAMERICANO",
    numero_historia_clinica: (initialData?.anverso?.numero_historia_clinica) || paciente?.numero_historia_clinica || paciente?.cedula || "",
    numero_archivo: initialData?.anverso?.numero_archivo || "",
    primer_apellido: (initialData?.anverso?.primer_apellido) || paciente?.primer_apellido || "",
    segundo_apellido: (initialData?.anverso?.segundo_apellido) || paciente?.segundo_apellido || "",
    primer_nombre: (initialData?.anverso?.primer_nombre) || paciente?.primer_nombre || "",
    segundo_nombre: (initialData?.anverso?.segundo_nombre) || paciente?.segundo_nombre || "",
    sexo: (initialData?.anverso?.sexo) || (paciente?.sexo
      ? paciente.sexo.toUpperCase().startsWith("F") ? "F" : paciente.sexo.toUpperCase().startsWith("M") ? "M" : paciente.sexo
      : ""),
    edad: (initialData?.anverso?.edad) || paciente?.edad?.toString() || "",
    condicion_edad: initialData?.anverso?.condicion_edad || "A",
    consentimiento_para: initialData?.anverso?.consentimiento_para || "",
    servicio: initialData?.anverso?.servicio || "",
    tipo_atencion: initialData?.anverso?.tipo_atencion || "",
    diagnostico: initialData?.anverso?.diagnostico || "",
    cie10: initialData?.anverso?.cie10 || "",
    nombre_procedimiento: initialData?.anverso?.nombre_procedimiento || "",
    en_que_consiste: initialData?.anverso?.en_que_consiste || "",
    como_se_realiza: initialData?.anverso?.como_se_realiza || "",
    duracion_estimada: initialData?.anverso?.duracion_estimada || "",
    beneficios: initialData?.anverso?.beneficios || "",
    riesgos_frecuentes: initialData?.anverso?.riesgos_frecuentes || "",
    riesgos_graves: initialData?.anverso?.riesgos_graves || "",
    riesgos_especificos: initialData?.anverso?.riesgos_especificos || "",
    alternativas: initialData?.anverso?.alternativas || "",
    manejo_posterior: initialData?.anverso?.manejo_posterior || "",
    consecuencias_si_no: initialData?.anverso?.consecuencias_si_no || "",
    graficos: initialData?.anverso?.graficos || [],
  });

  const [reverso, setReverso] = useState<DatosReverso>({
    fecha_consentimiento: initialData?.reverso?.fecha_consentimiento || new Date().toISOString().split("T")[0],
    hora_consentimiento: initialData?.reverso?.hora_consentimiento || new Date().toTimeString().slice(0, 5),
    nombre_paciente_firma: (initialData?.reverso?.nombre_paciente_firma) || (paciente ? `${paciente?.primer_nombre ?? ""} ${paciente?.segundo_nombre ?? ""} ${paciente?.primer_apellido ?? ""} ${paciente?.segundo_apellido ?? ""}`.trim() : ""),
    cedula_paciente_firma: (initialData?.reverso?.cedula_paciente_firma) || paciente?.cedula || "",
    nombre_profesional: initialData?.reverso?.nombre_profesional || "",
    nombre_representante_c: initialData?.reverso?.nombre_representante_c || "",
    cedula_representante_c: initialData?.reverso?.cedula_representante_c || "",
    parentesco_c: initialData?.reverso?.parentesco_c || "",
    fecha_negativa: initialData?.reverso?.fecha_negativa || "",
    nombre_paciente_negativa: (initialData?.reverso?.nombre_paciente_negativa) || (paciente ? `${paciente?.primer_nombre ?? ""} ${paciente?.segundo_nombre ?? ""} ${paciente?.primer_apellido ?? ""} ${paciente?.segundo_apellido ?? ""}`.trim() : ""),
    cedula_paciente_negativa: (initialData?.reverso?.cedula_paciente_negativa) || paciente?.cedula || "",
    nombre_profesional_neg: initialData?.reverso?.nombre_profesional_neg || "",
    nombre_representante_d: initialData?.reverso?.nombre_representante_d || "",
    cedula_representante_d: initialData?.reverso?.cedula_representante_d || "",
    parentesco_d: initialData?.reverso?.parentesco_d || "",
    nombre_testigo: initialData?.reverso?.nombre_testigo || "",
    cedula_testigo: initialData?.reverso?.cedula_testigo || "",
    nombre_profesional_rev: initialData?.reverso?.nombre_profesional_rev || "",
    nombre_representante_e: initialData?.reverso?.nombre_representante_e || "",
    cedula_representante_e: initialData?.reverso?.cedula_representante_e || "",
    parentesco_e: initialData?.reverso?.parentesco_e || "",
  });

  const { isDirty, clearAutosave } = useFormAutosaveAndWarn({
    formId: `consentimiento_${consentimientoId || 'new'}_${paciente?.cedula || 'new'}`,
    initialData: { anverso: initialData?.anverso || {}, reverso: initialData?.reverso || {} },
    currentData: { anverso, reverso },
    onRestore: (saved) => {
      if (saved.anverso) setAnverso(p => ({ ...p, ...saved.anverso }));
      if (saved.reverso) setReverso(p => ({ ...p, ...saved.reverso }));
    },
  });

  useImperativeHandle(ref, () => ({
    getDatos: () => ({ anverso, reverso }),
    clearAutosave: () => clearAutosave(),
    isDirty: () => isDirty,
  }), [anverso, reverso, clearAutosave, isDirty]);

  const setA = (field: keyof DatosAnverso) => (v: string) =>
    setAnverso((p) => ({ ...p, [field]: v }));
  const setR = (field: keyof DatosReverso) => (v: string) =>
    setReverso((p) => ({ ...p, [field]: v }));

  const TEXTO_LEGAL_C = 'He facilitado la información completa que conozco, y me ha sido solicitada, sobre los antecedentes personales, familiares y de mi estado de salud. Soy consciente que de omitir estos datos puede afectarse los resultados del tratamiento. Estoy de acuerdo con el procedimiento que se me ha propuesto; he sido informado de las ventajas e inconvenientes del mismo; se me ha explicado de forma clara en qué consiste, los beneficios y posibles riesgos del procedimiento. He escuchado, leído y comprendido la información recibida y se me ha dado la oportunidad de preguntar sobre el procedimiento. He tomado consciente y libremente de decisión de autorizar el procedimiento adicional, si es considerado necesario según el juicio del profesional de la salud, para mi beneficio. También conozco que puedo retirar mi consentimiento cuando lo estime oportuno.';
  const TEXTO_LEGAL_D = 'Una vez que he entendido claramente el procedimiento propuesto, así como las consecuencias posibles si no se realiza la intervención, no autorizo y me niego a que se me realice el procedimiento propuesto y desvinculo de responsabilidades futuras de cualquier índole al establecimiento de salud y al profesional sanitario que me atiende, por no realizar la intervención sugerida.';
  const TEXTO_LEGAL_E = 'De forma libre y voluntaria, revoco el consentimiento realizado en fecha y manifiesto expresamente mi deseo de no continuar con el procedimiento médico que doy por finalizado en esta fecha. Libero de responsabilidades futuras de cualquier índole al establecimiento de salud y al profesional sanitario que me atiende.';

  const handleGuardar = () => {
    onGuardar?.({ anverso, reverso });
    clearAutosave();
  };
  
  const handleExcel = () => onExportarExcel?.({
    anverso,
    reverso: {
      ...reverso,
      texto_legal_c: TEXTO_LEGAL_C,
      texto_legal_d: TEXTO_LEGAL_D,
      texto_legal_e: TEXTO_LEGAL_E,
    } as any,
  });

  // ── Estilos generales del formulario ──────────────────────────────────────

  const tableStyle: React.CSSProperties = {
    width: "100%",
    minWidth: "1100px",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    fontFamily: "Arial, sans-serif",
    fontSize: "11px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ── Barra superior de acciones ─────────────────────────────────────── */}
      <div className="consentimiento-action-bar" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        background: "#f5f5f5",
        borderBottom: "1px solid #ccc",
        gap: 8,
      }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#1a3a5c" }}>
            SNS-MSP / HCU-form.024/2016
          </span>
          <span style={{ fontSize: "10px", color: "#555", marginLeft: 10 }}>
            Consentimiento Informado — Cirugías
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={handleGuardar} disabled={guardando} style={btnStyle("#1a3a5c")}>
            {guardando ? "Guardando..." : "💾 Guardar"}
          </button>
          <button onClick={handleExcel} disabled={exportando} style={btnStyle("#1e6b2e")}>
            📊 Descargar Excel
          </button>
        </div>
      </div>

      {/* ── Pestañas ANVERSO / REVERSO ─────────────────────────────────────── */}
      <div style={{ display: "flex", borderBottom: "2px solid #000", background: "#e8e8e8" }}>
        {(["ANVERSO", "REVERSO"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setHoja(tab)}
            style={{
              padding: "5px 20px",
              fontSize: "10px",
              fontWeight: 700,
              fontFamily: "Arial, sans-serif",
              border: "none",
              borderRight: "1px solid #999",
              cursor: "pointer",
              background: hoja === tab ? "#fff" : "#d0d0d0",
              borderBottom: hoja === tab ? "2px solid #fff" : "none",
              color: "#000",
              marginBottom: hoja === tab ? -2 : 0,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Área del formulario con scroll ────────────────────────────────── */}
      <div className="consentimiento-print-area" style={{ overflowY: "visible", overflowX: "visible", background: "#fff", minHeight: "60vh" }}>

        {/* ════════════════════════════════════════════════════════════════════
            ANVERSO
            ════════════════════════════════════════════════════════════════ */}
        {hoja === "ANVERSO" && (
          <table style={tableStyle}>
            <tbody>

              {/* Fila 1 — Sección A header */}
              <tr>
                <td colSpan={12} style={{ ...sectionHeader, border: "1px solid #000" }}>
                  A. DATOS DEL ESTABLECIMIENTO Y USUARIO
                </td>
              </tr>

              {/* Filas 2-3 — Labels institución / establecimiento / historia / archivo */}
              <tr>
                <td colSpan={3} style={tdLabel}>
                  <CeldaLabel>INSTITUCIÓN DEL SISTEMA</CeldaLabel>
                </td>
                <td colSpan={5} style={tdLabel}>
                  <CeldaLabel>ESTABLECIMIENTO DE SALUD</CeldaLabel>
                </td>
                <td colSpan={2} style={tdLabel}>
                  <CeldaLabel>NÚMERO DE HISTORIA CLÍNICA ÚNICA</CeldaLabel>
                </td>
                <td colSpan={2} style={tdLabel}>
                  <CeldaLabel>NÚMERO DE ARCHIVO</CeldaLabel>
                </td>
              </tr>

              {/* Filas 4 — Inputs institución / establecimiento / historia / archivo */}
              <tr style={{ height: 20 }}>
                <td colSpan={3} style={tdBase}>
                  <CeldaInput value={anverso.institucion} onChange={setA("institucion")} center />
                </td>
                <td colSpan={5} style={tdBase}>
                  <CeldaInput value={anverso.establecimiento} onChange={setA("establecimiento")} center />
                </td>
                <td colSpan={2} style={tdBase}>
                  <CeldaInput value={anverso.numero_historia_clinica} onChange={setA("numero_historia_clinica")} center />
                </td>
                <td colSpan={2} style={tdBase}>
                  <CeldaInput value={anverso.numero_archivo} onChange={setA("numero_archivo")} center />
                </td>
              </tr>

              {/* Filas 5-6 — Labels apellidos / nombres / sexo / edad / condición */}
              <tr>
                <td colSpan={2} style={tdLabel}><CeldaLabel>PRIMER APELLIDO</CeldaLabel></td>
                <td colSpan={2} style={tdLabel}><CeldaLabel>SEGUNDO APELLIDO</CeldaLabel></td>
                <td colSpan={2} style={tdLabel}><CeldaLabel>PRIMER NOMBRE</CeldaLabel></td>
                <td colSpan={2} style={tdLabel}><CeldaLabel>SEGUNDO NOMBRE</CeldaLabel></td>
                <td colSpan={1} style={tdLabel}><CeldaLabel>SEXO</CeldaLabel></td>
                <td colSpan={1} style={tdLabel}><CeldaLabel>EDAD</CeldaLabel></td>
                <td colSpan={2} style={tdLabel}>
                  <CeldaLabel>CONDICIÓN EDAD</CeldaLabel>
                  <div style={{ display: "flex", justifyContent: "space-around", fontSize: "7px", fontWeight: 700 }}>
                    <span>H</span><span>D</span><span>M</span><span>A</span>
                  </div>
                </td>
              </tr>

              {/* Fila 7 — Inputs apellidos / nombres / sexo / edad / condición */}
              <tr style={{ height: 20 }}>
                <td colSpan={2} style={tdBase}>
                  <CeldaInput value={anverso.primer_apellido} onChange={setA("primer_apellido")} />
                </td>
                <td colSpan={2} style={tdBase}>
                  <CeldaInput value={anverso.segundo_apellido} onChange={setA("segundo_apellido")} />
                </td>
                <td colSpan={2} style={tdBase}>
                  <CeldaInput value={anverso.primer_nombre} onChange={setA("primer_nombre")} />
                </td>
                <td colSpan={2} style={tdBase}>
                  <CeldaInput value={anverso.segundo_nombre} onChange={setA("segundo_nombre")} />
                </td>
                <td colSpan={1} style={tdBase}>
                  <CeldaInput value={anverso.sexo} onChange={setA("sexo")} center />
                </td>
                <td colSpan={1} style={tdBase}>
                  <CeldaInput value={anverso.edad} onChange={setA("edad")} center />
                </td>
                <td colSpan={2} style={tdBase}>
                  <div style={{ display: "flex", justifyContent: "space-around", padding: "2px" }}>
                    {(["H", "D", "M", "A"] as const).map((op) => (
                      <label key={op} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", gap: 1 }}>
                        <input
                          type="radio"
                          name="condicion_edad"
                          value={op}
                          checked={anverso.condicion_edad === op}
                          onChange={() => setAnverso(p => ({ ...p, condicion_edad: op }))}
                          style={{ width: 10, height: 10 }}
                        />
                      </label>
                    ))}
                  </div>
                </td>
              </tr>

              {/* Fila 8 — separador */}
              <tr style={{ height: 4 }}>
                <td colSpan={12} style={{ border: "1px solid #000", background: "#e8e8e8" }} />
              </tr>

              {/* Sección B header */}
              <tr>
                <td colSpan={12} style={{ ...sectionHeader, border: "1px solid #000" }}>
                  B. CONSENTIMIENTO INFORMADO
                </td>
              </tr>

              {/* Consentimiento para */}
              <tr>
                <td colSpan={3} style={tdLabel}><CeldaLabel>CONSENTIMIENTO INFORMADO PARA:</CeldaLabel></td>
                <td colSpan={9} style={tdBase}>
                  <CeldaInput value={anverso.consentimiento_para} onChange={setA("consentimiento_para")} />
                </td>
              </tr>

              {/* Servicio / Tipo atención */}
              <tr>
                <td colSpan={2} style={tdLabel}><CeldaLabel>SERVICIO:</CeldaLabel></td>
                <td colSpan={5} style={tdBase}>
                  <CeldaInput value={anverso.servicio} onChange={setA("servicio")} />
                </td>
                <td colSpan={2} style={tdLabel}><CeldaLabel>TIPO DE ATENCIÓN:</CeldaLabel></td>
                <td colSpan={3} style={tdBase}>
                  <div style={{ display: "flex", gap: 8, padding: "3px 4px", alignItems: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "8px", cursor: "pointer" }}>
                      <input type="radio" name="tipo_atencion" value="AMBULATORIO"
                        checked={anverso.tipo_atencion === "AMBULATORIO"}
                        onChange={() => setAnverso(p => ({ ...p, tipo_atencion: "AMBULATORIO" }))}
                        style={{ width: 10, height: 10 }} />
                      AMBULATORIO
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "8px", cursor: "pointer" }}>
                      <input type="radio" name="tipo_atencion" value="HOSPITALIZACION"
                        checked={anverso.tipo_atencion === "HOSPITALIZACION"}
                        onChange={() => setAnverso(p => ({ ...p, tipo_atencion: "HOSPITALIZACION" }))}
                        style={{ width: 10, height: 10 }} />
                      HOSPITALIZACIÓN
                    </label>
                  </div>
                </td>
              </tr>

              {/* Diagnóstico / CIE10 */}
              <tr>
                <td colSpan={2} style={tdLabel}><CeldaLabel>DIAGNÓSTICO:</CeldaLabel></td>
                <td colSpan={7} style={tdBase}>
                  <Cie10DescInput
                    cie={anverso.cie10}
                    descripcion={anverso.diagnostico}
                    onChange={(cie, desc) => setAnverso(p => ({ ...p, diagnostico: desc, cie10: cie }))}
                  />
                </td>
                <td colSpan={1} style={tdLabel}><CeldaLabel>CIE 10:</CeldaLabel></td>
                <td colSpan={2} style={tdBase}>
                  <Cie10CieInput
                    cie={anverso.cie10}
                    descripcion={anverso.diagnostico}
                    onChange={(cie, desc) => setAnverso(p => ({ ...p, diagnostico: desc, cie10: cie }))}
                  />
                </td>
              </tr>

              {/* Nombre procedimiento */}
              <tr>
                <td colSpan={4} style={tdLabel}><CeldaLabel>NOMBRE DEL PROCEDIMIENTO RECOMENDADO:</CeldaLabel></td>
                <td colSpan={8} style={tdBase}>
                  <CeldaInput value={anverso.nombre_procedimiento} onChange={setA("nombre_procedimiento")} />
                </td>
              </tr>

              {/* En qué consiste */}
              <tr>
                <td colSpan={2} style={tdLabel}><CeldaLabel>EN QUÉ CONSISTE:</CeldaLabel></td>
                <td colSpan={10} style={tdBase}>
                  <CeldaInput value={anverso.en_que_consiste} onChange={setA("en_que_consiste")} multiline rows={3} />
                </td>
              </tr>

              {/* Cómo se realiza */}
              <tr>
                <td colSpan={2} style={tdLabel}><CeldaLabel>CÓMO SE REALIZA:</CeldaLabel></td>
                <td colSpan={10} style={tdBase}>
                  <CeldaInput value={anverso.como_se_realiza} onChange={setA("como_se_realiza")} multiline rows={3} />
                </td>
              </tr>

              {/* Área gráfico */}
              <tr style={{ height: 120 }}>
                <td colSpan={12} style={{ ...tdBase, background: "#fafafa" }}>
                  <div style={{ padding: "3px 6px", fontSize: "8px", color: "#555", fontStyle: "italic" }}>
                    GRÁFICO DE LA INTERVENCIÓN (incluya un gráfico previamente seleccionado o elaborado por el/la profesional de salud)
                  </div>
                  <div style={{ margin: "4px 8px 6px", display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 6 }}>
                    {/* Imágenes cargadas */}
                    {anverso.graficos.map((src, idx) => (
                      <div key={idx} style={{ position: "relative", display: "inline-block" }}>
                        <img
                          src={src}
                          alt={`Gráfico ${idx + 1}`}
                          style={{ height: 80, maxWidth: 120, objectFit: "contain", border: "1px solid #ddd", borderRadius: 4 }}
                        />
                        <button
                          type="button"
                          onClick={() => setAnverso(p => ({ ...p, graficos: p.graficos.filter((_, i) => i !== idx) }))}
                          style={{
                            position: "absolute", top: 2, right: 2,
                            background: "#ef4444", color: "#fff", border: "none",
                            borderRadius: "50%", width: 16, height: 16,
                            fontSize: "9px", cursor: "pointer", lineHeight: 1,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                          title="Eliminar imagen"
                        >✕</button>
                      </div>
                    ))}
                    {/* Botón agregar */}
                    <label style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      justifyContent: "center", gap: 3, cursor: "pointer",
                      border: "1px dashed #aaa", borderRadius: 6, padding: "8px 14px",
                      background: "#f8f8f8", color: "#888", fontSize: "9px",
                      height: 80, minWidth: 80,
                    }}>
                      <span style={{ fontSize: "18px" }}>🖼️</span>
                      <span>Agregar</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/gif"
                        multiple
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? []);
                          files.forEach(file => {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const base64 = ev.target?.result as string;
                              setAnverso(p => ({ ...p, graficos: [...p.graficos, base64] }));
                            };
                            reader.readAsDataURL(file);
                          });
                          // Reset input para permitir cargar el mismo archivo de nuevo
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </td>
              </tr>

              {/* Duración estimada */}
              <tr>
                <td colSpan={3} style={tdLabel}><CeldaLabel>DURACIÓN ESTIMADA DE LA INTERVENCIÓN:</CeldaLabel></td>
                <td colSpan={9} style={tdBase}>
                  <CeldaInput value={anverso.duracion_estimada} onChange={setA("duracion_estimada")} />
                </td>
              </tr>

              {/* Beneficios */}
              <tr>
                <td colSpan={3} style={tdLabel}><CeldaLabel>BENEFICIOS DEL PROCEDIMIENTO:</CeldaLabel></td>
                <td colSpan={9} style={tdBase}>
                  <CeldaInput value={anverso.beneficios} onChange={setA("beneficios")} multiline rows={2} />
                </td>
              </tr>

              {/* Riesgos frecuentes */}
              <tr>
                <td colSpan={3} style={tdLabel}><CeldaLabel>RIESGOS FRECUENTES (POCO GRAVES):</CeldaLabel></td>
                <td colSpan={9} style={tdBase}>
                  <CeldaInput value={anverso.riesgos_frecuentes} onChange={setA("riesgos_frecuentes")} multiline rows={2} />
                </td>
              </tr>

              {/* Riesgos graves */}
              <tr>
                <td colSpan={3} style={tdLabel}><CeldaLabel>RIESGOS POCO FRECUENTES (GRAVES):</CeldaLabel></td>
                <td colSpan={9} style={tdBase}>
                  <CeldaInput value={anverso.riesgos_graves} onChange={setA("riesgos_graves")} multiline rows={2} />
                </td>
              </tr>

              {/* Riesgos específicos */}
              <tr>
                <td colSpan={12} style={{ ...tdBase }}>
                  <div style={{ fontSize: "8px", fontWeight: 700, padding: "2px 4px" }}>
                    DE EXISTIR, ESCRIBA LOS RIESGOS ESPECÍFICOS RELACIONADOS CON LAS CONDICIONES PARTICULARES DEL PACIENTE (EDAD, ESTADO DE SALUD, CREENCIAS, VALORES, ETC.):
                  </div>
                  <CeldaInput value={anverso.riesgos_especificos} onChange={setA("riesgos_especificos")} multiline rows={2} />
                </td>
              </tr>

              {/* Alternativas */}
              <tr>
                <td colSpan={3} style={tdLabel}><CeldaLabel>ALTERNATIVAS AL PROCEDIMIENTO:</CeldaLabel></td>
                <td colSpan={9} style={tdBase}>
                  <CeldaInput value={anverso.alternativas} onChange={setA("alternativas")} />
                </td>
              </tr>

              {/* Manejo posterior */}
              <tr>
                <td colSpan={3} style={tdLabel}><CeldaLabel>DESCRIPCIÓN DEL MANEJO POSTERIOR AL PROCEDIMIENTO:</CeldaLabel></td>
                <td colSpan={9} style={tdBase}>
                  <CeldaInput value={anverso.manejo_posterior} onChange={setA("manejo_posterior")} multiline rows={2} />
                </td>
              </tr>

              {/* Consecuencias si no */}
              <tr>
                <td colSpan={3} style={tdLabel}><CeldaLabel>CONSECUENCIAS POSIBLES SI NO SE REALIZA EL PROCEDIMIENTO:</CeldaLabel></td>
                <td colSpan={9} style={tdBase}>
                  <CeldaInput value={anverso.consecuencias_si_no} onChange={setA("consecuencias_si_no")} multiline rows={3} />
                </td>
              </tr>

              {/* Footer anverso */}
              <tr>
                <td colSpan={7} style={{ border: "1px solid #000", fontSize: "8px", fontWeight: 700, padding: "3px 4px" }}>
                  SNS-MSP / HCU-form.024/2016
                </td>
                <td colSpan={5} style={{ border: "1px solid #000", fontSize: "10px", fontWeight: 700, textAlign: "right", padding: "3px 4px" }}>
                  CONSENTIMIENTO INFORMADO (1)
                </td>
              </tr>

            </tbody>
          </table>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            REVERSO
            ════════════════════════════════════════════════════════════════ */}
        {hoja === "REVERSO" && (
          <table style={tableStyle}>
            <tbody>

              {/* Sección C header */}
              <tr>
                <td colSpan={12} style={{ ...sectionHeader, border: "1px solid #000" }}>
                  C. DECLARACIÓN DE CONSENTIMIENTO INFORMADO
                </td>
              </tr>

              {/* Fecha / hora */}
              <tr>
                <td colSpan={1} style={tdLabel}><CeldaLabel>FECHA</CeldaLabel></td>
                <td colSpan={5} style={tdBase}>
                  <input type="date" value={reverso.fecha_consentimiento}
                    onChange={(e) => setR("fecha_consentimiento")(e.target.value)}
                    style={{ border: "none", fontSize: "9px", padding: "2px 3px", width: "100%", outline: "none" }} />
                </td>
                <td colSpan={1} style={tdLabel}><CeldaLabel>HORA</CeldaLabel></td>
                <td colSpan={5} style={tdBase}>
                  <input type="time" value={reverso.hora_consentimiento}
                    onChange={(e) => setR("hora_consentimiento")(e.target.value)}
                    style={{ border: "none", fontSize: "9px", padding: "2px 3px", width: "100%", outline: "none" }} />
                </td>
              </tr>

              {/* Texto legal — sección C */}
              <tr>
                <td colSpan={12} style={{ ...tdBase, fontSize: "8.5px", padding: "6px 8px", lineHeight: 1.6, background: "#fafafa" }}>
                  He facilitado la información completa que conozco, y me ha sido solicitada, sobre los antecedentes personales, familiares y de mi estado de salud. Soy consciente que de omitir estos datos puede afectarse los resultados del tratamiento. Estoy de acuerdo con el procedimiento que se me ha propuesto; he sido informado de las ventajas e inconvenientes del mismo; se me ha explicado de forma clara en qué consiste, los beneficios y posibles riesgos del procedimiento. He escuchado, leído y comprendido la información recibida y se me ha dado la oportunidad de preguntar sobre el procedimiento. He tomado consciente y libremente de decisión de autorizar el procedimiento adicional, si es considerado necesario según el juicio del profesional de la salud, para mi beneficio. También conozco que puedo retirar mi consentimiento cuando lo estime oportuno.
                </td>
              </tr>

              {/* Firma paciente — sección C */}
              <tr style={{ height: 28 }}>
                <td colSpan={4} style={tdLabel}><CeldaLabel>Nombre completo del paciente.</CeldaLabel></td>
                <td colSpan={3} style={tdLabel}><CeldaLabel>Cédula de ciudadanía.</CeldaLabel></td>
                <td colSpan={5} style={tdLabel}><CeldaLabel>Firma del paciente o huella, según el caso.</CeldaLabel></td>
              </tr>
              <tr style={{ height: 24 }}>
                <td colSpan={4} style={tdBase}>
                  <CeldaInput value={reverso.nombre_paciente_firma} onChange={setR("nombre_paciente_firma")} />
                </td>
                <td colSpan={3} style={tdBase}>
                  <CeldaInput value={reverso.cedula_paciente_firma} onChange={setR("cedula_paciente_firma")} center />
                </td>
                <td colSpan={5} style={{ ...tdBase, background: "#f9f9f9" }}>
                  <div style={{ fontSize: "7px", color: "#999", textAlign: "center", padding: "4px" }}>(firma física en documento impreso)</div>
                </td>
              </tr>

              {/* Firma profesional — sección C */}
              <tr style={{ height: 28 }}>
                <td colSpan={4} style={tdLabel}><CeldaLabel>Nombre del profesional que realiza el procedimiento.</CeldaLabel></td>
                <td colSpan={8} style={tdLabel}><CeldaLabel>Firma, sello y código del profesional de la salud que realiza el procedimiento.</CeldaLabel></td>
              </tr>
              <tr style={{ height: 24 }}>
                <td colSpan={4} style={tdBase}>
                  <CeldaInput value={reverso.nombre_profesional} onChange={setR("nombre_profesional")} />
                </td>
                <td colSpan={8} style={{ ...tdBase, background: "#f9f9f9" }}>
                  <div style={{ fontSize: "7px", color: "#999", textAlign: "center", padding: "4px" }}>(firma + sello + código en documento impreso)</div>
                </td>
              </tr>

              {/* Representante legal — sección C */}
              <tr>
                <td colSpan={12} style={{ ...subSectionHeader, border: "1px solid #000" }}>
                  Si el paciente no está en capacidad para firmar el consentimiento informado:
                </td>
              </tr>
              <tr style={{ height: 28 }}>
                <td colSpan={4} style={tdLabel}><CeldaLabel>Nombre del representante legal.</CeldaLabel></td>
                <td colSpan={3} style={tdLabel}><CeldaLabel>Cédula de ciudadanía.</CeldaLabel></td>
                <td colSpan={5} style={tdLabel}><CeldaLabel>Firma del representante legal.</CeldaLabel></td>
              </tr>
              <tr style={{ height: 24 }}>
                <td colSpan={4} style={tdBase}>
                  <CeldaInput value={reverso.nombre_representante_c} onChange={setR("nombre_representante_c")} />
                </td>
                <td colSpan={3} style={tdBase}>
                  <CeldaInput value={reverso.cedula_representante_c} onChange={setR("cedula_representante_c")} center />
                </td>
                <td colSpan={5} style={{ ...tdBase, background: "#f9f9f9" }}>
                  <div style={{ fontSize: "7px", color: "#999", textAlign: "center", padding: "4px" }}>(firma en documento impreso)</div>
                </td>
              </tr>
              <tr style={{ height: 22 }}>
                <td colSpan={2} style={tdLabel}><CeldaLabel>Parentesco</CeldaLabel></td>
                <td colSpan={10} style={tdBase}>
                  <CeldaInput value={reverso.parentesco_c} onChange={setR("parentesco_c")} />
                </td>
              </tr>

              {/* ── Sección D — Negativa ───────────────────────────────────── */}
              <tr>
                <td colSpan={12} style={{ ...sectionHeader, border: "1px solid #000", borderTop: "2px solid #000" }}>
                  D. NEGATIVA DEL CONSENTIMIENTO INFORMADO
                </td>
              </tr>
              <tr>
                <td colSpan={1} style={tdLabel}><CeldaLabel>FECHA</CeldaLabel></td>
                <td colSpan={11} style={tdBase}>
                  <input type="date" value={reverso.fecha_negativa}
                    onChange={(e) => setR("fecha_negativa")(e.target.value)}
                    style={{ border: "none", fontSize: "9px", padding: "2px 3px", width: "auto", outline: "none" }} />
                </td>
              </tr>
              {/* Texto legal — sección D */}
              <tr>
                <td colSpan={12} style={{ ...tdBase, fontSize: "8.5px", padding: "6px 8px", lineHeight: 1.6, background: "#fafafa" }}>
                  Una vez que he entendido claramente el procedimiento propuesto, así como las consecuencias posibles si no se realiza la intervención, no autorizo y me niego a que se me realice el procedimiento propuesto y desvinculo de responsabilidades futuras de cualquier índole al establecimiento de salud y al profesional sanitario que me atiende, por no realizar la intervención sugerida.
                </td>
              </tr>
              <tr style={{ height: 28 }}>
                <td colSpan={4} style={tdLabel}><CeldaLabel>Nombre completo del paciente.</CeldaLabel></td>
                <td colSpan={3} style={tdLabel}><CeldaLabel>Cédula de ciudadanía.</CeldaLabel></td>
                <td colSpan={5} style={tdLabel}><CeldaLabel>Firma del paciente o huella, según el caso.</CeldaLabel></td>
              </tr>
              <tr style={{ height: 24 }}>
                <td colSpan={4} style={tdBase}><CeldaInput value={reverso.nombre_paciente_negativa} onChange={setR("nombre_paciente_negativa")} /></td>
                <td colSpan={3} style={tdBase}><CeldaInput value={reverso.cedula_paciente_negativa} onChange={setR("cedula_paciente_negativa")} center /></td>
                <td colSpan={5} style={{ ...tdBase, background: "#f9f9f9" }}>
                  <div style={{ fontSize: "7px", color: "#999", textAlign: "center", padding: "4px" }}>(firma en documento impreso)</div>
                </td>
              </tr>
              <tr style={{ height: 28 }}>
                <td colSpan={4} style={tdLabel}><CeldaLabel>Nombre del profesional que realiza el procedimiento.</CeldaLabel></td>
                <td colSpan={8} style={tdLabel}><CeldaLabel>Firma, sello y código del profesional de la salud.</CeldaLabel></td>
              </tr>
              <tr style={{ height: 24 }}>
                <td colSpan={4} style={tdBase}><CeldaInput value={reverso.nombre_profesional_neg} onChange={setR("nombre_profesional_neg")} /></td>
                <td colSpan={8} style={{ ...tdBase, background: "#f9f9f9" }}>
                  <div style={{ fontSize: "7px", color: "#999", textAlign: "center", padding: "4px" }}>(firma + sello en documento impreso)</div>
                </td>
              </tr>
              <tr>
                <td colSpan={12} style={{ ...subSectionHeader, border: "1px solid #000" }}>
                  Si el paciente no está en capacidad para firmar:
                </td>
              </tr>
              <tr style={{ height: 24 }}>
                <td colSpan={4} style={tdBase}><CeldaInput value={reverso.nombre_representante_d} onChange={setR("nombre_representante_d")} placeholder="Nombre representante legal" /></td>
                <td colSpan={3} style={tdBase}><CeldaInput value={reverso.cedula_representante_d} onChange={setR("cedula_representante_d")} center placeholder="Cédula" /></td>
                <td colSpan={5} style={{ ...tdBase, background: "#f9f9f9" }}>
                  <div style={{ fontSize: "7px", color: "#999", textAlign: "center", padding: "4px" }}>(firma en documento impreso)</div>
                </td>
              </tr>
              <tr style={{ height: 22 }}>
                <td colSpan={2} style={tdLabel}><CeldaLabel>Parentesco</CeldaLabel></td>
                <td colSpan={10} style={tdBase}><CeldaInput value={reverso.parentesco_d} onChange={setR("parentesco_d")} /></td>
              </tr>

              {/* Testigo */}
              <tr>
                <td colSpan={12} style={{ ...subSectionHeader, border: "1px solid #000" }}>
                  Si el paciente no acepta el procedimiento sugerido por el profesional de salud:
                </td>
              </tr>
              <tr style={{ height: 28 }}>
                <td colSpan={4} style={tdLabel}><CeldaLabel>Nombre completo del testigo.</CeldaLabel></td>
                <td colSpan={3} style={tdLabel}><CeldaLabel>Cédula de ciudadanía.</CeldaLabel></td>
                <td colSpan={5} style={tdLabel}><CeldaLabel>Firma del testigo.</CeldaLabel></td>
              </tr>
              <tr style={{ height: 24 }}>
                <td colSpan={4} style={tdBase}><CeldaInput value={reverso.nombre_testigo} onChange={setR("nombre_testigo")} /></td>
                <td colSpan={3} style={tdBase}><CeldaInput value={reverso.cedula_testigo} onChange={setR("cedula_testigo")} center /></td>
                <td colSpan={5} style={{ ...tdBase, background: "#f9f9f9" }}>
                  <div style={{ fontSize: "7px", color: "#999", textAlign: "center", padding: "4px" }}>(firma en documento impreso)</div>
                </td>
              </tr>

              {/* ── Sección E — Revocatoria ────────────────────────────────── */}
              <tr>
                <td colSpan={12} style={{ ...sectionHeader, border: "1px solid #000", borderTop: "2px solid #000" }}>
                  E. REVOCATORIA DEL CONSENTIMIENTO INFORMADO
                </td>
              </tr>
              {/* Texto legal — sección E */}
              <tr>
                <td colSpan={12} style={{ ...tdBase, fontSize: "8.5px", padding: "6px 8px", lineHeight: 1.6, background: "#fafafa" }}>
                  De forma libre y voluntaria, revoco el consentimiento realizado en fecha y manifiesto expresamente mi deseo de no continuar con el procedimiento médico que doy por finalizado en esta fecha. Libero de responsabilidades futuras de cualquier índole al establecimiento de salud y al profesional sanitario que me atiende.
                </td>
              </tr>
              <tr style={{ height: 28 }}>
                <td colSpan={4} style={tdLabel}><CeldaLabel>Nombre completo del paciente.</CeldaLabel></td>
                <td colSpan={3} style={tdLabel}><CeldaLabel>Cédula de ciudadanía.</CeldaLabel></td>
                <td colSpan={5} style={tdLabel}><CeldaLabel>Firma del paciente o huella, según el caso.</CeldaLabel></td>
              </tr>
              <tr style={{ height: 24 }}>
                <td colSpan={4} style={tdBase}><CeldaInput value={reverso.nombre_paciente_rev} onChange={setR("nombre_paciente_rev")} /></td>
                <td colSpan={3} style={tdBase}><CeldaInput value={reverso.cedula_paciente_rev} onChange={setR("cedula_paciente_rev")} center /></td>
                <td colSpan={5} style={{ ...tdBase, background: "#f9f9f9" }}>
                  <div style={{ fontSize: "7px", color: "#999", textAlign: "center", padding: "4px" }}>(firma en documento impreso)</div>
                </td>
              </tr>
              <tr style={{ height: 28 }}>
                <td colSpan={4} style={tdLabel}><CeldaLabel>Nombre del profesional que realiza el procedimiento.</CeldaLabel></td>
                <td colSpan={8} style={tdLabel}><CeldaLabel>Firma, sello y código del profesional de la salud.</CeldaLabel></td>
              </tr>
              <tr style={{ height: 24 }}>
                <td colSpan={4} style={tdBase}><CeldaInput value={reverso.nombre_profesional_rev} onChange={setR("nombre_profesional_rev")} /></td>
                <td colSpan={8} style={{ ...tdBase, background: "#f9f9f9" }}>
                  <div style={{ fontSize: "7px", color: "#999", textAlign: "center", padding: "4px" }}>(firma + sello en documento impreso)</div>
                </td>
              </tr>
              <tr>
                <td colSpan={12} style={{ ...subSectionHeader, border: "1px solid #000" }}>
                  Si el paciente no está en capacidad para firmar:
                </td>
              </tr>
              <tr style={{ height: 24 }}>
                <td colSpan={4} style={tdBase}><CeldaInput value={reverso.nombre_representante_e} onChange={setR("nombre_representante_e")} placeholder="Nombre representante legal" /></td>
                <td colSpan={3} style={tdBase}><CeldaInput value={reverso.cedula_representante_e} onChange={setR("cedula_representante_e")} center placeholder="Cédula" /></td>
                <td colSpan={5} style={{ ...tdBase, background: "#f9f9f9" }}>
                  <div style={{ fontSize: "7px", color: "#999", textAlign: "center", padding: "4px" }}>(firma en documento impreso)</div>
                </td>
              </tr>
              <tr style={{ height: 22 }}>
                <td colSpan={2} style={tdLabel}><CeldaLabel>Parentesco</CeldaLabel></td>
                <td colSpan={10} style={tdBase}><CeldaInput value={reverso.parentesco_e} onChange={setR("parentesco_e")} /></td>
              </tr>

              {/* Footer reverso */}
              <tr>
                <td colSpan={7} style={{ border: "1px solid #000", fontSize: "8px", fontWeight: 700, padding: "3px 4px" }}>
                  SNS-MSP / HCU-form.024/2016
                </td>
                <td colSpan={5} style={{ border: "1px solid #000", fontSize: "10px", fontWeight: 700, textAlign: "right", padding: "3px 4px" }}>
                  CONSENTIMIENTO INFORMADO (2)
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
});

export default ConsentimientoForm024;

// ─── Helper estilos botones ───────────────────────────────────────────────────
function btnStyle(color: string): React.CSSProperties {
  return {
    background: color,
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "5px 12px",
    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "Arial, sans-serif",
  };
}
