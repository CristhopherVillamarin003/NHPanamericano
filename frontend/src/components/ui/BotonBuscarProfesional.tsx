"use client";

import React, { useState } from "react";
import { Medico } from "@/lib/services/medicos";
import { MedicoInput } from "@/components/atencion/MedicoInput";

interface BotonBuscarProfesionalProps {
  onSelect: (medico: Medico) => void;
}

export function BotonBuscarProfesional({ onSelect }: BotonBuscarProfesionalProps) {
  const [abierto, setAbierto] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <div style={{ display: "inline-block", marginLeft: "10px", position: "relative" }}>
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        style={{
          background: "none",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "2px 6px",
          cursor: "pointer",
          fontSize: "9px",
          fontWeight: "bold",
          color: "#0369a1",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          backgroundColor: "#fff"
        }}
        title="Buscar Profesional"
      >
        🔍 Buscar Médico
      </button>

      {abierto && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          marginTop: "4px",
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "4px",
          width: "220px",
          display: "flex",
          alignItems: "center",
          boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
          zIndex: 9999
        }}>
          <div style={{ flex: 1 }}>
            <MedicoInput
              value={query}
              onChangeValue={setQuery}
              onSelectMedico={(m) => {
                onSelect(m);
                setAbierto(false);
                setQuery("");
              }}
              placeholder="Buscar..."
            />
          </div>
          <button
            type="button"
            onClick={() => setAbierto(false)}
            style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "10px", color: "#999", padding: "0 4px" }}
            title="Cancelar"
          >
            ❌
          </button>
        </div>
      )}
    </div>
  );
}
