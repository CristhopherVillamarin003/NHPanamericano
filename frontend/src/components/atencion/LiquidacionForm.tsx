import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { MedicoInput } from "./MedicoInput";
import { useFormAutosaveAndWarn } from "@/hooks/useFormAutosaveAndWarn";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ItemLiquidacion {
  id: string;
  detalle?: string;
  cantidad: string;
  unitario: string;
  total: string;
}

export interface DatosLiquidacion {
  // Datos del paciente
  fecha_ingreso: string;
  fecha_salida: string;
  hora_ingreso: string;
  hora_salida: string;
  nombre: string;
  cedula: string;
  DG: string;
  medico_tratante: string;
  telefono: string;
  observacion: string;

  // Ítems dinámicos
  items: ItemLiquidacion[];

  // Totales
  subtotal: string;
  descuento: string;
  total: string;
}

interface Props {
  isReadOnly?: boolean;
  atencionId?: number;
  paciente?: {
    primer_nombre?: string;
    segundo_nombre?: string;
    primer_apellido?: string;
    segundo_apellido?: string;
    cedula?: string;
    telefono?: string;
  } | any;
  medico?: string;
  initialData?: any; // any to support migration
  onGuardar?: (datos: DatosLiquidacion) => void;
  onExportarExcel?: (datos: DatosLiquidacion) => void;
  guardando?: boolean;
  exportando?: boolean;
}

export type LiquidacionFormHandle = {
  getDatos: () => DatosLiquidacion;
  clearAutosave?: () => void;
  isDirty?: () => boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function itemVacio(detalle: string = ""): ItemLiquidacion {
  return { id: Math.random().toString(36).substring(2, 9), detalle, cantidad: "", unitario: "", total: "0.00" };
}

function fmt(n: number): string {
  return n.toFixed(2);
}

function toNum(v: string): number {
  const n = parseFloat(String(v || "").replace(",", "."));
  return isNaN(n) ? 0 : n;
}

function calcTotal(item: ItemLiquidacion): string {
  const cant = toNum(item.cantidad) || 1;
  const unit = toNum(item.unitario);
  if (unit === 0) return "0.00";
  return fmt(cant * unit);
}

function nombreCompleto(p?: Props["paciente"]): string {
  if (!p) return "";
  const primer_apellido = p.primer_apellido || p.primerApellido;
  const segundo_apellido = p.segundo_apellido || p.segundoApellido;
  const primer_nombre = p.primer_nombre || p.primerNombre;
  const segundo_nombre = p.segundo_nombre || p.segundoNombre;
  return [primer_apellido, segundo_apellido, primer_nombre, segundo_nombre]
    .filter(Boolean).join(" ").toUpperCase();
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg, color: "#fff", border: "none", borderRadius: 4,
    padding: "6px 14px", fontSize: "11px", fontWeight: 700,
    cursor: "pointer", fontFamily: "Arial, sans-serif",
  };
}

// ─── Estilos base ─────────────────────────────────────────────────────────────

const tdH: React.CSSProperties = {
  border: "1px solid #999", padding: "3px 6px",
  background: "#1a3a5c", color: "#fff",
  fontWeight: 700, fontSize: "9px", fontFamily: "Arial, sans-serif",
  textAlign: "center", whiteSpace: "nowrap",
};
const tdL: React.CSSProperties = {
  border: "1px solid #ccc", padding: "2px 6px",
  background: "#eef3f9", fontWeight: 700,
  fontSize: "9px", fontFamily: "Arial, sans-serif",
  color: "#1a3a5c", whiteSpace: "nowrap",
};
const tdV: React.CSSProperties = {
  border: "1px solid #ccc", padding: 0, verticalAlign: "middle",
};
const tdN: React.CSSProperties = {
  ...tdV, textAlign: "right",
};

function numIn(value: string, onChange: (v: string) => void, align: "right" | "left" = "right", readOnly = false, customColor?: string): React.ReactElement {
  return (
    <input
      type="text"
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%", border: "none", outline: "none",
        background: "transparent",
        fontSize: "10px", fontFamily: "Arial, sans-serif",
        textAlign: align, padding: "3px 6px",
        color: customColor ? customColor : (readOnly ? "#555" : "#000"),
        boxSizing: "border-box",
      }}
    />
  );
}

function txtIn(value: string, onChange: (v: string) => void, readOnly = false, placeholder = ""): React.ReactElement {
  return (
    <input
      type="text"
      value={value}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%", border: "none", outline: "none",
        background: readOnly ? "transparent" : "#fff",
        fontSize: "10px", fontFamily: "Arial, sans-serif",
        padding: "3px 6px", color: "#000", boxSizing: "border-box",
      }}
    />
  );
}

// ─── Definición de ítems por defecto ───────────────────────────────────────────

const DEFAULT_LABELS = [
  "HABITACIÓN (Incluye cuidado y manejo diario de un paciente monitoreado)",
  "Medicinas e Insumos Quirúrgico",
  "Medicinas e Insumos Clínico",
  "Laboratorio",
  "Derecho de Sala",
  "Anestesia",
  "Honorarios Médicos Neurología / Internista",
  "Honorarios Médicos Traumatología",
  "TAC de Cráneo",
  "TAC de Columna Lumbar",
  "Rayos X AP + Lateral Columna Lumbar",
  "Eco Abdomen Superior",
  "Honorarios Médicos Traumatología (2)",
  "Emergencia"
];

// Migración de datos legados
function migrateInitialData(initial: any): ItemLiquidacion[] {
  if (initial?.items && Array.isArray(initial.items)) {
    return initial.items;
  }
  
  // Si no hay initialData o está vacío, creamos los por defecto
  if (!initial || Object.keys(initial).length === 0) {
    return DEFAULT_LABELS.map(label => itemVacio(label));
  }

  // Si tiene el formato viejo (keys fijas como 'habitacion')
  const keysFijas = [
    'habitacion', 'med_quirurgico', 'med_clinico', 'laboratorio', 'sala', 'anestesia',
    'honor_internista', 'honor_traumato', 'tac_craneo', 'tac_columna', 'rayosx', 'eco',
    'honor_traumato2', 'emergencia'
  ];
  
  const migrados: ItemLiquidacion[] = [];
  keysFijas.forEach((k, i) => {
    if (initial[k]) {
      migrados.push({
        id: Math.random().toString(36).substring(2, 9),
        detalle: initial[k].detalle || DEFAULT_LABELS[i],
        cantidad: initial[k].cantidad || "",
        unitario: initial[k].unitario || "",
        total: initial[k].total || "0.00",
      });
    } else {
      migrados.push(itemVacio(DEFAULT_LABELS[i]));
    }
  });
  
  return migrados;
}

// ─── Componente Principal ─────────────────────────────────────────────────────

const LiquidacionForm = forwardRef<LiquidacionFormHandle, Props>(({
  isReadOnly = false,
  atencionId,
  paciente,
  medico,
  initialData,
  onGuardar,
  onExportarExcel,
  guardando = false,
  exportando = false,
}, ref) => {
  const today = new Date().toISOString().split("T")[0];

  const [d, setD] = useState<DatosLiquidacion>(() => {
    const defaultData: DatosLiquidacion = {
      fecha_ingreso: today,
      fecha_salida: today,
      hora_ingreso: "",
      hora_salida: "",
      nombre: nombreCompleto(paciente),
      cedula: paciente?.cedula ?? "",
      DG: "",
      medico_tratante: medico ?? "",
      telefono: paciente?.telefono ?? "",
      observacion: "",
      items: migrateInitialData(initialData),
      subtotal: initialData?.subtotal || "0.00",
      descuento: initialData?.descuento || "0.00",
      total: initialData?.total || "0.00",
    };
    
    // Si hay initialData para los campos simples, lo aplicamos
    if (initialData) {
      if (initialData.fecha_ingreso !== undefined) defaultData.fecha_ingreso = initialData.fecha_ingreso;
      if (initialData.fecha_salida !== undefined) defaultData.fecha_salida = initialData.fecha_salida;
      if (initialData.hora_ingreso !== undefined) defaultData.hora_ingreso = initialData.hora_ingreso;
      if (initialData.hora_salida !== undefined) defaultData.hora_salida = initialData.hora_salida;
      if (initialData.nombre !== undefined) defaultData.nombre = initialData.nombre;
      if (initialData.cedula !== undefined) defaultData.cedula = initialData.cedula;
      if (initialData.DG !== undefined) defaultData.DG = initialData.DG;
      if (initialData.medico_tratante !== undefined) defaultData.medico_tratante = initialData.medico_tratante;
      if (initialData.telefono !== undefined) defaultData.telefono = initialData.telefono;
      if (initialData.observacion !== undefined) defaultData.observacion = initialData.observacion;
    }
    
    return defaultData;
  });

  const { isDirty, clearAutosave } = useFormAutosaveAndWarn({
    formId: `liquidacion_${atencionId || 'new'}_${paciente?.cedula || 'new'}`,
    initialData: initialData || {},
    currentData: d,
    onRestore: (saved) => setD(p => ({ ...p, ...saved })),
  });

  useImperativeHandle(ref, () => ({
    getDatos: () => d,
    clearAutosave,
    isDirty: () => isDirty,
  }), [d, clearAutosave, isDirty]);

  // Recalcular totales cuando cambian los ítems o descuento
  useEffect(() => {
    const sub = d.items.reduce((acc, item) => acc + toNum(item.total), 0);
    const desc = toNum(d.descuento);
    setD(p => ({
      ...p,
      subtotal: fmt(sub),
      total: fmt(Math.max(0, sub - desc)),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.items, d.descuento]);

  // Calcular días de estadía y actualizar la fila de "HABITACIÓN"
  useEffect(() => {
    if (isReadOnly) return;
    if (d.fecha_ingreso && d.fecha_salida) {
      const start = new Date(d.fecha_ingreso);
      const end = new Date(d.fecha_salida);
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = end.getTime() - start.getTime();
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) diffDays = 1;

        const nuevaCantidad = String(diffDays);
        const nuevoUnitario = "150.00";

        setD(prev => {
          // Buscamos la fila que dice HABITACIÓN
          const habIdx = prev.items.findIndex(it => it.detalle?.toUpperCase().includes("HABITACIÓN"));
          if (habIdx === -1) return prev; // Si la borraron, no hacemos nada
          
          const hab = prev.items[habIdx];
          if (hab.cantidad !== nuevaCantidad || hab.unitario !== nuevoUnitario) {
            const nextHab = { ...hab, cantidad: nuevaCantidad, unitario: nuevoUnitario };
            nextHab.total = calcTotal(nextHab);
            const nextItems = [...prev.items];
            nextItems[habIdx] = nextHab;
            return { ...prev, items: nextItems };
          }
          return prev;
        });
      }
    }
  }, [d.fecha_ingreso, d.fecha_salida, isReadOnly]);

  // Actualizar un campo de item
  const setItem = (idx: number, campo: keyof ItemLiquidacion, val: string) => {
    if (isReadOnly) return;
    setD(p => {
      const nextItems = [...p.items];
      const prev = nextItems[idx];
      const next = { ...prev, [campo]: val };
      if (campo === "cantidad" || campo === "unitario") {
        next.total = calcTotal(next);
      }
      nextItems[idx] = next;
      return { ...p, items: nextItems };
    });
  };
  
  // Agregar item arriba o abajo
  const addItem = (idx: number, posicion: 'arriba' | 'abajo') => {
    if (isReadOnly) return;
    // Si ya llegamos a 35 ítems, podemos limitar o simplemente dejar que Excel lo ignore, pero mejor limitar a 35 por seguridad
    if (d.items.length >= 35) {
      alert("Se ha alcanzado el límite máximo de 35 filas.");
      return;
    }
    
    setD(p => {
      const nextItems = [...p.items];
      const insertAt = posicion === 'arriba' ? idx : idx + 1;
      nextItems.splice(insertAt, 0, itemVacio(""));
      return { ...p, items: nextItems };
    });
  };
  
  // Eliminar item
  const removeItem = (idx: number) => {
    if (isReadOnly) return;
    setD(p => {
      const nextItems = [...p.items];
      nextItems.splice(idx, 1);
      return { ...p, items: nextItems };
    });
  };

  const s = (k: keyof DatosLiquidacion) => (v: string) => {
    if (isReadOnly) return;
    setD(p => ({ ...p, [k]: v }));
  };

  const handleGuardar = () => {
    onGuardar?.(d);
  };

  const handleExcel = () => {
    onExportarExcel?.(d);
  };

  const tbl: React.CSSProperties = {
    width: "100%", borderCollapse: "collapse",
    fontFamily: "Arial, sans-serif", fontSize: "10px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      {/* ── Barra de acciones ──────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 14px", background: "#f5f7fa",
        borderBottom: "1px solid #dde3ea", gap: 8,
      }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#1a3a5c", fontFamily: "Arial, sans-serif" }}>
            LIQUIDACIÓN DE PACIENTE
          </span>
          <span style={{ fontSize: "10px", color: "#7a8a9a", marginLeft: 10 }}>
            Nuevo Hospital Panamericano
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {!isReadOnly && (
            <button onClick={handleGuardar} disabled={guardando} style={btnStyle("#1a3a5c")}>
              {guardando ? "Guardando..." : "💾 Guardar"}
            </button>
          )}
          <button onClick={handleExcel} disabled={exportando} style={btnStyle("#1e6b2e")}>
            {exportando ? "Exportando..." : "📊 Descargar Excel"}
          </button>
        </div>
      </div>

      {/* ── Documento ─────────────────────────────────────────────────────── */}
      <div className={isReadOnly ? 'read-only-mode' : ''} inert={isReadOnly ? true : undefined} style={{
        background: "#fff", border: "1px solid #c8d8e8",
        margin: "12px", borderRadius: 6,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        overflow: "hidden", minWidth: 620, maxWidth: 860,
      }}>

        {/* ══ ENCABEZADO ══════════════════════════════════════════════════════ */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "14px 20px 12px", borderBottom: "2px solid #1a3a5c",
          background: "#f8fafd",
        }}>

          {/* Texto */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a3a5c", fontFamily: "Arial, sans-serif" }}>
              NUEVO HOSPITAL PANAMERICANO VALECAM S.A.S
            </div>
            <div style={{ fontSize: "8.5px", color: "#555", marginTop: 3, lineHeight: 1.6, fontFamily: "Arial, sans-serif" }}>
              Dirección: S9H Juan de Arguello Oe2 Pedro de Alfaro (Esq.)
            </div>
            <div style={{ fontSize: "8.5px", color: "#555", lineHeight: 1.6, fontFamily: "Arial, sans-serif" }}>
              Teléfonos: 022612-802 / 022617-984 &nbsp;|&nbsp; nhpanamericano.vlc@gmail.com &nbsp;|&nbsp; Quito - Ecuador
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 20px" }}>
          <table style={tbl}>
            <tbody>

              {/* ══ FECHAS Y HORAS ════════════════════════════════════════════ */}
              <tr>
                <td style={{ ...tdL, width: 80 }}>INGRESO</td>
                <td style={{ ...tdV, width: 130 }}>
                  <input type="date" value={d.fecha_ingreso} onChange={(e) => s("fecha_ingreso")(e.target.value)}
                    readOnly={isReadOnly}
                    style={{ border: "none", outline: "none", fontSize: "10px", padding: "3px 6px", width: "100%", fontFamily: "Arial, sans-serif", background: isReadOnly ? 'transparent' : '#fff' }} />
                </td>
                <td style={{ ...tdL, width: 60 }}>SALIDA</td>
                <td style={tdV}>
                  <input type="date" value={d.fecha_salida} onChange={(e) => s("fecha_salida")(e.target.value)}
                    readOnly={isReadOnly}
                    style={{ border: "none", outline: "none", fontSize: "10px", padding: "3px 6px", width: "100%", fontFamily: "Arial, sans-serif", background: isReadOnly ? 'transparent' : '#fff' }} />
                </td>
              </tr>
              <tr>
                <td style={tdL}>HORA:</td>
                <td style={tdV}>
                  <input type="time" value={d.hora_ingreso} onChange={(e) => s("hora_ingreso")(e.target.value)}
                    readOnly={isReadOnly}
                    style={{ border: "none", outline: "none", fontSize: "10px", padding: "3px 6px", width: "100%", fontFamily: "Arial, sans-serif", background: isReadOnly ? 'transparent' : '#fff' }} />
                </td>
                <td style={tdL}>HORA:</td>
                <td style={tdV}>
                  <input type="time" value={d.hora_salida} onChange={(e) => s("hora_salida")(e.target.value)}
                    readOnly={isReadOnly}
                    style={{ border: "none", outline: "none", fontSize: "10px", padding: "3px 6px", width: "100%", fontFamily: "Arial, sans-serif", background: isReadOnly ? 'transparent' : '#fff' }} />
                </td>
              </tr>

              {/* ══ DATOS DEL PACIENTE ════════════════════════════════════════ */}
              <tr>
                <td style={tdL}>Nombre:</td>
                <td style={tdV} colSpan={2}>{txtIn(d.nombre, s("nombre"), isReadOnly)}</td>
                <td style={{ ...tdV }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ ...tdL, border: "none", background: "transparent", paddingRight: 4, whiteSpace: "nowrap" }}>
                      C.I:
                    </span>
                    {txtIn(d.cedula, s("cedula"), isReadOnly, "0000000000")}
                  </div>
                </td>
              </tr>
              <tr>
                <td style={tdL}>DG:</td>
                <td style={tdV} colSpan={3}>{txtIn(d.DG, s("DG"), isReadOnly, "Diagnóstico")}</td>
              </tr>
              <tr>
                <td style={tdL}>Médico Tratante:</td>
                <td style={tdV} colSpan={3}>
                  {isReadOnly ? (
                    txtIn(d.medico_tratante, s("medico_tratante"), isReadOnly, "Nombre del médico")
                  ) : (
                    <MedicoInput
                      value={d.medico_tratante}
                      onChangeValue={s("medico_tratante")}
                      onSelectMedico={(m) => s("medico_tratante")(m.nombre)}
                      placeholder="Nombre del médico"
                      style={{
                        background: "#fff",
                        fontSize: "10px",
                        padding: "3px 6px",
                        color: "#000",
                      }}
                    />
                  )}
                </td>
              </tr>
              <tr>
                <td style={tdL}>Teléfono:</td>
                <td style={tdV} colSpan={3}>{txtIn(d.telefono, s("telefono"), isReadOnly, "0999999999")}</td>
              </tr>
              <tr>
                <td style={tdL}>Observación:</td>
                <td style={tdV} colSpan={3}>{txtIn(d.observacion, s("observacion"), isReadOnly, "Observaciones adicionales...")}</td>
              </tr>

              {/* ══ CABECERA DE LA TABLA DE ÍTEMS ════════════════════════════ */}
              <tr>
                <td style={{ ...tdH, width: 50, textAlign: "center" }}>CANT.</td>
                <td style={{ ...tdH }}>DETALLE</td>
                <td style={{ ...tdH, width: 90, textAlign: "center" }}>V. UNITARIO</td>
                <td style={{ ...tdH, width: 100, textAlign: "center" }}>VALOR TOTAL</td>
                {!isReadOnly && <td style={{ ...tdH, width: 50, textAlign: "center", background: "#f5f7fa", border: "none" }}></td>}
              </tr>

              {/* ══ ÍTEMS ════════════════════════════════════════════════════ */}
              {d.items.map((item, idx) => {
                const isEven = idx % 2 === 0;
                const rowBg = isEven ? "#fff" : "#f7faff";
                return (
                  <tr key={item.id}>
                    {/* Cantidad */}
                    <td style={{ ...tdN, background: rowBg, width: 50 }}>
                      {numIn(item.cantidad, (v) => setItem(idx, "cantidad", v), "right", isReadOnly)}
                    </td>
                    {/* Descripción editable */}
                    <td style={{ ...tdV, background: rowBg }}>
                      <textarea
                        value={item.detalle ?? ""}
                        readOnly={isReadOnly}
                        onChange={(e) => setItem(idx, "detalle", e.target.value)}
                        rows={1}
                        style={{
                          width: "100%", border: "none", outline: "none",
                          background: "transparent", fontSize: "9px",
                          fontFamily: "Arial, sans-serif", padding: "3px 6px",
                          color: "#333", boxSizing: "border-box", resize: "none",
                          overflow: "hidden", minHeight: "18px"
                        }}
                        ref={(el) => {
                          if (el) {
                            el.style.height = "auto";
                            el.style.height = `${Math.max(el.scrollHeight, 18)}px`;
                          }
                        }}
                        onInput={(e) => {
                          e.currentTarget.style.height = "auto";
                          e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                        }}
                      />
                    </td>
                    {/* Unitario */}
                    <td style={{ ...tdN, background: rowBg, width: 90 }}>
                      {numIn(item.unitario, (v) => setItem(idx, "unitario", v), "right", isReadOnly)}
                    </td>
                    {/* Total — calculado automáticamente */}
                    <td style={{ ...tdN, background: "#f0f4f8", width: 100 }}>
                      {numIn(item.total, (v) => setItem(idx, "total", v), "right", isReadOnly)}
                    </td>
                    {/* Controles para agregar o quitar filas */}
                    {!isReadOnly && (
                      <td style={{ textAlign: "center", verticalAlign: "middle", width: 50, padding: "0 4px" }}>
                        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                          <button
                            onClick={() => addItem(idx, 'arriba')}
                            title="Añadir arriba"
                            style={{ cursor: "pointer", background: "#eef3f9", border: "1px solid #c8d8e8", borderRadius: 2, padding: "2px 4px", fontSize: "8px", color: "#1a3a5c" }}
                          >
                            +↑
                          </button>
                          <button
                            onClick={() => addItem(idx, 'abajo')}
                            title="Añadir abajo"
                            style={{ cursor: "pointer", background: "#eef3f9", border: "1px solid #c8d8e8", borderRadius: 2, padding: "2px 4px", fontSize: "8px", color: "#1a3a5c" }}
                          >
                            +↓
                          </button>
                          <button
                            onClick={() => removeItem(idx)}
                            title="Eliminar fila"
                            style={{ cursor: "pointer", background: "#fee", border: "1px solid #fcc", borderRadius: 2, padding: "2px 4px", fontSize: "8px", color: "#c00" }}
                          >
                            -
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}

              {/* ══ SUBTOTAL / DESCUENTO / TOTAL ═════════════════════════════ */}
              <tr style={{ borderTop: "2px solid #1a3a5c" }}>
                <td colSpan={3} style={{
                  ...tdL, textAlign: "right", fontSize: "10px",
                  padding: "4px 10px", background: "#eef3f9",
                }}>
                  SUBTOTAL
                </td>
                <td style={{ ...tdN, background: "#eef3f9", fontWeight: 700, fontSize: "11px", padding: "4px 6px" }}>
                  {numIn(d.subtotal, s("subtotal"), "right", isReadOnly)}
                </td>
                {!isReadOnly && <td></td>}
              </tr>
              <tr>
                <td colSpan={3} style={{
                  ...tdL, textAlign: "right", fontSize: "10px",
                  padding: "4px 10px", background: "#fff8e1",
                }}>
                  DESCUENTO
                </td>
                <td style={{ ...tdN, background: "#fff8e1" }}>
                  {numIn(d.descuento, s("descuento"), "right", isReadOnly)}
                </td>
                {!isReadOnly && <td></td>}
              </tr>
              <tr>
                <td colSpan={3} style={{
                  ...tdL, textAlign: "right", fontSize: "12px",
                  padding: "5px 10px", background: "#1a3a5c", color: "#fff",
                  letterSpacing: "0.06em",
                }}>
                  TOTAL
                </td>
                <td style={{
                  ...tdN, background: "#1a3a5c", color: "#fff",
                  fontWeight: 700, fontSize: "13px", padding: "5px 6px",
                  fontFamily: "Arial, sans-serif",
                }}>
                  {numIn(d.total, s("total"), "right", isReadOnly, "#fff")}
                </td>
                {!isReadOnly && <td></td>}
              </tr>

            </tbody>
          </table>

          {/* Nota al pie */}
          <div style={{
            marginTop: 14, textAlign: "center",
            fontSize: "8px", color: "#aab8c8", fontFamily: "Arial, sans-serif",
            fontStyle: "italic",
          }}>
            * Los totales se calculan automáticamente. Puede editar directamente la columna VALOR TOTAL si el cálculo no aplica.
          </div>
        </div>

        {/* Pie */}
        <div style={{
          background: "#1a3a5c", padding: "10px 20px", color: "#fff",
          fontSize: "8.5px", display: "flex", justifyContent: "space-between",
          fontFamily: "Arial, sans-serif",
        }}>
          <div>Reciba un cordial saludo.</div>
          <div style={{ opacity: 0.8 }}>Valecam S.A.S</div>
        </div>
      </div>
    </div>
  );
});

export default LiquidacionForm;
