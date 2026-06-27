"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { buscarMedicos, type Medico } from "@/lib/services/medicos";

const FONT = "Arial, sans-serif";

const BASE_INPUT: React.CSSProperties = {
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

interface MedicoSearchHookProps {
  onSelectMedico: (medico: Medico) => void;
}

function useMedicoSearch({ onSelectMedico }: MedicoSearchHookProps) {
  const [opciones, setOpciones] = useState<Medico[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calcPos = useCallback((el: HTMLInputElement) => {
    const r = el.getBoundingClientRect();
    const dropWidth = Math.max(380, r.width); // A bit wider to show email and specialty
    const viewportWidth = window.innerWidth;
    const left = r.left + dropWidth > viewportWidth
      ? Math.max(0, viewportWidth - dropWidth - 8)
      : r.left;
    setDropPos({ top: r.bottom, left, width: dropWidth });
  }, []);

  const buscar = useCallback((q: string, el: HTMLInputElement) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.trim().length < 1) { setOpciones([]); setAbierto(false); return; }
    calcPos(el);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await buscarMedicos(q);
        setOpciones(res);
        setAbierto(res.length > 0);
        setHighlighted(-1);
        if (res.length > 0 && inputRef.current) calcPos(inputRef.current);
      } catch { setOpciones([]); setAbierto(false); }
    }, 250);
  }, [calcPos]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !dropRef.current?.contains(e.target as Node)
      ) setAbierto(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const seleccionar = useCallback((item: Medico) => {
    onSelectMedico(item);
    setAbierto(false);
    setOpciones([]);
  }, [onSelectMedico]);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (!abierto) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(h => Math.min(h + 1, opciones.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    else if (e.key === "Enter" && highlighted >= 0) { e.preventDefault(); seleccionar(opciones[highlighted]); }
    else if (e.key === "Escape") setAbierto(false);
  }, [abierto, highlighted, opciones, seleccionar]);

  return { opciones, abierto, highlighted, setHighlighted, dropPos, inputRef, dropRef, buscar, seleccionar, handleKey };
}

interface DropdownProps {
  opciones: Medico[];
  highlighted: number;
  onSelect: (item: Medico) => void;
  onHover: (i: number) => void;
  pos: { top: number; left: number; width: number };
  dropRef: React.RefObject<HTMLDivElement | null>;
}

function Dropdown({ opciones, highlighted, onSelect, onHover, pos, dropRef }: DropdownProps) {
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
          key={op.identificacion + op.nombre}
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
            flexDirection: "column",
            gap: 2,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
             <span style={{ fontWeight: 700, fontSize: "9px", color: i === highlighted ? "#cef" : "#1a3a5c" }}>
               {op.nombre}
             </span>
             <span style={{ fontSize: "8px", opacity: 0.8 }}>CI: {op.identificacion}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8.5px" }}>
            <span>{op.especialidad}</span>
            <span style={{ fontStyle: "italic", opacity: 0.8 }}>{op.correo}</span>
          </div>
        </div>
      ))}
    </div>,
    document.body,
  );
}

export function MedicoInput({
  value,
  onChangeValue,
  onSelectMedico,
  placeholder = "",
  center = false,
  style = {},
}: {
  value: string;
  onChangeValue: (v: string) => void;
  onSelectMedico: (m: Medico) => void;
  placeholder?: string;
  center?: boolean;
  style?: React.CSSProperties;
}) {
  const {
    opciones, abierto, highlighted, setHighlighted,
    dropPos, inputRef, dropRef, buscar, seleccionar, handleKey,
  } = useMedicoSearch({ onSelectMedico });

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        style={{ ...BASE_INPUT, textAlign: center ? "center" : "left", ...style }}
        onChange={(e) => { onChangeValue(e.target.value); buscar(e.target.value, e.currentTarget); }}
        onKeyDown={handleKey}
      />
      {abierto && dropPos && (
        <Dropdown
          dropRef={dropRef}
          opciones={opciones}
          highlighted={highlighted}
          onSelect={seleccionar}
          onHover={setHighlighted}
          pos={dropPos}
        />
      )}
    </div>
  );
}
