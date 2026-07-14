"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Medico } from "@/lib/services/medicos";
import { MedicoInput } from "../atencion/MedicoInput";

interface RichTextEvolucionProps {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  minHeight?: string;
  placeholder?: string;
  enableMedicoSelect?: boolean;
}

export default function RichTextEvolucion({
  value,
  onChange,
  readOnly = false,
  minHeight = "120px",
  placeholder = "",
  enableMedicoSelect = false,
}: RichTextEvolucionProps) {
  const [medicoSearchAbierto, setMedicoSearchAbierto] = useState(false);
  const [medicoQuery, setMedicoQuery] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        code: false,
        italic: false, 
      }),
    ],
    content: value,
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: "rich-text-editor-content",
        style: `min-height: ${minHeight}; outline: none; padding: 6px; font-family: Arial, sans-serif; font-size: 11px; line-height: 1.3; width: 100%; box-sizing: border-box;`,
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  // Comprobar si está "vacío" para el placeholder manual
  const isEmpty = editor.getText().trim() === "" && editor.getJSON().content?.length === 1 && !editor.getJSON().content?.[0]?.content;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        border: "none",
        background: readOnly ? "#f0f0f0" : "#fff",
        boxSizing: "border-box",
      }}
    >
      {!readOnly && (
        <div
          style={{
            display: "flex",
            gap: "4px",
            padding: "4px",
            borderBottom: "1px solid #eee",
            background: "#f9f9f9",
          }}
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            style={{
              padding: "2px 8px",
              fontSize: "12px",
              fontWeight: "bold",
              background: editor.isActive("bold") ? "#d1d5db" : "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
              color: "#000",
            }}
            title="Negrita"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            style={{
              padding: "2px 8px",
              fontSize: "12px",
              fontWeight: "bold",
              background: editor.isActive("orderedList") ? "#d1d5db" : "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
              color: "#000",
            }}
            title="Lista numerada"
          >
            1. 2. 3.
          </button>
        </div>
      )}
      <div style={{ position: "relative" }}>
        {isEmpty && placeholder && !readOnly && (
           <div style={{
             position: 'absolute',
             top: '6px',
             left: '6px',
             color: '#9ca3af',
             pointerEvents: 'none',
             fontSize: '11px',
             fontFamily: 'Arial, sans-serif'
           }}>
             {placeholder}
           </div>
        )}
        <style>{`
          .rich-text-editor-content p {
            margin: 0 0 0.5em 0;
          }
          .rich-text-editor-content p:last-child {
            margin: 0;
          }
          .rich-text-editor-content ol {
            list-style-type: decimal;
            padding-left: 1.5em;
            margin: 0 0 0.5em 0;
          }
          .rich-text-editor-content li {
            margin-bottom: 2px;
          }
          .rich-text-editor-content li p {
            margin: 0;
            display: inline;
          }
        `}</style>
        <EditorContent editor={editor} />
        
        {enableMedicoSelect && !readOnly && (
          <div style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 10 }}>
            {!medicoSearchAbierto ? (
              <button
                type="button"
                onClick={() => setMedicoSearchAbierto(true)}
                style={{
                  background: '#e0f2fe',
                  border: '1px solid #7dd3fc',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#0369a1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                title="Insertar Médico"
              >
                ⚕️ Médico 🔽
              </button>
            ) : (
              <div style={{ 
                background: '#fff', 
                border: '1px solid #ccc', 
                borderRadius: '4px', 
                padding: '4px', 
                width: '220px', 
                display: 'flex', 
                alignItems: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
              }}>
                <div style={{ flex: 1 }}>
                  <MedicoInput
                    value={medicoQuery}
                    onChangeValue={setMedicoQuery}
                    onSelectMedico={(m: Medico) => {
                      const htmlStr = `<p><strong>${m.nombre}</strong></p><p><strong>CI: ${m.identificacion}</strong></p><p><strong>${m.especialidad}</strong></p><p></p>`;
                      editor.chain().focus().insertContent(htmlStr).run();
                      setMedicoSearchAbierto(false);
                      setMedicoQuery("");
                    }}
                    placeholder="Buscar médico..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setMedicoSearchAbierto(false)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '10px', color: '#999', padding: '0 4px' }}
                  title="Cancelar"
                >
                  ❌
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
