"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { buscarCie10, type Cie10Item } from "@/lib/services/cie10";

interface Props {
  cie: string;
  descripcion: string;
  onChange: (cie: string, descripcion: string) => void;
  placeholderDesc?: string;
  colSpanDesc?: number;
  colSpanCie?: number;
  cellStyle?: React.CSSProperties;
  showLabels?: boolean;
}

const FONT = "Arial, sans-serif";

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: "9px",
  fontFamily: FONT,
  padding: "2px 3px",
  color: "#000",
  boxSizing: "border-box",
};

const LBL_STYLE: React.CSSProperties = {
  fontSize: "7px",
  fontWeight: 700,
  padding: "2px 3px 1px",
  background: "#CCFFCC",
  color: "#000",
  lineHeight: 1.2,
  textAlign: "center",
  fontFamily: FONT,
};

const BORDER: React.CSSProperties = {
  border: "1px solid #000",
  padding: 0,
  verticalAlign: "top",
};

// ─── Dropdown portal ──────────────────────────────────────────────────────────

interface DropdownPortalProps {
  opciones: Cie10Item[];
  highlighted: number;
  onSelect: (item: Cie10Item) => void;
  onHover: (i: number) => void;
  pos: { top: number; left: number; width: number };
  dropRef: React.RefObject<HTMLDivElement | null>;
}

function DropdownPortal({ opciones, highlighted, onSelect, onHover, pos, dropRef }: DropdownPortalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    <div
      ref={dropRef}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: pos.width,
        zIndex: 99999,
        background: "#fff",
        border: "1px solid #1a3a5c",
        borderRadius: 4,
        boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
        maxHeight: 240,
        overflowY: "auto",
        fontFamily: FONT,
      }}
    >
      {opciones.length === 0 && (
        <div style={{ padding: "6px 10px", fontSize: "8px", color: "#888" }}>Sin resultados</div>
      )}
      {opciones.map((op, i) => (
        <div
          key={op.codigo}
          onMouseDown={(e) => { e.preventDefault(); onSelect(op); }}
          onMouseEnter={() => onHover(i)}
          style={{
            padding: "5px 10px",
            cursor: "pointer",
            fontSize: "9px",
            background: i === highlighted ? "#1a3a5c" : i % 2 === 0 ? "#f7f9fc" : "#fff",
            color: i === highlighted ? "#fff" : "#000",
            borderBottom: "1px solid #eee",
            display: "flex",
            gap: 8,
            alignItems: "baseline",
          }}
        >
          <span style={{
            fontWeight: 700, minWidth: 56,
            color: i === highlighted ? "#cef" : "#1a3a5c",
            fontSize: "9px", flexShrink: 0,
          }}>
            {op.codigo}
          </span>
          <span style={{ fontSize: "8.5px", lineHeight: 1.3 }}>{op.descripcion}</span>
        </div>
      ))}
    </div>,
    document.body,
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * Par de celdas <td> (descripción | CIE) con autocompletado CIE-10.
 * Uso dentro de un <tr>:
 *   <Cie10Autocomplete cie={...} descripcion={...} onChange={...} />
 */
export default function Cie10Autocomplete({
  cie,
  descripcion,
  onChange,
  placeholderDesc = "",
  colSpanDesc = 5,
  colSpanCie = 1,
  cellStyle,
  showLabels = false,
}: Props) {
  const [opciones, setOpciones] = useState<Cie10Item[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const descRef = useRef<HTMLInputElement>(null);
  const cieRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // position:fixed usa coordenadas del viewport — NO sumar window.scrollY
  const calcDropPos = (inputEl: HTMLInputElement) => {
    const rect = inputEl.getBoundingClientRect();
    const dropWidth = Math.max(320, rect.width);
    const viewportWidth = window.innerWidth;
    // Si el dropdown se saldría por la derecha, lo ancla al borde derecho del viewport
    const left = rect.left + dropWidth > viewportWidth
      ? Math.max(0, viewportWidth - dropWidth - 8)
      : rect.left;
    setDropPos({ top: rect.bottom, left, width: dropWidth });
  };

  const buscar = useCallback((q: string, inputEl: HTMLInputElement) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.trim().length < 1) { setOpciones([]); setAbierto(false); return; }
    calcDropPos(inputEl);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await buscarCie10(q);
        setOpciones(res);
        setAbierto(res.length > 0);
        setHighlighted(-1);
        const activeEl = document.activeElement as HTMLInputElement | null;
        if (res.length > 0 && activeEl) calcDropPos(activeEl);
      } catch { setOpciones([]); setAbierto(false); }
    }, 250);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !descRef.current?.contains(target) &&
        !cieRef.current?.contains(target) &&
        !dropRef.current?.contains(target)
      ) setAbierto(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const seleccionar = (item: Cie10Item) => {
    onChange(item.codigo, item.descripcion);
    setAbierto(false);
    setOpciones([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!abierto) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(h => Math.min(h + 1, opciones.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    else if (e.key === "Enter" && highlighted >= 0) { e.preventDefault(); seleccionar(opciones[highlighted]); }
    else if (e.key === "Escape") setAbierto(false);
  };

  const B = cellStyle ?? BORDER;

  return (
    <>
      {/* Celda descripción */}
      <td colSpan={colSpanDesc} style={B}>
        {showLabels && <div style={LBL_STYLE}>DIAGNÓSTICO</div>}
        <input
          ref={descRef}
          type="text"
          value={descripcion}
          placeholder={placeholderDesc}
          style={INPUT_STYLE}
          onChange={(e) => { onChange(cie, e.target.value); buscar(e.target.value, e.currentTarget); }}
          onKeyDown={handleKeyDown}
        />
      </td>

      {/* Celda CIE */}
      <td colSpan={colSpanCie} style={B}>
        {showLabels && <div style={LBL_STYLE}>CIE</div>}
        <input
          ref={cieRef}
          type="text"
          value={cie}
          style={{ ...INPUT_STYLE, textAlign: "center" }}
          onChange={(e) => { onChange(e.target.value, descripcion); buscar(e.target.value, e.currentTarget); }}
          onKeyDown={handleKeyDown}
        />
      </td>

      {/* Dropdown via portal — escapa cualquier overflow:hidden del ancestro */}
      {abierto && dropPos && (
        <DropdownPortal
          dropRef={dropRef}
          opciones={opciones}
          highlighted={highlighted}
          onSelect={seleccionar}
          onHover={setHighlighted}
          pos={dropPos}
        />
      )}
    </>
  );
}
