"use client";

import React, { useState, useImperativeHandle } from "react";
import { Cie10DescInput, Cie10CieInput } from "./Cie10Input";
import { useFormAutosaveAndWarn } from "@/hooks/useFormAutosaveAndWarn";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ProfesionalRow {
  nombre_apellidos: string;
  especialidad: string;
  sello_documento: string;
}

export interface DatosProtocolo {
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
  edad: string;
  condicion_edad: "H" | "D" | "M" | "A";
  diagnostico_pre1: string; diag_pre_cie1: string;
  diagnostico_pre2: string; diag_pre_cie2: string;
  diagnostico_pre3: string; diag_pre_cie3: string;
  diagnostico_post1: string; diag_post_cie1: string;
  diagnostico_post2: string; diag_post_cie2: string;
  diagnostico_post3: string; diag_post_cie3: string;
  electiva: boolean;
  emergencia: boolean;
  urgencia: boolean;
  procedimiento_proyectado: string;
  procedimiento_realizado: string;
  cirujano1: string; cirujano2: string;
  primer_ayudante: string; segundo_ayudante: string; tercer_ayudante: string;
  instrumentista: string; circulante: string;
  anestesiologo: string; ayudante_anestesia: string; otros: string;
  anestesia_general: boolean; anestesia_regional: boolean;
  anestesia_sedacion: boolean; anestesia_otros: boolean;
  fecha_operacion_dia: string; fecha_operacion_mes: string; fecha_operacion_año: string;
  hora_inicio: string; hora_terminacion: string;
  dieresis: string[];
  exposicion_exploracion: string;
  hallazgos_quirurgicos: string[];
  proced_quirurgico: string[];
  procedimiento_quirurgico_cont: string[];
  complicaciones: string;
  perdida_sanguinea_total: string; sangrado_aproximado: string;
  uso_material_protesico_si: boolean; uso_material_protesico_no: boolean;
  descripcion_complicaciones: string;
  transquirurgico: string;
  biopsia_congelacion_si: boolean; biopsia_congelacion_no: boolean;
  resultado_biopsia: string; patologo_reporta: string;
  histopatologico_si: boolean; histopatologico_no: boolean;
  muestra_histopatologico: string;
  graficos: string[]; // Array de Base64 de imágenes del gráfico
  profesionales: [ProfesionalRow, ProfesionalRow, ProfesionalRow, ProfesionalRow];
}

interface Props {
  paciente?: {
    primerNombre?: string;
    segundoNombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    numero_historia_clinica?: string;
    cedula?: string;
    sexo?: string;
    edad?: number;
    tipoPaciente?: string;
  };
  initialData?: (Partial<DatosProtocolo> & Record<string, any>) | Record<string, any>;
  onGuardar?: (datosPlano: Record<string, any>) => void;
  onExportarExcel?: (datosPlano: Record<string, any>) => void;
  guardando?: boolean;
  exportando?: boolean;
  atencionId?: number;
  isTemplateMode?: boolean;
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Lbl({ children, small = false, center = false, color }: {
  children: React.ReactNode; small?: boolean; center?: boolean; color?: string;
}) {
  return (
    <div style={{
      fontSize: small ? "8px" : "9px", fontWeight: 700,
      padding: "2px 4px", lineHeight: 1.2,
      color: color ?? "#000", textAlign: center ? "center" : "left",
    }}>
      {children}
    </div>
  );
}

function TxtIn({ value, onChange, readOnly = false, center = false, placeholder = "" }: {
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

function ChkLbl({ checked, onChange, label }: {
  checked: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: "9px", fontFamily: "Arial, sans-serif" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 11, height: 11 }} />
      <span style={{ fontWeight: 600 }}>{label}</span>
    </label>
  );
}

function SiNoChk({ labelSi = "SI", labelNo = "NO", si, no, onSi, onNo }: {
  labelSi?: string; labelNo?: string;
  si: boolean; no: boolean;
  onSi: (v: boolean) => void; onNo: (v: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <ChkLbl checked={si} onChange={onSi} label={labelSi} />
      <ChkLbl checked={no} onChange={onNo} label={labelNo} />
    </div>
  );
}

// ─── Estilos base ─────────────────────────────────────────────────────────────

const td: React.CSSProperties = { border: "1px solid #000", padding: 0, verticalAlign: "top" };
const tdM: React.CSSProperties = { ...td, verticalAlign: "middle", background: "#CCFFCC" };
const tdC: React.CSSProperties = { ...td, verticalAlign: "middle", textAlign: "center" };

const secH = (bg = "#CCCCFF"): React.CSSProperties => ({
  background: bg, fontWeight: 700, fontSize: "11px",
  fontFamily: "Arial, sans-serif", padding: "4px 8px",
  border: "1px solid #000", letterSpacing: "0.02em",
});

const hojaTitle = (text: string, color = "#1a3a5c"): React.ReactElement => (
  <div style={{
    background: color, color: "#fff", fontWeight: 700, fontSize: "13px",
    fontFamily: "Arial, sans-serif", padding: "7px 12px",
    letterSpacing: "0.06em", textAlign: "center",
  }}>
    {text}
  </div>
);

function btnStyle(color: string): React.CSSProperties {
  return {
    background: color, color: "#fff", border: "none", borderRadius: 4,
    padding: "5px 12px", fontSize: "11px", fontWeight: 600,
    cursor: "pointer", fontFamily: "Arial, sans-serif",
  };
}

const tbl: React.CSSProperties = {
  width: "100%", minWidth: "1100px", borderCollapse: "collapse",
  tableLayout: "fixed", fontFamily: "Arial, sans-serif", fontSize: "10px",
};

// ─── Componente Principal ─────────────────────────────────────────────────────

const PROC_LINES_ANV = 16;
const PROC_LINES_REV = 20;

function profVacio(): ProfesionalRow {
  return { nombre_apellidos: "", especialidad: "", sello_documento: "" };
}

export type ProtocoloQuirurgicoFormHandle = {
  getDatos: () => Record<string, any>;
  clearAutosave?: () => void;
  isDirty?: () => boolean;
};

const ProtocoloQuirurgicoForm = React.forwardRef<ProtocoloQuirurgicoFormHandle, Props>(({
  paciente, initialData, onGuardar, onExportarExcel,
  guardando = false, exportando = false, atencionId, isTemplateMode = false
}, ref) => {
  const [hoja, setHoja] = useState<"ANVERSO" | "REVERSO">("ANVERSO");

  const [d, setD] = useState<DatosProtocolo>(() => {
    const base: DatosProtocolo = {
      institucion: isTemplateMode ? "" : (paciente?.tipoPaciente ?? "PARTICULAR"),
      unicodigo: isTemplateMode ? "" : "62858",
      establecimiento: isTemplateMode ? "" : "NUEVO HOSPITAL PANAMERICANO",
      numero_historia_clinica: paciente?.numero_historia_clinica ?? paciente?.cedula ?? "",
      numero_archivo: "",
      primer_apellido: paciente?.primerApellido ?? "",
      segundo_apellido: paciente?.segundoApellido ?? "",
      primer_nombre: paciente?.primerNombre ?? "",
      segundo_nombre: paciente?.segundoNombre ?? "",
      sexo: paciente?.sexo
        ? paciente.sexo.toUpperCase().startsWith("F") ? "F" : paciente.sexo.toUpperCase().startsWith("M") ? "M" : paciente.sexo
        : "",
      edad: paciente?.edad?.toString() ?? "",
      condicion_edad: "A",
      diagnostico_pre1: "", diag_pre_cie1: "",
      diagnostico_pre2: "", diag_pre_cie2: "",
      diagnostico_pre3: "", diag_pre_cie3: "",
      diagnostico_post1: "", diag_post_cie1: "",
      diagnostico_post2: "", diag_post_cie2: "",
      diagnostico_post3: "", diag_post_cie3: "",
      electiva: false, emergencia: false, urgencia: false,
      procedimiento_proyectado: "",
      procedimiento_realizado: "",
      cirujano1: "", cirujano2: "",
      primer_ayudante: "", segundo_ayudante: "", tercer_ayudante: "",
      instrumentista: "", circulante: "",
      anestesiologo: "", ayudante_anestesia: "", otros: "",
      anestesia_general: false, anestesia_regional: false,
      anestesia_sedacion: false, anestesia_otros: false,
      fecha_operacion_dia: "", fecha_operacion_mes: "", fecha_operacion_año: "",
      hora_inicio: "", hora_terminacion: "",
      dieresis: Array(5).fill(""),
      exposicion_exploracion: "",
      hallazgos_quirurgicos: Array(5).fill(""),
      proced_quirurgico: Array(PROC_LINES_ANV).fill(""),
      procedimiento_quirurgico_cont: Array(PROC_LINES_REV).fill(""),
      complicaciones: "",
      perdida_sanguinea_total: "", sangrado_aproximado: "",
      uso_material_protesico_si: false, uso_material_protesico_no: false,
      descripcion_complicaciones: "",
      transquirurgico: "",
      biopsia_congelacion_si: false, biopsia_congelacion_no: false,
      resultado_biopsia: "", patologo_reporta: "",
      histopatologico_si: false, histopatologico_no: false,
      muestra_histopatologico: "",
      graficos: [],
      profesionales: [profVacio(), profVacio(), profVacio(), profVacio()],
    };

    if (initialData) {
      // Mapear campos simples desde prot_
      Object.keys(base).forEach(key => {
        if (key === "proced_quirurgico" || key === "procedimiento_quirurgico_cont" || key === "profesionales" || key === "graficos" || key === "dieresis" || key === "hallazgos_quirurgicos") return;
        const flatKey = `prot_${key}`;
        if (initialData[flatKey] !== undefined) {
          (base as any)[key] = initialData[flatKey];
        }
      });

      for (let i = 0; i < 5; i++) {
        if (initialData[`prot_dieresis_${i + 1}`] !== undefined) {
          base.dieresis[i] = initialData[`prot_dieresis_${i + 1}`];
        }
        if (initialData[`prot_hallazgos_quirurgicos_${i + 1}`] !== undefined) {
          base.hallazgos_quirurgicos[i] = initialData[`prot_hallazgos_quirurgicos_${i + 1}`];
        }
      }

      // Mapear condicion_edad
      if (initialData.prot_condicion_edad_h === "X") base.condicion_edad = "H";
      if (initialData.prot_condicion_edad_d === "X") base.condicion_edad = "D";
      if (initialData.prot_condicion_edad_m === "X") base.condicion_edad = "M";
      if (initialData.prot_condicion_edad_a === "X") base.condicion_edad = "A";

      // Mapear arrays de texto
      for (let i = 0; i < PROC_LINES_ANV; i++) {
        if (initialData[`prot_proced_quirurgico_${i + 1}`] !== undefined) {
          base.proced_quirurgico[i] = initialData[`prot_proced_quirurgico_${i + 1}`];
        }
      }
      for (let i = 0; i < PROC_LINES_REV; i++) {
        if (initialData[`prot_procedimiento_quirurgico_cont_${i + 1}`] !== undefined) {
          base.procedimiento_quirurgico_cont[i] = initialData[`prot_procedimiento_quirurgico_cont_${i + 1}`];
        }
      }

      // Mapear profesionales
      for (let i = 0; i < 4; i++) {
        if (initialData[`prot_prof_nombre_apellidos_${i + 1}`] !== undefined) {
          base.profesionales[i].nombre_apellidos = initialData[`prot_prof_nombre_apellidos_${i + 1}`];
        }
        if (initialData[`prot_prof_especialidad_${i + 1}`] !== undefined) {
          base.profesionales[i].especialidad = initialData[`prot_prof_especialidad_${i + 1}`];
        }
        if (initialData[`prot_prof_sello_documento_${i + 1}`] !== undefined) {
          base.profesionales[i].sello_documento = initialData[`prot_prof_sello_documento_${i + 1}`];
        }
      }

      // Mapear graficos
      if (Array.isArray(initialData.graficos)) {
        base.graficos = initialData.graficos;
      }
    }

    return base;
  });

  const { isDirty, clearAutosave } = useFormAutosaveAndWarn({
    formId: `protocolo_${atencionId || 'new'}_${paciente?.cedula || 'new'}`,
    initialData: initialData || {}, // Just check if current data changes compared to initial
    currentData: d,
    onRestore: (saved) => setD(p => ({ ...p, ...saved })),
  });

  const s = (k: keyof DatosProtocolo) => (v: string) => setD(p => ({ ...p, [k]: v }));
  const c = (k: keyof DatosProtocolo) => (v: boolean) => setD(p => ({ ...p, [k]: v }));

  const setLine = (arr: "proced_quirurgico" | "procedimiento_quirurgico_cont" | "dieresis" | "hallazgos_quirurgicos", idx: number, val: string) =>
    setD(p => {
      const next = [...p[arr]];
      next[idx] = val;
      return { ...p, [arr]: next };
    });

  const setProf = (idx: number, campo: keyof ProfesionalRow, val: string) =>
    setD(p => {
      const profs = [...p.profesionales] as [ProfesionalRow, ProfesionalRow, ProfesionalRow, ProfesionalRow];
      profs[idx] = { ...profs[idx], [campo]: val };
      return { ...p, profesionales: profs };
    });

  const getDatosPlanos = () => {
    const out: Record<string, any> = {};
    
    // Mapeo directo con prefijo prot_
    Object.entries(d).forEach(([key, val]) => {
      if (key === "proced_quirurgico" || key === "procedimiento_quirurgico_cont" || key === "profesionales" || key === "graficos" || key === "dieresis" || key === "hallazgos_quirurgicos") return;
      
      if (isTemplateMode) {
        const patientKeys = [
          'institucion', 'unicodigo', 'establecimiento', 'numero_historia_clinica', 
          'numero_archivo', 'primer_apellido', 'segundo_apellido', 'primer_nombre', 
          'segundo_nombre', 'sexo', 'edad', 'condicion_edad'
        ];
        if (patientKeys.includes(key)) return;
      }

      out[`prot_${key}`] = val;
    });



    out.graficos = d.graficos;

    d.dieresis.forEach((val, i) => {
      out[`prot_dieresis_${i + 1}`] = val;
    });

    d.hallazgos_quirurgicos.forEach((val, i) => {
      out[`prot_hallazgos_quirurgicos_${i + 1}`] = val;
    });

    // Condición edad
    out.prot_condicion_edad_h = d.condicion_edad === "H" ? "X" : "";
    out.prot_condicion_edad_d = d.condicion_edad === "D" ? "X" : "";
    out.prot_condicion_edad_m = d.condicion_edad === "M" ? "X" : "";
    out.prot_condicion_edad_a = d.condicion_edad === "A" ? "X" : "";

    // Mapeos de arrays (procedimiento quirúrgico)
    d.proced_quirurgico.forEach((val, i) => {
      out[`prot_proced_quirurgico_${i + 1}`] = val;
    });

    d.procedimiento_quirurgico_cont.forEach((val, i) => {
      out[`prot_procedimiento_quirurgico_cont_${i + 1}`] = val;
    });

    // Mapeos de profesionales
    d.profesionales.forEach((prof, i) => {
      out[`prot_prof_nombre_apellidos_${i + 1}`] = prof.nombre_apellidos;
      out[`prot_prof_especialidad_${i + 1}`] = prof.especialidad;
      out[`prot_prof_firma_${i + 1}`] = ""; // Firma física
      out[`prot_prof_sello_documento_${i + 1}`] = prof.sello_documento;
    });

    if (isTemplateMode) {
      delete out['prot_condicion_edad_h'];
      delete out['prot_condicion_edad_d'];
      delete out['prot_condicion_edad_m'];
      delete out['prot_condicion_edad_a'];
    }

    return out;
  };

  useImperativeHandle(ref, () => ({
    getDatos: () => getDatosPlanos(),
    clearAutosave: () => clearAutosave(),
    isDirty: () => isDirty,
  }), [d, clearAutosave, isDirty]);

  const handleGuardar = () => { onGuardar?.(getDatosPlanos()); clearAutosave(); };
  const handleExcel = () => onExportarExcel?.(getDatosPlanos());

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      {/* ── Barra de acciones superior ─────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px", background: "#f5f5f5", borderBottom: "1px solid #ccc", gap: 8,
      }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#1a3a5c" }}>
            SNS-MSP / HCU-form.017/2021 — Protocolo Quirúrgico
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={handleGuardar} disabled={guardando} style={btnStyle("#1a3a5c")}>
            {guardando ? "Guardando..." : "💾 Guardar"}
          </button>
          <button onClick={handleExcel} disabled={exportando} style={btnStyle("#1e6b2e")}>
            {exportando ? "Exportando..." : "📊 Descargar Excel"}
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
              padding: "5px 20px", fontSize: "10px", fontWeight: 700,
              fontFamily: "Arial, sans-serif", border: "none",
              borderRight: "1px solid #999", cursor: "pointer",
              background: hoja === tab ? "#fff" : "#d0d0d0",
              borderBottom: hoja === tab ? "2px solid #fff" : "none",
              color: "#000", marginBottom: hoja === tab ? -2 : 0,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ overflowX: "visible", background: "#fff" }}>

        {/* ════════════════════════════════════════════════════════════════
            ANVERSO
            ════════════════════════════════════════════════════════════════ */}
        {hoja === "ANVERSO" && (
          <>
            <table style={tbl}>
              <tbody>
                {/* ── A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE ── */}
                <tr><td colSpan={20} style={secH()}>A. DATOS DE ESTABLECIMIENTO Y USUARIO / PACIENTE</td></tr>
                <tr>
                  <td colSpan={4} style={tdM}><Lbl>INSTITUCIÓN DEL SISTEMA</Lbl></td>
                  <td colSpan={2} style={tdM}><Lbl>UNICÓDIGO</Lbl></td>
                  <td colSpan={6} style={tdM}><Lbl>ESTABLECIMIENTO DE SALUD</Lbl></td>
                  <td colSpan={5} style={tdM}><Lbl>N° HISTORIA CLÍNICA ÚNICA</Lbl></td>
                  <td colSpan={3} style={tdM}><Lbl>N° ARCHIVO</Lbl></td>
                </tr>
                <tr style={{ height: 22 }}>
                  <td colSpan={4} style={td}><TxtIn value={d.institucion} onChange={s("institucion")} /></td>
                  <td colSpan={2} style={td}><TxtIn value={d.unicodigo} onChange={s("unicodigo")} center /></td>
                  <td colSpan={6} style={td}><TxtIn value={d.establecimiento} onChange={s("establecimiento")} /></td>
                  <td colSpan={5} style={td}><TxtIn value={d.numero_historia_clinica} onChange={s("numero_historia_clinica")} center /></td>
                  <td colSpan={3} style={td}><TxtIn value={d.numero_archivo} onChange={s("numero_archivo")} center /></td>
                </tr>
                <tr>
                  <td colSpan={4} style={tdM}><Lbl>PRIMER APELLIDO</Lbl></td>
                  <td colSpan={3} style={tdM}><Lbl>SEGUNDO APELLIDO</Lbl></td>
                  <td colSpan={3} style={tdM}><Lbl>PRIMER NOMBRE</Lbl></td>
                  <td colSpan={3} style={tdM}><Lbl>SEGUNDO NOMBRE</Lbl></td>
                  <td colSpan={2} style={tdM}><Lbl>SEXO</Lbl></td>
                  <td colSpan={2} style={tdM}><Lbl>EDAD</Lbl></td>
                  <td colSpan={3} style={tdM}>
                    <Lbl small center>CONDICIÓN EDAD</Lbl>
                    <div style={{ display: "flex", justifyContent: "space-around", fontSize: "7px", fontWeight: 700, padding: "0 2px" }}>
                      <span>H</span><span>D</span><span>M</span><span>A</span>
                    </div>
                  </td>
                </tr>
                <tr style={{ height: 22 }}>
                  <td colSpan={4} style={td}><TxtIn value={d.primer_apellido} onChange={s("primer_apellido")} /></td>
                  <td colSpan={3} style={td}><TxtIn value={d.segundo_apellido} onChange={s("segundo_apellido")} /></td>
                  <td colSpan={3} style={td}><TxtIn value={d.primer_nombre} onChange={s("primer_nombre")} /></td>
                  <td colSpan={3} style={td}><TxtIn value={d.segundo_nombre} onChange={s("segundo_nombre")} /></td>
                  <td colSpan={2} style={td}><TxtIn value={d.sexo} onChange={s("sexo")} center /></td>
                  <td colSpan={2} style={td}><TxtIn value={d.edad} onChange={s("edad")} center /></td>
                  <td colSpan={3} style={td}>
                    <div style={{ display: "flex", justifyContent: "space-around", padding: "4px 2px" }}>
                      {(["H", "D", "M", "A"] as const).map(op => (
                        <input key={op} type="radio" name="prot_condicion_edad" value={op}
                          checked={d.condicion_edad === op}
                          onChange={() => setD(p => ({ ...p, condicion_edad: op }))}
                          style={{ width: 10, height: 10, cursor: "pointer" }}
                          title={op === "H" ? "Horas" : op === "D" ? "Días" : op === "M" ? "Meses" : "Años"} />
                      ))}
                    </div>
                  </td>
                </tr>

                {/* ── B. DIAGNÓSTICOS ── */}
                <tr><td colSpan={20} style={secH()}>B. DIAGNÓSTICOS</td></tr>
                {/* Sub-header */}
                <tr>
                  <td colSpan={3} style={{ ...tdM, background: "#DCE6F1" }}><Lbl small> </Lbl></td>
                  <td colSpan={13} style={{ ...tdM, background: "#DCE6F1" }}><Lbl>DIAGNÓSTICO</Lbl></td>
                  <td colSpan={4} style={{ ...tdM, background: "#DCE6F1" }}><Lbl center>CIE</Lbl></td>
                </tr>
                {/* PRE OPERATORIO */}
                <tr>
                  <td colSpan={20} style={{ ...td, padding: "2px 6px", background: "#f5f5f5" }}>
                    <Lbl>Pre Operatorio:</Lbl>
                  </td>
                </tr>
                {[1, 2, 3].map(n => (
                  <tr key={`pre${n}`} style={{ height: 24 }}>
                    <td colSpan={1} style={tdC}><span style={{ fontSize: "10px", fontWeight: 700 }}>{n}.</span></td>
                    <td colSpan={15} style={td}>
                      <Cie10DescInput
                        cie={(d as never)[`diag_pre_cie${n}`]}
                        descripcion={(d as never)[`diagnostico_pre${n}`]}
                        onChange={(cie, desc) => setD(p => ({ ...p, [`diagnostico_pre${n}`]: desc, [`diag_pre_cie${n}`]: cie }))}
                      />
                    </td>
                    <td colSpan={4} style={td}>
                      <Cie10CieInput
                        cie={(d as never)[`diag_pre_cie${n}`]}
                        descripcion={(d as never)[`diagnostico_pre${n}`]}
                        onChange={(cie, desc) => setD(p => ({ ...p, [`diagnostico_pre${n}`]: desc, [`diag_pre_cie${n}`]: cie }))}
                      />
                    </td>
                  </tr>
                ))}
                {/* POST OPERATORIO */}
                <tr>
                  <td colSpan={20} style={{ ...td, padding: "2px 6px", background: "#f5f5f5" }}>
                    <Lbl>Post Operatorio:</Lbl>
                  </td>
                </tr>
                {[1, 2, 3].map(n => (
                  <tr key={`post${n}`} style={{ height: 24 }}>
                    <td colSpan={1} style={tdC}><span style={{ fontSize: "10px", fontWeight: 700 }}>{n}.</span></td>
                    <td colSpan={15} style={td}>
                      <Cie10DescInput
                        cie={(d as never)[`diag_post_cie${n}`]}
                        descripcion={(d as never)[`diagnostico_post${n}`]}
                        onChange={(cie, desc) => setD(p => ({ ...p, [`diagnostico_post${n}`]: desc, [`diag_post_cie${n}`]: cie }))}
                      />
                    </td>
                    <td colSpan={4} style={td}>
                      <Cie10CieInput
                        cie={(d as never)[`diag_post_cie${n}`]}
                        descripcion={(d as never)[`diagnostico_post${n}`]}
                        onChange={(cie, desc) => setD(p => ({ ...p, [`diagnostico_post${n}`]: desc, [`diag_post_cie${n}`]: cie }))}
                      />
                    </td>
                  </tr>
                ))}

                {/* ── C. PROCEDIMIENTO ── */}
                <tr><td colSpan={20} style={secH()}>C. PROCEDIMIENTO</td></tr>
                <tr>
                  <td colSpan={10} style={{ ...td, padding: "6px 8px" }}>
                    <div style={{ display: "flex", gap: 20 }}>
                      <ChkLbl checked={d.electiva} onChange={c("electiva")} label="Electiva" />
                      <ChkLbl checked={d.emergencia} onChange={c("emergencia")} label="Emergencia" />
                      <ChkLbl checked={d.urgencia} onChange={c("urgencia")} label="Urgencia" />
                    </div>
                  </td>
                  <td colSpan={10} style={{ ...td, background: "#f9f9f9" }} />
                </tr>
                <tr style={{ height: 26 }}>
                  <td colSpan={3} style={tdM}><Lbl>Proyectado:</Lbl></td>
                  <td colSpan={17} style={td}><TxtIn value={d.procedimiento_proyectado} onChange={s("procedimiento_proyectado")} /></td>
                </tr>
                <tr style={{ height: 26 }}>
                  <td colSpan={3} style={tdM}><Lbl>Realizado:</Lbl></td>
                  <td colSpan={17} style={td}><TxtIn value={d.procedimiento_realizado} onChange={s("procedimiento_realizado")} /></td>
                </tr>

                {/* ── D. INTEGRANTES DEL EQUIPO QUIRÚRGICO ── */}
                <tr><td colSpan={20} style={secH()}>D. INTEGRANTES DEL EQUIPO QUIRÚRGICO</td></tr>
                {/* Cabeceras columnas */}
                <tr>
                  <td colSpan={10} style={{ ...tdM, background: "#DCE6F1" }}><Lbl>CIRUJANOS / AYUDANTES</Lbl></td>
                  <td colSpan={10} style={{ ...tdM, background: "#DCE6F1" }}><Lbl>RESTO DEL EQUIPO</Lbl></td>
                </tr>
                {[
                  { labelL: "Cirujano 1:", keyL: "cirujano1", labelR: "Instrumentista:", keyR: "instrumentista" },
                  { labelL: "Cirujano 2:", keyL: "cirujano2", labelR: "Circulante:", keyR: "circulante" },
                  { labelL: "Primer Ayudante:", keyL: "primer_ayudante", labelR: "Anestesiólogo/a:", keyR: "anestesiologo" },
                  { labelL: "Segundo Ayudante:", keyL: "segundo_ayudante", labelR: "Ayudante Anestesia:", keyR: "ayudante_anestesia" },
                  { labelL: "Tercer Ayudante:", keyL: "tercer_ayudante", labelR: "Otros:", keyR: "otros" },
                ].map(({ labelL, keyL, labelR, keyR }) => (
                  <tr key={keyL} style={{ height: 26 }}>
                    <td colSpan={3} style={tdM}><Lbl small>{labelL}</Lbl></td>
                    <td colSpan={7} style={td}><TxtIn value={(d as never)[keyL]} onChange={s(keyL as keyof DatosProtocolo)} /></td>
                    <td colSpan={3} style={tdM}><Lbl small>{labelR}</Lbl></td>
                    <td colSpan={7} style={td}><TxtIn value={(d as never)[keyR]} onChange={s(keyR as keyof DatosProtocolo)} /></td>
                  </tr>
                ))}

                {/* ── E. TIPO DE ANESTESIA ── */}
                <tr><td colSpan={20} style={secH()}>E. TIPO DE ANESTESIA</td></tr>
                <tr style={{ height: 30 }}>
                  <td colSpan={20} style={{ ...td, padding: "6px 8px" }}>
                    <div style={{ display: "flex", gap: 28 }}>
                      <ChkLbl checked={d.anestesia_general} onChange={c("anestesia_general")} label="General" />
                      <ChkLbl checked={d.anestesia_regional} onChange={c("anestesia_regional")} label="Regional" />
                      <ChkLbl checked={d.anestesia_sedacion} onChange={c("anestesia_sedacion")} label="Sedación" />
                      <ChkLbl checked={d.anestesia_otros} onChange={c("anestesia_otros")} label="Otros" />
                    </div>
                  </td>
                </tr>

                {/* ── F. TIEMPOS QUIRÚRGICOS ── */}
                <tr><td colSpan={20} style={secH()}>F. TIEMPOS QUIRÚRGICOS</td></tr>
                {/* Fecha y hora */}
                <tr>
                  <td colSpan={4} style={tdM}><Lbl>FECHA DE OPERACIÓN</Lbl></td>
                  <td colSpan={2} style={tdM}><Lbl center small>DÍA</Lbl></td>
                  <td colSpan={2} style={tdM}><Lbl center small>MES</Lbl></td>
                  <td colSpan={3} style={tdM}><Lbl center small>AÑO</Lbl></td>
                  <td colSpan={4} style={tdM}><Lbl center small>HORA DE INICIO</Lbl></td>
                  <td colSpan={5} style={tdM}><Lbl center small>HORA DE TERMINACIÓN</Lbl></td>
                </tr>
                <tr style={{ height: 26 }}>
                  <td colSpan={4} style={{ ...td, background: "#f9f9f9" }} />
                  <td colSpan={2} style={td}><TxtIn value={d.fecha_operacion_dia} onChange={s("fecha_operacion_dia")} center placeholder="dd" /></td>
                  <td colSpan={2} style={td}><TxtIn value={d.fecha_operacion_mes} onChange={s("fecha_operacion_mes")} center placeholder="mm" /></td>
                  <td colSpan={3} style={td}><TxtIn value={d.fecha_operacion_año} onChange={s("fecha_operacion_año")} center placeholder="aaaa" /></td>
                  <td colSpan={4} style={td}>
                    <input type="time" value={d.hora_inicio} onChange={(e) => s("hora_inicio")(e.target.value)}
                      style={{ border: "none", outline: "none", fontSize: "10px", padding: "3px", width: "100%", boxSizing: "border-box" }} />
                  </td>
                  <td colSpan={5} style={td}>
                    <input type="time" value={d.hora_terminacion} onChange={(e) => s("hora_terminacion")(e.target.value)}
                      style={{ border: "none", outline: "none", fontSize: "10px", padding: "3px", width: "100%", boxSizing: "border-box" }} />
                  </td>
                </tr>

                {/* Diéresis — 5 líneas */}
                <tr>
                  <td colSpan={20} style={{ ...td, padding: "3px 6px", background: "#DCE6F1" }}>
                    <Lbl>Diéresis:</Lbl>
                  </td>
                </tr>
                {d.dieresis.map((val, idx) => (
                  <tr key={`dier_${idx}`} style={{ height: 22 }}>
                    <td colSpan={1} style={{ ...tdC, background: "#f9f9f9", fontSize: "9px", color: "#999" }}>
                      {idx + 1}
                    </td>
                    <td colSpan={19} style={td}>
                      <TxtIn value={val} onChange={(v) => setLine("dieresis", idx, v)} />
                    </td>
                  </tr>
                ))}

                {/* Exposición y Exploración */}
                <tr>
                  <td colSpan={20} style={{ ...td, padding: "3px 6px", background: "#DCE6F1" }}>
                    <Lbl>Exposición y Exploración:</Lbl>
                  </td>
                </tr>
                <tr style={{ height: 22 }}>
                  <td colSpan={20} style={td}>
                    <TxtIn value={d.exposicion_exploracion} onChange={s("exposicion_exploracion")} />
                  </td>
                </tr>

                {/* Hallazgos quirúrgicos — 5 líneas */}
                <tr>
                  <td colSpan={20} style={{ ...td, padding: "3px 6px", background: "#DCE6F1" }}>
                    <Lbl>Hallazgos Quirúrgicos:</Lbl>
                  </td>
                </tr>
                {d.hallazgos_quirurgicos.map((val, idx) => (
                  <tr key={`hall_${idx}`} style={{ height: 22 }}>
                    <td colSpan={1} style={{ ...tdC, background: "#f9f9f9", fontSize: "9px", color: "#999" }}>
                      {idx + 1}
                    </td>
                    <td colSpan={19} style={td}>
                      <TxtIn value={val} onChange={(v) => setLine("hallazgos_quirurgicos", idx, v)} />
                    </td>
                  </tr>
                ))}

                {/* Procedimiento Quirúrgico — 16 líneas ANVERSO */}
                <tr>
                  <td colSpan={20} style={{ ...td, padding: "3px 6px", background: "#DCE6F1" }}>
                    <Lbl>Procedimiento Quirúrgico:</Lbl>
                  </td>
                </tr>
                {d.proced_quirurgico.map((val, idx) => (
                  <tr key={`pq_${idx}`} style={{ height: 22 }}>
                    <td colSpan={1} style={{ ...tdC, background: "#f9f9f9", fontSize: "9px", color: "#999" }}>
                      {idx + 1}
                    </td>
                    <td colSpan={19} style={td}>
                      <TxtIn value={val} onChange={(v) => setLine("proced_quirurgico", idx, v)} />
                    </td>
                  </tr>
                ))}

                {/* Footer ANVERSO */}
                <tr>
                  <td colSpan={10} style={{ border: "1px solid #000", fontSize: "8px", fontWeight: 700, padding: "3px 4px" }}>
                    SNS-MSP / HCU-form.017/2021
                  </td>
                  <td colSpan={10} style={{ border: "1px solid #000", fontSize: "10px", fontWeight: 700, textAlign: "right", padding: "3px 4px" }}>
                    PROTOCOLO QUIRÚRGICO (1)
                  </td>
                </tr>

              </tbody>
            </table>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════
            REVERSO
            ════════════════════════════════════════════════════════════════ */}
        {hoja === "REVERSO" && (
          <>
            <table style={tbl}>
              <tbody>
                {/* Continuación Procedimiento Quirúrgico — 20 líneas */}
                <tr>
                  <td colSpan={20} style={{ ...td, padding: "3px 6px", background: "#DCE6F1" }}>
                    <Lbl>Procedimiento Quirúrgico: (continuación)</Lbl>
                  </td>
                </tr>
                {d.procedimiento_quirurgico_cont.map((val, idx) => (
                  <tr key={`pqc_${idx}`} style={{ height: 22 }}>
                    <td colSpan={1} style={{ ...tdC, background: "#f9f9f9", fontSize: "9px", color: "#999" }}>
                      {PROC_LINES_ANV + idx + 1}
                    </td>
                    <td colSpan={19} style={td}>
                      <TxtIn value={val} onChange={(v) => setLine("procedimiento_quirurgico_cont", idx, v)} />
                    </td>
                  </tr>
                ))}

                {/* ── G. COMPLICACIONES ── */}
                <tr><td colSpan={20} style={secH()}>G. COMPLICACIONES DEL PROCEDIMIENTO QUIRÚRGICO</td></tr>
                <tr>
                  <td colSpan={20} style={td}>
                    <textarea value={d.complicaciones}
                      onChange={(e) => {
                        s("complicaciones")(e.target.value);
                        const el = e.target;
                        el.style.height = "auto";
                        el.style.height = `${Math.max(el.scrollHeight, 72)}px`;
                      }}
                      ref={(el) => {
                        if (el) { el.style.height = "auto"; el.style.height = `${Math.max(el.scrollHeight, 72)}px`; }
                      }}
                      rows={4}
                      placeholder="Describa las complicaciones presentadas durante el procedimiento quirúrgico..."
                      style={{
                        width: "100%", border: "none", outline: "none", resize: "none",
                        fontSize: "10px", fontFamily: "Arial, sans-serif", padding: "4px 6px",
                        boxSizing: "border-box", overflow: "hidden", minHeight: "72px",
                      }} />
                  </td>
                </tr>

                {/* Pérdida sanguínea / material protésico */}
                <tr>
                  <td colSpan={3} style={tdM}><Lbl small>Pérdida Sanguínea total:</Lbl></td>
                  <td colSpan={3} style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <TxtIn value={d.perdida_sanguinea_total} onChange={s("perdida_sanguinea_total")} center placeholder="0" />
                      <span style={{ fontSize: "9px", paddingRight: 4, whiteSpace: "nowrap" }}>ml</span>
                    </div>
                  </td>
                  <td colSpan={3} style={tdM}><Lbl small>Sangrado aproximado:</Lbl></td>
                  <td colSpan={3} style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <TxtIn value={d.sangrado_aproximado} onChange={s("sangrado_aproximado")} center placeholder="0" />
                      <span style={{ fontSize: "9px", paddingRight: 4, whiteSpace: "nowrap" }}>ml</span>
                    </div>
                  </td>
                  <td colSpan={4} style={tdM}><Lbl small>Uso de Material Protésico:</Lbl></td>
                  <td colSpan={4} style={{ ...td, padding: "4px 6px" }}>
                    <SiNoChk
                      si={d.uso_material_protesico_si} no={d.uso_material_protesico_no}
                      onSi={c("uso_material_protesico_si")} onNo={c("uso_material_protesico_no")}
                    />
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} style={tdM}><Lbl small>Descripción:</Lbl></td>
                  <td colSpan={17} style={td}>
                    <textarea value={d.descripcion_complicaciones}
                      onChange={(e) => {
                        s("descripcion_complicaciones")(e.target.value);
                        const el = e.target;
                        el.style.height = "auto";
                        el.style.height = `${Math.max(el.scrollHeight, 26)}px`;
                      }}
                      ref={(el) => {
                        if (el) { el.style.height = "auto"; el.style.height = `${Math.max(el.scrollHeight, 26)}px`; }
                      }}
                      rows={1}
                      placeholder="Descripción de complicaciones / material protésico..."
                      style={{
                        width: "100%", border: "none", outline: "none", resize: "none",
                        fontSize: "10px", fontFamily: "Arial, sans-serif", padding: "3px 4px",
                        boxSizing: "border-box", overflow: "hidden", minHeight: "26px",
                        lineHeight: 1.3,
                      }} />
                  </td>
                </tr>

                {/* ── H. EXÁMENES HISTOPATOLÓGICOS ── */}
                <tr><td colSpan={20} style={secH()}>H. EXÁMENES HISTOPATOLÓGICOS</td></tr>

                {/* Transquirúrgico */}
                <tr style={{ height: 26 }}>
                  <td colSpan={3} style={tdM}><Lbl small>Transquirúrgico:</Lbl></td>
                  <td colSpan={17} style={td}><TxtIn value={d.transquirurgico} onChange={s("transquirurgico")} /></td>
                </tr>

                {/* Biopsia por congelación */}
                <tr>
                  <td colSpan={4} style={tdM}><Lbl small>Biopsia por congelación:</Lbl></td>
                  <td colSpan={3} style={{ ...td, padding: "4px 6px" }}>
                    <SiNoChk
                      si={d.biopsia_congelacion_si} no={d.biopsia_congelacion_no}
                      onSi={c("biopsia_congelacion_si")} onNo={c("biopsia_congelacion_no")}
                    />
                  </td>
                  <td colSpan={2} style={tdM}><Lbl small>Resultado:</Lbl></td>
                  <td colSpan={11} style={td}><TxtIn value={d.resultado_biopsia} onChange={s("resultado_biopsia")} /></td>
                </tr>
                <tr style={{ height: 26 }}>
                  <td colSpan={4} style={tdM}><Lbl small>Patólogo que reporta:</Lbl></td>
                  <td colSpan={16} style={td}><TxtIn value={d.patologo_reporta} onChange={s("patologo_reporta")} /></td>
                </tr>

                {/* Histopatológico */}
                <tr>
                  <td colSpan={3} style={tdM}><Lbl small>Histopatológico:</Lbl></td>
                  <td colSpan={3} style={{ ...td, padding: "4px 6px" }}>
                    <SiNoChk
                      si={d.histopatologico_si} no={d.histopatologico_no}
                      onSi={c("histopatologico_si")} onNo={c("histopatologico_no")}
                    />
                  </td>
                  <td colSpan={2} style={tdM}><Lbl small>Muestra:</Lbl></td>
                  <td colSpan={12} style={td}><TxtIn value={d.muestra_histopatologico} onChange={s("muestra_histopatologico")} /></td>
                </tr>

                {/* ── I. DIAGRAMA DEL PROCEDIMIENTO ── */}
                <tr><td colSpan={20} style={secH()}>I. DIAGRAMA DEL PROCEDIMIENTO</td></tr>
                <tr>
                  <td colSpan={20} style={{ ...td, verticalAlign: "top", background: "#fafafa" }}>
                    <div style={{ padding: "6px 8px" }}>
                      <div style={{ fontSize: "9px", color: "#888", fontStyle: "italic", marginBottom: 4 }}>
                        GRÁFICO / DIAGRAMA DE LA INTERVENCIÓN (incluya un gráfico previamente seleccionado o elaborado por el/la profesional de salud)
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 6 }}>
                        {/* Imágenes cargadas */}
                        {d.graficos.map((src, idx) => (
                          <div key={idx} style={{ position: "relative", display: "inline-block" }}>
                            <img
                              src={src}
                              alt={`Gráfico ${idx + 1}`}
                              style={{ height: 80, maxWidth: 120, objectFit: "contain", border: "1px solid #ddd", borderRadius: 4 }}
                            />
                            <button
                              type="button"
                              onClick={() => setD(p => ({ ...p, graficos: p.graficos.filter((_, i) => i !== idx) }))}
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
                                  setD(p => ({ ...p, graficos: [...p.graficos, base64] }));
                                };
                                reader.readAsDataURL(file);
                              });
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* ── J. DATOS DEL PROFESIONAL RESPONSABLE ── */}
                <tr><td colSpan={20} style={secH()}>J. DATOS DEL PROFESIONAL RESPONSABLE</td></tr>
                <tr>
                  <td colSpan={8} style={{ ...tdM, background: "#DCE6F1" }}><Lbl>NOMBRE Y APELLIDOS</Lbl></td>
                  <td colSpan={5} style={{ ...tdM, background: "#DCE6F1" }}><Lbl>ESPECIALIDAD</Lbl></td>
                  <td colSpan={4} style={{ ...tdM, background: "#DCE6F1", textAlign: "center" }}>
                    <Lbl center>FIRMA</Lbl>
                    <Lbl small center color="#888">(documento impreso)</Lbl>
                  </td>
                  <td colSpan={3} style={{ ...tdM, background: "#DCE6F1" }}><Lbl>SELLO Y N° DOCUMENTO</Lbl></td>
                </tr>
                {d.profesionales.map((prof, idx) => (
                  <tr key={idx} style={{ height: 28 }}>
                    <td colSpan={8} style={td}>
                      <TxtIn value={prof.nombre_apellidos} onChange={(v) => setProf(idx, "nombre_apellidos", v)} placeholder={`Profesional ${idx + 1}`} />
                    </td>
                    <td colSpan={5} style={td}>
                      <TxtIn value={prof.especialidad} onChange={(v) => setProf(idx, "especialidad", v)} placeholder="Especialidad" />
                    </td>
                    <td colSpan={4} style={{ ...td, background: "#f9f9f9" }} />
                    <td colSpan={3} style={td}>
                      <TxtIn value={prof.sello_documento} onChange={(v) => setProf(idx, "sello_documento", v)} />
                    </td>
                  </tr>
                ))}

                {/* Footer REVERSO */}
                <tr>
                  <td colSpan={10} style={{ border: "1px solid #000", fontSize: "8px", fontWeight: 700, padding: "3px 4px" }}>
                    SNS-MSP / HCU-form.017/2021
                  </td>
                  <td colSpan={10} style={{ border: "1px solid #000", fontSize: "10px", fontWeight: 700, textAlign: "right", padding: "3px 4px" }}>
                    PROTOCOLO QUIRÚRGICO (2)
                  </td>
                </tr>

              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
});

export default ProtocoloQuirurgicoForm;