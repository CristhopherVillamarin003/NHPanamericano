"use client";

import React, { useState, useImperativeHandle, useEffect } from "react";
import RichTextEvolucion from "../ui/RichTextEvolucion";
import { useFormAutosaveAndWarn } from "@/hooks/useFormAutosaveAndWarn";

export function stripMedicoData(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const nodes = Array.from(doc.body.childNodes);
    
    const isDoctorNode = new Array(nodes.length).fill(false);
    
    for (let i = 0; i < nodes.length; i++) {
      const text = (nodes[i].textContent || '').trim().toUpperCase();
      
      const hasCI = text.includes('CI:') || text.includes('C.I:') || text.includes('C.I.:');
      const hasDr = text.startsWith('DR. ') || text.startsWith('DRA. ') || text.startsWith('MD. ') || text.startsWith('M.D. ') || text.startsWith('MÉDICO TRATANTE') || text.startsWith('MEDICO TRATANTE') || text.startsWith('DR ') || text.startsWith('DRA ');
      
      if (hasCI || hasDr) {
        isDoctorNode[i] = true;
        
        if (text.startsWith('CI:') || text.startsWith('C.I:') || text.startsWith('C.I.:')) {
           if (i > 0) {
             const prevText = (nodes[i-1].textContent || '').trim();
             if (prevText.length > 0 && prevText.length < 100) isDoctorNode[i - 1] = true;
           }
           if (i < nodes.length - 1) {
             const nextText = (nodes[i+1].textContent || '').trim();
             if (nextText.length > 0 && nextText.length < 100) isDoctorNode[i + 1] = true;
           }
        }
      }
    }
    
    let cleanedHtml = '';
    for (let i = 0; i < nodes.length; i++) {
      if (!isDoctorNode[i]) {
        if (nodes[i].nodeType === Node.ELEMENT_NODE) {
          cleanedHtml += (nodes[i] as Element).outerHTML;
        } else if (nodes[i].nodeType === Node.TEXT_NODE) {
          cleanedHtml += nodes[i].textContent || '';
        }
      }
    }
    
    return cleanedHtml.replace(/(<p>\s*<\/p>|<p><\/p>|<p><br><\/p>)+$/, '');
  } catch (e) {
    return html;
  }
}

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
                enableMedicoSelect={true}
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

const PLANTILLA_INGRESO = `<p><strong>NOTA DE INGRESO</strong></p>
<p><strong>CIRUGÍA GENERAL</strong></p>
<p><strong>INGRESO:</strong>&nbsp;</p>
<p>&nbsp;</p>
<p><strong>HABITACION:</strong>&nbsp;</p>
<p><strong>DH:</strong>&nbsp;</p>
<p><strong>SEGURO:</strong> PARTICULAR</p>
<p>&nbsp;</p>
<p>PACIENTE FEMENINA DE 63 AÑOS, NACIDA Y RESIDENTE EN MACHACHI; ESTADO CIVIL: CASADA; OCUPACION: QQDD; INSTRUCCION: BACHILLER; RELIGIÓN: CATOLICA; ETNIA: MESTIZA; LATERALIDAD: DIESTRA; GRUPO SANGUINEO: A RH (+)</p>
<p><strong>APP:</strong> HIPOTIROIDISMO</p>
<p><strong>MEDICACION:</strong> LEVOTIROXINA 25MCG VO QD AM</p>
<p><strong>APF:</strong> MADRE FALLECIDA POR CANCER DE ESTOMAGO, PADRE FALLECIDO POR CANCER PULMONAR</p>
<p><strong>AQX:</strong> NO REFIERE</p>
<p><strong>AGO:</strong> G:4 P:3 C:0 A:1 HV:2: MENARQUIA: 12 AÑOS; MENOPAUSIA: 48 AÑOS</p>
<p><strong>ALERGIAS:</strong> NO REFIERE</p>
<p><strong>INMUNIZACION:</strong> 2 DOSIS DE COVID 19</p>
<p><strong>HABITOS:</strong> ALCOHOL: NIEGA; TABACO: NIEGA; DROGAS: NIEGA</p>
<p>INFORMACION REFERIDA VERBALMENTE POR PACIENTE</p>
<p>&nbsp;</p>
<p><strong>MOTIVO DE CONSULTA:</strong> CIRUGIA PROGRAMADA</p>
<p>&nbsp;</p>
<p><strong>ENFERMEDAD ACTUAL:</strong> PACIENTE REFIERE DESDE HACE ALGUNOS MESES PRESENTA DOLOR A NIVEL DE REGION DE HIPOCONDRIO DERECHO POSTERIOR A LA INGESTA DE COMIDA COPIOSA POR LO QUE SE REALIZA ECOGRAFIA DE ABDOMEN SUPERIOR DONDE SE EVIDENCIA LITIASIS VESICULAR POR LO QUE DECIDE PROGRAMACION DE RESOLUCION QUIRURGICA.</p>
<p>&nbsp;</p>
<p><strong>EXAMEN FISICO:</strong></p>
<p><strong>SIGNOS VITALES:</strong></p>
<p><strong>TA:</strong> 125/76 MMHG &nbsp;<strong>FC:</strong> 65 LPM &nbsp;<strong>FR:</strong> 20 RPM &nbsp;<strong>SPO2:</strong> 85% AA</p>
<p><strong>T°:</strong> 35.5°C</p>
<p>PACIENTE CONSCIENTE, ORIENTADA, SEMIHIDRATADA. CABEZA: NORMOCEFALICA. OJOS: PUPILAS ISOCORICAS, ANICTERICAS. CARA: BOCA: MUCOSA ORAL SEMIHUMEDA. CUELLO: SIMETRICO, MOVIL, NO ADENOPATÍAS VISIBLES O PALPABLES. TÓRAX: BUENA MECANICA VENTILATORIA, MV CONSERVADOS, NO RUIDOS AGREGADOS. CORAZON: RSCSRS. ABDOMEN: BLANDO, DEPRESIBLE, RHA PRESENTES, NO DOLOROSO A LA PALPACION SUPERFICIAL NI PROFUNDA, MURPHY (-), NO SIGNOS DE IRRITACION PERITONEAL. RIG: FEMENINOS NORMOCONFIGURADOS. EXTREMIDADES: MOVILES, SIMETRICAS, FUNCION NEUROVASCULAR CONSERVADA, NO EDEMAS.</p>
<p>&nbsp;</p>
<p><strong>PLAN:</strong> COLELAP</p>
<p>&nbsp;</p>
<p><strong>DIAGNOSTICOS:</strong></p>
<p>CALCULO DE LA VESICULA BILIAR SIN COLECISTITIS (CIE10: K802)</p>
<p>HIPOTIRODISMO, NO ESPECIFICADO (CIE10: E039)</p>`;

const PLANTILLA_FARMACOTERAPIA_INGRESO = `<p><strong>INDICACIONES</strong></p>
<p>&nbsp;</p>
<p><strong>A. ENFERMERIA</strong></p>
<ol>
<li><p>CONTROL DE SIGNOS VITALES + SAT O2 CADA 8 HORAS</p></li>
<li><p>CABECERA ELEVADA A 45 GRADOS</p></li>
<li><p>CUIDADOS HABITUALES DE ENFERMERIA</p></li>
<li><p>CUIDADOS DE VIAS Y ABORDAJES</p></li>
<li><p>APLICAR PROTOCOLOS DE PREVENCION DE ETE, CAIDAS, IDENTIFICACION Y ULCERAS POR PRESION</p></li>
<li><p>CONTROL DE INGESTA Y EXCRETA</p></li>
</ol>
<p><strong>B. NUTRICION</strong></p>
<ol>
<li><p>NPO</p></li>
</ol>
<p><strong>C. INFUSIONES</strong></p>
<ol>
<li><p>LACTATO DE RINGER 1000ML, VIA IV, A 80CC/HORA</p></li>
</ol>
<p><strong>D. MEDICACION</strong></p>
<ol>
<li><p>AMPICILINA MAS SULBACTAM 3G, VIA IV, STAT</p></li>
<li><p>OMEPRAZOL 40MG, VIA IV, STAT</p></li>
</ol>
<p><strong>E. VENTILACION</strong></p>
<ol>
<li><p>AIRE AMBIENTE</p></li>
</ol>
<p><strong>F. PROCEDIMIENTOS</strong></p>
<ol>
<li><p>LABORATORIOS: BIOMETRIA HEMATICA, GLUCOSA, UREA, CREATININA, TIEMPOS DE COAGULACION - STAT</p></li>
<li><p>IMAGENOLOGIA: ELECTROCARDIOGRAMA - STAT</p></li>
<li><p>FIRMA DE CONSENTIMIENTOS INFORMADOS</p></li>
<li><p>COMUNICAR NOVEDADES</p></li>
</ol>`;

const PLANTILLA_POSTQUIRURGICA_TEXTO = `<p><strong>NOTA POST QUIRURGICA</strong></p>
<p><strong>CIRUGIA GENERAL</strong></p>
<p><strong>INGRESO:</strong>&nbsp;</p>
<p>&nbsp;</p>
<p>PACIENTE FEMENINA DE 64 AÑOS DE EDAD</p>
<p>&nbsp;</p>
<p><strong>DIAGNOSTICO PREOPERATORIO:</strong></p>
<p>CALCULO DE LA VESICULA BILIAR SIN COLECISTITIS (CIE10: K802)</p>
<p>&nbsp;</p>
<p><strong>DIAGNOSTICO POST OPERATORIO:</strong></p>
<p>CALCULO DE LA VESICULA BILIAR SIN COLECISTITIS (CIE10: K802)</p>
<p>&nbsp;</p>
<p><strong>CIRUGIA PROYECTADA:</strong> COLELAP</p>
<p>&nbsp;</p>
<p><strong>CIRUGIA REALIZADA:</strong> COLELAP</p>
<p>&nbsp;</p>
<p><strong>HALLAZGOS:</strong></p>
<ol>
<li><p>VESICULA BILIAR CON PAREDES ENGROSADAS Y FIBROSADAS CON MULTIPLES LITOS DE APROXIMADAMENTE 1CM EN SU INTERIOR</p></li>
<li><p>CONDUCTO CORTO Y FINO</p></li>
<li><p>VIA BILIAR NORMAL</p></li>
<li><p>HIGADO GRADO</p></li>
<li><p>RESTO DE EXPLORACION SIN PATOLOGIA</p></li>
</ol>
<p>&nbsp;</p>
<p><strong>TEAM:</strong></p>
<p><strong>CIRUJANO:</strong> DR. JOSE CAMPUZANO</p>
<p><strong>AYUDANTE:</strong> DRA. KARLA CUCHIPE</p>
<p><strong>ANESTESIOLOGO:</strong> DR. WILLIAM VALENZUELA</p>
<p><strong>INSTRUMENTISTA:</strong> TLGA. KARLA YUNGAN</p>
<p>&nbsp;</p>
<p><strong>COMPLICACIONES:</strong> NINGUNA</p>
<p><strong>DRENAJE:</strong> NO</p>
<p><strong>HISTOPATOLOGICO:</strong> NO</p>
<p><strong>SANGRADO:</strong> ESCASO</p>
<p>&nbsp;</p>
<p>MATERIAL BLANCO COMPLETO</p>`;

const PLANTILLA_POSTQUIRURGICA_FARMACO = `<p><strong>INDICACIONES</strong></p>
<p>&nbsp;</p>
<p><strong>A. ENFERMERIA</strong></p>
<ol>
<li><p>MONITOREO CONTINUO DE SIGNOS VITALES CADA 15 MINUTOS POR 2 HORAS Y LUEGO</p></li>
<li><p>CONTROL DE SIGNOS VITALES + SAT O2 CADA 8 HORAS</p></li>
<li><p>CABECERA ELEVADA A 45 GRADOS</p></li>
<li><p>CUIDADOS HABITUALES DE ENFERMERIA</p></li>
<li><p>DEAMBULACION TEMPRANA</p></li>
<li><p>CUIDADOS DE VIAS Y ABORDAJES</p></li>
<li><p>APLICAR PROTOCOLOS DE PREVENCION DE ETE, CAIDAS, IDENTIFICACION Y ULCERAS POR PRESION</p></li>
<li><p>CONTROL DE INGESTA Y EXCRETA</p></li>
</ol>
<p><strong>B. NUTRICION</strong></p>
<ol>
<li><p>NPO POR 6 HORAS, LUEGO PROBAR TOLERANCIA A LIQUIDOS CLAROS, SI TOLERA PASAR</p></li>
<li><p>01 DIETA LIQUIDA AMPLIA (MERIENDA)</p></li>
</ol>
<p><strong>C. INFUSIONES</strong></p>
<ol>
<li><p>SOLUCION SALINA 0.9% 1000ML, VIA IV, A 80CC/H</p></li>
</ol>
<p><strong>D. MEDICACION</strong></p>
<ol>
<li><p>AMPICILINA MAS SULBACTAM 1.5G, VIA IV, CADA 6 HORAS (D:0)</p></li>
<li><p>PARACETAMOL 1G, VIA IV, CADA 8 HORAS</p></li>
<li><p>KETOROLACO 30MG, VIA IV, CADA 8 HORAS (ALTERNANDO CON PARACETAMOL)</p></li>
<li><p>OMEPRAZOL 40MG, VIA IV, CADA DIA</p></li>
<li><p>METAMIZOL 2G, VIA IV, PRN</p></li>
<li><p>ONDANSETRON 8 MG, VIA IV, PRN</p></li>
</ol>
<p><strong>E. VENTILACION</strong></p>
<ol>
<li><p>AIRE AMBIENTE</p></li>
</ol>
<p><strong>F. PROCEDIMIENTOS</strong></p>
<ol>
<li><p>CURACION DE HERIDAS: QD Y PRN</p></li>
<li><p>HISTOPATOLOGICO: NO</p></li>
<li><p>COMUNICAR NOVEDADES</p></li>
</ol>`;

const PLANTILLA_EVO_NOCHE_TEXTO = `<p><strong>NOTA DE EVOLUCION DE LA NOCHE</strong></p>
<p><strong>CIRUGIA GENERAL</strong></p>
<p><strong>INGRESO:</strong>&nbsp;</p>
<p>&nbsp;</p>
<p><strong>HAB:</strong>&nbsp;</p>
<p><strong>DH:</strong>&nbsp;</p>
<p><strong>SEGURO:</strong> PARTICULAR</p>
<p>&nbsp;</p>
<p>PACIENTE FEMENINA DE 64 AÑOS DE EDAD</p>
<p>&nbsp;</p>
<p><strong>DIAGNOSTICO POST OPERATORIO:</strong></p>
<p>CALCULO DE LA VESICULA BILIAR SIN COLECISTITIS (CIE10: K802)</p>
<p>&nbsp;</p>
<p><strong>DIAGNOSTICO SECUNDARIO:</strong></p>
<p>OBESIDAD, NO ESPECIFICADA (CIE10: E669)</p>
<p>&nbsp;</p>
<p><strong>CIRUGIA REALIZADA:</strong> COLELAP</p>
<p>&nbsp;</p>
<p><strong>SUBJETIVO:</strong> PACIENTE DESCANSANDO, REFIERE LEVES MOLESTIAS EN SITIO QUIRURGICO.</p>
<p>&nbsp;</p>
<p><strong>OBJETIVO:</strong></p>
<p><strong>SIGNOS VITALES:</strong></p>
<p><strong>PA:</strong> 120/68 MMHG &nbsp;<strong>FC:</strong> 76 LPM &nbsp;<strong>FR:</strong> 18 RPM &nbsp;<strong>SPO2:</strong> 90% AA</p>
<p><strong>T°:</strong> 37.0°C</p>
<p>PACIENTE CONSCIENTE, ORIENTADA, SEMIHIDRATADA. CABEZA: NORMOCEFALICA. OJOS: PUPILAS ISOCORICAS, ANICTERICAS. CARA: BOCA: MUCOSA ORAL SEMIHUMEDA. CUELLO: SIMETRICO, MOVIL, NO ADENOPATÍAS VISIBLES O PALPABLES. TÓRAX: BUENA MECANICA VENTILATORIA, MV CONSERVADOS, NO RUIDOS AGREGADOS. CORAZON: RSCSRS. ABDOMEN: ABUNDANTE PANICULO ADIPOSO, BLANDO, DEPRESIBLE, RHA PRESENTES, LEVEMENTE DOLOROSO EN SITIOS QUIRURGICOS, NO SIGNOS DE IRRITACION PERITONEAL. RIG: FEMENINOS NORMOCONFIGURADOS. EXTREMIDADES: MOVILES, SIMETRICAS, FUNCION NEUROVASCULAR CONSERVADA, NO EDEMAS.</p>
<p>&nbsp;</p>
<p><strong>ANALISIS:</strong> PACIENTE POSTQUIRURGICA DE COLELAP, EN CONDICIONES FAVORABLES, AFEBRIL, CON BUEN MANEJO DE DOLOR, INICIA TOLERANCIA A DIETA LIQUIDA SIN COMPLICACION, PERMANECE EN OBSERVACION.</p>
<p>&nbsp;</p>
<p><strong>PLAN:</strong> INDICACIONES</p>`;

const PLANTILLA_EVO_NOCHE_FARMACO = `<p><strong>INDICACIONES</strong></p>
<p>&nbsp;</p>
<p><strong>A. ENFERMERIA</strong></p>
<ol>
<li><p>CONTROL DE SIGNOS VITALES + SAT O2 CADA 8 HORAS</p></li>
<li><p>CABECERA ELEVADA A 45 GRADOS</p></li>
<li><p>CUIDADOS HABITUALES DE ENFERMERIA</p></li>
<li><p>DEAMBULACION TEMPRANA</p></li>
<li><p>CUIDADOS DE VIAS Y ABORDAJES</p></li>
<li><p>APLICAR PROTOCOLOS DE PREVENCION DE ETE, CAIDAS, IDENTIFICACION Y ULCERAS POR PRESION</p></li>
<li><p>CONTROL DE INGESTA Y EXCRETA</p></li>
</ol>
<p><strong>B. NUTRICION</strong></p>
<ol>
<li><p>DIETA LIQUIDA AMPLIA (MERIENDA)</p></li>
<li><p>DIETA BLANDA INTESTINAL (DESAYUNO)</p></li>
</ol>
<p><strong>C. INFUSIONES</strong></p>
<ol>
<li><p>SOLUCION SALINA 0.9% 1000ML, VIA IV, A 80CC/H, TERMINAR PRESENTE SOLUCION Y PASAR A</p></li>
<li><p>DISH</p></li>
</ol>
<p><strong>D. MEDICACION</strong></p>
<ol>
<li><p>AMPICILINA MAS SULBACTAM 1.5G, VIA IV, CADA 6 HORAS (D:0)</p></li>
<li><p>PARACETAMOL 1G, VIA IV, CADA 8 HORAS</p></li>
<li><p>KETOROLACO 30MG, VIA IV, CADA 8 HORAS (ALTERNANDO CON PARACETAMOL)</p></li>
<li><p>OMEPRAZOL 40MG, VIA IV, CADA DIA</p></li>
<li><p>METAMIZOL 2G, VIA IV, PRN</p></li>
<li><p>ONDANSETRON 8 MG, VIA IV, PRN</p></li>
</ol>
<p><strong>E. VENTILACION</strong></p>
<ol>
<li><p>AIRE AMBIENTE</p></li>
</ol>
<p><strong>F. PROCEDIMIENTOS</strong></p>
<ol>
<li><p>CURACION DE HERIDAS: QD Y PRN</p></li>
<li><p>COMUNICAR NOVEDADES</p></li>
</ol>`;

const PLANTILLA_EVO_MANANA_TEXTO = `<p><strong>NOTA DE EVOLUCION DE LA MAÑANA</strong></p>
<p><strong>CIRUGIA GENERAL</strong></p>
<p><strong>INGRESO:</strong>&nbsp;</p>
<p>&nbsp;</p>
<p><strong>HAB:</strong>&nbsp;</p>
<p><strong>DH:</strong>&nbsp;</p>
<p><strong>SEGURO:</strong> PARTICULAR</p>
<p>&nbsp;</p>
<p>PACIENTE FEMENINA DE 64 AÑOS DE EDAD</p>
<p>&nbsp;</p>
<p><strong>DIAGNOSTICO POST OPERATORIO:</strong></p>
<p>CALCULO DE LA VESICULA BILIAR SIN COLECISTITIS (CIE10: K802)</p>
<p>&nbsp;</p>
<p><strong>DIAGNOSTICO SECUNDARIO:</strong></p>
<p>OBESIDAD, NO ESPECIFICADA (CIE10: E669)</p>
<p>&nbsp;</p>
<p><strong>CIRUGIA REALIZADA:</strong> COLELAP</p>
<p>&nbsp;</p>
<p><strong>SUBJETIVO:</strong> PACIENTE DESCANSA TODA LA NOCHE, REFIERE LEVE DOLOR EN HIPOCONDRIO DERECHO.</p>
<p>&nbsp;</p>
<p><strong>OBJETIVO:</strong></p>
<p><strong>SIGNOS VITALES:</strong></p>
<p><strong>PA:</strong> 105/59 MMHG &nbsp;<strong>FC:</strong> 74 LPM &nbsp;<strong>FR:</strong> 15 RPM &nbsp;<strong>SPO2:</strong> 90% AA</p>
<p><strong>T°:</strong> 36.3°C</p>
<p>PACIENTE CONSCIENTE, ORIENTADA, SEMIHIDRATADA. CABEZA: NORMOCEFALICA. OJOS: PUPILAS ISOCORICAS, ANICTERICAS. CARA: BOCA: MUCOSA ORAL SEMIHUMEDA. CUELLO: SIMETRICO, MOVIL, NO ADENOPATÍAS VISIBLES O PALPABLES. TÓRAX: BUENA MECANICA VENTILATORIA, MV CONSERVADOS, NO RUIDOS AGREGADOS. CORAZON: RSCSRS. ABDOMEN: ABUNDANTE PANICULO ADIPOSO, BLANDO, DEPRESIBLE, RHA PRESENTES, LEVEMENTE DOLOROSO EN SITIOS QUIRURGICOS, NO SIGNOS DE IRRITACION PERITONEAL. RIG: FEMENINOS NORMOCONFIGURADOS. EXTREMIDADES: MOVILES, SIMETRICAS, FUNCION NEUROVASCULAR CONSERVADA, NO EDEMAS.</p>
<p>&nbsp;</p>
<p><strong>ANALISIS:</strong> PACIENTE PERMANECE HEMODINAMICAMENTE ESTABLE, AFEBRIL, CON ADECUADA TOLERANCIA ORAL, BUEN MANEJO DE DOLOR, INICIA DEAMBULACION SIN DIFICULTAD, PERMANECE EN OBSERVACION, SE PROGRESA DIETA PARA DEFINIR CONDUCTA.</p>
<p>&nbsp;</p>
<p><strong>PLAN:</strong> INDICACIONES</p>
<p>&nbsp;</p>
<p><strong>INGESTA:</strong> 2500CC</p>
<p><strong>EXCRETA:</strong> 1100CC</p>
<p><strong>BH:</strong> +1400CC</p>`;

const PLANTILLA_EVO_MANANA_FARMACO = `<p><strong>INDICACIONES</strong></p>
<p>&nbsp;</p>
<p><strong>A. ENFERMERIA</strong></p>
<ol>
<li><p>CONTROL DE SIGNOS VITALES + SAT O2 CADA 8 HORAS</p></li>
<li><p>CABECERA ELEVADA A 45 GRADOS</p></li>
<li><p>CUIDADOS HABITUALES DE ENFERMERIA</p></li>
<li><p>DEAMBULACION ASISTIDA</p></li>
<li><p>CUIDADOS DE VIAS Y ABORDAJES</p></li>
<li><p>APLICAR PROTOCOLOS DE PREVENCION DE ETE, CAIDAS, IDENTIFICACION Y ULCERAS POR PRESION</p></li>
<li><p>CONTROL DE INGESTA Y EXCRETA</p></li>
</ol>
<p><strong>B. NUTRICION</strong></p>
<ol>
<li><p>01 DIETA BLANDA INTESTINAL (DESAYUNO)</p></li>
</ol>
<p><strong>C. INFUSIONES</strong></p>
<ol>
<li><p>DISH</p></li>
</ol>
<p><strong>D. MEDICACION</strong></p>
<ol>
<li><p>AMPICILINA MAS SULBACTAM 1.5G, VIA IV, CADA 6 HORAS (D:1)</p></li>
<li><p>PARACETAMOL 1G, VIA IV, CADA 8 HORAS</p></li>
<li><p>KETOROLACO 30MG, VIA IV, CADA 8 HORAS (ALTERNANDO CON PARACETAMOL)</p></li>
<li><p>OMEPRAZOL 40MG, VIA IV, CADA DIA</p></li>
</ol>
<p><strong>E. VENTILACION</strong></p>
<ol>
<li><p>AIRE AMBIENTE</p></li>
</ol>
<p><strong>F. PROCEDIMIENTOS</strong></p>
<ol>
<li><p>CURACION DE HERIDAS: QD Y PRN</p></li>
<li><p>COMUNICAR NOVEDADES</p></li>
</ol>`;

const PLANTILLA_ALTA_TEXTO = `<p><strong>NOTA DE ALTA</strong></p>
<p><strong>CIRUGIA GENERAL</strong></p>
<p><strong>INGRESO:</strong>&nbsp;</p>
<p>&nbsp;</p>
<p><strong>HAB:</strong>&nbsp;</p>
<p><strong>DH:</strong>&nbsp;</p>
<p><strong>SEGURO:</strong> PARTICULAR</p>
<p>&nbsp;</p>
<p>PACIENTE FEMENINA DE 64 AÑOS DE EDAD</p>
<p>&nbsp;</p>
<p><strong>DIAGNOSTICO POST OPERATORIO:</strong></p>
<p>CALCULO DE LA VESICULA BILIAR SIN COLECISTITIS (CIE10: K802)</p>
<p>&nbsp;</p>
<p><strong>DIAGNOSTICO SECUNDARIO:</strong></p>
<p>OBESIDAD, NO ESPECIFICADA (CIE10: E669)</p>
<p>&nbsp;</p>
<p><strong>CIRUGIA REALIZADA:</strong> COLELAP</p>
<p>&nbsp;</p>
<p>PACIENTE FEMENINA QUE CURSA SU RECUPERACION POSTQUIRURGICA EN BUENAS CONDICIONES, CON BUEN MANEJO DEL DOLOR, NO HA REALIZADO ALZAS TERMICAS, DIURESIS ESPONTANEA, RHA (+), CANALIZA FLATOS, CON BUENA TOLERANCIA A DIETA ORAL IMPLEMENTADA, NO SIGNOS DE IRRITACION PERITONEAL.</p>
<p>&nbsp;</p>
<p>POSTERIOR A VALORACION DE MEDICO TRATANTE SE DECIDE ALTA MEDICA HOY CON INDICACIONES AMBULATORIAS.</p>
<p>AL EXAMEN FISICO:</p>
<p>ABDOMEN: RSHS (+), SUAVE, DEPRESIBLE, LEVEMENTE DOLOROSO A LA PALPACION A NIVEL SITIOS QUIRURGICOS, HERIDAS QUIRURGICAS EN BUENAS CONDICIONES.</p>
<p>PACIENTE QUE EGRESA DE ESTA CASA DE SALUD EN BUENAS CONDICIONES, VIVA, DEAMBULANDO SIN DIFICULTAD, EN COMPAÑIA DE SUS FAMILIARES, SE INFORMA INDICACIONES DE ALTA + SIGNOS DE ALARMA</p>
<p>&nbsp;</p>
<p><strong>P:</strong> ALTA + INDICACIONES</p>`;

const PLANTILLA_ALTA_FARMACO = `<p><strong>INDICACIONES</strong></p>
<ol>
<li><p>ALTA MEDICA</p></li>
<li><p>SULTAMICILINA TABLETAS 750 MG TOMAR 1 TABLETA CADA 12 HORAS POR 5 DIAS</p></li>
<li><p>PARACETAMOL (ANALGAN) TABLETAS 1G: TOMAR 1 TABLETA VIA ORAL CADA 8 HORAS POR 5 DIAS. (6AM - 14PM - 22PM)</p></li>
<li><p>IBUPROFENO (IBUFEN) TABLETAS 600MG: TOMAR 1 TABLETA VIA ORAL CADA 8 HORAS POR 5 DIAS. (8AM - 16PM - 23PM)</p></li>
<li><p>DIGESTOTAL FORTE (ENZIMAS DIGESTIVAS MAS SIMETICONA) TOMAR 1 CAPSULA VIA ORAL CADA 8 HORAS POR 10 DIAS</p></li>
<li><p>OMEPRAZOL 20MG: UNA TABLETA 30 MINUTOS ANTES DEL DESAYUNO POR 5 DIAS</p></li>
<li><p>DIETA: BLANDA, RICA EN PROTEÍNAS (CARNES BLANCAS, PESCADO), EVITAR: GRASAS, LACTEOS, CONDIMENTOS, ALIMENTOS PROCESADOS, GRANOS POR 5 DIAS.</p></li>
<li><p>BEBER ABUNDANTES LIQUIDOS.</p></li>
<li><p>CUIDADOS DE HERIDAS: LIMPIEZA DIARIA DE HERIDAS CON AGUA Y JABON.</p></li>
<li><p>SIGNOS DE ALARMA: FIEBRE, DOLOR ABDOMINAL INTENSO, SALIDA DE SECRECIÓN POR HERIDAS QUIRURGICAS.</p></li>
<li><p>CONTROL POR CONSULTA EXTERNA 20/07/2026</p></li>
<li><p>COMUNICAR NOVEDADES 0997006406</p></li>
</ol>`;

export type TipoNota = "INGRESO" | "POSTQUIRURGICA" | "EVOLUCION" | "ALTA";

function getPlantillaNota(tipo: TipoNota): string {
  switch (tipo) {
    case "INGRESO": return PLANTILLA_INGRESO;
    case "POSTQUIRURGICA": return PLANTILLA_POSTQUIRURGICA_TEXTO;
    case "EVOLUCION": return PLANTILLA_EVO_NOCHE_TEXTO;
    case "ALTA": return PLANTILLA_ALTA_TEXTO;
    default: return "";
  }
}

function getPlantillaFarmaco(tipo: TipoNota): string {
  switch (tipo) {
    case "INGRESO": return PLANTILLA_FARMACOTERAPIA_INGRESO;
    case "POSTQUIRURGICA": return PLANTILLA_POSTQUIRURGICA_FARMACO;
    case "EVOLUCION": return PLANTILLA_EVO_NOCHE_FARMACO;
    case "ALTA": return PLANTILLA_ALTA_FARMACO;
    default: return "<p><strong>INDICACIONES</strong></p>";
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
    farmacoterapia: getPlantillaFarmaco(tipoNota),
    administrar_farmacos: "",
  };
}

function crearBloquePersonalizado(paciente: Props["paciente"] | undefined, notasHtml: string, farmacoHtml: string): BloqueEvolucion {
  const bloque = crearBloqueVacio(paciente, "INGRESO");
  bloque.notas_evolucion = notasHtml;
  bloque.farmacoterapia = farmacoHtml;
  return bloque;
}

const EvolucionForm = React.forwardRef<HistoriaClinicaEvolucionHandle, Props>(
  ({ paciente, initialData, guardando = false, exportando = false, atencionId }, ref) => {
    
    const [datos, setDatos] = useState<DatosEvolucion>(() => {
      if (initialData?.bloques && initialData.bloques.length > 0) {
        return { bloques: [...initialData.bloques] };
      }
      return { 
        bloques: [
          crearBloqueVacio(paciente, "INGRESO"),
          crearBloquePersonalizado(paciente, PLANTILLA_POSTQUIRURGICA_TEXTO, PLANTILLA_POSTQUIRURGICA_FARMACO),
          crearBloquePersonalizado(paciente, PLANTILLA_EVO_NOCHE_TEXTO, PLANTILLA_EVO_NOCHE_FARMACO),
          crearBloquePersonalizado(paciente, PLANTILLA_EVO_MANANA_TEXTO, PLANTILLA_EVO_MANANA_FARMACO),
          crearBloquePersonalizado(paciente, PLANTILLA_ALTA_TEXTO, PLANTILLA_ALTA_FARMACO),
        ] 
      };
    });

    const { isDirty, clearAutosave } = useFormAutosaveAndWarn({
      formId: `hc_evolucion_${atencionId || 'new'}_${paciente?.cedula || 'new'}`,
      initialData: initialData || { bloques: [crearBloqueVacio(paciente)] },
      currentData: datos,
      onRestore: (saved) => setDatos(p => ({ ...p, ...saved })),
    });

    const handleAddBloque = (tipoNota: TipoNota) => {
      setDatos((prev) => {
        const newBloque = crearBloqueVacio(paciente, tipoNota);
        return {
          bloques: [...prev.bloques, newBloque],
        };
      });
    };

    const handleInsertBloque = (idx: number) => {
      setDatos((prev) => {
        const newBloque = crearBloqueVacio(paciente, "EVOLUCION");
        const newBloques = [...prev.bloques];
        newBloques.splice(idx + 1, 0, newBloque);
        return {
          bloques: newBloques,
        };
      });
    };

    const handleRemoveBloque = (idx: number) => {
      if (datos.bloques.length <= 1) return;
      setDatos((prev) => ({
        bloques: prev.bloques.filter((_, i) => i !== idx),
      }));
    };


    /** Dispara los eventos de sincronización a otras hojas */
    const fireSyncEvents = (idx: number, campo: keyof BloqueEvolucion, valor: string) => {
      if (idx !== 0) return;

      if (campo === "farmacoterapia") {
        const cleanedValue = stripMedicoData(valor);
        window.dispatchEvent(new CustomEvent("sync_plan_tratamiento", { detail: { source: "evolucion", value: cleanedValue } }));
      }
      if (campo === "notas_evolucion") {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(valor, 'text/html');
          
          // Extracción 1: Antecedentes (desde SEGURO hasta MOTIVO DE CONSULTA)
          let extractingAnt = false;
          let contentAnt = '';
          for (let i = 0; i < doc.body.childNodes.length; i++) {
            const node = doc.body.childNodes[i];
            const text = node.textContent?.toUpperCase() || '';
            
            if (text.includes('MOTIVO DE CONSULTA:')) {
               break;
            }

            if (extractingAnt) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                contentAnt += (node as Element).outerHTML;
              } else if (node.nodeType === Node.TEXT_NODE) {
                contentAnt += node.textContent || '';
              }
            }

            if (!extractingAnt && text.includes('SEGURO:')) {
               extractingAnt = true;
            }
          }
          window.dispatchEvent(new CustomEvent("sync_antecedentes", { detail: { source: "evolucion", value: contentAnt } }));

          // Extracción 2: Enfermedad Actual (desde ENFERMEDAD ACTUAL hasta NOTA o EXAMEN FISICO)
          let extractingEA = false;
          let contentEA = '';
          for (let i = 0; i < doc.body.childNodes.length; i++) {
            const node = doc.body.childNodes[i];
            const text = node.textContent?.toUpperCase() || '';
            
            if (text.includes('NOTA:') || text.includes('EXAMEN FISICO:')) {
               break;
            }

            if (!extractingEA && text.includes('ENFERMEDAD ACTUAL:')) {
               extractingEA = true;
               let html = node.nodeType === Node.ELEMENT_NODE ? (node as Element).outerHTML : (node.textContent || '');
               html = html.replace(/<strong[^>]*>\s*ENFERMEDAD ACTUAL:\s*<\/strong>\s*/i, '');
               html = html.replace(/ENFERMEDAD ACTUAL:\s*/i, '');
               contentEA += html;
               continue;
            }

            if (extractingEA) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                contentEA += (node as Element).outerHTML;
              } else if (node.nodeType === Node.TEXT_NODE) {
                contentEA += node.textContent || '';
              }
            }
          }
          window.dispatchEvent(new CustomEvent("sync_enfermedad_actual", { detail: { source: "evolucion", value: contentEA } }));

          // Extracción 3: Examen Físico (desde EXAMEN FISICO hasta NOTA, PLAN, DIAGNOSTICO o fecha)
          let extractingEF = false;
          let contentEF = '';
          for (let i = 0; i < doc.body.childNodes.length; i++) {
            const node = doc.body.childNodes[i];
            const text = node.textContent?.toUpperCase() || '';
            
            if (extractingEF) {
               if (text.includes('NOTA:') || text.includes('PLAN:') || text.includes('DIAGNOSTICO:') || /^\s*\d{2}\/\d{2}\/\d{4}/.test(text)) {
                  break;
               }
            }

            if (!extractingEF && text.includes('EXAMEN FISICO:')) {
               extractingEF = true;
               let html = node.nodeType === Node.ELEMENT_NODE ? (node as Element).outerHTML : (node.textContent || '');
               html = html.replace(/<strong[^>]*>\s*EXAMEN FISICO:\s*<\/strong>\s*/i, '');
               html = html.replace(/EXAMEN FISICO:\s*/i, '');
               
               const isExcluded = text.includes('SIGNOS VITALES:') || /(^|\s)TA:/.test(text) || /(^|\s)FC:/.test(text) || /(^|\s)FR:/.test(text) || /(^|\s)SPO2:/.test(text) || /(^|\s)T°:/.test(text) || /(^|\s)PESO:/.test(text) || /(^|\s)TALLA:/.test(text);
               if (!isExcluded && html.replace(/<[^>]*>/g, '').trim() !== '') {
                 contentEF += html;
               }
               continue;
            }

            if (extractingEF) {
              const isExcluded = text.includes('SIGNOS VITALES:') || /(^|\s)TA:/.test(text) || /(^|\s)FC:/.test(text) || /(^|\s)FR:/.test(text) || /(^|\s)SPO2:/.test(text) || /(^|\s)T°:/.test(text) || /(^|\s)PESO:/.test(text) || /(^|\s)TALLA:/.test(text);
              if (isExcluded) continue;

              if (node.nodeType === Node.ELEMENT_NODE) {
                contentEF += (node as Element).outerHTML;
              } else if (node.nodeType === Node.TEXT_NODE) {
                contentEF += node.textContent || '';
              }
            }
          }
          window.dispatchEvent(new CustomEvent("sync_examen_fisico", { detail: { source: "evolucion", value: contentEF } }));

        } catch (e) {
          console.error("Error parsing HTML for sync events:", e);
        }
      }
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
      fireSyncEvents(idx, campo, valor);
    };

    // Sincronizar los valores predeterminados de la nota de INGRESO al iniciar si es un paciente nuevo
    useEffect(() => {
      if (!initialData?.bloques || initialData.bloques.length === 0) {
        // Un pequeño retraso para asegurar que las otras pestañas (como Emergencia)
        // ya se hayan montado y registrado sus event listeners.
        setTimeout(() => {
          if (datos.bloques.length > 0) {
            fireSyncEvents(0, "farmacoterapia", datos.bloques[0].farmacoterapia);
            fireSyncEvents(0, "notas_evolucion", datos.bloques[0].notas_evolucion);
          }
        }, 500);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
              
              <div style={{ display: "flex", justifyContent: "center", marginTop: "10px", marginBottom: "10px" }}>
                <button
                  type="button"
                  onClick={() => handleInsertBloque(idx)}
                  style={{
                    background: "#f8fafc",
                    color: "#475569",
                    border: "1px dashed #94a3b8",
                    padding: "6px 16px",
                    borderRadius: "16px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  title="Inserta una nueva Nota de Evolución justo debajo de este bloque"
                >
                  + Insertar Evolución Aquí
                </button>
              </div>
            </div>
          ))}

          {/* COMENTADO TEMPORALMENTE A PETICIÓN DEL USUARIO: Botones inferiores de agregar nota
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
          */}
        </div>
      </div>
    );
  }
);

EvolucionForm.displayName = "HistoriaClinicaEvolucionForm";

export default EvolucionForm;
