"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { buscarCie10, type Cie10Item } from "@/lib/services/cie10";

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

interface Cie10SearchHookProps {
  onSelectCie10: (cie10: Cie10Item) => void;
}

function useCie10Search({ onSelectCie10 }: Cie10SearchHookProps) {
  const [opciones, setOpciones] = useState<Cie10Item[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calcPos = useCallback((el: HTMLInputElement) => {
    const r = el.getBoundingClientRect();
    const dropWidth = Math.max(380, r.width);
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
        const res = await buscarCie10(q);
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

  const seleccionar = useCallback((item: Cie10Item) => {
    onSelectCie10(item);
    setAbierto(false);
    setOpciones([]);
  }, [onSelectCie10]);

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
  opciones: Cie10Item[];
  highlighted: number;
  onSelect: (item: Cie10Item) => void;
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
            flexDirection: "column",
          }}
        >
          <strong style={{ fontSize: "10px" }}>{op.codigo}</strong>
          <span style={{ color: i === highlighted ? "#ccc" : "#555" }}>{op.descripcion}</span>
        </div>
      ))}
    </div>,
    document.body
  );
}

interface Cie10SearchInputProps {
  value: string;
  onChangeValue: (v: string) => void;
  onSelectCie10: (cie10: Cie10Item) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function Cie10SearchInput({ value, onChangeValue, onSelectCie10, placeholder = "Buscar CIE 10...", autoFocus }: Cie10SearchInputProps) {
  const { opciones, abierto, highlighted, setHighlighted, dropPos, inputRef, dropRef, buscar, seleccionar, handleKey } = useCie10Search({ onSelectCie10 });

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{ ...BASE_INPUT, border: '1px solid #ccc', borderRadius: '4px', padding: '4px 6px' }}
        onChange={(e) => {
          onChangeValue(e.target.value);
          buscar(e.target.value, e.currentTarget);
        }}
        onKeyDown={handleKey}
        onClick={(e) => {
          if (value.trim()) buscar(value, e.currentTarget);
        }}
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
    </>
  );
}
