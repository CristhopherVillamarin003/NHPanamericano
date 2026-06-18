"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

interface RichTextEpicrisisProps {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  minHeight?: string;
  placeholder?: string;
}

export default function RichTextEpicrisis({
  value,
  onChange,
  readOnly = false,
  minHeight = "120px",
  placeholder = "",
}: RichTextEpicrisisProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        code: false,
      }),
      Underline,
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: "rich-text-editor-content",
        style: `min-height: ${minHeight}; outline: none; padding: 8px; font-family: Arial, sans-serif; font-size: 11px; line-height: 1.4; width: 100%; box-sizing: border-box;`,
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

  const isEmpty = editor.getText().trim() === "" && editor.getJSON().content?.length === 1 && !editor.getJSON().content?.[0]?.content;

  const btnBase = "padding: 2px 8px; font-size: 12px; font-weight: bold; background: #fff; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; color: #000;";
  const btnActive = "background: #d1d5db;";

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
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            style={{
              padding: "2px 8px", fontSize: "12px", fontWeight: "bold",
              background: editor.isActive("bold") ? "#d1d5db" : "#fff",
              border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", color: "#000",
            }}
            title="Negrita"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            style={{
              padding: "2px 8px", fontSize: "12px", fontStyle: "italic",
              background: editor.isActive("italic") ? "#d1d5db" : "#fff",
              border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", color: "#000",
            }}
            title="Cursiva"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            style={{
              padding: "2px 8px", fontSize: "12px", textDecoration: "underline",
              background: editor.isActive("underline") ? "#d1d5db" : "#fff",
              border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", color: "#000",
            }}
            title="Subrayado"
          >
            U
          </button>
          
          <div style={{ width: "1px", background: "#ccc", margin: "0 4px" }} />
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            style={{
              padding: "2px 8px", fontSize: "12px",
              background: editor.isActive("bulletList") ? "#d1d5db" : "#fff",
              border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", color: "#000",
            }}
            title="Viñetas"
          >
            • Lista
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            style={{
              padding: "2px 8px", fontSize: "12px",
              background: editor.isActive("orderedList") ? "#d1d5db" : "#fff",
              border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", color: "#000",
            }}
            title="Lista Numerada"
          >
            1. Lista
          </button>
        </div>
      )}
      <div style={{ position: "relative" }}>
        {isEmpty && placeholder && !readOnly && (
           <div style={{
             position: 'absolute',
             top: '8px',
             left: '8px',
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
          .rich-text-editor-content ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin: 0.5rem 0;
          }
          .rich-text-editor-content ol {
            list-style-type: decimal;
            padding-left: 1.5rem;
            margin: 0.5rem 0;
          }
          .rich-text-editor-content li {
            margin: 0.2rem 0;
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
