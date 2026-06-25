"use client";

import React, { useState, useImperativeHandle, useEffect } from "react";
import { Cie10DescInput, Cie10CieInput } from "./Cie10Input";
import RichTextEvolucion from "../ui/RichTextEvolucion";
import { useFormAutosaveAndWarn } from "@/hooks/useFormAutosaveAndWarn";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DatosAnamnesis {
  // A. Datos del establecimiento
  institucion: string;
  unicodigo: string;
  establecimiento: string;
  numero_historia_clinica: string;
  numero_archivo: string;

  // A. Datos del paciente
  primer_apellido: string;
  segundo_apellido: string;
  primer_nombre: string;
  segundo_nombre: string;
  sexo: string;
  edad: string;
  condicion_edad: "H" | "D" | "M" | "A";

  // B. Motivo de consulta
  motivo_consulta_1: string;
  motivo_consulta_2: string;
  motivo_consulta_3: string;
  motivo_consulta_4: string;
  motivo_consulta_5: string;
  motivo_consulta_6: string;

  // C. Antecedentes patológicos personales
  alergia_medicamentos: string;
  otras_alergias: string;
  vacunas: string;
  patologias_clinicas: string;
  medicacion_habitual: string;
  quirurgicos: string;
  habitos: string;
  condicion_socioeconomica: string;
  discapacidad: string;
  religion: string;
  tipificacion_sanguinea: string;

  // Gineco-obstétricos
  edad_menarquia: string;
  edad_menopausia: string;
  ciclos: string;
  edad_inicio_vida_sexual: string;
  numero_gestas: string;
  numero_partos: string;
  numero_abortos: string;
  numero_cesareas: string;
  numero_hijos_vivos: string;
  fecha_ultima_menstruacion: string;
  fecha_ultimo_parto: string;
  fecha_ultima_citologia: string;
  fecha_ultima_colposcopia: string;
  fecha_ultima_mamografia: string;
  metodo_planificacion_familiar: string;
  terapia_hormonal: string;
  fecha_ultimo_antigeno_prostatico: string;
  fecha_ultimo_eco_prostatico: string;
  desc_antecedentes_personales: string;

  // D. Antecedentes familiares (checkbox)
  antecedentes_familiares_cardiopatia: boolean;
  antecedentes_familiares_hipertension: boolean;
  antecedentes_familiares_enf_cvascular: boolean;
  antecedentes_familiares_endocrino: boolean;
  antecedentes_familiares_cancer: boolean;
  antecedentes_familiares_tuberculosis: boolean;
  antecedentes_familiares_enf_mental: boolean;
  antecedentes_familiares_enf_infecciosa: boolean;
  antecedentes_familiares_malformacion: boolean;
  antecedentes_familiares_otro: boolean;
  desc_antecedentes_familiares: string;

  // E. Enfermedad actual
  enfermedad_actual: string;

  // F. Revisión de órganos y sistemas (checkbox)
  revision_piel_anexos: boolean;
  revision_sentidos: boolean;
  revision_respiratorio: boolean;
  revision_cardiovascular: boolean;
  revision_digestivo: boolean;
  revision_genitourinario: boolean;
  revision_musculo_esqueletico: boolean;
  revision_endocrino: boolean;
  revision_hemo_linatico: boolean;
  revision_nervioso: boolean;
  desc_revision_organos: string;

  // G. Constantes vitales
  temperatura: string;
  presion_arterial: string;
  pulso: string;
  frecuencia_respiratoria: string;
  peso: string;
  talla: string;
  imc: string;
  perimetro_cefalico: string;
  pulsioximetria: string;
  score_mama: string;
  constantes_otros: string;

  // H. Examen físico - Regional (checkbox)
  ef_piel_faneras: boolean;
  ef_cabeza: boolean;
  ef_ojos: boolean;
  ef_oidos: boolean;
  ef_nariz: boolean;
  ef_boca: boolean;
  ef_orofaringe: boolean;
  ef_cuello: boolean;
  ef_axilas_mamas: boolean;
  ef_torax: boolean;
  ef_abdomen: boolean;
  ef_columna: boolean;
  ef_ingle_perine: boolean;
  ef_miem_superiores: boolean;
  ef_miem_inferiores: boolean;
  // H. Examen físico - Sistémico (checkbox)
  ef_sentidos: boolean;
  ef_respiratorio: boolean;
  ef_cardiovascular: boolean;
  ef_digestivo: boolean;
  ef_genital: boolean;
  ef_urinario: boolean;
  ef_musculo_esqueletico: boolean;
  ef_endocrino: boolean;
  ef_hemo_linatico: boolean;
  ef_neurologico: boolean;
  desc_examen_fisico: string;
  img_examen_fisico: string[]; // Array Base64 de imágenes del examen físico

  // I. Análisis
  analisis: string;

  // J. Diagnóstico (6 entradas)
  diagnostico_1: string; diagnostico_1_cie: string; diagnostico_1_pre: boolean; diagnostico_1_def: boolean;
  diagnostico_2: string; diagnostico_2_cie: string; diagnostico_2_pre: boolean; diagnostico_2_def: boolean;
  diagnostico_3: string; diagnostico_3_cie: string; diagnostico_3_pre: boolean; diagnostico_3_def: boolean;
  diagnostico_4: string; diagnostico_4_cie: string; diagnostico_4_pre: boolean; diagnostico_4_def: boolean;
  diagnostico_5: string; diagnostico_5_cie: string; diagnostico_5_pre: boolean; diagnostico_5_def: boolean;
  diagnostico_6: string; diagnostico_6_cie: string; diagnostico_6_pre: boolean; diagnostico_6_def: boolean;

  // K. Plan de tratamiento
  plan_tratamiento: string;

  // L. Datos del profesional
  fecha_atencion: string;
  hora_atencion: string;
  profesional_primer_nombre: string;
  profesional_primer_apellido: string;
  profesional_segundo_apellido: string;
  profesional_documento: string;
}

interface Props {
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
  initialData?: Partial<DatosAnamnesis>;
  onGuardar?: (datos: DatosAnamnesis) => void;
  onExportarExcel?: (datos: DatosAnamnesis) => void;
  guardando?: boolean;
  exportando?: boolean;
  atencionId?: number;
}

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
    // Calcula la altura mínima basada en rows para el estado inicial
    const lineHeightPx = 11 * 1.3; // fontSize * lineHeight
    const paddingPx = 6; // padding top + bottom
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
          // Ajustar altura al montar y cuando cambia el valor externamente
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
    <input type="text" value={value} readOnly={readOnly} placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)} style={base} />
  );
}

function CheckItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: 3, cursor: "pointer",
      fontSize: "9px", fontFamily: "Arial, sans-serif", padding: "2px 4px", whiteSpace: "nowrap",
    }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        style={{ width: 11, height: 11 }} />
      {label}
    </label>
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
const subSectionHeader: React.CSSProperties = {
  background: "#DCE6F1",
  fontWeight: 700,
  fontSize: "10px",
  fontFamily: "Arial, sans-serif",
  padding: "3px 6px",
  borderBottom: "1px solid #ccc",
  letterSpacing: "0.02em",
};

function btnStyle(color: string): React.CSSProperties {
  return {
    background: color, color: "#fff", border: "none", borderRadius: 4,
    padding: "5px 12px", fontSize: "11px", fontWeight: 600, cursor: "pointer",
    fontFamily: "Arial, sans-serif",
  };
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export type HistoriaClinicaAnamnesisHandle = {
  getDatos: () => DatosAnamnesis;
  clearAutosave?: () => void;
  isDirty?: () => boolean;
};

const AnamnesisForm = React.forwardRef<HistoriaClinicaAnamnesisHandle, Props>(
  ({
    paciente,
    initialData,
    onGuardar,
    onExportarExcel,
    guardando = false,
    exportando = false,
    atencionId,
  }, ref) => {
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [initialState] = useState<DatosAnamnesis>(() => ({
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
    edad: paciente?.edad?.toString() ?? "",
    condicion_edad: "A",

    motivo_consulta_1: "", motivo_consulta_2: "", motivo_consulta_3: "",
    motivo_consulta_4: "", motivo_consulta_5: "", motivo_consulta_6: "",

    alergia_medicamentos: "", otras_alergias: "", vacunas: "",
    patologias_clinicas: "", medicacion_habitual: "", quirurgicos: "",
    habitos: "", condicion_socioeconomica: "", discapacidad: "",
    religion: "", tipificacion_sanguinea: "",

    edad_menarquia: "", edad_menopausia: "", ciclos: "",
    edad_inicio_vida_sexual: "", numero_gestas: "", numero_partos: "",
    numero_abortos: "", numero_cesareas: "", numero_hijos_vivos: "",
    fecha_ultima_menstruacion: "", fecha_ultimo_parto: "",
    fecha_ultima_citologia: "", fecha_ultima_colposcopia: "", fecha_ultima_mamografia: "",
    metodo_planificacion_familiar: "", terapia_hormonal: "",
    fecha_ultimo_antigeno_prostatico: "", fecha_ultimo_eco_prostatico: "",
    desc_antecedentes_personales: "",

    antecedentes_familiares_cardiopatia: false, antecedentes_familiares_hipertension: false,
    antecedentes_familiares_enf_cvascular: false, antecedentes_familiares_endocrino: false,
    antecedentes_familiares_cancer: false, antecedentes_familiares_tuberculosis: false,
    antecedentes_familiares_enf_mental: false, antecedentes_familiares_enf_infecciosa: false,
    antecedentes_familiares_malformacion: false, antecedentes_familiares_otro: false,
    desc_antecedentes_familiares: "",

    enfermedad_actual: "",

    revision_piel_anexos: false, revision_sentidos: false, revision_respiratorio: false,
    revision_cardiovascular: false, revision_digestivo: false, revision_genitourinario: false,
    revision_musculo_esqueletico: false, revision_endocrino: false,
    revision_hemo_linatico: false, revision_nervioso: false,
    desc_revision_organos: "",

    temperatura: "", presion_arterial: "", pulso: "", frecuencia_respiratoria: "",
    peso: "", talla: "", imc: "", perimetro_cefalico: "",
    pulsioximetria: "", score_mama: "", constantes_otros: "",

    ef_piel_faneras: false, ef_cabeza: false, ef_ojos: false, ef_oidos: false, ef_nariz: false,
    ef_boca: false, ef_orofaringe: false, ef_cuello: false, ef_axilas_mamas: false, ef_torax: false,
    ef_abdomen: false, ef_columna: false, ef_ingle_perine: false,
    ef_miem_superiores: false, ef_miem_inferiores: false,
    ef_sentidos: false, ef_respiratorio: false, ef_cardiovascular: false,
    ef_digestivo: false, ef_genital: false, ef_urinario: false,
    ef_musculo_esqueletico: false, ef_endocrino: false,
    ef_hemo_linatico: false, ef_neurologico: false,
    desc_examen_fisico: "",
    img_examen_fisico: [
      // REEMPLAZAR ESTE TEXTO CON EL CÓDIGO BASE64 DE LA IMAGEN REAL 1
      "data:image/jpeg;base64,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NGMjA60nsNbm18DvBU+jz3Wrzr/x+fOpPvXsFY/hDY3hjTQhBUQr0rZoQMKKKKYgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACmsu6nUUAY3izw3D4q0WbTp8eXIO9eEeF9Qufh/wDEWPw7GzJYbv8AgNfSFfOPxPxb/EEyx8S561LKR9FrIsihkIYeopGkCLuchB6muf8AAVxJc+H4nkJLe9T+MtRtdL0Gae8nFvCo5c1QjQi1axmuPJjvIHm/55rIN35V4l+0B4+tF02fRXspxOf+WwUla4rw7r2s3HxGW90Pw/c6zZbuJ1nEan8xXp/j7SfFXjjS3t4/C9vYTsP9dNPHIR+VTuh2syp+z740sToEGkeaGuM8LnB/Kvaq+Lrn4b/Eb4dStqklnCltG2TcQSKCPwBzXtWl/GiHS/hut+8/9o6wox9nY/MTQmDRzHx28aafpd9Nb38y28QPLk8103wN+I8etabb6dp+nXM9sOl5sPln8eleA2fwX8d/Fz4hjxjq2mNNokjZ+xS3Kqp/4Ca+hbyw8b+GfDI0/wAJ+H7W0VFwsQlQY/GhFOyVjs9c+Knh7QNRNhcXTSXo6wW672/IV0Gk6rHrVmlzAkscbdBMmxvyr5p8LXR8M+LRqvjrSZrK/B+edYzKv/jor6L0HxZpHiW2SbTL+GdG6IDtb/vk80yDD+LmpTaV4RmmhO184yDivPPg1oUd9qUesSRg3DHJfvXo3xY0ebXPCk1tBJFHITnMrhR+ZrzX4P8AihdL1qPw9MivcKceZGwZfzFLqPoe+EZooJoqiRaKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoopDQAteR/tEape6Z4etmtWChnwxNdt468cWfgLSDfXivIpO1VTGc15FYeG/Enxo1AXGuyNbeG92+3WPhvxpMa7nbfBnTdLh0uK7tixvJUzLkHFem1naJott4f02CytVxHCu0MRyfrWjTBu7GtWZ4iutQs9FuZtKtheXyrm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hfyXOvty155YUE/7oOK91paVh3aPING8LeP/AAXY/wBnaP8AYLy2HSaeQKw/DFc54l/ZpufiddLqXivUhFqMfMf2dQyj+VfQVFFh3Z4joHw98d+AbWSy0aaz1G1cbN1xIIyo+mDV7wD8Gb3Rdcl1bWbxLiaY7mhRQQp+tewUlFhXI40EShI12oOlSUtFMQUUUUAJXlv7QF8LDwqjk4y2K9Trxn9pPcPDMZlI8rdSY1uSfBXR/tOlwX4XIPO6vYq8++B7RHwLa+UOK9BoQPcKKKKYgooooAKKKKACiiigAooooAa1VtSuhY6bPcdo0LVaryT4w/Eg6FKNGi+Z7kbPl96BrU898RX03xR8QJHbIHFvJzznoa+ivDdm1hoVpbsMNHGARXmPwR+H1z4dln1C6i4uPmUt717FUobGrjPvTqKKokKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKr31mt9bNC/CtViigD5g+IlvP4W+IVosYBg3glq+i9B1a21bT4GgkDnYuR6cVyXxQ8D22sabc6gFzdRJuWvPvgX4yOn3V3aatL5PzFU31OzK3R9A0tMhkSaNZEO5WGQafVEhRRRQAUUUUAFFFFABRRRQAUUUUAcz8RojN4RvUUZJHb8a8P+FupHSNQMDllLP0Ne/8AipUbRbgSHCY5r52WPyvFkAteU8znH1pMtPQ+nLdt0Ebeqg1JVex/48oM/wBwfyqxTICiiigBu3DZrjPiH8O08cQoTIEljHy7vWu1ooA8N0ex+JHgmZ4LHTLHUbQ/KN5fIH4VyWs/ss6n4x1pvEV1dW1jqMh3G3G7aD+VfT1FKw7njWi2vj3wLpQ0nTtJs7wjhblt23+dcvr37Nd98Wr5NV8Z3EdvfxnMf2TOB+dfR1FFguzxTSvhT428HW/2Tw/rVibQjaReb9wHtgVreDfgfDouqSapq13/AGneS8yRsMx59sivVaKLBc5yL4d+G4bz7XHo1qlx13hcGt6GBLdQsSLGn91RipaKYhKWiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooASvLP2grAah4VRCM4bNepmsHxl4fHiLS2g64GaBnnvwV1yO20mDTw/I4xXsNfMXg29Oh/E5dMIZVV8e3WvpzryKlAxaKKKoQUUUUAFFFFABRRRQAUUyRkRcuwQerHFeSePvjPDDNLovh0tPrmcLtHH50DSub3xK+I1l4f0+4soLkf2swxHEOua85+G/gK+8f3Tar4lWSOWJt0YYdea1PBPwfu/El5Hr/AIt8xdUVtyx5yK9uihSGNURQqqMAAUh7CW0K21vHCn3Y1Cj8KlpKWmSFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBFNGkymORQyNwQa8P8AjF8Lbu5vINR0OIwpCd8gj745Ne6FQabJEs0TRsMowwRQNHl/wp+Klv4g2aNIvl3VquxmY9cV6lu/KvGviN8Hbn/j/wDCX+hXud8jBsZpvw6+Mix3kfhvWoZIr+H5XuZDhSfqaQeh7ODmlqOGeK4QPFIsif3kIIqSmIKKKKACiiigAooooAKKKKAOc+IFwbXwreSDjaP8a8G8AWs+vauJwNwV+31r1L4xeI4o/DV3YI4Eziuc/Zx0YxaRcy3HzvuyD+NSWtj2i1XbbRL6KBUtIMdBS1RAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFACNSL3pTWbrPiLTfDtv5+p3sNnF/ekNAHgvxI8Pz+GfE0uv8rGGzmvWvhb4mHijw6t1u3dq8/8AiL8R7Dx9psui+HtPudYunOFljTCfma0/gz4T8VeG9NEV/FFYxZyYW5b9KnYvoevdKdTN3A9afVEBRRRQAUUUUAJSM4VSxOAoyTQ1RykG3k3/AHdpzn6UAeOfFz4maffWbaVokx1DU1bDQQ5BH5074TfDmdVh1m/tUtro87XGW/OuB8QLplt4wnfw82dV3/N5fJr6E8CyX0vh+BtQ3fae+7rU+ZWx0GaWm7RTqokKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAGfd+leZfGjwOur+HXk0zTka/znzIVAf869PpG+VSQM+1AHhHwh+IVt4bSPw/q00kN/nGybP8691WZZFDIwcHupzXy340WLWPi2trc7YkZ8HsetfR3hnQbXw/YJFaMzoQOWOaSKZshs0tNXvTqZIUUUUAFFFFABTZJFjUs7BR6mkJzXK/Ev8AtX/hHZP7ItZLu65/dx9aAPEPH2qS618TF06NfMt3fGQeOte+eD/DMfhrT1iQAbgCcV89eFNU0zS/Esc3iiO40zUVbnzl4FfSek65p2vW4k0+8iu4x3jbNSkUzRHelpFpaokKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKSk+b1oAWop5ltYXmkOEQbj9K4vxt8WtJ8HSNZsWuNTI/d26j7xrj7O6+IvxKV/mTwrYMMEKu5nU/wC8KQyPx58aL+6m/s/whELq4zslZh933GKm8H/A+PVpI9Y8T3k+pzTfO1lMf3an8K6TwH8F9L8EXkl4LmW+vJOXklAAJr0MAKMAYFFu4ehT0vR7PRbdbewtYrWBeAsa4q7RRTEFFFFABRRRQAlcr4q+JGi+D2Md5MxuO0EfLN9K6uvnX40XETeOraH5TISABSGlc7KL4r+I/EzFfDnhWZU6edqQ2r9flNMuvAXjrxkQNd8Qw6Rb/wDPLSSST7HcK7DwDYzWemp5ibAyjFdVigDjPCPwn8PeEZluba2E+ofxXcvLt7ntXaUmKWmIKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA4fxl8KtI8WCSUKbLUW6Xcf3hXH6b4e+Inw6zHps1v4ksM5P2pyJsegAFez0tA7nl8fxrbTcJr3hnV9Mf+KQ2/wC7+uSeldT4d+JHh3xW3l6bqkE8/eHd84+orb1aCOfTrgSRpKPLbh1BHSvmjw3Hb2Pja6ZVS3/eHlQFpAfUVLVDRJBJpsTBt4x1zmr9MQUUUUAJtBo246UtFAFDVNDsNatXt760iuYWGGV1/rXmHiL4C2ttI1/4WvbjRbhPmW2hJMbn3ya9eooA8H0j4v8AiHwLeLY+OLTbGx2RSwjJbsCc17ZpOqQ6xp8N3bnMUq7lz1rl/iD8N7Xx3Ehkm8qeMfIdoPNee2Vl8QfhfKZBZp4i00cLFC+GUfQCkM92orzzwn8atF8RXSWFwJNO1To1tMOh+tegqwZcqQw9qYh1FJS0AFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFACGuR+J/iBvD/hW6uIZfLnUfKRXX14v8Yr43EE1owyh96TKRzHwt8I/8LIvBruot500L5DMa+jIYxDCiAYCgAV5l8BrFLHw3IsYwCfSvUKED3CiiimSFFFFABRRRQAUUUlAGZ4k1b+xdJmuumwV833cT+OvHdrqAVnEcg5HSvVfjJ4qgj8PXWnRti4YY461jfs96AF0WWe7UvLuyCwxUvcpaK57FZr5drCuMYRR+lTU32HanVRIUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAEc0fmwuh/iGK+dvjJof/CHzx30S8yPnK/WvovFee/GLwpL4o0iNI+sfPSkxo2vhnqA1DwhZS5yxXkZ5rqq8B+Evip7PXk0J5DmM7dte+NQgY6ikWlpiCiiigAooooAbtFLjtS0UAePfGT4e2kely6tpcHkapnPmr1qv8G/Hz2+nppeqzNLeZwCzZNeta1p66lZPE4BGO9fN81vHpPxUggXCjf0H1qepa2Pp4HIBpaZEcxofYU+qICiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBK5Hx34AtvF2lzRRn7PdsPlmB6V19Jt5zQB84aH4r1f4Ma1H4fvE+3wSvzOe1fQem6pb6raxy28qSBlBO05xXKfEzwfZavod3dtCGu0QlW715l8DfE0mh3F1aak7DcxCbm96nYrfU+g9xpaZG6zRrIp+VhkU+qJFooooAKKKKAEaqOr6xbaHZtc3ThIx3Jq8x2qTXgvxe8bDxWJPDtjn7SGwdvWkNHM6hJN40+JyPCzSaez84GR1r6R0fRrfRbVYbdNq45xXD/BzwXHoPhuL7Xbg3ec7mHNekUIGJS0UUxBRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFMmQSRupGQRin0UAfMviLRrvwL42m11sxwF8j86948C+Jl8VaGl4rbs8Zql8TPB58ZeH2s0X5+oI61494F8XXvgDxJF4YkGIi2MtU7MrdH0etLTY2EiKwOQRnNOqiQooooAKKKKACim7q57xp4wt/CGn+fOM7hgUAZvxD+JFp4L0qSePbd3I48hTk15V4O8I6r8R/EUXiplSxtw+fKYENWd4R0W68aeP21C6TzdOdshTkjrX0jY6db6XbrDaxLDGP4VqdytixGuyNV9BinUgpaokKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigCpqluLuxliIyGGK+avHVmPDPiq0VMpvkH86+nZmCxkngV83fGdxN4u0/yxv/eDp9aTKR9C6C/maNZt6xg1frN8O/8AICsf+uS1pUyQooooASkZsDJ4A60tU9WmW30y5Zjj9238qAPPPi18Ul8K2Cppkq3N052skfzEVzXwt+G91qGrR+Kr0jdMd3lsOa5P4aWL678Rr5LiNZIxIcbua+m7W1Szt1ijUKqjgCpWpWxIMDGOKdTdtOqiQooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAbwK8d+LXw5RVn8RWrE3cfzBVHNex02SFJoykiLIh6qwyKW4zx74K/EVb6xe21e48m6B2osvGa9hyGUMpyDzXzp8ZPDP2HxZb3lgPsoQhiIxgV6t8NPE1xrlisc8iyGNQMgULsN9ztxS0lLTJCiiigBvAGemK8K/aM1iS406C3txkhsH8690m/1L/Q187/Fdd12AxyN/epkUj034P6TFB4Ps52jAnYcmu9rmPhuNvhKzA9K6iqEFFFFAgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKTIorM8R+IrHwrpM2o6hKsFtEMs7HAFAFTxnrkOi6DdzGVVlVCVXPJrwfwVpF38VtYe8mLQpbvkbu+DXF+MPjlpvxA+IVtZ6VcXF5Ys4RxbAMtfUvhPQtN8M6Ktxa27W4aPe+8YPSp3L2RvWNr9jsoYM58tQuan+teG+PfizrGpXqWXhJwkqNtkZgDXp3gy31N9It7jVb157lly6YAApknSZpaZkbuOKfTEJzmuD+KPiAaPY7MkGRcV3lUdT0ez1q3eG7gWVWGMsORQB4f8ENNlXxRcXjFSsmTwea9+zXjV18DdQ8NX8mpeDtbeyu5DlornlPp0Nadr4q+IehKsWreHYdWVeDNp5Znb8OBSRTPUtwpa88X4vJB/x/eGdcsj3MlsMf+hVYt/jV4VdttzqAsG/u3I2mmSd3RXN2fxG8M6gQLbW7OYnoFkrdt7yG6XdDKkq/7DZoAnopOfSloAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKSloAKKKY00cf3pFX6kCgB9FVJ9Vs7ZS0t3Cij1cVy+sfF7wpou4T6tG8g/5ZxozH9BQBnfFTQjd6XcXSplkUnNcZ+zrqUlxc30UzYKkgAmrmtfE/X/HEclh4Y8NzXdjMNj3ko2hR64JFavwo+Edz4Lklu9Rukmmm+by0z8pPapL6anq1FIuBwOlLVEBRSE1DeTvb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",
      // REEMPLAZAR ESTE TEXTO CON EL CÓDIGO BASE64 DE LA IMAGEN REAL 2
    ],

    analisis: "",

    diagnostico_1: "", diagnostico_1_cie: "", diagnostico_1_pre: false, diagnostico_1_def: false,
    diagnostico_2: "", diagnostico_2_cie: "", diagnostico_2_pre: false, diagnostico_2_def: false,
    diagnostico_3: "", diagnostico_3_cie: "", diagnostico_3_pre: false, diagnostico_3_def: false,
    diagnostico_4: "", diagnostico_4_cie: "", diagnostico_4_pre: false, diagnostico_4_def: false,
    diagnostico_5: "", diagnostico_5_cie: "", diagnostico_5_pre: false, diagnostico_5_def: false,
    diagnostico_6: "", diagnostico_6_cie: "", diagnostico_6_pre: false, diagnostico_6_def: false,

    plan_tratamiento: "",

    fecha_atencion: today,
    hora_atencion: nowTime,
    profesional_primer_nombre: "",
    profesional_primer_apellido: "",
    profesional_segundo_apellido: "",
    profesional_documento: "",

    ...initialData,
  }));

  const [datos, setDatos] = useState<DatosAnamnesis>(initialState);

  const { isDirty, clearAutosave } = useFormAutosaveAndWarn({
    formId: `hc_anamnesis_${atencionId || 'new'}_${paciente?.cedula || 'new'}`,
    initialData: initialData || {},
    currentData: datos,
    onRestore: (saved) => setDatos(p => ({ ...p, ...saved })),
  });

  const set = (field: keyof DatosAnamnesis) => (v: string | boolean) =>
    setDatos((p) => ({ ...p, [field]: v }));

  const setStr = (field: keyof DatosAnamnesis) => (v: string) => {
    set(field)(v);
    if (field === "desc_antecedentes_personales") {
      window.dispatchEvent(new CustomEvent("sync_antecedentes", { detail: { source: "anamnesis", value: v } }));
    }
    if (field === "enfermedad_actual") {
      window.dispatchEvent(new CustomEvent("sync_enfermedad_actual", { detail: { source: "anamnesis", value: v } }));
    }
    if (["presion_arterial", "pulso", "frecuencia_respiratoria", "pulsioximetria", "perimetro_cefalico", "peso", "talla"].includes(field as string)) {
      window.dispatchEvent(new CustomEvent("sync_constante_vital", { detail: { source: "anamnesis", field, value: v } }));
    }
    if (field === "plan_tratamiento") {
      window.dispatchEvent(new CustomEvent("sync_plan_tratamiento", { detail: { source: "anamnesis", value: v } }));
    }
  };
  const setBool = (field: keyof DatosAnamnesis) => (v: boolean) => set(field)(v);

  const tableStyle: React.CSSProperties = {
    width: "100%",
    minWidth: "1200px",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    fontFamily: "Arial, sans-serif",
    fontSize: "11px",
  };

  // Filas de diagnóstico
  const diagRows = [1, 2, 3, 4, 5, 6] as const;

  useImperativeHandle(ref, () => ({
    getDatos: () => datos,
    clearAutosave: () => clearAutosave(),
    isDirty: () => isDirty,
  }), [datos, clearAutosave, isDirty]);

  useEffect(() => {
    const handleSyncAnt = (e: CustomEvent) => {
      if (e.detail.source !== "anamnesis") {
        setDatos(p => ({ ...p, desc_antecedentes_personales: e.detail.value }));
      }
    };
    const handleSyncEA = (e: CustomEvent) => {
      if (e.detail.source !== "anamnesis") {
        setDatos(p => ({ ...p, enfermedad_actual: e.detail.value }));
      }
    };
    const handleSyncConstante = (e: CustomEvent) => {
      if (e.detail.source !== "anamnesis") {
        setDatos(p => ({ ...p, [e.detail.field]: e.detail.value }));
      }
    };
    const handleSyncPlanTratamiento = (e: CustomEvent) => {
      if (e.detail.source !== "anamnesis") {
        setDatos(p => ({ ...p, plan_tratamiento: e.detail.value }));
      }
    };
    window.addEventListener("sync_antecedentes", handleSyncAnt as EventListener);
    window.addEventListener("sync_enfermedad_actual", handleSyncEA as EventListener);
    window.addEventListener("sync_constante_vital", handleSyncConstante as EventListener);
    window.addEventListener("sync_plan_tratamiento", handleSyncPlanTratamiento as EventListener);
    return () => {
      window.removeEventListener("sync_antecedentes", handleSyncAnt as EventListener);
      window.removeEventListener("sync_enfermedad_actual", handleSyncEA as EventListener);
      window.removeEventListener("sync_constante_vital", handleSyncConstante as EventListener);
      window.removeEventListener("sync_plan_tratamiento", handleSyncPlanTratamiento as EventListener);
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ── Área del formulario ──────────────────────────────────────────────── */}
      <div style={{ overflowY: "visible", overflowX: "visible", background: "#fff", minHeight: "70vh" }}>
        <table style={tableStyle}>
          <tbody>

            {/* ══════════════════════════════════════════════════════════════
                A. DATOS DEL ESTABLECIMIENTO Y USUARIO
                ══════════════════════════════════════════════════════════════ */}
            <tr>
              <td colSpan={20} style={{ ...sectionHeader, border: "1px solid #000" }}>
                A. DATOS DEL ESTABLECIMIENTO Y USUARIO / PACIENTE
              </td>
            </tr>
            {/* Labels fila 1 */}
            <tr>
              <td colSpan={4} style={tdLabel}><CeldaLabel>INSTITUCIÓN DEL SISTEMA</CeldaLabel></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel>UNICÓDIGO</CeldaLabel></td>
              <td colSpan={5} style={tdLabel}><CeldaLabel>ESTABLECIMIENTO DE SALUD</CeldaLabel></td>
              <td colSpan={5} style={tdLabel}><CeldaLabel>NÚMERO DE HISTORIA CLÍNICA ÚNICA</CeldaLabel></td>
              <td colSpan={4} style={tdLabel}><CeldaLabel>NÚMERO DE ARCHIVO</CeldaLabel></td>
            </tr>
            <tr style={{ height: 22 }}>
              <td colSpan={4} style={tdBase}><CeldaInput value={datos.institucion} onChange={setStr("institucion")} /></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.unicodigo} onChange={setStr("unicodigo")} center /></td>
              <td colSpan={5} style={tdBase}><CeldaInput value={datos.establecimiento} onChange={setStr("establecimiento")} /></td>
              <td colSpan={5} style={tdBase}><CeldaInput value={datos.numero_historia_clinica} onChange={setStr("numero_historia_clinica")} center /></td>
              <td colSpan={4} style={tdBase}><CeldaInput value={datos.numero_archivo} onChange={setStr("numero_archivo")} center /></td>
            </tr>
            {/* Labels fila 2 */}
            <tr>
              <td colSpan={4} style={tdLabel}><CeldaLabel>PRIMER APELLIDO</CeldaLabel></td>
              <td colSpan={3} style={tdLabel}><CeldaLabel>SEGUNDO APELLIDO</CeldaLabel></td>
              <td colSpan={4} style={tdLabel}><CeldaLabel>PRIMER NOMBRE</CeldaLabel></td>
              <td colSpan={3} style={tdLabel}><CeldaLabel>SEGUNDO NOMBRE</CeldaLabel></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel>SEXO</CeldaLabel></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel>EDAD</CeldaLabel></td>
              <td colSpan={2} style={tdLabel}>
                <CeldaLabel>COND. EDAD</CeldaLabel>
                <div style={{ display: "flex", justifyContent: "space-around", fontSize: "7px", fontWeight: 700 }}>
                  <span>H</span><span>D</span><span>M</span><span>A</span>
                </div>
              </td>
            </tr>
            <tr style={{ height: 22 }}>
              <td colSpan={4} style={tdBase}><CeldaInput value={datos.primer_apellido} onChange={setStr("primer_apellido")} /></td>
              <td colSpan={3} style={tdBase}><CeldaInput value={datos.segundo_apellido} onChange={setStr("segundo_apellido")} /></td>
              <td colSpan={4} style={tdBase}><CeldaInput value={datos.primer_nombre} onChange={setStr("primer_nombre")} /></td>
              <td colSpan={3} style={tdBase}><CeldaInput value={datos.segundo_nombre} onChange={setStr("segundo_nombre")} /></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.sexo} onChange={setStr("sexo")} center /></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.edad} onChange={setStr("edad")} center /></td>
              <td colSpan={2} style={tdBase}>
                <div style={{ display: "flex", justifyContent: "space-around", padding: "3px 2px" }}>
                  {(["H", "D", "M", "A"] as const).map((op) => (
                    <label key={op} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", gap: 1 }}>
                      <input type="radio" name="condicion_edad" value={op}
                        checked={datos.condicion_edad === op}
                        onChange={() => setDatos(p => ({ ...p, condicion_edad: op }))}
                        style={{ width: 10, height: 10 }} />
                    </label>
                  ))}
                </div>
              </td>
            </tr>

            {/* ══════════════════════════════════════════════════════════════
                B. MOTIVO DE CONSULTA
                ══════════════════════════════════════════════════════════════ */}
            <tr>
              <td colSpan={20} style={{ ...sectionHeader, border: "1px solid #000" }}>
                B. MOTIVO DE CONSULTA
              </td>
            </tr>
            <tr>
              <td colSpan={1} style={tdLabel}><CeldaLabel small>N°</CeldaLabel></td>
              <td colSpan={9} style={tdLabel}><CeldaLabel>MOTIVO</CeldaLabel></td>
              <td colSpan={1} style={tdLabel}><CeldaLabel small>N°</CeldaLabel></td>
              <td colSpan={9} style={tdLabel}><CeldaLabel>MOTIVO</CeldaLabel></td>
            </tr>
            {[1, 2, 3].map((n) => (
              <tr key={n} style={{ height: 22 }}>
                <td colSpan={1} style={{ ...tdBase, textAlign: "center", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700 }}>{n}</span>
                </td>
                <td colSpan={9} style={tdBase}>
                  <CeldaInput value={datos[`motivo_consulta_${n}` as keyof DatosAnamnesis] as string}
                    onChange={setStr(`motivo_consulta_${n}` as keyof DatosAnamnesis)} />
                </td>
                <td colSpan={1} style={{ ...tdBase, textAlign: "center", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700 }}>{n + 3}</span>
                </td>
                <td colSpan={9} style={tdBase}>
                  <CeldaInput value={datos[`motivo_consulta_${n + 3}` as keyof DatosAnamnesis] as string}
                    onChange={setStr(`motivo_consulta_${n + 3}` as keyof DatosAnamnesis)} />
                </td>
              </tr>
            ))}

            {/* ══════════════════════════════════════════════════════════════
                C. ANTECEDENTES PATOLÓGICOS PERSONALES
                ══════════════════════════════════════════════════════════════ */}
            <tr>
              <td colSpan={20} style={{ ...sectionHeader, border: "1px solid #000" }}>
                C. ANTECEDENTES PATOLÓGICOS PERSONALES
              </td>
            </tr>
            {/* Fila 1 antecedentes */}
            <tr>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>ALERGIA A MEDICAMENTOS</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.alergia_medicamentos} onChange={setStr("alergia_medicamentos")} /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>OTRAS ALERGIAS</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.otras_alergias} onChange={setStr("otras_alergias")} /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>VACUNAS</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.vacunas} onChange={setStr("vacunas")} /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>PATOLOGÍAS CLÍNICAS</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.patologias_clinicas} onChange={setStr("patologias_clinicas")} /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>MEDICACIÓN HABITUAL</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.medicacion_habitual} onChange={setStr("medicacion_habitual")} /></td>
            </tr>
            {/* Fila 2 antecedentes */}
            <tr>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>QUIRÚRGICOS</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.quirurgicos} onChange={setStr("quirurgicos")} /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>HÁBITOS</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.habitos} onChange={setStr("habitos")} /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>COND. SOCIOECONÓMICA</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.condicion_socioeconomica} onChange={setStr("condicion_socioeconomica")} /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>DISCAPACIDAD</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.discapacidad} onChange={setStr("discapacidad")} /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>RELIGIÓN</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.religion} onChange={setStr("religion")} /></td>
            </tr>
            <tr>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>TIPIF. SANGUÍNEA</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.tipificacion_sanguinea} onChange={setStr("tipificacion_sanguinea")} center /></td>
              <td colSpan={16} style={{ ...tdBase, background: "#fafafa" }} />
            </tr>

            {/* Sub-sección Gineco-Obstétricos */}
            <tr>
              <td colSpan={20} style={{ ...subSectionHeader, border: "1px solid #000" }}>
                GINECO-OBSTÉTRICOS / ANDROLÓGICOS
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>EDAD MENARQUIA</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.edad_menarquia} onChange={setStr("edad_menarquia")} center /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>EDAD MENOPAUSIA</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.edad_menopausia} onChange={setStr("edad_menopausia")} center /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>CICLOS</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.ciclos} onChange={setStr("ciclos")} center /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>EDAD INICIO V. SEXUAL</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.edad_inicio_vida_sexual} onChange={setStr("edad_inicio_vida_sexual")} center /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>N° GESTAS</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.numero_gestas} onChange={setStr("numero_gestas")} center /></td>
            </tr>
            <tr>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>N° PARTOS</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.numero_partos} onChange={setStr("numero_partos")} center /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>N° ABORTOS</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.numero_abortos} onChange={setStr("numero_abortos")} center /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>N° CESÁREAS</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.numero_cesareas} onChange={setStr("numero_cesareas")} center /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>N° HIJOS VIVOS</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.numero_hijos_vivos} onChange={setStr("numero_hijos_vivos")} center /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>F. ÚLT. MENSTRUACIÓN</CeldaLabel></td>
              <td colSpan={2} style={tdBase}>
                <input type="date" value={datos.fecha_ultima_menstruacion}
                  onChange={(e) => setStr("fecha_ultima_menstruacion")(e.target.value)}
                  style={{ border: "none", fontSize: "9px", padding: "2px", width: "100%", outline: "none" }} />
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>F. ÚLT. PARTO</CeldaLabel></td>
              <td colSpan={2} style={tdBase}>
                <input type="date" value={datos.fecha_ultimo_parto}
                  onChange={(e) => setStr("fecha_ultimo_parto")(e.target.value)}
                  style={{ border: "none", fontSize: "9px", padding: "2px", width: "100%", outline: "none" }} />
              </td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>F. ÚLT. CITOLOGÍA</CeldaLabel></td>
              <td colSpan={2} style={tdBase}>
                <input type="date" value={datos.fecha_ultima_citologia}
                  onChange={(e) => setStr("fecha_ultima_citologia")(e.target.value)}
                  style={{ border: "none", fontSize: "9px", padding: "2px", width: "100%", outline: "none" }} />
              </td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>F. ÚLT. COLPOSCOPÍA</CeldaLabel></td>
              <td colSpan={2} style={tdBase}>
                <input type="date" value={datos.fecha_ultima_colposcopia}
                  onChange={(e) => setStr("fecha_ultima_colposcopia")(e.target.value)}
                  style={{ border: "none", fontSize: "9px", padding: "2px", width: "100%", outline: "none" }} />
              </td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>F. ÚLT. MAMOGRAFÍA</CeldaLabel></td>
              <td colSpan={2} style={tdBase}>
                <input type="date" value={datos.fecha_ultima_mamografia}
                  onChange={(e) => setStr("fecha_ultima_mamografia")(e.target.value)}
                  style={{ border: "none", fontSize: "9px", padding: "2px", width: "100%", outline: "none" }} />
              </td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>MÉTODO PLANIF. FAMILIAR</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.metodo_planificacion_familiar} onChange={setStr("metodo_planificacion_familiar")} /></td>
            </tr>
            <tr>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>TERAPIA HORMONAL</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.terapia_hormonal} onChange={setStr("terapia_hormonal")} /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>F. ÚLT. ANTÍGENO PROSTÁTICO</CeldaLabel></td>
              <td colSpan={4} style={tdBase}>
                <input type="date" value={datos.fecha_ultimo_antigeno_prostatico}
                  onChange={(e) => setStr("fecha_ultimo_antigeno_prostatico")(e.target.value)}
                  style={{ border: "none", fontSize: "9px", padding: "2px", width: "100%", outline: "none" }} />
              </td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>F. ÚLT. ECO PROSTÁTICO</CeldaLabel></td>
              <td colSpan={4} style={tdBase}>
                <input type="date" value={datos.fecha_ultimo_eco_prostatico}
                  onChange={(e) => setStr("fecha_ultimo_eco_prostatico")(e.target.value)}
                  style={{ border: "none", fontSize: "9px", padding: "2px", width: "100%", outline: "none" }} />
              </td>
              <td colSpan={4} style={{ ...tdBase, background: "#fafafa" }} />
            </tr>
            <tr>
              <td colSpan={3} style={tdLabel}><CeldaLabel>DESCRIPCIÓN / OBSERVACIONES</CeldaLabel></td>
              <td colSpan={17} style={tdBase}>
                <RichTextEvolucion value={datos.desc_antecedentes_personales} onChange={setStr("desc_antecedentes_personales")} minHeight="45px" />
              </td>
            </tr>

            {/* ══════════════════════════════════════════════════════════════
                D. ANTECEDENTES PATOLÓGICOS FAMILIARES
                ══════════════════════════════════════════════════════════════ */}
            <tr>
              <td colSpan={20} style={{ ...sectionHeader, border: "1px solid #000" }}>
                D. ANTECEDENTES PATOLÓGICOS FAMILIARES
              </td>
            </tr>
            <tr>
              <td colSpan={20} style={{ ...tdBase, padding: "4px 6px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
                  <CheckItem label="Cardiopatía" checked={datos.antecedentes_familiares_cardiopatia} onChange={setBool("antecedentes_familiares_cardiopatia")} />
                  <CheckItem label="Hipertensión" checked={datos.antecedentes_familiares_hipertension} onChange={setBool("antecedentes_familiares_hipertension")} />
                  <CheckItem label="Enf. Cerebrovascular" checked={datos.antecedentes_familiares_enf_cvascular} onChange={setBool("antecedentes_familiares_enf_cvascular")} />
                  <CheckItem label="Endócrino" checked={datos.antecedentes_familiares_endocrino} onChange={setBool("antecedentes_familiares_endocrino")} />
                  <CheckItem label="Cáncer" checked={datos.antecedentes_familiares_cancer} onChange={setBool("antecedentes_familiares_cancer")} />
                  <CheckItem label="Tuberculosis" checked={datos.antecedentes_familiares_tuberculosis} onChange={setBool("antecedentes_familiares_tuberculosis")} />
                  <CheckItem label="Enf. Mental" checked={datos.antecedentes_familiares_enf_mental} onChange={setBool("antecedentes_familiares_enf_mental")} />
                  <CheckItem label="Enf. Infecciosa" checked={datos.antecedentes_familiares_enf_infecciosa} onChange={setBool("antecedentes_familiares_enf_infecciosa")} />
                  <CheckItem label="Malformación" checked={datos.antecedentes_familiares_malformacion} onChange={setBool("antecedentes_familiares_malformacion")} />
                  <CheckItem label="Otro" checked={datos.antecedentes_familiares_otro} onChange={setBool("antecedentes_familiares_otro")} />
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={tdLabel}><CeldaLabel>DESCRIPCIÓN</CeldaLabel></td>
              <td colSpan={17} style={tdBase}>
                <CeldaInput value={datos.desc_antecedentes_familiares} onChange={setStr("desc_antecedentes_familiares")} multiline rows={2} />
              </td>
            </tr>

            {/* ══════════════════════════════════════════════════════════════
                E. ENFERMEDAD O PROBLEMA ACTUAL
                ══════════════════════════════════════════════════════════════ */}
            <tr>
              <td colSpan={20} style={{ ...sectionHeader, border: "1px solid #000" }}>
                E. ENFERMEDAD O PROBLEMA ACTUAL
              </td>
            </tr>
            <tr>
              <td colSpan={20} style={tdBase}>
                <RichTextEvolucion value={datos.enfermedad_actual} onChange={setStr("enfermedad_actual")} minHeight="95px" placeholder="Describa la enfermedad o problema actual del paciente..." />
              </td>
            </tr>

            {/* ══════════════════════════════════════════════════════════════
                F. REVISIÓN ACTUAL DE ÓRGANOS Y SISTEMAS
                ══════════════════════════════════════════════════════════════ */}
            <tr>
              <td colSpan={20} style={{ ...sectionHeader, border: "1px solid #000" }}>
                F. REVISIÓN ACTUAL DE ÓRGANOS Y SISTEMAS
              </td>
            </tr>
            <tr>
              <td colSpan={20} style={{ ...tdBase, padding: "4px 6px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
                  <CheckItem label="Piel y Anexos" checked={datos.revision_piel_anexos} onChange={setBool("revision_piel_anexos")} />
                  <CheckItem label="Órganos de los Sentidos" checked={datos.revision_sentidos} onChange={setBool("revision_sentidos")} />
                  <CheckItem label="Respiratorio" checked={datos.revision_respiratorio} onChange={setBool("revision_respiratorio")} />
                  <CheckItem label="Cardiovascular" checked={datos.revision_cardiovascular} onChange={setBool("revision_cardiovascular")} />
                  <CheckItem label="Digestivo" checked={datos.revision_digestivo} onChange={setBool("revision_digestivo")} />
                  <CheckItem label="Genitourinario" checked={datos.revision_genitourinario} onChange={setBool("revision_genitourinario")} />
                  <CheckItem label="Músculo Esquelético" checked={datos.revision_musculo_esqueletico} onChange={setBool("revision_musculo_esqueletico")} />
                  <CheckItem label="Endócrino" checked={datos.revision_endocrino} onChange={setBool("revision_endocrino")} />
                  <CheckItem label="Hemolinfático" checked={datos.revision_hemo_linatico} onChange={setBool("revision_hemo_linatico")} />
                  <CheckItem label="Nervioso" checked={datos.revision_nervioso} onChange={setBool("revision_nervioso")} />
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={tdLabel}><CeldaLabel>DESCRIPCIÓN</CeldaLabel></td>
              <td colSpan={17} style={tdBase}>
                <CeldaInput value={datos.desc_revision_organos} onChange={setStr("desc_revision_organos")} multiline rows={2} />
              </td>
            </tr>

            {/* ══════════════════════════════════════════════════════════════
                DATOS DEL USUARIO / PACIENTE (resumen entre F y G)
                ══════════════════════════════════════════════════════════════ */}
            <tr>
              <td colSpan={20} style={{ ...sectionHeader, border: "1px solid #000", background: "#c6efce" }}>
                DATOS DEL USUARIO / PACIENTE
              </td>
            </tr>
            <tr>
              <td colSpan={5} style={tdLabel}><CeldaLabel>PRIMER APELLIDO</CeldaLabel></td>
              <td colSpan={4} style={tdLabel}><CeldaLabel>PRIMER NOMBRE</CeldaLabel></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel>EDAD</CeldaLabel></td>
              <td colSpan={5} style={tdLabel}><CeldaLabel>NÚMERO DE HISTORIA CLÍNICA ÚNICA</CeldaLabel></td>
              <td colSpan={4} style={tdLabel}><CeldaLabel>NÚMERO DE ARCHIVO</CeldaLabel></td>
            </tr>
            <tr style={{ height: 22 }}>
              <td colSpan={5} style={tdBase}><CeldaInput value={datos.primer_apellido} onChange={setStr("primer_apellido")} /></td>
              <td colSpan={4} style={tdBase}><CeldaInput value={datos.primer_nombre} onChange={setStr("primer_nombre")} /></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.edad} onChange={setStr("edad")} center /></td>
              <td colSpan={5} style={{ ...tdBase }}>
                <CeldaInput value={datos.numero_historia_clinica} onChange={setStr("numero_historia_clinica")} center />
              </td>
              <td colSpan={4} style={tdBase}><CeldaInput value={datos.numero_archivo} onChange={setStr("numero_archivo")} center /></td>
            </tr>

            {/* ══════════════════════════════════════════════════════════════
                G. CONSTANTES VITALES Y ANTROPOMETRÍA
                ══════════════════════════════════════════════════════════════ */}
            <tr>
              <td colSpan={20} style={{ ...sectionHeader, border: "1px solid #000" }}>
                G. CONSTANTES VITALES Y ANTROPOMETRÍA
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>TEMPERATURA (°C)</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.temperatura} onChange={setStr("temperatura")} center placeholder="36.5" /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>PRESIÓN ARTERIAL</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.presion_arterial} onChange={setStr("presion_arterial")} center placeholder="120/80" /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>PULSO (x min)</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.pulso} onChange={setStr("pulso")} center /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>FREC. RESPIRATORIA</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.frecuencia_respiratoria} onChange={setStr("frecuencia_respiratoria")} center /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>PESO (kg)</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.peso} onChange={setStr("peso")} center /></td>
            </tr>
            <tr>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>TALLA (cm)</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.talla} onChange={setStr("talla")} center /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>IMC</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.imc} onChange={setStr("imc")} center /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>PERÍMETRO CEFÁLICO</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.perimetro_cefalico} onChange={setStr("perimetro_cefalico")} center /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>PULSIOXIMETRÍA (%)</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.pulsioximetria} onChange={setStr("pulsioximetria")} center /></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>SCORE MAMÁ</CeldaLabel></td>
              <td colSpan={2} style={tdBase}><CeldaInput value={datos.score_mama} onChange={setStr("score_mama")} center /></td>
            </tr>
            <tr>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>OTROS</CeldaLabel></td>
              <td colSpan={18} style={tdBase}><CeldaInput value={datos.constantes_otros} onChange={setStr("constantes_otros")} /></td>
            </tr>

            {/* ══════════════════════════════════════════════════════════════
                H. EXAMEN FÍSICO
                ══════════════════════════════════════════════════════════════ */}
            <tr>
              <td colSpan={20} style={{ ...sectionHeader, border: "1px solid #000" }}>
                H. EXAMEN FÍSICO
              </td>
            </tr>
            <tr>
              <td colSpan={10} style={{ ...subSectionHeader, border: "1px solid #000" }}>REGIONAL</td>
              <td colSpan={10} style={{ ...subSectionHeader, border: "1px solid #000" }}>SISTÉMICO</td>
            </tr>
            <tr>
              <td colSpan={10} style={{ ...tdBase, padding: "4px 6px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 12px" }}>
                  <CheckItem label="Piel y Faneras" checked={datos.ef_piel_faneras} onChange={setBool("ef_piel_faneras")} />
                  <CheckItem label="Cabeza" checked={datos.ef_cabeza} onChange={setBool("ef_cabeza")} />
                  <CheckItem label="Ojos" checked={datos.ef_ojos} onChange={setBool("ef_ojos")} />
                  <CheckItem label="Oídos" checked={datos.ef_oidos} onChange={setBool("ef_oidos")} />
                  <CheckItem label="Nariz" checked={datos.ef_nariz} onChange={setBool("ef_nariz")} />
                  <CheckItem label="Boca" checked={datos.ef_boca} onChange={setBool("ef_boca")} />
                  <CheckItem label="Orofaringe" checked={datos.ef_orofaringe} onChange={setBool("ef_orofaringe")} />
                  <CheckItem label="Cuello" checked={datos.ef_cuello} onChange={setBool("ef_cuello")} />
                  <CheckItem label="Axilas y Mamas" checked={datos.ef_axilas_mamas} onChange={setBool("ef_axilas_mamas")} />
                  <CheckItem label="Tórax" checked={datos.ef_torax} onChange={setBool("ef_torax")} />
                  <CheckItem label="Abdomen" checked={datos.ef_abdomen} onChange={setBool("ef_abdomen")} />
                  <CheckItem label="Columna" checked={datos.ef_columna} onChange={setBool("ef_columna")} />
                  <CheckItem label="Ingle y Periné" checked={datos.ef_ingle_perine} onChange={setBool("ef_ingle_perine")} />
                  <CheckItem label="Miembros Superiores" checked={datos.ef_miem_superiores} onChange={setBool("ef_miem_superiores")} />
                  <CheckItem label="Miembros Inferiores" checked={datos.ef_miem_inferiores} onChange={setBool("ef_miem_inferiores")} />
                </div>
              </td>
              <td colSpan={10} style={{ ...tdBase, padding: "4px 6px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 12px" }}>
                  <CheckItem label="Órganos de los Sentidos" checked={datos.ef_sentidos} onChange={setBool("ef_sentidos")} />
                  <CheckItem label="Respiratorio" checked={datos.ef_respiratorio} onChange={setBool("ef_respiratorio")} />
                  <CheckItem label="Cardiovascular" checked={datos.ef_cardiovascular} onChange={setBool("ef_cardiovascular")} />
                  <CheckItem label="Digestivo" checked={datos.ef_digestivo} onChange={setBool("ef_digestivo")} />
                  <CheckItem label="Genital" checked={datos.ef_genital} onChange={setBool("ef_genital")} />
                  <CheckItem label="Urinario" checked={datos.ef_urinario} onChange={setBool("ef_urinario")} />
                  <CheckItem label="Músculo Esquelético" checked={datos.ef_musculo_esqueletico} onChange={setBool("ef_musculo_esqueletico")} />
                  <CheckItem label="Endócrino" checked={datos.ef_endocrino} onChange={setBool("ef_endocrino")} />
                  <CheckItem label="Hemolinfático" checked={datos.ef_hemo_linatico} onChange={setBool("ef_hemo_linatico")} />
                  <CheckItem label="Neurológico" checked={datos.ef_neurologico} onChange={setBool("ef_neurologico")} />
                </div>
              </td>
            </tr>
            <tr style={{ height: 120 }}>
              <td colSpan={10} style={tdBase}>
                <div style={{ fontSize: "8px", fontWeight: 700, padding: "2px 4px", color: "#555" }}>
                  DESCRIPCIÓN EXAMEN FÍSICO
                </div>
                <RichTextEvolucion value={datos.desc_examen_fisico} onChange={setStr("desc_examen_fisico")} minHeight="95px" />
              </td>
              <td colSpan={10} style={{ ...tdBase, background: "#fafafa" }}>
                <div style={{ padding: "3px 6px", fontSize: "8px", color: "#555", fontStyle: "italic" }}>
                  GRÁFICOS / IMÁGENES DEL EXAMEN FÍSICO
                </div>
                <div style={{ margin: "4px 6px 6px", display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 6 }}>
                  {datos.img_examen_fisico.map((src, idx) => (
                    <div key={idx} style={{ position: "relative", display: "inline-block" }}>
                      <img src={src} alt={`Imagen ${idx + 1}`}
                        style={{ height: 75, maxWidth: 110, objectFit: "contain", border: "1px solid #ddd", borderRadius: 4 }} />
                      <button type="button"
                        onClick={() => setDatos(p => ({ ...p, img_examen_fisico: p.img_examen_fisico.filter((_, i) => i !== idx) }))}
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
                  <label style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: 3, cursor: "pointer",
                    border: "1px dashed #aaa", borderRadius: 6, padding: "8px 14px",
                    background: "#f8f8f8", color: "#888", fontSize: "9px",
                    height: 75, minWidth: 75,
                  }}>
                    <span style={{ fontSize: "18px" }}>🖼️</span>
                    <span>Agregar</span>
                    <input type="file" accept="image/png,image/jpeg,image/gif" multiple
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        files.forEach(file => {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const base64 = ev.target?.result as string;
                            setDatos(p => ({ ...p, img_examen_fisico: [...p.img_examen_fisico, base64] }));
                          };
                          reader.readAsDataURL(file);
                        });
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </td>
            </tr>

            {/* ══════════════════════════════════════════════════════════════
                I. ANÁLISIS
                ══════════════════════════════════════════════════════════════ */}
            <tr>
              <td colSpan={20} style={{ ...sectionHeader, border: "1px solid #000" }}>
                I. ANÁLISIS
              </td>
            </tr>
            <tr>
              <td colSpan={20} style={tdBase}>
                <CeldaInput value={datos.analisis} onChange={setStr("analisis")} multiline rows={4} placeholder="Análisis clínico..." />
              </td>
            </tr>

            {/* ══════════════════════════════════════════════════════════════
                J. DIAGNÓSTICO
                ══════════════════════════════════════════════════════════════ */}
            <tr>
              <td colSpan={20} style={{ ...sectionHeader, border: "1px solid #000" }}>
                J. DIAGNÓSTICO
              </td>
            </tr>
            <tr>
              <td colSpan={1} style={tdLabel}><CeldaLabel small>N°</CeldaLabel></td>
              <td colSpan={12} style={tdLabel}><CeldaLabel>DIAGNÓSTICO</CeldaLabel></td>
              <td colSpan={3} style={tdLabel}><CeldaLabel>CIE-10</CeldaLabel></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>PRE</CeldaLabel></td>
              <td colSpan={2} style={tdLabel}><CeldaLabel small>DEF</CeldaLabel></td>
            </tr>
            {diagRows.map((n) => (
              <tr key={n} style={{ height: 24 }}>
                <td colSpan={1} style={{ ...tdBase, textAlign: "center", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700 }}>{n}</span>
                </td>
                <td colSpan={12} style={tdBase}>
                  <Cie10DescInput
                    cie={datos[`diagnostico_${n}_cie` as keyof DatosAnamnesis] as string}
                    descripcion={datos[`diagnostico_${n}` as keyof DatosAnamnesis] as string}
                    onChange={(cie, desc) => setDatos(p => ({
                      ...p,
                      [`diagnostico_${n}`]: desc,
                      [`diagnostico_${n}_cie`]: cie,
                    }))}
                  />
                </td>
                <td colSpan={3} style={tdBase}>
                  <Cie10CieInput
                    cie={datos[`diagnostico_${n}_cie` as keyof DatosAnamnesis] as string}
                    descripcion={datos[`diagnostico_${n}` as keyof DatosAnamnesis] as string}
                    onChange={(cie, desc) => setDatos(p => ({
                      ...p,
                      [`diagnostico_${n}`]: desc,
                      [`diagnostico_${n}_cie`]: cie,
                    }))}
                  />
                </td>
                <td colSpan={2} style={{ ...tdBase, textAlign: "center", verticalAlign: "middle" }}>
                  <input type="checkbox"
                    checked={datos[`diagnostico_${n}_pre` as keyof DatosAnamnesis] as boolean}
                    onChange={(e) => setBool(`diagnostico_${n}_pre` as keyof DatosAnamnesis)(e.target.checked)}
                    style={{ width: 13, height: 13 }} />
                </td>
                <td colSpan={2} style={{ ...tdBase, textAlign: "center", verticalAlign: "middle" }}>
                  <input type="checkbox"
                    checked={datos[`diagnostico_${n}_def` as keyof DatosAnamnesis] as boolean}
                    onChange={(e) => setBool(`diagnostico_${n}_def` as keyof DatosAnamnesis)(e.target.checked)}
                    style={{ width: 13, height: 13 }} />
                </td>
              </tr>
            ))}

            {/* ══════════════════════════════════════════════════════════════
                K. PLAN DE TRATAMIENTO
                ══════════════════════════════════════════════════════════════ */}
            <tr>
              <td colSpan={20} style={{ ...sectionHeader, border: "1px solid #000" }}>
                K. PLAN DE TRATAMIENTO
              </td>
            </tr>
            <tr>
              <td colSpan={20} style={tdBase}>
                <RichTextEvolucion value={datos.plan_tratamiento} onChange={setStr("plan_tratamiento")} minHeight="120px" placeholder="Indique el plan de tratamiento..." />
              </td>
            </tr>

            {/* ══════════════════════════════════════════════════════════════
                L. DATOS DEL PROFESIONAL RESPONSABLE
                ══════════════════════════════════════════════════════════════ */}
            <tr>
              <td colSpan={20} style={{ ...sectionHeader, border: "1px solid #000" }}>
                L. DATOS DEL PROFESIONAL RESPONSABLE
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={tdLabel}><CeldaLabel>FECHA</CeldaLabel></td>
              <td colSpan={2} style={tdBase}>
                <input type="date" value={datos.fecha_atencion}
                  onChange={(e) => setStr("fecha_atencion")(e.target.value)}
                  style={{ border: "none", fontSize: "10px", padding: "3px", width: "100%", outline: "none" }} />
              </td>
              <td colSpan={2} style={tdLabel}><CeldaLabel>HORA</CeldaLabel></td>
              <td colSpan={2} style={tdBase}>
                <input type="time" value={datos.hora_atencion}
                  onChange={(e) => setStr("hora_atencion")(e.target.value)}
                  style={{ border: "none", fontSize: "10px", padding: "3px", width: "100%", outline: "none" }} />
              </td>
              <td colSpan={3} style={tdLabel}><CeldaLabel>PRIMER NOMBRE PROFESIONAL</CeldaLabel></td>
              <td colSpan={3} style={tdBase}><CeldaInput value={datos.profesional_primer_nombre} onChange={setStr("profesional_primer_nombre")} /></td>
              <td colSpan={3} style={tdLabel}><CeldaLabel>PRIMER APELLIDO</CeldaLabel></td>
              <td colSpan={3} style={tdBase}><CeldaInput value={datos.profesional_primer_apellido} onChange={setStr("profesional_primer_apellido")} /></td>
            </tr>
            <tr>
              <td colSpan={3} style={tdLabel}><CeldaLabel>SEGUNDO APELLIDO PROFESIONAL</CeldaLabel></td>
              <td colSpan={5} style={tdBase}><CeldaInput value={datos.profesional_segundo_apellido} onChange={setStr("profesional_segundo_apellido")} /></td>
              <td colSpan={3} style={tdLabel}><CeldaLabel>N° DOCUMENTO / CÓDIGO</CeldaLabel></td>
              <td colSpan={5} style={tdBase}><CeldaInput value={datos.profesional_documento} onChange={setStr("profesional_documento")} /></td>
              <td colSpan={4} style={{ ...tdBase, background: "#f9f9f9" }}>
                <div style={{ fontSize: "7px", color: "#999", textAlign: "center", padding: "6px" }}>
                  (firma + sello en documento impreso)
                </div>
              </td>
            </tr>

            {/* Footer */}
            <tr>
              <td colSpan={12} style={{ border: "1px solid #000", fontSize: "8px", fontWeight: 700, padding: "3px 4px" }}>
                SNS-MSP / HCU-form.001/2008
              </td>
              <td colSpan={8} style={{ border: "1px solid #000", fontSize: "10px", fontWeight: 700, textAlign: "right", padding: "3px 4px" }}>
                HISTORIA CLÍNICA — ANAMNESIS
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
});

AnamnesisForm.displayName = 'HistoriaClinicaAnamnesisForm';

export default AnamnesisForm;