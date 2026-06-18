"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface RichTextEvolucionProps {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  minHeight?: string;
  placeholder?: string;
}

export default function RichTextEvolucion({
  value,
  onChange,
  readOnly = false,
  minHeight = "120px",
  placeholder = "",
}: RichTextEvolucionProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
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
        `}</style>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
